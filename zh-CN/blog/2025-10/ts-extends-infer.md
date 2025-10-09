---
lastUpdated: true
commentabled: true
recommended: true
title: 解锁 TypeScript 的元编程魔法
description: 从 `extends` 到 `infer` 的条件类型之旅
date: 2025-10-09 11:05:00 
pageClass: blog-page-class
cover: /covers/typescript.svg
---

## 一、类型的三元表达式 ##

条件类型的语法看起来就像 JavaScript 的三元运算符：

```typescript
SomeType extends OtherType ? TrueType : FalseType;
```

**解析**：

- `SomeType extends OtherType`：这是我们的“条件判断”。这里的 `extends` 关键字不是类的继承，而是泛型里面的条件限定判断
- `? TrueType`：如果条件为真，那么最终的类型就是 `TrueType`。
- `: FalseType`：如果条件为假，那么最终的类型就是 `FalseType`。

**示例**：

```typescript
// IsNumber<T> 会检查类型 T 是否是 number
type IsNumber<T> = T extends number ? "yes, it's a number" : 'no, not a number';

type Result1 = IsNumber<100>; // "yes, it's a number"
type Result2 = IsNumber<'hello'>; // "no, not a number"

let t: Result1 = "yes, it's a number"; // 只能是这个值
let b: Result2 = 'no, not a number';// 只能是这个值
t = '2323' // Error: 不能将类型“"2323"”分配给类型“"yes, it's a number"”。ts(
```

## 二、魔法关键字 infer ##

`infer` 允许我们在 `extends` 子句中*声明一个待推断的类型变量*。如果类型匹配成功，这个变量就会“捕获”对应位置的类型，然后我们可以在条件为真的分支中使用它。

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer P ? P : T;
interface User {
    name: string;
    age: number;
}
type Func = (name:string) => User;
type pType = ReturnType<Func>; // pType = User
type tType = ReturnType<string>; // tType = string
```

**解析**:

- `T` 限定判断为一个函数 `(...args: any[])=> infer P`，并且函数的返回类型为P
- 限定为真时，`ReturnType` 为 `P`
- 限定为假时，`ReturnType` 为 `T`

## 三、分布式条件类型 ##

当一个条件类型作用于一个**裸**的泛型参数，且该参数的实际类型是联合类型时，它会被**分发**到联合类型的每一个成员上进行独立计算，最后将结果联合起来。

```typescript
type ToArray<T> = T extends string | number ? T[] : T;

type T1 = ToArray<string | number>; // 结果是 string[] | number[]
type T3 = ToArray<boolean>; // 结果是 boolean

type ToArray2<T> = T extends any ? T[] : never;
type T4 = ToArray2<string | number>; // 结果是 string[] | number[]
```

**解析**：

- `string | number` 或者 `any` 都能包含 `T1` 和 `T4` 的联合类型
- `T1` 和 `T4` 符合限定，所以返回 `T[]` 类型，结果就是分别对联合类型的各个类型进行了数组化处理

**例如，我们自己实现一个 Exclude**：

```typescript
type MyExclude<T, U> = T extends U ? never : T;

// 'a' | 'b' | 'c' 排除 'a' | 'd'
type Result = MyExclude<'a' | 'b' | 'c', 'a' | 'd'>; // 结果：'b' | 'c'
```

**解析**：

- `('a' extends 'a' | 'd' ? never : 'a')` => `never`
- `('b' extends 'a' | 'd' ? never : 'b')` => `'b'`
- `('c' extends 'a' | 'd' ? never : 'c')` => `'c'`
- 最终联合结果：`never | 'b' | 'c'`，即 `'b' | 'c'`。

**如何阻止分发？**

如果你不希望发生分发，可以用方括号 `[]` 将泛型参数包裹起来，`[T]` 就不再是*裸*的泛型参数，不是*裸*后就不会分发，而是作为一个整理进行处理：

```typescript
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;

type T2 = ToArrayNonDist<string | number>; // 结果是 (string | number)[]
```
