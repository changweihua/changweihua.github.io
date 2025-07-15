---
lastUpdated: true
commentabled: true
recommended: true
title: Vue 3 的新特性解析与开发实践指南
description: Vue 3 的新特性解析与开发实践指南
date: 2025-07-15 14:05:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 使用defineCustomElement定义组件 ##

在 Vue 3 中，`defineCustomElement` 是用来创建自定义元素的 API，它允许开发者将 Vue 组件封装成*自定义元素（Custom Element）*，自定义元素是 Web Components 的一部分，可以在其他框架或者原生 HTML、JavaScript 环境中使用。这对于构建可复用的 UI 组件非常有用，以下是defineCustomElement 的解析和使用方法

### 什么是自定义元素（Custom Element）？ ###

自定义元素是浏览器原生支持的组件化技术，具有以下特点：

- **跨框架**：可以在 Vue、React、Angular 或原生 HTML 中使用
- **封装性**：样式和行为封装在组件内部，不会影响外部
- **生命周期**：支持自定义生命周期钩子（如 `connectedCallback`、`disconnectedCallback` 等）

### defineCustomElement 的作用 ###

`defineCustomElement` 是 Vue 3 提供的 API，用于将 Vue 组件转换为自定义元素。转换后的组件可以像原生 HTML 标签一样使用

### 使用 defineCustomElement 的步骤 ###

#### 定义 Vue 组件 ####

首先，定义一个普通的 `MyComponent.vue` 组件

```vue:MyComponent.vue
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

#### 将MyComponent.vue组件转换为自定义元素 ####

使用 `defineCustomElement` 将 Vue 组件转换为自定义元素

`customElements` 对象是Web Components API的一部分，用于定义自定义元素。 ‌在JavaScript中，`customElements` 对象是由浏览器提供的，用于创建和管理自定义元素。你可以通过调用 `customElements.define()` 方法来定义一个新的自定义元素。这个方法接受两个参数：元素的名称和元素的构造函数

```js:main.js
import { defineCustomElement } from 'vue';
import MyComponent from './MyComponent.vue';

// 将 Vue 组件转换为自定义元素
const MyCustomElement = defineCustomElement(MyComponent);

// 注册自定义元素
customElements.define('my-component', MyCustomElement);
```

#### 在 HTML 中使用 ####

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vue Custom Element</title>
</head>
<body>
  <!-- 在 HTML 中使用 MyComponent.vue 组件-->
  <my-component></my-component>
  <script src="./main.js"></script>
</body>
</html>
```

### 传递 Props ###

可以通过属性（Attributes）或属性（Properties）向自定义元素传递数据

#### 通过属性传递 ####

属性值只能是字符串，需要通过 `props` 接收

```js
<my-component message="Hello from Attribute!"></my-component>
```

通过 JavaScript 设置属性值，可以传递任意类型的数据

```js
const element = document.querySelector('my-component');
element.message = 'Hello from Property!';
```

#### 在组件中接收 ####

```vue:MyComponent.vue
<template>
  <div>
    <h1>{{ message }}</h1>
    <button @click="handleClick">Click Me</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// 接收父组件传递过来的属性
defineProps({
  message: String,
});

const message = ref('Hello, Custom Element!');

const handleClick = () => {
  alert('Button clicked!');
};
</script>
```

### 监听事件 ###

自定义元素可以触发自定义事件，父组件可以通过 `addEventListener` 监听

```vue:MyComponent.vue
<template>
  <div>
    <h1>{{ message }}</h1>
    <button @click="handleClick">Click Me</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// 接收父组件传递过来的属性
defineProps({
  message: String,
});

const message = ref('Hello, Custom Element!');

// 自定义元素可以触发自定义事件，父组件可以通过 `addEventListener` 监听
const handleClick = () => {
  const event = new CustomEvent('custom-click', {
    detail: { message: 'Button clicked!' },
  });
  dispatchEvent(event);
};
</script>
```

在父组件中监听：

```js
const element = document.querySelector('my-component');
element.addEventListener('custom-click', (event) => {
  console.log(event.detail.message); // 输出: Button clicked!
});
```

### 生命周期钩子 ###

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

自定义元素支持 Shadow DOM，可以将样式封装在组件内部

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

Vue 3.5 对自定义元素defineCustomElement的支持进一步增强，增加了多个实用的 API 和功能：

- 通过 configureApp 选项支持自定义元素的应用程序配置,允许在自定义元素初始化时配置 Vue 应用实例，例如全局插件、混入或依赖注入
- 添加 useHost()、useShadowRoot() 和 this.$host API，用于访问自定义元素的宿主元素和影子根
- 支持通过传递 shadowRoot: false 来在没有 Shadow DOM 的情况下挂载自定义元素,默认情况下, Vue 自定义元素会使用 Shadow DOM 进行封装，以提高样式隔离性
- 支持提供 nonce 选项，该选项将附加到自定义元素注入的 `<style>` 标签, 用于指定 CSP（内容安全策略）的 nonce 值，确保内联样式和脚本符合安全策略

