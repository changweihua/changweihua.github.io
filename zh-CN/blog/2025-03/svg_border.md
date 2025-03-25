---
lastUpdated: true
commentabled: true
recommended: true
title: SVG使用遮罩和动画实现边框流动效果
description: SVG使用遮罩和动画实现边框流动效果
date: 2025-03-25 15:00:00
pageClass: blog-page-class
---

# SVG使用遮罩和动画实现边框流动效果 #

## 制作坐标系 ##

为了更加直观及方便绘制，现使用两层嵌套`patterns`绘制`5*5 × 5*5`坐标系：

:::demo

```vue
<template>
<svg width="400" height="200">
  <defs>
    <pattern
      id="gridUnit"
      x="0"
      y="0"
      width="5"
      height="5"
      patternUnits="userSpaceOnUse"
    >
      <path
        d="M 0 5 L 0 0 5 0"
        stroke="rgba(0, 0, 0, 0.1)"
        stroke-width="1"
        fill="none"
      ></path>
    </pattern>
    <pattern
      id="grid"
      x="0"
      y="0"
      width="25"
      height="25"
      patternUnits="userSpaceOnUse"
    >
      <rect width="25" height="25" x="0" y="0" fill="url(#gridUnit)"></rect>
      <path
        d="M 0 25 L 0 0 25 0"
        stroke="rgba(0, 0, 0, 0.2)"
        stroke-width="1"
        fill="none"
      ></path>
    </pattern>
  </defs>
  <rect
    stroke="#aaa"
    width="400"
    height="200"
    x="0"
    y="0"
    fill="url(#grid)"
  ></rect>
</svg>
</template>
```
:::


## 画一个边框 ##

绘制一个边框：

:::demo

```vue
<template>
<svg width="400" height="200">
  <defs>
    <pattern
      id="gridUnit"
      x="0"
      y="0"
      width="5"
      height="5"
      patternUnits="userSpaceOnUse"
    >
      <path
        d="M 0 5 L 0 0 5 0"
        stroke="rgba(0, 0, 0, 0.1)"
        stroke-width="1"
        fill="none"
      ></path>
    </pattern>
    <pattern
      id="grid"
      x="0"
      y="0"
      width="25"
      height="25"
      patternUnits="userSpaceOnUse"
    >
      <rect width="25" height="25" x="0" y="0" fill="url(#gridUnit)"></rect>
      <path
        d="M 0 25 L 0 0 25 0"
        stroke="rgba(0, 0, 0, 0.2)"
        stroke-width="1"
        fill="none"
      ></path>
    </pattern>
    <!--grid-pattern-->
    <g id="box">
      <path
        id="boxPath"
        fill="transparent"
        d="M 395 195 L 15 195 L 5 185 L 5 10 L 10 5 h 30 L 45 10 L 385 10 L 395 20 Z"
      ></path>
      <line
        stroke-width="3"
        stroke-linecap="round"
        stroke-dasharray="6,4"
        x1="12"
        y1="10"
        x2="38"
        y2="10"
      ></line>
    </g>
  </defs>
  <rect
    stroke="#aaa"
    width="400"
    height="200"
    x="0"
    y="0"
    fill="url(#grid)"
  ></rect><!--grid-rect-->
  <use stroke="#6586ec" stroke-width="1" xlink:href="#box"></use>
</svg>
</template>
```
:::

## 新增描边 ##

为了使描边与现有的边框互不影响，这里需要再绘制一次路径：

为了使效果更明显，将背景色调成暗色

:::demo

```vue
<template>
<svg width="400" height="200">
  <defs>
    <pattern
      id="gridUnit"
      x="0"
      y="0"
      width="5"
      height="5"
      patternUnits="userSpaceOnUse"
    >
      <path
        d="M 0 5 L 0 0 5 0"
        stroke="rgba(0, 0, 0, 0.1)"
        stroke-width="1"
        fill="none"
      ></path>
    </pattern>
    <pattern
      id="grid"
      x="0"
      y="0"
      width="25"
      height="25"
      patternUnits="userSpaceOnUse"
    >
      <rect width="25" height="25" x="0" y="0" fill="url(#gridUnit)"></rect>
      <path
        d="M 0 25 L 0 0 25 0"
        stroke="rgba(0, 0, 0, 0.2)"
        stroke-width="1"
        fill="none"
      ></path>
    </pattern>
    <!--grid-pattern-->
    <g id="box">
      <path
        id="boxPath"
        fill="transparent"
        d="M 395 195 L 15 195 L 5 185 L 5 10 L 10 5 h 30 L 45 10 L 385 10 L 395 20 Z"
      ></path>
      <line
        stroke-width="3"
        stroke-linecap="round"
        stroke-dasharray="6,4"
        x1="12"
        y1="10"
        x2="38"
        y2="10"
      ></line>
    </g>
  </defs>
  <rect
    stroke="#aaa"
    width="400"
    height="200"
    x="0"
    y="0"
    fill="url(#grid)"
  ></rect><!--grid-rect-->
  <use stroke="#6586ec" stroke-width="1" xlink:href="#box"></use>
  <use
    stroke="#4fd2dd"
    stroke-linecap="round"
    stroke-width="3"
    xlink:href="#box"
  ></use>
</svg>
</template>
```
:::

