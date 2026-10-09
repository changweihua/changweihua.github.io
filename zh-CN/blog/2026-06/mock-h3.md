---
lastUpdated: true
commentabled: true
recommended: true
title: 不仅仅是 Mock 服务
description: mock-h3，让前端也能优雅拥有后端能力
date: 2026-06-03 13:35:00
pageClass: blog-page-class
cover: /covers/html5.svg
---

在前端开发中，Mock 服务几乎是不可或缺的：

- 需要快速搭建 Demo；
- 后端接口还没准备好；
- 或者需要模拟一些特殊场景的数据。

然而，现有的方案往往不够优雅，要么需要复杂配置，要么和实际部署环境脱节。

于是，我们基于 Vite + h3，实现了一款轻量、灵活的 Mock 插件 —— mock-h3。

## 背景与需求 ##

在设计之初，我们明确了几个核心目标：

- Vite 插件化：即插即用；
- 完全自定义：支持 js/ts，接口灵活可控；
- 同端口运行：无跨域问题；
- 生产可用：打包后可直接用 Node 启动，无需额外 Nginx；
- 支持 TS/ESM：抛弃 CJS；
- 文件路由：一个文件即一个接口，结构清晰；
- 扩展能力：保留 h3 的 中间件/插件 生态；
- 数据库支持：可以在 Mock 服务中轻松接入数据库。

## 技术选型 ##

在 Node 服务端框架中，我们重点考虑了 轻量、易用、类型友好。

最终选择了 h3 v2：

- 内置 defineHandleEvent、readBody 等 API；
- TypeScript 友好，类型提示完整；
- 比 express / koa 更轻量，配置更简洁。

基于此，我们开发了 mock-h3 插件。

它是一个 与前端框架无关的服务端插件 —— 无论你用 Vue、React 还是其他框架，都能直接集成。

## 常见 Mock 方案对比 ##

| 特性 / 方案 | mockjs | vite-plugin-mock | mock-h3 (本项目) |
| :--- | :--- | :--- | :--- |
| 实现方式 | 纯前端拦截，模拟数据 | 基于 express | 基于 h3，轻量 Node 服务 |
| 类型支持 | 无类型提示 | TS 支持，但无类型提示 | 完全支持 TS/ESM，支持类型提示 |
| 文件路由 | 不支持，需要手动注册 | 支持（配置稍有复杂） | 天然支持，一个文件一个接口配置简单 |
| 跨域问题 | 存在（需额外配置） | 无跨域问题 | 无跨域，共享 Vite 端口 |
| 生产可用性 | 不可用 | 不推荐生产使用 | 满足小项目，生产可运行，打包部署 |
| 扩展能力 | - | - | 支持 h3 插件 & 中间件系统 |
| 数据库交互 | - | - | 支持，可直接接入数据库 |

可以看到，mock-h3 不仅覆盖了开发阶段的 Mock 需求，还能平滑过渡到生产环境，避免了「开发环境能跑，生产环境需要重写」的尴尬。

## 适用场景 ##

mock-h3 并不是要替代所有 Mock 工具，而是针对以下场景特别合适：

- 快速原型 / Demo 搭建
  - 不依赖后端接口，前端能独立完成演示，交付更快。

- 中小型项目 / 内部系统
  - 前后端接口都由 Node 服务统一启动，不用单独配置网关或 nginx，部署简单。

- 长期需要 Mock 的项目
  - 不仅能在开发阶段使用，还能在生产环境继续运行，避免重复造轮子。

- 需要简单数据库交互
  - 可以直接在 Mock 服务中读写数据库，模拟更接近真实的业务逻辑。

如果你的需求只是前端临时造一些假数据（例如单纯的 UI 演示），可能用 mockjs 更简单；

但如果你希望 Mock 服务能 *稳定、可维护、小型MVP项目生产预测试*，那么 mock-h3 会更合适。

## 快速上手 ##

### 安装 ###

```bash
pnpm add mock-h3 h3@beta -D
```

配置 vite.config.ts：

```ts
import { mockH3 } from 'mock-h3/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    mockH3()
  ]
})
```

### 默认目录结构 ###

```bash
servers/
├── middleware/              # 中间件
├── plugins/                 # 插件
└── routes/                  # 路由
    ├── user.get.ts          # GET 请求
    ├── edit.post.ts         # POST 请求
    └── ...
```

一个文件就是一个接口，结构直观，不会混乱。

## 高级能力 ##

### 中间件 ###

中间件按文件顺序依次加载，可通过命名控制顺序。

👉 参考： [h3 中间件文档](https://h3.dev/guide/basics/middleware)

### 插件 ###

基于 `h3` 的插件机制，推荐使用 `definePlugin` 定义：

```ts
// logger.ts
import { definePlugin } from 'h3'

export default definePlugin((h3) => {
  if (h3.config.debug) {
    h3.use((req) => {
      console.log(`[${req.method}] ${req.url}`)
    })
  }
})
```


### 配置项 ###

- prefix：接口前缀，默认 /api；
- srcDir：扫描目录，默认 servers；
- build：是否在生产环境启用，默认 true；
- outputDir：构建输出目录，默认 dist/servers。

## 部署方案 ##

构建完成后，会在 `dist/servers` 下生成完整服务：

```bash
node dist/servers/app.mjs
```

此时，前端工程与 Mock 服务即可一同启动，静态站点与接口无需额外配置。

> 推荐方式：使用 Docker 部署，Node.js 版本 ≥ 22。
