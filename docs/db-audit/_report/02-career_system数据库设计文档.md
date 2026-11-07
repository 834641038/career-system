# career_system 数据库设计文档

> 编制时间：2026-11-03
> 数据库实例：`localhost` / SQL Server 2022 Express（16.0.1150.1）
> 物理文件：`D:\Database_anjiu\career_system\career_system.mdf`
> 规模：**24 张表 / 82 行 / 30 个外键**
> 字符集：`varchar`（库排序规则按实例默认，中文建议改 `nvarchar`，见 §7.3）
> 本文档由实库元数据直接导出，**不是**从 `createtable(1).sql` 转述

---

## 1. 一句话定位

`career_system` 是**按「学生成长档案」建模的规范化库**：一个学生一条主线（`student_info`），向下挂测评、技能、经历、成果、计划五类档案；岗位侧用「行业 + 岗位库 + 技能要求 + 价值观要求」四层描述需求；匹配结果单独落表。

它和 `career_recommendation`（原型库）的根本差别：**原型库是按「算分方便」设计的扁平淡表，本库是按「长期记录」设计的规范化表。** 例如价值观，原型库是 1 张宽表 6 个分数列；本库是 `values_library`（字典）+ `value_assessment`（一次测评）+ `value_assessment_detail`（每条一分）三层。

---

## 2. 六个功能域

```
① 账户域      user
                 └── 1:1 ── student_info ──┐
② 测评域      holland_assessment          │
              value_assessment ─ detail   │
              skill_assessment ─ detail   │
③ 能力域      skill_library ←─────────────┤ (被技能/岗位/任务引用)
④ 经历域      internship_experience       │
              project_experience          │
              campus_activity             │
              certificate / achievement   │
              competition_award           │
⑤ 目标域      industry ← job_library ─ job_skill_requirement
                                     └ job_value_requirement
              job_match（学生 × 岗位 打分结果）
⑥ 计划域      career_plan  ─┐
              weekly_task ──┼── daily_task
              study_time    ┘
```

**主线只有一条：`student_info.student_id`。** 24 张表里有 **14 张**直接以它为外键。

---

## 3. 实体关系（30 条外键的核心链路）

```
user(user_id) ──1:1──> student_info(user_id)
                          │
                          ├─1:N─> holland_assessment         (兴趣测评)
                          ├─1:N─> skill_assessment ─1:N─> skill_assessment_detail ─N:1─> skill_library
                          ├─1:N─> value_assessment ─1:N─> value_assessment_detail ─N:1─> values_library
                          ├─1:N─> internship_experience
                          ├─1:N─> project_experience
                          ├─1:N─> campus_activity
                          ├─1:N─> certificate / achievement / competition_award
                          ├─1:N─> study_time
                          ├─1:N─> career_plan ─N:1─> skill_library(target_skill_id)
                          ├─1:N─> weekly_task ─1:N─> daily_task ─N:1─> skill_library
                          └─1:N─> job_match ─N:1─> job_library
                                                     │
industry(industry_id) ─1:N─> job_library ─1:N─> job_skill_requirement ─N:1─> skill_library
                                         └─1:N─> job_value_requirement ─N:1─> values_library
```

三条容易被忽略的：
1. `student_info.user_id` 是 **NOT NULL + 指向 `user`**，即「先有账号才有档案」。
2. `student_info.desired_industry_id` 指向 `industry`，**只存一个行业**（原型库是逗号分隔多值）。
3. `daily_task.weekly_task_id` **可空**，即允许有「不归属任何周计划」的散任务。

---

## 4. 逐表字典

### 4.1 账户域（2 张）

#### `user` — 登录账户　`rows=1`
| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| user_id | int | PK | 主键，**IDENTITY 自增** |
| email | varchar(100) | NOT NULL | 登录名（**没有 username 列**） |
| password_hash | varchar(255) | NOT NULL | 长度足够放 bcrypt(60)/SHA-256(64) |
| create_time | datetime | NOT NULL，默认 `getdate()` | 注册时间 |
| last_login_time | datetime | NULL | 最后登录 |

