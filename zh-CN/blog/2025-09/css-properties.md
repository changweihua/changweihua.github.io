---
lastUpdated: true
commentabled: true
recommended: true
title: 深入理解CSS变量(Custom Properties)
description: 深入理解CSS变量(Custom Properties)
date: 2025-09-24 14:00:00 
pageClass: blog-page-class
cover: /covers/css.svg
---

## 基础概念与语法 ##

CSS变量也称为CSS自定义属性，使用 `--` 前缀定义：

```css
:root {
  --main-color: #3498db;
  --padding: 15px;
}

.element {
  background-color: var(--main-color);
  padding: var(--padding);
}
```

### 特性 ###

- 以 `--` 开头命名（如 `--main-color`）
- 大小写敏感
- 使用 `var()`函数调用变量
- 可以设置默认值：`var(--color, red)`

## 作用域与优先级 ##

CSS变量遵循CSS层叠规则：

```css
:root {
  --size: 16px;
}

.container {
  --size: 14px; /* 局部覆盖 */
}

.text {
  font-size: var(--size); /* 在.container内是14px，外部是16px */
}
```

### 作用域图解 ###

![](/images/css-properties.jpg){data-zoomable}

## JavaScript动态交互 ##

JavaScript可以实时读取和修改CSS变量：

```js
// 获取变量
const root = document.documentElement;
const color = getComputedStyle(root).getPropertyValue('--main-color');

// 修改变量
root.style.setProperty('--main-color', 'red');

// 动态响应式示例
window.addEventListener('resize', () => {
const fontSize = window.innerWidth < 600 ? '14px' : '16px';
root.style.setProperty('--base-size', fontSize);
});
```

## 实战应用案例 ##

### 案例1：主题切换 ###

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #333333;
}

.dark-mode {
  --bg-primary: #222222;
  --text-primary: #f0f0f0;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s;
}
```

### 案例2：响应式间距系统 ###

```css
:root {
  --spacing: 8px;
}

@media (min-width: 768px) {
  :root {
    --spacing: 16px;
  }
}

.card {
  margin: var(--spacing);
  padding: calc(var(--spacing) * 2);
}
```

## 性能优化建议 ##

- **避免过度嵌套**：深层次的变量引用会增加解析时间
- **合理作用域**：将变量定义在尽可能接近使用的地方
- **动态变量慎用**：频繁通过JS更新的变量可能引起重排
- **预处理器对比**：比 `LESS/SASS` 变量具有运行时可变的优势
- **兼容性处理**：提供 `fallback` 值

```css
/* 推荐写法 */
.element {
color: var(--primary-color, blue); /* 添加默认值 */
font-size: var(--text-size, 16px);
}
```
