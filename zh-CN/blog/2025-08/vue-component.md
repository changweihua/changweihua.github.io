---
lastUpdated: true
commentabled: true
recommended: true
title: Vue3 组件通信全解析：从基础到进阶的实用指南
description: Vue3 组件通信全解析：从基础到进阶的实用指南
date: 2025-08-05 09:35:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 前言 ##

`Vue3` 作为当前主流的前端框架，提供了多种灵活的**组件通信方式**，对于日常使用 `Vue3` 开发项目的前端小伙伴来说，组件通信方式可以说是必会的基本功。本文将系统盘点 `Vue3` 中的组件通信方案，通过简洁的代码示例和场景分析，助你快速掌握核心用法。

## 一、Props / Emits：父子组件通信基石 ##

### 父传子（Props） ###

父组件通过 `props` 向子组件传递数据，子组件接受 `props` 用于页面渲染或数据操作，支持普通变量/值（静态）和响应式变量（动态）。
xml 体验AI代码助手 代码解读复制代码

```vue:Parent.vue
<template>
  <Child :message="parentMsg" />
</template>
<script setup>
import Child from './Child.vue'
import { ref } from 'vue'
const parentMsg = ref('Hello from Parent')
</script>
```

```vue:Child.vue
<template>
  <div :message="parentMsg" >父组件传递的props:{{message}}</div>
</template>
<script setup>
defineProps({
  message: String
})
</script>
```

> 注意：`单向数据流` 是组件构建的一般原则，即子组件中不要直接修改从父组件中传递过来的 `props`，保持数据流自上而下的单向状态，方便组件维护。

### 子传父（Emits） ###

子组件通过触发自定义事件来通知父组件状态发生变化，同时以携带参数的方式向父组件传递数据，遵循单向数据流原则。

```vue:Child.vue
<template>
  <button @click="sendData">发送数据</button>
</template>
<script setup>
// 定义自定义事件
const emit = defineEmits(['update'])
function sendData() {
  // 触发自定义事件
  emit('update', 'Data from Child')
}
</script>
```

```vue:Parent.vue
<template>
  <!-- 监听并接收自定义事件 -->
  <Child @update="handleUpdate" />
</template>
<script setup>
function handleUpdate(data) {
  console.log(data) // 输出子组件传递的数据：’Data from Child'
}
</script>
```

> 补充： 子组件触发父组件中的事件并传递参数的另一种方式是直接在父组件中通过props将父组件的函数作为属性传递给子组件，由子组件直接调用父组件的函数并传递参数，这种方式并不推荐，原因是：
> 
> - **打破了单向数据流**：子组件可以直接调用父组件提供的方法，这可能会模糊父子组件之间的界限，因为它打破了单向数据流的概念，使数据流变得不那么直观。
> - **组件耦合**：直接传递函数的方式增加了父子组件间的耦合度。子组件需要知道父组件提供的具体函数，并且依赖于该函数的存在和签名。如果父组件中的函数逻辑发生变化，可能会影响到所有使用它的子组件。
> - **代码清晰度**：可能使代码逻辑变得不那么清晰，特别是当多个层级的组件相互调用时，可能会难以追踪数据流。
> 
> 对比不难看出，使用emit自定义事件方式的优点在于：
> 
> - **遵循单向数据流原则**：子组件通过触发事件通知父组件发生了什么，而不是直接调用父组件的方法。这使得数据流动清晰明了，便于理解和调试。
> - **组件解耦**：使用 emit 可以让子组件保持对父组件内部实现细节的无知。它只关心何时以及如何发出事件，而不关心父组件会怎样响应这些事件。这样可以提高组件的可复用性和独立性。
> - **代码清晰度**：有助于维持清晰的代码结构，特别是在大型项目中。它明确区分了“谁”（子组件）做了“什么”（触发了某个事件），以及“谁”（父组件）对此采取了行动。

## 二、Provide / Inject：跨层级通信利器 ##

适用于祖先组件向后代组件传递数据，无需中间组件逐层传递。

```vue:Senior.vue
<script setup>
import { provide, ref } from 'vue';
const theme = ref('dark');
// 在父组件/根组件中定义provide，提供数据。
provide('theme', theme);
</script>
```

```vue:Junior.vue
<!-- 后代组件 -->
<script setup>
import { inject } from 'vue';
// 在子组件/孙子组件中使用inject，注入数据
const theme = inject('theme', 'light'); // 可设置默认值
console.log('theme',theme.value); // 'dark'
</script>
```

适用场景：

- 控制多层嵌套组件的主题、语言等全局配置
- 避免 props 层层透传的冗余代码

