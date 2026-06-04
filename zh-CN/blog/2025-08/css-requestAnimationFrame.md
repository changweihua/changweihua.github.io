---
lastUpdated: true
commentabled: true
recommended: true
title: 深入理解 requestAnimationFrame：打造高效流畅的前端动画
description: 深入理解 requestAnimationFrame：打造高效流畅的前端动画
date: 2025-08-06 13:45:00  
pageClass: blog-page-class
cover: /covers/css.svg
---

在现代Web开发中，实现动画效果的方式多种多样。除了传统的 `setTimeout` 和 `setInterval` 方法外，CSS3 的 `transition` 和 `animation` 也提供了强大的动画支持。然而，HTML5 引入了一个专门用于优化动画性能的 API —— `requestAnimationFrame`（简称 rAF），它能够帮助我们创建更加平滑、高效的动画体验。

本文将详细介绍 `requestAnimationFrame` 的工作原理、优势以及如何使用它来替代传统的定时器方法实现更佳的动画效果。

## 📌 一、基本概念与语法 ##

### ✅ 定义 ###

`window.requestAnimationFrame()` 是一个用于请求浏览器在下一次重绘之前调用指定回调函数的方法。这意味着我们可以利用这个API来实现基于帧率的动画，而不需要担心定时器的延迟或丢帧问题。

### ✅ 语法 ###

```ts
let animationId = window.requestAnimationFrame(callback);
```

- `callback`：你希望在下次重绘之前执行的函数，该函数接收一个参数 `DOMHighResTimeStamp`，表示当前回调函数被触发的时间戳。
- 返回值 `animationId`：可以用来取消本次动画请求。

### ✅ 取消动画 ###

使用 `cancelAnimationFrame(animationId)` 来取消一个已经启动的动画。

## 🧩 二、`requestAnimationFrame` vs `setTimeout/setInterval` ##

### `setTimeout/setInterval` 实现动画的问题 ###

**❌ 缺点**

- **卡顿与抖动**：由于定时器并非精确地按照设定时间间隔执行，尤其是在页面负载较高的情况下，容易导致动画不流畅。
- **资源浪费**：即使页面不可见（如最小化窗口），定时器仍然会继续运行，消耗不必要的CPU资源。
- **丢帧现象**：显示器通常以固定的刷新率（如60Hz）更新屏幕内容，而定时器的执行频率可能与其不同步，导致动画过程中出现丢帧。

**示例代码**

```javascript
function animate() {
    // 动画逻辑
    setTimeout(animate, 1000 / 60); // 尝试每秒60帧
}
animate();
```

### `requestAnimationFrame` 的优势 ###

**✅ CPU节能**

当页面处于后台或不可见状态时，`requestAnimationFrame` 会自动暂停执行，避免了不必要的计算和渲染，从而节省了宝贵的CPU资源。

**✅ 函数节流**

对于高频率事件（如 `resize`, `scroll`），`requestAnimationFrame` 能确保每个刷新周期内只执行一次回调，防止过多无效的重复操作。

**✅ 集中DOM操作**

`requestAnimationFrame` 可以批量处理DOM操作，在每次重绘前一次性完成所有必要的DOM更新，减少了多次重绘或回流带来的性能开销。

## 💡 三、实战应用案例 ##

### 基本动画示例 ###

下面是一个简单的移动方块的例子，展示了如何使用 `requestAnimationFrame` 创建动画：

```javascript
let start = null;
const element = document.getElementById('animated');
element.style.position = 'absolute';

function step(timestamp) {
  if (!start) start = timestamp;
  const progress = timestamp - start;
  element.style.left = Math.min(progress / 10, 200) + 'px';
  if (progress < 2000) { // 继续动画直到2秒
    requestAnimationFrame(step);
  }
}

requestAnimationFrame(step);
```

### 结合其他功能 ###

#### 监听窗口大小变化 ####

```javascript
function resizeHandler() {
    requestAnimationFrame(() => {
        console.log('Window resized and processed during next repaint.');
    });
}

window.addEventListener('resize', resizeHandler);
```

#### 滚动事件优化 ####

```javascript
let lastScrollTime = 0;

function scrollHandler() {
    let now = performance.now();
    if (now - lastScrollTime > 100) { // 控制滚动事件触发频率
        requestAnimationFrame(() => {
            console.log('Processing scroll event...');
            lastScrollTime = now;
        });
    }
}

window.addEventListener('scroll', scrollHandler);
```

## 🧠 四、兼容性处理 ##

尽管大多数现代浏览器都支持 `requestAnimationFrame`，但在某些旧版浏览器中可能需要添加 `polyfill`：

```javascript
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
        return window.setTimeout(callback, 1000 / 60);
    };
}

if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
}
```

## 📈 五、总结 ##

| 对比维度  |  `setTimeout/setInterval`  |  `requestAnimationFrame`  |
| :-------: | :---------: | :--------: |
| 精确度 | 不固定，依赖于系统调度 | 与屏幕刷新率同步 |
| 性能 | 可能导致频繁重绘/回流 | 批量处理DOM操作，减少重绘次数 |
| 资源管理 | 页面不可见时仍持续运行 | 自动暂停，节省CPU |
| 兼容性 | 广泛支持 | 需要 `Polyfill` 处理旧版浏览器 |



























对比维度setTimeout/setIntervalrequestAnimationFrame精确度不固定，依赖于系统调度与屏幕刷新率同步性能可能导致频繁重绘/回流批量处理DOM操作，减少重绘次数资源管理页面不可见时仍持续运行自动暂停，节省CPU兼容性广泛支持需要Polyfill处理旧版浏览器

作者：LuckySusu
链接：https://juejin.cn/post/7517918009472090146
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
