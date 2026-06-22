---
lastUpdated: true
commentabled: true
recommended: true
title: Vue3 常见的 9 种组件通信机制
description: Vue3 常见的 9 种组件通信机制
date: 2025-01-16 16:18:00
pageClass: blog-page-class
---

# Vue3 常见的 9 种组件通信机制 #

本文将全面讲解 Vue.js 中常用的组件通信机制，帮助你理解如何高效地在组件之间传递数据。

## 概述 ##

我们将涵盖以下关键概念：

- **Props / Emit**:  用于父组件向子组件传递数据以及子组件向父组件发出事件通知。
- **Provide / Inject**:  用于父组件向所有后代组件提供数据，实现依赖注入。
- **Pinia**:  一个现代化的 Vue 状态管理库，替代了传统的 Vuex。
- **Expose / Ref**:  用于父组件直接访问子组件的实例或元素。
- **Attrs**:  用于获取父组件传递给子组件的非 prop 属性。
- **v-Model**:  用于实现双向数据绑定。
- **mitt.js**:  一个事件总线库，用于跨组件通信。
- **Slots**:  用于父组件控制子组件部分内容，实现组件模板的灵活性和可重用性。

## Props / Emit ##

### 父组件向子组件传递数据 ###

父组件通过 `props` 属性将数据传递给子组件。子组件可以通过 defineProps 方法获取这些数据。

#### 示例 ####

```vue
<!-- 父组件 Parent.vue -->
<template>
  <Child :msg2="msg2" />
</template>
<script setup lang="ts">
import Child from './Child.vue';
import { ref, reactive } from 'vue';

const msg2 = ref<string>('This is the message 2 sent to the child component');
// 或对于复杂类型
const msg2 = reactive<string>(['This is the message 2 for the descendant component']);
</script>

<!-- 子组件 Child.vue -->
<template>
  <!-- 使用 props -->
  <div>子组件收到消息：{{ props.msg2 }}</div>
</template>
<script setup lang="ts">
// 无需导入，直接使用
// import { defineProps } from "vue"
interface Props {
  msg1: string;
  msg2: string;
}
const props = withDefaults(defineProps<Props>(), {
  msg1: '',
  msg2: '',
});
console.log(props); // { msg2: "This is the message 2 for the descendant component" }
</script>
```

#### 注意 ####

如果父组件使用 `setup()` 方法，子组件使用脚本设置语法，子组件将无法从父组件的数据中接收属性，只能接收父组件 `setup()` 函数中传递的属性。
如果父组件使用脚本设置语法糖，子组件使用 `setup()` 方法，子组件可以从父组件的数据和 `setup()` 函数中通过 props 接收属性。但是，如果子组件想要在它的 setup 中接收属性，它只能接收父组件 `setup()` 函数中的属性，不能接收数据属性。

### 子组件向父组件传递数据 ###

子组件通过 emit 方法向父组件发送事件，并传递数据。父组件可以通过 v-on 指令监听事件，并接收数据。

#### 示例 ####

```vue
<!-- 子组件 Child.vue -->
<template>
  <button @click="emit('myClick')">Button</button>
  <!-- 方法二 -->
  <button @click="handleClick">Button</button>
</template>
<script setup lang="ts">
// 方法一
// import { defineEmits } from "vue"
// 对应方法一
const emit = defineEmits(['myClick', 'myClick2']);
// 对应方法二
const handleClick = () => {
  emit('myClick', 'This is the message sent to the parent component');
};

// 方法二，不适合 Vue3.2 版本，useContext() 已过时
// import { useContext } from "vue"
// const { emit } = useContext()
// const handleClick = () => {
//     emit("myClick", "This is the message sent to the parent component")
// }
</script>

<!-- 父组件 Parent.vue -->
<template>
  <Child @myClick="onMyClick" />
</template>
<script setup lang="ts">
import Child from './Child.vue';

const onMyClick = (msg: string) => {
  console.log(msg); // This is the message received by the parent component
};
</script>
```

