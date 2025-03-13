---
lastUpdated: true
commentabled: true
recommended: true
title: HTMLElement 和 Element 的区别
description: HTMLElement 和 Element 的区别
date: 2025-03-13 16:00:00
pageClass: blog-page-class
---

# HTMLElement 和 Element 的区别 #

在 DOM（文档对象模型）中，HTMLElement 和 Element 是两个密切相关的接口，但它们的定位和用途不同。以下是它们的区别和联系：

## 继承关系 ##

- Element 是 DOM 的基础接口，表示任何 XML 或 HTML 文档中的元素（例如 <div>、<svg>、自定义元素等）。
  - 继承自 Node（更基础的 DOM 节点接口）。
  - 是其他所有具体元素类型（如 HTMLElement、SVGElement、MathMLElement）的父接口。
- HTMLElement 是 Element 的子接口，专门表示 HTML 文档中的元素。
  - 继承自 Element。
  - 是具体 HTML 元素（如 HTMLDivElement、HTMLInputElement）的父接口。

```text
Node
   └── Element
         └── HTMLElement
               └── HTMLDivElement, HTMLInputElement, etc.
```

## 属性和方法 ##

- Element 提供所有元素通用的属性和方法，例如：
  - id, className, classList, attributes, children, tagName
  - getAttribute(), setAttribute(), querySelector(), querySelectorAll(), closest(), matches()
- HTMLElement 在 Element 的基础上，扩展了 HTML 特有的属性和方法，例如：
  - title, lang, dir, hidden, tabIndex, style, dataset
  - click(), focus(), blur(), accessKey, contentEditable
  - 与用户交互、样式、国际化等相关的功能。

## 使用场景 ##

- Element 用于操作任意类型的元素（包括 HTML、SVG、XML 等）。
  - 例如：document.querySelector("svg") 返回一个 SVGElement（继承自 Element，而非 HTMLElement）。
- HTMLElement 用于操作标准的 HTML 元素。
  - 例如：document.createElement("div") 返回一个 HTMLDivElement（继承自 HTMLElement）。

## 类型安全 ##

- 在 TypeScript 中：
  - 如果操作的是 HTML 元素，应优先使用 HTMLElement 或其子类型（如 HTMLInputElement），以获得类型提示和属性检查。
  - 如果操作的是通用元素（如 SVG 或自定义元素），则使用 Element。

```ts
// 示例 1：操作 HTML 元素
const div = document.createElement("div") as HTMLDivElement;
div.style.color = "red"; // 合法（HTMLElement 的 `style` 属性）
 ​
// 示例 2：操作 SVG 元素
const svg = document.querySelector("svg") as SVGElement;
svg.setAttribute("viewBox", "0 0 100 100"); // 合法（Element 的方法）
```

## 实际代码中的区别 ##

- 所有 HTML 元素（如 <div>、<span>）的 DOM 对象都是 HTMLElement 的子类。
- 非 HTML 元素（如 <svg>、自定义元素）的 DOM 对象是 Element 的其他子类（如 SVGElement）。

```javascript
// HTML 元素属于 HTMLElement
const div = document.querySelector("div");
console.log(div instanceof HTMLElement); // true
console.log(div instanceof Element);     // true
 ​
// SVG 元素属于 Element，但不属于 HTMLElement
const svg = document.querySelector("svg");
console.log(svg instanceof HTMLElement); // false
console.log(svg instanceof Element);     // true
```

## 总结 ##



用途通用元素（HTML/SVG/XML）仅限 HTML 元素继承关系继承自 Node继承自 Element属性和方法通用属性和方法HTML 特有的属性和方法示例元素<svg>, <math>, 自定义元素<div>, <input>, <button>


| 特性 | Element | HTMLElement |
| :---: | :----: | :---: |
| 用途 | 通用元素（HTML/SVG/XML） | 仅限 HTML 元素 |
| 继承关系 | 继承自 Node | 继承自 Element |
| 属性和方法 | 通用属性和方法 | HTML 特有的属性和方法 |
| 示例元素 | <svg>, <math>, 自定义元素 | <div>, <input>, <button> |
