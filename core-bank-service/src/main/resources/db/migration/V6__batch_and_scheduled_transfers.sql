-- V6: 批量转账与预约转账表，ADR-008
-- 批量转账记录表
CREATE TABLE batch_transfers (
    id BIGSERIAL PRIMARY KEY,
    batch_id VARCHAR(36) UNIQUE NOT NULL,
    total_count INT NOT NULL,
    success_count INT NOT NULL,
    failed_count INT NOT NULL,
    result_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_batch_transfers_batch_id ON batch_transfers(batch_id);
CREATE INDEX idx_batch_transfers_created_at ON batch_transfers(created_at);

-- 预约转账表
CREATE TABLE scheduled_transfers (
    id BIGSERIAL PRIMARY KEY,
    scheduled_id VARCHAR(36) UNIQUE NOT NULL,
    from_account_id BIGINT NOT NULL,
    to_account_id BIGINT NOT NULL,
    amount DECIMAL(19, 2) NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    transaction_id VARCHAR(36),
    retry_count INT DEFAULT 0,
    error_message TEXT,
    remark VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_scheduled_from_account FOREIGN KEY (from_account_id) REFERENCES bank_accounts(id),
    CONSTRAINT fk_scheduled_to_account FOREIGN KEY (to_account_id) REFERENCES bank_accounts(id)
);

CREATE INDEX idx_scheduled_transfers_time_status ON scheduled_transfers(scheduled_time, status);
CREATE INDEX idx_scheduled_transfers_from_account ON scheduled_transfers(from_account_id);
CREATE INDEX idx_scheduled_transfers_scheduled_id ON scheduled_transfers(scheduled_id);