> 现有 1 行：`zhangsan_ds@csu.edu.cn`，`password_hash` 是 `$2y$10$EXAMPLEHASHEXAMPLE...`——**占位示例，不是真实哈希，登不进去**。

#### `student_info` — 学生档案　`rows=1`
| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| student_id | int | PK，IDENTITY 自增 | 学生主键 |
| user_id | int | NOT NULL，FK→`user.user_id` | 一账号一档案 |
| name | varchar(50) | NOT NULL | 姓名 |
| student_number | varchar(30) | NOT NULL | 学号 |
| gender / birthday | varchar(10) / date | NULL | |
| email / phone | varchar(100) / varchar(20) | email NOT NULL | 联系方式 |
| major / university | varchar(100) | NULL | 专业 / 学校 |
| bio / avatar_url | text / varchar(500) | NULL | 简介 / 头像 |
| enrollment_year | int | NULL | 入学年 |
| expected_graduation | date | NULL | 预计毕业 |
| grade | varchar(20) | NULL | 年级，**字符串**（如「大三」），非数字 |
| gaokao_score | int | NULL | 高考分 |
| gpa | decimal(3,2) | NULL | 绩点，上限 9.99 |
| current_location / desired_location | varchar(100) | NULL | 现居 / 意向城市（**单值**） |
| desired_industry_id | int | FK→`industry` | 意向行业（**单值**） |

**设计评价**：20 个字段把「学籍 + 联系方式 + 求职意向」混在一张表。原型库把意向单独拆成 `student_preferences`，本库没拆——这直接导致「多选行业/多选城市」无处存放（见 §7.2）。

---

### 4.2 测评域（6 张）

#### `holland_assessment` — 霍兰德兴趣测评　`rows=1`
| 字段 | 类型 | 约束 |
|---|---|---|
| holland_id | int | PK，IDENTITY 自增 |
| student_id | int | NOT NULL，FK |
| test_time | datetime | NOT NULL，默认 `getdate()` |
| r_score / i_score / a_score / s_score / e_score / c_score | int | 全 NOT NULL |

> 六个 `int`（0-100 分制），比原型库的 `tinyint`(0-255) 更明确。**字段名小写，无 `holland_` 前缀**——这是与接口不兼容的关键点之一。

#### `skill_assessment` — 技能测评（主表）　`rows=1`
| 字段 | 类型 | 约束 |
|---|---|---|
| skill_assess_id | int | PK，IDENTITY 自增 |
| student_id | int | NOT NULL，FK |
| test_time | datetime | NOT NULL，默认 `getdate()` |

#### `skill_assessment_detail` — 技能测评明细　`rows=15`
| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| detail_id | int | PK，IDENTITY 自增 | |
| skill_assess_id | int | NOT NULL，FK→主表 | **没有 student_id** |
| skill_id | int | NOT NULL，FK→`skill_library` | |
| proficiency_level | varchar(20) | NOT NULL | **字符串**：`beginner/intermediate/proficient/expert` |
| self_score | int | NULL | 自评分 |

#### `value_assessment` — 价值观测评（主表）　`rows=1`
| 字段 | 类型 | 约束 |
|---|---|---|
| value_assess_id | int | PK，IDENTITY 自增 |
| student_id | int | NOT NULL，FK |
| test_time | datetime | NOT NULL，默认 `getdate()` |

#### `value_assessment_detail` — 价值观明细　`rows=5`
| 字段 | 类型 | 约束 |
|---|---|---|
| detail_id | int | PK，IDENTITY 自增 |
| value_assess_id | int | NOT NULL，FK→主表 |
| value_id | int | NOT NULL，FK→`values_library` |
| score | int | NOT NULL |

#### `values_library` — 价值观字典　`rows=5`
`value_id, value_name, description`。现有 5 条：

| id | 名称 |
|---|---|
| 1 | 创新性 |
| 2 | 技术成长 |
| 3 | 社会价值 |
| 4 | 稳定性 |
| 5 | 薪资回报 |

> ⚠️ 这套词表与原型库的六维度（社会贡献 / 成就导向 / 安全稳定 / 工作生活平衡 / 权力地位 / 创新挑战）**不是同一套**，只有「稳定性≈安全稳定」「创新性≈创新挑战」勉强对应。

