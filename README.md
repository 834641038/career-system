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
├── career-system-front/          # 前端（Next.js，端口 3000）
├── career-system-back/backend/   # 后端（Flask，端口 5000）
│   ├── backingend_API.py         # 后端入口
│   └── requirements.txt
├── database/
│   ├── prod_backup/              # 数据库组交付的全库备份（当前使用）
│   │   ├── career_system_prod_full_20261107.sql    # 34 表 + 1 万行数据（含演示学生）
│   │   ├── career_system_prod_数据库版_20261107.sql # 同上但学生侧清零
│   │   └── 补建表与授权_app_user.sql                # 授权 app_user + 补 5 张扩展表
│   ├── init_schema.sql           # 早期自建 19 表方案（保留，可随时回退）
│   ├── seed_data.sql
│   └── seed_recommend.sql
├── docs/db-audit/                # 数据库交接材料归档（核查报告、交付说明、参考代码）
├── tools/                        # 本地工具（cloudflared 等）
└── README.md
```

## 数据库初始化（SQL Server）

### 方式 A：导入团队交付的完整库（推荐，当前使用）

以管理员身份（Windows 认证）执行两条脚本：

```bash
sqlcmd -S localhost -E -i database/prod_backup/career_system_prod_full_20261107.sql
sqlcmd -S localhost -E -i database/prod_backup/补建表与授权_app_user.sql
```

第一条脚本创建 `career_system_prod` 库：**34 张业务表**，含岗位 2102 条（国聘采集）、
课程 4805 条、技能 134 条、岗位技能要求 1421 条、公司 1263 家、职业路径 12 条，
以及 1 套完整演示学生数据。

第二条脚本只做两件事：授权 `app_user` 访问该库；补建本项目自有的 5 张扩展表
（`tasks`、`saved_career_plans`、`sample_students`、`sample_jobs`、`sample_courses`，
推荐接口和计划任务从这些表读取）。脚本幂等，可重复执行。

账号：

| 账号 | 密码 | 说明 |
|---|---|---|
| `zhangxm_ui@test.com` | `UiTest123` | 交付方提供的演示账号（含完整学生档案） |
| `testuser` / `zhangsan` | `Test123456` | 本项目测试账号（已随切换迁入 prod 库） |

### 方式 B：早期自建 19 表方案（保留备查，可回退）

```bash
sqlcmd -S localhost -E -i database/init_schema.sql
sqlcmd -S localhost -E -i database/seed_data.sql
sqlcmd -S localhost -E -i database/seed_recommend.sql
```

该方案创建 `career_recommendation` 库与 SQL 登录 `app_user`，19 张表、2 名学生、
5 个岗位、8 门课程。切回方式：把 `database_interface.py` 中两处
`database='career_system_prod'` 改回 `'career_recommendation'` 即可。

> 未安装 SQL Server / pyodbc 时，后端自动回退为内存样本数据（每次重启用户数据重置，需重新注册）。

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
