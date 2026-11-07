# 字段对照（旧库 → 新库终态）

> 由 `gen_field_map.py` 从实库元数据生成，非手写。

### `day_plans` → `day_plans`（现名 `daily_task`）

| 旧库列 | 旧类型 | 新库现列 | 现类型 | 动作 | 说明 |
|---|---|---|---|---|---|
| `day_plan_id` | int NOT NULL | — | — | 改名 | 现名 daily_task_id |
| `day_plan_name` | nvarchar(50) NOT NULL | — | — | 改名 | 现名 daily_task_name |
| `day_plan_describe` | nvarchar(max) | — | — | 改名 | 现名 task_content |
| `day_plan_prority` | tinyint NOT NULL | — | — | 改名 | 现名 priority（varchar 高/中/低 → tinyint 1/2/3） |
| `day_plan_ddl` | datetime NOT NULL | — | — | 改名 | 现名 end_time |
| `day_plan_finish` | tinyint NOT NULL | — | — | 改名 | 现名 is_completed（bit → tinyint） |
| `student_id` | int NOT NULL | `student_id` | int NOT NULL | 同名保留 |  |

新库独有列（**保留不删**，旧库无值，迁移后为 NULL 或默认值）：

| 列 | 类型 |
|---|---|
| `daily_task_id` | int NOT NULL |
| `weekly_task_id` | int |
| `daily_task_name` | varchar(200) NOT NULL |
| `start_time` | datetime |
| `end_time` | datetime |
| `priority` | varchar(10) |
| `task_type` | varchar(50) |
| `task_content` | text |
| `is_completed` | bit |
| `target_skill_id` | int |
| `current_proficiency_level` | varchar(20) |

### `holland_tests` → `holland_test_results`（现名 `holland_assessment`）

| 旧库列 | 旧类型 | 新库现列 | 现类型 | 动作 | 说明 |
|---|---|---|---|---|---|
| `holland_test_id` | int NOT NULL | — | — | 改名 | 现名 holland_id |
| `student_id` | int NOT NULL | `student_id` | int NOT NULL | 同名保留 |  |
| `holland_R` | tinyint NOT NULL | — | — | 改名 | 现名 r_score |
| `holland_I` | tinyint NOT NULL | — | — | 改名 | 现名 i_score |
| `holland_A` | tinyint NOT NULL | — | — | 改名 | 现名 a_score |
| `holland_S` | tinyint NOT NULL | — | — | 改名 | 现名 s_score |
| `holland_E` | tinyint NOT NULL | — | — | 改名 | 现名 e_score |
| `holland_C` | tinyint NOT NULL | — | — | 改名 | 现名 c_score |
| `holland_test_time` | datetime NOT NULL | — | — | 改名 | 现名 test_time |

新库独有列（**保留不删**，旧库无值，迁移后为 NULL 或默认值）：

| 列 | 类型 |
|---|---|
| `holland_id` | int NOT NULL |
| `test_time` | datetime NOT NULL |
| `r_score` | int NOT NULL |
| `i_score` | int NOT NULL |
| `a_score` | int NOT NULL |
| `s_score` | int NOT NULL |
| `e_score` | int NOT NULL |
| `c_score` | int NOT NULL |

### `job_skill_requirements` → `job_skill_requirements`（现名 `job_skill_requirement`）

| 旧库列 | 旧类型 | 新库现列 | 现类型 | 动作 | 说明 |
|---|---|---|---|---|---|
| `requirement_id` | int NOT NULL | `requirement_id` | int NOT NULL | 同名保留 | 主键，自增 |
| `job_id` | int NOT NULL | `job_id` | int NOT NULL | 同名保留 |  |
| `skill_id` | int NOT NULL | `skill_id` | int NOT NULL | 同名保留 |  |
| `required_level` | tinyint | `required_level` | varchar(20) NOT NULL | 改名＋改类型 | varchar「basic/proficient/expert」→ tinyint 3/4/5 |
| `requirement_type` | nvarchar(10) | — | — | 新增列 | 必需/加分 |

