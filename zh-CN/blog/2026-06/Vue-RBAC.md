---
lastUpdated: true
commentabled: true
recommended: true
title: 前端 RBAC 权限控制实战
description: 从零实现动态路由与细粒度按钮权限
date: 2026-06-05 13:35:00
pageClass: blog-page-class
cover: /covers/vue.svg
---

在后台管理系统开发中，权限控制是核心需求之一。RBAC（Role-Based Access Control，基于角色的访问控制）  因其灵活性和可扩展性，已成为业界标准。前端虽然不能替代后端做最终校验，但通过合理的权限控制，可以显著提升用户体验和界面整洁度——用户看不到自己无权操作的菜单和按钮，自然不会误触或困惑。

本文将从前端视角出发，详细讲解如何基于 RBAC 模型实现：

- 登录后获取用户角色及权限标识
- 动态渲染菜单和路由
- 按钮级别的操作权限
- 权限变更与登出处理

我们以 Vue 3 + Vue Router + Pinia 作为示例技术栈，但核心思路同样适用于 React + React Router。

## 一、RBAC 模型回顾与前端职责 ##

RBAC 的核心关系：用户 → 角色 → 权限。一个用户可以拥有多个角色，每个角色关联若干权限（通常是权限标识符，如 `user:add`、`order:export`）。前端只需要存储“当前用户的权限标识列表”，其余交由后端验证。

### 前端需要做什么？ ###

- 登录成功后，请求后端获取当前用户的权限标识列表（permissions）。
- 根据权限列表，动态生成可访问的路由表。
- 根据权限列表，控制左侧菜单的显示/隐藏。
- 在页面内，根据权限列表控制按钮、标签页等元素的显隐（通常通过自定义指令或函数）。
- 处理路由导航守卫，避免用户手动输入未授权 URL。

### 前端不需要做什么？ ###

- 最终数据校验必须由后端完成（例如删除接口）。
- 前端权限控制只是为了优化体验和减少无效请求，并非安全边界。

## 二、数据模型设计（前后端约定） ##

后端需提供至少两个接口：

### 登录接口 ###

返回用户基本信息及角色列表（角色也可不返回，前端只关心权限标识）。推荐在登录后立即获取权限。

```bash
POST /api/login
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "name": "Admin",
    "roles": ["admin", "editor"]   // 可选
  }
}
```

### 获取当前用户权限接口 ###

```bash
GET /api/user/permissions
Response:
{
  "permissions": [
    "dashboard:view",
    "user:list",
    "user:add",
    "user:edit",
    "user:delete",
    "order:list",
    "order:export"
  ]
}
```

权限标识通常采用 资源:操作 格式，便于理解和扩展。

## 三、前端实现步骤（Vue 3 + Pinia） ##

### 全局状态管理（存储用户及权限） ###

在 stores/user.js 中定义：

```javascript
import { defineStore } from 'pinia'
import { loginApi, getUserPermissionsApi } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null,
    permissions: []   // 权限标识列表
  }),
  actions: {
    async login(loginForm) {
      const res = await loginApi(loginForm)
      this.token = res.token
      localStorage.setItem('token', res.token)
      this.userInfo = res.user
      // 登录成功后立即获取权限列表
      await this.getPermissions()
    },
    async getPermissions() {
      const res = await getUserPermissionsApi()
      this.permissions = res.permissions
    },
    logout() {
      this.token = ''
      this.userInfo = null
      this.permissions = []
      localStorage.removeItem('token')
      // 跳转登录页
      router.push('/login')
    },
    // 工具方法：判断是否有某个权限
    hasPermission(permission) {
      return this.permissions.includes(permission)
    }
  }
})
```

### 动态路由设计 ###

传统方式在 `router/index.js` 中静态定义所有路由，这不适合 RBAC。正确的做法是将路由分为两部分：

- `constantRoutes`：所有人都能访问的路由（如登录页、404、首页）。
- `asyncRoutes`：需要权限的动态路由，按角色/权限动态添加。

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 公共路由（无需权限）
export const constantRoutes = [
  { path: '/login', component: () => import('@/views/login.vue') },
  { path: '/404', component: () => import('@/views/404.vue') },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: () => import('@/views/dashboard.vue') }
]

