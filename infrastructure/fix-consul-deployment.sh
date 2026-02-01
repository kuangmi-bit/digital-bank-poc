#!/bin/bash
# 修复Consul Deployment - 删除旧Deployment并确保只使用新配置
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
echo -e "${BLUE}修复Consul Deployment${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. 查看所有Consul Deployment
echo -e "\n${YELLOW}[1/6] 查看所有Consul Deployment...${NC}"
kubectl get deployment -n "${NAMESPACE}" -l app=consul -o wide

# 2. 查找并删除使用旧镜像的Deployment
echo -e "\n${YELLOW}[2/6] 查找使用旧镜像的Deployment...${NC}"
OLD_DEPLOYMENTS=$(kubectl get deployment -n "${NAMESPACE}" -l app=consul -o json | \
    jq -r '.items[] | select(.spec.template.spec.containers[0].image == "consul:1.17.0") | .metadata.name' 2>/dev/null || echo "")

if [ -n "${OLD_DEPLOYMENTS}" ]; then
    echo -e "找到旧Deployment: ${OLD_DEPLOYMENTS}"
    for dep in ${OLD_DEPLOYMENTS}; do
        echo -e "删除旧Deployment: ${dep}"
        kubectl delete deployment -n "${NAMESPACE}" "${dep}" --ignore-not-found=true
        echo -e "${GREEN}✓ 已删除: ${dep}${NC}"
    done
else
    echo -e "${GREEN}✓ 未找到使用旧镜像的Deployment${NC}"
fi

# 3. 删除所有使用旧镜像的Pod
echo -e "\n${YELLOW}[3/6] 删除使用旧镜像的Pod...${NC}"
OLD_PODS=$(kubectl get pod -n "${NAMESPACE}" -l app=consul -o json | \
    jq -r '.items[] | select(.spec.containers[0].image == "consul:1.17.0") | .metadata.name' 2>/dev/null || echo "")

if [ -n "${OLD_PODS}" ]; then
    for pod in ${OLD_PODS}; do
        echo -e "删除旧Pod: ${pod}"
        kubectl delete pod -n "${NAMESPACE}" "${pod}" --ignore-not-found=true
        echo -e "${GREEN}✓ 已删除: ${pod}${NC}"
    done
else
    echo -e "${GREEN}✓ 未找到使用旧镜像的Pod${NC}"
fi

# 4. 查看Consul新Pod的日志（找出崩溃原因）
echo -e "\n${YELLOW}[4/6] 查看Consul新Pod日志...${NC}"
CONSUL_NEW_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=consul -o json | \
    jq -r '.items[] | select(.spec.containers[0].image == "hashicorp/consul:1.22.2") | .metadata.name' 2>/dev/null | head -1 || echo "")

if [ -n "${CONSUL_NEW_POD}" ]; then
    echo -e "Consul Pod: ${CONSUL_NEW_POD}"
    echo -e "\n${BLUE}最近100行日志:${NC}"
    kubectl logs "${CONSUL_NEW_POD}" -n "${NAMESPACE}" --tail=100 2>&1 || echo -e "${YELLOW}无法获取当前日志${NC}"
    
    echo -e "\n${BLUE}崩溃前的日志:${NC}"
    kubectl logs "${CONSUL_NEW_POD}" -n "${NAMESPACE}" --previous --tail=100 2>&1 || echo -e "${YELLOW}无法获取之前的日志${NC}"
else
    echo -e "${YELLOW}⚠ 未找到使用新镜像的Consul Pod${NC}"
fi

# 5. 应用正确的Consul配置
echo -e "\n${YELLOW}[5/6] 应用正确的Consul配置...${NC}"
kubectl apply -f "${PROJECT_ROOT}/k8s/base/consul/configmap.yaml"
kubectl apply -f "${PROJECT_ROOT}/k8s/base/consul/deployment.yaml"
echo -e "${GREEN}✓ Consul配置已更新${NC}"

# 6. 等待Pod就绪
echo -e "\n${YELLOW}[6/6] 等待Consul Pod就绪...${NC}"
sleep 5

# 检查是否有新的Pod创建
NEW_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=consul -o json | \
    jq -r '.items[] | select(.spec.containers[0].image == "hashicorp/consul:1.22.2") | .metadata.name' 2>/dev/null | head -1 || echo "")

if [ -n "${NEW_POD}" ]; then
    echo -e "等待Pod就绪: ${NEW_POD}"
    if kubectl wait --for=condition=ready pod -n "${NAMESPACE}" "${NEW_POD}" --timeout=300s 2>/dev/null; then
        echo -e "${GREEN}✓ Consul Pod已就绪${NC}"
    else
        echo -e "${YELLOW}⚠ Consul Pod未就绪，查看详情:${NC}"
        kubectl describe pod "${NEW_POD}" -n "${NAMESPACE}" | tail -40
        echo -e "\n${BLUE}最新日志:${NC}"
        kubectl logs "${NEW_POD}" -n "${NAMESPACE}" --tail=50 2>&1 || true
    fi
else
    echo -e "${YELLOW}⚠ 未找到新的Consul Pod${NC}"
fi

# 7. 显示最终状态
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}最终状态${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "\nDeployment状态:"
kubectl get deployment -n "${NAMESPACE}" -l app=consul

echo -e "\nPod状态:"
kubectl get pods -n "${NAMESPACE}" -l app=consul -o wide

echo -e "\n${GREEN}修复完成！${NC}"
