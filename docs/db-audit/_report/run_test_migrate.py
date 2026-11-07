# -*- coding: utf-8 -*-
"""
迁移预演脚本（事务内执行 + 回滚复原）
====================================
目的：把“新库 career_system 补字段 + 改名对齐接口契约 + 迁移旧库 career_recommendation 数据”
这一整套操作，在单事务内完整跑一遍，做断言校验，最后 ROLLBACK，保证真实数据零改动。

校验内容：
  1) 10 张表改名、4 张表新建
  2) 各表列改名 / 加列 / 改类型 / 放宽约束
  3) 清种子 + 迁旧数（含 grade / required_level 值域转换）
  4) 接口契约 14 张表 SELECT * 全部可编译（sp_describe_first_result_set）
  5) 8 个功能探针真实读写，行数与旧库一致
  6) ROLLBACK 后新库复原到 82 行原始态

运行：python run_test_migrate.py
"""
import pyodbc, sys, json, traceback
sys.stdout.reconfigure(encoding="utf-8")

NEW = "career_system"
OLD = "career_recommendation"

conn = pyodbc.connect(
    "DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;DATABASE=%s;Trusted_Connection=yes" % NEW)
conn.autocommit = False
cur = conn.cursor()

# 旧库只读连接（取数据用，不影响事务）
ro = pyodbc.connect(
    "DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;DATABASE=%s;Trusted_Connection=yes" % OLD)
ro.autocommit = True
roc = ro.cursor()

PASS, FAIL = [], []
def ok(name, cond, extra=""):
    (PASS if cond else FAIL).append(name)
    print(("  [OK]  " if cond else "  [FAIL]") + name + (("  -> " + extra) if extra and not cond else ""))

def exe(sql, params=()):
    cur.execute(sql, params)

def use(db):
    cur.execute("USE [%s]" % db)

# ---------- 旧库原始种子计数（用于回滚后复原校验） ----------
def snap_counts():
    d = {}
    for t in ['achievement','campus_activity','career_plan','certificate','competition_award',
             'daily_task','holland_assessment','industry','internship_experience','job_library',
             'job_match','job_skill_requirement','job_value_requirement','project_experience',
             'skill_assessment','skill_assessment_detail','skill_library','student_info','study_time',
             'user','value_assessment','value_assessment_detail','values_library','weekly_task']:
        use(NEW)
        cur.execute("SELECT COUNT(*) FROM [%s]" % t)
        d[t] = cur.fetchone()[0]
    return d
BEFORE = snap_counts()
print("== 新库迁移前快照（种子计数）:", BEFORE)

