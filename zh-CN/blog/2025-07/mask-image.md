---
lastUpdated: true
commentabled: true
recommended: true
title: CSS mask-image：给元素 “戴” 上创意面具的隐藏技巧
description: CSS mask-image：给元素 “戴” 上创意面具的隐藏技巧
date: 2025-07-29 13:05:00 
pageClass: blog-page-class
cover: /covers/css.svg
---

在前端设计中，我们常常需要实现一些特殊的视觉效果：比如让图片只显示特定形状，或让背景图以渐变的方式逐渐消失。这些效果如果用传统的 `overflow: hidden` 或图片裁剪，不仅灵活度低，还会增加额外的元素嵌套。而 CSS 的 `mask-image` 属性，就像一把 “数字剪刀”，能给元素 “戴” 上自定义面具，只显示面具覆盖的区域，轻松实现各种创意效果。今天，我们就来解锁这个 “隐藏技能”。

## 认识 mask-image：比 clip-path 更灵活的裁剪工具 ##

`mask-image` 的作用是：*用一张图片或渐变作为 “面具”，元素只有在遮罩不透明的区域才会显示*。遮罩中透明的部分，元素会被隐藏；遮罩半透明的部分，元素会半透明显示。

### 与 clip-path 的区别 ###

很多人会混淆 `mask-image` 和 `clip-path`，两者都能实现裁剪效果，但核心差异在于：

- `clip-path`：通过几何路径（如圆形、多边形、SVG 路径）裁剪元素，只能实现规则或自定义路径的硬边缘裁剪。
- `mask-image`：通过图片或渐变的透明度来控制显示区域，支持柔和边缘、复杂纹理，甚至动态动画。

简单说，`clip-path` 像 “剪纸”，`mask-image` 像 “盖章”—— 前者靠形状，后者靠透明度。

### 基础语法：一张图就能实现遮罩效果 ###

`mask-image` 的语法与 `background-image` 类似，支持图片 URL、渐变或 SVG：

```css
/* 用图片作为遮罩 */
.element {
  mask-image: url("mask.png");
  /* 兼容webkit内核浏览器（Chrome、Safari等） */
  -webkit-mask-image: url("mask.png");
}

/* 用渐变作为遮罩 */
.element {
  mask-image: linear-gradient(to right, black, transparent);
  -webkit-mask-image: linear-gradient(to right, black, transparent);
}
```

#### 核心原理 ####

- 遮罩中 `alpha` 通道（透明度）为 `1`（完全不透明）的区域，元素正常显示。
- 遮罩中 `alpha` 通道为 `0`（完全透明）的区域，元素被隐藏。
- 遮罩中 `alpha` 通道为 `0~1`（半透明）的区域，元素半透明显示。

> 注意：目前大部分浏览器仍需要添加 `-webkit-` 前缀（如 Chrome、Safari、Edge），实际使用时记得写兼容写法。

## 核心用法：从基础到进阶的遮罩效果 ##

### 用图片作为遮罩：显示特定形状 ###

准备一张黑白或透明背景的图片作为遮罩（推荐 PNG 格式，支持透明通道），就能让元素只显示遮罩的形状。

### 用圆形遮罩显示图片中心区域 ###

```html
<div class="masked-image"></div>
```

```css
.masked-image {
  width: 300px;
  height: 300px;
  background-image: url("/images/macwallpaper.jpg"); /* 原始图片 */
  background-size: cover;
  /* 用圆形遮罩图片（中间不透明，边缘透明） */
  -webkit-mask-image: url("/images/circle-mask.png");
  mask-image: url("/images/circle-mask.png");
  -webkit-mask-size: cover; /* 遮罩大小与元素一致 */
  mask-size: cover;
}
```

效果如下：

:::demo

```vue
<template>
  <div class="masked-image"></div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
.masked-image {
  width: 300px;
  height: 300px;
  background-image: url("/images/macwallpaper.jpg"); /* 原始图片 */
  background-size: cover;
  /* 用圆形遮罩图片（中间不透明，边缘透明） */
  -webkit-mask-image: url("/images/circle-mask.png");
  mask-image: url("/images/circle-mask.png");
  -webkit-mask-size: cover; /* 遮罩大小与元素一致 */
  mask-size: cover;
}
</style>
```

:::

效果：原始图片只会在圆形遮罩的不透明区域显示，形成 “圆形图片” 效果，且边缘可以通过遮罩图片实现柔和过渡（这是 `clip-path: circle()` 难以做到的）。

