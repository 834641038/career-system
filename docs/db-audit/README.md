# docs/db-audit —— 数据库接口对齐核查材料（归档）

> 归档时间：2026-11-07
> 来源：外部快照包 `新增文件（待确认）\career-system-main_源码未动版_20261107(1)\career-system-main`
> 性质：**只归档、不参与运行**。本目录不是当前系统的代码依赖，删掉不影响任何服务。

---

## 一、这套材料是什么

2026-11-03 ~ 11-04，在**另一台机器**上对"大学生职业规划系统"后端 `database_interface.py`
做的一次完整的数据库核查与迁移方案设计，产物包括：

- 10 份编号报告（核查 → 方案 → 验证 → 决策 → 复核）
- 12 个取证/预演脚本（全部只读，或写库操作在事务内执行后 `ROLLBACK`）
- 12 个 JSON 取证结果（脚本输出，可删，重跑会重新生成）
- 91 个接口字段对两套库的逐行对照表

**结论摘要**：接口默认连的 `career_recommendation` 库只有 2 个表名 / 2 个字段名不匹配；
另一套规范化设计的 `career_system` 库（24 表）则不能靠"改名"解决，需要 10 张改名 + 4 张新建 + 数据迁移；
且 50 个业务方法里只有 6 个被 API 真正调用过，系统长期跑在内存样本数据模式。

---

## 二、⚠️ 使用前必读：数值口径与本机不一致

这套报告的实测数据来自**另一台机器**，与本项目当前环境不是同一个库状态：

| 项 | 报告中的机器 | 本项目当前环境 |
|---|---|---|
| SQL Server | 2022 Express 16.0.1150.1 | 2019（本机 localhost） |
| `career_recommendation` | 14 表 / 296 行 / 20 学生 23 岗位 93 匹配 | **19 表**（由 `database/init_schema.sql` 重建） |
| `career_system` | 24 表 / 82 行 | **本机不存在** |
| 迁移目标库 | `career_system_prod`（`job_adapter.py` 直连） | **本机不存在** |
| 账号 | `app_user` 在旧库无映射（18456） | 已授权 `app_user` + `career_recommendation` |

**因此：写论文、做答辩、填软著文档时，不能直接抄报告里的表数/行数/账号结论，
必须换成本机实测值（`sqlcmd -Q "SELECT COUNT(*) FROM ..."` 或 `sys.tables` 查询）。**

---

## 三、目录内容

```
docs/db-audit/
├── README.md                       ← 本文件
├── 数据库接口对齐核查报告.md         ← 主核查报告（43KB，91 字段判定 + 6 条结论）
├── 数据库接口字段对照表.csv          ← 91 行逐字段对照（接口字段/语义/行号/旧库/新库/判定）
└── _report/
    ├── README-核查与测试说明.md      ← 脚本清单、跑法、输出码含义
    ├── 01-原型与数据库自由切换方案报告.md
    ├── 02-career_system数据库设计文档.md      ← 24 表逐表字典（实库元数据导出）
    ├── 03-对齐方案验证测试报告.md
    ├── 04-改动方案与修改记录（待确认）.md
    ├── 05-系统核查报告（准确版）.md          ← 事实基线，数字以它为准
    ├── 06-新库改名方案（待确认）.md          ← 10 改名 + 4 新建，事务内预演 52 断言全过
    ├── 07-新库补字段与数据迁移方案（已验证）.md ← 已被 08 取代，仅留痕
    ├── 08-新旧库字段对比与迁移方案（重做·已验证）.md
    ├── 09-决策记录与待办清单.md              ← 4 项决策 + 3 个待办（未执行真实迁移）
    ├── 10-复核记录（全面核查）.md            ← 两轮独立复核，纠正前序误判
    ├── audit_system.py / audit_objects.py   ← 全量核查、约束对象核查
    ├── _probe_real_data.py / dump_data.py   ← 真实数据推荐探测、数据导出
    ├── gen_field_map.py / run_compare_fields.py / run_compare_v2.py  ← 字段对照生成
    ├── run_migrate_v2.py / run_test_migrate.py                       ← 迁移脚本与预演
    ├── run_test_olddb_ddl.py / run_test_newdb_compat.py / run_test_rename_newdb.py ← 三套预演
    ├── run_verify.py                        ← 端到端 33 项断言
    ├── _audit.json / _audit_objects.json / _audit_extra.json
    ├── _field_diff.json / _field_diff_v2.json / _field_map.md
    ├── _verify_result.json / _verify_sql.json
    └── _test_olddb_ddl.json / _test_newdb_compat.json / _test_rename_newdb.json
```

