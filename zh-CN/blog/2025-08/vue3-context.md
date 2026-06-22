---
lastUpdated: true
commentabled: true
recommended: true
title: Vue3 Context Hooks 实现
description: Vue3 Context Hooks 实现
date: 2025-08-26 14:15:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 创建 useContext Hook 文件 ##

首先创建一个单独的 useContext.ts 文件：

```ts
import { provide, inject, reactive, readonly } from 'vue';

/**
 * 创建 Vue3 上下文 Hook
 * @param {string} contextName 上下文名称
 * @param {*} defaultValue 默认值
 * @returns {Array} [Provider组件, useContext Hook]
 */
export const createContext = (contextName, defaultValue) => {
  const ContextSymbol = Symbol(contextName);
  
  const Provider = {
    name: `${contextName}Provider`,
    props: {
      value: {
        type: Object,
        required: true
      }
    },
    setup(props, { slots }) {
      const state = reactive(props.value);
      provide(ContextSymbol, readonly(state));
      return () => slots.default?.();
    }
  };
  
  const useContext = () => {
    const context = inject(ContextSymbol);
    if (!context) {
      console.warn(`Context ${contextName} not found`);
      return defaultValue;
    }
    return context;
  };
  
  return [Provider, useContext];
};
```

## 创建具体的 Context Hook ##

然后创建一个具体的 Context Hook，比如 useCountContext.ts：

```ts
import { createContext } from './useContext';

// 创建 CountContext
const [CountProvider, useCount] = createContext('CountContext', {
  count: 0,
  increment: () => {},
  decrement: () => {}
});

export { CountProvider, useCount };
```

## 在组件中使用 ##

### 父组件 (Provider) ###

```vue
<script setup>
import { ref } from 'vue';
import { CountProvider } from '@/hooks/useCountContext';
import ChildComponent from './ChildComponent.vue';

const count = ref(0);

const contextValue = {
  count,
  increment: () => count.value++,
  decrement: () => count.value--
};
</script>

<template>
  <div class="parent">
    <h2>父组件 (Provider)</h2>
    <p>当前计数: {{ count }}</p>
    
    <CountProvider :value="contextValue">
      <ChildComponent />
    </CountProvider>
  </div>
</template>

<style scoped>
.parent {
  padding: 20px;
  border: 1px solid #eee;
  margin-bottom: 20px;
}
</style>
```

### 子组件 (Consumer) ###

```vue
<script setup>
import { useCount } from '@/hooks/useCountContext';

const { count, increment, decrement } = useCount();
</script>

<template>
  <div class="child">
    <h3>子组件 (Consumer)</h3>
    <p>从 Context 获取的计数: {{ count }}</p>
    <button @click="increment">增加</button>
    <button @click="decrement">减少</button>
  </div>
</template>

<style scoped>
.child {
  padding: 15px;
  border: 1px solid #ddd;
  margin-top: 10px;
}
button {
  margin: 0 5px;
}
</style>
```

## 嵌套使用示例 ##

```vue
<script setup>
import { ref } from 'vue';
import { CountProvider } from '@/hooks/useCountContext';
import ChildComponent from './ChildComponent.vue';

const parentCount = ref(0);
const childCount = ref(100);

const parentContext = {
  count: parentCount,
  increment: () => parentCount.value++,
  decrement: () => parentCount.value--
};

const childContext = {
  count: childCount,
  increment: () => childCount.value += 10,
  decrement: () => childCount.value -= 10
};
</script>

<template>
  <div class="nested-example">
    <h2>嵌套 Context 示例</h2>
    
    <CountProvider :value="parentContext">
      <ChildComponent />
      
      <CountProvider :value="childContext">
        <ChildComponent />
      </CountProvider>
    </CountProvider>
  </div>
</template>
```

## TypeScript 支持 (可选) ##

```ts
import { provide, inject, reactive, readonly, InjectionKey } from 'vue';

export const createContext = <T>(contextName: string, defaultValue: T) => {
  const ContextSymbol = Symbol(contextName) as InjectionKey<T>;
  
  const Provider = {
    name: `${contextName}Provider`,
    props: {
      value: {
        type: Object as () => T,
        required: true
      }
    },
    setup(props: { value: T }, { slots }) {
      const state = reactive(props.value);
      provide(ContextSymbol, readonly(state));
      return () => slots.default?.();
    }
  };
  
  const useContext = (): T => {
    const context = inject(ContextSymbol);
    if (!context) {
      console.warn(`Context ${contextName} not found`);
      return defaultValue;
    }
    return context;
  };
  
  return [Provider, useContext] as const;
};
```
