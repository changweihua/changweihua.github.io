---
lastUpdated: true
commentabled: true
recommended: true
title: 一文搞懂 HashRouter、嵌套路由、懒加载和 404 兜底
description: Vite + React 19 + Router v7
date: 2026-08-17 10:35:00
pageClass: blog-page-class
cover: /covers/react.svg
---

> 从零搭建一个 SPA 路由系统，涵盖 HashRouter、嵌套路由、路由懒加载、参数传递、重定向和 404 兜底——每个知识点都配有"踩坑提醒"。

## 前言 ##

如果你正在学习 React 路由，大概率会碰到这些问题：

- HashRouter 和 BrowserRouter 到底有什么区别？
- 嵌套路由的 `<Outlet />` 为什么写了也没渲染？
- `useParams()` 明明调了，为啥拿到的值是 undefined？
- 路由懒加载怎么配 `<Suspense>` 才不报错？

这篇文章用一个完整的 Demo 项目，把 React Router v7 的核心 API 逐一拆解。适合刚学 React 路由、想系统梳理知识点的同学阅读。文末附有完整可运行的项目代码，克隆即用。

读完你会收获：

- 一套可运行的 SPA 路由项目结构
- HashRouter / Routes / Route / Link / Outlet / useParams / Navigate / useNavigate 的实战用法
- 路由懒加载 + Suspense 的正确搭配
- 至少 3 个"不看不知道"的坑

## 项目概览 ##

这是一个基于 Vite + React 19 + react-router-dom v7 的 Hash 模式单页应用，包含 6 个页面 + 导航栏。

### 组件树 ###

```txt
App
├── HashRouter
│   └── Suspense (Loading... 兜底)
│       ├── Navigation          ← 导航栏，Link 跳转
│       └── Routes
│           ├── "/"             → Home
│           ├── "/about"        → About
│           ├── "/user/:id"     → UserProfile      (动态参数)
│           ├── "/products"     → Products          (父路由)
│           │   ├── ":productsId" → ProductDetail   (子路由)
│           │   └── "new"        → NewProduct       (子路由)
│           ├── "/old-path"     → Navigate 重定向到 /new-path
│           └── "*"             → NotFound          (404 兜底)
```

### 核心技术点 ###

| 类别 | 用到的 API |
| :--- | :--- |
| 路由模式 | `HashRouter` |
| 路由配置 | `Routes`、`Route` |
| 导航 | `Link` |
| 动态参数 | `useParams` |
| 嵌套路由 | `Outlet` |
| 懒加载 | `React.lazy` + `Suspense` |
| 重定向 | `Navigate` |
| 编程式跳转 | `useNavigate` |

## 核心知识点：深入 3 个最重要的概念 ##

### 知识点 1：HashRouter — URL 里为什么有个 `#`？ ###

#### 它是什么？ ####

HashRouter 利用 URL 中 `#` 后面的部分（叫 hash）来管理前端路由。`#` 后面的内容变化时，浏览器不会向服务器发请求，页面也不会刷新。

```bash
https://example.com/#/user/123
                       ↑
                     这一整段叫 hash
```

为什么这个项目用 HashRouter 而不是 BrowserRouter？



> 一句话：HashRouter 省心，BrowserRouter 好看。Demo 项目、静态托管用 HashRouter；正式上线且有后端支持用 BrowserRouter。

#### 在这个项目里怎么用的？ ####

```jsx
// App.jsx
import { HashRouter as Router } from 'react-router-dom';

<Router>
  <Navigation />
  <Routes>
    <Route path="/" element={<Home />} />
    {/* ... */}
  </Routes>
</Router>
```

HashRouter 像一个"外壳"，包裹整个应用，接管所有路由逻辑。

### 知识点 2：嵌套路由 + Outlet — 父组件不变，子组件切换 ###

#### 它是什么？ ####

嵌套路由让你把页面的公共部分写在父组件里，子路由只负责变化的内容。

用生活场景类比：

> 淘宝商品列表页，顶部导航栏和侧边筛选栏永远在那里，切换"手机"或"电脑"分类时，只有中间的商品区域在变。父组件 = 壳子（导航+筛选栏），子公司 = 中间那坨商品卡片。

#### 在这个项目里怎么用的？ ####

路由配置（App.jsx）：

```jsx
<Route path="/products" element={<Products />} >       {/* 父：壳子 */}
  <Route path=":productsId" element={<ProductDetail />} />  {/* 子：详情 */}
  <Route path="new" element={<NewProduct />} />             {/* 子：新增 */}
</Route>
```

父组件（Products/index.jsx）：

```jsx
import { Outlet } from 'react-router-dom';

const Products = () => (
  <>
    <h1>产品列表</h1>    {/* 公共标题，永远显示 */}
    <Outlet />           {/* 子组件渲染在这里 */}
  </>
);
```

实际效果：

| 访问 URL | 页面标题 | Outlet 渲染内容 |
| :--- | :--- | :--- |
| `/products` | 产品列表 | 空 |
| `/products/123` | 产品列表 | `<ProductDetail />` |
| `/products/new` | 产品列表 | `<NewProduct />` |

> 踩坑提醒：`<Outlet />` 必须写在父组件的 return 里，不是写在路由配置里！很多人把 `<Outlet />` 当成 `<Route>` 的属性来配，怎么都不生效，原因就在这。

### 知识点 3：`React.lazy` + `Suspense` — 按需加载，首页不卡 ###

#### 它是什么？ ####

默认情况下，`import Home from './pages/Home'` 会把 Home 组件的代码打包进主文件——用户不管访问哪个页面，都要下载全部页面的代码。

`React.lazy()` 配合 `import()` 实现动态导入：只有用户真正访问某个页面时，才去下载那个页面的 JS。

