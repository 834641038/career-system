# -*- coding: utf-8 -*-
"""
逐字段对比 career_recommendation（旧库/原型）与 career_system（新库/设计）。

只读，不改任何东西。

产出：
    _field_diff.json   两库完整列元数据 + 逐表列差集
    控制台打印 markdown 表格

用法：
    python run_compare_fields.py
"""
import sys, json, pyodbc

sys.stdout.reconfigure(encoding="utf-8")

SERVER = "localhost"
OLD = "career_recommendation"
NEW = "career_system"
CS = ("DRIVER={ODBC Driver 17 for SQL Server};SERVER=%s;DATABASE=master;"
      "Trusted_Connection=yes;Connection Timeout=5") % SERVER

# 旧库真实表名 -> 新库改名后的目标名
# 注意：旧库有两张表名与接口不一致（holland_tests / work_values），
#       接口写的是 holland_test_results / career_values，这两条 SQL 在旧库上也是失败的。
MAP = {
    "users_login":            "users_login",
    "students":               "students",
    "skills":                 "skills",
    "holland_tests":          "holland_test_results",
    "work_values":            "career_values",
    "jobs":                   "jobs",
    "job_skill_requirements": "job_skill_requirements",
    "matching_results":       "matching_results",
    "week_plans":             "week_plans",
    "day_plans":              "day_plans",
    "companies":              "companies",
    "student_skills":         "student_skills",
    "student_preferences":    "student_preferences",
    "experiences":            "experiences",
}

# 新库现状（改名前的真实表名）-> 改名后的目标名
NEW_RENAME = {
    "user":                 "users_login",
    "student_info":         "students",
    "skill_library":        "skills",
    "holland_assessment":   "holland_test_results",
    "value_assessment":     "career_values",
    "job_library":          "jobs",
    "job_skill_requirement": "job_skill_requirements",
    "job_match":            "matching_results",
    "weekly_task":          "week_plans",
    "daily_task":           "day_plans",
}

COL_SQL = """
SELECT t.name AS tbl, c.name AS col, c.column_id AS ord,
       ty.name AS dtype, c.max_length AS len, c.precision AS prec, c.scale AS scl,
       c.is_nullable AS nullable, c.is_identity AS ident, c.is_computed AS computed,
       dc.definition AS dfault
FROM sys.columns c
JOIN sys.tables t ON t.object_id = c.object_id
JOIN sys.types ty ON ty.user_type_id = c.user_type_id
LEFT JOIN sys.default_constraints dc
       ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
ORDER BY t.name, c.column_id
"""

FK_SQL = """
SELECT fk.name AS fk, tp.name AS child_tbl, cp.name AS child_col,
       tr.name AS parent_tbl, cr.name AS parent_col
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
JOIN sys.tables tp ON tp.object_id = fkc.parent_object_id
JOIN sys.columns cp ON cp.object_id = fkc.parent_object_id AND cp.column_id = fkc.parent_column_id
JOIN sys.tables tr ON tr.object_id = fkc.referenced_object_id
JOIN sys.columns cr ON cr.object_id = fkc.referenced_object_id AND cr.column_id = fkc.referenced_column_id
ORDER BY tp.name, fk.name, fkc.constraint_column_id
"""

CHK_SQL = """
SELECT t.name AS tbl, ck.name AS chk, ck.definition AS def
FROM sys.check_constraints ck
JOIN sys.tables t ON t.object_id = ck.parent_object_id
ORDER BY t.name, ck.name
"""

IDX_SQL = """
SELECT t.name AS tbl, i.name AS idx, i.is_unique AS uniq, i.is_primary_key AS pk,
       i.filter_definition AS filt,
       STUFF((SELECT ',' + c2.name
              FROM sys.index_columns ic2
              JOIN sys.columns c2 ON c2.object_id = ic2.object_id AND c2.column_id = ic2.column_id
              WHERE ic2.object_id = i.object_id AND ic2.index_id = i.index_id AND ic2.is_included_column = 0
              ORDER BY ic2.key_ordinal
              FOR XML PATH('')), 1, 1, '') AS cols
FROM sys.indexes i
JOIN sys.tables t ON t.object_id = i.object_id
WHERE i.type > 0 AND i.is_hypothetical = 0
ORDER BY t.name, i.name
"""


