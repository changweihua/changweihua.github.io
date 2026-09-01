---
lastUpdated: true
commentabled: true
recommended: true
title: React 19 正式发布
description: 表单和服务器组件终于"原生"了
date: 2026-08-20 09:15:00
pageClass: blog-page-class
cover: /covers/react.svg
---

2024 年 12 月，React 19 正式登陆 npm。这是一次真正意义上的全栈升级——不仅有给 UI 开发者的新 Hook 和表单能力，还有面向框架作者的 React Server Components 稳定支持。

本文不堆砌升级指南，只聚焦一个核心问题：React 19 到底带来了什么值得你花时间学的新特性？

## Actions：表单提交终于不用自己写 pending 了 ##

React 19 最核心的改动是引入了 Actions 这个概念。

它的背景很真实：用户提交一个表单 → 发 API 请求 → 等待响应 → 处理错误或跳转。过去这一切都需要开发者手动写 `isPending`、`setError`、`setIsPending` 三件套。

```tsx
// React 18：手动管理 pending 和错误
function UpdateName() {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    setIsPending(true);  // 手动设置 pending
    const error = await updateName(name);
    setIsPending(false); // 手动重置
    if (error) { setError(error); return; }
    redirect("/path");
  };

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={handleSubmit} disabled={isPending}>Update</button>
      {error && <p>{error}</p>}
    </div>
  );
}
```

Actions 的做法：把异步逻辑包进 `startTransition`，React 自动帮你处理 `pending` 状态。

```tsx
// React 19：Actions 自动处理 pending + 错误
function UpdateName() {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const error = await updateName(name);
      if (error) { setError(error); return; }
      redirect("/path");
    });
  };

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={handleSubmit} disabled={isPending}>Update</button>
      {error && <p>{error}</p>}
    </div>
  );
}
```

`isPending` 会自动跟随 `transition` 的状态变化，不需要手动 `setIsPending`。

## useActionState：连错误处理都包装好了 ##

useActionState 是 Actions 的进一步封装，把最常见的"提交 → 等待 → 结果"模式再简化一层：

```tsx
const [error, submitAction, isPending] = useActionState(
  async (previousState, formData) => {
    const error = await updateName(formData.get("name"));
    if (error) return error;  // 返回 error
    redirect("/path");
    return null;              // 成功返回 null
  },
  null,  // 初始状态
);
```

用法非常直觉：`submitAction` 就是你要调用的函数，`error` 是上次调用的结果，`isPending` 是自动管理的加载状态。

## useOptimistic：乐观更新终于有官方方案了 ##

"乐观更新"指的是：用户操作后立即显示预期结果，不用等服务器返回。比如点赞、发帖、修改用户名，都适合用这个模式。

```tsx
function ChangeName({ currentName, onUpdateName }) {
  // 乐观 name：立即渲染，请求完成前显示用户预期的值
  const [optimisticName, setOptimisticName] = useOptimistic(currentName);

  const submitAction = async (formData) => {
    const newName = formData.get("name");
    setOptimisticName(newName);  // 立即更新 UI
    const updatedName = await updateName(newName);
    onUpdateName(updatedName);   // 服务器返回后自动切回真实值
  };

  return (
    <form action={submitAction}>
      <p>你的名字是：{optimisticName}</p>
      <input type="text" name="name" disabled={currentName !== optimisticName} />
    </form>
  );
}
```

如果请求失败或超时，React 会自动回滚到 currentName，不需要手动处理。

## `<form>` Actions：表单提交进入"声明式"时代 ##

React 19 的 `react-dom` 新增了对 `<form>` 的原生支持，可以直接传一个函数给 action：

```tsx
function App() {
  const submitAction = async (formData) => {
    "use server";  // 这个函数会在服务器端执行
    await saveName(formData.get("name"));
  };

  return (
    <form action={submitAction}>
      <input type="text" name="name" />
      <button type="submit">提交</button>
    </form>
  );
}
```