### `jobs` → `jobs`（现名 `job_library`）

| 旧库列 | 旧类型 | 新库现列 | 现类型 | 动作 | 说明 |
|---|---|---|---|---|---|
| `job_id` | int NOT NULL | `job_id` | int NOT NULL | 同名保留 | 主键，自增 |
| `company_id` | int NOT NULL | — | — | 新增列 | 必需，FK→companies |
| `job_title` | nvarchar(100) NOT NULL | `job_title` | varchar(100) NOT NULL | 改名＋改类型 | nvarchar(100)→varchar(100) |
| `job_type` | nvarchar(20) | `job_type` | varchar(50) | 改名＋改类型 | nvarchar(20)→varchar(50) |
| `salary_range` | nvarchar(50) | — | — | 新增列 | 薪资区间 |

新库独有列（**保留不删**，旧库无值，迁移后为 NULL 或默认值）：

| 列 | 类型 |
|---|---|
| `industry_id` | int |
| `education_requirement` | varchar(50) |
| `holland_code` | char(6) |
| `job_description` | text |

### `matching_results` → `matching_results`（现名 `job_match`）

| 旧库列 | 旧类型 | 新库现列 | 现类型 | 动作 | 说明 |
|---|---|---|---|---|---|
| `match_id` | int NOT NULL | `match_id` | int NOT NULL | 同名保留 | 主键，自增 |
| `student_id` | int NOT NULL | `student_id` | int NOT NULL | 同名保留 |  |
| `job_id` | int NOT NULL | `job_id` | int NOT NULL | 同名保留 |  |
| `match_score` | decimal(5,2) | `match_score` | decimal(5,2) NOT NULL | 放宽约束 | 新库 NOT NULL → 放宽为 NULL（旧库存在空分） |

新库独有列（**保留不删**，旧库无值，迁移后为 NULL 或默认值）：

| 列 | 类型 |
|---|---|
| `match_time` | datetime NOT NULL |

### `skills` → `skills`（现名 `skill_library`）

| 旧库列 | 旧类型 | 新库现列 | 现类型 | 动作 | 说明 |
|---|---|---|---|---|---|
| `skill_id` | int NOT NULL | `skill_id` | int NOT NULL | 同名保留 | 主键，自增 |
| `skill_name` | nvarchar(50) NOT NULL | `skill_name` | varchar(100) NOT NULL | 改名＋改类型 | nvarchar(50)→varchar(100)，需转 nvarchar 保中文 |
| `skill_category` | nvarchar(20) | `skill_category` | varchar(50) | 改名＋改类型 | nvarchar(20)→varchar(50) |
| `skill_description` | nvarchar(max) | — | — | 改名 | 现名 description |

新库独有列（**保留不删**，旧库无值，迁移后为 NULL 或默认值）：

| 列 | 类型 |
|---|---|
| `description` | text |

### `students` → `students`（现名 `student_info`）

| 旧库列 | 旧类型 | 新库现列 | 现类型 | 动作 | 说明 |
|---|---|---|---|---|---|
| `student_id` | int NOT NULL | `student_id` | int NOT NULL | 同名保留 | 主键，自增 |
| `student_name` | nvarchar(50) | — | — | 改名 | 现名 name |
| `student_major` | nvarchar(50) | — | — | 改名 | 现名 major |
| `grade` | tinyint | `grade` | varchar(20) | 改名＋改类型 | tinyint 2/3/4 → varchar「大二/大三/大四」 |
| `gpa` | decimal(3,2) | `gpa` | decimal(3,2) | 改名＋改类型 | decimal(3,1)→(3,2)，值域 3.1–3.9 无损 |
| `user_id` | int | `user_id` | int NOT NULL | 放宽约束 | 新库 NOT NULL → 放宽为 NULL（防注册 515） |

新库独有列（**保留不删**，旧库无值，迁移后为 NULL 或默认值）：

