---
lastUpdated: true
commentabled: true
recommended: true
title: requestAnimationFrame 深度解析
description: requestAnimationFrame 深度解析
date: 2025-10-28 09:35:00 
pageClass: blog-page-class
cover: /covers/css.svg
---

## 基本概念和使用方法 ##

### 什么是 requestAnimationFrame？ ###

`requestAnimationFrame`（简称 rAF）是浏览器提供的专门用于动画执行的 API，它会在浏览器下一次重绘之前调用指定的回调函数。

### 基本语法 ###

```js
// 请求动画帧
const requestId = requestAnimationFrame(callback);

// 取消动画帧
cancelAnimationFrame(requestId);
```

### 基础使用示例 ###

```js
// 简单的动画示例
function animate() {
  const element = document.getElementById('animated-element');
  let position = 0;
  
  function step(timestamp) {
    // timestamp 是回调函数接收的时间戳，表示当前时间
    position += 5;
    element.style.transform = `translateX(${position}px)`;
    
    // 继续下一帧动画
    if (position < 400) {
      requestAnimationFrame(step);
    }
  }
  
  // 启动动画
  requestAnimationFrame(step);
}

animate();
```

## 核心原理深度解析 ##

### 浏览器渲染流程与 rAF 的时机 ###

```txt
[浏览器一帧的生命周期]
┌─────────────────┬─────────────────┬─────────────────┐
│   JavaScript    │     Style       │    Layout       │
│   执行任务       │    计算样式     │    布局计算      │
├─────────────────┼─────────────────┼─────────────────┤
│    Paint        │   Composite     │                 │
│    绘制         │    合成         │                 │
└─────────────────┴─────────────────┴─────────────────┘
         │
         ▼
┌─────────────────┐
│ requestAnimation │ ← rAF 回调在此执行
│ Frame 回调执行    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   下一帧 VSync   │ ← 垂直同步信号，通常60Hz(16.67ms)
└─────────────────┘
```

### rAF 工作流程详解 ###

```js
// 1. rAF 将回调加入"动画帧请求回调函数列表"
function startAnimation() {
  requestAnimationFrame(animationFrame);
}

// 2. 浏览器在渲染前会遍历并执行所有 rAF 回调
function animationFrame(timestamp) {
  // timestamp: 从页面加载到当前帧开始的时间（毫秒）
  updateAnimationLogic(timestamp);
  
  // 3. 如果需要继续动画，再次请求下一帧
  if (shouldContinue) {
    requestAnimationFrame(animationFrame);
  }
}
```

## 与传统定时器的对比 ##

### setTimeout/setInterval 的问题 ###

```js
// ❌ 传统方式 - 可能的问题
function animateWithTimeout() {
  const element = document.getElementById('box');
  let position = 0;
  
  function step() {
    position += 5;
    element.style.transform = `translateX(${position}px)`;
    
    if (position < 400) {
      setTimeout(step, 16); // 试图模拟60fps
    }
  }
  
  step();
}
```

**传统定时器的问题**：

- 执行时机不确定，可能在繁忙时被延迟
- 即使页面不可见也会继续执行，浪费资源
- 无法与屏幕刷新率同步，可能导致掉帧

### rAF 的优势 ###

```js
// ✅ rAF 方式 - 推荐的动画实践
function animateWithRAF() {
  const element = document.getElementById('box');
  let position = 0;
  let lastTimestamp = 0;
  
  function step(timestamp) {
    // 基于时间差计算移动距离，保证动画速度一致
    if (lastTimestamp) {
      const delta = timestamp - lastTimestamp;
      position += (delta / 16.67) * 5; // 标准化到60fps
    }
    
    lastTimestamp = timestamp;
    element.style.transform = `translateX(${position}px)`;
    
    if (position < 400) {
      requestAnimationFrame(step);
    }
  }
  
  requestAnimationFrame(step);
}
```

## 高级用法和最佳实践 ##

### 基于时间的动画 ###

