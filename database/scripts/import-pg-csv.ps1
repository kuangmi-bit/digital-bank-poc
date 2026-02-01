# 将 database/test-data/customers.csv、accounts.csv 导入 PostgreSQL
# 需先执行 run-pg-migrate，且 CSV 已由 generate-bulk-csv 生成
# 从项目根目录运行: .\database\scripts\import-pg-csv.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = if ($env:PROJECT_ROOT) { $env:PROJECT_ROOT } else { (Get-Location).Path }
$DataDir = Join-Path $ProjectRoot "database\test-data"
$PGURL = if ($env:PGURL) { $env:PGURL } else { "postgresql://postgres:postgres@localhost:5432/digitalbank" }

foreach ($f in @("customers.csv","accounts.csv")) {
  $p = Join-Path $DataDir $f
  if (-not (Test-Path $p)) { Write-Warning "未找到 $p，跳过导入"; continue }
  $table = $f -replace '\.csv$',''
  if ($table -eq 'customers') {
    psql $PGURL -v ON_ERROR_STOP=1 -c "\copy customers(name,id_card,phone,email,address,status) from '$((Resolve-Path $p).Path)' with (format csv, header true, encoding 'UTF8')"
  } elseif ($table -eq 'accounts') {
    psql $PGURL -v ON_ERROR_STOP=1 -c "\copy bank_accounts(account_number,customer_id,balance,currency,account_type,status) from '$((Resolve-Path $p).Path)' with (format csv, header true, encoding 'UTF8')"
  }
  Write-Host "已导入: $f"
}
Write-Host "CSV 导入完成。"
