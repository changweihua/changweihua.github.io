---
lastUpdated: true
commentabled: true
recommended: true
title: 如何使用 `global.json` 管理（切换） .NET SDK 版本
description: 如何使用 `global.json` 管理（切换） .NET SDK 版本
date: 2025-02-11 15:00:00
pageClass: blog-page-class
---

# 如何使用 `global.json` 管理（切换） .NET SDK 版本 #

在 .NET 开发过程中，随着 SDK 的不断更新，有时会因为 SDK 版本不一致导致构建失败或功能异常。为了解决这些问题，global.json 文件提供了一种简单而高效的方式来指定项目运行时的 .NET SDK 版本。

本文将介绍如何通过 global.json 文件管理 .NET SDK 版本，以及一些常见的使用场景。

## 什么是 global.json？ ##

global.json 是一个 JSON 文件，用于指定 .NET CLI 使用的 SDK 版本。它并不控制项目所面向的运行时版本，而是直接影响开发和构建时的 CLI 版本选择。

## 为什么需要 global.json？ ##

- **版本固定**：在 CI/CD 环境中，确保开发与构建环境使用相同版本的 .NET SDK，避免因版本变化导致的问题。
- **前滚策略**：为 SDK 版本选择灵活的策略，例如允许补丁或次版本升级。
- **排除预发布版本**：避免意外使用不稳定的预发布版本。
- **团队协作一致性**：在多人开发中，确保大家的开发环境一致。

## global.json 的基本结构 ##

以下是一个典型的 global.json 文件：

```json
{
  "sdk": {
    "version": "8.0.302",
    "rollForward": "latestFeature",
    "allowPrerelease": false
  }
}
```

### 字段说明 ###

- `version`：指定完整的 .NET SDK 版本（如 8.0.302）。必须是确切版本号，不支持通配符或范围。
- `rollForward`：定义前滚策略，决定在指定版本不存在时如何选择替代版本。
- `allowPrerelease`：是否允许使用预发布版本。默认情况下，非 Visual Studio 环境为 true。

## 前滚策略（rollForward）详解 ##

`rollForward 是控制 SDK 版本选择的关键，它提供多种策略以满足不同的需求：


| 值        |      行为      |  备注 |
| :-----------: | :-----------: | ----: |
| disable      | 禁止前滚，完全匹配 version。 |  |
| patch      | 允许同一主次版本的补丁升级（默认值）。 |  |
| feature      | 允许功能区段升级，如从 8.0.300 到 8.0.400。 |  |
| minor      | 允许次版本和功能区段升级，如从 8.0.x 到 8.1.x。 |  |
| major      | 允许主版本升级，如从 8.0.x 到 9.0.x。 |  |
| latestPatch      | 使用最新的补丁版本，限制在相同功能区段和次版本范围内。 |  |
| latestFeature      | 使用最新功能区段，限制在相同次版本范围内（推荐策略）。 |  |
| latestMajor      | 使用计算机上安装的最新 .NET SDK，允许跨主版本。 |  |

### 前滚策略示例 ###

#### 固定版本 ####

```json
{
  "sdk": {
    "version": "8.0.302",
    "rollForward": "disable"
  }
}
```

> 强制使用 `8.0.302`，如果没有安装该版本，则构建失败。

#### 允许功能区段升级 ####

```json
{
  "sdk": {
    "version": "8.0.300",
    "rollForward": "latestFeature"
  }
}
```

> 使用安装的最高功能区段版本，例如 `8.0.400` 或 `8.0.500`。

#### 允许跨主版本升级 ####

```json
{
  "sdk": {
    "version": "7.0.200",
    "rollForward": "latestMajor"
  }
}
```

> 支持从 `7.0.x` 升级到 `8.0.x` 或更高版本。

## 如何生成和管理 global.json 文件？ ##

### 创建 global.json 文件 ###

使用以下命令快速生成：

```bash
dotnet new globaljson --sdk-version 8.0.302 --roll-forward latestFeature
```

### 查看已安装的 SDK 版本 ###

检查计算机上可用的 .NET SDK 版本：

```bash
dotnet --list-sdks
```

### 升级或安装新版本 SDK ###

如果需要其他版本，可以从 .NET 下载页面获取。

## 常见使用场景 ##

### CI/CD 环境固定版本 ###

在持续集成中，为了避免因环境不一致导致的构建问题，可固定指定的 SDK 版本，例如：

```json
{
  "sdk": {
    "version": "6.0.100",
    "rollForward": "disable"
  }
}
```

### 团队协作一致性 ###

团队开发时，通过 global.json 统一开发工具链版本，减少版本兼容性问题。

### 避免预发布版本 ###

如果希望项目稳定，禁止使用预发布版本：

```json
{
  "sdk": {
    "allowPrerelease": false
  }
}
```

### 灵活使用最新版本 ###

在某些情况下，希望项目可以利用已安装的最新稳定版本：

```json
{
  "sdk": {
    "version": "8.0.200",
    "rollForward": "latestMinor"
  }
}
```

## 注意事项 ##

- Visual Studio 更新可能移除旧版本
  Visual Studio 会在升级时移除旧的 SDK 版本。如果需要保持旧版本，请单独下载安装。

- 避免频繁升级风险
  使用 latestMajor 等策略时，确保应用对新版本的兼容性。
  
- 多项目开发环境
  如果多个项目共存，应在各自目录下配置对应的 global.json，避免版本冲突。

## 总结 ##

通过 global.json 文件，我们可以精准控制 .NET CLI 使用的 SDK 版本，为开发和构建环境提供稳定性和一致性。根据项目需求合理设置 rollForward 策略，可以在灵活性和可靠性之间找到最佳平衡。无论是固定版本还是选择最新版本，global.json 都是管理 .NET SDK 的得力工具。

如果你的项目需要严格的版本控制，不妨试试为它添加一个合适的 global.json 文件！
