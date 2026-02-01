# 数字银行POC系统 - 基础设施配置

本文档描述数字银行POC系统的基础设施配置，包括Kubernetes集群、Nginx反向代理、Consul服务注册中心和Kong API Gateway。

> 📖 **从零开始部署？** 
> - **Windows用户**: 请查看 [WINDOWS-DEPLOYMENT-GUIDE.md](./WINDOWS-DEPLOYMENT-GUIDE.md) 获取Windows专用部署指南
> - **Linux/macOS用户**: 请查看 [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) 获取通用部署指南
> - **快速部署**: 已有Kubernetes环境？查看 [QUICK-START.md](./QUICK-START.md)

## 📁 目录结构

```
infrastructure/
├── terraform/              # Terraform基础设施即代码
│   └── main.tf            # 主配置文件
├── k8s/                   # Kubernetes配置
│   └── base/              # 基础K8s资源
│       ├── namespace.yaml
│       ├── kustomization.yaml
│       ├── consul/        # Consul配置
│       │   ├── deployment.yaml
│       │   ├── service.yaml
│       │   └── configmap.yaml
│       ├── kong/          # Kong API Gateway配置
│       │   ├── deployment.yaml
│       │   ├── service.yaml
│       │   └── configmap.yaml
│       └── nginx/         # Nginx反向代理配置
│           ├── deployment.yaml
│           ├── service.yaml
│           └── configmap.yaml
├── nginx/                 # Nginx配置文件
│   └── nginx.conf
├── kong/                  # Kong API Gateway配置
│   └── kong.yml
├── consul/                # Consul配置
│   └── consul-config.json
├── dev-environment-setup.sh    # Dev环境部署脚本
├── dev-environment-verify.sh  # Dev环境验证脚本
└── README.md              # 本文档
```

## 🚀 快速开始

### 前置要求

1. **Kubernetes集群**: 已配置并可访问的Kubernetes集群（本地或远程）
2. **kubectl**: 已安装并配置好kubeconfig
3. **Terraform** (可选): 如需使用Terraform部署，需要安装Terraform >= 1.5.0

### 方式1: 使用Kubernetes原生方式部署（推荐）

```bash
# 1. 创建命名空间
kubectl apply -f k8s/base/namespace.yaml

# 2. 部署Consul服务注册中心
kubectl apply -f k8s/base/consul/

# 3. 部署Kong API Gateway
kubectl apply -f k8s/base/kong/

# 4. 部署Nginx反向代理
kubectl apply -f k8s/base/nginx/

# 5. 验证部署
kubectl get pods -n digital-bank-poc
kubectl get svc -n digital-bank-poc
```

### 方式2: 使用自动化脚本部署

```bash
# 赋予执行权限
chmod +x dev-environment-setup.sh

# 执行部署脚本
./dev-environment-setup.sh

# 验证部署
chmod +x dev-environment-verify.sh
./dev-environment-verify.sh
```

### 方式3: 使用Terraform部署

```bash
cd terraform

# 初始化Terraform
terraform init

# 预览变更
terraform plan

# 应用配置
terraform apply

# 查看输出
terraform output
```

## 📋 组件说明

### 1. Kubernetes集群配置

#### 命名空间
- **名称**: `digital-bank-poc`
- **用途**: 隔离所有POC系统资源

#### 基础资源
- Namespace: 项目命名空间
- ConfigMaps: 配置管理
- Deployments: 应用部署
- Services: 服务暴露

### 2. Consul服务注册中心

**功能**:
- 服务注册与发现
- 健康检查
- 配置管理
- 服务网格（Connect）

**配置**:
- **镜像**: `consul:1.17.0`
- **HTTP端口**: 8500
- **DNS端口**: 8600
- **UI**: 已启用

**访问方式**:
```bash
# 端口转发
kubectl port-forward -n digital-bank-poc svc/consul-server 8500:8500

# 访问UI
open http://localhost:8500
```

**服务注册**:
- core-bank-service (8080)
- payment-service (3000)
- risk-service (8000)
- kong-gateway (8000)
- nginx (80)

### 3. Kong API Gateway

**功能**:
- 统一API入口
- 路由规则管理
- 限流控制
- CORS配置
- 请求追踪

**配置**:
- **镜像**: `kong:3.4`
- **代理端口**: 8000
- **管理端口**: 8001
- **配置模式**: 声明式配置（DB-less模式）

**路由规则**:
- `/api/v1/accounts` -> core-bank-service
- `/api/v1/customers` -> core-bank-service
- `/api/v1/transactions` -> core-bank-service
- `/api/v1/payments` -> payment-service
- `/api/v1/settlements` -> payment-service
- `/api/v1/risk/check` -> risk-service
- `/api/v1/risk/rules` -> risk-service
- `/api/v1/risk/blacklist` -> risk-service

**限流规则**:
- 账户API: 100次/分钟, 1000次/小时
- 支付API: 50次/分钟, 500次/小时
- 风控API: 200次/分钟, 2000次/小时

**访问方式**:
```bash
# 端口转发
kubectl port-forward -n digital-bank-poc svc/kong 8000:8000 8001:8001

# 访问管理API
curl http://localhost:8001/status

# 访问代理
curl http://localhost:8000/api/v1/health
```

### 4. Nginx反向代理

**功能**:
- 反向代理
- 负载均衡
- SSL终止（待配置）
- 健康检查

**配置**:
- **镜像**: `nginx:1.25-alpine`
- **HTTP端口**: 80
- **HTTPS端口**: 443（待配置）
- **副本数**: 2（高可用）