## 三、$attrs：透传 Attributes ##

如果需要在子组件中接收的 `props` 很多，在 `props` 声明比较繁琐，`Vue` 给我们提供了一个优雅的解决方案，即 `$attrs`。`$attrs` 包含父组件传递的所有非 `props` 的 `attributes`（如 `class`、`style`、`事件` 等），适合透传属性到子组件。

> 注意：`$attrs` 不包含已经在 `props` 中定义的那部分属性。

```vue:Parent.vue
<template>
  <Child :msg1="1" :msg2="1" />
</template>
```

```vue:Child.vue
<template>
  <div>{{ attrs }}</div> <!-- { msg2: 2 } -->
  <GrandChild v-bind="$attrs" /> <!-- 将 $attrs 透传给孙组件 -->
</template>
<script setup>
defineProps({
    msg1: String
})
</script>
```

这里子组件使用了 `defineProps` 定义了 `msg1` ，则页面中 `$attrs` 的值为 `{ msg2: 2 }`。

还可以使用 `v-bind` 将 `$attrs` 的所有数据，以属性的方式全部传递到子组件中，在封装组件时经常会用到。

**适用场景**：

- 封装第三方组件时透传原生属性
- 避免重复声明 props

## 四、$refs / $parent + defineExpose：直接操作组件实例 ##

### 概述 ###

- `$refs` 用于 ：父→子。
- `$parent` 用于：子→父。

### 说明 ###

- `$refs`   | 值为对象，包含所有被 `ref` 属性标识的 `DOM` 元素或组件实例。
- `$parent` | 值为对象，当前组件的父组件实例对象。

`$refs` ：父组件通过 `ref` 获取子组件实例，子组件借助 `defineExpose` 宏可以显式指定在 `<script setup>` 组件中要暴露出去的属性/方法，因此可以通过子组件实例直接调用其暴露的方法或访问数据，实现通信。

```vue:Parent.vue
<template>
  <Child ref="childRef" />
</template>
<script setup>
import { ref, onMounted } from 'vue'
const childRef = ref(null)
onMounted(() => {
  childRef.value.childMethod(); // 调用子组件方法
})
</script>
```

```vue:Child.vue
<script setup>
// 暴露方法或属性
defineExpose({
  childMethod() {
    console.log('子组件方法被调用');
  }
})
</script>
```

`$parent`：子组件通过 `$parent` 获取父组件实例，父组件借助 `defineExpose` 宏可以显式指定在 `<script setup>` 组件中要暴露出去的属性/方法，因此可以通过父组件实例直接调用其暴露的方法或访问数据，实现通信。（不推荐直接修改父组件中的数据，容易打破单向数据流）

```vue:Child.vue
<template>
  <button @click=updateCount($parent)></button>
</template>
<script setup>
const updateCount = (parent) => {
	parent.count++; // 修改父组件属性
}
</script>
```

```vue:Parent.vue
<template>
  <p> {{count}} </p>
  <Child ref="childRef" />
</template>
<script setup>
const count = ref(0);
// 暴露方法或属性
defineExpose({count});
</script>
```

### 适用场景 ###

- 需要直接操作子/父组件 DOM 或调用其方法
- 表单校验、动画控制等场景

## 五、v-model：双向数据绑定语法糖 ##

Vue 3 的 `v-model` 本质上是 `:modelValue` + `@update:modelValue` 的语法糖，支持自定义修饰符和多绑定。

如果在自定义组件上使用 `v-model` 而没有指定任何修饰符或额外配置，默认情况下它会：

> 将父组件的数据通过一个名为 `modelValue` 的 `prop` 传递给子组件。
> 监听子组件发出的一个名为 `update:modelValue` 的事件来更新父组件中的数据。

### 基础用法 ###

```vue:Parent.vue
<template>
  <Child v-model="text" />
</template>
<script setup>
import { ref } from 'vue';
const text = ref('');
</script>
```

```vue:Child.vue
<template>
  <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
</template>
<script setup>
defineProps(['modelValue']);
defineEmits(['update:modelValue']);
</script>
```

### 多 v-model 绑定 ###

```vue:Parent.vue
<Child v-model:title="title" v-model:content="content" />
```

```vue:Child.vue
<script setup>
defineProps(['title', 'content']);
defineEmits(['update:title', 'update:content']);
</script>
```

> 从 `Vue3.4` 开始，还可以使用 `defineModel` 便利宏，其用法如下：

```vue:Child.vue
<template>
    <div>model的值: {{ model }}</div>
    <button @click="handleClick">+1</button>
  </template>

<script setup>
const model = defineModel()

function handleClick() {
  model.value++
}
</script>
```

