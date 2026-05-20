---
lastUpdated: true
commentabled: true
recommended: true
title: Vue 3 + TypeScript + Vite 服务端渲染项目
description: Vue 3 + TypeScript + Vite 服务端渲染项目
date: 2025-09-18 15:00:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 项目简介 ##

这是一个基于 Vue 3、TypeScript 和 Vite 构建的现代化前端项目，同时支持服务端渲染 (SSR) 和客户端渲染 (CSR) 两种模式。项目展示了如何在 Vue 3 应用中实现完整的 SSR 功能，包括数据预取、元信息管理和服务端渲染管道。

## 技术栈 ##

- 前端框架: Vue 3 (Composition API)
- 编程语言: TypeScript
- 构建工具: Vite 7.x
- 路由管理: Vue Router 4
- 运行时环境: Bun
- 服务端渲染: Vue SSR

## 项目结构 ##

```txt
h5/
├── src/                   # 源代码目录
│   ├── assets/            # 静态资源文件
│   ├── page/              # 页面组件
│   ├── use/               # 自定义 hooks
│   ├── app.ts             # 应用创建逻辑
│   ├── main.ts            # 客户端入口文件
│   └── server.ts          # SSR 渲染逻辑
├── server.ts              # 服务端入口文件 (Bun 服务器)
├── vite.config.ts         # Vite 配置
├── package.json           # 项目配置和依赖
└── index.html             # HTML 入口文件
```

## 核心功能模块 ##

### 应用创建与路由管理 (app.ts) ###

该模块负责创建 Vue 应用实例并配置路由系统，同时支持 SSR 和 CSR 两种模式。

#### 主要功能 ####

- 创建支持 SSR 的 Vue 应用实例
- 配置路由规则和组件懒加载
- 根据环境选择合适的路由历史模式

```ts
// src/app.ts
import { createSSRApp } from 'vue'
import App from './App.vue'
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router'

export function createApp(ssr: boolean = false) {
  const app = createSSRApp(App)
  const routes = [
    { path: '/', component: () => import('./page/home.vue'), meta: { title: 'home' } },
    { path: '/about', component: () => import('./page/about.vue'), meta: { title: 'about' } },
  ]

  const router = createRouter({
    history: ssr ? createMemoryHistory() : createWebHistory(),
    routes,
  })

  app.use(router)
  return { app, router }
}
```

### 页面元信息管理 (use/head.ts) ###

自定义 hook 用于管理页面标题、关键词和描述等元信息，同时支持 SSR 和 CSR 环境。

#### 主要功能 ####

- 统一管理页面元数据
- 在客户端环境中自动更新 DOM
- 支持 SSR 上下文传递元数据

```ts
// src/use/head.ts
import { ref, type Ref, onMounted } from 'vue'

type HeadType = {
  title: string,
  keyword: string,
  description: string
}

export const head: Ref<HeadType> = ref({
  title: '',
  keyword: '',
  description: ''
})

export function useHead(init: HeadType) {
  // 在服务器端和客户端都设置head数据
  head.value = init
  
  // 只在客户端环境中操作DOM
  onMounted(() => {
    try {
      if (document.title !== init.title) {
        document.title = init.title
        document.head.querySelector('meta[name="keyword"]')?.setAttribute('content', init.keyword)
        document.head.querySelector('meta[name="description"]')?.setAttribute('content', init.description)
      }
    } catch (e) {
      console.log(e)
    }
  })
}
```

### 服务端渲染实现 (src/server.ts & server.ts) ###

项目实现了完整的 SSR 渲染流程，包括路由预解析、组件渲染和 HTML 拼接。

#### 主要功能 ####

- 创建 SSR 模式的应用实例
- 处理 URL 请求和路由跳转
- 预加载路由组件
- 渲染应用为 HTML 字符串
- 传递元数据到客户端

