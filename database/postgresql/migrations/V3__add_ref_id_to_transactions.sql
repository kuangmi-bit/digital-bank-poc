-- =============================================================================
-- Flyway 迁移: V3__add_ref_id_to_transactions.sql
-- 描述: 为 transactions 表增加 ref_id 字段，用于支付扣款幂等（ADR-005）
-- 同一 refId 多次请求返回同一 transactionId，不重复扣款
-- 与 core-bank-service/src/main/resources/db/migration/V3__add_ref_id_to_transactions.sql 保持一致
-- =============================================================================

ALTER TABLE transactions
ADD COLUMN ref_id VARCHAR(64) NULL;

CREATE UNIQUE INDEX idx_transactions_ref_id ON transactions(ref_id) WHERE ref_id IS NOT NULL;

COMMENT ON COLUMN transactions.ref_id IS '外部引用号，如 paymentId，用于 debit 幂等';
