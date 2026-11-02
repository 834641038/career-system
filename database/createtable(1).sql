-- 生涯规划系统 - 核心数据库结构 (v1.0) - SQL Server版本
USE master;
GO

-- 创建数据库
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'career_system')
BEGIN
    CREATE DATABASE career_system 
    COLLATE Chinese_PRC_CI_AS; -- 使用中文排序规则
END
GO

USE career_system;
GO

-- 1. 用户账户表 (user)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user' AND type = 'U')
BEGIN
    CREATE TABLE [user] (
        [user_id] INT IDENTITY(1,1) NOT NULL,
        [email] VARCHAR(100) NOT NULL,
        [password_hash] VARCHAR(255) NOT NULL,
        [create_time] DATETIME NOT NULL DEFAULT GETDATE(),
        [last_login_time] DATETIME NULL,
        CONSTRAINT PK_user PRIMARY KEY ([user_id]),
        CONSTRAINT UQ_user_email UNIQUE ([email])
    );
END
GO

-- 2. 行业表 (industry) - 基础数据，需最先创建
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'industry' AND type = 'U')
BEGIN
    CREATE TABLE industry (
        [industry_id] INT IDENTITY(1,1) NOT NULL,
        [industry_name] VARCHAR(100) NOT NULL,
        [description] TEXT NULL,
        CONSTRAINT PK_industry PRIMARY KEY ([industry_id]),
        CONSTRAINT UQ_industry_name UNIQUE ([industry_name])
    );
END
GO

-- 3. 学生基本信息表 (student_info)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'student_info' AND type = 'U')
BEGIN
    CREATE TABLE student_info (
        [student_id] INT IDENTITY(1,1) NOT NULL,
        [user_id] INT NOT NULL,
        [name] VARCHAR(50) NOT NULL,
        [student_number] VARCHAR(30) NOT NULL,
        [gender] VARCHAR(10) NULL CHECK ([gender] IN ('男', '女', '其他')),
        [birthday] DATE NULL,
        [email] VARCHAR(100) NOT NULL,
        [phone] VARCHAR(20) NULL,
        [major] VARCHAR(100) NULL,
        [university] VARCHAR(100) NULL,
        [bio] TEXT NULL,
        [avatar_url] VARCHAR(500) NULL,
        [enrollment_year] INT NULL,
        [expected_graduation] DATE NULL,
        [grade] VARCHAR(20) NULL,
        [gaokao_score] INT NULL,
        [gpa] DECIMAL(3,2) NULL,
        [current_location] VARCHAR(100) NULL,
        [desired_location] VARCHAR(100) NULL,
        [desired_industry_id] INT NULL,
        CONSTRAINT PK_student_info PRIMARY KEY ([student_id]),
        CONSTRAINT UQ_student_number UNIQUE ([student_number]),
        CONSTRAINT UQ_student_email UNIQUE ([email]),
        CONSTRAINT UQ_student_user UNIQUE ([user_id]),
        CONSTRAINT FK_student_info_user FOREIGN KEY ([user_id]) REFERENCES [user]([user_id]) ON DELETE CASCADE,
        CONSTRAINT FK_student_info_industry FOREIGN KEY ([desired_industry_id]) REFERENCES industry([industry_id]) ON DELETE SET NULL
    );
END
GO

-- 4. 技能库主表 (skill_library)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'skill_library' AND type = 'U')
BEGIN
    CREATE TABLE skill_library (
        [skill_id] INT IDENTITY(1,1) NOT NULL,
        [skill_name] VARCHAR(100) NOT NULL,
        [skill_category] VARCHAR(50) NULL,
        [description] TEXT NULL,
        CONSTRAINT PK_skill_library PRIMARY KEY ([skill_id]),
        CONSTRAINT UQ_skill_name UNIQUE ([skill_name])
    );
END
GO

-- 5. 霍兰德测评主表 (holland_assessment)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'holland_assessment' AND type = 'U')
BEGIN
    CREATE TABLE holland_assessment (
        [holland_id] INT IDENTITY(1,1) NOT NULL,
        [student_id] INT NOT NULL,
        [test_time] DATETIME NOT NULL DEFAULT GETDATE(),
        [r_score] INT NOT NULL,
        [i_score] INT NOT NULL,
        [a_score] INT NOT NULL,
        [s_score] INT NOT NULL,
        [e_score] INT NOT NULL,
        [c_score] INT NOT NULL,
        CONSTRAINT PK_holland_assessment PRIMARY KEY ([holland_id]),
        CONSTRAINT FK_holland_assessment_student FOREIGN KEY ([student_id]) REFERENCES student_info([student_id]) ON DELETE CASCADE
    );
    
    -- 创建索引
    CREATE INDEX idx_student_test_time ON holland_assessment([student_id], [test_time]);
