# 后端运行与前端联调说明

本 README 记录在本地启动后端与前端、常见问题与快速验证步骤（针对 Windows 开发环境）。

## 前提条件

- Python 3.11+（请使用与项目兼容的 Python）
- Node.js + npm
- 可选：若要连接 SQL Server，请安装 ODBC 驱动与 `pyodbc` 并配置数据库；默认代码在未检测到 `pyodbc` 时会回退到内存样本数据。

## 后端（Flask）启动步骤

1. 打开 PowerShell 或 CMD，进入后端目录：

```powershell
cd D:\career-system\career-system-back\backend
```

1. 创建/激活虚拟环境并安装依赖：

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

1. 启动后端开发服务器：

```powershell
.\.venv\Scripts\python.exe backingend_API.py
```

- 服务器默认监听：`http://localhost:5000`
- 注意：若未安装 `pyodbc`，程序会打印并使用内存样本数据（无需额外配置）。

## 前端（Next.js）启动步骤

1. 打开新的终端，进入前端目录：

```powershell
cd D:\career-system\career-system-front
```

1. 安装依赖并启动开发服务器：

```powershell
npm install
npm run dev
```

- 如果 PowerShell 拒绝执行 `npm.ps1`，可以先在当前用户范围允许脚本：

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

- 若端口 `3000` 被占用，Next 会尝试其他端口（例如 `3001`）。也可指定端口：

在 CMD 下：

```cmd
set PORT=3001 && npm run dev
```

在 PowerShell 下：

```powershell
$env:PORT=3001; npm run dev
```

## 快速验证（注册/登录测试）

- 我已添加一个简单测试脚本 `auth_test.py`（项目根），可用来快速验证后端注册/登录接口：

```powershell
# 在项目根或任意终端运行（推荐在已激活虚拟环境的情况下）
.\.venv\Scripts\python.exe ..\..\auth_test.py
# 或
python auth_test.py
```

- 也可以用 curl（示例）：

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"you@example.com","password":"YourPass"}' \
  http://localhost:5000/api/auth/login
```

## 已做的兼容/修复（便于本地开发）

- 若系统没有 `pyodbc`，`database_interface.py` 会自动回退到内存样本数据，避免因为数据库连接失败阻塞开发。
- 为避免在 Windows 环境编译 `scikit-learn` 导致安装失败，项目中用 `numpy` 实现了必要的 `cosine_similarity`，并从 `requirements.txt` 中移除了 `scikit-learn`。
- 修复了 `sample_data` 的别名以兼容旧引用（`COURSE_CATALOG`）。

## 重要文件（便于快速查阅）

- 后端主入口： [career-system-back/backend/backingend_API.py](career-system-back/backend/backingend_API.py)
- 后端依赖： [career-system-back/backend/requirements.txt](career-system-back/backend/requirements.txt)
- 数据接口： [career-system-back/backend/database_interface.py](career-system-back/backend/database_interface.py)
- 示例数据： [career-system-back/backend/sample_data.py](career-system-back/backend/sample_data.py)
- 推荐逻辑（余弦相似替代）： [career-system-back/backend/internship_recommender.py](career-system-back/backend/internship_recommender.py)
- 前端认证客户端： [career-system-front/app/services/authService.ts](career-system-front/app/services/authService.ts)
- 前端认证上下文： [career-system-front/app/context/AuthContext.tsx](career-system-front/app/context/AuthContext.tsx)
- 本地测试脚本： [auth_test.py](auth_test.py)

## 常见问题与解决

- 错误：`No module named 'pyodbc'` → 若不需要连接 SQL Server，可忽略（已回退到内存数据）；若需要，请安装 `pyodbc` 并配置 ODBC 驱动与连接字符串。
- 错误：`Failed to build scikit-learn`（Windows 编译错误）→ 项目已移除该依赖并改用 `numpy` 实现以避免编译问题。
- Next 无法启动，显示 `.next/dev/lock` 锁或端口占用 → 确保没有其它 `next dev` 进程在运行，或指定不同端口（见上文）。

---
如需我把 `planService` 从 mock 切换为后端真实接口，或在前端页面上执行一次完整的登录-跳转-获取 profile 流程并验证 token 存储，我可以继续操作。
