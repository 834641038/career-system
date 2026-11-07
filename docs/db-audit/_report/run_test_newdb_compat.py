# -*- coding: utf-8 -*-
"""
方案可行性预演（只读 + 事务内回滚，不落地任何对象）

目的：验证「在新库 career_system 里建一层与旧库同名的接口兼容层（schema api + 同义词）」
      能否让 database_interface.py 的 58 条 SQL 原样成立。

做法：
  1) 从 career_recommendation 读取 14 张接口表的真实结构（列/类型/可空/IDENTITY/默认值/PK）
  2) 在 career_system 的一个事务里：CREATE SCHEMA api -> 建 14 张同构表 -> 建 14 个 dbo 同义词
  3) 用 sp_describe_first_result_set 逐条编译 58 条 SQL
  4) 做一次真实 INSERT / SELECT / UPDATE / DELETE（同事务内，最后一起回滚）
  5) ROLLBACK，并复核对象数与表清单与执行前完全一致

运行：
  python run_test_newdb_compat.py
"""
import sys, re, json, os, pyodbc

sys.stdout.reconfigure(encoding="utf-8")

SERVER = "localhost"
CS = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={SERVER};Trusted_Connection=yes;Connection Timeout=5"
SRC = "career_recommendation"   # 结构来源（旧库）
DST = "career_system"           # 兼容层落点（新库）

INTERFACE_TABLES = [
    "users_login", "students", "companies", "skills", "student_skills",
    "holland_tests", "work_values", "experiences", "day_plans", "week_plans",
    "jobs", "job_skill_requirements", "student_preferences", "matching_results",
]
# 接口里 SQL 写死的是新名字，这里模拟「旧库做完 D1/D2 改名之后」的样子
RENAMED = {
    "holland_tests": "holland_test_results",
    "work_values": "career_values",
}
# 模拟旧库 D3/D5 改名后的列名（这样验证的是「对齐完成后」的状态）
COL_RENAME = {
    ("work_values", "worth_id"): "value_id",
    ("work_values", "worth_test_time"): "value_test_time",
}
# 模拟 D4 / D4b 放宽列宽
TYPE_OVERRIDE = {
    ("users_login", "password_hash"): "nvarchar(255)",
    ("users_login", "user_email"): "nvarchar(100)",
}

results = []
def rec(ok, name, detail=""):
    results.append((bool(ok), name, detail))
    print(("  PASS " if ok else "  FAIL ") + name + (("  | " + detail) if detail else ""))


def type_sql(c):
    t = c["type"]
    # 注意：这里取的是 INFORMATION_SCHEMA.CHARACTER_MAXIMUM_LENGTH，已经是「字符数」
    if t in ("nvarchar", "nchar"):
        return f'{t}({c["len"]//2})' if c["len"] > 0 else f"{t}(max)"
    if t in ("varchar", "char", "varbinary", "binary"):
        return f'{t}({c["len"]})' if c["len"] > 0 else f"{t}(max)"
    if t in ("decimal", "numeric"):
        return f'{t}({c["prec"]},{c["scale"]})'
    if t in ("datetime2", "time", "datetimeoffset"):
        return f'{t}({c["dtprec"]})'
    return t


