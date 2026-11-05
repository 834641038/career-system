-- ============================================================
-- 大学生生涯规划系统 - 基础数据脚本
-- 数据库: career_recommendation
-- 前置: 已执行 init_schema.sql
-- ============================================================
USE career_recommendation;
GO

BEGIN TRANSACTION;
BEGIN TRY

-- ============================================================
-- 1. 用户账号（密码均为 Test123456，sha256 哈希）
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM users_login WHERE user_name = N'testuser')
BEGIN
    INSERT INTO users_login (user_name, password_hash, user_email, user_status, user_created_time, last_login_time)
    VALUES (N'testuser', N'9a931c55ac02bf216550c464b1992a30c522dfabf6cb31deada5c716bc13a263',
            N'testuser@example.com', 1, GETDATE(), GETDATE());
END

IF NOT EXISTS (SELECT 1 FROM users_login WHERE user_name = N'zhangsan')
BEGIN
    INSERT INTO users_login (user_name, password_hash, user_email, user_status, user_created_time, last_login_time)
    VALUES (N'zhangsan', N'9a931c55ac02bf216550c464b1992a30c522dfabf6cb31deada5c716bc13a263',
            N'zhangsan_ds@csu.edu.cn', 1, '2024-09-01 10:00:00', GETDATE());
END

DECLARE @zhangsan_user_id INT;
SELECT @zhangsan_user_id = user_id FROM users_login WHERE user_name = N'zhangsan';

-- ============================================================
-- 2. 学生信息
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM students WHERE student_name = N'张三')
BEGIN
    INSERT INTO students (student_name, student_major, grade, gpa, user_id)
    VALUES (N'张三', N'数据科学与大数据技术', N'大二', 3.60, @zhangsan_user_id);
END

IF NOT EXISTS (SELECT 1 FROM students WHERE student_name = N'李四')
BEGIN
    INSERT INTO students (student_name, student_major, grade, gpa, user_id)
    VALUES (N'李四', N'计算机科学与技术', N'大三', 3.80, NULL);
END

DECLARE @zhangsan_student_id INT, @lisi_student_id INT;
SELECT @zhangsan_student_id = student_id FROM students WHERE student_name = N'张三';
SELECT @lisi_student_id = student_id FROM students WHERE student_name = N'李四';

-- ============================================================
-- 3. 公司
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM companies WHERE company_name = N'字节跳动')
BEGIN
    INSERT INTO companies (company_name, company_location, company_size, company_description)
    VALUES (N'字节跳动', N'北京', N'大型企业', N'全球领先的互联网科技公司，旗下拥有抖音、今日头条等产品'),
           (N'腾讯', N'深圳', N'大型企业', N'中国领先的互联网综合服务提供商'),
           (N'阿里巴巴', N'杭州', N'大型企业', N'全球领先的电子商务和云计算公司'),
           (N'某科技公司', N'长沙', N'中型企业', N'专注数据服务与人工智能应用的高科技企业');
END

DECLARE @bytedance_id INT, @tencent_id INT, @alibaba_id INT, @techco_id INT;
SELECT @bytedance_id = company_id FROM companies WHERE company_name = N'字节跳动';
SELECT @tencent_id = company_id FROM companies WHERE company_name = N'腾讯';
SELECT @alibaba_id = company_id FROM companies WHERE company_name = N'阿里巴巴';
SELECT @techco_id = company_id FROM companies WHERE company_name = N'某科技公司';

-- ============================================================
-- 4. 技能库
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM skills WHERE skill_name = N'Python')
BEGIN
    INSERT INTO skills (skill_name, skill_category, skill_description) VALUES
    (N'Python', N'编程语言', N'Python 编程语言，广泛应用于数据分析、机器学习和后端开发'),
    (N'SQL', N'编程语言', N'结构化查询语言，用于数据库操作'),
    (N'Java', N'编程语言', N'Java 编程语言'),
    (N'JavaScript', N'编程语言', N'JavaScript 编程语言，用于网页开发'),
    (N'C++', N'编程语言', N'C++ 编程语言，用于高性能系统开发'),
    (N'机器学习', N'数据分析', N'机器学习算法与应用'),
    (N'深度学习', N'数据分析', N'深度学习神经网络与应用'),
    (N'数据可视化', N'数据分析', N'数据图表与可视化展示'),
    (N'统计分析', N'数据分析', N'统计学方法与数据分析应用'),
    (N'数据结构', N'计算机基础', N'常用数据结构与算法基础'),
    (N'算法设计', N'计算机基础', N'算法设计与分析'),
    (N'MySQL', N'数据库工具', N'MySQL 数据库管理系统'),
    (N'团队协作', N'软技能', N'团队合作与跨部门协作能力'),
    (N'沟通表达', N'软技能', N'口头与书面沟通表达能力'),
    (N'项目管理', N'软技能', N'项目计划、组织与执行能力');
