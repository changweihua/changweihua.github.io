---
lastUpdated: true
commentabled: true
recommended: true
title: 告别 Electron 托盘图标模糊
description: 一套精准的 PNG 生成方案
date: 2026-07-15 09:05:00
pageClass: blog-page-class
cover: /covers/electron.svg
---

在开发 Electron 应用时，托盘图标（Tray Icon）的清晰度一直是个让人头疼的问题。尤其是在 Windows 系统上，不同 DPI 缩放比例下，图标很容易变得模糊或有锯齿。

废话不多说，直接上干货！本文将分享一套我一直在用的实战建议和一个自动化生成脚本。

## 🎯 托盘图标的实战建议

### 原始素材要高清

最好使用 SVG 矢量图。如果不行，至少准备一张 512x512 的 PNG。高清的源文件是保证缩小后依然清晰的基础。

### 设计遵循“粗线条、少细节”

图标最终会被缩小到 16px 显示。如果原始图标细节太多（比如很细的线条、复杂的渐变色），缩小后这些细节会挤在一起，看起来就是一团糊。

### Electron 选 PNG，放弃 ICO

虽然 Windows 原生支持 ICO，但在 Electron 中，使用多尺寸的 PNG 配合 resize 和 compress 选项，效果更稳定，兼容性也更好。建议优先使用带透明背景的 PNG。

## ⚙️ 一键生成脚本 (PowerShell)

下面这个 PowerShell 脚本基于 ImageMagick，可以一键将你的高清素材生成符合 Electron 托盘规范的多尺寸图标。

### 📦 准备工作

安装 ImageMagick。安装时务必勾选“Install legacy utilities (e.g. convert)”，或者确保 magick 命令可用。
准备好你的原始素材（假设命名为 原始素材.png）。

### 🚀 如何使用

1. 打开 PowerShell。
2. 复制粘贴下面的脚本。
3. 修改脚本开头的 `$sourcePath` 和 `$outputDir` 变量为你的实际路径。
4. 运行即可

```powershell
<#
.SYNOPSIS
  使用 ImageMagick 生成 Electron 托盘图标的多尺寸 PNG 文件。
.DESCRIPTION
  脚本会从原始素材生成 16x16, 20x20, 24x24 的图标，
  并复制一份 20x20 作为默认的托盘图标。
#>

# --- 用户配置区：请修改这两行 ---
$sourcePath = "D:\你的项目路径\原始素材.png"  # 你的高清源文件路径
$outputDir  = "D:\你的项目路径\src\renderer\public\trayIcon" # 输出文件夹路径
# --- 配置结束 ---

# 1. 检查 ImageMagick 是否可用
if (!(Get-Command "magick" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 错误：未找到 ImageMagick (magick 命令)。请安装并确保它在 PATH 环境变量中。" -ForegroundColor Red
    exit 1
}

# 2. 检查源文件是否存在
if (!(Test-Path $sourcePath)) {
    Write-Host "❌ 错误：源文件不存在，请检查路径: $sourcePath" -ForegroundColor Red
    exit 1
}

# 3. 创建输出目录（如果不存在）
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    Write-Host "📁 创建输出目录: $outputDir" -ForegroundColor Green
}

# 4. 显示原始图片信息（用于调试）
Write-Host "🔍 原始图片信息：" -ForegroundColor Cyan
magick identify "$sourcePath"

# 5. 生成不同尺寸的图标
Write-Host "⚙️ 开始生成图标..." -ForegroundColor Cyan

# 生成 16x16 (主要用于任务栏和系统托盘的高DPI缩放)
magick "$sourcePath" -background none -resize 16x16 -gravity center -extent 16x16 "$outputDir\trayIcon@16.png"
Write-Host "  ✅ 生成: trayIcon@16.png"

# 生成 20x20 (Electron 默认推荐的托盘图标大小)
magick "$sourcePath" -background none -resize 20x20 -gravity center -extent 20x20 "$outputDir\trayIcon@20.png"
Write-Host "  ✅ 生成: trayIcon@20.png"

# 生成 24x24 (用于更大的缩放比例)
magick "$sourcePath" -background none -resize 24x24 -gravity center -extent 24x24 "$outputDir\trayIcon@24.png"
Write-Host "  ✅ 生成: trayIcon@24.png"

# 生成默认托盘图标 (通常也是 20x20，方便引用)
magick "$sourcePath" -background none -resize 20x20 -gravity center -extent 20x20 "$outputDir\trayIcon.png"
Write-Host "  ✅ 生成: trayIcon.png (默认)"

# 生成一个透明占位图 (可选，有时用于布局占位)
magick -size 20x20 xc:none "$outputDir\transparent.png"
Write-Host "  ✅ 生成: transparent.png"

# 6. 显示生成的文件列表及大小
Write-Host "📄 生成的文件列表：" -ForegroundColor Cyan
Get-ChildItem "$outputDir" | Select-Object Name, @{Name="Size(KB)"; Expression={[math]::Round($_.Length/1KB, 2)}}
Write-Host "🎉 图标生成完成！" -ForegroundColor Green
```

