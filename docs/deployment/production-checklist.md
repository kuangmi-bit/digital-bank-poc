# 生产环境部署检查清单

**版本**: v1.0
**日期**: 2026-02-05
**维护者**: Agent 5（应用基础设施层）

---

## 1. 环境准备检查

### 1.1 基础设施

| 检查项 | 状态 | 备注 |
|--------|------|------|
| Kubernetes 集群就绪 | ✅ | v1.28+ |
| 命名空间已创建 (digitalbank) | ✅ | `kubectl create ns digitalbank` |
| 存储类配置 | ✅ | SSD 存储类 |
| 负载均衡器配置 | ✅ | Ingress Controller |
| SSL 证书配置 | ✅ | Let's Encrypt |

### 1.2 数据库

| 检查项 | 状态 | 备注 |
|--------|------|------|
| PostgreSQL 15 已部署 | ✅ | 高可用配置 |
| 数据库用户创建 | ✅ | digitalbank 用户 |
| 数据库已创建 | ✅ | digitalbank 库 |
| 连接池大小配置 | ✅ | max_connections=200 |
| 备份策略配置 | ✅ | 每日全量 + 实时 WAL |

### 1.3 缓存与消息队列

| 检查项 | 状态 | 备注 |
|--------|------|------|
| Redis 7 已部署 | ✅ | Sentinel 模式 |
| MongoDB 7 已部署 | ✅ | 副本集 |
| Elasticsearch 8 已部署 | ✅ | 3 节点集群 |
| Kafka 已部署 | ✅ | 3 节点集群 |

---

## 2. 配置检查

### 2.1 核心银行服务

```yaml
# application-prod.yml 关键配置
spring:
  datasource:
    hikari:
      minimum-idle: 10
      maximum-pool-size: 50
      connection-timeout: 5000
      leak-detection-threshold: 60000

  jpa:
    hibernate:
      ddl-auto: validate  # 生产环境必须为 validate
    show-sql: false

logging:
  level:
    root: INFO
    com.digitalbank: INFO
    org.hibernate.SQL: WARN
```

| 检查项 | 状态 | 说明 |
|--------|------|------|
| ddl-auto = validate | ✅ | 禁止自动修改表结构 |
| show-sql = false | ✅ | 禁止 SQL 日志 |
| 日志级别 = INFO | ✅ | 生产级别 |
| 连接池配置 | ✅ | 已优化 |
| 日志脱敏启用 | ✅ | Day 11 实现 |

### 2.2 支付服务

```javascript
// config/production.js 关键配置
module.exports = {
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      maxPoolSize: 50,
      serverSelectionTimeoutMS: 5000,
    },
  },
  redis: {
    uri: process.env.REDIS_URI,
  },
  logging: {
    level: 'info',
  },
};
```

| 检查项 | 状态 | 说明 |
|--------|------|------|
| MongoDB 连接池 | ✅ | maxPoolSize=50 |
| Redis 配置 | ✅ | 已配置 |
| 日志级别 | ✅ | info |

### 2.3 风控服务

```yaml
# config/production.yaml 关键配置
elasticsearch:
  hosts:
    - es-node1:9200
    - es-node2:9200
    - es-node3:9200
  timeout: 30

logging:
  level: INFO

rules:
  hot_reload: true
  reload_interval: 60
```

| 检查项 | 状态 | 说明 |
|--------|------|------|
| ES 集群配置 | ✅ | 3 节点 |
| 规则热加载 | ✅ | 60秒间隔 |
| 日志级别 | ✅ | INFO |

---

## 3. 安全检查

### 3.1 认证与授权

| 检查项 | 状态 | 说明 |
|--------|------|------|
| JWT 密钥配置 | ✅ | 从 Secret 读取 |
| Token 过期时间 | ✅ | 1小时 |
| Refresh Token | ✅ | 7天 |
| HTTPS 强制 | ✅ | Ingress 配置 |

### 3.2 敏感信息

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 数据库密码 (Secret) | ✅ | K8s Secret |
| Redis 密码 (Secret) | ✅ | K8s Secret |
| JWT 密钥 (Secret) | ✅ | K8s Secret |
| API Key (Secret) | ✅ | K8s Secret |
| 配置文件无明文密码 | ✅ | 全部使用环境变量 |

### 3.3 网络安全

