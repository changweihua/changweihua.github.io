---
lastUpdated: true
commentabled: true
recommended: true
title: CSS text-decoration-thickness：精细控制文本装饰线粗细的新属性
description: CSS text-decoration-thickness：精细控制文本装饰线粗细的新属性
date: 2025-11-03 10:00:00 
pageClass: blog-page-class
cover: /covers/css.svg
---

在网页文本设计中，下划线（`text-decoration: underline`）、删除线（`line-through`）等文本装饰线是常用的样式元素 —— 它们能突出链接、标记修改内容或强调重点文本。但在`text-decoration-thickness`出现之前，我们只能使用浏览器默认的装饰线粗细，无法根据设计需求调整：想要纤细的下划线匹配优雅的标题，或加粗的删除线突出修改内容，都需要通过复杂的 “伪元素模拟” 方案实现。而 CSS 新增的`text-decoration-thickness`属性，就像一把 “精细的画笔”，让我们能直接控制文本装饰线的粗细，轻松实现个性化的文本样式。今天，我们就来解锁这个提升文本设计精致度的新工具。

## 一、认识 text-decoration-thickness：解决装饰线粗细的 “失控痛点” ##

`text-decoration-thickness` 是 CSS Text Decoration 模块的新增属性，核心作用是：*精确控制文本装饰线（下划线、上划线、删除线、波浪线等）的粗细*，替代传统的 “伪元素模拟” 方案，简化文本装饰线的定制流程。

### 传统文本装饰线的痛点 ###

在 `text-decoration-thickness` 出现前，文本装饰线的粗细完全由浏览器默认控制，存在两大问题：

- 粗细不可控：不同浏览器的默认装饰线粗细不同（如 Chrome 默认下划线约 1px，Safari 默认约 0.8px），导致跨浏览器样式不一致；

- 设计不灵活：无法根据文本大小、风格调整装饰线粗细 —— 例如，大标题需要粗下划线增强视觉权重，小标题需要细下划线保持精致，传统方案只能通过 `border-bottom` 或伪元素（`::after`）模拟，代码繁琐且兼容性复杂。

#### 示例：传统方案的局限 ####

:::demo

```vue
<template>
    <div>
        <p class="default-underline">默认下划线（粗细不可控）</p>
        <p class="simulated-underline">伪元素模拟的下划线（代码繁琐）</p>
    </div>
</template>
<script lang="ts" setup></script>
<style scoped>
.default-underline {
  text-decoration: underline;
  font-size: 1.2rem;
  /* 无法控制下划线粗细，只能使用浏览器默认值 */
}

.simulated-underline {
  font-size: 1.2rem;
  position: relative;
  /* 用伪元素模拟下划线 */
}

.simulated-underline::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px; /* 手动控制“下划线”粗细 */
  background: #4a90e2;
}
</style>
```

:::

- 传统方案的问题：`default-underline` 的下划线粗细不可控；`simulated-underline` 虽能控制粗细，但需要额外的伪元素和定位，且无法与 `text-decoration` 的其他特性（如 `text-underline-offset`、`text-decoration-style: wavy`）结合。

### text-decoration-thickness 的核心价值：精准控制 + 简化代码 ###

`text-decoration-thickness` 直接解决了上述问题，只需一行代码即可控制装饰线粗细，且能与 `text-decoration` 的其他属性无缝配合：

:::demo

```vue
<template>
    <div>
        <p class="default-underline">默认下划线（粗细不可控）</p>
        <p class="simulated-underline">伪元素模拟的下划线（代码繁琐）</p>
        <p class="modern-underline">现代浏览器支持的样式（更精简）</p>
    </div>
</template>
<script lang="ts" setup></script>
<style scoped>
.default-underline {
  text-decoration: underline;
  font-size: 1.2rem;
  /* 无法控制下划线粗细，只能使用浏览器默认值 */
}

.simulated-underline {
  font-size: 1.2rem;
  position: relative;
  /* 用伪元素模拟下划线 */
}

.simulated-underline::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px; /* 手动控制“下划线”粗细 */
  background: #4a90e2;
}

.modern-underline {
  text-decoration: underline;
  text-decoration-color: #4a90e2; /* 装饰线颜色 */
  text-decoration-thickness: 2px; /* 装饰线粗细（精准控制） */
  text-underline-offset: 4px; /* 装饰线与文本的距离（配合使用更精致） */
  font-size: 1.2rem;
}
</style>
```

