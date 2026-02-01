#!/bin/bash
# 调试Consul Pod问题
# 符合技术标准规范 v1.0 和命名规范 v1.0

set -euo pipefail

# 颜色输出
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

NAMESPACE="digital-bank-poc"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}调试Consul Pod${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. 查看当前Pod状态
echo -e "\n${YELLOW}[1] 当前Pod状态:${NC}"
kubectl get pods -n "${NAMESPACE}" -l app=consul -o wide

# 2. 获取Pod名称
CONSUL_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=consul -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "${CONSUL_POD}" ]; then
    echo -e "${RED}✗ 未找到Consul Pod${NC}"
    echo -e "\n查看最近的Pod（包括已删除的）:"
    kubectl get pods -n "${NAMESPACE}" -l app=consul --show-labels
    exit 1
fi

echo -e "\n${GREEN}Consul Pod: ${CONSUL_POD}${NC}"

# 3. 查看Pod详细状态
echo -e "\n${YELLOW}[2] Pod详细状态:${NC}"
kubectl get pod "${CONSUL_POD}" -n "${NAMESPACE}" -o yaml | grep -A 20 "status:" || kubectl describe pod "${CONSUL_POD}" -n "${NAMESPACE}" | tail -40

# 4. 查看InitContainer日志
echo -e "\n${YELLOW}[3] InitContainer日志:${NC}"
if kubectl logs "${CONSUL_POD}" -n "${NAMESPACE}" -c copy-consul-config 2>&1; then
    echo -e "${GREEN}✓ InitContainer执行成功${NC}"
else
    echo -e "${RED}✗ InitContainer执行失败或日志不可用${NC}"
fi

# 5. 查看Consul容器日志
echo -e "\n${YELLOW}[4] Consul容器日志（最近50行）:${NC}"
kubectl logs "${CONSUL_POD}" -n "${NAMESPACE}" --tail=50 2>&1 || echo -e "${YELLOW}无法获取当前日志${NC}"

# 6. 查看崩溃前的日志
echo -e "\n${YELLOW}[5] 崩溃前的日志:${NC}"
kubectl logs "${CONSUL_POD}" -n "${NAMESPACE}" --previous --tail=50 2>&1 || echo -e "${YELLOW}无法获取之前的日志${NC}"

# 7. 查看Pod事件
echo -e "\n${YELLOW}[6] Pod事件:${NC}"
kubectl get events -n "${NAMESPACE}" --field-selector involvedObject.name="${CONSUL_POD}" --sort-by='.lastTimestamp' | tail -20

# 8. 检查容器状态
echo -e "\n${YELLOW}[7] 容器状态:${NC}"
kubectl get pod "${CONSUL_POD}" -n "${NAMESPACE}" -o jsonpath='{.status.containerStatuses[*]}' | jq '.' 2>/dev/null || \
kubectl get pod "${CONSUL_POD}" -n "${NAMESPACE}" -o jsonpath='{.status.containerStatuses[0]}' | head -20

# 9. 检查InitContainer状态
echo -e "\n${YELLOW}[8] InitContainer状态:${NC}"
kubectl get pod "${CONSUL_POD}" -n "${NAMESPACE}" -o jsonpath='{.status.initContainerStatuses[*]}' | jq '.' 2>/dev/null || \
kubectl get pod "${CONSUL_POD}" -n "${NAMESPACE}" -o jsonpath='{.status.initContainerStatuses[0]}' | head -20

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}调试完成${NC}"
echo -e "${BLUE}========================================${NC}"