```ts
class AnimationController {
  constructor() {
    this.isAnimating = false;
    this.startTime = null;
    this.duration = 2000; // 动画时长2秒
  }
  
  start() {
    this.isAnimating = true;
    this.startTime = null;
    requestAnimationFrame(this.animate.bind(this));
  }
  
  animate(timestamp) {
    if (!this.startTime) this.startTime = timestamp;
    
    const elapsed = timestamp - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    
    // 更新动画状态
    this.update(progress);
    
    if (progress < 1) {
      requestAnimationFrame(this.animate.bind(this));
    } else {
      this.isAnimating = false;
      this.onComplete();
    }
  }
  
  update(progress) {
    // 具体的动画逻辑
    const element = document.getElementById('animated');
    element.style.opacity = progress;
    element.style.transform = `scale(${1 + progress * 0.5})`;
  }
  
  onComplete() {
    console.log('动画完成');
  }
}
```

### 性能监控和帧率控制 ###

```ts
class PerformanceMonitor {
  constructor() {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 0;
  }
  
  start() {
    this.monitor();
  }
  
  monitor() {
    this.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      console.log(`当前FPS: ${this.fps}`);
      
      // 帧率过低警告
      if (this.fps < 30) {
        console.warn('帧率过低，可能存在性能问题');
      }
    }
    
    requestAnimationFrame(() => this.monitor());
  }
}
```

### 批量 DOM 操作 ###

```ts
class BatchDOMUpdater {
  constructor() {
    this.updates = [];
    this.scheduled = false;
  }
  
  queueUpdate(element, property, value) {
    this.updates.push({ element, property, value });
    
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => this.processUpdates());
    }
  }
  
  processUpdates() {
    // 在单次重排中处理所有更新
    while (this.updates.length) {
      const { element, property, value } = this.updates.shift();
      element.style[property] = value;
    }
    
    this.scheduled = false;
  }
}

// 使用示例
const updater = new BatchDOMUpdater();
elements.forEach(element => {
  updater.queueUpdate(element, 'transform', 'translateX(100px)');
});
```

## 实际应用场景 ##

### 滚动动画 ###

```ts
class ScrollAnimator {
  constructor() {
    this.lastScrollY = 0;
    this.ticking = false;
    
    window.addEventListener('scroll', () => {
      this.lastScrollY = window.scrollY;
      
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.update();
          this.ticking = false;
        });
        this.ticking = true;
      }
    });
  }
  
  update() {
    // 基于滚动位置执行动画
    const parallaxElements = document.querySelectorAll('.parallax');
    parallaxElements.forEach(el => {
      const speed = el.dataset.speed || 0.5;
      el.style.transform = `translateY(${this.lastScrollY * speed}px)`;
    });
  }
}
```

### 游戏循环 ###

```ts
class GameEngine {
  constructor() {
    this.lastTime = 0;
    this.isRunning = false;
  }
  
  start() {
    this.isRunning = true;
    requestAnimationFrame((time) => this.gameLoop(time));
  }
  
  stop() {
    this.isRunning = false;
  }
  
  gameLoop(currentTime) {
    if (!this.isRunning) return;
    
    // 计算时间增量
    const deltaTime = currentTime - (this.lastTime || currentTime);
    this.lastTime = currentTime;
    
    // 更新游戏状态
    this.update(deltaTime);
    
    // 渲染
    this.render();
    
    // 继续下一帧
    requestAnimationFrame((time) => this.gameLoop(time));
  }
  
  update(deltaTime) {
    // 游戏逻辑更新
  }
  
  render() {
    // 渲染逻辑
  }
}
```

## 兼容性和 polyfill ##

```ts
// 简单的 rAF polyfill
(function() {
  let lastTime = 0;
  const vendors = ['ms', 'moz', 'webkit', 'o'];
  
  for (let i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
    window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[i] + 'CancelAnimationFrame'] || 
                                  window[vendors[i] + 'CancelRequestAnimationFrame'];
  }
  
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      const currTime = new Date().getTime();
      const timeToCall = Math.max(0, 16 - (currTime - lastTime));
      const id = window.setTimeout(function() {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
})();
```

`requestAnimationFrame` 是现代 Web 动画的基石，它的核心优势在于：

- 与浏览器渲染同步：自动匹配显示器的刷新率
- 智能节能：页面不可见时自动暂停
- 性能优化：浏览器可以批量处理动画更新
- 精确的时间控制：提供高精度时间戳
