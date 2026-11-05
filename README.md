# 大学生生涯规划系统（职海航图）

前后端分离的大学生生涯规划平台，包含智能测评、生涯规划、职业探索、技能发展、求职服务、个人中心等模块。

## 技术栈

| 端 | 技术 |
|---|---|
| 前端 | Next.js 16（React 19 + Ant Design v6 + @ant-design/charts）、TypeScript |
| 后端 | Python Flask + PyJWT + NumPy |
| 数据库 | SQL Server（pyodbc 连接；未安装/未配置时自动回退为内存样本数据） |
| AI 能力 | 通义千问（DashScope API） |

## 目录结构

```
career-system/
├── career-system-front/        # 前端（Next.js，端口 3000）
├── career-system-back/backend/ # 后端（Flask，端口 5000）
│   ├── backingend_API.py       # 后端入口
│   └── requirements.txt
├── database/                   # 数据库初始化脚本
│   ├── init_schema.sql         # 建库、建登录账号、建 19 张表
│   ├── seed_data.sql           # 基础数据（账号/学生/技能/职位等）
│   └── seed_recommend.sql      # 推荐数据（学生画像/岗位/课程，供推荐接口读取）
└── README.md
```

## 数据库初始化（SQL Server）

1. 本机安装 SQL Server（含 ODBC Driver 17 for SQL Server）。
2. 以管理员身份执行（Windows 认证）：

```bash
sqlcmd -S localhost -E -i database/init_schema.sql   # 建库 + 建表
sqlcmd -S localhost -E -i database/seed_data.sql     # 插入基础数据
sqlcmd -S localhost -E -i database/seed_recommend.sql  # 插入推荐数据（学生画像/岗位/课程）
```

3. 脚本会创建：
   - 数据库 `career_recommendation`（排序规则 Chinese_PRC_CI_AS）
   - SQL 登录 `app_user`（与后端 `database_interface.py` 默认连接配置一致）
   - 19 张表：`users_login`、`students`、`companies`、`skills`、`holland_test_results`、`career_values`、`experiences`、`day_plans`、`week_plans`、`student_skills`、`jobs`、`job_skill_requirements`、`student_preferences`、`matching_results`、`tasks`、`saved_career_plans`、`sample_students`、`sample_jobs`、`sample_courses`
   - 基础数据：2 个测试账号、2 名学生、15 项技能、4 家公司、4 个职位等
   - 推荐数据：2 份学生画像、5 个推荐岗位、8 门推荐课程（推荐接口 career-paths/internships/courses 从数据库读取）

4. 测试账号（密码均为 `Test123456`）：`testuser`、`zhangsan`。

> 未安装 SQL Server / pyodbc 时，后端自动使用内存样本数据（每次重启用户数据会重置，需重新注册）。连接参数如需调整，修改 `database_interface.py` 顶部 `DatabaseInterface(...)` 默认值即可。

## 快速启动

### 1. 后端（端口 5000）

```bash
cd career-system-back/backend
python -m venv .venv            # 创建虚拟环境（Windows）
.venv\Scripts\activate          # Windows 激活；macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

配置环境变量（AI 对话依赖通义千问，不配置时聊天接口走本地兜底回复）：

```bash
# 复制 .env.example 为 .env 并填入你的密钥
cp .env.example .env
```

启动：

```bash
python backingend_API.py
```

- 健康检查：`http://localhost:5000/api/health`
- 未安装 SQL Server/pyodbc 时使用内存样本数据（含默认学生张三）；**内存模式下每次重启用户数据会重置，需重新注册账号**。
- 已配置 SQL Server 时，用户、任务、职业规划等数据持久化存储（参见上方"数据库初始化"）。

### 2. 前端（端口 3000）

```bash
cd career-system-front
npm install
npm run dev
```

访问 `http://localhost:3000`，注册账号后登录使用。

## 主要功能

- 智能测评：兴趣、性格（霍兰德）、价值观、技能测评与测评历史
- 生涯规划：创建/管理规划与任务、日/周计划、进度统计
- 职业探索：职业路径、实习、课程推荐（AI 匹配度）
- AI 助手：生涯咨询对话（通义千问）
- 求职服务：面试准备
- 个人中心：个人资料与简历管理

## 环境变量

| 变量 | 说明 |
|---|---|
| `DASHSCOPE_API_KEY` | 阿里云百炼 / 通义千问 API Key（可选） |
| `DASHSCOPE_ENDPOINT` | DashScope 服务端点（可选，有默认值） |