提交成功后，React 会自动重置表单。如果需要手动重置，调用 `requestFormReset()` API 即可。

## use：比 useContext 更灵活的资源读取方式 ##

React 19 引入了全新 API use，它可以有条件地读取 `Promise` 和 `Context`：

### 读取 Promise（配合 Suspense） ###

```tsx
import { use, Suspense } from 'react';

function Comments({ commentsPromise }) {
  const comments = use(commentsPromise);  // 挂起直到 resolved
  return comments.map(c => <p key={c.id}>{c.text}</p>);
}

function Page({ commentsPromise }) {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <Comments commentsPromise={commentsPromise} />
    </Suspense>
  );
}
```

### 读取 Context（支持 early return） ###

`useContext` 的痛点是不能在条件语句后调用，`use` 解决了这个问题：

```tsx
import { use } from 'react';
import ThemeContext from './ThemeContext';

function Heading({ children }) {
  if (children == null) return null;  // early return 了？
  const theme = use(ThemeContext);     // 照样能用 use
  return <h1 style={{ color: theme.color }}>{children}</h1>;
}
```

> 注意：`use` 不支持在 render 内部直接创建 Promise（会导致哨兵错误），需要从 Suspense 友好的框架或库获取已缓存的 Promise。

## React Server Components：稳定支持，生产可用 ##

React 19 包含了完整的 React Server Components（RSC） 能力，意味着：

- 组件可以在服务器端运行一次（CI 构建时或每次请求时）
- 服务器组件有零 bundle 体积（不会打到客户端 JS 里）
- 可以直接在组件里 `await` 数据获取

```jsx
// Server Component（服务器组件，默认支持）
async function ArticleList() {
  const articles = await db.query('SELECT * FROM articles');
  return (
    <ul>
      {articles.map(a => <li key={a.id}>{a.title}</li>)}
    </ul>
  );
}
```

配合 Server Actions（用 `"use server"` 标记的异步函数），可以做到从 Client Component 调用服务器端逻辑：

```js
// 客户端调用服务器端函数，全程类型安全
async function updateName(name: string) {
  "use server";
  await db.update({ name });
}
```

## 其他值得注意的改进 ##

| 改进 | 说明 |
| :--- | :--- |
| **ref作为prop** | 新版函数组件可以直接接收 `ref` 作为 prop，不再需要 `forwardRef`，未来会废弃 `forwardRef` |
| `<Context>` 作为provider | `<Context.Provider>` 可以直接写成 `<Context value={...}>`，旧的写法未废弃 |
| **ref回调支持清理函数** | `ref` 回调可以返回清理函数，元素从 DOM 移除时自动调用 |
| **Hydration错误更详细** | 报错信息直接显示服务器和客户端的 diff，不用再猜哪个出了问题 |
| **新的静态生成API** | `prerender / prerenderToNodeStream` 改进静态站点生成，SSR性能更好 |

## React 19.2（2025年10月）更新速览 ##

React 19.2 在 19 基础上新增了两个实验性功能：

- Activity：类似 React 的"活动状态"追踪，适合实时协作类应用
- React Performance Tracks：新的性能监控 API，帮助开发者精确分析组件渲染性能

这两个功能目前仍处于实验阶段，正式稳定支持尚需时间。

## 总结：React 19 解决了什么问题 ##

React 19 的核心改进可以归结为两条线：

*客户端*：让表单、乐观更新、pending 状态这些常见模式开箱即用，不再需要 Copy/Paste 一堆样板代码。

*全栈*：Server Components + Server Actions 让前后端边界更清晰，同一个函数可以运行在服务器，返回结果给客户端，全程类型安全。

如果你的团队正在用 Next.js 14+ 或其他支持 RSC 的框架，React 19 的价值会非常明显。如果是纯客户端 React App，Actions + useOptimistic 也足以让表单开发体验提升一个档次。