| 检查项 | 状态 | 说明 |
|--------|------|------|
| NetworkPolicy 配置 | ✅ | 服务间隔离 |
| Ingress 限流 | ✅ | 1000 req/min |
| CORS 配置 | ✅ | 仅允许指定域名 |
| 安全头配置 | ✅ | X-Frame-Options 等 |

---

## 4. 资源配置

### 4.1 核心银行服务

```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

### 4.2 支付服务

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### 4.3 风控服务

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### 4.4 HPA 配置

| 服务 | 最小副本 | 最大副本 | CPU 阈值 | 内存阈值 |
|------|----------|----------|----------|----------|
| core-bank-service | 2 | 10 | 70% | 80% |
| payment-service | 2 | 8 | 70% | 80% |
| risk-service | 2 | 6 | 70% | 80% |

---

## 5. 监控与告警

### 5.1 监控配置

| 检查项 | 状态 | 说明 |
|--------|------|------|
| Prometheus 部署 | ✅ | metrics 采集 |
| Grafana 部署 | ✅ | 可视化面板 |
| 服务 metrics 端点 | ✅ | /actuator/prometheus |
| 日志收集 (ELK) | ✅ | Filebeat + Logstash |

### 5.2 告警规则

| 告警 | 条件 | 严重级别 |
|------|------|----------|
| 服务不可用 | Pod 状态非 Running | Critical |
| 高 CPU 使用 | CPU > 90% 持续 5 分钟 | Warning |
| 高内存使用 | Memory > 90% 持续 5 分钟 | Warning |
| 高错误率 | 5xx 错误 > 1% | Critical |
| 高延迟 | P99 > 3s | Warning |
| 数据库连接池耗尽 | 活动连接 > 90% | Critical |

---

## 6. 备份与恢复

### 6.1 备份策略

| 数据 | 策略 | 保留时间 |
|------|------|----------|
| PostgreSQL | 每日全量 + WAL 归档 | 30 天 |
| MongoDB | 每日全量 | 14 天 |
| Elasticsearch | 每日快照 | 7 天 |
| Redis | RDB + AOF | 实时 |

### 6.2 恢复演练

| 检查项 | 状态 | 最近测试时间 |
|--------|------|--------------|
| PostgreSQL 恢复测试 | ✅ | 2026-02-01 |
| MongoDB 恢复测试 | ✅ | 2026-02-01 |
| 全系统恢复测试 | ✅ | 2026-02-03 |

---

## 7. 部署流程

### 7.1 部署命令

```bash
# 1. 应用配置
kubectl apply -f infrastructure/k8s/overlays/prod/namespace.yaml
kubectl apply -f infrastructure/k8s/overlays/prod/secrets.yaml

# 2. 部署数据库迁移
kubectl apply -f infrastructure/k8s/overlays/prod/jobs/db-migration.yaml

# 3. 部署服务
kubectl apply -k infrastructure/k8s/overlays/prod

# 4. 验证部署
kubectl get pods -n digitalbank
kubectl get svc -n digitalbank
```

### 7.2 回滚命令

```bash
# 回滚到上一版本
kubectl rollout undo deployment/core-bank-service -n digitalbank
kubectl rollout undo deployment/payment-service -n digitalbank
kubectl rollout undo deployment/risk-service -n digitalbank

# 回滚到指定版本
kubectl rollout undo deployment/core-bank-service -n digitalbank --to-revision=2
```

---

## 8. 上线前最终检查

### 8.1 功能验证

- [ ] 健康检查接口响应正常
- [ ] 开户流程正常
- [ ] 转账流程正常
- [ ] 批量转账正常
- [ ] 预约转账正常
- [ ] 账单支付正常
- [ ] 风控拦截正常

### 8.2 性能验证

- [ ] 响应时间 P95 < 500ms
- [ ] 并发 100 TPS 无错误
- [ ] 无内存泄漏
- [ ] 数据库连接正常回收

### 8.3 监控验证

- [ ] Prometheus 采集正常
- [ ] Grafana 面板显示正常
- [ ] 告警通知正常
- [ ] 日志收集正常

---

## 9. 签核

| 角色 | 签核人 | 日期 |
|------|--------|------|
| 架构管控 | Agent 0 | 2026-02-05 |
| 基础设施 | Agent 5 | 2026-02-05 |
| 安全审核 | Agent 7 | 2026-02-05 |
| 测试确认 | Agent 6 | 2026-02-05 |

---

**文档版本**: v1.0
**更新日期**: 2026-02-05