---

## 四、建议阅读顺序

1. **`数据库接口对齐核查报告.md`** —— 先看第一节 6 条结论摘要，建立整体认知
2. **`_report/05-系统核查报告（准确版）.md`** —— 事实基线
3. **`_report/04-改动方案与修改记录（待确认）.md`** —— 要改什么、怎么回档
4. **`_report/08` → `09` → `10`** —— 最终方案、决策、复核（08/09/10 是最终态，01/03/07 均被后文取代）
5. **`数据库接口字段对照表.csv`** —— 需要逐字段细节时查（可用 Excel 打开，UTF-8）

---

## 五、可用于论文/答辩的部分

| 可引用 | 位置 | 用法 |
|---|---|---|
| 接口与库的差异分析 | 主核查报告 §一、§二 | "数据库设计"章节的问题陈述 |
| 字段映射方法论（按接口实际读写定字段，而非按名字相似） | `_report/08` 开头 | 说明设计方法 |
| 91 字段判定分布（42/15/22/12） | 主核查报告 §一.2 | 做对照表/示意图 |
| 24 表设计字典 | `_report/02` | 附录：表结构清单 |
| 事务内预演 + ROLLBACK 的验证方法 | `_report/README-核查与测试说明.md`、`run_test_rename_newdb.py` | 说明"如何在不破坏生产库的前提下验证迁移" |

**不要引用**：报告中的行数、表数、账号权限结论、`career_system_prod` 相关描述（本机不适用）。

---

## 六、与当前项目的关系

- 当前项目**没有采用**这套迁移方案，而是走了一条更直接的路径：
  按接口契约重写 `database/init_schema.sql`（19 表）+ `seed_data.sql` + `seed_recommend.sql`，
  直接在本机 `career_recommendation` 建库，并把后端从内存模式改为 SQL Server 持久化。
- 因此 `_report` 里的脚本**不可直接在本机运行**：解释器路径（`D:\Dev\runtimes\DataScience\...`）、
  库名（`career_system_prod` / `career_system`）、文件路径（`career-system-main/_report`）都不适用。
  需要运行只能作为思路参考重写。
- `job_adapter.py`（原快照 backend 目录下）仅作"将来接真实招聘库"的参考，未进入当前代码路径。

---

## 七、2026-11-07 数据库组同学的交付包（本次归档）

同学把**两个交付包**放在了同一个文件夹里，需要分清：

| 包 | 文档 | 数据库脚本 | 状态 |
|---|---|---|---|
| **当前版**（含 P0 应用层修复） | `18-系统交付说明与修改日志.md` | `database/prod_backup/career_system_prod_full_20261107.sql`（34 表 / 10,677 行） | 注册→登录→三测评→推荐闭环已打通 |
| **仅改数据库版**（源码一行未动） | `修改日志-仅改数据库版.md` | `database/prod_backup/career_system_prod_数据库版_20261107.sql`（34 表 / 10,661 行，学生侧 8 表清零） | 只有推荐链路吃真实数据，登录注册走旧库 |

**两个 SQL 的区别只有 16 行**：当前版含 1 套完整演示学生数据
（`students` 1 / `users_login` 1 / 霍兰德 2 / 价值观 1 / 技能 5 / 技能测评 1，
演示账号 `zhangxm_ui@test.com / UiTest123`），数据库版把这 8 张学生侧表清零。

**库规模（两包一致）**：34 表，岗位 2102（国聘采集）、课程 4805、技能 134、
岗位技能要求 1421、公司 1263、职业路径 12、课程-技能关联 872。

