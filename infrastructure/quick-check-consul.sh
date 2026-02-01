#!/bin/bash
# 快速检查Consul Pod状态和日志
# 符合技术标准规范 v1.0 和命名规范 v1.0

set -euo pipefail

NAMESPACE="digital-bank-poc"

echo "========================================"
echo "快速检查Consul Pod"
echo "========================================"

# 1. 查看Pod状态
echo -e "\n[1] Pod状态:"
kubectl get pods -n "${NAMESPACE}" -l app=consul -o wide

# 2. 获取最新的Pod
CONSUL_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=consul -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "${CONSUL_POD}" ]; then
    echo -e "\n未找到Consul Pod"
    exit 1
fi

echo -e "\nConsul Pod: ${CONSUL_POD}"

# 3. 查看InitContainer日志
echo -e "\n[2] InitContainer日志:"
kubectl logs "${CONSUL_POD}" -n "${NAMESPACE}" -c copy-consul-config 2>&1 || echo "无法获取InitContainer日志"

# 4. 查看Consul容器日志（最近30行）
echo -e "\n[3] Consul容器日志（最近30行）:"
kubectl logs "${CONSUL_POD}" -n "${NAMESPACE}" --tail=30 2>&1 || echo "无法获取容器日志"

# 5. 查看崩溃前的日志
echo -e "\n[4] 崩溃前的日志（如果存在）:"
kubectl logs "${CONSUL_POD}" -n "${NAMESPACE}" --previous --tail=30 2>&1 || echo "无法获取之前的日志"

# 6. 查看Pod事件
echo -e "\n[5] 最近事件:"
kubectl get events -n "${NAMESPACE}" --field-selector involvedObject.name="${CONSUL_POD}" --sort-by='.lastTimestamp' | tail -10

echo -e "\n========================================"
echo "检查完成"
echo "========================================"
