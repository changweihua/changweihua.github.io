---
lastUpdated: true
commentabled: true
recommended: true
title: CSS3 媒体查询（Media Queries）深度解析
description: 10 个实战适配案例
date: 2025-10-23 09:35:00 
pageClass: blog-page-class
cover: /covers/css.svg
---

## 引言：媒体查询的核心价值 ##

在移动互联网主导的时代，用户可能通过 *手机、平板、笔记本、桌面显示器* 等多种设备访问同一网页。CSS3 媒体查询（Media Queries）作为响应式 Web 设计（Responsive Web Design, RWD）的核心技术，允许开发者根据 *设备特性（如屏幕宽度、分辨率、方向）* 动态调整 CSS 样式，实现“一套代码适配多端”，无需为不同设备开发独立版本。

媒体查询的本质是：“*当满足某个设备条件时，应用对应的 CSS 规则*”。它解决了传统固定布局在多设备上“要么溢出、要么留白”的痛点，是现代前端开发的必备技能。

## 一、媒体查询核心基础 ##

要灵活使用媒体查询，必须先掌握其语法结构、媒体类型、媒体特性与逻辑操作符。

### 核心语法 ###

媒体查询通过 `@media` 规则定义，基本结构如下：

```css
/* 语法格式 */
@media [媒体类型] and (媒体特性: 值) {
  /* 满足条件时应用的 CSS 样式 */
  选择器 { 样式属性: 值; }
}

/* 示例：屏幕宽度 ≥ 1200px 时，设置容器宽度为 1140px */
@media screen and (min-width: 1200px) {
  .container { width: 1140px; }
}
```

可独立引入外部样式表（适用于样式较多的场景）：

```html
<link rel="stylesheet" media="screen and (max-width: 768px)" href="mobile.css">
```

### 媒体类型（Media Type） ###

指定样式适用的设备类型，目前主流仅需关注 3 种（其他类型如 `tv`、`projection` 已极少使用）：

|  媒体类型   |      说明  |  应用场景  |
| :-----------: | :-----------: | :-----------: |
| `all` | 所有设备（默认值，可省略） | 通用适配 |
| `screen` | 彩色屏幕设备（手机、电脑、平板等） | 绝大多数 Web 场景 |
| `print` | 打印机或打印预览模式 | 打印样式优化（如隐藏导航栏） |

> 注意：`screen` 是最常用的类型，且可省略（如 `@media (min-width: 768px)` 等价于 `@media screen and (min-width: 768px)）`。

### 媒体特性（Media Feature） ###

描述设备的具体属性，需用括号 `()` 包裹，常见特性如下（重点掌握前 4 个）：

|  媒体特性   |      说明  |  单位  |  示例  |
| :-----------: | :-----------: | :-----------: | :-----------: |
| `width` | 视口（viewport）宽度 | px、em、rem | `(min-width: 768px)`（视口 ≥ 768px） |
| `height` | 视口高度 | px、em、rem | `(max-height: 600px)`（视口 ≤ 600px） |
| `device-width` | 设备物理屏幕宽度 | px | 不推荐：受设备像素比（DPR）影响，准确性低 |
| `orientation` | 设备方向 | `portrait`（竖屏）、`landscape`（横屏） | `(orientation: landscape)` |
| `prefers-color-scheme` | 用户系统颜色偏好 | `light`（浅色）、`dark`（深色） | `(prefers-color-scheme: dark)` |
| `resolution` | 屏幕分辨率 | dpi、dpcm | `(min-resolution: 2dppx)`（Retina 屏） |

> 关键区别：`width` 是“视口宽度”（浏览器显示内容的区域），`device-width` 是“设备物理屏幕宽度”。推荐使用 `width`，因为它更贴合网页实际显示效果。

### 逻辑操作符 ###

组合多个条件，实现更精确的适配规则：

- `and`：同时满足多个条件（例：`screen and (min-width: 768px) and (max-width: 1199px)`，平板屏幕）。
- `,`（逗号）：满足任意一个条件（例：`(max-width: 767px), (orientation: portrait)`，移动端或竖屏）。
- `not`：排除某个条件（例：`not print`，非打印设备）。
- `only`：仅当设备完全匹配条件时生效（避免老旧浏览器误解析，例：`only screen and (min-width: 768px)`）。

## 二、关键工作原理与 Viewport ##

媒体查询生效的前提是 *正确配置 Viewport（视口）*，否则即使写了媒体查询，也可能出现“样式错乱”。

