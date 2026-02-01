# HashiCorp Vault 配置 - Digital Bank POC
# 技术标准: 密钥管理使用 Vault，敏感数据 AES-256
# 维护者: Agent 7 (安全扫描卫士)

# ---------------------------------------------------------------------------
# 存储后端 (开发/生产按环境覆盖)
# ---------------------------------------------------------------------------
storage "file" {
  path = "/vault/data"
}

# 高可用场景示例 (生产)
# storage "consul" {
#   address = "127.0.0.1:8500"
#   path    = "vault/"
# }

# ---------------------------------------------------------------------------
# 监听器
# ---------------------------------------------------------------------------
listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = 0
  tls_cert_file = "/vault/config/tls/tls.crt"
  tls_key_file  = "/vault/config/tls/tls.key"
}

# 开发环境可暂时 tls_disable = 1，生产必须 TLS

# ---------------------------------------------------------------------------
# API 地址（集群内外）
# ---------------------------------------------------------------------------
api_addr     = "https://vault.digitalbank-poc.example.com:8200"
cluster_addr = "https://vault.digitalbank-poc.example.com:8201"

# ---------------------------------------------------------------------------
# 禁用 mlock（容器/Windows 等；Linux 生产可启用）
# ---------------------------------------------------------------------------
disable_mlock = true

# ---------------------------------------------------------------------------
# 审计日志
# ---------------------------------------------------------------------------
# 文件审计
# audit_device "file" {
#   path = "/vault/audit/audit.log"
# }

# ---------------------------------------------------------------------------
# 与项目相关的 Secret 路径设计（KV v2）
# 应用通过 VAULT_ADDR + 认证方式读取，不在此存放真实密钥
# ---------------------------------------------------------------------------
# 路径约定（kebab-case，与命名规范一致）:
#
#   secret/data/digital-bank-poc/core-bank-service
#     - database_url, database_username, database_password
#     - jwt_secret, jwt_issuer
#     - encryption_key (AES-256 主密钥，用于应用层加密)
#
#   secret/data/digital-bank-poc/payment-service
#     - mongodb_uri, mongodb_username, mongodb_password
#     - payment_gateway_api_key, payment_gateway_secret
#     - encryption_key
#
#   secret/data/digital-bank-poc/risk-service
#     - elasticsearch_url, elasticsearch_username, elasticsearch_password
#     - encryption_key
#
#   secret/data/digital-bank-poc/frontend
#     - oauth_client_secret, oauth_client_id (若后端代理则放 backend)
#
#   secret/data/digital-bank-poc/kong
#     - admin_api_key, db_encryption_key
#
#   secret/data/digital-bank-poc/infra
#     - consul_acl_master_token, ca_cert, ca_key
#
# 环境隔离: secret/data/digital-bank-poc/{env}/... 或通过 Vault namespace (Enterprise)
# 如: secret/data/digital-bank-poc/dev/core-bank-service
#     secret/data/digital-bank-poc/prod/core-bank-service
#
# ---------------------------------------------------------------------------
# 策略示例 (需在 Vault 中创建，此处仅作文档)
# ---------------------------------------------------------------------------
# 策略名: digital-bank-poc-core-bank-service
# 能力: 对 secret/data/digital-bank-poc/core-bank-service 只读
#
# path "secret/data/digital-bank-poc/core-bank-service" {
#   capabilities = ["read", "list"]
# }
#
# path "secret/data/digital-bank-poc/core-bank-service/*" {
#   capabilities = ["read", "list"]
# }
#
# ---------------------------------------------------------------------------
# 应用集成方式 (环境变量，UPPER_SNAKE_CASE)
# ---------------------------------------------------------------------------
# VAULT_ADDR=https://vault.digitalbank-poc.example.com:8200
# VAULT_NAMESPACE= 或 dev/prod
# VAULT_ROLE_ID=    (AppRole)
# VAULT_SECRET_ID=  (AppRole，或通过 Wrapped 一次性获取)
# 或
# VAULT_TOKEN=      (仅 CI/短生命周期)
# VAULT_SKIP_VERIFY=0 (生产必须校验 TLS)
#
# ---------------------------------------------------------------------------
# K8s 集成 (Vault Agent / CSI / Sidecar)
# ---------------------------------------------------------------------------
# 使用 Vault Helm Chart 或 Vault Agent Injector，通过 annotation 将 secret 挂载为文件或 env。
# 例: annotations["vault.hashicorp.com/agent-inject-secret-db"] = "secret/data/digital-bank-poc/dev/core-bank-service"
#     annotations["vault.hashicorp.com/agent-inject-template-db"] = "{{- with secret \"secret/data/digital-bank-poc/dev/core-bank-service\" -}}\nDB_URL={{ .Data.data.database_url }}\n{{- end }}"
# ---------------------------------------------------------------------------
