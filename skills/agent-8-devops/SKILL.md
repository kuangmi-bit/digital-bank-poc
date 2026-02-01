---
name: agent-8-devops
version: 1.0.0
description: 运维自动化引擎Agent技能 - 负责CI/CD流水线、容器编排、监控告警和自动化部署。使用Kubernetes + Terraform + GitLab CI + Prometheus技术栈。
author: Digital Bank POC Team
license: MIT
keywords:
  - devops
  - ci-cd
  - kubernetes
  - terraform
  - docker
  - monitoring
  - prometheus
  - grafana
  - automation
---

# Agent 8: 运维自动化引擎 ⚙️

## 概述

Agent 8负责CI/CD流水线、容器编排、监控告警和自动化部署。确保所有服务能够自动化构建、测试、部署和监控。

## 何时使用

当需要：
- 配置CI/CD流水线
- 部署到Kubernetes
- 配置监控和告警
- 实现弹性伸缩
- 自动化环境管理

## 技术栈

- **容器编排**: Kubernetes
- **基础设施即代码**: Terraform
- **CI/CD**: GitLab CI
- **监控**: Prometheus + Grafana
- **日志**: ELK Stack（可选）
- **容器**: Docker

## 核心功能

### 1. CI/CD流水线
- 代码构建自动化
- 自动化测试集成
- 自动化部署
- 回滚机制

### 2. 容器编排
- Kubernetes部署配置
- Helm Charts
- 服务编排

### 3. 监控告警
- Prometheus指标收集
- Grafana仪表板
- 告警规则配置
- 故障自动恢复

### 4. 弹性伸缩
- HPA（水平自动伸缩）
- 资源限制配置
- 性能监控

## 自动化能力

- **DevOps自动化**: 95%自动化
  - 基础设施自动部署（Terraform）
  - 应用自动编排（K8s + Helm）
  - CI/CD流水线自动运行
  - 监控告警自动配置
  - 故障自动恢复
  - 弹性伸缩自动执行

## 环境管理

- **Dev环境**: 实时部署最新代码
- **QA环境**: 稳定版本自动部署
- **UAT环境**: 准生产配置
- **Demo环境**: 演示专用

## 交付标准

- **CI/CD自动化率**: ≥75%
- **环境部署时间**: ≤15分钟
- **系统可用性**: ≥98%
- **监控覆盖率**: 100%关键服务

## 项目结构

```
infrastructure/
├── .gitlab-ci.yml       # CI/CD流水线配置
├── docker/
│   └── docker-compose.yml
├── k8s/
│   ├── helm/            # Helm Charts
│   └── manifests/       # K8s清单文件
├── terraform/           # Terraform配置
├── monitoring/
│   ├── prometheus/      # Prometheus配置
│   │   └── prometheus.yml
│   └── grafana/         # Grafana仪表板
│       └── dashboards/
└── scripts/
    └── rollback.sh      # 回滚脚本
```

## CI/CD流程

1. **代码提交** → 触发CI流水线
2. **构建** → Docker镜像构建
3. **测试** → 单元测试、集成测试
4. **安全扫描** → SAST扫描
5. **部署** → 自动部署到目标环境
6. **验证** → 健康检查
7. **回滚** → 失败时自动回滚

## 协作关系

- **与所有开发Agent**: 部署各服务到K8s
- **与Agent 5**: 协作基础设施配置
- **与Agent 6**: 集成测试到CI/CD
- **与Agent 7**: 集成安全扫描到CI/CD
- **与Agent 0**: 报告部署状态和问题

## 关键里程碑

- **Day 1**: CI/CD基础流水线配置完成
- **Day 3**: 所有服务CI/CD流水线完成
- **Day 5**: QA环境部署成功
- **Day 8**: 监控告警配置完成
- **Day 10**: 弹性伸缩配置完成
- **Day 12**: UAT和Demo环境部署完成

## 配置示例

### GitLab CI配置示例
```yaml
stages:
  - build
  - test
  - security
  - deploy

build:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

deploy:
  stage: deploy
  script:
    - kubectl set image deployment/core-bank-service core-bank-service=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
```

### Kubernetes部署示例
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  # 遵循命名规范: kebab-case资源名
  name: core-bank-service-deployment
  namespace: dev  # 遵循命名规范: 环境标识小写
spec:
  replicas: 3
  selector:
    matchLabels:
      app: core-bank-service  # 遵循命名规范: kebab-case标签
  template:
    metadata:
      labels:
        app: core-bank-service
    spec:
      containers:
      - name: core-bank-service  # 遵循命名规范: kebab-case容器名
        # 遵循命名规范: Docker镜像命名
        image: digitalbank/core-bank-service:v1.0.0
        ports:
        - containerPort: 8080
