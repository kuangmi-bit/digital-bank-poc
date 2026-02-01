#!/usr/bin/env bash
# 执行 PostgreSQL Schema 迁移 (V1, V2)
# 遵循: data-dictionary-v1.0, ADR-003；勿修改已有 V1，新需求以新迁移迭代
# 用法: ./run-pg-migrate.sh  或 PGURL='postgresql://...' ./run-pg-migrate.sh
# 前提: 已创建数据库 digitalbank（如 createdb digitalbank）

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MIGRATIONS="$SCRIPT_DIR/../postgresql/migrations"
PGURL="${PGURL:-postgresql://postgres:postgres@localhost:5432/digitalbank}"

if ! command -v psql >/dev/null 2>&1; then
  echo "错误: 未找到 psql，请安装 PostgreSQL 客户端" >&2
  exit 1
fi

echo "使用连接: ${PGURL/:*@/:***@}"
echo "迁移目录: $MIGRATIONS"

for f in "$MIGRATIONS/V1__init_schema.sql" "$MIGRATIONS/V2__add_indexes.sql"; do
  [ -f "$f" ] || { echo "未找到: $f" >&2; exit 1; }
  echo "执行: $f"
  psql "$PGURL" -v ON_ERROR_STOP=1 -f "$f"
done

echo "PostgreSQL 迁移完成 (V1, V2)。"