### 浏览器解析流程 ###

- 浏览器加载 HTML 时，读取 `<meta name="viewport">` 标签，确定视口大小。
- 解析 CSS 样式，识别 `@media` 规则。
- 检测当前设备特性（如屏幕宽度、方向），匹配对应的媒体查询条件。
- 应用满足条件的 CSS 规则，覆盖默认样式。

### Viewport 元标签的必要性 ###

移动设备默认视口宽度约为 *980px*（模拟桌面端），若不配置 Viewport，网页会被“缩放”以适应屏幕，导致媒体查询失效。

**必须在 HTML 的 `<head>` 中添加以下代码**：

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
```

- `device-width`：让视口宽度等于设备屏幕宽度。
- `initial-scale=1.0`：初始缩放比例为 1（无缩放）。
- `shrink-to-fit=no`：禁止浏览器自动收缩内容（适配 iOS 设备）。

## 三、进阶策略：移动优先 vs 桌面优先 ##

媒体查询的适配思路分为两种，选择哪种直接影响代码结构和维护成本。

### 移动优先（推荐） ###

核心逻辑：先写 移动端样式（默认样式），再用 `min-width` 向上适配平板、PC。

优势：移动设备用户占比高，代码更简洁（避免大量 `max-width` 覆盖）。

示例：

```css
/* 移动端默认样式（≤ 767px） */
.container { width: 100%; padding: 0 15px; }

/* 平板（≥ 768px） */
@media (min-width: 768px) {
  .container { width: 750px; margin: 0 auto; }
}

/* PC（≥ 1200px） */
@media (min-width: 1200px) {
  .container { width: 1140px; }
}
```

### 桌面优先 ###

核心逻辑：先写 PC 端样式（默认样式），再用 max-width 向下适配平板、移动端。

劣势：需频繁覆盖 PC 样式，代码冗余度高。

示例：

```css
/* PC 默认样式（≥ 1200px） */
.container { width: 1140px; margin: 0 auto; }

/* 平板（≤ 1199px） */
@media (max-width: 1199px) {
  .container { width: 750px; }
}

/* 移动端（≤ 767px） */
@media (max-width: 767px) {
  .container { width: 100%; padding: 0 15px; }
}
```

### 两者对比 ###

|  维度   |      移动优先（min-width）  |  桌面优先（max-width）  |
| :-----------: | :-----------: | :-----------: |
| 默认样式 | 移动端 | PC 端 |
| 适配方向 | 从小到大（向上） | 从大到小（向下） |
| 代码冗余度 | 低（少覆盖） | 高（多覆盖） |
| 推荐场景 | 移动端用户为主的项目 | 传统 PC 项目迁移 |

## 四、10 个实战适配案例（一套代码适配 H5/PC） ##

以下案例均采用 **移动优先策略**，基于行业通用断点：

- 移动端：`≤ 767px`
- 平板：`768px ~ 1199px`
- PC：`≥ 1200px`

每个案例包含 完整 `HTML + CSS` 代码 及适配逻辑解析。

### 案例 1：基础两栏/单列布局切换 ###

需求：移动端显示单列内容，PC 端显示“侧边栏+主内容”两栏布局。

:::demo

```vue
<template>
    <div class="layout">
    <aside class="sidebar">侧边栏（导航/广告）</aside>
    <main class="content">主内容区域（文章/列表）</main>
    </div>
</template>
<script lang="ts" setup></script>
<style scoped>
/* CSS：移动优先 */
.layout {
  display: flex;
  flex-direction: column; /* 移动端默认单列 */
  gap: 20px; /* 元素间距 */
  padding: 0 15px;
}

.sidebar, .content {
  padding: 20px;
  border: 1px solid #eee;
}

/* 平板及以上（≥ 768px）：两栏布局 */
@media (min-width: 768px) {
  .layout {
    flex-direction: row; /* 横向排列 */
    max-width: 1140px;
    margin: 0 auto;
  }
  .sidebar {
    width: 25%; /* 侧边栏占 25% */
  }
  .content {
    width: 75%; /* 主内容占 75% */
  }
}

/* PC 端（≥ 1200px）：优化宽度 */
@media (min-width: 1200px) {
  .layout {
    max-width: 1320px;
  }
}
</style>
```

:::

### 案例 2：响应式字体大小 ###

需求：屏幕越小，字体越小（避免移动端文字溢出），且保持可读性。

:::demo

```vue
<template>
    <div class="text-container">
    <h1>响应式标题</h1>
    <p>这是一段响应式文本，在手机和电脑上的字体大小会自动调整，确保阅读体验。</p>
    </div>
