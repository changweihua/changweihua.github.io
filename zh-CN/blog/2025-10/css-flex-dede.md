---
lastUpdated: true
commentabled: true
recommended: true
title: 玩转Flex布局
description: 看完这篇你也是布局高手！
date: 2025-10-10 10:20:00 
pageClass: blog-page-class
cover: /covers/css.svg
---

## 简言 ##

今天来聊聊前端开发中超级实用的 Flex 布局。不管你是在学前端还是已经工作，这玩意儿真的是布局神器！以前用 `float` 和 `position` 折腾半天的效果，现在用 Flex 分分钟搞定。相信我，看完这篇，你的布局功力绝对能提升一个档次！

## 基本概念 ##

简单来说，Flex 布局就是个"弹性盒子"。你只需要给父元素设置 `display: flex`，它立马就变成了一个 Flex 容器，里面的子元素自动变成 Flex 项目，乖乖按规则排列。

这就像是个智能的收纳盒，你告诉它要怎么摆放里面的东西，它就能自动调整，再也不用担心布局乱糟糟了！

## Flex容器属性 ##

### flex容器定义 ###

想让一个元素变成 Flex 容器？简单到爆：

```css
.container {
  display: flex; /* 块级弹性容器 */
}
```

或者你想让它像内联元素一样：

```css
.container {
  display: inline-flex; /* 内联弹性容器 */
}
```

就这么一句代码，立马开启弹性布局模式！

### flex-direction ###

这个属性决定项目怎么排队：

```css
.container {
  flex-direction: row; /* 默认：从左到右排 */
  flex-direction: row-reverse; /* 从右到左排 */
  flex-direction: column; /* 从上到下排 */
  flex-direction: column-reverse; /* 从下到上排 */
}
```

想横着排还是竖着排，全凭你一句话！

### flex-wrap ###

项目太多挤不下怎么办？让它换行呗：

```css
.container {
  flex-wrap: nowrap; /* 默认：死也不换行 */
  flex-wrap: wrap; /* 换行，第一行在上面 */
  flex-wrap: wrap-reverse; /* 换行，第一行在下面 */
}
```

`responsive` 设计必备神器！

### flex-flow ###

这是上面两个属性的简写：

```css
.container {
  flex-flow: row wrap; /* 横着排，不够就换行 */
}
```

懒人必备，一行代码搞定两个设置！

### justify-content ###

控制项目在主轴上的对齐方式：

```css
.container {
  justify-content: flex-start; /* 挤在开头 */
  justify-content: flex-end; /* 挤在结尾 */
  justify-content: center; /* 挤在中间 */
  justify-content: space-between; /* 两头贴边，中间均分 */
  justify-content: space-around; /* 每个项目两边都有间隔 */
  justify-content: space-evenly; /* 所有间隔都一样 */
}
```

分配空间的神器，再也不用手算 `margin` 了！

### align-items ###

控制项目在交叉轴上的对齐方式：

```css
.container {
  align-items: stretch; /* 默认：拉伸填满 */
  align-items: flex-start; /* 顶部对齐 */
  align-items: flex-end; /* 底部对齐 */
  align-items: center; /* 居中对齐 */
  align-items: baseline; /* 基线对齐 */
}
```

垂直居中？So easy！再也不用折腾 `vertical-align` 了！

### align-content ###

多行内容时的对齐方式：

```css
.container {
  align-content: stretch; /* 默认：拉伸填满 */
  align-content: flex-start; /* 多行挤在顶部 */
  align-content: flex-end; /* 多行挤在底部 */
  align-content: center; /* 多行居中 */
  align-content: space-between; /* 第一行顶头，最后一行到底 */
  align-content: space-around; /* 每行上下都有间隔 */
}
```

只有多行的时候才有效果，单行就别用它了！

## Flex项目属性 ##

### order ###

控制项目的排列顺序：

```css
.item {
  order: 1; /* 数字越大越靠后 */
}
```

想调整顺序又不想改 HTML 结构？用它就对了！

### flex-grow ###

定义项目的放大比例：

```css
.item {
  flex-grow: 1; /* 有剩余空间时就放大 */
}
```

默认是 `0`，就是不放大。设置成 `1` 就能瓜分剩余空间了！

### flex-shrink ###

定义项目的缩小比例：

```css
.item {
  flex-shrink: 1; /* 空间不够时就缩小 */
}
```

默认是 `1`，空间不够时会自动缩小。设为 `0` 就是不缩小！

### flex-basis ###

定义项目在分配多余空间之前的初始大小：

```css
.item {
  flex-basis: 100px; /* 初始宽度100px */
  flex-basis: auto; /* 默认：本来多大就多大 */
}
```

有点像 `width`，但比 `width` 更智能！

### flex ###

上面三个属性的简写：

```css
.item {
  flex: 0 1 auto; /* 默认值：不放大、可缩小、初始自动 */
  flex: 1; /* 相当于 1 1 0% */
  flex: auto; /* 相当于 1 1 auto */
}
```

最常用的写法：`flex: 1`，让项目自动填满空间！

### align-self ###

允许单个项目有不一样的对齐方式：

```css
.item {
  align-self: auto; /* 默认：继承align-items */
  align-self: flex-start; /* 我自己要顶部对齐！ */
}
```

就想某个项目特立独行？用它准没错！

## 兼容性 ##

现在 Flex 布局的兼容性已经很好了！基本上所有现代浏览器都支持，包括：

- Chrome 29+
- Firefox 28+
- Safari 9+
- Edge 12+
- iOS Safari 9+
- Android Browser 4.4+

当然，如果要兼容 `IE` 的话，可能还得准备备用方案。但对于大多数项目来说，放心用吧！

好了，Flex 布局的核心知识点都在这儿了！多练习几次，你就能熟练运用这个布局神器了。记住，实践出真知，赶紧打开编辑器试试吧！
