#!/usr/bin/env bash
# 环境部署脚本 - 数字银行 POC
# 用法: ./deploy.sh <env> [image-tag]
# 环境: dev | qa | uat | prod (小写，遵循命名规范)
# 产出: 通过 kustomize/kubectl 部署到 K8s 对应 namespace

set -e

ENV="${1:?用法: $0 <dev|qa|uat|prod> [image-tag]}"
IMAGE_TAG="${2:-latest}"
if [[ -z "${NAMESPACE:-}" ]]; then
  # 命名空间按环境划分（technical-standards）；dev 仍沿用 base 的 digital-bank-poc
  if [[ "$ENV" == "dev" ]]; then
    NAMESPACE="digital-bank-poc"
  else
    NAMESPACE="$ENV"
  fi
fi
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
K8S_BASE="$(cd "$SCRIPT_DIR/../k8s/base" && pwd)"
IMAGE_PREFIX="${IMAGE_PREFIX:-digitalbank}"

echo "[deploy] env=$ENV image_tag=$IMAGE_TAG namespace=$NAMESPACE"

# 可选: 按环境 overlay (dev/qa/uat) 切换 kustomize overlay
# 当前仅 base，后续可加 k8s/overlays/dev 等
if [[ -d "$SCRIPT_DIR/../k8s/overlays/$ENV" ]]; then
  KUST_DIR="$SCRIPT_DIR/../k8s/overlays/$ENV"
else
  KUST_DIR="$K8S_BASE"
fi

# 应用 Kustomize（优先 overlays/<env>，否则 base）
kubectl apply -k "$KUST_DIR" --namespace="$NAMESPACE" 2>/dev/null || true

# 若有应用服务 Deployment，可在此按 IMAGE_TAG 更新镜像
# 例: kubectl set image deployment/core-bank-service-deployment core-bank-service=${IMAGE_PREFIX}/core-bank-service:${IMAGE_TAG} -n "$NAMESPACE"
for svc in core-bank-service payment-service risk-service frontend; do
  dep="${svc}-deployment"
  if kubectl get deployment "$dep" -n "$NAMESPACE" &>/dev/null; then
    img="${IMAGE_PREFIX}/${svc}:${IMAGE_TAG}"
    echo "[deploy] set image $dep -> $img"
    kubectl set image "deployment/$dep" "$svc=$img" -n "$NAMESPACE"
    kubectl rollout status "deployment/$dep" -n "$NAMESPACE" --timeout=300s || true
  fi
done

echo "[deploy] 完成 env=$ENV"