END
GO

-- 6. 技能评估主表 (skill_assessment)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'skill_assessment' AND type = 'U')
BEGIN
    CREATE TABLE skill_assessment (
        [skill_assess_id] INT IDENTITY(1,1) NOT NULL,
        [student_id] INT NOT NULL,
        [test_time] DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_skill_assessment PRIMARY KEY ([skill_assess_id]),
        CONSTRAINT FK_skill_assessment_student FOREIGN KEY ([student_id]) REFERENCES student_info([student_id]) ON DELETE CASCADE
    );
    
    -- 创建索引
    CREATE INDEX idx_skill_assessment_student_test_time ON skill_assessment([student_id], [test_time]);
END
GO

-- 7. 技能评估明细表 (skill_assessment_detail)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'skill_assessment_detail' AND type = 'U')
BEGIN
    CREATE TABLE skill_assessment_detail (
        [detail_id] INT IDENTITY(1,1) NOT NULL,
        [skill_assess_id] INT NOT NULL,
        [skill_id] INT NOT NULL,
        [proficiency_level] VARCHAR(20) NOT NULL,
        [self_score] INT NULL,
        CONSTRAINT PK_skill_assessment_detail PRIMARY KEY ([detail_id]),
        CONSTRAINT FK_skill_assessment_detail_main FOREIGN KEY ([skill_assess_id]) REFERENCES skill_assessment([skill_assess_id]) ON DELETE CASCADE,
        CONSTRAINT FK_skill_assessment_detail_skill FOREIGN KEY ([skill_id]) REFERENCES skill_library([skill_id]) ON DELETE CASCADE,
        CONSTRAINT UQ_assess_skill UNIQUE ([skill_assess_id], [skill_id])
    );
END
GO

-- 8. 价值观库主表 (values_library)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'values_library' AND type = 'U')
BEGIN
    CREATE TABLE values_library (
        [value_id] INT IDENTITY(1,1) NOT NULL,
        [value_name] VARCHAR(100) NOT NULL,
        [description] TEXT NULL,
        CONSTRAINT PK_values_library PRIMARY KEY ([value_id]),
        CONSTRAINT UQ_value_name UNIQUE ([value_name])
    );
END
GO

-- 9. 价值观测评主表 (value_assessment)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'value_assessment' AND type = 'U')
BEGIN
    CREATE TABLE value_assessment (
        [value_assess_id] INT IDENTITY(1,1) NOT NULL,
        [student_id] INT NOT NULL,
        [test_time] DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_value_assessment PRIMARY KEY ([value_assess_id]),
        CONSTRAINT FK_value_assessment_student FOREIGN KEY ([student_id]) REFERENCES student_info([student_id]) ON DELETE CASCADE
    );
    
    -- 创建索引
    CREATE INDEX idx_value_assessment_student_test_time ON value_assessment([student_id], [test_time]);
END
GO

-- 10. 价值观测评明细表 (value_assessment_detail)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'value_assessment_detail' AND type = 'U')
BEGIN
    CREATE TABLE value_assessment_detail (
        [detail_id] INT IDENTITY(1,1) NOT NULL,
        [value_assess_id] INT NOT NULL,
        [value_id] INT NOT NULL,
        [score] INT NOT NULL,
        CONSTRAINT PK_value_assessment_detail PRIMARY KEY ([detail_id]),
        CONSTRAINT FK_value_assessment_detail_main FOREIGN KEY ([value_assess_id]) REFERENCES value_assessment([value_assess_id]) ON DELETE CASCADE,
        CONSTRAINT FK_value_assessment_detail_value FOREIGN KEY ([value_id]) REFERENCES values_library([value_id]) ON DELETE CASCADE,
        CONSTRAINT UQ_assess_value UNIQUE ([value_assess_id], [value_id])
    );
END
GO