### 用渐变作为遮罩：实现渐隐效果 ###

渐变（`linear-gradient`、`radial-gradient`等）是 `mask-image` 最常用的工具，无需额外图片，就能实现平滑的过渡效果。

#### 线性渐变：横向 / 纵向渐隐 ####

```css
/* 从左到右逐渐消失（左边显示，右边隐藏） */
.fade-out {
  width: 400px;
  height: 200px;
  background: url("/images/macwallpaper.jpg") center/cover;
  -webkit-mask-image: linear-gradient(to right, black 60%, transparent 100%);
  mask-image: linear-gradient(to right, black 60%, transparent 100%);
}
```
效果如下：

:::demo

```vue
<template>
  <div class="fade-out"></div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
.fade-out {
  width: 400px;
  height: 200px;
  background: url("/images/macwallpaper.jpg") center/cover;
  -webkit-mask-image: linear-gradient(to right, black 60%, transparent 100%);
  mask-image: linear-gradient(to right, black 60%, transparent 100%);
}
</style>
```

:::


- `black` 表示遮罩不透明（元素显示），`transparent` 表示遮罩透明（元素隐藏）。
- `60%` 和 `100%` 是颜色停止点：前 `60%` 保持不透明，`60%` 到 `100%` 之间逐渐过渡到透明。


#### 径向渐变：中心向外渐隐 ####

```css
/* 从中心向外逐渐消失 */
.radial-fade {
  width: 300px;
  height: 300px;
  background: #ff6b6b;
  -webkit-mask-image: radial-gradient(circle, black 50%, transparent 70%);
  mask-image: radial-gradient(circle, black 50%, transparent 70%);
}
```

效果如下：


:::demo

```vue
<template>
  <div class="radial-fade"></div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
.radial-fade {
  width: 300px;
  height: 300px;
  background: #ff6b6b;
  -webkit-mask-image: radial-gradient(circle, black 50%, transparent 70%);
  mask-image: radial-gradient(circle, black 50%, transparent 70%);
}
</style>
```

:::

效果：元素中心（50% 范围内）完全显示，50% 到 70% 之间逐渐变淡，70% 以外完全隐藏，形成类似 “光晕” 的效果。

### 多重遮罩：叠加效果更丰富 ###

`mask-image` 支持同时使用多个遮罩，用逗号分隔，类似 `background-image` 的多重背景：

```css
/* 叠加两个渐变遮罩 */
.double-mask {
  width: 400px;
  height: 200px;
  background: url("texture.png");
  -webkit-mask-image: linear-gradient(to bottom, black, transparent),
    radial-gradient(circle at center, black, transparent);
  mask-image: linear-gradient(to bottom, black, transparent), radial-gradient(circle
        at center, black, transparent);
  /* 调整遮罩位置和大小 */
  -webkit-mask-size: 100% 100%, 200px 200px;
  mask-size: 100% 100%, 200px 200px;
  -webkit-mask-position: center, center;
  mask-position: center, center;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}
```

效果如下：

:::demo

```vue
<template>
  <div class="double-mask"></div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
.double-mask {
  width: 400px;
  height: 200px;
  background: url("/images/macwallpaper.jpg");
  -webkit-mask-image: linear-gradient(to bottom, black, transparent),
    radial-gradient(circle at center, black, transparent);
  mask-image: linear-gradient(to bottom, black, transparent), radial-gradient(circle
        at center, black, transparent);
  /* 调整遮罩位置和大小 */
  -webkit-mask-size: 100% 100%, 200px 200px;
  mask-size: 100% 100%, 200px 200px;
  -webkit-mask-position: center, center;
  mask-position: center, center;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}
</style>
```

:::

效果：两个遮罩叠加后，元素只有在两个遮罩都不透明的区域才会显示，形成更复杂的形状。

### 动态遮罩：配合动画实现交互效果 ###

`mask-image` 支持 CSS 动画，通过改变遮罩的位置、大小或透明度，实现动态过渡效果。

示例：鼠标悬停时遮罩 “揭开”

```css
.hover-mask {
  width: 300px;
  height: 200px;
  background: url("/images/macwallpaper.jpg") center/cover;
  transition: all 0.5s ease;
  /* 初始遮罩：右侧透明（元素右侧隐藏） */
  -webkit-mask-image: linear-gradient(to left, black, transparent 50%);
  mask-image: linear-gradient(to left, black, transparent 50%);
}

.hover-mask:hover {
  /* 悬停后遮罩：完全不透明（元素全显示） */
  -webkit-mask-image: linear-gradient(to left, black, black);
  mask-image: linear-gradient(to left, black, black);
}
```

