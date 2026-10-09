---
lastUpdated: true
commentabled: true
recommended: true
title: 🚀 TypeScript 中的 10 个隐藏技巧，让你的代码更优雅！
description: 🚀 TypeScript 中的 10 个隐藏技巧，让你的代码更优雅！
date: 2025-09-09 10:00:00 
pageClass: blog-page-class
cover: /covers/typescript.svg
---

> 这些技巧你可能从未见过，但它们能让你的 TypeScript 代码更加优雅、类型安全且易于维护！

## 📖 前言 ##

TypeScript 作为 JavaScript 的超集，已经成为了现代前端开发的标配。但是，除了基础的接口定义和类型注解，TypeScript 还有很多强大的特性被开发者们忽视了。本文将带你探索 10 个实用但鲜为人知的 TypeScript 技巧，让你的代码更上一层楼！

## 🎯 技巧 1：条件类型与 infer 的魔法组合 ##

### 基础用法 ###

```typescript
type ElementType<T> = T extends (infer U)[] ? U : never;
type StringArray = string[];
type StringElement = ElementType<StringArray>; // string
```

### 高级应用：提取函数参数类型 ###

```typescript
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// 使用示例
function greet(name: string, age: number): string {
  return `Hello ${name}, you are ${age} years old`;
}

type GreetParams = Parameters<typeof greet>; // [string, number]
```

**为什么这个技巧很酷？** 它让你能够从任何函数中提取参数类型，这在构建类型安全的 API 包装器时非常有用！

## 🎯 技巧 2：模板字面量类型的威力 ##

### 基础用法 ###

```ts
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ApiEndpoint = `/api/${string}`;
type FullUrl = `${HttpMethod} ${ApiEndpoint}`;

// 使用示例
const validUrl: FullUrl = 'GET /api/users'; // ✅ 有效
const invalidUrl: FullUrl = 'PATCH /api/users'; // ❌ 错误：PATCH 不在 HttpMethod 中
```

### 高级应用：构建类型安全的 API 路由 ###

```ts
type RouteParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? Param | RouteParams<`/${Rest}`>
  : T extends `${string}:${infer Param}`
  ? Param
  : never;

type UserRoute = '/users/:id/posts/:postId';
type UserRouteParams = RouteParams<UserRoute>; // 'id' | 'postId'
```

**实际应用场景**： 在构建路由系统时，你可以自动推断出路由参数的类型，确保类型安全！

## 🎯 技巧 3：映射类型的进阶用法 ##

### 基础映射类型 ###

```ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};
```

### 高级应用：条件映射类型 ###

```ts
type ConditionalPick<T, K extends keyof T> = {
  [P in K]: T[P] extends string ? T[P] : never;
};

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

type StringFields = ConditionalPick<User, keyof User>; // { name: string; email: string }
```

**为什么这个技巧很重要？** 它让你能够根据值的类型来动态选择属性，这在处理复杂的数据结构时非常有用！

## 🎯 技巧 4：递归类型的巧妙应用 ##

### 基础递归类型 ###

```ts
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

### 高级应用：JSON 路径类型 ###

```ts
type Paths<T> = T extends string | number | boolean
  ? []
  : T extends Array<infer U>
  ? [number, ...Paths<U>]
  : T extends object
  ? {
      [K in keyof T]: [K, ...Paths<T[K]>];
    }[keyof T]
  : [];

interface User {
  profile: {
    name: string;
    address: {
      city: string;
      country: string;
    };
  };
  posts: string[];
}

type UserPaths = Paths<User>;
// 结果：['profile', 'name'] | ['profile', 'address', 'city'] | ['profile', 'address', 'country'] | ['posts', number]
```

**实际应用**： 这个技巧可以用于构建类型安全的对象路径访问器，比如在状态管理库中！

## 🎯 技巧 5：条件类型的高级模式 ##

### 分布式条件类型 ###

```ts
type NonNullable<T> = T extends null | undefined ? never : T;

// 这个类型会自动分发到联合类型的每个成员
type T0 = NonNullable<string | number | null>; // string | number
type T1 = NonNullable<string[] | null | undefined>; // string[]
```

### 高级应用：类型守卫 ###

```ts
type IsArray<T> = T extends Array<any> ? true : false;
type IsString<T> = T extends string ? true : false;

type TypeCheck<T> = {
  isArray: IsArray<T>;
  isString: IsString<T>;
};

type CheckResult = TypeCheck<string[]>; // { isArray: true; isString: false }
```

## 🎯 技巧 6：模板字面量类型的模式匹配 ##

### 基础模式匹配 ###

```ts
type ExtractRoute<T> = T extends `${infer Method} ${infer Route}` ? Route : never;

type Route = ExtractRoute<'GET /api/users'>; // '/api/users'
```

### 高级应用：URL 参数提取 ###

```ts
type ExtractUrlParams<T> = T extends `${string}?${infer Params}`
  ? Params extends `${infer Param}=${infer Value}&${infer Rest}`
    ? { [K in Param]: string } & ExtractUrlParams<`?${Rest}`>
    : Params extends `${infer Param}=${infer Value}`
    ? { [K in Param]: string }
    : {}
  : {};

