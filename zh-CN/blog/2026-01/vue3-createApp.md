---
lastUpdated: true
commentabled: true
recommended: true
title: vue3中createApp多个实例共享状态
description: vue3中createApp多个实例共享状态
date: 2026-01-04 09:49:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 背景 ##

在 Vue 3 开发中，通常一个应用只需要调用一次 `createApp()` 创建一个根应用实例。但在某些特定场景下，确实需要创建多个 Vue 应用实例（即多次调用 `createApp`）。这些场景主要包括：

## 场景 ##

### 动态生成html ###

说明：

比如在使用地图的时候，点击弹框使用传入一个 `html` 弹框内容详情内容。

上面就是点击时候提供的弹框内容，使用 `InfoWindow.open` 触发弹框，。`infoWindow.setContent` 插入自己要显示的详情内容。

老办法是直接 `jquery` 插各种 `dom`操作。但现在都组件化了如果能复用现有的架构和样式是最理想的。

#### 方案1 `createApp` ####

这时候就可以利用 `createApp` 创建vue来渲染详情，这样就可以复用系统已经开发好的样式的结构。（缺点重新实例了一遍有一定开销）

**示例**：

```Js
import StoreInfoWindow from './components/StoreInfoWindow.vue'
  let infoWindow: google.maps.InfoWindow
  
  const markerShowDetail = async (marker: google.maps.marker.AdvancedMarkerElement) => {
    try {
      // 调用接口查询详情数据
      const res: any = await getStoreInfo(marker)
      if (res.data && res.data.row) {
        // 详情页面显示
        const storeDetail = res.data.row
        const content = document.createElement('div')
        infoWindow.setContent(content)
        infoWindow.open(map, marker)
        const app = createApp(StoreInfoWindow, { store: xxx })
        app.use(ElementPlus)
        app.mount(content)
      }
    } catch (error) {
      // loading.value = false
      console.error('Error fetching store info:', error)
    }
  }
```

#### 方案2 隐藏div ####

当然也可以不使用 `createApp`，直接在现有 `sfc` 页面里 插入一个隐藏的 `div`，内容把内容渲染到隐藏 `div`，调用 `infoWindow.setContent` 传入 `dom`

```js
import StoreInfoWindow from './components/StoreInfoWindow.vue'
  
 <div class="hideDiv">
      <StoreInfoWindow ref="storeInfoRef" :store="storeDetail"  ></StoreInfoWindow>
    </div>


  const storeDetail = ref<MapStore>()
  const storeInfoRef = ref()
  let infoWindow: google.maps.InfoWindow
  
  const markerShowDetail = async (marker: google.maps.marker.AdvancedMarkerElement) => {    
    try {
      // 调用接口查询详情数据
      const res: any = await getStoreInfo(marker)
      if (res.data && res.data.row) {
        // 详情页面显示
        storeDetail.value = res.data.row
        if (storeInfoRef.value) {
          nextTick(() => {
            infoWindow.setContent(storeInfoRef.value.$el)
            infoWindow.open(map, marker)
          })
        }
      }
    } catch (error) {
      console.error('Error fetching store info:', error)
    }
  }
```

> 由于一个 `dom` 节点 不能同时挂在多个不同节点下，所以上面的 `infoWindow.setContent(storeInfoRef.value.$el)` 设置后，`hideDiv` 的下面的内容会被移走。所以关闭时候需要还原回来。防止节点引用丢失。

关闭后，补偿方法

```js
const infoWindowClose = () => {
    infoWindow.close()
    const hideDiv = document.querySelector('.hideDiv')
    if (hideDiv) {
      if (!hideDiv.contains(storeInfoRef.value.$el)) {
        hideDiv.appendChild(storeInfoRef.value.$el)
      }
    }
  }
```

### 微前端架构（Micro Frontends） ###

在微前端架构中，一个页面可能由多个独立的子应用组成，每个子应用可能是由不同的团队开发、使用不同的框架或不同版本的 Vue。为了隔离作用域和避免冲突，每个子应用应拥有自己的 Vue 实例。

```Js
// 子应用 A
const appA = createApp(AppA);
appA.mount('#micro-app-a');

// 子应用 B
const appB = createApp(AppB);
appB.mount('#micro-app-b');
```

> 每个子应用可以独立注册插件、全局组件、指令等，互不影响。


