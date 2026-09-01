---
lastUpdated: true
commentabled: true
recommended: true
title: CSS实现精美渐变色票据组件
description: 六边缺角与虚线分割的完美结合
date: 2025-11-25 08:45:00 
pageClass: blog-page-class
cover: /covers/css.svg
---

## 背景介绍 ##

在现代Web开发中，优惠券和票据类组件是电商、金融等应用中不可或缺的UI元素。传统的实现方式往往依赖于图片背景或复杂的SVG路径，这不仅增加了资源加载时间，还降低了组件的可维护性和扩展性。

本文将介绍如何使用纯CSS实现一个具有六边缺角效果和虚线分割的精美票据组件，主要运用了以下高级CSS技术：

- CSS Mask 属性：实现复杂的缺角效果
- CSS Grid 布局：精确控制虚线分割的上下区域
- CSS 自定义属性（变量）：提高代码复用性和可维护性
- CSS 渐变：创造丰富的视觉效果

## 效果展示 ##

最终实现的票据组件具有以下特点：

- ✨ 六边缺角效果：四个角落 + 左右两侧中部的圆形缺角
- 🎨 渐变背景：优雅的蓝色渐变色彩
- 📏 虚线分割：中间虚线将内容分为上下两部分，且严格平分容器高度
- 🔧 高度可配置：通过CSS变量轻松调整缺角大小和平滑度
- 📱 响应式友好：支持灵活的布局和尺寸调整

## 核心实现原理 ##

### CSS Mask 属性实现缺角效果 ###

`mask` 属性是CSS中一个强大但相对较新的功能，它允许我们通过遮罩来控制元素的可见部分。

```css
/* 使用径向渐变创建圆形缺角 */
--mask-value: 
  radial-gradient(circle at 0 0, transparent var(--corner-in), black var(--corner-out)),
  radial-gradient(circle at 100% 0, transparent var(--corner-in), black var(--corner-out)),
  radial-gradient(circle at 0 100%, transparent var(--corner-in), black var(--corner-out)),
  radial-gradient(circle at 100% 100%, transparent var(--corner-in), black var(--corner-out)),
  radial-gradient(circle at 0 50%, transparent var(--side-in), black var(--side-out)),
  radial-gradient(circle at 100% 50%, transparent var(--side-in), black var(--side-out));

mask: var(--mask-value);
mask-composite: intersect;
```

**关键点解析**：

- `radial-gradient(circle at x y, ...)`: 在指定位置创建径向渐变
- `transparent` 区域会被"挖掉"，形成缺角效果
- `black` 区域保持可见
- `mask-composite: intersect` 确保多个遮罩的交集效果

### CSS Grid 实现精确的虚线分割 ###

使用CSS Grid布局可以精确控制虚线上下区域的高度分配：

```css
.ticket-content {
  display: grid;
  grid-template-rows: 1fr auto 1fr;
}
```

**布局解析**：

- `1fr auto 1fr`：上部分占1份，虚线占自身高度，下部分占1份
- 这确保了无论内容多少，虚线始终位于容器的垂直中心
- 上下两部分永远平分剩余空间

### CSS 变量提升可维护性 ###

通过CSS自定义属性，我们可以轻松配置缺角效果：

```css
.ticket-four-corners-notch {
  --corner-notch: 12px;  /* 角落缺角尺寸 */
  --side-notch: 10px;    /* 侧边缺角尺寸 */
  --smooth: 0.3px;       /* 平滑度，消除锯齿 */
  
  /* 自动计算渐变位置 */
  --corner-in: calc(var(--corner-notch) - var(--smooth));
  --corner-out: calc(var(--corner-notch) + var(--smooth));
}
```

## 完整代码实现 ##

:::demo

