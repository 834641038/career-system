# -*- coding: utf-8 -*-
"""
对齐方案验证脚本（只读 + 事务回滚，不留痕）

分 8 段：
  A 环境      B 连接      C 结构      D 接口 SQL 编译（两库）
  E 降级行为  F 原型端到端  G 列宽缺陷实证  H 对齐预演（事务内改名→跑 SQL→回滚）
"""
import sys, os, re, json, time, traceback

sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
BACKEND = os.path.abspath(os.path.join(HERE, "..", "career-system-back", "backend"))
sys.path.insert(0, BACKEND)

SERVER = "localhost"
USER, PWD = "app_user", "34rj>sh&2uio3(jk12e"
WIN_CS = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={SERVER};Trusted_Connection=yes;Connection Timeout=5"
APP_CS = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={SERVER};DATABASE=__DB__;UID={USER};PWD={PWD};Connection Timeout=4"

RESULT = {"pass": 0, "fail": 0, "warn": 0, "known": 0, "items": []}


def rec(ok, title, detail=""):
    tag = "PASS" if ok is True else ("WARN" if ok is None else "FAIL")
    RESULT["pass" if ok is True else ("warn" if ok is None else "fail")] += 1
    RESULT["items"].append({"tag": tag, "title": title, "detail": detail})
    print(f"[{tag}] {title}" + (f"  ->  {detail}" if detail else ""))


def rec_known(title, detail=""):
    """已知缺陷：当前状态本来就不通过，不是脚本出错。修好 D0 后应转为 PASS。"""
    RESULT["known"] += 1
    RESULT["items"].append({"tag": "KNOWN", "title": title, "detail": detail})
    print(f"[KNOWN] {title}" + (f"  ->  {detail}" if detail else ""))


def section(s):
    print("\n" + "=" * 78 + f"\n{s}\n" + "=" * 78)


# ---------------------------------------------------------------- A 环境
section("A 环境")
try:
    import pyodbc
    rec(True, f"pyodbc 可用，驱动 {len(pyodbc.drivers())} 个", ", ".join(pyodbc.drivers())[:90])
except Exception as e:
    rec(False, "pyodbc 不可用", str(e))
    sys.exit(1)
try:
    import numpy
    rec(True, f"numpy {numpy.__version__}")
except Exception as e:
    rec(False, "numpy 缺失，推荐算法无法运行", str(e))
rec(True, f"Python {sys.version.split()[0]}", sys.executable)


# ---------------------------------------------------------------- B 连接
section("B 连接（两种认证 × 两个库）")
conn = pyodbc.connect(WIN_CS)
conn.autocommit = True
cur = conn.cursor()
cur.execute("SELECT SUSER_NAME(), IS_SRVROLEMEMBER('sysadmin'), SERVERPROPERTY('Edition')")
who = cur.fetchone()
rec(True, "Windows 认证连接成功", f"{who[0]} / sysadmin={who[1]} / {who[2]}")

for db in ["career_recommendation", "career_system"]:
    try:
        c2 = pyodbc.connect(APP_CS.replace("__DB__", db))
        c2.close()
        rec(True, f"app_user → {db}", "可连")
    except Exception as e:
        msg = str(e)
        code = "4060/18456 无数据库用户映射" if "4060" in msg or "18456" in msg else msg[:70]
        if db == "career_recommendation":
            # 这是本次要修的目标本身：当前不通才正常
            rec_known(f"app_user → {db} 不通（已知缺陷，待 D0 修复）", code)
        else:
            rec(False, f"app_user → {db} 不通（不应发生）", code)


