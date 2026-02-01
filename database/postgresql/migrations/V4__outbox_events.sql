-- =============================================================================
-- Flyway 迁移: V4__outbox_events.sql
-- 描述: Outbox 事件表（事务外盒）用于分布式事务最终一致性
-- 与 core-bank-service/src/main/resources/db/migration/V4__outbox_events.sql 保持一致
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_outbox_events_idempotency_key
ON outbox_events(idempotency_key)
WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_outbox_events_status_created_at
ON outbox_events(status, created_at);