这些新的仅自定义元素选项可以通过第二个参数传递给 `defineCustomElement`

`useHost()` 是一个在 Vue 3 的自定义渲染器中使用的方法，`它允许你访问宿主（host）元素`。这在创建自定义渲染器或在封装原生组件时非常有用。例如，如果你正在创建一个封装了原生 `<canvas>` 元素的 Vue 组件，你可能需要访问底层的 DOM 元素来操作它

```js
import { defineComponent, useHost } from 'vue';
 
export default defineComponent({
  setup() {
    const host = useHost();
    // 你可以在这里操作 host 元素
    console.log(host);
    return {};
  }
});
```

`useShadowRoot()` 同样是在自定义渲染器中使用的，`它允许你访问 Shadow DOM 的根节点`。这对于创建封装了 Shadow DOM 的组件特别有用，例如 Web Components

```js
import { defineComponent, useShadowRoot } from 'vue';
 
export default defineComponent({
  setup() {
    const shadowRoot = useShadowRoot();
    // 你可以在这里操作 Shadow DOM
    console.log(shadowRoot);
    return {};
  }
});
```

在 Vue 2 中，`this.$host` 是用来访问宿主元素的。但在 Vue 3 中，特别是在使用标准的 Vue API 和不涉及自定义渲染器的情况下，并没有直接暴露 `this.$host`。

> 如果你想在 Vue 3 中访问宿主元素，通常的做法是使用 ref 和 onMounted 钩子来获取对 DOM 元素的引用

```js
import { defineComponent, onMounted, ref } from 'vue';
 
export default defineComponent({
  setup() {
    const hostRef = ref(null);
    onMounted(() => {
      if (hostRef.value) {
        // 访问宿主元素
        console.log(hostRef.value);
      }
    });
    return { hostRef };
  }
});
```

`shadowRoot` | `nonce` | `configureApp`

```js
import { defineCustomElement } from 'vue'
import MyElement from './MyElement.ce.vue';
 
const MyElement = defineCustomElement(MyElement,{
  configureApp(app) {
    // 配置 Vue 应用实例，例如添加插件或全局变量
    app.provide('someGlobal', 'value') // 全局依赖注入
    app.directive('focus', {
        mounted(el) {
            el.focus(); 
        }
    }); // 注册指令
    app.config.errorHandler = function() {
      // 错误处理逻辑
    };

  },
  
  shadowRoot: true, // 使用 Shadow DOM
  
  nonce: generateNonce(), // 设置 CSP nonce值
  
  styles: [`
    :host {
      display: block;
      color: v-bind(color);
    }
  `],
})

// 使用浏览器原生 Crypto API 生成安全随机值（推荐）
// 生成示例：f85a7c4e3b1d9a02
function generateNonce() {
  const buffer = new Uint8Array(16);
  window.crypto.getRandomValues(buffer);
  return Array.from(buffer, byte => byte.toString(16).padStart(2, '0')).join('');
}
 
customElements.define('my-element', MyElement)
```

在 `defineCustomElement` 中的 `configureApp` 配置注册指令

```js
const MyElement = defineCustomElement({
  template: `<input v-auto-slug />`
}, {
  configureApp(app) {
    app.directive('auto-slug', {
      mounted(el) {
        el.addEventListener('input', (e) => {
          e.target.value = e.target.value
            .toLowerCase()
            .replace(/\s+/g, '-');
        });
      }
    });
  }
});
```

在 `defineCustomElement` 中的 `configureApp` 配置依赖注入

```js
defineCustomElement({
  template: `<child-component />`
}, {
  configureApp(app) {
    // 注入全局数据,依赖注入
    app.provide('apiKey', '123-456-789');
    // 注入全局方法,依赖注入
    app.provide('formatDate', (date) => new Date(date).toLocaleString());
  }
});
```

子组件通过 inject 使用：

```js
const apiKey = inject('apiKey');
const formatDate = inject('formatDate');
```

### 总结 ###

`defineCustomElement` 是 Vue 3 中用于将 Vue 组件转换为自定义元素的 API，具有以下优势：

- **跨框架**：可以在任何框架或原生 HTML 中使用
- **封装性**：支持 Shadow DOM 和样式封装
- **灵活性**：支持 Props、事件和生命周期钩子

通过 `defineCustomElement`，可以将 Vue 组件无缝集成到现有项目中，或将其发布为独立的 Web Components

## Lazy Hydration（懒加载水合） ##

Vue 3.5 引入了懒加载水合策略，通过 `hydrateOnVisible()` 选项，仅在组件可见时进行水合。这一功能可以减少不必要的资源消耗，提高页面初次加载的性能

