---
lastUpdated: true
commentabled: true
recommended: true
title: 路由、懒加载、嵌套页面与登录鉴权
description: 从零梳理 React Router
date: 2026-08-17 09:35:00
pageClass: blog-page-class
cover: /covers/react.svg
---

当一个 React 应用只有一个页面时，我们可以通过组件状态切换内容；但随着首页、关于页、用户页、产品页、登录页和支付页不断增加，仅靠状态管理页面会越来越混乱。

前端路由解决的正是这个问题：让 URL 与页面组件建立对应关系。URL 变化时，路由系统选择并渲染相应组件，而浏览器不必重新请求整份 HTML。

本文会围绕一个完整的小型 SPA，依次实现以下能力：

- 基础路由与导航栏；
- 路由级懒加载；
- 动态路由参数；
- 产品模块的嵌套路由；
- 重定向与 404 页面；
- 基于 localStorage 的登录鉴权；
- 登录成功后回到原目标页面。

## 为什么单页应用需要前端路由 ##

传统网页中的 `<a>` 标签通常会向服务器发起新的页面请求。服务器返回另一份 HTML，浏览器重新加载并显示它。这样当然能够切换页面，但切换过程中可能出现短暂白屏，页面中的前端状态也会随整页刷新而丢失。

SPA（Single Page Application，单页应用）通常只加载一个 HTML 入口，后续根据 URL 在前端切换页面级组件。这里的“单页”不是整个应用只能有一个界面，而是多个界面共享同一份 HTML 外壳。

常见的前端路由方式有两种：

- Hash 路由：URL 类似 `#/pay`。改变的是 URL 的 hash 部分，可以通过 hashchange 监听，而且不会触发整页刷新。
- History 路由：URL 类似 `/pay`，使用 HTML5 History API，地址更加自然。

本文采用 BrowserRouter，也就是 History 路由。React Router 负责监听地址变化，再把匹配到的页面组件渲染出来。

从资源视角看，不同 URL 对应不同界面：`/user/123` 对应编号为 123 的用户，`/products/123` 对应编号为 123 的产品。前端路由把这种 URL 语义落实到 SPA 中。

## 项目入口：先渲染 React 应用 ##

项目使用 React、React DOM、React Router DOM 和 Vite。核心依赖如下：

```json
{
  "dependencies": {
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "react-router-dom": "^7.18.2"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

HTML 中准备一个根节点，并通过 ES Module 引入入口脚本：

```html
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

React 入口将 App 渲染到这个节点：

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

StrictMode 包裹整个应用，App 则是接下来承载路由配置的顶层组件。

## 建立路由骨架 ##

先看整个应用最关键的结构：

```jsx
import { lazy, Suspense } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import Navigation from './components/Navigation'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/Products/Detail'))
const NewProduct = lazy(() => import('./pages/Products/New'))
const Login = lazy(() => import('./pages/Login'))
const Pay = lazy(() => import('./pages/Pay'))
const ProtectRoute = lazy(() => import('./ProtectRoute'))

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div>Loading....</div>}>
        <Navigation />

        <div id="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/user/:id" element={<UserProfile />} />

            <Route path="/products" element={<Products />}>
              <Route path=":productId" element={<ProductDetail />} />
              <Route path="new" element={<NewProduct />} />
            </Route>

            <Route
              path="/old-path"
              element={<Navigate replace to="/new-path" />}
            />

            <Route path="/Login" element={<Login />} />
            <Route
              path="/pay"
              element={
                <ProtectRoute>
                  <Pay />
                </ProtectRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Suspense>
    </Router>
  )
}

export default App
```

这段代码可以分成四层理解。

第一层是 BrowserRouter。它为后代组件提供路由上下文，因此 Routes、Route、Link、Navigate 以及各种路由 Hook 都必须在它内部使用。导航栏使用了 Link，所以也要放在 Router 里面。

