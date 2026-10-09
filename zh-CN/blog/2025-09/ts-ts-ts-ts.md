---
lastUpdated: true
commentabled: true
recommended: true
title: 每个开发人员都应该知道的 20 个 TypeScript 技巧
description: 每个开发人员都应该知道的 20 个 TypeScript 技巧
date: 2025-09-18 09:00:00 
pageClass: blog-page-class
cover: /covers/typescript.svg
---

TypeScript 是现代 JavaScript 开发的得力助手，它引入了许多类型安全和高级功能。虽然许多开发者只掌握了基础用法，但其实 TypeScript 还隐藏了许多精华和实用技巧，它们能让你的代码更加高效、整洁且易于维护。下面，我们就通过示例和实用方法来深入了解每个开发者都应该掌握的 20 个 TypeScript 技巧。

## 非可空类型（NonNullable） ##

TypeScript 提供了NonNullable,排除null和undefined，它断言明确表示一个类型 不允许 为 null 或 undefined。这可以帮助您避免意外的空值。

```ts
type User = { name: string; age?: number | null };
const user: NonNullable<User["age"]> = 30; // ✅ 不允许 null或者 undefined 
```

## 灵活使用Partial ##

该Partial实用程序使类型中的所有属性都成为可选的，这在您仅更新对象字段的子集时非常有用。

```ts
interface User {
  name: string;
  age: number;
  email: string;
}

const updateUser = (user: Partial<User>) => {
  // 你可以在这里任意添加你想要的字段
  return { ...user, updatedAt: new Date() };
};

updateUser({ name: 'John' }); // 不需要全部字段
```

## 利用只读类型 (Readonly) ##

当您需要 TypeScript 中的不变性时，Readonly 使类型的所有属性都不可变，从而防止重新分配。

```ts
const config: Readonly<{ apiUrl: string; retries: number }> = {
  apiUrl: 'https://api.example.com',
  retries: 5
};

config.apiUrl = 'https://newapi.com'; // ❌ 会提示错误，因为apiUrl定义了不可变
```

## 类型的映射类型 (Mapped Types) 动态属性 ##

映射类型可让您通过转换现有类型来创建新类型。这对于创建对象类型的变体非常方便。

```ts
type Status = 'loading' | 'success' | 'error';
type ApiResponse<T> = {
  [K in Status]: T;
};

const response: ApiResponse<string> = {
  loading: 'Fetching...',
  success: 'Data loaded',
  error: 'Something went wrong'
};
```

## 具有可选元素的元组类型 ##

你知道 TypeScript 允许在元组中有可选元素吗？这在处理可变函数参数时非常有用

```ts
type UserTuple = [string, number?, boolean?];

const user1: UserTuple = ['Alice'];          // ✅ Just the name
const user2: UserTuple = ['Bob', 30];        // ✅ Name and age
const user3: UserTuple = ['Charlie', 25, true]; // ✅ Full tuple
```

## 具有详尽检查的联合类型 ##

确保使用联合类型处理所有可能的情况并在 switch 语句中进行详尽检查

```ts
type Status = 'open' | 'closed' | 'pending';

function handleStatus(status: Status) {
  switch (status) {
    case 'open':
      return 'Opened';
    case 'closed':
      return 'Closed';
    case 'pending':
      return 'Pending';
    default:
      const exhaustiveCheck: never = status; // ❌ Error if a new status type is added but not handled
      return exhaustiveCheck;
  }
}
```

## Omit：排除属性 ##

从一个类型中移除指定属性:有时您需要创建一个排除某些键的对象类型。

```ts
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = Omit<Todo, 'description'>;

const todo: TodoPreview = {
  title: 'Learn TypeScript',
  completed: false
};
```

## 使用inandinstanceof缩窄类型 ##

根据运行时条件缩小类型的范围。

```ts
function processInput(input: string | number | { title: string }) {
  if (typeof input === 'string') {
    return input.toUpperCase(); // Narrowed to string
  } else if (typeof input === 'number') {
    return input * 2; // Narrowed to number
  } else if ('title' in input) {
    return input.title; // Narrowed to object with title property
  }
}
```

## 高级类型逻辑 的条件类型 ##

条件类型为您提供了根据条件转换类型的极大灵活性。

```ts
type IsString<T> = T extends string ? true : false;

type CheckString = IsString<'Hello'>; // true
type CheckNumber = IsString<42>; // false
```

## 用于as const不可变字面量类型 ##

`as const` 非常适合冻结值并确保 TypeScript 将它们视为文字类型，而不是可变值

```ts
const COLORS = ['red', 'green', 'blue'] as const;

type Color = typeof COLORS[number]; // 'red' | 'green' | 'blue'
```

## Extract 和 Exclude：提取和排除类型🧹 ##

使用Extract和Exclude从联合中过滤出或挑选特定类型。

```ts
type T = 'a' | 'b' | 'c';
type OnlyAOrB = Extract<T, 'a' | 'b'>; // 'a' | 'b'
type ExcludeC = Exclude<T, 'c'>; // 'a' | 'b'
```

## 用于自定义验证的类型保护 ##

创建自己的类型保护以在运行时动态地优化类型。

```ts
function isString(input: any): input is string {
  return typeof input === 'string';
}

const value: any = 'Hello';

if (isString(value)) {
  console.log(value.toUpperCase()); // Safe: value is a string here
}
```

## 用于Record动态对象类型 ##

当你需要具有动态键的对象类型时，`Record<K, V>` 它是完美的选择。

```ts
type Role = 'admin' | 'user' | 'guest';
const permissions: Record<Role, string[]> = {
  admin: ['read', 'write', 'delete'],
  user: ['read', 'write'],
  guest: ['read']
};
```

## 具有索引签名的动态类属性 ##

```ts
class DynamicObject {
  [key: string]: any;
}

const obj = new DynamicObject();
obj.name = 'Alice';
obj.age = 30;
```

## never为不可能的状态输入 ##

该never类型表示绝不应该出现的值。它通常用于穷尽检查。

```ts
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}
```

## 可选链式调用，实现安全属性访问 ##

使用可选链接 `（?.）` 可以安全地访问深层嵌套的属性，而不必担心undefined错误

```ts
const user = { profile: { name: 'John' } };
const userName = user?.profile?.name; // 'John'
const age = user?.profile?.age ?? 'Not provided'; // Fallback to default
```

## 具有空值合并的默认值（??） ##

当左侧操作数为 `null` 或 `undefined` 时，返回右侧操作数；否则返回左侧操作数本身。

```ts
const input: string | null = null;
const defaultValue = input ?? 'Default'; // 'Default'
```

## 使用ReturnType推断返回类型 ##

```ts
function getUser() {
  return { name: 'John', age: 30 };
}

type UserReturn = ReturnType<typeof getUser>; // { name: string; age: number; }
```

## 函数 中的类型参数 ##

泛型类型参数使您的函数灵活且可在不同类型之间重用。

```ts
function identity<T>(value: T): T {
  return value;
}

identity<string>('Hello'); // 'Hello'
identity<number>(42); // 42
```

## 结合结构的交叉类型 ##

交叉类型让您可以将多种类型组合为一种。

```ts
type Admin = { privileges: string[] };
type User = { name: string };

type AdminUser = Admin & User;

const adminUser: AdminUser = {
  privileges: ['admin', 'editor'],
  name: 'Alice'
};
```

## 总结 ##

这些技巧能帮助你写出更安全、更健壮、更易维护的 TypeScript 代码。通过灵活运用这些技巧，你可以更好地利用 TypeScript 的类型系统，提高开发效率。
