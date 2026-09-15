---
lastUpdated: true
commentabled: true
recommended: true
title: CSS 实现渐变毛玻璃
description: 从 backdrop-filter 到多层 mask
date: 2026-09-14 10:25:00
pageClass: blog-page-class
cover: /covers/kotlin.svg
---

> CSS 实现渐变毛玻璃：从 `backdrop-filter` 到多层 `mask`

在很多现代网页中，底部工具栏、悬浮导航、弹窗和卡片并不是一块完全不透明的背景。它们会保留后方内容的颜色和轮廓，同时把细节柔化掉，看起来像一块半透明的磨砂玻璃。

普通毛玻璃的模糊强度是均匀的，整个区域看起来像盖了一层相同厚度的雾。渐变毛玻璃则不同：模糊会沿着某个方向逐渐增强或减弱，边界更柔和，也更适合做页面底部的过渡遮罩。

例如，一个固定在页面底部的渐变毛玻璃栏，可以让靠近内容区的位置仍然比较清晰，越接近底部越模糊。这样既能让内容自然地过渡到工具栏，又不会突然出现一条明显的白色分界线。

常见使用场景包括：

- 页面底部固定操作栏、返回按钮或聊天输入区；
- 顶部导航和悬浮工具栏；
- 图片或渐变背景上的浮层卡片；
- 需要弱化背景、但又不希望完全遮挡背景的弹窗；
- 滚动内容与固定区域之间的视觉过渡。

这篇文章只讨论渐变毛玻璃，不讨论完整的液态玻璃材质。核心问题也很明确：如何让 `backdrop-filter` 的模糊效果沿一个方向平滑变化？

## 普通毛玻璃为什么不够 ##

最常见的毛玻璃写法是：

```css
.glass {
  background: rgb(255 255 255 / 20%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

`backdrop-filter` 会处理元素背后的内容。`blur(12px)` 表示整个元素区域使用同一个模糊半径，因此它得到的是均匀的毛玻璃。

这种效果适合面积较小的卡片、弹窗和按钮。但如果它被用在一个高度较大的底部区域，就容易出现两个问题：

- 玻璃区域的顶部和底部模糊程度完全一样，层次感比较弱；
- 玻璃区域和页面内容之间像是硬切了一刀，过渡不够自然。

直觉上，我们可能会尝试这样写：

```css
.glass {
  backdrop-filter: blur(0) blur(12px);
}
```

但这并不会产生从 `0px` 到 `12px` 的渐变。`blur()` 是滤镜函数，不是可以直接做插值的背景属性；同一个元素上的多个 `blur()` 也不是“前面小、后面大”的空间渐变。

要实现渐变毛玻璃，需要把问题拆成两部分：

- 用不同元素提供不同强度的模糊；
- 用蒙版控制每个模糊层在哪些位置显示。

## 渐变毛玻璃的基本原理 ##

一个简单的渐变毛玻璃可以拆成下面几层：

```txt
背景内容
    ↓
轻度模糊层：覆盖范围最大
    ↓
中度模糊层：覆盖范围变小
    ↓
重度模糊层：只覆盖目标区域
    ↓
内容和交互层
```

每个模糊层都使用 `backdrop-filter`，但模糊半径不同。例如：

```css
.layer-1 {
  backdrop-filter: blur(1px);
}

.layer-2 {
  backdrop-filter: blur(3px);
}

.layer-3 {
  backdrop-filter: blur(5px);
}

