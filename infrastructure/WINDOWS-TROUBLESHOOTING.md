# Windows环境故障排查指南

本文档提供Windows环境下常见问题的详细解决方案。

## 🔧 常见问题解决

### 问题1: WSL安装需要管理员权限

**错误信息**: `请求的操作需要提升` 或 `The requested operation requires elevation`

#### 解决方案

**方法1: 以管理员身份运行PowerShell**

1. **打开管理员PowerShell**:
   - 按 `Win + X`
   - 选择 **"Windows PowerShell (管理员)"** 或 **"终端 (管理员)"**
   - 或在开始菜单搜索 "PowerShell"，右键选择 **"以管理员身份运行"**

2. **执行WSL安装命令**:
   ```powershell
   wsl --install
   ```

3. **如果提示需要重启**:
   ```powershell
   # 重启计算机
   Restart-Computer
   ```

**方法2: 使用图形界面启用WSL**

1. 按 `Win + R`，输入 `appwiz.cpl`，回车
2. 点击左侧 **"启用或关闭Windows功能"**
3. 勾选以下选项:
   - ✅ **适用于Linux的Windows子系统**
   - ✅ **虚拟机平台** (如果可用)
4. 点击 **确定**，等待安装完成
5. 重启计算机

**方法3: 使用DISM命令（管理员PowerShell）**

```powershell
# 启用WSL功能
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# 启用虚拟机平台
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# 重启计算机
Restart-Computer
```

### 问题2: 安全频道支持出错

**错误信息**: `安全频道支持出错` 或 `The security channel support error`

这个错误通常与TLS/SSL证书或网络配置有关。

#### 解决方案

**方法1: 更新TLS设置（管理员PowerShell）**

```powershell
# 启用TLS 1.2和1.3
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13

# 设置默认安全协议
[Net.ServicePointManager]::SecurityProtocol = 'Tls12, Tls13'

# 然后重试WSL安装
wsl --install
```

**方法2: 修复Windows更新组件**

```powershell
# 以管理员身份运行
# 停止Windows Update服务
Stop-Service wuauserv
Stop-Service cryptSvc
Stop-Service bits
Stop-Service msiserver

# 重命名软件分发文件夹
Rename-Item C:\Windows\SoftwareDistribution SoftwareDistribution.old
Rename-Item C:\Windows\System32\catroot2 catroot2.old

# 重启服务
Start-Service wuauserv
Start-Service cryptSvc
Start-Service bits
Start-Service msiserver

# 运行Windows Update修复
sfc /scannow
DISM /Online /Cleanup-Image /RestoreHealth
```

**方法3: 使用系统文件检查器**

```powershell
# 以管理员身份运行
# 检查系统文件完整性
sfc /scannow

# 修复Windows映像
DISM /Online /Cleanup-Image /RestoreHealth

# 重启后重试
Restart-Computer
```

**方法4: 手动下载WSL更新包**

如果网络问题持续，可以手动下载WSL更新：

1. 访问: https://aka.ms/wsl2kernel
2. 下载 **WSL2 Linux内核更新包**
3. 运行安装程序
4. 然后执行:
   ```powershell
   wsl --set-default-version 2
   wsl --install -d Ubuntu
   ```

### 问题3: WSL安装后无法启动

**症状**: WSL安装成功但无法启动Linux发行版

#### 解决方案

**检查WSL状态**:
```powershell
# 检查WSL版本
wsl --status

# 检查已安装的发行版
wsl --list --verbose

# 设置默认版本为WSL 2
wsl --set-default-version 2
```

**如果WSL 2未启用**:
```powershell
# 启用WSL 2
wsl --set-default-version 2

# 如果失败，可能需要启用虚拟化
# 在BIOS中启用虚拟化支持（VT-x/AMD-V）
```

### 问题4: Docker Desktop需要WSL 2但无法启用

**症状**: Docker Desktop提示需要WSL 2

#### 解决方案

**步骤1: 确保WSL 2已安装**

