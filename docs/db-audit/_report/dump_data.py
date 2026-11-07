# -*- coding: utf-8 -*-
"""数据抽样：判断新旧库的重叠度与值域，为迁移策略提供依据。只读。"""
import sys, json, pyodbc

sys.stdout.reconfigure(encoding="utf-8")
CS = ("DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;DATABASE=master;"
      "Trusted_Connection=yes;Connection Timeout=5")
conn = pyodbc.connect(CS, autocommit=True)
cur = conn.cursor()


def q(db, sql):
    cur.execute("USE [%s]" % db)
    cur.execute(sql)
    cols = [d[0] for d in cur.description]
    return [dict(zip(cols, r)) for r in cur.fetchall()]


O, N = "career_recommendation", "career_system"
out = {}

print("=" * 90)
print("【旧库】users_login 20 行（密码只看长度）")
print("=" * 90)
r = q(O, "SELECT user_id,user_name,user_email,user_status,user_created_time,last_Login_time,user_remark,"
         "LEN(password_hash) AS pwd_len, LEFT(password_hash,6) AS pwd_head FROM users_login ORDER BY user_id")
for x in r:
    print("  %3d | %-12s | %-28s | st=%s | pwd_len=%-3s %s"
          % (x["user_id"], x["user_name"], x["user_email"], x["user_status"], x["pwd_len"], x["pwd_head"]))
out["old_users"] = r

print()
print("=" * 90)
print("【旧库】students 20 行")
print("=" * 90)
r = q(O, "SELECT * FROM students ORDER BY student_id")
for x in r:
    print("  %3d | %-10s | %-8s | %-8s | grade=%-3s gpa=%-5s user_id=%s"
          % (x["student_id"], x["student_number"], x["student_name"], x["student_major"],
             x["grade"], x["gpa"], x["user_id"]))
out["old_students"] = r

print()
print("=" * 90)
print("【新库】students 现状")
print("=" * 90)
r = q(N, "SELECT * FROM student_info")
for x in r:
    print("  ", json.dumps(x, ensure_ascii=False, default=str)[:400])
out["new_students"] = r

print()
print("=" * 90)
print("【旧库】companies 9 行")
print("=" * 90)
r = q(O, "SELECT * FROM companies ORDER BY company_id")
for x in r:
    print("  %3d | %-24s | %-10s | %-8s" % (x["company_id"], x["company_name"],
                                            x["company_location"], x["company_size"]))
out["old_companies"] = r

print()
print("=" * 90)
print("【旧库】jobs 23 行")
print("=" * 90)
r = q(O, "SELECT * FROM jobs ORDER BY job_id")
for x in r:
    print("  %3d | %-26s | type=%-8s | comp=%-3s | salary=%-12s | industry=%-8s | edu=%-6s | holland=%s"
          % (x["job_id"], x["job_title"], x["job_type"], x["company_id"], x["salary_range"],
             x["industry_id"], x["education_requirement"], x["holland_code"]))
out["old_jobs"] = r

print()
print("=" * 90)
print("【新库】job_library 3 行")
print("=" * 90)
for x in q(N, "SELECT * FROM job_library"):
    print("  ", json.dumps(x, ensure_ascii=False, default=str)[:400])

print()
print("=" * 90)
print("【旧库】skills 25 行 / 【新库】skill_library 15 行 —— 按名称比对")
print("=" * 90)
os_ = q(O, "SELECT skill_id,skill_name,skill_category FROM skills ORDER BY skill_id")
ns_ = q(N, "SELECT skill_id,skill_name,skill_category FROM skill_library ORDER BY skill_id")
oset = {x["skill_name"] for x in os_}
nset = {x["skill_name"] for x in ns_}
print("  旧库 %d 个：" % len(os_))
print("   ", " / ".join("%s(%s)" % (x["skill_name"], x["skill_category"]) for x in os_))
print("  新库 %d 个：" % len(ns_))
print("   ", " / ".join("%s(%s)" % (x["skill_name"], x["skill_category"]) for x in ns_))
print("  交集 %d 个：%s" % (len(oset & nset), "、".join(sorted(oset & nset))))
print("  仅旧库 %d 个：%s" % (len(oset - nset), "、".join(sorted(oset - nset))))
out["old_skills"] = os_
out["new_skills"] = ns_

print()
print("=" * 90)
print("【旧库】job_skill_requirements 值域")
print("=" * 90)
r = q(O, "SELECT required_level, requirement_type, COUNT(*) c FROM job_skill_requirements "
         "GROUP BY required_level, requirement_type ORDER BY required_level")
for x in r:
    print("  level=%-10s type=%-8s x%d" % (x["required_level"], x["requirement_type"], x["c"]))
out["old_jsr_domain"] = r

print()
print("=" * 90)
print("【旧库】student_skills / student_preferences 值域")
print("=" * 90)
r = q(O, "SELECT proficiency_level, COUNT(*) c FROM student_skills GROUP BY proficiency_level ORDER BY 1")
print("  proficiency:", [(x["proficiency_level"], x["c"]) for x in r])
r2 = q(O, "SELECT TOP 6 * FROM student_preferences ORDER BY preference_id")
for x in r2:
    print("  ", json.dumps(x, ensure_ascii=False, default=str)[:300])
out["old_ss_domain"] = r
out["old_pref_sample"] = r2

print()
print("=" * 90)
print("【旧库】matching_results 93 行 值域")
print("=" * 90)
r = q(O, "SELECT TOP 5 * FROM matching_results ORDER BY match_id")
for x in r:
    print("  ", json.dumps(x, ensure_ascii=False, default=str)[:300])
r2 = q(O, "SELECT COUNT(DISTINCT student_id) s, COUNT(DISTINCT job_id) j, "
          "MIN(match_score) mn, MAX(match_score) mx FROM matching_results")
print("  覆盖学生 %s 名 / 岗位 %s 个 / 分数 %s ~ %s" % (r2[0]["s"], r2[0]["j"], r2[0]["mn"], r2[0]["mx"]))
out["old_match_sample"] = r

print()
print("=" * 90)
print("【旧库】holland_tests / work_values / experiences / week_plans / day_plans 行数")
print("=" * 90)
for t in ("holland_tests", "work_values", "experiences", "week_plans", "day_plans"):
    c = q(O, "SELECT COUNT(*) c FROM %s" % t)[0]["c"]
    print("  %-16s %d 行" % (t, c))

print()
print("=" * 90)
print("【新库】industry / values_library 内容")
print("=" * 90)
for x in q(N, "SELECT * FROM industry"):
    print("  industry:", x)
for x in q(N, "SELECT * FROM values_library"):
    print("  value:", x)

with open("_data_sample.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1, default=str)
print("\n已写出 _data_sample.json")
conn.close()
