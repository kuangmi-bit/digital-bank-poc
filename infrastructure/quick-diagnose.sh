#!/bin/bash
# 快速诊断脚本 - 检查Pod状态和日志
# 用于快速定位部署问题

set -euo pipefail

# 颜色输出
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

NAMESPACE="digital-bank-poc"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}快速诊断 - Pod状态和日志${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. Pod状态
echo -e "\n${YELLOW}[1] Pod状态:${NC}"
kubectl get pods -n "${NAMESPACE}" -o wide

# 2. Pod详情
echo -e "\n${YELLOW}[2] Pod详情和事件:${NC}"
for app in consul kong nginx; do
    POD_NAME=$(kubectl get pod -n "${NAMESPACE}" -l app="${app}" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    if [ -n "${POD_NAME}" ]; then
        echo -e "\n${BLUE}--- ${app} (${POD_NAME}) ---${NC}"
        kubectl describe pod "${POD_NAME}" -n "${NAMESPACE}" | tail -20
    else
        echo -e "${RED}✗ ${app} Pod不存在${NC}"
    fi
done

# 3. Pod日志（最近50行）
echo -e "\n${YELLOW}[3] Pod日志（最近50行）:${NC}"
for app in consul kong nginx; do
    POD_NAME=$(kubectl get pod -n "${NAMESPACE}" -l app="${app}" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    if [ -n "${POD_NAME}" ]; then
        echo -e "\n${BLUE}--- ${app} (${POD_NAME}) 日志 ---${NC}"
        kubectl logs "${POD_NAME}" -n "${NAMESPACE}" --tail=50 2>&1 || echo -e "${RED}无法获取日志${NC}"
    fi
done

# 4. Service状态
echo -e "\n${YELLOW}[4] Service状态:${NC}"
kubectl get svc -n "${NAMESPACE}"

# 5. 最近事件
echo -e "\n${YELLOW}[5] 最近事件:${NC}"
kubectl get events -n "${NAMESPACE}" --sort-by='.lastTimestamp' | tail -20

# 6. 诊断建议
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}诊断建议${NC}"
echo -e "${BLUE}========================================${NC}"

# 检查Consul
CONSUL_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=consul -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -z "${CONSUL_POD}" ]; then
    echo -e "${RED}✗ Consul Pod不存在 - 检查Deployment${NC}"
    kubectl get deployment -n "${NAMESPACE}" consul-server
elif ! kubectl get pod "${CONSUL_POD}" -n "${NAMESPACE}" -o jsonpath='{.status.phase}' 2>/dev/null | grep -q "Running"; then
    echo -e "${YELLOW}⚠ Consul Pod未运行 - 查看日志:${NC}"
    echo -e "  kubectl logs ${CONSUL_POD} -n ${NAMESPACE}"
fi

# 检查Kong
KONG_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=kong -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -z "${KONG_POD}" ]; then
    echo -e "${RED}✗ Kong Pod不存在 - 检查Deployment${NC}"
    kubectl get deployment -n "${NAMESPACE}" kong
elif ! kubectl get pod "${KONG_POD}" -n "${NAMESPACE}" -o jsonpath='{.status.phase}' 2>/dev/null | grep -q "Running"; then
    echo -e "${YELLOW}⚠ Kong Pod未运行 - 查看日志:${NC}"
    echo -e "  kubectl logs ${KONG_POD} -n ${NAMESPACE}"
fi

# 检查Nginx
NGINX_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=nginx -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -z "${NGINX_POD}" ]; then
    echo -e "${RED}✗ Nginx Pod不存在 - 检查Deployment${NC}"
    kubectl get deployment -n "${NAMESPACE}" nginx
elif ! kubectl get pod "${NGINX_POD}" -n "${NAMESPACE}" -o jsonpath='{.status.phase}' 2>/dev/null | grep -q "Running"; then
    echo -e "${YELLOW}⚠ Nginx Pod未运行 - 查看日志:${NC}"
    echo -e "  kubectl logs ${NGINX_POD} -n ${NAMESPACE}"
else
    # 检查容器名称
    CONTAINER_NAME=$(kubectl get pod "${NGINX_POD}" -n "${NAMESPACE}" -o jsonpath='{.spec.containers[0].name}' 2>/dev/null || echo "nginx")
    echo -e "${GREEN}✓ Nginx容器名称: ${CONTAINER_NAME}${NC}"
    echo -e "${YELLOW}测试Nginx配置:${NC}"
    kubectl exec "${NGINX_POD}" -n "${NAMESPACE}" -c "${CONTAINER_NAME}" -- nginx -t 2>&1 || true
fi

echo -e "\n${YELLOW}更多帮助:${NC}"
echo -e "  查看详细故障排查: cat TROUBLESHOOTING-DEPLOYMENT.md"
echo -e "  重新运行验证: ./dev-environment-verify.sh"
