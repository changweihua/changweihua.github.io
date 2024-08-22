---
lastUpdated: true
commentabled: true
recommended: true
title: 学习css的clip-path属性
description: 学习css的clip-path属性
date: 2024-08-20 8:18:00
pageClass: blog-page-class
---

# 学习css的clip-path属性 #

## 简介 ## 

`clip-path` 是 CSS 的一个属性，它允许你定义一个剪裁区域，用于裁剪元素的显示区域。这个剪裁区域可以是基本形状、SVG 路径、或是外部图像等。被裁剪的元素只会显示在定义的剪裁区域内，超出部分会被隐藏。

## 用法 ##

`clip-path` 的基本语法列表：

### 圆形（circle）###

```css
clip-path: circle(radius at center);
```

**示例**

```css
clip-path: circle(50px at 50% 50%);
```

### 椭圆形（ellipse） ###

```css
clip-path: ellipse(rx ry at cx cy);
```

**示例**

```css
clip-path: ellipse(50% 50% at 50% 50%);
```

### 多边形（polygon） ###

```css
clip-path: polygon(x1 y1, x2 y2, x3 y3, ...);
```

**示例**

```css
clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
```

### 内置形状（inset） ###

```css
clip-path: inset(top right bottom left);
```

**示例**

```css
clip-path: inset(10% 20% 30% 40%);
```

### SVG 路径（path） ###

```css
clip-path: path('SVG path data');
```

**示例**

```css
clip-path: path('M10 10 H 90 V 90 H 10 L 10 10');
```

### URL 引用（url） ###

```css
clip-path: url(#clipPathId);
```

**示例**

```css
clip-path: url(#myClipPath);
```

### none（无剪切路径） ###

```css
clip-path: none;
```

## 基本形状 ##

### 圆形 (circle) ###

```css
img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  /* 添加过渡 */
  transition: 0.5s;
  /* 初始状态 */
  clip-path: circle(100%);
}

img:hover {
  cursor: pointer;
  clip-path: circle(50%);
}
```

上面的例子会将 图片 裁剪成一个圆形，圆心位于元素的中心，半径为元素的宽度或高度的一半。

:::demo

```vue
<template>
  <div><img src="/images/wall2.jpg" /></div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  /* 添加过渡 */
  transition: 0.5s;
  /* 初始状态 */
  clip-path: circle(100%);
}

img:hover {
  cursor: pointer;
  clip-path: circle(50%);
}
</style>
```

:::

### 椭圆 (ellipse) ###

```css
img {
  width: 300px;
  height: auto;
  object-fit: cover;
  border-radius: 10px;
  /* 添加过渡 */
  transition: 1.5s;
  /* 初始状态 */
  clip-path: ellipse(75% 50% at 50% 50%);
}

img:hover {
  cursor: pointer;
  clip-path: ellipse(75% 50% at 50% 50%);
}
```

当鼠标悬停在图像上时，剪切区域变为一个椭圆形，水平和垂直半径变为图像尺寸的 50%

悬浮之后进行裁剪属性值的变化

```vue
<template>
  <div><img src="/images/wall2.jpg" /></div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
img {
  width: 300px;
  height: auto;
  object-fit: cover;
  border-radius: 10px;
  /* 添加过渡 */
  transition: 0.5s;
  /* 初始状态 */
  clip-path: inset(0 0 0 0)
}

img:hover {
  cursor: pointer;
  clip-path: ellipse(50% 50% at 50% 50%);
}
</style>
```

### 矩形 ###

inset 形状用于创建一个矩形剪切区域，类似于内边距（padding）。

**语法**

```css
clip-path: inset(top right bottom left);
```css

**示例**

```css
img {
  width: 300px;
  height: auto;
  object-fit: cover;
  transition: 0.5s;
  /* 初始状态 */
  clip-path: inset(0 0 0 0)
}

img:hover {
  cursor: pointer;
  clip-path: inset(10% 20% 30% 40%);
}
```

**效果**

初始状态`(clip-path: inset(0 0 0 0))`

```diff
+-------------------------+
|                         |
|                         |
|                         |
|        图像未裁剪        |
|                         |
|                         |
|                         |
+-------------------------+
```


悬停状态 `(clip-path: inset(10% 20% 30% 40%))`

```lua
+-------------------------+
|                         |
|       +--------+        | 10%
|       |        |        |
|  40%  |        |  20%   |
|       |裁剪区域|        |
|       |        |        |
|       +--------+        | 30%
|                         |
+-------------------------+
```

裁剪区域距离图像顶部 10%，右侧 20%，底部 30%，左侧 40%。因此，裁剪区域显示图像的中心部分，四周有一定的内边距。

```vue
<template>
  <div><img src="/images/wall2.jpg" /></div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
img {
  width: 300px;
  height: auto;
  object-fit: cover;
  transition: 0.5s;
  /* 初始状态 */
  clip-path: inset(0 0 0 0)
}

img:hover {
  cursor: pointer;
  clip-path: inset(10% 20% 30% 40%);
}
</style>
```

### 多边形 (polygon) [重要] ###

clip-path 的 polygon 用法允许我们创建一个多边形的剪切区域。我们可以使用一系列的顶点来定义这个多边形，每个顶点由一个 x 和 y 坐标值表示，坐标值可以是像素、百分比或其他单位。

**语法**

```css
clip-path: polygon(x1 y1, x2 y2, x3 y3, ...);
```

x 和 y 坐标：可以是百分比或像素值，表示顶点的位置。百分比是相对于元素的尺寸。

多边形顶点顺序：按顺时针或逆时针顺序定义顶点，最后一个顶点会自动连接到第一个顶点。

当然，我可以用 Markdown 和文本描述来画出基本形状的坐标图，并提供相应的 CSS 代码。

### 三角形 ###

```scss
(50% 0%)
     /\
    /  \
   /    \
(0% 100%)(100% 100%)
```

```css
clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
```


### 五边形 ###

```scss
(50% 0%)
        /      \
  (0% 38%)    (100% 38%)
     \        /
      \      /
  (18% 100%)(82% 100%)
```

```css
clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
```


### 六边形 ###

```scss
(25% 0%)   (75% 0%)
      /          \
     /            \
(0% 50%)        (100% 50%)
     \            /
      \          /
    (25% 100%)  (75% 100%)
```

```css
clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
```

### 矩形 ###

```scss
(0% 0%)------------(100% 0%)
  |                    |
  |                    |
  |                    |
(0% 100%)----------(100% 100%)
```

```css
clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
```


### 平行四边形 ###

```scss
(25% 0%)------------(75% 0%)
     \                \
      \                \
(0% 100%)----------(50% 100%)
```

```css
clip-path: polygon(25% 0%, 75% 0%, 50% 100%, 0% 100%);
```

### 使用 SVG 路径 ###

你可以使用 path() 函数来定义一个 SVG 路径作为剪裁区域。

```css
.element {
  clip-path: path('M 10 10 H 90 V 90 H 10 L 10 10');
}
```

## 示例代码 ##




[相应资源网站推荐](https://bennettfeely.com/clippy/)
<!-- 
<preview path="../../../src/demos/ClipPathDemo.vue" title="title" description="component description content"></preview> -->

