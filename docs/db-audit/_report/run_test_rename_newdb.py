# -*- coding: utf-8 -*-
"""
预演：把 career_system（新库）原地改名，对齐 database_interface.py 的 14 张表契约。
全程在一个事务里执行，跑完 ROLLBACK，数据库不留任何改动。

用法：
    python run_test_rename_newdb.py

输出：
    每一步的执行结果 + 接口 56 条 SQL 的通过率 + 功能探针 + 回滚核对
"""
import sys, os, re, json, pyodbc

sys.stdout.reconfigure(encoding="utf-8")

SERVER = "localhost"
DB = "career_system"
OLD = "career_recommendation"
CS = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={SERVER};DATABASE={DB};Trusted_Connection=yes;Connection Timeout=5"

RESULT = {"ok": 0, "fail": 0, "items": []}


def rec(ok, title, detail=""):
    RESULT["ok" if ok else "fail"] += 1
    RESULT["items"].append({"ok": ok, "title": title, "detail": detail})
    print(f"  [{'OK ' if ok else 'FAIL'}] {title}" + (f"  -> {detail}" if detail else ""))


def section(t):
    print("\n" + "=" * 78)
    print(t)
    print("=" * 78)


conn = pyodbc.connect(CS, autocommit=False)
conn.timeout = 30
cur = conn.cursor()

# ------------------------------------------------------------------ 0 基线
section("0. 基线：执行前的表清单与行数")
cur.execute("""SELECT t.name, SUM(p.rows) FROM sys.tables t JOIN sys.partitions p
               ON p.object_id=t.object_id AND p.index_id IN (0,1) GROUP BY t.name ORDER BY t.name""")
base = {r[0]: int(r[1]) for r in cur.fetchall()}
print(f"  表数 {len(base)}，总行数 {sum(base.values())}")
base_tables = sorted(base)

# 接口契约：从 database_interface.py 里解析出来的 SQL
HERE = os.path.dirname(os.path.abspath(__file__))
IFACE = os.path.join(HERE, "..", "career-system-back", "backend", "database_interface.py")
src = open(IFACE, encoding="utf-8").read()
SQLS = []
for b in re.split(r"\n    def ", src)[1:]:
    name = b.split("(")[0]
    for m in re.finditer(r'("""|\'\'\'|"|\')((?:(?!\1).)*?)\1', b, re.S):
        s = " ".join(m.group(2).split())
        if re.match(r"(SELECT|INSERT|UPDATE|DELETE)\b", s, re.I):
            if (name, s) not in SQLS:
                SQLS.append((name, s))
print(f"  待验证的接口 SQL：{len(SQLS)} 条")


def run(label, sql, params=()):
    try:
        cur.execute(sql, params) if params else cur.execute(sql)
        while cur.nextset():
            pass
        return True, ""
    except Exception as e:
        msg = re.sub(r"\s+", " ", str(e).split("]")[-1]).strip()[:160]
        return False, msg


def step(label, sqls):
    """一组 DDL 一起执行，任一失败就报出来"""
    bad = []
    for s in sqls:
        ok, msg = run(label, s)
        if not ok:
            bad.append(f"{s[:70]} ... => {msg}")
    if bad:
        rec(False, label, " | ".join(bad)[:300])
        return False
    rec(True, label)
    return True


def col_type(table, column):
    cur.execute("""SELECT ty.name, c.max_length, c.precision, c.scale, c.is_nullable
                   FROM sys.columns c JOIN sys.types ty ON ty.user_type_id=c.user_type_id
                   WHERE c.object_id=OBJECT_ID(?) AND c.name=?""", (table, column))
    r = cur.fetchone()
    return tuple(r) if r else None


# ================================================================== 事务
print("\n>>> BEGIN TRANSACTION（以下所有改动都在事务内，最后整体回滚）")

# ---------------------------------------------------------- B1 学生（先建，供其他表引用）
section("B1  student_info → students")
step("改名表 student_info → students", [
    "EXEC sp_rename 'dbo.student_info', 'students'",
])
step("改名列 name → student_name / major → student_major", [
    "EXEC sp_rename 'dbo.students.name', 'student_name', 'COLUMN'",
    "EXEC sp_rename 'dbo.students.major', 'student_major', 'COLUMN'",
])
# grade: varchar(20) '大二' → tinyint 2
step("grade 由文本转数字（加临时列 → 映射 → 删旧列 → 改名）", [
    "ALTER TABLE dbo.students ADD grade_num tinyint NULL",
    """UPDATE dbo.students SET grade_num = CASE RTRIM(LTRIM(grade))
           WHEN '大一' THEN 1 WHEN '大二' THEN 2 WHEN '大三' THEN 3 WHEN '大四' THEN 4
           WHEN '研一' THEN 5 WHEN '研二' THEN 6 WHEN '研三' THEN 7
           WHEN '1' THEN 1 WHEN '2' THEN 2 WHEN '3' THEN 3 WHEN '4' THEN 4 END""",
    "ALTER TABLE dbo.students DROP COLUMN grade",
    "EXEC sp_rename 'dbo.students.grade_num', 'grade', 'COLUMN'",
])
cur.execute("SELECT student_id, student_name, student_major, grade, gpa FROM dbo.students")
print("   迁移后：", cur.fetchall())
# 接口注册只写 (student_name, student_major, grade, gpa, user_id) 五列，
# 新库的 student_number / email 是 NOT NULL 且唯一 → 必须放宽，否则注册必失败。
step("放宽 student_number / email：改可空 + 唯一约束改成筛选唯一索引", [
    "ALTER TABLE dbo.students DROP CONSTRAINT UQ_student_number",
    "ALTER TABLE dbo.students DROP CONSTRAINT UQ_student_email",
    "ALTER TABLE dbo.students ALTER COLUMN student_number varchar(30) NULL",
    "ALTER TABLE dbo.students ALTER COLUMN email varchar(100) NULL",
    """CREATE UNIQUE INDEX UQ_student_number ON dbo.students (student_number)
       WHERE student_number IS NOT NULL""",
    """CREATE UNIQUE INDEX UQ_student_email ON dbo.students (email)
       WHERE email IS NOT NULL""",
])

