-- =============================================================================
-- Flyway 迁移: V1__init_schema.sql
-- 描述: 数字银行 POC 核心银行 PostgreSQL 初始 Schema（客户、账户、交易）
-- 与 database/postgresql/migrations/V1__init_schema.sql 保持一致
-- 遵循: technical-standards-v1.0, naming-conventions
-- =============================================================================

CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    id_card VARCHAR(18),
    phone VARCHAR(20),
    email VARCHAR(128),
    address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE customers ADD CONSTRAINT uk_customers_id_card UNIQUE (id_card);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_created_at ON customers(created_at);

CREATE TABLE bank_accounts (
    id BIGSERIAL PRIMARY KEY,
    account_number VARCHAR(20) NOT NULL,
    customer_id BIGINT NOT NULL,
    balance DECIMAL(19, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
    account_type VARCHAR(20) NOT NULL DEFAULT 'savings',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bank_accounts_customers FOREIGN KEY (customer_id) REFERENCES customers(id)
);
ALTER TABLE bank_accounts ADD CONSTRAINT uk_bank_accounts_account_number UNIQUE (account_number);
CREATE INDEX idx_bank_accounts_account_number ON bank_accounts(account_number);
CREATE INDEX idx_bank_accounts_customer_id ON bank_accounts(customer_id);
CREATE INDEX idx_bank_accounts_status ON bank_accounts(status);
CREATE INDEX idx_bank_accounts_created_at ON bank_accounts(created_at);

CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_id VARCHAR(32) NOT NULL,
    account_id BIGINT NOT NULL,
    counter_account_id BIGINT,
    amount DECIMAL(19, 2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transactions_bank_accounts FOREIGN KEY (account_id) REFERENCES bank_accounts(id),
    CONSTRAINT fk_transactions_counter_accounts FOREIGN KEY (counter_account_id) REFERENCES bank_accounts(id)
);
ALTER TABLE transactions ADD CONSTRAINT uk_transactions_transaction_id UNIQUE (transaction_id);
CREATE INDEX idx_transactions_transaction_id ON transactions(transaction_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_counter_account_id ON transactions(counter_account_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_account_created ON transactions(account_id, created_at DESC);