def q(db, sql):
    cur.execute("USE [%s];" % db)
    cur.execute(sql)
    cols = [d[0] for d in cur.description]
    return [dict(zip(cols, r)) for r in cur.fetchall()]


conn = pyodbc.connect(CS, autocommit=True)
conn.timeout = 30
cur = conn.cursor()

print("=" * 78)
print("采集列元数据")
print("=" * 78)

meta = {}
for tag, db in (("old", OLD), ("new", NEW)):
    cols = q(db, COL_SQL)
    tables = {}
    for c in cols:
        tables.setdefault(c["tbl"], []).append(c)
    fks = q(db, FK_SQL)
    chks = q(db, CHK_SQL)
    idxs = q(db, IDX_SQL)
    # 精确行数（USE 与 SELECT 必须分两次 execute，否则 pyodbc 取不到结果集）
    rows = {}
    for t in tables:
        try:
            cur.execute("USE [%s]" % db)
            cur.execute("SELECT COUNT_BIG(*) FROM [dbo].[%s]" % t)
            rows[t] = int(cur.fetchone()[0])
        except Exception as e:
            rows[t] = -1
            print("    ! count fail %s: %s" % (t, str(e)[:120]))
    meta[tag] = {"db": db, "tables": tables, "fks": fks, "chks": chks,
                 "idxs": idxs, "rows": rows}
    print("  %-6s %-22s 表 %2d  列 %3d  FK %2d  CHECK %2d  行 %d"
          % (tag, db, len(tables), len(cols), len(fks), len(chks), sum(v for v in rows.values() if v > 0)))

# ------------------------------------------------------------------ 配对
new_by_target = {}
for real, target in NEW_RENAME.items():
    new_by_target[target] = real
# 未改名的表：目标名 = 真名
for real in meta["new"]["tables"]:
    if real not in NEW_RENAME:
        new_by_target.setdefault(real, real)


