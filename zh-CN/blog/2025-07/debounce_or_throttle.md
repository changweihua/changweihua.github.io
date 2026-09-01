---
lastUpdated: true
commentabled: true
recommended: true
title: 每天都在用的 debounce 和 throttle，其实 80% 的用法都错了
description: 每天都在用的 debounce 和 throttle，其实 80% 的用法都错了
date: 2025-07-23 16:25:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

> “我知道 debounce 是防抖，throttle 是节流，不就是 lodash 那两个方法吗？”

如果你也是这么理解的，那你可能已经在项目中踩了无数坑，而自己还浑然不觉。

防抖和节流的本质，从来就不只是“控制触发频率”这么简单。**真正的难点是：时机控制、副作用处理、与业务场景的契合度，以及在框架（React/Vue）中的正确姿势**。

这篇文章，我讲大白话，带你重新认识 debounce 和 throttle，并用多个真实场景告诉你：*大多数人用错的，不是函数，而是场景*。

## 防抖与节流的核心区别 ##

很多文章喜欢这么写：

- debounce（防抖）：*N 秒内只执行最后一次*
- throttle（节流）：*N 秒内最多执行一次*

这些话对，但不够用。我们换个工程师视角：

| 特性   |   debounce     |   throttle |  备注 |
| :----------: | :----------: | :---------: | :-------: |
| 触发控制 | 延迟触发，持续打断  | 定期触发，不受打断 |  |
| 场景强调 | 防止**过度触发** | 保证**持续响应** |  |
| 常用场景 | 输入框搜索、resize、scroll 结束  | 滚动监听、鼠标拖动、窗口 resize 实时更新 |  |

举个例子你就懂了：

- **防抖 debounce** 适合“**等你说完我再处理**”
  - 比如搜索框输入，不想每次敲字就请求 API。

- **节流 throttle** 适合“**我定时采集信息**”
  - 比如用户拖动地图时，定时获取当前中心点。

## 你真的写对 debounce 吗？ ##

这才是正确的 debounce： 

```js
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
```

但重点不是这段代码，而是下面这几点使用注意：

### ❌ 错误用法：在组件外部声明 debounce 函数 ###

```js
const search = debounce((val) => fetchData(val), 500);
<input onInput={(e) => search(e.target.value)} />
```

看起来很标准对吧？**❌错！**

如果你在 `React/Vue` 的组件中这么用，就会出现闭包引用过期、状态无法同步的问题。

### ✅ 正确用法：将 debounce 放入 `useCallback` / `onMounted` 中注册 ###


::: code-group

```js [React]
const search = useCallback(
  debounce((val) => fetchData(val), 500),
  []
);
```
```js [Vue]
setup() {
  const search = debounce((val) => fetchData(val), 500);
  return { search };
}
```
:::

## throttle 不能滥用，特别是在动画中 ##

看看下面这段代码：

```js
window.addEventListener('scroll', throttle(handleScroll, 100));
```

> 听起来好像挺对？但如果你在页面上实现动画或懒加载，用户滚动飞快时，内容根本来不及加载完。

为什么？**因为 throttle 会限制响应频率，导致 UI 不流畅**。

### 正确做法是——使用 `requestAnimationFrame` 替代 throttle ###

```js
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      handleScroll();
      ticking = false;
    });
    ticking = true;
  }
});
```

这种做法被称为 “基于帧节流”，更平滑，适合 UI 性能场景。

## 高级场景：你考虑过立即执行（leading）和延迟执行（trailing）吗？ ##

`lodash` 的 `debounce` 支持参数 `{ leading: true, trailing: false }`：

```js
const fn = debounce(() => console.log('run'), 1000, { leading: true });
```

**解释**：

- `leading: true`：第一次立刻执行
- `trailing: true`：结束后再执行一次

很多人默认 trailing=true，但在某些操作中，如“按钮点击防连点”，你应该只允许 **leading:true，trailing:false**。

```js
const handleClick = debounce(() => doSomething(), 2000, {
  leading: true,
  trailing: false
});
```

避免按钮在短时间内被连续触发，但第一下仍立即响应。

## 一次真实的业务踩坑：搜索接口请求丢失 ##

你是否遇到过这种问题：

- 输入很快时，搜索请求 A、B、C 同时触发
- 最后 C 请求慢，A 反而先回来了
- 页面结果却被 A 的结果覆盖了

> 这时候，你用 debounce 根本没用！

你需要的是：**请求去抖 + 响应乱序保护（防抖+防乱序）**

```js
let lastCallId = 0;

const search = debounce(async (val) => {
  const callId = ++lastCallId;
  const res = await fetchSearch(val);
  if (callId === lastCallId) {
    renderResult(res);
  }
}, 300);
```

## 自定义 debounce + 取消能力 ##

```js
function debounce(fn, delay) {
  let timer;
  const debounced = function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}
```

在 `React` 的 `useEffect` 清理中使用：

```js
useEffect(() => {
  const fn = debounce(doSearch, 300);
  fn();
  return () => fn.cancel();
}, [searchKey]);
```

避免组件销毁后还触发 debounce 的回调。

## 面试加分题：防抖/节流为什么容易产生内存泄漏？ ##

**答案**： 因为他们使用了闭包。如果你在组件中创建函数但不取消，计时器引用就会长期保留旧的 DOM 引用或变量状态。

**解决方法**：

- 尽量使用 `useCallback`、`useRef` 管理
- 提供 `.cancel()` 接口
- 在组件卸载时清理

## 😀不是用对了，而是用得刚好 ##

80% 的人使用 `debounce` 和 `throttle`，只满足了“不报错”的最低要求。

所以，再问你一次：

> 你是真的在用 debounce，还是只是在 copy 它？
