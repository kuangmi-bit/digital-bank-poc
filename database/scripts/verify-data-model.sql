-- 验证数据模型完整性（PostgreSQL）
-- 依据 data-dictionary-v1.0；执行迁移并可选导入 CSV 后运行
-- 用法: psql $PGURL -f database/scripts/verify-data-model.sql

\echo '=== 1. 表存在性 ==='
SELECT relname AS table_name
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
 WHERE n.nspname = 'public' AND c.relkind = 'r'
   AND relname IN ('customers','bank_accounts','transactions')
 ORDER BY relname;

\echo ''
\echo '=== 2. 行数 ==='
SELECT 'customers' AS t, count(*) AS cnt FROM customers
UNION ALL
SELECT 'bank_accounts', count(*) FROM bank_accounts
UNION ALL
SELECT 'transactions', count(*) FROM transactions;

\echo ''
\echo '=== 3. 约束与索引（摘要） ==='
SELECT conname AS constraint_name, conrelid::regclass AS table_name
  FROM pg_constraint
 WHERE connamespace = 'public'::regnamespace
   AND contype IN ('p','u','f')
   AND conrelid::regclass::text IN ('customers','bank_accounts','transactions')
 ORDER BY conrelid::regclass::text, conname;

\echo ''
\echo '=== 4. 客户 id_card 唯一性（有数据时） ==='
SELECT count(*) AS total, count(DISTINCT id_card) AS distinct_id_card
  FROM customers WHERE id_card IS NOT NULL;

\echo ''
\echo '=== 5. 账户 account_number 唯一性（有数据时） ==='
SELECT count(*) AS total, count(DISTINCT account_number) AS distinct_account_number
  FROM bank_accounts;

\echo ''
\echo '=== 6. 账户 customer_id 外键有效（有数据时） ==='
SELECT count(*) AS orphan_accounts
  FROM bank_accounts a
  WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.id = a.customer_id);

\echo ''
\echo '验证完成。'
