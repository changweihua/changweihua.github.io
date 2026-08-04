---
lastUpdated: true
commentabled: true
recommended: true
title: 前端权限控制；接口权限；路由权限；按钮权限
description: 前端权限控制；接口权限；路由权限；按钮权限
date: 2025-03-12 10:00:00
pageClass: blog-page-class
---

# 前端权限控制；接口权限；路由权限；按钮权限 #

在前端开发中，权限控制是一个重要的功能，确保不同用户根据其权限访问不同的资源或功能。

本文将介绍如何通过接口权限、路由权限和按钮权限控制来实现前端的完整权限体系。

## 接口权限控制 ##

接口权限控制通常通过 JWT（JSON Web Token）实现。后端通过 JWT 插件生成 token，前端将 token 存储，并在每次请求时通过 Authorization 字段发送给后端进行验证。

### 实现步骤 ###

- 前端处理：在每次请求时，将 token 放入请求头中；
- 后端验证：后端接收到请求后，验证 token 的有效性；
- Token 失效处理：如果 token 失效（如 401 错误），前端需要重定向到登录页面。

### 代码示例 ###

```javascript
axios.interceptors.request.use((config) => {
            // 在请求头中添加 token
            config.headers['Authorization'] = localStorage.getItem('token')
            return config
        })

        axios.interceptors.response.use(
            (res) => res,
            ({ response }) => {
                if (response.status === 401) {
                    // 如果是未认证的用户，跳转到登录页面
                    router.push('/login')
                } else if (response.status === 403) {
                    // 如果是没有权限访问，提示无权限
                    router.push('/unauthorized')
                }
            }
        )
```

## 路由权限控制 ##

路由权限控制确保不同用户根据其角色访问不同的页面或功能模块。实现路由权限控制有两种常见方案：

### 方案一：后端动态返回路由配置 ###

后端根据用户角色返回不同的路由表，前端根据后端返回的路由动态生成路由配置。这种方式适合需要灵活管理权限的场景，路由配置完全由后端控制。

#### 实现思路 ####

1. 后端返回路由配置：后端在用户登录成功后，根据用户的角色或权限，返回一份包含该用户可以访问的路由表的 JSON 数据；
2. 前端接收路由配置：前端通过 API 调用后端的接口，获取路由配置；
3. 前端生成路由：前端通过 Vue Router 动态添加路由，将后端返回的路由表注入到 Vue Router 中；
4. 渲染页面：前端根据动态添加的路由，展示用户可以访问的页面。

```javascript
[ { "path": "/dashboard",
"name": "Dashboard", 
"component": "DashboardComponent" }],
   // 定义一个组件映射表，来将后端返回的组件名映射到前端的实际组件
        const componentMap = {
            DashboardComponent: () => import('@/views/Dashboard.vue'),
            ProfileComponent: () => import('@/views/Profile.vue'),
        }


        // 动态生成并注册路由
        async function createAppRouter() {
            const routeData = await fetchRoutes() // 调接口获取后端返回的路由表

            // 根据路由数据生成 Vue Router 路由配置
            const routes = routeData.map((route) => ({
                path: route.path,
                name: route.name,
                component: componentMap[route.component], // 动态加载组件
            }))

            // 创建 Vue Router 实例
            const router = createRouter({
                history: createWebHistory(),
                routes: [], // 初始路由为空
            })

            // 动态添加每一条路由
            routes.forEach((route) => {
                router.addRoute(route)
            })

            return router
        }
```

### 方案二：前端基于角色的路由表 ###

1. 前端预先配置好完整的路由表，并通过在 meta 对象中设置 roles 属性来指定哪些角色可以访问某些路由；
2. 通过 Vue Router 的导航守卫 beforeEach() 来进行权限校验，拦截不符合权限的访问请求。

```javascript
const routerMap = [
  {
    path: '/permission',
    component: Layout,
    meta: {
      title: 'permission',
      roles: ['admin', 'editor'] // 允许的角色
    },
    children: [
      {
        path: 'page',
        component: () => import('@/views/permission/page'),
        meta: {
          title: 'pagePermission',
          roles: ['admin'] // 只有管理员可访问
        }
      }
    ]
  }
];

   router.beforeEach((to, from, next) => {
            const userRole = localStorage.getItem('userRole')
            if (to.meta.roles && !to.meta.roles.includes(userRole)) {
                // 如果用户角色不在路由的 roles 中，跳转到无权限页面
                next('/unauthorized')
            } else {
                // 否则正常跳转
                next()
            }
        })
```

## 按钮权限控制 ##

在某些场景下，除了页面级别的权限控制，按钮级别的权限控制也是常见需求。通过自定义指令，可以根据用户的权限动态控制按钮的显示与隐藏。

### 实现方式 ###

1. 通过自定义指令 v-has 来控制按钮是否显示；
2. 根据用户角色，判断当前用户是否有权限执行某个操作（如编辑、删除等）。

```javascript
   Vue.directive('has', {
            inserted(el, binding, vnode) {
                const userPermissions = vnode.context.$store.getters.userPermissions // 获取用户权限
                const requiredPermission = binding.value// 这里的值是 'edit'

                // 如果没有权限，隐藏按钮
                if (!userPermissions.includes(requiredPermission)) {
                    el.parentNode && el.parentNode.removeChild(el); // 移除元素
                }
            },
      })

// 在模板中使用自定义指令
<button v-has="'edit'">编辑</button>
```

## 结语 ##

前端权限控制不仅仅是页面和路由的访问权限，还包括按钮、操作权限的细粒度控制。它与后端的权限体系相辅相成，前端负责用户体验的优化与增强，而后端则负责核心的权限认证与校验。在实际项目中，合理设计权限系统可以提高系统的安全性、灵活性和可维护性。通过接口、路由和按钮的权限控制机制，前端开发者可以构建一个更加安全、用户友好的应用系统。
