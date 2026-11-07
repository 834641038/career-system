# _report 目录说明

> 这里放的是**核查报告 + 取证脚本**，不是业务代码。
> 所有脚本都可重复运行；涉及写操作的脚本**全部在事务内执行并 `ROLLBACK`**，跑完数据库不会有任何变化。

---

## 一、先读哪份

| 顺序 | 文件 | 作用 |
|---|---|---|
| 1 | **05-系统核查报告（准确版）.md** | **最新、最准的事实基线**。所有数字以此为准 |
| 2 | 04-改动方案与修改记录（待确认）.md | 要做什么、每处怎么改、怎么回档 |
| 3 | 01-原型与数据库自由切换方案报告.md | 切换开关的设计与字段映射 |
| 4 | 02-career_system数据库设计文档.md | 新库 24 表的逐表字典 |
| 5 | 03-对齐方案验证测试报告.md | 一次完整测试的过程记录 |

> 01/02/03 是早期写的，已在文首标注"以 05 为准"；其中两处错误（IDENTITY、霍兰德权重）已就地更正。

---

## 二、脚本清单

| 脚本 | 作用 | 是否写库 | 预期输出 |
|---|---|---|---|
| `audit_system.py` | 实例/库/表/列/约束/账号/SQL/数据/代码 全量核查 | 只读 | 生成 `_audit.json`，退出码 0 |
| `audit_objects.py` | CHECK/唯一约束/视图/存储过程，以及"改名后是否失效" | 事务内改名，最后回滚 | 全 PASS，生成 `_audit_objects.json` |
| `run_verify.py` | 对齐方案端到端验证（33 项断言） | 事务内写，回滚 | **通过 30 / 已知缺陷 2 / 待确认 1 / 真实失败 0** |
| `run_test_olddb_ddl.py` | 旧库 D0–D6 全量预演 | 事务内，回滚 | **22 项全 PASS** |
| `run_test_newdb_compat.py` | 新库 `api` schema + 同义词可行性预演 | 事务内，回滚 | **15 项全 PASS** |
| `_probe_real_data.py` | 用旧库真数据跑 20 学生 × 23 岗位推荐 | 只读 | 分数分布统计 |

---

## 三、怎么跑

必须用带 numpy 的解释器（系统默认的 python 没有 numpy，跑推荐会 `ModuleNotFoundError`）：

```bash
cd career-system-main/_report
PY="D:/Dev/runtimes/DataScience/python/version/py3.13.11/python.exe"

"$PY" audit_system.py
"$PY" audit_objects.py
"$PY" run_verify.py
"$PY" run_test_olddb_ddl.py
"$PY" run_test_newdb_compat.py
```

---

## 四、看到这些字样不要慌

| 输出 | 含义 |
|---|---|
| `[PASS]` | 断言通过 |
| `[KNOWN]` | **已知缺陷，当前状态本来就该不通过**。修掉 D0（建 `app_user` 映射）后会转成 `[PASS]`。不是脚本报错 |
| `[WARN]` | 顺带发现、尚未处理的信息（如 `user_email` 只有 40 字符） |
| `× 方法名 ...` | 该条 SQL 编译失败的明细行。其中 2 条是静态校验的已知误报（f-string 拼接、`?`→`NULL` 类型推断），1 条是真 bug（`get_user_by_studentname` 缺列名） |
| `[FAIL]` | **真正的失败，说明系统状态与预期不符，需要看日志** |

判断标准只有一条：**汇总里「真实失败 = 0」就是正常**。

---

## 五、产物 json

| 文件 | 内容 |
|---|---|
| `_audit.json` | 全量核查结果（05 报告的数据源） |
| `_audit_objects.json` | 约束与对象可用性核查结果 |
| `_audit_extra.json` | 两库对象计数 |
| `_verify_result.json` / `_verify_sql.json` | `run_verify.py` 的断言明细与 SQL 明细 |
| `_test_olddb_ddl.json` / `_test_newdb_compat.json` | 两个预演脚本的断言明细 |
| `_test_rename_newdb.json` | 新库改名预演的断言明细（52 项断言 + 56 条 SQL 结果） |

> 这些 json 每次运行都会覆盖，**可以随时删**，不影响脚本运行。

---

## 六、新库改名预演：`run_test_rename_newdb.py`

对应文档：`06-新库改名方案（待确认）.md`

```bash
$PY run_test_rename_newdb.py
```

它做的事：**在同一个事务里**把 `career_system` 按方案完整改名（10 张原地改名 + 4 张新建 + 数据迁移），然后用接口自己的 57 条 SQL 做编译校验、跑 12 个功能探针，最后 `ROLLBACK` 并核对数据库是否原样。

| 输出 | 含义 |
|---|---|
| `[OK ] B1 改名表 student_info → students` | 该步 DDL 全部成功 |
| `编译通过 56 / 56` | 接口 57 条 SQL 里，56 条能编译（剩 1 条是接口源码自身残缺 `WHERE )`） |
| `[OK ] 注册：users_login + students 双表插入` | 功能探针真的写进去又读回来了（随后随回滚消失） |
| `[OK ] 表清单复原 / 行数复原` | 回滚干净 |

**注意**：自增计数器不会随回滚复原（SQL Server 行为），重跑几次后 `user`/`student_info` 的当前自增值会涨到几千，属正常，不影响数据。
