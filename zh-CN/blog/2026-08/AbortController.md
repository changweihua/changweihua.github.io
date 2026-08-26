---
lastUpdated: true
commentabled: true
recommended: true
title: ✂️ AbortController
description: 一个 API 统一取消 fetch、事件监听与 AI 流式请求
date: 2026-08-26 09:15:00
pageClass: blog-page-class
cover: /covers/html5.svg
---

## 问题场景 ##

页面里经常需要"取消"一个进行中的异步操作：

- 用户点了一个慢请求，又点了另一个，*想让前一个作废（避免旧数据覆盖新数据）*。

- 搜索框防抖后，用户很快又输入——*要取消上一次未完成的搜索*。

- 组件卸载（切页面）时，*取消还没回来的请求，防止 setState to unmounted 警告*。

- AI 对话流式输出中，用户点"停止"——*要中断服务端生成*。

你可能会各写各的：`fetch` 手动忽略、监听用 removeEventListener、AI 请求干脆留着它跑完……结果一坨混乱、还浪费流量和 token。

> AbortController 就是为"取消"设计的统一标准 API——一个 controller，同时管 fetch、事件监听、流式读取。

## 原因分析 ##

fetch 和其他异步 API 需要一种"外部主动中止"的信号机制。早期方案五花八门（`XHR.abort()`、手动 flag 变量判断），不统一、难组合。

AbortController 提供标准化的信号（signal）传播：你创建一个 controller，拿到 signal，把它传给任何支持 signal 参数的 API；需要取消时调用 `controller.abort()`，所有绑定了这个 signal 的操作同时收到中止信号。

## 解决方案 ##

### 基础：取消 fetch（旧页面 vue 风格通用，这里以原生为例） ###

```ts
const controller = new AbortController();
const { signal } = controller;

fetch('/api/search?q=vue', { signal })
  .then(r => r.json())
  .then(data => render(data))
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('请求已被取消，忽略');
      return;   // 别把 abort 当错误弹给用户
    }
    throw err;
  });

// 需要取消时：
controller.abort();
```

关键点：捕获错误时必须判断 `err.name === 'AbortError'`，否则会把"主动取消"误当成网络错误报错。

### 核心痛点场景：旧请求作废（竞态保护） ###

```ts
let currentController = null;

async function search(keyword) {
  // 如果上一个请求还在，先取消它
  if (currentController) currentController.abort();

  currentController = new AbortController();
  try {
    const res = await fetch(`/api/search?q=${keyword}`, {
      signal: currentController.signal
    });
    render(await res.json());
  } catch (e) {
    if (e.name === 'AbortError') return; // 被新的搜索顶掉了，忽略
    showError(e);
  }
}
```

这样永远只有最后一次搜索的结果会渲染，快速输入时不再有"旧结果覆盖新结果"的闪屏。

### 取消事件监听（比 removeEventListener 更省心） ###

AbortController 也能管理事件监听——一个 controller 批量移除，不用记住每个 handler 引用：

```ts
const controller = new AbortController();
const { signal } = controller;

window.addEventListener('scroll', onScroll, { signal });
window.addEventListener('resize', onResize, { signal });

// 一键撤销所有监听：
controller.abort();
// 需要时再传 { once: true } 与 signal 组合
```

组件卸载时调用 `controller.abort()`，比手动 removeEventListener 逐个清理干净且不易漏。

### 取消流式读取（SSE / AI 对话） ###

对 AI 流式或 `response.body` 的读取，abort 能真正中断：

```ts
const controller = new AbortController();

async function chat(prompt) {
  const res = await fetch('/api/chat/stream', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
    signal: controller.signal      // 传入 signal
  });
  const reader = res.body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      appendChunk(new TextDecoder().decode(value));
    }
  } catch (e) {
    if (e.name === 'AbortError') console.log('用户停止了生成');
  }
}

// “停止”按钮：
document.querySelector('#stop').onclick = () => controller.abort();
```

服务端收到 TCP 断开/中止后会停止生成，还能帮你省 AI token——比"前端不管、让它在后台跑完"经济得多。

### 超时自动取消 ###

```ts
function fetchWithTimeout(url, ms = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timer));
}
```

## 要点总结 ##

- AbortController = 一个 controller + 一个 signal，`abort()` 统一中止所有绑定该 signal 的操作。
- catch 里判断 AbortError：把主动取消和真实报错分开，别把取消弹成错误。
- 竞态保护（搜索/请求覆盖）用"先 abort 旧的再发新的"，保证只渲染最后一次。
- 事件监听支持 `{ signal }`，`controller.abort()` 批量移除，告别逐个 removeEventListener。
- 流式读取（AI 对话/SSE）abort 能真正中断，省 token、省流量。
- 兼容性：现代浏览器全支持，XMLHttpRequest 老接口不适用（fetch 时代的标配）。
- 结合前端框架：组件卸载时在 useEffect/onUnmounted 里 abort，根治"setState on unmounted"警告。

> 一句话：AbortController 是前端异步世界的"统一取消键"——fetch、事件、流式一把梭。学会它，竞态、内存泄漏、浪费 token 这些老毛病一次根治。