```

## 技术标准规范要求

**重要**: 必须严格遵循技术标准规范和命名规范。

### 必须遵循的规范文档

1. **技术标准规范 v1.0**: `docs/architecture/technical-standards-v1.0.md`
2. **命名规范 v1.0**: `docs/architecture/naming-conventions.md`

### 命名规范要点

- **Docker镜像**: `digitalbank/{service-name}:{tag}` (小写，kebab-case)
- **Kubernetes资源**: `{service-name}-deployment`, `{service-name}-service` (kebab-case)
- **CI/CD流水线**: `{service-name}-pipeline` (kebab-case)
- **监控指标**: `{service}.{category}.{metric}` (snake_case)
- **环境标识**: `dev`, `qa`, `uat`, `prod` (小写)

## 蓝绿部署配置

### 蓝绿部署策略

```yaml
# k8s/core-bank-service/blue-green-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: core-bank-service-blue
  labels:
    app: core-bank-service
    version: blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: core-bank-service
      version: blue
  template:
    metadata:
      labels:
        app: core-bank-service
        version: blue
    spec:
      containers:
      - name: core-bank-service
        image: digitalbank/core-bank-service:v1.0.0
        ports:
        - containerPort: 8080

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: core-bank-service-green
  labels:
    app: core-bank-service
    version: green
spec:
  replicas: 0  # 初始为0，部署新版本时扩展
  selector:
    matchLabels:
      app: core-bank-service
      version: green
  template:
    metadata:
      labels:
        app: core-bank-service
        version: green
    spec:
      containers:
      - name: core-bank-service
        image: digitalbank/core-bank-service:v1.1.0
        ports:
        - containerPort: 8080

---
apiVersion: v1
kind: Service
metadata:
  name: core-bank-service
spec:
  selector:
    app: core-bank-service
    version: blue  # 切换版本时修改此处
  ports:
  - port: 80
    targetPort: 8080
```

### 蓝绿切换脚本

```bash
#!/bin/bash
# scripts/blue-green-switch.sh

SERVICE=$1
NEW_VERSION=$2

if [ -z "$SERVICE" ] || [ -z "$NEW_VERSION" ]; then
  echo "Usage: $0 <service-name> <blue|green>"
  exit 1
fi

echo "Switching $SERVICE to $NEW_VERSION..."

# 扩展新版本
kubectl scale deployment ${SERVICE}-${NEW_VERSION} --replicas=3

# 等待新版本就绪
kubectl rollout status deployment/${SERVICE}-${NEW_VERSION} --timeout=300s

# 健康检查
READY=$(kubectl get deployment ${SERVICE}-${NEW_VERSION} -o jsonpath='{.status.readyReplicas}')
if [ "$READY" -lt 3 ]; then
  echo "Error: New version not ready"
  exit 1
fi

# 切换流量
kubectl patch service ${SERVICE} -p "{\"spec\":{\"selector\":{\"version\":\"${NEW_VERSION}\"}}}"

echo "Traffic switched to $NEW_VERSION"

# 缩容旧版本
OLD_VERSION=$([ "$NEW_VERSION" == "blue" ] && echo "green" || echo "blue")
kubectl scale deployment ${SERVICE}-${OLD_VERSION} --replicas=0

echo "Blue-Green switch completed!"
```

---

## 回滚策略

### 自动回滚配置

```yaml
# k8s/core-bank-service/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: core-bank-service-deployment
spec:
  replicas: 3
  revisionHistoryLimit: 5  # 保留5个历史版本
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
      - name: core-bank-service
        image: digitalbank/core-bank-service:v1.0.0
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
          failureThreshold: 3
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          failureThreshold: 3
```

### 回滚脚本

```bash
#!/bin/bash
# scripts/rollback.sh

SERVICE=$1
REVISION=$2

if [ -z "$SERVICE" ]; then
  echo "Usage: $0 <service-name> [revision]"
  exit 1
fi

echo "Rolling back $SERVICE..."

if [ -z "$REVISION" ]; then
  # 回滚到上一个版本
  kubectl rollout undo deployment/${SERVICE}-deployment
else
  # 回滚到指定版本
  kubectl rollout undo deployment/${SERVICE}-deployment --to-revision=$REVISION
fi

# 等待回滚完成
kubectl rollout status deployment/${SERVICE}-deployment --timeout=300s

# 验证回滚状态
CURRENT_IMAGE=$(kubectl get deployment ${SERVICE}-deployment -o jsonpath='{.spec.template.spec.containers[0].image}')
echo "Rollback completed. Current image: $CURRENT_IMAGE"
```

### 查看部署历史

```bash
# 查看部署历史
kubectl rollout history deployment/core-bank-service-deployment

