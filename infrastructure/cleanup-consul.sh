#!/bin/bash
# 清理Consul - 删除所有旧Deployment和Pod，只保留正确的配置
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
echo -e "${BLUE}清理Consul - 删除所有旧资源${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. 列出所有Consul Deployment
echo -e "\n${YELLOW}[1/5] 当前Consul Deployment:${NC}"
kubectl get deployment -n "${NAMESPACE}" -l app=consul

# 2. 删除所有Consul Deployment（包括旧的）
echo -e "\n${YELLOW}[2/5] 删除所有Consul Deployment...${NC}"
kubectl delete deployment -n "${NAMESPACE}" -l app=consul --ignore-not-found=true
echo -e "${GREEN}✓ 所有Consul Deployment已删除${NC}"

# 3. 删除所有Consul Pod
echo -e "\n${YELLOW}[3/5] 删除所有Consul Pod...${NC}"
kubectl delete pod -n "${NAMESPACE}" -l app=consul --ignore-not-found=true
echo -e "${GREEN}✓ 所有Consul Pod已删除${NC}"

# 4. 等待清理完成
echo -e "\n${YELLOW}[4/5] 等待清理完成...${NC}"
sleep 5

# 5. 重新应用正确的Consul配置
echo -e "\n${YELLOW}[5/5] 应用正确的Consul配置...${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
kubectl apply -f "${SCRIPT_DIR}/k8s/base/consul/configmap.yaml"
kubectl apply -f "${SCRIPT_DIR}/k8s/base/consul/deployment.yaml"
echo -e "${GREEN}✓ Consul配置已应用${NC}"

# 6. 等待新Pod创建并查看状态
echo -e "\n${BLUE}等待新Pod创建...${NC}"
sleep 10

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}当前状态${NC}"
echo -e "${BLUE}========================================${NC}"
kubectl get deployment -n "${NAMESPACE}" -l app=consul
kubectl get pods -n "${NAMESPACE}" -l app=consul -o wide

# 7. 查看新Pod日志
NEW_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=consul -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "${NEW_POD}" ]; then
    echo -e "\n${BLUE}查看Consul Pod日志 (${NEW_POD}):${NC}"
    kubectl logs "${NEW_POD}" -n "${NAMESPACE}" --tail=50 2>&1 || echo -e "${YELLOW}无法获取日志${NC}"
fi

echo -e "\n${GREEN}清理完成！${NC}"
echo -e "\n${YELLOW}下一步:${NC}"
echo -e "  1. 等待Pod就绪: kubectl wait --for=condition=ready pod -n ${NAMESPACE} -l app=consul --timeout=300s"
echo -e "  2. 查看日志: kubectl logs -n ${NAMESPACE} -l app=consul --tail=100"
echo -e "  3. 运行诊断: ./quick-diagnose.sh"