// 动态路由表（需要权限）
export const asyncRoutes = [
  {
    path: '/user',
    name: 'User',
    component: () => import('@/layout/index.vue'),
    meta: { title: '用户管理', permission: 'user:list' }, // 菜单权限标识
    children: [
      { path: 'list', component: () => import('@/views/user/list.vue'), meta: { title: '用户列表', permission: 'user:list' } },
      { path: 'add', component: () => import('@/views/user/add.vue'), meta: { title: '添加用户', permission: 'user:add', hidden: true } } // hidden: 不在菜单显示
    ]
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('@/layout/index.vue'),
    meta: { title: '订单管理', permission: 'order:list' },
    children: [
      { path: 'list', component: () => import('@/views/order/list.vue'), meta: { title: '订单列表', permission: 'order:list' } },
      { path: 'export', component: () => import('@/views/order/export.vue'), meta: { title: '订单导出', permission: 'order:export', hidden: true } }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

// 存储动态添加的路由名称，避免重复添加
let dynamicRoutesAdded = false

// 路由守卫：根据权限动态添加路由
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  if (userStore.token) {
    if (to.path === '/login') {
      next('/')
    } else {
      // 还没有添加动态路由，则先获取权限并添加
      if (!dynamicRoutesAdded) {
        // 确保权限已加载（若刷新页面，store 中 permissions 可能为空）
        if (userStore.permissions.length === 0) {
          await userStore.getPermissions()
        }
        // 根据权限过滤动态路由
        const accessibleRoutes = filterAsyncRoutes(asyncRoutes, userStore.permissions)
        accessibleRoutes.forEach(route => router.addRoute(route))
        dynamicRoutesAdded = true
        // 重要：添加路由后，需重新进入 to 路径，以匹配新路由
        next({ ...to, replace: true })
      } else {
        next()
      }
    }
  } else {
    if (to.path === '/login') {
      next()
    } else {
      next('/login')
    }
  }
})

// 递归过滤路由：仅保留有权限的
function filterAsyncRoutes(routes, permissions) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(tmp, permissions)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, permissions)
      }
      res.push(tmp)
    }
  })
  return res
}

function hasPermission(route, permissions) {
  if (route.meta && route.meta.permission) {
    return permissions.includes(route.meta.permission)
  }
  return true // 没有设置权限标识，则默认可见
}

export default router
```

> 关键点：动态添加的路由不会持久化，刷新页面后需重新根据权限添加。上述代码在 `beforeEach` 中利用 `dynamicRoutesAdded` 标志，确保只添加一次。

### 菜单渲染（根据权限递归生成） ###

通常左侧菜单来自于 `asyncRoutes` 过滤后的结果。我们可以在 store 中保存一个计算属性 menus。

```javascript
// stores/menu.js 或扩展 userStore
import { asyncRoutes } from '@/router'
import { useUserStore } from './user'

export const useMenuStore = defineStore('menu', {
  state: () => ({ menus: [] }),
  actions: {
    generateMenus() {
      const userStore = useUserStore()
      // 复用相同的过滤逻辑，只保留 meta.hidden !== true 的路由作为菜单
      const filtered = filterAsyncRoutes(asyncRoutes, userStore.permissions, true) // 第三个参数表示过滤 hidden
      this.menus = filtered
    }
  }
})
```

在布局组件中调用 `generateMenus`，然后递归渲染 `<el-menu>` 或自定义菜单组件。

### 按钮级权限控制 ###

按钮权限不能依赖路由，而应使用权限标识进行显隐控制。提供三种常用方式：

#### 方式一：封装权限判断函数（适合模板） ####

```vue
<template>
  <button v-if="hasPermission('user:add')">新增用户</button>
  <button v-if="hasPermission('user:delete')">删除</button>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
