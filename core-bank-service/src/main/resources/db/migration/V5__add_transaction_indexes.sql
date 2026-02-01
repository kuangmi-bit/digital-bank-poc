-- =============================================================================
-- Flyway 迁移: V5__add_transaction_indexes.sql
-- 描述: 补充 transactions 常用查询复合索引，优化查询性能（Day 5）
-- 典型查询:
--  - 交易列表：account_id + status + created_at desc
--  - 交易历史：account_id + created_at desc（V1 已有 idx_transactions_account_created）
--  - 关联账户查询：counter_account_id + created_at desc
-- =============================================================================

-- 交易查询：按 accountId + status 过滤并按时间倒序
CREATE INDEX IF NOT EXISTS idx_transactions_account_status_created
ON transactions(account_id, status, created_at DESC);

-- 转账相关：按 counter_account_id + 时间倒序
CREATE INDEX IF NOT EXISTS idx_transactions_counter_account_created
ON transactions(counter_account_id, created_at DESC);

