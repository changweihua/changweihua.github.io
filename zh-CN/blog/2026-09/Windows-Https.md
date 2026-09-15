---
lastUpdated: true
commentabled: true
recommended: true
title: Windows 本地 HTTPS 证书生成指南
description: Windows 本地 HTTPS 证书生成指南
date: 2026-09-14 10:15:00
pageClass: blog-page-class
cover: /covers/platform.svg
---

## 背景 ##

当主域名（如 `xxxx.com`）配置了 HSTS（HTTP Strict Transport Security）或被加入浏览器 HSTS Preload List 时，所有子域名（包括本地 hosts 配置的 `local.xxxx.com`）都会被浏览器强制使用 HTTPS 访问。

此时本地 Vite 开发环境需要支持 HTTPS 才能正常访问。本指南使用 Windows 系统自带的 PowerShell 生成自签名证书，无需安装 mkcert、OpenSSL 等任何第三方工具。

## 快速开始：一键脚本（推荐） ##

### 准备工作 ###

以 管理员身份 打开 PowerShell 或 Windows 终端
确定你的项目目录路径（如 `D:\projects\my-app`）

### 创建脚本文件 ###

在项目根目录下新建 `生成证书.ps1`，内容如下：

```bash
# ============================================
#  本地 HTTPS 自签名证书一键生成脚本（Windows）
#  使用方法：右键 → 使用 PowerShell 运行（需管理员权限）
# ============================================

# === 配置区：根据你的实际情况修改 ===
$domain        = "local.xxxx.com"  # 本地开发域名
$certFriendly  = "local.xxxx.com dev cert"  # 证书友好名称
$projectPath   = "D:\projects\my-app"  # 项目根目录路径
$pfxPassword   = "123456"  # pfx 文件密码，本地用随便设
$validYears    = 10  # 证书有效期（年）
# ===================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  本地 HTTPS 证书一键生成工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
  Write-Host "❌ 请以管理员身份运行此脚本！" -ForegroundColor Red
  Write-Host "   右键脚本 → 使用 PowerShell 运行（管理员）" -ForegroundColor Yellow
  Read-Host "按回车键退出"
  exit 1
}

# 检查项目目录是否存在
if (-not (Test-Path $projectPath)) {
  Write-Host "❌ 项目目录不存在: $projectPath" -ForegroundColor Red
  Read-Host "按回车键退出"
  exit 1
}

# 1. 生成自签名证书
Write-Host "📝 正在生成自签名证书..." -ForegroundColor Yellow
try {
  $cert = New-SelfSignedCertificate `
    -DnsName $domain, "localhost", "127.0.0.1" `
    -CertStoreLocation "Cert:\LocalMachine\My" `
    -FriendlyName $certFriendly `
    -NotAfter (Get-Date).AddYears($validYears) `
    -KeyUsage DigitalSignature, KeyEncipherment `
    -Type SSLServerAuthentication
  Write-Host "✅ 证书生成成功" -ForegroundColor Green
  Write-Host "   指纹: $($cert.Thumbprint)"
  Write-Host "   有效期至: $($cert.NotAfter)"
} catch {
  Write-Host "❌ 证书生成失败: $_" -ForegroundColor Red
  Read-Host "按回车键退出"
  exit 1
}

# 2. 安装到受信任根证书颁发机构
Write-Host ""
Write-Host "🔒 正在安装到受信任根证书颁发机构..." -ForegroundColor Yellow
try {
  $rootStore = New-Object System.Security.Cryptography.X509Certificates.X509Store(
    [System.Security.Cryptography.X509Certificates.StoreName]::Root,
    [System.Security.Cryptography.X509Certificates.StoreLocation]::LocalMachine
  )
  $rootStore.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
  $rootStore.Add($cert)
  $rootStore.Close()
  Write-Host "✅ 已安装到受信任根证书颁发机构" -ForegroundColor Green
} catch {
  Write-Host "❌ 安装到根证书失败: $_" -ForegroundColor Red
}

# 3. 创建 cert 目录并导出 pfx
Write-Host ""
Write-Host "📦 正在导出 PFX 证书文件..." -ForegroundColor Yellow
$certDir = Join-Path $projectPath "cert"
New-Item -ItemType Directory -Path $certDir -Force | Out-Null

$pfxPath = Join-Path $certDir "$domain.pfx"
$securePwd = ConvertTo-SecureString -String $pfxPassword -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $securePwd | Out-Null
Write-Host "✅ PFX 文件已导出: $pfxPath" -ForegroundColor Green

# 4. 尝试用 OpenSSL 提取 pem 和 key（如果系统有）
$hasOpenSsl = Get-Command openssl -ErrorAction SilentlyContinue
if ($hasOpenSsl) {
  Write-Host ""
  Write-Host "🔑 检测到 OpenSSL，正在提取 .pem 和 .key 文件..." -ForegroundColor Yellow
  Push-Location $certDir
  openssl pkcs12 -in "$domain.pfx" -clcerts -nokeys -out "$domain.pem" -passin "pass:$pfxPassword" 2>$null
  openssl pkcs12 -in "$domain.pfx" -nocerts -nodes -out "$domain-key.pem" -passin "pass:$pfxPassword" 2>$null
  Pop-Location
  Write-Host "✅ 已提取 $domain.pem 和 $domain-key.pem" -ForegroundColor Green
} else {
  Write-Host ""
  Write-Host "⚠️  未检测到 OpenSSL，将直接使用 PFX 文件配置 Vite" -ForegroundColor Yellow
  Write-Host "   （Vite 原生支持 pfx 格式，无需转换）"
}

# 输出总结
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  🎉 全部完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "证书文件位置:"
Write-Host "  PFX: $pfxPath"
if ($hasOpenSsl) {
  Write-Host "  PEM: $(Join-Path $certDir "$domain.pem")"
  Write-Host "  KEY: $(Join-Path $certDir "$domain-key.pem")"
}
Write-Host ""
Write-Host "接下来请在 vite.config.js 中配置 https，" -ForegroundColor Cyan
Write-Host "配置示例见同目录下的 Vite 配置说明。" -ForegroundColor Cyan
Write-Host ""
Read-Host "按回车键退出"
```

