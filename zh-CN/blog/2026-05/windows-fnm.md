---
lastUpdated: true
commentabled: true
recommended: true
title: Windows 前端环境进化论
description: 告别 nvm，拥抱 Rust 编写的 fnm！
date: 2026-05-21 09:15:00 
pageClass: blog-page-class
cover: /covers/platform.svg
---

> 前言：在 Windows 上开发，你是否忍受过 `nvm-windows` 切换版本时的缓慢？甚至因为环境变量没配对导致 `node -v` 毫无反应？今天推荐大家更换为 fnm (Fast Node Manager) 。它基于 Rust 开发，主打一个“快”字，且对 Windows 原生支持极佳。

## 🛑 第一步：彻底清理旧环境 (卸载 nvm) ##

为了避免多个 Node 管理器抢夺 `PATH` 变量，建议先送走 `nvm-windows`。

- 卸载程序：打开“控制面板” -> “程序和功能”，找到 `nvm-windows` 并点击卸载。

- 清理残留：删除文件夹 `C:\Users\你的用户名\AppData\Roaming\nvm`（如果有）。

- 清理环境变量：

  - 右键“此电脑” -> “属性” -> “高级系统设置” -> “环境变量”。
  - 在用户变量中，删除 `NVM_HOME` 和 `NVM_SYMLINK`。
  - 在 Path 变量中，删除包含 `%NVM_HOME%` 或 `%NVM_SYMLINK%` 的行。

- 验证：打开 PowerShell，输入 `node -v`。如果提示“不是内部或外部命令”，说明清理干净了。

## 🚀 第二步：安装 fnm ##

在 Windows 上，最推荐使用 Winget（Win10/11 自带的包管理器），无需手动下载安装包。

打开 PowerShell (推荐管理员模式)，运行：

```bash
winget install Schniz.fnm
```

如果你习惯用 Scoop，也可以执行：`scoop install fnm`

## ⚙️ 第三步：配置环境变量 (核心避坑区) ##

安装完 fnm 必须手动激活环境，否则执行 `fnm use` 会报错。

### 创建并打开配置文件 ###

在 PowerShell 中输入：

```bash
# 如果提示找不到路径，请先运行这一行创建文件
if (!(Test-Path -Path $PROFILE)) { New-Item -ItemType File -Path $PROFILE -Force }

# 打开配置文件
notepad $PROFILE
```

### 写入激活代码 ###

在打开的记事本末尾，粘贴以下代码并保存（Ctrl+S）：

```bash
fnm env --use-on-cd | Out-String | Invoke-Expression
```

### 🔐 第四步：解决“禁止运行脚本”报错 (必看) ###

重启终端后，你可能会看到一片红字报错：*“在此系统上禁止运行脚本”*。这是因为 Windows 默认限制了脚本权限。

解决方法：

- 以 `管理员身份` 运行 PowerShell。

- 执行以下命令：

```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

- 输入 `Y` 并回车确认。

- 重启终端，报错消失。

## 📌 第五步：设置默认 Node 版本 ##

安装好 fnm 后，你需要下载并指定一个全局默认版本：

```bash
# 1. 安装最新的 LTS 版本 (或者指定版本号，如 fnm install 20)
fnm install --lts

# 2. 将该版本设为全局默认
fnm default 20

# 3. 验证
node -v
```

## 📦 第六步：进阶 —— 找回丢失的 Yarn/Pnpm ##

### 首选 pnpm？ ###

- 速度极快：比 npm/yarn 快 2-3 倍。
- 节省空间：基于内容寻址存储，相同的依赖在全局只存一份，不会重复占用磁盘。
- 严格模式：解决“幽灵依赖”问题，让你的项目更稳健。

### 安装 pnpm (推荐方式) ###

在 Windows 环境下，如果你已经按照前文配置好了 fnm，直接用 `corepack` 激活是最优雅的：

```bash
# 1. 激活 Node 内置的 corepack
corepack enable

# 2. 准备 pnpm
corepack prepare pnpm@latest --activate

# 3. 验证
pnpm -v
```

> 注意：如果你的项目里已经有 `pnpm-lock.yaml`，corepack 会自动根据项目要求的版本进行切换，非常省心。

切换 Node 版本后，全局安装的 `yarn` 会“消失”。推荐使用 Node 官方内置的 Corepack 来解决，无需重复安装。

#### 方法 A：使用内置 Corepack (推荐) ####

Node v16.13+ 官方内置了 corepack，可以无感激活 Yarn：

```bash
# 激活 Node 内置的包管理工具管理器
corepack enable