第二层是 Suspense。页面通过 lazy 异步加载，在模块尚未下载完成时，fallback 显示 Loading....，避免页面处于没有反馈的空白状态。

第三层是 Routes。它是路由匹配与页面出现的位置，会根据当前 URL 从内部配置中选出匹配项。

第四层是 Route。每个 Route 描述“某个路径应该渲染哪个元素”，例如访问 `/about` 时显示 `<About />`。

## 为什么页面组件要懒加载 ##

如果使用普通静态导入：

```jsx
import Home from './pages/Home'
import About from './pages/About'
```

应用启动时就会下载并执行这些页面模块。页面数量少时感受不明显，但页面越来越多后，用户即使只访问首页，也需要为暂时用不到的其他页面付出初始加载成本。

路由懒加载把页面改成动态导入：

```jsx
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
```

lazy 接收一个返回动态 `import()` 的函数。只有真正渲染该组件时，对应模块才会加载。因此，路由天然适合作为代码拆分边界：用户进入哪个页面，就加载哪个页面。

懒加载组件必须处在 Suspense 中：

```jsx
<Suspense fallback={<div>Loading....</div>}>
  {/* 导航与路由内容 */}
</Suspense>
```

这里不仅页面组件被懒加载，路由守卫 `ProtectRoute` 也采用了相同方式。

## 使用 Link 完成 SPA 内部导航 ##

导航栏代码如下：

```jsx
import { Link } from 'react-router-dom'

function Navigation() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/user/123">小家</Link></li>
        <li><Link to="/products/123">产品详情</Link></li>
        <li><Link to="/products/new">产品新增</Link></li>
        <li><Link to="/pay">支付</Link></li>
      </ul>
    </nav>
  )
}
```

Link 的 to 表示目标地址。它的作用和链接相似，但更适合 SPA 内部跳转：React Router 接管导航，更新地址和页面组件，而不是让浏览器重新加载整个文档。

这组链接也覆盖了后面的几个典型场景：

- `/` 和 `/about` 是固定路径；
- `/user/123` 包含用户动态参数；
- `/products/123` 和 `/products/new` 属于产品模块的嵌套路由；
- `/pay` 是需要先登录的受保护页面。

## 基础路由与页面级组件 ##

首页和关于页都是最简单的页面级组件：

```jsx
function Home() {
  return <>Home页面</>
}

export default Home
```

```jsx
function About() {
  return <>About页面</>
}

export default About
```

对应配置为：

```jsx
<Route path="/" element={<Home />} />
<Route path="/about" element={<About />} />
```

页面级组件与导航栏这类普通组件的职责不同：导航栏构成页面公共区域，页面级组件则通常直接与某条路由对应。把它们放进 pages 目录，能够直观表达组件层级。

## 动态路由：从 URL 中取得参数 ##

用户详情不可能为每个用户分别写一条路由，因此可以用冒号声明动态参数：

```jsx
<Route path="/user/:id" element={<UserProfile />} />
```

`:id` 是参数占位符。访问 `/user/123` 时，参数 id 的值就是字符串 123。组件通过 `useParams` 读取它：

```jsx
import { useParams } from 'react-router-dom'

function UserProfile() {
  const { id } = useParams()

  return <h2>User Profile:{id}</h2>
}

export default UserProfile
```

这里体现了 Hook 的便利：组件不需要手动解析地址栏，只要调用 `useParams()`，就能拿到当前匹配路由中的参数对象。

产品详情采用同一种方式，只是参数名变成了 productId：

```jsx
const ProductDetail = () => {
  const { productId } = useParams()

  return <h3>产品详情{productId}</h3>
}
```

参数名称必须和路由中的定义一致。路由写的是 `:productId`，解构时就应该读取 `productId`。

## 嵌套路由：让父页面保留公共内容 ##

产品列表、产品详情和新增产品在业务上属于同一模块。路由可以通过嵌套表达这种层级：