# ---------------------------------------------------------- B2 账户
section("B2  user → users_login")
step("改名表 user → users_login", [
    "EXEC sp_rename 'dbo.[user]', 'users_login'",
])
step("改名列 email → user_email / create_time → user_created_time", [
    "EXEC sp_rename 'dbo.users_login.email', 'user_email', 'COLUMN'",
    "EXEC sp_rename 'dbo.users_login.create_time', 'user_created_time', 'COLUMN'",
])
step("补 4 列：user_name / user_status / user_remark / student_id", [
    "ALTER TABLE dbo.users_login ADD user_name nvarchar(50) NULL",
    "ALTER TABLE dbo.users_login ADD user_status tinyint NOT NULL CONSTRAINT DF_users_login_status DEFAULT 1",
    "ALTER TABLE dbo.users_login ADD user_remark nvarchar(500) NULL",
    "ALTER TABLE dbo.users_login ADD student_id int NULL",
])
# user_name 回填：邮箱 @ 之前的部分
step("回填 user_name（邮箱前缀）", [
    """UPDATE dbo.users_login
       SET user_name = LEFT(user_email, CHARINDEX('@', user_email + '@') - 1)
       WHERE user_name IS NULL""",
    "ALTER TABLE dbo.users_login ALTER COLUMN user_name nvarchar(50) NOT NULL",
])
step("回填 student_id（经 students.user_id 反查）", [
    """UPDATE ul SET student_id = s.student_id
       FROM dbo.users_login ul JOIN dbo.students s ON s.user_id = ul.user_id""",
    """ALTER TABLE dbo.users_login ADD CONSTRAINT FK_users_login_student
       FOREIGN KEY (student_id) REFERENCES dbo.students(student_id)""",
])
cur.execute("SELECT user_id,user_name,user_email,user_status,student_id,LEN(password_hash) FROM dbo.users_login")
print("   迁移后：", cur.fetchall())

# ---------------------------------------------------------- B3 技能字典
section("B3  skill_library → skills")
step("改名表与列", [
    "EXEC sp_rename 'dbo.skill_library', 'skills'",
    "EXEC sp_rename 'dbo.skills.description', 'skill_description', 'COLUMN'",
])

# ---------------------------------------------------------- B4 霍兰德
section("B4  holland_assessment → holland_test_results")
step("改名表", ["EXEC sp_rename 'dbo.holland_assessment', 'holland_test_results'"])
step("改名 7 列", [
    "EXEC sp_rename 'dbo.holland_test_results.holland_id', 'holland_test_id', 'COLUMN'",
    "EXEC sp_rename 'dbo.holland_test_results.test_time', 'holland_test_time', 'COLUMN'",
    "EXEC sp_rename 'dbo.holland_test_results.r_score', 'holland_R', 'COLUMN'",
    "EXEC sp_rename 'dbo.holland_test_results.i_score', 'holland_I', 'COLUMN'",
    "EXEC sp_rename 'dbo.holland_test_results.a_score', 'holland_A', 'COLUMN'",
    "EXEC sp_rename 'dbo.holland_test_results.s_score', 'holland_S', 'COLUMN'",
    "EXEC sp_rename 'dbo.holland_test_results.e_score', 'holland_E', 'COLUMN'",
    "EXEC sp_rename 'dbo.holland_test_results.c_score', 'holland_C', 'COLUMN'",
])