# 查看特定版本详情
kubectl rollout history deployment/core-bank-service-deployment --revision=2
```

---

## 告警规则模板

### Prometheus告警规则

```yaml
# monitoring/prometheus/alerts/service-alerts.yml
groups:
  - name: service-alerts
    rules:
      # 服务不可用告警
      - alert: ServiceDown
        expr: up{job=~"core-bank-service|payment-service|risk-service"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "服务 {{ $labels.job }} 不可用"
          description: "服务 {{ $labels.job }} 已停止响应超过1分钟"

      # 高错误率告警
      - alert: HighErrorRate
        expr: |
          sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) by (job)
          /
          sum(rate(http_server_requests_seconds_count[5m])) by (job)
          > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "服务 {{ $labels.job }} 错误率过高"
          description: "服务 {{ $labels.job }} 5xx错误率超过5%"

      # 响应时间过长告警
      - alert: HighResponseTime
        expr: |
          histogram_quantile(0.95,
            sum(rate(http_server_requests_seconds_bucket[5m])) by (le, job)
          ) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "服务 {{ $labels.job }} 响应时间过长"
          description: "服务 {{ $labels.job }} P95响应时间超过2秒"

      # CPU使用率过高
      - alert: HighCpuUsage
        expr: |
          sum(rate(container_cpu_usage_seconds_total[5m])) by (pod)
          /
          sum(container_spec_cpu_quota/container_spec_cpu_period) by (pod)
          > 0.8
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Pod {{ $labels.pod }} CPU使用率过高"
          description: "Pod {{ $labels.pod }} CPU使用率超过80%"

      # 内存使用率过高
      - alert: HighMemoryUsage
        expr: |
          sum(container_memory_usage_bytes) by (pod)
          /
          sum(container_spec_memory_limit_bytes) by (pod)
          > 0.85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Pod {{ $labels.pod }} 内存使用率过高"
          description: "Pod {{ $labels.pod }} 内存使用率超过85%"

      # 磁盘空间不足
      - alert: LowDiskSpace
        expr: |
          (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) < 0.15
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "节点 {{ $labels.instance }} 磁盘空间不足"
          description: "节点根分区剩余空间不足15%"
```

### AlertManager配置

```yaml
# monitoring/alertmanager/alertmanager.yml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'job']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
      group_wait: 10s
    - match:
        severity: warning
      receiver: 'warning-alerts'

receivers:
  - name: 'default'
    webhook_configs:
      - url: 'http://alertmanager-webhook:9090/alert'

  - name: 'critical-alerts'
    webhook_configs:
      - url: 'http://alertmanager-webhook:9090/critical'
    # email_configs:
    #   - to: 'ops-team@digitalbank.com'

  - name: 'warning-alerts'
    webhook_configs:
      - url: 'http://alertmanager-webhook:9090/warning'
```

---

## 日志聚合配置

### Fluentd配置

```yaml
# monitoring/fluentd/fluentd-config.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag kubernetes.*
      read_from_head true
      <parse>
        @type json
        time_key timestamp
        time_format %Y-%m-%dT%H:%M:%S.%NZ
      </parse>
    </source>

    <filter kubernetes.**>
      @type kubernetes_metadata
    </filter>

    <filter kubernetes.**>
      @type parser
      key_name log
      reserve_data true
      <parse>
        @type json
      </parse>
    </filter>

    <match kubernetes.**>
      @type elasticsearch
      host elasticsearch.logging.svc.cluster.local
      port 9200
      logstash_format true
      logstash_prefix k8s-logs
      include_tag_key true
      flush_interval 5s
    </match>
```

### Elasticsearch索引模板

```json
{
  "index_patterns": ["k8s-logs-*"],
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "index.lifecycle.name": "k8s-logs-policy"
  },
  "mappings": {
    "properties": {
      "timestamp": { "type": "date" },
      "level": { "type": "keyword" },
      "service": { "type": "keyword" },
      "traceId": { "type": "keyword" },
      "message": { "type": "text" },
      "context": { "type": "object" }
    }
  }
}
```

---

## Grafana仪表板

### 服务概览仪表板

```json
{
  "dashboard": {
    "title": "Digital Bank Services Overview",
    "panels": [
      {
        "title": "服务健康状态",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=~\"core-bank-service|payment-service|risk-service\"}"
          }
        ]
      },
      {
        "title": "请求速率 (QPS)",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_server_requests_seconds_count[1m])) by (job)"
          }
        ]
      },
      {
        "title": "响应时间 P95",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket[5m])) by (le, job))"
          }
        ]
      },
      {
        "title": "错误率",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_server_requests_seconds_count{status=~\"5..\"}[5m])) by (job) / sum(rate(http_server_requests_seconds_count[5m])) by (job) * 100"
          }
        ]
      }
    ]
  }
}
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
