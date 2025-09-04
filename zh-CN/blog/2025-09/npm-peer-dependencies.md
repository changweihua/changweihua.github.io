---
lastUpdated: true
commentabled: true
recommended: true
title: peerDependencies（对等依赖）
description: peerDependencies（对等依赖）
date: 2025-09-04 13:05:00 
pageClass: blog-page-class
cover: /covers/npm.svg
---

## 一句话总结 ##

用 `peerDependencies` 来声明： “*我这个库需要这些环境，但请由使用我的项目来提供它们。*”

## 核心概念：它是什么？ ##

一个声明，用于说明你的包（通常是库或插件）需要宿主项目提前安装哪些依赖才能正常工作。它本身不会安装这些依赖。

## 为什么需要它？—— 解决核心问题 ##

- **解决重复安装**：防止你的库和主项目安装同一个包的两个副本。
- **避免实例冲突**：确保库和主项目共享同一个依赖实例（例如 React、Vue 的核心库，必须唯一）。

**经典场景**：你开发一个 React 组件库。如果把它直接列为 `dependencies`，会导致用户项目里存在两份 React，引发错误。用 `peerDependencies` 声明，让用户的项目来提供 React。

## 使用方法 ##

在 `package.json` 中：

```json
{
  "name": "your-lib",
  "peerDependencies": {
    "react": ">=17.0.0 <19.0.0", // 声明需要的包和兼容的版本范围
    "vue": "^3.0.0"
  }
}
```

## npm 不同版本的处理方式 ##

- **npm v3-v6**：*不自动安装*，只检查并输出警告。用户需手动安装。
- **npm v7+**：*自动安装* `peerDependencies`。如果版本冲突无法解决，安装会失败。
  - 可用 `--legacy-peer-deps` 参数忽略（恢复v6行为）。
  - 可用 `--strict-peer-deps` 参数更严格地处理冲突。

## 典型使用场景 ##

### UI 组件库 ###

如 `antd`, `material-ui`，它们需要 `react` 和 `react-dom`。

### 插件系统 ###

- `webpack` 的各种 loader（如 `css-loader`, `file-loader`）需要 `webpack` 作为对等依赖。
- `rollup`/`vite` 的插件。
- `eslint`/`babel` 的插件和预设。

### 框架工具库 ###

例如 `vue-router` 需要 `vue`，`@angular/core` 需要 `rxjs` 和 `zone.js`。

## 最佳实践和常见问题 ##

### 不要将 `peerDependencies` 也写在 `dependencies`  ###

这会导致重复安装，违背了使用 `peerDependencies` 的初衷。

### 提供宽松且正确的版本范围 ###

不要过度限制版本。如果你的库在 React 17 和 18 下都能工作，就写成 `"react": ">=17.0.0 <19.0.0"`，而不是锁定到某个小版本。

### 如何处理可选的 peerDependencies？ ###

有时，你的库可能支持多种渲染引擎，用户只需要安装其中一个即可。从 npm v7 开始，你可以将可选的依赖写在 `peerDependenciesMeta` 中：

```json
{
  "peerDependencies": {
    "vue": "^3.0.0",
    "react": ">=17.0.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    },
    "vue": {
      "optional": true
    }
  }
}
```

这表示你的库支持 Vue 或 React，但用户至少需要安装其中一个。

### 在开发时，你需要将对等依赖放在哪？ ###

虽然你的库不“携带”这些依赖，但你在本地开发、测试和构建时肯定需要它们。你应该将它们安装在 `devDependencies` 里。

```json
{
  "peerDependencies": {
    "react": ">=17.0.0"
  },
  "devDependencies": {
    "react": "^18.2.0" // 用于本地开发、测试和构建
  }
}
```

## 总结 ##

| 特性   |   dependencies     |   devDependencies |  peerDependencies |
| :----------: | :----------: | :---------:  | :---------:  |
| 目的 | 包*运行时*必须的依赖  | *开发时必须的依赖* | 包所需要的*宿主环境* |
| 是否被打包 | 是（会被安装）  | 否 | 否（期望宿主提供） |
| 安装时机 | `npm install your-package`  | `npm install` (在开发目录) | npm v7+ 尝试自动安装，v6 仅警告 |
| 解决什么问题 | 声明直接依赖  | 声明开发工具链 | 防止重复安装和实例冲突 |

简单来说，*当你开发的包是另一个更大包的插件、扩展或配套工具时，就应该使用 `peerDependencies`*。它确保了生态系统中依赖关系的干净和一致。