def load_struct(cn):
    cur = cn.cursor()
    # 用 sys 目录视图 + 库名前缀，避免跨库 OBJECT_ID 解析失败导致 is_identity 误判为 0
    cur.execute(f"""
        SELECT t.name, c.name, ty.name, c.max_length, c.precision, c.scale, c.scale AS dtprec,
               c.is_nullable, dc.definition, c.is_identity
        FROM [{SRC}].sys.tables t
        JOIN [{SRC}].sys.columns c ON c.object_id = t.object_id
        JOIN [{SRC}].sys.types ty ON ty.user_type_id = c.user_type_id
        LEFT JOIN [{SRC}].sys.default_constraints dc ON dc.object_id = c.default_object_id
        WHERE t.name IN ({",".join("?"*len(INTERFACE_TABLES))})
        ORDER BY t.name, c.column_id
    """, INTERFACE_TABLES)
    cols = {}
    for r in cur.fetchall():
        cols.setdefault(r[0], []).append({
            "name": r[1], "type": r[2], "len": r[3] if r[3] is not None else 0,
            "prec": r[4], "scale": r[5], "dtprec": r[6],
            "null": bool(r[7]), "default": (r[8] or "").strip(), "ident": bool(r[9]),
        })
    cur.execute(f"""
        SELECT t.name, c.name FROM [{SRC}].sys.indexes i
        JOIN [{SRC}].sys.tables t ON t.object_id=i.object_id
        JOIN [{SRC}].sys.index_columns ic ON ic.object_id=i.object_id AND ic.index_id=i.index_id AND ic.key_ordinal=1
        JOIN [{SRC}].sys.columns c ON c.object_id=i.object_id AND c.column_id=ic.column_id
        WHERE i.is_primary_key=1 AND t.name IN ({",".join("?"*len(INTERFACE_TABLES))})
    """, INTERFACE_TABLES)
    pk = {r[0]: r[1] for r in cur.fetchall()}
    return cols, pk


def build_ddl(table, cols, pk):
    lines = []
    for c in cols:
        newname = COL_RENAME.get((table, c["name"]), c["name"])
        ctype = TYPE_OVERRIDE.get((table, c["name"]), type_sql(c))
        s = f'  [{newname}] {ctype}'
        if c["ident"]:
            s += " IDENTITY(1,1)"
        s += " NULL" if c["null"] else " NOT NULL"
        if c["default"] and not c["ident"]:
            s += f' DEFAULT {c["default"]}'
        lines.append(s)
    if table in pk:
        pkcol = COL_RENAME.get((table, pk[table]), pk[table])
        lines.append(f'  CONSTRAINT [PK_api_{table}] PRIMARY KEY ([{pkcol}])')
    return f"CREATE TABLE [api].[{table}] (\n" + ",\n".join(lines) + "\n)"


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