### 在同一个页面嵌入多个独立的 Vue 应用 ###

**说明**：

比如一个传统多页网站（非 SPA）中，某些页面包含多个功能模块（如导航栏、侧边购物车、评论区），它们彼此逻辑独立，不需要共享状态，也不需要通信。

**示例**：

```html
<!-- index.html -->
<div id="header-widget"></div>
<div id="cart-widget"></div>
<div id="comment-section"></div>
```

```Js:main.js
import { createApp } from 'vue';
import HeaderWidget from './HeaderWidget.vue';
import CartWidget from './CartWidget.vue';
import CommentSection from './CommentSection.vue';

createApp(HeaderWidget).mount('#header-widget');
createApp(CartWidget).mount('#cart-widget');
createApp(CommentSection).mount('#comment-section');
```

> 每个 widget 是一个独立的 Vue 应用，可单独开发、测试、部署。


### 插件或第三方库需要隔离的 Vue 实例 ###

**说明**：

当你开发一个 Vue 插件（如 UI 组件库中的弹窗、通知等），而该插件内部需要渲染 Vue 组件时，为避免污染主应用的全局配置（如全局指令、混入、provide/inject 等），应创建独立的 Vue 实例。

**示例（封装一个全局 Toast 组件）**：


```Js:toast.js
import { createVNode, render } from 'vue';
import ToastComponent from './Toast.vue';

export function showToast(message) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const vm = createVNode(ToastComponent, { message });
  const app = createApp({}); // 创建干净实例
  app.mount(container);
  render(vm, container);
}
```

这样 `Toast` 不会继承主应用的全局配置，更安全可靠。

### 单元测试或多实例沙箱环境 ###

**说明**：

在编写测试用例时，为避免测试之间互相干扰，每个测试用例应使用独立的 Vue 应用实例。

**示例（Vitest / Jest）**：

```Js
test('Component A works', () => {
  const app = createApp(ComponentA);
  const div = document.createElement('div');
  app.mount(div);
  // ...断言
  app.unmount();
});

test('Component B works', () => {
  const app = createApp(ComponentB); // 全新实例，无污染
  // ...
});
```

## createApp 构造方式 ##

我们复习一下 创建的方式

### 传入 SFC（单文件组件）【最常用】 ###

**传入 `.vue` 文件作为根组件**

```js
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

**带 `root props` 的方式**

```js
createApp(App, { title: 'Hello' }).mount('#app')
```

SFC 内：

```js
<script setup>
defineProps({
  title: String
})
</script>
```

### 传入 Options API 对象（构造对象组件）###

不用 SFC，直接传一个对象：

**直接传组件对象**

```js
createApp({
  data() {
    return { msg: 'Hello' }
  },
  template: `<div>{{ msg }}</div>`
}).mount('#app')
```

**带 root props**

```js
createApp({
  props: ['title'],
  template: `<h1>{{ title }}</h1>`
}, {
  title: 'Hello Props'
}).mount('#app')
```

### 传入 Render Function（函数式创建根组件） ###

**使用 `h()` 渲染函数**

```js
import { createApp, h } from 'vue'

createApp({
  render() {
    return h('div', 'Hello from render')
  }
}).mount('#app')
```

**带 root props 的 render 写法**

```js
createApp({
  props: ['msg'],
  render(props) {
    return h('div', props.msg)
  }
}, {
  msg: 'Hello props'
})
.mount('#app')
```

### 传入 Template 字符串（inline 模板） ###

适用于快速 demo：

**根组件直接写 template 字符串**

```js
createApp({
  template: `<p>Hello Template</p>`
}).mount('#app')
```

**root props + template**

```js
createApp({
  props: ['text'],
  template: `<p>{{ text }}</p>`
}, {
  text: 'Hello!'
}).mount('#app')
```

## 数据共享问题 ##

由于两个 `app` 是独立的沙盒，但是我们又需要同步部分数据状态

### 全局变量（简单场景，不推荐大型项目） ###

通过浏览器全局对象（window）存储共享数据，利用 Vue 的响应式 API（ref/reactive）保证数据变更能触发视图更新。

```js
  const { createApp, ref } = Vue;

  // 1. 定义全局共享的响应式数据
  window.sharedState = ref({
    username: 'Vue开发者',
    count: 0
  });

  // 2. 应用实例1：使用全局共享数据
  createApp({
    setup() {
      const shared = window.sharedState;
      const increment = () => shared.value.count++;
      return { shared, increment };
    },
    template: `
      <div>
        <h3>应用1 - 计数：{{ shared.count }}</h3>
        <button @click="increment">+1</button>
      </div>
    `
  }).mount('#app1');

  // 3. 应用实例2：共享同一份数据
  createApp({
    setup() {
      const shared = window.sharedState;
      const changeName = () => shared.value.username = '新名称';
      return { shared, changeName };
    },
    template: `
      <div>
        <h3>应用2 - 用户名：{{ shared.username }}</h3>
        <h3>应用2 - 同步计数：{{ shared.count }}</h3>
        <button @click="changeName">修改用户名</button>
      </div>
    `
  }).mount('#app2');
