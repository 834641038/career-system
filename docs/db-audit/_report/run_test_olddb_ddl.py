# -*- coding: utf-8 -*-
"""
旧库对齐 DDL 全量预演（事务内执行，跑完回滚，不落地）

验证三件事：
  1) D1-D6 能否在 career_recommendation 上顺利执行（含 sp_rename 是否保留 IDENTITY / 默认值 / 主键）
  2) 改完之后 58 条接口 SQL 的通过数是否真的升到 55
  3) D0 建用户映射 + 读/写角色后，app_user 是否真的能读能写（用 EXECUTE AS 实测）

运行：python run_test_olddb_ddl.py
"""
import sys, re, os, json, pyodbc

sys.stdout.reconfigure(encoding="utf-8")
CS = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;Trusted_Connection=yes;Connection Timeout=5"
DB = "career_recommendation"

results = []
def rec(ok, name, detail=""):
    results.append((bool(ok), name, detail))
    print(("  PASS " if ok else "  FAIL ") + name + (("  | " + detail) if detail else ""))


def extract_sql():
    here = os.path.dirname(os.path.abspath(__file__))
    src = open(os.path.join(here, "..", "career-system-back", "backend", "database_interface.py"),
               encoding="utf-8").read()
    blocks = []
    for b in re.split(r"\n    def ", src)[1:]:
        name = b.split("(")[0]
        for m in re.finditer(r'(?:query\s*=\s*)?("""|\'|")((?:(?!\1).)*?)\1', b, re.S):
            s = m.group(2).strip()
            if re.match(r"(SELECT|INSERT|UPDATE|DELETE)\b", s, re.I):
                blocks.append((name, " ".join(s.split())))
    return blocks


def sql_pass_count(cur, blocks):
    bad = []
    for name, q in blocks:
        try:
            cur.execute("EXEC sys.sp_describe_first_result_set @tsql = ?", (q.replace("?", "NULL"),))
            cur.fetchall()
        except Exception as e:
            msgs = [str(m[1]) for m in getattr(cur, "messages", [])] or [str(e)]
            key = [m for m in msgs if ("无效" in m or "Invalid" in m or "不存在" in m
                                       or "找不到" in m or "语法" in m or "syntax" in m.lower())]
            bad.append((name, re.sub(r"\s+", " ", (key[-1] if key else msgs[-1]))[:90]))
    return len(blocks) - len(bad), bad


