-- V7: 性能优化索引（Day 10）
-- 批量转账和预约转账相关索引

-- 批量转账查询优化
CREATE INDEX IF NOT EXISTS idx_batch_transfers_created_at_desc ON batch_transfers(created_at DESC);

-- 预约转账查询优化
CREATE INDEX IF NOT EXISTS idx_scheduled_time_status_covering ON scheduled_transfers(scheduled_time, status) INCLUDE (from_account_id, to_account_id, amount);

-- 交易历史查询优化（覆盖索引）
CREATE INDEX IF NOT EXISTS idx_transactions_account_created_covering ON transactions(account_id, created_at DESC) INCLUDE (transaction_type, amount, status);

-- 账户余额查询优化
CREATE INDEX IF NOT EXISTS idx_accounts_customer_status ON bank_accounts(customer_id, status);

-- Outbox 事件处理优化
CREATE INDEX IF NOT EXISTS idx_outbox_status_created ON outbox_events(status, created_at) WHERE status = 'pending';

-- 更新统计信息
ANALYZE batch_transfers;
ANALYZE scheduled_transfers;
ANALYZE transactions;
ANALYZE bank_accounts;
ANALYZE outbox_events;