# 验证 Yarn 是否可用
yarn -v
```

这种方式最稳妥，它会根据你项目里的 `packageManager` 字段自动匹配 Yarn 版本。

#### 方法 B：手动全局安装 ####

如果你更喜欢传统方式：

```bash
fnm use 20  # 先切换到你要用的版本
npm install -g yarn
```

## 🛠️ Windows 常用指令速查 ##

| 命令 | 说明 |
| ----- | ------ |
| **`fnm ls-remote`** | 列出所有可下载的 Node 版本 |
| **`fnm list`** | 查看本地已安装的版本 |
| **`fnm install <version>`** | 安装指定版本 |
| **`fnm use <version>`** | 临时切换版本 |
| **`fnm default <version>`** | 永久设置默认版本 |

## ⚠️ Windows 专属避坑指南 ##

- 权限报错：如果在执行 `fnm default` 或 `fnm use` 时报符号链接（Symlink）错误，请以管理员身份运行 PowerShell，或者在系统设置中开启“开发者模式”。
- 终端选择：强烈建议配合 Microsoft Terminal 使用，配合 `oh-my-posh` 视觉体验更佳。
- 彻底卸载官方版 Node：如果你之前是从 Node.js 官网下载的 `.msi` 安装包安装的 Node，请务必先去控制面板卸载它，否则它会占用系统路径，导致 fnm 失效。

## Windows 开发效率：一键添加“右键在此处打开 PowerShell (管理员)”全攻略 ##

在 Windows 上做前端开发，频繁切换目录是常态。虽然 Win11 自带了终端右键菜单，但很多时候我们需要管理员权限，或者需要原生 PowerShell。

### 🚀 核心脚本：一键导入 ###

新建一个记事本，将以下内容粘贴进去，保存并重命名为 `add_powershell.reg`（确保后缀是 .reg）。
代码段

```bash
Windows Registry Editor Version 5.00

; --- 1. 普通权限版 ---
[HKEY_CURRENT_USER\Software\Classes\directory\Background\shell\PowerShell]
@="在此处打开 PowerShell"
"Icon"="powershell.exe"

[HKEY_CURRENT_USER\Software\Classes\directory\Background\shell\PowerShell\command]
@="powershell.exe -noexit -command "Set-Location -LiteralPath '%V'""

; --- 2. 管理员权限版 ---
[HKEY_CURRENT_USER\Software\Classes\directory\Background\shell\PowerShellAdmin]
@="在此处打开 PowerShell (管理员)"
"Icon"="powershell.exe"

[HKEY_CURRENT_USER\Software\Classes\directory\Background\shell\PowerShellAdmin\command]
@="powershell.exe -Command "Start-Process powershell -ArgumentList '-noexit','-command',\"Set-Location -LiteralPath '%V'\" -Verb RunAs""
```

### 后悔药：如何卸载？ ###

如果不想要了，新建 `.reg` 运行以下内容即可清理干净：

```bash
Windows Registry Editor Version 5.00

[-HKEY_CURRENT_USER\Software\Classes\directory\Background\shell\PowerShell]
[-HKEY_CURRENT_USER\Software\Classes\directory\Background\shell\PowerShellAdmin]
```

## ⚠️ 必看：避坑指南（三大生存法则） ##

如果你直接保存运行，可能会遇到以下三个问题，请务必对号入座：

### 解决中文乱码（最重要！） ###

现象：右键菜单显示一串看不懂的符号。 对策：保存 `.reg` 文件时，点击“另存为”，在底部的 【编码】 下拉框中选择 ANSI 或 UTF-16 LE。千万不要选默认的 UTF-8。

## 结语 ##

从 `nvm` 迁移到 `fnm` 后，最直观的感受是打开终端再也没有那 0.5 秒的延迟了。作为追求效率的前端开发，这波“装备升级”绝对值得！

本文档介绍如何在 Windows 系统中安装 fnm (Fast Node Manager) 并配置 CMD、PowerShell 和 PowerShell 7 终端以自动加载 Node.js 环境。

## 前提条件 ##

- Windows 10 或更高版本
- 已安装 WinGet（Windows 包管理器）

## 安装 fnm ##

使用 WinGet 安装 fnm：

```bash
winget install Schniz.fnm
```

## 配置终端 ##

### 配置 PowerShell 7 ###

PowerShell 7 使用独立的配置文件路径。需要创建以下配置文件：

```bash
# 创建 PowerShell 7 配置目录
New-Item -ItemType Directory -Path "$env:USERPROFILE\Documents\PowerShell" -Force

