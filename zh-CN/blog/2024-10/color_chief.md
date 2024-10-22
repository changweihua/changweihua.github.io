---
lastUpdated: true
commentabled: true
recommended: true
title:  ColorThief的介绍与使用
description: ColorThief的介绍与使用
date: 2024-10-22 09:18:00
pageClass: blog-page-class
---

# ColorThief的介绍与使用 #

## 概述 ##

`colorThief` 是一个 Javascript 插件，支持在浏览器端或 Node 环境中使用。`colorThief` 的作用就是通过算法去获取图片的色源。

`Color Thief` 是一个开源的 JavaScript 库，它可以帮助你从任何图像中轻松提取出主导色彩。简单来说，它就像一个`“色彩窃贼”`，可以盗取图像中最突出的颜色，并将它们以调色板的形式呈现出来。

## 能用来做什么？ ##

有了 Color Thief，你可以：

- 在网页设计中快速地找到匹配的背景色或文字颜色。
- 根据一张图片生成相应的配色方案，用于制作海报、封面等设计作品。
- 为摄影博客的文章创建与主题相符的自定义色调。
- 自动为社交媒体分享的图片选择合适的配色方案，使它们更引人注目。

## Color Thief 的特点 ##

以下是 Color Thief 的几个亮点特性：

- 轻量级：Color Thief 的代码体积非常小，容易集成到你的项目中。
- 易用性：只需几行代码，即可开始提取图像颜色。
- 适应性强：Color Thief 可以在各种浏览器环境下运行，包括移动设备。
- 多种色彩提取方法：提供了两种不同的算法（Quantize 和 Average），可以根据需要选择适合的方法。

## API 介绍 ##

`colorThief` 提供两个方法，`getColor` 和 `getPalette`，这两个方法在 Node 环境中都是返回 `Promise`。

### getColor方法 ###

`getColor` 方法接收两个参数 `img` 和 `quality`。

- img：图像源，在浏览器环境中 img 需要传 HTML 元素节点，而在 Node 中,img是图像路径
- quality：可选参数，数值类型，1 或者更大的数字。默认是 10，决定采样时跳过多少像素。值越大，返回速度越快。

### getPalette方法 ###

`getPalette` 方法也是接收 3 个参数，通过聚类相似颜色从图像中获取调色板。返回值为一个数组。它比 `getColor` 方法多了第二个参数，其第二个参数是返回多少个颜色。

## 示例代码 ##

```vue
<template>
  <div class="palette_container" ref="palette">
    <div v-if="categories && categories.length > 0"
      class="w-full grid grid-cols-1 gap-4 px-1 md:px-8 py-8 md:grid-cols-3">
      <div class="linkcard flex flex-col justify-center" v-for="(category, i) in categories">
        <a :href="category.link">
          <p class="description">{{ category.title }}<br><span>{{ category.description }}</span></p>
          <div class="logo">
            <img @mouseenter="handleMouseEnter($event.target,i)" @mouseleave="handleMouseLeave" :style="{opacity:hoverIndex===-1?1:i===hoverIndex?1:0.6,transition:'0.5s'}" crossorigin="anonymous" width="70px" height="70px" :src="`${category.cover || '/logo.png'}`" :alt="category.coverAlt" />
          </div>
        </a>
      </div>
    </div>
    <a-empty v-else></a-empty>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, ref } from 'vue';
import ColorThief from 'colorthief';

const palette = useTemplateRef('palette')

const colorThief = new ColorThief();

interface CategoryItem {
  title: string;
  link: string;
  icon: string;
  description?: string;
  cover?: string;
  coverAlt?: string;
}

defineProps({
  categories: Array<CategoryItem>,
});

//创建响应式变量，用来区分图片的移入和移出的状态
const hoverIndex = ref(-1)
//鼠标移入函数
const handleMouseEnter = async (img, i) => {
  hoverIndex.value = i
  //通过colorThief.getPalette(img,3) 获取图片中的三种颜色
  //getPalette()函数接受两个参数 第一个参数是目标图片，第二个参数是要获取颜色的数量，该函数返回的是一个二维数组 二维数组的每一个元素是 rgb格式的颜色
  const colors = await colorThief.getPalette(img, 3)
  console.log(colors)
  //遍历二维数组 将颜色处理成我们想要的rgb格式
  const nColors = colors.map((c) => `rgb(${c[0]},${c[1]},${c[2]})`)
  //通过操作dom修改页面的背景颜色，将背景颜色设置为向右的三色渐变背景
  palette.value!.style.setProperty('background', `linear-gradient(to right, ${nColors[0]}, ${nColors[1]},${nColors[2]})`);
}

//离开图片时将页面背景颜色重置为白色
const handleMouseLeave = () => {
  hoverIndex.value = -1
  palette.value!.style.setProperty('background', '#fff');
}

</script>

<style lang="less">
.waving-border {
  transition: ease-in-out 0.3s;
  background: linear-gradient(0, var(--vp-c-brand) 2px, var(--vp-c-brand) 2px) no-repeat,
    linear-gradient(-90deg, var(--vp-c-brand) 2px, var(--vp-c-brand) 2px) no-repeat,
    linear-gradient(-180deg, var(--vp-c-brand) 2px, var(--vp-c-brand) 2px) no-repeat,
    linear-gradient(-270deg, var(--vp-c-brand) 2px, var(--vp-c-brand) 2px) no-repeat;
  background-size: 0 2px, 2px 0, 0 2px, 2px 0;
  background-position: left top, right top, right bottom, left bottom;
}

.waving-border:hover {
  background-size: 100% 2px, 2px 100%, 100% 2px, 2px 100%;
}

.description {
  word-break: break-all;
  word-wrap: break-word;
}

.palette_container{
  border-radius: 10px;
}
</style>
```