---

### 4.3 能力域（1 张字典）

#### `skill_library` — 技能字典　`rows=15`
`skill_id, skill_name, skill_category, description`。15 条分 5 类：

| 分类 | 技能 |
|---|---|
| 编程语言 | Java、JavaScript、Python、R、SQL |
| 数据库工具 | MySQL |
| 数据分析工具 | Pandas |
| 数据可视化工具 | Matplotlib/Seaborn、Tableau |
| 机器学习工具 | Scikit-learn |
| 数据分析 | 机器学习、深度学习、数据可视化、数据清洗、统计分析 |

> 分类粒度不齐：「Python」在「编程语言」，「Pandas」在「数据分析工具」，但「数据可视化」既是分类名又是技能名。

---

### 4.4 经历域（6 张）

共同点：**全部以 `student_id` 为外键，全部有 `start_date`，`end_date` 可空**（= 至今）。**没有统一的经历主键，也没有「经历类型」列**——类型由「在哪个表」隐式表达。

| 表 | 行数 | 主键 | 特有字段 |
|---|---|---|---|
| `internship_experience` | 1 | internship_id | `location`(NOT NULL)、`position`、`description` |
| `project_experience` | 2 | project_id | `project_name`(NOT NULL)、`role`、`description` |
| `campus_activity` | 0 | activity_id | `campus_role`(NOT NULL)、`responsibility` |
| `certificate` | 2 | certificate_id | `certificate_name`(NOT NULL)、`obtain_date` |
| `achievement` | 4 | achievement_id | `achievement_name`、`obtain_time`（默认 getdate） |
| `competition_award` | 2 | award_id | `competition_name`、`competition_level`、`award_level` |

> 注意：`certificate` / `achievement` / `competition_award` 三张都是「获得物」，字段高度相似却分成三表；而 `internship` / `project` / `campus_activity` 三张是「做过的事」，标题字段分别叫 `position` / `project_name` / `campus_role`。

---

### 4.5 目标域（5 张）

#### `industry` — 行业字典　`rows=4`
| id | 行业 |
|---|---|
| 1 | 互联网 |
| 2 | 金融科技 |
| 3 | 人工智能 |
| 4 | 数据分析 |

#### `job_library` — 岗位库　`rows=3`
| 字段 | 类型 | 说明 |
|---|---|---|
| job_id | int PK IDENTITY 自增 | |
| job_title | varchar(100) NOT NULL | 岗位名 |
| industry_id | int FK→`industry` | 行业 |
| education_requirement | varchar(50) | 「本科及以上」 |
| job_type | varchar(50) | 「实习/全职」 |
| holland_code | char(6) | **六位霍兰德代码**，如 `'ICE   '`（**定长，右侧补空格**） |
| job_description | text | |

> ⚠️ **没有 `company` 表、没有 `company_id`、没有 `salary_range`**。岗位直接挂行业，企业信息无处存放。

#### `job_skill_requirement` — 岗位技能要求　`rows=7`
| 字段 | 类型 | 说明 |
|---|---|---|
| requirement_id | int PK | |
| job_id | int NOT NULL FK | |
| skill_id | int NOT NULL FK | |
| required_level | varchar(20) NOT NULL | `proficient` / `expert`（**字符串档位**） |

> ⚠️ **没有「必需/加分」标识列**（原型库有 `requirement_type`）。

#### `job_value_requirement` — 岗位价值观要求　`rows=0`
`requirement_id, job_id, value_id, expected_score_level`。**空表**，但结构上补上了原型库完全没有的「岗位价值观要求」。

#### `job_match` — 匹配结果　`rows=2`
| 字段 | 类型 | 说明 |
|---|---|---|
| match_id | int PK IDENTITY 自增 | |
| student_id / job_id | int NOT NULL FK | |
| match_score | decimal(5,2) NOT NULL | 0-999.99，**不允许空** |
| match_time | datetime NOT NULL，默认 `getdate()` | 原型库无此列 |

---

### 4.6 计划域（4 张）