# 创建配置文件
New-Item -ItemType File -Path "$env:USERPROFILE\Documents\PowerShell\Microsoft.PowerShell_profile.ps1" -Force
```

在配置文件中添加以下内容：

```bash
fnm env --use-on-cd | Out-String | Invoke-Expression
```

可以通过以下命令一次性完成：

```bash
New-Item -ItemType Directory -Path 'C:\Users\leehoo\Documents\PowerShell' -Force
Set-Content -Path 'C:\Users\leehoo\Documents\PowerShell\Microsoft.PowerShell_profile.ps1' -Value 'fnm env --use-on-cd | Out-String | Invoke-Expression'
```

### 配置 Windows PowerShell ###

Windows PowerShell 使用以下配置文件路径：

```txt
C:\Users\leehoo\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
```

如果文件不存在，创建它并添加以下内容：

```bash
fnm env --use-on-cd | Out-String | Invoke-Expression
```

### 配置 CMD ###

CMD 没有配置文件机制，需要通过注册表设置 AutoRun。

#### 步骤 1：生成 fnm 初始化脚本 ####

```bash
fnm env --use-on-cd --shell cmd | ForEach-Object { '@' + $_ } | Out-File -FilePath "$env:APPDATA\fnm\fnm-init.cmd" -Encoding ASCII
```

#### 步骤 2：设置注册表 AutoRun ####

```bash
reg add 'HKCU\Software\Microsoft\Command Processor' /v AutoRun /t REG_SZ /d "call $env:APPDATA\fnm\fnm-init.cmd" /f
```

## 验证配置 ##

### PowerShell 7 / Windows PowerShell ###

重新打开 PowerShell 终端，运行：

```bash
node --version
npm --version
```

### CMD ###

重新打开 CMD 终端，运行：

```bash
node -v
npm -v
```

## 常用 fnm 命令 ##

```bash
# 列出已安装的 Node.js 版本
fnm list

# 安装 Node.js 版本
fnm install 20.10.0

# 切换 Node.js 版本
fnm use 20.10.0

# 设置默认版本
fnm default 20.10.0

# 卸载版本
fnm uninstall 20.10.0
```

## 注意事项 ##

- 每次修改配置后，需要重新打开终端才能生效
- `--use-on-cd` 选项会在切换目录时自动检测并使用对应的 Node.js 版本（基于 .nvmrc 或 package.json）
- CMD 的 AutoRun 设置会影响所有 CMD 窗口
- 如果需要移除 CMD 的 AutoRun 设置，运行：

```bash
reg delete 'HKCU\Software\Microsoft\Command Processor' /v AutoRun /f
```

## 配置文件位置总结 ##

| 终端 | 配置文件路径 |
| ----- | ------ |
| **PowerShell 7** | `C:\Users\Lance\Documents\PowerShell\Microsoft.PowerShell_profile.ps1` |
| **Windows PowerShell** | `C:\Users\Lance\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1` |
| **CMD** | `注册表：HKEY_CURRENT_USER\Software\Microsoft\Command Processor\AutoRun` |
| **fnm 初始化脚本** | `C:\Users\Lance\AppData\Roaming\fnm\fnm-init.cmd` |

## 故障排除 ##

### CMD 中显示命令输出 ###

如果 CMD 启动时显示 `SET` 命令，确保 `fnm-init.cmd` 文件每行都以 `@` 开头：

```bash
@SET PATH=...
@SET FNM_MULTISHELL_PATH=...
```

### Node.js 命令不可用 ###

- 确认 fnm 已正确安装：`fnm --version`
- 确认已安装 Node.js 版本：`fnm list`
- 检查配置文件路径是否正确
- 重新打开终端

### PowerShell 配置不生效 ###

- 检查配置文件是否存在
- 运行 `$PROFILE` 查看当前配置文件路径
- 手动加载配置：`. $PROFILE`
