---
lastUpdated: true
commentabled: true
recommended: true
title: CSS3 实战：液态水与毛玻璃效果的 5 个实用案例
description: CSS3 实战：液态水与毛玻璃效果的 5 个实用案例
date: 2025-10-15 10:00:00 
pageClass: blog-page-class
cover: /covers/css.svg
---

在现代 UI 设计中，**液态水效果**（模拟水流的流动性、形态变化）和 **毛玻璃效果**（半透明模糊的层次感）是提升界面质感的常用手段。无需依赖 Canvas 或 JavaScript 复杂逻辑，仅用 CSS3 就能实现这些视觉效果——前者核心是 `border-radius` 动态变化与 CSS 动画，后者则依赖 `backdrop-filter` 与半透明背景的配合。本文将通过 5 个实战案例，带你掌握两种效果的实现逻辑与复用技巧。

## 一、核心技术原理速览 ##

在进入案例前，先明确两种效果的核心技术点，帮助你理解后续代码逻辑：

|  效果类型   |      核心 CSS 属性  |    实现逻辑  |
| :-----------: | :-----------: | :-----------: |
| 毛玻璃 | `backdrop-filter: blur(px)`、`background: rgba/rgba()`、`border` | 1. 用半透明背景（`rgba`/`hsla`）让底层内容透出；<br />2. 用 `backdrop-filter: blur()` 模糊底层内容，模拟“毛玻璃”质感；<br />3. 可选加细边框（`rgba(255,255,255,0.5)`）增强边界感。 |
| 液态水 | `border-radius`（双向百分比）、`animation`/`transition`、`background: linear-gradient()` | 1. 用 `border-radius`: 水平占比% 垂直占比% 定义不规则液态形态；<br />2. 用 `animation` 动态切换 `border-radius`/`transform`，模拟水流变形；<br />3. 用渐变背景（`linear-gradient`）模拟水的光泽感。 |

## 二、5 个实战案例 ##

以下案例均包含「效果描述」「完整代码」「核心解析」三部分，代码可直接复制运行，且通过 CSS 变量简化参数修改。

### 案例 1：毛玻璃导航栏（固定顶部+滚动适配） ###

**效果描述**

导航栏固定在页面顶部，背景半透明白色，底层背景图被模糊处理（毛玻璃质感）；滚动页面时，导航栏背景透明度略微提升，增强层次感。

:::demo

```vue
<template>
  <div class="body">
    <nav class="glass-nav">
        <ul>
        <li><a href="#">首页</a></li>
        <li><a href="#">产品</a></li>
        <li><a href="#">案例</a></li>
        <li><a href="#">关于我们</a></li>
        </ul>
    </nav>
  </div>
</template>
<script lang="ts" setup>
    // 监听滚动，添加/移除 scrolled 类
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        document.body.classList.add('scrolled');
      } else {
        document.body.classList.remove('scrolled');
      }
    });
</script>
<style scoped>
    /* 定义 CSS 变量，方便统一修改 */
    /* 背景图（用于体现毛玻璃效果） */
    .body {
      --blur: 12px; /* 模糊程度 */
      --nav-bg: rgba(255, 255, 255, 0.3); /* 初始背景 */
      --nav-bg-scroll: rgba(255, 255, 255, 0.8); /* 滚动后背景 */
      --nav-border: rgba(255, 255, 255, 0.5); /* 边框颜色 */

      min-height: 300px; /* 让页面可滚动 */
      /* 加载背景图 */
      /* background-image: url('/images/zhoushan.jpg'); */
      /* 背景图垂直、水平均居中 */
      /* background-position: center center; */
      /* 背景图不平铺 */
      /* background-repeat: no-repeat; */
      /* 当内容高度大于图片高度时，背景图像的位置相对于viewport固定 */
      /* background-attachment: fixed; */
      /* 让背景图基于容器大小伸缩 */
      /* background-size: cover; */
      /* 设置背景颜色，背景图加载过程中会显示背景色 */
      background-color: #464646;
      position: relative;
      background: url("/images/zhoushan.jpg") center/cover fixed;
      /* background: url("https://picsum.photos/id/1019/1920/1080") center/cover fixed; */
    }

    /* 毛玻璃导航栏 */
    .glass-nav {
      position: absolute; /* 固定顶部 */
      top: 0;
      left: 0;
      width: 100%;
      padding: 1rem 0;
      background: var(--nav-bg);
      backdrop-filter: blur(var(--blur)); /* 核心：背景模糊 */
      -webkit-backdrop-filter: blur(var(--blur)); /* 兼容 Safari */
      border-bottom: 1px solid var(--nav-border);
      transition: background 0.3s ease; /* 背景变化平滑过渡 */
      z-index: 999;
    }

    .glass-nav ul {
      list-style: none;
      display: flex;
      gap: 2rem;
      justify-content: center;
    }

    .glass-nav a {
      text-decoration: none;
      color: #333;
      font-weight: 500;
      font-size: 1.1rem;
    }

    /* 滚动时的导航栏样式 */
    body.scrolled .glass-nav {
      background: var(--nav-bg-scroll);
    }
</style>
```

