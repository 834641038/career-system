# 大学生生涯规划系统（职海航图）

前后端分离的大学生生涯规划平台，包含智能测评、生涯规划、职业探索、技能发展、求职服务、个人中心等模块。

## 技术栈

| 端 | 技术 |
|---|---|
| 前端 | Next.js 16（React 19 + Ant Design v6 + @ant-design/charts）、TypeScript |
| 后端 | Python Flask + PyJWT + NumPy |
| 数据库 | SQL Server（可选，通过 pyodbc 连接；未安装时自动回退为内存样本数据） |
| AI 能力 | 通义千问（DashScope API） |

## 目录结构

```
career-system/
├── career-system-front/        # 前端（Next.js，端口 3000）
├── career-system-back/backend/ # 后端（Flask，端口 5000）
│   ├── backingend_API.py       # 后端入口
│   └── requirements.txt
├── database/                   # SQL Server 初始化脚本（可选）
└── README.md
```

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
- 如已配置 SQL Server：执行 `database/createtable(1).sql`、`database/testdata.sql` 初始化。

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