| 列 | 类型 |
|---|---|
| `name` | varchar(50) NOT NULL |
| `student_number` | varchar(30) NOT NULL |
| `gender` | varchar(10) |
| `birthday` | date |
| `email` | varchar(100) NOT NULL |
| `phone` | varchar(20) |
| `major` | varchar(100) |
| `university` | varchar(100) |
| `bio` | text |
| `avatar_url` | varchar(500) |
| `enrollment_year` | int |
| `expected_graduation` | date |
| `gaokao_score` | int |
| `current_location` | varchar(100) |
| `desired_location` | varchar(100) |
| `desired_industry_id` | int |

### `users_login` → `users_login`（现名 `user`）

| 旧库列 | 旧类型 | 新库现列 | 现类型 | 动作 | 说明 |
|---|---|---|---|---|---|
| `user_id` | int NOT NULL | `user_id` | int NOT NULL | 同名保留 | 主键，自增 |
| `user_name` | nvarchar(50) NOT NULL | — | — | 新增列 | 接口登录名（stu_0001…） |
| `password_hash` | nvarchar(20) NOT NULL | `password_hash` | varchar(255) NOT NULL | 改名＋改类型 | 明文 `passwd123` → SHA-256(64 字符)；列宽 20→255 |
| `user_email` | nvarchar(40) NOT NULL | — | — | 改名 | 现名 email |
| `user_status` | tinyint NOT NULL | — | — | 新增列 | 默认 1=启用 |
| `user_created_time` | datetime2 NOT NULL | — | — | 改名 | 现名 create_time |
| `last_Login_time` | datetime2 | — | — | 改名 | 现名 last_login_time，仅大小写不同 |
| `user_remark` | nvarchar(500) | — | — | 新增列 | 备注，可空 |

新库独有列（**保留不删**，旧库无值，迁移后为 NULL 或默认值）：

| 列 | 类型 |
|---|---|
| `email` | varchar(100) NOT NULL |
| `create_time` | datetime NOT NULL |
| `last_login_time` | datetime |

### `week_plans` → `week_plans`（现名 `weekly_task`）

| 旧库列 | 旧类型 | 新库现列 | 现类型 | 动作 | 说明 |
|---|---|---|---|---|---|
| `week_plan_id` | int NOT NULL | — | — | 改名 | 现名 weekly_task_id |
| `week_plan_name` | nvarchar(50) NOT NULL | — | — | 改名 | 现名 weekly_task_name |
| `week_plan_start` | datetime NOT NULL | — | — | 改名 | 现名 start_time |
| `week_plan_ddl` | datetime NOT NULL | — | — | 改名 | 现名 end_time |
| `week_plan_finish` | tinyint NOT NULL | — | — | 新增列 | 0/1，由 completion_percentage 折算 |
| `student_id` | int NOT NULL | `student_id` | int NOT NULL | 同名保留 |  |

新库独有列（**保留不删**，旧库无值，迁移后为 NULL 或默认值）：

| 列 | 类型 |
|---|---|
| `weekly_task_id` | int NOT NULL |
| `weekly_task_name` | varchar(200) NOT NULL |
| `start_time` | datetime |
| `end_time` | datetime |
| `priority` | varchar(10) |
| `task_type` | varchar(50) |
| `completion_percentage` | tinyint |
| `target_skill_id` | int |
| `current_proficiency_level` | varchar(20) |

### `work_values` → `career_values`（现名 `value_assessment`）

| 旧库列 | 旧类型 | 新库现列 | 现类型 | 动作 | 说明 |
|---|---|---|---|---|---|
| `worth_id` | int NOT NULL | — | — | 改名 | 现名 value_assess_id |
| `student_id` | int NOT NULL | `student_id` | int NOT NULL | 同名保留 |  |
| `social_contribution` | tinyint NOT NULL | — | — | 新增列 | 宽表列，新库只有主从结构 |
| `achievement_oriented` | tinyint NOT NULL | — | — | 新增列 | 同上 |
| `safe_stable` | tinyint NOT NULL | — | — | 新增列 | 同上 |
| `work_life_balance` | tinyint NOT NULL | — | — | 新增列 | 同上 |
| `power_status` | tinyint NOT NULL | — | — | 新增列 | 同上 |
| `innovation_challenge` | tinyint NOT NULL | — | — | 新增列 | 同上 |
| `worth_test_time` | datetime NOT NULL | — | — | 改名 | 现名 test_time |