:::

**核心解析**

- **层次感增强**：通过 `box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1)` 给卡片加柔和阴影，避免卡片与背景“贴死”，增强悬浮感；
- **文字可读性**：卡片背景用浅色半透明（`rgba(255,255,255,0.25)`），文字用白色，对比度适中，避免模糊背景影响文字阅读；
- **圆角设计**：`border-radius: 16px` 让卡片边缘更柔和，与毛玻璃的“通透感”呼应，避免尖锐边缘破坏整体质感。

### 案例 2：毛玻璃内容卡片（承载文字+背景叠加） ###

**效果描述**

内容卡片悬浮在风景背景图上，卡片背景半透明且模糊，内部文字清晰可读，边缘加细边框增强精致感，适合用于博客、产品介绍等场景。

:::demo

```vue
<template>
  <div class="container">
    <div class="glass-card">
      <h2>山间湖景：自然的静谧之美</h2>
      <p>清晨的阳光洒在湖面，波光粼粼如碎金。远处的山峦被薄雾笼罩，偶尔传来几声鸟鸣，打破片刻的宁静。在这里，时间仿佛放慢了脚步，只剩下风与水的低语。</p>
      <p>适合露营、摄影或单纯放空，让身心融入自然，感受远离城市喧嚣的惬意。</p>
      <button>查看更多美景</button>
    </div>
  </div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
    .container {
      --blur: 8px;
      --card-bg: rgba(255, 255, 255, 0.25);
      --card-border: rgba(255, 255, 255, 0.4);
      --card-shadow: 0 8px 32px rgba(31, 38, 135, 0.1); /* 阴影增强层次 */
    
      width: 500px;
      min-height: 200px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: url("/images/zhoushan.jpg") center/cover fixed;
      padding: 2rem;
    }

    /* 毛玻璃卡片 */
    .glass-card {
      width: 100%;
      max-width: 600px;
      padding: 1.5rem;
      background: var(--card-bg);
      backdrop-filter: blur(var(--blur));
      -webkit-backdrop-filter: blur(var(--blur));
      border: 1px solid var(--card-border);
      border-radius: 16px; /* 圆角增强柔和感 */
      box-shadow: var(--card-shadow);
      color: #000;
    }

    .glass-card h2 {
      font-size: 1.8rem;
      margin-bottom: 1rem;
      color: #f8f9fa;
    }

    .glass-card p {
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .glass-card button {
      padding: 0.8rem 2rem;
      background: #fff;
      color: #2c3e50;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .glass-card button:hover {
      background: #f1f1f1;
    }
</style>
```

:::

**核心解析**

- **层次感增强**：通过 `box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1)` 给卡片加柔和阴影，避免卡片与背景“贴死”，增强悬浮感；
- **文字可读性**：卡片背景用浅色半透明 `（rgba(255,255,255,0.25)）`，文字用白色，对比度适中，避免模糊背景影响文字阅读；
- **圆角设计**：`border-radius: 16px` 让卡片边缘更柔和，与毛玻璃的“通透感”呼应，避免尖锐边缘破坏整体质感。

## 案例 3：液态水滴悬停效果（交互变形+光泽感） ##

**效果描述**

一个模拟水滴的圆形元素，鼠标悬浮时，通过动态修改 `border-radius` 变成不规则液态形态，同时轻微放大并调整渐变角度，模拟水流的流动性与光泽感。

:::demo

