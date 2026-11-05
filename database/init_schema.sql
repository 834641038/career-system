-- ============================================================
-- 大学生生涯规划系统 - 数据库初始化脚本 (SQL Server)
-- 数据库: career_recommendation
-- 说明: 使用前请以 Windows 管理员认证 (sqlcmd -S localhost -E) 执行
-- ============================================================
USE master;
GO

-- 1. 创建数据库
IF DB_ID(N'career_recommendation') IS NULL
BEGIN
    CREATE DATABASE career_recommendation COLLATE Chinese_PRC_CI_AS;
END
GO

-- 2. 创建应用登录账号（与后端 database_interface.py 默认连接配置一致）
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = N'app_user')
BEGIN
    CREATE LOGIN app_user WITH PASSWORD = N'34rj>sh&2uio3(jk12e', CHECK_POLICY = OFF, CHECK_EXPIRATION = OFF;
END
GO

USE career_recommendation;
GO

-- 3. 数据库用户与授权
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = N'app_user')
BEGIN
    CREATE USER app_user FOR LOGIN app_user;
END
GO
ALTER ROLE db_owner ADD MEMBER app_user;
GO

-- ============================================================
-- 4. 建表
-- ============================================================

-- 4.1 用户登录表
IF OBJECT_ID(N'users_login', N'U') IS NULL
BEGIN
    CREATE TABLE users_login (
        user_id            INT IDENTITY(1,1) NOT NULL,
        user_name          NVARCHAR(100) NOT NULL,
        password_hash      NVARCHAR(255) NOT NULL,
        user_email         NVARCHAR(100) NULL,
        user_status        INT NOT NULL DEFAULT 1,
        user_created_time  DATETIME NOT NULL DEFAULT GETDATE(),
        user_remark        NVARCHAR(255) NULL,
        last_login_time    DATETIME NULL,
        CONSTRAINT PK_users_login PRIMARY KEY (user_id),
        CONSTRAINT UQ_users_login_name UNIQUE (user_name),
        CONSTRAINT UQ_users_login_email UNIQUE (user_email)
    );
END
GO

-- 4.2 学生信息表
IF OBJECT_ID(N'students', N'U') IS NULL
BEGIN
    CREATE TABLE students (
        student_id   INT IDENTITY(1,1) NOT NULL,
        student_name NVARCHAR(50) NOT NULL,
        student_major NVARCHAR(100) NULL,
        grade        NVARCHAR(20) NULL,
        gpa          DECIMAL(3,2) NULL,
        user_id      INT NULL,
        CONSTRAINT PK_students PRIMARY KEY (student_id),
        CONSTRAINT FK_students_user FOREIGN KEY (user_id) REFERENCES users_login(user_id) ON DELETE SET NULL
    );
END
GO

-- 4.3 公司表
IF OBJECT_ID(N'companies', N'U') IS NULL
BEGIN
    CREATE TABLE companies (
        company_id          INT IDENTITY(1,1) NOT NULL,
        company_name        NVARCHAR(100) NOT NULL,
        company_location    NVARCHAR(100) NULL,
        company_size        NVARCHAR(50) NULL,
        company_description NVARCHAR(MAX) NULL,
        CONSTRAINT PK_companies PRIMARY KEY (company_id)
    );
END
GO

-- 4.4 技能库
IF OBJECT_ID(N'skills', N'U') IS NULL
BEGIN
    CREATE TABLE skills (
        skill_id          INT IDENTITY(1,1) NOT NULL,
        skill_name        NVARCHAR(100) NOT NULL,
        skill_category    NVARCHAR(50) NULL,
        skill_description NVARCHAR(MAX) NULL,
        CONSTRAINT PK_skills PRIMARY KEY (skill_id),
        CONSTRAINT UQ_skills_name UNIQUE (skill_name)
    );
END
GO

