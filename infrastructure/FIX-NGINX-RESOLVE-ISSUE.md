# Nginx resolve参数问题修复

## 🔴 问题

Nginx配置错误：`invalid parameter "resolve"`

**错误信息**:
```
nginx: [emerg] invalid parameter "resolve" in /etc/nginx/nginx.conf:44
```

## 🔍 原因分析

1. **`resolve` 参数是Nginx Plus的功能**，标准Nginx（开源版）不支持
2. 当前使用的是 `nginx:1.25-alpine`（标准Nginx），不支持此参数
3. Nginx在启动时会尝试验证upstream配置，如果服务不存在会导致启动失败

## ✅ 修复方案

### 方案1: 移除resolve参数（已应用）

**修改内容**:
- 移除所有upstream中的 `resolve` 参数
- 移除resolver配置（暂时不需要）
- 只保留已部署服务的upstream配置

**优点**: 
- 简单直接
- 兼容标准Nginx
- 如果服务在Nginx启动时已存在，可以正常工作

**缺点**:
- 如果服务在Nginx启动后创建，需要重启Nginx

### 方案2: 使用变量+resolver（可选，更复杂）

如果需要动态DNS解析，可以使用变量方式：

```nginx
resolver 10.96.0.10 valid=10s;

server {
    location /api/ {
        set $kong_upstream kong.digital-bank-poc.svc.cluster.local:8000;
        proxy_pass http://$kong_upstream;
        # ... 其他配置
    }
}
```

**注意**: 这种方式需要修改所有使用upstream的location配置。

## 📋 当前修复状态

✅ **已修复**: 
- 移除了所有 `resolve` 参数
- 移除了resolver配置
- 只保留已部署服务的配置（Kong和Consul）

## 🎯 应用修复

```bash
# 应用修复后的配置
kubectl apply -f k8s/base/nginx/configmap.yaml

# 删除现有Nginx Pod以应用新配置
kubectl delete pod -n digital-bank-poc -l app=nginx

# 等待Pod就绪
kubectl wait --for=condition=ready pod -n digital-bank-poc -l app=nginx --timeout=300s
```

## 📝 后续步骤

当Agent 1-3部署服务后：

1. **取消注释Nginx配置中的服务upstream**
2. **取消注释对应的location配置**
3. **重新应用ConfigMap**: `kubectl apply -f k8s/base/nginx/configmap.yaml`
4. **重启Nginx Pod**: `kubectl delete pod -n digital-bank-poc -l app=nginx`

---

**提示**: 当前修复已应用，Nginx应该可以正常启动了。
