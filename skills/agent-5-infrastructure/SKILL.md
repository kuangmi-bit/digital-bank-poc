---
name: agent-5-infrastructure
version: 1.0.0
description: 应用基础设施层Agent技能 - 负责配置和管理API网关、服务注册发现、负载均衡等基础设施组件。使用Kong API Gateway + Consul + Nginx + Kubernetes技术栈。
author: Digital Bank POC Team
license: MIT
keywords:
  - api-gateway
  - kong
  - consul
  - nginx
  - kubernetes
  - service-discovery
  - load-balancing
  - infrastructure
---

# Agent 5: 应用基础设施层 🔌

## 概述

Agent 5负责配置和管理API网关、服务注册发现、负载均衡等基础设施组件。确保所有微服务能够正确路由、发现和负载均衡。

## 何时使用

当需要：
- 配置API网关路由规则
- 设置服务注册与发现
- 配置负载均衡
- 实现服务网格
- 配置限流和认证

## 技术栈

- **API网关**: Kong API Gateway
- **服务注册**: Consul
- **反向代理**: Nginx
- **容器编排**: Kubernetes
- **基础设施即代码**: Terraform
- **配置管理**: YAML, JSON

## 核心功能

### 1. API网关
- 统一API入口
- 路由规则配置
- 限流规则配置
- API认证（JWT）
- CORS配置
- SSL/TLS配置

### 2. 服务注册与发现
- Consul服务注册
- 服务健康检查
- 服务发现配置

### 3. 负载均衡
- Nginx负载均衡配置
- 服务间负载均衡

### 4. 服务网格（简化版）
- 服务间通信配置
- 服务熔断（Hystrix/Resilience4j）
- 服务降级

## 自动化能力

- **配置管理**: 85%自动化
  - API网关规则自动配置
  - 服务注册自动发现
  - 路由规则自动生成
  - 限流规则自动配置

## 交付标准

- **网关规则**: 50+条
- **服务节点**: 10+个
- **配置文件**: 全部自动生成
- **服务可用性**: ≥98%

## 项目结构

```
infrastructure/
├── terraform/           # Terraform配置
│   └── main.tf
├── k8s/                 # Kubernetes配置
│   ├── base/            # 基础配置
│   └── core-bank-service/  # 各服务配置
├── nginx/               # Nginx配置
│   └── nginx.conf
├── kong/                # Kong API Gateway配置
│   ├── kong.yml         # 基础配置
│   └── routes/          # 路由规则
│       ├── core-bank.yml
│       ├── payment.yml
│       └── risk.yml
└── consul/              # Consul配置
    └── consul-config.json
```

## 技术标准规范要求

**重要**: 必须严格遵循技术标准规范和命名规范。

### 必须遵循的规范文档

1. **技术标准规范 v1.0**: `docs/architecture/technical-standards-v1.0.md`
2. **命名规范 v1.0**: `docs/architecture/naming-conventions.md`

## 配置规范

- 所有配置使用YAML或JSON格式
- **严格遵循技术标准规范中的部署规范**
- **严格遵循命名规范**
- 配置文件版本控制
- 环境变量管理敏感信息
- 网关规则遵循RESTful原则

### 命名规范要点

- **服务名**: kebab-case (如 `core-bank-service`, `payment-service`)
- **Kubernetes资源**: kebab-case (如 `core-bank-service-deployment`)
- **配置文件**: kebab-case或snake_case (如 `kong.yml`, `nginx.conf`)
- **环境变量**: UPPER_SNAKE_CASE (如 `CORE_BANK_DB_HOST`)
- **API路径**: kebab-case (如 `/api/v1/accounts`)

## 协作关系

- **与所有服务Agent**: 配置服务路由和网关规则
- **与Agent 8**: 协作部署到Kubernetes
- **与Agent 6**: 提供测试环境访问
- **与Agent 7**: 配置安全策略

## 关键里程碑

- **Day 1**: 基础设施配置完成，Dev环境就绪
- **Day 3**: 核心银行服务路由配置完成
- **Day 5**: 所有服务路由和限流配置完成
- **Day 8**: 服务网格配置完成