def typestr(c):
    dt = c["dtype"]
    if dt in ("varchar", "char", "varbinary", "binary"):
        n = c["len"] if c["len"] and c["len"] > 0 else "max"
        return "%s(%s)" % (dt, n)
    if dt in ("nvarchar", "nchar"):
        n = (c["len"] // 2) if c["len"] and c["len"] > 0 else "max"
        return "%s(%s)" % (dt, n)
    if dt in ("decimal", "numeric"):
        return "%s(%d,%d)" % (dt, c["prec"], c["scl"])
    return dt


report = {"maps": [], "unmapped_old": [], "unmapped_new": []}

print()
print("=" * 78)
print("逐表字段差集")
print("=" * 78)

for old_t in sorted(meta["old"]["tables"]):
    target = MAP.get(old_t)
    real_new = new_by_target.get(target) if target else None
    old_cols = {c["col"]: c for c in meta["old"]["tables"][old_t]}

    if not real_new:
        report["unmapped_old"].append({"old_table": old_t, "rows": meta["old"]["rows"][old_t],
                                       "cols": list(old_cols)})
        print("\n## %s  ->  【新库无对应表，需新建】  旧库 %d 行" % (old_t, meta["old"]["rows"][old_t]))
        for n, c in old_cols.items():
            print("    - %-24s %-14s %s" % (n, typestr(c), "NULL" if c["nullable"] else "NOT NULL"))
        continue

    new_cols = {c["col"]: c for c in meta["new"]["tables"][real_new]}
    only_old = [n for n in old_cols if n not in new_cols]
    only_new = [n for n in new_cols if n not in old_cols]
    shared = [n for n in old_cols if n in new_cols]
    type_diff = []
    for n in shared:
        a, b = old_cols[n], new_cols[n]
        if typestr(a) != typestr(b):
            type_diff.append((n, typestr(a), typestr(b)))
    null_diff = [(n, bool(old_cols[n]["nullable"]), bool(new_cols[n]["nullable"]))
                 for n in shared if bool(old_cols[n]["nullable"]) != bool(new_cols[n]["nullable"])]

    report["maps"].append({
        "old_table": old_t, "old_rows": meta["old"]["rows"][old_t],
        "new_target": target, "new_real": real_new, "new_rows": meta["new"]["rows"][real_new],
        "old_cols": list(old_cols), "new_cols": list(new_cols),
        "only_old": [{"col": n, "type": typestr(old_cols[n]),
                      "nullable": bool(old_cols[n]["nullable"]),
                      "default": old_cols[n]["dfault"]} for n in only_old],
        "only_new": [{"col": n, "type": typestr(new_cols[n]),
                      "nullable": bool(new_cols[n]["nullable"])} for n in only_new],
        "type_diff": [{"col": a, "old": b, "new": c} for a, b, c in type_diff],
        "null_diff": [{"col": a, "old_nullable": b, "new_nullable": c} for a, b, c in null_diff],
    })

    flag = "  <<< 旧库有、新库缺 %d 列" % len(only_old) if only_old else ""
    print("\n## %s  ->  %s（现名 %s）  旧 %d 行 / 新 %d 行%s"
          % (old_t, target, real_new, meta["old"]["rows"][old_t],
             meta["new"]["rows"][real_new], flag))
    if only_old:
        for n in only_old:
            c = old_cols[n]
            print("    [缺] %-24s %-14s %-9s 默认=%s"
                  % (n, typestr(c), "NULL" if c["nullable"] else "NOT NULL", c["dfault"] or "-"))
    if type_diff:
        for n, a, b in type_diff:
            print("    [型] %-24s 旧 %-12s 新 %s" % (n, a, b))
    if null_diff:
        for n, a, b in null_diff:
            print("    [空] %-24s 旧 %-9s 新 %s"
                  % (n, "NULL" if a else "NOT NULL", "NULL" if b else "NOT NULL"))
    if only_new:
        print("    （新库独有 %d 列：%s）" % (len(only_new), ", ".join(only_new)))

for real_new in sorted(meta["new"]["tables"]):
    target = real_new if real_new in new_by_target and new_by_target[real_new] == real_new else None
    target = NEW_RENAME.get(real_new, real_new)
    if target not in MAP.values():
        report["unmapped_new"].append({"new_table": real_new, "rows": meta["new"]["rows"][real_new],
                                       "cols": [c["col"] for c in meta["new"]["tables"][real_new]]})

print()
print("=" * 78)
print("新库独有表（旧库没有，无需迁移，保留）")
print("=" * 78)
for u in report["unmapped_new"]:
    print("  %-26s %3d 行  %d 列" % (u["new_table"], u["rows"], len(u["cols"])))

# 汇总
tot_only_old = sum(len(m["only_old"]) for m in report["maps"])
tot_typed = sum(len(m["type_diff"]) for m in report["maps"])
report["summary"] = {
    "old_tables": len(meta["old"]["tables"]),
    "new_tables": len(meta["new"]["tables"]),
    "old_cols": sum(len(v) for v in meta["old"]["tables"].values()),
    "new_cols": sum(len(v) for v in meta["new"]["tables"].values()),
    "old_rows": sum(v for v in meta["old"]["rows"].values() if v > 0),
    "new_rows": sum(v for v in meta["new"]["rows"].values() if v > 0),
    "cols_missing_in_new": tot_only_old,
    "type_diffs": tot_typed,
    "tables_to_create": len(report["unmapped_old"]),
}
print()
print("=" * 78)
print("汇总：旧库 %d 表 %d 列 %d 行 / 新库 %d 表 %d 列 %d 行"
      % (report["summary"]["old_tables"], report["summary"]["old_cols"], report["summary"]["old_rows"],
         report["summary"]["new_tables"], report["summary"]["new_cols"], report["summary"]["new_rows"]))
print("      新库缺列 %d 个；类型不一致 %d 处；需新建表 %d 张"
      % (tot_only_old, tot_typed, len(report["unmapped_old"])))

report["meta"] = {
    "old": {"fks": meta["old"]["fks"], "chks": meta["old"]["chks"], "idxs": meta["old"]["idxs"],
            "tables": meta["old"]["tables"], "rows": meta["old"]["rows"]},
    "new": {"fks": meta["new"]["fks"], "chks": meta["new"]["chks"], "idxs": meta["new"]["idxs"],
            "tables": meta["new"]["tables"], "rows": meta["new"]["rows"]},
}
with open("_field_diff.json", "w", encoding="utf-8") as f:
    json.dump(report, f, ensure_ascii=False, indent=1)
print("\n已写出 _field_diff.json")

conn.close()
