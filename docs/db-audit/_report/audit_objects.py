# -*- coding: utf-8 -*-
"""
对象级补充核查（只读 + 事务内改名后回滚）

1) CHECK 约束：数量、所在表、表达式，是否落在要改名的两张表上
2) 唯一约束（非主键）：完整列组合（含复合列）
3) 视图 / 存储过程：改名前后的可编译性（用 sp_refreshsqlmodule，最权威）
"""
import sys, re, json, pyodbc

sys.stdout.reconfigure(encoding="utf-8")
CS = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;Trusted_Connection=yes;Connection Timeout=5"
DB = "career_recommendation"
out = {}


def is_noresult(e):
    m = str(e).lower()
    return "no results" in m or "不是查询" in m


def refresh(cur, name):
    """重新编译对象：能过 = 依赖都还在。无结果集是正常的。"""
    try:
        cur.execute("EXEC sys.sp_refreshsqlmodule ?", (name,))
        while cur.nextset():
            pass
        return True, "OK"
    except Exception as e:
        if is_noresult(e):
            return True, "OK"
        return False, re.sub(r"\s+", " ", str(e))[:110]


cn = pyodbc.connect(CS)
cur = cn.cursor()
cur.execute(f"USE [{DB}]")

print("=" * 78)
print("A. CHECK 约束")
print("=" * 78)
rows = cur.execute("""
    SELECT t.name, cc.name, cc.definition FROM sys.check_constraints cc
    JOIN sys.tables t ON t.object_id = cc.parent_object_id
    ORDER BY t.name, cc.name""").fetchall()
out["checks"] = [{"table": r[0], "name": r[1], "definition": re.sub(r"\s+", " ", r[2])} for r in rows]
by_table = {}
for x in out["checks"]:
    by_table.setdefault(x["table"], []).append(x["definition"])
for t, defs in sorted(by_table.items()):
    print(f"  {t}（{len(defs)} 条）")
    for d in defs:
        print(f"      {d}")
print(f"  合计 {len(rows)} 条")

print("\n" + "=" * 78)
print("B. 唯一约束（非主键，完整列组合）")
print("=" * 78)
rows = cur.execute("""
    SELECT t.name, i.name, i.is_unique_constraint,
           STUFF((SELECT ',' + c2.name FROM sys.index_columns ic2
                  JOIN sys.columns c2 ON c2.object_id = ic2.object_id AND c2.column_id = ic2.column_id
                  WHERE ic2.object_id = i.object_id AND ic2.index_id = i.index_id
                    AND ic2.is_included_column = 0
                  ORDER BY ic2.key_ordinal FOR XML PATH('')), 1, 1, '')
    FROM sys.indexes i
    JOIN sys.tables t ON t.object_id = i.object_id
    WHERE i.is_unique = 1 AND i.is_primary_key = 0
    ORDER BY t.name""").fetchall()
out["uniques"] = [{"table": r[0], "index": r[1], "is_constraint": bool(r[2]), "cols": str(r[3])} for r in rows]
for x in out["uniques"]:
    print(f"  {x['table']:<24}({x['cols']})  {'UNIQUE约束' if x['is_constraint'] else '唯一索引'}")
print(f"  合计 {len(rows)} 条")

print("\n" + "=" * 78)
print("C. 视图 / 存储过程（改名前）")
print("=" * 78)
objs = cur.execute("SELECT name, type_desc FROM sys.objects WHERE type IN ('V','P') ORDER BY type_desc").fetchall()
out["modules_before"] = {}
for name, typ in objs:
    ok, msg = refresh(cur, name)
    out["modules_before"][name] = {"type": typ, "ok": ok, "msg": msg}
    print(f"  {'PASS' if ok else 'FAIL'} {typ:<22}{name:<28}{msg}")

print("\n" + "=" * 78)
print("D. 事务内改名后，对象是否仍可编译")
print("=" * 78)
out["after_rename"] = {}
try:
    for sql in [
        "EXEC sp_rename 'dbo.holland_tests', 'holland_test_results'",
        "EXEC sp_rename 'dbo.work_values', 'career_values'",
        "EXEC sp_rename 'dbo.career_values.worth_test_time', 'value_test_time', 'COLUMN'",
        "EXEC sp_rename 'dbo.career_values.worth_id', 'value_id', 'COLUMN'",
    ]:
        cur.execute(sql)
        while cur.nextset():
            pass
    print("  4 处改名完成")
    for name, typ in objs:
        ok, msg = refresh(cur, name)
        out["after_rename"][name] = {"ok": ok, "msg": msg}
        print(f"  {'PASS' if ok else 'FAIL'} {typ:<22}{name:<28}{msg}")
    n = cur.execute("""SELECT COUNT(*) FROM sys.check_constraints cc
                       JOIN sys.tables t ON t.object_id = cc.parent_object_id
                       WHERE t.name IN ('holland_test_results','career_values')""").fetchone()[0]
    out["checks_after_rename"] = n
    print(f"  改名后两张表上的 CHECK 约束：{n} 条")
    # 数据是否仍可查（空表也要能 SELECT）
    for t in ["holland_test_results", "career_values"]:
        cnt = cur.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
        print(f"  PASS 新表 {t} 可查询，{cnt} 行")
finally:
    cn.rollback()
    print("  → 已 ROLLBACK")

print("\n" + "=" * 78)
print("E. 复原复核")
print("=" * 78)
cur2 = cn.cursor(); cur2.execute(f"USE [{DB}]")
tabs = [r[0] for r in cur2.execute("SELECT name FROM sys.tables").fetchall()]
ok1 = "holland_tests" in tabs and "work_values" in tabs and "holland_test_results" not in tabs
checks_now = cur2.execute("""SELECT COUNT(*) FROM sys.check_constraints cc
                             JOIN sys.tables t ON t.object_id = cc.parent_object_id
                             WHERE t.name IN ('holland_tests','work_values')""").fetchone()[0]
print(f"  {'PASS' if ok1 else 'FAIL'} 表名复原（{len(tabs)} 张）")
print(f"  {'PASS' if checks_now == len([x for x in out['checks'] if x['table'] in ('holland_tests','work_values')]) else 'FAIL'}"
      f" CHECK 约束复原（{checks_now} 条）")
out["restore"] = {"tables_ok": ok1, "checks": checks_now}

json.dump(out, open("_audit_objects.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
cn.close()
print("\n已写入 _audit_objects.json")
