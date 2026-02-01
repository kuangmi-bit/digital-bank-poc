#!/bin/bash
# 检查Consul详细状态
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
echo -e "${BLUE}Consul详细状态检查${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. 检查Pod状态
echo -e "\n${YELLOW}[1] Pod状态:${NC}"
kubectl get pods -n "${NAMESPACE}" -l app=consul -o wide

# 2. 获取Consul Pod名称
CONSUL_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=consul -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "${CONSUL_POD}" ]; then
    echo -e "${RED}✗ 未找到Consul Pod${NC}"
    exit 1
fi

echo -e "\n${GREEN}Consul Pod: ${CONSUL_POD}${NC}"

# 3. 检查Pod详细状态
echo -e "\n${YELLOW}[2] Pod详细状态:${NC}"
kubectl get pod "${CONSUL_POD}" -n "${NAMESPACE}" -o jsonpath='{.status}' | jq '.' 2>/dev/null || kubectl describe pod "${CONSUL_POD}" -n "${NAMESPACE}" | tail -30

# 4. 检查Consul日志（最近50行）
echo -e "\n${YELLOW}[3] Consul日志（最近50行）:${NC}"
kubectl logs "${CONSUL_POD}" -n "${NAMESPACE}" --tail=50 2>&1 || echo -e "${YELLOW}无法获取日志${NC}"

# 5. 检查Consul是否在容器内运行
echo -e "\n${YELLOW}[4] 检查Consul进程:${NC}"
if kubectl exec -n "${NAMESPACE}" "${CONSUL_POD}" -- ps aux 2>/dev/null | grep -q consul; then
    echo -e "${GREEN}✓ Consul进程正在运行${NC}"
    kubectl exec -n "${NAMESPACE}" "${CONSUL_POD}" -- ps aux | grep consul | head -5
else
    echo -e "${RED}✗ Consul进程未运行${NC}"
fi

# 6. 检查Consul成员（直接exec）
echo -e "\n${YELLOW}[5] Consul集群成员:${NC}"
if kubectl exec -n "${NAMESPACE}" "${CONSUL_POD}" -- consul members 2>/dev/null; then
    echo -e "${GREEN}✓ Consul成员查询成功${NC}"
else
    echo -e "${YELLOW}⚠ Consul成员查询失败（可能还在启动）${NC}"
    echo -e "错误信息:"
    kubectl exec -n "${NAMESPACE}" "${CONSUL_POD}" -- consul members 2>&1 || true
fi

# 7. 检查Consul HTTP API（从Pod内部）
echo -e "\n${YELLOW}[6] Consul HTTP API（从Pod内部测试）:${NC}"
if kubectl exec -n "${NAMESPACE}" "${CONSUL_POD}" -- wget -q -O- --timeout=5 http://localhost:8500/v1/status/leader 2>/dev/null; then
    echo -e "${GREEN}✓ Consul HTTP API可访问（localhost）${NC}"
    LEADER=$(kubectl exec -n "${NAMESPACE}" "${CONSUL_POD}" -- wget -q -O- --timeout=5 http://localhost:8500/v1/status/leader 2>/dev/null || echo "")
    echo -e "  Leader: ${LEADER}"
else
    echo -e "${YELLOW}⚠ Consul HTTP API不可访问（localhost）${NC}"
fi

# 8. 检查Consul服务
echo -e "\n${YELLOW}[7] Consul Service:${NC}"
kubectl get svc -n "${NAMESPACE}" consul-server -o wide

# 9. 检查从Service访问
echo -e "\n${YELLOW}[8] 从Service访问测试:${NC}"
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
else
    echo -e "${RED}✗ Service IP未找到${NC}"
fi

# 10. 检查Consul配置
echo -e "\n${YELLOW}[9] Consul配置检查:${NC}"
if kubectl exec -n "${NAMESPACE}" "${CONSUL_POD}" -- consul validate -config-dir=/consul/config 2>/dev/null; then
    echo -e "${GREEN}✓ Consul配置有效${NC}"
else
    echo -e "${YELLOW}⚠ Consul配置验证失败或命令不可用${NC}"
    echo -e "配置文件内容:"
    kubectl exec -n "${NAMESPACE}" "${CONSUL_POD}" -- cat /consul/config/consul-config.json 2>/dev/null || echo -e "${YELLOW}无法读取配置文件${NC}"
fi

# 11. 检查端口监听
echo -e "\n${YELLOW}[10] 端口监听状态:${NC}"
kubectl exec -n "${NAMESPACE}" "${CONSUL_POD}" -- netstat -tlnp 2>/dev/null | grep -E "8500|8600|8300|8301|8302" || \
kubectl exec -n "${NAMESPACE}" "${CONSUL_POD}" -- ss -tlnp 2>/dev/null | grep -E "8500|8600|8300|8301|8302" || \
echo -e "${YELLOW}无法检查端口状态（netstat/ss不可用）${NC}"

# 12. 检查健康检查端点
echo -e "\n${YELLOW}[11] 健康检查端点:${NC}"
ENDPOINTS=("/v1/status/leader" "/v1/status/peers" "/v1/agent/self" "/v1/catalog/services")
for endpoint in "${ENDPOINTS[@]}"; do
    if kubectl exec -n "${NAMESPACE}" "${CONSUL_POD}" -- wget -q -O- --timeout=3 http://localhost:8500${endpoint} 2>/dev/null | head -c 100; then
        echo -e "${GREEN}✓ ${endpoint} 可访问${NC}"
    else
        echo -e "${YELLOW}⚠ ${endpoint} 不可访问${NC}"
    fi
done

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}检查完成${NC}"
echo -e "${BLUE}========================================${NC}"