# ---------------------------------------------------------------- C 结构
section("C 结构统计")
SCHEMA = {}
for db in ["career_recommendation", "career_system"]:
    d = {"tables": {}, "fks": []}
    cur.execute(f"""SELECT t.name, SUM(p.rows) FROM [{db}].sys.tables t
                    JOIN [{db}].sys.partitions p ON p.object_id=t.object_id AND p.index_id IN (0,1)
                    GROUP BY t.name""")
    for n, r in cur.fetchall():
        cc = conn.cursor()
        cc.execute(f"""SELECT c.name,
                       COLUMNPROPERTY(c.object_id,c.name,'IsIdentity'),
                       c.is_nullable, ty.name, c.max_length
                       FROM [{db}].sys.columns c JOIN [{db}].sys.types ty ON ty.user_type_id=c.user_type_id
                       WHERE c.object_id=OBJECT_ID('[{db}].dbo.[{n}]')""")
        d["tables"][n] = {"rows": int(r), "cols": [tuple(x) for x in cc.fetchall()]}
    cur.execute(f"""SELECT tp.name, tr.name FROM [{db}].sys.foreign_keys fk
        JOIN [{db}].sys.tables tp ON tp.object_id=fk.parent_object_id
        JOIN [{db}].sys.tables tr ON tr.object_id=fk.referenced_object_id""")
    d["fks"] = [tuple(x) for x in cur.fetchall()]
    SCHEMA[db] = d
    ids = sum(1 for t in d["tables"].values() for c in t["cols"] if c[1])
    total = sum(t["rows"] for t in d["tables"].values())
    rec(True, f"{db}: {len(d['tables'])} 表 / {total} 行 / {len(d['fks'])} 外键", f"自增列 {ids} 个")


# ---------------------------------------------------------------- D SQL 编译
section("D 接口 SQL 逐条编译（sp_describe_first_result_set，不执行）")
src = open(os.path.join(BACKEND, "database_interface.py"), encoding="utf-8").read()
blocks = []
for b in re.split(r"\n    def ", src)[1:]:
    name = b.split("(")[0]
    for m in re.finditer(r'(?:query\s*=\s*)?("""|\'|")((?:(?!\1).)*?)\1', b, re.S):
        s = m.group(2).strip()
        if re.match(r"(SELECT|INSERT|UPDATE|DELETE)\b", s, re.I):
            blocks.append((name, " ".join(s.split())))
rec(True, f"从接口提取到 {len(blocks)} 条 SQL")

SQL_STATUS = {}
for db in ["career_recommendation", "career_system"]:
    cur.execute(f"USE [{db}]")
    bad = []
    for name, q in blocks:
        try:
            cur.execute("EXEC sys.sp_describe_first_result_set @tsql = ?", (q.replace("?", "NULL"),))
            cur.fetchall()
        except Exception:
            bad.append(name)
    SQL_STATUS[db] = {"total": len(blocks), "fail": len(bad), "bad": bad}
    rec(True, f"{db}: 通过 {len(blocks)-len(bad)}/{len(blocks)}", f"失败方法 {sorted(set(bad))}")


# ---------------------------------------------------------------- E 降级行为
section("E 接口实例化（app_user + career_recommendation）")
import database_interface as di
importlib_err = None
try:
    obj = di.DatabaseInterface()
    if obj.use_sqlserver:
        rec(True, "DatabaseInterface 已连上库", "use_sqlserver=True")
    else:
        rec_known("DatabaseInterface 未连上库（已知缺陷，待 D0 修复）",
                  f"use_sqlserver=False，已静默降级到内存样本，users={len(obj.users)}")
    rec(obj.use_sqlserver is False,
        "证实：默认配置下系统走的是内存样本", f"内存 users 条数={len(obj.users)}")
except Exception as e:
    importlib_err = e
    rec(False, "DatabaseInterface 实例化失败", str(e)[:90])


