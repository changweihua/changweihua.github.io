---
lastUpdated: true
commentabled: true
recommended: true
title: 用 useMouse 理解响应式封装
description: React 自定义 Hooks 实战
date: 2026-08-12 11:25:00
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 前言 ##

在 React 生态中，组件通信与逻辑复用是两个核心命题。组件通信涵盖了父子单向数据流、兄弟关系、跨层级传递的痛点；useContext 作为上下文机制解决了深层嵌套的传值问题；而自定义 Hooks 则从另一个维度切入 —— 它关注的不是"数据怎么传"，而是"逻辑怎么复用"。

本文以项目中的 `useMouse` 为例，拆解自定义 Hook 的设计思路：如何将一个涉及 DOM 事件、副作用、响应式状态的场景，抽象成一个干净、可复用的 Hook。

## 组件通信的"问题地图" ##

在 React 中，组件通信是一个层级分明的体系：

- 父子通信：单向数据流，靠 `props` 逐层下传，适合简单场景。
- 兄弟通信：需要共同的父组件做中转，或者借助状态管理。
- 爷孙 / 陌生关系：层层传递既啰嗦又低效，`useContext` 跨越层级直接消费数据。
- 上下文：三步走 —— `createContext` → `Provider` 包裹 → `useContext` 消费。

这是"数据在哪里"的答案。但还有另一个问题："能力在哪里"。比如，监听鼠标位置这件事，难道要把它写在组件里、然后靠 props 或 context 到处传递吗？

答案是：自定义 Hooks。

## 自定义 Hooks 的设计哲学 ##

一个合格的自定义 Hook 有三条朴素的标准：

- 以 `use` 开头 —— 这是 React 的约定，让 `linter` 能校验 Hook 规则。
- 放在 `hooks` 目录下 —— 属于架构层，不是某个组件的附属品。
- 封装了响应式与副作用 —— 这是 Hook 的本质价值。

这三条构成了自定义 Hook 的"一面旗帜"：它不是一个普通函数，而是一个有生命周期感知、能持有状态、且可跨组件复用的逻辑单元。

而 useMouse 恰好是一个教科书级的例子。

## 拆解 useMouse：一个完整的 Hook 闭环 ##

```jsx
import { useState, useEffect } from 'react';

export const useMouse = () => {
    const [x, setX] = useState(null);
    const [y, setY] = useState(null);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        }

        function handleMouseMove(e) {
            setX(e.clientX);
            setY(e.clientY);
        }
    }, [])

    return { x, y }
}
```

逐层拆解：

### 状态声明 —— 响应式的起点 ###

```js
const [x, setX] = useState(null);
const [y, setY] = useState(null);
```

初始值为 null，这是一个语义信号：尚未获取到鼠标位置。调用方可以根据 x 是否为 null 来决定展示"等待状态"还是"坐标数据"，这正是"响应式的鼠标坐标"的含义——坐标值随鼠标移动自动更新，组件只需读取即可。

### 副作用注册与回收 —— 生命周期的闭环 ###

```js
useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
        document.removeEventListener('mousemove', handleMouseMove);
    }
}, [])
```

这里有三层设计细节：

- 事件注册：在 `useEffect` 中绑定 `document` 级别的 `mousemove`，保证全局监听。
- 清理函数：return 的函数在组件卸载时执行，移除事件监听。注释中提到"定时器、worker、事件需要手动回收"——这是 React 开发中极易被忽视的内存泄漏点。useEffect 的清理机制是防止这类泄漏的标准范式。
- 空依赖数组 `[]`：表示此 effect 只在组件挂载和卸载时执行一次，事件处理函数 handleMouseMove 通过闭包稳定引用 `setX` / `setY`（useState 返回的 setter 本身是稳定的）。

### 暴露接口 —— 最小化契约 ###

```js
return { x, y }
```

Hook 只向外暴露调用方真正需要的两个字段，不暴露内部的 `setX` / `setY`（调用方本身也不应该手动设置鼠标坐标）。这是一种封装：内部的状态变更完全由副作用驱动，外部只读。

## 消费端：一个干净的 App 组件 ##

```jsx
import { useMouse } from './hooks/useMouse';

function App() {
  const { x, y } = useMouse()
  return (
    <div style={{ height: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center' }}>
      {x && y ? `x: ${x}, y: ${y}` : '鼠标未移动'}
    </div>
  )
}
```

这里的优雅体现在几个方面：

- 一行接入：`const { x, y } = useMouse()`，没有 props 传递，没有 context 包裹，任何组件需要鼠标位置时，直接调用即可。
- 状态驱动的 UI：利用 `x && y` 的短路求值做条件渲染——初始状态（`null`）显示"鼠标未移动"，移动后实时展示坐标。这是 React 声明式 UI 思想的自然延伸。
- 关注点分离：`App` 组件不需要知道 DOM 事件如何绑定、如何解绑、坐标如何获取。它只关心"我有鼠标数据"和"我怎么渲染它"。

## 从 useMouse 到更广阔的 Hooks 图景 ##

回顾整个设计，可以画出一条清晰的逻辑链：

| 层次 | 内容 | 对应文件 |
| :--- | :--- | :--- |
| 理论框架 | 组件通信体系 & 自定义 Hooks 规范 | 项目文档 |
| 架构封装 | 将鼠标监听抽象为可复用 Hook | `hooks/useMouse.js` |
| 界面消费 | 用 Hook 驱动视图渲染 | `App.jsx` |

这正是 React 自定义 Hooks 的核心价值：把"怎么做"封装在 Hook 里，让组件只管"是什么"。

当你遇到类似场景 —— 窗口尺寸监听、网络状态检测、表单逻辑、定时器操作 —— 都可以套用 useMouse 的模式：用 useState 持有响应式状态，用 useEffect 管理副作用的注册与回收，暴露最小接口，放入 hooks 目录作为架构资产。

## 小结 ##

`useMouse` 只有 20 行代码，但它完整示范了自定义 Hook 的最佳实践：状态、副作用、清理、封装、复用。三个关键词——"响应式"、"抽象"、"封装"——贯穿始终。

写好自定义 Hook 的秘诀不在于复杂度，而在于把一件具体的事情封装干净。当一个 Hook 的调用方只需要一行解构就能获得它需要的全部能力时，你就做对了。