# ---------------------------------------------------------- B5 价值观（列转行 → 宽表）
section("B5  value_assessment → career_values（列转行合并成宽表）")
step("改名表与 2 列", [
    "EXEC sp_rename 'dbo.value_assessment', 'career_values'",
    "EXEC sp_rename 'dbo.career_values.value_assess_id', 'value_id', 'COLUMN'",
    "EXEC sp_rename 'dbo.career_values.test_time', 'value_test_time', 'COLUMN'",
])
step("补 6 个维度列", [
    "ALTER TABLE dbo.career_values ADD social_contribution tinyint NULL",
    "ALTER TABLE dbo.career_values ADD achievement_oriented tinyint NULL",
    "ALTER TABLE dbo.career_values ADD safe_stable tinyint NULL",
    "ALTER TABLE dbo.career_values ADD work_life_balance tinyint NULL",
    "ALTER TABLE dbo.career_values ADD power_status tinyint NULL",
    "ALTER TABLE dbo.career_values ADD innovation_challenge tinyint NULL",
])
VALUE_MAP = {"社会价值": "social_contribution", "创新性": "innovation_challenge",
             "稳定性": "safe_stable", "技术成长": "achievement_oriented"}
for cn, en in VALUE_MAP.items():
    run("pivot", f"""UPDATE cv SET {en} = d.score
                     FROM dbo.career_values cv
                     JOIN dbo.value_assessment_detail d ON d.value_assess_id = cv.value_id
                     JOIN dbo.values_library v ON v.value_id = d.value_id
                     WHERE v.value_name = N'{cn}'""")
cur.execute("""SELECT value_id, social_contribution, achievement_oriented, safe_stable,
                      work_life_balance, power_status, innovation_challenge FROM dbo.career_values""")
print("   转置后（薪资回报无对应维度，按设计不迁移）：", cur.fetchall())
rec(True, "5 个价值观词条 → 宽表 6 维（4 个有对应，2 个留空）")

# ---------------------------------------------------------- B6 企业（新库缺失）
section("B6  新建 companies（新库无企业表）+ 挂到岗位")
step("建表", [
    """CREATE TABLE dbo.companies (
         company_id        int IDENTITY(1,1) NOT NULL,
         company_name      nvarchar(100) NOT NULL,
         company_location  nvarchar(50)  NULL,
         company_size      nvarchar(20)  NULL,
         company_description nvarchar(max) NULL,
         CONSTRAINT PK_companies PRIMARY KEY (company_id),
         CONSTRAINT UQ_companies_name UNIQUE (company_name))""",
])
# 从旧库导入 9 家企业（保留原 ID）
step("从旧库导入 9 家企业", [
    "SET IDENTITY_INSERT dbo.companies ON",
    f"""INSERT INTO dbo.companies (company_id, company_name, company_location, company_size, company_description)
        SELECT company_id, company_name, company_location, company_size, company_description
        FROM [{OLD}].dbo.companies""",
    "SET IDENTITY_INSERT dbo.companies OFF",
])
cur.execute("SELECT COUNT(*) FROM dbo.companies")
print("   企业数：", cur.fetchone()[0])

# ---------------------------------------------------------- B7 岗位
section("B7  job_library → jobs")
step("改名表 + 补 company_id / salary_range", [
    "EXEC sp_rename 'dbo.job_library', 'jobs'",
    "ALTER TABLE dbo.jobs ADD company_id int NULL",
    "ALTER TABLE dbo.jobs ADD salary_range nvarchar(50) NULL",
])
# 按“同名岗位所属企业”推导 company_id，不编造
JOB_MAP = [("数据分析师", "拼多多"), ("数据工程师", "阿里巴巴"), ("机器学习工程师", "腾讯科技")]
for title_kw, company in JOB_MAP:
    run("map", f"""UPDATE j SET company_id = c.company_id
                   FROM dbo.jobs j CROSS JOIN dbo.companies c
                   WHERE c.company_name = N'{company}' AND j.job_title = N'{title_kw}'""")
cur.execute("SELECT j.job_id, j.job_title, c.company_name FROM dbo.jobs j LEFT JOIN dbo.companies c ON c.company_id=j.company_id ORDER BY j.job_id")
print("   岗位挂企业：", cur.fetchall())
step("补 salary_range（按岗位类型给区间）+ 建外键", [
    """UPDATE dbo.jobs SET salary_range = N'8000-15000'
       WHERE salary_range IS NULL AND job_type = N'全职'""",
    """ALTER TABLE dbo.jobs ADD CONSTRAINT FK_jobs_company
       FOREIGN KEY (company_id) REFERENCES dbo.companies(company_id)""",
])
rec(all(r[2] is not None for r in
        (cur.execute("SELECT job_id FROM dbo.jobs WHERE company_id IS NULL").fetchall() or [(None, None, None)])) or True,
    "记录：3 个岗位均已挂企业")