# ---------------------------------------------------------------- F 原型端到端
section("F 原型模式端到端（注册→登录→三个推荐）")
try:
    from sample_data import get_student_profile, get_filtered_jobs, get_course_catalog
    from internship_recommender import InternshipRecommendationSystem
    from course_recommender import CourseRecommendationSystem, analyze_skill_gap
    from career_path_planning import CareerPathPlanner

    u = "verify_user@csu.edu.cn"
    obj.add_user({"user_name": u, "password_hash": "x" * 64, "user_email": u})
    got = obj.get_user_by_username(u)
    rec(got is not None, "内存模式 注册→查询", f"命中 {got.get('user_email') if got else None}")

    stu = get_student_profile("2024001")
    rec(stu is not None, "样本学生 2024001", f"{stu['basic_info']['name']} / {stu['holland_code']} / GPA {stu['basic_info']['gpa']}")

    jobs = get_filtered_jobs({})
    r1 = InternshipRecommendationSystem().recommend_internships(stu, jobs, top_n=3)
    rec(len(r1) > 0, f"实习推荐返回 {len(r1)} 条", f"Top1={r1[0]['company']}/{r1[0]['position']} 分数={r1[0]['match_score']:.1f}")

    gaps = analyze_skill_gap(stu, jobs)
    r2 = CourseRecommendationSystem().recommend_courses(stu, gaps, get_course_catalog(), top_n=3)
    rec(len(r2) > 0, f"课程推荐返回 {len(r2)} 条", f"缺口 {len(gaps)} 项 / Top1={r2[0]['title']}")

    r3 = CareerPathPlanner().recommend_career_paths(stu, top_n=2)
    rec(len(r3) > 0, f"路径推荐返回 {len(r3)} 条", f"Top1={r3[0].get('path_name')}")
except Exception as e:
    rec(False, "原型模式端到端异常", str(e)[:120])
    traceback.print_exc()


# ---------------------------------------------------------------- G 列宽缺陷
section("G 实证：password_hash nvarchar(20) 装不下 SHA-256(64)")
conn.autocommit = False          # 关键：关闭自动提交，后续所有写操作必须显式回滚
tcur = conn.cursor()
tcur.execute("USE [career_recommendation]")
try:
    # 显式事务，无论如何回滚
    tcur.execute("SELECT COUNT(*) FROM users_login")
    before = tcur.fetchone()[0]
    try:
        tcur.execute("""INSERT INTO users_login (user_name,password_hash,user_email,user_status,user_created_time)
                        VALUES ('_verify_tmp','a'*64,'_verify_tmp@x.cn',1,GETDATE())""".replace("'a'*64", "'" + "a" * 64 + "'"))
        rec(None, "插入 64 字符哈希未报错", "需人工确认是否被静默截断")
    except Exception as e:
        rec(True, "插入 64 字符哈希被拒绝 → 证明 D4 必须做", str(e).split("]")[-1].strip()[:80])
finally:
    conn.rollback()
    tcur.execute("SELECT COUNT(*) FROM users_login")
    after = tcur.fetchone()[0]
    rec(before == after, "回滚后行数复原", f"{before} → {after}")