## 实现遮罩 ##

绘制一个circle元素作为遮罩，为了使流动效果不生硬，还需制作一个渐变效果：

:::demo

```vue
<template>
<svg width="400" height="200">
  <defs>
    <pattern
      id="gridUnit"
      x="0"
      y="0"
      width="5"
      height="5"
      patternUnits="userSpaceOnUse"
    >
      <path
        d="M 0 5 L 0 0 5 0"
        stroke="rgba(0, 0, 0, 0.1)"
        stroke-width="1"
        fill="none"
      ></path>
    </pattern>
    <pattern
      id="grid"
      x="0"
      y="0"
      width="25"
      height="25"
      patternUnits="userSpaceOnUse"
    >
      <rect width="25" height="25" x="0" y="0" fill="url(#gridUnit)"></rect>
      <path
        d="M 0 25 L 0 0 25 0"
        stroke="rgba(0, 0, 0, 0.2)"
        stroke-width="1"
        fill="none"
      ></path>
    </pattern>
    <!--grid-pattern-->
    <g id="box">
      <path
        id="boxPath"
        fill="transparent"
        d="M 395 195 L 15 195 L 5 185 L 5 10 L 10 5 h 30 L 45 10 L 385 10 L 395 20 Z"
      ></path>
      <line
        stroke-width="3"
        stroke-linecap="round"
        stroke-dasharray="6,4"
        x1="12"
        y1="10"
        x2="38"
        y2="10"
      ></line>
    </g>
    <radialGradient id="radialGradient" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#fff" stop-opacity="1"></stop>
      <stop offset="1" stop-color="#fff" stop-opacity="0"></stop>
    </radialGradient>
    <mask id="mask">
      <circle cx="0" cy="0" r="150" fill="url(#radialGradient)"></circle>
    </mask>
  </defs>
  <rect
    stroke="#aaa"
    width="400"
    height="200"
    x="0"
    y="0"
    fill="url(#grid)"
  ></rect><!--grid-rect-->
  <use stroke="#235fa7" stroke-width="1" xlink:href="#box"></use>
  <use
    stroke="#4fd2dd"
    stroke-linecap="round"
    stroke-width="3"
    xlink:href="#box"
    mask="url(#mask)"
  ></use>
</svg>
</template>
```
:::

mask元素的内容是一个单一的circle元素，它填充了一个白色到透明的渐变。作为应用mask的目标对象继承mark内容的alpha值（透明度）的结果，效果如下：

## 添加动画 ##

现在只需让mask元素随着边框路径动起来就行了，animateMotion 元素定义了一个元素如何沿着运动路径进行移动。
备注： 为了复用一个已经定义的路径，就有必要使用一个mpath元素嵌入到animateMotion中，而不是使用 path

:::demo

```vue
<template>
<svg width="400" height="200">
  <defs>
    <pattern
      id="gridUnit"
      x="0"
      y="0"
      width="5"
      height="5"
      patternUnits="userSpaceOnUse"
    >
      <path
        d="M 0 5 L 0 0 5 0"
        stroke="rgba(0, 0, 0, 0.1)"
        stroke-width="1"
        fill="none"
      ></path>
    </pattern>
    <pattern
      id="grid"
      x="0"
      y="0"
      width="25"
      height="25"
      patternUnits="userSpaceOnUse"
    >
      <rect width="25" height="25" x="0" y="0" fill="url(#gridUnit)"></rect>
      <path
        d="M 0 25 L 0 0 25 0"
        stroke="rgba(0, 0, 0, 0.2)"
        stroke-width="1"
        fill="none"
      ></path>
    </pattern>
    <!--grid-pattern-->
    <g id="box">
      <path
        id="boxPath"
        fill="transparent"
        d="M 395 195 L 15 195 L 5 185 L 5 10 L 10 5 h 30 L 45 10 L 385 10 L 395 20 Z"
      ></path>
      <line
        stroke-width="3"
        stroke-linecap="round"
        stroke-dasharray="6,4"
        x1="12"
        y1="10"
        x2="38"
        y2="10"
      ></line>
    </g>
    <radialGradient id="radialGradient" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#fff" stop-opacity="1"></stop>
      <stop offset="1" stop-color="#fff" stop-opacity="0"></stop>
    </radialGradient>
    <mask id="mask">
    <circle cx="395" cy="195" r="150" fill="url(#radialGradient)">
      <animateMotion dur="4s" repeatCount="indefinite" rotate="auto">
        <mpath xlink:href="#boxPath"></mpath>
      </animateMotion>
    </circle>
  </mask>
  </defs>
  <rect
    stroke="#aaa"
    width="400"
    height="200"
    x="0"
    y="0"
    fill="url(#grid)"
  ></rect><!--grid-rect-->
    <use stroke="#235fa7" stroke-width="1" xlink:href="#box"></use>
    <use
    stroke="#4fd2dd"
    stroke-linecap="round"
    stroke-width="3"
    xlink:href="#box"
    mask="url(#mask)"
  >
    <animate
      attributeName="stroke-dasharray"
      from="0,1143"
      to="1143,0"
      dur="4s"
      repeatCount="indefinite"
    ></animate>
  </use>
</svg>
</template>
```
:::

