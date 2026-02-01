#!/bin/bash
# 数字银行POC系统 - Dev环境验证脚本
# 用于验证基础设施组件的健康状态和连通性
# 符合技术标准规范 v1.0 和命名规范 v1.0

set -euo pipefail

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
NAMESPACE="digital-bank-poc"
MAX_RETRIES=30
RETRY_INTERVAL=5

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}数字银行POC系统 - Dev环境验证${NC}"
echo -e "${BLUE}========================================${NC}"

# 检查函数
check_pod_ready() {
    local app=$1
    local pod_name=$(kubectl get pod -n ${NAMESPACE} -l app=${app} -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    
    if [ -z "$pod_name" ]; then
        return 1
    fi
    
    local status=$(kubectl get pod ${pod_name} -n ${NAMESPACE} -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
    [ "$status" = "Running" ]
}

check_service_health() {
    local service=$1
    local port=$2
    local path=${3:-/}
    
    local svc_ip=$(kubectl get svc ${service} -n ${NAMESPACE} -o jsonpath='{.spec.clusterIP}' 2>/dev/null || echo "")
    
    if [ -z "$svc_ip" ] || [ "$svc_ip" = "None" ]; then
        return 1
    fi
    
    # 尝试通过端口转发测试
    kubectl run test-curl-${service} --rm -i --restart=Never --image=curlimages/curl:latest -- \
        curl -s -o /dev/null -w "%{http_code}" http://${service}.${NAMESPACE}.svc.cluster.local:${port}${path} 2>/dev/null | grep -q "200\|301\|302" || return 1
}

wait_for_service() {
    local service=$1
    local check_func=$2
    local retries=0
    
    echo -e "\n${YELLOW}等待 ${service} 就绪...${NC}"
    while [ $retries -lt $MAX_RETRIES ]; do
        if $check_func; then
            echo -e "${GREEN}✓ ${service} 已就绪${NC}"
            return 0
        fi
        retries=$((retries + 1))
        echo -e "  尝试 ${retries}/${MAX_RETRIES}..."
        sleep $RETRY_INTERVAL
    done
    
    echo -e "${RED}✗ ${service} 未能在 ${MAX_RETRIES} 次尝试后就绪${NC}"
    return 1
}

# 验证1: 命名空间
echo -e "\n${YELLOW}[验证1] 检查命名空间...${NC}"
if kubectl get namespace ${NAMESPACE} &> /dev/null; then
    echo -e "${GREEN}✓ 命名空间 ${NAMESPACE} 存在${NC}"
else
    echo -e "${RED}✗ 命名空间 ${NAMESPACE} 不存在${NC}"
    exit 1
fi

# 验证2: Consul
echo -e "\n${YELLOW}[验证2] 验证Consul服务注册中心...${NC}"
if check_pod_ready "consul"; then
    echo -e "${GREEN}✓ Consul Pod运行正常${NC}"
    
    CONSUL_POD=$(kubectl get pod -n ${NAMESPACE} -l app=consul -o jsonpath='{.items[0].metadata.name}')
    
    # 检查Consul成员
    if kubectl exec -n ${NAMESPACE} ${CONSUL_POD} -- consul members &> /dev/null; then
        echo -e "${GREEN}✓ Consul集群成员正常${NC}"
        kubectl exec -n ${NAMESPACE} ${CONSUL_POD} -- consul members
    else
        echo -e "${YELLOW}⚠ Consul成员检查失败（可能正在启动）${NC}"
    fi
    
    # 检查Consul UI
    if check_service_health "consul-server" "8500" "/v1/status/leader"; then
        echo -e "${GREEN}✓ Consul HTTP API可访问${NC}"
    else
        echo -e "${YELLOW}⚠ Consul HTTP API暂不可访问${NC}"
    fi
else
    echo -e "${RED}✗ Consul Pod未就绪${NC}"
fi

# 验证3: Kong API Gateway
echo -e "\n${YELLOW}[验证3] 验证Kong API Gateway...${NC}"
if check_pod_ready "kong"; then
    echo -e "${GREEN}✓ Kong Pod运行正常${NC}"
    
    KONG_POD=$(kubectl get pod -n ${NAMESPACE} -l app=kong -o jsonpath='{.items[0].metadata.name}')
    
    # 检查Kong状态
    if kubectl exec -n ${NAMESPACE} ${KONG_POD} -- kong version &> /dev/null; then
        KONG_VERSION=$(kubectl exec -n ${NAMESPACE} ${KONG_POD} -- kong version 2>/dev/null | head -1)
        echo -e "${GREEN}✓ Kong版本: ${KONG_VERSION}${NC}"
    fi
    
    # 检查Kong Admin API
    if check_service_health "kong" "8001" "/status"; then
        echo -e "${GREEN}✓ Kong Admin API可访问${NC}"
    else
        echo -e "${YELLOW}⚠ Kong Admin API暂不可访问${NC}"
    fi
    
    # 检查Kong配置
    if kubectl exec -n ${NAMESPACE} ${KONG_POD} -- kong config -c /kong/kong.yml &> /dev/null; then
        echo -e "${GREEN}✓ Kong配置文件有效${NC}"
    else
        echo -e "${YELLOW}⚠ Kong配置检查失败${NC}"
    fi
else
    echo -e "${RED}✗ Kong Pod未就绪${NC}"
fi

# 验证4: Nginx
echo -e "\n${YELLOW}[验证4] 验证Nginx反向代理...${NC}"
if check_pod_ready "nginx"; then
    echo -e "${GREEN}✓ Nginx Pod运行正常${NC}"
    
    NGINX_POD=$(kubectl get pod -n ${NAMESPACE} -l app=nginx -o jsonpath='{.items[0].metadata.name}')
    
    # 检查Nginx配置（使用容器名称，如果Pod有多个容器）
    CONTAINER_NAME=$(kubectl get pod ${NGINX_POD} -n ${NAMESPACE} -o jsonpath='{.spec.containers[0].name}' 2>/dev/null || echo "nginx")
    if kubectl exec -n ${NAMESPACE} ${NGINX_POD} -c ${CONTAINER_NAME} -- nginx -t &> /dev/null; then
        echo -e "${GREEN}✓ Nginx配置有效${NC}"
    else
        echo -e "${RED}✗ Nginx配置无效${NC}"
        echo -e "${YELLOW}尝试检查配置...${NC}"
        kubectl exec -n ${NAMESPACE} ${NGINX_POD} -c ${CONTAINER_NAME} -- nginx -t 2>&1 || true
    fi
    
    # 检查Nginx健康端点
    if check_service_health "nginx" "80" "/health"; then
        echo -e "${GREEN}✓ Nginx健康检查通过${NC}"
    else
        echo -e "${YELLOW}⚠ Nginx健康检查失败${NC}"
    fi
else
    echo -e "${RED}✗ Nginx Pod未就绪${NC}"
fi

# 验证5: 服务发现
echo -e "\n${YELLOW}[验证5] 验证服务发现配置...${NC}"
SERVICES=("consul-server" "kong" "nginx")
ALL_SERVICES_OK=true

for svc in "${SERVICES[@]}"; do
    if kubectl get svc ${svc} -n ${NAMESPACE} &> /dev/null; then
        SVC_IP=$(kubectl get svc ${svc} -n ${NAMESPACE} -o jsonpath='{.spec.clusterIP}')
        echo -e "${GREEN}✓ 服务 ${svc}: ${SVC_IP}${NC}"
    else
        echo -e "${RED}✗ 服务 ${svc} 不存在${NC}"
        ALL_SERVICES_OK=false
    fi
done

# 验证6: 网络连通性
echo -e "\n${YELLOW}[验证6] 验证服务间网络连通性...${NC}"

# 测试从Nginx到Kong的连通性
NGINX_POD=$(kubectl get pod -n ${NAMESPACE} -l app=nginx -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$NGINX_POD" ]; then
    if kubectl exec -n ${NAMESPACE} ${NGINX_POD} -- wget -q -O- --timeout=5 http://kong.${NAMESPACE}.svc.cluster.local:8001/status &> /dev/null; then
        echo -e "${GREEN}✓ Nginx -> Kong 连通正常${NC}"
    else
        echo -e "${YELLOW}⚠ Nginx -> Kong 连通失败${NC}"
    fi
fi

# 测试从Nginx到Consul的连通性
if [ -n "$NGINX_POD" ]; then
    if kubectl exec -n ${NAMESPACE} ${NGINX_POD} -- wget -q -O- --timeout=5 http://consul-server.${NAMESPACE}.svc.cluster.local:8500/v1/status/leader &> /dev/null; then
        echo -e "${GREEN}✓ Nginx -> Consul 连通正常${NC}"
    else
        echo -e "${YELLOW}⚠ Nginx -> Consul 连通失败${NC}"
    fi
fi

# 总结
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}验证总结${NC}"
echo -e "${BLUE}========================================${NC}"

echo -e "\nPod状态:"
kubectl get pods -n ${NAMESPACE} -o wide

echo -e "\nService状态:"
kubectl get svc -n ${NAMESPACE}

echo -e "\n${GREEN}验证完成！${NC}"
echo -e "\n${YELLOW}提示:${NC}"
echo -e "  如果某些服务未就绪，请等待几分钟后重新运行验证脚本"
echo -e "  使用 'kubectl logs -n ${NAMESPACE} <pod-name>' 查看详细日志"
