---
lastUpdated: true
commentabled: true
recommended: true
title: Vue路由钩子全攻略：让你的页面跳转更丝滑！
description: Vue路由钩子全攻略：让你的页面跳转更丝滑！
date: 2025-07-14 16:05:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

今天咱们聊聊Vue路由里的钩子函数，这些钩子就像是路由的"关卡守卫"，能在页面跳转前后做各种骚操作，比如权限拦截、数据预加载、页面过渡动画等等。

## 路由钩子是什么？能干啥？ ##

简单来说，路由钩子就是Vue Router在路由切换时提供的回调函数，可以在不同阶段拦截或处理路由跳转。比如：

- **登录拦截**：没登录？滚回登录页！
- **数据预加载**：进页面之前先把数据请求好
- **页面权限控制**：你没权限？抱歉，此路不通
- **滚动行为控制**：跳转后自动回到顶部

## 路由钩子分类 ##

Vue Router的钩子主要分三类：

- **全局钩子**（整个路由生效）
- **路由独享钩子**（只对某个路由生效）
- **组件内钩子**（在组件内部使用）

### 全局钩子：整个路由的守门人 ###

#### beforeEach（路由跳转前） ####

```javascript
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !我.isLoggedIn) {
    next('/login') // 没登录？去登录页！
  } else {
    next() // 放行
  }
})
```

> 适用场景：全局权限控制、登录拦截

#### afterEach（路由跳转后） ####

```javascript
router.afterEach((to, from) => {
  sendAnalytics(to.path) // 统计页面访问
})
```

> 适用场景：埋点统计、页面访问日志

### 路由独享钩子：单个路由的专属逻辑 ###

```javascript
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    beforeEnter: (to, from, next) => {
      if (!我.hasPermission('admin')) {
        next('/403') // 没权限？去403页面！
      } else {
        next()
      }
    }
  }
]
```

> 适用场景：特定路由的权限控制

### 组件内钩子：组件自己的路由逻辑 ###

在组件里可以直接用这些钩子：

- **beforeRouteEnter**（进入组件前）
- **beforeRouteUpdate**（路由参数变化但组件复用时）
- **beforeRouteLeave**（离开组件前）

#### beforeRouteEnter（进入组件前） ####

```javascript
export default {
  beforeRouteEnter(to, from, next) {
    // 这里还不能用 `this`，因为组件还没创建！
    next(vm => {
      console.log(vm.myData) // 现在可以访问组件实例了
    })
  }
}
```

> 适用场景：进入页面前的数据预加载

#### beforeRouteUpdate（路由参数变化时） ####

```javascript
export default {
  beforeRouteUpdate(to, from, next) {
    if (to.params.id !== from.params.id) {
      this.fetchData(to.params.id) // 重新获取数据
    }
    next()
  }
}
```

> 适用场景：动态路由参数变化时刷新数据

#### beforeRouteLeave（离开页面时） ####

```javascript
export default {
  beforeRouteLeave(to, from, next) {
    if (this.unsavedChanges) {
      if (confirm('有未保存的内容，确定离开吗？')) {
        next()
      } else {
        next(false) // 取消导航
      }
    } else {
      next()
    }
  }
}
```

> 适用场景：防止用户误操作离开页面（比如填了一半的表单）

## 实际开发中的经典场景 ##

### 登录拦截 ###

```javascript
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('token')) {
    next('/login?redirect=' + to.fullPath) // 记录跳转目标，登录后自动回来
  } else {
    next()
  }
})
```

### 动态修改页面标题 ###

```javascript
router.afterEach((to) => {
  document.title = to.meta.title || '默认标题'
})
```

### 滚动行为控制 ###

```javascript
const router = new VueRouter({
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition // 返回之前的位置（比如浏览器后退时）
    } else {
      return { x: 0, y: 0 } // 默认滚动到顶部
    }
  }
})
```

## 总结 ##

- **全局钩子**：`beforeEach`、`afterEach`（适合全局逻辑）
- **路由独享钩子**：`beforeEnter`（适合单个路由的逻辑）
- **组件内钩子**：`beforeRouteEnter`、`beforeRouteUpdate`、`beforeRouteLeave`（适合组件内部逻辑）

合理使用这些钩子，能让你的路由跳转更智能、更安全！
