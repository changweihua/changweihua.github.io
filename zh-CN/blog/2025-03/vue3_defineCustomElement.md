---
lastUpdated: true
commentabled: true
recommended: true
title: vue3使用defineCustomElement定义组件
description: vue3使用defineCustomElement定义组件
date: 2025-03-27 10:00:00
pageClass: blog-page-class
---

# vue3使用defineCustomElement定义组件 #

在 Vue 3 中，`defineCustomElement` 是一个强大的 API，用于将 Vue 组件封装为  自定义元素（Custom Element）。自定义元素是 Web Components 的一部分，可以在任何框架或原生 HTML 中使用。

以下是  `defineCustomElement`  的详细解析和使用方法。

## 什么是自定义元素？ ##

自定义元素是浏览器原生支持的组件化技术，具有以下特点：

- **跨框架**：可以在 Vue、React、Angular 或原生 HTML 中使用。
- **封装性**：样式和行为封装在组件内部，不会影响外部。
- **生命周期**：支持自定义生命周期钩子（如  connectedCallback、disconnectedCallback  等）。

## defineCustomElement 的作用 ##

defineCustomElement  是 Vue 3 提供的 API，用于将 Vue 组件转换为自定义元素。转换后的组件可以像原生 HTML 标签一样使用。

## 使用 defineCustomElement 的步骤 ##

### 定义 Vue 组件 ###

首先，定义一个普通的 Vue 组件。

:::demo

```vue
<template>
  <div>
    <h1>{{ message }}</h1>
    <button @click="handleClick">Click Me</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const message = ref('Hello, Custom Element!');

const handleClick = () => {
  alert('Button clicked!');
};
</script>
```

:::

### 转换为自定义元素 ###

使用  defineCustomElement  将 Vue 组件转换为自定义元素。
```javascript 
// main.js
import { defineCustomElement } from 'vue';
import MyComponent from './MyComponent.vue';

// 将 Vue 组件转换为自定义元素
const MyCustomElement = defineCustomElement(MyComponent);

// 注册自定义元素
customElements.define('my-component', MyCustomElement);
```

### 在 HTML 中使用 ###

在 HTML 中直接使用自定义元素。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vue Custom Element</title>
</head>
<body>
  <my-component></my-component>
  <script src="./main.js"></script>
</body>
</html>
```

### 传递 Props ###

可以通过属性（Attributes）或属性（Properties）向自定义元素传递数据。

#### 通过属性传递 ####

属性值只能是字符串，需要通过  props  接收。

```vue
<my-component message="Hello from Attribute!"></my-component>
```

在组件中接收：

```vue
defineProps({
  message: String,
});
```

#### 通过属性传递 ####

通过 JavaScript 设置属性值，可以传递任意类型的数据。

```ts
const element = document.querySelector('my-component');
element.message = 'Hello from Property!';
```

在组件中接收：

```vue
defineProps({
  message: String,
});
```

### 监听事件 ###

自定义元素可以触发自定义事件，父组件可以通过  addEventListener  监听。

```vue
const handleClick = () => {
  const event = new CustomEvent('custom-click', {
    detail: { message: 'Button clicked!' },
  });
  dispatchEvent(event);
};
```

在父组件中监听：

```javascript
const element = document.querySelector('my-component');
element.addEventListener('custom-click', (event) => {
  console.log(event.detail.message); // 输出: Button clicked!
});
```

### 生命周期钩子 ###

自定义元素支持原生生命周期钩子，如  connectedCallback、disconnectedCallback  等。

```js
class MyCustomElement extends HTMLElement {
  connectedCallback() {
    console.log('Custom element added to the DOM');
  }

  disconnectedCallback() {
    console.log('Custom element removed from the DOM');
  }
}

customElements.define('my-custom-element', MyCustomElement);
```

### 样式封装 ###

自定义元素支持 Shadow DOM，可以将样式封装在组件内部。

```ts
const MyCustomElement = defineCustomElement({
  template: `
    <style>
      h1 {
        color: red;
      }
    </style>
    <h1>Hello, Shadow DOM!</h1>
  `,
});

customElements.define('my-custom-element', MyCustomElement);
```

## 总结 ##

defineCustomElement  是 Vue 3 中用于将 Vue 组件转换为自定义元素的 API，具有以下优势：

- **跨框架**：可以在任何框架或原生 HTML 中使用。
- **封装性**：支持 Shadow DOM 和样式封装。
- **灵活性**：支持 Props、事件和生命周期钩子。

通过  defineCustomElement，可以将 Vue 组件无缝集成到现有项目中，或将其发布为独立的 Web Components。
