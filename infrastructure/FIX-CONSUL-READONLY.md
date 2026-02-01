# Consul只读文件系统问题修复

## 🔴 问题

Consul Pod崩溃，错误信息：
```
chown: /consul/config: Read-only file system
```

## 🔍 原因分析

1. **Consul 1.22.2在启动时会尝试修改配置目录权限**
2. **ConfigMap挂载是只读的**（`readOnly: true`）
3. **Consul无法对只读目录执行chown操作**，导致启动失败

## ✅ 修复方案

使用**initContainer**将配置文件从只读的ConfigMap复制到可写的emptyDir：

1. **添加initContainer**：在Consul容器启动前，使用busybox将配置文件复制到可写目录
2. **修改volume挂载**：
   - `consul-config-source`：从ConfigMap挂载（只读，供initContainer使用）
   - `consul-config`：使用emptyDir（可写，供Consul使用）

## 📋 修复内容

### 修改的文件
- `k8s/base/consul/deployment.yaml`

### 主要变更
1. 添加initContainer `copy-consul-config`
2. 将`consul-config` volume从ConfigMap改为emptyDir
3. 添加`consul-config-source` volume（ConfigMap，只读）

## 🎯 应用修复

```bash
# 应用修复后的配置
kubectl apply -f k8s/base/consul/deployment.yaml

# 删除现有Pod以应用新配置
kubectl delete pod -n digital-bank-poc -l app=consul

# 等待Pod就绪
kubectl wait --for=condition=ready pod -n digital-bank-poc -l app=consul --timeout=300s

# 查看日志确认启动成功
kubectl logs -n digital-bank-poc -l app=consul --tail=50
```

## 📝 验证

修复后，Consul应该能够：
1. ✅ 成功启动（不再出现chown错误）
2. ✅ 读取配置文件
3. ✅ 完成bootstrap过程
4. ✅ HTTP API可访问

## 🔗 相关文档

- [Consul配置文档](https://www.consul.io/docs/agent/options)
- [Kubernetes ConfigMap最佳实践](https://kubernetes.io/docs/concepts/configuration/configmap/)

---

**提示**: 这是Consul 1.22.2的一个已知问题，使用initContainer是推荐的解决方案。
