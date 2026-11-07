# -*- coding: utf-8 -*-
"""
新旧库逐列对比（用法驱动）
========================
原则：
  1. 接口对 12/14 张表用 SELECT *，行转 dict 后上层按键取值
     => 这些表的隐含契约 = 旧表全部列
  2. matching_results / job_skill_requirements 用显式列清单
     => 只要求列出的列存在，但仍按全列对齐（代价低、更稳）
  3. 对比不是"名字像不像"，而是"接口会不会取不到这个 key"
     => 旧列在新库不存在时必须：rename（同义列）或 add（新库无）
  4. 新库多出的列：接口不用，保留（但要检查 NOT NULL 无默认值，否则 INSERT 会挂）

输出：_field_diff_v2.json / _field_diff_v2.md
"""
import sys, json, pyodbc
sys.stdout.reconfigure(encoding="utf-8")

CS = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;DATABASE=master;Trusted_Connection=yes"
OLD, NEW = "career_recommendation", "career_system"

# 旧表 -> 新表现名（None = 新库无此表，需新建）
TABLE_MAP = {
    "users_login": "user",
    "students": "student_info",
    "skills": "skill_library",
    "holland_tests": "holland_assessment",
    "work_values": "value_assessment",
    "jobs": "job_library",
    "job_skill_requirements": "job_skill_requirement",
    "matching_results": "job_match",
    "week_plans": "weekly_task",
    "day_plans": "daily_task",
    "companies": None,
    "student_skills": None,
    "student_preferences": None,
    "experiences": None,
}

conn = pyodbc.connect(CS, autocommit=True)
cur = conn.cursor()

def schema(db, table):
    cur.execute("USE [%s]" % db)
    cur.execute("""
        SELECT c.name, ty.name, c.max_length, c.precision, c.scale, c.is_nullable,
               c.is_identity, c.column_id,
               CASE WHEN dc.object_id IS NULL THEN 0 ELSE 1 END AS has_default
        FROM sys.columns c
        JOIN sys.tables t ON t.object_id = c.object_id
        JOIN sys.types ty ON ty.user_type_id = c.user_type_id
        LEFT JOIN sys.default_constraints dc
               ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
        WHERE t.name = ? AND c.system_type_id = ty.system_type_id
        ORDER BY c.column_id""", (table,))
    return [dict(name=r[0], type=r[1], maxlen=r[2], prec=r[3], scale=r[4],
                 nullable=bool(r[5]), identity=bool(r[6]), pos=r[7], has_default=bool(r[8]))
            for r in cur.fetchall()]

def base_type(t):
    """归并到可比较的基础类型族"""
    t = t.lower()
    if t in ("varchar", "nvarchar", "char", "nchar", "text", "ntext"):
        return "string"
    if t in ("int", "bigint", "smallint", "tinyint"):
        return "int"
    if t in ("decimal", "numeric", "float", "real", "money"):
        return "number"
    if t in ("bit",):
        return "bit"
    if t in ("date", "datetime", "datetime2", "smalldatetime", "time"):
        return "datetime"
    return t

OLD_TABLES = list(TABLE_MAP.keys())
old_schema = {t: schema(OLD, t) for t in OLD_TABLES}
new_tables = set()
cur.execute("USE [%s]" % NEW)
cur.execute("SELECT name FROM sys.tables")
new_tables = {r[0] for r in cur.fetchall()}
new_schema = {}
for ot, nt in TABLE_MAP.items():
    if nt and nt in new_tables:
        new_schema[ot] = schema(NEW, nt)

result = {"old_db": OLD, "new_db": NEW, "tables": {}, "summary": {}}
tot = {"keep": 0, "rename": 0, "add": 0, "new_only": 0}

for ot in OLD_TABLES:
    nt = TABLE_MAP[ot]
    ocols = old_schema[ot]
    ncols = new_schema.get(ot, [])
    nby = {c["name"]: c for c in ncols}
    used_new = set()
    rows = []

    for oc in ocols:
        # 1) 同名同存在
        if oc["name"] in nby:
            nc = nby[oc["name"]]
            used_new.add(oc["name"])
            act = "keep"
            if base_type(oc["type"]) != base_type(nc["type"]):
                act = "keep_retype"
            elif oc["nullable"] != nc["nullable"]:
                act = "keep_null"
            rows.append(dict(old=oc["name"], old_type=oc["type"], old_null=oc["nullable"],
                             new=oc["name"], new_type=nc["type"], new_null=nc["nullable"],
                             action=act, note=""))
            tot["keep"] += 1
            continue

        # 2) 不同名：按"同基础类型 + 同位置倾向"给候选，供人工判定
        cands = [c for c in ncols
                 if c["name"] not in used_new and base_type(c["type"]) == base_type(oc["type"])]
        # 位置最接近的排前
        cands.sort(key=lambda c: abs(c["pos"] - oc["pos"]))
        cand = cands[0]["name"] if cands else None
        if cand:
            used_new.add(cand)
            rows.append(dict(old=oc["name"], old_type=oc["type"], old_null=oc["nullable"],
                             new=cand, new_type=nby[cand]["type"], new_null=nby[cand]["nullable"],
                             action="rename", note="同类型候选"))
            tot["rename"] += 1
        else:
            rows.append(dict(old=oc["name"], old_type=oc["type"], old_null=oc["nullable"],
                             new=None, new_type=None, new_null=None,
                             action="add", note="新库无同类型列"))
            tot["add"] += 1

    # 3) 新库多出的列
    extra = []
    for nc in ncols:
        if nc["name"] not in used_new:
            risk = (not nc["nullable"]) and (not nc["has_default"]) and (not nc["identity"])
            extra.append(dict(name=nc["name"], type=nc["type"], nullable=nc["nullable"],
                              pos=nc["pos"], insert_risk=risk))
            tot["new_only"] += 1

    result["tables"][ot] = dict(new_table=nt, old_count=len(ocols), new_count=len(ncols),
                                cols=rows, new_only=extra)

result["summary"] = tot
json.dump(result, open("_field_diff_v2.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# ---- 控制台摘要 ----
print("=" * 78)
print("新旧库逐列对比（用法驱动）  合计:", tot)
print("=" * 78)
for ot in OLD_TABLES:
    d = result["tables"][ot]
    print("\n【%s】 -> %s   旧%d列 / 新%d列" % (ot, d["new_table"] or "（需新建）", d["old_count"], d["new_count"]))
    for r in d["cols"]:
        mark = {"keep": "  =", "keep_retype": "  ~", "keep_null": "  ~",
                "rename": "  >", "add": "  +"}[r["action"]]
        tgt = r["new"] or "（新增）"
        print("%s %-26s %-10s -> %-26s %s" % (mark, r["old"], r["old_type"], tgt, r["action"]))
    if d["new_only"]:
        print("    新库独有:", ", ".join(e["name"] for e in d["new_only"]))
print("\n已写 _field_diff_v2.json")