```jsx
<Route path="/products" element={<Products />}>
  <Route path=":productId" element={<ProductDetail />} />
  <Route path="new" element={<NewProduct />} />
</Route>
```

父路由是 `/products`，两个子路由的 `path` 都是相对路径，会接在父路径后面：

- `:productId` 最终匹配 `/products/:productId`；
- `new` 最终匹配 `/products/new`。

注意子路由没有写成 `/products/new`，因为父级路径已经提供了 `/products` 这一段。

仅仅配置嵌套还不够，父组件必须声明子页面应该显示在哪里。这个出口就是 Outlet：

```jsx
import { Outlet } from 'react-router-dom'

const Products = () => {
  return (
    <>
      <h1>产品列表</h1>
      <Outlet />
    </>
  )
}
```

于是访问 `/products/123` 时，页面结构相当于：

```jsx
<>
  <h1>产品列表</h1>
  <ProductDetail />
</>
```

访问 `/products/new` 时，Outlet 的位置则显示新增页面：

```jsx
const NewProduct = () => {
  return <>NewProduct</>
}
```

父组件保留“产品列表”标题，子组件在指定出口处变化，这就是嵌套路由的核心价值。

还有一个匹配细节值得观察：`/products/new` 既看起来可能符合动态路径 `:productId`，又符合静态路径 new。这里无需依靠书写顺序手动兜底，路由会优先选择更具体的静态路径，因此它会进入新增产品页面。

## 声明式重定向：Navigate 与 replace ##

某个旧地址停止使用后，可以将它重定向到新地址：

```jsx
<Route
  path="/old-path"
  element={<Navigate replace to="/new-path" />}
/>
```

Navigate 是一个用于导航的组件，适合在 JSX 中根据渲染结果完成跳转。to 是目标路径，replace 表示替换当前历史记录，而不是再向历史栈压入一条记录。

浏览器的前进、后退依赖历史记录栈。假设旧地址重定向时不使用 replace，用户按后退可能再次回到旧地址，然后又被重定向，体验会比较奇怪。替换记录可以避免这种循环感。

需要注意的是，上面的路由配置暂时没有提供 `/new-path` 页面，因此重定向后会继续命中 404 路由。作为重定向语法演示没有问题；在实际使用时，应同时配置真实存在的目标路由。

## 404 兜底与编程式导航 ##

当用户访问任何未定义的地址时，需要一个兜底页面：

```jsx
<Route path="*" element={<NotFound />} />
```

`*` 会匹配前面没有处理的路径，因此应该把它作为最后的兜底项。404 组件显示提示，并在三秒后回到首页：

```jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => {
      navigate('/')
    }, 3000)
  }, [])

  return <>Not Found</>
}
```

这里没有在 JSX 中渲染 Navigate，而是使用 `useNavigate` 得到导航函数。因为跳转发生在定时器回调里，属于事件或副作用驱动的“编程式导航”，使用函数更自然。

这段实现表达了完整意图，不过还可以做一个不改变功能的小修正：保存定时器并在组件卸载时清理，同时把 navigate 写入依赖数组。

```jsx
useEffect(() => {
  const timer = setTimeout(() => {
    navigate('/')
  }, 3000)

  return () => clearTimeout(timer)
}, [navigate])
```

这样如果组件在三秒内提前卸载，就不会留下仍待执行的定时器。

## 受保护路由：用 `children` 包裹目标页面 ##

支付页面不应该让未登录用户直接进入。这里使用一个 `ProtectRoute` 组件充当“门禁”：

```jsx
<Route
  path="/pay"
  element={
    <ProtectRoute>
      <Pay />
    </ProtectRoute>
  }
/>
```

Pay 写在 `ProtectRoute` 标签内部，因此会作为 `children` 属性传入：

```jsx
const ProtectRoute = ({ children }) => {
  // 根据登录状态决定返回什么
}
```

这是一种很有复用价值的组件组合方式。保护层并不关心里面一定是支付页；只要把其他需要登录的页面作为 children 传入，就可以复用同一套判断。

