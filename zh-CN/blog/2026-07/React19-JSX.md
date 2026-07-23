---
lastUpdated: true
commentabled: true
recommended: true
title: React19 新手指南
description: JSX 没那么难，用好这几条规则就够了
date: 2026-07-23 10:25:00
pageClass: blog-page-class
cover: /covers/react.svg
---

## 阶段概述 ##

这篇讲 React 19 的基础部分：它的设计思路是什么、Vite 怎么搭、组件怎么写、JSX 有哪些坑、以及 Props 怎么传。打好这几块的底子，后面的 Hooks 和状态管理才不会懵。

## 第一部分：React 核心设计哲学与工程化起步 ##

### React 的设计哲学与声明式渲染 ###

React 本质上是一个解决"怎么构建用户界面"的 UI 库，不是全栈框架。路由、状态管理、构建工具这些它都不管，交给社区生态自己选。这让它比 Angular 之类的框架灵活很多，但初学者配环境的时候可能会有点懵——因为选项太多了。

React 提出了一个公式：

\( UI = f(\text{State}) \)

UI=f(State)UI = f(State)UI=f(State)

意思很直接：组件是个函数，吃进 State 或 Props，吐出对应的页面结构，渲染出 UI（界面）。你只需要描述"数据是什么样时，页面应该长什么样"，React 负责帮你搞定 DOM 的增删改。

声明式和命令式的区别也在这里体现：

- 命令式（原生 DOM）：自己一步步告诉浏览器"先找到这个节点，再改它的内容，再更新样式"——繁琐，出错了也难排查。
- 声明式（React）：你描述状态对应的结构，底层的虚拟 DOM 和 Diff 算法来做脏活。

### Vite + React 19 挂载机制 ###

React 19 推荐用 Vite 作脚手架。入口是 `index.html` 里的脚本加载 `src/main.jsx`，用 `createRoot` 完成挂载：

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`StrictMode` 只在开发环境生效。它会故意把组件渲染和 `Effect` 执行两次，目的是帮你提前暴露内存泄漏、意外副作用或已废弃 API 的问题。上线后没有任何影响。

## 第二部分：组件定义与模块化导入导出 ##

### 函数组件 (Functional Components) ###

组件就是一个返回 JSX 的普通 JavaScript 函数。React 19 里，函数组件是唯一的标准写法，类组件已经基本退出历史舞台。
有一条命名规则要记住：自定义组件首字母必须大写，比如 `<Greet />`，这样 React 才能把它和原生 HTML 标签（小写的 `<div>`）区分开来。

### 命名导出与默认导出的工程选型 ###

React 项目里，优先用命名导出：

- 默认导出：`export default Greet` → `import Greet from './Greet'` 导入时可以随意改名，项目重构时 IDE 的自动重命名很容易失效，多人协作的时候尤其容易出问题。

- 命名导出：`export const Greet = () => {}` → `import { Greet } from './Greet'` 名称是固定契约，重构友好，IDE 自动导包秒级响应，一个文件里还可以导出多个组件。

## 第三部分：JSX 语法本质与编写规范 ##

### JSX 的本质是 JavaScript 语法糖 ###

JSX 不是 HTML，浏览器直接看不懂它，得靠编译器转译成普通 JS 对象。

React 19 有个小变化：新的 JSX Runtime 会自动引入编译辅助函数，所以文件顶部不再需要写 import React from 'react' 了。很多旧教程还在写这行，遇到了别奇怪。

## JSX 编写五大核心规则 ##

单个根节点：JSX 必须有一个根元素包裹，因为函数只能返回一个值。推荐用空标签 `<></>` (Fragment) 包，不会在真实 DOM 里留下多余节点。

- 驼峰命名：HTML 的事件和属性在 JSX 里要写驼峰，比如 onClick、maxLength、tabIndex。

- 保留字替代：`class` 和 `for` 是 JS 关键字，JSX 里必须写成 `className` 和 `htmlFor`。

- 严格闭合：所有标签都必须闭合，包括单标签，比如 `<img />`、`<input />`。

- 表达式插值：花括号 `{}` 里只能写有返回值的表达式（三元运算符、变量、函数调用），`if`、`for` 这类控制流语句不能直接写进去。

## 第四部分：Props 单向数据流与组合模式 ##

### Props 的只读不可变性 ###

子组件不能直接修改收到的 props，这是 React 的核心约定。数据只能从父组件往下流，如果需要改变数据，得通过父组件传下来的回调函数通知父组件去改自己的 state，再重新分发下来。

实际写法推荐直接在参数里解构并设默认值：

```jsx
export default function Greet({ name = "Guest", heroName = "Hero" }) {
  return <h1>Hello {name} a.k.a {heroName}</h1>;
}
```

### 组件组合：`props.children` ###

`props.children` 是 React 内置的特殊属性，用来接收组件标签里面嵌套的内容——文字、HTML 元素或者其他组件都行。

用 `children` 可以写出"空抽屉式"的容器组件，比如 Card、Layout，内部填什么由调用方决定。这种组合方式比通过 props 一个个传要干净很多。

## 写在最后 ##

到这里，你已经掌握了 React 组件怎么接收数据（Props）以及怎么画页面（JSX）。但光有这些，网页还只是个静态的壳子。

要让页面动起来，比如点击按钮数字加一、或者输入框打字有反应，就得用到 React 的状态（State）和事件绑定。然而，这也是初学者最容易写出 Bug 的地方：为什么我改了 State 页面没反应？为什么我的状态更新总是“慢半拍”？
