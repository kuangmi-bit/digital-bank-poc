-- =============================================================================
-- Flyway 迁移: V1__init_schema.sql
-- 描述: 数字银行 POC 核心银行 PostgreSQL 初始 Schema（客户、账户、交易）
-- 遵循: technical-standards-v1.0, naming-conventions
-- 规范: 表/列 snake_case、复数表名、主键 id、外键 {table}_id、金额 DECIMAL(19,2)、时间 TIMESTAMP WITH TIME ZONE
-- Agent: Agent 9 数据处理分析师
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. customers 客户表
-- -----------------------------------------------------------------------------
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

-- 约束
ALTER TABLE customers ADD CONSTRAINT uk_customers_id_card UNIQUE (id_card);

-- 索引 idx_{table}_{column}
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_created_at ON customers(created_at);

COMMENT ON TABLE customers IS '客户主数据';
COMMENT ON COLUMN customers.id_card IS '身份证号，唯一';
COMMENT ON COLUMN customers.status IS 'active, inactive, blocked';

-- -----------------------------------------------------------------------------
-- 2. bank_accounts 银行账户表
-- -----------------------------------------------------------------------------
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

-- 约束
ALTER TABLE bank_accounts ADD CONSTRAINT uk_bank_accounts_account_number UNIQUE (account_number);

-- 索引
CREATE INDEX idx_bank_accounts_account_number ON bank_accounts(account_number);
CREATE INDEX idx_bank_accounts_customer_id ON bank_accounts(customer_id);
CREATE INDEX idx_bank_accounts_status ON bank_accounts(status);
CREATE INDEX idx_bank_accounts_created_at ON bank_accounts(created_at);

COMMENT ON TABLE bank_accounts IS '银行账户';
COMMENT ON COLUMN bank_accounts.balance IS '余额，DECIMAL(19,2)';
COMMENT ON COLUMN bank_accounts.account_type IS 'savings, current, 等';
COMMENT ON COLUMN bank_accounts.status IS 'active, inactive, frozen, closed';

-- -----------------------------------------------------------------------------
-- 3. transactions 交易表
-- -----------------------------------------------------------------------------
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

-- 约束
ALTER TABLE transactions ADD CONSTRAINT uk_transactions_transaction_id UNIQUE (transaction_id);

-- 索引
CREATE INDEX idx_transactions_transaction_id ON transactions(transaction_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_counter_account_id ON transactions(counter_account_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_account_created ON transactions(account_id, created_at DESC);

COMMENT ON TABLE transactions IS '交易记录';
COMMENT ON COLUMN transactions.transaction_id IS '业务流水号，唯一';
COMMENT ON COLUMN transactions.counter_account_id IS '对手账户，转账时非空';
COMMENT ON COLUMN transactions.transaction_type IS 'deposit, withdrawal, transfer_in, transfer_out, payment, 等';
COMMENT ON COLUMN transactions.status IS 'pending, processing, completed, failed, cancelled';