const hasPermission = (perm) => userStore.hasPermission(perm)
</script>
```

#### 方式二：自定义指令 `v-permission`（更优雅） ####

```javascript
// directives/permission.js
import { useUserStore } from '@/stores/user'

export default {
  mounted(el, binding) {
    const { value } = binding
    if (value && value instanceof Array && value.length > 0) {
      const userStore = useUserStore()
      const hasPermission = value.some(perm => userStore.hasPermission(perm))
      if (!hasPermission) {
        el.parentNode?.removeChild(el)
      }
    } else {
      throw new Error('need permissions! Like v-permission="[\'user:add\']"')
    }
  }
}
```

注册后使用：

```html
<button v-permission="['user:add']">新增用户</button>
```

### 路由守卫增强：禁止无权限用户手动输入 URL ###

虽然动态添加路由时已经过滤了未授权的路由，但如果用户手动输入一个未授权但未在动态路由表中出现的路径，应如何处理？

```ts
// 在 beforeEach 最后判断：如果 to 匹配不到任何路由（包括动态添加后），则显示 404 或提示无权限
router.beforeEach(async (to, from, next) => {
  // ... 上述逻辑
  if (to.matched.length === 0) {
    next('/404')
  } else {
    next()
  }
})
```

因为动态路由是通过 `addRoute` 添加的，`router.hasRoute(to.name)` 也可用于判断。

## 四、处理页面刷新与 token 过期 ##

刷新页面时，store 状态会重置（Pinia 默认不持久化）。解决方案：

- 保留 token：已在 `localStorage` 存储。
- 重新获取权限：在路由守卫或 `App.vue` 的 `onMounted` 中检查 `userStore.permissions` 长度，若为空且有 token，则调用 `getPermissions()` 并重新生成动态路由。
- 401 拦截：在 `axios` 响应拦截器中，若后端返回 401（token 失效），清除本地存储并跳转登录。

```js
// axios 拦截器示例
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)
```

## 五、React 版本思路简述 ##

React 生态中，可使用 React Router v6 + Context / Zustand / Redux 实现类似逻辑：

- 在 `App` 或 `Layout` 组件中根据权限生成路由对象数组，使用 `useRoutes` 动态生成。
- 菜单同样递归渲染。
- 按钮权限使用自定义 Hook `usePermission` 或高阶组件。

核心思想完全一致，只需根据框架 API 调整即可。

## 六、进阶优化建议 ##

### 权限缓存的必要性 ###

权限数据相对稳定，除非后台修改了角色权限。可以在前端缓存权限数据（如 `sessionStorage`），减少每次刷新都请求后端接口。但需注意权限变更的实时性 —— 可在用户重新登录时强制更新，或者提供“刷新权限”按钮。

### 按钮权限的细化：禁用 vs 隐藏 ###

有些场景下，按钮不应隐藏，而是置灰并提示无权限。这需要根据业务决定，`v-permission` 指令可以扩展为接收两种模式：remove（默认删除）或 `disable`。

### 性能考虑 ###

动态路由递归过滤在大型应用中可能有性能开销，但通常路由表规模可控（几十到上百条）。可以在构建时预先生成权限与路由的映射关系，减少运行时判断。

### 与后端联调规范 ###

建议前后端统一权限标识符的命名规范，例如 `<模块>:<操作>`，避免混乱。前端可维护一个权限常量文件 permissions.js，列举所有权限标识，方便代码提示和重构。

## 七、总结 ##

前端 RBAC 权限控制并不复杂，核心流程可概括为：

- 登录获取用户权限标识列表；
- 根据权限列表过滤动态路由并动态添加；
- 根据权限递归生成菜单；
- 在组件内根据权限标识控制按钮/元素显示。

采用这套方案，任何后台管理系统都能快速落地清晰的权限控制。但请记住：前端权限只负责“遮羞”，真正的安全防线永远在后端。权限标识不要在前端存储敏感信息，也不要仅靠前端限制就相信用户操作。

希望本文能帮助您彻底理清前端 RBAC 的实现思路。如果您在实践中有任何疑问或更好的方法，欢迎留言讨论！