**本目录新增的参考代码**（`reference-code/`，只读参考，不进运行路径）：

| 文件 | 作用 |
|---|---|
| `job_adapter.py`（513 行） | prod 库 → 推荐算法组装层；霍兰德 0.6/0.25/0.15、技能分级、父技能 0.6 折算、专业名归一 |
| `database_interface_prod版.py` | 同学版数据访问层，默认连 `career_system_prod`，含学生模块方法 |
| `backingend_API_P0版.py`（1300 行） | P0 修复：注册建档、登录返回真实 `student_id`、6 个新路由、注册去重 |
| `holland_page.tsx` | 计分方向修正（原"非常不符合=2 分"会让答"不喜欢"也加分） |
| `skills_page.tsx` | 13 专业下拉 + 40 题技能名映射 |
| `values_page.tsx` | 价值观测评落库 |
| `dashboard_page.tsx` | 新增"为你推荐的岗位"真实推荐区块 |

**已知问题（引用前必看）**：同学版 `sample_data.py` 共 988 行，第 672 行起仍是**整文件重复副本**
（与本项目已修复的"重复定义污染"同源）。若要用他的 `sample_data.py`，必须先删重复段，
否则重复段会覆盖前面的函数定义。

---

## 八、切换到 career_system_prod 的执行记录（2026-11-07）

**原则**：只换数据库，其他代码尽可能不动。实际只改了 `database_interface.py` 两处默认库名。

### 8.1 导入与建库

| 步骤 | 命令/脚本 | 结果 |
|---|---|---|
| 导入全库备份 | `sqlcmd -S localhost -E -i database/prod_backup/career_system_prod_full_20261107.sql` | 34 表、10,677 行导入成功 |
| 授权 + 补扩展表 | `sqlcmd -S localhost -E -i database/prod_backup/补建表与授权_app_user.sql` | 授予 `app_user` db_owner；补建 5 张扩展表 |

导入后核对：`jobs` 2102、`learning_resource` 4805、`skills` 134、`companies` 1263、
`job_skill_requirements` 1421、`career_path` 12、`students` 1、`users_login` 1 —— 与交付说明一致。

> 注意：`app_user` 没有 `CREATE DATABASE` 权限（消息 262），必须用 Windows 集成认证
> （`sqlcmd -E`，本机 `LAPTOP-RUCM1ATI\张雅瑞` 为 sysadmin）建库，建完再授权。

### 8.2 数据迁移（避免切换后账号丢失）

切换后 prod 库原本只有 1 个演示账号，本项目原测试账号会全部失效，因此从
`career_recommendation` 迁入以下数据：

| 表 | 迁入量 | 说明 |
|---|---|---|
| `users_login` | 5 条（user_id 22–26） | testuser / zhangsan / dbuser_e77563 / tester_1105 / webuser_1105 |
| `students` | 2 条（student_id 25、26） | 张三、李四；`grade` 由"大二"转 tinyint 2 |
| `sample_students` | 2 条 | 推荐算法用的学生画像（student_id `2024001`/`2024002`） |
| `sample_jobs` | 5 条 | 推荐岗位 |
| `sample_courses` | 8 条 | 推荐课程 |

**未迁**：`tasks` 3 条、`saved_career_plans` 1 条（旧库 `user_id` 存字符串 `'1'`，
与迁移脚本的整数映射未对齐，暂时保持 prod 侧为空，不影响页面展示——前端有计划页本地数据兜底）。

### 8.3 代码改动（全部改动就是这两行）

```python
# database_interface.py
def __init__(self, ..., database='career_system_prod')          # 原 'career_recommendation'
def get_database(self, ..., database='career_system_prod')      # 原 'career_recommendation'
```

前端 5 个 service 的 `/api` 同源化、`next.config.ts` 的 rewrites、`authService` 的
`username: userData.name` 修复、`sample_data.py` 的去重版本 —— **全部保持不动**。

### 8.4 验证结果