type UserApiParams = ExtractUrlParams<'/api/users?page=1&limit=10&search=john'>;
// 结果：{ page: string; limit: string; search: string }
```

## 🎯 技巧 7：条件类型与 never 的巧妙结合 ##

### 基础用法 ###

```ts
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
```

### 高级应用：类型过滤 ###

```ts
type FilterProperties<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

interface Config {
  apiUrl: string;
  timeout: number;
  retries: number;
  debug: boolean;
}

type StringProperties = FilterProperties<Config, string>; // 'apiUrl'
type NumberProperties = FilterProperties<Config, number>; // 'timeout' | 'retries'
```

## 🎯 技巧 8：条件类型与 infer 的高级模式 ##

### 提取 Promise 类型 ###

```ts
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type AsyncResult = Promise<string>;
type SyncResult = UnwrapPromise<AsyncResult>; // string
```

### 提取数组元素类型 ###

```typescript
type UnwrapArray<T> = T extends (infer U)[] ? U : T;

type StringArray = string[];
type StringElement = UnwrapArray<StringArray>; // string
```

### 高级应用：递归解包 ###

```ts
type DeepUnwrap<T> = T extends Promise<infer U>
  ? DeepUnwrap<U>
  : T extends (infer U)[]
  ? DeepUnwrap<U>[]
  : T;

type DeepAsyncResult = Promise<Promise<string[]>>;
type DeepSyncResult = DeepUnwrap<DeepAsyncResult>; // string[]
```

## 🎯 技巧 9：条件类型与条件类型的组合 ##

### 类型转换器 ###

```ts
type Transform<T> = T extends string
  ? number
  : T extends number
  ? string
  : T extends boolean
  ? string
  : T;

type StringToNumber = Transform<string>; // number
type NumberToString = Transform<number>; // string
type BooleanToString = Transform<boolean>; // string
```

### 高级应用：类型映射器 ###

```ts
type TypeMapper<T> = {
  string: string;
  number: number;
  boolean: boolean;
  object: Record<string, any>;
  array: any[];
}[T extends keyof {
  string: string;
  number: number;
  boolean: boolean;
  object: Record<string, any>;
  array: any[];
}
  ? T
  : never];

type MappedString = TypeMapper<'string'>; // string
type MappedNumber = TypeMapper<'number'>; // number
```

## 🎯 技巧 10：条件类型与联合类型的终极组合 ##

### 类型分发控制 ###

```ts
// 使用 [] 来防止类型分发
type NoDistribute<T> = [T] extends [any] ? T : never;

type Distributed = string | number extends string ? true : false; // false
type NotDistributed = NoDistribute<string | number> extends string ? true : false; // true
```

### 高级应用：类型谓词 ###

```ts
type IsNever<T> = [T] extends [never] ? true : false;
type IsAny<T> = 0 extends (1 & T) ? true : false;
type IsUnknown<T> = unknown extends T ? true : false;

type Test1 = IsNever<never>; // true
type Test2 = IsAny<any>; // true
type Test3 = IsUnknown<unknown>; // true
```

## 🎯 实际项目中的应用示例 ##

### 构建类型安全的 API 客户端 ###

```ts
interface ApiEndpoints {
  '/users': {
    GET: { response: User[]; params: { page?: number; limit?: number } };
    POST: { response: User; body: CreateUserRequest };
  };
  '/users/:id': {
    GET: { response: User; params: { id: string } };
    PUT: { response: User; params: { id: string }; body: UpdateUserRequest };
    DELETE: { response: void; params: { id: string } };
  };
}

type ApiRequest<T extends keyof ApiEndpoints, M extends keyof ApiEndpoints[T]> = {
  url: T;
  method: M;
  params?: ApiEndpoints[T][M]['params'];
  body?: ApiEndpoints[T][M]['body'];
};

type ApiResponse<T extends keyof ApiEndpoints, M extends keyof ApiEndpoints[T]> = 
  ApiEndpoints[T][M]['response'];

// 使用示例
const request: ApiRequest<'/users', 'GET'> = {
  url: '/users',
  method: 'GET',
  params: { page: 1, limit: 10 }
};

const response: ApiResponse<'/users', 'GET'> = []; // User[]
```

## 🎯 总结 ##

这些 TypeScript 技巧虽然看起来复杂，但它们能够：

- **提高代码的类型安全性** - 让编译器帮你捕获更多错误
- **改善开发体验** - 提供更好的 IntelliSense 和自动补全
- **减少运行时错误** - 在编译时发现潜在问题
- **提高代码可维护性** - 类型即文档，让代码更易理解

## 🚀 下一步 ##

掌握了这些技巧后，你可以：

- 构建更强大的类型系统
- 创建类型安全的工具库
- 改善现有项目的类型定义
- 在团队中分享这些知识

记住，TypeScript 的类型系统是一个强大的工具，掌握这些高级技巧能够让你写出更加优雅和健壮的代码！

> 💡 小贴士：这些技巧可能需要一些时间来掌握，建议在实际项目中逐步应用，这样能够更好地理解它们的价值。