```vue
<template>
   <div class="ticket-container">
        <div style="display: flex; flex-direction: row; gap: 20px; justify-content: center; flex-wrap: wrap;">
            <div class="ticket-four-corners-notch">
                <div class="ticket-content">
                    <div class="ticket-section">
                        <span class="main-amount">¥300</span>
                    </div>
                    <div class="ticket-divider"></div>
                    <div class="ticket-section content-center">
                        <span class="bonus-amount">¥15 代金券</span>
                    </div>
                </div>
            </div>
            <div class="ticket-four-corners-notch">
                <div class="ticket-content">
                    <div class="ticket-section">
                        <span class="main-amount">¥300</span>
                    </div>
                    <div class="ticket-divider"></div>
                    <div class="ticket-section content-center">
                        <span class="bonus-amount">¥15 代金券</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="ticket-four-corners-notch" style="margin-top: 20px;">
            <div class="ticket-content">
                <div class="ticket-section">
                    <span class="main-amount">¥300</span>
                </div>
                <div class="ticket-divider"></div>
                <div class="ticket-section content-center">
                    <span class="bonus-amount">¥15 代金券</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
</script>

<style scoped>
/* =================== 容器样式 =================== */
.ticket-container {
  padding: 20px;
  /* 页面背景：蓝紫色渐变 */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* =================== 票据内容布局 =================== */
.ticket-content {
  position: relative;
  height: 100%;
  /* 关键：使用Grid布局实现精确的三等分 */
  display: grid;
  grid-template-rows: 1fr auto 1fr;  /* 上1份 + 虚线自适应 + 下1份 */
  color: #333;
  z-index: 2;
}

/* =================== 分割线样式 =================== */
.ticket-divider {
  width: 100%;
  margin: 0 auto;
  /* 虚线边框，模拟票据撕裂效果 */
  border-top: 1.5px dashed #d1d5db;
}

/* =================== 内容区域样式 =================== */
.ticket-section {
  text-align: center;
  padding: 8px;
  /* 使用Flexbox确保内容垂直居中 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 主要金额样式 */
.main-amount {
  font-size: 28px;
  font-weight: bold;
  color: #2563eb;  /* 蓝色主题 */
}

/* 优惠券金额样式 */
.bonus-amount {
  font-size: 18px;
  color: #4b5563;  /* 深灰色 */
}

/* =================== 六边缺角实现 =================== */
.ticket-four-corners-notch {
  /* CSS变量：可配置的缺角参数 */
  --corner-notch: 12px;    /* 四角缺角半径 */
  --side-notch: 10px;      /* 左右侧缺角半径 */
  --smooth: 0.3px;         /* 抗锯齿平滑度 */

  /* 自动计算渐变边界，实现平滑过渡 */
  --corner-in: calc(var(--corner-notch) - var(--smooth));
  --corner-out: calc(var(--corner-notch) + var(--smooth));
  --side-in: calc(var(--side-notch) - var(--smooth));
  --side-out: calc(var(--side-notch) + var(--smooth));

  /* 复杂的遮罩定义：六个径向渐变组合 */
  --mask-value: 
    radial-gradient(circle at 0 0, transparent var(--corner-in), black var(--corner-out)),        /* 左上角 */
    radial-gradient(circle at 100% 0, transparent var(--corner-in), black var(--corner-out)),     /* 右上角 */
    radial-gradient(circle at 0 100%, transparent var(--corner-in), black var(--corner-out)),     /* 左下角 */
    radial-gradient(circle at 100% 100%, transparent var(--corner-in), black var(--corner-out)),  /* 右下角 */
    radial-gradient(circle at 0 50%, transparent var(--side-in), black var(--side-out)),          /* 左侧中部 */
    radial-gradient(circle at 100% 50%, transparent var(--side-in), black var(--side-out));       /* 右侧中部 */

  /* =================== 票据基础样式 =================== */
  min-width: 320px;
  height: 120px;
  /* 票据背景：浅色渐变，营造纸质感 */
  background: linear-gradient(90deg, #EEF2FE 0%, #FAFBFD 51%, #E2F0FD 100%);
  overflow: hidden;
  /* 阴影效果，增加层次感 */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  
  /* =================== 性能优化 =================== */
  will-change: transform;           /* 提示浏览器进行硬件加速 */
  transform: translateZ(0);         /* 强制开启硬件加速 */
  backface-visibility: hidden;      /* 隐藏背面，优化渲染 */
  -webkit-font-smoothing: antialiased;      /* WebKit字体平滑 */
  -moz-osx-font-smoothing: grayscale;       /* Firefox字体平滑 */

  /* =================== 应用遮罩效果 =================== */
  mask: var(--mask-value);
  -webkit-mask: var(--mask-value);               /* WebKit兼容性 */
  mask-composite: intersect;                     /* 遮罩组合方式：交集 */
  -webkit-mask-composite: source-in;             /* WebKit遮罩组合 */
}
</style>
```

