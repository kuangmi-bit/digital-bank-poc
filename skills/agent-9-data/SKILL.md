---
name: agent-9-data
version: 1.0.0
description: 数据处理分析师Agent技能 - 负责数据模型设计、数据库迁移、测试数据生成和数据质量分析。使用PostgreSQL + MongoDB + Redis + Flyway + Faker技术栈。
author: Digital Bank POC Team
license: MIT
keywords:
  - database
  - postgresql
  - mongodb
  - data-modeling
  - data-migration
  - test-data
  - data-quality
  - er-diagram
---

# Agent 9: 数据处理分析师 📊

## 概述

Agent 9负责数据模型设计、数据库迁移、测试数据生成和数据质量分析。确保数据模型设计合理，测试数据充足，数据质量达标。

## 何时使用

当需要：
- 设计数据模型和ER图
- 创建数据库Schema
- 生成测试数据
- 执行数据质量检查
- 分析数据性能

## 技术栈

- **关系数据库**: PostgreSQL 15
- **文档数据库**: MongoDB 7.0
- **缓存**: Redis
- **数据迁移**: Flyway
- **数据生成**: Python Faker, Faker.js
- **数据分析**: Pandas
- **数据质量**: Great Expectations（可选）

## 核心功能

### 1. 数据模型设计
- ER图设计
- PostgreSQL Schema设计
- MongoDB Collection设计
- 数据字典生成

### 2. 数据库迁移
- Flyway迁移脚本
- Schema版本管理
- 数据迁移脚本

### 3. 测试数据生成
- 账户数据：10万+条
- 客户数据：5万+条
- 交易数据：100万+条
- 数据质量验证

### 4. 数据质量分析
- 数据质量检查
- 性能分析
- 数据质量报告

## 自动化能力

- **数据自动化**: 85%自动化
  - 数据模型自动设计（基于ER图）
  - Schema自动迁移（Flyway）
  - 测试数据自动生成（Faker）
  - 数据质量自动检查
  - 性能分析自动执行
  - ER图自动生成
  - 数据字典自动输出

## 数据规模

- **账户数据**: 10万+条
- **交易数据**: 100万+条
- **用户数据**: 5万+条

## 交付标准

- **数据模型文档**: 完整
- **测试数据**: 充足可用
- **数据质量报告**: ≥95分
- **性能分析报告**: 详实

## 项目结构

```
database/
├── postgresql/
│   └── migrations/      # Flyway迁移脚本
│       ├── V1__init_schema.sql
│       └── V2__add_indexes.sql
├── mongodb/
│   └── schemas/         # MongoDB Schema定义
│       ├── payment.json
│       └── settlement.json
├── test-data/           # 测试数据
│   ├── accounts.csv     # 10万+账户
│   ├── customers.csv   # 5万+客户
│   └── transactions.csv # 100万+交易
└── scripts/             # 数据生成脚本
    ├── generate_accounts.py
    ├── generate_customers.py
    └── generate_transactions.py

docs/
├── data-model/
│   ├── er-diagram.drawio  # ER图
│   └── data-dictionary-v1.0.md  # 数据字典
└── data-quality-report.md  # 数据质量报告
```

## 技术标准规范要求

**重要**: 必须严格遵循技术标准规范和命名规范。

### 必须遵循的规范文档

1. **技术标准规范 v1.0**: `docs/architecture/technical-standards-v1.0.md`
2. **命名规范 v1.0**: `docs/architecture/naming-conventions.md`

## 数据模型设计原则

- 遵循数据库范式（至少3NF）
- **严格遵循技术标准规范中的数据库设计规范**
- **严格遵循命名规范**
- 合理使用索引
- 考虑查询性能
- 数据完整性约束
- 支持水平扩展（如需要）

### 命名规范要点

