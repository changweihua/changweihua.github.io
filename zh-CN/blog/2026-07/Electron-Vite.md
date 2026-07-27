---
lastUpdated: true
commentabled: true
recommended: true
title: Electron-Vite是什么
description: 和Vite有什么区别
date: 2026-07-20 12:35:00
pageClass: blog-page-class
cover: /covers/electron.svg
---

## 前置基础认知（阅读必备底层知识）

先理清 3 个核心前置工具，无基础也能看懂全文：

- Electron：跨桌面端开发框架，把前端网页（HTML/CSS/JS）套进 Chromium 浏览器内核 + Node.js 运行环境，一套代码打包 Windows/macOS/Linux 桌面程序；

  - 核心双进程：渲染进程（页面 UI，浏览器能力）、主进程（系统权限、文件读写、窗口管理，Node 能力）

- Vite：新一代前端构建工具，对比 Webpack：开发时基于浏览器原生 ES Module 实现极速冷启动、热更新；构建打包使用 Rollup，打包产物体积更小、速度更快

- electron-builder：Electron 官方主流打包工具，负责把编译后的前端资源 + Electron 运行时打包成安装包（exe/dmg/deb 等）

传统 Electron 开发痛点：原生基于 Webpack，启动慢、热更新卡顿、配置繁琐；electron-vite 就是整合 Vite 能力专门适配 Electron 双进程的构建解决方案。

## 核心概念拆解

### electron-vite 基础定义

#### 定义

electron-vite 是面向 Electron 项目的专用构建工具，深度融合 Vite，分别对 Electron 的「主进程、预加载脚本、渲染进程」三套代码独立构建，解决传统 Webpack 构建 Electron 卡顿、配置复杂、打包慢的问题。 通俗解释：专门给 Electron 量身改造的 Vite，不用手写两套构建配置，自动区分桌面双进程代码编译规则。

#### 底层原理

Electron 存在两套运行环境，语法、模块规范完全割裂：

- 渲染进程：浏览器环境，支持 ES Module，不能直接访问 Node API
- 主 / 预加载进程：Node.js 环境，遵循 CommonJS 规范，拥有系统底层权限 原生 Vite 只适配纯浏览器项目，无法区分两套环境； electron-vite 内部做三层隔离构建：
- 渲染进程：标准 Vite 浏览器构建逻辑，热更新、按需编译完全保留
- 主进程：基于 Vite+Rollup 编译为 CommonJS 格式，适配 Node 运行
- Preload 预加载脚本：独立编译层，隔离 Node 与渲染进程的权限通信 同时内置 Electron 环境变量注入、原生模块兼容、打包联动 electron-builder 逻辑，省去大量手动配置。

#### 具象示例

传统 Electron+Webpack 项目：需要写 2 份 webpack 配置（主进程、渲染进程），冷启动等待 5 ~ 15 秒，修改页面刷新 3~8 秒； electron-vite 项目：仅 1 份统一配置文件，冷启动 < 1 秒，修改 UI 页面毫秒级热更新，修改主进程代码自动重启窗口。

#### 应用场景

- 中小型桌面工具：截图工具、本地文档编辑器、本地 AI 客户端、运维看板
- 中大型 Electron 客户端：多窗口、大量原生 Node 插件、前端资源体积大的桌面软件
- 快速原型开发：需要频繁调试 UI + 系统文件交互的本地程序

### electron-vite 项目目录规范

#### 定义

electron-vite 约定式目录结构，强制分离主进程、预加载、渲染进程代码，降低多环境混淆成本，约定大于配置。

#### 底层原理

通过目录路径区分代码归属，构建工具自动匹配对应编译规则，无需手动标记环境；内置路径别名、资源拷贝规则，自动处理静态资源、原生 addon 插件。

#### 具象示例

标准初始化目录：

```txt
project/
├── electron/
│   ├── main/       # 主进程代码
│   └── preload/    # 预加载脚本
├── src/            # 渲染进程前端代码(Vue/React/Svelte)
├── electron-vite.config.ts  # 唯一构建配置文件
└── package.json
```

#### 应用场景

所有基于 electron-vite 初始化的新项目；老旧 Electron 项目迁移重构，统一代码分层。

### 三进程独立构建机制（核心能力）

#### 定义

electron-vite 核心特性：主进程、预加载脚本、渲染进程三套代码并行独立编译，互不干扰，各自使用适配对应运行环境的打包策略。