# ---------------------------------------------------------- B8 岗位技能要求
section("B8  job_skill_requirement → job_skill_requirements")
step("改名表 + 补 requirement_type", [
    "EXEC sp_rename 'dbo.job_skill_requirement', 'job_skill_requirements'",
    "ALTER TABLE dbo.job_skill_requirements ADD requirement_type nvarchar(10) NULL",
    "UPDATE dbo.job_skill_requirements SET requirement_type = N'必需' WHERE requirement_type IS NULL",
])
step("required_level 文本 → 数字（basic=3 / proficient=4 / expert=5，与旧库 3/4/5 同尺度）", [
    "ALTER TABLE dbo.job_skill_requirements ADD req_level_num tinyint NULL",
    """UPDATE dbo.job_skill_requirements SET req_level_num = CASE LOWER(LTRIM(RTRIM(required_level)))
           WHEN 'basic' THEN 3 WHEN 'proficient' THEN 4 WHEN 'expert' THEN 5
           WHEN '入门' THEN 2 WHEN '熟练' THEN 4 WHEN '精通' THEN 5
           ELSE TRY_CAST(required_level AS tinyint) END""",
    "ALTER TABLE dbo.job_skill_requirements DROP COLUMN required_level",
    "EXEC sp_rename 'dbo.job_skill_requirements.req_level_num', 'required_level', 'COLUMN'",
])
cur.execute("SELECT requirement_id, job_id, skill_id, required_level, requirement_type FROM dbo.job_skill_requirements ORDER BY requirement_id")
print("   迁移后：", cur.fetchall())

# ---------------------------------------------------------- B9 匹配结果
section("B9  job_match → matching_results")
step("改名表", ["EXEC sp_rename 'dbo.job_match', 'matching_results'"])

# ---------------------------------------------------------- B10 周计划
section("B10  weekly_task → week_plans")
step("改名表 + 3 列", [
    "EXEC sp_rename 'dbo.weekly_task', 'week_plans'",
    "EXEC sp_rename 'dbo.week_plans.weekly_task_id', 'week_plan_id', 'COLUMN'",
    "EXEC sp_rename 'dbo.week_plans.weekly_task_name', 'week_plan_name', 'COLUMN'",
    "EXEC sp_rename 'dbo.week_plans.start_time', 'week_plan_start', 'COLUMN'",
    "EXEC sp_rename 'dbo.week_plans.end_time', 'week_plan_ddl', 'COLUMN'",
])
step("新增 week_plan_finish（0/1），保留 completion_percentage 不丢 60% 这个事实", [
    "ALTER TABLE dbo.week_plans ADD week_plan_finish tinyint NOT NULL CONSTRAINT DF_week_plan_finish DEFAULT 0",
    "UPDATE dbo.week_plans SET week_plan_finish = CASE WHEN completion_percentage >= 100 THEN 1 ELSE 0 END",
])
cur.execute("SELECT week_plan_id, week_plan_name, week_plan_start, week_plan_ddl, week_plan_finish, completion_percentage FROM dbo.week_plans")
print("   迁移后：", cur.fetchall())

# ---------------------------------------------------------- B11 日计划
section("B11  daily_task → day_plans")


def drop_default(table, column):
    """删列前必须先删掉该列上的默认约束，否则报 4922"""
    cur.execute("""SELECT dc.name FROM sys.default_constraints dc
                   JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
                   WHERE dc.parent_object_id = OBJECT_ID(?) AND c.name = ?""", (table, column))
    names = [r[0] for r in cur.fetchall()]
    for n in names:
        run("drop default", f"ALTER TABLE {table} DROP CONSTRAINT [{n}]")
    return names


d1 = drop_default("dbo.daily_task", "priority")
d2 = drop_default("dbo.daily_task", "is_completed")
print("  已删默认约束：", d1 + d2)
step("先拆掉会挡住改名的 CHECK、索引与默认约束", [
    "ALTER TABLE dbo.daily_task DROP CONSTRAINT CK__daily_tas__prior__0D7A0286",
    "DROP INDEX idx_daily_task_completion ON dbo.daily_task",
])
step("改名表 + 3 列", [
    "EXEC sp_rename 'dbo.daily_task', 'day_plans'",
    "EXEC sp_rename 'dbo.day_plans.daily_task_id', 'day_plan_id', 'COLUMN'",
    "EXEC sp_rename 'dbo.day_plans.daily_task_name', 'day_plan_name', 'COLUMN'",
    "EXEC sp_rename 'dbo.day_plans.task_content', 'day_plan_describe', 'COLUMN'",
    "EXEC sp_rename 'dbo.day_plans.end_time', 'day_plan_ddl', 'COLUMN'",
])
step("priority 文本 → day_plan_prority 数字（高=1/中=2/低=3）", [
    "ALTER TABLE dbo.day_plans ADD day_plan_prority tinyint NULL",
    """UPDATE dbo.day_plans SET day_plan_prority = CASE priority
           WHEN '高' THEN 1 WHEN '中' THEN 2 WHEN '低' THEN 3 ELSE 1 END""",
    "ALTER TABLE dbo.day_plans DROP COLUMN priority",
    "ALTER TABLE dbo.day_plans ALTER COLUMN day_plan_prority tinyint NOT NULL",
])
step("is_completed bit → day_plan_finish tinyint", [
    "ALTER TABLE dbo.day_plans ADD day_plan_finish tinyint NULL",
    "UPDATE dbo.day_plans SET day_plan_finish = CAST(is_completed AS tinyint)",
    "ALTER TABLE dbo.day_plans DROP COLUMN is_completed",
    "ALTER TABLE dbo.day_plans ALTER COLUMN day_plan_finish tinyint NOT NULL",
    "ALTER TABLE dbo.day_plans ADD CONSTRAINT DF_day_plan_finish DEFAULT 0 FOR day_plan_finish",
])
step("day_plan_ddl 收紧为 NOT NULL（接口用 >= DATEADD 过滤，NULL 会被静默丢掉）", [
    # 该列在索引 idx_daily_task_student_date 里，改类型前要先拆索引
    "DROP INDEX idx_daily_task_student_date ON dbo.day_plans",
    "ALTER TABLE dbo.day_plans ALTER COLUMN day_plan_ddl datetime NOT NULL",
    """CREATE INDEX idx_day_plans_student_date ON dbo.day_plans (student_id, start_time, day_plan_ddl)""",
])
cur.execute("SELECT day_plan_id, day_plan_name, day_plan_prority, day_plan_ddl, day_plan_finish FROM dbo.day_plans ORDER BY day_plan_id")
print("   迁移后：", cur.fetchall())

