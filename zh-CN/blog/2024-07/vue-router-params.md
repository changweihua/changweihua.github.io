---
lastUpdated: true
commentabled: true
recommended: true
title: vue-router - 路由组件传参
description: vue-router - 路由组件传参
date: 2024-07-17 11:18:00
pageClass: blog-page-class
---

# vue-router - 路由组件传参 #

如果在组件中使用 $route，那么该组件必须是作为路由渲染的组件，因为 $route 包含的是当前路由的相关信息，这些信息只有在路由渲染时才能访问。

而如果使用 props将路由参数传递给组件，则该组件既可以作为路由渲染的组件，也可以作为普通组件使用。因为 props 是一种用于组件之间传递数据的机制，它不依赖于当前路由的状态，而是通过传递参数的方式将数据传递给组件。

因此，使用 props 将组件与路由解耦是一种好的实践，它可以使组件更加灵活和可重用，同时也使得组件更加独立，易于测试和维护。

## 布尔模式 ##

当 `props` 设置为 `true` 时，`route.params` 将被设置为组件的 `props`

```typescript
const User = {
  template: '<div>User {{ $route.params.id }}</div>'
}
const routes = [{ path: '/user/:id', component: User }]
```

可以被改写为

```typescript
const User = {
  // 请确保添加一个与路由参数完全相同的 prop 名
  props: ['id'],
  template: '<div>User {{ id }}</div>'
}
const routes = [{ path: '/user/:id', component: User, props: true }]
```

对于有命名视图的路由，你必须为每个命名视图定义 `props` 配置

```typescript
const routes = [
  {
    path: '/user/:id',
    components: { default: User, sidebar: Sidebar },
    props: { default: true, sidebar: false }
  }
]
```

## 对象模式 ##

当 `props` 是一个对象时，它将原样设置为组件 `props`

```typescript
const routes = [
  {
    path: '/promotion/from-newsletter',
    component: Promotion,
    // Promotion组件对应的props就是 { newsletterPopup: false }
    props: { newsletterPopup: false }
  }
]
```

## 函数模式 ##

你可以创建一个返回 props 的函数。这允许你将参数转换为其他类型，将静态值与基于路由的值相结合等等

```typescript
const routes = [
  {
    path: '/search',
    component: SearchUser,
    props: route => ({ query: route.query.q })
  }
]
```
