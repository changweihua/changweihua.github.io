---
lastUpdated: true
commentabled: true
recommended: true
title: TypeScript中interface与type的终极对比指南
description: TypeScript中interface与type的终极对比指南
date: 2025-03-18 14:00:00
pageClass: blog-page-class
---

# TypeScript中interface与type的终极对比指南 #


在 TypeScript 中，`interface` 和 `type` 都用于定义类型，但它们在设计目的、语法和功能上有明显差异。以下是它们的核心区别：

## ​基本概念 ##

### interface ###

专门用于定义**​对象类型**的形状（Object Shape），强调结构描述，适合描述类、对象、函数等结构。

```typescript
interface User {
  name: string;
  age: number;
}
```
### type ###

类型别名，可为任何类型（包括原始类型、联合类型、元组等）命名，用途更广泛。

```typescript
type ID = string | number; // 联合类型
type Point = [number, number]; // 元组
type Callback = () => void; // 函数类型
```

## ​声明合并（Declaration Merging）​ ##

### interface ###

支持同名声明自动合并，适合扩展第三方类型或逐步定义类型。

```typescript
interface User { name: string; }
interface User { age: number; }
// 合并为 { name: string; age: number; }
``

### type ###

同名重复声明会报错，无法合并。

```typescript
type User = { name: string }; // ❌ Error: Duplicate identifier
type User = { age: number };
```

## ​继承与扩展 ##

### interface ###

使用 extends 继承其他接口，语法更直观。

```typescript
interface Animal { name: string; }
interface Dog extends Animal { bark(): void; }
```

### type ###

使用交叉类型 & 实现类似继承的效果，更灵活。

```typescript
type Animal = { name: string };
type Dog = Animal & { bark(): void };
```

## ​适用场景 ##

### interface 专长 ###

- 定义对象结构（如类、函数、对象）。
- 需要声明合并（如扩展第三方类型）。
- 类实现接口（implements）。

### type 专长 ###

- 定义联合类型、元组、映射类型等复杂类型。
- 使用条件类型（extends ? :）、模板字面量类型等高级特性。
- 为其他类型提供别名（包括原始类型）。

```typescript
type Status = "success" | "error"; // 字面量联合类型
type Keys = keyof User; // 映射类型
```

## ​其他区别 ##

| 特性 | `interface` | `type` |
| :---: | :----: | :---: |
| ​函数类型定义 | 支持对象语法和函数重载 | 只能直接定义函数签名 |
| ​动态属性 | 无法直接使用动态计算属性 | 可使用映射类型（in）动态生成属性 |
| ​类实现 | 支持 implements | 若为对象类型，也能被类实现 |
| ​扩展性 | 更适合通过声明合并逐步扩展 | 扩展需重新定义或使用交叉类型 |


## 映射类型（Mapped Types） ##

在 TypeScript 中，​映射类型（Mapped Types）​ 是一种基于现有类型动态生成新类型的高级特性。它可以通过 in 关键字遍历一个联合类型的键集合，并为每个键生成新的属性类型。这是 type 独有的能力，interface 无法直接实现类似操作。

### 核心概念：用 `in` 动态生成属性 ###

映射类型的基本语法为：


```typescript
type NewType = {
  [Key in Keys]: ValueType;
};
```

- ​**Key**：遍历的键（变量名，可以是任意标识符，如 K）。
- ​**Keys**：一个联合类型（例如 "name" | "age"），表示要遍历的键集合。
- ​**ValueType**：每个键对应的值的类型（可以是固定类型，或基于原类型的动态类型）。

### 具体示例 ###

#### 基本动态属性生成 ####

假设有一个联合类型 Keys，基于它生成一个对象类型，每个属性的值类型为 string：

```typescript
type Keys = "name" | "age" | "email";

type DynamicObject = {
  [K in Keys]: string; // 遍历 Keys 中的每个键，值为 string
};

// 等价于：
type DynamicObject = {
  name: string;
  age: string;
  email: string;
};
```

#### 基于现有类型转换 ####

映射类型常与 keyof 结合，动态操作现有类型的所有属性：

```typescript
interface User {
  name: string;
  age: number;
  email: string;
}

