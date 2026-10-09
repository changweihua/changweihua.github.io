---
lastUpdated: true
commentabled: true
recommended: true
title: content-visibility
description: 让浏览器跳过离屏渲染的性能黑科技
date: 2026-08-07 09:15:00
pageClass: blog-page-class
cover: /covers/html5.svg
---

## 问题场景 ##

页面越来越长，一个商品列表页挂了 200 个卡片，每个卡片里有图片、评分星星、价格标签、促销气泡。首屏加载时 DevTools Performance 面板显示：首次渲染花了 1.8s，其中 60% 的时间花在了屏幕外的 DOM 上。

滚动时更糟：滚轮一动就掉帧，因为浏览器在不停地为每个离屏元素做样式计算（style recalc）和布局（layout）。

传统优化手段（懒加载图片、虚拟滚动）都只能治标：图片懒加载只省了网络请求，DOM 节点的样式计算和布局开销一分没少；虚拟滚动则要重写整个列表组件，成本太高。

## 原因分析 ##

浏览器渲染管线是：解析 DOM → 样式计算 → 布局 → 绘制 → 合成。问题在于，浏览器默认会为所有可见性未知的元素执行完整的样式计算和布局，哪怕它远在屏幕之外。

对于长页面，离屏元素占了 DOM 的绝大部分，这些计算全是浪费 —— 用户根本看不到，浏览器却白干了几百毫秒的活。

## 解决方案：content-visibility ##

`content-visibility` 是 Chromium 85+ 提供的原生属性，核心思想就一句话：告诉浏览器"这块内容暂时不用渲染，等它快进入视口时再算"。

```css
.card {
  /* 核心用法 */
  content-visibility: auto;

  /* 关键配套：给离屏内容一个预估高度，避免出现滚动条跳动 */
  contain-intrinsic-size: auto 300px;
}
```

### 为什么必须配 contain-intrinsic-size？ ###

`content-visibility: auto` 会让离屏元素跳过渲染，但元素的实际高度此时是未知的 —— 浏览器不知道它该占多大空间，滚动条会疯狂跳动，页面"越滚越长"。

`contain-intrinsic-size` 就是给浏览器一个"占位高度"的预估：

```css
/* 固定预估 */
contain-intrinsic-size: 300px;

/* auto 关键字：记住上次渲染后的真实尺寸，更精准 */
contain-intrinsic-size: auto 300px;
```

`auto` 模式下，元素第一次离屏用 300px 占位；一旦渲染过，就记住真实高度，后续滚动回来不再抖动。

### 实战：商品卡片列表 ###

```html
<div class="product-list">
  <div class="card">
    <img src="p1.jpg" loading="lazy" alt="商品1">
    <h3>无线降噪耳机</h3>
    <p class="price">¥899 <s>¥1299</s></p>
    <span class="tag">限时折扣</span>
  </div>
  <!-- ... 一共 200 个 card ... -->
</div>
```

```css
.card {
  content-visibility: auto;
  contain-intrinsic-size: auto 280px;
}
```

配合 `loading="lazy"` 图片懒加载，双管齐下：

- `loading="lazy"` 省网络请求
- `content-visibility: auto` 省渲染计算

实测：200 个卡片的列表页，首次渲染时间从 1.8s 降到 0.6s，滚动掉帧基本消失。

### 进阶：跳过不可见区块的渲染 ###

长文博客的场景，正文中间的评论区、相关推荐这些"非核心区块"，可以直接用 `content-visibility: hidden` 让浏览器完全不渲染（区别于 `auto` 的按需渲染）：

```css
.comments-section {
  content-visibility: hidden;
}
```

注意：`hidden` 与 `display: none` 不同，它保留元素的布局占位，但跳过绘制，适合"存在但暂时不需要展示"的内容。

## 避坑要点 ##

- 兼容性：Chromium 85+ 支持，Safari 16.4+、Firefox 125+ 才支持。老浏览器直接忽略该属性，页面功能不受影响，只是性能提升失效 —— 是渐进增强的完美候选。
- 必须配 `contain-intrinsic-size`：否则滚动条抖动，体验反而更差。
- 不要用在首屏关键内容上：首屏内容本来就要立刻渲染，加了反而可能延迟出现。
- `content-visibility: auto` 的元素对 `position: sticky` 子元素有影响：离屏时会跳过渲染，sticky 定位可能失效，需要测试。
- 与虚拟滚动的关系：虚拟滚动解决的是"DOM 节点太多"的问题（万级节点），content-visibility 解决的是"渲染计算浪费"的问题（百千级节点）。节点量级小用后者，量大才上虚拟滚动。

## 要点总结 ##

- `content-visibility: auto` = 离屏元素跳过渲染，进入视口前才计算，是渲染性能的懒加载
- `contain-intrinsic-size` 是它的最佳搭档，防止滚动条跳动
- 懒加载图片（省网络）+ `content-visibility`（省计算）组合使用，长列表性能翻倍
- 渐进增强特性，老浏览器自动降级，放心用