## Provide / Inject ##

`provide` 和 `inject` 机制用于在父组件和其所有后代组件之间共享数据，即使它们不是直接的父子关系。

- **provide**:  用于在父组件中定义要共享的数据。
- **inject**:  用于在后代组件中获取共享数据。

### 示例 ###

```vue
<!-- 父组件 Parent.vue -->
<script setup>
import { provide } from 'vue';

provide('name', 'Jhon');
</script>

<!-- 子组件 Child.vue -->
<script setup>
import { inject } from 'vue';

const name = inject('name');
console.log(name); // Jhon
</script>
```

## Pinia ##

Pinia 是一个现代化的 Vue 状态管理库，旨在取代传统的 Vuex。

### 示例 ###

```vue
// main.ts
import { createPinia } from 'pinia';
createApp(App).use(createPinia()).mount('#app');

// /store/user.ts
import { defineStore } from 'pinia';
export const userStore = defineStore('user', {
  state: () => {
    return {
      count: 1,
      arr: [],
    };
  },
  getters: {
    // ...
  },
  actions: {
    // ...
  },
});

// Page.vue
<template>
  <div>{{ store.count }}</div>
</template>
<script lang="ts" setup>
import { userStore } from '../store';
const store = userStore();
// 解构
// const { count } = userStore()
</script>
```

## Expose / Ref ##

expose 和 ref 机制用于父组件直接访问子组件的实例或元素。

### 示例 ###

```vue
<!-- 子组件 Child.vue -->
<script setup>
// 方法一，不适合 Vue 3.2 版本，useContext() 在此版本中已过时
// import { useContext } from "vue"
// const ctx = useContext()
// 暴露属性和方法等
// ctx.expose({
//     childName: "This is a property of the child component",
//     someMethod(){
//         console.log("This is a method of the child component")
//     }
// })

// 方法二，适合 Vue 3.2 版本，无需导入
// import { defineExpose } from "vue"
defineExpose({
  childName: 'This is a property of the child component',
  someMethod() {
    console.log('This is a method of the child component');
  },
});
</script>

<!-- 父组件 Parent.vue -->
<template>
  <Child ref="comp" />
  <button @click="handlerClick">Button</button>
</template>
<script setup>
import Child from './Child.vue';
import { ref } from 'vue';

const comp = ref(null);

const handlerClick = () => {
  console.log(comp.value.childName); // 获取子组件暴露的属性
  comp.value.someMethod(); // 调用子组件暴露的方法
};
</script>
```

## Attrs ##

attrs 对象包含从父级作用域传递给子组件的非 prop 属性，不包括 class 和 style。

### 示例 ###

```vue
<!-- 父组件 Parent.vue -->
<template>
  <Child :msg1="msg1" :msg2="msg2" title="3333" />
</template>
<script setup>
import Child from './Child.vue';
import { ref, reactive } from 'vue';

const msg1 = ref('1111');
const msg2 = ref('2222');
</script>

<!-- 子组件 Child.vue -->
<script setup>
import { defineProps, useContext, useAttrs } from 'vue';
// 无需在 3.2 版本中导入 defineProps，直接使用
const props = defineProps({
  msg1: String,
});
// 方法一，不适合 Vue3.2 版本，因为 useContext() 已过时
// const ctx = useContext()
// 如果 msg1 没有作为 prop 接收，它将是 { msg1: "1111", msg2:"2222", title: "3333" }
// console.log(ctx.attrs) // { msg2:"2222", title: "3333" }

// 方法二，适合 Vue3.2 版本
const attrs = useAttrs();
console.log(attrs); // { msg2:"2222", title: "3333" }
</script>
```

## v-Model ##

v-model 指令用于实现双向数据绑定。

### 示例 ###