```ts
// src/server.ts
import { renderToString } from '@vue/server-renderer'
import { createApp } from './app'
import { head } from './use/head'

export async function render(url: string) {
  const { app, router } = createApp(true)
  const ctx = { 'head': head.value }
  router.push(url)
  await router.isReady()
  const html = await renderToString(app, ctx)
  return { html, ctx }
}

// server.ts (Bun服务器)
import { serve, file } from 'bun'

serve({
  port: 3000,
  async fetch(req) {
    let url = new URL(req.url)
    // 处理静态资源
    if (url.pathname.startsWith('/assets')) {
      // 静态资源处理逻辑...
    }
    // 渲染Vue应用
    const render = (await import('./dist/server/server.js')).render
    const html = await file('./dist/client/index.html').text()
    const rendered = await render(url.pathname)
    return new Response(
      html
        .replace('<!--app-html-->', rendered.html)
        .replace('<!--app-head-html-->', rendered.ctx.head.title)
        .replace('<!--app-head-keyword-->', rendered.ctx.head.keyword)
        .replace('<!--app-head-description-->', rendered.ctx.head.description),
      {
        headers: { 'Content-Type': 'text/html' }
      }
    )
  }
})
```

### 页面组件实现 ###

项目包含两个主要页面组件：首页和关于页面，均实现了 SSR 环境下的数据预取。

#### 核心特性 ####

- 使用 `onServerPrefetch` 确保在 SSR 环境中预取数据
- 集中管理页面元信息设置
- 组件懒加载优化性能

```vue
// 页面组件示例 (home.vue)
<script lang="ts" setup>
import { onServerPrefetch } from 'vue'
import { useHead } from '../use/head'

const init = () => {
  useHead({
    title: '关于我们-ssr,全栈框架',
    keyword: '关于我们,ssr,全栈框架',
    description: '关于我们-ssr,全栈框架'
  })
}

// 在客户端和服务端都执行
init()

// 仅在服务端渲染时执行，确保元信息正确设置
onServerPrefetch(() => {
  init()
})
</script>
```

## 构建与运行脚本 ##

项目提供了以下 npm 脚本用于开发和构建：

```bash
# 开发模式（CSR）
npm run dev

# 服务端渲染构建和运行
npm run ssr

# 构建生产版本
npm run build

# 预览生产构建结果
npm run preview
```

## Vite 配置 ##

项目的 Vite 配置支持 SSR 模式，并设置了一些优化选项：

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  ssr: {
    noExternal: ['vue']  // 确保 Vue 在 SSR 构建中被正确处理
  },
  build: {
    assetsInlineLimit: 0  // 禁用资源内联
  }
})
```

## 客户端入口 (main.ts) ##

客户端入口文件负责创建 Vue 应用实例并挂载到 DOM 上：

```ts
// src/main.ts
import { createApp } from './app'

const { app } = createApp()
app.mount('#app')
```

## 开发注意事项 ##

- **SSR 环境下的数据预取**

  - 使用 `onServerPrefetch` 钩子确保在服务器端正确预取数据
  - 确保组件中的 DOM 操作仅在客户端执行

- **元信息管理**

  - 使用 `useHead` hook 统一管理页面元信息
  - 服务端会将元信息传递给客户端，确保 SEO 友好

- **注意事项（发现的问题）**

  - `home.vue` 和 `about.vue` 中存在标题设置错误：首页组件设置了"关于我们"的标题，而关于页面设置了"首页"的标题
  - 需要修正这两个文件中的元信息设置，确保标题与页面内容一致

## 技术亮点 ##

- **完整的 SSR 实现**：项目展示了 Vue 3 中完整的服务端渲染实现，包括路由预解析、数据预取和 HTML 渲染
- **统一的元信息管理**：通过自定义 hook 实现了 SSR 和 CSR 环境下的元信息统一管理
- **基于 Bun 的服务端**：使用现代的 Bun 运行时作为服务端环境，提升性能
- **组件懒加载**：路由组件使用动态导入实现懒加载，优化初始加载性能

## 部署说明 ##

### 安装依赖 ###

```bash
bun install
```

### 构建项目 ###

```bash
bun run build
```

### 服务端渲染部署 ###

```bash
bun run ssr
```

### 访问应用 ###

打开浏览器访问 `http://localhost:3000`
