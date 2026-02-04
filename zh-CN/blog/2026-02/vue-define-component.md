---
lastUpdated: true
commentabled: true
recommended: true
title: Vue3组件二次封装终极指南
description: 动态组件 + `h` 函数的优雅实现
date: 2026-02-04 08:45:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

> 🚀 Vue3组件二次封装终极指南：动态组件+h函数的优雅实现

## 📋 前言 ##

在Vue3项目开发中，我们经常需要对第三方UI库（如Element Plus、Ant Design Vue等）的组件进行二次封装，以满足项目的特定需求。传统的封装方式往往代码冗余、维护困难，本文将为你揭示一种革命性的封装方案——基于动态组件和h函数的优雅实现。

## 🤔 传统封装方案的痛点 ##

在深入新方案之前，让我们先了解传统组件封装面临的挑战：

### 传统实现方式 ###

```vue
<template>
  <el-input 
    v-bind="$props" 
    v-bind="$attrs" 
    @input="handleInput"
    @change="handleChange"
  >
    <template v-for="(slot, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
  </el-input>
</template>
```

### 存在的问题 ###

- 🔄 代码重复：每个封装组件都需要重复编写属性透传逻辑
- 📝 维护困难：原组件更新时，封装组件需要同步修改
- 🎯 类型丢失：TypeScript 类型提示不完整
- 🔧 扩展复杂：添加新功能时代码结构混乱

## 💡 革命性解决方案：动态组件 + `h` 函数 ##

核心思想：利用Vue3的动态组件特性和h函数的强大能力，实现一行代码完成组件封装的所有需求——props透传、事件绑定、插槽传递。

## 🛠️ 核心实现方案 ##

### 🎯 封装组件的三大要素 ###

在开始实现之前，我们需要明确组件封装的核心要素：

|  要素  |  作用  |   传统处理方式  |   新方案优势  |
| :-----------: | :----: | :----: | :----: |
| Props |  属性传递  |  `v-bind="$props"` |  自动透传，类型完整 |
| Events |  事件处理  |  逐个绑定事件 |  自动绑定，无需手动处理 |
| Slots |  插槽传递  |  `v-for`遍历`$slots` |  直接传递，结构清晰 |

### 💎 核心实现代码 ###

采用动态组件 + `h` 函数的革命性方案：

```vue
<template>
  <component
    :is="h(ElInput, { ...$props, ...$attrs, ref: changeRef }, $slots)"
  />
  <!-- 🚀 扩展区域：在这里可以添加自定义功能，如验证提示、格式化等 -->
</template>

<script setup lang="ts">
import { ElInput, type InputProps } from "element-plus";
import { getCurrentInstance, h, type ComponentInstance } from "vue";

// 🎯 类型定义：继承原组件的所有属性类型
interface MyInputProps extends Partial<InputProps> {
  // 💡 在这里可以扩展自定义属性
  // customProp?: string;
}

const props = defineProps<MyInputProps>();
const vm = getCurrentInstance();

/**
 * 🔧 智能ref处理函数
 * @param instance 组件实例
 * 
 * 作用：
 * 1. 将内部组件实例暴露给父组件
 * 2. 防止组件销毁时的内存泄漏
 * 3. 保持完整的类型提示
 */
const changeRef = (instance: any) => {
  // 对外暴露组件实例，等同于 defineExpose
  vm!.exposed = instance || {};
  vm!.exposeProxy = instance || {};
};

// 🎭 类型声明：为父组件提供完整的类型提示
defineExpose({} as ComponentInstance<typeof ElInput>);
</script>

<style scoped>
/* 🎨 在这里可以添加自定义样式 */
</style>
```

## 🔍 核心原理解析 ##

### 动态组件的妙用 ###

```vue
<component :is="h(ElInput, { ...$props, ...$attrs, ref: changeRef }, $slots)" />
```

#### 为什么动态组件可以接收h函数？ ####

