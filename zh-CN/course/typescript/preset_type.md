---
lastUpdated: true
commentabled: false
recommended: false
sidebar: true
tags: ["TypeScript"]
title: TypeScript内置类型
description: TypeScript内置类型
poster: /images/cmono-Siesta.png
date: 2023-08-28
---

# {{ $frontmatter.title}} #

`TypeScript`具有类型系统，且是`JavaScript`的超集，其可以编译成普通的`JavaScript`代码，也就是说，其是带有类型检查的`JavaScript`。

## 内置类型 ##

`TypeScript`提供了几种实用程序类型来促进常见的类型转换，这些类型在全局范围内可用。

### Partial ###

`Partial<Type>`构造一个类型使`Type`的所有属性都设置为可选。

```typescript

/**
 * Make all properties in T optional
 */

type Partial<T> = {
    [P in keyof T]?: T[P];
};

```

```typescript

interface Example {
    a: string;
    b: number;
}

type PartialExample = Partial<Example>;

/**
 * PartialExample
 * interface {
 *     a?: string | undefined;
 *     b?: number | undefined;
 * }
 */

```

### Required ###

`Required<Type>`构造一个类型使`Type`的所有属性都设置为`required`，与`Partial<Type>`功能相反。

```typescript

/**
 * Make all properties in T required
 */

type Required<T> = {
    [P in keyof T]-?: T[P];
};

interface Example {
    a?: string;
    b?: number;
}

type RequiredExample = Required<Example>;

/**
 * RequiredExample
 * interface {
 *     a: string;
 *     b: number;
 * }
 */

```

### Readonly ###

`Required<Type>`构造一个类型使`Type`的所有属性都设置为`readonly`，这意味着构造类型的属性都是只读的，不能被修改，这对使用`Object.freeze()`方法的对象非常有用。

```typescript

/**
 * Make all properties in T readonly
 */

type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

interface Example {
    a: string;
    b: number;
}

type ReadonlyExample = Readonly<Example>;

/**
 * ReadonlyExample
 * interface {
 *     readonly a: string;
 *     readonly b: number;
 * }
 */

```

### Record ###

`Record<Keys, Type>`构造一个对象类型，其属性键为`Keys`，其属性值为`Type`，通常可以使用`Record`来表示一个对象。

```typescript

/**
 * Construct a type with a set of properties K of type T
 */

type Record<K extends keyof any, T> = {
    [P in K]: T;
};

type RecordType = Record<string, string|number>;

const recordExample: RecordType ={
  a: 1,
  b: "1"
}

```

### Pick ###

`Pick<Type, Keys>`通过从`Type`中选择一组属性`Keys`来构造一个类型。

```typescript

/**
 * From T, pick a set of properties whose keys are in the union K
 */

type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};

interface Example {
    a: string;
    b: number;
    c: symbol;
}

type PickExample = Pick<Example, "a"|"b">;

/**
 * PickExample
 * interface {
 *     a: string;
 *     b: number;
 * }
 */

```

### Omit ###

`Omit<Type, Keys>`通过从Type中选择所有属性然后删除`Keys`来构造一个类型，与`Pick<Type, Keys>`功能相反。

```typescript

/**
 * Construct a type with the properties of T except for those in type K.
 */

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

interface Example {
    a: string;
    b: number;
    c: symbol;
}

type OmitExample = Omit<Example, "a"|"b">;

/**
 * OmitExample
 * interface {
 *     c: symbol;
 * }
 */

```

### Exclude ###

`Exclude<UnionType, ExcludedMembers>`通过从`UnionType`中排除可分配给`ExcludedMembers`的所有联合成员来构造类型。

```typescript

/**
 * Exclude from T those types that are assignable to U
 */

type Exclude<T, U> = T extends U ? never : T;

type ExcludeExample = Exclude<"a"|"b"|"c"|"z", "a"|"b"|"d">;

/**
 * ExcludeExample
 * "c" | "z"
 */

```

### Extract ###

`Extract<Type, Union>`通过从`Type`中提取所有可分配给`Union`的联合成员来构造一个类型，与`Exclude<UnionType, ExcludedMembers>`功能相反。

```typescript
/**
 * Extract from T those types that are assignable to U
 */

type Extract<T, U> = T extends U ? T : never;

type ExtractExample = Extract<"a"|"b"|"c"|"z", "a"|"b"|"d">;

/**
 * ExtractExample
 * "a" | "b"
 */

```

### NonNullable ###

`NonNullable<Type>`通过从`Type`中排除`null`和`undefined`来构造一个类型。

```typescript

/**
 * Exclude null and undefined from T
 */

type NonNullable<T> = T extends null | undefined ? never : T;

type NonNullableExample = NonNullable<number|string|null|undefined>;

/**
 * NonNullableExample
 * string | number
 */

```

### Parameters ###

`Parameters<Type>`从函数类型`Type`的参数中使用的类型构造元组类型。

```typescript

/**
 * Obtain the parameters of a function type in a tuple
 */

type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

type FnType = (a1: number, a2: string) => void;

type ParametersExample = Parameters<FnType>;

/**
 * ParametersExample
 * [a1: number, a2: string]
 */

```

