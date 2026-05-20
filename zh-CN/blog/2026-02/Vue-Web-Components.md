---
lastUpdated: true
commentabled: true
recommended: true
title: Vue3 与 Web Components 集成
description: Vue 3 与 Web Components 集成
date: 2026-02-04 11:30:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

Vue 3 与 Web Components 的集成非常方便。Web Components 是一组浏览器原生技术，允许开发者创建可重用的自定义 HTML 元素。Vue 3 提供了对 Web Components 的良好支持，可以将 Vue 组件封装为 Web Components，或者在 Vue 项目中使用外部的 Web Components。

## 在 Vue 3 中使用 Web Components ##

Vue 3 可以直接使用外部的 Web Components，只需确保浏览器支持 Web Components 技术（如 Custom Elements 和 Shadow DOM）。

### 示例：使用外部 Web Components ###

假设有一个自定义的 Web Components `<m-hero-logo>`，可以在 Vue 3 中直接使用：

:::demo

```vue
<template>
  <div>
    <m-hero-logo></m-hero-logo>
  </div>
</template>

<script setup>
// 不需要额外的配置
</script>
```

:::

**注意事项**：

- 属性传递：Vue 会将属性（如 `:title="title"`）和事件（如 `@click="handleClick"`）传递给 Web Components。

- 兼容性：确保浏览器支持 Web Components，或者使用 polyfill。

## 将 Vue 组件封装为 Web Components ##

Vue 3 提供了 `defineCustomElement` 方法，可以将 Vue 组件封装为 Web Components。

### 示例：将 Vue 组件封装为 Web Components ###

```vue:MyButton.ce.vue
<template>
  <button @click="handleClick">
    <slot></slot>
  </button>
</template>

<script setup>
function handleClick() {
  console.log('按钮被点击了');
}
</script>
```

```javascript:main.ts
import { defineCustomElement } from 'vue';
import MyButton from './MyButton.ce.vue';

// 将 Vue 组件转换为 Web Components
const MyButtonElement = defineCustomElement(MyButton);

// 注册自定义元素
customElements.define('my-button', MyButtonElement);
```

使用封装后的 Web Components

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Vue Web Components</title>
</head>
<body>
  <my-button>点击我</my-button>

  <script src="./main.js"></script>
</body>
</html>
```

## Vue 组件与 Web Components 的区别 ##

|  特性  |  Vue 组件  |   Web Components  |
| :-----------: | :----: | :----: |
| 技术栈 |  Vue 生态系统  |  浏览器原生技术 |
| 封装性 |  支持作用域样式和逻辑封装  |  使用 Shadow DOM 实现样式和逻辑封装 |
| 跨框架使用 |  仅限于 Vue 项目  |  可以在任何框架或原生 HTML 中使用 |
| 性能 |  依赖 Vue 运行时  |  原生支持，性能更高 |
| 兼容性 |  需要 Vue 运行时  |  需要浏览器支持或 polyfill |

## 在 Vue 3 中使用 Shadow DOM ##

Web Components 通常与 Shadow DOM 结合使用，以实现样式和逻辑的封装。

Vue 3 支持在 Web Components 中使用 Shadow DOM。

### 示例：使用 Shadow DOM ###

```vue:MyButton.ce.vue
<template>
  <button @click="handleClick">
    <slot></slot>
  </button>
</template>

<script lang="ts" setup>
function handleClick() {
  console.log('按钮被点击了');
}
</script>

<style>
button {
  background-color: blue;
  color: white;
}
</style>
```

```javascript:main.ts
import { defineCustomElement } from 'vue';
import MyButton from './MyButton.ce.vue';

// 将 Vue 组件转换为 Web Components，并启用 Shadow DOM
const MyButtonElement = defineCustomElement({
  ...MyButton,
  styles: [MyButton.styles], // 将样式注入 Shadow DOM
});

// 注册自定义元素
customElements.define('my-button', MyButtonElement);
```

## Vue 3 与 Web Components 的事件通信 ##

Vue 组件和 Web Components 之间可以通过自定义事件进行通信。

### 示例：Vue 组件监听 Web Components 事件 ###

:::demo

```vue
<template>
  <my-button @custom-click="handleCustomClick">点击我</my-button>