-- 4.5 霍兰德测评结果
IF OBJECT_ID(N'holland_test_results', N'U') IS NULL
BEGIN
    CREATE TABLE holland_test_results (
        holland_test_id  INT IDENTITY(1,1) NOT NULL,
        student_id       INT NOT NULL,
        holland_R        INT NULL DEFAULT 0,
        holland_I        INT NULL DEFAULT 0,
        holland_A        INT NULL DEFAULT 0,
        holland_S        INT NULL DEFAULT 0,
        holland_E        INT NULL DEFAULT 0,
        holland_C        INT NULL DEFAULT 0,
        holland_test_time DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_holland_test_results PRIMARY KEY (holland_test_id),
        CONSTRAINT FK_holland_test_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    );
END
GO

-- 4.6 职业价值观测评结果
IF OBJECT_ID(N'career_values', N'U') IS NULL
BEGIN
    CREATE TABLE career_values (
        value_id             INT IDENTITY(1,1) NOT NULL,
        student_id           INT NOT NULL,
        social_contribution  INT NULL DEFAULT 0,
        achievement_oriented INT NULL DEFAULT 0,
        safe_stable          INT NULL DEFAULT 0,
        work_life_balance    INT NULL DEFAULT 0,
        power_status         INT NULL DEFAULT 0,
        innovation_challenge INT NULL DEFAULT 0,
        value_test_time      DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_career_values PRIMARY KEY (value_id),
        CONSTRAINT FK_career_values_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    );
END
GO

-- 4.7 经历表（实习/项目/校园活动）
IF OBJECT_ID(N'experiences', N'U') IS NULL
BEGIN
    CREATE TABLE experiences (
        experience_id        INT IDENTITY(1,1) NOT NULL,
        student_id           INT NOT NULL,
        experience_title     NVARCHAR(200) NOT NULL,
        experience_content   NVARCHAR(MAX) NULL,
        experience_type      NVARCHAR(50) NULL,
        experience_role      NVARCHAR(100) NULL,
        experience_start_time DATE NULL,
        experience_end_time  DATE NULL,
        updated_time         DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_experiences PRIMARY KEY (experience_id),
        CONSTRAINT FK_experiences_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    );
END
GO

-- 4.8 日计划表
IF OBJECT_ID(N'day_plans', N'U') IS NULL
BEGIN
    CREATE TABLE day_plans (
        day_plan_id      INT IDENTITY(1,1) NOT NULL,
        student_id       INT NOT NULL,
        day_plan_name    NVARCHAR(200) NOT NULL,
        day_plan_describe NVARCHAR(MAX) NULL,
        day_plan_prority INT NULL DEFAULT 1,
        day_plan_ddl     DATE NULL,
        day_plan_finish  BIT NOT NULL DEFAULT 0,
        CONSTRAINT PK_day_plans PRIMARY KEY (day_plan_id),
        CONSTRAINT FK_day_plans_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    );
END
GO

-- 4.9 周计划表
IF OBJECT_ID(N'week_plans', N'U') IS NULL
BEGIN
    CREATE TABLE week_plans (
        week_plan_id    INT IDENTITY(1,1) NOT NULL,
        student_id      INT NOT NULL,
        week_plan_name  NVARCHAR(200) NOT NULL,
        week_plan_start DATE NULL,
        week_plan_ddl   DATE NULL,
        week_plan_finish BIT NOT NULL DEFAULT 0,
        CONSTRAINT PK_week_plans PRIMARY KEY (week_plan_id),
        CONSTRAINT FK_week_plans_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    );
END
GO

-- 4.10 学生技能关联表
IF OBJECT_ID(N'student_skills', N'U') IS NULL
BEGIN
    CREATE TABLE student_skills (
        skill_record_id    INT IDENTITY(1,1) NOT NULL,
        student_id         INT NOT NULL,
        skill_id           INT NOT NULL,
        proficiency_level  NVARCHAR(20) NULL,
        experience_months  INT NULL,
        CONSTRAINT PK_student_skills PRIMARY KEY (skill_record_id),
        CONSTRAINT FK_student_skills_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
        CONSTRAINT FK_student_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE,
        CONSTRAINT UQ_student_skill UNIQUE (student_id, skill_id)
    );
END
GO