try:
    exe("BEGIN TRANSACTION")

    # ============ 阶段 1：10 张表改名 ============
    print("\n[阶段1] 改名 10 张表")
    renames = [('user','users_login'),('student_info','students'),('skill_library','skills'),
               ('holland_assessment','holland_test_results'),('value_assessment','career_values'),
               ('job_library','jobs'),('job_skill_requirement','job_skill_requirements'),
               ('job_match','matching_results'),('weekly_task','week_plans'),('daily_task','day_plans')]
    for o, n in renames:
        exe("EXEC sp_rename 'dbo.[%s]', '%s'" % (o, n))

    # ============ 阶段 2：新建 4 张契约表 ============
    print("\n[阶段2] 新建 companies / student_skills / student_preferences / experiences")
    exe("""CREATE TABLE companies (
        company_id int IDENTITY(1,1) PRIMARY KEY,
        company_name nvarchar(200) NOT NULL,
        company_location nvarchar(100) NULL,
        company_size nvarchar(40) NULL,
        company_description nvarchar(max) NULL)""")
    exe("""CREATE TABLE student_skills (
        skill_record_id int IDENTITY(1,1) PRIMARY KEY,
        student_id int NULL,
        skill_id int NULL,
        proficiency_level tinyint NULL,
        experience_months int NULL)""")
    exe("""CREATE TABLE student_preferences (
        preference_id int IDENTITY(1,1) PRIMARY KEY,
        student_id int NULL,
        preferred_industries nvarchar(max) NULL,
        preferred_locations nvarchar(max) NULL,
        expected_salary nvarchar(100) NULL,
        work_mode_preference nvarchar(40) NULL)""")
    exe("""CREATE TABLE experiences (
        experience_id int IDENTITY(1,1) PRIMARY KEY,
        student_id int NULL,
        experience_title nvarchar(200) NOT NULL,
        experience_content nvarchar(max) NULL,
        experience_type varchar(50) NOT NULL,
        experience_role varchar(50) NULL,
        experience_start_time date NOT NULL,
        experience_end_time date NULL,
        updated_time datetime NULL)""")

    # ============ 阶段 3：列改名 / 加列 / 改类型 ============
    print("\n[阶段3] 列级对齐")
    # 3.0 先删 daily_task/weekly_task 的 priority CHECK（改名前必须解除依赖）
    use(NEW)
    cur.execute("SELECT name FROM sys.check_constraints WHERE name='CK__daily_tas__prior__0D7A0286'")
    if cur.fetchone(): exe("ALTER TABLE day_plans DROP CONSTRAINT CK__daily_tas__prior__0D7A0286")
    cur.execute("SELECT name FROM sys.check_constraints WHERE name='CK__weekly_ta__prior__06CD04F7'")
    if cur.fetchone(): exe("ALTER TABLE week_plans DROP CONSTRAINT CK__weekly_ta__prior__06CD04F7")
    col_renames = [
        ('users_login','email','user_email'),
        ('users_login','create_time','user_created_time'),
        ('students','name','student_name'),
        ('students','major','student_major'),
        ('skills','description','skill_description'),
        ('holland_test_results','holland_id','holland_test_id'),
        ('holland_test_results','test_time','holland_test_time'),
        ('holland_test_results','r_score','holland_R'),
        ('holland_test_results','i_score','holland_I'),
        ('holland_test_results','a_score','holland_A'),
        ('holland_test_results','s_score','holland_S'),
        ('holland_test_results','e_score','holland_E'),
        ('holland_test_results','c_score','holland_C'),
        ('career_values','test_time','value_test_time'),
        ('week_plans','weekly_task_id','week_plan_id'),
        ('week_plans','weekly_task_name','week_plan_name'),
        ('week_plans','start_time','week_plan_start'),
        ('week_plans','end_time','week_plan_ddl'),
        ('day_plans','daily_task_id','day_plan_id'),
        ('day_plans','daily_task_name','day_plan_name'),
        ('day_plans','task_content','day_plan_describe'),
        ('day_plans','priority','day_plan_prority'),
        ('day_plans','end_time','day_plan_ddl'),
        ('day_plans','is_completed','day_plan_finish'),
    ]
    for t, o, n in col_renames:
        exe("EXEC sp_rename 'dbo.[%s].[%s]', '%s', 'COLUMN'" % (t, o, n))

    # 加列
    exe("ALTER TABLE users_login ADD user_name nvarchar(100) NULL")
    exe("ALTER TABLE users_login ADD user_status tinyint NOT NULL DEFAULT 1")
    exe("ALTER TABLE users_login ADD user_remark nvarchar(1000) NULL")
    exe("ALTER TABLE users_login ALTER COLUMN password_hash varchar(255) NOT NULL")
    exe("ALTER TABLE career_values ADD social_contribution tinyint NULL")
    exe("ALTER TABLE career_values ADD achievement_oriented tinyint NULL")
    exe("ALTER TABLE career_values ADD safe_stable tinyint NULL")
    exe("ALTER TABLE career_values ADD work_life_balance tinyint NULL")
    exe("ALTER TABLE career_values ADD power_status tinyint NULL")
    exe("ALTER TABLE career_values ADD innovation_challenge tinyint NULL")
    exe("ALTER TABLE jobs ADD company_id int NULL")
    exe("ALTER TABLE jobs ADD salary_range nvarchar(100) NULL")
    exe("ALTER TABLE job_skill_requirements ADD requirement_type nvarchar(20) NULL")
    exe("ALTER TABLE week_plans ADD week_plan_finish tinyint NULL")
    # 注：day_plans.day_plan_finish（原 is_completed，bit）保留类型——契约以 0/1 写入 bit 完全兼容，无需改类型

    # ============ 阶段 4：放宽约束（用法驱动） ============
    print("\n[阶段4] 约束处理")
    # 4.1 学生表：老账号不迁移 -> 删 students.user_id 外键；多条列放宽 NOT NULL；删 student_number/email 唯一
    use(NEW)
    cur.execute("SELECT name FROM sys.foreign_keys WHERE name='FK_student_info_user'")
    if cur.fetchone():
        exe("ALTER TABLE students DROP CONSTRAINT FK_student_info_user")
        ok("删 FK_student_info_user", True)
    # 动态找 student_number / email 上的唯一约束并删除
    cur.execute("""SELECT dc.name, c.name FROM sys.key_constraints dc
        JOIN sys.tables t ON t.object_id=dc.parent_object_id
        JOIN sys.index_columns ic ON ic.object_id=t.object_id AND ic.index_id=dc.unique_index_id
        JOIN sys.columns c ON c.object_id=t.object_id AND c.column_id=ic.column_id
        WHERE t.name='students' AND dc.type='UQ' AND c.name IN ('student_number','email')""")
    for cons, col in cur.fetchall():
        exe("ALTER TABLE students DROP CONSTRAINT [%s]" % cons)
        ok("删唯一约束 %s(%s)" % (cons, col), True)
    # 放宽 NOT NULL（精确按类型，避免误改）
    exe("ALTER TABLE students ALTER COLUMN student_number varchar(50) NULL")
    exe("ALTER TABLE students ALTER COLUMN email varchar(100) NULL")
    exe("ALTER TABLE students ALTER COLUMN birthday date NULL")
    exe("ALTER TABLE students ALTER COLUMN phone varchar(20) NULL")
    exe("ALTER TABLE students ALTER COLUMN university varchar(100) NULL")
    exe("ALTER TABLE students ALTER COLUMN bio text NULL")
    exe("ALTER TABLE students ALTER COLUMN avatar_url varchar(255) NULL")
    exe("ALTER TABLE students ALTER COLUMN enrollment_year int NULL")
    exe("ALTER TABLE students ALTER COLUMN expected_graduation date NULL")
    exe("ALTER TABLE students ALTER COLUMN current_location varchar(100) NULL")
    exe("ALTER TABLE students ALTER COLUMN desired_industry_id int NULL")
    exe("ALTER TABLE students ALTER COLUMN student_name nvarchar(100) NULL")
    exe("ALTER TABLE students ALTER COLUMN grade varchar(10) NULL")
    exe("ALTER TABLE students ALTER COLUMN gpa decimal(3,2) NULL")

    # 4.2 给保留账号补 user_name / user_status
    exe("UPDATE users_login SET user_name='zhangsan_ds', user_status=1 WHERE user_id=1")

    # ============ 阶段 5：清空种子（子->父顺序） ============
    print("\n[阶段5] 清空种子数据（FK 安全顺序）")
    clear_order = [
        'skill_assessment_detail','value_assessment_detail',
        'day_plans','week_plans',
        'achievement','campus_activity','career_plan','certificate','competition_award',
        'internship_experience','project_experience','skill_assessment','study_time',
        'holland_test_results','matching_results','job_skill_requirements',
        'job_value_requirement','jobs','students','career_values','skills',
    ]
    for t in clear_order:
        exe("DELETE FROM [%s]" % t)

    # ============ 阶段 6：迁移旧库数据（带值域转换） ============
    print("\n[阶段6] 迁移旧库数据（保留旧 ID，外键才能对上）")
    GRADE = {1:'大一',2:'大二',3:'大三',4:'大四'}
    def fetch(sql):
        roc.execute(sql); return roc.fetchall()
    def load(t, sql, rows):
        exe("SET IDENTITY_INSERT [%s] ON" % t)
        n = 0
        for r in rows:
            exe(sql, tuple(r)); n += 1
        exe("SET IDENTITY_INSERT [%s] OFF" % t)
        return n

    # skills
    rows = fetch("SELECT skill_id,skill_name,skill_category,skill_description FROM skills")
    ok("skills 迁入 %d 行"%len(rows), load('skills',
        "INSERT INTO skills (skill_id,skill_name,skill_category,skill_description) VALUES (?,?,?,?)", rows)==25)

    # companies
    rows = fetch("SELECT company_id,company_name,company_location,company_size,company_description FROM companies")
    ok("companies 迁入 %d 行"%len(rows), load('companies',
        "INSERT INTO companies (company_id,company_name,company_location,company_size,company_description) VALUES (?,?,?,?,?)", rows)==9)

    # students（grade tinyint -> varchar）
    rows = fetch("SELECT student_id,student_name,student_major,grade,gpa,user_id FROM students")
    conv = [(r[0],r[1],r[2],GRADE.get(r[3],None),r[4],r[5]) for r in rows]
    ok("students 迁入 %d 行"%len(rows), load('students',
        "INSERT INTO students (student_id,student_name,student_major,grade,gpa,user_id) VALUES (?,?,?,?,?,?)", conv)==20)

    # jobs（company_id, salary_range 来自旧库；industry_id 留 NULL）
    rows = fetch("SELECT job_id,company_id,job_title,job_type,salary_range FROM jobs")
    ok("jobs 迁入 %d 行"%len(rows), load('jobs',
        "INSERT INTO jobs (job_id,company_id,job_title,job_type,salary_range) VALUES (?,?,?,?,?)", rows)==23)

    # job_skill_requirements（required_level 原样入库，列是 varchar）
    rows = fetch("SELECT requirement_id,job_id,skill_id,required_level,requirement_type FROM job_skill_requirements")
    ok("job_skill_requirements 迁入 %d 行"%len(rows), load('job_skill_requirements',
        "INSERT INTO job_skill_requirements (requirement_id,job_id,skill_id,required_level,requirement_type) VALUES (?,?,?,?,?)", rows)==46)

    # student_skills
    rows = fetch("SELECT skill_record_id,student_id,skill_id,proficiency_level,experience_months FROM student_skills")
    ok("student_skills 迁入 %d 行"%len(rows), load('student_skills',
        "INSERT INTO student_skills (skill_record_id,student_id,skill_id,proficiency_level,experience_months) VALUES (?,?,?,?,?)", rows)==40)

    # student_preferences
    rows = fetch("SELECT preference_id,student_id,preferred_industries,preferred_locations,expected_salary,work_mode_preference FROM student_preferences")
    ok("student_preferences 迁入 %d 行"%len(rows), load('student_preferences',
        "INSERT INTO student_preferences (preference_id,student_id,preferred_industries,preferred_locations,expected_salary,work_mode_preference) VALUES (?,?,?,?,?,?)", rows)==20)

    # matching_results
    rows = fetch("SELECT match_id,student_id,job_id,match_score FROM matching_results")
    ok("matching_results 迁入 %d 行"%len(rows), load('matching_results',
        "INSERT INTO matching_results (match_id,student_id,job_id,match_score) VALUES (?,?,?,?)", rows)==93)

    # 空表：holland_test_results / career_values / week_plans / day_plans / experiences 无旧数据，结构已对齐

    # ============ 阶段 7：编译校验（接口契约表 SELECT *） ============
    print("\n[阶段7] 接口契约 SQL 编译校验")
    contract_tables = ['users_login','students','skills','holland_test_results','career_values',
        'jobs','job_skill_requirements','matching_results','week_plans','day_plans',
        'companies','student_skills','student_preferences','experiences']
    compile_ok = 0
    for t in contract_tables:
        try:
            cur.execute("EXEC sp_describe_first_result_set N'SELECT * FROM [%s]'" % t)
            cur.fetchall()
            compile_ok += 1
        except Exception as e:
            ok("编译 SELECT * FROM %s" % t, False, str(e)[:120])
    ok("14 张契约表 SELECT * 均可编译", compile_ok==14, "通过 %d/14"%compile_ok)

    # ============ 阶段 8：功能探针（真实读写） ============
    print("\n[阶段8] 功能探针")
    def cnt_tbl(t):
        cur.execute("SELECT COUNT(*) FROM [%s]" % t); return cur.fetchone()[0]

    # P1 登录（保留账号）
    cur.execute("SELECT user_id,user_name,user_status FROM users_login WHERE user_name='zhangsan_ds'")
    r = cur.fetchone(); ok("P1 登录账号可查", r is not None and r[1]=='zhangsan_ds')

    # P2 学生
    ok("P2 students=20", cnt_tbl('students')==20)
    # P3 岗位+企业 JOIN
    cur.execute("""SELECT COUNT(*) FROM jobs j JOIN companies c ON j.company_id=c.company_id
                   WHERE j.salary_range IS NOT NULL""")
    ok("P3 jobs JOIN companies 有薪资", cur.fetchone()[0]==23)
    # P4 匹配 JOIN 学生+岗位
    cur.execute("""SELECT COUNT(*) FROM matching_results m
                   JOIN students s ON m.student_id=s.student_id
                   JOIN jobs j ON m.job_id=j.job_id""")
    ok("P4 matching JOIN students+jobs", cur.fetchone()[0]==93)
    # P5 技能要求含 requirement_type
    cur.execute("SELECT COUNT(*) FROM job_skill_requirements WHERE requirement_type IS NOT NULL")
    ok("P5 requirement_type 有值", cur.fetchone()[0]==46)
    # P6 学生技能
    ok("P6 student_skills=40", cnt_tbl('student_skills')==40)
    # P7 偏好
    ok("P7 student_preferences=20", cnt_tbl('student_preferences')==20)
    # P8 空结构表存在
    ok("P8 holland_test_results 结构存在(0行)", cnt_tbl('holland_test_results')==0)
    ok("P8 career_values 结构存在(0行)", cnt_tbl('career_values')==0)
    ok("P8 week_plans 结构存在(0行)", cnt_tbl('week_plans')==0)
    ok("P8 day_plans 结构存在(0行)", cnt_tbl('day_plans')==0)
    ok("P8 experiences 结构存在(0行)", cnt_tbl('experiences')==0)

    # ============ 阶段 9：回滚 + 复原校验 ============
    print("\n[阶段9] ROLLBACK 复原")
    exe("ROLLBACK")
    AFTER = snap_counts()
    restored = (AFTER == BEFORE)
    ok("回滚后新库完全复原(计数一致)", restored,
       "差异: " + str({k:(BEFORE[k],AFTER[k]) for k in BEFORE if BEFORE[k]!=AFTER[k]}) if not restored else "")

except Exception as e:
    try: exe("ROLLBACK")
    except: pass
    print("\n!!! 异常，已回滚:", traceback.format_exc())
    FAIL.append("EXCEPTION:" + str(e)[:200])
finally:
    print("\n================ 结果 ================")
    print("通过 %d / 失败 %d" % (len(PASS), len(FAIL)))
    for f in FAIL: print("  ✗", f)
    if FAIL:
        print("结论：存在失败，真实迁移前需修复。")
    else:
        print("结论：全部通过，方案可在真实执行时落地（本脚本已回滚，数据库零改动）。")
    conn.close(); ro.close()
