# -*- coding: utf-8 -*-
"""
生成「旧库字段 -> 新库终态字段」的逐列对照表（markdown）。
只读元数据（_field_diff.json），不连库。

输出：_field_map.md
"""
import sys, json

sys.stdout.reconfigure(encoding="utf-8")

D = json.load(open("_field_diff.json", encoding="utf-8"))
OLD = D["meta"]["old"]["tables"]
NEW = D["meta"]["new"]["tables"]


def ts(c):
    dt = c["dtype"]
    if dt in ("varchar", "char"):
        return "%s(%s)" % (dt, c["len"] if c["len"] > 0 else "max")
    if dt in ("nvarchar", "nchar"):
        return "%s(%s)" % (dt, (c["len"] // 2) if c["len"] > 0 else "max")
    if dt in ("decimal", "numeric"):
        return "%s(%d,%d)" % (dt, c["prec"], c["scl"])
    return dt


def nulltag(c):
    return "" if c["nullable"] else " NOT NULL"


# 表级：旧表 -> (新库现表, 终态表名)
TBL = {
    "users_login":            ("user",                  "users_login"),
    "students":               ("student_info",          "students"),
    "skills":                 ("skill_library",         "skills"),
    "holland_tests":          ("holland_assessment",    "holland_test_results"),
    "work_values":            ("value_assessment",      "career_values"),
    "jobs":                   ("job_library",           "jobs"),
    "job_skill_requirements": ("job_skill_requirement", "job_skill_requirements"),
    "matching_results":       ("job_match",             "matching_results"),
    "week_plans":             ("weekly_task",           "week_plans"),
    "day_plans":              ("daily_task",            "day_plans"),
    "companies":              (None,                    "companies"),
    "student_skills":         (None,                    "student_skills"),
    "student_preferences":    (None,                    "student_preferences"),
    "experiences":            (None,                    "experiences"),
}

# 有对应关系的列： (旧表, 旧列) -> (新库现列名 or 终态列名, 动作, 说明)
# 动作：rename=同名改类型无需改  convert=改名并改类型  keep=同名同类型  add=新库无此列需新增
COL = {
    # ---------------- users_login
    ("users_login", "user_id"):            ("user_id", "keep", "主键，自增"),
    ("users_login", "user_name"):          ("user_name", "add", "接口登录名（stu_0001…）"),
    ("users_login", "password_hash"):      ("password_hash", "convert", "明文 `passwd123` → SHA-256(64 字符)；列宽 20→255"),
    ("users_login", "user_email"):         ("user_email", "rename", "现名 email"),
    ("users_login", "user_status"):        ("user_status", "add", "默认 1=启用"),
    ("users_login", "user_created_time"):  ("user_created_time", "rename", "现名 create_time"),
    ("users_login", "last_Login_time"):    ("last_Login_time", "rename", "现名 last_login_time，仅大小写不同"),
    ("users_login", "user_remark"):        ("user_remark", "add", "备注，可空"),
    # ---------------- students
    ("students", "student_id"):            ("student_id", "keep", "主键，自增"),
    ("students", "student_name"):          ("student_name", "rename", "现名 name"),
    ("students", "student_major"):         ("student_major", "rename", "现名 major"),
    ("students", "grade"):                 ("grade", "convert", "tinyint 2/3/4 → varchar「大二/大三/大四」"),
    ("students", "gpa"):                   ("gpa", "convert", "decimal(3,1)→(3,2)，值域 3.1–3.9 无损"),
    ("students", "user_id"):               ("user_id", "widen", "新库 NOT NULL → 放宽为 NULL（防注册 515）"),
    # ---------------- skills
    ("skills", "skill_id"):                ("skill_id", "keep", "主键，自增"),
    ("skills", "skill_name"):              ("skill_name", "convert", "nvarchar(50)→varchar(100)，需转 nvarchar 保中文"),
    ("skills", "skill_category"):          ("skill_category", "convert", "nvarchar(20)→varchar(50)"),
    ("skills", "skill_description"):       ("skill_description", "rename", "现名 description"),
    # ---------------- holland_tests
    ("holland_tests", "holland_test_id"):  ("holland_test_id", "rename", "现名 holland_id"),
    ("holland_tests", "student_id"):       ("student_id", "keep", ""),
    ("holland_tests", "holland_R"):        ("holland_R", "rename", "现名 r_score"),
    ("holland_tests", "holland_I"):        ("holland_I", "rename", "现名 i_score"),
    ("holland_tests", "holland_A"):        ("holland_A", "rename", "现名 a_score"),
    ("holland_tests", "holland_S"):        ("holland_S", "rename", "现名 s_score"),
    ("holland_tests", "holland_E"):        ("holland_E", "rename", "现名 e_score"),
    ("holland_tests", "holland_C"):        ("holland_C", "rename", "现名 c_score"),
    ("holland_tests", "holland_test_time"): ("holland_test_time", "rename", "现名 test_time"),
    # ---------------- work_values
    ("work_values", "worth_id"):           ("worth_id", "rename", "现名 value_assess_id"),
    ("work_values", "student_id"):         ("student_id", "keep", ""),
    ("work_values", "social_contribution"): ("social_contribution", "add", "宽表列，新库只有主从结构"),
    ("work_values", "achievement_oriented"): ("achievement_oriented", "add", "同上"),
    ("work_values", "safe_stable"):        ("safe_stable", "add", "同上"),
    ("work_values", "work_life_balance"):  ("work_life_balance", "add", "同上"),
    ("work_values", "power_status"):       ("power_status", "add", "同上"),
    ("work_values", "innovation_challenge"): ("innovation_challenge", "add", "同上"),
    ("work_values", "worth_test_time"):    ("worth_test_time", "rename", "现名 test_time"),
    # ---------------- jobs
    ("jobs", "job_id"):                    ("job_id", "keep", "主键，自增"),
    ("jobs", "company_id"):                ("company_id", "add", "必需，FK→companies"),
    ("jobs", "job_title"):                 ("job_title", "convert", "nvarchar(100)→varchar(100)"),
    ("jobs", "job_type"):                  ("job_type", "convert", "nvarchar(20)→varchar(50)"),
    ("jobs", "salary_range"):              ("salary_range", "add", "薪资区间"),
    # ---------------- job_skill_requirements
    ("job_skill_requirements", "requirement_id"): ("requirement_id", "keep", "主键，自增"),
    ("job_skill_requirements", "job_id"):  ("job_id", "keep", ""),
    ("job_skill_requirements", "skill_id"): ("skill_id", "keep", ""),
    ("job_skill_requirements", "required_level"): ("required_level", "convert", "varchar「basic/proficient/expert」→ tinyint 3/4/5"),
    ("job_skill_requirements", "requirement_type"): ("requirement_type", "add", "必需/加分"),
    # ---------------- matching_results
    ("matching_results", "match_id"):      ("match_id", "keep", "主键，自增"),
    ("matching_results", "student_id"):    ("student_id", "keep", ""),
    ("matching_results", "job_id"):        ("job_id", "keep", ""),
    ("matching_results", "match_score"):   ("match_score", "widen", "新库 NOT NULL → 放宽为 NULL（旧库存在空分）"),
    # ---------------- week_plans
    ("week_plans", "week_plan_id"):        ("week_plan_id", "rename", "现名 weekly_task_id"),
    ("week_plans", "week_plan_name"):      ("week_plan_name", "rename", "现名 weekly_task_name"),
    ("week_plans", "week_plan_start"):     ("week_plan_start", "rename", "现名 start_time"),
    ("week_plans", "week_plan_ddl"):       ("week_plan_ddl", "rename", "现名 end_time"),
    ("week_plans", "week_plan_finish"):    ("week_plan_finish", "add", "0/1，由 completion_percentage 折算"),
    ("week_plans", "student_id"):          ("student_id", "keep", ""),
    # ---------------- day_plans
    ("day_plans", "day_plan_id"):          ("day_plan_id", "rename", "现名 daily_task_id"),
    ("day_plans", "day_plan_name"):        ("day_plan_name", "rename", "现名 daily_task_name"),
    ("day_plans", "day_plan_describe"):    ("day_plan_describe", "rename", "现名 task_content"),
    ("day_plans", "day_plan_prority"):     ("day_plan_prority", "rename", "现名 priority（varchar 高/中/低 → tinyint 1/2/3）"),
    ("day_plans", "day_plan_ddl"):         ("day_plan_ddl", "rename", "现名 end_time"),
    ("day_plans", "day_plan_finish"):      ("day_plan_finish", "rename", "现名 is_completed（bit → tinyint）"),
    ("day_plans", "student_id"):           ("student_id", "keep", ""),
}

ACTION_LABEL = {
    "keep": "同名保留",
    "rename": "改名",
    "convert": "改名＋改类型",
    "add": "新增列",
    "widen": "放宽约束",
}

out = []
w = out.append
w("# 字段对照（旧库 → 新库终态）")
w("")
w("> 由 `gen_field_map.py` 从实库元数据生成，非手写。")
w("")

stat = {"keep": 0, "rename": 0, "convert": 0, "add": 0, "widen": 0, "new_only": 0}

for old_t in sorted(OLD, key=lambda x: (TBL[x][0] is None, x)):
    new_t, target = TBL[old_t]
    ocols = OLD[old_t]
    ncols = NEW[new_t] if new_t else []
    nmap = {c["col"]: c for c in ncols}
    used_new = set()

    w("### `%s` → `%s`%s" % (old_t, target,
                             ("（现名 `%s`）" % new_t) if new_t else "（新库无此表，新建）"))
    w("")
    w("| 旧库列 | 旧类型 | 新库现列 | 现类型 | 动作 | 说明 |")
    w("|---|---|---|---|---|---|")

    for oc in ocols:
        key = (old_t, oc["col"])
        if key in COL:
            ncol, act, note = COL[key]
            nc = nmap.get(ncol)
            if nc:
                used_new.add(ncol)
            w("| `%s` | %s%s | %s | %s | %s | %s |" % (
                oc["col"], ts(oc), nulltag(oc),
                ("`%s`" % ncol) if nc else "—",
                (ts(nc) + nulltag(nc)) if nc else "—",
                ACTION_LABEL[act], note))
            stat[act] += 1
        else:
            w("| `%s` | %s%s | — | — | **新增列** | 新库无对应 |" % (oc["col"], ts(oc), nulltag(oc)))
            stat["add"] += 1

    rest = [c for c in ncols if c["col"] not in used_new]
    if rest:
        w("")
        w("新库独有列（**保留不删**，旧库无值，迁移后为 NULL 或默认值）：")
        w("")
        w("| 列 | 类型 |")
        w("|---|---|")
        for c in rest:
            w("| `%s` | %s%s |" % (c["col"], ts(c), nulltag(c)))
            stat["new_only"] += 1
    w("")

w("## 统计")
w("")
w("| 动作 | 列数 |")
w("|---|---|")
for k, v in stat.items():
    if k == "new_only":
        continue
    w("| %s | %d |" % (ACTION_LABEL[k], v))
w("| 新库独有（保留） | %d |" % stat["new_only"])

txt = "\n".join(out)
open("_field_map.md", "w", encoding="utf-8").write(txt)
print(txt[:1500])
print("...")
print("\n统计：", stat)
print("已写出 _field_map.md，共 %d 行" % len(out))