:::

- 效果：下划线粗细精确控制为 2px，颜色为蓝色，与文本保持 4px 间距，代码简洁且跨浏览器一致性更高；若需改为波浪线，只需添加 `text-decoration-style: wavy` ，无需修改其他逻辑。

## 二、核心用法：灵活的取值与简洁语法 ##

`text-decoration-thickness` 支持多种取值类型，可根据文本大小、设计需求灵活选择，且支持与 `text-decoration` 简写属性结合使用。

### 基础语法与取值类型 ###

```css
/* 单独使用 */
.element {
  text-decoration: underline; /* 必须先设置text-decoration（至少包含样式） */
  text-decoration-thickness: 2px; /* 具体数值（px/em/rem） */
  /* 或其他取值类型 */
}

/* 与text-decoration简写结合（推荐，代码更简洁） */
.element {
  text-decoration: underline #4a90e2 2px; /* 顺序：样式 颜色 粗细 */
}
```

`text-decoration-thickness` 的取值主要分为以下 4 类：

#### 具体数值（最常用） ####

支持 `px`（像素）、`em`（相对当前字体大小）、`rem`（相对根字体大小）等单位，精确控制装饰线粗细：

```css
/* px：固定粗细（适合固定尺寸的文本） */
.px-thickness {
  text-decoration: underline;
  text-decoration-thickness: 1px; /* 纤细下划线 */
}

/* em：相对当前字体大小（适合响应式文本） */
.em-thickness {
  text-decoration: underline;
  text-decoration-thickness: 0.1em; /* 下划线粗细为当前字体大小的10% */
  font-size: 1.5rem; /* 若字体大小变化，下划线粗细自动同步 */
}

/* rem：相对根字体大小（适合全局统一粗细） */
.rem-thickness {
  text-decoration: underline;
  text-decoration-thickness: 0.15rem; /* 基于根字体大小（如根字体16px，则为2.4px） */
}
```

推荐场景：需要精确匹配设计稿的场景（如 UI 规范中明确要求下划线为 2px），或需要与文本大小联动的响应式设计。

#### auto（默认值） ####

使用浏览器默认的装饰线粗细，与未设置 `text-decoration-thickness` 的效果一致：

```css
.auto-thickness {
  text-decoration: underline;
  text-decoration-thickness: auto; /* 等同于默认效果 */
}
```

适用场景：无需自定义粗细，希望保持浏览器默认风格的场景。

#### from-font（从字体文件获取） ####

若字体文件中包含预设的装饰线粗细信息（如部分专业排版字体），则使用字体文件定义的粗细；若字体无相关信息，则 fallback 到auto：

```css
.font-thickness {
  text-decoration: underline;
  text-decoration-thickness: from-font; /* 优先使用字体预设粗细 */
  font-family: "Georgia Pro", serif; /* 假设该字体包含装饰线粗细信息 */
}
```

适用场景：使用专业排版字体（如 Adobe Fonts、Google Fonts 中的高端字体），希望装饰线与字体风格保持一致的场景。

#### 百分比（相对文本字体大小） ####

使用百分比值（如10%）控制装饰线粗细，百分比基于当前文本的字体大小（与em类似，但更直观）：

```css
.percent-thickness {
  text-decoration: underline;
  text-decoration-thickness: 10%; /* 下划线粗细为当前字体大小的10% */
  font-size: 2rem; /* 字体大小2rem（32px），则下划线粗细为3.2px */
}
```

