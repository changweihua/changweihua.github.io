---
lastUpdated: true
commentabled: true
recommended: true
title: 后端API没写好，前端难道干等着吗？
description: 后端API没写好，前端难道干等着吗？
date: 2026-08-13 09:35:00
pageClass: blog-page-class
cover: /covers/react.svg
---

> 技术栈：React 19 + React Router 7 + Zustand 5 + Axios + Vite + Mock.js + Koa 3 + MySQL

## 前后端分离，分离的到底是什么？ ##

很多人对"前后端分离"的理解停留在"前端用 React，后端用 Node"这个层面。但真正做过项目的人都知道，分离的核心难题不在技术选型，而在协作节奏。

后端的 API 还没写好，前端难道只能干等？

这个 Todos 项目给出了一个经典的回答：前端接口工程。前端不只是写页面，还要建立自己独立的接口层，让前端可以在不依赖后端的情况下完整地跑起来。

```txt
todos-fullstack/
├── fronted/todos/          # 前端工程
│   ├── src/
│   │   ├── api/            # ← 前端接口工程的核心
│   │   │   ├── config.js   # axios 实例配置
│   │   │   └── todos.js    # 接口模块
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面级路由组件
│   │   └── App.jsx         # 路由入口
│   ├── mock/               # Mock 数据
│   │   └── todos.js
│   └── vite.config.js      # Vite + Mock 配置
├── backend/                # 后端工程（Koa）
└── readme.md
```

## 前端三驾马车：组件 + 路由 + 状态管理 ##

> 组件（响应式）+ 路由 + 状态管理（银行）—— 前端项目独立开发的三驾马车

### 组件：响应式的基石 ###

React 的组件是声明式的——你描述 UI 长什么样，React 负责在数据变化时更新 DOM。项目里的 `Todos.jsx` 就是一个典型的函数组件：

```jsx
import { getTodos } from '../api/todos';
import { useEffect, useState } from 'react';

function Todos() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await getTodos();
      setTodos(data);
    })();
  }, []);

  return (
    <>
      <h1>Todos</h1>
    </>
  );
}
export default Todos;
```

注意这里的关键设计：组件只负责渲染，数据从 `api/` 层获取。组件不关心数据来自 Mock 还是后端，它只调用 `getTodos()`，拿到数据就渲染。这种解耦让组件足够纯粹。

### 路由：前端的独立导航 ###

`App.jsx` 用 `react-router-dom` 接管了整个应用的路由：

```jsx
import { lazy, Suspense } from 'react';
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import Nav from './components/Nav';

const Home = lazy(() => import('./pages/Home'));
const Todos = lazy(() => import('./pages/Todos'));

function App() {
  return (
    <Router>
      <Nav />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/todos" element={<Todos />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

两个细节值得注意：

- `lazy` + `Suspense` 做代码分割：页面级组件按需加载，首屏不会加载所有页面的代码。Suspense 的 fallback 在组件加载期间显示 Loading 状态。
- 路由即架构：Router 包裹一切，Nav 在路由之外（所有页面共享），Routes 在内（按路径切换内容）。前端路由完全独立于后端，不需要后端配合。

### 状态管理：Zustand（银行） ###

项目 package.json 里已经引入了 zustand：

```json
"dependencies": {
  "axios": "^1.19.0",
  "react": "^19.2.7",
  "react-dom": "^19.2.7",
  "react-router-dom": "^7.18.2",
  "zustand": "^5.0.14"
}
```

虽然当前 `Todos.jsx` 还在用 `useState` 做局部状态，但 Zustand 的引入说明项目的设计意图是：当状态需要在多个组件间共享时，用 Zustand 做全局状态管理。Zustand 的哲学是轻量、无模板代码——不像 Redux 那样需要 action、reducer、dispatch 一整套仪式，一个 create 就能搞定。

readme 把状态管理比作"银行"——所有组件的共享状态都存在这里，谁需要就谁来取，谁改了大家都看得到。这是前端独立于后端的底气之一：状态在前端，UI 的响应式由前端自己驱动。

## 前端接口工程：本文的核心 ##

这是整个项目最值得聊的部分。

### 为什么要前端接口层？ ###

传统的前后端协作模式是这样的：

```txt
前端写页面 → 等后端 API → 联调 → 联调出问题 → 改 → 再联调
```

问题在于：前端被后端的节奏绑架了。后端接口没好，前端只能写静态页面，没法跑通完整的数据流。

这个项目的解法是：在 `src/api/` 目录建立前端自己的接口工程。

### axios 实例：统一配置，一键切换 ###

`api/config.js` 是整个接口工程的基座：

```js
import axios from 'axios';

const instance = axios.create({
    baseURL: '/api',       // 开发阶段走 Mock
    // baseURL: 'http://localhost:3000',  // 联调阶段切后端
    timeout: 5000,
})

export default instance;
```

短短几行代码，做了三件事：

- 实例化 axios：不直接用 `axios.get()`，而是 `axios.create()` 创建实例，所有请求共享配置。
- baseURL 统一管理：开发阶段 `baseURL: '/api'`，请求会被 Vite 的 Mock 拦截；联调阶段只需改成 `http://localhost:3000`，所有接口请求自动切到后端。一行代码完成切换。
- 超时配置：统一设置 5 秒超时，避免某个接口卡住整个应用。

为什么用 axios 而不是 fetch？fetch 缺点是功能小。axios 提供了拦截器、超时、自动 JSON 转换、错误处理等开箱即用的能力，是前端接口工程的标准选择。