</template>
<script lang="ts" setup></script>
<style scoped>
/* CSS：移动优先 */
.text-container {
  padding: 0 15px;
}

h1 {
  font-size: 1.8rem; /* 移动端标题大小 */
  margin-bottom: 1rem;
}

p {
  font-size: 1rem; /* 移动端文本大小 */
  line-height: 1.6;
  color: #333;
}

/* 平板（≥ 768px） */
@media (min-width: 768px) {
  h1 { font-size: 2.2rem; }
  p { font-size: 1.1rem; }
}

/* PC（≥ 1200px） */
@media (min-width: 1200px) {
  .text-container {
    max-width: 800px;
    margin: 0 auto;
  }
  h1 { font-size: 2.5rem; }
  p { font-size: 1.2rem; }
}
</style>
```

:::

### 案例 3：图片自适应与艺术方向 ###

需求：1. 图片宽度自适应容器；2. 移动端显示裁剪后的图片（突出主体），PC 端显示完整图片。

:::demo

```vue
<template>
    <!-- HTML：用 picture 标签实现“艺术方向” -->
    <div class="img-container">
    <picture>
        <!-- 移动端（≤ 767px）：加载裁剪图 -->
        <!-- <source media="(max-width: 767px)" srcset="../../../public/images/ScrumModel.jpg"> -->
        <!-- 平板及以上：加载完整图 -->
        <!-- <img src="../../../public/images/giteaops.png" alt="响应式图片" class="responsive-img"> -->
    </picture>
    </div>
</template>
<script lang="ts" setup></script>
<style scoped>

/* CSS */
.img-container {
  padding: 0 15px;
  max-width: 1200px;
  margin: 0 auto;
}

.responsive-img {
  width: 100%; /* 图片宽度自适应容器 */
  height: auto; /* 保持宽高比，避免拉伸 */
  border-radius: 8px;
}
</style>
```

:::


### 案例 4：导航栏（横向 → 汉堡菜单） ###

需求：移动端显示“汉堡按钮”（点击展开菜单），PC 端显示横向导航。

:::demo

```vue
<template>
    <nav class="navbar">
    <button class="hamburger" ref="hamburger">☰</button>
    <ul class="nav-menu" ref="navMenu">
        <li><a href="#">首页</a></li>
        <li><a href="#">产品</a></li>
        <li><a href="#">关于</a></li>
        <li><a href="#">联系</a></li>
    </ul>
    </nav>
</template>
<script lang="ts" setup>
import { onMounted, useTemplateRef } from 'vue'

const hamburger = useTemplateRef('hamburger')
const navMenu = useTemplateRef('navMenu')

onMounted(() => {
    // 简单 JS 实现汉堡按钮切换

    hamburger.value.addEventListener('click', () => {
    navMenu.value.classList.toggle('active');
    });
})
</script>
<style scoped>
/* CSS：移动优先 */
.navbar {
  background-color: #333;
  padding: 0 15px;
}

/* 汉堡按钮（移动端显示） */
.hamburger {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  padding: 15px 0;
  cursor: pointer;
}

/* 导航菜单（移动端默认隐藏，点击展开） */
.nav-menu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: none; /* 初始隐藏 */
  flex-direction: column;
  gap: 10px;
}

.nav-menu.active {
  display: flex; /* 点击后显示 */
}

.nav-menu a {
  color: white;
  text-decoration: none;
  padding: 10px 0;
  display: block;
}

/* 平板及以上（≥ 768px）：隐藏汉堡按钮，显示横向菜单 */
@media (min-width: 768px) {
  .hamburger {
    display: none; /* 隐藏汉堡按钮 */
  }
  .nav-menu {
    display: flex; /* 显示菜单 */
    flex-direction: row; /* 横向排列 */
    gap: 20px;
    padding: 15px 0;
  }
}
</style>
```
:::

### 案例 5：表格移动端横向滚动 ###

需求：PC 端正常显示表格，移动端表格可横向滚动（避免单元格挤压变形）。

:::demo

```vue
<template>
    <!-- HTML：给表格外层加容器 -->
    <div class="table-container">
    <table class="responsive-table">
        <thead>
        <tr>
            <th>姓名</th>
            <th>年龄</th>
            <th>邮箱</th>
            <th>电话</th>
            <th>地址</th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td>张三</td>
            <td>25</td>
            <td>zhangsan@example.com</td>
            <td>13800138000</td>
            <td>北京市朝阳区XXX路</td>
        </tr>
        <!-- 更多数据... -->
        </tbody>
    </table>
    </div>