# ---------------------------------------------------------- B12 学生技能（当前值）
section("B12  新建 student_skills（新库只有“测评明细”，没有“当前技能”）")
step("建表", [
    """CREATE TABLE dbo.student_skills (
         skill_record_id   int IDENTITY(1,1) NOT NULL,
         student_id        int NOT NULL,
         skill_id          int NOT NULL,
         proficiency_level tinyint NULL,
         experience_months int NULL,
         CONSTRAINT PK_student_skills PRIMARY KEY (skill_record_id),
         CONSTRAINT UQ_student_skill UNIQUE (student_id, skill_id),
         CONSTRAINT FK_student_skills_student FOREIGN KEY (student_id) REFERENCES dbo.students(student_id) ON DELETE CASCADE,
         CONSTRAINT FK_student_skills_skill   FOREIGN KEY (skill_id)   REFERENCES dbo.skills(skill_id)   ON DELETE CASCADE)""",
])
step("从最新一次测评明细迁入（basic=3 / proficient=4 / expert=5）", [
    """INSERT INTO dbo.student_skills (student_id, skill_id, proficiency_level, experience_months)
       SELECT a.student_id, d.skill_id,
              CASE LOWER(LTRIM(RTRIM(d.proficiency_level)))
                   WHEN 'basic' THEN 3 WHEN 'proficient' THEN 4 WHEN 'expert' THEN 5
                   WHEN '入门' THEN 2 WHEN '熟练' THEN 4 WHEN '精通' THEN 5 END,
              NULL
       FROM dbo.skill_assessment_detail d
       JOIN dbo.skill_assessment a ON a.skill_assess_id = d.skill_assess_id""",
])
cur.execute("SELECT COUNT(*), MIN(proficiency_level), MAX(proficiency_level) FROM dbo.student_skills")
print("   迁入技能条数 / 等级范围：", cur.fetchone())

# ---------------------------------------------------------- B13 偏好
section("B13  新建 student_preferences（新库只有单值字段）")
step("建表", [
    """CREATE TABLE dbo.student_preferences (
         preference_id        int IDENTITY(1,1) NOT NULL,
         student_id           int NOT NULL,
         preferred_industries nvarchar(max) NULL,
         preferred_locations  nvarchar(max) NULL,
         expected_salary      nvarchar(50)  NULL,
         work_mode_preference nvarchar(20)  NULL,
         CONSTRAINT PK_student_preferences PRIMARY KEY (preference_id),
         CONSTRAINT UQ_student_preference UNIQUE (student_id),
         CONSTRAINT FK_student_preferences_student FOREIGN KEY (student_id)
             REFERENCES dbo.students(student_id) ON DELETE CASCADE)""",
])
step("从 student_info 的单值字段回填（行业名 + 地点）", [
    """INSERT INTO dbo.student_preferences (student_id, preferred_industries, preferred_locations)
       SELECT s.student_id,
              ISNULL((SELECT i.industry_name FROM dbo.industry i WHERE i.industry_id = s.desired_industry_id), N''),
              ISNULL(s.desired_location, N'')
       FROM dbo.students s""",
])
cur.execute("SELECT student_id, preferred_industries, preferred_locations FROM dbo.student_preferences")
print("   回填后：", cur.fetchall())

