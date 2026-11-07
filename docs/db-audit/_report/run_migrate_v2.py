# -*- coding: utf-8 -*-
"""
新库对齐 + 数据迁移（重做版，用法/证据驱动）
=============================================
目标库：career_system（新库，原地改造）   数据源：career_recommendation（旧库，只读）
方式：单事务执行全部 DDL + 迁数 + 校验，最后 ROLLBACK，真实数据零改动。

判定依据（不是名字相似度）：
  A. 接口对 12/14 张表用 SELECT *，行转 dict 后上层按键取值 => 契约 = 旧表全部列
  B. 推荐算法对 grade / required_level / proficiency_level 做数值比较与算术
     (internship_recommender.py: student_level >= required_level, student_level/required_level*0.6)
     => 这些列必须是数字，新库的中文/英文枚举要转回数字
  C. 老账号不迁 => students.user_id 必须可空，唯一约束必须去掉（唯一约束只允许一个 NULL）
  D. 旧库这些表 0 行：holland_tests / work_values / week_plans / day_plans / experiences
     => 只对齐结构，无数据迁移
"""
import sys, json, traceback, pyodbc
sys.stdout.reconfigure(encoding="utf-8")

NEW, OLD = "career_system", "career_recommendation"
CS = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;DATABASE=%s;Trusted_Connection=yes"

conn = pyodbc.connect(CS % NEW)
conn.autocommit = False
cur = conn.cursor()

ro = pyodbc.connect(CS % OLD)
ro.autocommit = True
roc = ro.cursor()

PASS, FAIL = [], []
def ok(name, cond, extra=""):
    (PASS if cond else FAIL).append(name)
    print(("  [OK]  " if cond else "  [FAIL]") + name + (("  -> " + str(extra)) if extra and not cond else ""))

def exe(sql, params=()):
    cur.execute(sql, params)

def use(db):
    cur.execute("USE [%s]" % db)

# ---------------- 快照（计数 + 列指纹），用于验证回滚彻底 ----------------
ALL_TABLES = None
def table_list():
    global ALL_TABLES
    use(NEW)
    cur.execute("SELECT name FROM sys.tables ORDER BY name")
    ALL_TABLES = [r[0] for r in cur.fetchall()]
    return ALL_TABLES

def snapshot():
    snap = {}
    for t in table_list():
        use(NEW)
        cur.execute("SELECT COUNT(*) FROM [%s]" % t)
        n = cur.fetchone()[0]
        cur.execute("""SELECT c.name FROM sys.columns c JOIN sys.tables tb ON tb.object_id=c.object_id
                       WHERE tb.name=? ORDER BY c.column_id""", (t,))
        cols = "|".join(r[0] for r in cur.fetchall())
        snap[t] = (n, cols)
    return snap

print("== 改造前快照 ==")
BEFORE = snapshot()
print("   表数 %d，总行数 %d" % (len(BEFORE), sum(v[0] for v in BEFORE.values())))

