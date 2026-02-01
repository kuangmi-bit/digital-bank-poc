# 数据字典 v1.0

**版本**: v1.0.0  
**发布日期**: 2026-01-27  
**维护者**: Agent 9 数据处理分析师  
**依据**: technical-standards-v1.0、naming-conventions、ADR-002 微服务拆分

---

## 1. 数据模型概述

### 1.1 设计原则

- 遵循至少 3NF，保证数据完整性。
- PostgreSQL：snake_case 表名/列名，复数表名；主键 `id`，外键 `{table}_id`；金额 `DECIMAL(19,2)`，时间 `TIMESTAMP WITH TIME ZONE`。
- MongoDB：集合名 snake_case 复数，字段名 camelCase；时间 ISO 8601 字符串。

### 1.2 库与域

| 存储       | 库/Schema     | 用途           | 服务       |
|------------|---------------|----------------|------------|
| PostgreSQL | public        | 客户、账户、交易 | 核心银行   |
| MongoDB    | payment_db    | 支付、清算     | 支付清算   |

### 1.3 实体关系摘要

- **customers** 1 ──< **bank_accounts**（一个客户多个账户）
- **bank_accounts** 1 ──< **transactions**（一个账户多笔交易，`account_id`；转账时 `counter_account_id` 指向对手账户）

---

## 2. PostgreSQL 表定义

### 2.1 customers（客户）

| 列名        | 类型                        | 空 | 默认        | 说明                         |
|-------------|-----------------------------|----|-------------|------------------------------|
| id          | BIGSERIAL                   | N  | 自增        | 主键                         |
| name        | VARCHAR(100)                | N  | —           | 姓名                         |
| id_card     | VARCHAR(18)                 | Y  | —           | 身份证号，唯一 (uk_customers_id_card) |
| phone       | VARCHAR(20)                 | Y  | —           | 手机号                       |
| email       | VARCHAR(128)                | Y  | —           | 邮箱                         |
| address     | TEXT                        | Y  | —           | 地址                         |
| status      | VARCHAR(20)                 | N  | 'active'    | active, inactive, blocked    |
| created_at  | TIMESTAMP WITH TIME ZONE    | N  | CURRENT_TS  | 创建时间                     |
| updated_at  | TIMESTAMP WITH TIME ZONE    | N  | CURRENT_TS  | 更新时间                     |

**索引**: idx_customers_phone, idx_customers_email, idx_customers_status, idx_customers_created_at

---

### 2.2 bank_accounts（银行账户）

| 列名           | 类型                        | 空 | 默认        | 说明                                  |
|----------------|-----------------------------|----|-------------|---------------------------------------|
| id             | BIGSERIAL                   | N  | 自增        | 主键                                  |
| account_number | VARCHAR(20)                 | N  | —           | 账号，唯一 (uk_bank_accounts_account_number) |
| customer_id    | BIGINT                      | N  | —           | 外键 → customers.id                   |
| balance        | DECIMAL(19, 2)              | N  | 0           | 余额，≥0                              |
| currency       | VARCHAR(3)                  | N  | 'CNY'       | 币种                                  |
| account_type   | VARCHAR(20)                 | N  | 'savings'   | savings, current 等                   |
| status         | VARCHAR(20)                 | N  | 'active'    | active, inactive, frozen, closed      |
| created_at     | TIMESTAMP WITH TIME ZONE    | N  | CURRENT_TS  | 创建时间                              |
| updated_at     | TIMESTAMP WITH TIME ZONE    | N  | CURRENT_TS  | 更新时间                              |

**外键**: fk_bank_accounts_customers (customer_id → customers.id)  
**索引**: idx_bank_accounts_account_number, idx_bank_accounts_customer_id, idx_bank_accounts_status, idx_bank_accounts_created_at, idx_bank_accounts_customer_id_status (V2)

---

### 2.3 transactions（交易）

| 列名                | 类型                        | 空 | 默认        | 说明                                        |
|---------------------|-----------------------------|----|-------------|---------------------------------------------|
| id                  | BIGSERIAL                   | N  | 自增        | 主键                                        |
| transaction_id      | VARCHAR(32)                 | N  | —           | 业务流水号，唯一 (uk_transactions_transaction_id) |
| account_id          | BIGINT                      | N  | —           | 外键 → bank_accounts.id（本方账户）         |
| counter_account_id  | BIGINT                      | Y  | —           | 外键 → bank_accounts.id（对手账户，转账时有值） |
| amount              | DECIMAL(19, 2)              | N  | —           | 金额                                        |
| transaction_type    | VARCHAR(20)                 | N  | —           | deposit, withdrawal, transfer_in, transfer_out, payment 等 |
| status              | VARCHAR(20)                 | N  | 'pending'   | pending, processing, completed, failed, cancelled |
| remark              | TEXT                        | Y  | —           | 备注                                        |
| created_at          | TIMESTAMP WITH TIME ZONE    | N  | CURRENT_TS  | 创建时间                                    |
| updated_at          | TIMESTAMP WITH TIME ZONE    | N  | CURRENT_TS  | 更新时间                                    |

