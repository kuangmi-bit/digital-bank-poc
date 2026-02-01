#!/bin/bash
# 最终修复脚本 - 清理所有问题并应用修复
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
echo -e "${BLUE}最终修复 - 清理并应用所有修复${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. 删除所有旧的Consul Pod（使用旧镜像的）
echo -e "\n${YELLOW}[1/6] 清理旧的Consul Pod...${NC}"
kubectl delete pod -n "${NAMESPACE}" consul-server-574756d944-jjtcw --ignore-not-found=true
echo -e "${GREEN}✓ 旧Consul Pod已删除${NC}"

# 2. 删除旧的Consul Deployment（如果存在）
echo -e "\n${YELLOW}[2/6] 检查并清理旧的Consul Deployment...${NC}"
OLD_DEPLOYMENT=$(kubectl get deployment -n "${NAMESPACE}" consul-server-574756d944 -o name 2>/dev/null || echo "")
if [ -n "${OLD_DEPLOYMENT}" ]; then
    kubectl delete deployment -n "${NAMESPACE}" consul-server-574756d944 --ignore-not-found=true
    echo -e "${GREEN}✓ 旧Consul Deployment已删除${NC}"
else
    echo -e "${GREEN}✓ 未找到旧Deployment${NC}"
fi

# 3. 查看Consul新Pod的日志（找出崩溃原因）
echo -e "\n${YELLOW}[3/6] 检查Consul新Pod日志...${NC}"
CONSUL_NEW_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=consul -o jsonpath='{.items[?(@.spec.containers[0].image=="hashicorp/consul:1.22.2")].metadata.name}' 2>/dev/null | awk '{print $1}' || echo "")
if [ -n "${CONSUL_NEW_POD}" ]; then
    echo -e "Consul Pod: ${CONSUL_NEW_POD}"
    echo -e "\n最近50行日志:"
    kubectl logs "${CONSUL_NEW_POD}" -n "${NAMESPACE}" --tail=50 2>&1 || echo -e "${YELLOW}无法获取日志（Pod可能已崩溃）${NC}"
    
    echo -e "\n查看崩溃前的日志:"
    kubectl logs "${CONSUL_NEW_POD}" -n "${NAMESPACE}" --previous --tail=50 2>&1 || echo -e "${YELLOW}无法获取之前的日志${NC}"
else
    echo -e "${YELLOW}⚠ 未找到使用新镜像的Consul Pod${NC}"
fi

# 4. 确保使用正确的Consul Deployment
echo -e "\n${YELLOW}[4/6] 应用正确的Consul配置...${NC}"
kubectl apply -f "${PROJECT_ROOT}/k8s/base/consul/deployment.yaml"
echo -e "${GREEN}✓ Consul Deployment已更新${NC}"

# 5. 应用Nginx和Kong修复
echo -e "\n${YELLOW}[5/6] 应用Nginx和Kong修复...${NC}"
kubectl apply -f "${PROJECT_ROOT}/k8s/base/nginx/configmap.yaml"
kubectl apply -f "${PROJECT_ROOT}/k8s/base/kong/deployment.yaml"
echo -e "${GREEN}✓ Nginx和Kong配置已更新${NC}"

# 6. 等待Pod就绪
echo -e "\n${YELLOW}[6/6] 等待Pod就绪...${NC}"

echo -e "\n等待Consul Pod就绪（最多5分钟）..."
if kubectl wait --for=condition=ready pod -n "${NAMESPACE}" -l app=consul --timeout=300s 2>/dev/null; then
    echo -e "${GREEN}✓ Consul Pod已就绪${NC}"
else
    echo -e "${YELLOW}⚠ Consul Pod未就绪${NC}"
    CONSUL_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=consul -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    if [ -n "${CONSUL_POD}" ]; then
        echo -e "\n查看Consul Pod详情:"
        kubectl describe pod "${CONSUL_POD}" -n "${NAMESPACE}" | tail -30
        echo -e "\n查看Consul Pod日志:"
        kubectl logs "${CONSUL_POD}" -n "${NAMESPACE}" --tail=50 2>&1 || true
    fi
fi

echo -e "\n检查Nginx Pod状态..."
NGINX_READY=$(kubectl get pod -n "${NAMESPACE}" -l app=nginx -o jsonpath='{.items[0].status.conditions[?(@.type=="Ready")].status}' 2>/dev/null || echo "Unknown")
if [ "${NGINX_READY}" = "True" ]; then
    echo -e "${GREEN}✓ Nginx Pod运行正常${NC}"
else
    echo -e "${YELLOW}⚠ Nginx Pod状态: ${NGINX_READY}${NC}"
fi

echo -e "\n检查Kong Pod状态..."
KONG_STATUS=$(kubectl get pod -n "${NAMESPACE}" -l app=kong -o jsonpath='{.items[0].status.phase}' 2>/dev/null || echo "Unknown")
KONG_READY=$(kubectl get pod -n "${NAMESPACE}" -l app=kong -o jsonpath='{.items[0].status.conditions[?(@.type=="Ready")].status}' 2>/dev/null || echo "Unknown")
if [ "${KONG_STATUS}" = "Running" ] && [ "${KONG_READY}" = "True" ]; then
    echo -e "${GREEN}✓ Kong Pod运行正常${NC}"
else
    echo -e "${YELLOW}⚠ Kong Pod状态: ${KONG_STATUS}, Ready: ${KONG_READY}${NC}"
fi

# 7. 显示当前状态
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}当前Pod状态${NC}"
echo -e "${BLUE}========================================${NC}"
kubectl get pods -n "${NAMESPACE}" -o wide

echo -e "\n${GREEN}修复完成！${NC}"
echo -e "\n${YELLOW}下一步:${NC}"
echo -e "  1. 运行诊断脚本: ./quick-diagnose.sh"
echo -e "  2. 运行验证脚本: ./dev-environment-verify.sh"
echo -e "  3. 如果Consul仍然崩溃，查看日志: kubectl logs -n ${NAMESPACE} <consul-pod-name> --previous"
