---
lastUpdated: true
commentabled: true
recommended: true
title: 网页中如何判断用户是否处于闲置状态
description: 网页中如何判断用户是否处于闲置状态
date: 2025-12-24 11:00:00 
pageClass: blog-page-class
cover: /covers/css.svg
---

最近在项目中遇到一个需求：需要监控用户是否开着页面但是没有操作，或者开了页面但已经离开电脑，发现了浏览器原生提供了专有的 `API: IdleDetector`（空闲检测器）。当然我们也可以自行实现，我们分别来聊聊这两种方式：

## 什么是 IdleDetector？ ##

`IdleDetector` 是浏览器提供的一个实验性 `API`，用于检测用户的闲置状态。它可以监控以下两种状态：

- 用户状态（`user`）：用户是否在电脑前（通过键盘、鼠标等交互判断）。
- 屏幕状态（`screen`）：屏幕是否被锁定（例如屏幕保护程序启动或电脑休眠）。

目前，`IdleDetector` 在 `Chrome 94+` 、`Edge 94+` 中都支持，`Firefox` 和 `Safari` 尚未支持。但是 `IdleDetector` 仍为实验性 API，未来可能有变化，且在 `非HTTPS` 环境下无法使用。

### 底层原理 ###

`IdleDetector` 通过浏览器底层机制检测用户和屏幕状态，开发者只需设置阈值并监听状态变化即可。`API` 会根据用户交互和系统状态自动判断是否进入闲置。

### 使用要注意 ###

`IdleDetector` 需要用户授权，权限请求可通过以下两种方式触发：

- 显式请求：调用 `IdleDetector.requestPermission()`，需在用户手势（如点击）中触发。
- 隐式请求：直接调用 `detector.start()`，浏览器会自动弹出权限提示。

如果正确被调用会有这样的提示：

**参考以下实现来调用**

```js
async function startIdleDetection(threshold = 60000) {
  if (!window.IdleDetector) {
    console.error('浏览器不支持 IdleDetector API');
    return { success: false, error: 'API_NOT_SUPPORTED' };
  }
  try {
    // 至少要60秒, 任何小于 60 秒的设置会导致 start() 抛出 DOMException
    const validatedThreshold = Math.max(threshold, 60000);
    const state = await IdleDetector.requestPermission();
    if (state !== 'granted') {
      console.error('用户拒绝了空闲检测权限');
      return { success: false, error: 'PERMISSION_DENIED' };
    }
    const detector = new IdleDetector();
    // 添加更健壮的事件处理
    const handleStateChange = () => {
      const now = new Date().toISOString();
      console.log(`[${now}] 用户状态: ${detector.userState}, 屏幕状态: ${detector.screenState}`);
      // 实际业务逻辑可以在这里添加
      if (detector.userState === 'idle') {
        // 用户闲置处理
      }
    };
    detector.addEventListener('change', handleStateChange);
    // 添加错误处理
    detector.addEventListener('error', (err) => {
      console.error('检测器错误:', err);
    });
    await detector.start({ threshold: validatedThreshold });
    return { success: true, detector }; // 返回检测器实例以便后续控制
  } catch (err) {
    console.error('空闲检测初始化失败:', err);
    return { success: false, error: err.message };
  }
}

// 正确用法示例（必须在用户交互中调用）：
document.getElementById('startBtn').addEventListener('click', async () => {
  const result = await startIdleDetection(90000); // 90秒阈值
  if (!result.success) {
    // 处理失败情况
  }
});
```

如果用户拒绝了怎么办了？我们要有备选方案：

## 自行实现用户闲置检测 ##

通过监听一系列浏览器事件，判断用户是否处于活跃状态。核心事件包括：

- `visibilitychange`：检测页面是否可见（例如用户切换标签页或最小化窗口）。
- `mousemove` / `mousedown` / `keydown` / `touchstart` 等事件：检测用户是否与页面交互。
- `focus` / `blur` ：检测窗口是否获得焦点。

通过设置一个定时器，当用户超过一定时间未触发上述事件时，判定为闲置状态。

**示例代码**

```javascript
class IdleMonitor {
  constructor(idleTimeout = 60000) {
    this.idleTimeout = idleTimeout; // 闲置超时时间（毫秒）
    this.timer = null;
    this.isIdle = false;

    this.handleActivity = this.handleActivity.bind(this);
    this.checkIdle = this.checkIdle.bind(this);

    this.init();
  }

  init() {
    // 监听用户交互事件
    ['mousemove', 'mousedown', 'keydown', 'touchstart'].forEach(event => {
      window.addEventListener(event, this.handleActivity);
    });

    // 监听页面可见性
    document.addEventListener('visibilitychange', this.handleActivity);

    // 启动定时器
    this.startTimer();
  }

  handleActivity() {
    if (this.isIdle) {
      this.isIdle = false;
      console.log('用户恢复活跃');
    }
    this.startTimer();
  }

  startTimer() {
    clearTimeout(this.timer);
    this.timer = setTimeout(this.checkIdle, this.idleTimeout);
  }

  checkIdle() {
    this.isIdle = true;
    console.log('用户进入闲置状态');
  }

  destroy() {
    clearTimeout(this.timer);
    ['mousemove', 'mousedown', 'keydown', 'touchstart'].forEach(event => {
      window.removeEventListener(event, this.handleActivity);
    });
    document.removeEventListener('visibilitychange', this.handleActivity);
  }
}

// 使用示例
const monitor = new IdleMonitor(90000); // 90秒无操作进入闲置
```

这里只是举例，所以只用了点击、触摸、鼠标移动这些事件，实际上要监听的事件可能要更多一些,如 `scroll`、`wheel`、`touchmove`，也可以根据业务适当调整。但是对比原生的 `IdleDetector` 有一个弊端就是跨域的 `iframe` 中的无法监听到。跨域的 `iframe` 内的交互事件（如 `mousemove`、`keydown`）不会冒泡到父页面，但如果 `iframe` 和父页面同源，可以在 `iframe` 内部绑定事件监听并通过 `postMessage` 通知父页面。实际使用的时候也可以通过防抖或节流来优化频繁触发的事件比如 `mousemove` 降低性能开销。

## 总结 ##

浏览器为开发者检测用户是否空闲提供了实验性的 `API: IdleDetector`，但是需要比较新的浏览器并且需要用户显式授权，如果浏览器不支持或者用户拒绝了，我们也可以通过自行实现的方式来检测，只是有些许缺陷。