:::

## 高级CSS属性详解 ##

### CSS Mask 属性 ###

- 作用：通过遮罩控制元素的可见区域
- 语法：`mask: <mask-layer>#`
- 兼容性：现代浏览器支持，需要WebKit前缀

```css
/* 基本语法 */
mask: radial-gradient(circle at x y, color-stop1, color-stop2);

/* 多重遮罩 */
mask: mask1, mask2, mask3;
mask-composite: intersect | add | subtract | exclude;
```

**关键概念**：

- `transparent`：完全透明，该区域被"挖掉"
- `black/white`：完全不透明，该区域保留
- `mask-composite`：控制多个遮罩的组合方式

### CSS radial-gradient 径向渐变 ###

- 作用：创建从中心点向外辐射的圆形或椭圆形渐变效果
- 语法：`radial-gradient([shape size] [at position], color-stop1, color-stop2, ...)`

#### 基础语法详解 ####

```css
/* 完整语法 */
radial-gradient(
  [shape] [size] [at position],
  color-stop1 [percentage],
  color-stop2 [percentage],
  ...
);
```

#### 参数说明 ####

**Shape（形状）**：

- `circle`：圆形渐变（默认）
- `ellipse`：椭圆形渐变

**Size（尺寸）**：

- `closest-side`：渐变到最近边
- `closest-corner`：渐变到最近角
- `farthest-side`：渐变到最远边
- `farthest-corner`：渐变到最远角（默认）
- `具体值`：如 `50px` 或 `50px 30px`

**Position（位置）**：

- `at x y`：指定渐变中心位置
- 支持像素值、百分比、关键字（`top`, `bottom`, `left`, `right`, `center`）

#### 在票据组件中的应用 ####

```css
/* 左上角缺角 */
radial-gradient(circle at 0 0, transparent 11.5px, black 12.5px)
```

**解析**：

- `circle`：创建圆形渐变
- `at 0 0`：渐变中心位于左上角 `（0,0）` 坐标
- `transparent 11.5px`：从中心到 `11.5px` 半径范围内完全透明
- `black 12.5px`：从 `12.5px` 半径开始完全不透明
- `11.5px-12.5px`：`1px` 的过渡区域实现抗锯齿效果

#### 实际渐变效果对比 ####

```css
/* 硬边界（有锯齿） */
radial-gradient(circle at 0 0, transparent 12px, black 12px)

/* 软边界（平滑） */
radial-gradient(circle at 0 0, transparent 11.5px, black 12.5px)

/* 更软的边界 */
radial-gradient(circle at 0 0, transparent 11px, black 13px)
```

#### 径向渐变的其他用法示例 ####

```css
/* 基础圆形渐变 */
background: radial-gradient(circle, red, blue);

/* 椭圆渐变 */
background: radial-gradient(ellipse, red, blue);

/* 指定位置的渐变 */
background: radial-gradient(circle at top left, red, blue);

/* 指定大小的渐变 */
background: radial-gradient(circle 100px, red, blue);

/* 多个颜色停止点 */
background: radial-gradient(circle, red 0%, yellow 50%, blue 100%);

/* 重复径向渐变 */
background: repeating-radial-gradient(circle, red 0px, red 10px, blue 10px, blue 20px);
```

