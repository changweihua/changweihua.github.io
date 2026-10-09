---
lastUpdated: true
commentabled: true
recommended: true
title: Vue3 集成 VueRouter
description: Vue3 集成 VueRouter
date: 2025-12-29 15:00:00 
pageClass: blog-page-class
cover: /covers/css.svg
---

Vue Router 是 Vue.js 的官方路由管理器，用于构建单页面应用程序（SPA）。它与 Vue.js 核心深度集成，使得构建单页应用变得简单高效。

## 使用场景 ##

- 构建单页面应用程序（SPA）
- 需要前端路由管理的项目
- 需要实现页面导航、路由守卫和懒加载等功能
- 需要基于路由的参数传递和状态管理

## 注意事项 ##

- Vue Router 4.x 专为 Vue 3 设计，与 Vue 2 需要使用 Vue Router 3.x
- 路由配置应合理组织，避免过于复杂嵌套
- 注意路由守卫的执行顺序和时机
- 动态路由参数变化时组件不会重新创建，需要使用监听器处理
- 路由模式分为 hash 模式和 history 模式，后者需要服务器配置支持

## 基本用法 ##

### 安装与配置 ###

```sh
npm install install vue-router@4 // [!=npm auto]
```

### 新建 router/routes.ts ###

创建 src/router/routes.ts 文件

在 src 下创建 router 目录，然后在 router 目录里新建 routes.ts 文件：

```txt
 └── src/
     ├── router/
         ├── routes.ts  // 路由文件
         ├── index.ts  // 路由配置文件
```

**方式1**

```ts
// router/routes.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

// 定义路由配置
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutView.vue')
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('@/views/UserView.vue'),
    props: true // 将路由参数作为 props 传递给组件
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(), // 使用 HTML5 History 模式
  routes
});

export default router;
```

**方式2**

```ts 体验AI代码助手 代码解读复制代码import { type RouteRecordRaw } from 'vue-router';
declare module 'vue-router' {
  interface _RouteRecordBase {
    hidden?: boolean | string | number;
  }
}
const routes: RouteRecordRaw[] = [
  {
    path: '/index',
    name: 'index',
    component: () => {
      return import('../components/Homepage.vue');
    },
    meta: {
      keepAlive: true
    },
    children: [
      // 添加子路由
      {
        path: 'article',
        name: 'article',
        component: () => {
          return import('../views/page/article/index.vue');
        }
      },
      {
        path: 'TestTool',
        name: 'TestTool',
        component: () => {
          return import('../views/page/testTool/TestTool.vue');
        },
        children: [
          // 添加子路由
          {
            path: 'TestToolConvert',
            name: 'TestToolConvert',
            component: () => {
              return import('@/views/page/testTool/TestToolConvert.vue');
            }
          }
        ]
      }
    ]
  },
  { path: '/', redirect: { name: 'home' } }
];
export default routes;
```

### 新建router/index.ts ###

```ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createRouter, createWebHistory, _RouteRecordBase } from 'vue-router'
import routes from './routes'
import NProgress from 'nprogress'

const router = createRouter({
  history: createWebHistory(), //历史模式会制造页面刷新
  routes
})
// 页面切换之前取消上一个路由中未完成的请求
router.beforeEach((_to: any, _from: any, next: () => void) => {
  NProgress.start()
  next()
})
router.afterEach(() => {
  // 进度条
  NProgress.done()
})
export default router
```

### 挂载路由配置 ###

`​main.ts` 文件中挂载路由配置

```ts
import { createApp } from 'vue'
import App from './App.vue'

import router from './router/index'
// use
const app = createApp(App)
app.use(router)
```

### 在组件中使用路由 ###

```vue
<template>
  <div>
    <nav>
      <router-link to="/">首页</router-link>
      <router-link to="/about">关于</router-link>
      <router-link :to="{ name: 'User', params: { id: 123 }}">用户页面</router-link>
    </nav>
    
    <!-- 路由出口 -->
    <router-view />
  </div>
</template>

<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router'

// 获取路由实例和当前路由
const router = useRouter()
const route = useRoute()

// 编程式导航
const goToAbout = () => {
  router.push('/about')
  // 或者使用命名路由
  // router.push({ name: 'About' })
}

const goToUser = (id: number) => {
  router.push({ name: 'User', params: { id } })
}

// 替换当前路由（不添加历史记录）
const replaceRoute = () => {
  router.replace('/about')
}

// 前进后退
const goBack = () => {
  router.go(-1) // 后退一步
}

const goForward = () => {
  router.go(1) // 前进一步
}
</script>
```