// 将 User 的所有属性转换为可选属性
type OptionalUser = {
  [K in keyof User]?: User[K]; 
};

// 等价于：
type OptionalUser = {
  name?: string;
  age?: number;
  email?: string;
};
```

#### 更复杂的类型操作 ####

可以结合条件类型、模板字面量等特性，实现更动态的转换：

```typescript
// 将 User 的所有属性名改为 `getXxx` 格式，且值为函数
type Getters = {
  [K in keyof User as `get${Capitalize<K>}`]: () => User[K];
};

// 等价于：
type Getters = {
  getName: () => string;
  getAge: () => number;
  getEmail: () => string;
};
```

### 为什么 interface 无法实现？ ###

interface 的设计初衷是**声明对象的结构**，而不是动态生成类型。它无法直接遍历联合类型或使用 in 动态生成属性。例如：

```typescript
// ❌ 错误：interface 不支持映射类型语法
interface DynamicInterface {
  [K in "name" | "age"]: string;
}
```

## 实际应用场景 ##

### ​属性修饰符操作 ###

快速生成 Readonly、Partial、Required 等工具类型：

```typescript
type ReadonlyUser = Readonly<User>; // 所有属性变为只读
type PartialUser = Partial<User>;    // 所有属性变为可选
```

### ​类型裁剪或转换 ###

修改属性名或值的类型：

```typescript
// 将 User 的所有属性值改为 boolean
type BooleanUser = {
  [K in keyof User]: boolean;
};
```

### ​筛选特定属性 ###

结合条件类型过滤属性：

```typescript
// 只保留 User 中的字符串类型属性
type StringProps = {
  [K in keyof User as User[K] extends string ? K : never]: User[K];
};
// 等价于 { name: string; email: string }
```

### 小结 ###

- ​**type + 映射类型**：通过 `in` 动态遍历联合类型的键集合，生成新的属性，适合复杂类型操作。
- ​**interface**：静态定义对象结构，无法动态生成属性。

当需要基于现有类型动态生成或修改属性时，映射类型是 `type` 的杀手级特性，而 `interface` 无法替代这一能力。

#### ​错误提示 ####

- ​**interface**: 错误提示更清晰，直接指出缺少或多余的属性。
- ​**type**: 复杂类型（如联合类型）的错误提示可能较冗长。

#### ​如何选择 ####

- 默认使用 interface：定义对象结构、需要声明合并时。
- 使用 type：需要联合类型、元组、高级类型操作时。

两者在多数场景下可以互换，但理解差异能帮助写出更清晰的类型代码。

## ​总结 ##


| ​对比维度 | ​**interface** | ​**type** |
| :---: | :----: | :---: |
| ​基本用途 | 定义对象类型（类、函数、对象的结构） | 为任何类型命名（包括原始类型、联合类型、元组、函数等） |
| ​声明合并 | ✅ 支持同名合并（多次声明自动合并） | ❌ 禁止同名重复声明 |
| ​继承语法 | extends 关键字（直观继承接口） | 交叉类型 &（通过 & 合并类型） |
| ​动态属性生成 | ❌ 不支持映射类型（无法用 in 动态生成属性） | ✅ 支持映射类型（通过 in 遍历键集合生成属性） |
| ​适用场景 | 对象结构定义、声明合并、类实现（implements） | 联合类型、元组、条件类型、模板字面量类型、复杂类型操作​ |
| 函数类型定义 | 支持对象语法和函数重载： `{ (x: number): number }` | 只能直接定义函数签名： `type Fn = (x: number) => number` |
| ​工具类型支持 | 需结合 extends 或工具类型间接操作 | 直接支持 Partial、Readonly、Pick 等工具类型 |
| ​扩展性 | 适合逐步扩展（通过声明合并） | 需重新定义或交叉类型扩展​ |
| 错误提示 | 更清晰（直接指出属性缺失或冗余） | 复杂类型（如联合类型）可能提示冗长​ |
| 类实现 | 直接通过 implements 实现 | 若为对象类型，也能被类实现 |
| ​示例 | `interface User {<br> name: string;<br>}` | `type User = {<br> name: string;<br>}` |
| ​映射类型示例 | ❌ 不可用 | ✅ `type Optional<T> = {<br> [K in keyof T]?: T[K];` |