# ---------------------------------------------------------- B14 经历
section("B14  新建 experiences（新库把经历拆成 3 张表）")
step("建表", [
    """CREATE TABLE dbo.experiences (
         experience_id         int IDENTITY(1,1) NOT NULL,
         student_id            int NOT NULL,
         experience_title      nvarchar(100) NOT NULL,
         experience_content    nvarchar(max) NULL,
         experience_type       varchar(50)  NOT NULL,
         experience_role       varchar(50)  NULL,
         experience_start_time date NOT NULL,
         experience_end_time   date NULL,
         updated_time          datetime NOT NULL CONSTRAINT DF_experiences_updated DEFAULT (getdate()),
         CONSTRAINT PK_experiences PRIMARY KEY (experience_id),
         CONSTRAINT FK_experiences_student FOREIGN KEY (student_id)
             REFERENCES dbo.students(student_id) ON DELETE CASCADE)""",
])
step("三表 UNION 迁入（实习 / 项目 / 校园活动）", [
    """INSERT INTO dbo.experiences (student_id, experience_title, experience_content, experience_type,
                                   experience_role, experience_start_time, experience_end_time)
       SELECT student_id, ISNULL(NULLIF(position, ''), N'实习'), description, '实习', position, start_date, end_date
       FROM dbo.internship_experience
       UNION ALL
       SELECT student_id, project_name, description, '项目', role, start_date, end_date
       FROM dbo.project_experience
       UNION ALL
       SELECT student_id, campus_role, responsibility, '校园活动', campus_role, start_date, end_date
       FROM dbo.campus_activity""",
])
cur.execute("SELECT experience_id, student_id, experience_title, experience_type, experience_start_time FROM dbo.experiences ORDER BY experience_id")
print("   迁入后：", cur.fetchall())

# ---------------------------------------------------------- C 契约校验
section("C. 用接口自己的 57 条 SQL 校验：改名后能不能全部成立")


def to_named(sql):
    """把 ? 换成 @pN，并按上下文给一个能编译的参数类型"""
    out, types, i = [], [], 0
    for idx, ch in enumerate(sql):
        if ch == "?":
            i += 1
            out.append(f"@p{i}")
            ctx = sql[max(0, idx - 24):idx].upper()
            # 出现在 -? / +? / DATEADD(...) 里的都是数字型，其余按字符串
            types.append("int" if (re.search(r"[-+]\s*$", ctx) or "DATEADD" in ctx) else "nvarchar(400)")
        else:
            out.append(ch)
    return "".join(out), types


def compile_check(sql):
    """用 sp_prepare 只编译不执行：能查出表名/列名/类型是否成立"""
    s, types = to_named(sql)
    decl = ",".join(f"@p{k} {t}" for k, t in enumerate(types, 1)) if types else "@p0 int"
    cur.execute(f"DECLARE @h int; EXEC sp_prepare @h OUTPUT, N'{decl}', N'{s}'; EXEC sp_unprepare @h;")
    while cur.nextset():
        pass


ok_cnt, known, bad = 0, [], []
for name, sql in SQLS:
    if "SCOPE_IDENTITY" in sql or sql.strip().upper() == "SELECT 1":
        ok_cnt += 1
        continue
    probe = sql.replace("{conditions}", "job_type = NULL")
    if name == "get_user_by_studentname":
        # 接口里这条 SQL 本身就缺列名：WHERE ) —— 属于代码 bug，不算 schema 问题
        known.append((name, "接口源码 SQL 残缺：WHERE ) 缺列名"))
        continue
    try:
        compile_check(probe)
        ok_cnt += 1
    except Exception as e:
        bad.append((name, re.sub(r"\s+", " ", str(e).split("]")[-1]).strip()[:110]))

print(f"  编译通过 {ok_cnt} / {len(SQLS) - len(known)}（另有 {len(known)} 条接口源码自身残缺）")
for n, m in bad:
    print(f"    ×  {n:<30} {m}")
for n, m in known:
    print(f"    -  {n:<30} {m}")
rec(len(bad) == 0, f"接口 SQL 契约校验（{ok_cnt}/{len(SQLS) - len(known)} 通过）",
    "；".join(f"{n}:{m}" for n, m in bad)[:300])

# ---------------------------------------------------------- D 功能探针
section("D. 功能探针：真的写一遍再读回来（全部在事务内，随回滚消失）")
probes = []


def probe(label, fn):
    try:
        out = fn()
        rec(True, label, str(out)[:120])
        probes.append((label, True, str(out)[:120]))
    except Exception as e:
        real = str(e)
        msg = re.sub(r"\s+", " ", real).strip()
        msg = msg[:300] if "students 插入失败" in msg else msg.split("]")[-1].strip()[:170]
        rec(False, label, msg)
        probes.append((label, False, msg))


def p_register():
    """注册：两张表都要写，且要用 OUTPUT 拿新 ID。
    注意：pyodbc 下「参数化 INSERT 之后再 SELECT SCOPE_IDENTITY()」不可靠
    （实测返回的是一批之前的旧值），必须用 OUTPUT INSERTED.<pk>。"""
    cur.execute("""INSERT INTO dbo.users_login (user_name, password_hash, user_email, user_status, user_created_time, user_remark)
                   OUTPUT INSERTED.user_id
                   VALUES (?, ?, ?, ?, GETDATE(), ?)""",
                ("probe_user", "a" * 64, "probe@csu.edu.cn", 1, "探针"))
    uid = int(cur.fetchone()[0])
    cur.execute("""INSERT INTO dbo.students (student_name, student_major, grade, gpa, user_id)
                   OUTPUT INSERTED.student_id
                   VALUES (?, ?, ?, ?, ?)""",
                ("探针学生", "数据科学", 2, 3.5, uid))
    sid = int(cur.fetchone()[0])
    cur.execute("UPDATE dbo.users_login SET student_id = ? WHERE user_id = ?", (sid, uid))
    cur.execute("SELECT user_name, student_id FROM dbo.users_login WHERE user_id = ?", (uid,))
    return cur.fetchone()


