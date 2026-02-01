# 云资源与云服务清单

**版本**: v1.0.0  
**发布日期**: 2026-01-26  
**维护者**: Agent 0 (架构管控中枢)

---

## 1. 概述

### 1.1 文档目的

本清单统一列出数字银行 POC 系统运行所需的**云资源**与**云服务**，用于：

- 采购与预算估算
- 上云方案设计（AWS / GCP / Azure）
- 环境准备与资源申请
- 自建 vs 托管的选型参考

### 1.2 适用环境

| 环境 | 说明 | 清单侧重 |
|------|------|----------|
| **POC** | 14 天演示、开发与联调 | 最小可用集，单节点/低配 |
| **生产** | 正式对外服务 | 高可用、扩容、备份与合规 |

### 1.3 部署形态

- **自建**: 在 VM 或 Kubernetes 上自部署（如 PostgreSQL、MongoDB、Redis、Kong、Consul 等）。
- **托管**: 使用云厂商托管服务（如 RDS、DocumentDB、ElastiCache、EKS 等），降低运维负担。

清单中均注明**自建** / **托管**及**可选**替代方案。

---

## 2. 计算与容器

| 资源/服务 | 用途 | 所属 Agent | 形态 | 参考规格 | 备注 |
|-----------|------|------------|------|----------|------|
| **Kubernetes 集群** | 容器编排，部署所有微服务与基础设施 | Agent 5, 8 | 自建或托管 | 见下表 | 必选 |
| **容器镜像仓库** | 存储 Docker 镜像，CI 推送、K8s 拉取 | Agent 8 | 自建或托管 | - | 必选 |
| **Docker / 容器运行时** | 构建与运行容器 | Agent 8 | 自建 | - | 必选 |

### 2.1 Kubernetes 集群规格参考

| 环境 | 节点数 | CPU/节点 | 内存/节点 | 存储/节点 | 说明 |
|------|--------|----------|-----------|-----------|------|
| **POC 最小** | 1 | 2 核 | 4 GB | 20 GB | 本地 Minikube / kind / Docker Desktop K8s |
| **POC 推荐** | 2 | 2 核 | 4 GB | 30 GB | 云托管 K8s 单可用区 |
| **生产** | 3+ | 4 核+ | 8 GB+ | 50 GB+ | 多可用区，按负载扩容 |

**云托管 K8s 示例**（见 [DEPLOYMENT-GUIDE](../infrastructure/DEPLOYMENT-GUIDE.md)）：

- **AWS EKS**: `t3.medium`，2 节点
- **GCP GKE**: `e2-medium` 或同级，2 节点
- **Azure AKS**: `Standard_B2s` 或同级，2 节点

### 2.2 容器镜像仓库

| 方案 | 说明 | 典型产品 |
|------|------|----------|
| 自建 | 部署在 K8s 或 VM 的私有 Registry | Docker Registry, Harbor |
| 托管 | 云厂商托管 | AWS ECR, GCP GCR, Azure ACR |

---

## 3. 数据库

| 资源/服务 | 用途 | 所属 Agent | 形态 | 版本/规格 | 备注 |
|-----------|------|------------|------|-----------|------|
| **PostgreSQL** | 核心银行账户、交易、客户；数据模型与迁移 | Agent 1, 9 | 自建或托管 | 15 | 必选 |
| **MongoDB** | 支付、清算数据；数据模型 | Agent 2, 9 | 自建或托管 | 7.0 | 必选 |

### 3.1 云托管数据库可选方案

| 数据库 | 自建 | AWS | GCP | Azure |
|--------|------|-----|-----|-------|
| PostgreSQL | K8s StatefulSet / VM | RDS for PostgreSQL | Cloud SQL (PostgreSQL) | Azure Database for PostgreSQL |
| MongoDB | K8s StatefulSet / VM | DocumentDB 或 Atlas | Atlas / 自建 | Cosmos DB (MongoDB API) 或 Atlas |

### 3.2 规格建议（POC）

- **PostgreSQL**: 1 实例，2 vCPU，4 GB 内存，20 GB 存储。
- **MongoDB**: 1 副本集或单节点，2 vCPU，4 GB 内存，20 GB 存储。

---

## 4. 缓存

| 资源/服务 | 用途 | 所属 Agent | 形态 | 备注 |
|-----------|------|------------|------|------|
| **Redis** | 会话、热点数据、缓存；Bull 队列后端（支付异步任务） | Agent 9, 2 | 自建或托管 | 必选 |

