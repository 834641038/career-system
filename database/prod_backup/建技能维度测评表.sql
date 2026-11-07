-- 测评入库扩展表：技能维度测评（技术/思维/学习/软技能/管理/创意/行业 七维）
-- 幂等脚本，可重复执行
IF OBJECT_ID('skill_dimension_assessments', 'U') IS NULL
BEGIN
    CREATE TABLE skill_dimension_assessments (
        assessment_id   INT IDENTITY(1,1) PRIMARY KEY,
        student_id      INT NOT NULL,
        major           NVARCHAR(120) NULL,
        technical       TINYINT NULL,
        thinking        TINYINT NULL,
        learning        TINYINT NULL,
        soft            TINYINT NULL,
        management      TINYINT NULL,
        creative        TINYINT NULL,
        industry        TINYINT NULL,
        overall         TINYINT NULL,
        assess_time     DATETIME NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX IX_skill_dim_student ON skill_dimension_assessments(student_id, assess_time DESC);
    PRINT 'skill_dimension_assessments 已创建';
END
ELSE
BEGIN
    PRINT 'skill_dimension_assessments 已存在，跳过';
END
GO
