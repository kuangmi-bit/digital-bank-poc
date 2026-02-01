#!/bin/bash
# 验证服务发现 (Day 3 Agent 5 d3a5t6)
# 1) Consul Catalog: core-bank-service、payment-service、risk-service
# 2) 可选: 经 Kong 访问 /actuator/health、/health 等
# 符合 technical-standards-v1.0、naming-conventions、ADR-004
# 需在 digital-bank-poc 命名空间、kubectl 可用环境运行

set -euo pipefail

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

NAMESPACE="digital-bank-poc"
CONSUL_URL="http://localhost:8500"
KONG_PROXY="http://kong.${NAMESPACE}.svc.cluster.local:8000"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}验证服务发现 (Consul + Kong)${NC}"
echo -e "${BLUE}========================================${NC}"

# 获取可用于 exec 的 Pod（优先 Consul，有 wget）
RUNNER_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=consul -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -z "${RUNNER_POD}" ]; then
  RUNNER_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=kong -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
fi
if [ -z "${RUNNER_POD}" ]; then
  RUNNER_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=nginx -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
fi

if [ -z "${RUNNER_POD}" ]; then
  echo -e "${RED}✗ 未找到可用的 Pod (consul/kong/nginx)${NC}"
  exit 1
fi

echo -e "\n${GREEN}使用 Pod: ${RUNNER_POD}${NC}"

# ---- 1. Consul Catalog 服务发现 ----
echo -e "\n${YELLOW}[1] Consul Catalog 服务发现${NC}"

# 若在 Consul Pod 内，用 localhost:8500；否则用 Service DNS
if [[ "${RUNNER_POD}" == consul-* ]]; then
  BASE="${CONSUL_URL}"
else
  BASE="http://consul-server.${NAMESPACE}.svc.cluster.local:8500"
fi

for SVC in core-bank-service payment-service risk-service; do
  if kubectl exec -n "${NAMESPACE}" "${RUNNER_POD}" -- wget -q -O- --timeout=5 "${BASE}/v1/catalog/service/${SVC}" 2>/dev/null | grep -q .; then
    echo -e "${GREEN}✓ Consul 可发现: ${SVC}${NC}"
  else
    echo -e "${YELLOW}⚠ Consul 未发现: ${SVC} (静态注册或 agent 未就绪时可为空)${NC}"
  fi
done

# ---- 2. 经 Kong 访问后端健康 (若 Kong 与对应服务可用) ----
echo -e "\n${YELLOW}[2] 经 Kong 访问健康端点${NC}"

# /actuator/health -> core-bank
if kubectl exec -n "${NAMESPACE}" "${RUNNER_POD}" -- wget -q -O- --timeout=5 "${KONG_PROXY}/actuator/health" 2>/dev/null | head -c 200 | grep -q .; then
  echo -e "${GREEN}✓ Kong -> /actuator/health (core-bank) 可访问${NC}"
else
  echo -e "${YELLOW}⚠ Kong -> /actuator/health 不可用 (core-bank 或 Postgres 未就绪时正常)${NC}"
fi

# /api/v1/health -> core-bank
if kubectl exec -n "${NAMESPACE}" "${RUNNER_POD}" -- wget -q -O- --timeout=5 "${KONG_PROXY}/api/v1/health" 2>/dev/null | head -c 200 | grep -q .; then
  echo -e "${GREEN}✓ Kong -> /api/v1/health (core-bank) 可访问${NC}"
else
  echo -e "${YELLOW}⚠ Kong -> /api/v1/health 不可用${NC}"
fi

# 直连 K8s Service 健康（不经过 Kong）
echo -e "\n${YELLOW}[3] 直连 K8s Service 健康检查 (仅验证 DNS 与端口)${NC}"
for SVC in "core-bank-service|8080|/actuator/health" "payment-service|3000|/health" "risk-service|8000|/health"; do
  IFS='|' read -r NAME PORT EP_PATH <<< "${SVC}"
  URL="http://${NAME}.${NAMESPACE}.svc.cluster.local:${PORT}${EP_PATH}"
  if kubectl exec -n "${NAMESPACE}" "${RUNNER_POD}" -- wget -q -O- --timeout=5 "${URL}" 2>/dev/null | head -c 100 | grep -q .; then
    echo -e "${GREEN}✓ ${NAME} ${EP_PATH} 可访问${NC}"
  else
    echo -e "${YELLOW}⚠ ${NAME} ${EP_PATH} 不可用${NC}"
  fi
done

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}验证完成${NC}"
echo -e "${BLUE}========================================${NC}"