#### `career_plan` — 职业规划（长期任务）　`rows=2`
| 字段 | 类型 | 说明 |
|---|---|---|
| plan_id | int PK | |
| student_id | int NOT NULL FK | |
| task_name | varchar(200) NOT NULL | 计划名 |
| start_time / end_time | datetime NULL | |
| priority | varchar(10) | **中文**：「高/中/低」 |
| task_type | varchar(50) | |
| task_content / key_result | text | 内容 / 关键结果（OKR 风格） |
| completion_status | varchar(10) | 「未开始/进行中/已完成」 |
| target_skill_id | int FK→`skill_library` | 关联技能 |
| target_proficiency | varchar(20) | 目标档位 |
| learning_stage | varchar(50) | 「初级/中级/高级」 |

现有 2 行：「深度学习技能提升计划」（高/进行中/中级）、「Tableau可视化技能提升」（中/未开始/初级）。

#### `weekly_task` — 周计划　`rows=1`
`weekly_task_id, student_id, weekly_task_name, start_time, end_time, priority(默认'中'), task_type, completion_percentage(tinyint 默认0), target_skill_id, current_proficiency_level`

> 完成度是 **0-100 百分比**，不是原型库的 0/1 布尔。

#### `daily_task` — 日任务　`rows=3`
`daily_task_id, student_id, weekly_task_id(可空), daily_task_name, start_time, end_time, priority(默认'中'), task_type, task_content, is_completed(bit 默认0), target_skill_id, current_proficiency_level`

> 日任务用 `is_completed bit`，周任务用 `completion_percentage tinyint`——**同一套体系里两种完成度表达**。

#### `study_time` — 学习时长　`rows=4`
`study_record_id, student_id, study_date, study_hours decimal(4,2)`。原型库没有这张表，是本库独有的「投入度量」。

---

## 5. 设计特征与必须注意的三条

### 5.1 所有主键都是 **IDENTITY 自增**
24 张表、24 个主键，逐列查 `sys.columns.is_identity` 结果**全部为 1**，种子 1、增量 1。**插入时不需要由应用给 ID，数据库会自增生成。**

> 这里更正本文档早期版本的一处错误：早期用跨库 `OBJECT_ID()` + `COLUMNPROPERTY` 判断，`OBJECT_ID()` 在非当前库上下文里返回 `NULL`，导致 `IsIdentity` 被误判为 0，于是写成了「全部非自增、INSERT 必报 NULL」。实测并非如此。

**对接口的影响**：`database_interface.py` 的 15 处 INSERT 都不写主键，本库**支持**这种做法，不会报「不能将 NULL 插入列」。当前接口在本库跑不通的原因不是主键，而是**表名/列名不匹配**（58 条 SQL 里 55 条「对象名无效」）。

### 5.2 所有表都有主键，外键 30 条，但 `ON DELETE` 未细查
外键齐全（原型库 13 条，本库 30 条），引用完整性比原型库强。但删除策略需在应用层处理（测评主表删除会牵连明细）。

### 5.3 值域用**中文字符串**而不是枚举/整数
| 表 | 列 | 实际取值 |
|---|---|---|
| `career_plan` | priority | 高 / 中 / 低 |
| `career_plan` | completion_status | 未开始 / 进行中 / 已完成 |
| `career_plan` | learning_stage | 初级 / 中级 / 高级 |
| `daily_task` | priority | 中（默认） |
| `job_skill_requirement` | required_level | proficient / expert |
| `skill_assessment_detail` | proficiency_level | beginner / intermediate / proficient / expert |

问题：**优先级一处中文、技能档位一处英文**；且没有 CHECK 约束，拼错不会被拦。

---

## 6. 与旧库 `career_recommendation` 的表级对照

