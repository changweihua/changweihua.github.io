---
outline: false
aside: false
layout: doc
date: 2025-03
title: 探索 Anime.js：强大的 JavaScript 动画库
description: 探索 Anime.js：强大的 JavaScript 动画库
category: 文档
pageClass: manual-page-class
---

#  探索 Anime.js：强大的 JavaScript 动画库 #

## 前言 ##

在网页开发的世界中，动画效果能够为用户带来更加生动和吸引人的交互体验。

Anime.js 作为一款轻量级的 JavaScript 动画库，以其简单而强大的功能，为开发者提供了丰富的动画创作可能性。

## Anime.js 简介 ##

Anime.js（发音为 /ˈæn.ə.meɪ/）是一个专注于创建各种动画效果的 JavaScript 库。它具有以下显著特点：

- **轻量级**：不会给项目带来过多的负担，确保页面加载和运行的高效性。
- **强大的 API**：能够轻松地操作 CSS 属性、SVG、DOM 属性以及 JavaScript 对象，满足多样化的动画需求。


其应用场景广泛，无论是简单的元素移动、旋转，还是复杂的 SVG 动画、渐变效果等，都能通过 Anime.js 实现。

## 案例展示 ##

### 案例一：基本元素动画 ###

:::demo src=src/demos/anime-1.vue
:::

在这个案例中，选择了所有的 div 元素作为目标。动画过程中，元素会在 800 毫秒内沿 X 轴向右移动 250 像素，同时旋转一圈，并将背景颜色变为白色。


### 案例二：SVG 动画 ###

:::demo

```vue
<template>
  <div class="animite-svg-1" style="width: 100px;height: 100px;">
    <svg viewBox="0 0 304 112">
  <g stroke="none" fill="none" fill-rule="evenodd">
    <path d="M189.142857,4 C227.456875,4 248.420457,4.00974888 256.864191,4.00974888 C263.817211,4.00974888 271.61219,3.69583517 274.986231,6.63061513 C276.382736,7.84531176 279.193529,11.3814152 280.479499,13.4815847 C281.719344,15.5064248 284.841964,20.3571626 275.608629,20.3571626 C265.817756,20.3571626 247.262478,19.9013915 243.955117,19.9013915 C239.27946,19.9013915 235.350655,24.7304885 228.6344,24.7304885 C224.377263,24.7304885 219.472178,21.0304113 214.535324,21.0304113 C207.18393,21.0304113 200.882842,30.4798911 194.124187,30.4798911 C186.992968,30.4798911 182.652552,23.6245972 173.457298,23.6245972 C164.83277,23.6245972 157.191045,31.5424105 157.191045,39.1815359 C157.191045,48.466779 167.088672,63.6623005 166.666679,66.9065088 C166.378668,69.1206889 155.842137,79.2568633 151.508744,77.8570506 C145.044576,75.7689355 109.126667,61.6405346 98.7556561,52.9785141 C96.4766876,51.0750861 89.3680347,39.5769094 83.4195005,38.5221785 C80.6048001,38.0231057 73.0179337,38.7426555 74.4158694,42.6956376 C76.7088819,49.1796531 86.3280337,64.1214904 87.1781062,66.9065088 C88.191957,70.2280995 86.4690152,77.0567847 82.2060607,79.2503488 C79.2489435,80.7719756 73.1324132,82.8858479 64.7015706,83.0708761 C55.1604808,83.2802705 44.4254811,80.401884 39.1722168,80.401884 C25.7762119,80.401884 24.3280517,89.1260466 22.476679,94.4501705 C21.637667,96.8629767 20.4337535,108 33.2301959,108 C37.8976087,108 45.0757044,107.252595 53.4789069,103.876424 C61.8821095,100.500252 122.090049,78.119656 128.36127,75.3523302 C141.413669,69.5926477 151.190142,68.4987755 147.018529,52.0784879 C143.007818,36.291544 143.396957,23.4057975 145.221196,19.6589263 C146.450194,17.1346449 148.420955,14.8552817 153.206723,15.7880203 C155.175319,16.1716965 155.097637,15.0525421 156.757598,11.3860986 C158.417558,7.71965506 161.842736,4.00974888 167.736963,4.00974888 C177.205308,4.00974888 184.938832,4 189.142857,4 Z" id="suzuka" stroke="currentColor" stroke-width="2"></path>
  </g>
</svg>
<div class="square car motion-path-car" style="transform: translateX(189px) translateY(4px);"></div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
import { animate, svg } from 'animejs';

onMounted(function(){
  // Animate the transforms properties of .car the motion path values
  const carAnimation = animate('.car', {
    ease: 'linear',
    duration: 5000,
    loop: true,
    ...svg.createMotionPath('path')
  });

  // Line drawing animation following the motion path values
  // For demo aesthetic only
  animate(svg.createDrawable('path'), {
    draw: '0 1',
    ease: 'linear',
    duration: 5000,
    loop: true
  });
})
</script>
<style>
#svg-createmotionpath .car {
  position: absolute;
  width: 16px;
  height: 8px;
  left: -8px;
  top: -5px;
  color: red;
}

#svg-createmotionpath .docs-demo-template .car {
  display: none;
}
</style>
```