</template>

<script lang="ts" setup>
function handleCustomClick(event) {
  console.log('收到自定义事件:', event.detail);
}
</script>
```

:::

### 示例：Web Components 触发自定义事件 ###

```vue:MyButton.ce.vue
<template>
  <button @click="handleClick">
    <slot></slot>
  </button>
</template>

<script lang="ts" setup>
function handleClick() {
  const event = new CustomEvent('custom-click', {
    detail: { message: 'Hello from Web Components' },
  });
  dispatchEvent(event);
}
</script>
```

## Vue 3 与 Web Components 的样式隔离 ##

Web Components 使用 Shadow DOM 实现样式隔离，Vue 3 的样式默认不会影响 Web Components，反之亦然。

### 示例：样式隔离 ###

```vue
<template>
  <div class="vue-container">
    <my-button>点击我</my-button>
  </div>
</template>

<style>
.vue-container {
  background-color: lightgray;
}
</style>
```

- Vue 组件的样式不会影响 Web Components 的内部样式。

- Web Components 的样式也不会影响 Vue 组件。

## 工具支持 ##

- Vite：Vite 对 Web Components 提供了开箱即用的支持。

- Vue CLI：Vue CLI 项目可以通过配置 `vue.config.js` 支持 Web Components。

## 总结 ##

- Vue 3 可以轻松集成 Web Components，既可以使用外部的 Web Components，也可以将 Vue 组件封装为 Web Components。

- 使用 `defineCustomElement` 方法可以将 Vue 组件转换为 Web Components。

- Web Components 的 Shadow DOM 提供了样式和逻辑的封装，适合跨框架使用。

> 浏览器原生支持的组件化方案？Web Components深度解毒指南
>
> Web Component 深度解析：构建原生可复用组件

Web Components 是一套由浏览器原生支持的 Web API，它允许开发者创建可重用、封装良好的定制 HTML 元素，从而实现组件化的前端开发模式。本文将深入探讨 Web Components 的核心 API 及其使用方式，并通过丰富的代码示例展示如何构建强大的自定义组件。

## 什么是 Web Component？ ##

Web Components 旨在解决代码复用和组件化管理的问题，它由三项主要技术组成：

- *​​Custom Elements (自定义元素)*​​：允许开发者扩展 HTML 元素集合，通过定义新的标签来创建自定义组件
​- *​Shadow DOM (影子 DOM)*​​：提供封装样式和结构的能力，使组件内部的 CSS 样式不会影响到外部环境，反之亦然
​- *​HTML Templates (HTML 模板)*​​：使用 `<template>` 和 `<slot>` 元素定义组件的内容和可替换区域

这些技术可以一起使用来创建封装功能的定制元素，可以在任何地方重用，不必担心代码冲突。

## 自定义元素 (Custom Elements) ##

### 基本概念 ###

自定义元素分为两种类型：

​- ​独立自定义元素 (Autonomous custom element)​​：继承自 HTML 元素基类 `HTMLElement`，必须从头开始实现它们的行为
​- ​自定义内置元素 (Customized built-in element)​​：继承自标准的 HTML 元素，如 `HTMLParagraphElement` 或 `HTMLImageElement`，扩展标准元素的行为

### 创建自定义元素 ###

自定义元素作为一个类来实现，该类可以扩展 `HTMLElement`（在独立元素的情况下）或者你想要定制的接口（在自定义内置元素的情况下）。

```ts
// 独立自定义元素的最小实现
class PopUpInfo extends HTMLElement {
  constructor() {
    super();
    // 此处编写元素功能
  }
}

// 自定义内置元素的最小实现，该元素定制了<p>元素
class WordCount extends HTMLParagraphElement {
  constructor() {
    super();
    // 此处编写元素功能
  }
}
```

### 注册自定义元素 ###

要使自定义元素在页面中可用，需要调用 `CustomElementRegistry.define()` 方法：

```ts
// 注册独立自定义元素
customElements.define('popup-info', PopUpInfo);

