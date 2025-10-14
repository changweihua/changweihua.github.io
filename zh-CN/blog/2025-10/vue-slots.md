---
lastUpdated: true
commentabled: true
recommended: true
title: Vue 插槽（Slots）全面解析与实战指南
description: Vue 插槽（Slots）全面解析与实战指南
date: 2025-10-14 10:00:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 一、为什么需要插槽？ ##

在开发组件时，*props 只能传递数据*，但很多场景下我们需要传递 *模板内容*。

比如一个按钮组件，我们希望它有统一的样式，但内部文字或图标由外部决定。这时就用到 *插槽（slot）* 。

你可以把插槽理解为：

👉 组件的“占位符” ，由父组件决定填充的内容。

## 二、插槽的基础用法 ##

### 默认插槽 ###

📌 父组件使用：

```js
<!-- 父组件 -->
<FancyButton>
  点我一下！ <!-- 插槽内容 -->
</FancyButton>
```

📌 子组件：

```vue [FancyButton.vue]
<template>
  <button class="fancy-btn">
    <!-- 插槽出口，父组件传什么，这里就显示什么 -->
    <slot></slot>
  </button>
</template>
```

📌 渲染结果：

```html
<button class="fancy-btn">点我一下！</button>
```

✅ 这样 FancyButton 的样式固定，但内容灵活。

### 默认内容 ###
如果父组件没有传递内容，可以给插槽设置 *默认值*。

```vue [SubmitButton.vue]
<!-- 子组件 SubmitButton.vue -->
<template>
  <button type="submit">
    <slot>提交</slot> <!-- 默认是“提交” -->
  </button>
</template>
```

父组件：

```html
<SubmitButton />   <!-- 没传内容 -->
<SubmitButton>保存</SubmitButton> <!-- 传了内容 -->
```

结果：

```html
<button type="submit">提交</button>
<button type="submit">保存</button>
```

### 具名插槽 ###

有时组件内部有多个位置需要插入不同的内容，比如一个布局组件：

```vue:BaseLayout.vue
<!-- BaseLayout.vue -->
<template>
  <div class="container">
    <header><slot name="header"></slot></header>
    <main><slot></slot></main> <!-- 默认插槽 -->
    <footer><slot name="footer"></slot></footer>
  </div>
</template>
```

父组件使用：

```js
<BaseLayout>
  <template #header>
    <h1>我是标题</h1>
  </template>

  <p>正文内容...</p> <!-- 默认插槽 -->

  <template #footer>
    <p>我是底部信息</p>
  </template>
</BaseLayout>
```

📌 渲染结果：

```js
+--------------------+
| 我是标题           |
+--------------------+
| 正文内容...        |
+--------------------+
| 我是底部信息       |
+--------------------+
```

可以把具名插槽想象成给“占位符”贴上了标签，方便对应。

### 条件插槽 ###

如果某个插槽内容没有传递，可以通过 `$slots` 判断是否需要渲染：

```js
<Card>
  <template #header>头部</template>
</Card>
```

```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <div v-if="$slots.header"><slot name="header" /></div>
    <div v-if="$slots.default"><slot /></div>
    <div v-if="$slots.footer"><slot name="footer" /></div>
  </div>
</template>
```

### 动态插槽名 ###

插槽的名字也可以动态传入：

```js
<base-layout>
  <template v-slot:[dynamicSlot]>
    动态内容
  </template>
</base-layout>
```

## 三、作用域插槽（Scoped Slots） ##

默认情况下，*插槽内容只能访问父组件的数据*。

但有时我们希望子组件把一些数据“传出来”，让父组件在插槽里使用。
📌 子组件：

```vue
<!-- MyComponent.vue -->
<template>
  <slot :text="greeting" :count="1"></slot>
</template>

<script setup>
const greeting = "你好";
</script>
```

📌 父组件：

```js
<MyComponent v-slot="{ text, count }">
  {{ text }} - 次数：{{ count }}
</MyComponent>
```

结果：

```txt
你好 - 次数：1
```

📌 类比 JavaScript：

```js
function MyComponent(slotFn) {
  const data = { text: "你好", count: 1 }
  return slotFn(data) // 调用函数并传入参数
}
```

✅ 所以作用域插槽可以理解为：*子组件给父组件“回调函数”传参*。

### 具名作用域插槽 ###

```js
<MyComponent>
  <template #header="{ message }">
    <h2>{{ message }}</h2>
  </template>
</MyComponent>
```

子组件：

```js
<slot name="header" :message="'来自子组件的数据'"></slot>
```

## 四、实战案例 ##

### 高级列表组件 ###

```vue
<!-- FancyList.vue -->
<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <!-- 把 item 数据传给插槽 -->
      <slot name="item" v-bind="item"></slot>
    </li>
  </ul>
</template>

<script setup>
import { ref } from "vue";
const items = ref([
  { id: 1, text: "Vue", likes: 100 },
  { id: 2, text: "React", likes: 200 },
]);
</script>
```

父组件：

```js
<FancyList>
  <template #item="{ text, likes }">
    <p>{{ text }} ❤️ {{ likes }}</p>
  </template>
</FancyList>
```

结果：

```txt
Vue ❤️ 100
React ❤️ 200
```

### 无渲染组件 ###

封装逻辑但不渲染视图，内容交给父组件：

```vue
<!-- MouseTracker.vue -->
<template>
  <slot :x="x" :y="y"></slot>
</template>

<script setup>
import { ref, onMounted } from "vue";
const x = ref(0), y = ref(0);
onMounted(() => {
  window.addEventListener("mousemove", e => {
    x.value = e.pageX;
    y.value = e.pageY;
  });
});
</script>
```

父组件：

```js
<MouseTracker v-slot="{ x, y }">
  鼠标位置：{{ x }} , {{ y }}
</MouseTracker>
```

## 五、知识点图解 ##

```txt
父组件 ----> 子组件
   │           │
   │ props     │
   │ slot内容  │ <slot> 占位符
   ▼           ▼
插槽渲染 = 父组件内容 + 子组件外壳
```

## 六、总结 ##

- 默认插槽：没有名字的插槽，占位填充内容。

- 默认内容：父组件没传时，slot 会显示默认值。

- 具名插槽：给 slot 命名，实现多出口填充。

- 条件插槽：通过 `$slots` 判断是否存在内容。

- 动态插槽名：slot 的名字可动态绑定。

- 作用域插槽：子组件把数据传给插槽，让父组件使用。

- 实战场景：列表组件、无渲染组件，逻辑和视图分离。

👉 插槽的核心价值：**让组件更灵活、可复用，同时保留样式与逻辑的封装性**。