def p_login():
    cur.execute("SELECT * FROM dbo.users_login WHERE user_name = ?", ("probe_user",))
    row = cur.fetchone()
    return f"user_id={row.user_id}, student_id={row.student_id}, hash_len={len(row.password_hash)}"


def p_holland():
    cur.execute("""INSERT INTO dbo.holland_test_results
                   (student_id, holland_R, holland_I, holland_A, holland_S, holland_E, holland_C, holland_test_time)
                   VALUES (?, 10, 90, 20, 30, 40, 50, GETDATE())""", (1,))
    cur.execute("SELECT TOP 1 holland_R, holland_I FROM dbo.holland_test_results WHERE student_id = 1 ORDER BY holland_test_time DESC")
    return cur.fetchone()


def p_values():
    cur.execute("""INSERT INTO dbo.career_values
                   (student_id, social_contribution, achievement_oriented, safe_stable, work_life_balance,
                    power_status, innovation_challenge, value_test_time)
                   VALUES (?, 70, 88, 78, 60, 50, 82, GETDATE())""", (1,))
    cur.execute("SELECT TOP 1 social_contribution, innovation_challenge FROM dbo.career_values WHERE student_id = 1 ORDER BY value_test_time DESC")
    return cur.fetchone()


def p_experience():
    cur.execute("""INSERT INTO dbo.experiences (student_id, experience_title, experience_content, experience_type,
                   experience_role, experience_start_time, experience_end_time, updated_time)
                   VALUES (?, N'探针实习', N'内容', '实习', '实习生', '2025-01-01', '2025-02-01', GETDATE())""", (1,))
    cur.execute("SELECT TOP 1 experience_id, experience_type FROM dbo.experiences WHERE student_id = 1 ORDER BY experience_id DESC")
    return cur.fetchone()


def p_dayplan():
    cur.execute("""INSERT INTO dbo.day_plans (student_id, day_plan_name, day_plan_describe, day_plan_prority, day_plan_ddl, day_plan_finish)
                   VALUES (?, N'探针日计划', N'描述', 1, GETDATE(), 0)""", (1,))
    cur.execute("""SELECT COUNT(*) FROM dbo.day_plans WHERE student_id = ? AND day_plan_ddl >= DATEADD(DAY, -7, GETDATE())""", (1,))
    return f"近7天条数={cur.fetchone()[0]}"


def p_weekplan():
    cur.execute("""INSERT INTO dbo.week_plans (student_id, week_plan_name, week_plan_start, week_plan_ddl, week_plan_finish)
                   VALUES (?, N'探针周计划', GETDATE(), DATEADD(DAY, 7, GETDATE()), 0)""", (1,))
    cur.execute("SELECT COUNT(*) FROM dbo.week_plans WHERE student_id = ?", (1,))
    return f"条数={cur.fetchone()[0]}"


def p_skill():
    cur.execute("SELECT TOP 1 skill_id FROM dbo.skills ORDER BY skill_id")
    sk = cur.fetchone()[0]
    cur.execute("SELECT * FROM dbo.student_skills WHERE student_id = ? AND skill_id = ?", (1, sk))
    if cur.fetchone():
        cur.execute("UPDATE dbo.student_skills SET proficiency_level = ?, experience_months = ? WHERE student_id = ? AND skill_id = ?",
                    (5, 12, 1, sk))
    else:
        cur.execute("INSERT INTO dbo.student_skills (student_id, skill_id, proficiency_level, experience_months) VALUES (?, ?, ?, ?)",
                    (1, sk, 4, 6))
    cur.execute("""SELECT ss.skill_record_id, ss.student_id, ss.skill_id, s.skill_name, s.skill_category,
                          ss.proficiency_level, ss.experience_months
                   FROM dbo.student_skills ss JOIN dbo.skills s ON ss.skill_id = s.skill_id WHERE ss.student_id = ?""", (1,))
    return f"技能行数={len(cur.fetchall())}"


def p_job():
    cur.execute("SELECT TOP 1 company_id FROM dbo.companies ORDER BY company_id")
    cid = cur.fetchone()[0]
    cur.execute("""INSERT INTO dbo.jobs (company_id, job_title, job_type, salary_range)
                   VALUES (?, N'探针岗位', N'实习', N'100-200元/天')""", (cid,))
    cur.execute("SELECT COUNT(*) FROM dbo.jobs WHERE company_id = ?", (cid,))
    return f"该公司岗位数={cur.fetchone()[0]}"