END

DECLARE @py_id INT, @sql_id INT, @java_id INT, @js_id INT, @cpp_id INT,
        @ml_id INT, @dl_id INT, @dv_id INT, @stat_id INT, @ds_id INT,
        @algo_id INT, @mysql_id INT, @team_id INT, @comm_id INT, @pm_id INT;
SELECT @py_id = skill_id FROM skills WHERE skill_name = N'Python';
SELECT @sql_id = skill_id FROM skills WHERE skill_name = N'SQL';
SELECT @java_id = skill_id FROM skills WHERE skill_name = N'Java';
SELECT @js_id = skill_id FROM skills WHERE skill_name = N'JavaScript';
SELECT @cpp_id = skill_id FROM skills WHERE skill_name = N'C++';
SELECT @ml_id = skill_id FROM skills WHERE skill_name = N'机器学习';
SELECT @dl_id = skill_id FROM skills WHERE skill_name = N'深度学习';
SELECT @dv_id = skill_id FROM skills WHERE skill_name = N'数据可视化';
SELECT @stat_id = skill_id FROM skills WHERE skill_name = N'统计分析';
SELECT @ds_id = skill_id FROM skills WHERE skill_name = N'数据结构';
SELECT @algo_id = skill_id FROM skills WHERE skill_name = N'算法设计';
SELECT @mysql_id = skill_id FROM skills WHERE skill_name = N'MySQL';
SELECT @team_id = skill_id FROM skills WHERE skill_name = N'团队协作';
SELECT @comm_id = skill_id FROM skills WHERE skill_name = N'沟通表达';
SELECT @pm_id = skill_id FROM skills WHERE skill_name = N'项目管理';

-- ============================================================
-- 5. 职位
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM jobs WHERE job_title = N'数据分析师')
BEGIN
    INSERT INTO jobs (company_id, job_title, job_type, salary_range) VALUES
    (@bytedance_id, N'数据分析师', N'全职', N'15-25K'),
    (@bytedance_id, N'机器学习工程师', N'全职', N'25-40K'),
    (@tencent_id, N'后端开发工程师', N'全职', N'20-35K'),
    (@alibaba_id, N'算法工程师', N'全职', N'25-45K');
END

DECLARE @da_job_id INT, @ml_job_id INT, @be_job_id INT, @algo_job_id INT;
SELECT @da_job_id = job_id FROM jobs WHERE job_title = N'数据分析师';
SELECT @ml_job_id = job_id FROM jobs WHERE job_title = N'机器学习工程师';
SELECT @be_job_id = job_id FROM jobs WHERE job_title = N'后端开发工程师';
SELECT @algo_job_id = job_id FROM jobs WHERE job_title = N'算法工程师';

-- ============================================================
-- 6. 职位技能要求
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM job_skill_requirements WHERE job_id = @da_job_id AND skill_id = @py_id)
BEGIN
    INSERT INTO job_skill_requirements (job_id, skill_id, required_level, requirement_type) VALUES
    (@da_job_id, @py_id, N'proficient', N'核心'),
    (@da_job_id, @sql_id, N'proficient', N'核心'),
    (@da_job_id, @ml_id, N'intermediate', N'加分'),
    (@da_job_id, @dv_id, N'proficient', N'核心'),
    (@ml_job_id, @py_id, N'expert', N'核心'),
    (@ml_job_id, @ml_id, N'expert', N'核心'),
    (@ml_job_id, @dl_id, N'proficient', N'核心'),
    (@be_job_id, @java_id, N'proficient', N'核心'),
    (@be_job_id, @ds_id, N'proficient', N'核心'),
    (@be_job_id, @mysql_id, N'intermediate', N'加分'),
    (@algo_job_id, @py_id, N'expert', N'核心'),
    (@algo_job_id, @algo_id, N'expert', N'核心'),
    (@algo_job_id, @dl_id, N'proficient', N'核心');
END

-- ============================================================
-- 7. 学生技能关联（张三）
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM student_skills WHERE student_id = @zhangsan_student_id AND skill_id = @py_id)
BEGIN
    INSERT INTO student_skills (student_id, skill_id, proficiency_level, experience_months) VALUES
    (@zhangsan_student_id, @py_id, N'proficient', 24),
    (@zhangsan_student_id, @sql_id, N'intermediate', 12),
    (@zhangsan_student_id, @ml_id, N'intermediate', 9),
    (@zhangsan_student_id, @dv_id, N'proficient', 15),
    (@zhangsan_student_id, @stat_id, N'intermediate', 12),
    (@zhangsan_student_id, @team_id, N'proficient', NULL);
END