注意：百分比取值在部分旧浏览器（如 Safari 15.4 以下）中不支持，需谨慎使用。

### 与其他文本装饰属性的配合 ###

`text-decoration-thickness` 可与 `text-decoration-style`（装饰线样式）、`text-underline-offset`（下划线偏移量）、`text-decoration-color`（装饰线颜色）等属性结合，实现更丰富的文本样式：

#### 配合 text-decoration-style：不同样式的装饰线 ####

支持实线（solid）、虚线（dashed）、点线（dotted）、波浪线（wavy）等样式，粗细控制对所有样式生效：

:::demo

```vue
<template>
    <div>
        <p class="wavy-underline">波浪线粗细为2px</p>
        <p class="dashed-line-through">虚线删除线粗细为2px</p>
    </div>
</template>
<script lang="ts" setup></script>
<style scoped>
.wavy-underline {
  text-decoration: wavy underline #ff4757;
  text-decoration-thickness: 2px; /* 波浪线粗细为2px */
  text-underline-offset: 3px; /* 波浪线与文本的距离 */
  font-size: 1.2rem;
}

.dashed-line-through {
  text-decoration: dashed line-through #666;
  text-decoration-thickness: 2px; /* 虚线删除线粗细为2px */
}
</style>
```

:::

效果：波浪线下划线粗细均匀，虚线删除线的每一段线条粗细一致，视觉更精致。

#### 配合 text-underline-offset：控制装饰线与文本的距离 ####

`text-underline-offset` 控制装饰线与文本的垂直距离，与 `text-decoration-thickness` 结合可避免装饰线与文本重叠（尤其对粗装饰线）：

```css
.spaced-underline {
  text-decoration: underline #28a745;
  text-decoration-thickness: 3px; /* 较粗的下划线 */
  text-underline-offset: 5px; /* 增加距离，避免与文本底部重叠 */
  font-size: 1.5rem;
}
```

关键：粗装饰线（如 3px 以上）若不设置 `text-underline-offset`，可能会与文本底部的笔画（如下垂的 “g”“y”）重叠，影响可读性。

### 简写属性：text-decoration 的复合用法 ###

为简化代码，`text-decoration` 支持将 “样式、颜色、粗细” 合并为一个简写属性，顺序为：

```css
text-decoration: [style] [color] [thickness];
```

注意：简写时必须包含 `style`（如`underline`、`line-through`），color和thickness可选；若省略color，则使用文本颜色（color属性值）。

#### 示例：简写属性的使用 ####

```css
/* 完整简写：样式（underline）+ 颜色（#4a90e2）+ 粗细（2px） */
.short-hand {
  text-decoration: underline #4a90e2 2px;
  text-underline-offset: 4px; /* 偏移量需单独设置，无法简写 */
}

/* 省略颜色：颜色使用文本颜色（#333），粗细2px */
.short-hand-no-color {
  color: #333;
  text-decoration: underline 2px;
}

/* 省略粗细：使用默认粗细（auto），颜色#ff4757 */
.short-hand-no-thickness {
  text-decoration: line-through #ff4757;
}
```

推荐：优先使用简写属性，减少代码行数；若需设置 `text-underline-offset`，则单独添加（目前`text-decoration`暂不支持偏移量的简写）。

## 三、实战场景：text-decoration-thickness 的典型应用 ##

`text-decoration-thickness` 在需要精细控制文本装饰线的场景中表现出色，以下是几个高频应用案例：

### 场景 1：链接下划线的个性化设计 ###

链接是网页中最常用下划线的元素，`text-decoration-thickness` 可让链接下划线更符合品牌风格：

:::demo