// 注册自定义内置元素
customElements.define('word-count', WordCount, { extends: 'p' });
```

使用方式也有所不同：

```html
<!-- 使用独立自定义元素 -->
<popup-info></popup-info>

<!-- 使用自定义内置元素 -->
<p is="word-count"></p>
```

### 生命周期回调 ###

自定义元素生命周期回调包括：

- `connectedCallback()`：每当元素添加到文档中时调用
- `disconnectedCallback()`：每当元素从文档中移除时调用
- `adoptedCallback()`：每当元素被移动到新文档时调用
- `attributeChangedCallback()`：在属性更改、添加、移除或替换时调用

```javascript
class MyCustomElement extends HTMLElement {
  static observedAttributes = ["color", "size"];

  constructor() {
    super();
  }

  connectedCallback() {
    console.log("自定义元素添加至页面。");
  }

  disconnectedCallback() {
    console.log("自定义元素从页面中移除。");
  }

  adoptedCallback() {
    console.log("自定义元素移动至新页面。");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`属性 ${name} 已变更。`);
  }
}
```

### 响应属性变化 ###

为了有效地使用属性，元素必须能够响应属性值的变化。为此，自定义元素需要：

- 一个名为 `observedAttributes` 的静态属性，包含需要监听的属性名称数组

- 实现 `attributeChangedCallback()` 生命周期回调

```javascript
class MyCustomElement extends HTMLElement {
  static observedAttributes = ["size"];

  constructor() {
    super();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`属性 ${name} 已由 ${oldValue} 变更为 ${newValue}。`);
    // 根据属性变化更新组件
  }
}

customElements.define('my-custom-element', MyCustomElement);
```

使用示例：

```html
<my-custom-element size="100"></my-custom-element>
```

## Shadow DOM (影子 DOM) ##

### 基本概念 ###

Shadow DOM 允许你将一个 DOM 树附加到一个元素上，并且使该树的内部对于在页面中运行的 JavaScript 和 CSS 是隐藏的。关键术语：

​- ​影子宿主 (Shadow host)​​：影子 DOM 附加到的常规 DOM 节点
​- ​影子树 (Shadow tree)​​：影子 DOM 内部的 DOM 树
​- ​影子边界 (Shadow boundary)​​：影子 DOM 终止，常规 DOM 开始的地方
​- ​影子根 (Shadow root)​​：影子树的根节点

### 创建 Shadow DOM ###

```ts
const host = document.querySelector('#host');
const shadow = host.attachShadow({ mode: 'open' });
const span = document.createElement('span');
span.textContent = "I'm in the shadow DOM";
shadow.appendChild(span);
```

`attachShadow()` 方法接受一个配置对象，其中 `mode` 属性可以是：

- `open`：可以通过 `host.shadowRoot` 获取影子 DOM
- `closed`：无法通过 `host.shadowRoot` 获取影子 DOM（返回 null）

### Shadow DOM 的样式封装 ###

Shadow DOM 的一个重要特性是样式封装，组件内部的样式不会影响外部，外部的样式也不会影响组件内部。

```ts
class PopUpInfo extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    
    // 创建一些 CSS 应用于影子 DOM
    const style = document.createElement('style');
    style.textContent = `
      .wrapper {
        position: relative;
      }
      .info {
        font-size: 0.8rem;
        width: 200px;
        display: inline-block;
        border: 1px solid black;
        padding: 10px;
        background: white;
        border-radius: 10px;
        opacity: 0;
        transition: 0.6s all;
        position: absolute;
        bottom: 20px;
        left: 10px;
        z-index: 3;
      }
      img {
        width: 1.2rem;
      }
      .icon:hover + .info, .icon:focus + .info {
        opacity: 1;
      }
    `;
    
    shadow.appendChild(style);
    // 添加其他元素...
  }
}
```

## HTML 模板 (HTML Templates) ##

### `<template>` 元素 ###

`<template>` 元素使你可以编写不在呈现页面中显示的标记模板，然后它们可以作为自定义元素结构的基础被多次重用。

```html
<template id="my-template">
  <style>
    /* 组件样式 */
  </style>
  <div class="container">
    <slot></slot> <!-- 这里可以插入其他元素 -->
  </div>
