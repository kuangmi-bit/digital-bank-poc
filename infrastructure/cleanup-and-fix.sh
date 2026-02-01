#!/bin/bash
# 清理和修复脚本 - 删除旧Pod并应用修复
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
echo -e "${BLUE}清理和修复部署${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. 删除旧的Consul Deployment（使用旧镜像的）
echo -e "\n${YELLOW}[1/5] 清理旧的Consul Pod...${NC}"
kubectl delete pod -n "${NAMESPACE}" consul-server-574756d944-zrwsb --ignore-not-found=true
echo -e "${GREEN}✓ 旧Consul Pod已删除${NC}"

# 2. 检查Consul新Pod的日志
echo -e "\n${YELLOW}[2/5] 检查Consul新Pod状态...${NC}"
CONSUL_NEW_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=consul --field-selector=status.phase!=Succeeded -o jsonpath='{.items[?(@.spec.containers[0].image=="hashicorp/consul:1.22.2")].metadata.name}' 2>/dev/null || echo "")
if [ -n "${CONSUL_NEW_POD}" ]; then
    echo -e "新Consul Pod: ${CONSUL_NEW_POD}"
    echo -e "\n查看Consul Pod日志:"
    kubectl logs "${CONSUL_NEW_POD}" -n "${NAMESPACE}" --tail=30 2>&1 || true
else
    echo -e "${YELLOW}⚠ 未找到使用新镜像的Consul Pod${NC}"
fi

# 3. 修复Nginx配置（移除resolve参数）
echo -e "\n${YELLOW}[3/5] 修复Nginx配置...${NC}"
kubectl apply -f "${PROJECT_ROOT}/k8s/base/nginx/configmap.yaml"
echo -e "${GREEN}✓ Nginx ConfigMap已更新${NC}"

# 删除现有Nginx Pod以应用新配置
echo -e "\n删除现有Nginx Pod以应用新配置..."
kubectl delete pod -n "${NAMESPACE}" -l app=nginx --ignore-not-found=true
echo -e "${GREEN}✓ Nginx Pod已删除，将自动重新创建${NC}"

# 4. 应用Kong修复
echo -e "\n${YELLOW}[4/5] 应用Kong健康检查修复...${NC}"
kubectl apply -f "${PROJECT_ROOT}/k8s/base/kong/deployment.yaml"
echo -e "${GREEN}✓ Kong Deployment已更新${NC}"

# 5. 等待Pod就绪
echo -e "\n${YELLOW}[5/5] 等待Pod就绪...${NC}"

echo -e "\n等待Consul Pod就绪..."
if kubectl wait --for=condition=ready pod -n "${NAMESPACE}" -l app=consul --timeout=300s 2>/dev/null; then
    echo -e "${GREEN}✓ Consul Pod已就绪${NC}"
else
    echo -e "${YELLOW}⚠ Consul Pod未就绪，查看日志:${NC}"
    CONSUL_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=consul -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    if [ -n "${CONSUL_POD}" ]; then
        kubectl logs "${CONSUL_POD}" -n "${NAMESPACE}" --tail=50 2>&1 || true
    fi
fi

echo -e "\n等待Nginx Pod就绪..."
if kubectl wait --for=condition=ready pod -n "${NAMESPACE}" -l app=nginx --timeout=300s 2>/dev/null; then
    echo -e "${GREEN}✓ Nginx Pod已就绪${NC}"
else
    echo -e "${YELLOW}⚠ Nginx Pod未就绪，查看日志:${NC}"
    NGINX_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=nginx -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    if [ -n "${NGINX_POD}" ]; then
        kubectl logs "${NGINX_POD}" -n "${NAMESPACE}" --tail=50 2>&1 || true
    fi
fi

echo -e "\n检查Kong Pod状态..."
KONG_STATUS=$(kubectl get pod -n "${NAMESPACE}" -l app=kong -o jsonpath='{.items[0].status.phase}' 2>/dev/null || echo "Unknown")
if [ "${KONG_STATUS}" = "Running" ]; then
    echo -e "${GREEN}✓ Kong Pod运行中${NC}"
else
    echo -e "${YELLOW}⚠ Kong Pod状态: ${KONG_STATUS}${NC}"
fi

# 6. 显示当前状态
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}当前Pod状态${NC}"
echo -e "${BLUE}========================================${NC}"
kubectl get pods -n "${NAMESPACE}" -o wide

echo -e "\n${GREEN}修复完成！${NC}"
echo -e "\n${YELLOW}下一步:${NC}"
echo -e "  1. 运行诊断脚本: ./quick-diagnose.sh"
echo -e "  2. 运行验证脚本: ./dev-environment-verify.sh"
echo -e "  3. 如果问题仍然存在，查看Pod日志: kubectl logs -n ${NAMESPACE} <pod-name>"
