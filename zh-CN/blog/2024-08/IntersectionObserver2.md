---
lastUpdated: true
commentabled: true
recommended: true
title: IntersectionObserver API
description: IntersectionObserver API
date: 2024-08-26 10:18:00
pageClass: blog-page-class intersection-observer2-style
---

# IntersectionObserver API #

IntersectionObserver API 是现代浏览器提供的一种异步观察目标元素与祖先元素（或顶级文档视窗）交叉状态的方法。它可以用于实现懒加载图片、无限滚动、以及其他需要监听元素可见性的功能。本文将详细介绍 IntersectionObserver API 的使用方法，帮助你快速掌握这一实用工具。

## 基本概念 ##

在开始使用 IntersectionObserver 之前，我们需要了解几个基本概念：

- 目标元素（Target Element）：你想要观察的元素。
- 根元素（Root Element）：用来检测目标元素的可见性变化的容器元素，默认为浏览器视窗。
- 阈值（Threshold）：触发回调函数的目标元素可见比例。

## 为什么使用 IntersectionObserver ##

传统上，我们会使用 scroll 事件监听元素的可见性变化。然而，这种方法有几个缺点：

- 性能问题：滚动事件会频繁触发，从而导致性能问题。
- 复杂的计算：需要手动计算元素的可见性。
- IntersectionObserver 可以解决这些问题：

::: tip 小结

性能更好：IntersectionObserver 是异步的，不会频繁触发。
简单易用：只需要定义一次观察逻辑，浏览器会处理所有计算。

:::

## 创建 IntersectionObserver 实例 ##

IntersectionObserver 是一个构造函数，我们需要先创建一个实例。构造函数接收两个参数：回调函数和可选配置对象。

```js
let options = {
  root: null, // 默认为视窗
  rootMargin: '0px', // 视窗的外边距
  threshold: 0.1 // 目标元素可见比例达到 10% 时触发回调
};

let observer = new IntersectionObserver(callback, options);
```

## 定义回调函数 ##

回调函数在目标元素的可见性变化时被调用。它接收两个参数：entries 和 observer。

```js
let callback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('目标元素进入视窗');
      // 在此处理进入视窗后的逻辑
    } else {
      console.log('目标元素离开视窗');
      // 在此处理离开视窗后的逻辑
    }
  });
};
```

## 观察目标元素 ##

创建 IntersectionObserver 实例后，使用 observe 方法开始观察目标元素。

```js
let target = document.querySelector('.target-element');
observer.observe(target);
```

## 停止观察 ##

如果不再需要观察某个元素，可以使用 unobserve 方法。

```js
observer.unobserve(target);
```

当不再需要 IntersectionObserver 实例时，可以调用 disconnect 方法停止观察所有目标元素。

```js
observer.disconnect();
```

## 完整示例 ##

:::demo

```vue
<template>
  <div class="container">
    <img data-src="/images/cmono-微信图片_20230718132006.jpg" class="lazy-load h-60" alt="Lazy Loaded Image 1">
    <img data-src="/images/cmono-微信图片_20230718132421.jpg" class="lazy-load  h-60" alt="Lazy Loaded Image 2">
    <img data-src="/images/cmono-微信图片_20230718132500.jpg" class="lazy-load  h-60" alt="Lazy Loaded Image 3">
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from "vue";


onMounted(function(){
  let lazyImages = document.querySelectorAll('.lazy-load');

  let lazyLoadCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        let img = entry.target;
        img.src = img.dataset.src;
        img.onload = () => {
          console.log(`${img.src} loaded`)
          img.classList.add('loaded');
        };
        observer.unobserve(img);
      }
    });
  };

  let observer = new IntersectionObserver(lazyLoadCallback, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  });

  lazyImages.forEach(img => {
    observer.observe(img);
  });
})

onBeforeUnmount(function(){

})


</script>

<style scoped>
.lazy-load {
  opacity: 0;
  transition: opacity 0.5s;
}
.lazy-load.loaded {
  opacity: 1;
}
</style>
```

:::

## 更多示例和用法 ##

### 无限滚动加载更多内容 ###


:::demo

```vue
<template>
  <div class="container">
    <div id="lazy_content">
      <div class="item">内容1</div>
      <div class="item">内容2</div>
      <!-- 更多内容 -->
    </div>
    <div class="loading">加载中...</div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from "vue";

onMounted(function(){
  let loading = document.querySelector('.loading');

  let loadMoreContent = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 模拟加载更多内容
        for (let i = 0; i < 20; i++) {
          let newItem = document.createElement('div');
          newItem.className = 'item';
          newItem.textContent = `新内容${i + 1}`;
          document.querySelector('#lazy_content').appendChild(newItem);
        }
        observer.unobserve(entry.target); // 停止观察当前的 loading 元素
        observer.observe(document.querySelector('.loading')); // 继续观察新的 loading 元素
      }
    });
  };

  let observer = new IntersectionObserver(loadMoreContent, {
    root: null,
    rootMargin: '0px',
    threshold: 1.0 // 目标元素完全可见时触发回调
  });

  observer.observe(loading);
})

onBeforeUnmount(function(){

})


</script>

<style scoped>
.lazy-load {
  opacity: 0;
  transition: opacity 0.5s;
}
.lazy-load.loaded {
  opacity: 1;
}
</style>
```

:::


### ###


:::demo

```vue
<template>
  <div class="container">
    <div class="box">Box 1</div>
    <div class="box">Box 2</div>
    <div class="box">Box 3</div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from "vue";

onMounted(function(){
  let boxes = document.querySelectorAll('.box');

  let animateBoxes = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // 动画完成后停止观察
      }
    });
  };

  let observer = new IntersectionObserver(animateBoxes, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  });

  boxes.forEach(box => {
    observer.observe(box);
  });
})

onBeforeUnmount(function(){

})


</script>

<style scoped>
.box {
  opacity: 0;
  transform: translateY(100px);
  transition: opacity 0.5s, transform 0.5s;
}
.box.visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
```

:::

## 总结 ##

IntersectionObserver API 是一个强大的工具，它能轻松实现懒加载、无限滚动，以及其他需要监听元素可见性的功能。通过本教程，你应该已经学会了如何创建 IntersectionObserver 实例、定义回调函数、观察和停止观察目标元素。如果你在项目中需要优化页面性能或实现动态内容加载，那么 IntersectionObserver 绝对是一个值得尝试的技术。