完整鉴权逻辑如下：

```jsx
import { Navigate } from 'react-router-dom'

const ProtectRoute = ({ children }) => {
  const isLogin = localStorage.getItem('isLogin') === 'true'

  if (!isLogin) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <>{children}</>
}
```

判断过程分成三步：

- 从 localStorage 读取 isLogin；
- 只有它严格等于字符串 `'true'` 才视为已登录；
- 未登录时跳到登录页，已登录时渲染 children。

`localStorage` 保存的是字符串，因此代码比较的是 `'true'`，而不是布尔值 `true`。它属于浏览器本地存储，并且按域隔离。HTTP 本身是无状态的，这个小例子用本地状态模拟“用户已经登录”。

&#123;&#123; { from: location.pathname } &#125;&#125; 给本次导航附带一个状态对象，用来记录用户原本想访问的地址。比如用户从 /pay 被拦截，登录页就能知道成功后应该回到 `/pay`。

为了让路由相关数据的来源更明确，这里可以用 useLocation 代替直接读取浏览器全局变量：

```jsx
import { Navigate, useLocation } from 'react-router-dom'

const ProtectRoute = ({ children }) => {
  const location = useLocation()
  const isLogin = localStorage.getItem('isLogin') === 'true'

  if (!isLogin) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <>{children}</>
}
```

这与登录页读取来源地址的方式也更加一致。

## 登录页：表单、路由状态与返回原页面 ##

登录页同时使用了两个路由 Hook：

```jsx
import { useNavigate, useLocation } from 'react-router-dom'
```

- `useNavigate` 用于在代码中主动跳转；
- `useLocation` 用于读取当前地址对应的 location 对象，其中包括上一步传来的 state。

组件先确定登录成功后的目标地址：

```jsx
const navigate = useNavigate()
const location = useLocation()
const from = location.state?.from || '/'
```

如果用户是从受保护页面跳来的，`location.state?.from` 就是原地址；如果用户直接访问 `/login`，不存在 state.from，则使用首页 /。

这里的 `?.` 是可选链运算符。它避免在 `state` 不存在时继续读取 `from` 而报错。

表单提交逻辑如下：

```jsx
function handleSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.currentTarget)
  const username = formData.get('username')
  const password = formData.get('password')

  if (!username || !password) {
    alert('请输入用户名和密码')
    return
  }

  if (username === 'admin' && password === '123456') {
    localStorage.setItem('isLogin', 'true')
    navigate(from, { replace: true })
  } else {
    alert('用户名或密码错误')
  }
}
```

`e.preventDefault()` 阻止表单按浏览器默认方式提交和刷新页面。随后用原生 `FormData` 读取当前表单，字段名来自两个输入框的 name：

```jsx
return (
  <form onSubmit={handleSubmit}>
    <h1>登陆</h1>
    <input name="username" placeholder="请输入用户名" required />
    <input name="password" placeholder="请输入密码" required />
    <button type="submit">登陆</button>
  </form>
)
```

输入为空时，HTML 的 required 会先提供浏览器级校验；提交函数中又做了一次空值判断。示例把正确凭据固定为用户名 admin、密码 123456。验证通过后，把登录标记写入 localStorage，再导航回 from。

这里同样使用 `{ replace: true }`。如果普通跳转把登录页保留在历史栈中，用户成功进入支付页后按后退键，可能又看到登录页；替换当前记录更符合用户预期。

整个访问过程可以串起来理解：

```text
访问 /pay
  ↓
ProtectRoute 发现未登录
  ↓ 携带 state.from = "/pay"
跳转 /login
  ↓ 登录成功，写入 localStorage
navigate("/pay", { replace: true })
  ↓
ProtectRoute 再次检查，允许渲染 Pay
```

支付页本身非常简单：

```jsx
const Pay = () => {
  return <>Pay</>
}
```

重点并不在支付内容，而在外层保护组件如何控制它是否能够显示。

