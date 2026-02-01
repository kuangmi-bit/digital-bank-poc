-- =============================================================================
-- Flyway 迁移: V2__add_indexes.sql
-- 描述: 补充复合索引，与 database/postgresql/migrations/V2__add_indexes.sql 保持一致
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_bank_accounts_customer_id_status
ON bank_accounts(customer_id, status);