### 路由出口 ###

```vue
<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" v-if="$route.meta.keepAlive" />
      </keep-alive>
      <component :is="Component" v-if="!$route.meta.keepAlive" />
    </router-view>
  </div>
</template>
```

## 常用操作 ##

### 路由参数和查询参数 ###

```vue
<template>
  <div>
    <h1>用户详情</h1>
    <p>用户ID: {{ userId }}</p>
    <p>用户名: {{ username }}</p>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { computed, watch } from 'vue'

const route = useRoute()

// 获取路由参数
const userId = computed(() => route.params.id as string)

// 获取查询参数
const username = computed(() => route.query.name as string || '未知用户')

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId) => {
    console.log('用户ID变化:', newId)
    // 可以在这里重新获取用户数据
  }
)
</script>
```

### 嵌套路由 ###

```typescript
// router/index.ts
const routes: Array<RouteRecordRaw> = [
  {
    path: '/user/:id',
    component: () => import('@/views/UserLayout.vue'),
    children: [
      {
        path: '',
        name: 'UserProfile',
        component: () => import('@/views/UserProfile.vue')
      },
      {
        path: 'posts',
        name: 'UserPosts',
        component: () => import('@/views/UserPosts.vue')
      },
      {
        path: 'settings',
        name: 'UserSettings',
        component: () => import('@/views/UserSettings.vue')
      }
    ]
  }
]
```

```vue
<!-- UserLayout.vue -->
<template>
  <div>
    <h1>用户页面</h1>
    <nav>
      <router-link :to="{ name: 'UserProfile', params: { id: $route.params.id }}">资料</router-link>
      <router-link :to="{ name: 'UserPosts', params: { id: $route.params.id }}">帖子</router-link>
      <router-link :to="{ name: 'UserSettings', params: { id: $route.params.id }}">设置</router-link>
    </nav>
    
    <!-- 嵌套路由出口 -->
    <router-view />
  </div>
</template>
```

### 路由守卫 ###

```typescript
// router/index.ts
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

// 全局前置守卫
router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  // 可以在这里进行权限检查
  const isAuthenticated = checkAuth() // 假设的认证检查函数
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 可以在这里进行页面跟踪等操作
  document.title = to.meta.title as string || '默认标题'
})

// 路由独享的守卫
const routes: Array<RouteRecordRaw> = [
  {
    path: '/admin',
    component: () => import('@/views/AdminView.vue'),
    beforeEnter: (to, from, next) => {
      // 检查管理员权限
      if (isAdmin()) {
        next()
      } else {
        next({ name: 'Home' })
      }
    }
  }
]
```

```vue
<!-- 组件内守卫 -->
<script lang="ts" setup>
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

// 在组件卸载前调用
onBeforeRouteLeave((to, from, next) => {
  // 可以在这里询问用户是否确认离开
  const answer = window.confirm('确定要离开吗？未保存的更改将会丢失。')
  if (answer) {
    next()
  } else {
    next(false)
  }
})

// 在当前路由更新但该组件被复用时调用
onBeforeRouteUpdate((to, from, next) => {
  // 可以在这里获取新的数据
  fetchUserData(to.params.id as string)
  next()
})
</script>
```

### 配置404页面 ###

修改router/routes.ts

`*` 代表通配符，若放在任意路由前，会被先匹配，导致跳转到 404 页面，所以需将如下配置置于最后。

```ts
const routes = [
  ...//添加（放在最后）
  {
    path: "/:pathMatch(.*)*",
    component: () => import("@/pages/notFound.vue"),
  },
  {
  path: '*',
  name: '404'
  component: () => import('./404.vue')  
  }
];
```

### 路由重定向 ###

在嵌套路由中，当访问 `/home` 时想重定向到 `/home/user`

修改router/routes.ts

```ts
{
    path: '/home',
    component: () => import('@/pages/home.vue'),
    redirect: '/home/user', //新增
    children: [
      {
        path: '/home/user',
        component: () => import('@/pages/user.vue'),
      },
      {
        path: '/home/manage',
        component: () => import('@/pages/manage.vue'),
      },
    ],
  },
```

### 刷新当前路由 ###

```ts
//+new Date()保证每次点击路由的query项都是不一样的，确保会重新刷新view
const routers = async (path: string) => {
  await router.push({
    path: path,
    query: {
      t: +new Date()
    }
  })
}
```

### 跳转新窗口 ###