## 声明式导航与编程式导航如何选择 ##

这个应用恰好展示了 React Router 的三种导航入口：

| 场景 | 使用方式 | 示例 |
| :--- | :--- | :--- |
| 用户点击链接 | Link | 从导航栏进入关于页或产品页 |
| 渲染时决定跳转 | Navigate | 未登录跳到登录页、旧地址重定向 |
| 事件或副作用触发 | useNavigate | 登录提交成功、404 三秒后返回首页 |

它们最终都会改变当前路由，但表达的意图不同。看到导航栏时用 Link，看到条件分支返回 JSX 时用 Navigate，看到提交回调或定时器时用 useNavigate，代码会更容易理解。

replace 则是它们共同涉及的历史记录控制方式。普通导航通常新增记录；登录中转、鉴权拦截和旧地址重定向更适合替换记录。

## 样式与工程配置在做什么 ##

路由是功能主线，项目其余配置提供了运行环境和基础展示。

Vite 配置只启用了 React 插件：

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

ESLint 对 JavaScript 和 JSX 启用推荐规则、React Hooks 规则与 Vite 环境下的 React Refresh 规则，同时忽略构建产物 dist。

依赖锁文件记录了包管理器实际解析出的依赖版本和依赖关系，用来让不同环境的安装结果保持一致。静态资源中，favicon.svg 被 HTML 作为站点图标引用；React、Vite 图标、图标集合以及 hero.png 来自页面模板，目前没有被这些路由页面导入。它们不会参与路由匹配或鉴权流程。

全局 CSS 使用变量统一管理文字、背景、边框和强调色，并通过 `prefers-color-scheme: dark` 切换暗色变量。根容器设置最大宽度、居中布局和最小视口高度：

```css
#root {
  width: 1126px;
  max-width: 100%;
  margin: 0 auto;
  text-align: center;
  border-inline: 1px solid var(--border);
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
```

样式中还通过 `@media (max-width: 1024px)` 调整字号、间距和布局，使页面适应较窄屏幕。`.hero`、`#next-steps`、`.counter` 等规则保留了初始页面模板的视觉样式，不过当前路由页面没有引用对应类名；它们不会影响本文的路由逻辑。

## 把所有知识点连成一条线 ##

现在回头看，应用启动后的工作流程很清晰：

- HTML 提供 `#root`，React 将 App 渲染进去；
- BrowserRouter 接管前端地址变化，并为后代提供路由上下文；
- Navigation 使用 Link 在 SPA 内切换地址；
- Routes 根据地址选择匹配的 Route；
- 页面组件通过 lazy 按需加载，等待期间由 Suspense 展示反馈；
- useParams 读取用户或产品的动态 ID；
- 产品父页面通过 Outlet 显示匹配的子页面；
- 未知地址由 `*` 捕获，并通过 useNavigate 返回首页；
- `/pay` 先经过 ProtectRoute，未登录时携带来源地址前往登录页；
- 登录成功后写入本地登录状态，并替换历史记录回到原页面。

## 实现复盘 ##

这个小型示例已经把 React Router 日常使用中最重要的几条线串了起来：路由配置负责 URL 与页面的映射，Link 负责用户主动导航，动态参数让同一个组件服务于不同资源，嵌套路由让模块共享父级布局，懒加载降低非当前页面对首次加载的影响，而保护组件则利用 children、Navigate、路由状态和本地存储组成了一条完整的登录访问链路。

最后再强调三个实现细节：

- 旧路径重定向的目标 `/new-path` 需要补充真实路由，否则会落入 404；
- 404 页的定时器最好在 useEffect 清理函数中取消；
- 鉴权组件最好通过 useLocation 获取当前路径，使路由数据始终来自 React Router 上下文。

理解这些组件和 Hook 各自负责什么之后，路由代码就不再是一堆零散 API，而是一套围绕“地址变化后显示什么、何时允许显示、跳转后历史如何处理”的完整机制。