def main():
    print("=" * 78)
    print("A. 读取旧库 14 张接口表结构")
    print("=" * 78)
    cn = pyodbc.connect(CS)
    cols, pk = load_struct(cn)
    rec(len(cols) == len(INTERFACE_TABLES), f"读到 {len(cols)}/14 张表结构",
        "缺:" + str(set(INTERFACE_TABLES) - set(cols)) if len(cols) != len(INTERFACE_TABLES) else "")
    total_cols = sum(len(v) for v in cols.values())
    print(f"  合计 {total_cols} 列，PK 覆盖 {len(pk)} 张表")

    cur0 = cn.cursor()
    cur0.execute(f"SELECT COUNT(*) FROM [{DST}].sys.tables")
    base_tables = cur0.fetchone()[0]
    cur0.execute(f"SELECT COUNT(*) FROM [{DST}].sys.schemas")
    base_schemas = cur0.fetchone()[0]
    cur0.execute(f"SELECT COUNT(*) FROM [{DST}].sys.synonyms")
    base_syn = cur0.fetchone()[0]
    print(f"  执行前：{DST} tables={base_tables} schemas={base_schemas} synonyms={base_syn}")

    print("\n" + "=" * 78)
    print("B. 事务内建立兼容层（schema api + 14 表 + 14 同义词）")
    print("=" * 78)
    cur = cn.cursor()
    cur.execute(f"USE [{DST}]")
    built = 0
    try:
        cur.execute("CREATE SCHEMA [api]")
        rec(True, "CREATE SCHEMA api")

        for t in INTERFACE_TABLES:
            ddl = build_ddl(t, cols[t], pk)
            cur.execute(ddl)
            built += 1
        rec(built == 14, f"建立 {built}/14 张 api 表")

        for t in INTERFACE_TABLES:
            newname = RENAMED.get(t, t)
            cur.execute(f"CREATE SYNONYM [dbo].[{newname}] FOR [api].[{t}]")
        rec(True, "建立 14 个 dbo 同义词（holland_tests/work_values 已按新名建）")

        # 验证同义词可解析
        cur.execute("SELECT COUNT(*) FROM sys.synonyms WHERE name IN ('users_login','career_values','holland_test_results')")
        rec(cur.fetchone()[0] == 3, "同义词可被元数据识别")

        print("\n" + "=" * 78)
        print("C. 用 58 条接口 SQL 逐条编译")
        print("=" * 78)
        blocks = extract_sql()
        print(f"  提取到 {len(blocks)} 条 SQL")
        bad = []
        for name, q in blocks:
            sql = q.replace("?", "NULL")
            try:
                cur.execute("EXEC sys.sp_describe_first_result_set @tsql = ?", (sql,))
                cur.fetchall()
            except Exception as e:
                msgs = [str(m[1]) for m in getattr(cur, "messages", [])] or [str(e)]
                key = [m for m in msgs if ("无效" in m or "Invalid" in m or "不存在" in m
                                           or "找不到" in m or "语法" in m or "syntax" in m.lower())]
                bad.append((name, re.sub(r"\s+", " ", (key[-1] if key else msgs[-1]))[:100]))
        ok_n = len(blocks) - len(bad)
        print(f"  通过 {ok_n}/{len(blocks)}，失败 {len(bad)}")
        for n, m in bad:
            print(f"    ×   {n:<28} {m}")
        rec(ok_n >= 55, f"接口 SQL 通过率 {ok_n}/{len(blocks)}（目标 >=55，与旧库对齐后同级）")

        print("\n" + "=" * 78)
        print("D. 真实读写测试（同事务，随后回滚）")
        print("=" * 78)
        cur.execute("INSERT INTO users_login (user_name,password_hash,user_email,user_status,user_remark) "
                    "VALUES ('compat_probe','x','probe@test.cn',1,'probe')")
        rec(True, "INSERT 不写主键成功（IDENTITY 生效）")
        cur.execute("SELECT user_id FROM users_login WHERE user_name='compat_probe'")
        newid = cur.fetchone()[0]
        rec(newid > 0, f"取回自增主键 user_id={newid}")
        cur.execute("UPDATE users_login SET user_remark='probe2' WHERE user_id=?", (newid,))
        rec(cur.rowcount == 1, "UPDATE 命中 1 行")
        cur.execute("DELETE FROM users_login WHERE user_id=?", (newid,))
        rec(cur.rowcount == 1, "DELETE 命中 1 行")
        # JOIN 类读取
        cur.execute("""SELECT TOP 1 ss.skill_record_id, s.skill_name, ss.proficiency_level
                       FROM student_skills ss JOIN skills s ON ss.skill_id=s.skill_id""")
        cur.fetchall()
        rec(True, "跨表 JOIN（student_skills × skills）可执行（兼容层是空表，0 行属正常）")

    except Exception as e:
        rec(False, "兼容层构建过程异常", str(e)[:200])
    finally:
        cn.rollback()
        print("\n  → 已 ROLLBACK")

    print("\n" + "=" * 78)
    print("E. 复核：库内对象是否完全复原")
    print("=" * 78)
    cur2 = cn.cursor()
    cur2.execute(f"SELECT COUNT(*) FROM [{DST}].sys.tables"); t2 = cur2.fetchone()[0]
    cur2.execute(f"SELECT COUNT(*) FROM [{DST}].sys.schemas"); s2 = cur2.fetchone()[0]
    cur2.execute(f"SELECT COUNT(*) FROM [{DST}].sys.synonyms"); y2 = cur2.fetchone()[0]
    rec(t2 == base_tables, f"表数复原 {t2} == {base_tables}")
    rec(s2 == base_schemas, f"schema 数复原 {s2} == {base_schemas}")
    rec(y2 == base_syn, f"同义词数复原 {y2} == {base_syn}")
    cur2.execute(f"SELECT COUNT(*) FROM [{DST}].sys.objects WHERE schema_id=SCHEMA_ID('api')")
    rec(cur2.fetchone()[0] == 0, "api schema 无残留对象")
    cn.close()

    print("\n" + "=" * 78)
    ok = sum(1 for r in results if r[0]); fail = len(results) - ok
    print(f"总计 {len(results)} 项：通过 {ok}，失败 {fail}")
    print("=" * 78)
    json.dump([{"ok": r[0], "name": r[1], "detail": r[2]} for r in results],
              open("_test_newdb_compat.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
