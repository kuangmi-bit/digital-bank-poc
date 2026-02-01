# 快速开始 - 5分钟部署指南

如果您已经安装了kubectl和Kubernetes集群，可以按照以下步骤快速部署。

## 🚀 一键部署

```bash
# 1. 进入项目目录
cd infrastructure

# 2. 执行部署脚本
# Linux/macOS
chmod +x dev-environment-setup.sh
./dev-environment-setup.sh

# Windows (Git Bash)
bash dev-environment-setup.sh

# 3. 验证部署
chmod +x dev-environment-verify.sh
./dev-environment-verify.sh
```

## 📋 手动部署（3步）

```bash
# 步骤1: 创建命名空间
kubectl apply -f k8s/base/namespace.yaml

# 步骤2: 部署所有组件
kubectl apply -f k8s/base/consul/
kubectl apply -f k8s/base/kong/
kubectl apply -f k8s/base/nginx/

# 步骤3: 检查状态
kubectl get pods -n digital-bank-poc
kubectl get svc -n digital-bank-poc
```

## ✅ 验证部署

```bash
# 检查Pod状态（应该都是Running）
kubectl get pods -n digital-bank-poc

# 测试Consul
kubectl port-forward -n digital-bank-poc svc/consul-server 8500:8500
# 浏览器访问: http://localhost:8500

# 测试Kong
kubectl port-forward -n digital-bank-poc svc/kong 8001:8001
curl http://localhost:8001/status

# 测试Nginx
kubectl port-forward -n digital-bank-poc svc/nginx 8080:80
curl http://localhost:8080/health
```

## ❓ 遇到问题？

- **Windows用户？** 查看 [WINDOWS-DEPLOYMENT-GUIDE.md](./WINDOWS-DEPLOYMENT-GUIDE.md) 获取Windows专用指南
- **没有Kubernetes集群？** 
  - Windows: 查看 [WINDOWS-DEPLOYMENT-GUIDE.md](./WINDOWS-DEPLOYMENT-GUIDE.md) 
  - Linux/macOS: 查看 [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)
- **Pod无法启动？** 查看部署指南的故障排查部分
- **需要详细说明？** 查看 [README.md](./README.md) 完整文档

---

**提示**: 
- **Windows用户**: 建议先阅读 [WINDOWS-DEPLOYMENT-GUIDE.md](./WINDOWS-DEPLOYMENT-GUIDE.md) 了解Windows特定的安装和配置步骤
- **Linux/macOS用户**: 建议先阅读 [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) 了解完整的前置要求和步骤
