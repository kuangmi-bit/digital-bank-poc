#!/bin/bash
# 检查Consul Pod日志脚本

set -euo pipefail

NAMESPACE="digital-bank-poc"

echo "查找Consul Pod..."
CONSUL_PODS=$(kubectl get pods -n "${NAMESPACE}" -l app=consul -o jsonpath='{.items[*].metadata.name}')

if [ -z "${CONSUL_PODS}" ]; then
    echo "未找到Consul Pod"
    exit 1
fi

for pod in ${CONSUL_PODS}; do
    echo -e "\n=========================================="
    echo "Pod: ${pod}"
    echo "状态: $(kubectl get pod ${pod} -n ${NAMESPACE} -o jsonpath='{.status.phase}')"
    echo "镜像: $(kubectl get pod ${pod} -n ${NAMESPACE} -o jsonpath='{.spec.containers[0].image}')"
    echo "=========================================="
    
    echo -e "\n最近50行日志:"
    kubectl logs "${pod}" -n "${NAMESPACE}" --tail=50 2>&1 || echo "无法获取日志"
    
    echo -e "\nPod事件:"
    kubectl describe pod "${pod}" -n "${NAMESPACE}" | tail -20
done
