# 部署问题修复指南

## 🔴 发现的问题

根据诊断输出，发现以下三个关键问题：

### 问题1: Consul镜像拉取失败 ❌

**错误**: `consul:1.17.0: not found`

**原因**: 
- Consul官方镜像已迁移到 `hashicorp/consul`
- 版本 `1.17.0` 可能不存在或已过时

**修复**: 已更新为 `hashicorp/consul:1.22.2`

### 问题2: Nginx配置错误 ❌

**错误**: `host not found in upstream "core-bank-service.digital-bank-poc.svc.cluster.local:8080"`

**原因**: 
- Nginx在启动时尝试解析upstream中的服务地址
- 这些服务（core-bank-service, payment-service, risk-service）还未部署
- Nginx无法在启动时解析不存在的服务

**修复**: 
- 已添加DNS解析器配置
- 已注释掉未部署服务的upstream和location配置
- 等Agent 1-3部署服务后再启用

### 问题3: Kong健康检查失败 ⚠️

**错误**: Readiness/Liveness probe失败，导致Pod不断重启

**可能原因**:
- Kong启动时间较长，健康检查超时
- 配置文件问题
- 资源不足

## ✅ 修复步骤

### 步骤1: 应用修复后的配置

```bash
# 进入项目目录
cd "d:\iCloudDrive\Documents\深度架构\POC testbank\infrastructure"

# 重新应用Consul配置（使用新镜像）
kubectl apply -f k8s\base\consul\deployment.yaml

# 重新应用Nginx配置（修复配置错误）
kubectl apply -f k8s\base\nginx\configmap.yaml

# 删除并重新创建Nginx Pod以应用新配置
kubectl delete pod -n digital-bank-poc -l app=nginx
```

### 步骤2: 等待Pod就绪

```bash
# 等待Consul Pod就绪
kubectl wait --for=condition=ready pod -n digital-bank-poc -l app=consul --timeout=300s

# 等待Nginx Pod就绪
kubectl wait --for=condition=ready pod -n digital-bank-poc -l app=nginx --timeout=300s

# 检查Kong Pod状态
kubectl get pods -n digital-bank-poc -l app=kong
```

### 步骤3: 验证修复

```bash
# 运行诊断脚本
./quick-diagnose.sh

# 或运行验证脚本
./dev-environment-verify.sh
```

## 🔧 详细修复说明

### Consul镜像修复

**修改文件**: `k8s/base/consul/deployment.yaml`

**修改内容**:
```yaml
# 修改前
image: consul:1.17.0

# 修改后
image: hashicorp/consul:1.22.2
```

**原因**: 
- HashiCorp官方镜像已迁移到 `hashicorp/consul`
- 使用最新稳定版本 `1.22.2`

### Nginx配置修复

**修改文件**: `k8s/base/nginx/configmap.yaml`

**修改内容**:
1. **添加DNS解析器**:
   ```nginx
   resolver kube-dns.kube-system.svc.cluster.local valid=10s;
   ```

2. **在upstream中使用resolve参数**:
   ```nginx
   server kong.digital-bank-poc.svc.cluster.local:8000 resolve;
   ```

3. **注释掉未部署服务的配置**:
   - `core_bank_service` upstream
   - `payment_service` upstream
   - `risk_service` upstream
   - 对应的location配置

**原因**: 
- Nginx在启动时解析upstream，如果服务不存在会导致启动失败
- 使用`resolve`参数可以延迟DNS解析到运行时
- 暂时注释未部署的服务，等Agent 1-3部署后再启用

### Kong问题排查

如果Kong仍然有问题，执行以下步骤：

```bash
# 1. 查看Kong详细日志
kubectl logs -n digital-bank-poc -l app=kong --tail=100

# 2. 检查Kong配置
kubectl get configmap -n digital-bank-poc kong-config -o yaml

# 3. 测试Kong Admin API（端口转发）
kubectl port-forward -n digital-bank-poc svc/kong 8001:8001

# 4. 在另一个终端测试
curl http://localhost:8001/status

# 5. 如果Kong配置有问题，可能需要调整健康检查超时
# 编辑 k8s/base/kong/deployment.yaml
# 增加 initialDelaySeconds 和 timeoutSeconds
```

## 📋 修复后验证清单

- [ ] Consul Pod状态为Running
- [ ] Nginx Pod状态为Running
- [ ] Kong Pod状态为Running（或至少不频繁重启）
- [ ] 所有Service正常
- [ ] 可以访问Consul UI（端口转发）
- [ ] 可以访问Kong Admin API（端口转发）
- [ ] Nginx健康检查通过

## 🎯 下一步

修复完成后：

1. **验证基础设施**:
   ```bash
   ./dev-environment-verify.sh
   ```

2. **等待Agent 1-3部署服务后**:
   - 取消注释Nginx配置中的服务upstream
   - 取消注释对应的location配置
   - 重新应用Nginx ConfigMap

3. **继续Day 1任务**:
   - 基础设施已就绪
   - 可以开始配置服务路由

## 📚 相关文档

- [TROUBLESHOOTING-DEPLOYMENT.md](./TROUBLESHOOTING-DEPLOYMENT.md) - 详细故障排查
- [quick-diagnose.sh](./quick-diagnose.sh) - 快速诊断脚本

---

**提示**: 修复后如果问题仍然存在，请查看Pod日志获取更详细的错误信息。
