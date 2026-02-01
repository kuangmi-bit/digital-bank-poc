# 部署问题排查指南

## 🔴 当前问题

根据验证脚本的输出，发现以下问题：

1. ❌ **Consul Pod未就绪**
2. ⚠️ **Kong Admin API暂不可访问**
3. ⚠️ **Kong配置检查失败**
4. ❌ **Nginx配置无效** - 容器未找到

## 🔍 诊断步骤

### 步骤1: 检查所有Pod状态

```powershell
# 查看所有Pod状态
kubectl get pods -n digital-bank-poc

# 查看详细状态
kubectl get pods -n digital-bank-poc -o wide

# 查看Pod事件
kubectl describe pods -n digital-bank-poc
```

### 步骤2: 检查Pod日志

```powershell
# 查看Consul日志
kubectl logs -n digital-bank-poc -l app=consul --tail=50

# 查看Kong日志
kubectl logs -n digital-bank-poc -l app=kong --tail=50

# 查看Nginx日志
kubectl logs -n digital-bank-poc -l app=nginx --tail=50
```

### 步骤3: 检查Service状态

```powershell
# 查看所有Service
kubectl get svc -n digital-bank-poc

# 查看Service详情
kubectl describe svc -n digital-bank-poc
```

## 🛠️ 常见问题解决方案

### 问题1: Consul Pod未就绪

**可能原因**:
1. Pod正在启动中（需要等待）
2. 镜像拉取失败
3. 配置错误
4. 资源不足

**解决方案**:

```powershell
# 1. 检查Pod状态
kubectl get pods -n digital-bank-poc -l app=consul

# 2. 查看Pod详情和事件
kubectl describe pod -n digital-bank-poc -l app=consul

# 3. 查看Pod日志
kubectl logs -n digital-bank-poc -l app=consul --tail=100

# 4. 如果Pod状态是ImagePullBackOff或ErrImagePull
# 检查镜像是否存在
docker pull consul:1.17.0

# 5. 如果Pod状态是CrashLoopBackOff
# 查看日志找出崩溃原因
kubectl logs -n digital-bank-poc -l app=consul --previous

# 6. 如果Pod状态是Pending
# 检查资源限制
kubectl describe pod -n digital-bank-poc -l app=consul | grep -A 5 "Limits\|Requests"
```

**等待Pod就绪**:
```powershell
# 等待Consul Pod就绪（最多5分钟）
kubectl wait --for=condition=ready pod -n digital-bank-poc -l app=consul --timeout=300s
```

### 问题2: Kong Admin API不可访问

**可能原因**:
1. Kong Pod未完全启动
2. Admin API端口未正确暴露
3. 服务配置错误

**解决方案**:

```powershell
# 1. 检查Kong Pod状态
kubectl get pods -n digital-bank-poc -l app=kong

# 2. 检查Kong Service
kubectl get svc -n digital-bank-poc kong

# 3. 端口转发测试Admin API
kubectl port-forward -n digital-bank-poc svc/kong 8001:8001

# 4. 在另一个终端测试
curl http://localhost:8001/status

# 5. 如果端口转发成功，说明Kong正常，问题在Service配置
```

**修复Kong Service配置**:
```powershell
# 检查Service配置
kubectl get svc -n digital-bank-poc kong -o yaml

# 确保Admin API端口8001已暴露
```

### 问题3: Nginx容器未找到

**错误信息**: `container not found ("nginx")`

**可能原因**:
1. 容器名称不匹配
2. Pod未运行
3. 容器已崩溃

**解决方案**:

