-- 生涯规划系统 - 张三用户数据插入脚本 (SQL Server版本)
USE career_system;
GO

-- 声明变量
DECLARE @user_id INT;
DECLARE @student_id INT;
DECLARE @industry_id INT;
DECLARE @skill_assess_id INT;
DECLARE @value_assess_id INT;
DECLARE @deeplearning_skill_id INT;
DECLARE @tableau_skill_id INT;
DECLARE @weekly_task_id INT;
DECLARE @data_analyst_industry_id INT;
DECLARE @fintech_industry_id INT;
DECLARE @ai_industry_id INT;
DECLARE @data_analyst_job_id INT;
DECLARE @data_engineer_job_id INT;
DECLARE @ml_engineer_job_id INT;
DECLARE @python_skill_id INT;
DECLARE @sql_skill_id INT;
DECLARE @machine_learning_skill_id INT;
DECLARE @data_visualization_skill_id INT;
DECLARE @deep_learning_skill_id INT;

BEGIN TRANSACTION;

BEGIN TRY
    -- 步骤1: 插入基础数据到行业表 (industry)
    MERGE INTO industry AS target
    USING (VALUES 
        ('互联网', '互联网行业，包括软件开发、网站建设、网络服务等'),
        ('金融科技', '金融与科技结合的新兴行业，包括支付、借贷、投资、保险等数字化服务'),
        ('人工智能', '人工智能技术研发与应用行业'),
        ('数据分析', '数据分析、数据挖掘、商业智能等相关行业')
    ) AS source (industry_name, description)
    ON target.industry_name = source.industry_name
    WHEN NOT MATCHED THEN
        INSERT (industry_name, description) VALUES (source.industry_name, source.description)
    WHEN MATCHED THEN
        UPDATE SET description = source.description;

    -- 步骤2: 插入技能库数据 (skill_library)
    MERGE INTO skill_library AS target
    USING (VALUES 
        -- 编程语言
        ('Python', '编程语言', 'Python编程语言，广泛应用于数据分析、机器学习等领域'),
        ('SQL', '编程语言', '结构化查询语言，用于数据库操作'),
        ('Java', '编程语言', 'Java编程语言'),
        ('R', '编程语言', 'R语言，统计分析语言'),
        ('JavaScript', '编程语言', 'JavaScript编程语言，用于网页开发'),
        -- 数据分析技能
        ('机器学习', '数据分析', '机器学习算法与应用'),
        ('数据可视化', '数据分析', '数据图表制作与可视化展示'),
        ('数据清洗', '数据分析', '数据预处理、清洗和整理'),
        ('统计分析', '数据分析', '统计学分析与应用'),
        ('深度学习', '数据分析', '深度学习技术与应用'),
        -- 工具
        ('MySQL', '数据库工具', 'MySQL数据库管理系统'),
        ('Pandas', '数据分析工具', 'Python数据分析库'),
        ('Matplotlib/Seaborn', '数据可视化工具', 'Python可视化库'),
        ('Scikit-learn', '机器学习工具', 'Python机器学习库'),
        ('Tableau', '数据可视化工具', '商业智能可视化工具')
    ) AS source (skill_name, skill_category, description)
    ON target.skill_name = source.skill_name
    WHEN NOT MATCHED THEN
        INSERT (skill_name, skill_category, description) VALUES (source.skill_name, source.skill_category, source.description)
    WHEN MATCHED THEN
        UPDATE SET skill_category = source.skill_category, description = source.description;

    -- 步骤3: 插入价值观库数据 (values_library)
    MERGE INTO values_library AS target
    USING (VALUES 
        ('技术成长', '持续学习新技术，提升技术水平'),
        ('创新性', '追求创新，尝试新方法和思路'),
        ('稳定性', '工作稳定，有保障'),
        ('薪资回报', '重视薪资和物质回报'),
        ('社会价值', '工作对社会有积极影响')
    ) AS source (value_name, description)
    ON target.value_name = source.value_name
    WHEN NOT MATCHED THEN
        INSERT (value_name, description) VALUES (source.value_name, source.description)
    WHEN MATCHED THEN
        UPDATE SET description = source.description;

    -- 步骤4: 插入用户账户 (user)
    MERGE INTO [user] AS target
    USING (VALUES 
        ('zhangsan_ds@csu.edu.cn', '$2y$10$EXAMPLEHASHEXAMPLEHASHEXAMPLEHASH', '2024-09-01 10:00:00', '2025-02-20 10:15:00')
    ) AS source (email, password_hash, create_time, last_login_time)
    ON target.email = source.email
    WHEN NOT MATCHED THEN
        INSERT (email, password_hash, create_time, last_login_time) 
        VALUES (source.email, source.password_hash, source.create_time, source.last_login_time)
    WHEN MATCHED THEN
        UPDATE SET 
            password_hash = source.password_hash,
            last_login_time = source.last_login_time;

    -- 获取用户ID
    SELECT @user_id = user_id FROM [user] WHERE email = 'zhangsan_ds@csu.edu.cn';

    -- 步骤5: 获取行业ID
    SELECT @industry_id = industry_id FROM industry WHERE industry_name = '数据分析';
    IF @industry_id IS NULL
        SELECT @industry_id = industry_id FROM industry WHERE industry_name = '互联网';

    -- 步骤6: 插入学生基本信息 (student_info)
    MERGE INTO student_info AS target
    USING (VALUES 
        (@user_id, '张三', '2023005678', '男', '2005-08-20',
         'zhangsan_ds@csu.edu.cn', '13987654321', '数据科学与大数据技术', '中南大学', 
         '中南大学数据科学与大数据技术专业大二学生，专注于数据分析与机器学习方向，具备扎实的Python编程和数据处理能力，参与多项校内数据分析项目，拥有金融科技领域实习经历，目标成为数据分析师/算法工程师。',
         '/avatars/zhangsan.jpg', 2023, '2027-06-01', '大二',
         3.60, '湖南省长沙市', '长沙/武汉/上海', @industry_id)
    ) AS source (user_id, name, student_number, gender, birthday, email, phone, major, university, 
                 bio, avatar_url, enrollment_year, expected_graduation, grade, gpa, 
                 current_location, desired_location, desired_industry_id)
    ON target.user_id = source.user_id
    WHEN NOT MATCHED THEN
        INSERT (user_id, name, student_number, gender, birthday, email, phone, major, university, 
                bio, avatar_url, enrollment_year, expected_graduation, grade, gpa, 
                current_location, desired_location, desired_industry_id)
        VALUES (source.user_id, source.name, source.student_number, source.gender, source.birthday, 
                source.email, source.phone, source.major, source.university, source.bio, 
                source.avatar_url, source.enrollment_year, source.expected_graduation, source.grade, 
                source.gpa, source.current_location, source.desired_location, source.desired_industry_id)
    WHEN MATCHED THEN
        UPDATE SET 
            name = source.name,
            student_number = source.student_number,
            gender = source.gender,
            birthday = source.birthday,
            email = source.email,
            phone = source.phone,
            major = source.major,
            university = source.university,
            bio = source.bio,
            avatar_url = source.avatar_url,
            enrollment_year = source.enrollment_year,
            expected_graduation = source.expected_graduation,
            grade = source.grade,
            gpa = source.gpa,
            current_location = source.current_location,
            desired_location = source.desired_location,
            desired_industry_id = source.desired_industry_id;

    -- 获取学生ID
    SELECT @student_id = student_id FROM student_info WHERE user_id = @user_id;

    -- 步骤7: 插入霍兰德测评数据 (holland_assessment)
    MERGE INTO holland_assessment AS target
    USING (VALUES 
        (@student_id, '2025-02-15 09:45:00', 60, 85, 55, 65, 70, 75)
    ) AS source (student_id, test_time, r_score, i_score, a_score, s_score, e_score, c_score)
    ON target.student_id = source.student_id
    WHEN NOT MATCHED THEN
        INSERT (student_id, test_time, r_score, i_score, a_score, s_score, e_score, c_score)
        VALUES (source.student_id, source.test_time, source.r_score, source.i_score, 
                source.a_score, source.s_score, source.e_score, source.c_score)
    WHEN MATCHED THEN
        UPDATE SET 
            test_time = source.test_time,
            r_score = source.r_score,
            i_score = source.i_score,
            a_score = source.a_score,
            s_score = source.s_score,
            e_score = source.e_score,
            c_score = source.c_score;

    -- 步骤8: 插入技能评估主表 (skill_assessment)
    INSERT INTO skill_assessment (student_id, test_time)
    VALUES (@student_id, '2025-02-20 10:00:00');
    
    SET @skill_assess_id = SCOPE_IDENTITY();

    -- 步骤9: 插入技能评估明细 (skill_assessment_detail)
    MERGE INTO skill_assessment_detail AS target
    USING (
        SELECT 
            @skill_assess_id AS skill_assess_id,
            s.skill_id,
            CASE 
                WHEN s.skill_name IN ('Python', 'SQL', '机器学习', '数据可视化', '数据清洗', '统计分析', 'MySQL', 'Pandas', 'Matplotlib/Seaborn', 'Scikit-learn') THEN 'proficient'
                WHEN s.skill_name = '深度学习' THEN 'basic'
                WHEN s.skill_name IN ('Java', 'R', 'JavaScript', 'Tableau') THEN 'basic'
                ELSE 'basic'
            END AS proficiency_level,
            CASE 
                WHEN s.skill_name = 'Python' THEN 85
                WHEN s.skill_name = 'SQL' THEN 80
                WHEN s.skill_name = '机器学习' THEN 80
                WHEN s.skill_name = '数据可视化' THEN 85
                WHEN s.skill_name = '数据清洗' THEN 90
                WHEN s.skill_name = '统计分析' THEN 78
                WHEN s.skill_name = '深度学习' THEN 65
                WHEN s.skill_name = 'MySQL' THEN 80
                WHEN s.skill_name = 'Pandas' THEN 90
                WHEN s.skill_name = 'Matplotlib/Seaborn' THEN 88
                WHEN s.skill_name = 'Scikit-learn' THEN 82
                WHEN s.skill_name = 'Tableau' THEN 70
                WHEN s.skill_name = 'Java' THEN 70
                WHEN s.skill_name = 'R' THEN 65
                WHEN s.skill_name = 'JavaScript' THEN 60
                ELSE 0
            END AS self_score
        FROM skill_library s
        WHERE s.skill_name IN (
            'Python', 'SQL', 'Java', 'R', 'JavaScript', 
            '机器学习', '数据可视化', '数据清洗', '统计分析', '深度学习',
            'MySQL', 'Pandas', 'Matplotlib/Seaborn', 'Scikit-learn', 'Tableau'
        )
    ) AS source (skill_assess_id, skill_id, proficiency_level, self_score)
    ON target.skill_assess_id = source.skill_assess_id AND target.skill_id = source.skill_id
    WHEN NOT MATCHED THEN
        INSERT (skill_assess_id, skill_id, proficiency_level, self_score)
        VALUES (source.skill_assess_id, source.skill_id, source.proficiency_level, source.self_score)
    WHEN MATCHED THEN
        UPDATE SET 
            proficiency_level = source.proficiency_level,
            self_score = source.self_score;

    -- 步骤10: 插入价值观测评主表 (value_assessment)
    INSERT INTO value_assessment (student_id, test_time)
    VALUES (@student_id, '2025-02-20 10:00:00');
    
    SET @value_assess_id = SCOPE_IDENTITY();

    -- 步骤11: 插入价值观测评明细 (value_assessment_detail)
    MERGE INTO value_assessment_detail AS target
    USING (
        SELECT 
            @value_assess_id AS value_assess_id,
            v.value_id,
            CASE 
                WHEN v.value_name = '技术成长' THEN 88
                WHEN v.value_name = '创新性' THEN 82
                WHEN v.value_name = '稳定性' THEN 78
                WHEN v.value_name = '薪资回报' THEN 75
                WHEN v.value_name = '社会价值' THEN 70
                ELSE 0
            END AS score
        FROM values_library v
        WHERE v.value_name IN ('技术成长', '创新性', '稳定性', '薪资回报', '社会价值')
    ) AS source (value_assess_id, value_id, score)
    ON target.value_assess_id = source.value_assess_id AND target.value_id = source.value_id
    WHEN NOT MATCHED THEN
        INSERT (value_assess_id, value_id, score)
        VALUES (source.value_assess_id, source.value_id, source.score)
    WHEN MATCHED THEN
        UPDATE SET score = source.score;

    -- 步骤12: 插入实习经历 (internship_experience)
    INSERT INTO internship_experience (student_id, start_date, end_date, location, position, description)
    VALUES (
        @student_id, '2024-07-01', '2024-09-01', '长沙', '数据分析实习生',
        '协助数据团队完成用户行为数据分析、金融产品交易数据清洗与可视化工作，使用Python（Pandas/Numpy）处理千万级数据，制作日报/周报可视化报表，支撑业务决策。独立完成用户留存率分析模型，优化后留存率提升5%。制作10+份可视化报表，覆盖交易、用户、产品三大维度。参与反欺诈数据模型的特征工程，筛选有效特征20+个。'
    );

    -- 步骤13: 插入项目经历 (project_experience)
    INSERT INTO project_experience (student_id, start_date, end_date, project_name, role, description)
    VALUES 
    (
        @student_id, '2024-03-01', '2024-06-01', '校园消费数据分析平台', '核心开发者',
        '基于Python+Flask+MySQL开发的校园消费数据分析平台，爬取校园一卡通消费数据，通过统计分析和机器学习预测消费趋势，为学校食堂运营提供决策支持。'
    ),
    (
        @student_id, '2024-09-01', '2024-12-01', '电商用户画像构建与推荐系统', '开发者',
        '基于公开电商数据集，使用K-means聚类构建用户画像，结合协同过滤算法实现商品推荐，最终推荐准确率达75%，使用Streamlit制作可视化展示界面。'
    );

    -- 步骤14: 插入证书 (certificate)
    INSERT INTO certificate (student_id, obtain_date, certificate_name)
    VALUES
    (@student_id, '2024-12-01', 'Python工程师认证（中级）'),
    (@student_id, '2024-11-01', '全国计算机等级考试三级（数据库技术）');

    -- 步骤15: 插入竞赛奖项 (competition_award)
    INSERT INTO competition_award (student_id, obtain_date, competition_level, competition_name, award_level)
    VALUES
    (@student_id, '2024-12-01', '省级', '数学建模竞赛', '二等奖'),
    (@student_id, '2024-11-01', '校级', '大数据分析挑战赛', '一等奖');

    -- 步骤16: 获取技能ID
    SELECT @deeplearning_skill_id = skill_id FROM skill_library WHERE skill_name = '深度学习';
    SELECT @tableau_skill_id = skill_id FROM skill_library WHERE skill_name = 'Tableau';

    -- 步骤17: 插入生涯规划 (career_plan)
    INSERT INTO career_plan (
        student_id, task_name, start_time, end_time, priority, 
        task_type, task_content, key_result, completion_status,
        target_skill_id, target_proficiency, learning_stage
    ) VALUES
    (
        @student_id, '深度学习技能提升计划', '2025-01-01 00:00:00', '2025-12-31 23:59:59', '高',
        '技能学习', '系统学习深度学习理论与实践，掌握CNN、RNN等常用神经网络模型', 
        '完成至少3个深度学习项目，掌握TensorFlow或PyTorch框架', '进行中',
        @deeplearning_skill_id, 'proficient', '中级'
    ),
    (
        @student_id, 'Tableau可视化技能提升', '2025-01-01 00:00:00', '2025-06-30 23:59:59', '中',
        '技能学习', '系统学习Tableau数据可视化工具，掌握仪表板制作和高级图表', 
        '使用Tableau完成至少5个复杂可视化项目', '未开始',
        @tableau_skill_id, 'proficient', '初级'
    );

    -- 步骤18: 插入学习时间 (study_time)
    INSERT INTO study_time (student_id, study_date, study_hours)
    VALUES
    (@student_id, '2025-02-20', 3.5),
    (@student_id, '2025-02-19', 2.0),
    (@student_id, '2025-02-18', 4.0),
    (@student_id, '2025-02-17', 2.5);

    -- 步骤19: 插入成就 (achievement)
    INSERT INTO achievement (student_id, achievement_name, obtain_time)
    VALUES
    (@student_id, '数据达人', '2025-02-18 10:00:00'),
    (@student_id, '学习新星', '2025-02-10 10:00:00'),
    (@student_id, '项目能手', '2025-01-25 10:00:00'),
    (@student_id, '实习先锋', '2024-09-30 10:00:00');

    -- 步骤20: 插入周任务 (weekly_task)
    INSERT INTO weekly_task (
        student_id, weekly_task_name, start_time, end_time, priority,
        task_type, completion_percentage, target_skill_id, current_proficiency_level
    ) VALUES (
        @student_id, '深度学习CNN理论学习与实践', '2025-02-17 00:00:00', '2025-02-23 23:59:59', '高',
        '学习任务', 60, @deeplearning_skill_id, 'basic'
    );
    
    SET @weekly_task_id = SCOPE_IDENTITY();

    -- 插入单任务 (daily_task)
    INSERT INTO daily_task (
        student_id, weekly_task_id, daily_task_name, start_time, end_time,
        priority, task_type, task_content, is_completed, 
        target_skill_id, current_proficiency_level
    ) VALUES
    (
        @student_id, @weekly_task_id, '学习CNN基本结构', '2025-02-17 09:00:00', '2025-02-17 12:00:00',
        '高', '理论学习', '学习卷积神经网络的基本结构和原理', 1, @deeplearning_skill_id, 'basic'
    ),
    (
        @student_id, @weekly_task_id, 'CNN代码实践', '2025-02-18 14:00:00', '2025-02-18 17:00:00',
        '高', '实践练习', '使用Python实现简单的CNN模型', 1, @deeplearning_skill_id, 'basic'
    ),
    (
        @student_id, @weekly_task_id, '优化CNN模型', '2025-02-20 09:00:00', '2025-02-20 12:00:00',
        '高', '实践练习', '优化CNN模型参数，提高准确率', 0, @deeplearning_skill_id, 'basic'
    );

    -- 步骤21: 获取行业ID
    SELECT @data_analyst_industry_id = industry_id FROM industry WHERE industry_name = '数据分析';
    SELECT @fintech_industry_id = industry_id FROM industry WHERE industry_name = '金融科技';
    SELECT @ai_industry_id = industry_id FROM industry WHERE industry_name = '人工智能';

    -- 插入职业数据 (job_library)
    MERGE INTO job_library AS target
    USING (VALUES
        ('数据分析师', @data_analyst_industry_id, '本科及以上', '全职', 'ICE', 
         '负责数据分析、业务洞察，使用数据驱动决策，需要掌握SQL、Python、统计学等技能'),
        ('数据工程师', @data_analyst_industry_id, '本科及以上', '全职', 'ICR', 
         '负责数据管道建设、数据处理和存储，需要掌握数据库、大数据技术等'),
        ('机器学习工程师', @ai_industry_id, '硕士及以上', '全职', 'IAR', 
         '负责机器学习模型开发与部署，需要掌握深度学习、算法等')
    ) AS source (job_title, industry_id, education_requirement, job_type, holland_code, job_description)
    ON target.job_title = source.job_title
    WHEN NOT MATCHED THEN
        INSERT (job_title, industry_id, education_requirement, job_type, holland_code, job_description)
        VALUES (source.job_title, source.industry_id, source.education_requirement, 
                source.job_type, source.holland_code, source.job_description)
    WHEN MATCHED THEN
        UPDATE SET job_description = source.job_description;

    -- 获取职业ID
    SELECT @data_analyst_job_id = job_id FROM job_library WHERE job_title = '数据分析师';
    SELECT @data_engineer_job_id = job_id FROM job_library WHERE job_title = '数据工程师';
    SELECT @ml_engineer_job_id = job_id FROM job_library WHERE job_title = '机器学习工程师';

    -- 获取技能ID
    SELECT @python_skill_id = skill_id FROM skill_library WHERE skill_name = 'Python';
    SELECT @sql_skill_id = skill_id FROM skill_library WHERE skill_name = 'SQL';
    SELECT @machine_learning_skill_id = skill_id FROM skill_library WHERE skill_name = '机器学习';
    SELECT @data_visualization_skill_id = skill_id FROM skill_library WHERE skill_name = '数据可视化';
    SELECT @deep_learning_skill_id = skill_id FROM skill_library WHERE skill_name = '深度学习';

    -- 插入数据分析师技能要求
    MERGE INTO job_skill_requirement AS target
    USING (VALUES
        (@data_analyst_job_id, @python_skill_id, 'proficient'),
        (@data_analyst_job_id, @sql_skill_id, 'proficient'),
        (@data_analyst_job_id, @machine_learning_skill_id, 'proficient'),
        (@data_analyst_job_id, @data_visualization_skill_id, 'proficient')
    ) AS source (job_id, skill_id, required_level)
    ON target.job_id = source.job_id AND target.skill_id = source.skill_id
    WHEN NOT MATCHED THEN
        INSERT (job_id, skill_id, required_level) VALUES (source.job_id, source.skill_id, source.required_level)
    WHEN MATCHED THEN
        UPDATE SET required_level = source.required_level;

    -- 插入机器学习工程师技能要求
    MERGE INTO job_skill_requirement AS target
    USING (VALUES
        (@ml_engineer_job_id, @python_skill_id, 'expert'),
        (@ml_engineer_job_id, @machine_learning_skill_id, 'expert'),
        (@ml_engineer_job_id, @deep_learning_skill_id, 'proficient')
    ) AS source (job_id, skill_id, required_level)
    ON target.job_id = source.job_id AND target.skill_id = source.skill_id
    WHEN NOT MATCHED THEN
        INSERT (job_id, skill_id, required_level) VALUES (source.job_id, source.skill_id, source.required_level)
    WHEN MATCHED THEN
        UPDATE SET required_level = source.required_level;

    -- 步骤22: 插入职业匹配记录 (job_match)
    INSERT INTO job_match (student_id, job_id, match_score, match_time)
    VALUES
    (@student_id, @data_analyst_job_id, 85.50, '2025-02-20 10:15:00'),
    (@student_id, @ml_engineer_job_id, 72.30, '2025-02-20 10:15:00');

    COMMIT TRANSACTION;

    -- 输出插入结果
    PRINT '数据插入完成';
    PRINT '用户ID: ' + CAST(@user_id AS VARCHAR(10));
    PRINT '学生ID: ' + CAST(@student_id AS VARCHAR(10));
    
    DECLARE @industry_count INT, @skill_count INT, @value_count INT;
    SELECT @industry_count = COUNT(*) FROM industry;
    SELECT @skill_count = COUNT(*) FROM skill_library;
    SELECT @value_count = COUNT(*) FROM values_library;
    
    PRINT '已插入行业数量: ' + CAST(@industry_count AS VARCHAR(10));
    PRINT '已插入技能数量: ' + CAST(@skill_count AS VARCHAR(10));
    PRINT '已插入价值观数量: ' + CAST(@value_count AS VARCHAR(10));

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '数据插入失败: ' + ERROR_MESSAGE();
END CATCH;