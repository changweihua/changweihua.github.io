---
lastUpdated: true
commentabled: true
recommended: true
title: 从 HashRouter 到 BrowserRouter
description: React Router 完全指南
date: 2026-08-13 10:08:00
pageClass: blog-page-class
cover: /covers/react.svg
---

## 前端路由的演进 ##

### 传统后端路由时代 ###

在早期 Web 开发中，路由完全由后端控制：

```tsx
// 传统的后端路由
app.get('/about', (req, res) => {
  res.render('about'); // 返回完整的 HTML 页面
});

app.get('/users/:id', (req, res) => {
  const user = getUser(req.params.id);
  res.render('user', { user });
});
```

*缺点*：

- 每次切换页面都需要重新加载整个页面

- 页面切换时会出现空白期

- 用户体验差，交互不流畅

- 服务器压力大

### SPA 与前端路由的诞生 ###

随着移动互联网的发展，单页应用（SPA）成为主流：

```html
<!-- 传统页面跳转 -->
<a href="/about">关于我们</a>  <!-- 会刷新整个页面 -->

<!-- SPA 路由跳转 -->
<a href="#/about">关于我们</a>  <!-- 不会刷新页面 -->
```

*Hash 路由的工作原理*：

- URL 的 hash 部分（`#` 后面的内容）改变不会触发页面刷新

- 通过监听 `hashchange` 事件来响应路由变化

- 原本用于页面内锚点跳转的特性被用于路由

```ts
// Hash 路由实现原理
window.addEventListener('hashchange', function() {
  const hash = window.location.hash.slice(1);
  renderPage(hash);
});

function renderPage(route) {
  // 根据路由渲染不同组件
  const app = document.getElementById('app');
  switch(route) {
    case 'home':
      app.innerHTML = '<h1>首页</h1>';
      break;
    case 'about':
      app.innerHTML = '<h1>关于我们</h1>';
      break;
    default:
      app.innerHTML = '<h1>404</h1>';
  }
}
```

## React Router 基础 ##
React Router 是 React 生态中最流行的路由解决方案。

### 安装与配置 ###

```bash
# 安装 React Router
npm install react-router-dom
```

### 基本路由配置 ###

```bash
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Users from './pages/Users';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
        <Link to="/users">用户</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users" element={<Users />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### HashRouter vs BrowserRouter ###

| 特性 | HashRouter | BrowserRouter |
| :--- | :--- | :--- |
| URL 格式 | `example.com/#/about` | `example.com/about` |
| 美观度 | 较丑（包含 #） | 美观 |
| 服务器配置 | 不需要 | 需要配置 |
| SEO | 不友好 | 友好 |
| 浏览器支持 | 所有浏览器 | HTML5 浏览器 |

#### HashRouter 示例 ####

```tsx
import { HashRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </HashRouter>
  );
}
// 实际 URL: http://localhost:3000/#/about
```

#### BrowserRouter 示例 ####

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
// 实际 URL: http://localhost:3000/about
```

## 高级路由特性 ##

### 路由懒加载（性能优化） ###

懒加载可以显著提升首屏加载速度：

```tsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 使用 lazy 进行代码分割
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>加载中...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

*性能对比*：

- 未使用懒加载：所有组件一次性加载，初始加载慢

- 使用懒加载：只加载当前页面，切换时按需加载

### 动态路由 ###

处理 URL 参数：

```tsx
import { useParams, useNavigate } from 'react-router-dom';

function UserProfile() {
  const { userId } = useParams(); // 获取动态参数
  const navigate = useNavigate();

  return (
    <div>
      <h1>用户 ID: {userId}</h1>
      <button onClick={() => navigate('/users')}>
        返回用户列表
      </button>
    </div>
  );
}

// 路由配置
<Route path="/users/:userId" element={<UserProfile />} />
```

### 嵌套路由 ###

构建复杂的页面布局：