```vue
<template>
    <div>
        <a href="#" class="brand-link">品牌链接（精细下划线）</a>
        <a href="#" class="fancy-link">精致链接（波浪线下划线）</a>
    </div>
</template>
<script lang="ts" setup></script>
<style scoped>
/* 品牌风格链接：粗下划线+蓝色+偏移 */
.brand-link {
  text-decoration: underline #007bff 2px;
  text-underline-offset: 3px;
  color: #007bff;
  text-decoration-thickness: 2px;
  font-size: 1rem;
  transition: all 0.3s;
}

.brand-link:hover {
  text-decoration-thickness: 3px; /* hover时加粗下划线，增强交互反馈 */
}

/* 精致链接：细波浪线+粉色+偏移 */
.fancy-link {
  text-decoration: wavy underline #ff6b81;
  text-decoration-thickness: 1px; /* 纤细波浪线 */
  text-underline-offset: 2px;
  color: #ff6b81;
  font-size: 1rem;
}
</style>
```

:::

效果：品牌链接的下划线粗细随 hover 状态变化，增强交互感；精致链接的纤细波浪线则适合女性向、文艺类网站，提升设计质感。

### 场景 2：标题与正文的装饰线区分 ###

标题和正文的文本大小不同，需要不同粗细的装饰线来匹配视觉权重：

:::demo

```vue
<template>
    <div>
        <h2 class="section-title">章节标题（粗下划线）</h2>
        <p class="section-desc">章节 <span class="keyword">描述文本</span>（细下划线，突出关键词）</p>
    </div>
</template>
<script lang="ts" setup></script>
<style scoped>
/* 章节标题：粗下划线，匹配标题的视觉权重 */
.section-title {
  text-decoration: underline #333;
  text-decoration-thickness: 3px;
  text-underline-offset: 6px;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

/* 章节描述：细下划线，仅突出关键词 */
.section-desc {
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
}

.section-desc .keyword {
  text-decoration: underline #4a90e2;
  text-decoration-thickness: 1px; /* 纤细下划线，不喧宾夺主 */
  text-underline-offset: 2px;
  color: #4a90e2;
}
</style>
```

:::

效果：标题的粗下划线增强视觉引导性，正文关键词的细下划线则在不干扰阅读的前提下突出重点，层次分明。

### 场景 3：删除线与修改标记的粗细控制 ###

在电商页面（折扣价）、文档编辑（修改痕迹）中，删除线的粗细需要根据文本大小调整，确保清晰可见但不刺眼：

:::demo

```vue
<template>
    <div>
        <div class="product-price">
            <span class="original-price">原价：¥299</span>
            <span class="discount-price">折扣价：¥199</span>
        </div>

        <p class="edited-text">
        原始文本：<span class="deleted">这是需要删除的内容</span>， 修改后：<span class="added">这是新增的内容</span>
        </p>
    </div>
</template>
<script lang="ts" setup></script>
<style scoped>
/* 原价删除线：中等粗细，清晰标记但不干扰折扣价 */
.original-price {
  text-decoration: line-through #999;
  text-decoration-thickness: 1.5px;
  font-size: 0.9rem;
  margin-right: 0.5rem;
}

.discount-price {
  font-size: 1.1rem;
  color: #ff4757;
  font-weight: bold;
}

/* 文档修改痕迹：细删除线+粗下划线，区分删除与新增 */
.deleted {
  text-decoration: line-through #ff4757;
  text-decoration-thickness: 1px; /* 细删除线，标记删除 */
  color: #ff4757;
}

.added {
  text-decoration: underline #28a745;
  text-decoration-thickness: 2px; /* 粗下划线，突出新增 */
  color: #28a745;
}
</style>
```

:::

效果：原价的删除线粗细适中，既明确标记 “过时价格”，又不与折扣价争夺视觉焦点；文档修改痕迹通过不同粗细的装饰线，清晰区分删除和新增内容，提升可读性。

### 场景 4：响应式文本的装饰线适配 ###

在响应式设计中，文本大小会随屏幕宽度变化，使用 `em` 或百分比取值的 `text-decoration-thickness` 可让装饰线粗细自动同步：

:::demo

