# WSL安装Linux发行版指南

## 🔴 当前状态

您的WSL已安装，但缺少Linux发行版：

```
NAME              STATE           VERSION
* docker-desktop    Running         2
```

只有 `docker-desktop` 发行版，没有Ubuntu或其他Linux发行版，所以无法执行bash脚本。

## ✅ 解决方案

### 方案1: 安装Ubuntu（推荐）

**步骤1: 安装Ubuntu**

```powershell
# 方法A: 使用命令行安装（推荐）
wsl --install -d Ubuntu

# 方法B: 从Microsoft Store安装
# 1. 打开Microsoft Store
# 2. 搜索 "Ubuntu"
# 3. 点击 "安装"
```

**步骤2: 首次启动Ubuntu**

安装完成后，Ubuntu会自动启动，需要：
1. 创建用户名（不能是root）
2. 设置密码（输入时不会显示，这是正常的）

**步骤3: 验证安装**

```powershell
# 检查已安装的发行版
wsl --list --verbose

# 应该显示类似：
# NAME              STATE           VERSION
# * Ubuntu            Running         2
# docker-desktop      Running         2
```

**步骤4: 在WSL中执行bash脚本**

```powershell
# 方法A: 从PowerShell执行
wsl bash dev-environment-setup.sh

# 方法B: 进入WSL环境
wsl
# 然后在WSL中执行
cd /mnt/d/iCloudDrive/Documents/深度架构/POC\ testbank/infrastructure
bash dev-environment-setup.sh
```

### 方案2: 使用Git Bash（更简单，推荐）

如果不想安装Ubuntu，可以直接使用Git Bash：

**步骤1: 安装Git for Windows**

1. 下载: https://git-scm.com/download/win
2. 安装时确保勾选 **"Git Bash Here"** 选项

**步骤2: 使用Git Bash执行脚本**

1. **打开Git Bash**:
   - 在项目目录右键 → **"Git Bash Here"**
   - 或从开始菜单打开 **"Git Bash"**

2. **执行脚本**:
   ```bash
   cd /d/iCloudDrive/Documents/深度架构/POC\ testbank/infrastructure
   chmod +x dev-environment-setup.sh
   ./dev-environment-setup.sh
   ```

### 方案3: 直接使用PowerShell执行kubectl命令

如果bash脚本无法执行，可以直接使用PowerShell：

```powershell
# 进入项目目录
cd "d:\iCloudDrive\Documents\深度架构\POC testbank\infrastructure"

# 创建命名空间
kubectl apply -f k8s\base\namespace.yaml

# 部署所有组件
kubectl apply -f k8s\base\consul\
kubectl apply -f k8s\base\kong\
kubectl apply -f k8s\base\nginx\

# 检查状态
kubectl get pods -n digital-bank-poc
kubectl get svc -n digital-bank-poc
```

## 🔍 安装Ubuntu后可能遇到的问题

### 问题1: 安装后无法启动

**解决方案**:
```powershell
# 设置Ubuntu为默认发行版
wsl --set-default Ubuntu

# 启动Ubuntu
wsl -d Ubuntu
```

### 问题2: 安装过程中网络错误

**解决方案**:
1. 检查网络连接
2. 如果使用代理，需要在WSL中配置代理
3. 或使用Microsoft Store安装（通常更稳定）

### 问题3: 安装后找不到bash

**解决方案**:
```powershell
# 进入Ubuntu
wsl -d Ubuntu

# 更新软件包列表
sudo apt update

# 确保bash已安装
sudo apt install bash
```

## 📋 快速操作指南

### 安装Ubuntu（3步）

```powershell
# 步骤1: 安装Ubuntu
wsl --install -d Ubuntu

# 步骤2: 等待安装完成，首次启动时设置用户名和密码

# 步骤3: 验证安装
wsl --list --verbose
```

### 使用Git Bash（2步）

```bash
# 步骤1: 安装Git for Windows（如果未安装）
# 下载: https://git-scm.com/download/win

# 步骤2: 在项目目录右键 → "Git Bash Here"
# 然后执行: ./dev-environment-setup.sh
```

## 🎯 推荐方案

**对于您的当前情况，推荐使用方案2（Git Bash）**，因为：

1. ✅ 无需安装Ubuntu
2. ✅ 安装简单快速
3. ✅ 完全兼容bash脚本
4. ✅ 无需处理WSL路径转换问题

**如果您需要完整的Linux环境**，则推荐方案1（安装Ubuntu）。

## 📚 相关文档

- [WINDOWS-BASH-SCRIPT-FIX.md](./WINDOWS-BASH-SCRIPT-FIX.md) - Bash脚本执行问题修复
- [WINDOWS-TROUBLESHOOTING.md](./WINDOWS-TROUBLESHOOTING.md) - 详细故障排查
- [WINDOWS-QUICK-START.md](./WINDOWS-QUICK-START.md) - 快速开始指南

---

**提示**: 如果您只是想执行部署脚本，使用Git Bash是最快的解决方案。