效果如下：

:::demo

```vue
<template>
  <div class="hover-mask"></div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
.hover-mask {
  width: 300px;
  height: 200px;
  background: url("/images/macwallpaper.jpg") center/cover;
  transition: all 0.5s ease;
  /* 初始遮罩：右侧透明（元素右侧隐藏） */
  -webkit-mask-image: linear-gradient(to left, black, transparent 50%);
  mask-image: linear-gradient(to left, black, transparent 50%);
}

.hover-mask:hover {
  /* 悬停后遮罩：完全不透明（元素全显示） */
  -webkit-mask-image: linear-gradient(to left, black, black);
  mask-image: linear-gradient(to left, black, black);
}
</style>
```

:::

效果：鼠标未悬停时，元素右侧被隐藏；悬停时，遮罩逐渐变为完全不透明，元素完整显示，实现 “揭开卡片” 的交互效果。

## 实用技巧：让遮罩效果更可控 ##

### 控制遮罩的位置与大小 ###

与 `background` 属性类似，`mask-image` 也有配套的属性来控制遮罩的显示方式：

| 属性          |      作用        |   示例  |    备注 |
| :---------: | :---------: | :---------: | :-------: |
| `mask-size` | 控制遮罩的尺寸 | `mask-size: 200px 150px` |  |
| `mask-position` | 控制遮罩的位置 | `mask-position: center center` |  |
| `mask-repeat` | 控制遮罩是否重复 | `mask-repeat: no-repeat` |  |
| `mask-origin` | 控制遮罩的定位原点 | `mask-origin: content-box` |  |
| `mask-clip` | 控制遮罩的裁剪边界 | `mask-clip: padding-box` |  |

示例：让遮罩居中显示且不重复

```css
.element {
  -webkit-mask-image: url("star-mask.png");
  mask-image: url("star-mask.png");
  -webkit-mask-size: 100px 100px;
  mask-size: 100px 100px;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}
```

### 用 SVG 作为遮罩：实现矢量级精准控制 ###

SVG 作为矢量图形，放大后不会失真，非常适合作为需要适配不同尺寸的遮罩。只需在 SVG 中定义 `<mask>` 元素，然后在 `mask-image` 中引用即可。

#### 定义 SVG 遮罩 ####

```html
<!-- mask.svg -->
<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
 <!-- 定义一个ID为"text-mask"的遮罩 -->
 <mask id="text-mask">
   <!-- 背景为黑色（透明） -->
   <rect width="100%" height="100%" fill="black" />
   <!-- 文字为白色（不透明），作为显示区域 -->
   <text x="50%" y="50%" font-size="40" text-anchor="middle" fill="white">MASK</text>
 </mask>
</svg>
```

#### 在 CSS 中引用 SVG 遮罩 ####

```css
.text-mask-element {
  width: 400px;
  height: 200px;
  background: linear-gradient(45deg, #4285f4, #34a853);
  /* 引用SVG中的遮罩（#text-mask） */
  -webkit-mask-image: url("mask.svg#text-mask");
  mask-image: url("mask.svg#text-mask");
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}
```

效果如下：

```vue
<template>
  <div class="text-mask-element">CMONO.NET</div>
  <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
 <!-- 定义一个ID为"text-mask"的遮罩 -->
 <mask id="text-mask">
   <!-- 背景为黑色（透明） -->
   <rect width="100%" height="100%" fill="black" />
   <!-- 文字为白色（不透明），作为显示区域 -->
   <text x="50%" y="50%" font-size="40" text-anchor="middle" fill="white">MASK</text>
 </mask>
</svg>
</template>
<script lang="ts" setup>
</script>
<style scoped>
.text-mask-element {
  width: 400px;
  height: 200px;
  background: linear-gradient(45deg, #4285f4, #34a853);
  /* 引用SVG中的遮罩（#text-mask） */
  -webkit-mask-image: url("mask.svg#text-mask");
  mask-image: url("mask.svg#text-mask");
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}
</style>
```

效果：元素背景是渐变，但只在 SVG 文字 “MASK” 的区域显示，形成 “文字形状的渐变” 效果，且文字边缘清晰（矢量特性）。

