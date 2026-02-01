#!/bin/bash
# 数字银行POC系统 - Dev环境部署脚本
# 用于自动化部署和验证基础设施组件
# 符合技术标准规范 v1.0 和命名规范 v1.0

set -euo pipefail

# 颜色输出
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# 获取脚本所在目录（符合部署规范：支持从任意目录执行）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# 配置变量（符合命名规范：UPPER_SNAKE_CASE）
# 环境变量: ENVIRONMENT (dev, qa, uat, prod) - 符合部署规范
ENVIRONMENT="${ENVIRONMENT:-dev}"
# 命名空间: 符合部署规范 - 按环境划分（技术标准规范 v1.0）
# 默认使用 digital-bank-poc (Day 1开发环境)，支持通过环境变量覆盖
NAMESPACE="${NAMESPACE:-digital-bank-poc}"
KUBECONFIG_PATH="${KUBECONFIG:-~/.kube/config}"

# 验证必需的环境变量
if [ ! -f "${KUBECONFIG_PATH/#\~/$HOME}" ]; then
    echo -e "${YELLOW}警告: KUBECONFIG文件不存在: ${KUBECONFIG_PATH}${NC}"
    echo -e "${YELLOW}提示: 请设置KUBECONFIG环境变量或确保默认配置文件存在${NC}"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}数字银行POC系统 - Dev环境部署${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查Kubernetes连接
echo -e "\n${YELLOW}[1/6] 检查Kubernetes连接...${NC}"
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}错误: 无法连接到Kubernetes集群${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Kubernetes连接正常${NC}"

# 创建命名空间
echo -e "\n${YELLOW}[2/6] 创建命名空间...${NC}"
echo -e "  环境: ${ENVIRONMENT}"
echo -e "  命名空间: ${NAMESPACE}"
# 创建命名空间（如果不存在）
kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -
echo -e "${GREEN}✓ 命名空间 ${NAMESPACE} 已创建${NC}"

# 部署Consul
echo -e "\n${YELLOW}[3/6] 部署Consul服务注册中心...${NC}"
# 使用--namespace参数确保部署到正确的命名空间
kubectl apply -f "${PROJECT_ROOT}/infrastructure/k8s/base/consul/" --namespace="${NAMESPACE}"
echo -e "${GREEN}✓ Consul部署完成${NC}"

# 等待Consul就绪
echo -e "\n等待Consul服务就绪..."
kubectl wait --for=condition=available --timeout=300s deployment/consul-server -n "${NAMESPACE}" || {
    echo -e "${YELLOW}⚠ Consul部署超时，请检查Pod状态${NC}"
}

# 部署Kong API Gateway
echo -e "\n${YELLOW}[4/6] 部署Kong API Gateway...${NC}"
kubectl apply -f "${PROJECT_ROOT}/infrastructure/k8s/base/kong/" --namespace="${NAMESPACE}"
echo -e "${GREEN}✓ Kong部署完成${NC}"

# 等待Kong就绪
echo -e "\n等待Kong服务就绪..."
kubectl wait --for=condition=available --timeout=300s deployment/kong -n "${NAMESPACE}" || {
    echo -e "${YELLOW}⚠ Kong部署超时，请检查Pod状态${NC}"
}

# 部署Nginx
echo -e "\n${YELLOW}[5/6] 部署Nginx反向代理...${NC}"
kubectl apply -f "${PROJECT_ROOT}/infrastructure/k8s/base/nginx/" --namespace="${NAMESPACE}"
echo -e "${GREEN}✓ Nginx部署完成${NC}"

# 等待Nginx就绪
echo -e "\n等待Nginx服务就绪..."
kubectl wait --for=condition=available --timeout=300s deployment/nginx -n "${NAMESPACE}" || {
    echo -e "${YELLOW}⚠ Nginx部署超时，请检查Pod状态${NC}"
}

# 验证部署
echo -e "\n${YELLOW}[6/6] 验证部署状态...${NC}"

echo -e "\n检查Pod状态:"
kubectl get pods -n "${NAMESPACE}"

echo -e "\n检查Service状态:"
kubectl get svc -n "${NAMESPACE}"

echo -e "\n检查Consul服务:"
CONSUL_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=consul -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "${CONSUL_POD}" ]; then
    echo -e "${GREEN}✓ Consul Pod: ${CONSUL_POD}${NC}"
    kubectl exec -n "${NAMESPACE}" "${CONSUL_POD}" -- consul members 2>/dev/null || echo "Consul服务正在启动..."
else
    echo -e "${YELLOW}⚠ Consul Pod未就绪${NC}"
fi

echo -e "\n检查Kong服务:"
KONG_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=kong -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "${KONG_POD}" ]; then
    echo -e "${GREEN}✓ Kong Pod: ${KONG_POD}${NC}"
    kubectl exec -n "${NAMESPACE}" "${KONG_POD}" -- kong version 2>/dev/null || echo "Kong服务正在启动..."
else
    echo -e "${YELLOW}⚠ Kong Pod未就绪${NC}"
fi

echo -e "\n检查Nginx服务:"
NGINX_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=nginx -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "${NGINX_POD}" ]; then
    echo -e "${GREEN}✓ Nginx Pod: ${NGINX_POD}${NC}"
    kubectl exec -n "${NAMESPACE}" "${NGINX_POD}" -- nginx -t 2>/dev/null || echo "Nginx配置检查中..."
else
    echo -e "${YELLOW}⚠ Nginx Pod未就绪${NC}"
fi

# 获取服务访问地址
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}服务访问地址:${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\nConsul UI:"
CONSUL_SVC_IP=$(kubectl get svc consul-server -n "${NAMESPACE}" -o jsonpath='{.spec.clusterIP}' 2>/dev/null || echo "N/A")
echo -e "  集群内: http://${CONSUL_SVC_IP}:8500"
echo -e "  端口转发: kubectl port-forward -n ${NAMESPACE} svc/consul-server 8500:8500"

echo -e "\nKong API Gateway:"
KONG_SVC_IP=$(kubectl get svc kong -n "${NAMESPACE}" -o jsonpath='{.spec.clusterIP}' 2>/dev/null || echo "N/A")
echo -e "  代理地址: http://${KONG_SVC_IP}:8000"
echo -e "  管理地址: http://${KONG_SVC_IP}:8001"
echo -e "  端口转发: kubectl port-forward -n ${NAMESPACE} svc/kong 8000:8000 8001:8001"

echo -e "\nNginx反向代理:"
NGINX_SVC_IP=$(kubectl get svc nginx -n "${NAMESPACE}" -o jsonpath='{.spec.clusterIP}' 2>/dev/null || echo "N/A")
echo -e "  服务地址: http://${NGINX_SVC_IP}:80"
echo -e "  端口转发: kubectl port-forward -n ${NAMESPACE} svc/nginx 8080:80"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${YELLOW}提示:${NC}"
echo -e "  1. 使用 'kubectl get pods -n ${NAMESPACE}' 查看Pod状态"
echo -e "  2. 使用 'kubectl logs -n ${NAMESPACE} <pod-name>' 查看日志"
echo -e "  3. 使用 'kubectl describe pod -n ${NAMESPACE} <pod-name>' 查看Pod详情"
echo -e "  4. 环境变量: ENVIRONMENT=${ENVIRONMENT} (可设置为: dev, qa, uat, prod)"
echo -e "  5. 命名空间: ${NAMESPACE}"
