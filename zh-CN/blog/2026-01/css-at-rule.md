---
lastUpdated: true
commentabled: true
recommended: true
title: 一文掌握 CSS 中所有 @规则
description: 包含（@import、@media、@layer 等）
date: 2026-01-28 12:10:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

> CSS 中的 `@规则（At-rules）` 是非常重要却常被忽略的部分。无论你是刚入门，还是在优化大型样式架构，这些“以 @ 开头”的规则都值得你系统了解。

本文将 *一次性梳理所有 CSS 官方定义的 @规则*，并为每个规则附上用法示例、兼容性信息、以及实用小贴士，适合整理到收藏夹或作为长期参考文档。

## 🧾 什么是 @规则？ ##

CSS 的 at-rules 是以 `@` 开头的语句，它们通常用来：

- 引入其他样式表
- 条件性地应用样式（媒体查询、支持检测等）
- 定义动画、字体、层级等全局规则
- 在构建工具或框架中引导样式行为（如 `@tailwind`, `@apply`）

## 🧠 所有 CSS @规则完整清单 + 使用说明 ##

### ✅ `@import` ###

**作用**： 引入外部 CSS 文件。

```css
@import url("theme.css");
```

- 位置：*必须放在样式表顶部*，在其他规则之前
- 注意：*同步阻塞加载*，不推荐用于性能敏感的项目
- 冷知识：你可以使用媒体查询限定导入范围：

```css
@import url("print.css") print;
```

### ✅ `@media` ###

**作用**： 响应式设计的核心，基于视口、屏幕、输入方式等条件有选择性地应用样式。

```css
@media (max-width: 768px) {
  body { font-size: 14px; }
}
```

- 支持的条件包括：`min-width`、`hover`、`pointer`、`orientation` 等
- 冷知识：可以多条件组合：

```css
@media (min-width: 600px) and (orientation: landscape) { ... }
```

### ✅ `@supports` ###

**作用**： 检查浏览器是否支持某一 CSS 属性或语法。

```css
@supports (display: grid) {
  div { display: grid; }
}
```

- 非常适合渐进增强与兼容性处理。
- 冷知识：支持 `not` 和多条件嵌套。

### ✅ `@font-face` ###

**作用**： 引入自定义字体文件。

```css
@font-face {
  font-family: "MyFont";
  src: url("myfont.woff2") format("woff2");
}
```

- 提供 `font-display` 控制加载行为：`swap`、`block`、`fallback`
- 冷知识：你可以在 `unicode-range` 中指定支持的字符子集，加快加载速度。

### ✅ `@keyframes` ###

**作用**： 定义动画关键帧序列。

```css
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
```

- 配合 `animation-name` 使用。
- 冷知识：`from` 和 `to` 是 `0%` 和 `100%` 的语法糖。


### ✅ `@page` ###

**作用**： 为打印样式定义页面边距、方向等。

```css
@page {
  margin: 2cm;
  size: A4 portrait;
}
```

- 仅适用于打印场景。
- 可以通过伪类定制首页、左页、右页：

```css
@page :first { margin-top: 5cm; }
```

### ✅ `@namespace` ###

**作用**： 为 XML 或 SVG 设置命名空间，几乎只用于 XHTML 项目。

```css
@namespace svg url("http://www.w3.org/2000/svg");
svg|circle { fill: red; }
```

- 冷门但在处理复杂 XML/MathML/SVG 样式时可能需要。

### ✅ `@layer`（CSS Layers）

**作用**： 定义样式层级，优雅控制样式优先级，*CSS 的原生分层机制*。

```css
@layer reset, base, theme, components, utilities;

@layer base {
  h1 { font-size: 24px; }
}
```

- 类似 `z-index`，但是样式优先级上的“层” 。
- 冷知识：它可以与 `@import` 结合使用：

```css
@import url("reset.css") layer(reset);
```

- 浏览器支持：Chrome 99+, Safari 15.4+, Firefox 97+

### ✅ `@scope`（CSS Scoped Styles） ###

**作用**： 创建局部样式作用域，只对特定 DOM 区块生效。

```css
@scope (.card) {
  h2 { color: red; }
}
```

- 可以像 `<style scoped>` 一样创建“局部样式表”，但原生支持。
- 冷知识：还可以嵌套多个选择器范围：

```css
@scope (.modal) to (.modal-footer) {
  button { background: green; }
}
```

- 支持：Chrome 117+，Firefox 115+


## 🎯 其他已废弃 / 非标准 / 仅限预处理器的 @规则 ##

### ⛔ `@charset` ###

声明编码格式。只在 CSS 文件顶部用过，现代项目一般使用 UTF-8 默认值，不再常用。

```css
@charset "UTF-8";
```
