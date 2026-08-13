---
lastUpdated: true
commentabled: true
recommended: true
title: React Router v7 实战全景
description: 路由配置、嵌套路由、鉴权守卫与懒加载完整指南
date: 2026-08-13 11:08:00
pageClass: blog-page-class
cover: /covers/react.svg
---

## 摘要 ##

> 拆解BrowserRouter、Outlet嵌套路由、useParams、ProtectRoute鉴权、useNavigate导航、lazy懒加载，覆盖React Router v7全场景。

本文基于一个 React 19 + react-router-dom v7 的完整项目，逐层拆解 React Router 的核心能力：从基础的路由配置，到嵌套路由、动态参数、鉴权守卫、懒加载，覆盖生产级 SPA 中的全场景需求。

## 项目骨架与依赖 ##

```json
{
  "dependencies": {
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "react-router-dom": "^7.18.2"
  },
  "devDependencies": {
    "vite": "^8.0.12",
    "@vitejs/plugin-react": "^6.0.1"
  }
}
```

项目使用 Vite 8 作为构建工具，入口是标准的 `index.html` → `src/main.jsx`。页面组件统一放在 `pages/` 目录下，每个页面一个文件，路由守卫和导航组件独立管理。

## BrowserRouter：选择 History 模式 ##

React Router 提供了两种顶层路由容器：

```jsx
import { BrowserRouter as Router } from 'react-router-dom';
```

`BrowserRouter` 底层使用 History API（pushState + popstate），URL 干净无 `#` 号。与之对应的 HashRouter 则使用 `hashchange`。生产项目中，面向用户的 C 端产品几乎都选择 BrowserRouter——URL 美观、SEO 友好，代价是需要服务端配置 fallback（所有路由返回 index.html）。

BrowserRouter 包裹整个应用，内部的 Routes 和 Route 组件才能正常工作。

## Routes 与 Route：声明式路由配置 ##

React Router 的核心设计理念是路由即组件。路由配置不是 JSON 也不是独立文件，而是直接写在 JSX 中：

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="/user/:id" element={<UserProfile />} />
  <Route path="/products" element={<Products />}>
    <Route path=":productId" element={<ProductDetail />} />
    <Route path="new" element={<NewProduct />} />
  </Route>
  <Route path="/login" element={<Login />} />
  <Route path="/pay" element={
    <ProtectRoute>
      <Pay />
    </ProtectRoute>
  } />
  <Route path="*" element={<NotFound />} />
</Routes>
```

Routes 是路由匹配引擎，它遍历所有子 Route，找到第一个匹配当前 URL 的路径，渲染对应的 element。同一时刻有且只有一个 Route 被激活。

Route 的 path 属性指定匹配规则，element 属性指定渲染内容。element 可以是任意 React 组件，这就为路由守卫、布局组件等模式提供了灵活的基础。

## 动态路由参数：useParams ##

URL 中经常需要携带动态参数，比如用户 ID、商品 ID。React Router 使用 `:paramName` 语法定义动态段：

```jsx
<Route path="/user/:id" element={<UserProfile />} />
```

在组件内部，通过 useParams Hook 获取参数值：

```jsx
import { useParams } from 'react-router-dom';

function UserProfile() {
  let { id } = useParams();
  return <h2>User Profile：{id}</h2>;
}
```

当用户访问 `/user/123` 时，id 的值为 "123"。useParams 返回的是一个对象，键名对应路径中 `:paramName` 的名称。注意返回值始终是字符串类型，如需数字需要自行转换。

## 嵌套路由与 Outlet ##

嵌套路由是 React Router 最强大的特性之一。当页面存在"布局 + 子内容"的结构时——比如产品列表页顶部有统一的标题和筛选栏，下方根据 URL 切换详情页或新增页——嵌套路由是天然的选择。

```jsx
// 父路由组件
import { Outlet } from 'react-router-dom';

