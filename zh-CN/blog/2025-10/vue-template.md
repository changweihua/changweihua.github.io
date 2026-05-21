---
lastUpdated: true
commentabled: true
recommended: true
title: Vue 3 应用实例详解
description: 从 createApp 到 mount，你真正掌握了吗？
date: 2025-10-14 11:00:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

> Vue 是渐进式的框架，但从第一步创建应用开始，很多人就已经踩坑了。本文将以“开发者视角”深入解析 Vue 应用实例的创建与配置，涵盖官方全部知识点，补充真实开发中的细节与最佳实践。

## 🌱 1. Vue 应用从哪开始？—— `createApp()` ##

Vue 3 使用 `createApp` 进行创建。

```js
import { createApp } from 'vue'

const app = createApp({
  // 这是根组件的配置
})
```

记住这句话：每一个 Vue 3 应用，都是通过 `createApp` 启动的。

它做了什么事？

- ✅ 创建了一个 Vue 应用实例
- ✅ 提供了一整套配置空间（如：全局组件注册、全局指令、全局错误处理等）
- ✅ 允许你构建多个彼此独立的 Vue 实例

> 🔍 Tips：createApp 只是“生成”，它并不会立即渲染或挂载 DOM。

## 🧩 2. 什么是根组件（Root Component）？ ##

我们传给 `createApp()` 的其实是一个 Vue 组件——这个组件就是整个应用的“根”。

```js
import App from './App.vue'

const app = createApp(App)
```

这个根组件是你应用的“入口容器”，你可以在它内部引用和组合子组件，像这样构建一棵组件树：

```js
App (根组件)
├─ TodoList
│  └─ TodoItem
│     ├─ DeleteButton
│     └─ EditButton
└─ Footer
   ├─ ClearButton
   └─ Statistics
```

> ✅ 实战建议：根组件只做“框架搭建” + “路由/布局”，而不要塞太多业务逻辑。

## 🎬 3. 让 Vue 真正渲染页面：`mount()` ##

调用 `createApp()` 创建实例后，我们必须*手动挂载*：应用实例必须在调用了 `.mount()` 方法后才会渲染出来。该方法接收一个*容器*参数，可以是一个实际的 DOM 元素或是一个 CSS 选择器字符串：

```html
<!-- index.html -->
<div id="app"></div>
```

```js
// main.js
app.mount('#app')
```

`.mount()` 的作用是：

- ➡️ 把 Vue 的虚拟 DOM 渲染到真实 DOM 中
- ➡️ 接管这个 DOM 节点的生命周期

> ⚠️ 注意：`.mount()` 要在所有配置完成之后再调用，否则你注册的全局组件/插件可能无效。

## 📝 4. DOM 中直接写模板？可以！ ##

如果你不想用 `.vue` 单文件组件，也可以直接在 HTML 写模板：

```js
<div id="app">
  <button @click="count++">{{ count }}</button>
</div>
```

```js
import { createApp } from 'vue'

createApp({
  data() {
    return { count: 0 }
  }
}).mount('#app')
```

Vue 会自动使用 `#app` 容器中的 `innerHTML` 作为模板。

**📌 实用场景**：

- 服务端渲染框架生成了页面结构，前端只负责绑定逻辑
- 无构建环境（无需 Webpack/Vite），纯浏览器运行

## 🧰 5. 应用配置与资源注册：配置就在 `app.config` ##

Vue 应用实例 (app) 暴露了一个 `config` 对象，常用于全局配置。例如设置错误处理器：

```js
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误捕获:', err)
}
```

**🔧 开发者常用配置项**：

|  选项   |      用途  |
| :-----------: | :-----------: |
| errorHandler | 全局捕获组件错误 |
| warnHandler | 捕获 Vue 内部警告 |
| isCustomElement | 配置哪些标签不被识别为组件 |

## 📦 6. 全局注册组件：`.component()` 方法 ##

你可以通过 `app.component()` 注册全局组件：

```js
import TodoButton from './components/TodoButton.vue'

app.component('TodoButton', TodoButton)
```

好处是：不需要在每个子组件中 `import`，直接在模板里使用即可。

> ✅ 实战建议：全局组件只注册基础复用组件，比如按钮、弹窗、图标，避免业务组件全局注册，降低耦合。

## 🧩 7. 一个页面多个 Vue 应用？可以！ ##

你可以在一个 HTML 页面中创建多个 Vue 应用，它们彼此独立、不共享状态和配置。

```html
<div id="app1"></div>
<div id="app2"></div>
```

```js
createApp(App1).mount('#app1')
createApp(App2).mount('#app2')
```

**📌 实用场景**：

- 老项目需要局部引入 Vue 功能
- 与非 Vue 系统共存时按需挂载组件

**✅ 特别注意**：

*`.mount()` 返回值是组件实例，而不是 app 实例*

```js
const vm = app.mount('#app')  // vm 是根组件实例
```

有时我们需要通过 `vm` 操作数据或调用组件方法，但应尽量避免直接操作 DOM。


*应用实例 ≠ 组件实例*

|  概念   |      描述  |
| :-----------: | :-----------: |
| 应用实例 (app) | 整个 Vue 项目的运行时环境 |
| 组件实例 (vm) | 某个具体组件的执行上下文 |

一个应用下可以有成百上千个组件实例，但只有一个 app。

*生命周期顺序*

```js
createApp(App)
  .use(router)
  .use(store)
  .component('Xxx', Xxx)
  .mount('#app')
```

上述顺序不能乱。所有 `.use()`、`.component()` 必须在 `.mount()` 之前调用！

## 📚 总结：Vue 应用启动的完整流程 ##

```js
import { createApp } from 'vue'
import App from './App.vue'
import SomePlugin from './plugin'
import GlobalComponent from './components/Global.vue'

const app = createApp(App)

app.use(SomePlugin)                     // 安装插件
app.component('GlobalComponent', GlobalComponent)  // 注册全局组件
app.config.errorHandler = (e) => { console.log(e) }  // 配置错误处理器

app.mount('#app')                       // 挂载应用
```

## 📌 最后一图总结 ##

```txt
createApp(App)
      ⬇
  创建应用实例
      ⬇
  注册插件/组件/config
      ⬇
   .mount('#app')
      ⬇
DOM 渲染 & 生命周期启动
```