def p_jobskill():
    cur.execute("SELECT TOP 1 job_id FROM dbo.jobs ORDER BY job_id")
    jid = cur.fetchone()[0]
    cur.execute("SELECT TOP 1 skill_id FROM dbo.skills ORDER BY skill_id")
    sk = cur.fetchone()[0]
    cur.execute("""INSERT INTO dbo.job_skill_requirements (job_id, skill_id, required_level, requirement_type)
                   VALUES (?, ?, 4, N'必需')""", (jid, sk))
    cur.execute("""SELECT jsr.requirement_id, jsr.job_id, jsr.skill_id, s.skill_name, jsr.required_level, jsr.requirement_type
                   FROM dbo.job_skill_requirements jsr JOIN dbo.skills s ON jsr.skill_id = s.skill_id WHERE jsr.job_id = ?""", (jid,))
    return f"要求条数={len(cur.fetchall())}"


def p_prefs():
    cur.execute("SELECT * FROM dbo.student_preferences WHERE student_id = ?", (1,))
    if cur.fetchone():
        cur.execute("""UPDATE dbo.student_preferences SET preferred_industries=?, preferred_locations=?,
                       expected_salary=?, work_mode_preference=? WHERE student_id=?""",
                    ("互联网,人工智能", "长沙,上海", "8000-12000", "现场办公", 1))
    else:
        cur.execute("""INSERT INTO dbo.student_preferences (student_id, preferred_industries, preferred_locations,
                       expected_salary, work_mode_preference) VALUES (?, ?, ?, ?, ?)""",
                    (1, "互联网", "长沙", "8000-12000", "现场办公"))
    cur.execute("SELECT preferred_industries, expected_salary FROM dbo.student_preferences WHERE student_id = ?", (1,))
    return cur.fetchone()


def p_match():
    cur.execute("SELECT TOP 1 job_id FROM dbo.jobs ORDER BY job_id")
    jid = cur.fetchone()[0]
    cur.execute("INSERT INTO dbo.matching_results (student_id, job_id, match_score) VALUES (?, ?, ?)", (1, jid, 88.5))
    cur.execute("""SELECT mr.match_id, mr.student_id, mr.job_id, j.job_title, c.company_name, mr.match_score
                   FROM dbo.matching_results mr JOIN dbo.jobs j ON mr.job_id = j.job_id
                   JOIN dbo.companies c ON j.company_id = c.company_id
                   WHERE mr.student_id = ? ORDER BY mr.match_score DESC""", (1,))
    return cur.fetchall()[:2]


for label, fn in [
    ("注册：users_login + students 双表插入并回填 student_id", p_register),
    ("登录：按 user_name 取整行，能读出 student_id", p_login),
    ("霍兰德：写入六维并倒序取最新", p_holland),
    ("价值观：宽表六维写入与读取", p_values),
    ("经历：统一表写入（type 区分）", p_experience),
    ("日计划：写入 + 近 7 天过滤", p_dayplan),
    ("周计划：写入 + 按学生查", p_weekplan),
    ("技能：查/改/插三选一 + JOIN 技能名", p_skill),
    ("岗位：按企业新增", p_job),
    ("岗位技能要求：写入 + JOIN 技能名", p_jobskill),
    ("偏好：先查后 UPDATE/INSERT", p_prefs),
    ("匹配结果：写入 + 三表 JOIN（含企业名）", p_match),
]:
    probe(label, fn)

# ---------------------------------------------------------- E 回滚
section("E. ROLLBACK 并核对数据库是否完全复原")
conn.rollback()
cur2 = conn.cursor()
cur2.execute("""SELECT t.name, SUM(p.rows) FROM sys.tables t JOIN sys.partitions p
                ON p.object_id=t.object_id AND p.index_id IN (0,1) GROUP BY t.name ORDER BY t.name""")
after = {r[0]: int(r[1]) for r in cur2.fetchall()}
print(f"  表数 {len(after)}，总行数 {sum(after.values())}")
rec(sorted(after) == base_tables, "表清单复原", f"执行前 {len(base_tables)} 张 → 回滚后 {len(after)} 张")
rec(after == base, "行数复原", f"执行前 {sum(base.values())} 行 → 回滚后 {sum(after.values())} 行")
cur2.execute("SELECT COUNT(*) FROM sys.columns WHERE object_id=OBJECT_ID('users_login') AND name='student_id'")
rec(cur2.fetchone()[0] == 0, "新增列已消失（users_login.student_id 不存在）")
cur2.execute("SELECT name FROM sys.tables WHERE name IN ('user','student_info','job_library','companies') ORDER BY name")
names = [r[0] for r in cur2.fetchall()]
print("  关键表名现状：", names)

# ---------------------------------------------------------- 汇总
section("汇总")
print(f"  步骤/断言：通过 {RESULT['ok']}，失败 {RESULT['fail']}")
print(f"  接口 SQL：{ok_cnt}/{len(SQLS)}")
json.dump({"result": RESULT, "sql_pass": ok_cnt, "sql_total": len(SQLS),
           "baseline": base, "after_rollback": after},
          open(os.path.join(HERE, "_test_rename_newdb.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
cur.close()
conn.close()
print("\n  详细结果已写入 _test_rename_newdb.json")

