---
lastUpdated: true
commentabled: true
recommended: true
title: Electron 应用体积从 190MB+ 到 90MB
description: 一次「release 目录反推」的瘦身实战（electron-builder + Vite）
date: 2026-07-15 09:55:00
pageClass: blog-page-class
cover: /covers/electron.svg
---

## 摘要

我有一个 Electron + React + Vite（渲染进程）项目，打包后 安装包约 190MB+，安装目录更大。尝试过 `asar: true`、调整 `build.files` 但效果不明显。最终我改用“从 release 产物倒推”的方法定位体积大头，发现真正的问题是 渲染端依赖（antd/react 等）被以 `node_modules` 形式打进 app.asar。通过把渲染端依赖从 `dependencies` 迁移到 `devDependencies`，并只构建 x64，最终把安装包压到了 90MB+，app.asar 从 90MB 降到 4.89MB。

本文记录完整排查路径、关键命令、最终配置与注意事项，可直接复用。

## 背景：为什么 Electron 打包这么大？

Electron 的体积主要由两部分组成：

- Electron Runtime（Chromium + Node.js）：固定成本，通常几十到上百 MB。
- 你的应用资源（app.asar / resources）：可控，包含业务代码、前端构建产物、资源文件、依赖等。

_瘦身的核心_：让 “可控部分” 足够小；同时避免把不该打进生产的东西（尤其是 node_modules）塞进包里。

## 第 1 步：从 release/ 入手，先找“最大头”

不要猜，直接量化。

### 看安装包体积

release/ 里 installer 大小（例）：

- BinLockPro-Setup-1.1.0.exe：约 205MB（优化前）

### 看 win-unpacked 里各文件大小（PowerShell）

```powershell
Get-ChildItem -Path ".\release\win-unpacked" -File |
  ForEach-Object { [PSCustomObject]@{Name=$_.Name; SizeMB=[math]::Round($_.Length/1MB,2)} } |
  Sort-Object SizeMB -Descending |
  Select-Object -First 15 |
  Format-Table -AutoSize
```

我当时看到最异常的一条：

- `BinLockPro.exe` 200MB（非常大）

同时 `resources/` 目录也不小，所以继续看 resources：

```powershell
Get-ChildItem -Path ".\release\win-unpacked\resources" |
  ForEach-Object {
    if($_.PSIsContainer) {
      $size=(Get-ChildItem $_.FullName -Recurse -File | Measure-Object Length -Sum).Sum
      [PSCustomObject]@{Name=$_.Name; SizeMB=[math]::Round($size/1MB,2); Type="Dir"}
    } else {
      [PSCustomObject]@{Name=$_.Name; SizeMB=[math]::Round($_.Length/1MB,2); Type="File"}
    }
  } |
  Sort-Object SizeMB -Descending |
  Format-Table -AutoSize
```

关键发现：

- app.asar 90MB（异常大）

到这一步，结论已经很清晰：_业务代码不可能 90MB，90MB 大概率是依赖被“塞进 asar”了_。

## 第 2 步：验证 app.asar 里到底塞了什么

### 列出 asar 内容（不解包也行）

```powershell
npx asar list ".\release\win-unpacked\resources\app.asar" | Select-Object -First 50
```

结果一眼看到：

- `\node_modules\...`
-

这就坐实了：node_modules 被打进了 app.asar。

### 进一步统计 node_modules 谁是大头（解包）

解包会生成临时文件夹，建议放到 release 的 temp 目录，方便清理。

```powershell
npx asar extract ".\release\win-unpacked\resources\app.asar" ".\release\temp_asar_extract"
```

看顶层体积分布：

```powershell
Get-ChildItem -Path ".\release\temp_asar_extract" -Directory |
  ForEach-Object {
    $size=(Get-ChildItem $_.FullName -Recurse -File | Measure-Object Length -Sum).Sum
    [PSCustomObject]@{Name=$_.Name; SizeMB=[math]::Round($size/1MB,2)}
  } | Sort-Object SizeMB -Descending | Format-Table -AutoSize
```