- **PostgreSQL表**: snake_case, 复数 (如 `bank_accounts`, `transactions`)
- **PostgreSQL列**: snake_case (如 `account_number`, `customer_id`)
- **MongoDB集合**: snake_case, 复数 (如 `payments`, `settlements`)
- **MongoDB字段**: camelCase (如 `paymentId`, `orderId`, `createdAt`)
- **Elasticsearch索引**: snake_case (如 `risk_events`)
- **迁移脚本**: `V{version}__{description}.sql` (如 `V1__init_schema.sql`)

## 测试数据生成要求

- 数据真实性：使用Faker生成真实感数据
- 数据关联性：保证外键关联正确
- 数据分布：符合业务场景分布
- 数据量：满足性能测试需求

## 协作关系

- **与Agent 1**: 提供PostgreSQL数据模型
- **与Agent 2**: 提供MongoDB数据模型
- **与Agent 6**: 提供测试数据
- **与Agent 0**: 报告数据模型设计

## 关键里程碑

- **Day 1**: 数据模型设计和ER图完成
- **Day 2**: 数据字典v1.0完成
- **Day 3**: 数据库Schema迁移完成，测试数据生成（账户、客户）
- **Day 11**: 完整测试数据生成（100万+交易），数据质量报告完成

## 示例代码

### Flyway迁移脚本示例
```sql
-- 遵循命名规范: V{version}__{description}.sql
-- V1__init_schema.sql

-- 遵循命名规范: 表名snake_case, 复数形式
CREATE TABLE bank_accounts (
    id BIGSERIAL PRIMARY KEY,  -- 遵循命名规范: 主键使用id
    account_number VARCHAR(20) UNIQUE NOT NULL,  -- 遵循命名规范: 列名snake_case
    balance DECIMAL(19, 2) NOT NULL DEFAULT 0,  -- 遵循命名规范: 金额使用DECIMAL(19,2)
    customer_id BIGINT,  -- 遵循命名规范: 外键使用{table}_id格式
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,  -- 遵循命名规范: 时间戳使用TIMESTAMP WITH TIME ZONE
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 遵循命名规范: 索引命名idx_{table}_{column}
CREATE INDEX idx_bank_accounts_account_number ON bank_accounts(account_number);
CREATE INDEX idx_bank_accounts_customer_id ON bank_accounts(customer_id);
```

### 测试数据生成脚本示例
```python
from faker import Faker
import csv

fake = Faker('zh_CN')

def generate_accounts(count=100000):
    with open('accounts.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['id', 'account_number', 'balance', 'status'])
        
        for i in range(1, count + 1):
            writer.writerow([
                i,
                fake.numerify('##########'),
                round(fake.pydecimal(left_digits=8, right_digits=2, positive=True), 2),
                fake.random_element(elements=('active', 'inactive', 'frozen'))
            ])

if __name__ == '__main__':
    generate_accounts(100000)
```

## 数据备份恢复脚本

### PostgreSQL备份脚本

```bash
#!/bin/bash
# scripts/backup/pg_backup.sh
# PostgreSQL数据库备份脚本

set -e

# 配置
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-digitalbank}"
DB_USER="${DB_USER:-postgres}"
BACKUP_DIR="${BACKUP_DIR:-/backups/postgresql}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# 创建备份目录
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz"
mkdir -p ${BACKUP_DIR}

echo "Starting PostgreSQL backup..."
echo "Database: ${DB_NAME}"
echo "Backup file: ${BACKUP_FILE}"

# 执行备份
PGPASSWORD="${DB_PASSWORD}" pg_dump \
  -h ${DB_HOST} \
  -p ${DB_PORT} \
  -U ${DB_USER} \
  -d ${DB_NAME} \
  -F c \
  -b \
  -v \
  | gzip > ${BACKUP_FILE}

# 验证备份
if [ -f "${BACKUP_FILE}" ] && [ -s "${BACKUP_FILE}" ]; then
  echo "Backup completed successfully: ${BACKUP_FILE}"
  echo "Size: $(du -h ${BACKUP_FILE} | cut -f1)"
else
  echo "Backup failed!"
  exit 1
fi

# 清理过期备份
echo "Cleaning up backups older than ${RETENTION_DAYS} days..."
find ${BACKUP_DIR} -name "*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

echo "Backup process completed."
```

