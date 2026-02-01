# Windows环境从零开始部署指南

本文档专门针对Windows环境，提供从零开始部署数字银行POC系统基础设施的完整步骤。

> ⚠️ **遇到问题？** 
> - **"请求的操作需要提升"**: 需要以管理员身份运行PowerShell，查看[故障排查指南](./WINDOWS-TROUBLESHOOTING.md#问题1-wsl安装需要管理员权限)
> - **"安全频道支持出错"**: TLS/SSL配置问题，查看[故障排查指南](./WINDOWS-TROUBLESHOOTING.md#问题2-安全频道支持出错)
> - **其他问题**: 查看[完整故障排查指南](./WINDOWS-TROUBLESHOOTING.md)

## 📋 目录

1. [系统要求](#系统要求)
2. [安装必需软件](#安装必需软件)
3. [准备Kubernetes集群](#准备kubernetes集群)
4. [部署基础设施](#部署基础设施)
5. [验证部署](#验证部署)
6. [Windows特定问题](#windows特定问题)

---

## 系统要求

### 硬件要求

- **CPU**: 4核心或以上（推荐）
- **内存**: 8GB或以上（推荐16GB）
- **磁盘空间**: 至少20GB可用空间
- **虚拟化**: 支持虚拟化（BIOS中启用VT-x/AMD-V）

### 软件要求

- **操作系统**: Windows 10 (版本1903+) 或 Windows 11
- **管理员权限**: 需要管理员权限安装软件

---

## 安装必需软件

### 步骤1: 安装Docker Desktop for Windows

Docker Desktop是Windows上运行Kubernetes最简单的方式。

#### 1.1 下载Docker Desktop

1. 访问: https://www.docker.com/products/docker-desktop/
2. 下载 `Docker Desktop Installer.exe`
3. 运行安装程序

#### 1.2 安装配置

1. **启用WSL 2**（推荐）:
   - 安装过程中选择 "Use WSL 2 instead of Hyper-V"
   - 如果未安装WSL 2，安装程序会提示安装

2. **完成安装**:
   - 安装完成后重启计算机
   - 启动Docker Desktop
   - 等待Docker引擎启动（系统托盘图标变为绿色）

#### 1.3 验证Docker安装

打开 **PowerShell** 或 **命令提示符**:

```powershell
# 检查Docker版本
docker --version

# 检查Docker运行状态
docker ps

# 测试Docker
docker run hello-world
```

**预期输出**:
```
Docker version 24.0.0, build ...
Hello from Docker!
```

### 步骤2: 启用Kubernetes

#### 2.1 在Docker Desktop中启用Kubernetes

1. 打开 **Docker Desktop**
2. 点击右上角 **设置图标** (⚙️)
3. 左侧菜单选择 **Kubernetes**
4. 勾选 **"Enable Kubernetes"**
5. 点击 **"Apply & Restart"**
6. 等待Kubernetes启动（可能需要几分钟）

#### 2.2 验证Kubernetes

打开 **PowerShell**:

```powershell
# 检查kubectl是否可用（Docker Desktop会自动安装）
kubectl version --client

# 检查Kubernetes集群
kubectl cluster-info

# 检查节点
kubectl get nodes
```

**预期输出**:
```
NAME             STATUS   ROLES           AGE   VERSION
docker-desktop   Ready    control-plane   1m    v1.28.0
```

### 步骤3: 安装kubectl（如果Docker Desktop未自动安装）

#### 方式A: 使用Chocolatey（推荐）

```powershell
# 以管理员身份运行PowerShell
# 安装Chocolatey（如果未安装）
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安装kubectl
choco install kubernetes-cli -y
```

#### 方式B: 手动下载

```powershell
# 1. 下载kubectl
curl.exe -LO "https://dl.k8s.io/release/v1.28.0/bin/windows/amd64/kubectl.exe"

# 2. 将kubectl.exe移动到PATH中的目录
# 例如: C:\Windows\System32 或创建 C:\kubectl 并添加到PATH

# 3. 验证
kubectl version --client
```

#### 方式C: 使用Scoop

```powershell
# 安装Scoop（如果未安装）
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# 安装kubectl
scoop install kubectl
```

### 步骤4: 安装Git（如果未安装）

#### 方式A: 使用Chocolatey

```powershell
choco install git -y
```

#### 方式B: 下载安装程序

1. 访问: https://git-scm.com/download/win
2. 下载并运行安装程序
3. 使用默认选项安装

验证:
```powershell
git --version
```

### 步骤5: 安装curl（如果未安装）

Windows 10/11通常已包含curl，验证:

```powershell
curl --version
```

如果没有，使用Chocolatey安装:

```powershell
choco install curl -y
```

---

## 准备Kubernetes集群

### 选项1: 使用Docker Desktop Kubernetes（推荐）

#### 步骤1: 确认Kubernetes已启用

1. 打开Docker Desktop
2. 设置 → Kubernetes
3. 确认 "Enable Kubernetes" 已勾选

#### 步骤2: 检查集群状态

```powershell
# 检查集群信息
kubectl cluster-info

# 检查节点
kubectl get nodes

# 检查所有命名空间
kubectl get namespaces
```

#### 步骤3: 配置资源限制（可选）

Docker Desktop → 设置 → Resources:
- **CPU**: 至少4核心（推荐）
- **Memory**: 至少8GB（推荐16GB）
- **Swap**: 2GB
- 点击 "Apply & Restart"

### 选项2: 使用Minikube（备选）

如果Docker Desktop的Kubernetes有问题，可以使用Minikube。

#### 步骤1: 安装Minikube

```powershell
# 使用Chocolatey
choco install minikube -y

# 或手动下载
# 访问: https://minikube.sigs.k8s.io/docs/start/
```

#### 步骤2: 启动Minikube

```powershell
# 启动Minikube（使用Docker驱动）
minikube start --driver=docker --memory=4096 --cpus=2

# 验证
minikube status
kubectl get nodes
```

#### 步骤3: 配置kubectl上下文

```powershell
# Minikube会自动配置，验证
kubectl config current-context
```

---

## 部署基础设施

### 步骤1: 克隆或进入项目目录

```powershell
# 如果项目在本地，直接进入
cd "d:\iCloudDrive\Documents\深度架构\POC testbank\infrastructure"

# 如果从Git克隆
git clone <repository-url>
cd <project-directory>\infrastructure
```

### 步骤2: 验证Kubernetes连接

```powershell
# 检查集群连接
kubectl cluster-info

# 检查当前上下文
kubectl config current-context

# 应该显示: docker-desktop 或 minikube
```

### 步骤3: 部署基础设施

#### 方式A: 使用自动化脚本（推荐）

**使用Git Bash**:

```bash
# 打开Git Bash
# 进入项目目录
cd /d/iCloudDrive/Documents/深度架构/POC\ testbank/infrastructure

# 赋予执行权限
chmod +x dev-environment-setup.sh

# 执行部署
./dev-environment-setup.sh
```

**使用PowerShell**:

```powershell
# PowerShell中执行bash脚本
bash dev-environment-setup.sh

# 或使用WSL（如果已安装）
wsl bash dev-environment-setup.sh
```

#### 方式B: 手动部署（逐步执行）

```powershell
# 步骤1: 创建命名空间
kubectl apply -f k8s\base\namespace.yaml

# 步骤2: 部署Consul
kubectl apply -f k8s\base\consul\configmap.yaml
kubectl apply -f k8s\base\consul\deployment.yaml
kubectl apply -f k8s\base\consul\service.yaml

# 步骤3: 部署Kong
kubectl apply -f k8s\base\kong\configmap.yaml
kubectl apply -f k8s\base\kong\deployment.yaml
kubectl apply -f k8s\base\kong\service.yaml

# 步骤4: 部署Nginx
kubectl apply -f k8s\base\nginx\configmap.yaml
kubectl apply -f k8s\base\nginx\deployment.yaml
kubectl apply -f k8s\base\nginx\service.yaml

# 步骤5: 检查状态
kubectl get pods -n digital-bank-poc
kubectl get svc -n digital-bank-poc
```

**注意**: Windows路径使用反斜杠 `\`，但kubectl也接受正斜杠 `/`

### 步骤4: 等待Pod就绪

```powershell
# 查看Pod状态
kubectl get pods -n digital-bank-poc -w

# 等待所有Pod变为Running状态（按Ctrl+C停止监控）
# 或使用超时等待
kubectl wait --for=condition=available --timeout=300s deployment/consul-server -n digital-bank-poc
kubectl wait --for=condition=available --timeout=300s deployment/kong -n digital-bank-poc
kubectl wait --for=condition=available --timeout=300s deployment/nginx -n digital-bank-poc
```

---

## 验证部署

### 步骤1: 检查Pod状态

```powershell
# 查看所有Pod
kubectl get pods -n digital-bank-poc

# 预期输出（所有Pod应该是Running）:
# NAME                            READY   STATUS    RESTARTS   AGE
# consul-server-xxx               1/1     Running   0          2m
# kong-xxx                         1/1     Running   0          1m
# nginx-xxx                        1/1     Running   0          1m
# nginx-xxx                        1/1     Running   0          1m
```

### 步骤2: 检查Service状态

```powershell
# 查看所有Service
kubectl get svc -n digital-bank-poc

# 预期输出:
# NAME            TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)
# consul-server   ClusterIP      10.96.xxx.xxx   <none>        8500/TCP,...
# kong            LoadBalancer   10.96.xxx.xxx   <pending>     8000:3xxxx/TCP,8001:3xxxx/TCP
# nginx           LoadBalancer   10.96.xxx.xxx   <pending>     80:3xxxx/TCP,443:3xxxx/TCP
```

### 步骤3: 运行验证脚本

```powershell
# 使用Git Bash
bash dev-environment-verify.sh

# 或使用WSL
wsl bash dev-environment-verify.sh
```

### 步骤4: 手动测试服务

#### 测试Consul

```powershell
# 端口转发（在单独的PowerShell窗口中运行）
kubectl port-forward -n digital-bank-poc svc/consul-server 8500:8500

# 在另一个PowerShell窗口中测试
curl http://localhost:8500/v1/status/leader

# 浏览器访问
# http://localhost:8500
```

#### 测试Kong

```powershell
# 端口转发
kubectl port-forward -n digital-bank-poc svc/kong 8000:8000 8001:8001

# 测试管理API
curl http://localhost:8001/status

# 测试代理
curl http://localhost:8000/api/v1/health
```

#### 测试Nginx

```powershell
# 端口转发
kubectl port-forward -n digital-bank-poc svc/nginx 8080:80

# 健康检查
curl http://localhost:8080/health

# 通过Nginx访问API
curl http://localhost:8080/api/v1/health
```

### 步骤5: 查看日志

```powershell
# Consul日志
kubectl logs -n digital-bank-poc -l app=consul --tail=50

# Kong日志
kubectl logs -n digital-bank-poc -l app=kong --tail=50

# Nginx日志
kubectl logs -n digital-bank-poc -l app=nginx --tail=50

# 实时查看日志
kubectl logs -n digital-bank-poc -l app=consul -f
```

---

## Windows特定问题

### 问题1: Docker Desktop无法启动

**症状**: Docker Desktop启动失败或卡住

**解决方案**:
1. **检查WSL 2**:
   ```powershell
   # 以管理员身份运行PowerShell
   wsl --status
   wsl --update
   ```

2. **重启Docker Desktop**:
   - 右键系统托盘Docker图标 → Quit Docker Desktop
   - 重新启动Docker Desktop

3. **重置Docker Desktop**:
   - Docker Desktop → 设置 → Troubleshoot → Reset to factory defaults

### 问题2: Kubernetes一直显示"Starting"

**症状**: Docker Desktop中Kubernetes状态一直是"Starting"

**解决方案**:
1. **检查资源**:
   - Docker Desktop → 设置 → Resources
   - 确保分配了足够的CPU和内存

2. **重启Kubernetes**:
   - Docker Desktop → 设置 → Kubernetes
   - 取消勾选 "Enable Kubernetes"
   - 点击 "Apply & Restart"
   - 等待完成后，重新勾选并应用

3. **查看日志**:
   ```powershell
   # 查看Docker Desktop日志
   # 位置: %LOCALAPPDATA%\Docker\log.txt
   ```

### 问题3: kubectl命令找不到

**症状**: `kubectl: command not found`

**解决方案**:
1. **检查PATH**:
   ```powershell
   $env:PATH -split ';' | Select-String kubectl
   ```

2. **手动添加到PATH**:
   - 将kubectl.exe所在目录添加到系统PATH环境变量
   - 或使用Chocolatey/Scoop安装

3. **使用Docker Desktop的kubectl**:
   ```powershell
   # Docker Desktop的kubectl通常在:
   & "C:\Program Files\Docker\Docker\resources\bin\kubectl.exe" version
   ```

### 问题4: 脚本执行权限问题

**症状**: `Permission denied` 或脚本无法执行

**解决方案**:
1. **使用Git Bash**:
   ```bash
   chmod +x dev-environment-setup.sh
   ./dev-environment-setup.sh
   ```

2. **使用PowerShell执行bash**:
   ```powershell
   bash dev-environment-setup.sh
   ```

3. **使用WSL**:
   ```powershell
   wsl bash dev-environment-setup.sh
   ```

### 问题5: 路径包含空格问题

**症状**: 路径中的空格导致命令失败

**解决方案**:
1. **使用引号**:
   ```powershell
   cd "d:\iCloudDrive\Documents\深度架构\POC testbank\infrastructure"
   ```

2. **使用短路径名**:
   ```powershell
   # 获取短路径名
   cmd /c for %I in ("d:\iCloudDrive\Documents\深度架构\POC testbank") do @echo %~sI
   ```

### 问题6: 端口转发失败

**症状**: `Unable to listen on port` 或端口已被占用

**解决方案**:
1. **检查端口占用**:
   ```powershell
   netstat -ano | findstr :8500
   ```

2. **使用其他端口**:
   ```powershell
   kubectl port-forward -n digital-bank-poc svc/consul-server 8501:8500
   ```

3. **结束占用进程**:
   ```powershell
   # 查找进程ID
   netstat -ano | findstr :8500
   # 结束进程（替换PID）
   taskkill /PID <PID> /F
   ```

### 问题7: LoadBalancer类型Service显示Pending

**症状**: Service的EXTERNAL-IP显示`<pending>`

**原因**: Docker Desktop和Minikube默认不支持LoadBalancer

**解决方案**:
1. **使用NodePort**（临时方案）:
   ```powershell
   # 修改service.yaml，将type改为NodePort
   # 或使用端口转发访问
   ```

2. **Minikube使用tunnel**:
   ```powershell
   minikube tunnel
   # 在另一个终端中运行，保持运行
   ```

3. **使用端口转发**（推荐开发环境）:
   ```powershell
   kubectl port-forward -n digital-bank-poc svc/kong 8000:8000
   ```

### 问题8: 镜像拉取失败

**症状**: Pod状态为`ImagePullBackOff`或`ErrImagePull`

**解决方案**:
1. **检查网络连接**:
   ```powershell
   docker pull consul:1.17.0
   docker pull kong:3.4
   docker pull nginx:1.25-alpine
   ```

2. **配置镜像加速器**（中国用户）:
   - Docker Desktop → 设置 → Docker Engine
   - 添加镜像加速器配置:
   ```json
   {
     "registry-mirrors": [
       "https://docker.mirrors.ustc.edu.cn",
       "https://hub-mirror.c.163.com"
     ]
   }
   ```
   - 点击 "Apply & Restart"

3. **手动加载镜像**（Minikube）:
   ```powershell
   minikube image load consul:1.17.0
   minikube image load kong:3.4
   minikube image load nginx:1.25-alpine
   ```

---

## 快速参考

### 常用PowerShell命令

```powershell
# 检查Docker状态
docker ps
docker info

# 检查Kubernetes状态
kubectl cluster-info
kubectl get nodes
kubectl get pods -n digital-bank-poc
kubectl get svc -n digital-bank-poc

# 查看日志
kubectl logs -n digital-bank-poc <pod-name>

# 进入Pod
kubectl exec -it -n digital-bank-poc <pod-name> -- /bin/sh

# 删除命名空间（清理所有资源）
kubectl delete namespace digital-bank-poc

# 重启部署
kubectl rollout restart deployment/<deployment-name> -n digital-bank-poc
```

### 端口转发命令

```powershell
# Consul (在单独窗口中运行)
kubectl port-forward -n digital-bank-poc svc/consul-server 8500:8500

# Kong (在单独窗口中运行)
kubectl port-forward -n digital-bank-poc svc/kong 8000:8000 8001:8001

# Nginx (在单独窗口中运行)
kubectl port-forward -n digital-bank-poc svc/nginx 8080:80
```

### 访问地址

部署成功后，通过端口转发访问:

- **Consul UI**: http://localhost:8500
- **Kong Admin**: http://localhost:8001
- **Kong Proxy**: http://localhost:8000
- **Nginx**: http://localhost:8080

---

## 下一步

部署成功后:

1. **保持端口转发运行**: 在单独的PowerShell窗口中保持端口转发命令运行
2. **访问服务UI**: 在浏览器中访问上述地址
3. **等待应用服务**: Agent 1、2、3将部署应用服务
4. **配置监控**: Agent 8将配置监控系统

---

## 获取帮助

如果遇到问题:

1. **查看日志**: `kubectl logs -n digital-bank-poc <pod-name>`
2. **查看事件**: `kubectl describe pod -n digital-bank-poc <pod-name>`
3. **Docker Desktop日志**: `%LOCALAPPDATA%\Docker\log.txt`
4. **运行验证脚本**: `bash dev-environment-verify.sh`
5. **参考文档**: 
   - [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) - 通用部署指南
   - [README.md](./README.md) - 完整文档

---

**文档版本**: v1.0.0  
**创建日期**: 2026-01-26  
**最后更新**: 2026-01-26  
**适用系统**: Windows 10/11
