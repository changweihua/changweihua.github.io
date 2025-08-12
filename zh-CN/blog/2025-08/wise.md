---
lastUpdated: true
commentabled: false
recommended: false
title: 雀巢平台 Wise 前端对接
description: 雀巢平台 Wise 前端对接
date: 2025-08-12 16:45:00 
pageClass: blog-page-class
cover: /covers/platform.svg
---

## 背景 ##

适用于嵌入 `Wise` 的雀巢平台子应用。

## 安装依赖 ##

```bash
npm add maui-jsbridge
```

## 注册服务 ##

### Vue 3.0 ###

在项目入口文件(如 `index.ts` 或 `main.ts`) 注入服务

```ts:index.ts
import { MauiJsBridge } from 'maui-jsbridge'
MauiJsBridge.attach(window.parent)
```

## 应用场景 ##

### Token 失效 ###

向 `Wise` 发出 `Token` 失效的消息

```ts
import { FrameCommands, MauiJsBridge } from 'maui-jsbridge'

MauiJsBridge.postMessage({
  command: FrameCommands.TOKEN_INVALID,
  data: {
    reason: 'TokenExpired',
    appCode: `${appCode}`
  }
}, '*')
```
