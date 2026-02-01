# Windows快速开始 - 10分钟部署指南

Windows环境下的快速部署指南，假设您已经安装了Docker Desktop。

## 🚀 前提条件检查

```powershell
# 1. 检查Docker是否运行
docker ps

# 2. 检查kubectl是否可用
kubectl version --client

# 3. 检查Kubernetes是否启用
kubectl cluster-info
kubectl get nodes
```

如果以上命令都成功，可以继续。如果失败，请先查看 [WINDOWS-DEPLOYMENT-GUIDE.md](./WINDOWS-DEPLOYMENT-GUIDE.md)。

## 📦 一键部署

### 方式1: 使用Git Bash（推荐）

```bash
# 1. 打开Git Bash
# 2. 进入项目目录
cd /d/iCloudDrive/Documents/深度架构/POC\ testbank/infrastructure

# 3. 执行部署脚本
chmod +x dev-environment-setup.sh
./dev-environment-setup.sh

# 4. 验证部署
chmod +x dev-environment-verify.sh
./dev-environment-verify.sh
```

### 方式2: 使用PowerShell

```powershell
# 1. 进入项目目录
cd "d:\iCloudDrive\Documents\深度架构\POC testbank\infrastructure"

# 2. 执行部署脚本
bash dev-environment-setup.sh

# 3. 验证部署
bash dev-environment-verify.sh
```

### 方式3: 手动部署（3步）

```powershell
# 步骤1: 创建命名空间
kubectl apply -f k8s\base\namespace.yaml

# 步骤2: 部署所有组件
kubectl apply -f k8s\base\consul\
kubectl apply -f k8s\base\kong\
kubectl apply -f k8s\base\nginx\

# 步骤3: 检查状态
kubectl get pods -n digital-bank-poc
kubectl get svc -n digital-bank-poc
```

## ✅ 验证部署

### 检查Pod状态

```powershell
# 所有Pod应该是Running状态
kubectl get pods -n digital-bank-poc
```

### 测试服务（需要3个PowerShell窗口）

**窗口1 - Consul**:
```powershell
kubectl port-forward -n digital-bank-poc svc/consul-server 8500:8500
# 浏览器访问: http://localhost:8500
```

**窗口2 - Kong**:
```powershell
kubectl port-forward -n digital-bank-poc svc/kong 8000:8000 8001:8001
# 测试: curl http://localhost:8001/status
```

**窗口3 - Nginx**:
```powershell
kubectl port-forward -n digital-bank-poc svc/nginx 8080:80
# 测试: curl http://localhost:8080/health
```

## 🐛 常见问题

### Docker Desktop Kubernetes未启用

1. 打开Docker Desktop
2. 设置 → Kubernetes → 勾选 "Enable Kubernetes"
3. 点击 "Apply & Restart"
4. 等待Kubernetes启动

### 脚本无法执行

使用Git Bash或PowerShell执行:
```powershell
bash dev-environment-setup.sh
```

### 端口被占用

```powershell
# 检查端口占用
netstat -ano | findstr :8500

# 使用其他端口
kubectl port-forward -n digital-bank-poc svc/consul-server 8501:8500
```

## 📚 更多帮助

- **详细Windows指南**: [WINDOWS-DEPLOYMENT-GUIDE.md](./WINDOWS-DEPLOYMENT-GUIDE.md)
- **通用部署指南**: [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)
- **完整文档**: [README.md](./README.md)

---

**提示**: 如果遇到问题，请查看 [WINDOWS-DEPLOYMENT-GUIDE.md](./WINDOWS-DEPLOYMENT-GUIDE.md) 的"Windows特定问题"部分。