:::

这里针对 SVG 中的路径元素进行动画操作。在 2000 毫秒内，路径的 d 属性会从初始状态逐渐变为指定的贝塞尔曲线路径，动画的缓动效果为 easeInOutQuad，使动画过渡更加自然。


### 案例三：元素组动画（Staggering 动画） ###

:::demo

```vue
<template>
  <div class="anime-item" style="width: 50px;height: 50px;"></div>
  <div class="anime-item" style="width: 50px;height: 50px;"></div>
  <div class="anime-item" style="width: 50px;height: 50px;"></div>
  <div class="anime-item" style="width: 50px;height: 50px;"></div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
import { animate, stagger } from 'animejs';

onMounted(function(){
  const items = document.querySelectorAll('.anime-item');

  animate(items,{
    translateX: 100,
    opacity: 1,
    delay: stagger(100),
    duration: 1000
  });
})
</script>
<style scoped>
.anime-item {
  background: red;
}
</style>
```

:::

此案例中，选择了类名为 item 的一组元素。每个元素会在 1000 毫秒内沿 X 轴移动 100 像素并渐变为完全不透明。
delay 属性使用了 `stagger(100)`，这会使每个元素的动画启动时间间隔 100 毫秒，从而创建出一种错落有致的动画效果。

### 案例四：渐变地形动画 ###

:::demo

```vue
<template>
  <div id="gradient" style="width: 100px;height: 100px;"></div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
import { animate } from 'animejs';


onMounted(function(){
  const gradientElement = document.getElementById('gradient');

  animate(gradientElement, {
    backgroundImage: 'linear-gradient(to bottom, #FF0000, #0000FF)',
    duration: 3000,
    easing: 'linear',
    direction: 'alternate',
    loop: true
  });
})
</script>
```

:::

在这个示例中，针对一个具有渐变背景的元素进行动画设置。在 3000 毫秒内，背景渐变颜色会从红色到蓝色线性过渡，缓动效果为线性，并且动画方向交替，循环播放，营造出一种动态的渐变地形效果。

### 案例五：球体动画 ###

:::demo

```vue
<template>
  <div class="sphere" style="width: 100px;height: 100px;background: red;"></div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
import { animate } from 'animejs';

onMounted(function(){
  const sphere = document.querySelector('.sphere');
  animate(sphere, {
    translateX: '20px',
    translateY: '20px',
    rotateX: '360deg',
    rotateY: '360deg',
    duration: 5000,
    easing: 'easeInOutSine',
    perspective: 1000
  });
})
</script>
```

:::

这里对一个表示球体的元素进行动画操作。在 5000 毫秒内，球体沿着 X 和 Y 轴移动到视口的右下角，同时绕 X 和 Y 轴旋转 360 度，使用 easeInOutSine 缓动函数使动画更加流畅，perspective 属性设置为 1000 以增强 3D 效果。

### 案例六：文字移动动画 ###

:::demo

```vue
<template>
  <h1 class="sphereh1" style="width: 100px;height: 100px;">Hello 你好</h1>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
import { animate } from 'animejs';


onMounted(function(){
  const text = document.querySelector('.sphereh1');
  animate(text, {
    translateX: [-20, 20],
    translateY: [10, -10],
    duration: 4000,
    easing: 'easeInOutBack',
    loop: true
  });
})
</script>
```

:::

此案例中，选择一个标题元素。文字会在 4000 毫秒内沿 X 轴在 -200 到 200 像素之间移动，沿 Y 轴在 100 到 -100 像素之间移动，使用 easeInOutBack 缓动函数，并且循环播放，使文字呈现出活泼的跳动效果。


## 三、总结 ##

Anime.js 为 JavaScript 开发者提供了一个便捷且高效的工具来创建各种精彩的动画效果。

无论是新手还是有经验的开发者，都能通过其简洁的 API 快速上手并实现复杂的动画需求。
它在浏览器中的广泛支持（Chrome 24+、Safari 8+、IE/Edge 11+、Firefox 32+、Opera 15+）也确保了其在不同项目中的可用性。

通过上述案例可以看到，Anime.js 在元素动画、SVG 动画、渐变动画、3D 动画以及文字动画等方面都表现出色，为网页增添了丰富的动态魅力，是网页动画开发的得力助手。

在实际项目中，开发者可以根据具体需求灵活运用 Anime.js 的各种功能，进一步探索和发挥其潜力，创造出更加独特和吸引人的用户界面。
