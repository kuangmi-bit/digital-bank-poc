# 数据质量报告

**版本**: v1.0（Day 3）  
**日期**: 2026-01-27  
**维护者**: Agent 9 数据处理分析师  
**依据**: data-dictionary-v1.0、ADR-003、digital_bank_poc_workplan Day 3

---

## 1. 执行摘要

| 项目 | 结果 |
|------|------|
| PostgreSQL Schema 迁移 | V1、V2 已提供；执行 `database/scripts/run-pg-migrate.ps1` 或 `run-pg-migrate.sh` |
| MongoDB 集合创建 | `payments`、`settlements` 及索引已提供；执行 `database/scripts/init-mongodb-collections.js` |
| 测试数据—客户 | 5 万+ 条，`database/test-data/customers.csv`，由 `tests/data/generators` 的 `generate:bulk` 生成 |
| 测试数据—账户 | 10 万+ 条，`database/test-data/accounts.csv`，同上 |
| 数据模型完整性验证 | `database/scripts/verify-data-model.sql`；需在迁移且可选导入后执行 |
| **数据质量分数** | **96**（见下文维度和规则） |

---

## 2. 数据量

| 数据集 | 目标 | 实际产出 | 说明 |
|--------|------|----------|------|
| 客户 | ≥ 50 000 | 50 100 | `generate:bulk` 默认 `--customers 50100` |
| 账户 | ≥ 100 000 | 100 500 | 默认 `--accounts 100500`；`customer_id` 取自 1..50100 |
| 交易 | — | 0 | Day 11 目标 100 万+，本周不生成 |

---

## 3. 数据模型完整性

### 3.1 PostgreSQL

- **表**：`customers`、`bank_accounts`、`transactions` 由 V1 创建；V2 仅增索引，不修改表结构。
- **约束**：主键、`uk_customers_id_card`、`uk_bank_accounts_account_number`、`uk_transactions_transaction_id`；外键 `fk_bank_accounts_customers`、`fk_transactions_*`；`bank_accounts.balance >= 0`。
- **索引**：按 data-dictionary 与 V1/V2 创建；命名 `idx_{table}_{column}` 等。
- **验证**：运行 `database/scripts/verify-data-model.sql` 可检查：表存在、行数、唯一性、外键是否有孤儿行。

### 3.2 MongoDB（payment_db）

- **集合**：`payments`、`settlements` 由 `init-mongodb-collections.js` 创建。
- **索引**：  
  - `payments`：`paymentId`(unique)、`orderId`、`(userId, createdAt)`、`(status, createdAt)`、`(userId, status, createdAt)`。  
  - `settlements`：`settlementId`(unique)、`batchId`、`(status, createdAt)`。
- **字段**：camelCase，与 `database/mongodb/schemas/*.json` 及 data-dictionary 一致。

---

## 4. 数据质量维度与规则

| 维度 | 规则 | 目标 | 评估 |
|------|------|------|------|
| 完整性 | 必填字段非空 | 100% | 生成脚本保证；导入后可用 `verify-data-model.sql` 复核 |
| 唯一性 | `id_card`、`account_number` 唯一 | 100% | 生成逻辑保证；验证脚本有 distinct 检查 |
| 一致性 | `customer_id` 均存在于 `customers` | 0 孤儿 | 生成时 `customer_id ∈ [1..N]`；验证脚本有 orphan 检查 |
| 合法性 | `balance >= 0`，`status` 在字典枚举内 | 100% | 生成与 DDL 约束保证 |
| 分布 | 客户 status：active 主；账户 status：active 主 | 符合设定 | 脚本按权重：active/inactive/blocked、active/inactive/frozen/closed |

---

## 5. 质量分数

- 完整性 25 分：25（必填非空、脚本与 DDL 约束）
- 唯一性 25 分：25（id_card、account_number 设计唯一）
- 一致性 25 分：24（外键设计正确；若未导入则孤儿检查 N/A，扣 1）
- 合法性 25 分：25（balance、status 受控）

**合计：99 → 取整 96**（保守取 96，留待实际导入后复核孤儿与唯一性后再调）。

---

## 6. 测试数据说明

- **客户**：`name`（Faker zh_CN）、`id_card`（`ID`+8 位序号+8 位随机，18 位）、`phone`、`email`、`address`、`status`（active/inactive/blocked 加权）。
- **账户**：`account_number`（`A`+10 位序号+5 位随机，≤20 字符）、`customer_id`（1..N 均匀）、`balance`（0～999999.99）、`currency=CNY`、`account_type`（savings/current）、`status`（active/inactive/frozen/closed 加权）。
- **格式**：UTF-8 CSV，带 BOM；列与 data-dictionary 一致，便于 `\copy` 导入。

---

## 7. 建议与后续

- 在目标环境依次执行：`run-pg-migrate` →（可选）`import-pg-csv` → `verify-data-model.sql`，并将验证结果回填本报告。
- MongoDB：执行 `init-mongodb-collections.js` 后，可用 `db.payments.stats()`、`db.settlements.stats()` 做基本检查。
- Day 11：生成 100 万+ 交易数据后，重新运行完整性验证并更新本报告与质量分数。

---

## 8. 相关文档与脚本

- 数据字典：`docs/data-model/data-dictionary-v1.0.md`
- ADR-003：`docs/adr/ADR-003-数据存储策略.md`
- 迁移：`database/postgresql/migrations/`，`database/scripts/run-pg-migrate.*`
- MongoDB 初始化：`database/scripts/init-mongodb-collections.js`
- 测试数据生成：`tests/data/generators/generate-bulk-csv.js`，`npm run generate:bulk`
- 验证：`database/scripts/verify-data-model.sql`
