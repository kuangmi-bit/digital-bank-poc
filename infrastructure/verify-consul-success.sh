#!/bin/bash
# 验证Consul成功启动
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
echo -e "${BLUE}验证Consul成功启动${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. 检查Pod状态
echo -e "\n${YELLOW}[1] Pod状态:${NC}"
kubectl get pods -n "${NAMESPACE}" -l app=consul -o wide

# 2. 获取Pod名称
CONSUL_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=consul -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "${CONSUL_POD}" ]; then
    echo -e "${RED}✗ 未找到Consul Pod${NC}"
    exit 1
fi

echo -e "\n${GREEN}Consul Pod: ${CONSUL_POD}${NC}"

# 3. 检查Pod就绪状态
READY=$(kubectl get pod "${CONSUL_POD}" -n "${NAMESPACE}" -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null || echo "Unknown")
if [ "${READY}" = "True" ]; then
    echo -e "${GREEN}✓ Pod已就绪${NC}"
else
    echo -e "${YELLOW}⚠ Pod状态: ${READY}${NC}"
fi

# 4. 测试Consul成员
echo -e "\n${YELLOW}[2] Consul集群成员:${NC}"
if kubectl exec -n "${NAMESPACE}" "${CONSUL_POD}" -- consul members 2>/dev/null; then
    echo -e "${GREEN}✓ Consul成员查询成功${NC}"
else
    echo -e "${RED}✗ Consul成员查询失败${NC}"
fi

# 5. 测试HTTP API - Leader
echo -e "\n${YELLOW}[3] 测试Consul HTTP API:${NC}"
if kubectl exec -n "${NAMESPACE}" "${CONSUL_POD}" -- wget -q -O- --timeout=5 http://localhost:8500/v1/status/leader 2>/dev/null; then
    LEADER=$(kubectl exec -n "${NAMESPACE}" "${CONSUL_POD}" -- wget -q -O- --timeout=5 http://localhost:8500/v1/status/leader 2>/dev/null || echo "")
    echo -e "${GREEN}✓ Leader端点可访问${NC}"
    echo -e "  Leader: ${LEADER}"
else
    echo -e "${RED}✗ Leader端点不可访问${NC}"
fi

# 6. 测试HTTP API - Agent Self
if kubectl exec -n "${NAMESPACE}" "${CONSUL_POD}" -- wget -q -O- --timeout=5 http://localhost:8500/v1/agent/self 2>/dev/null | head -c 100; then
    echo -e "${GREEN}✓ Agent Self端点可访问${NC}"
else
    echo -e "${RED}✗ Agent Self端点不可访问${NC}"
fi

# 7. 测试HTTP API - Catalog Services
if kubectl exec -n "${NAMESPACE}" "${CONSUL_POD}" -- wget -q -O- --timeout=5 http://localhost:8500/v1/catalog/services 2>/dev/null; then
    echo -e "${GREEN}✓ Catalog Services端点可访问${NC}"
else
    echo -e "${YELLOW}⚠ Catalog Services端点不可访问${NC}"
fi

# 8. 测试通过Service访问
echo -e "\n${YELLOW}[4] 测试通过Service访问:${NC}"
SVC_IP=$(kubectl get svc -n "${NAMESPACE}" consul-server -o jsonpath='{.spec.clusterIP}' 2>/dev/null || echo "")
if [ -n "${SVC_IP}" ] && [ "${SVC_IP}" != "None" ]; then
    echo -e "Service IP: ${SVC_IP}"
    if kubectl exec -n "${NAMESPACE}" "${CONSUL_POD}" -- wget -q -O- --timeout=5 http://${SVC_IP}:8500/v1/status/leader 2>/dev/null; then
        echo -e "${GREEN}✓ 通过Service IP可访问${NC}"
    else
        echo -e "${YELLOW}⚠ 通过Service IP不可访问${NC}"
    fi
    
    # 测试通过DNS
    if kubectl exec -n "${NAMESPACE}" "${CONSUL_POD}" -- wget -q -O- --timeout=5 http://consul-server.${NAMESPACE}.svc.cluster.local:8500/v1/status/leader 2>/dev/null; then
        echo -e "${GREEN}✓ 通过DNS可访问${NC}"
    else
        echo -e "${YELLOW}⚠ 通过DNS不可访问${NC}"
    fi
fi

# 9. 运行完整验证脚本
echo -e "\n${YELLOW}[5] 运行完整验证:${NC}"
echo -e "执行: ./dev-environment-verify.sh"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}验证完成${NC}"
echo -e "${BLUE}========================================${NC}"