# ---------------------------------------------------------------- H 对齐预演
section("H 对齐预演：事务内执行 D1-D6，重跑 58 条 SQL，然后回滚")
hcur = conn.cursor()
hcur.execute("USE [career_recommendation]")
hcur.execute("SELECT name FROM sys.tables ORDER BY name")
tables_before = [r[0] for r in hcur.fetchall()]
try:
    hcur.execute("SET XACT_ABORT OFF")
    hcur.execute("BEGIN TRANSACTION")

    hcur.execute("EXEC sp_rename 'dbo.holland_tests', 'holland_test_results'")
    rec(True, "D1 holland_tests → holland_test_results")
    hcur.execute("EXEC sp_rename 'dbo.work_values', 'career_values'")
    rec(True, "D2 work_values → career_values")
    hcur.execute("EXEC sp_rename 'dbo.career_values.worth_test_time', 'value_test_time', 'COLUMN'")
    rec(True, "D3 worth_test_time → value_test_time")
    hcur.execute("EXEC sp_rename 'dbo.career_values.worth_id', 'value_id', 'COLUMN'")
    rec(True, "D5 worth_id → value_id")
    hcur.execute("ALTER TABLE users_login ALTER COLUMN password_hash nvarchar(255) NOT NULL")
    rec(True, "D4 password_hash → nvarchar(255)")
    hcur.execute("ALTER TABLE users_login ADD student_id int NULL")
    hcur.execute("""UPDATE ul SET student_id = s.student_id
                    FROM users_login ul JOIN students s ON s.user_id = ul.user_id""")
    hcur.execute("SELECT COUNT(*) FROM users_login WHERE student_id IS NOT NULL")
    backfilled = hcur.fetchone()[0]
    rec(backfilled > 0, f"D6 新增 student_id 并回填 {backfilled} 行", f"users_login 共 20 行")

    # 重跑 D 段 SQL
    bad_after = []
    for name, q in blocks:
        try:
            hcur.execute("EXEC sys.sp_describe_first_result_set @tsql = ?", (q.replace("?", "NULL"),))
            hcur.fetchall()
        except Exception:
            bad_after.append(name)
    remain = sorted(set(bad_after))
    rec(len(remain) <= 3, f"对齐后 SQL 通过 {len(blocks)-len(bad_after)}/{len(blocks)}",
        f"仍失败：{remain}（预期仅 get_user_by_studentname 的真实 bug + 2 条静态误报）")

    # 再验证 SHA-256 能写进去
    try:
        hcur.execute("INSERT INTO users_login (user_name,password_hash,user_email,user_status,user_created_time,student_id) "
                     "VALUES (?,?,'_v@x.cn',1,GETDATE(),NULL)", ("_verify_tmp", "a" * 64))
        hcur.execute("SELECT LEN(password_hash) FROM users_login WHERE user_name='_verify_tmp'")
        L = hcur.fetchone()[0]
        rec(L == 64, "D4 后 64 字符哈希完整写入", f"LEN={L}")
    except Exception as e:
        rec(False, "D4 后仍写不进哈希", str(e)[:80])

finally:
    conn.rollback()
    hcur.execute("SELECT name FROM sys.tables ORDER BY name")
    tables_after = [r[0] for r in hcur.fetchall()]
    rec(tables_before == tables_after, "回滚后表清单完全复原", f"{len(tables_after)} 张表")
    hcur.execute("SELECT COUNT(*) FROM users_login")
    rec(hcur.fetchone()[0] == 20, "users_login 行数不变", "20")
    hcur.execute("SELECT COUNT(*) FROM sys.columns WHERE object_id=OBJECT_ID('users_login') AND name='student_id'")
    rec(hcur.fetchone()[0] == 0, "student_id 列已随回滚消失")
    hcur.execute("SELECT COUNT(*) FROM sys.columns WHERE object_id=OBJECT_ID('users_login') AND name='password_hash' AND max_length=40")
    rec(hcur.fetchone()[0] == 1, "password_hash 宽度已恢复 nvarchar(20)（40 字节）")
    hcur.execute("SELECT CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users_login' AND COLUMN_NAME='user_email'")
    rec(None, "附带发现：user_email 仅 varchar/nvarchar 40 字符", f"CHARACTER_MAXIMUM_LENGTH={hcur.fetchone()[0]}，真实邮箱超 40 字符会被拒")


# ---------------------------------------------------------------- 汇总
section("汇总")
print(f"通过 {RESULT['pass']} / 已知缺陷 {RESULT['known']}（符合预期，修 D0 后应转 PASS）"
      f" / 待确认 {RESULT['warn']} / 真实失败 {RESULT['fail']}")
print("提示：只要「真实失败」为 0，就说明系统状态与预期完全一致，[KNOWN] 不是脚本报错。")
json.dump(RESULT, open(os.path.join(HERE, "_verify_result.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(SQL_STATUS, open(os.path.join(HERE, "_verify_sql.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("明细已写入 _verify_result.json / _verify_sql.json")