```

### 事件总线 ###

通过第三方事件库（如 mitt）实现跨实例的 “发布 - 订阅” 通信，适用于需要触发行为 / 传递临时数据的场景（而非持久化共享状态）。

**步骤**：

安装 mitt（工程化项目）：`npm install mitt`；

创建全局事件总线实例；

不同应用实例通过 `emit` 发布事件，`on` 监听事件传递数据。

```html
<!-- CDN 方式示例 -->
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="https://unpkg.com/mitt/dist/mitt.umd.js"></script>
<script>
  const { createApp, ref } = Vue;
  // 1. 创建全局事件总线
  window.eventBus = mitt();

  // 应用1：发布事件（传递数据）
  createApp({
    setup() {
      const count = ref(0);
      const sendCount = () => {
        count.value++;
        // 发布事件，携带数据
        window.eventBus.emit('count-change', count.value);
      };
      return { count, sendCount };
    },
    template: `<button @click="sendCount">应用1发送计数</button>`
  }).mount('#app1');

  // 应用2：监听事件（接收数据）
  createApp({
    setup() {
      const receiveCount = ref(0);
      // 监听事件，接收数据
      window.eventBus.on('count-change', (val) => {
        receiveCount.value = val;
      });
      return { receiveCount };
    },
    template: `<div>应用2接收的计数：{{ receiveCount }}</div>`
  }).mount('#app2');
</script>
```

### Pinia/Vuex ###

Pinia（Vue 3 官方推荐）/ Vuex 是专门的状态管理库，可创建*全局共享的状态仓库*，多个应用实例通过访问同一仓库实现数据共享（最规范的方案）。

#### 创建全局 Pinia ####

```js
// src/store/index.js
import { createPinia, defineStore } from 'pinia';

// 1. 创建全局 Pinia 实例（唯一）
export const pinia = createPinia();

// 2. 定义共享仓库
export const useSharedStore = defineStore('shared', {
  state: () => ({
    count: 0,
    message: 'Pinia 共享数据'
  }),
  actions: {
    increment() {
      this.count++;
    },
    updateMessage(newMsg) {
      this.message = newMsg;
    }
  }
});
```

**多个应用实例挂载同一 Pinia 并使用仓库**

```js
// src/app1.js（应用实例1）
import { createApp } from 'vue';
import { pinia, useSharedStore } from './store';
import App1 from './App1.vue';

const app1 = createApp(App1);
// 挂载全局 Pinia 实例
app1.use(pinia);
// 组件内使用仓库
// App1.vue 中：
// setup() { const store = useSharedStore(); store.increment(); }
app1.mount('#app1');

// src/app2.js（应用实例2）
import { createApp } from 'vue';
import { pinia, useSharedStore } from './store';
import App2 from './App2.vue';

const app2 = createApp(App2);
// 挂载同一个 Pinia 实例
app2.use(pinia);
// App2.vue 中可直接访问同一份仓库数据
app2.mount('#app2');
```

**组件内使用示例（App1.vue）**：

```vue
<template>
  <div>
    <h3>应用1 - {{ store.message }}</h3>
    <p>计数：{{ store.count }}</p>
    <button @click="store.increment">+1</button>
  </div>
</template>

<script setup>
import { useSharedStore } from './store';
const store = useSharedStore();
</script>
```

**组件内使用示例（App2.vue）**：

```vue
<template>
  <div>
    <h3>应用2 - {{ store.message }}</h3>
    <p>同步计数：{{ store.count }}</p>
    <button @click="store.updateMessage('应用2修改了消息')">修改消息</button>
  </div>