```ts
/**
 * @description: 跳转新页面
 * @param {string} url
 * @return {*}
 */
function winUrl(url: string): any {
  window.open(url)
}

async function resolveId(path: string, id: number) {
  const { href } = resolve(path, id)
  await winUrl(href)
}
```

## 高级用法 ##

### 路由懒加载 ###

使用 `() => import()` 方式导入的组件，只会在第一次进入页面时才会加载对应路由的组件

```ts
// 方式1
const UserDetails = () => import('./views/UserDetails.vue')
const router = createRouter({
  // ...
  routes: [{ path: '/users/:id', component: UserDetails }],
})

// 方式2
// 使用动态导入实现懒加载
const routes: Array<RouteRecordRaw> = [
  {    path: '/admin',
    name: 'Admin',
    component: () => import(/* webpackChunkName: "admin" */ '@/views/Admin.vue')
  }
]
```

### 滚动行为 ###

```typescript
// router/index.ts
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 返回滚动位置
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    } else {
      return { top: 0, left: 0 }
    }
  }
})
```

### 动态路由 ###

```typescript
// 添加路由
const newRoute: RouteRecordRaw = {
  path: '/new-route',
  component: () => import('@/views/NewView.vue')
}
router.addRoute(newRoute)

// 添加嵌套路由
router.addRoute('parent-route', {
  path: 'child-route',
  component: () => import('@/views/ChildView.vue')
})

// 删除路由
router.removeRoute('route-name')
```

## 路由模式 ##

### Hash 模式 ###

```typescript
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(), // 使用 URL hash
  routes
})
```

### History 模式 ###

```typescript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(), // 使用 HTML5 History API
  routes
})
```

## 路由导航 ##

### useRoute/useRouter ###

```ts
<script setup>
  import { useRoute, useRouter } from 'vue-router'
  const route = useRoute()  // 路由信息
  console.log(route.query)
  const router = useRouter()// 路由跳转
  router.push('/newPage')
</script>
```

### 路由导航流程 ###

1. 导航被触发
2. 在失活的组件里调用  beforeRouteLeave 守卫
3. 调用全局 beforeEach 前置守卫
4. 重用的组件调用 beforeRouteUpdate 守卫（2.2+）
5. 路由配置调用 beforeEnter
6. 解析异步路由组件
7. 在被激活的组件里调用 beforeRouteEnter 守卫
8. 调用全局的 beforeResolve 守卫（2.5+）
9. 导航被确认
10. 调用全局的 afterEach
11. 触发 DOM 更新
12. 调用 beforeRouteEnter 守卫中传给 next 的回调函数，创建好的组件实例会作为回调函数的参数传入

### 编程式导航 ###

**组合式API**

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const handleManage = () => {
  router.push('/home/manage');
};
</script>
```

### 路由传参 ###

**query传参**

```vue
//页面传参
<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const handleManage = () => {
  router.push({
    path: '/home/manage',
    query: {
      plan: '123', // t: +new Date()
    },
  });
};
</script>
```

```vue
//页面接参
<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();

console.log(route.query.plan); //query接参 
</script>
```

### 无参跳转 ###

```ts
// 字符串
router.push('home')
// 对象
router.push({ path: 'home' })
```

### 带参跳转 ###

```ts
/**
 * 传值跳转
 * @param path 路径
 * @param value 值
 */
const routerId = async (path: string, value: number | string) => {
  await router.push({
    path: path,
    query: {
      id: value,
      t: +new Date()
    }
  })
}
```

**获取跳转过来的参数**

```ts
import { useRoute } from 'vue-router'
 const route = useRoute()
 const state = reactive({
      id: route.query.id,
 })
```

### 动态路由匹配 ###

```ts
//定义路由
{
    path: '/register/:plan', // 动态字段以冒号开始
    component: () => import('@/pages/register.vue'),
  },
```

```vue
//页面传参
<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();

const handleManage = () => {
  router.push('/register/123');
};
</script>
```

```vue
//页面接参
<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();

