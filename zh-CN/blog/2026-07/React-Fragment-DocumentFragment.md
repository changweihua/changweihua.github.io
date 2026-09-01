---
lastUpdated: true
commentabled: true
recommended: true
title: React Fragment OR 原生的 DocumentFragment
description: React 的 `<></>` 和原生的 DocumentFragment，同名不同命
date: 2026-07-24 09:35:00
pageClass: blog-page-class
cover: /covers/react.svg
---

React 的 `<></>` 叫 Fragment，原生的 `document.createDocumentFragment()` 也叫 Fragment。它们都"不生成 DOM 节点"，也都说"一次性挂载"。那它们到底是不是一个东西？这篇文章来彻底分清楚。

## 先看两个使用场景 ##

### 场景一：原生 JS 中的 DocumentFragment ###

```js
const data = ["任务一", "任务二", "任务三"];
const oList = document.querySelector('#list');

// 逐个插入 — 每次 appendChild 都触发浏览器重排
for (const task of data) {
    const item = document.createElement('li');
    item.innerText = task;
    oList.appendChild(item);  // 3 次 = 3 次重排
}
```

换成 DocumentFragment：

```js
const fragment = document.createDocumentFragment();

for (const task of data) {
    const item = document.createElement('li');
    item.innerText = task;
    fragment.appendChild(item);  // 内存操作，不触发重排
}
oList.appendChild(fragment);     // 一次性挂载，只触发 1 次重排
```

### 场景二：React JSX 中的 Fragment ###

```jsx
function App() {
    return (
        <>
            <h1>Hello</h1>
            <p>World</p>
        </>
    );
}
```

两个场景里看到了相似的名字和相似的概念——"批量操作"、"不产生实体"。但它们是同一个东西吗？

## 原生 DocumentFragment：浏览器的批量操作工具 ##

### 它解决什么问题 ###

浏览器每次操作真实 DOM 都要付出代价——重新计算布局（Layout）、重新绘制（Paint）。逐个插入 3 个 `<li>`，浏览器重排 3 次。100 个就是 100 次。

`document.createDocumentFragment()` 的思路很简单：先在内存里攒着，攒完了再一次性丢到页面上。

```js
逐个插入：                        批量插入：
appendChild(li1) → 重排①          fragment.appendChild(li1)  ← 内存操作
appendChild(li2) → 重排②          fragment.appendChild(li2)  ← 内存操作
appendChild(li3) → 重排③          fragment.appendChild(li3)  ← 内存操作
                                  oList.appendChild(fragment) → 重排①（就一次）
```

### 工作机制 ###

`document.createDocumentFragment()` 创建一个内存中的临时容器。这个容器不在 DOM 树上，往里面添加子节点是纯粹的内存操作，浏览器完全不管。等到 `appendChild(fragment)` 时，所有子节点被一次性转移到真实 DOM 中，fragment 自己则消失。

> DocumentFragment = 临时搬运工：货物在仓库码好，一趟搬完。

## React Fragment（`<></>`）：解决一个完全不同的问题 ##

### 它解决什么问题 ###

React 组件的 `return` 只能返回一个根元素：

```jsx
// ❌ JSX 要求单一根元素，这样写不合法
function App() {
    return (
        <p>当前计数{count}</p>
        <button onClick={addCount}>+3</button>
    );
}
```

通常做法是套一个 `<div>`：

```jsx
function App() {
    return (
        <div>  {/* 这个 <div> 纯粹是为了满足 JSX 语法，没有任何语义意义 */}
            <p>当前计数{count}</p>
            <button onClick={addCount}>+3</button>
        </div>
    );
}
```

但这个 `<div>` 会带来一系列问题：

- 破坏 CSS 布局：如果父元素是 `flex` 容器，多一层 `<div>` 意味着 `flex` 的直接子元素变了，布局可能完全错乱
- 破坏 HTML 语义：`<table>` 里不能夹 `<div>`，`<ul>` 的直接子元素必须是 `<li>`
- DOM 层级冗余：每个无意义的 `<div>` 都是浏览器要维护的一个节点，多了就慢

Fragment 就是这里的最佳答案——一个"透明的括号"，满足 JSX 语法要求，但不产生任何 DOM 节点。

### React Fragment 的内部原理 ###

你写的 `<></>` 在 React 内部被处理成一个特殊的 Symbol：

```js
// React 源码中 Fragment 就是这行
const Fragment = Symbol.for('react.fragment');
```

React 在将虚拟 DOM 渲染为真实 DOM 时，遇到这个 Symbol 就直接跳过，把它的 children 挂到父节点上：

```txt
渲染前（虚拟 DOM）：              渲染后（真实 DOM）：
<div>                            <div>
  <>                               <p>当前计数0</p>
    <p>当前计数0</p>      →         <button>+3</button>
    <button>+3</button>          </div>
  </>
</div>
```

Fragment 在中间彻底消失了。

### 两种写法 ###

```jsx
import { Fragment } from 'react';

// 短语法 — 日常使用
<>
    <A />
    <B />
</>

// 完整语法 — 需要 key 的场景（如 map 中）
items.map(item => (
    <Fragment key={item.id}>
        <dt>{item.term}</dt>
        <dd>{item.description}</dd>
    </Fragment>
))
```

短语法和完整语法的唯一区别：短语法不能接受任何属性（key、ref 等）。

## 核心对比 ##

|  | React Fragment（`<></>`） | DocumentFragment |
| :--- | :--- | :--- |
| 属于谁 | React 组件体系 | 浏览器原生 DOM API |
| 怎么创建 | `<>...</>` 或 `<Fragment>` | `document.createElement(Fragment())` |
| 解决什么问题 | JSX 需要单一根节点，但不想多套 `<div>` | 多次 DOM 操作导致多次重排，想批量处理 |
| 问题的维度 | 语义 / 布局 — 保持 DOM 树干净 | 性能 — 减少浏览器 Layout/Paint 次数 |
| 在哪工作 | React 虚拟 DOM 层 | 浏览器真实 DOM 层 |
| 最终产生 DOM 吗 | ❌ 不产生 | ❌ 不产生（子节点转移后自己消失） |
| 性能收益 | 微小（减少 DOM 节点数） | 显著（避免多次重排） |

### 它们唯一的共同点 ###

都像"透明的容器"——自己在最终的 DOM 树中不留痕迹，子节点直接归父节点所有。

但原因完全不同：

- DocumentFragment 消失 → 浏览器规范规定 `appendChild(fragment)` 只转移子节点，丢弃 fragment 自身
- React Fragment 消失 → React 渲染时遇到 `Symbol(react.fragment)` 就直接跳过

## 一个关键认识 ##

> DocumentFragment 是浏览器提供的性能工具。React Fragment 是 React 提供的语义工具。它们名字一样，概念相似，但解决的是两个完全不同的问题。

你不需要在 React 里用 `DocumentFragment`——React 的虚拟 DOM diff 和批处理机制已经帮你做了批量更新的事。你也不需要指望 React Fragment 能带来多少性能提升——它真正的价值是让你的 DOM 结构保持干净、语义正确、布局不受干扰。
