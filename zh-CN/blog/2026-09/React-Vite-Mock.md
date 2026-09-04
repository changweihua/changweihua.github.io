---
lastUpdated: true
commentabled: true
recommended: true
title: React + Vite + Mock 打造真正的前后端分离开发体验
description: 别再傻等后端接口了！
date: 2026-09-04 09:15:00
pageClass: blog-page-class
cover: /covers/react.svg
---

## 前言 ##

在实际项目中，前后端分离已经是标配。但理想很丰满，现实很骨感——前端往往需要等待后端接口开发完成才能开始联调，这导致了大量的“阻塞式”开发，极大地拖累了项目进度。

本文将通过一个 Todos 全栈项目，带你了解如何通过前端接口层（API Layer）+ Mock 数据，实现真正意义上的前后端并行开发。我们将基于 React + React Router + Zustand 构建前端，使用 Koa + MySQL 作为后端，并利用 Vite 的插件 vite-plugin-mock 来模拟数据，彻底摆脱对后端的“等待依赖”。

## 项目整体架构：各司其职 ##

首先，我们明确下项目结构：

```text
todos-fullstack/
├── backend/          # Node + Koa + MySQL (后端服务)
└── frontend/         # React + Vite (前端应用)
    └── todos/
        ├── src/
        │   ├── api/          # 前端接口层（统一管理所有接口）
        │   │   ├── config.js # axios 实例配置
        │   │   └── todos.js  # 具体的 todos 接口
        │   ├── components/   # 公共组件 (如 Nav)
        │   ├── pages/        # 页面级别组件 (Home, Todos)
        │   ├── App.jsx       # 路由配置
        │   └── main.jsx      # 应用入口
        ├── mock/             # Mock 数据配置目录
        │   └── todos.js      # /api/todos 的模拟数据
        ├── vite.config.js    # Vite 配置（集成 mock 插件）
        └── package.json
```

*核心思想*：

- 前端：负责 UI 渲染、路由跳转、状态管理（Zustand）、用户交互。
- 后端：负责数据处理、数据库操作、提供 RESTful API。
- 衔接点：唯一的耦合点就是 API 接口。而我们要做的，正是通过“前端接口层”来解耦。

## 前端三驾马车：React + Router + Zustand ##

前端项目独立开发，依赖以下三个核心库：

- React：负责 UI 组件化，采用函数式组件 + Hooks。
- React Router：管理页面路由（/ 首页，/todos 任务列表）。
- Zustand：轻量级状态管理，负责跨组件共享数据（如 todos 列表）。
- 路由配置示例（App.jsx）：

```jsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';

const Home = lazy(() => import('./pages/Home'));
const Todos = lazy(() => import('./pages/Todos'));

function App() {
  return (
    <Router>
      <Nav /> {/* 导航组件 */}
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/todos" element={<Todos />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
```

## 前端接口层的设计哲学 ##

### 为什么需要 api/ 目录？ ###

- 统一管理：将所有后端接口的调用封装在一个目录下，便于维护和修改。
- 隔离变化：无论后端接口怎么变（url、参数、返回值），只需在 api/ 目录下调整，页面组件无需改动。
- 便于测试：可以在接口层轻松注入 mock 数据，无需修改业务代码。

### 配置 axios 实例（`api/config.js`） ###

我们使用 axios 替代原生 fetch，因为它更强大、更易用。

```javascript
// src/api/config.js
import axios from 'axios';

// 创建 axios 实例
const instance = axios.create({
  // 关键：在开发阶段，baseURL 指向 Mock 服务（/api 前缀）
  // 后端开发完成后，只需注释掉上一行，启用下一行即可切换
  baseURL: '/api', // 开发阶段：Vite 代理到 mock 服务
  // baseURL: 'http://localhost:3000', // 生产阶段：真正的后端地址
  timeout: 5000,
});

export default instance;
```

注释说明：通过 `baseURL` 的一键切换，实现从 Mock 到真实接口的无缝过渡，真正做到“前后端并行开发”。

### 定义具体的接口（api/todos.js） ###

```javascript
// src/api/todos.js
import axios from './config';

// 导出获取 todos 列表的接口函数
export const getTodos = async () => {
  const res = await axios.get('/todos'); // 实际请求地址：/api/todos
  return res.data;
};
```

## 页面中的调用：数据驱动 UI ##

在 `Todos.jsx` 页面中，我们通过 useEffect 调用接口，并用 useState 管理数据状态。

```jsx
// src/pages/Todos.jsx
import { getTodos } from '../api/todos';
import { useEffect, useState } from 'react';

function Todos() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    // 使用 IIFE (立即执行函数) 来使用 async/await
    (async () => {
      const data = await getTodos();
      setTodos(data.todos || []); // 注意接口返回结构：{ code: 0, todos: [...] }
    })();
  }, []);

  return (
    <div>
      <h1>我的待办</h1>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.completed ? '✅' : '⬜'} {todo.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Todos;
```

## Mock 数据：前端开发的“武器库” ##

### 为什么需要 Mock？ ###

- 后端接口尚未开发完成，前端需要模拟数据来进行 UI 渲染和逻辑测试。
- 保证前端开发进度不阻塞，实现真正的“并行开发”。

### 使用 vite-plugin-mock 配置模拟接口 ###

首先，安装插件：

```bash
pnpm add -D vite-plugin-mock
```

然后，在 vite.config.js 中配置：

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteMockServe } from 'vite-plugin-mock';

export default defineConfig({
  plugins: [
    react(),
    viteMockServe({
      mockPath: 'mock', // mock 文件存放目录
      localEnabled: true, // 开发环境下启用 mock
    }),
  ],
});
```

### 编写 Mock 数据（mock/todos.js） ###

模拟 `/api/todos` 接口，返回符合预期的数据结构。

```javascript
// mock/todos.js
export default [
  {
    url: '/api/todos', // 拦截的接口地址
    method: 'get', // 请求方法
    timeout: 2000, // 模拟网络延迟
    response: (req, res) => {
      // 返回模拟数据
      return {
        code: 0,
        todos: [
          { id: 1, title: '学习前端接口工程', completed: true },
          { id: 2, title: '看龙餐馆', completed: false },
          { id: 3, title: '完成全栈项目', completed: false },
        ],
      };
    },
  },
];
```

注意：这里返回的数据结构必须和真实后端接口保持一致，这样在切换时前端代码无需任何改动。

## 前后端联调：一键切换，无缝衔接 ##

当后端开发完成，服务启动在 `http://localhost:3000` 后，我们只需要做一件事：

```javascript
// src/api/config.js
const instance = axios.create({
  // baseURL: '/api',           // 注释掉 mock
  baseURL: 'http://localhost:3000', // 启用真实后端
  timeout: 5000,
});
```

前端代码无需任何修改，所有接口自动切换到真实数据源！

这就是接口层的魅力：它将“变化”隔离在少数几个文件中，最大程度降低了代码的维护成本和风险。

## 总结：前端工程化的一环——API 工程 ##

通过这个简单的 Todos 项目，我们深刻体会到：

- 前后端分离不仅是技术上的分离，更是开发流程上的解耦。
- 前端接口层（API Layer）是连接前后端的桥梁，也是保证前端独立性的关键。
- Mock 数据不是“打补丁”，而是前端工程化中不可或缺的一部分。
- 善用 vite-plugin-mock 等工具，可以让我们像写真实接口一样写模拟数据，开发体验极佳。

最终，我们的目标是：前端自给自足，后端专注数据，双方在约定的接口契约下并行开发，最后轻松联调，皆大欢喜！
