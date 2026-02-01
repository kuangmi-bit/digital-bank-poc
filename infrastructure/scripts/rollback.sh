#!/usr/bin/env bash
# 回滚脚本 - 数字银行 POC
# 用法: ./rollback.sh <service-name> [revision]
# 示例: ./rollback.sh core-bank-service
#       ./rollback.sh core-bank-service 2
# 命名: {service-name}-deployment (kebab-case)

set -e

SERVICE="${1:?用法: $0 <service-name> [revision]}"
REVISION="${2:-}"
if [[ -z "${NAMESPACE:-}" ]]; then
  # 可通过 DEPLOY_ENV 指定目标环境（qa/uat/prod）；否则默认 dev 的 digital-bank-poc
  if [[ -n "${DEPLOY_ENV:-}" && "${DEPLOY_ENV}" != "dev" ]]; then
    NAMESPACE="${DEPLOY_ENV}"
  else
    NAMESPACE="digital-bank-poc"
  fi
fi
DEPLOYMENT="${SERVICE}-deployment"

echo "回滚 $DEPLOYMENT (namespace=$NAMESPACE) ..."

if ! kubectl get deployment "$DEPLOYMENT" -n "$NAMESPACE" &>/dev/null; then
  echo "Deployment $DEPLOYMENT 不存在，跳过"
  exit 0
fi

if [[ -z "$REVISION" ]]; then
  kubectl rollout undo "deployment/$DEPLOYMENT" -n "$NAMESPACE"
else
  kubectl rollout undo "deployment/$DEPLOYMENT" -n "$NAMESPACE" --to-revision="$REVISION"
fi

kubectl rollout status "deployment/$DEPLOYMENT" -n "$NAMESPACE" --timeout=300s

CURRENT_IMAGE=$(kubectl get "deployment/$DEPLOYMENT" -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.containers[0].image}')
echo "回滚完成。当前镜像: $CURRENT_IMAGE"