.layer-4 {
  backdrop-filter: blur(7px);
}
```

如果四层都完整显示，效果会变得过于厚重。于是再给每层加一个垂直渐变蒙版：

```css
.layer-1 {
  mask: linear-gradient(to bottom, #000 0 85%, transparent 100%);
}

.layer-2 {
  mask: linear-gradient(to bottom, #000 0 61%, transparent 81%);
}

.layer-3 {
  mask: linear-gradient(to bottom, #000 0 36%, transparent 56%);
}

.layer-4 {
  mask: linear-gradient(to bottom, #000 0 12%, transparent 32%);
}
```

这样一来，轻度模糊覆盖更大的范围，重度模糊只在局部出现，最终叠加出逐渐增强的模糊效果。

这里的 `#000` 不是黑色背景，而是蒙版中的“完全显示”；`transparent` 表示“完全隐藏”。渐变中间的灰度区域则表示按透明度显示这一层。

所以，渐变毛玻璃并不是让一个 `blur()` 自身渐变，而是：

```txt
不同 blur 半径的多层结果
        +
每层不同范围的 mask
        =
空间上逐渐变化的模糊效果
```

## 从 `FrostedSurface` 看多层接力 ##

当前组件的实现正是这个思路。它准备了四组配置：

```ts
const FROSTED_LAYER_CONFIG_LIST = [
    { blur: '1px', solidEnd: '85%', transparentEnd: '100%' },
    { blur: '3px', solidEnd: '61%', transparentEnd: '81%' },
    { blur: '5px', solidEnd: '36%', transparentEnd: '56%' },
    { blur: '7px', solidEnd: '12%', transparentEnd: '32%' },
];
```

每组配置包含两个信息：

- `blur`：当前层的模糊半径；
- `solidEnd` 和 `transparentEnd`：当前层从完全显示过渡到完全透明的位置。

组件再把配置转换为类似下面的 CSS 变量：

```css
.frosted-layer {
  --blur: 5px;
  --mask: linear-gradient(
    to bottom,
    #000 0%,
    #000 36%,
    transparent 56%
  );

  backdrop-filter: blur(var(--blur));
  -webkit-backdrop-filter: blur(var(--blur));
  -webkit-mask: var(--mask);
  mask: var(--mask);
}
```

这种设计有一个重要特点：相邻层的蒙版过渡区是重叠的。

例如，第二层在 `61%` 到 `81%` 之间淡出，第三层在 `36%` 到 `56%` 之间淡出。各层不是在同一条位置突然切换，而是通过重叠的透明度变化逐步接力。

如果把每层的蒙版写成完全不重叠的区间，就可能出现明显的横向分界线：某一层刚消失，下一层还没有完全出现，画面会出现断层。

### 模糊方向 ###

渐变毛玻璃可以向上渐变，也可以向下渐变。改变方向时，通常只需要改变蒙版的方向：

```css
/* 从上到下逐渐淡出这一层 */
mask: linear-gradient(to bottom, #000 0 60%, transparent 100%);

/* 从下到上逐渐淡出这一层 */
mask: linear-gradient(to top, #000 0 60%, transparent 100%);
```

不要为每个方向复制一套层配置。更好的做法是让方向成为一个独立参数，所有模糊层复用同一方向，只保留各层不同的模糊半径和停止位置。

## 一个可以直接运行的 HTML 示例 ##

下面的示例包含完整的 HTML 和内嵌 CSS。把它复制到任意 HTML 文件中即可看到效果。页面背景使用了几个彩色圆形，方便观察玻璃后方内容是如何逐渐变模糊的。

### 完整 HTML ###

:::demo

```vue
<script setup lang="ts">
import type { CSSProperties } from 'vue'

interface BlurLayer {
  id: number
  /** backdrop-filter 模糊半径（px） */
  blur: number
  /** 遮罩渐变，控制该层在底部区域的显示范围 */
  mask: string
}

interface CardItem {
  id: string
  text: string
}

/** 从下往上逐步增强的四层模糊，与 frosted-down 方向一致 */
const blurLayers: BlurLayer[] = [
  {
    id: 1,
    blur: 1,
    mask: 'linear-gradient(to top, #000 0%, #000 85%, transparent 100%)',
  },
  {
    id: 2,
    blur: 3,
    mask: 'linear-gradient(to top, #000 0%, #000 61%, transparent 81%)',
  },
  {
    id: 3,
    blur: 5,
    mask: 'linear-gradient(to top, #000 0%, #000 36%, transparent 56%)',
  },
  {
    id: 4,
    blur: 7,
    mask: 'linear-gradient(to top, #000 0%, #000 12%, transparent 32%)',
  },
]

const cards: CardItem[] = [
  { id: '01', text: '高对比度文字与网格能够清楚显示 backdrop-filter 的模糊变化。' },
  { id: '02', text: '每一层使用不同的 blur 半径，再由 mask 控制它的显示范围。' },
  { id: '03', text: '相邻蒙版的透明过渡区域重叠，避免出现突兀的分界线。' },
]

/** 把 blur / mask 写成 CSS 变量，交给样式表统一消费 */
function layerStyle(layer: BlurLayer): CSSProperties {
  return {
    '--blur': `${layer.blur}px`,
    '--mask': layer.mask,
  } as CSSProperties
}
</script>

<template>
  <main class="demo-page">
    <header class="demo-header">
      <p class="demo-kicker">BACKDROP FILTER / MASK</p>
      <h1>清晰的背景，逐渐变模糊。</h1>
      <p>
        向下滚动页面，观察底部固定区域：越靠近顶部，背后的网格、文字和卡片越清晰；
        越靠近底部，模糊层越多，背景细节越柔和。
      </p>
    </header>

    <section class="background-content" aria-label="用于观察模糊效果的背景内容">
      <article
        v-for="card in cards"
        :key="card.id"
        class="background-card"
      >
        <strong>{{ card.id }}</strong>
        <span>{{ card.text }}</span>
      </article>
    </section>

    <div class="background-line" aria-hidden="true" />

    <aside class="frosted-footer" aria-label="渐变毛玻璃示例">
      <div
        v-for="layer in blurLayers"
        :key="layer.id"
        class="frosted-layer"
        :style="layerStyle(layer)"
        aria-hidden="true"
      />

      <div class="footer-content">
        <div>
          <h2>渐变毛玻璃</h2>
          <p>1px / 3px / 5px / 7px 四层模糊，沿底部方向逐步增强。</p>
        </div>
        <div class="gradient-guide">清晰 → 模糊</div>
      </div>
    </aside>
  </main>
</template>

<style scoped>
.demo-page {
  position: relative;
  min-height: 1800px;
  overflow: hidden;
  padding: 72px clamp(24px, 7vw, 120px) 420px;
  color: #f7f9ff;
  background:
    linear-gradient(rgb(255 255 255 / 7%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 7%) 1px, transparent 1px),
    radial-gradient(circle at 16% 12%, #fa558d 0 7%, transparent 23%),
    radial-gradient(circle at 85% 33%, #407eff 0 8%, transparent 24%),
    radial-gradient(circle at 42% 78%, #ffbd4a 0 7%, transparent 22%),
    linear-gradient(135deg, #10162b, #273965 52%, #10182d);
  background-size: 48px 48px, 48px 48px, auto, auto, auto, auto;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.demo-header {
  position: relative;
  z-index: 1;
  max-width: 720px;
}

.demo-kicker {
  margin: 0 0 18px;
  color: #96b9ff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
}

h1 {
  max-width: 680px;
  margin: 0;
  font-size: clamp(48px, 9vw, 108px);
  letter-spacing: -0.06em;
  line-height: 0.92;
}

.demo-header p {
  max-width: 560px;
  margin: 28px 0 0;
  color: rgb(247 249 255 / 70%);
  font-size: 18px;
  line-height: 1.7;
}

.background-content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 180px;
}

.background-card {
  min-height: 220px;
  padding: 24px;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 20px;
  background: rgb(255 255 255 / 10%);
}

.background-card strong {
  display: block;
  margin-bottom: 54px;
  color: rgb(255 255 255 / 88%);
  font-size: 42px;
  line-height: 1;
}

.background-card span {
  color: rgb(255 255 255 / 64%);
  font-size: 14px;
  line-height: 1.5;
}

.background-line {
  position: absolute;
  top: 620px;
  right: 8%;
  left: 8%;
  height: 1px;
  background: rgb(255 255 255 / 54%);
  transform: rotate(-8deg);
}

.frosted-footer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  height: 280px;
  overflow: hidden;
  border-top: 1px solid rgb(255 255 255 / 58%);
  background: rgb(255 255 255 / 5%);
  isolation: isolate;
  pointer-events: none;
}

.frosted-layer {
  position: absolute;
  inset: 0;
  background: rgb(255 255 255 / 5%);
  pointer-events: none;
  -webkit-backdrop-filter: blur(var(--blur));
  backdrop-filter: blur(var(--blur));
  -webkit-mask: var(--mask);
  mask: var(--mask);
}

.footer-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 100%;
  padding: 32px clamp(24px, 7vw, 120px);
}

.footer-content h2 {
  margin: 0 0 8px;
  font-size: clamp(24px, 4vw, 44px);
  letter-spacing: -0.04em;
}

.footer-content p {
  max-width: 440px;
  margin: 0;
  color: rgb(247 249 255 / 68%);
  line-height: 1.6;
}

.gradient-guide {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgb(247 249 255 / 68%);
  font-size: 12px;
  white-space: nowrap;
}

.gradient-guide::before {
  display: block;
  width: 110px;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    rgb(255 255 255 / 12%),
    rgb(255 255 255 / 88%)
  );
  content: '';
}

@media (max-width: 720px) {
  .demo-page {
    min-height: 1500px;
    padding-top: 48px;
  }

  .background-content {
    grid-template-columns: 1fr;
    margin-top: 100px;
  }

  .background-card {
    min-height: 150px;
  }

  .background-card strong {
    margin-bottom: 24px;
  }

  .frosted-footer {
    height: 240px;
  }

  .footer-content {
    display: block;
    padding-top: 96px;
  }

  .gradient-guide {
    margin-top: 22px;
  }
}
</style>
```

:::

如果想让下方更模糊、上方更清晰，可以把层配置整体反过来，或者把 `to bottom` 改成 `to top`。关键是让更大的模糊半径只出现在需要增强模糊的区域。

## 为什么推荐多层，而不是一层渐变背景 ##

有些实现会写成这样：

```css
.glass {
  background: linear-gradient(
    to bottom,
    rgb(255 255 255 / 4%),
    rgb(255 255 255 / 70%)
  );
  backdrop-filter: blur(12px);
}
```

这段代码可以产生“颜色渐变”，但不能产生“模糊强度渐变”。整个元素仍然使用同一个 `blur(12px)`，变化的只是白色覆盖层的透明度。

颜色渐变有时已经够用，但它和真正的渐变毛玻璃有明显区别：

| 实现方式 | 变化的是什么 | 背景细节的模糊程度 |
| :--- | :--- | :--- |
| 渐变背景 + 单层 blur | 覆盖色的透明度 | 始终相同 |
| 多层 blur + mask | 每层模糊结果的可见范围 | 沿方向变化 |

如果需求只是让区域下方颜色更白，第一种写法更简单；如果需要让背景细节也从清晰逐渐变模糊，就需要多层 `backdrop-filter`。

## `mask-image` 和 `backdrop-filter` 容易踩的坑 ##

### mask 不是背景色 ###

```css
.layer {
  mask-image: linear-gradient(to bottom, #000, transparent);
}
```

这里的黑色不会显示在页面上。`mask` 做的是透明度裁剪：黑色区域显示元素，透明区域隐藏元素，灰色区域半透明显示元素。

因此，单独给一个空元素加 `mask-image`，通常看不到任何东西。需要先确认这个元素本身确实有可见内容，例如 `backdrop-filter` 或半透明背景。

### mask-image 和 mask 的关系 ###

`mask` 是一个 shorthand，除了图像外，还可以统一描述遮罩的位置、大小、重复方式等属性。简单场景可以写 mask-image，但在需要兼容 Safari 或维护多个相关属性时，推荐成对写：

```css
.layer {
  -webkit-mask: var(--mask);
  mask: var(--mask);
}
```

这里的 `-webkit-mask` 不是为了替代标准属性，而是为了覆盖部分 WebKit 内核环境。两者最好使用同一份变量，避免前缀版本和标准版本的渐变参数不一致。

### 不要把 `mask-composite` 当成渐变必需品

`mask-composite` 用来规定多个蒙版之间如何合成，例如相加、相减或相交。

本文的渐变毛玻璃只需要每个模糊层使用一个线性渐变蒙版，因此不需要 `mask-composite`。只有在做镂空、边框蒙版或多个遮罩相减时，才需要引入它。

不必要地加入 `mask-composite` 会增加浏览器差异，尤其是不同内核对组合关键字和前缀的支持并不完全一致。

### backdrop-filter 处理的是背后的内容 ###

backdrop-filter 处理的是元素背后的区域，不是当前元素中的文字和子元素。

因此，下面的元素需要是半透明的：

```css
.glass {
  background: rgb(255 255 255 / 12%);
  backdrop-filter: blur(12px);
}
```

如果写成 `background: #fff`，背景内容会被不透明白色盖住，模糊效果就很难观察到。调试时可以先使用非常低的透明度，例如 `rgb(255 255 255 / 8%)`。

### 圆角和溢出裁剪要放在外层 ###

渐变模糊层一般会使用绝对定位铺满容器：

```css
.frosted-panel {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
}

.frosted-layer {
  position: absolute;
  inset: 0;
}
```

外层的 `overflow: hidden` 负责裁剪模糊层，`border-radius` 负责让内部效果跟随容器圆角。否则模糊可能超出卡片边界，四角出现不规则的矩形区域。

如果页面中还有其他定位层，建议让玻璃容器建立独立层叠上下文：

```css
.frosted-panel {
  isolation: isolate;
}
```

`isolation` 可以减少玻璃装饰层和外部元素发生意外混合的问题，但它不能替代对 `z-index` 和 DOM 层级的检查。

## 如何调节渐变效果 ##

渐变毛玻璃主要调四类参数。

### 模糊半径 ###

```css
--blur: 1px;
--blur: 3px;
--blur: 7px;
```

模糊半径差距太小，视觉上不容易看出渐变；差距太大，又容易出现层次断裂。通常可以从 `1px` / `3px` / `5px` / `7px` 这类小步进开始，再根据背景对比度调整。

### 实色区位置 ###

```css
linear-gradient(to bottom, #000 0 60%, transparent 100%);
```

`60%` 之前是完全显示区域。这个值越大，该层影响的范围越大。

### 透明过渡区 ###

```css
linear-gradient(to bottom, #000 0 60%, transparent 85%);
```

从 `60%` 到 `85%` 是过渡区。过渡区太短会显得生硬，太长则会让多层效果变得过于平均。相邻层的过渡区应该有一定重叠。

### 渐变方向 ###

```css
to bottom
to top
```

底部固定栏通常会让模糊从内容区域向底部增强；顶部导航则可能需要反方向。不要直接照搬停止点，要根据组件所在的位置决定方向。

## 性能和兼容性 ##

### 模糊层越多，成本越高 ###

多层方案的代价是需要多次处理背景。四层可以提供比较平滑的过渡，但并不意味着所有场景都应该固定使用四层。

如果容器面积大、页面滚动频繁，或者运行在性能较弱的移动 WebView 中，可以降为一层：

```css
.frosted-panel--simple {
  background: rgb(255 255 255 / 22%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.frosted-panel--simple .frosted-layer {
  display: none;
}
```

### 提供不支持时的背景 ###

不支持 `backdrop-filter` 的浏览器至少应该有一个可读的背景：

```css
.frosted-panel {
  background: rgb(238 244 255 / 92%);
}

@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .frosted-panel {
    background: rgb(255 255 255 / 8%);
  }
}
```

这样即使模糊没有生效，文字和按钮也不会直接落在复杂背景上。

### 不要只用桌面浏览器截图判断性能 ###

静态截图只能说明效果是否大致正确，不能说明滚动时是否流畅。实际验证时至少要关注：

固定玻璃层是否覆盖了过大的区域；
滚动时是否出现明显掉帧；
Safari、移动浏览器和目标 WebView 是否都能看到模糊；
不支持 `backdrop-filter` 时文字是否仍然清晰。

## 排查顺序 ##

如果渐变毛玻璃没有效果，可以按这个顺序检查：

1. 玻璃层后面是否有明显的彩色或高对比度内容；
2. 玻璃层是否使用了半透明背景，而不是完全不透明的背景；
3. 是否同时写了 `backdrop-filter` 和 `-webkit-backdrop-filter`；
4. 是否同时写了 `mask` 和 `-webkit-mask`；
5. 临时删除蒙版后，单层模糊是否可以正常显示；
6. 外层是否设置了正确的尺寸、圆角和 `overflow: hidden`；
7. 各层的蒙版过渡区是否有重叠；
8. 最后再检查 `z-index`、层叠上下文和浏览器支持情况。

调试时不要一开始同时修改模糊半径、透明度、蒙版方向和层级。先验证单层 backdrop-filter，再加 mask，最后增加其他模糊层，问题会更容易定位。

## 总结 ##

渐变毛玻璃的重点，不是找到一个“神奇的 CSS 属性”，而是把一个模糊效果拆成多个强度不同的层：

- `backdrop-filter` 负责把背景内容模糊；
- mask 负责控制每一层在哪些区域可见；
- 多层不同的 blur 半径负责形成强度差异；
- 重叠的渐变蒙版负责让层与层之间平滑接力；
- 半透明背景、圆角和降级背景负责保证最终可用性。
- 如果只是需要一个普通的半透明卡片，一层 backdrop-filter 就足够了；如果需要让固定区域和页面内容自然过渡，再考虑多层模糊与蒙版。

最实用的经验是：先用两层或三层做出方向正确的效果，再根据背景复杂度调整模糊半径和蒙版停止点。层数越多不一定越好，真正影响观感的是层之间是否连续，以及页面在真实设备上是否仍然流畅。