</template>
<script lang="ts" setup></script>
<style scoped>

/* CSS */
.table-container {
  padding: 0 15px;
  overflow-x: auto; /* 移动端横向滚动 */
  max-width: 1200px;
  margin: 0 auto;
}

.responsive-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.responsive-table th,
.responsive-table td {
  padding: 12px 15px;
  border: 1px solid #ddd;
  text-align: left;
}

.responsive-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

/* PC 端（≥ 1200px）：优化样式 */
@media (min-width: 1200px) {
  .table-container {
    overflow-x: visible; /* 取消滚动 */
  }
  .responsive-table tr:hover {
    background-color: #f9f9f9; /*  hover 效果 */
  }
}
</style>
```

:::

### 案例 6：卡片布局（多列 → 单列） ###

需求：移动端单列卡片，平板双列，PC 四列，实现“自适应网格”。

:::demo

```vue
<template>
    <!-- HTML -->
    <div class="card-container">
    <div class="card">卡片 1</div>
    <div class="card">卡片 2</div>
    <div class="card">卡片 3</div>
    <div class="card">卡片 4</div>
    </div>
</template>
<script lang="ts" setup></script>
<style scoped>

/* CSS：移动优先 */
.card-container {
  display: grid;
  grid-template-columns: 1fr; /* 移动端单列 */
  gap: 20px;
  padding: 0 15px;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 平板（≥ 768px）：双列 */
@media (min-width: 768px) {
  .card-container {
    grid-template-columns: repeat(2, 1fr); /* 2 列等分 */
  }
}

/* PC（≥ 1200px）：四列 */
@media (min-width: 1200px) {
  .card-container {
    grid-template-columns: repeat(4, 1fr); /* 4 列等分 */
  }
}
</style>
```

:::

### 案例 7：元素显示/隐藏控制 ###

需求：移动端隐藏“PC 专属广告位”，PC 端隐藏“移动端悬浮按钮”。

:::demo

```vue
<template>
    <!-- HTML -->
    <div class="ad-pc">PC 端专属广告</div>
    <button class="float-btn-mobile">移动端悬浮按钮（联系客服）</button>
</template>
<script lang="ts" setup></script>
<style scoped>
/* CSS：移动优先 */
/* 移动端：显示悬浮按钮，隐藏 PC 广告 */
.float-btn-mobile {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
}

.ad-pc {
  display: none; /* 移动端隐藏 PC 广告 */
  padding: 20px;
  background-color: #fff3cd;
  margin: 20px 0;
}

/* PC 端（≥ 1200px）：隐藏悬浮按钮，显示 PC 广告 */
@media (min-width: 1200px) {
  .float-btn-mobile {
    display: none;
  }
  .ad-pc {
    display: block;
    max-width: 1200px;
    margin: 20px auto;
  }
}
</style>
```

:::

### 案例 8：按钮尺寸与间距适配 ###

需求：屏幕越小，按钮越小、间距越小（避免移动端按钮占满屏幕）。

:::demo

```vue
<template>
<!-- HTML -->
<div class="btn-group">
  <button class="btn primary-btn">确认</button>
  <button class="btn secondary-btn">取消</button>
</div>
</template>
<script lang="ts" setup></script>
<style scoped>

/* CSS：移动优先 */
.btn-group {
  display: flex;
  gap: 10px; /* 移动端按钮间距 */
  padding: 0 15px;
  max-width: 500px;
  margin: 20px auto;
}

.btn {
  padding: 8px 16px; /* 移动端按钮内边距 */
  border-radius: 4px;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
}

.primary-btn {
  background-color: #007bff;
  color: white;
}

.secondary-btn {
  background-color: #6c757d;
  color: white;
}

/* 平板（≥ 768px）：增大按钮和间距 */
@media (min-width: 768px) {
  .btn-group {
    gap: 15px;
  }
  .btn {
    padding: 10px 20px;
    font-size: 1rem;
  }
}

/* PC（≥ 1200px）：进一步优化 */
@media (min-width: 1200px) {
  .btn:hover {
    opacity: 0.9; /* hover 效果 */
  }
}
</style>
```

:::

### 案例 9：视频/iframe 响应式 ###

需求：视频/iframe（如嵌入的 YouTube 视频）宽度自适应，且保持 16:9 比例（避免拉伸变形）。

:::demo

```vue
<template>
<!-- HTML：给视频外层加容器 -->
<div class="video-container">
  <iframe 
    src="/videos/cover.mp4" 
    frameborder="0" 
    allowfullscreen
  ></iframe>
</div>
</template>
<script lang="ts" setup></script>
<style scoped>

/* CSS：通用适配（无需媒体查询，通过 padding 实现比例） */
.video-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 比例 = 9/16 = 56.25% */
  height: 0; /* 隐藏容器高度，由 padding 撑开 */
  overflow: hidden;
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 15px;
  padding-right: 15px;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%; /* 视频占满容器 */
}