- Vue组件在编译后本质上是返回 `VNode` 的函数
- `h` 函数专门用于生成 `VNode`
- 动态组件的`:is`可以接收组件、`VNode`或渲染函数

### h函数的三参数模式 ###

当h函数接收三个参数时：

```typescript
h(component, props, children)
```

|  参数  |  类型  |   作用  |
| :-----------: | :----: | :----: |
| component |  Component  |  要渲染的组件 |
| props |  Object  |  传递给组件的属性和事件 |
| children |  Slots/Array  |  子节点或插槽内容 |

### 属性合并策略 ###

```javascript
{ ...$props, ...$attrs, ref: changeRef }
```

- `$props`：组件定义的属性
- `$attrs`：未在 `props` 中声明的属性
- `ref`：组件实例引用处理

## 🎯 实际使用示例 ##

### 基础使用 ###

```vue
<template>
  <div>
    <my-input
      v-model="value"
      placeholder="请输入内容"
      clearable
      @change="handleChange"
      ref="inputRef"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </my-input>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import MyInput from "./components/MyInput.vue";

const value = ref("");
const inputRef = ref();

const handleChange = (val: string) => {
  console.log("输入值变化:", val);
};

// 🎯 演示组件实例方法调用
setTimeout(() => {
  inputRef.value?.clear(); // 完美的类型提示
}, 2000);
</script>
```

### 🔧 扩展功能示例 ###

```vue
<template>
  <component
    :is="h(ElInput, { ...$props, ...$attrs, ref: changeRef }, $slots)"
  />
  
  <!-- 🚀 扩展功能：添加字符计数 -->
  <div v-if="showCount" class="char-count">
    {{ currentLength }}/{{ maxLength }}
  </div>
</template>

<script setup lang="ts">
import { ElInput, type InputProps } from "element-plus";
import { getCurrentInstance, h, type ComponentInstance, computed } from "vue";

// 🎯 扩展属性类型定义
interface MyInputProps extends Partial<InputProps> {
  showCount?: boolean;
  maxLength?: number;
}

const props = withDefaults(defineProps<MyInputProps>(), {
  showCount: false,
  maxLength: 100
});

const vm = getCurrentInstance();

// 🧮 计算当前字符长度
const currentLength = computed(() => {
  return String(props.modelValue || '').length;
});

const changeRef = (instance: any) => {
  vm!.exposed = instance || {};
  vm!.exposeProxy = instance || {};
};

defineExpose({} as ComponentInstance<typeof ElInput>);
</script>

<style scoped>
.char-count {
  text-align: right;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
```

## 🔬 深度技术解析 ##

### 🎭 ref函数处理机制 ###

Vue 中的 `ref` 不仅可以接收字符串，还可以接收函数。使用函数形式的 `ref` 有以下优势：

```vue
// ❌ 字符串ref（可能存在内存泄漏）
<template>
  <el-input ref="inputRef" />
</template>

// ✅ 函数ref（自动清理，更安全）
<template>
  <el-input :ref="(el) => inputRef = el" />
</template>
```

函数ref的优势：

- 🛡️ 内存安全：组件销毁时自动清理引用
- 🎯 类型安全：更好的TypeScript支持
- 🔧 灵活控制：可以在函数中添加额外逻辑

### 🧩 组件实例暴露原理 ###

```typescript
const changeRef = (instance: any) => {
  // 直接操作Vue实例的内部属性
  vm!.exposed = instance || {};
  vm!.exposeProxy = instance || {};
};

// 等价于
defineExpose(instance);
```

原理解析：

- `vm.exposed`：存储暴露给父组件的属性和方法
- `vm.exposeProxy`：代理对象，提供类型提示和访问控制

这种方式实现了完美的组件实例透传

### 🎨 事件处理扩展 ###