```vue
<!-- 父组件 Parent.vue -->
<template>
  <Child v-model:key="key" v-model:value="value" />
</template>
<script setup>
import Child from './Child.vue';
import { ref, reactive } from 'vue';

const key = ref('1111');
const value = ref('2222');
</script>

<!-- 子组件 Child.vue -->
<template>
  <button @click="handlerClick">Button</button>
</template>
<script setup>
// 方法一，不适合 Vue 3.2 版本，因为 useContext() 已过时
// import { useContext } from "vue"
// const { emit } = useContext()

// 方法二，适合 Vue 3.2 版本，无需导入
// import { defineEmits } from "vue"
const emit = defineEmits(['key', 'value']);

// 使用
const handlerClick = () => {
  emit('update:key', 'New key');
  emit('update:value', 'New value');
};
</script>
```

## mitt.js ##

在 Vue3 中，事件总线不再可用，但现在可以使用 mitt.js 来替代，它基于与事件总线相同的原理。

### 示例 ###

```vue
// mitt.js
import mitt from 'mitt';
const mitt = mitt();
export default mitt;

// 组件 A
<script setup>
import mitt from './mitt';

const handleClick = () => {
  mitt.emit('handleChange');
};
</script>

// 组件 B
<script setup>
import mitt from './mitt';
import { onUnmounted } from 'vue';

const someMethed = () => {
  // ...
};
mitt.on('handleChange', someMethed);
onUnmounted(() => {
  mitt.off('handleChange', someMethed);
});
</script>
```

## Slots ##

Slots 允许父组件控制子组件部分内容，从而实现组件模板的灵活性和可重用性。

### 默认插槽 ###

```vue
<!-- 父组件 Parent.vue -->
<template>
  <FancyButton>Click me!</FancyButton>
</template>

<!-- 子组件 Child.vue -->
<template>
  <button class="fancy-btn">
    <slot></slot>
  </button>
</template>
```

### 具名插槽 ###

具名插槽是基于默认插槽的一种分类，可以理解为将内容匹配到对应的占位符。

```vue
<!-- 父组件 Parent.vue -->
<template>
  <Child>
    <template v-slot:monkey>
      <div>monkey</div>
    </template>
    <button>Click me!</button>
  </Child>
</template>

<!-- 子组件 Child.vue -->
<template>
  <div>
    <!-- 默认插槽 -->
    <slot></slot>
    <!-- 具名插槽 -->
    <slot name="monkey"></slot>
  </div>
</template>
```

### 作用域插槽 ###

插槽的内容无法访问子组件的状态。然而，在某些情况下，插槽的内容可能想要使用父组件和子组件作用域的数据。为了实现这一点，我们需要一种方法让子组件在渲染时向插槽提供一些数据。

```vue
<!-- 父组件 Parent.vue -->
<template>
  <!-- v-slot="{scope}" 用于接收从子组件传递上来的数据 -->
  <!-- :list="list" 将列表传递给子组件 -->
  <Child v-slot="{scope}" :list="list">
    <div>
      <div>Name: {{ scope.name }}</div>
      <div>Occupation: {{ scope.occupation }}</div>
      <hr>
    </div>
  </Child>
</template>
<script setup>
import { ref } from 'vue';
import Child from './components/Child.vue';

const list = ref([
  { name: 'Jhon', occupation: 'Thundering' },
  // ...
]);
</script>

<!-- 子组件 Child.vue -->
<template>
  <div>
    <!-- 使用 :scope="item" 返回每个项目 -->
    <slot v-for="item in list" :scope="item" />
  </div>
</template>
<script setup>
const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
});
</script>
```

## 总结 ##

本文介绍了 Vue.js 中常用的组件通信机制，包括 `Props / Emit`、`Provide / Inject`、`Pinia`、`Expose / Ref`、`Attrs`、`v-Model`、`mitt.js` 和 `Slots` 。你可以根据具体场景和需求选择合适的通信方式。