```powershell
# 1. 检查Nginx Pod状态
kubectl get pods -n digital-bank-poc -l app=nginx

# 2. 查看Pod详情，确认容器名称
kubectl describe pod -n digital-bank-poc -l app=nginx | grep -A 10 "Containers"

# 3. 查看Nginx Pod日志
kubectl logs -n digital-bank-poc -l app=nginx --tail=50

# 4. 如果Pod不存在，检查Deployment
kubectl get deployment -n digital-bank-poc nginx

# 5. 如果Deployment存在但Pod不存在，检查ReplicaSet
kubectl get rs -n digital-bank-poc -l app=nginx

# 6. 查看Deployment事件
kubectl describe deployment -n digital-bank-poc nginx
```

**修复容器名称问题**:
```powershell
# 检查Deployment配置中的容器名称
kubectl get deployment -n digital-bank-poc nginx -o yaml | grep -A 5 "containers:"

# 如果容器名称不是"nginx"，需要修改Deployment或验证脚本
```

### 问题4: 配置检查失败

**解决方案**:

```powershell
# 1. 进入Pod执行配置检查
kubectl exec -n digital-bank-poc -l app=nginx -- nginx -t

# 2. 如果容器名称不对，先找到正确的容器名称
kubectl get pods -n digital-bank-poc -l app=nginx -o jsonpath='{.items[0].spec.containers[*].name}'

# 3. 使用正确的容器名称
kubectl exec -n digital-bank-poc -l app=nginx -c <container-name> -- nginx -t
```

## 🔧 快速修复命令

### 一键诊断

```powershell
# 进入项目目录
cd "d:\iCloudDrive\Documents\深度架构\POC testbank\infrastructure"

# 运行诊断脚本
kubectl get pods -n digital-bank-poc
kubectl get svc -n digital-bank-poc
kubectl get deployment -n digital-bank-poc

# 查看所有Pod事件
kubectl get events -n digital-bank-poc --sort-by='.lastTimestamp'
```

### 重新部署（如果配置有问题）

```powershell
# 删除现有资源
kubectl delete -f k8s\base\consul\
kubectl delete -f k8s\base\kong\
kubectl delete -f k8s\base\nginx\

# 等待资源清理
kubectl wait --for=delete pod -n digital-bank-poc -l app=consul --timeout=60s
kubectl wait --for=delete pod -n digital-bank-poc -l app=kong --timeout=60s
kubectl wait --for=delete pod -n digital-bank-poc -l app=nginx --timeout=60s

# 重新部署
kubectl apply -f k8s\base\consul\
kubectl apply -f k8s\base\kong\
kubectl apply -f k8s\base\nginx\

# 等待Pod就绪
kubectl wait --for=condition=ready pod -n digital-bank-poc -l app=consul --timeout=300s
kubectl wait --for=condition=ready pod -n digital-bank-poc -l app=kong --timeout=300s
kubectl wait --for=condition=ready pod -n digital-bank-poc -l app=nginx --timeout=300s
```

## 📋 检查清单

- [ ] 检查所有Pod状态
- [ ] 查看Pod日志找出错误
- [ ] 检查Service配置
- [ ] 验证端口转发
- [ ] 检查资源限制
- [ ] 验证镜像是否可拉取
- [ ] 检查网络策略
- [ ] 验证ConfigMap配置

## 🎯 下一步操作

1. **立即执行诊断**:
   ```powershell
   kubectl get pods -n digital-bank-poc
   kubectl describe pods -n digital-bank-poc
   ```

2. **查看日志**:
   ```powershell
   kubectl logs -n digital-bank-poc -l app=consul --tail=50
   kubectl logs -n digital-bank-poc -l app=kong --tail=50
   kubectl logs -n digital-bank-poc -l app=nginx --tail=50
   ```

3. **根据日志信息修复问题**

## 📚 相关文档

- [WINDOWS-TROUBLESHOOTING.md](./WINDOWS-TROUBLESHOOTING.md) - Windows环境故障排查
- [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) - 部署指南
- [README.md](./README.md) - 基础设施文档

---

**提示**: 大多数问题都可以通过查看Pod日志和事件来诊断。执行上述诊断命令后，根据输出信息进行针对性修复。