</template>
```

### `<slot>` 元素 ###

`<slot>` 元素作为插槽，允许你在使用自定义元素时插入自定义内容。

```ts
const template = document.createElement('template');
template.innerHTML = `
  <style>
    label { display: block; }
    .description { color: #a9a9a9; font-size: .8em; }
  </style>
  <label>
    <input type="checkbox" />
    <slot></slot>
    <span class="description"><slot name="description"></slot></span>
  </label>
`;
```

使用示例：

```html
<todo-item>
  todo1
  <span slot="description">其他描述</span>
</todo-item>
```

## 完整示例：实现一个下拉选择组件 ##

让我们实现一个包含 `select` 和 `option` 的基础下拉选择组件。

### Select 组件 ###

```ts
class Select extends HTMLElement {
  constructor() {
    super();
    
    const template = document.createElement("template");
    template.innerHTML = `
      <style>
        :host {
          position: relative;
          display: inline-block;
        }
        .select-inner {
          height: 34px;
          border: 1px solid #cdcdcd;
          box-sizing: border-box;
          font-size: 13px;
          outline: none;
          padding: 0 10px;
          border-radius: 4px;
        }
        .drop {
          position: absolute;
          top: 36px;
          left: 0;
          width: 100%;
          padding: 4px 0;
          border-radius: 2px;
          overflow: auto;
          max-height: 256px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
          display: none;
        }
      </style>
      <input class="select-inner" readonly>
      <div class="drop">
        <slot></slot>
      </div>
    `;
    
    const shadowEle = this.attachShadow({ mode: "open" });
    const content = template.content.cloneNode(true);
    shadowEle.appendChild(content);
    
    this.input = shadowEle.querySelector(".select-inner");
    this.dropEle = shadowEle.querySelector(".drop");
    this.value = null;
    
    this.input.addEventListener("click", () => {
      this.dropEle.style.display = "block";
    });
    
    this.BodyClick = (ev) => {
      if (ev.target !== this.input) {
        this.dropEle.style.display = "none";
      }
    };
    
    this.dropEle.addEventListener("click", (ev) => {
      const target = ev.target;
      const nodeName = target.nodeName.toLowerCase();
      if (nodeName === "ivy-option") {
        this.value = target.getAttribute("value");
        this.input.setAttribute("value", target.innerHTML);
        this.dispatchEvent(new CustomEvent("change", {
          detail: { value: this.value }
        }));
        this.dropEle.style.display = "none";
      }
    });
  }
  
  connectedCallback() {
    document.addEventListener("click", this.BodyClick, true);
  }
  
  disconnectedCallback() {
    document.removeEventListener("click", this.BodyClick);
  }
}
```

### Option 组件 ###

```ts
class Option extends HTMLElement {
  constructor() {
    super();
    
    const template = document.createElement("template");
    template.innerHTML = `
      <style>
        :host {
          position: relative;
        }
        .option {
          height: 32px;
          line-height: 32px;
          box-sizing: border-box;
          font-size: 13px;
          color: #333333;
          padding: 0 10px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .option:hover {
          background-color: #f4f4f4;
        }
      </style>
      <div class="option">
        <slot></slot>
      </div>
    `;
    
    const shadowELe = this.attachShadow({ mode: "open" });
    const content = template.content.cloneNode(true);
    shadowELe.appendChild(content);
  }
  
  static get observedAttributes() {
    return ["value"];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "value" && oldValue !== newValue) {
      // 处理value属性变化
    }
  }
}
```

### 注册和使用 ###

```ts
customElements.define("ivy-select", Select);
customElements.define("ivy-option", Option);
```
   
   
```html
<ivy-select>
  <ivy-option value="1">Apple</ivy-option>
  <ivy-option value="2">Banana</ivy-option>
  <ivy-option value="3">Orange</ivy-option>
