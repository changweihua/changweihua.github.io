---
lastUpdated: true
commentabled: true
recommended: true
title: vue-route-query-hook
description: 提供响应式参数与 URL 查询参数之间的双向同步功能
date: 2026-01-13 13:45:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

> 一个用于 Vue 3 的 Composable，提供响应式参数与 URL 查询参数之间的双向同步功能。

## 特性 ##

- **🔄 双向同步**: 响应式参数与 URL 查询参数自动同步
- **🎯 类型安全**: 完整的 TypeScript 支持
- **⚙️ 灵活配置**: 支持排除字段、空值处理等多种配置
- **🚀 Vue 3**: 基于 Vue 3 Composition API
- **📦 轻量级**: 无额外依赖，仅依赖 Vue 和 Vue Router

## 安装 ##

```sh
npm install vue-route-query-hook // [!=npm auto]
```

::: code-group

```sh [npm]
npm install vue-route-query-hook
```

```sh [yarn]
yarn add vue-route-query-hook
```

```sh [pnpm]
pnpm add vue-route-query-hook
```

```sh [bun]
bun add vue-route-query-hook
```

:::

## 基础用法 ##

```vue
<template>
  <div>
    <input v-model="searchParams.keyword" placeholder="搜索关键词" />
    <select v-model="searchParams.status">
      <option value="">全部</option>
      <option value="active">激活</option>
      <option value="inactive">未激活</option>
    </select>
    <input v-model.number="searchParams.page" type="number" min="1" />

    <button @click="resetParams()">重置</button>
  </div>
</template>

<script setup lang="ts">
import { reactive, toRef } from "vue";
import { useRouteQuery } from "vue-route-query-hook";

const searchParams = reactive({
  keyword: "",
  status: "",
  page: 1,
});

const { updateRouteQuery, resetParams } = useRouteQuery({
  q: toRef(searchParams, "keyword"),
  status: toRef(searchParams, "status"),
  page: toRef(searchParams, "page"),
});
</script>
```

## API ##

### `useRouteQuery(params, options?)` ###

**参数**

- `params`: `QueryParams` - 要同步的响应式参数对象

  - `key`: 路由参数名
  - `value`: Vue 响应式引用 (Ref)

- `options`: `UseRouteQueryOptions` (可选) - 配置选项

**返回值**

返回一个包含以下方法的对象：

- updateRouteQuery: `() => void` - 手动更新路由查询参数
- initParamsFromRoute: `() => void` - 从路由初始化参数
- resetParams: `(resetValues?) => void` - 重置参数为初始值

## 配置选项 ##

### UseRouteQueryOptions ###

```typescript
interface UseRouteQueryOptions {
  /**
   * 排除的字段，这些字段不会同步到路由
   * @default []
   */
  excludeKeys?: string[];

  /**
   * 是否立即执行 watch 监听
   * @default true
   */
  immediate?: boolean;

  /**
   * 是否在组件挂载时从路由初始化参数
   * @default true
   */
  initFromRoute?: boolean;

  /**
   * 空值处理方式
   * - 'remove': 移除参数
   * - 'keep': 保留参数
   * @default 'remove'
   */
  emptyValueHandle?: "remove" | "keep";
}
```

## 高级用法 ##

### 排除某些字段 ###

```typescript
const searchParams = reactive({
  keyword: "",
  internalFlag: false, // 这个字段不需要同步到 URL
});

useRouteQuery(
  {
    q: toRef(searchParams, "keyword"),
    internal: toRef(searchParams, "internalFlag"),
  },
  {
    excludeKeys: ["internal"], // 排除 internal 字段
  }
);
```

### 手动控制同步时机 ###

```typescript
const { updateRouteQuery } = useRouteQuery(
  {
    status: toRef(searchParams, "status"),
  },
  {
    immediate: false, // 禁用自动同步
  }
);

// 在需要的时候手动同步
function handleSubmit() {
  updateRouteQuery();
}
```

### 保留空值参数 ###

```typescript
useRouteQuery(
  {
    q: toRef(searchParams, "keyword"),
  },
  {
    emptyValueHandle: "keep", // 空值时保留参数为空字符串
  }
);
```

### 自定义重置值 ###

```typescript
const { resetParams } = useRouteQuery({
  keyword: toRef(searchParams, "keyword"),
  page: toRef(searchParams, "page"),
});

// 重置为默认值
resetParams();

// 重置为指定值
resetParams({
  keyword: "default search",
  page: 1,
});
```

## 类型支持 ##

该包提供完整的 TypeScript 类型支持：

```typescript
import type {
  QueryValue,
  QueryParams,
  UseRouteQueryOptions,
  UseRouteQueryReturn,
} from "vue-route-query-hook";
```

### 类型定义 ###

```typescript
type QueryValue = string | number | boolean | undefined | null;
type QueryParams = Record<string, Ref<QueryValue>>;
```

## 注意事项 ##

- 类型转换: Hook 会根据原始值的类型自动转换路由参数

  - `number`: 转换为数字，无效时保持原值
  - `boolean`: `'true'` 转换为 `true`，其他为 `false`
  - `string`: 直接返回字符串值

- 历史记录: 使用 `router.replace` 更新路由，不会产生浏览器历史记录

- 深度监听: 自动开启深度监听，支持嵌套对象的变化检测

## 兼容性 ##

- Vue 3.0+
- Vue Router 4.0+