### 兼容处理：应对浏览器差异 ###

虽然现代浏览器（Chrome 80+、Firefox 70+、Edge 80+）都支持 `mask-image`，但仍有两点需要注意：

- 添加前缀：WebKit 内核浏览器需要 `-webkit-` 前缀，实际开发中需同时写标准属性和前缀属性。
- 降级方案：对于不支持 `mask-image` 的浏览器（如 IE），可以用 `clip-path` 或半透明图片作为降级效果。

```css
/* 完整兼容写法 */
.element {
  /* 标准属性 */
  mask-image: url("mask.png");
  mask-size: cover;
  mask-position: center;
  /* WebKit前缀 */
  -webkit-mask-image: url("mask.png");
  -webkit-mask-size: cover;
  -webkit-mask-position: center;
  /* 降级方案：IE等不支持的浏览器显示完整图片 */
  /* [if IE]>
   background-image: url('fallback-image.jpg');
 <![endif] */
}
```

## 实战案例：创意效果展示 ##

### 渐变文字遮罩 ###

用渐变作为文字的遮罩，实现 “文字渐隐” 或 “文字内渐变” 效果：

```html
<h1 class="gradient-mask-text">创意文字效果</h1>
```

```css
.gradient-mask-text {
  font-size: 4rem;
  font-weight: bold;
  /* 文字颜色（会被遮罩影响） */
  color: #333;
  /* 用渐变作为遮罩，让文字从左到右渐隐 */
  -webkit-mask-image: linear-gradient(to right, black, transparent 80%);
  mask-image: linear-gradient(to right, black, transparent 80%);
}
```

效果如下：

:::demo

```vue
<template>
  <h1 class="gradient-mask-text">创意文字效果</h1>
</template>
<script lang="ts" setup>
</script>
<style scoped>
.gradient-mask-text {
  font-size: 4rem;
  font-weight: bold;
  /* 文字颜色（会被遮罩影响） */
  color: #333;
  /* 用渐变作为遮罩，让文字从左到右渐隐 */
  -webkit-mask-image: linear-gradient(to right, black, transparent 80%);
  mask-image: linear-gradient(to right, black, transparent 80%);
}
</style>
```

:::

效果：文字从左到右逐渐消失，比单纯的text-shadow更有设计感。

### 动态加载动画 ###

用圆形渐变遮罩配合动画，实现 “圆形加载” 效果：

```html
<div class="loader"></div>
```

```css
.loader {
  width: 100px;
  height: 100px;
  background: conic-gradient(#4285f4, #34a853, #fbbc05, #ea4335);
  border-radius: 50%;
  /* 圆形遮罩：中间透明，边缘不透明 */
  -webkit-mask-image: radial-gradient(circle, transparent 40%, black 40%);
  mask-image: radial-gradient(circle, transparent 40%, black 40%);
  /* 旋转动画 */
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

效果如下：

:::demo

```vue
<template>
  <div class="loader"></div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
.loader {
  width: 100px;
  height: 100px;
  background: conic-gradient(#4285f4, #34a853, #fbbc05, #ea4335);
  border-radius: 50%;
  /* 圆形遮罩：中间透明，边缘不透明 */
  -webkit-mask-image: radial-gradient(circle, transparent 40%, black 40%);
  mask-image: radial-gradient(circle, transparent 40%, black 40%);
  /* 旋转动画 */
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
```

:::

效果：通过遮罩只显示元素的边缘环形区域，配合旋转动画，形成 “彩色加载环” 效果，比传统的border实现更灵活。
 
## 总结 ##

`mask-image` 是一个 “小而美” 的 CSS 属性，它通过遮罩的透明度控制元素的显示区域，比 `clip-path` 更灵活，能实现渐变过渡、纹理叠加、动态交互等创意效果。核心要点：

- **工作原理**：遮罩不透明区域显示元素，透明区域隐藏元素。
- **常用场景**：图片裁剪、渐隐效果、文字创意设计、动态交互。
- **实用技巧**：配合 `mask-size`、`mask-position`控制遮罩显示，用 SVG 作为矢量遮罩。

如果你想让设计突破常规的矩形限制，又不想依赖复杂的图片编辑，`mask-image` 会是一个强大的工具。下次需要实现特殊形状或过渡效果时，不妨试试给元素 “戴” 上一个创意面具 —— 简单几行代码，就能让界面瞬间提升质感。
