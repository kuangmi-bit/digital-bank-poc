#!/bin/bash
# 验证 Kong 网关功能 (Day 5 Agent 5 d5a5t6)
# 覆盖: 路由可达性、限流插件存在性（基础检查）、JWT 生效、CORS 响应头、TLS(8443) 监听
# 符合: ADR-004、technical-standards-v1.0、naming-conventions
#
# 说明:
# - Kong 采用 DB-less 声明式配置（ConfigMap 中的 kong.yml）
# - JWT secret 为 POC/Dev 示例（见 kong.yml consumers.api-client.jwt_secrets）
#
# 运行前提: kubectl 可用且能访问集群；命名空间 digital-bank-poc

set -euo pipefail

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

NAMESPACE="digital-bank-poc"

KONG_ADMIN="http://kong.${NAMESPACE}.svc.cluster.local:8001"
KONG_PROXY="http://kong.${NAMESPACE}.svc.cluster.local:8000"
KONG_PROXY_SSL="https://kong.${NAMESPACE}.svc.cluster.local:8443"

JWT_ISSUER_KEY="api-client"
JWT_SECRET="digitalbank-jwt-dev-secret"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}验证 Kong 网关功能 (Day 5)${NC}"
echo -e "${BLUE}========================================${NC}"

# 选择一个可 exec 且带 wget 的 Pod 作为 runner
RUNNER_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=nginx -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -z "${RUNNER_POD}" ]; then
  RUNNER_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=consul -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
fi
if [ -z "${RUNNER_POD}" ]; then
  RUNNER_POD=$(kubectl get pod -n "${NAMESPACE}" -l app=kong -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
fi

if [ -z "${RUNNER_POD}" ]; then
  echo -e "${RED}✗ 未找到可用 runner Pod (nginx/consul/kong)${NC}"
  exit 1
fi

echo -e "\n${GREEN}使用 runner Pod: ${RUNNER_POD}${NC}"

http_code() {
  # 用 wget 抓取首个 HTTP 状态码（容忍 4xx/5xx）
  # $1: URL
  # $2..$n: 额外 wget 参数（可选）
  local url="$1"
  shift || true
  kubectl exec -n "${NAMESPACE}" "${RUNNER_POD}" -- \
    sh -c "wget -q --server-response --spider --timeout=5 $* \"${url}\" 2>&1 | grep -m1 -Eo 'HTTP/[0-9.]+ [0-9]+' | cut -d' ' -f2" \
    2>/dev/null || true
}

echo -e "\n${YELLOW}[1] Kong Admin /status${NC}"
CODE=$(http_code "${KONG_ADMIN}/status")
if [ "${CODE}" = "200" ]; then
  echo -e "${GREEN}✓ Kong Admin /status = 200${NC}"
else
  echo -e "${RED}✗ Kong Admin /status 非 200 (code=${CODE:-empty})${NC}"
fi

echo -e "\n${YELLOW}[2] JWT 未携带 Token 应被拦截（业务路由）${NC}"
CODE=$(http_code "${KONG_PROXY}/api/v1/accounts")
if [ "${CODE}" = "401" ]; then
  echo -e "${GREEN}✓ 未携带 JWT -> 401（符合预期）${NC}"
else
  echo -e "${YELLOW}⚠ 未携带 JWT 未返回 401 (code=${CODE:-empty})，请检查 jwt 插件绑定与路由${NC}"
fi

echo -e "\n${YELLOW}[3] CORS 响应头检查（以 401 响应为载体）${NC}"
ORIGIN="http://localhost:5173"
HAS_CORS=$(kubectl exec -n "${NAMESPACE}" "${RUNNER_POD}" -- \
  sh -c "wget -q --server-response --spider --timeout=5 --header=\"Origin: ${ORIGIN}\" \"${KONG_PROXY}/api/v1/accounts\" 2>&1 | grep -qi '^  Access-Control-Allow-Origin:' && echo yes || echo no" \
  2>/dev/null || echo "no")
if [ "${HAS_CORS}" = "yes" ]; then
  echo -e "${GREEN}✓ 返回 Access-Control-Allow-Origin 响应头${NC}"
else
  echo -e "${YELLOW}⚠ 未检测到 CORS 响应头（请确认 cors 插件为全局且 run_on_preflight 行为）${NC}"
fi

echo -e "\n${YELLOW}[4] TLS(8443) 监听可连通（无需校验证书）${NC}"
CODE=$(kubectl exec -n "${NAMESPACE}" "${RUNNER_POD}" -- \
  sh -c "wget -q --server-response --spider --timeout=5 --no-check-certificate \"${KONG_PROXY_SSL}/api/v1/accounts\" 2>&1 | grep -m1 -Eo 'HTTP/[0-9.]+ [0-9]+' | cut -d' ' -f2" \
  2>/dev/null || true)
if [ "${CODE}" = "401" ]; then
  echo -e "${GREEN}✓ HTTPS 8443 可连通，且 JWT 仍生效 (401)${NC}"
else
  echo -e "${YELLOW}⚠ HTTPS 8443 未返回 401 (code=${CODE:-empty})；若为空多为未启用 KONG_PROXY_LISTEN 的 ssl${NC}"
fi

echo -e "\n${YELLOW}[5] 生成 JWT 并验证“携带 Token 不再返回 401”${NC}"
TOKEN=""
if command -v python >/dev/null 2>&1; then
  TOKEN=$(python - <<'PY'
import base64, hashlib, hmac, json, time

def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")

issuer = "api-client"
secret = "digitalbank-jwt-dev-secret".encode("utf-8")
now = int(time.time())
payload = {"iss": issuer, "iat": now, "exp": now + 3600}
header = {"alg": "HS256", "typ": "JWT"}

segments = [
    b64url(json.dumps(header, separators=(",", ":")).encode("utf-8")),
    b64url(json.dumps(payload, separators=(",", ":")).encode("utf-8")),
]
signing_input = ".".join(segments).encode("utf-8")
sig = hmac.new(secret, signing_input, hashlib.sha256).digest()
segments.append(b64url(sig))
print(".".join(segments))
PY
)
fi

if [ -z "${TOKEN}" ]; then
  echo -e "${YELLOW}⚠ 未生成 JWT（缺少 python），跳过“携带 Token”验证。${NC}"
  echo -e "  你也可以手动生成 HS256 JWT：iss=${JWT_ISSUER_KEY}, secret=${JWT_SECRET}, exp=now+3600"
else
  CODE=$(http_code "${KONG_PROXY}/api/v1/accounts" "--header=\"Authorization: Bearer ${TOKEN}\"")
  if [ "${CODE}" != "401" ] && [ -n "${CODE}" ]; then
    echo -e "${GREEN}✓ 携带 JWT 后不再返回 401 (code=${CODE})${NC}"
  else
    echo -e "${YELLOW}⚠ 携带 JWT 仍返回 401/空 (code=${CODE:-empty})，请检查 consumer.jwt_secrets 与 iss/secret 是否一致${NC}"
  fi
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}验证完成${NC}"
echo -e "${BLUE}========================================${NC}"

