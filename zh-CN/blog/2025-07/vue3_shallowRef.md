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

在 Vue3 里，`shallowRef` 是一个很实用的函数，其作用是创建一种特殊的 ref 对象，它只对自身的值变化进行追踪，而不会递归追踪内部属性的变化。下面详细介绍它的功能和适用情形。

## 主要功能 ##

- **浅层响应性**：`shallowRef` 仅对 `.value` 的赋值操作作出响应，而内部对象的属性变化不会触发更新。
- **性能优化**：在处理大型数据结构或者第三方对象（像 DOM 元素、API 响应数据）时，若无需追踪内部变化，使用它能避免不必要的响应式开销。
- **保持原始对象**：它不会像 `ref` 那样对深层对象进行代理转换，有助于维持对象的原始状态。

## 典型应用场景 ##

### 缓存大型数据 ###

当你有大量静态数据，且不需要监听其变化时，可以使用 `shallowRef` 来避免性能浪费。

```ts
const largeData = shallowRef(getLargeDataFromAPI()); // 数据更新时才需手动触发更新
```

### 集成第三方库 ###

在集成第三方库时，使用 `shallowRef` 可以存储库返回的实例，防止 `Vue` 对其进行不必要的代理。

```ts
const map = shallowRef(null);

onMounted(() => {
  map.value = new MapLibreGL.Map(...); // 存储原生DOM或库实例
});
```

### 手动控制更新 ###

如果你希望手动控制更新时机，以减少渲染次数，`shallowRef` 是个不错的选择。

```ts
const state = shallowRef({ count: 0 });

function increment() {
  state.value.count++; // 不会触发更新
  nextTick(() => {
    forceUpdate(); // 手动触发更新
  });
}
```

## 与普通 ref 的差异 ##

| 特性        |      ref      |  shallowRef |
| :-----------: | :-----------: | :----: |
| 深层响应性      | 具备 | 不具备 |
| 对象代理      | 进行代理转换 | 保持原始对象 |
| 触发更新的方式      | 对象属性变化会触发更新 | 仅 `.value` 赋值操作会触发更新 |

## 手动触发更新的方法 ##

如果使用了 `shallowRef`，但又需要在内部属性变化时触发更新，可以采用以下方法：

### 方法一：替换整个value ###

```ts
state.value = { ...state.value, count: state.value.count + 1 };
```

### 方法二：结合triggerRef强制更新 ###

```ts
import { shallowRef, triggerRef } from 'vue';

const state = shallowRef({ count: 0 });

function increment() {
  state.value.count++;
  triggerRef(state); // 手动触发更新
}
```

## 使用建议 ##

- 当你需要处理大型数据结构，并且不需要追踪内部变化时，优先考虑使用 `shallowRef`。
- 存储第三方实例（如 DOM、Canvas、Map 等）时，`shallowRef` 是很好的选择。
- 如果需要响应式地追踪内部变化，应使用普通的 `ref` 或 `reactive`。

通过合理运用 `shallowRef`，可以在 `Vue` 应用中实现更精准的响应式控制，从而优化性能。