### 运行脚本 ###

1. 修改脚本顶部的 配置区（域名、项目路径等）
2. 右键脚本文件 → "使用 PowerShell 运行"（需管理员权限）
3. 等待执行完成

## 手动分步操作（不用脚本） ##

如果你不想用脚本，也可以按以下步骤手动操作。

### 步骤 1：以管理员身份打开 PowerShell ###

右键开始菜单 → "终端 (管理员)" 或 "Windows PowerShell (管理员)"。

### 步骤 2：生成自签名证书 ###

```bash
New-SelfSignedCertificate `
  -DnsName "local.xxxx.com", "localhost", "127.0.0.1" `
  -CertStoreLocation "Cert:\LocalMachine\My" `
  -FriendlyName "local.xxxx.com dev cert" `
  -NotAfter (Get-Date).AddYears(10)
```

执行成功后，复制输出的 指纹（Thumbprint）。

### 步骤 3：查找证书（如果忘了指纹） ###

```bash
Get-ChildItem -Path Cert:\LocalMachine\My | Where-Object { $_.FriendlyName -eq "local.xxxx.com dev cert" }
```

### 步骤 4：安装到受信任根证书颁发机构 ###

```bash
$cert = Get-Item -Path "Cert:\LocalMachine\My\你的证书指纹"

$rootStore = New-Object System.Security.Cryptography.X509Certificates.X509Store(
  [System.Security.Cryptography.X509Certificates.StoreName]::Root,
  [System.Security.Cryptography.X509Certificates.StoreLocation]::LocalMachine
)
$rootStore.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
$rootStore.Add($cert)
$rootStore.Close()
```

> 弹出确认框时选择 "是"。