def main():
    cn = pyodbc.connect(CS)
    cur = cn.cursor()
    cur.execute(f"USE [{DB}]")
    blocks = extract_sql()
    print(f"接口 SQL 共 {len(blocks)} 条\n")

    print("=" * 76)
    print("A. 改动前基线")
    print("=" * 76)
    before, bad0 = sql_pass_count(cur, blocks)
    print(f"  SQL 通过 {before}/{len(blocks)}")
    for n, m in bad0: print(f"    FAIL {n:<28} {m}")

    cur.execute("SELECT COUNT(*) FROM users_login WHERE student_id IS NOT NULL") if False else None
    cur.execute("""SELECT COUNT(*) FROM sys.columns WHERE object_id=OBJECT_ID('users_login')
                   AND name='student_id'""")
    has_sid_before = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM users_login")
    n_users = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM students WHERE user_id IS NOT NULL")
    n_link = cur.fetchone()[0]
    print(f"  改前：users_login={n_users} 行，students 有 user_id 的={n_link}，student_id 列存在={bool(has_sid_before)}")

    print("\n" + "=" * 76)
    print("B. 事务内执行 D0 + D1-D6")
    print("=" * 76)
    try:
        # ---- D0 用户映射与权限
        cur.execute("CREATE USER [app_user] FOR LOGIN [app_user]")
        cur.execute("ALTER ROLE db_datareader ADD MEMBER [app_user]")
        cur.execute("ALTER ROLE db_datawriter ADD MEMBER [app_user]")
        rec(True, "D0 CREATE USER + db_datareader/db_datawriter")

        # ---- D1/D2 表改名
        cur.execute("EXEC sp_rename 'dbo.holland_tests', 'holland_test_results'")
        cur.execute("EXEC sp_rename 'dbo.work_values', 'career_values'")
        cur.execute("SELECT COUNT(*) FROM sys.tables WHERE name IN ('holland_test_results','career_values')")
        rec(cur.fetchone()[0] == 2, "D1/D2 两张表改名成功")

        # ---- D3/D5 列改名
        cur.execute("EXEC sp_rename 'dbo.career_values.worth_test_time', 'value_test_time', 'COLUMN'")
        cur.execute("EXEC sp_rename 'dbo.career_values.worth_id', 'value_id', 'COLUMN'")
        cur.execute("""SELECT COUNT(*) FROM sys.columns
                       WHERE object_id=OBJECT_ID('career_values') AND name IN ('value_test_time','value_id')""")
        rec(cur.fetchone()[0] == 2, "D3/D5 两个列改名成功")

        # ---- D4/D4b 列宽
        cur.execute("ALTER TABLE users_login ALTER COLUMN password_hash nvarchar(255) NOT NULL")
        cur.execute("ALTER TABLE users_login ALTER COLUMN user_email nvarchar(100) NOT NULL")
        cur.execute("""SELECT c.name, c.max_length FROM sys.columns c
                       WHERE c.object_id=OBJECT_ID('users_login') AND c.name IN ('password_hash','user_email')""")
        w = dict(cur.fetchall())
        rec(w.get("password_hash") == 510 and w.get("user_email") == 200,
            f"D4/D4b 列宽放宽 password_hash={w.get('password_hash')}B user_email={w.get('user_email')}B")

        # ---- D6 加列 + 回填
        cur.execute("ALTER TABLE users_login ADD student_id int NULL")
        cur.execute("""UPDATE ul SET ul.student_id = s.student_id
                       FROM users_login ul JOIN students s ON s.user_id = ul.user_id""")
        filled = cur.rowcount
        cur.execute("SELECT COUNT(*) FROM users_login WHERE student_id IS NOT NULL")
        sid_n = cur.fetchone()[0]
        rec(sid_n == n_users, f"D6 加列并回填 {sid_n}/{n_users} 行（UPDATE 影响 {filled} 行）")

        print("\n" + "=" * 76)
        print("C. 改完后：58 条 SQL 复验 + 属性是否保留")
        print("=" * 76)
        after, bad1 = sql_pass_count(cur, blocks)
        print(f"  SQL 通过 {before} → {after} / {len(blocks)}")
        for n, m in bad1: print(f"    FAIL {n:<28} {m}")
        rec(after >= 55, f"SQL 通过数 {after}/{len(blocks)}（目标 >=55）")

        # IDENTITY 是否被 sp_rename 破坏
        cur.execute("""SELECT t.name, c.name, c.is_identity FROM sys.tables t
                       JOIN sys.columns c ON c.object_id=t.object_id AND c.is_identity=1
                       WHERE t.name IN ('holland_test_results','career_values')""")
        idt = cur.fetchall()
        rec(len(idt) == 2, f"改名后 IDENTITY 保留：{[(r[0], r[1]) for r in idt]}")

        # 默认值是否保留
        cur.execute("""SELECT t.name, c.name, dc.definition FROM sys.tables t
                       JOIN sys.columns c ON c.object_id=t.object_id
                       LEFT JOIN sys.default_constraints dc ON dc.object_id=c.default_object_id
                       WHERE t.name='career_values' AND c.name='value_test_time'""")
        d = cur.fetchone()
        rec(bool(d and d[2]), f"改名后默认值保留：{d[2] if d else None}")

        # 主键是否保留
        cur.execute("""SELECT t.name, c.name FROM sys.indexes i
                       JOIN sys.tables t ON t.object_id=i.object_id
                       JOIN sys.index_columns ic ON ic.object_id=i.object_id AND ic.index_id=i.index_id AND ic.key_ordinal=1
                       JOIN sys.columns c ON c.object_id=i.object_id AND c.column_id=ic.column_id
                       WHERE i.is_primary_key=1 AND t.name IN ('holland_test_results','career_values')""")
        pks = cur.fetchall()
        rec(len(pks) == 2, f"改名后主键保留：{[tuple(r) for r in pks]}")

        # 外键是否仍指向新表名
        cur.execute("""SELECT fk.name, OBJECT_NAME(fk.parent_object_id), OBJECT_NAME(fk.referenced_object_id)
                       FROM sys.foreign_keys fk
                       WHERE OBJECT_NAME(fk.referenced_object_id) IN ('holland_test_results','career_values')""")
        fks = cur.fetchall()
        rec(True, f"指向改名表的外键：{[tuple(r) for r in fks] or '无（这两张表无子表）'}")

        print("\n" + "=" * 76)
        print("D. D0 权限实测：EXECUTE AS app_user 读写")
        print("=" * 76)
        cur.execute("EXECUTE AS USER = 'app_user'")
        try:
            cur.execute("SELECT COUNT(*) FROM users_login")
            rec(True, f"app_user 可 SELECT users_login（{cur.fetchone()[0]} 行）")
            cur.execute("""INSERT INTO users_login (user_name,password_hash,user_email,user_status,student_id)
                           VALUES ('perm_probe','x','probe@test.cn',1,NULL)""")
            rec(True, "app_user 可 INSERT")
            cur.execute("UPDATE users_login SET user_remark='p' WHERE user_name='perm_probe'")
            rec(cur.rowcount == 1, "app_user 可 UPDATE")
            cur.execute("DELETE FROM users_login WHERE user_name='perm_probe'")
            rec(cur.rowcount == 1, "app_user 可 DELETE")
            cur.execute("SELECT COUNT(*) FROM career_values")
            rec(True, "app_user 可读改名后的 career_values")
        except Exception as e:
            rec(False, "app_user 权限测试", str(e)[:150])
        finally:
            cur.execute("REVERT")

    except Exception as e:
        rec(False, "DDL 执行异常", str(e)[:200])
    finally:
        cn.rollback()
        print("\n  → 已 ROLLBACK")

    print("\n" + "=" * 76)
    print("E. 复核：是否完全复原")
    print("=" * 76)
    cur2 = cn.cursor()
    cur2.execute(f"USE [{DB}]")
    cur2.execute("SELECT name FROM sys.tables ORDER BY name")
    tabs = [r[0] for r in cur2.fetchall()]
    rec("holland_tests" in tabs and "work_values" in tabs, "表名已复原")
    rec("holland_test_results" not in tabs and "career_values" not in tabs, "无残留新表名")
    cur2.execute("SELECT COUNT(*) FROM sys.columns WHERE object_id=OBJECT_ID('users_login') AND name='student_id'")
    rec(cur2.fetchone()[0] == 0, "student_id 列已移除")
    cur2.execute("""SELECT c.name, c.max_length FROM sys.columns c
                    WHERE c.object_id=OBJECT_ID('users_login') AND c.name IN ('password_hash','user_email')""")
    w2 = dict(cur2.fetchall())
    rec(w2.get("password_hash") == 40 and w2.get("user_email") == 80,
        f"列宽已复原 password_hash={w2.get('password_hash')}B user_email={w2.get('user_email')}B")
    cur2.execute("SELECT COUNT(*) FROM sys.database_principals WHERE name='app_user'")
    rec(cur2.fetchone()[0] == 0, "app_user 用户映射已移除")
    cur2.execute("SELECT COUNT(*) FROM users_login")
    rec(cur2.fetchone()[0] == n_users, f"users_login 行数复原 {n_users}")
    cnt, _ = sql_pass_count(cur2, blocks)
    rec(cnt == before, f"SQL 通过数复原 {cnt} == {before}")
    cn.close()

    print("\n" + "=" * 76)
    ok = sum(1 for r in results if r[0]); fail = len(results) - ok
    print(f"总计 {len(results)} 项：通过 {ok}，失败 {fail}")
    print("=" * 76)
    json.dump([{"ok": r[0], "name": r[1], "detail": r[2]} for r in results],
              open("_test_olddb_ddl.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
