#!/bin/bash
# 应用Consul只读文件系统修复
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
echo -e "${BLUE}应用Consul只读文件系统修复${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. 应用修复后的配置
echo -e "\n${YELLOW}[1/4] 应用修复后的Consul配置...${NC}"
kubectl apply -f "${PROJECT_ROOT}/k8s/base/consul/deployment.yaml"
echo -e "${GREEN}✓ Consul Deployment已更新${NC}"

# 2. 删除现有Pod以应用新配置
echo -e "\n${YELLOW}[2/4] 删除现有Consul Pod...${NC}"
kubectl delete pod -n "${NAMESPACE}" -l app=consul --ignore-not-found=true
echo -e "${GREEN}✓ 旧Pod已删除，新Pod将自动创建${NC}"

# 3. 等待Pod创建
echo -e "\n${YELLOW}[3/4] 等待新Pod创建...${NC}"
sleep 10

# 检查Pod状态
NEW_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=consul -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "${NEW_POD}" ]; then
    echo -e "新Pod: ${NEW_POD}"
    echo -e "\n查看Pod状态:"
    kubectl get pod "${NEW_POD}" -n "${NAMESPACE}" -o wide
else
    echo -e "${YELLOW}⚠ 新Pod尚未创建${NC}"
fi

# 4. 等待Pod就绪
echo -e "\n${YELLOW}[4/4] 等待Consul Pod就绪（最多5分钟）...${NC}"
if kubectl wait --for=condition=ready pod -n "${NAMESPACE}" -l app=consul --timeout=300s 2>/dev/null; then
    echo -e "${GREEN}✓ Consul Pod已就绪${NC}"
    
    # 查看日志确认启动成功
    echo -e "\n${BLUE}查看Consul日志（确认无chown错误）:${NC}"
    kubectl logs "${NEW_POD}" -n "${NAMESPACE}" --tail=30 2>&1 | head -20
    
    # 测试Consul API
    echo -e "\n${BLUE}测试Consul HTTP API:${NC}"
    if kubectl exec -n "${NAMESPACE}" "${NEW_POD}" -- wget -q -O- --timeout=5 http://localhost:8500/v1/status/leader 2>/dev/null; then
        echo -e "${GREEN}✓ Consul HTTP API可访问${NC}"
        LEADER=$(kubectl exec -n "${NAMESPACE}" "${NEW_POD}" -- wget -q -O- --timeout=5 http://localhost:8500/v1/status/leader 2>/dev/null || echo "")
        echo -e "  Leader: ${LEADER}"
    else
        echo -e "${YELLOW}⚠ Consul HTTP API暂不可访问（可能还在启动）${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Consul Pod未就绪，查看详情:${NC}"
    if [ -n "${NEW_POD}" ]; then
        echo -e "\nPod事件:"
        kubectl describe pod "${NEW_POD}" -n "${NAMESPACE}" | tail -20
        
        echo -e "\nPod日志:"
        kubectl logs "${NEW_POD}" -n "${NAMESPACE}" --tail=50 2>&1 || true
        
        echo -e "\nInitContainer日志:"
        kubectl logs "${NEW_POD}" -n "${NAMESPACE}" -c copy-consul-config --tail=20 2>&1 || true
    fi
fi

# 5. 显示最终状态
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}最终状态${NC}"
echo -e "${BLUE}========================================${NC}"
kubectl get pods -n "${NAMESPACE}" -l app=consul -o wide

echo -e "\n${GREEN}修复完成！${NC}"
echo -e "\n${YELLOW}下一步:${NC}"
echo -e "  1. 运行验证脚本: ./dev-environment-verify.sh"
echo -e "  2. 运行诊断脚本: ./check-consul-status.sh"
echo -e "  3. 查看详细日志: kubectl logs -n ${NAMESPACE} -l app=consul --tail=100"
