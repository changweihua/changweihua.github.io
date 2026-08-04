---
lastUpdated: true
commentabled: true
recommended: true
title: 好看的24种CSS渐变效果汇总
description: 常见CSS扫盲之渐变效果
date: 2025-09-11 09:00:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

## CSS3渐变是啥 ##

首先渐变字面意思就是渐渐的变了，我们常用于背景色的设置。官方说法就是在两个或多个颜色之间进行平稳的过渡。
它的优势在于一些背景色想要好的效果时候不用自己PS做图，然后再设置背景图啥的，我们可以直接通过CSS3渐变（gradient）的样式属性来进行设置，减少页面资源请求不说，还能随意调整色系，岂不快活！

## CSS3渐变种类 ##

### 线性渐变（linear-gradient） ###

#### 原理说明 ####

线性的话就是指渐变色可以按照不同的方向去实现颜色的不同展示效果，支持上/下/左/右/对角线等多个方向进行。其中颜色是可以加多种的，方便说明我用了两种；

- **默认属性（从上到下）**：`background-image: linear-gradient(#e66465, #9198e5)`;
- **设置方向（从左往右）**：`background-image: linear-gradient(to right,#e66465, #9198e5)`;
- **对角方向（从左上往右下）**：`background-image: linear-gradient(to bottom right,#e66465, #9198e5)`;
- **设置角度（从左往右）**：`background-image: linear-gradient(45deg,#e66465, #9198e5)`;

#### 好看的线性渐变效果 ####

:::demo

```vue
<template>
  <div class="grid gap-3 grid-cols-6">
    <div style="width: 100px;height: 60px;background: linear-gradient(#e66465, #9198e5);"></div>
    <div style="width: 100px;height: 60px;background: linear-gradient(to right, #9fe1fa, #f4edc9);"></div>
    <div style="width: 100px;height: 60px;background: linear-gradient(to top right, rgb(238, 163, 175), rgb(149, 214, 240));"></div>
    <div style="width: 100px;height: 60px;background: linear-gradient(111.4deg, rgb(238, 113, 113) 1%, rgb(246, 215, 148) 58%);"></div>
    <div style="width: 100px;height: 60px;background: linear-gradient(102.7deg, rgb(253, 218, 255) 8.2%, rgb(223, 173, 252) 19.6%, rgb(173, 205, 252) 36.8%, rgb(173, 252, 244) 73.2%, rgb(202, 248, 208) 90.9%)"></div>
    <div style="width: 100px;height: 60px;background: linear-gradient(58.2deg, rgba(40, 91, 212, 0.73) -3%, rgba(171, 53, 163, 0.45) 49.3%, rgba(255, 204, 112, 0.37) 97.7%)"></div>
    <div style="width: 100px;height: 60px;
background-image: linear-gradient(181.2deg, rgb(181, 239, 249) 10.5%, rgb(254, 254, 254) 86.8%);"></div>
    <div style="width: 100px;height: 60px;background-image: linear-gradient(107.7deg, rgb(101, 168, 143) -30.7%, rgb(144, 220, 193) 7.2%, rgb(225, 203, 150) 31.3%, rgb(251, 166, 150) 82.6%, rgb(250, 54, 65) 128.5%);"></div>
    <div style="width: 100px;height: 60px;background-image: linear-gradient(111.4deg, rgb(209, 231, 235) 7.4%, rgb(238, 219, 199) 51.4%, rgb(255, 159, 122) 82.6%, rgb(255, 109, 58) 100.2%);"></div>
    <div style="width: 100px;height: 60px;background-image: linear-gradient(109.6deg, rgb(101, 58, 150) 29.9%, rgb(168, 141, 194) 99.9%);"></div>
    <div style="width: 100px;height: 60px;background-image: linear-gradient(106.5deg, rgba(255, 215, 185, 0.91) 23%, rgba(223, 159, 247, 0.8) 93%);"></div>
    <div style="width: 100px;height: 60px;background-image: linear-gradient(109.6deg, rgb(0, 51, 102) 11.2%, rgb(187, 187, 187) 91.1%);"></div>
    <div style="width: 100px;height: 60px;background-image: linear-gradient(103.3deg, rgb(252, 225, 208) 30%, rgb(255, 173, 214) 55.7%, rgb(162, 186, 245) 81.8%);"></div>
    <div style="width: 100px;height: 60px;background-image: linear-gradient(110.6deg, rgb(179, 157, 219) 7%, rgb(150, 159, 222) 47.7%, rgb(24, 255, 255) 100.6%);"></div>
    <div style="width: 100px;height: 60px;background-color: var(--vp-c-brand)"></div>
    <div style="width: 100px;height: 60px;background-color: var(--vp-c-brand)"></div>
    <div style="width: 100px;height: 60px;background-color: var(--vp-c-brand)"></div>
    <div style="width: 100px;height: 60px;background-color: var(--vp-c-brand)"></div>
    <div style="width: 100px;height: 60px;background-color: var(--vp-c-brand)"></div>
    <div style="width: 100px;height: 60px;background-color: var(--vp-c-brand)"></div>
  </div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr));
  grid-gap: 1rem;
}
</style>
```

