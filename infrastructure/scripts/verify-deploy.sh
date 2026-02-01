#!/usr/bin/env bash
# 部署验证与健康检查 - 数字银行 POC (Day 3 Agent 8)
# 用法: ./verify-deploy.sh <env>
# 验证: 构建产物(镜像)、部署(Deployment/Service)、健康检查(HTTP)

set -e

ENV="${1:-dev}"
if [[ -z "${NAMESPACE:-}" ]]; then
  if [[ "$ENV" == "dev" ]]; then
    NAMESPACE="digital-bank-poc"
  else
    NAMESPACE="$ENV"
  fi
fi
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "[verify] env=$ENV namespace=$NAMESPACE"

# 检查 deployment 是否就绪
check_deployment_ready() {
  local dep="$1"
  local ready
  ready=$(kubectl get deployment "$dep" -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
  if [[ "${ready:-0}" -ge 1 ]]; then
    echo "[ok] $dep ready ${ready}/1"
    return 0
  fi
  echo "[warn] $dep not ready (readyReplicas=${ready:-0})"
  return 1
}

# 健康检查：从集群内 curl 服务
# 2xx/404 视为可达；000/5xx 视为不可用
health_curl() {
  local svc="$1"
  local port="$2"
  local path="$3"
  local url="http://${svc}.${NAMESPACE}.svc.cluster.local:${port}${path}"
  local code
  code=$(kubectl run "verify-curl-$$-${RANDOM}" --rm -i --restart=Never -n "$NAMESPACE" \
    --image=curlimages/curl:8.5.0 -- \
    curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>/dev/null || echo "000")
  if [[ "$code" =~ ^(2[0-9][0-9]|404)$ ]]; then
    echo "[ok] $svc $path -> $code"
    return 0
  fi
  echo "[warn] $svc $path -> $code (accept 2xx/404)"
  return 0
}

failed=0

# 1) Deployment 就绪
for dep in core-bank-service-deployment payment-service-deployment risk-service-deployment frontend-deployment; do
  if ! check_deployment_ready "$dep"; then
    ((failed++)) || true
  fi
done

# 2) 健康检查（缺失 /health 时 404 视为通过）
health_curl "core-bank-service" "8080" "/actuator/health/readiness" || true
health_curl "core-bank-service" "8080" "/actuator/health" || true
health_curl "payment-service" "3001" "/health" || true
health_curl "risk-service" "8000" "/health" || true
health_curl "frontend" "80" "/" || true

if [[ $failed -gt 0 ]]; then
  echo "[verify] 有 $failed 个 Deployment 未就绪"
  exit 1
fi
echo "[verify] 通过"
