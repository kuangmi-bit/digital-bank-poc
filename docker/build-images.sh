#!/usr/bin/env bash
# Docker 镜像构建脚本 - 数字银行 POC
# 用法: ./build-images.sh [tag]  默认 tag=latest
# 遵循: digitalbank/{service-name}:{tag} (小写 kebab-case)

set -e

TAG="${1:-latest}"
REGISTRY="${DOCKER_REGISTRY:-}"
PREFIX="digitalbank"

build_service() {
  local name="$1"
  local path="$2"
  if [[ ! -f "$path/Dockerfile" ]]; then
    echo "[skip] $name: 无 Dockerfile"
    return 0
  fi
  local img="${REGISTRY}${PREFIX}/${name}:${TAG}"
  echo "[build] $img"
  docker build -t "$img" -f "$path/Dockerfile" "$path"
  echo "[ok] $img"
}

# 从仓库根目录运行
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== 构建镜像 (tag=$TAG) ==="

build_service "core-bank-service" "core-bank-service"
build_service "payment-service"  "payment-service"
build_service "risk-service"     "risk-service"
build_service "frontend"         "frontend"

echo "=== 构建完成 ==="
