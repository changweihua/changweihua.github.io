---
lastUpdated: true
commentabled: false
recommended: false
title: 在vue3中如何编写一个标准的hooks
description: 在vue3中如何编写一个标准的hooks
date: 2024-08-09 14:18:00
pageClass: blog-page-class
---

# 在vue3中如何编写一个标准的hooks #

## 前言 ##

在 Vue 3 中，组合式 API 为开发者提供了更加灵活和高效的方式来组织和复用逻辑，其中 Hooks 是一个重要的概念。Hooks 允许我们将组件中的逻辑提取出来，使其更具可复用性和可读性，让我们的代码编写更加灵活。

## hooks的定义 ##

其实，事实上官方并未管这种方式叫做hooks，而似乎更应该叫做compositions更加确切些，更加符合vue3的设计初衷。出于react的hooks设计理念在前，而vue3的组合式使用也像一个hook钩子挂载vue框架的生命周期中，对此习惯性地称作hooks。
对于onMounted、onUnMounted等响应式API都必须setup阶段进行同步调用。

要理解 Vue 3 中的 Hooks，需要明白它的本质是一个函数，这个函数可以包含与组件相关的状态和副作用操作。

- 状态是应用中存储的数据，这些数据可以影响组件的外观和行为。在 Vue 3 中，可以使用 ref 和 reactive 来创建状态。
- 副作用操作是指在应用执行过程中会产生外部可观察效果的操作，比如数据获取、订阅事件、定时器等。这些操作可能会影响应用的状态或与外部系统进行交互。

记住：hooks就是特殊的函数，可以在vue组件外部使用，可以访问vue的响应式系统。

## vue3中hooks和react的区别 ##

Vue Composition API 与 React Hooks 都具有逻辑组合能力，但存在一些重要差异：

### React Hooks 的问题 ###

每次组件更新都会重复调用，存在诸多注意事项，可能使经验丰富的开发者也感到困惑，并导致性能优化问题。
对调用顺序敏感且不能有条件调用。
变量可能因依赖数组不正确而“过时”，开发者需依赖 `ESLint` 规则确保正确依赖，但规则不够智能，可能过度补偿正确性，遇到边界情况会很麻烦。
昂贵的计算需使用 `useMemo`，且要手动传入正确依赖数组。
传递给子组件的事件处理程序默认会导致不必要的子组件更新，需要显式使用 `useCallback` 和正确的依赖数组，否则可能导致性能问题。陈旧闭包问题结合并发特性，使理解钩子代码何时运行变得困难，处理跨渲染的可变状态也很麻烦。

### Vue Composition API 的优势 ###

`setup()` 或 `<script setup>` 中的代码仅执行一次，不存在陈旧闭包问题，调用顺序不敏感且可以有条件调用。
`Vue` 的运行时响应式系统自动收集计算属性和监听器中使用的响应式依赖，无需手动声明依赖。
无需手动缓存回调函数以避免不必要的子组件更新，精细的响应式系统确保子组件仅在需要时更新，手动优化子组件更新对 `Vue` 开发者来说很少是问题。

## 自定义hooks需要遵守的原则 ##

那么，在编写自定义Hooks时，有哪些常见的错误或者陷阱需要避免？

以下是一些需要注意的点

