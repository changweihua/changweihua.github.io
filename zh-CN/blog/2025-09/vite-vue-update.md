---
lastUpdated: true
commentabled: true
recommended: true
title: Vite + Vue3项目版本更新检查与页面自动刷新方案
description: Vite + Vue3项目版本更新检查与页面自动刷新方案
date: 2025-09-19 13:30:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

使用 Vite 对 Vue 项目进行打包，对 js 和 css 文件使用了 `chunkhash` 进行了文件缓存控制，但是项目的 `index.html` 文件在版本频繁迭代更新时，会存在被浏览器缓存的情况。

在发版后，如果用户不强制刷新页面，浏览器会使用旧的 `index.html` 文件，在跳转页面时会向服务器端请求了上个版本 `chunkhash` 的 js 和 css 文件，但此时的文件已经在版本更新时已替换删除了，最终表现为页面卡顿，控制台报错 404。

## 解决思路 ##

在每次打包生产代码时，在 `public` 目录下生成一个 `version.json` 版本信息文件，页面跳转时请求服务器端的 `version.json` 中的版本号和浏览器本地缓存的版本号进行对比，从而监控版本迭代更新，实现页面自动更新，获取新的 `index.html` 文件（前提是服务器端对 `index.html` 和 `version.json` 不缓存）。

## 第一步：配置服务器，禁止关键文件缓存 ##

要实现版本对比，需确保 `index.html` 和后续生成的版本文件 `version.json` 不被浏览器缓存 —— 每次请求均从服务器获取最新内容。

以 Nginx 为例，添加如下配置：

```nginx
location ~ .*\.(htm|html|json)?$ {
    expires -1;
}
```

## 第二步：开发 Vite 插件，自动生成版本信息 ##

通过自定义 Vite 插件，在打包时自动在 `public` 目录下生成 `version.json` 文件，记录当前版本标识（建议用时间戳，确保每次打包版本号唯一）。

### TypeScript 版本插件 ###

```ts:versionUpdatePlugin.ts
import fs from "node:fs"
import path from "node:path"

import type { ResolvedConfig } from "vite"

function writeVersion(versionFile: string, content: string) {
  // 写入文件
  fs.writeFile(versionFile, content, (err) => {
    if (err) throw err
  })
}

export default (version: string | number) => {
  let config: ResolvedConfig
  return {
    name: "version-update",
    configResolved(resolvedConfig: ResolvedConfig) {
      // 存储最终解析的配置
      config = resolvedConfig
    },
    buildStart() {
      // 生成版本信息文件路径
      const file = config.publicDir + path.sep + "version.json"
      // 这里使用编译时间作为版本信息
      const content = JSON.stringify({ version })
      if (fs.existsSync(config.publicDir)) {
        writeVersion(file, content)
      } else {
        fs.mkdir(config.publicDir, (err) => {
          if (err) throw err
          writeVersion(file, content)
        })
      }
    },
  }
}
```

### JavaScript 版本插件 ###

```js:versionUpdatePlugin.js
const fs = require("fs")
const path = require("path")

const writeVersion = (versionFile, content) => {
  // 写入文件
  fs.writeFile(versionFile, content, (err) => {
    if (err) throw err
  })
}

export default (options) => {
  let config

  return {
    name: "version-update",
    configResolved(resolvedConfig) {
      // 存储最终解析的配置
      config = resolvedConfig
    },
    buildStart() {
      // 生成版本信息文件路径
      const file = config.publicDir + path.sep + "version.json"
      // 这里使用编译时间作为版本信息
      const content = JSON.stringify({ version: options.version })
      if (fs.existsSync(config.publicDir)) {
        writeVersion(file, content)
      } else {
        fs.mkdir(config.publicDir, (err) => {
          if (err) throw err
          writeVersion(file, content)
        })
      }
    },
  }
}
```

## 第三步：配置 Vite，注入全局版本变量 ##

在 `vite.config.js/ts` 中引入上述插件，同时定义全局版本变量 `__APP_VERSION__`（供前端对比使用），建议用当前时间戳作为版本号，确保每次打包版本唯一。

### 类型声明（TS 项目必备） ###

若使用 TypeScript，需在 `vite-env.d.ts` 或 `env.d.ts` 中添加全局变量类型声明，避免类型报错：

```ts:vite-env.d.ts
declare const __APP_VERSION__: string
```

```ts:vite.config.ts
export default defineConfig((config) => {
  const now = new Date().getTime()
  return {
    // ...
    define: {
      // 定义全局变量
      __APP_VERSION__: now,
    },
    plugins: [
      // ...
      versionUpdatePlugin({
        version: now,
      }),
    ],
    // ...
  }
})
```

## 第四步：前端实现版本检测，触发自动刷新 ##

利用 Vue Router 的全局前置守卫，在每次页面跳转前检查版本 —— 对比浏览器端全局变量 `__APP_VERSION__` 与服务器端 `version.json` 中的版本号，若不一致则提示用户并自动刷新页面（选择前置守卫是因为跳转失败不会触发后置守卫，可在报错前完成检测）。

```ts
const router = useRouter()
// 这里在路由全局前置守卫中检查版本
router.beforeEach(async () => {
  await versionCheck()
})

// 版本监控
const versionCheck = async () => {
  if (import.meta.env.MODE === "development") return
  const response = await axios.get("version.json")
  if (__APP_VERSION__ !== response.data.version) {
    ElMessage({
      message: "发现新内容，自动更新中...",
      type: "success",
      showClose: true,
      duration: 1500,
      onClose: () => {
        window.location.reload()
      },
    })
  }
}
```
