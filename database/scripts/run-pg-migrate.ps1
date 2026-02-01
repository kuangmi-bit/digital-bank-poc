# 执行 PostgreSQL Schema 迁移 (V1, V2)
# 遵循: data-dictionary-v1.0, ADR-003, 勿修改已有 V1，新需求以新迁移迭代
# 用法: .\run-pg-migrate.ps1  或 $env:PGURL='postgresql://...'; .\run-pg-migrate.ps1
# 前提: 已创建数据库 digitalbank（如 createdb digitalbank）

$ErrorActionPreference = "Stop"
$MigrationsDir = $PSScriptRoot + "\..\postgresql\migrations"

$PGURL = if ($env:PGURL) { $env:PGURL } else { "postgresql://postgres:postgres@localhost:5432/digitalbank" }

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Error "psql 未找到，请安装 PostgreSQL 客户端或设置 PATH"
}

Write-Host "使用连接: $($PGURL -replace ':[^:@]+@',':***@')"
Write-Host "迁移目录: $MigrationsDir"

$v1 = Join-Path $MigrationsDir "V1__init_schema.sql"
$v2 = Join-Path $MigrationsDir "V2__add_indexes.sql"

foreach ($f in @($v1, $v2)) {
    if (-not (Test-Path $f)) { Write-Error "未找到: $f" }
    Write-Host "执行: $f"
    psql $PGURL -v ON_ERROR_STOP=1 -f $f
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "PostgreSQL 迁移完成 (V1, V2)。"