:::


### 径向渐变（ radial-gradient） ###

#### 径向渐变是啥? ####

CSS径向渐变就好比是一个框，你得以某中心，往外发散设置渐变色，或者其他形状设置渐变色，你也可以理解为背景色辐射
其属性设置可以指定渐变的中心、形状（圆形或椭圆形）、大小。正常情况下，渐变的中心是 center-【表示在中心点】，渐变的形状是 ellipse-【表示椭圆形】，渐变的大小是 farthest-corner【表示到最远的角落】

#### CSS语法 ####

```css
background-image: radial-gradient(shape size at position, start-color, ..., last-color);
```


| 参数   |   含义     |   默认值 |
| :----------: | :----------: | :---------:  |
| shape | 定义形状（圆形或者椭圆）  | ellipse（表示椭圆形）注意：容器宽高不相等 |
| size | 定义大小  | farthest-corner（表示到最远的角落） |
| position | 定义圆心的位置  | center（表示在中心点） |
| start-color | 定义开始的颜色值  | 必填，无默认值 |
| ... | last-color  | 定义结束的颜色值	必填，无默认值 |

#### 径向渐变常用实例 ####

其实颜色搭配就看个人喜好了，主要应用方式包括如下：

- **像素位置设置**：`background: radial-gradient(978px at 1.8% 4%, rgb(162, 208, 254) 0.1%, rgba(193, 94, 245, 0.73) 100.2%)`
- **形状位置设置**：`background: radial-gradient(circle at 10% 20%, rgb(239, 246, 249) 0%, rgb(206, 239, 253) 90%)`

**具体实现如下**：


:::demo

```vue
<template>
  <div class="grid gap-3 grid-cols-6 grid-content-center">
    <div style="width: 100px;height: 60px;background: radial-gradient(178px at 1.8% 4%, rgb(162, 208, 254) 0.1%, rgba(193, 94, 245, 0.73) 100.2%)"></div>
    <div style="width: 100px;height: 60px; background: radial-gradient(128px at 31.7% 40.2%, rgb(225, 200, 239) 21.4%, rgb(163, 225, 233) 57.1%)"></div>
    <div style="width: 100px;height: 60px;background: radial-gradient(169px at -2.9% 12.9%, rgb(247, 234, 163) 0%, rgba(236, 180, 238, 0.56) 46.4%, rgb(163, 203, 247) 100.7%)"></div>
    <div style="width: 100px;height: 60px;background: radial-gradient(circle at 10% 20%, rgb(239, 246, 249) 0%, rgb(206, 239, 253) 90%)"></div>
    <div style="width: 100px;height: 60px;background: radial-gradient(circle at 32.2% 83.5%, rgb(239, 167, 167) 0%, rgb(215, 123, 191) 90%)"></div>
    <div style="width: 100px;height: 60px;background: radial-gradient(circle at 7.2% 13.6%, rgb(37, 249, 245) 0%, rgb(8, 70, 218) 90%);"></div>
    <div style="width: 100px;height: 60px;background-image: radial-gradient(circle at 10.6% 23.3%, rgb(186, 162, 252) 0%, rgb(176, 248, 242) 72.4%);"></div>
    <div style="width: 100px;height: 60px;background-image: radial-gradient(circle at 10% 20%, rgb(249, 57, 170) 9.8%, rgb(134, 176, 255) 94.9%);"></div>
    <div style="width: 100px;height: 60px;background-image: radial-gradient(circle at 48.7% 44.3%, rgb(30, 144, 231) 0%, rgb(56, 113, 209) 22.9%, rgb(38, 76, 140) 76.7%, rgb(31, 63, 116) 100.2%);"></div>
    <div style="width: 100px;height: 60px;background-image: radial-gradient(circle at 10% 20%, rgb(222, 168, 248) 0%, rgb(168, 222, 248) 21.8%, rgb(189, 250, 205) 35.6%, rgb(243, 250, 189) 52.9%, rgb(250, 227, 189) 66.8%, rgb(248, 172, 172) 90%, rgb(254, 211, 252) 99.7%);"></div>
    <div style="width: 100px;height: 60px;" class="bg-amber"></div>
    <div style="width: 100px;height: 60px;background-color: var(--vp-c-brand)"></div>
  </div>
</template>
```

:::