**代理规则**:
- `/api/*` -> Kong API Gateway
- `/consul/*` -> Consul UI
- `/core-bank/*` -> 核心银行服务（开发环境直连）
- `/payment/*` -> 支付服务（开发环境直连）
- `/risk/*` -> 风控服务（开发环境直连）

**负载均衡策略**:
- 算法: `least_conn` (最少连接)
- 健康检查: 自动故障转移
- 连接保持: keepalive 32

**访问方式**:
```bash
# 端口转发
kubectl port-forward -n digital-bank-poc svc/nginx 8080:80

# 健康检查
curl http://localhost:8080/health

# 通过Nginx访问API
curl http://localhost:8080/api/v1/health
```

## 🔧 配置管理

### 环境变量

所有敏感信息应通过Kubernetes Secrets管理：

```bash
# 创建Secret示例
kubectl create secret generic app-secrets \
  --from-literal=db-password=xxx \
  --from-literal=api-key=xxx \
  -n digital-bank-poc
```

### 配置更新

#### 更新Kong配置
```bash
# 1. 修改 kong/kong.yml
# 2. 更新ConfigMap
kubectl create configmap kong-config \
  --from-file=kong.yml=../kong/kong.yml \
  -n digital-bank-poc --dry-run=client -o yaml | kubectl apply -f -

# 3. 重启Kong Pod
kubectl rollout restart deployment/kong -n digital-bank-poc
```

#### 更新Nginx配置
```bash
# 1. 修改 nginx/nginx.conf
# 2. 更新ConfigMap
kubectl create configmap nginx-config \
  --from-file=nginx.conf=../nginx/nginx.conf \
  -n digital-bank-poc --dry-run=client -o yaml | kubectl apply -f -

# 3. 重启Nginx Pod
kubectl rollout restart deployment/nginx -n digital-bank-poc
```

## 🧪 验证和测试

### 健康检查

```bash
# Consul健康检查
kubectl exec -n digital-bank-poc <consul-pod> -- consul members

# Kong健康检查
curl http://<kong-service-ip>:8001/status

# Nginx健康检查
curl http://<nginx-service-ip>:80/health
```

### 服务连通性测试

```bash
# 从Nginx测试Kong
kubectl exec -n digital-bank-poc <nginx-pod> -- \
  wget -q -O- http://kong.digital-bank-poc.svc.cluster.local:8001/status

# 从Nginx测试Consul
kubectl exec -n digital-bank-poc <nginx-pod> -- \
  wget -q -O- http://consul-server.digital-bank-poc.svc.cluster.local:8500/v1/status/leader
```

### 使用验证脚本

```bash
# 运行完整验证
./dev-environment-verify.sh
```

## 📊 监控和日志

### 查看Pod日志

```bash
# Consul日志
kubectl logs -n digital-bank-poc -l app=consul -f

# Kong日志
kubectl logs -n digital-bank-poc -l app=kong -f

# Nginx日志
kubectl logs -n digital-bank-poc -l app=nginx -f
```

### 查看资源状态

```bash
# Pod状态
kubectl get pods -n digital-bank-poc -o wide

# Service状态
kubectl get svc -n digital-bank-poc

# ConfigMap
kubectl get configmap -n digital-bank-poc

# 资源使用情况
kubectl top pods -n digital-bank-poc
```

## 🔒 安全配置

### 当前配置（开发环境）

- ACL: 已禁用（开发环境）
- SSL/TLS: 待配置
- 认证: JWT插件已准备（待启用）

### 生产环境建议

1. **启用Consul ACL**
2. **配置SSL/TLS证书**
3. **启用Kong JWT认证**
4. **配置网络策略（NetworkPolicy）**
5. **使用Secrets管理敏感信息**

## 🐛 故障排查

### 常见问题

#### 1. Pod无法启动

```bash
# 查看Pod事件
kubectl describe pod <pod-name> -n digital-bank-poc

# 查看Pod日志
kubectl logs <pod-name> -n digital-bank-poc
```

#### 2. 服务无法访问

```bash
# 检查Service端点
kubectl get endpoints -n digital-bank-poc

# 检查DNS解析
kubectl run -it --rm debug --image=busybox --restart=Never -- \
  nslookup consul-server.digital-bank-poc.svc.cluster.local
```

#### 3. 配置不生效

```bash
# 检查ConfigMap内容
kubectl get configmap <configmap-name> -n digital-bank-poc -o yaml

# 重启相关Pod
kubectl rollout restart deployment/<deployment-name> -n digital-bank-poc
```

## 📝 下一步

1. **部署应用服务**: 等待Agent 1、2、3部署核心服务
2. **配置服务路由**: 更新Kong路由规则
3. **配置监控**: 集成Prometheus和Grafana
4. **配置SSL**: 申请和配置SSL证书
5. **性能优化**: 根据实际负载调整资源配置

## 📚 相关文档

- [Kubernetes官方文档](https://kubernetes.io/docs/)
- [Kong文档](https://docs.konghq.com/)
- [Consul文档](https://www.consul.io/docs)
- [Nginx文档](https://nginx.org/en/docs/)
- [Terraform文档](https://www.terraform.io/docs)

## 👥 维护者

- **Agent 5**: 应用基础设施层
- **Agent 8**: 运维自动化引擎（协作）

---

**版本**: v1.0.0  
**创建日期**: 2026-01-26  
**最后更新**: 2026-01-26
