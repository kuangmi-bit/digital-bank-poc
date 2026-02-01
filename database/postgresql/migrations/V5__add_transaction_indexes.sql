-- =============================================================================
-- Flyway 迁移: V5__add_transaction_indexes.sql
-- 描述: 补充 transactions 常用查询复合索引，优化查询性能（Day 5）
-- 与 core-bank-service/src/main/resources/db/migration/V5__add_transaction_indexes.sql 保持一致
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_transactions_account_status_created
ON transactions(account_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_counter_account_created
ON transactions(counter_account_id, created_at DESC);

