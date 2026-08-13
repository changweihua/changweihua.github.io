---
lastUpdated: true
commentabled: true
recommended: true
title: Vue 3 组件暴露 DOM 元素给父组件的方式
description: Vue 3 组件暴露 DOM 元素给父组件的方式
date: 2025-10-11 10:20:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 🎯 目标 ##

在父组件中通过 `<MyButton ref="btnRef" />` 拿到子组件内真正的 `<button>` 元素。

## ✅ 代码拆解 ##

### 父组件调用 ###

```typescript
<MyButton ref="btnRef" type="danger">默认按钮</MyButton>

const btnRef = ref<InstanceType<typeof MyButton> | null>(null);

onMounted(() => {
  console.log(btnRef.value?.buttonRef); // 想访问内部的 button 元素
});
```

### 子组件内部 ###

```ts
const buttonRef = ref<HTMLButtonElement | null>(null);

defineExpose({
  buttonRef, // 暴露给外部
});
```

```vue
<!-- 子组件模版 -->
<button
  :class="buttonClasses"
  :disabled="disable"
  :autofocus="autofocus"
  :type="nativeType"
  ref="buttonRef"
>
  <span>
    <slot />
  </span>
</button>
```

## ✅ 整体逻辑 ##

- `buttonRef` 是子组件内部绑定的 DOM 元素（即真正的 `<button>` 元素）。
- `defineExpose` 用于将 `buttonRef` 暴露给父组件。
- 父组件通过 `ref="btnRef"` 拿到 MyButton 实例，并通过 `.buttonRef` 拿到 `<button>`。

## ✅ 实际行为验证 ##

只要以下几点都没错，这就能拿到子组件的 `<button>` 元素：

- Vue 3 + `<script setup>` 中使用 `defineExpose`；
- 子组件中 `ref="buttonRef"` 确实绑定在 `<button>` 上；
- 父组件使用 `ref="btnRef"`，然后访问 `btnRef.value?.buttonRef`。

## ✅ 示例输出 ##

```ts
onMounted(() => {
  console.log(btnRef.value?.buttonRef); // HTMLButtonElement | null
});
```

你会在控制台看到类似：

```html
<button class="xxx" disabled="false" type="button">默认按钮</button>
```

## ✅ 注意事项 ##

- 确保子组件是用 `<script setup>` 写的，否则 `defineExpose` 不生效；
- `buttonRef.value` 是 DOM 元素，不是组件实例，可以直接 `.focus()`、`.click()` 等；
- 访问的是 `btnRef.value.buttonRef.value`，如果你需要 `button` 原生方法，请多加 `.value`：

```ts
btnRef.value?.buttonRef?.focus(); // 需要加 .value
```

或者：

```ts
btnRef.value?.buttonRef?.value?.focus(); // 最稳妥写法
```