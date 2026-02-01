-- =============================================================================
-- Flyway 迁移: V2__add_indexes.sql
-- 描述: 补充复合索引与覆盖索引，优化查询性能
-- 遵循: technical-standards-v1.0, naming-conventions, agent-9-data SKILL 索引优化
-- Agent: Agent 9 数据处理分析师
-- =============================================================================

-- 账户：按客户+状态查询（如：某客户下所有活跃账户）
CREATE INDEX IF NOT EXISTS idx_bank_accounts_customer_id_status
ON bank_accounts(customer_id, status);

-- 交易：按账户+时间倒序已在 V1 的 idx_transactions_account_created 中创建

-- 覆盖索引：按账号查询时避免回表取 balance, status（可选，按实际查询调整）
-- CREATE INDEX IF NOT EXISTS idx_bank_accounts_covering
-- ON bank_accounts(account_number) INCLUDE (balance, status);