**Key 规范**: 见 [技术标准 v1.0 - 缓存规范](technical-standards-v1.0.md#缓存规范)。

### 4.1 云托管 Redis 可选

| 自建 | AWS | GCP | Azure |
|------|-----|-----|-------|
| K8s 部署 Redis | ElastiCache for Redis | Memorystore for Redis | Azure Cache for Redis |

**POC 规格**: 1 节点，1 GB 内存。

---

## 5. 搜索与日志

| 资源/服务 | 用途 | 所属 Agent | 形态 | 版本 | 备注 |
|-----------|------|------------|------|------|------|
| **Elasticsearch** | 风控日志、事件检索、交易日志 | Agent 3, 9 | 自建或托管 | 8.x | 必选 |

### 5.1 云托管可选

| 自建 | AWS | GCP | Azure |
|------|-----|-----|-------|
| K8s 部署 ES | OpenSearch / Elastic Cloud | Elastic Cloud | Elastic Cloud / 自建 |

**POC 规格**: 单节点，2 vCPU，4 GB 内存，20 GB 存储。

---

## 6. 网络、网关与发现

| 资源/服务 | 用途 | 所属 Agent | 形态 | 备注 |
|-----------|------|------------|------|------|
| **Kong** | API 网关、路由、限流、认证 | Agent 5 | 自建 | 必选 |
| **Consul** | 服务注册与发现、健康检查 | Agent 5 | 自建 | 必选 |
| **Nginx** | 反向代理、负载均衡 | Agent 5 | 自建 | 必选 |
| **负载均衡** | 入口流量分发 | - | 云厂商 LB 或自建 | 选型依赖部署方式 |
| **VPC / 子网** | 网络隔离 | - | 云厂商 | 上云时必选 |
| **域名与 TLS 证书** | 对外 HTTPS | - | 自备或云厂商 | 生产必选 |

Kong、Consul、Nginx 均部署于 Kubernetes，详见 [DEPLOYMENT-GUIDE](../infrastructure/DEPLOYMENT-GUIDE.md) 与 Agent 5 产出。

---

## 7. CI/CD 与构建

| 资源/服务 | 用途 | 所属 Agent | 形态 | 备注 |
|-----------|------|------------|------|------|
| **GitLab CI** | 流水线、构建、测试、部署 | Agent 8 | 自建或 SaaS | 必选 |
| **GitLab Runner** | 执行 CI 任务 | Agent 8 | 自建或云上 VM | 必选 |
| **Docker 构建** | 构建镜像并推送仓库 | Agent 8 | 自建 | 必选 |

### 7.1 选型

- **GitLab**: 自建（K8s / VM）或 GitLab.com。
- **Runner**: 项目自有 Runner（K8s / VM）或 GitLab 共享 Runner；上云时可使用云上 VM 作为 Runner。

---

## 8. 监控与可观测

| 资源/服务 | 用途 | 所属 Agent | 形态 | 备注 |
|-----------|------|------------|------|------|
| **Prometheus** | 指标采集、存储、告警规则 | Agent 8 | 自建 | 必选 |
| **Grafana** | 仪表盘、可视化 | Agent 8 | 自建 | 必选 |
| **日志存储** | 集中式日志（可选） | - | 自建或托管 | ELK / Loki / 云日志 |

**POC**: Prometheus + Grafana 部署于 K8s；生产可考虑托管 Prometheus、Grafana Cloud 或云厂商监控。

---

## 9. 安全与合规

| 资源/服务 | 用途 | 所属 Agent | 形态 | 备注 |
|-----------|------|------------|------|------|
| **HashiCorp Vault** | 密钥、凭证管理 | Agent 7 | 自建或托管 | 必选 |
| **SonarQube** | 代码质量与安全扫描 | Agent 7 | 自建或 SaaS | 必选 |
| **OWASP ZAP** | API 安全扫描 | Agent 7 | 自建 | 必选 |
| **Snyk / Dependabot** | 依赖漏洞扫描 | Agent 7 | SaaS 或自建 | 推荐 |

### 9.1 云托管可选

- **密钥管理**: 云厂商 Secrets Manager / KMS 可替代或配合 Vault。
- **WAF**: 生产可选云 WAF（如 AWS WAF、Cloud Armor、Azure WAF）。

---

## 10. 存储与备份

| 资源/服务 | 用途 | 形态 | 备注 |
|-----------|------|------|------|
| **对象存储** | 数据库备份、构建制品、日志归档 | 托管 | 见下表 |
| **块存储 / 云盘** | 数据库、Elasticsearch 等持久化 | 托管 | 随 RDS/VM/K8s 配置 |

### 10.1 对象存储

| 自建 | AWS | GCP | Azure |
|------|-----|-----|-------|
| MinIO / Ceph | S3 | Cloud Storage | Blob Storage |

### 10.2 备份策略（参考 [技术标准 - 备份与恢复](technical-standards-v1.0.md#备份和恢复规范)）

| 类型 | 频率 | 保留 | 存储 |
|------|------|------|------|
| 全量备份 | 每日 | 30 天 | 本地 + 远程对象存储 |
| 增量备份 | 每小时 | 7 天 | 远程对象存储 |
| 事务日志 | 实时 | 7 天 | 远程存储 |

---

## 11. 消息队列（可选）

| 资源/服务 | 用途 | 所属 Agent | 形态 | 备注 |
|-----------|------|------------|------|------|
| **Redis** | Bull 队列后端（支付回调、异步任务） | Agent 2 | 自建或托管 | 已列于 §4 |
| **Kafka / RabbitMQ 等** | 通用 MQ（若引入） | - | 自建或托管 | 可选 |

技术标准中 [消息队列规范](technical-standards-v1.0.md#消息队列规范) 定义 Topic/Queue 命名与消息格式；当前 POC 以 Redis + Bull 为主。

### 11.1 云托管 MQ 可选

| 自建 | AWS | GCP | Azure |
|------|-----|-----|-------|
| K8s 部署 Kafka/RabbitMQ | MSK / SQS | Pub/Sub / 自建 | Event Hubs / 自建 |

---

## 12. 按云厂商的映射表

| 资源类型 | 自建方案 | AWS | GCP | Azure |
|----------|----------|-----|-----|-------|
| **Kubernetes** | Minikube / kind / K8s on VM | EKS | GKE | AKS |
| **镜像仓库** | Docker Registry / Harbor | ECR | GCR / Artifact Registry | ACR |
| **PostgreSQL** | K8s / VM | RDS (PostgreSQL) | Cloud SQL | Azure DB for PostgreSQL |
| **MongoDB** | K8s / VM | DocumentDB / Atlas | Atlas | Cosmos DB (MongoAPI) / Atlas |
| **Redis** | K8s / VM | ElastiCache | Memorystore | Azure Cache for Redis |
| **Elasticsearch** | K8s / VM | OpenSearch / Elastic | Elastic Cloud | Elastic Cloud |
| **对象存储** | MinIO / Ceph | S3 | Cloud Storage | Blob Storage |
| **密钥管理** | Vault | Secrets Manager | Secret Manager | Key Vault |
| **负载均衡** | Nginx / HAProxy | ALB/NLB | Load Balancing | Load Balancer |

Kong、Consul、Prometheus、Grafana、GitLab、SonarQube、Vault 等以自建为主；云上通常部署于 EKS/GKE/AKS 或 VM。

---

## 13. POC 与生产规模估算

### 13.1 POC 最小集（14 天演示）

| 资源/服务 | 数量 | 参考规格 | 备注 |
|-----------|------|----------|------|
| Kubernetes 集群 | 1 | 1 节点，2 核 4 GB 20 GB | 本地或单节点云 K8s |
| PostgreSQL | 1 | 2 vCPU 4 GB 20 GB | 单实例 |
| MongoDB | 1 | 2 vCPU 4 GB 20 GB | 单节点/副本集 |
| Redis | 1 | 1 GB 内存 | 单节点 |
| Elasticsearch | 1 | 2 vCPU 4 GB 20 GB | 单节点 |
| Kong | 1 副本 | 部署于 K8s | - |
| Consul | 1 副本 | 单节点模式 | - |
| Nginx | 1 副本 | 部署于 K8s | - |
| Prometheus | 1 | 部署于 K8s | - |
| Grafana | 1 | 部署于 K8s | - |
| Vault | 1 | 部署于 K8s / VM | Dev 模式可接受 |
| GitLab + Runner | 1 | 自建或 GitLab.com | - |
| 镜像仓库 | 1 | 自建或 ECR/GCR/ACR | - |
| 对象存储 | 1 bucket | 可选，备份用 | - |

**POC 云费用测算**：按上述最小集、按量计费 14 天，华为云 / 阿里云 / 腾讯云费用测算见 [POC 云费用测算（华为云、阿里云、腾讯云）](poc-cloud-cost-estimate.md)。

### 13.2 生产扩展说明

- **Kubernetes**: 多节点、多可用区；按负载 HPA；节点规格提升。
- **数据库**: 主从/副本集、跨 AZ；独立备份与 PITR。
- **Redis**: 集群模式；持久化与备份。
- **Elasticsearch**: 多节点集群；专用主节点与数据节点。
- **Kong / Consul**: 多副本；Consul 集群模式。
- **Prometheus / Grafana**: 高可用与长期存储（如 Thanos、Cortex）。
- **Vault**: 生产模式、HA 集群；与 KMS 集成。
- **CI/CD**: 专用 Runner 池；多环境流水线。

具体规格需按容量规划与压测结果调整。

---

## 附录：相关文档

- [技术标准规范 v1.0](technical-standards-v1.0.md) — 性能、缓存、备份、消息队列等
- [POC 云费用测算（华为云、阿里云、腾讯云）](poc-cloud-cost-estimate.md) — POC 最小集按量计费 14 天测算
- [ADR-001: 技术栈选择](../adr/ADR-001-技术栈选择.md)
- [ADR-002: 微服务拆分策略](../adr/ADR-002-微服务拆分策略.md)
- [执行步骤指南](../../execution-guide.md)
- [部署指南](../../infrastructure/DEPLOYMENT-GUIDE.md)
- [环境准备检查清单](../../environment-setup-checklist.md)

---

**文档维护**: Agent 0 (架构管控中枢)  
**生效日期**: 2026-01-26