| 检查项 | 结果 |
|---|---|
| `GET /api/health` | 200 |
| 登录 `zhangsan / Test123456` | 200，返回 JWT |
| 登录 `zhangxm_ui@test.com / UiTest123` | 200 |
| 登录 `testuser / Test123456` | 200（迁移后恢复） |
| `POST /api/recommendations/internships` | 200，5 条 |
| `POST /api/recommendations/courses` | 200 |
| `POST /api/recommendations/career-paths` | 200，2 条（数据科学家 82.0% / 算法工程师 53.5%） |
| 前端 `/dashboard` | 正常，欢迎语"张三同学" |
| 前端 `/career` | 正常，推荐统计 2 条、平均匹配度 68% |
| 前端 `/plan` | 正常 |

### 8.5 已知限制（不是本次引入，是原有设计）

1. `get_student_profile()` 在 SQL 模式下**只查 `sample_students` 表、查不到直接返回 None**，
   不回退 `sample_data`。因此推荐接口只认画像 ID `2024001`/`2024002`；
   传 `students` 表的真实 ID（如 25）会返回"学生 ID 不存在"。
   前端登录后 `user.student_id` 为 null，请求体不带 ID 时会走 `DEFAULT_STUDENT_ID='2024001'`，
   所以页面表现与切换前一致。
2. 登录接口不返回 `student_id`（该修复在同学的 P0 版里，本版未引入）。
3. `get_student_id_from_user()` 读 `users_login.student_id`，而该表没有这一列，恒为 None。

### 8.6 回退方法

把 `database_interface.py` 两处 `'career_system_prod'` 改回 `'career_recommendation'`，
重启后端即可。`career_recommendation` 库数据未被修改，仍在。

### 8.7 目录整理

- 原交付文件夹 `新增文件（待确认）`（188 个文件 / 15.64 MB）已整体清理：其中有价值的内容
  （2 个 SQL、2 份说明、2 份核查文档、35 份 `_report`、7 个参考代码）在清理前逐文件 MD5 校验，
  13 项 + 35 份报告全部一致，确认已完整落到 `database/prod_backup/` 与 `docs/db-audit/`。
- 早期 24 表 `career_system` 原型脚本 `createtable(1).sql`、`testdata.sql`（GBK）从
  `database/` 移到 `docs/db-audit/legacy/`，仅作历史留档。
- `database/` 现在只放当前可执行脚本，并新增 `database/README.md` 说明导入顺序与回退方法。

---

## 九、测评结果入库（2026-11-07）

**背景**：中期冒烟测试发现霍兰德 / 价值观 / 技能三个测评页是纯前端，"测评记录"页是 4 条假数据，
结果只在浏览器内存里、刷新即丢，"测评 → 推荐 → 规划"闭环缺最前端一环。本次把三类结果接入数据库。

### 9.1 表设计：为什么新建一张表

| 方案 | 结论 |
|---|---|
| 复用 `student_skills`（同学 P0 版做法） | **不用**。P0 按"具名技能 → `skills.skill_id`"入库，而当前前端技能测评问的是 7 个能力维度（技术/思维/学习/软技能/管理/创意/行业），不是具名技能，`skill_id` 无从映射 |
| 新建 `skill_dimension_assessments` | **采用**。七维各一列，与前端 `calculateScores()` 的输出一一对应 |

表结构（`TINYINT` 存 0–100，`student_id` 关联 `students.student_id`）：

```sql
CREATE TABLE skill_dimension_assessments (
    assessment_id INT IDENTITY(1,1) PRIMARY KEY,
    student_id    INT NOT NULL,
    major         NVARCHAR(120) NULL,
    technical / thinking / learning / soft / management / creative / industry  TINYINT NULL,
    overall       TINYINT NULL,
    assess_time   DATETIME NOT NULL DEFAULT GETDATE()
);
CREATE INDEX IX_skill_dim_student ON skill_dimension_assessments(student_id, assess_time DESC);
```

脚本 `database/prod_backup/建技能维度测评表.sql`（幂等，`IF OBJECT_ID(...) IS NULL`）。
执行后 prod 库表数 **39 → 40**。

### 9.2 后端改动

**`database_interface.py`（4 个新方法 + 内存初始化）**

