# Windows环境Bash脚本执行问题修复指南

## 🔴 问题描述

在Windows PowerShell中执行bash脚本时遇到以下错误：

```
wsl: 检测到 localhost 代理配置，但未镜像到 WSL。NAT 模式下的 WSL 不支持 localhost 代理。
<3>WSL (6144 - Relay) ERROR: CreateProcessCommon:800: execvpe(/bin/bash) failed: No such file or directory
```

## ✅ 解决方案

### 方案1: 使用Git Bash（推荐 - 最简单）

**步骤1: 安装Git for Windows（如果未安装）**

1. 下载: https://git-scm.com/download/win
2. 安装时确保勾选 **"Git Bash Here"** 选项

**步骤2: 使用Git Bash执行脚本**

1. **打开Git Bash**:
   - 在项目目录右键 → **"Git Bash Here"**
   - 或从开始菜单打开 **"Git Bash"**

2. **进入项目目录**:
   ```bash
   cd /d/iCloudDrive/Documents/深度架构/POC\ testbank/infrastructure
   ```

3. **赋予执行权限并运行**:
   ```bash
   chmod +x dev-environment-setup.sh
   ./dev-environment-setup.sh
   ```

### 方案2: 修复WSL配置

**步骤1: 检查WSL状态**

```powershell
# 检查WSL版本和状态
wsl --status

# 检查已安装的发行版
wsl --list --verbose
```

**步骤2: 安装或修复WSL发行版**

如果WSL未正确安装Linux发行版：

```powershell
# 安装Ubuntu（推荐）
wsl --install -d Ubuntu

# 或从Microsoft Store安装Ubuntu
# 打开Microsoft Store，搜索"Ubuntu"，安装
```

**步骤3: 在WSL中执行脚本**

```powershell
# 方法A: 使用wsl命令
wsl bash dev-environment-setup.sh

# 方法B: 进入WSL环境
wsl
# 然后在WSL中执行
cd /mnt/d/iCloudDrive/Documents/深度架构/POC\ testbank/infrastructure
bash dev-environment-setup.sh
```

**步骤4: 修复WSL代理问题（如果遇到代理错误）**

```powershell
# 在WSL中配置代理（如果需要）
# 进入WSL
wsl

# 编辑.bashrc或.profile
echo 'export HTTP_PROXY=http://localhost:port' >> ~/.bashrc
echo 'export HTTPS_PROXY=http://localhost:port' >> ~/.bashrc
source ~/.bashrc
```

### 方案3: 使用PowerShell直接执行kubectl命令（无需bash）

如果bash脚本无法执行，可以直接使用PowerShell执行kubectl命令：

```powershell
# 进入项目目录
cd "d:\iCloudDrive\Documents\深度架构\POC testbank\infrastructure"

# 创建命名空间
kubectl apply -f k8s\base\namespace.yaml

# 部署Consul
kubectl apply -f k8s\base\consul\configmap.yaml
kubectl apply -f k8s\base\consul\deployment.yaml
kubectl apply -f k8s\base\consul\service.yaml

# 部署Kong
kubectl apply -f k8s\base\kong\configmap.yaml
kubectl apply -f k8s\base\kong\deployment.yaml
kubectl apply -f k8s\base\kong\service.yaml

# 部署Nginx
kubectl apply -f k8s\base\nginx\configmap.yaml
kubectl apply -f k8s\base\nginx\deployment.yaml
kubectl apply -f k8s\base\nginx\service.yaml

# 检查状态
kubectl get pods -n digital-bank-poc
kubectl get svc -n digital-bank-poc
```

### 方案4: 创建PowerShell版本的部署脚本

如果bash脚本持续有问题，可以使用PowerShell脚本：

```powershell
# 创建 dev-environment-setup.ps1
# 内容与bash脚本相同，但使用PowerShell语法
```

## 🔍 诊断步骤

### 1. 检查bash是否可用

```powershell
# 检查Git Bash
where.exe bash
# 应该显示: C:\Program Files\Git\bin\bash.exe

# 检查WSL bash
wsl which bash
# 应该显示: /usr/bin/bash
```

### 2. 检查WSL安装

```powershell
# 检查WSL状态
wsl --status

# 检查已安装的发行版
wsl --list --verbose

# 如果列表为空，需要安装Linux发行版
wsl --install -d Ubuntu
```

### 3. 测试bash执行

```powershell
# 测试Git Bash
bash --version

# 测试WSL bash
wsl bash --version
```

## 📋 快速修复清单

- [ ] **方案1（推荐）**: 使用Git Bash执行脚本
- [ ] **方案2**: 修复WSL并安装Linux发行版
- [ ] **方案3**: 直接使用PowerShell执行kubectl命令
- [ ] **方案4**: 创建PowerShell版本的脚本

## 🎯 推荐方案

**对于Windows用户，推荐使用方案1（Git Bash）**，因为：

1. ✅ 安装简单，无需配置WSL
2. ✅ 完全兼容bash脚本
3. ✅ 支持所有bash特性
4. ✅ 无需处理WSL路径转换问题

## 📚 相关文档

- [WINDOWS-DEPLOYMENT-GUIDE.md](./WINDOWS-DEPLOYMENT-GUIDE.md) - 完整Windows部署指南
- [WINDOWS-TROUBLESHOOTING.md](./WINDOWS-TROUBLESHOOTING.md) - 详细故障排查
- [WINDOWS-QUICK-START.md](./WINDOWS-QUICK-START.md) - 快速开始指南

---

**提示**: 如果所有方案都无法解决问题，请查看 [WINDOWS-TROUBLESHOOTING.md](./WINDOWS-TROUBLESHOOTING.md) 获取更多帮助。