const Products = () => {
  return (
    <>
      <h1>产品列表</h1>
      <Outlet />
    </>
  );
};
```

Outlet 是嵌套路由的"插槽"——子路由匹配成功后，对应的组件会渲染在 Outlet 所在的位置。

```jsx
// 路由配置：子路由 path 相对于父路由
<Route path="/products" element={<Products />}>
  <Route path=":productId" element={<ProductDetail />} />
  <Route path="new" element={<NewProduct />} />
</Route>
```

访问 `/products/123` 时，Products 组件渲染，Outlet 处显示 ProductDetail；访问 `/products/new` 时，Outlet 处显示 NewProduct。父路由的 UI（标题、布局）保持不变，只有子区域切换。

子路由的 path 是相对于父路由的，不需要写 `/products/:productId`，直接写 `:productId` 即可。

## Link 组件：SPA 中的导航 ##

在 SPA 中，不能直接使用 `<a>` 标签做页面跳转——`<a>` 会触发浏览器的完整页面请求，导致 SPA 状态丢失。React Router 提供了 Link 组件替代：

```jsx
import { Link } from 'react-router-dom';

<nav>
  <ul>
    <li><Link to="/">Home</Link></li>
    <li><Link to="/about">About</Link></li>
    <li><Link to="/user/123">小家</Link></li>
    <li><Link to="/products/123">商品详情</Link></li>
  </ul>
</nav>
```

Link 组件渲染为 `<a>` 标签，但 to 属性被拦截处理——点击时调用 `history.pushState` 改变 URL，由 React Router 接管渲染，页面不会刷新。

## 编程式导航：useNavigate 与 useLocation ##

有些场景不适合用 Link——比如表单提交后跳转、超时后自动跳转、登录成功后跳转。这时需要编程式导航。

```jsx
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username');
    const password = formData.get('password');

    if (username === 'admin' && password === '123456') {
      localStorage.setItem('isLogin', 'true');
      navigate(from, { replace: true });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="请输入用户名" required />
      <input name="password" placeholder="请输入密码" required />
      <button type="submit">登录</button>
    </form>
  );
};
```

`useNavigate` 返回一个跳转函数，调用 `navigate('/path')` 等价于 `history.pushState` + 渲染。第二个参数 `{ replace: true }` 使用 replaceState 替换当前历史记录——登录成功后，用户点击后退按钮不会回到登录页，而是直接回到登录前的页面，体验更自然。

`useLocation` 返回当前 URL 的 `location` 对象，其中 `location.state` 携带了路由跳转时传递的额外数据。配合路由守卫，可以实现"从未登录页跳转到登录页，登录后自动回到原页面"的完整闭环。

`useNavigate` 也适用于定时跳转场景：

```jsx
const NotFound = () => {
  let navigate = useNavigate();
  useEffect(() => {
    setTimeout(() => navigate('/'), 3000);
  }, []);
  return <>Not Found</>;
};
```

## 路由守卫：ProtectRoute 组件 ##

某些页面需要登录后才能访问（如支付页、个人中心）。React Router 没有内置的"路由守卫"概念，但利用其组件化特性，可以轻松实现：

```jsx
import { Navigate } from 'react-router-dom';

const ProtectRoute = ({ children }) => {
  const isLogin = localStorage.getItem('isLogin') === 'true';

  if (!isLogin) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};