try:
    exe("BEGIN TRANSACTION")

    # =========================================================
    # 阶段 1：10 张表改名（接口契约名）
    # =========================================================
    print("\n[阶段1] 表改名 10 张")
    table_renames = [
        ('user', 'users_login'), ('student_info', 'students'), ('skill_library', 'skills'),
        ('holland_assessment', 'holland_test_results'), ('value_assessment', 'career_values'),
        ('job_library', 'jobs'), ('job_skill_requirement', 'job_skill_requirements'),
        ('job_match', 'matching_results'), ('weekly_task', 'week_plans'), ('daily_task', 'day_plans'),
    ]
    for o, n in table_renames:
        exe("EXEC sp_rename 'dbo.[%s]', '%s'" % (o, n))
    ok("10 张表改名完成", True)

    # =========================================================
    # 阶段 2：新建 4 张接口必用表（类型照抄旧库）
    # =========================================================
    print("\n[阶段2] 新建 4 张表（companies / student_skills / student_preferences / experiences）")
    exe("""CREATE TABLE companies (
        company_id          int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        company_name        nvarchar(200) NOT NULL,
        company_location    nvarchar(100) NULL,
        company_size        nvarchar(40)  NULL,
        company_description nvarchar(max) NULL)""")
    exe("""CREATE TABLE student_skills (
        skill_record_id   int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        student_id        int NOT NULL,
        skill_id          int NOT NULL,
        proficiency_level tinyint NULL,
        experience_months int NULL)""")
    exe("""CREATE TABLE student_preferences (
        preference_id        int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        student_id           int NOT NULL,
        preferred_industries nvarchar(max) NULL,
        preferred_locations  nvarchar(max) NULL,
        expected_salary      nvarchar(100) NULL,
        work_mode_preference nvarchar(40)  NULL)""")
    exe("""CREATE TABLE experiences (
        experience_id        int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        student_id           int NOT NULL,
        experience_title     nvarchar(200) NOT NULL,
        experience_content   nvarchar(max) NULL,
        experience_type      varchar(50)   NOT NULL,
        experience_role      varchar(50)   NULL,
        experience_start_time date          NOT NULL,
        experience_end_time   date          NULL,
        updated_time          datetime      NULL)""")
    ok("4 张表创建完成", True)

    # =========================================================
    # 阶段 3：users_login 列对齐
    # =========================================================
    print("\n[阶段3] users_login 列对齐")
    exe("EXEC sp_rename 'dbo.[users_login].[email]', 'user_email', 'COLUMN'")
    exe("EXEC sp_rename 'dbo.[users_login].[create_time]', 'user_created_time', 'COLUMN'")
    exe("ALTER TABLE users_login ADD user_name nvarchar(100) NULL")
    exe("ALTER TABLE users_login ADD user_status tinyint NOT NULL CONSTRAINT DF_users_login_status DEFAULT 1")
    exe("ALTER TABLE users_login ADD user_remark nvarchar(1000) NULL")
    exe("ALTER TABLE users_login ALTER COLUMN password_hash nvarchar(255) NOT NULL")
    # 唯一约束 UQ_user_email 依赖 user_email，改类型前必须先解除
    cur.execute("SELECT 1 FROM sys.objects WHERE name='UQ_user_email'")
    has_uq_email = bool(cur.fetchone())
    if has_uq_email:
        exe("ALTER TABLE users_login DROP CONSTRAINT UQ_user_email")
    exe("ALTER TABLE users_login ALTER COLUMN user_email nvarchar(80) NOT NULL")
    if has_uq_email:
        exe("ALTER TABLE users_login ADD CONSTRAINT UQ_user_email UNIQUE (user_email)")
    def drop_default(tbl, col):
        """删掉某列上的默认约束，返回其定义以便重建"""
        cur.execute("""SELECT dc.name, dc.definition FROM sys.default_constraints dc
                       JOIN sys.tables t ON t.object_id=dc.parent_object_id
                       JOIN sys.columns c ON c.object_id=dc.parent_object_id AND c.column_id=dc.parent_column_id
                       WHERE t.name=? AND c.name=?""", (tbl, col))
        r = cur.fetchone()
        if r:
            exe("ALTER TABLE [%s] DROP CONSTRAINT [%s]" % (tbl, r[0]))
            return r[1]
        return None

    d = drop_default("users_login", "user_created_time")
    exe("ALTER TABLE users_login ALTER COLUMN user_created_time datetime2(7) NOT NULL")
    if d:
        exe("ALTER TABLE users_login ADD CONSTRAINT DF_users_login_created DEFAULT %s FOR user_created_time" % d)
    exe("ALTER TABLE users_login ALTER COLUMN last_login_time datetime2(7) NULL")
    # 现有 1 个账号补登录名（取邮箱 @ 前缀），否则接口按 user_name 登录查不到
    exe("""UPDATE users_login
           SET user_name = LEFT(user_email, CHARINDEX('@', user_email + '@') - 1)
           WHERE user_name IS NULL""")
    exe("ALTER TABLE users_login ALTER COLUMN user_name nvarchar(100) NOT NULL")
    use(NEW); cur.execute("SELECT user_name FROM users_login")
    ok("users_login 登录名回填", cur.fetchone()[0] == "zhangsan_ds")

    # =========================================================
    # 阶段 4：students 列对齐（含放宽 NOT NULL / 去唯一约束）
    # =========================================================
    print("\n[阶段4] students 列对齐")
    exe("EXEC sp_rename 'dbo.[students].[name]', 'student_name', 'COLUMN'")
    exe("EXEC sp_rename 'dbo.[students].[major]', 'student_major', 'COLUMN'")
    # 唯一约束：老账号不迁 + 旧库无此三列 => 必须去掉（唯一约束只允许一个 NULL）
    for uq in ("UQ_student_email", "UQ_student_number", "UQ_student_user"):
        cur.execute("SELECT 1 FROM sys.objects WHERE name=?", (uq,))
        if cur.fetchone():
            exe("ALTER TABLE students DROP CONSTRAINT [%s]" % uq)
    exe("ALTER TABLE students ALTER COLUMN student_number varchar(50) NULL")
    exe("ALTER TABLE students ALTER COLUMN email varchar(100) NULL")
    exe("ALTER TABLE students ALTER COLUMN user_id int NULL")
    exe("ALTER TABLE students ALTER COLUMN student_name nvarchar(100) NULL")
    exe("ALTER TABLE students ALTER COLUMN student_major nvarchar(100) NULL")
    # grade: 中文 -> 数字（算法按数字比较）
    exe("""UPDATE students SET grade = CASE grade
             WHEN N'大一' THEN 1 WHEN N'大二' THEN 2 WHEN N'大三' THEN 3 WHEN N'大四' THEN 4
             WHEN N'研一' THEN 5 WHEN N'研二' THEN 6 WHEN N'研三' THEN 7 ELSE NULL END""")
    exe("ALTER TABLE students ALTER COLUMN grade tinyint NULL")
    exe("ALTER TABLE students ALTER COLUMN gpa decimal(3,2) NULL")
    ok("students 列对齐完成", True)

    # =========================================================
    # 阶段 5：skills 列对齐
    # =========================================================
    print("\n[阶段5] skills 列对齐")
    exe("EXEC sp_rename 'dbo.[skills].[description]', 'skill_description', 'COLUMN'")
    cur.execute("SELECT 1 FROM sys.objects WHERE name='UQ_skill_name'")
    if cur.fetchone():
        exe("ALTER TABLE skills DROP CONSTRAINT UQ_skill_name")
    exe("ALTER TABLE skills ALTER COLUMN skill_name nvarchar(100) NOT NULL")
    exe("ALTER TABLE skills ALTER COLUMN skill_category nvarchar(40) NULL")
    exe("ALTER TABLE skills ALTER COLUMN skill_description nvarchar(max) NULL")
    exe("ALTER TABLE skills ADD CONSTRAINT UQ_skill_name UNIQUE (skill_name)")
    ok("skills 列对齐完成", True)

    # =========================================================
    # 阶段 6：holland_test_results 列对齐
    # =========================================================
    print("\n[阶段6] holland_test_results 列对齐")
    for o, n in [("holland_id", "holland_test_id"), ("test_time", "holland_test_time"),
                 ("r_score", "holland_R"), ("i_score", "holland_I"), ("a_score", "holland_A"),
                 ("s_score", "holland_S"), ("e_score", "holland_E"), ("c_score", "holland_C")]:
        exe("EXEC sp_rename 'dbo.[holland_test_results].[%s]', '%s', 'COLUMN'" % (o, n))
    exe("ALTER TABLE holland_test_results ALTER COLUMN holland_test_time datetime NOT NULL")
    for c in ("holland_R", "holland_I", "holland_A", "holland_S", "holland_E", "holland_C"):
        exe("ALTER TABLE holland_test_results ALTER COLUMN [%s] tinyint NOT NULL" % c)
    ok("holland_test_results 列对齐完成", True)

    # =========================================================
    # 阶段 7：career_values 列对齐（补 6 维宽列）
    # =========================================================
    print("\n[阶段7] career_values 列对齐")
    exe("EXEC sp_rename 'dbo.[career_values].[value_assess_id]', 'worth_id', 'COLUMN'")
    exe("EXEC sp_rename 'dbo.[career_values].[test_time]', 'worth_test_time', 'COLUMN'")
    for c in ("social_contribution", "achievement_oriented", "safe_stable",
              "work_life_balance", "power_status", "innovation_challenge"):
        exe("ALTER TABLE career_values ADD [%s] tinyint NULL" % c)
    exe("ALTER TABLE career_values ALTER COLUMN worth_test_time datetime NOT NULL")
    ok("career_values 补 6 维宽列", True)

    # =========================================================
    # 阶段 8：jobs 列对齐（补 company_id / salary_range）
    # =========================================================
    print("\n[阶段8] jobs 列对齐")
    exe("ALTER TABLE jobs ADD company_id int NULL")
    exe("ALTER TABLE jobs ADD salary_range nvarchar(100) NULL")
    cur.execute("SELECT 1 FROM sys.indexes WHERE name='idx_job_title'")
    if cur.fetchone():
        exe("DROP INDEX idx_job_title ON jobs")
    exe("ALTER TABLE jobs ALTER COLUMN job_title nvarchar(200) NOT NULL")
    exe("ALTER TABLE jobs ALTER COLUMN job_type nvarchar(40) NULL")
    exe("CREATE INDEX idx_job_title ON jobs(job_title)")
    ok("jobs 补 company_id / salary_range", True)

    # =========================================================
    # 阶段 9：job_skill_requirements 列对齐
    # =========================================================
    print("\n[阶段9] job_skill_requirements 列对齐")
    # required_level: 英文 -> 数字（算法按数字比较）
    exe("""UPDATE job_skill_requirements SET required_level = CASE required_level
             WHEN 'basic' THEN '3' WHEN 'proficient' THEN '4' WHEN 'expert' THEN '5' ELSE NULL END""")
    exe("ALTER TABLE job_skill_requirements ALTER COLUMN required_level tinyint NULL")
    exe("ALTER TABLE job_skill_requirements ADD requirement_type nvarchar(20) NULL")
    ok("required_level 转数字 + 补 requirement_type", True)

    # =========================================================
    # 阶段 10：matching_results
    # =========================================================
    print("\n[阶段10] matching_results 列对齐")
    exe("ALTER TABLE matching_results ALTER COLUMN match_score decimal(5,2) NULL")
    ok("match_score 放宽为可空", True)

    # =========================================================
    # 阶段 11：week_plans 列对齐（补 week_plan_finish）
    # =========================================================
    print("\n[阶段11] week_plans 列对齐")
    for o, n in [("weekly_task_id", "week_plan_id"), ("weekly_task_name", "week_plan_name"),
                 ("start_time", "week_plan_start"), ("end_time", "week_plan_ddl")]:
        exe("EXEC sp_rename 'dbo.[week_plans].[%s]', '%s', 'COLUMN'" % (o, n))
    exe("ALTER TABLE week_plans ADD week_plan_finish tinyint NOT NULL CONSTRAINT DF_week_plans_finish DEFAULT 0")
    exe("ALTER TABLE week_plans ALTER COLUMN week_plan_name nvarchar(100) NOT NULL")
    # idx_weekly_task_student_week 依赖 start_time/end_time，先删后建
    cur.execute("SELECT 1 FROM sys.indexes WHERE name='idx_weekly_task_student_week'")
    has_widx = bool(cur.fetchone())
    if has_widx:
        exe("DROP INDEX idx_weekly_task_student_week ON week_plans")
    exe("ALTER TABLE week_plans ALTER COLUMN week_plan_start datetime NOT NULL")
    exe("ALTER TABLE week_plans ALTER COLUMN week_plan_ddl datetime NOT NULL")
    if has_widx:
        exe("CREATE INDEX idx_weekly_task_student_week ON week_plans(student_id, week_plan_start, week_plan_ddl)")
    # 由 completion_percentage 折算完成标志
    exe("UPDATE week_plans SET week_plan_finish = CASE WHEN ISNULL(completion_percentage,0) >= 100 THEN 1 ELSE 0 END")
    ok("week_plans 补 week_plan_finish 并折算", True)

    # =========================================================
    # 阶段 12：day_plans 列对齐（含 priority 中文->数字）
    # =========================================================
    print("\n[阶段12] day_plans 列对齐")
    # 先解除 priority 上的 CHECK 与默认约束（ALTER COLUMN 前置依赖）
    cur.execute("""SELECT cc.name FROM sys.check_constraints cc JOIN sys.tables t ON t.object_id=cc.parent_object_id
                   WHERE t.name='day_plans' AND cc.definition LIKE '%priority%'""")
    for r in cur.fetchall():
        exe("ALTER TABLE day_plans DROP CONSTRAINT [%s]" % r[0])
    cur.execute("""SELECT dc.name FROM sys.default_constraints dc JOIN sys.tables t ON t.object_id=dc.parent_object_id
                   JOIN sys.columns c ON c.object_id=dc.parent_object_id AND c.column_id=dc.parent_column_id
                   WHERE t.name='day_plans' AND c.name='priority'""")
    r = cur.fetchone()
    if r: exe("ALTER TABLE day_plans DROP CONSTRAINT [%s]" % r[0])
    for o, n in [("daily_task_id", "day_plan_id"), ("daily_task_name", "day_plan_name"),
                 ("task_content", "day_plan_describe"), ("priority", "day_plan_prority"),
                 ("end_time", "day_plan_ddl"), ("is_completed", "day_plan_finish")]:
        exe("EXEC sp_rename 'dbo.[day_plans].[%s]', '%s', 'COLUMN'" % (o, n))
    exe("""UPDATE day_plans SET day_plan_prority = CASE day_plan_prority
             WHEN N'高' THEN '1' WHEN N'中' THEN '2' WHEN N'低' THEN '3' ELSE NULL END""")
    exe("ALTER TABLE day_plans ALTER COLUMN day_plan_prority tinyint NULL")
    exe("ALTER TABLE day_plans ALTER COLUMN day_plan_name nvarchar(100) NOT NULL")
    exe("ALTER TABLE day_plans ALTER COLUMN day_plan_describe nvarchar(max) NULL")
    # day_plan_finish: bit -> tinyint NOT NULL（先删默认约束与索引）
    cur.execute("""SELECT dc.name FROM sys.default_constraints dc JOIN sys.tables t ON t.object_id=dc.parent_object_id
                   JOIN sys.columns c ON c.object_id=dc.parent_object_id AND c.column_id=dc.parent_column_id
                   WHERE t.name='day_plans' AND c.name='day_plan_finish'""")
    r = cur.fetchone()
    if r: exe("ALTER TABLE day_plans DROP CONSTRAINT [%s]" % r[0])
    cur.execute("SELECT 1 FROM sys.indexes WHERE name='idx_daily_task_completion'")
    if cur.fetchone():
        exe("DROP INDEX idx_daily_task_completion ON day_plans")
    exe("UPDATE day_plans SET day_plan_finish = ISNULL(CAST(day_plan_finish AS tinyint), 0)")
    exe("ALTER TABLE day_plans ALTER COLUMN day_plan_finish tinyint NOT NULL")
    exe("ALTER TABLE day_plans ADD CONSTRAINT DF_day_plans_finish DEFAULT 0 FOR day_plan_finish")
    exe("CREATE INDEX idx_daily_task_completion ON day_plans(day_plan_finish)")
    ok("day_plans 全部列对齐", True)

    # =========================================================
    # 阶段 13：清种子（依赖 CASCADE，先父后子）
    # =========================================================
    print("\n[阶段13] 清空新库种子数据")
    for t in ("career_values", "students", "skills", "jobs", "skill_assessment", "companies"):
        exe("DELETE FROM [%s]" % t)
    ok("种子已清空", True)

    # =========================================================
    # 阶段 14：迁旧库数据（保留原 ID，外键才对得上）
    # =========================================================
    print("\n[阶段14] 迁移旧库数据")
    def fetch(sql):
        roc.execute(sql); return roc.fetchall()

    def load(tbl, sql, rows, expect):
        exe("SET IDENTITY_INSERT [%s] ON" % tbl)
        n = 0
        for r in rows:
            exe(sql, tuple(r)); n += 1
        exe("SET IDENTITY_INSERT [%s] OFF" % tbl)
        ok("%s 迁入 %d 行" % (tbl, n), n == expect, "期望 %d 实际 %d" % (expect, n))

    rows = fetch("SELECT company_id,company_name,company_location,company_size,company_description FROM companies ORDER BY company_id")
    load("companies", "INSERT INTO companies (company_id,company_name,company_location,company_size,company_description) VALUES (?,?,?,?,?)", rows, 9)

    rows = fetch("SELECT skill_id,skill_name,skill_category,skill_description FROM skills ORDER BY skill_id")
    load("skills", "INSERT INTO skills (skill_id,skill_name,skill_category,skill_description) VALUES (?,?,?,?)", rows, 25)

    # students：user_id 置 NULL（老账号不迁），grade 数字原样
    rows = fetch("SELECT student_id,student_name,student_major,grade,gpa FROM students ORDER BY student_id")
    conv = [(r[0], r[1], r[2], r[3], r[4]) for r in rows]
    load("students", "INSERT INTO students (student_id,student_name,student_major,grade,gpa,user_id) VALUES (?,?,?,?,?,NULL)", conv, 20)

    rows = fetch("SELECT job_id,company_id,job_title,job_type,salary_range FROM jobs ORDER BY job_id")
    load("jobs", "INSERT INTO jobs (job_id,company_id,job_title,job_type,salary_range) VALUES (?,?,?,?,?)", rows, 23)

    rows = fetch("SELECT requirement_id,job_id,skill_id,required_level,requirement_type FROM job_skill_requirements ORDER BY requirement_id")
    load("job_skill_requirements", "INSERT INTO job_skill_requirements (requirement_id,job_id,skill_id,required_level,requirement_type) VALUES (?,?,?,?,?)", rows, 46)

    rows = fetch("SELECT skill_record_id,student_id,skill_id,proficiency_level,experience_months FROM student_skills ORDER BY skill_record_id")
    load("student_skills", "INSERT INTO student_skills (skill_record_id,student_id,skill_id,proficiency_level,experience_months) VALUES (?,?,?,?,?)", rows, 40)

    rows = fetch("SELECT preference_id,student_id,preferred_industries,preferred_locations,expected_salary,work_mode_preference FROM student_preferences ORDER BY preference_id")
    load("student_preferences", "INSERT INTO student_preferences (preference_id,student_id,preferred_industries,preferred_locations,expected_salary,work_mode_preference) VALUES (?,?,?,?,?,?)", rows, 20)

    rows = fetch("SELECT match_id,student_id,job_id,match_score FROM matching_results ORDER BY match_id")
    load("matching_results", "INSERT INTO matching_results (match_id,student_id,job_id,match_score) VALUES (?,?,?,?)", rows, 93)

    # 空表只需结构：holland_test_results / career_values / week_plans / day_plans / experiences

    # =========================================================
    # 阶段 15：迁后补约束 + 建外键
    # =========================================================
    print("\n[阶段15] 迁后补约束")
    exe("ALTER TABLE jobs ALTER COLUMN company_id int NOT NULL")
    exe("ALTER TABLE jobs ADD CONSTRAINT FK_jobs_company FOREIGN KEY (company_id) REFERENCES companies(company_id)")
    ok("jobs.company_id 收紧 NOT NULL + 外键", True)

    # =========================================================
    # 阶段 16：编译校验（14 张契约表 + 接口关键联表）
    # =========================================================
    print("\n[阶段16] 编译校验")
    contract = ['users_login', 'students', 'skills', 'holland_test_results', 'career_values',
                'jobs', 'job_skill_requirements', 'matching_results', 'week_plans', 'day_plans',
                'companies', 'student_skills', 'student_preferences', 'experiences']
    bad = []
    for t in contract:
        try:
            cur.execute("EXEC sp_describe_first_result_set N'SELECT * FROM [%s]'" % t)
            cur.fetchall()
        except Exception as e:
            bad.append("%s: %s" % (t, str(e)[:100]))
    ok("14 张契约表 SELECT * 全部可编译", not bad, bad)

    key_sql = [
        ("登录", "SELECT * FROM users_login WHERE user_name = @p", "@p nvarchar(100)"),
        ("匹配联表", """SELECT mr.match_id, mr.student_id, mr.job_id, j.job_title, c.company_name, mr.match_score
                        FROM matching_results mr JOIN jobs j ON mr.job_id=j.job_id
                        JOIN companies c ON j.company_id=c.company_id WHERE mr.student_id = @p""", "@p int"),
        ("技能要求联技能", """SELECT jsr.job_id, jsr.skill_id, jsr.required_level, jsr.requirement_type,
                              s.skill_name, s.skill_category FROM job_skill_requirements jsr
                              JOIN skills s ON jsr.skill_id=s.skill_id WHERE jsr.job_id = @p""", "@p int"),
        ("学生技能联技能", """SELECT ss.student_id, ss.skill_id, ss.proficiency_level, ss.experience_months,
                              s.skill_name FROM student_skills ss JOIN skills s ON ss.skill_id=s.skill_id
                              WHERE ss.student_id = @p""", "@p int"),
        ("日计划", "SELECT * FROM day_plans WHERE student_id = @p ORDER BY day_plan_ddl", "@p int"),
        ("周计划", "SELECT * FROM week_plans WHERE student_id = @p ORDER BY week_plan_start DESC", "@p int"),
        ("偏好", "SELECT * FROM student_preferences WHERE student_id = @p", "@p int"),
        ("经历", "SELECT * FROM experiences WHERE student_id = @p ORDER BY experience_start_time DESC", "@p int"),
    ]
    bad2 = []
    for name, sql, pdecl in key_sql:
        try:
            cur.execute("EXEC sp_describe_first_result_set N'%s', N'%s'" % (sql.replace("'", "''"), pdecl))
            cur.fetchall()
        except Exception as e:
            bad2.append("%s: %s" % (name, str(e)[:100]))
    ok("接口 8 条关键查询可编译", not bad2, bad2)

    # =========================================================
    # 阶段 17：功能探针（真写真读）
    # =========================================================
    print("\n[阶段17] 功能探针")
    use(NEW)
    def one(sql, params=()):
        cur.execute(sql, params); return cur.fetchone()

    ok("P1 按 user_name 登录", one("SELECT user_id FROM users_login WHERE user_name=?", ("zhangsan_ds",)) is not None)
    ok("P2 students=20", one("SELECT COUNT(*) FROM students")[0] == 20)
    ok("P3 岗位全有企业+薪资", one("""SELECT COUNT(*) FROM jobs j JOIN companies c ON j.company_id=c.company_id
                                      WHERE j.salary_range IS NOT NULL""")[0] == 23)
    ok("P4 匹配联表=93", one("""SELECT COUNT(*) FROM matching_results m JOIN students s ON m.student_id=s.student_id
                                JOIN jobs j ON m.job_id=j.job_id""")[0] == 93)
    ok("P5 requirement_type 有值=46", one("SELECT COUNT(*) FROM job_skill_requirements WHERE requirement_type IS NOT NULL")[0] == 46)
    ok("P6 required_level 为数字", one("""SELECT COUNT(*) FROM job_skill_requirements
                                          WHERE required_level IN (3,4,5)""")[0] == 46)
    ok("P7 grade 为数字", one("SELECT COUNT(*) FROM students WHERE grade BETWEEN 1 AND 7")[0] == 20)
    ok("P8 student_skills=40", one("SELECT COUNT(*) FROM student_skills")[0] == 40)
    ok("P9 student_preferences=20", one("SELECT COUNT(*) FROM student_preferences")[0] == 20)

    # 写探针：新增学生 -> 改 -> 删
    cur.execute("""INSERT INTO students (student_name,student_major,grade,gpa) VALUES (N'探针学生',N'测试专业',2,3.50)""")
    pid = one("SELECT student_id FROM students WHERE student_name=N'探针学生'")[0]
    ok("P10 学生可写入", pid is not None)
    exe("UPDATE students SET gpa=3.80 WHERE student_id=?", (pid,))
    ok("P11 学生可更新", str(one("SELECT gpa FROM students WHERE student_id=?", (pid,))[0]) == "3.80")
    exe("DELETE FROM students WHERE student_id=?", (pid,))
    ok("P12 学生可删除", one("SELECT COUNT(*) FROM students WHERE student_id=?", (pid,))[0] == 0)

    # 周计划写探针（接口 add_week_plan 写法）
    cur.execute("""INSERT INTO week_plans (student_id,week_plan_name,week_plan_start,week_plan_ddl,week_plan_finish)
                   VALUES (?,?,?,?,?)""", (2400001, "探针周计划", "2026-11-01", "2026-11-07", 0))
    ok("P13 周计划可写入", one("SELECT COUNT(*) FROM week_plans WHERE week_plan_name=N'探针周计划'")[0] == 1)

    # 日计划写探针（接口 add_day_plan 写法）
    cur.execute("""INSERT INTO day_plans (student_id,day_plan_name,day_plan_describe,day_plan_prority,day_plan_ddl,day_plan_finish)
                   VALUES (?,?,?,?,?,?)""", (2400001, "探针日计划", "内容", 1, "2026-11-01", 0))
    ok("P14 日计划可写入", one("SELECT COUNT(*) FROM day_plans WHERE day_plan_name=N'探针日计划'")[0] == 1)
    exe("UPDATE day_plans SET day_plan_finish=1 WHERE day_plan_name=N'探针日计划'")
    ok("P15 日计划完成标志可改", one("SELECT day_plan_finish FROM day_plans WHERE day_plan_name=N'探针日计划'")[0] == 1)

    # 匹配结果写探针（接口 add_matching_result 写法）
    cur.execute("INSERT INTO matching_results (student_id,job_id,match_score) VALUES (?,?,?)", (2400001, 2400001, 77.5))
    ok("P16 匹配结果可写入", one("SELECT COUNT(*) FROM matching_results WHERE match_score=77.5")[0] == 1)

    # =========================================================
    # 阶段 18：回滚 + 彻底复原校验
    # =========================================================
    print("\n[阶段18] ROLLBACK 复原")
    exe("ROLLBACK")
    AFTER = snapshot()
    diff = {k: (BEFORE[k], AFTER[k]) for k in BEFORE if BEFORE[k] != AFTER.get(k)}
    newtabs = [t for t in AFTER if t not in BEFORE]
    ok("回滚后 表结构+行数 完全复原", not diff and not newtabs,
       "差异=%s 多出表=%s" % (str(diff)[:300], newtabs))

except Exception:
    try: exe("ROLLBACK")
    except Exception: pass
    print("\n!!! 异常，已回滚:\n" + traceback.format_exc())
    FAIL.append("EXCEPTION")

finally:
    print("\n================ 结果 ================")
    print("通过 %d / 失败 %d" % (len(PASS), len(FAIL)))
    for f in FAIL:
        print("  ✗", f)
    print("结论：" + ("全部通过，方案可落地（本脚本已回滚，数据库零改动）。" if not FAIL
                     else "存在失败，真实执行前必须修复。"))