## 配置示例

### Kong路由配置示例
```yaml
_format_version: "3.0"
services:
  # 遵循命名规范: 服务名kebab-case
  - name: core-bank-service
    url: http://core-bank-service:8080
    routes:
      # 遵循命名规范: 路由名kebab-case
      - name: accounts-route
        paths:
          # 遵循命名规范: API路径kebab-case, 复数形式
          - /api/v1/accounts
        methods:
          - GET
          - POST
        plugins:
          - name: rate-limiting
            config:
              minute: 100
              hour: 1000
```

### Consul配置示例
```json
{
  "service": {
    "name": "core-bank-service",  // 遵循命名规范: 服务名kebab-case
    "tags": ["banking", "api"],
    "port": 8080,
    "check": {
      "http": "http://localhost:8080/health",  // 遵循命名规范: 健康检查路径
      "interval": "10s"
    }
  }
}
```

## 服务熔断配置

### Kong熔断插件配置

```yaml
# kong/plugins/circuit-breaker.yml
plugins:
  - name: circuit-breaker
    service: core-bank-service
    config:
      timeout: 10000              # 请求超时10秒
      window_size: 60             # 统计窗口60秒
      error_threshold: 50         # 错误率阈值50%
      volume_threshold: 20        # 最小请求数20
      half_open_requests: 5       # 半开状态允许的请求数
      recovery_time: 30           # 熔断恢复时间30秒

  - name: circuit-breaker
    service: payment-service
    config:
      timeout: 30000              # 支付服务超时30秒
      error_threshold: 30         # 更敏感的错误阈值
      volume_threshold: 10
```

### Resilience4j配置（Java服务）

```yaml
# application.yml (Core Bank Service)
resilience4j:
  circuitbreaker:
    instances:
      paymentService:
        slidingWindowType: COUNT_BASED
        slidingWindowSize: 10
        minimumNumberOfCalls: 5
        failureRateThreshold: 50
        waitDurationInOpenState: 30s
        permittedNumberOfCallsInHalfOpenState: 3
      riskService:
        slidingWindowSize: 5
        failureRateThreshold: 30
        waitDurationInOpenState: 60s

  retry:
    instances:
      paymentService:
        maxAttempts: 3
        waitDuration: 1s
        retryExceptions:
          - java.net.ConnectException
          - java.net.SocketTimeoutException

  timelimiter:
    instances:
      paymentService:
        timeoutDuration: 10s
      riskService:
        timeoutDuration: 5s
```

---

## 健康检查配置

### Kubernetes Probe配置

```yaml
# k8s/core-bank-service/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: core-bank-service-deployment
spec:
  template:
    spec:
      containers:
      - name: core-bank-service
        image: digitalbank/core-bank-service:v1.0.0
        ports:
        - containerPort: 8080

        # 存活探针 - 检查服务是否存活
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 30    # 启动后30秒开始检查
          periodSeconds: 10          # 每10秒检查一次
          timeoutSeconds: 5          # 超时5秒
          failureThreshold: 3        # 连续3次失败则重启

        # 就绪探针 - 检查服务是否可接收流量
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3

        # 启动探针 - 检查服务是否完成启动
        startupProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
          failureThreshold: 30       # 最多等待150秒启动
```

### Consul健康检查

```json
{
  "service": {
    "name": "core-bank-service",
    "port": 8080,
    "checks": [
      {
        "id": "http-health",
        "name": "HTTP Health Check",
        "http": "http://localhost:8080/actuator/health",
        "interval": "10s",
        "timeout": "5s",
        "deregister_critical_service_after": "1m"
      },
      {
        "id": "tcp-check",
        "name": "TCP Port Check",
        "tcp": "localhost:8080",
        "interval": "5s"
      }
    ]
  }
}
```

---

## SSL/TLS证书管理

### cert-manager配置