```vue
<template>
  <div class="container">
    <div class="liquid-drop"></div>
  </div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
    .container {
      --liquid-color1: #6dd5ed; /* 水滴渐变色1 */
      --liquid-color2: #2193b0; /* 水滴渐变色2 */
      --liquid-size: 180px; /* 水滴大小 */
      --transition-time: 0.5s; /* 过渡时长 */

      width: 100%;
      min-height: 200px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f0f7ff;
    }

    /* 液态水滴 */
    .liquid-drop {
      width: var(--liquid-size);
      height: var(--liquid-size);
      /* 初始圆形：border-radius 50% */
      border-radius: 50%;
      /* 渐变背景模拟水的光泽 */
      background: linear-gradient(135deg, var(--liquid-color1), var(--liquid-color2));
      transition: all var(--transition-time) ease; /* 所有属性平滑过渡 */
      cursor: pointer;
      box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.3), /* 内阴影增强立体感 */
                  0 10px 20px rgba(33, 147, 176, 0.2); /* 外阴影增强悬浮感 */
    }

    /* 悬停时的液态变形 */
    .liquid-drop:hover {
      /* 双向 border-radius：水平占比 / 垂直占比，生成不规则形态 */
      border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
      transform: scale(1.05); /* 轻微放大 */
      /* 调整渐变角度，模拟光泽移动 */
      background: linear-gradient(150deg, var(--liquid-color1), var(--liquid-color2));
    }
</style>
```

:::

**核心解析**

- **液态形态核心**：`border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%` 是关键——斜杠前是水平方向的四个角占比，斜杠后是垂直方向的四个角占比，通过调整这组数值，可生成任意不规则液态形状；
- **光泽感模拟**：用 `linear-gradient(135deg, ...)` 实现渐变背景，悬停时修改角度（150deg），让光泽“流动”；内阴影 `inset 0 0 20px rgba(255,255,255,0.3)` 模拟水的反光，增强立体感；
- **过渡平滑度**：`transition: all 0.5s ease` 让形态、大小、背景的变化更自然，避免生硬跳变。

## 案例 4：液态按钮点击反馈（按压变形+颜色变化） ##

**效果描述**

按钮默认是柔和的圆角矩形，点击时（`active` 状态）瞬间变成液态不规则形态，同时背景色加深，模拟“按压时水流挤压变形”的反馈，松开后恢复原状，增强交互趣味性。

:::demo

```vue
<template>
  <div class="container">
    <button class="liquid-btn">点击我（液态反馈）</button>
  </div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
    .container {
      --btn-bg: #4a90e2;
      --btn-bg-active: #357abd;
      --btn-radius: 12px; /* 默认圆角 */
      --btn-padding: 1rem 2.5rem;
      --transition-time: 0.2s;

      width: 100%;
      height: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f5f7fa;
    }

    /* 液态按钮 */
    .liquid-btn {
      padding: var(--btn-padding);
      background: var(--btn-bg);
      color: #fff;
      border: none;
      border-radius: var(--btn-radius);
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-time) ease;
      box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
    }

    /* 点击时的液态变形 */
    .liquid-btn:active {
      /* 液态不规则形态 */
      border-radius: 38% 62% 63% 37% / 41% 44% 56% 59%;
      background: var(--btn-bg-active); /* 背景加深，模拟按压 */
      transform: scale(0.98); /* 轻微缩小，增强按压感 */
      box-shadow: 0 2px 8px rgba(74, 144, 226, 0.2); /* 阴影减弱 */
    }
</style>
```

:::

**核心解析**

- **点击反馈逻辑**：利用 `:active` 伪类（元素被按下时触发），瞬间切换 `border-radius` 形态，配合 `transform: scale(0.98)` 和阴影减弱，模拟“按压下沉”的物理感；
- **颜色反馈**：点击时背景色从 `#4a90e2` 加深到 `#357abd`，通过颜色变化强化“按压”认知，比单纯形态变化更直观；
- **过渡时长控制**：`transition: 0.2s` 比悬停效果（0.5s）更短，让点击反馈更“即时”，符合用户对按钮的交互预期。

## 案例 5：综合案例：毛玻璃+液态水登录表单 ##

**效果描述**

登录表单背景为毛玻璃质感（模糊底层背景图），输入框聚焦时，边框变成液态流动动画；提交按钮 hover 时呈现液态变形，同时表单整体有轻微悬浮阴影，兼顾美观与交互性。

