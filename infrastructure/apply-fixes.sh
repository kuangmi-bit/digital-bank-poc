#!/bin/bash
# 应用修复脚本 - 修复Consul、Nginx和Kong的部署问题
# 符合技术标准规范 v1.0 和命名规范 v1.0

set -euo pipefail

# 颜色输出
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}"

NAMESPACE="digital-bank-poc"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}应用部署修复${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. 修复Consul镜像
echo -e "\n${YELLOW}[1/4] 修复Consul镜像...${NC}"
kubectl apply -f "${PROJECT_ROOT}/k8s/base/consul/deployment.yaml"
echo -e "${GREEN}✓ Consul Deployment已更新${NC}"

# 2. 修复Nginx配置
echo -e "\n${YELLOW}[2/4] 修复Nginx配置...${NC}"
kubectl apply -f "${PROJECT_ROOT}/k8s/base/nginx/configmap.yaml"
echo -e "${GREEN}✓ Nginx ConfigMap已更新${NC}"

# 删除现有Nginx Pod以应用新配置
echo -e "\n删除现有Nginx Pod以应用新配置..."
kubectl delete pod -n "${NAMESPACE}" -l app=nginx --ignore-not-found=true
echo -e "${GREEN}✓ Nginx Pod已删除，将自动重新创建${NC}"

# 3. 修复Kong健康检查
echo -e "\n${YELLOW}[3/4] 修复Kong健康检查配置...${NC}"
kubectl apply -f "${PROJECT_ROOT}/k8s/base/kong/deployment.yaml"
echo -e "${GREEN}✓ Kong Deployment已更新${NC}"

# 4. 等待Pod就绪
echo -e "\n${YELLOW}[4/4] 等待Pod就绪...${NC}"

echo -e "\n等待Consul Pod就绪..."
if kubectl wait --for=condition=ready pod -n "${NAMESPACE}" -l app=consul --timeout=300s 2>/dev/null; then
    echo -e "${GREEN}✓ Consul Pod已就绪${NC}"
else
    echo -e "${YELLOW}⚠ Consul Pod未就绪，请检查日志${NC}"
fi

echo -e "\n等待Nginx Pod就绪..."
if kubectl wait --for=condition=ready pod -n "${NAMESPACE}" -l app=nginx --timeout=300s 2>/dev/null; then
    echo -e "${GREEN}✓ Nginx Pod已就绪${NC}"
else
    echo -e "${YELLOW}⚠ Nginx Pod未就绪，请检查日志${NC}"
fi

echo -e "\n检查Kong Pod状态..."
KONG_STATUS=$(kubectl get pod -n "${NAMESPACE}" -l app=kong -o jsonpath='{.items[0].status.phase}' 2>/dev/null || echo "Unknown")
if [ "${KONG_STATUS}" = "Running" ]; then
    echo -e "${GREEN}✓ Kong Pod运行中${NC}"
else
    echo -e "${YELLOW}⚠ Kong Pod状态: ${KONG_STATUS}${NC}"
fi

# 5. 显示当前状态
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}当前Pod状态${NC}"
echo -e "${BLUE}========================================${NC}"
kubectl get pods -n "${NAMESPACE}" -o wide

echo -e "\n${GREEN}修复完成！${NC}"
echo -e "\n${YELLOW}下一步:${NC}"
echo -e "  1. 运行诊断脚本: ./quick-diagnose.sh"
echo -e "  2. 运行验证脚本: ./dev-environment-verify.sh"
echo -e "  3. 如果问题仍然存在，查看Pod日志: kubectl logs -n ${NAMESPACE} <pod-name>"