可以看到效果基本就实现了，但是现在由于遮罩整个区域内都存在描边，流动部分透明度变化是0->1->0，如果想实现类似拖尾效果，则需要同时添加与遮罩动画同步的描边动画，这样一来遮罩区域就只会存在运动的描边了，添加如下代码：

```html
<svg>
  ...
  <use
    stroke="#4fd2dd"
    stroke-linecap="round"
    stroke-width="3"
    xlink:href="#box"
    mask="url(#mask)"
  >
    <animate
      attributeName="stroke-dasharray"
      from="0,1143"
      to="1143,0"
      dur="4s"
      repeatCount="indefinite"
    ></animate>
  </use>
</svg>
```

描边动画通常使用stroke-dasharray及stroke-dashoffset实现，这里没有使用stroke-dashoffset，而是直接对stroke-dasharray属性添加动画，从最开始只有gap到gap长度为0的过渡过程就形成了描边动画，注意这里的1143是根据SVGPathElement.getTotalLength()获取的，最终效果：

## 整体代码 ##

:::demo

```vue
<template>
  <div class="body">
    <svg width="400" height="200">
      <defs>
        <pattern
          id="gridUnit"
          x="0"
          y="0"
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 0 5 L 0 0 5 0"
            stroke="rgba(0, 0, 0, 0.1)"
            stroke-width="1"
            fill="none"
          ></path>
        </pattern>
        <pattern
          id="grid"
          x="0"
          y="0"
          width="25"
          height="25"
          patternUnits="userSpaceOnUse"
        >
          <rect width="25" height="25" x="0" y="0" fill="url(#gridUnit)"></rect>
          <path
            d="M 0 25 L 0 0 25 0"
            stroke="rgba(0, 0, 0, 0.2)"
            stroke-width="1"
            fill="none"
          ></path>
        </pattern>
        <g id="box">
          <path
            id="boxPath"
            fill="transparent"
            d="M 395 195 L 15 195 L 5 185 L 5 10 L 10 5 h 30 L 45 10 L 385 10 L 395 20 Z"
          ></path>
          <line
            stroke-width="3"
            stroke-linecap="round"
            stroke-dasharray="6,4"
            x1="12"
            y1="10"
            x2="38"
            y2="10"
          ></line>
        </g>
        <radialGradient id="radialGradient" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stop-color="#fff" stop-opacity="1"></stop>
          <stop offset="1" stop-color="#fff" stop-opacity="0"></stop>
        </radialGradient>
        <mask id="mask">
          <circle cx="0" cy="0" r="150" fill="url(#radialGradient)">
            <animateMotion dur="4s" repeatCount="indefinite" rotate="auto">
              <mpath xlink:href="#boxPath"></mpath>
            </animateMotion>
          </circle>
        </mask>
      </defs>
      <rect
        stroke="#aaa"
        width="400"
        height="200"
        x="0"
        y="0"
        fill="url(#grid)"
      ></rect>
      <use stroke="#235fa7" stroke-width="1" xlink:href="#box"></use>
      <use
        stroke="#4fd2dd"
        stroke-linecap="round"
        stroke-width="3"
        xlink:href="#box"
        mask="url(#mask)"
      >
        <animate
          attributeName="stroke-dasharray"
          from="0,1143"
          to="1143,0"
          dur="4s"
          repeatCount="indefinite"
        ></animate>
      </use>
    </svg>
  </div>
</template>
<style>
body {
        margin: unset;
        display: grid;
        place-content: center;
      }
</style>
```

:::