```vue
<template>
    <div>
        <p class="responsive-text">
        这是一段响应式文本，装饰线粗细会随文本大小自动调整
        </p>
    </div>
</template>
<script lang="ts" setup></script>
<style scoped>
.responsive-text {
  text-decoration: underline #4a90e2;
  /* 使用em取值，装饰线粗细为文本大小的8% */
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.1em; /* 偏移量也用em，保持比例一致 */
  /* 响应式字体大小：屏幕越小，字体越小 */
  font-size: clamp(1rem, 3vw, 1.5rem);
}
</style>
```

:::

效果：在大屏幕（如桌面端）上，文本字体大（1.5rem），装饰线粗（0.12rem）；在小屏幕（如移动端）上，文本字体小（1rem），装饰线细（0.08rem），始终保持协调的比例。

## 四、避坑指南：使用 text-decoration-thickness 的注意事项 ##

### 浏览器兼容性与降级处理 ###

`text-decoration-thickness` 是较新的 CSS 属性，兼容性需要重点关注：

|  浏览器   |  支持情况  |
| :-----------: | :-----------: |
| Chrome | 89+（完全支持，包括百分比取值） |
| Firefox | 70+（支持数值和auto，89 + 支持from-font和百分比） |
| Safari | 14.1+（支持数值、auto和from-font，15.4 + 支持百分比） |
| Edge | 89+（与 Chrome 一致，基于 Chromium 内核） |
| IE | 完全不支持（需提供降级方案） |

**降级方案**：针对不支持的浏览器，可通过 “伪元素模拟” 作为 fallback，确保核心视觉效果一致：

```css
/* 现代浏览器：使用原生属性 */
@supports (text-decoration-thickness: 2px) {
  .modern-underline {
    text-decoration: underline #4a90e2;
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }
}

/* 旧浏览器：伪元素模拟 */
@supports not (text-decoration-thickness: 2px) {
  .modern-underline {
    position: relative;
    text-decoration: none; /* 移除默认下划线 */
    color: #4a90e2;
  }

  .modern-underline::after {
    content: "";
    position: absolute;
    bottom: -3px; /* 模拟text-underline-offset */
    left: 0;
    width: 100%;
    height: 2px; /* 模拟text-decoration-thickness */
    background: #4a90e2; /* 模拟text-decoration-color */
  }
}
```

关键：通过 `@supports` 检测浏览器支持情况，不支持时自动切换到伪元素方案，保证所有用户看到的装饰线粗细一致。

### 避免与 text-decoration: none 冲突 ###

若元素设置了 `text-decoration: none`（如默认链接样式），`text-decoration-thickness` 会完全失效 —— 因为装饰线本身已被移除。需确保先启用装饰线样式（如 `underline`、`line-through`），再设置粗细：

```css
/* 错误：text-decoration: none 导致 thickness 无效 */
.link {
  text-decoration: none;
  text-decoration-thickness: 2px; /* 无效果 */
}

/* 正确：先启用 underline，再设置粗细 */
.link {
  text-decoration: underline;
  text-decoration-thickness: 2px; /* 生效 */
  /* 或简写 */
  text-decoration: underline 2px;
}
```

### 处理 “装饰线与文本重叠” 问题 ###

当装饰线较粗（如 3px 以上）或文本包含下垂笔画（如 “g”“y”“q”）时，可能出现装饰线与文本重叠的情况。解决方案有两种：

- 增加 `text-underline-offset`：通过偏移量拉开装饰线与文本的距离（推荐，简单高效）；

```css
.thick-underline {
  text-decoration: underline #333 3px;
  text-underline-offset: 4px; /* 增加偏移，避免重叠 */
}
```

- 调整 `line-height`：适当增大行高，为装饰线预留更多空间（适合多行文本）；

```css
.multi-line-text {
  text-decoration: underline #666 2px;
  line-height: 1.8; /* 增大行高，避免装饰线与下行文本重叠 */
}
```

### 与 “伪元素模拟” 方案的对比：何时选择原生属性？ ###