```vue
<template>
  <component
    :is="h(ElInput, { 
      ...$props, 
      ...$attrs, 
      ref: changeRef,
      // 🎯 扩展事件处理
      onInput: handleInput,
      onChange: handleChange
    }, $slots)"
  />
</template>

<script setup lang="ts">
// 🔧 自定义事件处理
const emit = defineEmits<{
  customEvent: [value: string]
  validated: [isValid: boolean]
}>();

const handleInput = (value: string) => {
  // 原始input事件处理
  emit('customEvent', value);
  
  // 可以添加自定义逻辑
  if (value.length > 10) {
    emit('validated', false);
  }
};

const handleChange = (value: string) => {
  // 原始change事件处理
  console.log('值改变:', value);
};
</script>
```

## 🚀 最佳实践与进阶技巧 ##

### 📋 最佳实践建议 ###

|  实践项  |  建议  |   原因  |
| :-----------: | :----: | :----: |
| 类型定义 |  继承原组件类型，扩展自定义属性  |  保持类型完整性和IDE提示 |
| 命名规范 |  使用 `PascalCase` 命名组件文件  |  符合Vue官方规范 |
| `ref` 处理 |  优先使用函数形式的 `ref`  |  避免内存泄漏，更安全 |
| 事件处理 |  在h函数中直接绑定事件  |  性能更好，代码更简洁 |
| 样式隔离 |  使用 `scoped` 样式  |  避免样式污染 |

### 🎯 适用场景 ###

#### ✅ 适合使用的场景 ####

- 🔧 UI库组件增强：为Element Plus、Ant Design等组件添加业务逻辑
- 🎨 统一样式定制：在保持原功能基础上统一项目样式
- 📊 数据处理封装：添加数据验证、格式化等功能
- 🔄 行为扩展：增加 `loading` 状态、权限控制等

#### ❌ 不适合使用的场景 ####

- 🏗️ 复杂业务组件：业务逻辑复杂时，直接开发更合适
- 🎭 完全重写UI：如果需要完全改变组件外观，不如重新开发
- 📱 性能敏感场景：对性能要求极高的场景，直接使用原组件

### 🛠️ 通用封装模板 ###

创建一个通用的封装工具函数：

```typescript
// utils/componentWrapper.ts
import { getCurrentInstance, h, type ComponentInstance } from 'vue';

/**
 * 🎯 通用组件封装工具
 * @param OriginalComponent 原始组件
 * @param customProps 自定义属性类型
 */
export function createWrapper<T extends Record<string, any>>(
  OriginalComponent: any,
  customProps?: T
) {
  return {
    name: `Wrapped${OriginalComponent.name || 'Component'}`,
    props: customProps,
    setup(props: any, { slots, attrs }: any) {
      const vm = getCurrentInstance();
      
      const changeRef = (instance: any) => {
        vm!.exposed = instance || {};
        vm!.exposeProxy = instance || {};
      };
      
      return () => h('component', {
        is: h(OriginalComponent, { 
          ...props, 
          ...attrs, 
          ref: changeRef 
        }, slots)
      });
    }
  };
}
```

使用示例：

```vue
<script setup lang="ts">
import { ElInput } from 'element-plus';
import { createWrapper } from '@/utils/componentWrapper';

// 🎯 快速创建封装组件
const MyInput = createWrapper(ElInput, {
  showCount: { type: Boolean, default: false },
  maxLength: { type: Number, default: 100 }
});
</script>

<template>
  <MyInput 
    v-model="value" 
    show-count 
    :max-length="50" 
  />
</template>
```

### 🔍 性能优化建议 ###

#### 🎯 按需导入 ####

```typescript
// ✅ 推荐：按需导入
import { ElInput } from 'element-plus';

// ❌ 避免：全量导入
import ElementPlus from 'element-plus';
```

#### 🚀 异步组件 ####

```typescript
// 🎯 大型组件使用异步加载
const MyInput = defineAsyncComponent(() => import('./MyInput.vue'));
```

#### 📦 组件缓存 ####

```vue
<template>
  <keep-alive>
    <component :is="currentComponent" />
  </keep-alive>
</template>
```

## 📚 总结 ##

### 🎯 核心优势回顾 ###