### 脚本要点解读

- `-background none`: 确保生成的 PNG 保持透明背景。
- `-resize` + `-extent`: 先按比例缩放，然后将画布扩展/裁剪到指定尺寸，确保图标居中且不留白边。
- 为什么生成 `@16`, `@20`, `@24`？ ：在 Electron 中创建 Tray 时，可以传入一个包含多个尺寸的 NativeImage，Electron 会根据系统的最佳大小自动选择合适的图标，从而完美适配不同分辨率的屏幕。

希望这套方案能帮你彻底解决托盘图标模糊的问题！如果有更好的建议，欢迎在评论区讨论。

```bash
# ================================================================
# generate-icons.ps1
# 功能：一键生成 Electron 应用所需的所有图标
# 输入：resources/icon.svg (主图标), resources/tray-icon.svg (托盘图标)
# 输出：resources/icon.ico, resources/icon.icns, resources/icon.png,
#       resources/tray-icon.png (256x256),
#       resources/tray-icon-macTemplate.png, tray-icon-macTemplate@2x.png
# 特点：所有输出均为透明背景，高清晰度，适配高 DPI
# 依赖：ImageMagick 7 (magick 命令)
# ================================================================

# -------- 配置 --------
$mainSvg = "resources/icon.svg"
$traySvg = "resources/tray-icon.svg"
$outputDir = "resources"

# 主图标尺寸（覆盖 Windows 常见需求，避免拉伸）
$mainSizes = @(16, 24, 32, 40, 48, 64, 96, 128, 256, 512, 1024)
$tempDir = "temp_icons"

# -------- 检查 ImageMagick --------
try {
    $null = Get-Command "magick" -ErrorAction Stop
} catch {
    Write-Error "❌ 未找到 ImageMagick。请从 https://imagemagick.org/script/download.php 下载安装。"
    Write-Host "安装时请勾选 'Install legacy utilities (e.g. convert)' 以确保 magick 命令可用。"
    exit 1
}

# -------- 检查源文件 --------
if (-not (Test-Path $mainSvg)) {
    Write-Error "❌ 找不到主图标源文件: $mainSvg"
    exit 1
}
if (-not (Test-Path $traySvg)) {
    Write-Error "❌ 找不到托盘图标源文件: $traySvg"
    exit 1
}

# 确保输出目录存在
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

Write-Host "✅ 开始生成所有图标（透明背景）..."

# ================================================================
# 1. 生成主图标
# ================================================================
Write-Host "`n📌 生成主图标..."

# 创建临时目录
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# 生成各尺寸 PNG（强制透明，移除白色）
foreach ($size in $mainSizes) {
    $pngFile = Join-Path $tempDir "icon_${size}x${size}.png"
    Write-Host "  生成 ${size}x${size} ..."
    magick $mainSvg -background none -transparent white -alpha on -density 1200 -filter Catrom -resize ${size}x${size} -quality 100 $pngFile
}

# 生成 icon.png (最大尺寸，供 Linux 及备用)
Copy-Item (Join-Path $tempDir "icon_1024x1024.png") (Join-Path $outputDir "icon.png") -Force
Write-Host "  ✅ icon.png 生成 (1024x1024)"