```vue
<script setup>
import { hydrateOnVisible } from 'vue';

const lazyComponent = hydrateOnVisible(() => import('./MyComponent.vue'));
</script>
```

> 此特性对于使用 SSR 的项目，尤其是在大规模应用中，能够显著提升用户体验

## useId：一致的唯一 ID 生成 ##

Vue 3.5新增的 `useId()` API 可以生成在 SSR 和客户端之间一致的唯一 ID，解决了在 SSR 中可能出现的 ID 不一致问题

```vue
<script setup>
import { useId } from 'vue';

const id = useId();
</script>

<template>
  <label :for="id">Name:</label>
  <input :id="id" type="text" />
</template>
```

这对于生成表单元素和无障碍属性的 ID，确保 SSR 应用中不会导致水合不匹配

## useTemplateRef：动态模板引用 ##

Vue 3.5 之前获取dom元素的方法：

```vue
<template>
  // 步骤1 ref="myElement"
  <div ref="myElement">目标元素</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const myElement = ref(null); // 步骤2

onMounted(() => {
  console.log(myElement.value); // 输出 DOM 元素
});
</script>
```

Vue 3.5 引入了一种通过 `useTemplateRef()` API 获取模板引用的新方法，支持动态 `ref` 绑定到变化的 `ID`

```vue
<script setup>
import { useTemplateRef } from 'vue';

const inputRef = useTemplateRef('input');
</script>

<template>
  <input ref="input">
</template>
```

相比之前仅限于静态 `ref` 属性的方法，`useTemplateRef()` 提供了更灵活的引用方式，也更容易理解

## onWatcherCleanup、onEffectCleanup：观察者清理回调 ##

Vue 3.5 引入了一个全局导入的 API `onWatcherCleanup()`，用于在观察者中注册清理回调，避免内存泄漏

类似 `onEffectCleanup`，专为 watch 设计的清理钩子

```js
import { watch, onWatcherCleanup } from 'vue';

watch(id, (newId) => {
  //1这里
  const controller = new AbortController();
  fetch(`/api/${newId}`, { signal: controller.signal }).then(() => {
    // 回调逻辑
  });
  //2这里
  onWatcherCleanup(() => {
    // 中止陈旧请求
    controller.abort();
  });
});
```

这对于在组件卸载之前或者下一次 watch 回调执行之前进行资源清理非常有用

### ‌onEffectCleanup ###

在响应式 `effect` 清理前执行自定义逻辑（如取消定时器/请求）

专为 `watchEffect` 设计的清理钩子

```js
watchEffect(() => {
  const timer = setInterval(doSomething, 1000);
  onEffectCleanup(() => clearInterval(timer));
});
```

## watch、watchEffect的暂停和恢复 ##

Vue 3.5 中对watch进行的扩展，在一些场景中，可能需要暂停 `watch` 或者 `watchEffect` 中的回调，满足业务条件后再恢复执行。Vue 3.5 为此提供了 `pause()` 和 `resume()` 方法

```js
const { stop, pause, resume } = watchEffect(() => {
  // 观察逻辑
});

// 暂时暂停观察者
pause();

// 恢复观察者
resume();

// 停止观察
stop();
```

### 示例，使用 `pause()` 和 `resume()` ###

```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="toggleWatch">Toggle Watch</button>
  </div>
</template>
 
<script setup>
import { ref, watch } from 'vue';
 
const count = ref(0);
let watcher; // 用于存储 watcher 的引用
 
function setupWatcher() {
  watcher = watch(count, (newVal, oldVal) => {
    console.log(`Count changed from ${oldVal} to ${newVal}`);
  });
}
 
function toggleWatch() {
  if (watcher.active) {
    watcher.pause(); // 暂停 watcher
    console.log('Watcher paused');
  } else {
    watcher.resume(); // 恢复 watcher
    console.log('Watcher resumed');
  }
}
 
setupWatcher(); // 初始化 watcher
</script>
```

这使得对观察者的控制更加灵活，满足复杂的业务需求

## Teleport 和过渡（Teleport & Transition）增强,延迟挂载 ##

内置 `<Teleport>` 组件的一个已知限制是，传送目标元素必须在传送组件挂载时存在。这阻止了用户将内容传送到 Vue 渲染的其他元素中
在 Vue 3.5 中，引入了一个 defer 属性，使得 `<Teleport>` 组件可以 `延迟挂载目标元素`，这对于控制复杂 UI 布局非常有帮助

```vue
// defer 的使用
<Teleport defer target="#container">...</Teleport>
<div id="container"></div>
```

## 响应式 Props 解构 ##

直接解构 `defineProps` 保留响应性，无需 `toRefs`

```js
const { count = 0 } = defineProps(['count']); // 自动追踪 count 变化
```
