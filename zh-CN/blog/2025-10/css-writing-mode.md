---
lastUpdated: true
commentabled: true
recommended: true
title: 一行 CSS 就能搞定！用 writing-mode 轻松实现文字竖排
description: 一行 CSS 就能搞定！用 writing-mode 轻松实现文字竖排
date: 2025-10-20 09:00:00 
pageClass: blog-page-class
cover: /covers/css.svg
---

## 背景 ##

在项目开发过程中，会遇到文字竖排（从上到下）的布局形式。通常我们常用的实现方式是：

- 将每个字符单独使用标签包裹，再通过 ​`​Flexbox排列​​`
- 设置 ​`​固定宽度，强制换行​​`

在CSS中为我们提供了更优雅、更强大、更语义化的解决方案 —— ​`​writing-mode`  属性​​，让文字竖排变得 ​*​简单、灵活​*​。

## 常规实现方式 ##

我们通常采用以下方式模拟或实现竖排文字效果：

### ​​字符拆解 + Flexbox布局​​ ###

将每个文字单独放入一个标签（如 `<span>`），然后使用 Flexbox 垂直排列：

```html
<div class="manual-vertical">
  <span>查</span>
  <span>看</span>
  <span>更</span>
  <span>多</span>
</div>
```

```css
.manual-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
}
```

### ​​固定宽度+强制换行​​ ###

使用固定宽度，强制换行的方式实现：

```html
<div class="width">
    查看更多
</div>
```

```css
.width {
    width: 50px;
    font-size: 50px;
    word-wrap: break-word;
}
```

展示样式：

:::demo

```vue
<template>
    <div class="width">
        查看更多
    </div>
</template>
<script lang="ts" setup></script>
<style scoped>
.width {
    width: 50px;
    font-size: 50px;
    line-height: 50px;
    word-wrap: break-word;
}
</style>
```

:::

## writing-mode 方式（一行代码） ##

### 什么是 writing-mode？ ###

`writing-mode` 属性定义了文本水平或垂直排布以及在块级元素中文本的行进方向。

包括：

- 横排（从左到右 或 从右到左）
- 竖排（从上到下，从右到左 或 从左到右）
- 甚至横躺（sideways）

### 最常用的竖排属性值 ###

|  属性值   |      效果描述  |    适用场景  |
| :-----------: | :-----------: | :-----------: |
| `vertical-rl` | 竖排，从右向左（​​中文传统排版习惯​​） 对于左对齐（ltr）文本，内容从上到下垂直流动，下一垂直行位于上一行左侧。对于右对齐（rtl）文本，内容从下到上垂直流动，下一垂直行位于上一行右侧。 | 中文诗词、菜单、标题、古籍风格 |
| `vertical-lr` | 竖排，从左向右。对于左对齐（ltr）文本，内容从上到下垂直流动，下一垂直行位于上一行右侧。对于右对齐（rtl）文本，内容从下到上垂直流动，下一垂直行位于上一行左侧。 | 日文、部分特殊排版 |
| `horizontal-tb` | 横排，从上到下（默认值）对于左对齐（ltr）文本，内容从左到右水平流动。对于右对齐（rtl）文本，内容从右到左水平流动。下一水平行位于上一行下方。 | 常规英文、中文网页 |
| `sideways-rl`/`sideways-lr` | 文字横躺（从右到左 / 从左到右） | 特殊效果，但兼容性有限 |

### 如何使用？ ###

只需要一行 CSS：

```css
.vertical-text {
  writing-mode: vertical-lr;  /* 竖排，从左向右 */
  /* 可选：调整行高、字体、间距等 */
  line-height: 1.8;
  letter-spacing: 2px;
  text-align: center;
}
```

代码如下：

:::demo

```vue
<template>
    <div class="vertical-demo">
        查看更多
    </div>
</template>
<script lang="ts" setup></script>
<style scoped>
.vertical-demo {
    writing-mode: vertical-rl;
    font-size: 18px;
    line-height: 2;
    height: auto;
}
</style>
```

:::

## 总结 ##

最后总结一下：如果你正在实现文字竖排效果，`​​writing-mode` 就是你最好的选择​​。 它不仅让竖排文字变得 ​​像一句 CSS 那么简单​​。只需给你的元素加上 `writing-mode: vertical-lr;`，就能轻松拥有竖排文字效果。