| 业务对象 | `career_recommendation`（14 表） | `career_system`（24 表） | 关系 |
|---|---|---|---|
| 账户 | `users_login`（含 user_name/user_status/remark） | `user`（只有 email） | **精简**，丢了 3 列 |
| 学生 | `students`（5 业务列） | `student_info`（20 列） | **扩写** |
| 意向 | `student_preferences`（独立表，多值逗号串） | `student_info` 内 2 列（单值） | **降级**：多值→单值 |
| 兴趣测评 | `holland_tests` | `holland_assessment` | 同构，列名不同 |
| 价值观 | `work_values`（1 宽表 6 分数列） | `values_library` + `value_assessment` + `_detail` | **列转行**，且词表不同 |
| 技能 | `skills` + `student_skills`（直接多对多） | `skill_library` + `skill_assessment` + `_detail` | **加了测评轮次** |
| 经历 | `experiences`（1 表 + type 列） | 6 张表分列 | **拆表** |
| 企业 | `companies`（9 行） | **无** | **缺失** |
| 岗位 | `jobs`（含 company_id、salary_range） | `job_library`（含 holland_code、education_requirement） | **互换字段**：丢企业/薪资，得霍兰德代码 |
| 岗位技能 | `job_skill_requirements`（含 requirement_type） | `job_skill_requirement`（无 type） | 少了必需/加分 |
| 岗位价值观 | **无** | `job_value_requirement` | 新增 |
| 匹配 | `matching_results`（93 行） | `job_match`（2 行，多 match_time） | 同构 |
| 计划 | `day_plans` + `week_plans` | `career_plan` + `weekly_task` + `daily_task` | **三层**，多了长期规划 |
| 学习时长 | **无** | `study_time` | 新增 |

**一句话**：本库在「档案记录」上更强（测评轮次、经历分类、学习时长、长期规划），在「算分所需」上更弱（无企业、无薪资、无必需/加分、无多值意向、无兴趣权重）。

---

## 7. 数据现状与四个缺口

### 7.1 现有数据（82 行，仅供演示）
1 个用户、1 个学生、3 个岗位、15 个技能、1 次兴趣测评、1 次技能测评(15 条明细)、1 次价值观测评(5 条明细)、2 条匹配、2 条规划。

### 7.2 结构性缺口（缺列/缺表，不是缺数据）

| # | 缺什么 | 影响 | 建议 |
|---|---|---|---|
| 1 | 无 `company` 表 | 推荐结果无法显示企业名；接口 3 条 SQL 断链 | 新增 `company(company_id, company_name, location, size, description)`，`job_library` 加 `company_id` |
| 2 | 无 `salary_range` | 岗位薪资无法展示/筛选 | `job_library` 加 `salary_range` |
| 3 | 无「必需/加分」标识 | 技能匹配无法区分主次（算法里必需占 70%） | `job_skill_requirement` 加 `requirement_type` |
| 4 | 意向行业/城市为单值 | 学生只能选 1 个行业、1 个城市 | 抽 `student_preference` 表，或加关联表 |

### 7.3 数据类型隐患
- 中文内容全用 `varchar` 而非 `nvarchar`。若实例排序规则非 `Chinese_PRC_CI_AS`，存中文可能变 `?`。**建议核对并改 `nvarchar`。**
- `holland_code char(6)` 定长右补空格，取值需 `TRIM`。
- `gpa decimal(3,2)` 上限 9.99，容得下 4.0/5.0 制，但容不下百分制均分（如 85.5）。

---

## 8. 结论

| 维度 | 评价 |
|---|---|
| 规范化程度 | **高**，24 表 30 外键，测评/计划都做了主从拆分 |
| 与论文设计一致性 | **高**（对应 `createtable(1).sql`） |
| 与现有代码兼容性 | **极低**，接口 58 条 SQL 里 55 条在本库不成立 |
| 数据完备度 | **低**，82 行演示数据，`password_hash` 是占位符 |
| 直接上线可用性 | **需适配**：主键自增没问题，真正的障碍是**企业表缺失、字段命名与接口不一致、无课程/路径表** |

**建议定位**：本库作为**论文的正式数据模型**保留，作为「目标态」；`career_recommendation` 作为「当前可运行态」，用 7 处 DDL + 1 处权限对齐接口后即可使用。新库若也要承载接口，推荐加一层 `api` schema 兼容表 + 同义词（见《04-改动方案与修改记录》第 5 节），**不改本库这 24 张表**。