### 接口模块：一个模块一个文件 ###

`api/todos.js` 是 Todos 模块的接口定义：

```js
import axios from './config';

export const getTodos = async () => {
    const res = await axios.get('/todos');
    return res.data;
}
```

设计原则：

- 一个模块一个文件：如果项目有 users、posts 等模块，就分别建 `api/users.js`、`api/posts.js`。
- 只暴露业务函数：组件调用的是 `getTodos()`，而不是 `axios.get('/todos')`。接口的 URL、参数格式都被封装在函数内部，组件不需要知道请求细节。
- 返回数据，不返回响应对象：`return res.data` 而不是 `return res`，组件拿到的直接是业务数据。

这样的好处是：如果后端改了接口路径，或者改了返回数据结构，只需要改 `api/` 层，组件代码一行都不用动。

## Mock.js：前端的"假后端" ##

### Vite 插件配置 ###

`vite.config.js` 里集成了 `vite-plugin-mock`：

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig({
  plugins: [
    react(),
    viteMockServe({
      mockPath: 'mock',        // Mock 文件目录
      localEnabled: true,      // 开发环境启用
    })
  ],
})
```

`mockPath: 'mock'` 告诉插件去项目根目录的 `mock/` 文件夹找 Mock 配置。`localEnabled: true` 确保开发环境下 Mock 生效。

### Mock 文件：拦截请求，返回假数据 ###

`mock/todos.js` 拦截了 `/api/todos` 的 GET 请求：

```js
export default [
    {
        url: '/api/todos',
        method: 'GET',
        timeout: 2000,        // 模拟网络延迟
        response: (req, res) => {
            return {
                code: 0,
                todos: [
                    { id: 1, title: '学习前端接口工程', completed: true },
                    { id: 2, title: '看龙餐馆', completed: false },
                ]
            }
        }
    }
]
```

当 axios 发起 GET `/api/todos` 请求时，Vite 的 Mock 中间件会拦截这个请求，直接返回上面定义的数据，根本不会发到后端。

`timeout: 2000` 是个细节——模拟 2 秒网络延迟，让前端可以测试 Loading 状态。好的 Mock 不仅要返回数据，还要模拟真实网络的不确定性。

### 前端如何"一键切换"到真后端？ ###

这是整个架构最优雅的地方。切换流程：

```txt
开发阶段：axios baseURL '/api' → Vite Mock 拦截 → 返回 mock 数据
                                    ↓
联调阶段：axios baseURL 'http://localhost:3000' → 请求发到 Koa 后端 → 返回真实数据
```

只需要改 `api/config.js` 里的 baseURL 一行代码，所有接口请求就从 Mock 切到后端。组件代码、接口函数、路由逻辑——全部不用改。

## 后端：Koa 的起步 ##

后端目前还在起步阶段，`backend/package.json` 已经引入了 Koa 3：

```json
{
  "name": "backend",
  "type": "commonjs",
  "dependencies": {
    "koa": "^3.2.1"
  }
}
```

Koa 是 Express 团队打造的下一代 Node.js 框架，特点是基于 async/await 的洋葱模型中间件，没有内置路由、模板引擎等，一切靠中间件按需组装。readme 里规划的后端职责是：

- 提供 `/todos` API，返回 JSON 数组
- 数据存储用 MySQL

当后端准备好 `/todos` 接口后，前端只需把 `baseURL` 改成 `http://localhost:3000`，整个数据流就从前端 Mock 切到了真实后端——这就是前端接口工程的价值。

## 架构全景图 ##

把所有部分串起来，数据流是这样的：

```txt
用户访问 /todos
    ↓
React Router 匹配路由 → 懒加载 Todos.jsx
    ↓
Todos 组件挂载 → useEffect 触发
    ↓
调用 api/todos.js 的 getTodos()
    ↓
api/config.js 的 axios 实例发起请求
    ↓
    ┌── baseURL: '/api' → Vite Mock 拦截 → mock/todos.js 返回假数据
    │
    └── baseURL: 'http://localhost:3000' → 请求到达 Koa 后端 → MySQL 查询 → 返回真实数据
    ↓
组件 setState → React 重新渲染 → 页面更新
```

## 总结：前端接口工程的三个层次 ##

这个项目虽然是个基础的全栈练习，但它传达的工程思想很重要。前端接口工程分三个层次：

| 层次 | 目录 | 职责 |
| :--- | :--- | :--- |
| 配置层 | `api/config.js` | axios 实例、baseURL、超时、拦截器 |
| 模块层 | `api/todos.js` | 按业务模块封装接口函数 |
| Mock 层 | `mock/todos.js` | 拦截请求，返回模拟数据 |

三层各司其职：

- 配置层管"怎么发请求"（统一配置、一键切换）
- 模块层管"发什么请求"（业务接口封装）
- Mock 层管"后端没好怎么办"（前端独立开发）

这套架构让前端团队可以在后端 API 尚未就绪时，独立完成从路由到组件到数据流的完整开发。当后端 ready，改一行 baseURL 就能完成切换。这不是"前后端分离"的全部，但它是"前端独立开发"的基础。

前后端分离不是技术问题，是工程问题。 前端要成为独立的工程体系，就不能只会写组件，还要会管理接口、模拟数据、掌控数据流。这个 Todos 项目虽然小，但它把这个道理讲清楚了。