|  优势  |  传统方案  |   新方案  |
| :-----------: | :----: | :----: |
| 代码量 |  20-30行  |  5-10行 |
| 维护性 |  需要同步更新  |  自动同步 |
| 类型安全 |  部分支持  |  完全支持 |
| 扩展性 |  复杂  |  简单 |
| 性能 |  一般  |  更优 |

### 🚀 技术要点总结 ###

- 动态组件 + `h`函数：一行代码解决三大封装难题
- 函数式 `ref`：更安全的组件实例处理
- 类型继承：完美的 TypeScript 支持
- 属性透传：自动处理 `props` 和 `attrs`
- 插槽传递：无缝支持所有插槽

### 🎓 学习建议 ###

- 🔍 深入理解 Vue3 响应式原理：有助于更好地理解组件封装
- 🛠️ 熟练掌握 TypeScript：提升开发效率和代码质量
- 📖 阅读 Vue3 源码：了解 `h` 函数和动态组件的实现原理
- 🎯 实践项目应用：在实际项目中应用这些技巧


> 🚀 Vue3 高级组件封装实践指南：让你的组件更优雅、更好用

二次封装不是 copy 原组件的 props 和事件，而是构建「更契合业务」的组件语法糖。

在 Vue3 的日常开发中，我们经常需要对组件库（如 Element Plus、Ant Design Vue 等）做二次封装，目的是*统一使用方式、提升开发效率*，甚至*扩展一些业务逻辑*。

但是封装一个组件远不只是包一层那么简单，常见的几个挑战你一定遇到过：

- 如何优雅地*透传 `props` 和 `slots`？*
如何让封装组件*支持完整的类型提示？*
怎么暴露原组件的方法供外部使用？

别急，这篇文章将带你一步步拆解 Vue3 组件封装的“硬核技能”。

## 🧩 场景一：优雅透传 `props` + `attrs` ##

在 Vue3 中，`$attrs` 是一个非常强大的机制，它可以让你轻松地将父组件传入的属性“传下去”给子组件，特别适合做中间层封装时使用。

常见的需求场景有：

- 你只想定义一部分常用 `props`，其他的由父组件直接传入；
- 你希望支持原组件的所有事件（例如 `onFocus`, `onInput` 等），但又不想每个都手动绑定；

这时，`mergeProps($attrs, props)` 是最优解。它不仅能合并这两个对象，还能自动合并事件、class、style 等属性，避免冲突。

我们希望外部传入的属性能自动绑定到封装组件内部的基础组件上，同时不破坏类型提示。

### 👎 传统做法 ###

```vue
<template>
  <el-input :model-value="modelValue" @input="onInput" />
</template>
```

👎 结果：每加一个 `props` 或事件都要手动添加，非常繁琐且容易遗漏。

### 👍 推荐方案 ###

```ts
const props = defineProps<InputProps>() // 自定义 props
```


```vue
<template>
  <el-input v-bind="mergeProps($attrs, props)" />
</template>
```

使用 `mergeProps($attrs, props)`，可以将所有传入属性（包括原组件支持的）合并传递，无需一一显式声明，同时保留类型提示 ✨。

## 🎭 场景二：插槽（slots）穿透不翻车 ##

Vue3 的插槽机制相比 Vue2 更加灵活，特别是组合式 API 下的 `$slots` 和 `defineSlots`，让插槽传递和类型定义更加清晰。

### 为什么插槽要穿透？ ###

- 原组件通常提供了很多插槽能力（如表格 header、input prepend/append），如果封装时不透传，用户无法扩展；
- 插槽透传能够实现更大的复用性；

使用 `v-for` 动态绑定所有插槽是一个万能方案，适用于绝大多数组件封装场景。
封装组件后，我们仍然希望原组件的插槽功能可以继续使用，特别是具名插槽。

### 👎 错误做法 ###

```vue
<el-table>
  <slot></slot> <!-- 只能透传默认插槽 -->
</el-table>
```

### 👍 正确做法（`v-for` 遍历） ###