#### 在票据组件中的创新应用 ####

我们的票据组件巧妙地利用了径向渐变的特性：

- 精确定位：使用 `at x y` 精确定位每个缺角的位置
- 透明度控制：通过 `transparent` 和 `black` 创建遮罩效果
- 平滑过渡：利用渐变的过渡特性实现抗锯齿
- 多重组合：通过 `mask-composite: intersect` 组合多个径向渐变

```css
/* 六个缺角的完整定义 */
--mask-value: 
  radial-gradient(circle at 0 0, transparent var(--corner-in), black var(--corner-out)),      /* 左上角 */
  radial-gradient(circle at 100% 0, transparent var(--corner-in), black var(--corner-out)),   /* 右上角 */
  radial-gradient(circle at 0 100%, transparent var(--corner-in), black var(--corner-out)),   /* 左下角 */
  radial-gradient(circle at 100% 100%, transparent var(--corner-in), black var(--corner-out)), /* 右下角 */
  radial-gradient(circle at 0 50%, transparent var(--side-in), black var(--side-out)),        /* 左侧中部 */
  radial-gradient(circle at 100% 50%, transparent var(--side-in), black var(--side-out));     /* 右侧中部 */
```

### CSS Grid 布局 ###

- 作用：创建二维网格布局系统
- 优势：精确控制行列比例，适合复杂布局

```css
/* 关键属性 */
display: grid;
grid-template-rows: 1fr auto 1fr;    /* 行高定义 */
grid-template-columns: 1fr 1fr 1fr;  /* 列宽定义 */

/* fr单位：fraction，表示剩余空间的分数 */
/* auto：根据内容自适应 */
```

### CSS 自定义属性（变量） ###

- 作用：定义可重用的值，提高代码可维护性
- 语法：--variable-name: value

```css
/* 定义变量 */
:root {
  --primary-color: #2563eb;
  --border-radius: 8px;
}

/* 使用变量 */
.element {
  color: var(--primary-color);
  border-radius: var(--border-radius);
}

/* 带默认值的变量 */
.element {
  color: var(--undefined-color, #000);  /* 如果变量未定义，使用黑色 */
}
```

### CSS calc() 函数 ###

- 作用：执行数学计算，支持不同单位混合运算

```css
/* 混合单位计算 */
width: calc(100% - 20px);
font-size: calc(1rem + 2vw);

/* 变量计算 */
--result: calc(var(--base-size) * 1.5);
```

## 浏览器兼容性 ##

|  属性  |  Chrome  |  Firefox  |  Safari  |  Edge  |
| :---------: | :---------: | :---------: | :-------: | :-------: |
|  CSS Mask  |  120+ |  53+  |  15.4+  |  79+  |
|  CSS Grid  |  57+ |  52+  |  10.1+  |  16+  |
|  CSS Variables  |  49+  |  31+  |  9.1+  |  15+  |
|  CSS calc()  |  26+  |  16+  |  7+  |  12+  |

**兼容性建议**：

- 为 `mask` 属性添加 `-webkit-` 前缀
- 考虑为旧版浏览器提供降级方案
- 使用 PostCSS 等工具自动添加前缀

## 总结 ##

本文介绍了如何使用纯CSS实现复杂的票据组件，主要涉及以下技术要点：

- CSS Mask属性：通过多重径向渐变实现六边缺角效果
- CSS Grid布局：精确控制虚线分割的上下区域比例
- CSS变量：提高代码的可维护性和复用性
- 性能优化：使用硬件加速和字体平滑技术

这种实现方式具有以下优势：

- ✅ 纯CSS实现：无需图片资源，减少HTTP请求
- ✅ 高度可定制：通过CSS变量轻松调整样式
- ✅ 性能优秀：利用硬件加速，渲染流畅
- ✅ 可维护性强：代码结构清晰，易于理解和修改
- ✅ 响应式友好：支持灵活的布局适配

希望这篇文章能帮助你在项目中实现更加精美和高效的票据组件！