-- 11. 职业库主表 (job_library)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'job_library' AND type = 'U')
BEGIN
    CREATE TABLE job_library (
        [job_id] INT IDENTITY(1,1) NOT NULL,
        [job_title] VARCHAR(100) NOT NULL,
        [industry_id] INT NULL,
        [education_requirement] VARCHAR(50) NULL,
        [job_type] VARCHAR(50) NULL,
        [holland_code] CHAR(6) NULL,
        [job_description] TEXT NULL,
        CONSTRAINT PK_job_library PRIMARY KEY ([job_id]),
        CONSTRAINT FK_job_library_industry FOREIGN KEY ([industry_id]) REFERENCES industry([industry_id]) ON DELETE SET NULL
    );
    
    -- 创建索引
    CREATE INDEX idx_job_title ON job_library([job_title]);
END
GO

-- 12. 职业技能要求表 (job_skill_requirement)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'job_skill_requirement' AND type = 'U')
BEGIN
    CREATE TABLE job_skill_requirement (
        [requirement_id] INT IDENTITY(1,1) NOT NULL,
        [job_id] INT NOT NULL,
        [skill_id] INT NOT NULL,
        [required_level] VARCHAR(20) NOT NULL,
        CONSTRAINT PK_job_skill_requirement PRIMARY KEY ([requirement_id]),
        CONSTRAINT FK_job_skill_requirement_job FOREIGN KEY ([job_id]) REFERENCES job_library([job_id]) ON DELETE CASCADE,
        CONSTRAINT FK_job_skill_requirement_skill FOREIGN KEY ([skill_id]) REFERENCES skill_library([skill_id]) ON DELETE CASCADE,
        CONSTRAINT UQ_job_skill UNIQUE ([job_id], [skill_id])
    );
END
GO

-- 13. 职业价值观要求表 (job_value_requirement)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'job_value_requirement' AND type = 'U')
BEGIN
    CREATE TABLE job_value_requirement (
        [requirement_id] INT IDENTITY(1,1) NOT NULL,
        [job_id] INT NOT NULL,
        [value_id] INT NOT NULL,
        [expected_score_level] VARCHAR(20) NULL,
        CONSTRAINT PK_job_value_requirement PRIMARY KEY ([requirement_id]),
        CONSTRAINT FK_job_value_requirement_job FOREIGN KEY ([job_id]) REFERENCES job_library([job_id]) ON DELETE CASCADE,
        CONSTRAINT FK_job_value_requirement_value FOREIGN KEY ([value_id]) REFERENCES values_library([value_id]) ON DELETE CASCADE,
        CONSTRAINT UQ_job_value UNIQUE ([job_id], [value_id])
    );
END
GO

-- 14. 职业探索匹配记录表 (job_match)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'job_match' AND type = 'U')
BEGIN
    CREATE TABLE job_match (
        [match_id] INT IDENTITY(1,1) NOT NULL,
        [student_id] INT NOT NULL,
        [job_id] INT NOT NULL,
        [match_score] DECIMAL(5,2) NOT NULL,
        [match_time] DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_job_match PRIMARY KEY ([match_id]),
        CONSTRAINT FK_job_match_student FOREIGN KEY ([student_id]) REFERENCES student_info([student_id]) ON DELETE CASCADE,
        CONSTRAINT FK_job_match_job FOREIGN KEY ([job_id]) REFERENCES job_library([job_id]) ON DELETE CASCADE
    );
    
    -- 创建索引
    CREATE INDEX idx_student_match_time ON job_match([student_id], [match_time]);
END
GO

-- 15. 实习经历表 (internship_experience)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'internship_experience' AND type = 'U')
BEGIN
    CREATE TABLE internship_experience (
        [internship_id] INT IDENTITY(1,1) NOT NULL,
        [student_id] INT NOT NULL,
        [start_date] DATE NOT NULL,
        [end_date] DATE NULL,
        [location] VARCHAR(200) NOT NULL,
        [position] VARCHAR(100) NULL,
        [description] TEXT NULL,
        CONSTRAINT PK_internship_experience PRIMARY KEY ([internship_id]),
        CONSTRAINT FK_internship_experience_student FOREIGN KEY ([student_id]) REFERENCES student_info([student_id]) ON DELETE CASCADE
    );
    
    -- 创建索引
    CREATE INDEX idx_student_dates ON internship_experience([student_id], [start_date], [end_date]);
END
GO