#### 底层原理

- 渲染进程构建通道：Vite Dev Server，ESModule，浏览器热更新，开发时不打包完整代码；
- Preload 构建通道：Rollup 单次编译，输出隔离脚本，作为主 / 渲染进程通信桥梁；
- 主进程构建通道：Rollup 打包 CommonJS，兼容 Node 内置模块、第三方原生模块； 三条构建通道异步执行，大幅提升开发与打包速度。

#### 具象示例

修改 src 下 React 页面代码：仅渲染进程热更新，窗口不重启； 修改 electron/main 下窗口创建代码：仅重启主进程，页面快速重载； 修改 preload 脚本：自动重启窗口加载新预加载文件。

#### 应用场景

多窗口复杂桌面程序、需要频繁修改系统逻辑 + 前端 UI 的混合开发项目。

### 与传统 Electron 构建方案对比

#### 定义

市面上两类主流 Electron 构建方案：Webpack-based（electron-webpack）、Vite-based（electron-vite），下表对比核心差异。

#### 底层原理差异

- Webpack 方案：单编译流水线，需手动区分环境，全量打包后启动；
- electron-vite：多流水线并行构建，原生利用 Vite 按需编译、ESModule 缓存。

#### 对比表格

| 对比维度           | electron-webpack (传统方案) | electron-vite                 |
| :----------------- | :-------------------------- | :---------------------------- |
| 开发冷启动速度     | 5~20s                       | 0.3~1.5s                      |
| 页面热更新         | 全页面刷新，卡顿            | 毫秒级局部热更新              |
| 配置文件数量       | 至少 2 份 webpack 配置      | 单份统一 config               |
| 打包工具联动       | 需手动适配 electron-builder | 内置联动，零额外配置          |
| 原生 Node 插件兼容 | 配置复杂，需处理 loader     | 内置原生模块解析              |
| 支持前端框架       | Vue/React 均可，但配置繁琐  | 原生完美适配 Vue/React/Svelte |

#### 应用场景选择

- 选 electron-vite：新项目、追求开发效率、前端代码量大、频繁调试 UI
- 选 electron-webpack：老旧存量项目、深度依赖 Webpack 专属插件无法迁移

## 完整落地实操流程（有序列表）

环境准备：安装 Node.js 16+、包管理器 pnpm/npm/yarn

脚手架初始化项目

```bash
npm create electron-vite@latest
```

选择前端框架（Vanilla/Vue/React），自动生成标准化目录与配置

开发调试：执行 `npm run dev`，自动启动 Electron 窗口，支持热更新

业务开发：区分编写渲染进程 UI、主进程系统逻辑、preload 通信代码

产物构建：执行 `npm run build`，自动编译三进程代码，调用 electron-builder 打包各系统安装包

分发部署：输出 exe/dmg/deb 等安装文件，可直接分发至 Windows/macOS/Linux

## 常见认知误区

### 误区 1：electron-vite 会替代 Electron

纠正：electron-vite 只是构建工具，Electron 才是桌面运行框架，二者是工具与运行时的搭配关系，不能互相替代。

### 误区 2：electron-vite 只能用 Vue 开发

纠正：原生支持原生 JS、Vue2/Vue3、React、Svelte 等所有 Vite 兼容前端框架。

### 误区 3：不需要 preload 预加载脚本

纠正：Electron 安全规范禁止渲染进程直接调用 Node API，无论使用哪种构建工具，复杂系统交互都必须通过 preload 中转，electron-vite 只是简化编译，不改变 Electron 底层安全规则。

### 误区 4：打包速度一定远快于 Webpack

纠正：小型项目差距不明显；仅前端资源量大、多窗口、含大量原生模块时，electron-vite 打包优势显著。

## 落地实操优化建议（无序列表）

- 开发规范：严格遵循约定目录，不混合存放主进程与渲染进程代码，减少构建报错
- 性能优化：开发环境开启 Vite 按需导入，打包时开启 electron-vite 压缩、代码分割
- 原生模块处理：使用 electron-rebuild 配合 electron-vite，自动适配 Electron Node 版本
- 配置简化：优先使用工具内置默认配置，仅在需要自定义窗口、静态资源拷贝时修改 config 文件
- 打包优化：分离开发依赖与生产依赖，减少安装包体积