console.log(route.params.plan); //params接参
</script>
```

### 存储懒加载组件 ###

```ts
// 用对象字面量来存储懒加载组件的路径和对应的组件函数
const asyncComponents = {
  home: () => {
    return import('@/components/MyHome.vue')
  },
  article: () => {
    return import('@/views/page/article/Index.vue')
  },
  column: () => {
    return import('@/views/page/article/components/column/ArticleColumn.vue')
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'homes',
    meta: {
      keepAlive: true
    },
    component: asyncComponents.home
  },
```

## 导航守卫 ##

vue-router 提供的导航守卫主要用来通过跳转或取消的方式守卫导航。这里有很多方式植入路由导航中：全局的，单个路由独享的，或者组件级的。

### 路由导航守卫 ###

```vue
<script setup>
  import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

  // 添加一个导航守卫，在当前组件将要离开时触发。
  onBeforeRouteLeave((to, from, next) => {
    next()
  })

  // 添加一个导航守卫，在当前组件更新时触发。
  // 在当前路由改变，但是该组件被复用时调用。
  onBeforeRouteUpdate((to, from, next) => {
    next()
  })
</script>
```

### 全局前置守卫 ###

在路由跳转前触发，可在执行 `next` 方法前做登录判断，未登陆用户跳转到登录页

```ts
const router = new createRouter({})
//to: 即将要进入的目标 用一种标准化的方式
//from: 当前导航正要离开的路由 用一种标准化的方式
router.beforeEach((to, from, next) => {
    if (to.path === '/login') {
      //在登录页做清除操作，如清除token等
    }
  
    if (!localStorage.getItem('token') && to.path !== '/login') {
      // 未登陆且访问的不是登录页，重定向到登录页面
      return '/login';
    }
  ...
  // 必须执行 next 方法来触发路由跳转 
  next() 
  // 返回 false 以取消导航
  return false
})

// 含有异步操作的方法
router.beforeEach(async (to, from, next) => {
  const res = await fetch("****");
  // to: 跳转到哪个路由
  // from: 从哪个路由跳转过来
  // next: 跳转函数，可以跳转到具体的 url
});
```

**死循环解决**

*vue Router warn The “next“ callback was called more than once in one navigation guard*

```ts
router.beforeEach(async (to, from, next) => {
    const token = Cookies.get('token');
    if (to.path === '/login' || to.path === '/') {
        next();
    }
    else {
        if (token) {
            next();
        } else {
          console.log('pms out');
            next('/login');
        }
    }
})
```
‍
### 全局解析守卫 ###

与 `beforeEach` 类似，也是路由跳转前触发，区别是还需在*所有组件内守卫和异步路由组件被解析之后*，也就是在组件内 `beforeRouteEnter` 之后被调用。

```ts
router.beforeResolve((to, from, next) => {
  ...
  // 必须执行 next 方法来触发路由跳转 
  next() 
})
```

### 全局后置钩子 ###

和守卫不同的是，这些钩子不会接受 `next` 函数也不会改变导航本身。它们对于分析、更改页面标题、声明页面等辅助功能以及许多其他事情都很有用。

```ts
router.afterEach((to, from) => {
  // ...
})
```

### 路由独享守卫 ###

使用场景：部分页面不需要登录，部分页面需要登录才能访问

可在路由配置上直接定义 `beforeEnter`

```ts
const auth = () => {
  if (!localStorage.getItem("token")) {
    // 未登陆,重定向到登录页面
    return "/login";
  }
};

const routes = [
  ...{
    path: "/home",
    component: () => import("@/pages/home.vue"),
    redirect: "/home/user",
    children: [
      {
        path: "/home/user",
        component: () => import("@/pages/user.vue"),
      },
      {
        path: "/home/manage",
        component: () => import("@/pages/manage.vue"),
        beforeEnter: auth, //路由独享守卫
      },
    ],
  },
];
```

### 组件内的守卫 ###

使用情景：预防用户在还未保存修改前突然离开。该导航可以通过返回 `false` 来取消

组件内可直接定义如下路由导航守卫

```vue
<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router';

// 与 beforeRouteLeave 相同，无法访问 `this`
onBeforeRouteLeave((to, from) => {
  const answer = window.confirm('确定离开吗');
  // 取消导航并停留在同一页面上
  if (!answer) return false;
});
</script>
```

### 路由元信息 ###

将自定义信息附加到路由上，例如页面标题，是否需要权限，是否开启页面缓存等

使用路由元信息+全局前置守卫实现部分页面不需要登录，部分页面需要登录才能访问

修改 `router/index.ts`

```ts
const routes = [
  ...{
    path: "/home",
    component: () => import("@/pages/home.vue"),
    redirect: "/home/user",
    children: [
      {
        path: "/home/user",
        component: () => import("@/pages/user.vue"),
      },
      {
        path: "/home/manage",
        component: () => import("@/pages/manage.vue"),
        meta: {
          title: "管理页", // 页面标题
          auth: true, //需要登录权限
        },
      },
    ],
  },
];
```

**修改 `router/index.ts`**

```ts
router.beforeEach((to, from) => {
  if (!localStorage.getItem("token") && to.meta.auth) {
    // 此路由需要授权，请检查是否已登录
    // 如果没有，则重定向到登录页面
    return {
      path: "/login",
      // 保存我们所在的位置，以便以后再来
      query: { redirect: to.fullPath },
    };
  }
});
```

## router-link ##

router-link 组件默认为a标签，在vue router 3.x中，可通过tag属性更改标签名，event属性更改事件名
在vue router 4.x中，这两个属性已被删除，通过作用域插槽（子组件给父组件传值的插槽）实现自定义导航标签

### 示例：将导航标签改为div，且需双击触发 ###

**active-class**

```vue
<router-link v-slot="{ href, navigate, isExactActive }" to="/home/user" custom>
  <div :class="{ active: isExactActive }" :href="href" @dblclick="navigate">跳转user</div>
</router-link>
```

```vue
<!-- 字符串 -->
<router-link to="home">Home</router-link>

<!-- 使用 v-bind 的 JS 表达式 -->
<router-link v-bind:to="'home'">Home</router-link>

<!-- 不写 v-bind 也可以，就像绑定别的属性一样 -->
<router-link :to="'home'">Home</router-link>

<!-- 同上 -->
<router-link :to="{ path: 'home' }">Home</router-link>

<!-- 命名的路由 -->
<router-link :to="{ name: 'user', params: { userId: 123 }}">User</router-link>

<!-- 带查询参数，下面的结果为 /register?plan=private -->
<router-link :to="{ path: 'register', query: { plan: 'private' }}">Register</router-link>
```

设置 `replace` 属性,点击时，会调用 `router.replace()` 而不是 `router.push()`，导航后不会留下 `history` 记录。

```vue
<router-link :to="{ path: '/abc'}" replace></router-link>
```

设置 `append` 属性后，则在当前 (相对) 路径前添加其路径。例如，我们从 `/a` 导航到一个相对路径 `b`，如果没有配置 `append`，则路径为 `/b`，如果配了，则为 `/a/b`

```vue
<router-link :to="{ path: 'relative/path'}" append></router-link>`
```

**exact-active-class**

配置当链接被精确匹配的时候应该激活的 `class`。可以通过以下代码来替代。

```html
<p>
   <router-link v-bind:to = "{ path: '/route1'}" exact-active-class = "_active">Router Link 1</router-link>
   <router-link v-bind:to = "{ path: '/route2'}" tag = "span">Router Link 2</router-link>
</p>
```

### router.go(n) ###

这个方法的参数是一个整数，意思是在 `history` 记录中向前或者后退多少步，类似 `window.history.go(n)`。

```ts
// 在浏览器记录中前进一步，等同于 history.forward()
router.go(1)
// 后退一步记录，等同于 history.back()
router.go(-1)
// 前进 3 步记录
router.go(3)
// 如果 history 记录不够用，那就默默地失败呗
router.go(-100)
router.go(100)
```

### 子路由 ###

```vue
<a-menu-item key="1" @click="Routers('/Admin-index/ArticleTable')">文章列表</a-menu-item>
<router-view></router-view>
```

**路由配置**

```ts
{
  path: '/Admin-index',
  name: 'Admin-index',
  component: () => import('@/views/admin/index/index.vue'),
  children: [   // 添加子路由
    {
      path: 'ArticleTable',
      name: 'ArticleTable',
      component: () => import('@/views/admin/article/ArticleTable.vue'),
    },
  ]
},
```

## 路由守卫及页面权限控制 ##

```ts
import router, { asyncRoutes } from '@/router'
import store from '@/store'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
// import getPageTitle from '@/utils/get-page-title'

//  to:要去哪个页面
//  from:从哪里来
//  next:它是一个函数。
//     如果直接放行 next()
//  to:要去哪个页面
//  from:从哪里来
//  next:它是一个函数。
//     如果直接放行 next()
//     如果要跳到其它页 next(其它页)
const whiteList = ['/login', '/404']

router.beforeEach(async(to, from, next) => {
  document.title = 'hr人力项目--' + to.meta.title
  //   console.log(to, '跳转至', from)
  // document.title = getPageTitle(to.meta.title)
  NProgress.start() // 开启进度条
  const token = store.state.user.token
  if (token) {
    // 已经登陆
    if (to.path === '/login') {
    // 如果当前在登录页，那么跳转首页
      next('/') // next('/') 只要指定地址跳转，就不会经过router.afterEach(),因此需要手动关闭进度条
      NProgress.done() // 关闭进度条
    } else {
      if (!store.getters.userId) {
      // 即将进入登录页调用获取用户信息的函数 [需满足两个条件，1) 需拥有token   2)并未在登录页上  ]
        const menuList = await store.dispatch('user/getUserInfo')
        console.log(menuList, 'menuListdsadasdsdsa')
        console.log(asyncRoutes, 'asyncRoutes')
        const filterRoutes = asyncRoutes.filter(route => {
          const routeName = route.children[0]
          console.log(route.children[0], 'route.children[0].name')
          return menuList.includes(routeName)
        })
        filterRoutes.push({ path: '*', redirect: '/404', hidden: true })
        // console.log(filterRoutes, 'filterRoutesfilterRoutes')
        router.addRoutes(filterRoutes)
        store.commit('menus/setMenuList', filterRoutes)
        // next({ ...to, replace: true })
        next(to.path)
        // 重新加载页面
      } else {
        next()
      }
      // 如果没有在登录页，那么放行，
    }
  } else {
    // 没有登录
    if (whiteList.includes(to.path)) {
    // 如果此时在白名单页面上，那么放行
      next()
    } else {
      // 如果此时不在白名单页面上，那么跳转至登录页
      next('/login')
      NProgress.done() // 关闭进度条
    }
  }
})
// 页面跳转之后执行钩子函数afterEach()
router.afterEach(() => {
  NProgress.done() // 关闭进度条
})
```

## 常见问题与解决方案 ##

### 处理重复导航错误 ###

```typescript
// 封装一个安全的导航函数
const safePush = (path: string) => {
  if (route.path !== path) {
    router.push(path)
  }
}

// 或者在全局错误处理中捕获
router.onError((error) => {
  if (error.message.includes('Avoided redundant navigation')) {
    // 忽略重复导航错误
  } else {
    // 处理其他错误
    console.error('路由错误:', error)
  }
})
```

### 处理未知路由 ###

```typescript
// 添加一个捕获所有路由的规则
const routes: Array<RouteRecordRaw> = [
  // ...其他路由
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]
```

### 路由对象/属性类型报错 ###

引入 `_RouteRecordBase` 定义 `hidden`

```js
import {
    createRouter,
    createWebHashHistory,
    RouteRecordRaw,
    _RouteRecordBase 
} from 'vue-router'

declare module 'vue-router'{
    interface _RouteRecordBase {
        hidden?: boolean | string | number
    }
}

const routes: Array<RouteRecordRaw> = [
 {
        path: '/',
        redirect: '/login',
    },
    {
        path: '/login',
        name:'login',
       	hidden: false,
        component: () => import('@/views/login.vue'), // 懒加载组件
    }
]
```

`vue3 TypeError: parentComponent.ctx.deactivate is not a function`

只要为 `​​component` ​​动态组件添加一个唯一属性​​key​​即可

```vue
<component :is="Component" :key="route.name" v-if="route.meta.isKeepAlive"></component>
```

### router 文件中，使用 pinia 报错 ###

在 Vue 3​ 中，无论 main.js​ 里的 `app.use(pinia)`​ 写在 `app.use(router)`​ 前面还是后面，vue-router​，总是先初始化，所以会出现 pinia​ 使用报错。所以我们在使用 pinia​ 时需要在 `router.beforeEach` 函数中进行仓库初始化。

```ts
// router/index.ts
import { useMenuStore } from "@/store/menu";
// 写在这里会报错
const menuStore = useMenuStore();

router.beforeEach(async (to, from, next) => {
  // ***
});

// 正常获取
router.beforeEach(async (to, from, next) => {
  // 不报错
  const menuStore = useMenuStore();
  // ***
});
```

> 🚀 Vue Router 插件系统：让路由扩展变得简单优雅

## 背景 ##

在 Vue 应用开发中，我们经常需要围绕 Vue Router 开发各种功能，比如页面导航方向、跨页面通信、滚动位置还原等。这些功能本可以作为 Vue Router 的扩展独立开发，但由于 Vue Router 官方并不支持插件机制，我们不得不将它们作为 Vue 插件来实现，这带来了以下问题：

### 插件的职责模糊不清 ###

以页面缓存插件为例，它本应为 Vue Router 提供功能，却必须作为 Vue 插件开发，这让人感觉关注点有所偏离：

```ts
import type { ComputedRef, Plugin } from 'vue'

declare module 'vue-router' {
  interface Router {
    keepAlive: {
      pages: ComputedRef<string[]>
      add: (page: string) => void
      remove: (page: string) => void
    }
  }
}

export const KeepAlivePlugin: Plugin = (app) => {
  const router = app.config.globalProperties.$router
  if (!router) {
    throw new Error('[KeepAlivePlugin] 请先安装 Vue Router.')
  }

  const keepAlivePageSet = shallowReactive(new Set<string>())
  const keepAlivePages = computed(() => Array.from(keepAlivePageSet))

  router.keepAlive = {
    pages: keepAlivePages,
    add: (page: string) => keepAlivePageSet.add(page),
    remove: (page: string) => keepAlivePageSet.delete(page),
  }

  // 在路由变化时自动更新缓存列表
  router.afterEach((to, from) => {
    if (to.meta.keepAlive) {
      keepAlivePageSet.add(to.fullPath)
    }
  })
}
```

### 需要手动清理响应式副作用 ###

仍以页面缓存插件为例，我们需要使用 `effectScope` 创建响应式副作用，并在应用卸载时手动停止：

```ts
import { effectScope } from 'vue'

// ...

export const KeepAlivePlugin: Plugin = (app) => {
  // ...

  const scope = effectScope(true)
  const keepAlivePageSet = scope.run(() => shallowReactive(new Set<string>()))!
  const keepAlivePages = scope.run(() =>
    computed(() => Array.from(keepAlivePageSet)),
  )!

  // ...

  app.onUnmount(() => {
    scope.stop()
    keepAlivePageSet.clear()
  })
}
```

### 插件初始化时机问题 ###

Vue Router 的 `createRouter()` 和 `app.use(router)` 是分离的，无法在创建 Router 时立即安装扩展插件，这可能导致插件功能在初始化之前就被调用：

```ts
// src/router/index.ts
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/home',
      component: HomeView,
    },
  ],
})

// KeepAlivePlugin 的类型扩展已生效，但插件可能尚未初始化
// 手动调用插件方法
router.keepAlive.add('/home')
```

```ts
// main.ts
app.use(router).use(KeepAlivePlugin)
```

## 解决方案 ##

经过 Vue Router 4 插件集合与插件系统的设计实践，开发了 `vue-router-plugin-system`，旨在为 Vue Router 提供标准化的插件系统与统一的安装机制，让路由扩展功能的开发和集成变得简单、高效、可复用。

仍以页面缓存插件为例，使用 `vue-router-plugin-system` 后的完整代码如下：

```ts
// src/router/plugins/keep-alive.ts
import type { ComputedRef, Plugin } from 'vue'
import type { RouterPlugin } from 'vue-router-plugin-system'
import { withInstall } from 'vue-router-plugin-system'

declare module 'vue-router' {
  interface Router {
    keepAlive: {
      pages: ComputedRef<string[]>
      add: (page: string) => void
      remove: (page: string) => void
    }
  }
}

// RouterPlugin 在插件安装时会通过 effectScope 自动收集响应式副作用，
// 在应用卸载时自动停止，且 router 实例会被显式地注入到插件上下文中，
// 无需再通过 app.config.globalProperties.$router 获取
export const KeepAlivePluginImpl: RouterPlugin = ({ router, onUninstall }) => {
  const keepAlivePageSet = shallowReactive(new Set<string>())
  const keepAlivePages = computed(() => Array.from(keepAlivePageSet))

  router.keepAlive = {
    pages: keepAlivePages,
    add: (page: string) => keepAlivePageSet.add(page),
    remove: (page: string) => keepAlivePageSet.delete(page),
  }

  // 在路由变化时自动更新缓存列表
  router.afterEach((to, from) => {
    if (to.meta.keepAlive) {
      keepAlivePageSet.add(to.fullPath)
    }
  })

  onUninstall(() => {
    keepAlivePageSet.clear()
  })
}
```

```ts
// src/router/index.ts
import { createRouter } from 'vue-router-plugin-system'
import { KeepAlivePluginImpl } from './plugins/keep-alive'

// 使用库提供的 createRouter 函数创建 Router 实例，
// 支持直接注册插件，也支持其他集成方式（详见下文）
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/home',
      component: HomeView,
    },
  ],

  // 通过 plugins 选项在创建 Router 时自动安装
  plugins: [KeepAlivePluginImpl],
})

// 插件功能已就绪，可以安全调用
router.keepAlive.add('/home')
```

## 插件开发 ##

一个完整的插件示例：

```ts
import type { RouterPlugin } from 'vue-router-plugin-system'
import { inject, watch } from 'vue'

const LoggerPlugin: RouterPlugin = ({
  router,
  runWithAppContext,
  onUninstall,
}) => {
  // 添加路由守卫
  router.beforeEach((to, from, next) => {
    console.log(`路由跳转: ${from.path} → ${to.path}`)
    next()
  })

  // 需要 App 上下文时使用（如 inject、pinia store 等）
  runWithAppContext(() => {
    const theme = inject('theme', 'light')
    watch(router.currentRoute, (route) => {
      console.log('当前路由:', route.path, '主题:', theme)
    })
  })

  // 注册清理逻辑
  onUninstall(() => {
    console.log('插件正在清理')
  })
}
```

## 集成方式 ##

### 方案一：插件库集成 ###

#### 插件库开发 ####

```ts
// 将此包作为开发依赖，用 withInstall 包装插件并打包到 dist 中
import { withInstall } from 'vue-router-plugin-system'

const MyRouterPlugin = withInstall(
  ({ router, runWithAppContext, onUninstall }) => {
    // 插件实现
  },
)

export default MyRouterPlugin
```

```json
// package.json
{
  "devDependencies": {
    "vue-router-plugin-system": "latest"
  }
}
```

#### 应用侧安装 ####

```ts
import MyRouterPlugin from 'some-plugin-package'

// 选项 A：直接安装到路由实例，推荐紧跟在 createRouter 之后调用
MyRouterPlugin.install(router)

// 选项 B：作为 Vue 插件注册，必须在 Vue Router 之后，否则会抛出异常
app.use(router)
app.use(MyRouterPlugin)
```

### 方案二：应用内部插件集成 ###

对于应用内部开发的路由插件，可以在应用侧统一注册和管理。

#### 内部插件开发 ####

```ts
// 只需导出 RouterPlugin 实现
import type { RouterPlugin } from 'vue-router-plugin-system'

// src/router/plugins/auth.ts
export const AuthPlugin: RouterPlugin = ({
  router,
  runWithAppContext,
  onUninstall,
}) => {
  // 插件实现
  router.beforeEach((to, from, next) => {
    // 权限检查逻辑
    next()
  })
}

// src/router/plugins/cache.ts
export const CachePlugin: RouterPlugin = ({
  router,
  runWithAppContext,
  onUninstall,
}) => {
  // 缓存管理逻辑
}
```

#### 应用侧安装 ####

**使用 `batchInstall`**

```ts
// router.ts
import { batchInstall } from 'vue-router-plugin-system'
import { AuthPlugin, CachePlugin } from './plugins'

const router = createRouter({
  history: createWebHistory(),
  routes: [],
})

// 紧跟在 createRouter 之后调用
batchInstall(router, [AuthPlugin, CachePlugin])
```

**使用 `createRouter`**

```ts
import { createWebHistory } from 'vue-router'
import { createRouter } from 'vue-router-plugin-system'
import { AuthPlugin, CachePlugin } from './plugins'

const router = createRouter({
  history: createWebHistory(),
  routes: [],
  // 新增插件选项
  plugins: [AuthPlugin, CachePlugin],
})
```

## 核心特性 ##

### 标准化插件接口 ###

提供统一的 `RouterPlugin` 接口：

```ts
type RouterPlugin = (ctx: RouterPluginContext) => void

interface RouterPluginContext {
  router: Router // Vue Router 实例
  runWithAppContext: (handler: (app: App) => void) => void // 在 App 上下文中执行
  onUninstall: (handler: () => void) => void // 注册清理回调
}
```

### 自动清理响应式副作用 ###

插件中创建的响应式副作用（`watch`、`computed` 等）会在卸载时自动清理，无需手动管理 `effectScope`。

## API 参考 ##

### 核心 API ###

- `createRouter(options)` - 扩展版路由创建函数，支持 `plugins` 选项
- `withInstall(plugin)` - 包装插件，支持 `app.use()` 和 `Plugin.install(router)` 两种安装方式
- `batchInstall(router, plugins)` - 批量安装多个插件

### 插件上下文 ###

```ts
interface RouterPluginContext {
  router: Router // Vue Router 实例
  runWithAppContext: (handler: (app: App) => void) => void // 在 App 上下文中执行
  onUninstall: (handler: () => void) => void // 注册清理回调
}
```

- `router` - 用于添加路由守卫、访问路由信息、编程式导航
- `runWithAppContext` - 当需要使用 `inject()`、`pinia store` 等 App 上下文 API 时使用
- `onUninstall` - 注册清理回调，在应用卸载时按顺序执行

### 生命周期 ###

- 所有插件在共享的 `effectScope` 中运行，响应式副作用自动清理
- 插件按注册顺序初始化和清理
- 每个 Router 实例的 `install` 只会被包装一次
