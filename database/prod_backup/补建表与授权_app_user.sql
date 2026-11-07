-- ============================================================
-- career_system_prod 补充脚本
-- 用途：1) 授权 app_user 访问 prod 库  2) 补建本项目自有的 5 张扩展表
-- 说明：prod 库的 34 张业务表由同学的备份脚本创建，本脚本只追加不覆盖
-- 执行：sqlcmd -S localhost -E -d master -i 本文件 -b
-- ============================================================

USE career_system_prod;
GO

-- ---------- 1. 授权 app_user ----------
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'app_user')
BEGIN
    CREATE USER [app_user] FOR LOGIN [app_user];
END
GO

IF IS_ROLEMEMBER(N'db_owner', N'app_user') = 0
BEGIN
    ALTER ROLE db_owner ADD MEMBER [app_user];
END
GO

-- ---------- 2. 补建项目自有扩展表 ----------

-- 2.1 计划任务表（持久化任务）
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

-- 2.2 保存的职业规划表
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

-- 2.3 推荐学生画像表（JSON 存储）
IF OBJECT_ID(N'sample_students', N'U') IS NULL
BEGIN
    CREATE TABLE sample_students (
        id           INT IDENTITY(1,1) NOT NULL,
        student_id   VARCHAR(20) NOT NULL,
        student_json NVARCHAR(MAX) NOT NULL,
        CONSTRAINT PK_sample_students PRIMARY KEY (id),
        CONSTRAINT UQ_sample_students UNIQUE (student_id)
    );
END
GO

-- 2.4 推荐岗位表（JSON 存储）
IF OBJECT_ID(N'sample_jobs', N'U') IS NULL
BEGIN
    CREATE TABLE sample_jobs (
        id       INT IDENTITY(1,1) NOT NULL,
        job_id   VARCHAR(20) NOT NULL,
        job_json NVARCHAR(MAX) NOT NULL,
        CONSTRAINT PK_sample_jobs PRIMARY KEY (id),
        CONSTRAINT UQ_sample_jobs UNIQUE (job_id)
    );
END
GO

-- 2.5 推荐课程表（JSON 存储）
IF OBJECT_ID(N'sample_courses', N'U') IS NULL
BEGIN
    CREATE TABLE sample_courses (
        id          INT IDENTITY(1,1) NOT NULL,
        course_id   VARCHAR(20) NOT NULL,
        course_json NVARCHAR(MAX) NOT NULL,
        CONSTRAINT PK_sample_courses PRIMARY KEY (id),
        CONSTRAINT UQ_sample_courses UNIQUE (course_id)
    );
END
GO

PRINT N'扩展表与授权完成';
GO