/* PC 端（≥ 1200px）：添加阴影 */
@media (min-width: 1200px) {
  .video-container iframe {
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
}
</style>
```

:::

### 案例 10：跟随系统偏好的深色模式 ###

需求：根据用户系统设置（浅色/深色）自动切换网页主题，且支持手动切换。

:::demo

```vue
<template>
    <div ref="themeContainer" class="theme-container">
        <h2>主题自适应示例</h2>
        <p>当前主题：<span ref="themeText">浅色</span></p>
        <button ref="themeToggle">切换主题</button>
    </div>
</template>
<script lang="ts" setup>
import { onMounted, useTemplateRef } from 'vue';

const themeToggle = useTemplateRef('themeToggle')
const themeText = useTemplateRef('themeText')
const themeContainer = useTemplateRef('themeContainer')

onMounted(() => {
    // 手动切换主题（覆盖系统偏好）
    let isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // 初始化主题文本
    themeText.value.textContent = isDark ? '深色（系统偏好）' : '浅色（系统偏好）';

    themeToggle.value.addEventListener('click', () => {
    isDark = !isDark;
    if (isDark) {
        themeContainer.value.style.setProperty('--bg-color', '#1a1a1a');
        themeContainer.value.style.setProperty('--text-color', 'white');
        themeContainer.value.style.setProperty('--btn-bg', '#0056b3');
        themeText.value.textContent = '深色（手动切换）';
    } else {
        themeContainer.value.style.setProperty('--bg-color', 'white');
        themeContainer.value.style.setProperty('--text-color', '#333');
        themeContainer.value.style.setProperty('--btn-bg', '#007bff');
        themeText.value.textContent = '浅色（手动切换）';
    }
    });
})
</script>
<style scoped>

/* CSS：默认浅色主题 + 媒体查询监听系统偏好 */
.theme-container {
  --bg-color: white;
  --text-color: #333;
  --btn-bg: #007bff;

  padding: 20px 15px;
  background-color: var(--bg-color);
  color: var(--text-color);
  min-height: 200px;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 8px;
}

#theme-toggle {
  padding: 8px 16px;
  background-color: var(--btn-bg);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 监听系统深色偏好（无需手动切换也能生效） */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: white;
    --btn-bg: #0056b3;
  }
  #theme-text {
    content: "深色（系统偏好）";
  }
}

/* PC 端（≥ 1200px）：优化间距 */
@media (min-width: 1200px) {
  .theme-container {
    padding: 30px;
  }
}
</style>
```

:::

## 五、常见问题与解决方案 ##

### 媒体查询不生效？ ###

- 检查是否添加 `viewport` 元标签（必加）。
- 确认媒体特性的单位（如 `min-width: 768` 漏写 `px`）。
- 避免使用 `device-width`，优先用 `width`（适配视口更准确）。

### 样式优先级冲突？ ###

- 媒体查询的选择器权重与普通 CSS 一致，若要覆盖默认样式，需保证选择器权重更高（例：`.container` 无法覆盖 `div.container`）。
- 避免滥用 `!important`，优先通过调整选择器权重解决。

### 断点如何选择？ ###

- 参考行业通用断点（320px、768px、1200px），而非针对特定设备（如 iPhone 14 的 390px）。
- 按“内容断点”调整：当内容出现溢出/留白时，再添加断点（而非固定设备尺寸）。

## 六、总结与未来趋势 ##

CSS3 媒体查询是响应式设计的“基石”，通过它可实现“一套代码适配全端”，大幅降低开发和维护成本。目前，媒体查询仍是前端适配的核心技术，但未来会与 *容器查询（Container Queries）* 互补——容器查询允许根据“父容器尺寸”适配样式（而非仅依赖视口），更适合组件化开发。