```powershell
# 以管理员身份运行
wsl --install

# 或手动启用功能
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

**步骤2: 安装WSL 2内核更新**

1. 下载: https://aka.ms/wsl2kernel
2. 运行安装程序

**步骤3: 设置WSL 2为默认版本**

```powershell
wsl --set-default-version 2
```

**步骤4: 验证WSL 2**

```powershell
wsl --status
# 应该显示: Default Version: 2
```

**步骤5: 重启Docker Desktop**

### 问题5: 虚拟化未启用

**症状**: Docker Desktop或WSL无法启动，提示虚拟化未启用

#### 解决方案

**步骤1: 检查虚拟化状态**

```powershell
# 检查虚拟化是否启用
systeminfo | findstr /C:"Hyper-V要求"

# 或在任务管理器中查看
# 性能 → CPU → 虚拟化: 已启用
```

**步骤2: 在BIOS中启用虚拟化**

1. **重启计算机**
2. **进入BIOS设置**:
   - 开机时按 `F2`, `F10`, `F12`, `Del` 或 `Esc`（取决于主板）
   - 或Windows 10/11: 设置 → 更新和安全 → 恢复 → 高级启动 → 立即重启 → 疑难解答 → 高级选项 → UEFI固件设置

3. **查找虚拟化选项**:
   - Intel CPU: 查找 **"Intel Virtualization Technology"** 或 **"VT-x"**
   - AMD CPU: 查找 **"AMD-V"** 或 **"SVM Mode"**

4. **启用虚拟化**:
   - 将选项设置为 **"Enabled"**
   - 保存并退出（通常是 `F10`）

5. **重启计算机**

**步骤3: 在Windows中启用Hyper-V（可选）**

```powershell
# 以管理员身份运行
# 启用Hyper-V（如果支持）
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All

# 或使用DISM
dism.exe /online /enable-feature /featurename:Microsoft-Hyper-V /all /norestart
```

### 问题6: 网络连接问题导致安装失败

**症状**: 下载WSL或Docker时网络错误

#### 解决方案

**方法1: 配置代理（如果使用代理）**

```powershell
# 设置代理环境变量
$env:HTTP_PROXY = "http://proxy-server:port"
$env:HTTPS_PROXY = "http://proxy-server:port"

