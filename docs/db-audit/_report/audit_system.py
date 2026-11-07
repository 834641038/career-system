# -*- coding: utf-8 -*-
"""
系统全量核查（只读）

覆盖：实例 / 库 / 表 / 列 / 主键 / 自增 / 外键 / 默认值 / 触发器 / 同义词
      账号映射与真实连接 / 58 条接口 SQL / 数据覆盖度 / 代码静态统计 / 关键缺陷复现

输出：_audit.json（结构化）+ 控制台摘要
运行：python audit_system.py
"""
import sys, os, re, json, pyodbc

sys.stdout.reconfigure(encoding="utf-8")
SERVER = "localhost"
CS = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={SERVER};Trusted_Connection=yes;Connection Timeout=5"
DBS = ["career_recommendation", "career_system"]
APP_USER, APP_PWD = "app_user", "34rj>sh&2uio3(jk12e"

out = {"instance": {}, "databases": {}, "accounts": {}, "sql": {}, "data": {}, "code": {}, "defects": {}}
lines = []
def say(s=""):
    print(s)
    lines.append(s)


def q(cur, sql, params=()):
    cur.execute(sql, params)
    return cur.fetchall()


def main():
    cn = pyodbc.connect(CS)
    cur = cn.cursor()

    # ---------------- A 实例
    say("=" * 78)
    say("A. 实例")
    say("=" * 78)
    r = q(cur, """SELECT SERVERPROPERTY('ProductVersion'), SERVERPROPERTY('ProductLevel'),
                         SERVERPROPERTY('Edition'), SERVERPROPERTY('Collation'),
                         SUSER_NAME(), IS_SRVROLEMEMBER('sysadmin'), DB_NAME()""")[0]
    out["instance"] = {
        "version": str(r[0]), "level": r[1], "edition": r[2], "collation": r[3],
        "login": r[4], "is_sysadmin": int(r[5] or 0), "current_db": r[6],
    }
    for k, v in out["instance"].items():
        say(f"  {k:<12}{v}")

    # ---------------- B 库
    say("\n" + "=" * 78)
    say("B. 数据库")
    say("=" * 78)
    rows = q(cur, """SELECT name, state_desc, recovery_model_desc, compatibility_level,
                            collation_name, is_read_only
                     FROM sys.databases WHERE name IN (?,?) ORDER BY name""", DBS)
    for n, st, rm, cl, coll, ro in rows:
        say(f"  {n:<24}{st:<10}{rm:<10}compat={cl} read_only={ro} collation={coll}")
    out["databases"]["_list"] = [dict(name=x[0], state=x[1], recovery=x[2], compat=x[3],
                                      collation=x[4], read_only=bool(x[5])) for x in rows]

    # ---------------- C 每库对象与表
    for db in DBS:
        say("\n" + "=" * 78)
        say(f"C. {db}")
        say("=" * 78)
        d = {}
        d["schemas"] = [x[0] for x in q(cur, f"SELECT name FROM [{db}].sys.schemas ORDER BY name")]
        d["object_counts"] = {t: c for t, c in q(cur, f"""
            SELECT o.type_desc, COUNT(*) FROM [{db}].sys.objects o
            WHERE o.type IN ('U','V','P','FN','IF','TF','TR','SN') GROUP BY o.type_desc""")}
        d["synonyms"] = q(cur, f"SELECT name, base_object_name FROM [{db}].sys.synonyms")
        say(f"  schemas={len(d['schemas'])} objects={d['object_counts']} synonyms={len(d['synonyms'])}")

        tables = q(cur, f"""
            SELECT t.name, SUM(p.rows) AS rows,
                   (SELECT COUNT(*) FROM [{db}].sys.columns c WHERE c.object_id=t.object_id) AS cols
            FROM [{db}].sys.tables t
            JOIN [{db}].sys.partitions p ON p.object_id=t.object_id AND p.index_id IN (0,1)
            GROUP BY t.name, t.object_id ORDER BY t.name""")
        d["tables"] = {}
        for tn, rows_n, cols_n in tables:
            idcols = [x[0] for x in q(cur, f"""
                SELECT c.name FROM [{db}].sys.columns c
                WHERE c.object_id = OBJECT_ID('[{db}].dbo.[{tn}]') AND c.is_identity=1""")]
            pk = [x[0] for x in q(cur, f"""
                SELECT c.name FROM [{db}].sys.indexes i
                JOIN [{db}].sys.index_columns ic ON ic.object_id=i.object_id AND ic.index_id=i.index_id AND ic.key_ordinal=1
                JOIN [{db}].sys.columns c ON c.object_id=i.object_id AND c.column_id=ic.column_id
                WHERE i.object_id=OBJECT_ID('[{db}].dbo.[{tn}]') AND i.is_primary_key=1""")]
            d["tables"][tn] = {"rows": int(rows_n), "cols": int(cols_n), "identity": idcols, "pk": pk}
            flag = "ID" if idcols else "  "
            say(f"  {tn:<28}rows={rows_n:<5}cols={cols_n:<3}{flag} pk={pk}")

        d["fks"] = [dict(name=x[0], child=x[1], child_col=x[2], parent=x[3], parent_col=x[4], on_delete=x[5])
                    for x in q(cur, f"""
            SELECT fk.name, tp.name, cp.name, tr.name, cr.name, fk.delete_referential_action_desc
            FROM [{db}].sys.foreign_keys fk
            JOIN [{db}].sys.foreign_key_columns fkc ON fkc.constraint_object_id=fk.object_id
            JOIN [{db}].sys.tables tp ON tp.object_id=fkc.parent_object_id
            JOIN [{db}].sys.columns cp ON cp.object_id=fkc.parent_object_id AND cp.column_id=fkc.parent_column_id
            JOIN [{db}].sys.tables tr ON tr.object_id=fkc.referenced_object_id
            JOIN [{db}].sys.columns cr ON cr.object_id=fkc.referenced_object_id AND cr.column_id=fkc.referenced_column_id""")]
        d["unique_nonpk"] = [dict(table=x[0], index=x[1], col=x[2]) for x in q(cur, f"""
            SELECT t.name, i.name, c.name FROM [{db}].sys.indexes i
            JOIN [{db}].sys.tables t ON t.object_id=i.object_id
            JOIN [{db}].sys.index_columns ic ON ic.object_id=i.object_id AND ic.index_id=i.index_id
            JOIN [{db}].sys.columns c ON c.object_id=i.object_id AND c.column_id=ic.column_id
            WHERE i.is_unique=1 AND i.is_primary_key=0""")]
        d["row_total"] = sum(v["rows"] for v in d["tables"].values())
        d["identity_tables"] = sum(1 for v in d["tables"].values() if v["identity"])
        say(f"  合计：{len(d['tables'])} 表 / {d['row_total']} 行 / {len(d['fks'])} 外键 / "
            f"{d['identity_tables']} 张有 IDENTITY / 唯一约束(非PK) {len(d['unique_nonpk'])}")
        out["databases"][db] = d

    # ---------------- D 账号
    say("\n" + "=" * 78)
    say("D. 账号 app_user")
    say("=" * 78)
    r = q(cur, """SELECT name, type_desc, default_database_name, is_disabled, create_date
                  FROM sys.server_principals WHERE name=?""", (APP_USER,))
    a = {}
    if r:
        a["login"] = dict(name=r[0][0], type=r[0][1], default_db=r[0][2],
                          disabled=bool(r[0][3]), created=str(r[0][4]))
        say(f"  登录名：{a['login']}")
    for db in DBS:
        has = q(cur, f"SELECT COUNT(*) FROM [{db}].sys.database_principals WHERE name=?", (APP_USER,))[0][0]
        roles = [x[0] for x in q(cur, f"""
            SELECT r.name FROM [{db}].sys.database_role_members rm
            JOIN [{db}].sys.database_principals r ON r.principal_id=rm.role_principal_id
            JOIN [{db}].sys.database_principals u ON u.principal_id=rm.member_principal_id
            WHERE u.name=?""", (APP_USER,))]
        a[db] = {"mapped": bool(has), "roles": roles}
        say(f"  {db:<24}映射={'有' if has else '无':<2} 角色={roles}")
    a["connect"] = {}
    for db in DBS:
        cs = (f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={SERVER};DATABASE={db};"
              f"UID={APP_USER};PWD={APP_PWD};Connection Timeout=4")
        try:
            c2 = pyodbc.connect(cs); c2.close()
            a["connect"][db] = "OK"
        except Exception as e:
            a["connect"][db] = re.sub(r"\s+", " ", str(e))[:120]
        say(f"  实际连接 {db:<24}{a['connect'][db]}")
    out["accounts"] = a

    # ---------------- E 接口 SQL
    say("\n" + "=" * 78)
    say("E. 接口 SQL 逐条编译")
    say("=" * 78)
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
    out["sql"]["total"] = len(blocks)
    for db in DBS:
        cur.execute(f"USE [{db}]")
        bad = []
        for name, sql in blocks:
            try:
                cur.execute("EXEC sys.sp_describe_first_result_set @tsql = ?", (sql.replace("?", "NULL"),))
                cur.fetchall()
            except Exception as e:
                msgs = [str(m[1]) for m in getattr(cur, "messages", [])] or [str(e)]
                key = [m for m in msgs if any(k in m for k in ("无效", "Invalid", "不存在", "找不到", "语法", "syntax"))]
                bad.append({"method": name, "error": re.sub(r"\s+", " ", (key[-1] if key else msgs[-1]))[:110]})
        out["sql"][db] = {"pass": len(blocks) - len(bad), "fail": bad}
        say(f"  {db:<24}通过 {len(blocks)-len(bad)}/{len(blocks)}，失败 {len(bad)}")
        for x in bad:
            say(f"     FAIL {x['method']:<28}{x['error']}")

    # ---------------- F 数据覆盖
    say("\n" + "=" * 78)
    say("F. 数据覆盖度")
    say("=" * 78)
    dq = {
        "career_recommendation": [
            ("users_login", "SELECT COUNT(*) FROM users_login"),
            ("students", "SELECT COUNT(*) FROM students"),
            ("students 有 user_id", "SELECT COUNT(*) FROM students WHERE user_id IS NOT NULL"),
            ("students 有技能记录", "SELECT COUNT(DISTINCT student_id) FROM student_skills"),
            ("students 有偏好", "SELECT COUNT(DISTINCT student_id) FROM student_preferences"),
            ("holland_tests", "SELECT COUNT(*) FROM holland_tests"),
            ("work_values", "SELECT COUNT(*) FROM work_values"),
            ("experiences", "SELECT COUNT(*) FROM experiences"),
            ("day_plans", "SELECT COUNT(*) FROM day_plans"),
            ("week_plans", "SELECT COUNT(*) FROM week_plans"),
            ("companies", "SELECT COUNT(*) FROM companies"),
            ("jobs", "SELECT COUNT(*) FROM jobs"),
            ("skills", "SELECT COUNT(*) FROM skills"),
            ("student_skills", "SELECT COUNT(*) FROM student_skills"),
            ("job_skill_requirements", "SELECT COUNT(*) FROM job_skill_requirements"),
            ("matching_results", "SELECT COUNT(*) FROM matching_results"),
        ],
        "career_system": [
            ("user", "SELECT COUNT(*) FROM [user]"),
            ("student_info", "SELECT COUNT(*) FROM student_info"),
            ("holland_assessment", "SELECT COUNT(*) FROM holland_assessment"),
            ("value_assessment_detail", "SELECT COUNT(*) FROM value_assessment_detail"),
            ("values_library", "SELECT COUNT(*) FROM values_library"),
            ("skill_library", "SELECT COUNT(*) FROM skill_library"),
            ("skill_assessment_detail", "SELECT COUNT(*) FROM skill_assessment_detail"),
            ("internship_experience", "SELECT COUNT(*) FROM internship_experience"),
            ("project_experience", "SELECT COUNT(*) FROM project_experience"),
            ("industry", "SELECT COUNT(*) FROM industry"),
            ("job_library", "SELECT COUNT(*) FROM job_library"),
            ("job_skill_requirement", "SELECT COUNT(*) FROM job_skill_requirement"),
            ("job_match", "SELECT COUNT(*) FROM job_match"),
            ("career_plan", "SELECT COUNT(*) FROM career_plan"),
            ("weekly_task", "SELECT COUNT(*) FROM weekly_task"),
            ("daily_task", "SELECT COUNT(*) FROM daily_task"),
        ],
    }
    for db, items in dq.items():
        cur.execute(f"USE [{db}]")
        out["data"][db] = {}
        say(f"  --- {db}")
        for label, sql in items:
            try:
                n = q(cur, sql)[0][0]
            except Exception as e:
                n = f"ERR {str(e)[:40]}"
            out["data"][db][label] = n
            say(f"    {label:<28}{n}")

    # ---------------- G 关键字段实测
    say("\n" + "=" * 78)
    say("G. 关键字段与缺陷复现")
    say("=" * 78)
    cur.execute("USE [career_recommendation]")
    pw = dict(q(cur, """SELECT c.name, c.max_length FROM sys.columns c
                        WHERE c.object_id=OBJECT_ID('users_login') AND c.name IN ('password_hash','user_email')"""))
    sid = q(cur, """SELECT COUNT(*) FROM sys.columns
                    WHERE object_id=OBJECT_ID('users_login') AND name='student_id'""")[0][0]
    hashlen = q(cur, "SELECT MIN(LEN(password_hash)), MAX(LEN(password_hash)) FROM users_login")[0]
    out["defects"] = {
        "password_hash_max_bytes": pw.get("password_hash"),
        "user_email_max_bytes": pw.get("user_email"),
        "user_email_chars": (pw.get("user_email") or 0) // 2,
        "student_id_exists": bool(sid),
        "stored_hash_len_min": hashlen[0], "stored_hash_len_max": hashlen[1],
        "sha256_len": 64,
    }
    say(f"  password_hash 宽度      {out['defects']['password_hash_max_bytes']} 字节 = nvarchar(20)")
    say(f"  user_email 宽度         {out['defects']['user_email_max_bytes']} 字节 = nvarchar(40)")
    say(f"  student_id 列存在       {out['defects']['student_id_exists']}")
    say(f"  存量哈希长度            {hashlen[0]} ~ {hashlen[1]}（SHA-256 需 64）")
    # student ↔ user 对应
    m = q(cur, """SELECT COUNT(*) FROM users_login ul JOIN students s ON s.user_id=ul.user_id""")[0][0]
    total = q(cur, "SELECT COUNT(*) FROM users_login")[0][0]
    out["defects"]["user_student_join"] = f"{m}/{total}"
    say(f"  users_login ↔ students  可对应 {m}/{total} 行")

    # ---------------- H 代码静态
    say("\n" + "=" * 78)
    say("H. 代码静态统计")
    say("=" * 78)
    be = os.path.join(here, "..", "career-system-back", "backend")
    di = open(os.path.join(be, "database_interface.py"), encoding="utf-8").read()
    api = open(os.path.join(be, "backingend_API.py"), encoding="utf-8").read()
    methods = re.findall(r"^    def ([a-zA-Z_0-9]+)\(", di, re.M)
    biz = [m for m in methods if re.match(r"(get_|add_|update_|delete_|remove_|register_)", m)]
    called = sorted(set(re.findall(r"\bdb\.([a-zA-Z_0-9]+)\(", api)))
    routes = re.findall(r"@app\.route\('([^']+)',\s*methods=\[([^\]]+)\]", api)
    out["code"] = {
        "database_interface_methods": len(methods),
        "business_methods": len(biz),
        "sql_in_interface": len(blocks),
        "db_methods_called_by_api": called,
        "api_routes": len(routes),
        "sample_data_imports": re.findall(r"from sample_data import[^\n]*", api),
        "has_data_source_switch": "CAREER_DATA_SOURCE" in di,
        "api_lines": api.count("\n") + 1,
        "interface_lines": di.count("\n") + 1,
    }
    for k, v in out["code"].items():
        say(f"  {k:<32}{v}")

    cn.close()

    json.dump(out, open(os.path.join(here, "_audit.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    say("\n" + "=" * 78)
    say("已写入 _audit.json")
    say("=" * 78)
    return 0


if __name__ == "__main__":
    sys.exit(main())