```yaml
# k8s/cert-manager/certificate.yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: digitalbank-tls
  namespace: prod
spec:
  secretName: digitalbank-tls-secret
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  commonName: api.digitalbank.example.com
  dnsNames:
    - api.digitalbank.example.com
    - www.digitalbank.example.com
  duration: 2160h    # 90天
  renewBefore: 360h  # 提前15天续期

---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@digitalbank.example.com
    privateKeySecretRef:
      name: letsencrypt-prod-key
    solvers:
    - http01:
        ingress:
          class: nginx
```

### Kong SSL配置

```yaml
# kong/ssl-config.yml
_format_version: "3.0"

certificates:
  - cert: |
      -----BEGIN CERTIFICATE-----
      ...
      -----END CERTIFICATE-----
    key: |
      -----BEGIN PRIVATE KEY-----
      ...
      -----END PRIVATE KEY-----
    snis:
      - api.digitalbank.example.com

services:
  - name: core-bank-service
    protocol: https
    routes:
      - name: core-bank-route
        protocols:
          - https
        paths:
          - /api/v1/accounts
```

---

## CORS配置

### Kong CORS插件

```yaml
# kong/plugins/cors.yml
plugins:
  - name: cors
    config:
      origins:
        - "https://www.digitalbank.example.com"
        - "https://admin.digitalbank.example.com"
        - "http://localhost:3000"  # 开发环境
      methods:
        - GET
        - POST
        - PUT
        - PATCH
        - DELETE
        - OPTIONS
      headers:
        - Accept
        - Accept-Version
        - Content-Length
        - Content-Type
        - Authorization
        - X-Requested-With
        - X-Idempotency-Key
      exposed_headers:
        - X-Request-Id
        - X-RateLimit-Limit
        - X-RateLimit-Remaining
      credentials: true
      max_age: 3600
      preflight_continue: false
```

### Nginx CORS配置

```nginx
# nginx/cors.conf
location /api/ {
    # CORS预检请求
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' $http_origin always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, X-Idempotency-Key' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Max-Age' 3600 always;
        add_header 'Content-Length' 0;
        return 204;
    }

    # 正常请求
    add_header 'Access-Control-Allow-Origin' $http_origin always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;

    proxy_pass http://api-gateway;
}
```

---

## 限流配置

### Kong限流插件

```yaml
# kong/plugins/rate-limiting.yml
plugins:
  # 全局限流
  - name: rate-limiting
    config:
      minute: 1000
      hour: 10000
      policy: redis
      redis_host: redis.default.svc.cluster.local
      redis_port: 6379
      fault_tolerant: true
      hide_client_headers: false

  # 服务级限流
  - name: rate-limiting
    service: core-bank-service
    config:
      minute: 500
      hour: 5000

  # 路由级限流（敏感接口）
  - name: rate-limiting
    route: transfer-route
    config:
      minute: 60
      hour: 600
      limit_by: consumer  # 按用户限流

  # 用户级限流
  - name: rate-limiting
    consumer: premium-user
    config:
      minute: 200
      hour: 2000
```

---

## 服务网格配置

### Istio虚拟服务（可选）

```yaml
# istio/virtual-service.yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: core-bank-vs
spec:
  hosts:
  - core-bank-service
  http:
  - match:
    - uri:
        prefix: /api/v1/accounts
    route:
    - destination:
        host: core-bank-service
        port:
          number: 8080
    timeout: 10s
    retries:
      attempts: 3
      perTryTimeout: 3s
      retryOn: connect-failure,refused-stream,unavailable

---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: core-bank-dr
spec:
  host: core-bank-service
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        h2UpgradePolicy: UPGRADE
        http1MaxPendingRequests: 100
        http2MaxRequests: 1000
    outlierDetection:
      consecutive5xxErrors: 5
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
```

---

## 相关资源

- Agent启动提示词: `agent_prompts.md`
- 详细工作计划: `digital_bank_poc_workplan.md`
- **技术标准规范 v1.0**: `docs/architecture/technical-standards-v1.0.md` ⚠️ **必须遵循**
- **命名规范 v1.0**: `docs/architecture/naming-conventions.md` ⚠️ **必须遵循**

---

**版本**: v1.1.0  
**创建日期**: 2026-01-26  
**维护者**: Digital Bank POC Team