-- 16. 项目经历表 (project_experience)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'project_experience' AND type = 'U')
BEGIN
    CREATE TABLE project_experience (
        [project_id] INT IDENTITY(1,1) NOT NULL,
        [student_id] INT NOT NULL,
        [start_date] DATE NOT NULL,
        [end_date] DATE NULL,
        [project_name] VARCHAR(200) NOT NULL,
        [role] VARCHAR(100) NULL,
        [description] TEXT NULL,
        CONSTRAINT PK_project_experience PRIMARY KEY ([project_id]),
        CONSTRAINT FK_project_experience_student FOREIGN KEY ([student_id]) REFERENCES student_info([student_id]) ON DELETE CASCADE
    );
    
    -- 创建索引
    CREATE INDEX idx_project_experience_student_dates ON project_experience([student_id], [start_date], [end_date]);
END
GO

-- 17. 校园经历表 (campus_activity)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'campus_activity' AND type = 'U')
BEGIN
    CREATE TABLE campus_activity (
        [activity_id] INT IDENTITY(1,1) NOT NULL,
        [student_id] INT NOT NULL,
        [start_date] DATE NOT NULL,
        [end_date] DATE NULL,
        [campus_role] VARCHAR(100) NOT NULL,
        [responsibility] TEXT NULL,
        CONSTRAINT PK_campus_activity PRIMARY KEY ([activity_id]),
        CONSTRAINT FK_campus_activity_student FOREIGN KEY ([student_id]) REFERENCES student_info([student_id]) ON DELETE CASCADE
    );
    
    -- 创建索引
    CREATE INDEX idx_campus_activity_student_dates ON campus_activity([student_id], [start_date], [end_date]);
END
GO

-- 18. 证书表 (certificate)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'certificate' AND type = 'U')
BEGIN
    CREATE TABLE certificate (
        [certificate_id] INT IDENTITY(1,1) NOT NULL,
        [student_id] INT NOT NULL,
        [obtain_date] DATE NOT NULL,
        [certificate_name] VARCHAR(200) NOT NULL,
        CONSTRAINT PK_certificate PRIMARY KEY ([certificate_id]),
        CONSTRAINT FK_certificate_student FOREIGN KEY ([student_id]) REFERENCES student_info([student_id]) ON DELETE CASCADE
    );
    
    -- 创建索引
    CREATE INDEX idx_certificate_student_date ON certificate([student_id], [obtain_date]);
END
GO

-- 19. 竞赛奖项表 (competition_award)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'competition_award' AND type = 'U')
BEGIN
    CREATE TABLE competition_award (
        [award_id] INT IDENTITY(1,1) NOT NULL,
        [student_id] INT NOT NULL,
        [obtain_date] DATE NOT NULL,
        [competition_level] VARCHAR(50) NULL,
        [competition_name] VARCHAR(200) NOT NULL,
        [award_level] VARCHAR(50) NULL,
        CONSTRAINT PK_competition_award PRIMARY KEY ([award_id]),
        CONSTRAINT FK_competition_award_student FOREIGN KEY ([student_id]) REFERENCES student_info([student_id]) ON DELETE CASCADE
    );
    
    -- 创建索引
    CREATE INDEX idx_competition_award_student_date ON competition_award([student_id], [obtain_date]);
END
GO

-- 20. 生涯规划表 (career_plan)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'career_plan' AND type = 'U')
BEGIN
    CREATE TABLE career_plan (
        [plan_id] INT IDENTITY(1,1) NOT NULL,
        [student_id] INT NOT NULL,
        [task_name] VARCHAR(200) NOT NULL,
        [start_time] DATETIME NULL,
        [end_time] DATETIME NULL,
        [priority] VARCHAR(10) NULL CHECK ([priority] IN ('高', '中', '低')),
        [task_type] VARCHAR(50) NULL,
        [task_content] TEXT NULL,
        [key_result] TEXT NULL,
        [completion_status] VARCHAR(10) NULL CHECK ([completion_status] IN ('未开始', '进行中', '已完成', '已延期')),
        [target_skill_id] INT NULL,
        [target_proficiency] VARCHAR(20) NULL,
        [learning_stage] VARCHAR(50) NULL,
        CONSTRAINT PK_career_plan PRIMARY KEY ([plan_id]),
        CONSTRAINT FK_career_plan_student FOREIGN KEY ([student_id]) REFERENCES student_info([student_id]) ON DELETE CASCADE,
        CONSTRAINT FK_career_plan_skill FOREIGN KEY ([target_skill_id]) REFERENCES skill_library([skill_id]) ON DELETE SET NULL
    );
    
    -- 创建索引
    CREATE INDEX idx_career_plan_student_status ON career_plan([student_id], [completion_status]);
    CREATE INDEX idx_career_plan_deadline ON career_plan([end_time]);
END
GO