# 或使用系统代理设置
netsh winhttp set proxy proxy-server:port
```

**方法2: 使用镜像源（中国用户）**

对于WSL Linux发行版，可以使用国内镜像：

```powershell
# 安装Ubuntu后，在Ubuntu中配置镜像源
# 编辑sources.list
sudo sed -i 's/archive.ubuntu.com/mirrors.ustc.edu.cn/g' /etc/apt/sources.list
```

**方法3: 手动下载安装包**

- WSL内核更新: https://aka.ms/wsl2kernel
- Docker Desktop: https://www.docker.com/products/docker-desktop/
- Ubuntu: 从Microsoft Store安装

### 问题7: 权限问题

**症状**: 各种操作提示权限不足

#### 解决方案

**始终使用管理员权限**:

1. **右键点击PowerShell/命令提示符**
2. 选择 **"以管理员身份运行"**
3. 确认UAC提示

**检查当前用户权限**:

```powershell
# 检查是否为管理员
([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
```

**如果返回 `True`，说明是管理员；如果返回 `False`，需要以管理员身份运行。**

### 问题8: 防火墙阻止连接

**症状**: 无法下载或连接服务

#### 解决方案

**临时禁用防火墙（仅用于测试）**:

```powershell
# 以管理员身份运行
# 禁用防火墙（不推荐，仅用于测试）
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# 测试后重新启用
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

**添加防火墙规则（推荐）**:

```powershell
# 允许Docker Desktop
New-NetFirewallRule -DisplayName "Docker Desktop" -Direction Inbound -Program "C:\Program Files\Docker\Docker\Docker Desktop.exe" -Action Allow
```

## 🔍 诊断命令

### 检查系统状态

```powershell
# 检查Windows版本
winver

# 检查系统信息
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"

# 检查虚拟化支持
systeminfo | findstr /C:"Hyper-V要求"

# 检查WSL状态
wsl --status
wsl --list --verbose

# 检查Docker状态
docker --version
docker info

# 检查Kubernetes状态
kubectl version --client
kubectl cluster-info
```

### 检查网络连接

```powershell
# 测试网络连接
Test-NetConnection -ComputerName www.microsoft.com -Port 443

# 检查DNS解析
nslookup www.microsoft.com

# 检查代理设置
netsh winhttp show proxy
```

## 📝 完整安装流程（解决所有问题后）

### 步骤1: 以管理员身份打开PowerShell

按 `Win + X`，选择 **"Windows PowerShell (管理员)"**

### 步骤2: 配置TLS（解决安全频道错误）

```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13
```

### 步骤3: 启用WSL功能

```powershell
# 启用WSL
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# 启用虚拟机平台
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# 重启计算机
Restart-Computer
```

### 步骤4: 重启后继续（管理员PowerShell）

```powershell
# 设置WSL默认版本
wsl --set-default-version 2

# 安装Ubuntu（或其他发行版）
wsl --install -d Ubuntu

# 或从Microsoft Store安装
# 打开Microsoft Store，搜索"Ubuntu"，安装
```

### 步骤5: 安装Docker Desktop

1. 下载: https://www.docker.com/products/docker-desktop/
2. 运行安装程序
3. 安装时选择 **"Use WSL 2 instead of Hyper-V"**
4. 完成安装并重启

### 步骤6: 启用Kubernetes

1. 打开Docker Desktop
2. 设置 → Kubernetes → 启用Kubernetes
3. 等待启动完成

### 问题9: WSL执行bash脚本失败

**错误信息**: 
```
wsl: 检测到 localhost 代理配置，但未镜像到 WSL。NAT 模式下的 WSL 不支持 localhost 代理。
<3>WSL (6144 - Relay) ERROR: CreateProcessCommon:800: execvpe(/bin/bash) failed: No such file or directory
```

**症状**: 在PowerShell中执行 `bash dev-environment-setup.sh` 时失败

#### 解决方案

**方法1: 使用Git Bash（推荐）**

1. **安装Git for Windows**（如果未安装）:
   - 下载: https://git-scm.com/download/win
   - 安装时确保勾选 "Git Bash Here"

2. **使用Git Bash执行**:
   ```bash
   # 在项目目录右键 → "Git Bash Here"
   # 或从开始菜单打开Git Bash
   cd /d/iCloudDrive/Documents/深度架构/POC\ testbank/infrastructure
   chmod +x dev-environment-setup.sh
   ./dev-environment-setup.sh
   ```

**方法2: 修复WSL并安装Linux发行版**

```powershell
# 检查WSL状态
wsl --status
wsl --list --verbose

# 如果列表为空，安装Ubuntu
wsl --install -d Ubuntu

# 然后在WSL中执行
wsl bash dev-environment-setup.sh
```

**方法3: 直接使用PowerShell执行kubectl命令**

```powershell
# 无需bash脚本，直接执行kubectl命令
kubectl apply -f k8s\base\namespace.yaml
kubectl apply -f k8s\base\consul\
kubectl apply -f k8s\base\kong\
kubectl apply -f k8s\base\nginx\
```

**详细说明**: 请查看 [WINDOWS-BASH-SCRIPT-FIX.md](./WINDOWS-BASH-SCRIPT-FIX.md)

## 🆘 获取更多帮助

如果以上方法都无法解决问题：

1. **查看Windows事件查看器**:
   - 按 `Win + R`，输入 `eventvwr.msc`
   - 查看Windows日志 → 应用程序和系统

2. **查看Docker Desktop日志**:
   - 位置: `%LOCALAPPDATA%\Docker\log.txt`

3. **查看WSL日志**:
   ```powershell
   # WSL日志位置
   %USERPROFILE%\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu*\LocalState\
   ```

4. **联系支持**:
   - Docker Desktop: https://docs.docker.com/desktop/troubleshoot/
   - WSL: https://docs.microsoft.com/windows/wsl/troubleshooting

---

**提示**: 大多数问题都可以通过"以管理员身份运行PowerShell"解决。如果问题持续，请检查BIOS中的虚拟化设置。