**外键**: fk_transactions_bank_accounts (account_id → bank_accounts.id), fk_transactions_counter_accounts (counter_account_id → bank_accounts.id)  
**索引**: idx_transactions_transaction_id, idx_transactions_account_id, idx_transactions_counter_account_id, idx_transactions_status, idx_transactions_created_at, idx_transactions_account_created (account_id, created_at DESC)

---

## 3. MongoDB 集合定义

### 3.1 payments（支付订单）

字段为 **camelCase**。

| 字段             | 类型     | 必填 | 说明                                              |
|------------------|----------|------|---------------------------------------------------|
| _id              | ObjectId | —    | 文档 ID                                           |
| paymentId        | string   | Y    | 支付单号，唯一                                    |
| orderId          | string   | Y    | 业务订单号                                        |
| userId           | string   | Y    | 用户/客户标识                                     |
| accountId        | string   | N    | 扣款账户 ID（核心银行）                           |
| amount           | number   | Y    | 支付金额                                          |
| currency         | string   | Y    | 币种，如 CNY                                      |
| status           | string   | Y    | pending, processing, completed, failed, refunded, cancelled |
| channel          | string   | N    | wechat, alipay, bank_card, mock                   |
| gatewayResponse  | object   | N    | 嵌入：gatewayOrderId, code, message, paidAt       |
| createdAt        | string   | Y    | ISO 8601                                          |
| updatedAt        | string   | N    | ISO 8601                                          |

**建议索引**: paymentId(unique), orderId, (userId, createdAt), (status, createdAt), (userId, status, createdAt)

---

### 3.2 settlements（清算批次）

| 字段          | 类型     | 必填 | 说明                                    |
|---------------|----------|------|-----------------------------------------|
| _id           | ObjectId | —    | 文档 ID                                 |
| settlementId  | string   | Y    | 清算单号，唯一                          |
| batchId       | string   | Y    | 批次号                                  |
| totalAmount   | number   | Y    | 批次总金额                              |
| paymentCount  | int      | N    | 纳入笔数                                |
| paymentIds    | string[] | N    | 关联的 paymentId 列表                   |
| status        | string   | Y    | pending, processing, completed, failed  |
| createdAt     | string   | Y    | ISO 8601                                |
| updatedAt     | string   | N    | ISO 8601                                |

**建议索引**: settlementId(unique), batchId, (status, createdAt)

---

## 4. 枚举与码表

### 4.1 客户 status（customers.status）

| 值        | 说明     |
|-----------|----------|
| active    | 正常     |
| inactive  | 未激活   |
| blocked   | 已锁定   |

### 4.2 账户 status（bank_accounts.status）

| 值      | 说明   |
|---------|--------|
| active  | 正常   |
| inactive| 未激活 |
| frozen  | 冻结   |
| closed  | 销户   |

### 4.3 交易 transaction_type

| 值            | 说明     |
|---------------|----------|
| deposit       | 存款     |
| withdrawal    | 取款     |
| transfer_in   | 转入     |
| transfer_out  | 转出     |
| payment       | 支付扣款 |

### 4.4 交易 status（transactions.status）

| 值          | 说明   |
|-------------|--------|
| pending     | 待处理 |
| processing  | 处理中 |
| completed   | 成功   |
| failed      | 失败   |
| cancelled   | 已撤销 |

### 4.5 支付 status（payments.status）

| 值          | 说明   |
|-------------|--------|
| pending     | 待支付 |
| processing  | 处理中 |
| completed   | 成功   |
| failed      | 失败   |
| refunded    | 已退款 |
| cancelled   | 已取消 |

---

## 5. 相关文档

- ER 图: `docs/data-model/er-diagram.drawio`
- PostgreSQL 迁移: `database/postgresql/migrations/`
- MongoDB Schema: `database/mongodb/schemas/payment.json`, `settlement.json`
- 技术标准: `docs/architecture/technical-standards-v1.0.md`
- 命名规范: `docs/architecture/naming-conventions.md`

---

**更新记录**

- v1.0.0 (2026-01-27): 初版，PostgreSQL 三表 + MongoDB 两集合。