| 方法 | 作用 |
|---|---|
| `get_student_by_user(user_id)` | 按 `students.user_id` 查档案（该表有 `user_id` 列，可直接挂钩登录用户） |
| `get_or_create_student_by_user(user_id, student_name)` | 无档案时插一条最小记录再回查，保证新注册用户做测评不 404 |
| `add_skill_dimension_assessment(data)` | 写七维测评 |
| `get_skill_dimension_by_student(student_id)` | 按 `assess_time DESC` 读历史 |

**`backingend_API.py`（7 个路由，插在"职业规划保存/查询接口"注释块之前）**

| 路由 | 方法 | 说明 |
|---|---|---|
| `/api/assessment/holland` | POST / GET | 键兼容 `realistic/investigative/...`、`R/I/A/S/E/C`、中文名 |
| `/api/assessment/values` | POST / GET | 键为中文六维（社会贡献/成就导向/安全稳定/工作生活平衡/权力地位/创新挑战） |
| `/api/assessment/skills` | POST / GET | 七维 + `major`，`overall` 取非零维度均值 |
| `/api/assessment/history` | GET | 一次返回 `{holland, values, skills}`，供测评记录页 |

两个内部辅助：`_assessment_student(current_user_id)`（登录用户 → 学生档案，缺则创建）、
`_num(scores, *keys)`（多键别名取值，四舍五入并 clamp 0–100）。全部走 `@token_required`。

### 9.3 前端改动

| 文件 | 改动 |
|---|---|
| `lib/services/assessmentService.ts`（新建） | `saveHolland` / `saveValues` / `saveSkills` / `getHistory`，Bearer 取 `localStorage.token` |
| `app/assessment/holland/page.tsx` | `handleSubmit` 两条分支收敛到 `finishAssessment()`：先展示结果再提交入库；提交前把原始分按各维满分归一化为百分制 |
| `app/assessment/values/page.tsx` | `handleSubmit` 计算后调 `saveValues(result.scores)` |
| `app/assessment/skills/page.tsx` | `handleFinish`（"查看详细结果"）调 `saveSkills(selectedMajor, calculateScores())` |
| `app/assessment/history/page.tsx` | 去掉 mock 作为初始数据，改为 `getHistory()` 拉取；`buildRecordsFromApi()` 把三类记录映射成表格行（含按日期倒序、筛选沿用原逻辑）；接口异常才回退示例数据 |

**降级策略**：提交失败只弹 `message.warning`，不阻塞结果页展示——测评结果本地照常可见，
不会因为网络或 token 问题让演示流程中断。

### 9.4 验证结果

| 检查项 | 结果 |
|---|---|
| 无 token 提交 | 401 |
| `POST /api/assessment/holland` / `values` / `skills` | 均 200，返回 `student_id=25` |
| 三个 GET | 各 1 条 |
| `GET /api/assessment/history` | `holland=1 / values=1 / skills=1` |
| 直连库核对 | `holland_test_results`、`career_values`、`skill_dimension_assessments` 三表均有新增行，字段值与提交一致 |
| 前端实测（浏览器） | 霍兰德 10 题提交 → 结果页出现"测评结果已保存"；技能 10 题 → 同样；价值观 24 题 → 同样 |
| 测评记录页 | 刷新后显示 **5 条真实记录**（3 类齐全），平均分 88.6，不再是假数据 |

### 9.5 已知限制

1. `thinking / creative / industry` 三个维度在软件工程题库里没有对应题目，`calculateScores()`
   返回 0，入库即为 0，记录页显示"0 分"。这是题库覆盖问题，不是入库缺陷。
2. 测评记录页的 `duration`（用时）是写死的估算值（20/15/10 分钟），库表没有真实耗时字段。
3. 霍兰德入库值已归一化为百分制（按该维度题目满分换算），因此与页面"占比百分比"数值不同——
   库里是"该维兴趣强度"，页面显示的是"六维占比"。

### 9.6 回退方法

删除 7 个 `/api/assessment/*` 路由与 4 个 db 方法即可回到改动前；前端把三处提交调用注释掉，
测评记录页恢复 `mockAssessmentRecords` 初始值。数据表可保留（不影响其他模块）。