虽然伪元素模拟能实现类似效果，但text-decoration-thickness在多个方面更具优势，需根据场景选择：

|  对比维度   |  text-decoration-thickness（原生）  |  伪元素模拟（fallback）  |
| :-----------: | :-----------: | :-----------: |
| 代码复杂度 | 1-2 行代码，简洁高效 | 需要额外伪元素 + 定位，代码繁琐 |
| 兼容性 | 现代浏览器支持，旧浏览器需降级 | 兼容所有浏览器（包括 IE） |
| 装饰线样式支持 | 支持实线、虚线、波浪线等所有样式 | 仅支持实线（虚线 / 波浪线需复杂处理） |
| 多行文本适配 | 自动适配多行文本，装饰线不中断 | 需处理换行问题（可能出现断裂） |
| 性能 | 原生属性，性能优（无重排） | 伪元素可能触发重排（定位导致） |

**选择建议**：

- 若项目仅需兼容现代浏览器（Chrome 89+、Safari 14.1+），优先使用原生 `text-decoration-thickness`；

- 若需兼容 IE 或旧版 Safari（14.0 以下），则使用 “原生属性 + 伪元素降级” 的组合方案；

- 若需实现复杂装饰线（如渐变、动画），伪元素模拟仍是更灵活的选择（原生属性暂不支持渐变装饰线）。

### 渐变装饰线的替代方案（扩展知识） ###

`text-decoration-thickness` 暂不支持渐变装饰线（如 `background: linear-gradient(...)`），若需实现渐变下划线，可结合伪元素和原生属性的思路：

```css
.gradient-underline {
  position: relative;
  text-decoration: none; /* 移除默认装饰线 */
  font-size: 1.2rem;
}

/* 用伪元素实现渐变下划线 */
.gradient-underline::after {
  content: "";
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 100%;
  height: 2px; /* 模拟text-decoration-thickness */
  background: linear-gradient(90deg, #4a90e2, #ff6b81); /* 渐变效果 */
}

/* 现代浏览器：添加原生偏移量逻辑（可选） */
@supports (text-underline-offset: 3px) {
  .gradient-underline::after {
    bottom: calc(-1 * var(--offset, 3px)); /* 复用偏移量变量 */
  }
}
```

**说明**：目前原生属性无法实现渐变装饰线，伪元素仍是唯一方案，但可通过变量和 `@supports` 让代码更易维护。

## 五、总结：提升文本设计精致度的 “小而美” 属性 ##

CSS `text-decoration-thickness` 虽然是一个 “小属性”，却解决了长期困扰开发者的文本装饰线粗细控制问题，其核心价值可概括为三点：

- 简化代码，提升效率：替代繁琐的伪元素模拟方案，用 1 行代码实现装饰线粗细控制，减少代码量和维护成本；

- 精细控制，优化体验：支持多种取值类型（数值、em、百分比），可根据文本大小、设计风格灵活调整，让装饰线与文本更协调；

- 生态兼容，无缝配合：与 `text-decoration-style`、`text-underline-offset` 等属性完美兼容，支持实线、虚线、波浪线等多种样式，满足复杂设计需求。

在实际开发中，`text-decoration-thickness` 的最佳实践是：

- 优先使用原生属性，配合 `@supports` 为旧浏览器提供伪元素降级方案；

- 对链接、标题、关键词等需要突出的文本，通过 “粗细 + 偏移” 组合优化装饰线样式；

响应式场景中，使用em或百分比取值，确保装饰线粗细与文本大小同步变化。

> 文本装饰线看似微小，却是提升页面设计精致度的关键细节。`text-decoration-thickness` 的出现，让我们无需再为 “下划线太粗”“删除线太细” 等问题妥协，用更简单的方式实现更专业的文本设计。下次遇到文本装饰需求时，不妨试试这个 “小而美” 的属性 —— 它可能会让你的文本样式瞬间提升一个档次。