:::demo

```vue
<template>
  <div class="body">
    <form class="glass-liquid-form">
      <h2>用户登录</h2>
      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" placeholder="请输入用户名" required>
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" placeholder="请输入密码" required>
      </div>
      <button type="submit" class="liquid-submit">登录</button>
    </form>
  </div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
    .body {
      --blur: 10px;
      --form-bg: rgba(255, 255, 255, 0.2);
      --form-border: rgba(255, 255, 255, 0.5);
      --liquid-color: #74b9ff;
      --input-bg: rgba(255, 255, 255, 0.8);
      --transition-time: 0.4s;

      width: 100%;
      min-height: 200px;
      background: url("/images/grass.jpg") center/cover fixed;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }

    /* 毛玻璃表单容器 */
    .glass-liquid-form {
      width: 100%;
      max-width: 450px;
      padding: 2.5rem;
      background: var(--form-bg);
      backdrop-filter: blur(var(--blur));
      -webkit-backdrop-filter: blur(var(--blur));
      border: 1px solid var(--form-border);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      color: #fff;
    }

    .glass-liquid-form h2 {
      text-align: center;
      margin-bottom: 2rem;
      font-size: 1.8rem;
    }

    /* 表单组 */
    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.95rem;
    }

    /* 输入框（聚焦时液态边框） */
    .form-group input {
      width: 100%;
      padding: 1rem;
      background: var(--input-bg);
      border: 2px solid transparent; /* 初始透明边框 */
      border-radius: 8px;
      font-size: 1rem;
      transition: border var(--transition-time) ease;
      outline: none;
    }

    /* 聚焦时，边框变成液态颜色 */
    .form-group input:focus {
      border-color: var(--liquid-color);
      box-shadow: 0 0 10px rgba(116, 185, 255, 0.3);
    }

    /* 液态提交按钮 */
    .liquid-submit {
      width: 100%;
      padding: 1rem;
      background: var(--liquid-color);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-time) ease;
      margin-top: 1rem;
    }

    .liquid-submit:hover {
      /* 液态变形 */
      border-radius: 40% 60% 55% 45% / 45% 50% 50% 55%;
      background: #5ba0ff;
      transform: translateY(-2px); /* 轻微上浮，增强交互 */
      box-shadow: 0 6px 16px rgba(116, 185, 255, 0.4);
    }
</style>
```

:::

**核心解析**

- **效果结合逻辑**：表单容器用毛玻璃（`backdrop-filter` + 半透明），输入框聚焦用液态颜色边框，按钮 hover 用液态变形，两种效果分工明确——毛玻璃负责“背景层次”，液态水负责“交互反馈”；
- **输入框体验**：输入框背景用高透明度（`rgba(255,255,255,0.8)`），确保输入文字清晰；聚焦时边框变色+阴影，让用户明确“当前激活状态”；
- **按钮上浮效果**：`transform: translateY(-2px)` 配合阴影增强，让按钮 hover 时不仅有液态变形，还有“上浮”的物理感，交互反馈更丰富。

## 三、兼容性与优化提示 ##

- 兼容性处理：

  - `backdrop-filter`：在 Safari 中需加 `-webkit-` 前缀，IE/Edge 旧版本不支持（可忽略，现代浏览器占比已超 95%）；
  - `border-radius` 双向百分比：所有现代浏览器均支持，无兼容性问题。

- 效果优化：

  - 毛玻璃：模糊值（`blur`）建议在 8-15px 之间，过大易导致背景模糊过度，影响界面辨识度；
  - 液态水：动画时长（`transition`/`animation`）建议在 0.2-0.5s 之间，过慢会显得迟钝，过快会显得生硬；
  - 性能：避免在大量元素上同时使用 `backdrop-filter`（如列表项），可能导致页面卡顿，优先在顶层容器（导航、表单）使用。

## 四、总结 ##

通过本文的 5 个案例，你会发现：CSS3 实现液态水和毛玻璃效果的核心是“组合基础属性+动态控制”——毛玻璃依赖 `backdrop-filter` 与半透明的配合，液态水依赖 `border-radius` 动态变化与动画。这些效果无需复杂代码，却能显著提升界面质感，适合应用在导航、卡片、表单、按钮等高频 UI 元素中。