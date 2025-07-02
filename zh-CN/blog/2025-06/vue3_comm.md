---
lastUpdated: true
commentabled: true
recommended: true
title: Vue3 组件通信全攻略：12种方式与实战示例
description: Vue3 组件通信全攻略：12种方式与实战示例
date: 2025-06-23 10:35:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

# Vue3 组件通信全攻略：12种方式与实战示例 #

Vue3 组件通信全攻略：12种方式与实战示例
在Vue3中，组件通信是构建应用的核心技能。本文系统梳理12种通信方式，从基础到进阶，结合真实场景与代码示例，帮助开发者灵活选择最佳方案。

## 一、父子组件通信 ##

### Props + Emit（基础单向数据流） ###

父组件传递数据给子组件，子组件触发事件通知父组件

```vue Parent.vue
<template>
  <Child :message="parentMsg" @update="handleUpdate"/>
</template>
<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const parentMsg = ref('Hello from Parent')
const handleUpdate = (newMsg) => {
  parentMsg.value = newMsg
}
</script>
```

```vue Child.vue
<template>
  <div>{{ message }} <button @click="sendMessage">Send</button></div>
</template>
<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  message: String
})
const emit = defineEmits(['update'])

const sendMessage = () => {
  emit('update', 'Hello from Child')
}
</script>
```

### $attrs（透传未声明的属性） ###

子组件需要接收父组件传递的非Props属性

```vue Parent.vue
<template>
  <Child :msg="message" :other="extraData" />
</template>
<script setup>
import Child from './Child.vue'

const message = 'Main Message'
const extraData = { id: 123 }
</script>
```

```vue Child.vue
<template>
  <div v-bind="$attrs"></div>
</template>
<script setup>
// $attrs自动包含父组件传递的other属性
</script>
```

### Ref + DefineExpose（直接调用子组件方法） ###

父组件需要直接调用子组件的方法

```vue Parent.vue
<template>
  <Child ref="childRef" />
  <button @click="callChildMethod">Call Child</button>
</template>
<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const childRef = ref(null)
const callChildMethod = () => {
  childRef.value.publicMethod()
}
</script>
```

```vue Child.vue
<template>
  <div>Child Component</div>
</template>
<script setup>
import { defineExpose } from 'vue'

const publicMethod = () => {
  console.log('Child method called')
}
defineExpose({ publicMethod })
</script>
```

## 二、兄弟组件通信 ##

### Mitt（轻量级事件总线） ###

平级组件间需要事件通知

```ts
// emitter.ts
import mitt from 'mitt'
export const emitter = mitt()
```

```vue BrotherA.vue
<script setup>
import { emitter } from './emitter'
emitter.on('notify', (data) => {
  console.log('BrotherA收到消息：', data)
})
</script>
```

```vue BrotherB.vue
<script setup>
import { emitter } from './emitter'
setTimeout(() => {
  emitter.emit('notify', { msg: 'Hello BrotherA' })
}, 1000)
</script>
```

### 共享父组件状态（通过$parent） ###

兄弟组件通过共同的父组件共享数据

```vue Parent.vue
<template>
  <BrotherA :shared="state" />
  <BrotherB :shared="state" />
</template>
<script setup>
import { reactive } from 'vue'
import BrotherA from './BrotherA.vue'
import BrotherB from './BrotherB.vue'

const state = reactive({ count: 0 })
</script>
```


```vue BrotherA.vue
<template>
  <button @click="increment">Increment</button>
</template>
<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  shared: Object
})
function increment() {
  props.shared.count++
}
</script>
```

## 三、跨层级组件通信 ##

### Provide + Inject（祖孙组件数据传递） ###

祖先组件向后代组件传递数据，无需逐层传递

```vue Ancestor.vue
<template>
  <GrandChild />
</template>
<script setup>
import { provide, ref } from 'vue'
import GrandChild from './GrandChild.vue'

const theme = ref('dark')
provide('theme', theme)
</script>
```

```vue GrandChild.vue（隔代组件）
<template>
  <div>Theme: {{ theme }}</div>
</template>
<script setup>
import { inject } from 'vue'

const theme = inject('theme')
</script>
```

## 四、高级场景通信 ##

### V-Model 双向绑定（简化父子交互） ###

父组件与子组件之间的双向数据同步

```vue Parent.vue
<template>
  <Child v-model="value" />
</template>
<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const value = ref('Initial Value')
</script>
```

```vue Child.vue
<template>
  <input :value="modelValue" @input="updateValue($event.target.value)" />
</template>
<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const updateValue = (val) => {
  emit('update:modelValue', val)
}
</script>
```

### 依赖注入（函数/对象传递） ###

通过插槽传递函数或配置对象

```vue Parent.vue
<template>
  <Child>
    <template #default="{ config }">
      <div :style="config">{{ config.title }}</div>
    </template>
  </Child>
</template>
<script setup>
import Child from './Child.vue'
</script>
```

```vue Child.vue
<template>
  <div>
    <slot :config="config">
      Default Content
    </slot>
  </div>
</template>
<script setup>
import { reactive } from 'vue'

const config = reactive({ title: 'Slot Injected Config' })
</script>
```

## 五、其他补充方案 ##

| 方式        |      适用场景      |  示例代码片段 |
| :-----------: | :-----------: | :----: |
| Vuex/Pinia      | 全局状态管理 | `store.commit('increment') / useCounterStore().increment()` |
| LocalStorage      | 持久化数据共享 | `localStorage.setItem('key', JSON.stringify(data))` |
| Window全局对象      | 临时跨组件通信（慎用） | `window.appData = {...}` |
| ES6 Module Import      | 常量数据共享 | `import { CONSTANT } from '@/constants'` |

## 六、最佳实践建议 ##

- **优先选择标准化方案**：Props+Emit满足80%场景，复杂场景再用Provide/Mitt/状态管理
- **避免过度使用全局状态**：仅当数据需要在多组件间共享时使用Vuex/Pinia
- **善用$attrs**：减少子组件Props定义，实现属性透传
- **谨慎操作Ref**：仅在必要时直接调用子组件方法，保持组件解耦
- **事件命名规范**：使用`on[EventName]`监听自定义事件，如`on:update`

通过本文，你可以掌握Vue3组件通信的核心方法，并根据实际场景选择最优方案。建议将示例代码复制到Vue3项目中运行，观察不同方式的数据流向和效果差异。