结果（优化前）：

- `node_modules` 85MB
- `h5` 1.xMB
- `src` 0.xMB

继续看 `node_modules` 里大头是谁：

```powershell
Get-ChildItem -Path ".\release\temp_asar_extract\node_modules" -Directory |
  ForEach-Object {
    $size=(Get-ChildItem $_.FullName -Recurse -File | Measure-Object Length -Sum).Sum
    [PSCustomObject]@{Name=$_.Name; SizeMB=[math]::Round($size/1MB,2)}
  } | Sort-Object SizeMB -Descending | Select-Object -First 20 | Format-Table -AutoSize
```

当时前几名非常典型：

- `antd` 50MB+
- `@ant-design` 10MB+
- `react-dom` 4MB+
- `@supabase`、`@tanstack` 等

## 第 3 步：根因解释——为什么这些依赖不应该进入生产包？

这个项目结构是 Electron 主进程 + Vite 渲染进程：

- 渲染进程：React/antd 等，最终会被 `Vite` 打到 `h5/`（也就是静态资源）。
- 主进程：Electron runtime 加载 `h5/`，主进程真正需要的运行时依赖通常很少（如 `electron-store`、`electron-updater` 等）。

但是 `electron-builder` 默认行为是：

- 把 dependencies 当作生产运行时依赖，一并打包（进入 asar / app）
- devDependencies 不会打进最终包（仅构建时使用）

所以当你把 react、antd 这种“渲染端构建期依赖”放在 dependencies 时，electron-builder 就会把它们整包塞进 asar —— 这就是 app.asar 90MB 的根源。

## 第 4 步：关键修复——重划 dependencies / devDependencies

### 目标

- dependencies：只保留 主进程运行时真的要用 的库
- devDependencies：渲染端依赖、构建工具、仅开发时用的东西

### 我最终的迁移策略（示例）

把下面这些迁到 devDependencies：

- react / react-dom
- antd / @ant-design/icons
- i18next / react-i18next
- zustand
- @tanstack/react-query
- @supabase/supabase-js
- cross-env（它只影响脚本环境变量，不需要进生产包）

dependencies 保留（示例）：

- electron-store
- electron-updater
- uuid

> 注意：如果你的主进程确实 `require()` 了某些库（例如 `@supabase/supabase-js` 在主进程调用），那它就必须留在 dependencies。我的项目里它属于渲染端使用，所以迁走没问题。

## 第 5 步：额外优化——只构建 x64，避免双架构包

如果你 `win.target.arch` 同时配置了 x64 + ia32，产物会更复杂，体积与构建时间都会上升。

_只保留 x64_：

````json
{
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": ["x64"]
      }
    ]
  }
}

我的package.json关键配置（build）：