-- ============================================================
-- 8. 霍兰德测评（张三 / 李四）
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM holland_test_results WHERE student_id = @zhangsan_student_id)
BEGIN
    INSERT INTO holland_test_results (student_id, holland_R, holland_I, holland_A, holland_S, holland_E, holland_C, holland_test_time)
    VALUES (@zhangsan_student_id, 45, 85, 60, 50, 70, 75, '2025-02-15 09:45:00'),
           (@lisi_student_id, 70, 80, 40, 45, 60, 65, '2025-02-16 10:00:00');
END

-- ============================================================
-- 9. 职业价值观测评（张三）
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM career_values WHERE student_id = @zhangsan_student_id)
BEGIN
    INSERT INTO career_values (student_id, social_contribution, achievement_oriented, safe_stable,
                               work_life_balance, power_status, innovation_challenge, value_test_time)
    VALUES (@zhangsan_student_id, 70, 88, 78, 75, 60, 82, '2025-02-20 10:00:00');
END

-- ============================================================
-- 10. 经历（张三：实习 + 项目）
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM experiences WHERE student_id = @zhangsan_student_id AND experience_title = N'数据分析实习生')
BEGIN
    INSERT INTO experiences (student_id, experience_title, experience_content, experience_type, experience_role,
                             experience_start_time, experience_end_time, updated_time)
    VALUES
    (@zhangsan_student_id, N'数据分析实习生', N'使用 Python 与 Pandas 处理用户行为数据，产出可视化报表支持业务决策', N'实习', N'数据分析实习生', '2024-07-01', '2024-09-01', GETDATE()),
    (@zhangsan_student_id, N'电商用户行为分析', N'基于用户行为数据构建画像，使用 K-means 聚类分析用户分群', N'项目', N'项目负责人', '2024-03-01', '2024-06-01', GETDATE());
END

-- ============================================================
-- 11. 日计划（张三，最近两天）
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM day_plans WHERE student_id = @zhangsan_student_id AND day_plan_name = N'完成机器学习作业')
BEGIN
    INSERT INTO day_plans (student_id, day_plan_name, day_plan_describe, day_plan_prority, day_plan_ddl, day_plan_finish) VALUES
    (@zhangsan_student_id, N'完成机器学习作业', N'完成第 6 章课后习题与实验', 1, DATEADD(DAY, 0, CAST(GETDATE() AS DATE)), 1),
    (@zhangsan_student_id, N'学习 SQL 高级查询', N'复习窗口函数与索引优化', 2, DATEADD(DAY, 1, CAST(GETDATE() AS DATE)), 0);
END

-- ============================================================
-- 12. 周计划（张三）
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM week_plans WHERE student_id = @zhangsan_student_id AND week_plan_name = N'深度学习基础学习周')
BEGIN
    INSERT INTO week_plans (student_id, week_plan_name, week_plan_start, week_plan_ddl, week_plan_finish)
    VALUES (@zhangsan_student_id, N'深度学习基础学习周',
            DATEADD(DAY, -6, CAST(GETDATE() AS DATE)), DATEADD(DAY, 0, CAST(GETDATE() AS DATE)), 1);
END

-- ============================================================
-- 13. 学生偏好（张三）
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM student_preferences WHERE student_id = @zhangsan_student_id)
BEGIN
    INSERT INTO student_preferences (student_id, preferred_industries, preferred_locations, expected_salary, work_mode_preference)
    VALUES (@zhangsan_student_id, N'互联网,金融科技,人工智能', N'北京,上海,深圳', N'15K-25K', N'弹性办公');
END

-- ============================================================
-- 14. 匹配结果（张三）
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM matching_results WHERE student_id = @zhangsan_student_id AND job_id = @da_job_id)
BEGIN
    INSERT INTO matching_results (student_id, job_id, match_score, match_time)
    VALUES (@zhangsan_student_id, @da_job_id, 85.50, '2025-02-20 10:15:00'),
           (@zhangsan_student_id, @ml_job_id, 72.30, '2025-02-20 10:15:00');
END

COMMIT TRANSACTION;

-- ============================================================
-- 汇总输出
-- ============================================================
DECLARE @users_count INT, @students_count INT, @skills_count INT, @jobs_count INT, @companies_count INT;
SELECT @users_count = COUNT(*) FROM users_login;
SELECT @students_count = COUNT(*) FROM students;
SELECT @skills_count = COUNT(*) FROM skills;
SELECT @jobs_count = COUNT(*) FROM jobs;
SELECT @companies_count = COUNT(*) FROM companies;
PRINT N'基础数据插入完成';
PRINT N'用户数: ' + CAST(@users_count AS VARCHAR(10));
PRINT N'学生数: ' + CAST(@students_count AS VARCHAR(10));
PRINT N'技能数: ' + CAST(@skills_count AS VARCHAR(10));
PRINT N'职位数: ' + CAST(@jobs_count AS VARCHAR(10));
PRINT N'公司数: ' + CAST(@companies_count AS VARCHAR(10));

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT N'基础数据插入失败: ' + ERROR_MESSAGE();
END CATCH;
GO
