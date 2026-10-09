---
lastUpdated: true
commentabled: true
recommended: true
title: React项目白屏兜底神器
description: ErrorBounary你了解吗？
date: 2026-08-20 12:55:00
pageClass: blog-page-class
cover: /covers/react.svg
---

## 技术背景 ##

JavaScript 的错误会破坏 React 的内部状态，进而导致整个页面崩溃。为了解决这个问题，React 16 引入了错误边界（ErrorBounary），错误边界可以捕获子组件的 JavaScript 错误，打印这些错误并展示降级 UI。

*官方文档定义*：

默认情况下，如果你的应用程序在渲染过程中抛出错误，React 将从屏幕上删除其 UI。为了防止这种情况，你可以将 UI 的一部分包装到 错误边界 中。错误边界是一个特殊的组件，可让你显示一些后备 UI，而不是显示例如错误消息这样崩溃的部分。

要实现错误边界组件，你需要提供 `static getDerivedStateFromError`，它允许你更新状态以响应错误并向用户显示错误消息。你还可以选择实现 `componentDidCatch` 来添加一些额外的逻辑，例如将错误添加到分析服务。

*使用方式*：

可以使用已有的 JS库 `react-error-bounary` 替代自己实现

```bash
# npm
npm install react-error-boundary

# pnpm
pnpm add react-error-boundary

# yarn
yarn add react-error-boundary
```


```tsx
import { ErrorBoundary } from "react-error-boundary";

<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <ExampleApplication />
</ErrorBoundary>
```

*源码分析*：

```tsx
import * as React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    //构造函数初始化状态
    this.state = { hasError: false };
  }

  //这是一个静态生命周期方法，当子组件抛出错误时会被调用
  static getDerivedStateFromError(error) {
    // 更新状态，以便下一次渲染将显示后备 UI。
    return { hasError: true };
  }

  //在错误发生后调用，用于记录错误信息
  componentDidCatch(error, info) {
    logErrorToMyService(
      error,
      // 示例“组件堆栈”：
      // 在 ComponentThatThrows 中（由 App 创建）
      // 在 ErrorBoundary 中（由 APP 创建）
      // 在 div 中（由 APP 创建）
      // 在 App 中
      info.componentStack,
      // 警告：Owner Stack 在生产中不可用
      React.captureOwnerStack(),
    );
  }


  render() {
    if (this.state.hasError) {
      // 你可以渲染任何自定义后备 UI
            return (
        <div>
          <p>当前页面出错了，请联系Bone值班同学</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

*使用方式*

```tsx
<ErrorBoundary fallback={<p>Something went wrong</p>}>
  <Profile />
</ErrorBoundary>
```

## 影响范围&边界 ##

错误边界可捕获常见场景中的错误：

### 子组件内部错误 ###

```tsx
const ErrorUaughtComponent = () => {
  return (
    <div>
     //未定义变量CcConfig
      <h1>{CcConfig.length}</h1>
    </div>
  );
};
```

### 组件主动抛出错误 ###

```tsx
const ErrorComponent = () => {
  throw new Error('这是一个测试错误');
};
```

### 组件new一个错误（语法错误） ###

> 一个 React「函数组件」必须返回 ReactNode

```tsx
const ErrorNewtComponent = () => {
  return new Error('这是一个测试错误');
};
```

错误边界无法捕获以下场景中出现的错误：

### 它自身抛出来的错误（并非它的子组件） ###

```tsx
// 把错误边界自身写成会崩溃的组件
const BadBoundary = () => {
  throw new Error('BadBoundary 自己炸了');
};

const Demo1 = () => (
  <ErrorBoundary>
    <BadBoundary />
  </ErrorBoundary>
);
```

异步的错误（例如 `setTimeout` 或 `requestAnimationFrame` 回调函数，接口报错，`form.validateFields()`校验错误等）

```tsx
const ErrorComponent = () => {
  setTimeout(() => {
    throw new Error('这是一个测试错误');
  }, 1000);
};
```

### 事件中的错误 (错误边界无法捕获事件处理器内部的错误) ###

```tsx
const ErrorComponent = () => {
  const handleClick = () => {
    throw new Error('点击事件里的错误');
  };
  return <button onClick={handleClick}>点我报错</button>;
};
```

### 服务端渲染的错误（SSR渲染） ###

`console.error()` （只是打印错误信息到控制台，不会终止程序）

```tsx
const ErrorNewtComponent = () => {
 console.error('这只是一条日志，不会中断渲染');
};
```

目前已在在内部系统以页面维度、组件维度进行试用：

```tsx
const ErrorBoundaryWrapper: React.FC<ErrorBoundaryProps> = (
  props: ErrorBoundaryProps,
) => {
  const location = useLocation();
  const shouldEnableErrorBoundary =
    location.pathname.startsWith('/feature/index') ||
    location.pathname.startsWith('/featureDetails/index');

  if (!shouldEnableErrorBoundary) {
    return props.children;
  }
  return <ErrorBoundary {...props} />;
};
```

## 总结 ##

### ✅收益 ###

- 兜底白屏：React 18 以后，生产环境任何未被捕获的错误都会把整棵组件树卸载成“白屏”；全局 ErrorBoundary 可以把白屏变成降级 UI（如“系统开小差”）。
- 统一埋点：一次 catch 所有渲染阶段错误，便于 Sentry、阿里 ARMS、灯塔等监控平台统计。
- 渐进式降级：可以配合 `React.lazy`、Suspense，对局部模块再包一层 ErrorBoundary，形成“全局兜底 + 局部细粒度”两级策略。

### ⚠️ 需要注意的 6 件事 ###

| 场景 | 注意点 | 建议 |
| :--- | :--- | :--- |
| **事件处理器/异步代码** | ErrorBoundary 只能捕获渲染阶段错误；`onClick`、`setTimeout`、`Promise.reject` 不在其捕获范围。 | 考虑事件里手动 try/catch |
| **SSR** | 服务端渲染时，ErrorBoundary 抛出的错误如果不处理，Node 进程会 500。 | 在 SSR 入口也包含一层 ErrorBoundary，并返回 500 页面。 |
| **重复渲染** | 一旦进入 Error 状态，React 会卸载整棵树并显示 fallback；如果 fallback 本身又出错，会死循环。 | fallback 组件必须足够简单（纯静态 UI），不要依赖 props/context。 |
| **性能** | 全局 ErrorBoundary 会阻止整页重渲染，对交互密集型场景（如编辑器、画布）可能过度杀伤。 | 在路由级或业务模块级再包一层，做到“局部爆炸局部降级”。 |
| **错误信息泄露** | 生产环境不要把 `error.stack` 直接展示给用户，防止源码路径泄露。 | `fallback={error => <ErrorPage code={500}> message="系统繁忙" />}` |
| **热更新** | Vite/Webpack 热更新时抛错会被 ErrorBoundary 吞掉，导致看不到编译错误。 | 开发环境单独关掉全局 ErrorBoundary，或在 fallback 里加一个“刷新页面”按钮。 |

## 一句话总结 ##

全局 ErrorBoundary 是“保险丝”，不是“万能药”。

只要记住“只兜底渲染错误 + 保持 fallback 简单 + 异步错误手动补”这三点，就可以放心用。