#### 在这个项目里怎么用的？ ####

```jsx
// App.jsx
import { lazy, Suspense } from 'react';

// ❌ 静态导入：所有页面一起下载
// import Home from './pages/Home';

// ✅ 动态导入：访问时才下载
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/Products/ProductDetail'));
const NewProduct = lazy(() => import('./pages/Products/NewProduct'));
```

#### Suspense 的作用 ####

lazy 组件在下载时，React 需要显示一个"加载中"的界面——这就是 `<Suspense>` 的 fallback：

```jsx
<Suspense fallback={<div>Loading...</div>}>
  <Navigation />
  <Routes>
    <Route path="/" element={<Home />} />
    {/* ... */}
  </Routes>
</Suspense>
```

当用户首次访问 `/about` 时，流程是这样的：

```txt
点击"About"链接
  ↓
React 发现 About 组件还没下载
  ↓
显示 fallback：<div>Loading...</div>   ← 用户看到加载提示
  ↓
异步下载 About 的 JS 文件
  ↓
下载完成，替换为 <About /> 组件        ← 用户看到页面内容
```

> 踩坑提醒：`<Suspense>` 必须包裹 lazy 组件，否则 React 会报 `A React component suspended while rendering` 错误。

## 逐组件拆解 ##

### Navigation — 导航栏 ###

```jsx
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/user/123">小家</Link></li>
        <li><Link to="/products">产品列表</Link></li>
        <li><Link to="/products/new">新增产品</Link></li>
        <li><Link to="/products/123">产品详情</Link></li>
      </ul>
    </nav>
  );
}
```

为什么用 `<Link>` 而不是 `<a>`？

| 对比维度 | `<a href="/about">` | `<Link to="/about">` |
| :--- | :--- | :--- |
| 页面刷新 | 整个页面刷新，白屏闪烁 | 不刷新，局部替换 |
| SPA体验 | ❌ 失去SPA优势 | 流畅切换 |
| 状态保持 | 丢失 | 保留 |

`<Link>` 底层调用了 `history.pushState()`，改变 URL 但不触发浏览器刷新——这是 SPA 体验的基石。

### UserProfile — 动态路由参数 ###

```jsx
import { useParams } from 'react-router-dom';

function UserProfile() {
    const { id } = useParams();   // 从 URL 中提取参数
    return <h1>UserProfile {id}</h1>;
}
```

链路：

```bash
路由规则  /user/:id           ← :id 是占位符，定义了参数名
用户访问  /user/小家           ← 把 "小家" 填入 :id 的位置
useParams() 返回  { id: "小家" }  ← 组件拿到参数值
页面显示  UserProfile 小家
```

### Products + ProductDetail — 嵌套路由 + 参数名匹配问题 ⚠️ ###

路由配置：

```jsx
<Route path="/products" element={<Products />} >
  <Route path=":productsId" element={<ProductDetail />} />
  <Route path="new" element={<NewProduct />} />
</Route>
```

注意这里有两个子路由：

- `:productsId` — 动态参数，匹配 `/products/123`、`/products/abc` 等
- `new` — 固定路径，精确匹配 `/products/new`

ProductDetail 组件：

```jsx
function ProductDetail() {
    const { productId } = useParams();  // 从 URL 中读取 productId
    return <h3>产品详情 {productId}</h3>;
}
```

#### 🔴 这里有一个极易被忽视的坑！ ####

路由里定义的是 `:productsId`（带 s），但组件里解构的是 `productId`（不带 s）。参数名必须完全一致，否则 `productId` 永远是 `undefined`。

`useParams()` 返回的是一个对象，key 就是路由里 `:` 后面的名字。`path=":productsId"` 意味着 `useParams()` 返回 `{ productsId: '123' }`，取 `productId` 当然取不到。

正确写法：`const { productsId } = useParams()`;


### NotFound — 404 兜底 + 编程式导航 ###

```jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            navigate('/');     // 3 秒后自动跳回首页
        }, 3000);
    }, []);

    return <h1>404 Not Found</h1>;
};
```

两个关键点：

- `path="*"` 兜底匹配 — 放在 `<Routes>` 的最后，所有未匹配的路径都会被它捕获：

```jsx
<Route path="*" element={<NotFound />} />
```

- useNavigate 编程式跳转 — 不用 `<Link>`，而是在代码逻辑里主动跳转。适合"3 秒后自动跳回首页"这种场景。

### Navigate — 路由重定向 ###

```jsx
<Route path="old-path" element={
    <Navigate replace to="/new-path" />} />
```

访问 `/old-path` 时，自动跳转到 `/new-path`。`replace` 属性表示替换当前历史记录（用户点"后退"不会回到 `old-path`），不加 replace 则保留历史记录。

## 总结 ##

回顾一下你从这个项目能带走的核心知识：

- HashRouter — `#` 后面的路径变化不触发浏览器刷新，适合静态部署
- Routes + Route — 声明式路由配置，path 匹配 URL，element 指定渲染组件
- Link 替代 `<a>` — 保持 SPA 体验，不刷新页面
- `:xxx` 动态参数 + `useParams()` — 参数名必须和路由定义一致，否则取到 `undefined`
- 嵌套路由 + `<Outlet />` — 父组件写公共布局，子路由内容填入 `Outlet` 占位符
- `React.lazy` + `<Suspense>` — 按需加载页面，减少首屏体积
- `path="*"` 兜底 + `useNavigate` / `Navigate` — 404 页面 + 自动跳转 / 重定向

下一步可以扩展的方向：添加路由守卫（登录鉴权）、面包屑导航、路由过渡动画、配合 Zustand/Redux 做全局状态管理。