```vue
<el-table v-bind="mergeProps($attrs, props)">
  <template v-for="(slotFn, name) in $slots" #[name]="slotProps">
    <slot :name="name" v-bind="slotProps" />
  </template>
</el-table>
```

这种方式支持透传所有插槽，包含默认插槽和具名插槽（例如 `#header`、`#footer` 等）。

## 🧪 场景三：暴露内部组件方法 ##

在封装组件时，如果内部组件的方法无法从外部调用，就会降低灵活性。例如：

- 用户希望调用 `.focus()`、`.validate()` 等原组件的方法；
- 或者你在封装表单时，希望通过外部控制其校验、重置等逻辑；

Vue3 的 `defineExpose()` 可以将内部方法暴露给使用 `ref` 的父组件。

有时我们需要通过 `ref` 调用封装组件的原始方法，比如聚焦 input、清空表单等。

### 👎 直接 ref 会拿不到组件实例 ###

```ts
const inputRef = ref()
inputRef.value?.focus() // ❌ undefined
```

### 👍 正确暴露方式 ###

```ts
const innerRef = ref()
defineExpose({
  focus: () => innerRef.value?.focus(),
  clear: () => innerRef.value?.clear(),
})
```

或者简洁一点：

```ts
defineExpose(innerRef)
```

这样父组件就可以用 `ref` 调用内部组件的方法，非常实用！

## 🧠 场景四：类型提示完整才是真的封装！ ##

使用 TypeScript 时，类型安全对组件封装尤为重要。如果封装后类型提示缺失，将会严重影响开发体验。

比如：

- `props` 不提示或提示错误，导致传参混乱；
- 插槽不提示内容结构，不清楚传入插槽函数应该接收什么参数；
- 事件没有类型定义，容易误传；

这时候就需要用到 Vue 提供的一些 TS 工具类型（如 `ExtractPublicPropTypes`, `defineSlots`）来增强封装组件的类型能力。

我们希望即使是封装后的组件，开发者依然能享受到 TS 的智能提示（props、slots、events）。

### Props 类型提取 ###

```ts
import type { ExtractPublicPropTypes } from 'vue'
const inputProps = { ... } // 原组件 props 定义
type InputProps = ExtractPublicPropTypes<typeof inputProps>
```

这样 `defineProps<InputProps>()` 就拥有完整的类型推导！

### 插槽类型定义（Vue 3.3+） ###

```ts
const slots = defineSlots<{
  default(props: Record<string, any>): any
  prepend(): any
  append(): any
}>()
```

## 🧾 封装模版参考（Element Plus Input） ##

```vue
<script setup lang="ts">
import { ElInput } from 'element-plus'
import type { InputProps } from './types'
import { mergeProps, ref, defineExpose } from 'vue'

const props = defineProps<InputProps>()
const innerRef = ref()

defineExpose({
  focus: () => innerRef.value?.focus()
})
</script>

<template>
  <el-input
    ref="innerRef"
    v-bind="mergeProps($attrs, props)"
  >
    <template
      v-for="(slotFn, name) in $slots"
      #[name]="slotProps"
    >
      <slot :name="name" v-bind="slotProps" />
    </template>
  </el-input>
</template>
```

## 🧩 最佳实践小结 ##

|  问题  |  推荐方式  |   说明  |
| :-----------: | :----: | :----: |
| Props 透传 |  `mergeProps($attrs, props)`  |  合并外部传入属性与自定义 `props` |
| 插槽传递 |  遍历 `$slots` 透传  |  支持所有插槽透传 |
| 方法暴露 |  `defineExpose(ref)`  |  暴露子组件方法供外部调用 |
| 类型补全 |  `ExtractPublicPropTypes`、`defineSlots`  |  提供完整的 TS 支持 |

## 🔚 写在最后 ##

组件封装不是复制粘贴，而是*理解框架底层能力* + *提炼业务场景的抽象*。

掌握好 props、slots、ref、TS 类型的正确使用方式，封装出来的组件才能真正做到“可复用、可维护、开发愉快”。