-- 21. 周任务表 (weekly_task)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'weekly_task' AND type = 'U')
BEGIN
    CREATE TABLE weekly_task (
        [weekly_task_id] INT IDENTITY(1,1) NOT NULL,
        [student_id] INT NOT NULL,
        [weekly_task_name] VARCHAR(200) NOT NULL,
        [start_time] DATETIME NULL,
        [end_time] DATETIME NULL,
        [priority] VARCHAR(10) DEFAULT '中' CHECK ([priority] IN ('高', '中', '低')),
        [task_type] VARCHAR(50) NULL,
        [completion_percentage] TINYINT DEFAULT 0,
        [target_skill_id] INT NULL,
        [current_proficiency_level] VARCHAR(20) NULL,
        CONSTRAINT PK_weekly_task PRIMARY KEY ([weekly_task_id]),
        CONSTRAINT FK_weekly_task_student FOREIGN KEY ([student_id]) REFERENCES student_info([student_id]) ON DELETE CASCADE,
        CONSTRAINT FK_weekly_task_skill FOREIGN KEY ([target_skill_id]) REFERENCES skill_library([skill_id]) ON DELETE SET NULL
    );
    
    -- 创建索引
    CREATE INDEX idx_weekly_task_student_week ON weekly_task([student_id], [start_time], [end_time]);
END
GO

-- 22. 单任务表 (daily_task)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'daily_task' AND type = 'U')
BEGIN
    CREATE TABLE daily_task (
        [daily_task_id] INT IDENTITY(1,1) NOT NULL,
        [student_id] INT NOT NULL,
        [weekly_task_id] INT NULL,
        [daily_task_name] VARCHAR(200) NOT NULL,
        [start_time] DATETIME NULL,
        [end_time] DATETIME NULL,
        [priority] VARCHAR(10) DEFAULT '中' CHECK ([priority] IN ('高', '中', '低')),
        [task_type] VARCHAR(50) NULL,
        [task_content] TEXT NULL,
        [is_completed] BIT DEFAULT 0,
        [target_skill_id] INT NULL,
        [current_proficiency_level] VARCHAR(20) NULL,
        CONSTRAINT PK_daily_task PRIMARY KEY ([daily_task_id]),
        CONSTRAINT FK_daily_task_student FOREIGN KEY ([student_id]) REFERENCES student_info([student_id]) ON DELETE CASCADE,
        -- 修改这里：将 ON DELETE SET NULL 改为 ON DELETE NO ACTION
        CONSTRAINT FK_daily_task_weekly FOREIGN KEY ([weekly_task_id]) REFERENCES weekly_task([weekly_task_id]) ON DELETE NO ACTION,
        CONSTRAINT FK_daily_task_skill FOREIGN KEY ([target_skill_id]) REFERENCES skill_library([skill_id]) ON DELETE SET NULL
    );
    
    -- 创建索引
    CREATE INDEX idx_daily_task_student_date ON daily_task([student_id], [start_time], [end_time]);
    CREATE INDEX idx_daily_task_completion ON daily_task([is_completed]);
END
GO

-- 23. 学习时间表 (study_time)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'study_time' AND type = 'U')
BEGIN
    CREATE TABLE study_time (
        [study_record_id] INT IDENTITY(1,1) NOT NULL,
        [student_id] INT NOT NULL,
        [study_date] DATE NOT NULL,
        [study_hours] DECIMAL(4,2) NOT NULL,
        CONSTRAINT PK_study_time PRIMARY KEY ([study_record_id]),
        CONSTRAINT FK_study_time_student FOREIGN KEY ([student_id]) REFERENCES student_info([student_id]) ON DELETE CASCADE,
        CONSTRAINT UQ_study_time_student_date UNIQUE ([student_id], [study_date])
    );
END
GO

-- 24. 成就表 (achievement)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'achievement' AND type = 'U')
BEGIN
    CREATE TABLE achievement (
        [achievement_id] INT IDENTITY(1,1) NOT NULL,
        [student_id] INT NOT NULL,
        [achievement_name] VARCHAR(100) NOT NULL,
        [obtain_time] DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_achievement PRIMARY KEY ([achievement_id]),
        CONSTRAINT FK_achievement_student FOREIGN KEY ([student_id]) REFERENCES student_info([student_id]) ON DELETE CASCADE
    );
    
    -- 创建索引
    CREATE INDEX idx_achievement_student_time ON achievement([student_id], [obtain_time]);
END
GO