# 生成 Windows .ico (包含所有尺寸，无损压缩)
Write-Host "  生成 icon.ico ..."
$icoInputs = @()
foreach ($size in $mainSizes) {
    $icoInputs += (Join-Path $tempDir "icon_${size}x${size}.png")
}
$icoArgs = $icoInputs + "-define", "icon:auto-resize", "-compress", "None", (Join-Path $outputDir "icon.ico")
magick $icoArgs
Write-Host "  ✅ icon.ico 生成 (包含 $($mainSizes.Count) 种尺寸)"

# 生成 macOS .icns (仅在 macOS 上可行)
if ($IsMacOS) {
    Write-Host "  生成 icon.icns ..."
    $iconsetDir = "icon.iconset"
    New-Item -ItemType Directory -Path $iconsetDir -Force | Out-Null
    $icnsMap = @{
        "icon_16x16.png" = "16"
        "icon_16x16@2x.png" = "32"
        "icon_32x32.png" = "32"
        "icon_32x32@2x.png" = "64"
        "icon_128x128.png" = "128"
        "icon_128x128@2x.png" = "256"
        "icon_256x256.png" = "256"
        "icon_256x256@2x.png" = "512"
        "icon_512x512.png" = "512"
        "icon_512x512@2x.png" = "1024"
    }
    foreach ($key in $icnsMap.Keys) {
        $size = $icnsMap[$key]
        $src = Join-Path $tempDir "icon_${size}x${size}.png"
        $dst = Join-Path $iconsetDir $key
        Copy-Item $src $dst -Force
    }
    iconutil -c icns $iconsetDir -o (Join-Path $outputDir "icon.icns")
    Remove-Item -Recurse -Force $iconsetDir
    Write-Host "  ✅ icon.icns 生成"
} else {
    Write-Host "  ⚠️ 非 macOS 系统，跳过 .icns 生成。"
}

# 清理主图标临时文件
Remove-Item -Recurse -Force $tempDir

# ================================================================
# 2. 生成托盘图标 (高分辨率)
# ================================================================
Write-Host "`n📌 生成托盘图标..."

# 标准托盘图标 (Windows/Linux) - 256x256 确保高清
$traySize = 256
$trayPng = Join-Path $outputDir "tray-icon.png"
Write-Host "  生成 tray-icon.png (${traySize}x${traySize}) ..."
magick $traySvg -background none -transparent white -alpha on -density 1200 -filter Catrom -resize ${traySize}x${traySize} -quality 100 $trayPng
Write-Host "  ✅ tray-icon.png 生成"

# macOS 模板图标 (黑白, 透明) - 提供 @2x 版本
$macSizes = @("256x256", "512x512")
$macNames = @("tray-icon-macTemplate.png", "tray-icon-macTemplate@2x.png")
for ($i = 0; $i -lt $macSizes.Length; $i++) {
    $size = $macSizes[$i]
    $name = $macNames[$i]
    $outFile = Join-Path $outputDir $name
    Write-Host "  生成 $name ..."
    magick $traySvg -colorspace Gray -threshold 50% -background none -transparent white -alpha on -density 1200 -filter Catrom -resize $size -quality 100 $outFile
}
Write-Host "  ✅ macOS 模板图标生成 (可选用)"

# ================================================================
# 完成
# ================================================================
Write-Host "`n🎉 所有图标生成完毕！"
Write-Host "生成的文件位于: $outputDir"
Write-Host "  - icon.ico (含 $($mainSizes.Count) 种尺寸，Windows)"
Write-Host "  - icon.icns (macOS，需在 Mac 上生成)"
Write-Host "  - icon.png (Linux 及备用)"
Write-Host "  - tray-icon.png (256x256，通用托盘)"
Write-Host "  - tray-icon-macTemplate.png / @2x (macOS 模板，可选)"
Write-Host "`n💡 提示："
Write-Host "  - 所有图标均为透明背景。"
Write-Host "  - 若 macOS 需使用模板，请将模板文件加入 extraResources，"
Write-Host "    并在主进程代码中根据平台加载对应文件或调用 setTemplateImage(true)。"
```
