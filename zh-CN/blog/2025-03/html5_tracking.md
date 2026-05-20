---
lastUpdated: true
commentabled: true
recommended: true
title: 使用 IntersectionObserver 实现曝光埋点
description: 使用 IntersectionObserver 实现曝光埋点
date: 2025-03-07 10:00:00
pageClass: blog-page-class
---

# 使用 IntersectionObserver 实现曝光埋点 #

在 Web 开发中，我们经常需要埋点统计用户的行为，比如 元素曝光 统计，即某个元素在视口中可见并达到一定时间后触发上报。为了解决这一需求，我们可以使用 IntersectionObserver 监听元素的可见性，并结合 setTimeout 计算停留时间，确保符合条件后才触发上报。

## 需求分析 ##

我们的曝光埋点 SDK 需要满足以下需求：

- 监听多个元素的可见性
- 设定曝光阈值（元素可见面积的比例，比如 50% 才算曝光）
- 设定曝光时间（元素需要在视口内持续一段时间才触发上报）
- 动态解绑监听（防止内存泄漏）

```ts
class ExposureTracker {
  constructor({ threshold = 0.5, duration = 1000, callback } = {}) {
    this.threshold = threshold; // 触发曝光的可见比例
    this.duration = duration;   // 触发曝光的时间(ms)
    this.callback = callback;   // 曝光回调
    this.observedElements = new Map(); // 记录元素的曝光状态
    
    this.observer = new IntersectionObserver(this.handleIntersect.bind(this), {
      threshold: Array.from({ length: 10 }, (_, i) => (i + 1) / 10), // 0.1 ~ 1
    });
  }

  observe(element, data = {}) {
    if (!element) return;
    this.observedElements.set(element, { isVisible: false, timer: null, data });
    this.observer.observe(element);
  }

  unobserve(element) {
    if (this.observedElements.has(element)) {
      clearTimeout(this.observedElements.get(element).timer);
      this.observer.unobserve(element);
      this.observedElements.delete(element);
    }
  }

  handleIntersect(entries) {
    entries.forEach((entry) => {
      const { target, intersectionRatio } = entry;
      const record = this.observedElements.get(target);
      if (!record) return;
      
      const isVisible = intersectionRatio >= this.threshold;
      if (isVisible && !record.isVisible) {
        // 开始计时
        record.timer = setTimeout(() => {
          this.callback && this.callback(record.data);
          this.unobserve(target);
        }, this.duration);
      } else if (!isVisible && record.isVisible) {
        // 取消计时
        clearTimeout(record.timer);
      }
      
      record.isVisible = isVisible;
    });
  }
}

// 使用示例
const tracker = new ExposureTracker({
  threshold: 0.5,
  duration: 2000,
  callback: (data) => console.log('曝光上报:', data),
});

document.querySelectorAll('.track').forEach((el, index) => {
  tracker.observe(el, { id: index, message: `元素${index}曝光` });
});
```

## 代码解析 ##

### 使用 IntersectionObserver 监听元素的可见性 ###

- threshold 设定多个阈值，确保可以检测到不同的可见比例。
- 当 intersectionRatio 大于等于设定的 threshold 时，认为元素曝光。

### 使用 setTimeout 处理曝光时间 ###

- 只有当元素的可见比例满足 threshold，且持续 超过 duration 毫秒 后，才会触发回调。
- 如果元素在 duration 时间内消失，则取消计时，避免误报。

### 动态解绑，防止内存泄漏 ###

在元素曝光上报后，使用 unobserve 解除监听，避免对已曝光元素重复监听。

## 适用场景 ##

- 统计广告、Banner 是否被用户看到
- 统计文章或图片是否真正出现在用户视野中
- 结合 A/B 测试分析不同 UI 组件的可见度和转化率

## 总结 ##

通过 IntersectionObserver，我们可以高效地监听元素的可见性变化，并结合 setTimeout 控制曝光时间，构建一个轻量级的 曝光埋点 SDK。这样，我们既能避免传统 scroll 监听带来的性能问题，又能精确统计元素的曝光情况。

希望这篇文章能帮助你更好地理解 IntersectionObserver 并应用到实际项目中！