### PostgreSQL恢复脚本

```bash
#!/bin/bash
# scripts/backup/pg_restore.sh
# PostgreSQL数据库恢复脚本

set -e

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  echo "Example: $0 /backups/postgresql/digitalbank_20260126_100000.sql.gz"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

# 配置
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-digitalbank}"
DB_USER="${DB_USER:-postgres}"

echo "WARNING: This will restore the database from backup."
echo "Database: ${DB_NAME}"
echo "Backup file: ${BACKUP_FILE}"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Restore cancelled."
  exit 0
fi

echo "Starting restore..."

# 恢复数据库
gunzip -c ${BACKUP_FILE} | PGPASSWORD="${DB_PASSWORD}" pg_restore \
  -h ${DB_HOST} \
  -p ${DB_PORT} \
  -U ${DB_USER} \
  -d ${DB_NAME} \
  -c \
  -v

echo "Restore completed successfully."
```

### MongoDB备份脚本

```bash
#!/bin/bash
# scripts/backup/mongo_backup.sh

MONGO_URI="${MONGO_URI:-mongodb://localhost:27017}"
DB_NAME="${DB_NAME:-payment_db}"
BACKUP_DIR="${BACKUP_DIR:-/backups/mongodb}"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p ${BACKUP_DIR}

echo "Starting MongoDB backup..."

mongodump \
  --uri="${MONGO_URI}" \
  --db=${DB_NAME} \
  --out="${BACKUP_DIR}/${DATE}" \
  --gzip

# 打包
tar -czf "${BACKUP_DIR}/${DB_NAME}_${DATE}.tar.gz" -C "${BACKUP_DIR}" "${DATE}"
rm -rf "${BACKUP_DIR}/${DATE}"

echo "Backup completed: ${BACKUP_DIR}/${DB_NAME}_${DATE}.tar.gz"
```

---

## 索引优化策略

### PostgreSQL索引优化

```sql
-- 索引优化分析脚本
-- scripts/optimization/analyze_indexes.sql

-- 1. 查找未使用的索引
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE 'pk_%'
  AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;

-- 2. 查找缺失的索引（基于查询统计）
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    CASE WHEN seq_scan > 0
        THEN round(100.0 * idx_scan / (seq_scan + idx_scan), 2)
        ELSE 100
    END as index_usage_percent
FROM pg_stat_user_tables
WHERE seq_scan > 100  -- 全表扫描超过100次
  AND pg_relation_size(relid) > 10000000  -- 表大于10MB
ORDER BY seq_scan DESC;

-- 3. 索引大小统计
SELECT
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    pg_size_pretty(pg_relation_size(relid)) as table_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;

-- 4. 建议添加的索引
-- 基于查询模式，以下是建议的索引：

-- 账户查询优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bank_accounts_customer_id_status
ON bank_accounts(customer_id, status);

-- 交易查询优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_account_created
ON transactions(account_id, created_at DESC);

-- 复合索引优化（覆盖索引）
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bank_accounts_covering
ON bank_accounts(account_number) INCLUDE (balance, status);
```

### MongoDB索引优化

```javascript
// scripts/optimization/mongo_indexes.js

// 1. 分析慢查询
db.setProfilingLevel(1, { slowms: 100 });

// 2. 查看索引使用情况
db.payments.aggregate([
  { $indexStats: {} }
]);

// 3. 建议的索引
// 支付订单查询
db.payments.createIndex(
  { orderId: 1 },
  { unique: true, background: true }
);

// 用户支付历史
db.payments.createIndex(
  { userId: 1, createdAt: -1 },
  { background: true }
);

// 状态查询
db.payments.createIndex(
  { status: 1, createdAt: -1 },
  { background: true }
);

// 复合索引
db.payments.createIndex(
  { userId: 1, status: 1, createdAt: -1 },
  { background: true }
);

// 4. 删除未使用的索引
// db.payments.dropIndex("unused_index_name");
```