### 步骤 5：导出 PFX 文件 ###

```bash
# 进入项目目录
cd D:\projects\my-app

# 创建 cert 目录
New-Item -ItemType Directory -Path cert -Force

# 导出 pfx
$cert = Get-Item -Path "Cert:\LocalMachine\My\你的证书指纹"
$pwd = ConvertTo-SecureString -String "123456" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath "cert\local.xxxx.com.pfx" -Password $pwd
```

## Vite 配置 HTTPS ##

### 方式 A：使用 PFX 文件（推荐，无需 OpenSSL） ###

修改 `vite.config.js`（或 `vite.config.ts`）：

```js
import { defineConfig } from 'vite'
import fs from 'fs'
// import vue from '@vitejs/plugin-vue'    // Vue 项目
// import react from '@vitejs/plugin-react' // React 项目

export default defineConfig({
  // plugins: [vue()],
  server: {
    host: 'local.xxxx.com',
    port: 5173,
    https: {
      pfx: fs.readFileSync('./cert/local.xxxx.com.pfx'),
      passphrase: '123456', // 你设置的 pfx 密码
    },
    // 后端代理配置（按需添加）
    // proxy: {
    //   '/api': {
    //     target: 'https://api.xxxx.com',
    //     changeOrigin: true,
    //   }
    // }
  },
})
```

### 方式 B：使用 PEM + KEY 文件（需已通过 OpenSSL 转换） ###

```ts
import { defineConfig } from 'vite'
import fs from 'fs'

export default defineConfig({
  server: {
    host: 'local.xxxx.com',
    port: 5173,
    https: {
      key: fs.readFileSync('./cert/local.xxxx.com-key.pem'),
      cert: fs.readFileSync('./cert/local.xxxx.com.pem'),
    },
  },
})
```

### 方式 C：使用 @vitejs/plugin-basic-ssl 插件（零配置快速尝鲜） ###

如果你只是想临时快速验证一下，不想生成证书、也不想折腾系统证书库，可以用 Vite 官方提供的 `@vitejs/plugin-basic-ssl` 插件。它会在每次启动时自动生成一张自签名证书，完全零配置。

#### 安装插件 ####

```bash
npm install @vitejs/plugin-basic-ssl -D
```

#### 配置 vite.config.js ####

```ts
import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
// import vue from '@vitejs/plugin-vue'    // Vue 项目
// import react from '@vitejs/plugin-react' // React 项目

export default defineConfig({
  plugins: [
    basicSsl(),
    // vue(),
    // react(),
  ],
  server: {
    host: 'local.xxxx.com',
    port: 5173,
    https: true, // 开启 HTTPS
  },
})
```

#### 启动访问 ####

```bash
npm run dev
```

打开浏览器访问：`https://local.xxxx.com:5173`

> ⚠️ 注意：第一次打开时浏览器会提示"您的连接不是私密连接"，因为这是自动生成的自签名证书，系统不信任。
>
> 解决方法：点击页面上的 "高级" → "继续前往 local.xxxx.com（不安全）" 即可正常访问。每次重新启动 dev 服务证书都会重新生成，可能需要重复此操作。

### 优缺点 ###

| 优点 | 缺点 |
| :--- | :--- |
| ✅ 零配置，装完插件就能用 | ❌ 浏览器始终报"不安全"，需手动点继续 |
| ✅ 不需要生成和管理证书文件 | ❌ 每次重启 dev 可能重新生成证书，体验不稳定 |
| ✅ 跨平台，任何系统都能用 | ❌ 某些对证书要求严格的场景（如 iframe 嵌入、某些 API）可能无法使用 |
| ✅ 适合临时快速验证 | ❌ 不适合长期日常开发 |

### 适用场景 ###

- 临时调试一个 HTTPS 相关的小问题
- 刚接手项目，想先跑起来看看效果
- 对浏览器证书警告不敏感的场景

> 💡 提示：如果长期开发使用，还是推荐方式 A（PowerShell 自签名证书 + 安装到根证书），一次配置终身受用，浏览器地址栏是干净的小锁图标。