</template>

<script setup>
import { useSharedStore } from './store';
const store = useSharedStore();
</script>
```

### 共享响应式对象 ###

#### 非sfc方式 ####

直接创建一个独立的响应式对象（ref/reactive），作为多个应用实例的 “数据源”，本质是将响应式数据抽离到实例外部。

```vue
<script>
  const { createApp, ref } = Vue;

  // 1. 抽离共享的响应式数据（独立于应用实例）
  const sharedData = ref({
    count: 0,
    text: '共享响应式数据'
  });

  // 应用1：使用共享数据
  createApp({
    setup() {
      const increment = () => sharedData.value.count++;
      return { sharedData, increment };
    },
    template: `<div>应用1：{{ sharedData.count }} <button @click="increment">+1</button></div>`
  }).mount('#app1');

  // 应用2：使用同一份共享数据
  createApp({
    setup() {
      const changeText = () => sharedData.value.text = '应用2修改';
      return { sharedData, changeText };
    },
    template: `<div>应用2：{{ sharedData.text }} / {{ sharedData.count }} <button @click="changeText">改文本</button></div>`
  }).mount('#app2');
</script>
```

#### sfc的方式 ####

```vue
<template>
  <div class="container">
    <h1>Vue 3 共享Ref示例</h1>

    <!-- 主应用组件 -->
    <div class="main-app">
      <h2>主应用</h2>
      <p>共享计数: {{ sharedCount }}</p>
      <p>标题: {{ title }}</p>
      <button @click="incrementCount">增加计数</button>
      <button @click="changeTitle">修改标题</button>
    </div>

    <!-- 动态创建的组件容器 -->
    <div id="dynamic-component"></div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { createApp } from 'vue'

  // 子组件定义
  const ChildComponent = {
    template: `
    <div class="child-component">
      <h3>动态创建的子组件</h3>
      <p>共享计数: {{ count }}</p>
      <p>标题: {{ title }}</p>
      <button @click="decrementCount">减少计数</button>
      <button @click="resetTitle">重置标题</button>
    </div>
  `,
    props: {
      count: {
        // 这里要传入ref类型
        type: Object,
        required: true,
      },
      title: {
        // 这里要传入ref类型
        type: Object,
        required: true,
      },
      onDecrement: {
        type: Function,
        required: true,
      },
      onResetTitle: {
        type: Function,
        required: true,
      },
    },
    methods: {
      decrementCount() {
        this.onDecrement()
      },
      resetTitle() {
        this.onResetTitle()
      },
    },
  }

  // 创建共享的ref
  const sharedCount = ref(0)
  const title = ref('Hello')
  let dynamicApp = null

  const incrementCount = () => {
    sharedCount.value++
  }

  const decrementCount = () => {
    if (sharedCount.value > 0) {
      sharedCount.value--
    }
  }

  const changeTitle = () => {
    title.value = `标题已修改 ${new Date().toLocaleTimeString()}`
  }

  const resetTitle = () => {
    title.value = 'Hello'
  }

  // 动态应用的根组件
  const DynamicRoot = {
    template: '<ChildComponent :count="count" :title="title" :on-decrement="onDecrement" :on-reset-title="onResetTitle" />',
    components: {
      ChildComponent,
    },
    props: {
      count: Number,
      title: String,
      onDecrement: Function,
      onResetTitle: Function,
    },
  }

  onMounted(() => {
    // 使用createApp(App, props)的写法创建动态应用
    dynamicApp = createApp(DynamicRoot, {
      count: sharedCount,
      title: title,
      onDecrement: decrementCount,
      onResetTitle: resetTitle,
    })

    // 挂载到DOM
    dynamicApp.mount('#dynamic-component')
  })

  onUnmounted(() => {
    // 清理动态创建的应用
    if (dynamicApp) {
      dynamicApp.unmount()
    }
  })
</script>

<style scoped>
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }

  .main-app,
  .child-component {
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
    background-color: #f9f9f9;
  }

  .child-component {
    border-color: #007bff;
    background-color: #f0f8ff;
  }

  button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    margin: 5px;
  }

  button:hover {
    background-color: #0056b3;
  }

  h1,
  h2,
  h3 {
    color: #333;
  }
</style>
```

> 注意 子组件需要使用 `ref` 类型作为参数，因为是根节点
