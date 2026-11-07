# database 目录说明

当前系统使用 **`career_system_prod`** 库（34 张业务表 + 5 张扩展表 + 1 张测评扩展表 = 40 张）。
`career_recommendation`（19 表）是早期自建方案，数据保留未删，可回退。

## 当前方案（prod_backup/）

| 文件 | 用途 | 执行方式 |
|---|---|---|
| `prod_backup/career_system_prod_full_20261107.sql` | 全库备份：34 表 + 10,677 行，含演示学生数据 | `sqlcmd -S localhost -E -i 本文件` |
| `prod_backup/career_system_prod_数据库版_20261107.sql` | 同上，但学生侧 8 表清零（10,661 行），适合干净重置 | 同上 |
| `prod_backup/补建表与授权_app_user.sql` | 授权 `app_user` 访问 prod 库，并补建本项目自有的 5 张扩展表 | 在第一条执行之后运行 |
| `prod_backup/建技能维度测评表.sql` | 建 `skill_dimension_assessments`（技能测评七维结果入库），幂等 | 同上，排在授权脚本之后 |

导入顺序固定：先 `full`（或 `数据库版`），再 `补建表与授权_app_user.sql`，最后 `建技能维度测评表.sql`。
三条脚本都可重复执行。

## 早期方案（19 表，保留可回退）

| 文件 | 用途 |
|---|---|
| `init_schema.sql` | 建 `career_recommendation` 库、SQL 登录 `app_user`、19 张表 |
| `seed_data.sql` | 基础数据：2 个测试账号、2 名学生、15 项技能、4 家公司、4 个职位 |
| `seed_recommend.sql` | 推荐数据：2 份学生画像、5 个岗位、8 门课程 |

执行顺序：`init_schema.sql` → `seed_data.sql` → `seed_recommend.sql`。

回退到该方案：把 `career-system-back/backend/database_interface.py` 中两处
`database='career_system_prod'` 改回 `'career_recommendation'`，重启后端。

## 已归档的废弃脚本

`createtable(1).sql`、`testdata.sql`（早期 24 表 `career_system` 原型，GBK 编码）
已移到 `docs/db-audit/legacy/`，仅作历史留档，不要执行。

## 连接参数

```
DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;DATABASE=career_system_prod;UID=app_user;PWD=<见 database_interface.py>
```

`app_user` 需要 `db_owner` 权限（由 `补建表与授权_app_user.sql` 授予）。
建库本身需要 Windows 集成认证（`sqlcmd -E`），`app_user` 没有 `CREATE DATABASE` 权限。