### 启动访问 ###

```bash
npm run dev
```

打开浏览器访问：`https://local.xxxx.com:5173`

PowerShell / mkcert 方案下地址栏会显示 🔒 小锁图标，证书完全受信任；basic-ssl 插件方案需手动点击"继续前往"。

## 常见问题 ##

### Q1: Firefox 浏览器仍然提示不安全？ ###

Firefox 使用自己独立的证书库，不会自动读取系统根证书。需要手动导入：

1. Firefox 设置 → 隐私与安全 → 安全 → 证书 → 查看证书
2. 切换到 "证书颁发机构" 标签
3. 点击 "导入" → 选择 cert\local.xxxx.com.pem 文件
4. 勾选 "信任此 CA 以标识网站" → 确定

### Q2: 怎么删除已生成的证书？ ###

```bash
# 删除个人存储中的证书
Get-ChildItem Cert:\LocalMachine\My | Where-Object { $_.FriendlyName -eq "local.xxxx.com dev cert" } | Remove-Item

# 删除根证书中的（需要先找到指纹）
Get-ChildItem Cert:\LocalMachine\Root | Where-Object { $_.FriendlyName -eq "local.xxxx.com dev cert" } | Remove-Item
```

### Q3: 证书过期了怎么办？ ###

重新执行一次生成脚本即可，旧证书可以删掉也可以保留。

### Q4: 可以给多个域名用同一张证书吗？ ###

可以，在 `-DnsName` 参数中添加所有需要的域名即可：

```bash
-DnsName "local.xxxx.com", "dev.xxxx.com", "test.xxxx.com", "localhost", "127.0.0.1"
```

### Q5: hosts 文件怎么配置？ ###

打开 `C:\Windows\System32\drivers\etc\hosts`（需要管理员权限编辑），添加一行：

```txt
127.0.0.1   local.xxxx.com
```

保存后，在命令行执行 `ipconfig` /`flushdns` 刷新 DNS 缓存。

## 方案对比 ##

| 对比项 | PowerShell 原生方案 | mkcert | `@vitejs/plugin-basic-ssl` |
| :--- | :--- | :--- | :--- |
| 需要安装额外工具 | ❌ 不需要 | ✅ 需要安装 mkcert | ✅ 需要 npm 安装插件 |
| 操作复杂度 | 中等 | 简单 | 最简单 |
| 跨平台 | 仅 Windows | Win/Mac/Linux | 跨平台 |
| 浏览器信任 | 安装到根证书后信任 | 自动信任 | ❌ 始终报不安全，需手动跳过 |
| 证书有效期 | 自定义（默认 10 年） | 默认几年 | 每次启动重新生成 |
| 地址栏小锁 | ✅ 有 | ✅ 有 | ❌ 没有，显示“不安全” |
| 推荐场景 | 不想装额外工具、长期开发 | 多项目/多机器复用、长期开发 | 临时快速验证、跑通即可 |

## 相关命令速查 ##

| 对比项 | PowerShell 原生方案 | mkcert | `@vitejs/plugin-basic-ssl` |
| :--- | :--- | :--- | :--- |
| 需要安装额外工具 | ❌ 不需要 | ✅ 需要安装 mkcert | ✅ 需要 npm 安装插件 |
| 操作复杂度 | 中等 | 简单 | 最简单 |
| 跨平台 | 仅 Windows | Win/Mac/Linux | 跨平台 |
| 浏览器信任 | 安装到根证书后信任 | 自动信任 | ❌ 始终报不安全，需手动跳过 |
| 证书有效期 | 自定义（默认 10 年） | 默认几年 | 每次启动重新生成 |
| 地址栏小锁 | ✅ 有 | ✅ 有 | ❌ 没有，显示“不安全” |
| 推荐场景 | 不想装额外工具、长期开发 | 多项目/多机器复用、长期开发 | 临时快速验证、跑通即可 |