```json
"build": {
    "appId": "xxx",
    "compression": "maximum",
    "asar": true,
    "productName": "xxx",
    "copyright": "xxx",
    "directories": {
      "output": "release",
      "buildResources": "build"
    },
    "files": [
      "src/main/**/*",
      "src/utils/**/*",
      "src/config/**/*",
      "src/preload/**/*",
      "src/assets/**/*",
      "h5/**/*",
      "package.json"
    ],
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": [
            "x64"
          ]
        }
      ],
      "icon": "src/assets/app.ico",
      "artifactName": "${productName}-${version}.${ext}"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "BinLockPro",
      "installerIcon": "src/assets/app.ico",
      "uninstallerIcon": "src/assets/app.ico",
      "installerHeaderIcon": "src/assets/app.ico",
      "artifactName": "${productName}-Setup-${version}.${ext}"
    },
    "mac": {
      "target": "dmg",
      "icon": "src/assets/icon.icns",
      "category": "public.app-category.productivity"
    },
    "linux": {
      "target": [
        "AppImage",
        "deb"
      ],
      "icon": "src/assets/icon.png",
      "category": "Utility"
    },
    "publish": {
      "provider": "github",
      "owner": "xxx",
      "repo": "xxx"
    }
  },
````

## 第 6 步：验证结果（强烈建议写进你的检查清单）

### 重新安装依赖并重新打包

建议做一次干净构建（避免旧依赖干扰）：

- 删除 `release/`
- 删除 `node_modules/`
- `npm install`
- `npm run make`

### 验证 app.asar 是否显著变小

到安装目录或 `release/win-unpacked/resources` 查看：

- app.asar：从 90MB 降到 4.89MB（成功）

### 安装包体积变化

安装包从 190MB+ 降到 90MB+。

## 为什么安装后 最终程序包 还是 200MB？正常吗？

正常。

最终程序包 是 Electron Runtime 本体（Chromium + Node.js + 各类 runtime 数据），属于 Electron 固定成本，并不是你的业务代码。

你能优化的是：

- `resources/app.asar`
- `resources/app.asar.unpacked`（如果你用 `asarUnpack`）
- `locales` / `resources.pak` 等（可进一步裁剪，但收益有限且要谨慎）

如果你希望安装后体积也“很小”（比如 10MB 级别），那就需要换技术栈（例如 Tauri / Wails / 原生等），这属于架构层面取舍。

## 最终总结：最有效的瘦身原则

### 原则 1：从产物倒推，不猜

先在 release/win-unpacked 看文件大小，锁定最大头，再深入分析 asar 内容。

### 原则 2：Vite 项目里，渲染端依赖不要留在 dependencies

除非主进程真的需要，否则 react/antd 这类都应放在 devDependencies。

### 原则 3：asar 变小才算真正优化成功

app.asar 从 90MB → 5MB，这才是“应用可控部分”瘦身的标志。

### 原则 4：Electron runtime 大小是固定成本

`.exe` 大，不等于你打包错了；主要看 app.asar 和 installer 体积。

## 附：我这次用到的排查命令合集（可复制）

```powershell
# 1) 查看 win-unpacked 最大文件
Get-ChildItem -Path ".\release\win-unpacked" -File |
  ForEach-Object { [PSCustomObject]@{Name=$_.Name; SizeMB=[math]::Round($_.Length/1MB,2)} } |
  Sort-Object SizeMB -Descending |
  Select-Object -First 15 |
  Format-Table -AutoSize

# 2) 查看 resources 下各文件大小
Get-ChildItem -Path ".\release\win-unpacked\resources" |
  ForEach-Object {
    if($_.PSIsContainer) {
      $size=(Get-ChildItem $_.FullName -Recurse -File | Measure-Object Length -Sum).Sum
      [PSCustomObject]@{Name=$_.Name; SizeMB=[math]::Round($size/1MB,2); Type="Dir"}
    } else {
      [PSCustomObject]@{Name=$_.Name; SizeMB=[math]::Round($_.Length/1MB,2); Type="File"}
    }
  } |
  Sort-Object SizeMB -Descending |
  Format-Table -AutoSize

# 3) 列出 asar 内容
npx asar list ".\release\win-unpacked\resources\app.asar" | Select-Object -First 50

# 4) 解包 asar
npx asar extract ".\release\win-unpacked\resources\app.asar" ".\release\temp_asar_extract"

# 5) 统计 asar 解包后顶层目录大小
Get-ChildItem -Path ".\release\temp_asar_extract" -Directory |
  ForEach-Object {
    $size=(Get-ChildItem $_.FullName -Recurse -File | Measure-Object Length -Sum).Sum
    [PSCustomObject]@{Name=$_.Name; SizeMB=[math]::Round($size/1MB,2)}
  } | Sort-Object SizeMB -Descending | Format-Table -AutoSize

# 6) 统计 node_modules 下最大的包
Get-ChildItem -Path ".\release\temp_asar_extract\node_modules" -Directory |
  ForEach-Object {
    $size=(Get-ChildItem $_.FullName -Recurse -File | Measure-Object Length -Sum).Sum
    [PSCustomObject]@{Name=$_.Name; SizeMB=[math]::Round($size/1MB,2)}
  } | Sort-Object SizeMB -Descending | Select-Object -First 20 | Format-Table -AutoSize
```