---

## 数据脱敏规则

### 脱敏配置

```yaml
# config/data-masking.yml
masking_rules:
  # 客户表脱敏规则
  customers:
    - column: phone
      type: phone
      rule: "保留前3后4"
      example: "138****1234"
    - column: id_card
      type: id_card
      rule: "保留前4后4"
      example: "3201****5678"
    - column: email
      type: email
      rule: "保留首字符"
      example: "z****@example.com"
    - column: name
      type: name
      rule: "保留姓"
      example: "张**"
    - column: address
      type: address
      rule: "保留省市"
      example: "江苏省南京市****"

  # 账户表脱敏规则
  bank_accounts:
    - column: account_number
      type: bank_card
      rule: "保留前6后4"
      example: "622848****1234"

  # 交易表脱敏规则
  transactions:
    - column: remark
      type: text
      rule: "全部脱敏"
      example: "****"
```

### 脱敏脚本

```python
# scripts/data_masking.py
import re
from typing import Callable, Dict

class DataMasker:
    """数据脱敏工具类"""

    @staticmethod
    def mask_phone(phone: str) -> str:
        """手机号脱敏：保留前3后4"""
        if not phone or len(phone) != 11:
            return phone
        return phone[:3] + '****' + phone[7:]

    @staticmethod
    def mask_id_card(id_card: str) -> str:
        """身份证脱敏：保留前4后4"""
        if not id_card or len(id_card) < 8:
            return id_card
        return id_card[:4] + '****' + id_card[-4:]

    @staticmethod
    def mask_bank_card(card: str) -> str:
        """银行卡脱敏：保留前6后4"""
        if not card or len(card) < 10:
            return card
        return card[:6] + '****' + card[-4:]

    @staticmethod
    def mask_email(email: str) -> str:
        """邮箱脱敏：保留首字符"""
        if not email or '@' not in email:
            return email
        at_index = email.index('@')
        return email[0] + '****' + email[at_index:]

    @staticmethod
    def mask_name(name: str) -> str:
        """姓名脱敏：保留姓"""
        if not name or len(name) < 2:
            return name
        return name[0] + '**'

def mask_export_data(df, table_name: str, rules: Dict):
    """对导出数据进行脱敏处理"""
    masker = DataMasker()
    table_rules = rules.get(table_name, [])

    for rule in table_rules:
        column = rule['column']
        mask_type = rule['type']

        if column in df.columns:
            mask_func = getattr(masker, f'mask_{mask_type}', None)
            if mask_func:
                df[column] = df[column].apply(mask_func)

    return df
```

---

## 分区策略

### PostgreSQL表分区

```sql
-- 交易表按月分区
-- scripts/partitioning/create_partitions.sql

-- 创建分区主表
CREATE TABLE transactions_partitioned (
    id BIGSERIAL,
    transaction_id VARCHAR(32) NOT NULL,
    account_id BIGINT NOT NULL,
    amount DECIMAL(19, 2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 创建月度分区
CREATE TABLE transactions_2026_01 PARTITION OF transactions_partitioned
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE transactions_2026_02 PARTITION OF transactions_partitioned
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- 创建分区索引
CREATE INDEX idx_transactions_2026_01_account
ON transactions_2026_01(account_id, created_at DESC);

-- 自动创建分区的函数
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
    partition_date DATE;
    partition_name TEXT;
    start_date DATE;
    end_date DATE;
BEGIN
    partition_date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
    partition_name := 'transactions_' || TO_CHAR(partition_date, 'YYYY_MM');
    start_date := partition_date;
    end_date := partition_date + INTERVAL '1 month';

    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF transactions_partitioned
         FOR VALUES FROM (%L) TO (%L)',
        partition_name, start_date, end_date
    );

    RAISE NOTICE 'Created partition: %', partition_name;
END;
$$ LANGUAGE plpgsql;

-- 定期调度（使用pg_cron）
-- SELECT cron.schedule('create-monthly-partition', '0 0 25 * *', 'SELECT create_monthly_partition()');
```