</ivy-select>
```

## 扩展内置元素 ##

Web Components 还允许你扩展内置 HTML 元素的功能。

```ts
class ExpandableList extends HTMLUListElement {
  constructor() {
    super();
    this.style.position = 'relative';
    
    // 创建切换按钮
    this.toggleBtn = document.createElement('button');
    this.toggleBtn.style.position = 'absolute';
    this.toggleBtn.style.border = 'none';
    this.toggleBtn.style.background = 'none';
    this.toggleBtn.style.padding = '0';
    this.toggleBtn.style.top = '0';
    this.toggleBtn.style.left = '5px';
    this.toggleBtn.style.cursor = 'pointer';
    this.toggleBtn.innerText = '>';
    this.appendChild(this.toggleBtn);
    
    // 定义点击事件
    this.toggleBtn.addEventListener('click', () => {
      this.dataset.expanded = !this.isExpanded;
    });
  }
  
  get isExpanded() {
    return this.dataset.expanded !== 'false' && this.dataset.expanded !== null;
  }
  
  static get observedAttributes() {
    return ['data-expanded'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    this.updateStyles();
  }
  
  updateStyles() {
    const transform = this.isExpanded ? 'rotate(90deg)' : '';
    this.toggleBtn.style.transform = transform;
    
    [...this.children].forEach((child) => {
      if (child !== this.toggleBtn) {
        child.style.display = this.isExpanded ? '' : 'none';
      }
    });
  }
  
  connectedCallback() {
    this.updateStyles();
  }
}

customElements.define('expandable-list', ExpandableList, { extends: 'ul' });
```

使用示例：

```html
<ul is="expandable-list" data-expanded name="myul">
  <li>apple</li>
  <li>banana</li>
</ul>
```

## 预告：Polymer 和 Lit 库 ##

虽然 Web Components 提供了强大的原生能力，但在实际开发中，我们可能会使用一些库来简化开发流程。下面简单介绍两个流行的 Web Components 库：

### Polymer ###

Polymer 是一个开源的 JavaScript 库，由 Google 开发，旨在简化 Web 组件的开发过程。它提供了一系列语法糖和工具，使得创建和使用 Web Components 更加便捷。

Polymer 的核心特性包括：

- 声明式数据绑定（单向绑定使用 `[[ ]]`，双向绑定使用 `{{ }}`）
- 便捷的属性系统
- 简化的事件处理

```html
<dom-module id="hello-world">
  <template>
    <style>
      :host { display: block; padding: 10px; }
    </style>
    <h1>Hello, [[name]]!</h1>
  </template>
  <script>
    Polymer({
      is: 'hello-world',
      properties: {
        name: { type: String, value: 'World' }
      }
    });
  </script>
</dom-module>
```

### Lit ###

Lit 是一个轻量级的库，基于 Polymer 项目发展而来，旨在简化 Web 组件的开发。它提供了更简洁的 API 和更好的性能，是当前 Web Components 生态中的重要组成部分。

Lit 的核心特点：

- 简单的组件定义方式
- 高效的渲染
- 模板字面量支持

```javascript
import { LitElement, html } from 'lit';

class MyElement extends LitElement {
  static properties = {
    name: { type: String }
  };

  constructor() {
    super();
    this.name = 'World';
  }

  render() {
    return html`<h1>Hello, ${this.name}!</h1>`;
  }
}

customElements.define('my-element', MyElement);
```

## 结语 ##

Web Components 为 Web 开发带来了一种强大的组件化方式，让开发者能够更好地组织代码，提升代码复用性和维护性。通过深入学习和实践，你会发现 Web Components 在现代前端项目中的巨大价值。

虽然 Web Components 已经得到了所有现代浏览器的支持，但在实际项目中，你可能还需要考虑一些额外的因素，如浏览器兼容性、性能优化和与现有框架的集成等。Polymer 和 Lit 这样的库可以帮助你解决这些问题，让你更专注于业务逻辑的实现。

希望本文能够帮助你理解 Web Components 的核心概念和 API，并激发你尝试在自己的项目中使用这项强大的技术。
