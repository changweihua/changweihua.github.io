---
lastUpdated: true
commentabled: true
recommended: true
title: 🛋️ requestIdleCallback
description: 把非关键任务塞进浏览器的"空闲时间"，告别卡顿
date: 2026-09-29 09:35:00
pageClass: blog-page-class
cover: /covers/springboot.svg
---


## 问题场景 ##

页面里总有一些*低优先级、但很耗*的任务：

- 埋点上报、日志收集
- 大数据列表的懒渲染/预计算
- 图片懒加载的"提前预取"
- 图表内部数据的聚合分析
- 编辑器的语法高亮、格式化

如果这些任务在*用户交互的关键帧*里执行，就会和渲染抢主线程，造成*输入延迟、掉帧、滚动卡顿*，体验直线下降。

> 典型痛点：你用了 `setTimeout(heavyTask, 0)` 想把任务"延后"，但 `setTimeout` 只是排队，到点了*必须执行*，碰上正在渲染的关键帧照样卡。

## 原因分析 ##

浏览器主线程是单线程，要同时处理：JS 执行、布局（Layout）、绘制（Paint）、合成（Composite）、处理事件。*没有什么是"免费的"*——每段 JS 都占用主线程。

`setTimeout` / `requestAnimationFrame` 都是"到点就执行"，没法感知"现在主线程忙不忙"。于是 js 任务一多就堆在某帧里，掉帧卡成 PPT。

`requestIdleCallback` 则不同：它让浏览器在每一帧的末尾，如果还有剩余时间（`deadline.timeRemaining()`）才执行你的回调，主线程忙时就自动推迟，绝不抢关键渲染。

## 解决方案 ##

### 基本用法 ###

```js
requestIdleCallback((deadline) => {
  // deadline.timeRemaining() 返回当前帧剩余空闲毫秒数
  console.log('空闲了，剩余时间：', deadline.timeRemaining());
  // 在这里做不紧急的任务
  doHeavyBackgroundWork();
}, { timeout: 2000 });
{ timeout: 2000 }：最大等待 2s，超时后即使不空闲也必须执行（兜底，防止任务被无限推迟饿死）。
```

### 大任务切分：用 `timeRemaining` 分片（提升对） ###

`timeRemaining()` 是性能关键——你要边查边干，剩的时间不够就主动让出，下一帧再接着来：

```js
function processInChunks(items, callback) {
  let i = 0;
  function workLoop(deadline) {
    while (i < items.length && deadline.timeRemaining() > 5) {
      callback(items[i]);   // 处理一个
      i++;
    }
    if (i < items.length) {
      requestIdleCallback(workLoop);   // 没干完，下个空闲期继续
    }
  }
  requestIdleCallback(workLoop);
}

processInChunks(rows, row => renderRow(row));
```

这样每个空闲片段只干一点点，主线程永远不被长时间霸占，交互帧丝滑。

### 真·对：测量并缓存"每帧能跑多少" ###

```js
function safeLoop(items, fn, budgetMs = 10) {
  let i = 0;
  function run(deadline) {
    while (i < items.length && deadline.timeRemaining() > budgetMs) {
      fn(items[i++]);
    }
    i < items.length ? requestIdleCallback(run) : done();
  }
  requestIdleCallback(run);
}
```

`budgetMs` 控制"一帧最多干多少"，越大越敢跑，越小越保守（对滚动更友好）。

### 兼容性与降级 ###

`requestIdleCallback` 在 Safari 支持较晚（15.4+），老浏览器要降级：

```js
const ric = window.requestIdleCallback
  ? (cb, opt) => window.requestIdleCallback(cb, opt)
  : (cb) => setTimeout(() => cb({ timeRemaining: () => 50 }), 1);
```

## 要点总结 ##

- `requestIdleCallback` 让浏览器在每帧剩余空闲时间执行回调，主线程忙时自动延后，不抢关键渲染。
- 必须在回调里用 `deadline.timeRemaining()` 判断余量，主动分片/让出，否则等于没优化。
- 配合 `{ timeout }` 兜底，防止低优先级任务被无限推迟（饿死）。

*适合*：埋点上报、非关键 DOM 预计算、大数据懒渲染等可推迟任务。

*不适合*：`requestAnimationFrame` 动画、用户输入响应、必须立刻执行的逻辑——那些用 `rAF` / 直接同步执行。

*兼容*：现代浏览器好用；Safari 15.4+，老浏览器记得降级到 `setTimeout`。

*关键帧期间慎用*：rec 的任务若在渲染关键路径，仍可能造成提交延迟，量大的活最好切小分片。

> 一句话：`requestIdleCallback` 是"削峰填谷"的调度器——把不紧急的活放到浏览器闲时做，让主线程永远有余力伺候用户交互。配合 `timeRemaining` 分片，是低优先级批量任务的性能救星。
