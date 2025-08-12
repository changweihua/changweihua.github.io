---
lastUpdated: true
commentabled: false
recommended: false
title: 使用 VueRouter 和 TypeScript 打造优雅的模块化路由系统
description: 使用 VueRouter 和 TypeScript 打造优雅的模块化路由系统
date: 2025-08-12 13:45:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

在 Vue.js 项目中，路由管理是核心功能之一。随着项目规模的扩大，单一的路由配置文件往往变得臃肿且难以维护。本文将展示如何通过自定义路由类型和动态导入技术，结合 Vue Router 和 TypeScript，构建一个模块化、类型安全的路由系统。

## 设计目标 ##

- **类型安全**: 扩展 Vue Router 的路由类型，支持丰富的元信息。
- **模块化**: 将路由分散到各个模块，自动加载并注册。
- **简洁高效**: 减少手动维护路由的繁琐工作。

## 自定义路由类型 ##

为了满足项目的个性化需求，我们需要扩展 `Vue Router` 的默认路由类型 `RouteRecordRaw`，添加自定义的元信息字段。

### 定义扩展类型 ###

在 `src/types/router.d.ts` 文件中，创建自定义路由类型：

```ts
import type { RouteRecordRaw, RouteMeta } from "vue-router";

// 扩展路由记录类型
export declare type ExtendedRouteRecordRaw = RouteRecordRaw & {
    // 菜单高亮的key
    activeMenu?: string;
    // 是否在菜单中隐藏
    hidden?: boolean;
    // 路由元信息
    meta?: RouteMeta & {
      // 标题
      title?: string;
      // 图标
      icon?: string;
      // 权限列表
      roles?: string[];
      // 是否需要缓存
      keepAlive?: boolean;
      // 是否需要登录
      requiresAuth?: boolean;
      // 额外参数
      params?: Record<string, any>;
    };
}
```

### 亮点解析 ###

- **activeMenu**: 用于指定当前路由对应的菜单高亮项。
- **hidden**: 控制路由是否显示在菜单中。
- **meta**: 扩展了 `title`、`icon` 等常用字段，支持权限控制（roles）、页面缓存（keepAlive）等功能。

这个类型为后续的路由定义提供了强大的类型支持，确保代码的健壮性和可读性。

## 实现动态路由加载 ##

在主路由文件 `src/router/index.ts` 中，我们利用 `Vite` 的 `import.meta.glob` 功能，自动导入所有模块的路由定义，并创建路由实例。

```ts
import { createRouter, createWebHistory } from 'vue-router';
import type { ExtendedRouteRecordRaw } from '../types/router.d.ts';
// 定义模块路由的接口
interface ModuleWithRoutes {
  default: ExtendedRouteRecordRaw[];
}
// 动态导入所有模块的 routes.ts 文件
const routeModules = import.meta.glob('@/modules/**/routes.ts', { eager: true }) as Record<string, ModuleWithRoutes>;
// 合并所有路由
const allRoutes: ExtendedRouteRecordRaw[] = Object.values(routeModules)
  .map((module) => module.default)
  .flat();
// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: allRoutes,
});

export default router;
```

### 核心机制 ###

- **import.meta.glob**: 扫描 `src/modules` 目录下所有的 `routes.ts` 文件，`eager: true` 表示立即加载。
- **类型断言**: 将导入结果断言为 `Record<string, ModuleWithRoutes>`，确保类型安全。
- **路由合并**: 使用 `flat()` 将所有模块的路由数组展平，生成完整的路由表。

这种设计无需手动导入每个模块的路由，极大简化了路由管理。

接下来就可以在 `/src/modules` 中编写页面了

## 编写模块化路由 ##

现在，我们可以在 `src/modules` 目录下为每个功能模块定义独立的路由。以首页模块为例：

### 创建首页模块 `/src/modules/Index` ###

#### 定义路由 `routes.ts` ####
在 `src/modules/Index/routes.ts` 中编写路由配置：

```ts
import type { ExtendedRouteRecordRaw } from "@/types/router.d.ts";

export default [
    {
        path: '/',
        component: () => import('./components/IndexPage.vue'),
        meta: {
            title: '首页',
            icon: 'home'
        }
    }
] as ExtendedRouteRecordRaw[]
```

#### 创建页面组件 IndexPage.vue ####
在 `src/modules/Index/components/IndexPage.vue` 中实现页面内容：

```vue
<template>
  <div>
    <h1>欢迎来到首页</h1>
    <p>这是一个模块化的路由示例</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'IndexPage',
});
</script>
```

#### 运行效果 ####

- 保存后，路由 `/` 将自动注册，无需手动在 `router/index.ts` 中添加。
- 访问根路径 `/` 时，会渲染 `IndexPage.vue`，并携带 `meta` 中的标题和图标信息。

## 项目结构概览 ##

完成上述步骤后，你的目录结构可能如下：

```text
project/
├── src/
│   ├── modules/
│   │   └── Index/
│   │       ├── components/
│   │       │   └── IndexPage.vue
│   │       └── routes.ts
│   ├── types/
│   │   └── router.d.ts
│   ├── router/
│   │   └── index.ts
│   └── main.ts
├── tsconfig.json
└── vite.config.ts
```

## 配置环境支持 ##

为了确保 `@/` 别名和 `TypeScript` 正常工作，需要同步配置 `tsconfig.json` 和 `vite.config.ts`。

```json:tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    },
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true
  },
  "include": ["src/**/*"]
}
```

```ts:vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [vue(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**vite-tsconfig-paths**: 自动读取 `tsconfig.json` 的 `paths`，确保别名一致。

## 扩展与应用 ##

### 添加更多模块 ###

在 `src/modules` 下创建新模块，例如 `Dashboard`：

```ts
// src/modules/Dashboard/routes.ts
import type { ExtendedRouteRecordRaw } from '@/types/router.d.ts';

export default [
  {
    path: '/dashboard',
    component: () => import('./components/DashboardPage.vue'),
    meta: {
      title: '仪表盘',
      icon: 'dashboard',
      requiresAuth: true,
    },
  },
] as ExtendedRouteRecordRaw[];
```

### 使用路由元信息 ###

在全局导航守卫中利用 `meta` 字段实现权限控制：

```ts
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/');
  } else {
    document.title = to.meta.title || '默认标题';
    next();
  }
});
``

## 总结 ##

通过自定义路由类型和动态导入，我们实现了一个模块化、可扩展的路由系统：

- **类型安全**: `ExtendedRouteRecordRaw` 提供丰富的元信息支持。
- **自动化**: `import.meta.glob` 自动加载所有模块路由。
- **灵活性**: 轻松添加新模块，无需修改主路由文件。

这种设计特别适合中大型 Vue 项目，能够显著提升开发效率和代码可维护性。