新库独有列（**保留不删**，旧库无值，迁移后为 NULL 或默认值）：

| 列 | 类型 |
|---|---|
| `value_assess_id` | int NOT NULL |
| `test_time` | datetime NOT NULL |

### `companies` → `companies`（新库无此表，新建）

| 旧库列 | 旧类型 | 新库现列 | 现类型 | 动作 | 说明 |
|---|---|---|---|---|---|
| `company_id` | int NOT NULL | — | — | **新增列** | 新库无对应 |
| `company_name` | nvarchar(100) NOT NULL | — | — | **新增列** | 新库无对应 |
| `company_location` | nvarchar(50) | — | — | **新增列** | 新库无对应 |
| `company_size` | nvarchar(20) | — | — | **新增列** | 新库无对应 |
| `company_description` | nvarchar(max) | — | — | **新增列** | 新库无对应 |

### `experiences` → `experiences`（新库无此表，新建）

| 旧库列 | 旧类型 | 新库现列 | 现类型 | 动作 | 说明 |
|---|---|---|---|---|---|
| `experience_id` | int NOT NULL | — | — | **新增列** | 新库无对应 |
| `student_id` | int NOT NULL | — | — | **新增列** | 新库无对应 |
| `experience_title` | nvarchar(100) NOT NULL | — | — | **新增列** | 新库无对应 |
| `experience_content` | nvarchar(max) | — | — | **新增列** | 新库无对应 |
| `experience_type` | varchar(50) NOT NULL | — | — | **新增列** | 新库无对应 |
| `experience_role` | varchar(50) | — | — | **新增列** | 新库无对应 |
| `experience_start_time` | date NOT NULL | — | — | **新增列** | 新库无对应 |
| `experience_end_time` | date | — | — | **新增列** | 新库无对应 |
| `updated_time` | datetime | — | — | **新增列** | 新库无对应 |

### `student_preferences` → `student_preferences`（新库无此表，新建）

| 旧库列 | 旧类型 | 新库现列 | 现类型 | 动作 | 说明 |
|---|---|---|---|---|---|
| `preference_id` | int NOT NULL | — | — | **新增列** | 新库无对应 |
| `student_id` | int NOT NULL | — | — | **新增列** | 新库无对应 |
| `preferred_industries` | nvarchar(max) | — | — | **新增列** | 新库无对应 |
| `preferred_locations` | nvarchar(max) | — | — | **新增列** | 新库无对应 |
| `expected_salary` | nvarchar(50) | — | — | **新增列** | 新库无对应 |
| `work_mode_preference` | nvarchar(20) | — | — | **新增列** | 新库无对应 |

### `student_skills` → `student_skills`（新库无此表，新建）

| 旧库列 | 旧类型 | 新库现列 | 现类型 | 动作 | 说明 |
|---|---|---|---|---|---|
| `skill_record_id` | int NOT NULL | — | — | **新增列** | 新库无对应 |
| `student_id` | int NOT NULL | — | — | **新增列** | 新库无对应 |
| `skill_id` | int NOT NULL | — | — | **新增列** | 新库无对应 |
| `proficiency_level` | tinyint | — | — | **新增列** | 新库无对应 |
| `experience_months` | int | — | — | **新增列** | 新库无对应 |

## 统计

| 动作 | 列数 |
|---|---|
| 同名保留 | 14 |
| 改名 | 26 |
| 改名＋改类型 | 8 |
| 新增列 | 38 |
| 放宽约束 | 2 |
| 新库独有（保留） | 55 |