### ConstructorParameters ###

`ConstructorParameters<Type>`从构造函数类型的类型构造元组或数组类型，其产生一个包含所有参数类型的元组类型。

```typescript

/**
 * Obtain the parameters of a constructor function type in a tuple
 */

type ConstructorParameters<T extends abstract new (...args: any) => any> = T extends abstract new (...args: infer P) => any ? P : never;

interface Example{
  fn(a: string): string;
}

interface ExampleConstructor{
    new(a: string, b: number): Example;
}

declare const Example: ExampleConstructor;

type ConstructorParametersExample = ConstructorParameters<ExampleConstructor>;

/**
 * ConstructorParametersExample
 * [a: string, b: number]
 */

```

### ReturnType ###

`ReturnType<Type>`构造一个由函数`Type`的返回类型组成的类型。

```typescript

/**
 * Obtain the return type of a function type
 */

type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

type FnType = (a1: number, a2: string) => string | number;

type ReturnTypeExample = ReturnType<FnType>;

/**
 * ReturnTypeExample
 * string | number
 */

```

### InstanceType ###

`InstanceType<Type>`构造一个由`Type`中构造函数的实例类型组成的类型。

```typescript

/**
 * Obtain the return type of a constructor function type
 */

type InstanceType<T extends abstract new (...args: any) => any> = T extends abstract new (...args: any) => infer R ? R : any;

interface Example{
  fn(a: string): string;
}

interface ExampleConstructor{
    new(a: string, b: number): Example;
}

declare const Example: ExampleConstructor;

type InstanceTypeExample = InstanceType<ExampleConstructor>;

// const a: InstanceTypeExample = new Example("a", 1); // new ExampleConstructor => Example

/**
 * InstanceTypeExample
 * Example
 */

```

### ThisParameterType ###

`ThisParameterType<Type>`提取函数类型的`this`参数的类型，如果函数类型没有`this`参数，则为`unknown`。

```typescript
/**
 * Extracts the type of the 'this' parameter of a function type, or 'unknown' if the function type has no 'this' parameter.
 */

type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any ? U : unknown;

function toHex(this: Number) {
  return this.toString(16);
}

type ThisParameterTypeExample = ThisParameterType<typeof toHex>;

console.log(toHex.apply(27)); // 1b

/**
 * ThisParameterTypeExample
 * Number
 */

```

### OmitThisParameter ###

`OmitThisParameter<Type>`从`Type`中移除`this`参数，如果`Type`没有显式声明此参数，则结果只是`Type`，否则，从`Type`创建一个不带此参数的新函数类型。泛型被删除，只有最后一个重载签名被传播到新的函数类型中。

```typescript

/**
 * Removes the 'this' parameter from a function type.
 */

type OmitThisParameter<T> = unknown extends ThisParameterType<T> ? T : T extends (...args: infer A) => infer R ? (...args: A) => R : T;

function toHex(this: Number) {
  return this.toString(16);
}

type OmitThisParameterExample = OmitThisParameter<typeof toHex>;

const toHex27: OmitThisParameterExample = toHex.bind(27);
console.log(toHex27()); // 1b

/**
 * OmitThisParameterExample
 * () => string
 */

```

### ThisType ###

`ThisType<Type>`可以在对象字面量中键入`this`，并提供通过上下文类型控制`this`类型的便捷方式，其只有在`--noImplicitThis`的选项下才有效。

```typescript

/**
 * Marker for contextual 'this' type
 */
interface ThisType<T> { }

// const foo1 = {
//     bar() {
//          console.log(this.a); // error
//     }
// }

const foo2: { bar: () => void } & ThisType<{ a: number }> = {
    bar() {
         console.log(this.a); // ok
    }
}

```

### Uppercase ###

`Uppercase<StringType>`将`StringType`转为大写，`TS`以内置关键字`intrinsic`来通过编译期来实现。

```typescript

/**
 * Convert string literal type to uppercase
 */

type Uppercase<S extends string> = intrinsic;

type UppercaseExample = Uppercase<"abc">;

/**
 * UppercaseExample
 * ABC
 */

```

### Lowercase ###

`Lowercase<StringType>`将`StringType`转为小写。

```typescript

/**
 * Convert string literal type to lowercase
 */

type Lowercase<S extends string> = intrinsic;

type LowercaseExample = Lowercase<"ABC">;

/**
 * LowercaseExample
 * abc
 */

```

### Capitalize ###

`Capitalize<StringType>`将`StringType`首字母转为大写。

```typescript

/**
 * Convert first character of string literal type to uppercase
 */

type Capitalize<S extends string> = intrinsic;

type CapitalizeExample = Capitalize<"abc">;

/**
 * CapitalizeExample
 * Abc
 */

```

### Uncapitalize ###

`Uncapitalize<StringType>`将`StringType`首字母转为小写。

```typescript

/**
 * Convert first character of string literal type to lowercase
 */

type Uncapitalize<S extends string> = intrinsic;

type UncapitalizeExample = Uncapitalize<"ABC">;

/**
 * CapitalizeExample
 * aBC
 */

```