```tsx
import { Routes, Route, Outlet, Link } from 'react-router-dom';

// 布局组件
function DashboardLayout() {
  return (
    <div>
      <nav>
        <Link to="/dashboard/overview">概览</Link>
        <Link to="/dashboard/analytics">数据</Link>
        <Link to="/dashboard/settings">设置</Link>
      </nav>
      <main>
        <Outlet /> {/* 子路由渲染位置 */}
      </main>
    </div>
  );
}

// 子组件
function Overview() {
  return <h2>概览页面</h2>;
}

function Analytics() {
  return <h2>数据页面</h2>;
}

function Settings() {
  return <h2>设置页面</h2>;
}

// 路由配置
function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route path="overview" element={<Overview />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
```

### 404 页面处理 ###

```tsx
import { Routes, Route } from 'react-router-dom';

function NotFound() {
  return (
    <div>
      <h1>404</h1>
      <p>页面未找到</p>
      <Link to="/">返回首页</Link>
    </div>
  );
}

// 路由配置
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="*" element={<NotFound />} /> {/* 404 路由 */}
</Routes>
```

## 路由鉴权（权限控制） ##

### 基础鉴权实现 ###

```tsx
import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// 模拟登录状态
function useAuth() {
  const [user, setUser] = useState(null);

  const login = (username, password) => {
    // 模拟验证
    if (username === 'admin' && password === '123456') {
      setUser({ username: 'admin', role: 'admin' });
      localStorage.setItem('user', JSON.stringify({ username: 'admin' }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return { user, login, logout };
}

// 路由守卫组件
function PrivateRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// 登录页面
function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/dashboard');
    } else {
      alert('登录失败，请检查用户名和密码');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="用户名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">登录</button>
    </form>
  );
}

// 主应用
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
```

### 基于角色的权限控制 ###

```tsx
function RoleBasedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== requiredRole) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
}

// 使用
<Route
  path="/admin"
  element={
    <RoleBasedRoute requiredRole="admin">
      <AdminPanel />
    </RoleBasedRoute>
  }
/>
```

## props.children 与布局组件 ##

### 基础概念 ###

`props.children` 是 React 的特殊属性，代表组件标签之间的内容：

```tsx
// 容器组件
function Container({ children }) {
  return (
    <div className="container">
      {children}
    </div>
  );
}

// 使用
<Container>
  <h1>标题</h1>
  <p>内容</p>
</Container>
```

### 弹窗组件实现 ###

```tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <button onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

// 使用
function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <button onClick={() => setShowModal(true)}>打开弹窗</button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="提示"
      >
        <p>这是弹窗内容，可以被完全自定义</p>
        <input type="text" placeholder="输入内容" />
        <button>自定义按钮</button>
      </Modal>
    </div>
  );
}
```

## 路由最佳实践 ##

### 路由配置文件 ###

```js:router.config.js
const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'users',
        element: <Users />,
        children: [
          {
            path: ':id',
            element: <UserProfile />,
          },
        ],
      },
    ],
  },
  {
    path: 'login',
    element: <Login />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
```

### 路由守卫 HOC ###

```js:withAuth.js
import { Navigate } from 'react-router-dom';

function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const token = localStorage.getItem('token');

    if (!token) {
      return <Navigate to="/login" replace />;
    }

    return <Component {...props} />;
  };
}

// 使用
const DashboardWithAuth = withAuth(Dashboard);
```

## 总结 ##

React Router 是现代 React 应用不可或缺的工具：

### HashRouter vs BrowserRouter ###

- HashRouter：简单、无需服务器配置，但 URL 不美观

- BrowserRouter：URL 美观、SEO 友好，需要服务器支持

### 核心特性 ###

- 路由懒加载提升性能

- 动态路由处理参数

- 嵌套路由构建复杂布局

- 路由鉴权控制访问权限

### 最佳实践 ###

- 集中管理路由配置

- 使用懒加载优化首屏

- 实现完整的权限控制

- 统一的错误页面处理