```vue:Parent.vue
<template>
    <Child v-model="modelValue"></Child>
    Parent:{{ modelValue }}
</template>

<script setup>
import Child from './Child.vue';
const modelValue = ref(0)
</script>
```

`defineModel` 的返回值就是一个 `ref`，你可以随意访问和修改它，并且它会和父组件的 `v-model` 绑定的值保持同步，也就是实现了*双向绑定*。

## 六、事件总线（Event Bus）：灵活的事件通信 ##

通过第三方库 `mitt`（相当于 `vue2` 中的事件总线 `$bus`，在 `vue3` 中废弃） 实现任意组件间的通信，适合小型项目或临时事件通知。

```ts:eventBus.ts
import mitt from 'mitt';
export const emitter = mitt();

// 发送事件组件
emitter.emit('custom-event', { data: 123 });

// 接收事件组件
emitter.on('custom-event', (payload) => {
  console.log(payload); // { data: 123 }
})
```

注意事项：

- 需在组件卸载时移除监听器，防止内存泄漏
- 适合非父子关系的组件通信

## 七、状态管理（Pinia/Vuex）：全局状态共享 ##

适用于复杂应用的全局状态管理，提供集中式数据存储和变更追踪。

### 以 `Pinia` 为例 ###

```ts:stores/counter.ts
// 定义store
import { defineStore } from 'pinia'
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    }
  }
})
```

```vue:Component.vue
<template> 
  <div> 
    <p>count:{{ counterStore.count }}</p> 
	<button @click="counterStore.increment">Add</button> 
  </div> 
</template>
<script setup>
import { useCounterStore } from '@/stores/counter'
const counterStore = useCounterStore()
</script>
```

目前 `Pinia` 是 `Vue3` 中最为常用的全局状态管理库，具体用法不再此赘述，详见文档 `Pinia` 用法指南。

**优势**：

- 支持模块化状态管理
- 适合大型应用的全局数据共享

## 八、作用域插槽（Scoped Slots）：子组件向父组件传递模板 ##

- 通过插槽将子组件的数据传递给父组件，父组件决定如何渲染内容。
- 通过使用 `slot`，你可以将内容从父组件传递到子组件中指定的位置，这使得子组件可以在不暴露其内部实现细节的情况下，灵活地嵌入外部提供的内容。

> **作用域插槽**：作用域插槽允许子组件向父组件传递数据。父组件可以通过模板语法访问这些数据，并据此渲染内容。实际上，这是父组件定义了如何展示子组件的数据。

```vue:Child.vue
<template>
  <slot name="scoped" :user="user" :posts="posts"></slot>
</template>
<script setup>
const user = { name: 'Alice', age: 25 }
const posts = ['Post 1', 'Post 2']
</script>
```

```vue:Parent.vue
<template>
  <Child v-slot="{ user, posts }">
    <div>{{ user.name }} 的文章：</div>
    <ul>
      <li v-for="post in posts" :key="post">{{ post }}</li>
    </ul>
  </Child>
</template>
```

**语法糖写法**

```vue:Parent.vue
<Child #scoped="{ user, posts }">
  <!-- 同上 -->
</Child>
```

适用场景：

- 组件自定义内容渲染
- 表单组件的自定义布局

## 九、其他方式 ##

除了上述的主要的通信方式以外，还有一些较为传统的常用通信方式，例如：

- 浏览器的本地存储 `storage`
- 全局 `Window` 对象
- ES6模块化 `import/export`

这里不再一一赘述。

## 通信方式选择指南 ##

| 场景        |      推荐方式  |
| :-----------: | :-----------: |
| 父子组件简单通信      | Props/Emits |
| 跨多级组件通信      | Provide/Inject |
| 透传原生属性      | $attrs |
| 直接操作组件实例      | Refs/模板引用 |
| 双向数据绑定      | v-model |
| 非父子组件临时通信      | 事件总线（mitt） |
| 全局状态共享      | Pinia/Vuex |
| 子组件传递模板      | 作用域插槽 |

## 总结 ##

Vue 3 的组件通信体系既保留了 Vue 2 的经典方案，又新增了组合式 API 的灵活性。开发者应根据项目规模和具体需求选择合适的方式：

- **小型项目**：优先使用 Props/Emits 和事件总线
- **中型项目**：结合 Provide/Inject 和状态管理
- **大型项目**：以 Pinia/Vuex 为核心，辅以其他方式

掌握这些通信方式，将帮助你构建更清晰、更易维护的 Vue 3 应用。