- 状态共享问题： 不要在自定义Hooks内部创建状态（使用ref或reactive），除非这些状态是暴露给使用者的API的一部分。Hooks应该是无状态的，避免在Hooks内部保存状态。
- 副作用处理不当： 副作用（例如API调用、定时器等）应该在生命周期钩子（如onMounted、onUnmounted）中处理。不要在自定义Hooks的参数处理或逻辑中直接执行副作用。
- 过度依赖外部状态： 自定义Hooks应尽量减少对外部状态的依赖。如果必须依赖，确保通过参数传递，而不是直接访问组件的状态或其他全局状态。
- 参数验证不足： 自定义Hooks应该能够处理无效或意外的参数。添加参数验证逻辑，确保Hooks的鲁棒性。
- 使用不稳定的API： 避免使用可能在未来版本中更改或删除的API。始终查阅官方文档，确保你使用的API是稳定的。
- 性能问题： 避免在自定义Hooks中进行昂贵的操作，如深度比较或复杂的计算，这可能会影响组件的渲染性能。
- 重渲染问题： 确保自定义Hooks不会由于响应式依赖不当而导致组件不必要的重渲染。
- 命名不一致： 自定义Hooks应该遵循一致的命名约定，通常是use前缀，以便于识别和使用。
- 过度封装： 避免创建过于通用或复杂的Hooks，这可能会导致难以理解和维护的代码。Hooks应该保持简单和直观。
- 错误处理不足： 自定义Hooks应该能够妥善处理错误情况，例如API请求失败或无效输入。
- 生命周期钩子滥用： 不要在自定义Hooks中滥用生命周期钩子，确保只在必要时使用。
- 不遵循单向数据流： Hooks应该遵循Vue的单向数据流原则，避免创建可能导致数据流混乱的逻辑。
- 忽视类型检查： 使用TypeScript编写Hooks时，确保进行了适当的类型检查和类型推断。
- 使用不恰当的响应式API： 例如，使用ref而不是reactive，或者在应该使用readonly的场景中使用了可变对象。
- 全局状态管理不当： 如果你的Hooks依赖于全局状态，确保正确处理，避免造成状态管理上的混乱。

## 示例 ##

记住这些军规后，我们尝试自己写一个自定义hooks函数。下面代码实现了一个自定义的钩子函数，用于处理组件的事件监听和卸载逻辑，以达到组件逻辑的封装和复用目的。

```vue
import { ref, onMounted, onUnmounted } from 'vue';

function useEventListener(eventType, listener, options = false) {
  const targetRef = ref(null);

  onMounted(() => {
    const target = targetRef.value;
    if (target) {
      target.addEventListener(eventType, listener, options);
    }
  });

  onUnmounted(() => {
    const target = targetRef.value;
    if (target) {
      target.removeEventListener(eventType, listener, options);
    }
  });

  return targetRef;
}
```

对于简单的数字累加自定义hooks方法，我们可以这样写：

```vue
import { ref } from 'vue';

function useCounter(initialValue = 0) {
  const count = ref(initialValue);
  const increment = () => {
    count.value++;
  };

  return { count, increment };
}
```

使用hooks

```vue
<template>
  <div>{{ count }}</div>
</template>

<script setup>
import { useCounter } from './useCounter';

const { count } = useCounter(10);
</script>
```

## 那么什么场景下需要抽取hooks呢？ ##

在以下几种情况下，通常需要抽取 Hooks 方法：

**1.逻辑复用**

当多个组件中存在相同或相似的逻辑时，抽取为 Hooks 可以提高代码的复用性。
例如，在多个不同的页面组件中都需要进行数据获取和状态管理，如从服务器获取用户信息并显示加载状态、错误状态等。可以将这些逻辑抽取为一个useFetchUser的 Hooks 方法，这样不同的组件都可以调用这个方法来获取用户信息，避免了重复编写相同的代码。

**2.复杂逻辑的封装**

如果某个组件中有比较复杂的业务逻辑，将其抽取为 Hooks 可以使组件的代码更加清晰和易于维护。

比如，一个表单组件中包含了表单验证、数据提交、错误处理等复杂逻辑。可以将这些逻辑分别抽取为useFormValidation、useSubmitForm、useFormErrorHandling等 Hooks 方法，然后在表单组件中组合使用这些 Hooks，使得表单组件的主要逻辑更加专注于用户界面的呈现，而复杂的业务逻辑被封装在 Hooks 中。

**3.与特定功能相关的逻辑**

当有一些特定的功能需要在多个组件中使用时，可以抽取为 Hooks。

例如，实现一个主题切换功能，需要管理当前主题状态、切换主题的方法以及保存主题设置到本地存储等逻辑。可以将这些逻辑抽取为useTheme Hooks 方法，方便在不同的组件中切换主题和获取当前主题状态。

**4.提高测试性**

如果某些逻辑在组件中难以进行单元测试，可以将其抽取为 Hooks 以提高测试性。
比如，一个组件中的定时器逻辑可能与组件的生命周期紧密耦合，难以单独测试。将定时器相关的逻辑抽取为useTimer Hooks 方法后，可以更容易地对定时器的行为进行单元测试，而不依赖于组件的其他部分。

总之，抽取 Hooks 方法可以提高代码的复用性、可维护性和测试性，当遇到上述情况时，考虑抽取 Hooks 是一个很好的实践。