### MongoDB分片配置

```javascript
// scripts/partitioning/mongo_sharding.js

// 启用分片
sh.enableSharding("payment_db");

// 对payments集合按时间分片
sh.shardCollection(
  "payment_db.payments",
  { createdAt: 1, paymentId: 1 }  // 复合分片键
);

// 配置分片区域（可选）
sh.addShardTag("shard0001", "hot");
sh.addShardTag("shard0002", "warm");
sh.addShardTag("shard0003", "cold");

// 按时间范围分配到不同分片
sh.addTagRange(
  "payment_db.payments",
  { createdAt: new Date("2026-01-01") },
  { createdAt: new Date("2026-02-01") },
  "hot"
);
```

---

## 数据质量检查

### 数据质量规则

```python
# scripts/data_quality/quality_checks.py
from dataclasses import dataclass
from typing import List, Dict, Any
import pandas as pd

@dataclass
class QualityRule:
    name: str
    table: str
    column: str
    rule_type: str
    threshold: float
    description: str

class DataQualityChecker:
    def __init__(self, connection):
        self.conn = connection
        self.rules = self._load_rules()

    def _load_rules(self) -> List[QualityRule]:
        return [
            QualityRule("completeness_account_number", "bank_accounts", "account_number", "not_null", 1.0, "账号不能为空"),
            QualityRule("completeness_balance", "bank_accounts", "balance", "not_null", 1.0, "余额不能为空"),
            QualityRule("uniqueness_account_number", "bank_accounts", "account_number", "unique", 1.0, "账号必须唯一"),
            QualityRule("range_balance", "bank_accounts", "balance", "range", 0.0, "余额不能为负"),
            QualityRule("format_phone", "customers", "phone", "regex", 0.99, "手机号格式"),
        ]

    def check_not_null(self, table: str, column: str) -> Dict:
        query = f"SELECT COUNT(*) as total, COUNT({column}) as non_null FROM {table}"
        df = pd.read_sql(query, self.conn)
        rate = df['non_null'].iloc[0] / df['total'].iloc[0]
        return {"rate": rate, "passed": rate >= 1.0}

    def check_unique(self, table: str, column: str) -> Dict:
        query = f"""
            SELECT COUNT(*) as total,
                   COUNT(DISTINCT {column}) as distinct_count
            FROM {table}
        """
        df = pd.read_sql(query, self.conn)
        rate = df['distinct_count'].iloc[0] / df['total'].iloc[0]
        return {"rate": rate, "passed": rate >= 1.0}

    def run_all_checks(self) -> List[Dict]:
        results = []
        for rule in self.rules:
            if rule.rule_type == "not_null":
                result = self.check_not_null(rule.table, rule.column)
            elif rule.rule_type == "unique":
                result = self.check_unique(rule.table, rule.column)
            else:
                result = {"rate": 1.0, "passed": True}

            results.append({
                "rule": rule.name,
                "table": rule.table,
                "column": rule.column,
                **result
            })
        return results

    def generate_report(self) -> Dict:
        results = self.run_all_checks()
        passed = sum(1 for r in results if r['passed'])
        return {
            "total_rules": len(results),
            "passed": passed,
            "failed": len(results) - passed,
            "score": round(passed / len(results) * 100, 2),
            "details": results
        }
```

---

## 相关资源

- Agent启动提示词: `agent_prompts.md`
- 详细工作计划: `digital_bank_poc_workplan.md`
- **技术标准规范 v1.0**: `docs/architecture/technical-standards-v1.0.md` ⚠️ **必须遵循**
- **命名规范 v1.0**: `docs/architecture/naming-conventions.md` ⚠️ **必须遵循**

---

**版本**: v1.1.0  
**创建日期**: 2026-01-26  
**维护者**: Digital Bank POC Team