```

ProtectRoute 是一个包装组件：它接收 children 作为需要保护的页面内容。检查登录状态后，未登录时渲染 `<Navigate>` 组件进行重定向，已登录时渲染 children。

使用方式：

```jsx
<Route path="/pay" element={
  <ProtectRoute>
    <Pay />
  </ProtectRoute>
} />
```

Navigate 组件渲染时，React Router 会立即将 URL 重定向到 `/login`，并携带 state 对象，其中 from 记录了用户原本想访问的路径。登录组件通过 `useLocation().state?.from` 取回这个路径，登录成功后 `navigate(from, { replace: true })` 跳转回去。

这个守卫模式的核心思路是：路由守卫不拦截路由匹配，而是在组件渲染层面做条件判断。`/pay` 的路由始终匹配，但渲染的内容由 ProtectRoute 根据鉴权状态决定——要么是 Pay 组件，要么是重定向。

## 路由懒加载：React.lazy + Suspense ##

随着项目增长，把所有页面组件打包进一个 JS 文件会导致首屏加载缓慢。React Router 配合 React 的 lazy 和 Suspense 可以实现按路由拆分代码：

```jsx
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/Products/Detail'));
const NewProduct = lazy(() => import('./pages/Products/New'));
const Login = lazy(() => import('./pages/Login'));
const Pay = lazy(() => import('./pages/Pay'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ProtectRoute = lazy(() => import('./ProtectRoute'));
```

`lazy(() => import(...))` 是动态导入，Vite 会将其识别为代码分割点，为每个页面生成独立的 chunk。用户访问 `/about` 时，浏览器只加载 About 对应的 chunk，而不是整个应用。

`Suspense` 提供加载中的 fallback UI：

```jsx
<Router>
  <Suspense fallback={<div>loading...</div>}>
    <Navigation />
    <Routes>
      {/* ... */}
    </Routes>
  </Suspense>
</Router>
```

在懒加载组件还未下载完成时，Suspense 的 fallback 会显示。下载完成后自动替换为真实组件。

## 重定向与 404 兜底 ##

项目中有两种重定向场景：

*静态重定向*——旧路径永久迁移到新路径：

```jsx
<Route path="old-path" element={<Navigate replace to="new-path" />} />
```

用户访问 `/old-path` 时，Navigate 组件渲染，URL 立即变为 `/new-path`，replace 确保旧路径不会留在历史记录中。

*404 兜底*——匹配所有未定义的路径：

```jsx
<Route path="*" element={<NotFound />} />
```

`*` 是通配符，匹配所有未被前面 Route 匹配的路径。它必须放在 Routes 的最后，因为 Routes 按顺序匹配，找到第一个匹配的 Route 就停止。如果 `*` 放在最前面，所有路径都会被它吞掉。

## 总结：React Router 全场景能力地图 ##

| 能力 | 核心 API | 使用场景 |
| :--- | :--- | :--- |
| 路由容器 | BrowserRouter / HashRouter | 顶层包裹，选择 History 或 Hash 模式 |
| 路由配置 | Routes + Route | 声明式配置路径与组件的映射 |
| 导航组件 | Link | 替代 `<a>` 标签，实现无刷新跳转 |
| 动态参数 | useParams | 从 URL 中提取 `id` 等动态段 |
| 嵌套路由 | Outlet | 父路由提供布局，子路由渲染到插槽 |
| 编程式导航 | useNavigate | 表单提交后跳转、定时跳转 |
| 路由信息 | useLocation | 获取当前路径、state 传递的额外数据 |
| 路由守卫 | 自定义包装组件 + Navigate | 鉴权拦截，未登录重定向到登录页 |
| 重定向 | Navigate 组件 | 旧路径迁移、登录后跳回 |
| 懒加载 | `React.lazy` + `Suspense` | 按路由拆分代码，减少首屏加载 |
| 404 处理 | `<Route path="**">` | 匹配所有未定义路径，兜底展示 |

从手写 HashRouter 理解 hashchange 事件，到手写 HistoryRouter 理解 pushState 和 popstate，再到 React Router 将这些底层机制封装为声明式 API——前两篇文章建立的底层认知，是理解 React Router 每行配置背后"发生了什么"的关键。当你看到 Link 组件，你知道它底层调用了 `history.pushState`；当你看到 Navigate 组件，你知道它本质上是条件渲染 + replaceState；当你看到 ProtectRoute，你知道它不过是利用组件化特性实现的一个高阶守卫模式。

React Router v7 的 API 设计将"路由即组件"的理念贯彻到底——路由配置是 JSX，路由守卫是组件，重定向是组件，连懒加载都是 React 原生能力。这种一致性让 React Router 的学习曲线平滑，但只有理解底层原理，才能在遇到问题时知道从哪个方向排查。毕竟，所有前端路由框架的底层，最终都收敛到 `hashchange`、`pushState`、`replaceState` 和 `popstate` 这四个 API 上。