-- 4.11 职位表
IF OBJECT_ID(N'jobs', N'U') IS NULL
BEGIN
    CREATE TABLE jobs (
        job_id       INT IDENTITY(1,1) NOT NULL,
        company_id   INT NULL,
        job_title    NVARCHAR(100) NOT NULL,
        job_type     NVARCHAR(50) NULL,
        salary_range NVARCHAR(50) NULL,
        CONSTRAINT PK_jobs PRIMARY KEY (job_id),
        CONSTRAINT FK_jobs_company FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE SET NULL
    );
END
GO

-- 4.12 职位技能要求表
IF OBJECT_ID(N'job_skill_requirements', N'U') IS NULL
BEGIN
    CREATE TABLE job_skill_requirements (
        requirement_id   INT IDENTITY(1,1) NOT NULL,
        job_id           INT NOT NULL,
        skill_id         INT NOT NULL,
        required_level   NVARCHAR(20) NULL,
        requirement_type NVARCHAR(50) NULL,
        CONSTRAINT PK_job_skill_requirements PRIMARY KEY (requirement_id),
        CONSTRAINT FK_jsr_job FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
        CONSTRAINT FK_jsr_skill FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE,
        CONSTRAINT UQ_job_skill UNIQUE (job_id, skill_id)
    );
END
GO

-- 4.13 学生偏好表
IF OBJECT_ID(N'student_preferences', N'U') IS NULL
BEGIN
    CREATE TABLE student_preferences (
        preference_id        INT IDENTITY(1,1) NOT NULL,
        student_id           INT NOT NULL,
        preferred_industries NVARCHAR(MAX) NULL,
        preferred_locations  NVARCHAR(MAX) NULL,
        expected_salary      NVARCHAR(50) NULL,
        work_mode_preference NVARCHAR(50) NULL,
        CONSTRAINT PK_student_preferences PRIMARY KEY (preference_id),
        CONSTRAINT FK_student_preferences_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    );
END
GO

-- 4.14 匹配结果表
IF OBJECT_ID(N'matching_results', N'U') IS NULL
BEGIN
    CREATE TABLE matching_results (
        match_id     INT IDENTITY(1,1) NOT NULL,
        student_id   INT NOT NULL,
        job_id       INT NOT NULL,
        match_score  DECIMAL(5,2) NOT NULL,
        match_time   DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_matching_results PRIMARY KEY (match_id),
        CONSTRAINT FK_matching_results_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
        CONSTRAINT FK_matching_results_job FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
    );
END
GO

-- 4.15 计划任务表（持久化任务）
IF OBJECT_ID(N'tasks', N'U') IS NULL
BEGIN
    CREATE TABLE tasks (
        task_id     INT IDENTITY(1,1) NOT NULL,
        user_id     NVARCHAR(64) NOT NULL,
        task_uuid   VARCHAR(36) NOT NULL,
        title       NVARCHAR(200) NOT NULL,
        description NVARCHAR(MAX) NULL,
        priority    NVARCHAR(20) NULL DEFAULT N'medium',
        completed   BIT NOT NULL DEFAULT 0,
        category    NVARCHAR(50) NULL DEFAULT N'学习',
        task_date   VARCHAR(10) NOT NULL,
        task_time   VARCHAR(20) NULL DEFAULT N'',
        created_at  DATETIME NOT NULL DEFAULT GETDATE(),
        updated_at  DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_tasks PRIMARY KEY (task_id),
        CONSTRAINT UQ_tasks_uuid UNIQUE (task_uuid)
    );
END
GO

-- 4.16 保存的职业规划表
IF OBJECT_ID(N'saved_career_plans', N'U') IS NULL
BEGIN
    CREATE TABLE saved_career_plans (
        plan_id     INT IDENTITY(1,1) NOT NULL,
        user_id     NVARCHAR(64) NOT NULL,
        plan_uuid   VARCHAR(36) NOT NULL,
        plan_json   NVARCHAR(MAX) NOT NULL,
        created_at  DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_saved_career_plans PRIMARY KEY (plan_id),
        CONSTRAINT UQ_plans_uuid UNIQUE (plan_uuid)
    );
END
GO

PRINT N'数据库与表结构初始化完成';
GO
