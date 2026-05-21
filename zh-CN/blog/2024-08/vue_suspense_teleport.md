---
lastUpdated: true
commentabled: true
recommended: true
title: 推荐两个vue超实用的官方内置组件Teleport和Suspense
description: 推荐两个vue超实用的官方内置组件Teleport和Suspense
date: 2024-08-09 14:18:00
pageClass: blog-page-class
---

# 推荐两个vue超实用的官方内置组件Teleport和Suspense #

## 前言 ##

先直入主题，这文章要介绍的两个内置组件分别是Teleport和Suspense。 之前vue3刚出来就知道增加了Teleport这个内置组件，作用大概是类似传送门，把某个DOM传送到别个一个DOM结构中展示，但最近做某个需求首次使用才觉得Teleport真香啊，太方便了; 而Suspense 组件侧是用于处理异步组件加载时的用户体验的组件。下面分别细说它们的作用、用法和注意事项。


## Suspense 组件 ##

### 作用简述 ###

> Suspense用于处理异步组件加载时的用户体验。它可以在组件加载完成前展示一个你自定义的效果，并在组件加载完成后隐藏它。这对于优化用户视觉体验，特别是在组件需要从服务器异步加载时是相当有用。

### Suspense 基本用法 ###

> Suspense 组件能接受两个插槽分别是#default 和 #fallback。#default 插槽主要用于放置需要加载的组件，而 #fallback 插槽侧用于在组件加载期间想要显示的内容。

### 代码示例 ###

```ts
<template>
  <Suspense>
    <template #default>
      <MyComponent />
    </template>
    <template #fallback>
      <div>加载中你想要显示的内容...</div>
    </template>
  </Suspense>
</template>

<script setup>
  import { defineAsyncComponent } from 'vue';

  const MyComponent = defineAsyncComponent(() => import('./MyComponent.vue')),
</script>
```

上述例子中，当 MyComponent 正在加载时，用户会看到#fallback中你想要展示的内容。一旦组件加载完成，Suspense 将自动切换到 MyComponent中。

### Suspense 进阶用法 ###

**自定义超时时间**:  可以通过 timeout 属性来设置 Suspense 在显示内容之前的等待时间。这样能防止在组件快速加载时显示时间过于短暂出现闪一下的效果。

```vue
<Suspense timeout="500">
  逻辑内容
</Suspense>
```

**多个异步组件优先级**: 当页面中有多个异步组件时，Suspense 可以按需加载组件，先加载的组件会先显示，而内容会在所有组件加载完成前一直显示。

```vue
<template>
  <Suspense>
    <template #default>
      <MyComponentA />
      <MyComponentB />
    </template>
    <template #fallback> 加载中的内容 </template>
  </Suspense>
</template>

<script setup>
  import { defineAsyncComponent } from 'vue';

  const MyComponentA = defineAsyncComponent(() => import('./MyComponentA.vue'))
  const MyComponentB = defineAsyncComponent(() => import('./MyComponentB.vue'))
</script>
```

**动态组件结合 Suspense**： Suspense能和 Vue 的动态组件 `<component :is="isComponent">` 一起使用，方便处理动态加载的组件。

```vue
<template>
  <Suspense>
    <template #default>
      <component :is="isComponent" />
    </template>
    <template #fallback>
     加载中显示的内容
    </template>
  </Suspense>
</template>
```

**Suspense 结合 SSR **： 在服务端渲染（SSR）环境中，Suspense 会等待所有异步组件加载完成后再渲染页面，这可以确保客户端和服务器端的渲染结果一致。
**Suspense 的错误处理**:  如果异步组件加载失败，Suspense 并不会自动处理错误。它需要我们在组件的 onErrorCaptured钩子中处理错误，或者使用全局的错误处理机制。

```vue
<script setup>
  import { defineAsyncComponent,onErrorCaptured } from 'vue';

  const MyComponent = defineAsyncComponent(() => import('./MyComponent.vue')),

  const error = ref(null);
  onErrorCaptured((err) => {
    error.value = err;
    return false; // 阻止错误冒泡
  });
</script>
```

## Teleport 组件 ##

### 作用简述 ###

Teleport 组件我们将组件的渲染结果“传送”到 DOM 树中的另一个位置，而不会影响到组件自身的层级关系。这在处理模态对话框、固定定位元素、或者任何需要脱离当前组件层级结构的元素时非常有用。

### Suspense 基本用法 ###

Teleport 组件接受一个 to 属性，该属性指定目标元素的选择器。Teleport 的子元素将会被插入到由 to 目标属性指定的元素中展现出来。

### 代码示例 ###

```vue
<template>
  <Teleport to="#my-root">
    <div id="my-modal" class="modal">
      <!-- 想要展示的内容 -->
    </div>
  </Teleport>
</template>
```
上述示例中，`#my-modal` 元素将被传送到具有 `id="my-root"` 的元素中，无论该元素在组件树中的哪个位置。

### Suspense 进阶用法 ###

**动态 to 属性**: to 属性可以是动态的，也就是说可以根据组件的状态或用户的交互来改变传送的目标。

```vue
<Teleport :to="targetElement">
  <!--  想要展示的内容 -->
</Teleport>
```

**禁用 Teleport**: 可以使用 disabled 属性来临时禁用 Teleport 的功能，这在某些条件下不希望进行传送时很有用。

```vue
<Teleport to="#my-root" :disabled="!showModal">
  <!--  想要展示的内容 -->
</Teleport>
```

**多个 Teleport 实例**: 可以在同一个组件中使用多个 Teleport 实例，将不同的部分传送到不同的目标位置。
**事件冒泡**: 使用 Teleport 时要注意事件冒泡的问题。由于元素被传送到不同的位置，事件可能会冒泡到目标元素而非原始的组件树。在处理点击或其他事件时，你可能需要考虑这一点。
**条件渲染**: 你可以根据条件渲染 Teleport 组件，例如只在需要显示模态框时才传送元素。

```vue
<Teleport v-if="showModal" to="#my-root">
  <!--  想要展示的内容 -->
</Teleport>
```

### Teleport 的注意事项 ###

- Teleport 不能用于根组件，因为根组件必须始终渲染到 #app 或指定的挂载点。
- 当 Teleport 的目标元素不存在时，子元素将不会被渲染。
- Teleport 的子元素不会影响其周围的兄弟元素，因此可以用于创建浮动或覆盖元素，而不干扰页面的布局流。

## 小结 ##

- Teleport 和 Suspense 是 Vue3 中两个重要的内置组件，分别用于处理组件渲染位置和异步组件加载时的用户体验。
- Teleport 使得组件可以灵活地渲染到文档的任意位置，而 Suspense 则确保了异步组件加载过程中的平滑过渡。
- 正确使用这两个组件可以显著提升应用的性能和用户体验，特别是在处理复杂的UI场景时。如果那里写的不对或者有什么建议欢迎大佬们指点一二
