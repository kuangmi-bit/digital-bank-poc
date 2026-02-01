# 数字银行POC系统 - 从零开始部署指南

本文档提供从零开始部署数字银行POC系统基础设施的完整步骤。

## 📋 目录

1. [前置要求](#前置要求)
2. [环境准备](#环境准备)
3. [Kubernetes集群准备](#kubernetes集群准备)
4. [部署基础设施](#部署基础设施)
5. [验证部署](#验证部署)
6. [常见问题](#常见问题)

---

## 前置要求

### 1. 操作系统要求

- **Linux**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **macOS**: 10.15+
- **Windows**: Windows 10/11 (使用WSL2或Docker Desktop)

### 2. 必需软件

| 软件 | 版本要求 | 用途 |
|------|---------|------|
| kubectl | >= 1.24 | Kubernetes命令行工具 |
| Kubernetes集群 | >= 1.24 | 容器编排平台 |
| curl | 最新版 | HTTP测试工具 |
| git | 最新版 | 代码版本控制 |

### 3. 可选软件

| 软件 | 版本要求 | 用途 |
|------|---------|------|
| Terraform | >= 1.5.0 | 基础设施即代码 |
| Docker Desktop | 最新版 | 本地开发环境 |
| Minikube | 最新版 | 本地Kubernetes集群 |
| kind | 最新版 | 本地Kubernetes集群 |

---

## 环境准备

### 步骤1: 安装kubectl

#### Linux/macOS

```bash
# 下载最新版本
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# 安装
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# 验证
kubectl version --client
```

#### Windows (PowerShell)

```powershell
# 下载
curl.exe -LO "https://dl.k8s.io/release/v1.28.0/bin/windows/amd64/kubectl.exe"

# 添加到PATH
# 将kubectl.exe移动到PATH中的目录，或添加到PATH环境变量

# 验证
kubectl version --client
```

### 步骤2: 准备Kubernetes集群

您可以选择以下任一方式：

#### 选项A: 使用Minikube（本地开发推荐）

```bash
# 1. 安装Minikube
# Linux
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# macOS
brew install minikube

# Windows
# 下载: https://minikube.sigs.k8s.io/docs/start/

# 2. 启动Minikube集群
minikube start --memory=4096 --cpus=2

# 3. 验证
kubectl get nodes
```

#### 选项B: 使用kind（轻量级）

```bash
# 1. 安装kind
# Linux/macOS
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# 2. 创建集群
kind create cluster --name digital-bank-poc

# 3. 验证
kubectl get nodes
```

#### 选项C: 使用Docker Desktop（Windows/macOS）

1. 安装Docker Desktop
2. 启用Kubernetes功能：
   - Settings → Kubernetes → Enable Kubernetes
3. 等待Kubernetes启动完成
4. 验证：
   ```bash
   kubectl get nodes
   ```

#### 选项D: 使用云服务商Kubernetes

**AWS EKS**:
```bash
# 安装AWS CLI和eksctl
# 创建集群
eksctl create cluster --name digital-bank-poc --region us-west-2 --node-type t3.medium --nodes 2
```

**Google GKE**:
```bash
# 安装gcloud CLI
# 创建集群
gcloud container clusters create digital-bank-poc --zone us-central1-a
```

**Azure AKS**:
```bash
# 安装Azure CLI
# 创建集群
az aks create --resource-group myResourceGroup --name digital-bank-poc --node-count 2
```

### 步骤3: 验证Kubernetes连接

```bash
# 检查集群连接
kubectl cluster-info

# 检查节点状态
kubectl get nodes

# 检查kubectl配置
kubectl config current-context
```

**预期输出**:
```
NAME                 STATUS   ROLES           AGE   VERSION
minikube             Ready    control-plane   1m    v1.28.0
```

---

## Kubernetes集群准备

### 步骤1: 检查集群资源

确保集群有足够的资源：

```bash
# 检查节点资源
kubectl top nodes  # 如果已安装metrics-server

# 或使用describe
kubectl describe nodes
```

**最低要求**:
- CPU: 2核心
- 内存: 4GB
- 存储: 20GB

### 步骤2: 配置kubectl上下文（如需要）

```bash
# 查看所有上下文
kubectl config get-contexts

# 切换到目标上下文
kubectl config use-context <context-name>

# 验证当前上下文
kubectl config current-context
```

---

## 部署基础设施

### 方式1: 使用自动化脚本（推荐）

#### 步骤1: 进入项目目录

```bash
cd "d:\iCloudDrive\Documents\深度架构\POC testbank"
cd infrastructure
```

#### 步骤2: 赋予脚本执行权限

```bash
# Linux/macOS
chmod +x dev-environment-setup.sh
chmod +x dev-environment-verify.sh

# Windows (Git Bash)
# 脚本已配置为可执行，或使用:
# bash dev-environment-setup.sh
```

#### 步骤3: 执行部署脚本

```bash
# Linux/macOS
./dev-environment-setup.sh

# Windows (PowerShell)
bash dev-environment-setup.sh

# Windows (Git Bash)
./dev-environment-setup.sh
```

**脚本将自动执行**:
1. ✅ 检查Kubernetes连接
2. ✅ 创建命名空间
3. ✅ 部署Consul服务注册中心
4. ✅ 部署Kong API Gateway
5. ✅ 部署Nginx反向代理
6. ✅ 等待服务就绪
7. ✅ 显示服务访问地址

**预期输出**:
```
========================================
数字银行POC系统 - Dev环境部署
========================================

[1/6] 检查Kubernetes连接...
✓ Kubernetes连接正常

[2/6] 创建命名空间...
✓ 命名空间已创建

[3/6] 部署Consul服务注册中心...
✓ Consul部署完成

[4/6] 部署Kong API Gateway...
✓ Kong部署完成

[5/6] 部署Nginx反向代理...
✓ Nginx部署完成

[6/6] 验证部署状态...
...
```

### 方式2: 手动部署（逐步执行）

#### 步骤1: 创建命名空间

```bash
kubectl apply -f k8s/base/namespace.yaml
```

验证:
```bash
kubectl get namespace digital-bank-poc
```

#### 步骤2: 部署Consul

```bash
# 部署所有Consul资源
kubectl apply -f k8s/base/consul/

# 或逐个部署
kubectl apply -f k8s/base/consul/configmap.yaml
kubectl apply -f k8s/base/consul/deployment.yaml
kubectl apply -f k8s/base/consul/service.yaml
```

等待Pod就绪:
```bash
kubectl wait --for=condition=available --timeout=300s \
  deployment/consul-server -n digital-bank-poc
```

验证:
```bash
kubectl get pods -n digital-bank-poc -l app=consul
kubectl get svc -n digital-bank-poc -l app=consul
```

#### 步骤3: 部署Kong API Gateway

```bash
# 部署所有Kong资源
kubectl apply -f k8s/base/kong/
```

等待Pod就绪:
```bash
kubectl wait --for=condition=available --timeout=300s \
  deployment/kong -n digital-bank-poc
```

验证:
```bash
kubectl get pods -n digital-bank-poc -l app=kong
kubectl get svc -n digital-bank-poc -l app=kong
```

#### 步骤4: 部署Nginx反向代理

```bash
# 部署所有Nginx资源
kubectl apply -f k8s/base/nginx/
```

等待Pod就绪:
```bash
kubectl wait --for=condition=available --timeout=300s \
  deployment/nginx -n digital-bank-poc
```

验证:
```bash
kubectl get pods -n digital-bank-poc -l app=nginx
kubectl get svc -n digital-bank-poc -l app=nginx
```

### 方式3: 使用Terraform部署

#### 步骤1: 安装Terraform

```bash
# Linux/macOS
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# macOS (使用Homebrew)
brew install terraform

# Windows
# 下载: https://www.terraform.io/downloads
```

验证:
```bash
terraform version
```

#### 步骤2: 初始化Terraform

```bash
cd terraform
terraform init
```

#### 步骤3: 配置变量（可选）

创建 `terraform.tfvars`:
```hcl
kubeconfig_path = "~/.kube/config"
kubeconfig_context = "minikube"
namespace = "digital-bank-poc"
environment = "dev"
```

#### 步骤4: 预览变更

```bash
terraform plan
```

#### 步骤5: 应用配置

```bash
terraform apply
```

输入 `yes` 确认部署。

#### 步骤6: 查看输出

```bash
terraform output
```

---

## 验证部署

### 步骤1: 检查Pod状态

```bash
kubectl get pods -n digital-bank-poc -o wide
```

**预期输出**:
```
NAME                            READY   STATUS    RESTARTS   AGE
consul-server-xxx               1/1     Running   0          2m
kong-xxx                         1/1     Running   0          1m
nginx-xxx                        1/1     Running   0          1m
nginx-xxx                        1/1     Running   0          1m
```

所有Pod应该显示 `STATUS: Running` 和 `READY: 1/1`。

### 步骤2: 检查Service状态

```bash
kubectl get svc -n digital-bank-poc
```

**预期输出**:
```
NAME            TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)                      AGE
consul-server   ClusterIP      10.96.xxx.xxx   <none>        8500/TCP,8600/UDP,...        2m
kong            LoadBalancer   10.96.xxx.xxx   <pending>    8000:3xxxx/TCP,8001:3xxxx/TCP 1m
nginx           LoadBalancer   10.96.xxx.xxx   <pending>    80:3xxxx/TCP,443:3xxxx/TCP    1m
```

### 步骤3: 运行验证脚本

```bash
# Linux/macOS
./dev-environment-verify.sh

# Windows
bash dev-environment-verify.sh
```

验证脚本将检查:
- ✅ 命名空间存在
- ✅ Consul Pod运行正常
- ✅ Kong Pod运行正常
- ✅ Nginx Pod运行正常
- ✅ 服务健康检查
- ✅ 服务间网络连通性

### 步骤4: 手动验证服务

#### 验证Consul

```bash
# 端口转发
kubectl port-forward -n digital-bank-poc svc/consul-server 8500:8500

# 在另一个终端测试
curl http://localhost:8500/v1/status/leader

# 访问UI (浏览器)
open http://localhost:8500
```

#### 验证Kong

```bash
# 端口转发
kubectl port-forward -n digital-bank-poc svc/kong 8000:8000 8001:8001

# 测试管理API
curl http://localhost:8001/status

# 测试代理
curl http://localhost:8000/api/v1/health
```

#### 验证Nginx

```bash
# 端口转发
kubectl port-forward -n digital-bank-poc svc/nginx 8080:80

# 健康检查
curl http://localhost:8080/health

# 通过Nginx访问Kong
curl http://localhost:8080/api/v1/health
```

### 步骤5: 查看日志

```bash
# Consul日志
kubectl logs -n digital-bank-poc -l app=consul --tail=50

# Kong日志
kubectl logs -n digital-bank-poc -l app=kong --tail=50

# Nginx日志
kubectl logs -n digital-bank-poc -l app=nginx --tail=50
```

---

## 常见问题

### 问题1: Pod一直处于Pending状态

**原因**: 资源不足或节点不可调度

**解决方案**:
```bash
# 检查Pod事件
kubectl describe pod <pod-name> -n digital-bank-poc

# 检查节点资源
kubectl describe nodes

# 如果是Minikube，增加资源
minikube stop
minikube start --memory=4096 --cpus=2
```

### 问题2: Pod一直处于CrashLoopBackOff状态

**原因**: 容器启动失败

**解决方案**:
```bash
# 查看Pod日志
kubectl logs <pod-name> -n digital-bank-poc

# 查看Pod事件
kubectl describe pod <pod-name> -n digital-bank-poc

# 检查ConfigMap是否正确
kubectl get configmap -n digital-bank-poc
kubectl describe configmap <configmap-name> -n digital-bank-poc
```

### 问题3: Service无法访问

**原因**: Service选择器不匹配或Pod未就绪

**解决方案**:
```bash
# 检查Service端点
kubectl get endpoints -n digital-bank-poc

# 检查Service选择器
kubectl get svc <service-name> -n digital-bank-poc -o yaml

# 检查Pod标签
kubectl get pods -n digital-bank-poc --show-labels
```

### 问题4: ConfigMap不生效

**原因**: Pod需要重启以加载新配置

**解决方案**:
```bash
# 重启Deployment
kubectl rollout restart deployment/<deployment-name> -n digital-bank-poc

# 或删除Pod让其自动重建
kubectl delete pod -l app=<app-name> -n digital-bank-poc
```

### 问题5: 端口转发失败

**原因**: 端口已被占用

**解决方案**:
```bash
# 检查端口占用
# Linux/macOS
lsof -i :8500

# Windows
netstat -ano | findstr :8500

# 使用其他端口
kubectl port-forward -n digital-bank-poc svc/consul-server 8501:8500
```

### 问题6: Minikube LoadBalancer显示Pending

**原因**: Minikube默认不支持LoadBalancer类型

**解决方案**:
```bash
# 启用LoadBalancer (使用minikube tunnel)
minikube tunnel

# 或使用NodePort类型 (修改service.yaml)
# 将 type: LoadBalancer 改为 type: NodePort
```

### 问题7: 镜像拉取失败

**原因**: 网络问题或镜像不存在

**解决方案**:
```bash
# 检查镜像是否存在
docker pull consul:1.17.0
docker pull kong:3.4
docker pull nginx:1.25-alpine

# 如果是Minikube，需要加载镜像
minikube image load consul:1.17.0
minikube image load kong:3.4
minikube image load nginx:1.25-alpine
```

---

## 下一步

部署成功后，您可以:

1. **查看服务状态**:
   ```bash
   kubectl get all -n digital-bank-poc
   ```

2. **访问服务UI**:
   - Consul UI: `http://localhost:8500` (需要端口转发)
   - Kong Admin: `http://localhost:8001` (需要端口转发)

3. **等待应用服务部署**:
   - Agent 1将部署核心银行服务
   - Agent 2将部署支付服务
   - Agent 3将部署风控服务

4. **配置监控**:
   - Agent 8将配置Prometheus和Grafana

---

## 快速参考

### 常用命令

```bash
# 查看所有资源
kubectl get all -n digital-bank-poc

# 查看Pod日志
kubectl logs -f <pod-name> -n digital-bank-poc

# 进入Pod
kubectl exec -it <pod-name> -n digital-bank-poc -- /bin/sh

# 删除命名空间（清理所有资源）
kubectl delete namespace digital-bank-poc

# 重新部署
kubectl rollout restart deployment/<deployment-name> -n digital-bank-poc
```

### 端口转发命令

```bash
# Consul
kubectl port-forward -n digital-bank-poc svc/consul-server 8500:8500

# Kong
kubectl port-forward -n digital-bank-poc svc/kong 8000:8000 8001:8001

# Nginx
kubectl port-forward -n digital-bank-poc svc/nginx 8080:80
```

---

## 获取帮助

如果遇到问题:

1. 查看日志: `kubectl logs -n digital-bank-poc <pod-name>`
2. 查看事件: `kubectl describe pod -n digital-bank-poc <pod-name>`
3. 运行验证脚本: `./dev-environment-verify.sh`
4. 参考README.md文档

---

**文档版本**: v1.0.0  
**创建日期**: 2026-01-26  
**最后更新**: 2026-01-26
