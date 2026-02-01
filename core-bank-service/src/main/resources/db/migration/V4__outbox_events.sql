-- =============================================================================
-- Flyway 迁移: V4__outbox_events.sql
-- 描述: Outbox 事件表（事务外盒）用于分布式事务最终一致性
-- 说明:
--  - 业务数据写入与 outbox_events 写入同一 DB 事务，避免 dual-write 问题
--  - publisher 轮询 outbox_events 并投递到下游（HTTP / MQ 等），实现 at-least-once
-- =============================================================================

CREATE TABLE IF NOT EXISTS outbox_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL,
    aggregate_type VARCHAR(64),
    aggregate_id VARCHAR(128),
    idempotency_key VARCHAR(128),
    payload TEXT NOT NULL,
    headers TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | processing | sent | failed
    attempts INT NOT NULL DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE
);

-- 幂等：同一 idempotency_key（如 paymentId/refId）只写入一次 outbox 事件
CREATE UNIQUE INDEX IF NOT EXISTS idx_outbox_events_idempotency_key
ON outbox_events(idempotency_key)
WHERE idempotency_key IS NOT NULL;

-- publisher 扫描 pending 事件
CREATE INDEX IF NOT EXISTS idx_outbox_events_status_created_at
ON outbox_events(status, created_at);

