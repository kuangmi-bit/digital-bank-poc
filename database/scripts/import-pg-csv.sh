#!/usr/bin/env bash
# 将 database/test-data/customers.csv、accounts.csv 导入 PostgreSQL
# 需先执行 run-pg-migrate，且 CSV 已由 generate-bulk-csv 生成
# 从项目根目录运行: ./database/scripts/import-pg-csv.sh

set -e
PROJECT_ROOT="${PROJECT_ROOT:-$(pwd)}"
DATA="$PROJECT_ROOT/database/test-data"
PGURL="${PGURL:-postgresql://postgres:postgres@localhost:5432/digitalbank}"

for f in customers.csv accounts.csv; do
  p="$DATA/$f"
  [ -f "$p" ] || { echo "未找到 $p，跳过" >&2; continue; }
  ap="$(cd "$(dirname "$p")" && pwd)/$(basename "$p")"
  if [ "$f" = "customers.csv" ]; then
    psql "$PGURL" -v ON_ERROR_STOP=1 -c "\\copy customers(name,id_card,phone,email,address,status) from '$ap' with (format csv, header true, encoding 'UTF8')"
  elif [ "$f" = "accounts.csv" ]; then
    psql "$PGURL" -v ON_ERROR_STOP=1 -c "\\copy bank_accounts(account_number,customer_id,balance,currency,account_type,status) from '$ap' with (format csv, header true, encoding 'UTF8')"
  fi
  echo "已导入: $f"
done
echo "CSV 导入完成。"
