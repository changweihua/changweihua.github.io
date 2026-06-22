---
lastUpdated: true
commentabled: true
recommended: true
title: TypeScript 中复杂类的联合类型判定
description: TypeScript 中复杂类的联合类型判定
date: 2025-09-25 13:00:00 
pageClass: blog-page-class
cover: /covers/typescript.svg
---

在日常 TypeScript 开发中，联合类型（Union Type）是一种非常常见的工具，它允许我们用一个类型描述多个可能的类型情况。比如简单的  `string | number`，可以灵活处理不同输入。但在实际项目里，我们常常需要面对的不仅是基础类型，还包括 *复杂的类 (class)* ，如何在联合类型中区分和使用这些类，是一个必须掌握的技巧。

## 一、联合类型与类的组合 ##

### 基础示例 ###

```ts
class Dog {
  bark() { console.log("Woof"); }
}

class Cat {
  meow() { console.log("Meow"); }
}

type Pet = Dog | Cat;
```

这里的 `Pet` 类型可能是 `Dog` 或 `Cat`。如果我们直接调用：

```ts
function play(pet: Pet) {
  pet.bark(); // ❌ 报错，TS 不知道 pet 一定是 Dog
}
```

TS 编译器会报错，因为它不知道 `pet` 当前是 `Dog` 还是 `Cat`。

解决方法就是 *类型缩小 (Type Narrowing)* 。

## 二、判定方式 ##

### 使用 `instanceof` ###

适用于 *类声明明确* 的情况：

```ts
function play(pet: Pet) {
  if (pet instanceof Dog) {
    pet.bark(); // ✅ TS 确定是 Dog
  } else {
    pet.meow(); // ✅ TS 确定是 Cat
  }
}
```

### 使用 `in` 操作符 ###

适用于 *类之间方法或属性互不重叠* 的情况：

```ts
function play(pet: Pet) {
  if ("bark" in pet) {
    pet.bark();
  } else {
    pet.meow();
  }
}
```

### 自定义类型守卫 ###

当判定逻辑复杂时，可以抽取成函数：

```ts
function isDog(pet: Pet): pet is Dog {
  return pet instanceof Dog;
}

function play(pet: Pet) {
  if (isDog(pet)) {
    pet.bark();
  } else {
    pet.meow();
  }
}
```

### Discriminant 字段（推荐大型项目） ###

为类添加一个标记字段，称为 *可辨识联合 (Discriminated Union)* 。

```ts
class Dog {
  kind: "Dog" = "Dog";
  bark() {}
}

class Cat {
  kind: "Cat" = "Cat";
  meow() {}
}

type Pet = Dog | Cat;

function play(pet: Pet) {
  switch (pet.kind) {
    case "Dog":
      pet.bark();
      break;
    case "Cat":
      pet.meow();
      break;
  }
}
```

这种方式在多人协作、大型项目中尤其常见，可读性和可维护性最好。

## 三、不足与常见问题 ##

### 方法重名导致判定失效 ###

如果 `Dog` 和 `Cat` 都有 `speak()` 方法，那么 `in` 守卫就失去区分作用，必须依赖 `instanceof` 或 `discriminant` 字段。

### 跨包 `instanceof` 可能失效 ###

在不同执行上下文（如 iframe 或微前端环境）中，`instanceof` 的判定可能失败，因为类定义在不同上下文里被认为是不同的构造函数。此时更推荐 discriminant 字段。

### 类型未收缩到分支外 ###

TS 的类型缩小只在条件语句作用域内生效。如果需要跨函数使用，建议用 *自定义守卫函数*。

### 运行时性能问题 ###

在高性能场景下，频繁 `in` 或 `instanceof` 检查会增加开销，但在一般业务代码里可以忽略。

## 四、最佳实践总结 ##

### 小项目 / 简单场景 ###

用 `instanceof` 或 `in` 即可。

### 大型项目 / 团队协作 ###

- 使用 discriminant 字段，形成 *可辨识联合*。
- 搭配 `switch` 语句，编译器能检查分支是否覆盖所有类型。

### 复杂逻辑 ###

抽取 *自定义类型守卫函数*，便于复用和测试。

## 五、拓展思考 ##

## 接口联合 vs 类联合 ##

- 接口更常用 `in` 或 `discriminant` 字段。
- 类更推荐 `instanceof`。

### 与后端交互 ###

如果后端返回的数据需要反序列化为不同类对象，建议在数据结构中加上 type 字段，避免类型推断出错。

### 与泛型结合 ###

可以在泛型工厂函数中动态返回不同类实例，再用上述方法区分。

## 六、结语 ##

在 TypeScript 中，联合类型和复杂类的结合是非常强大的工具，但如果缺乏正确的判定方式，类型检查就会成为阻碍。实际开发中，应该根据项目规模和场景选择合适的方案：

- 小项目快速开发 → `instanceof` / `in`
- 大型项目可维护性优先 → `discriminant` 字段

合理利用这些技巧，不仅能让代码更健壮，也能充分发挥 TypeScript 的类型系统优势。
