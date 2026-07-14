---
lastUpdated: true
commentabled: true
recommended: true
title: 表单验证太复杂？
description: 用 Zod 让它变得简单又安全
date: 2025-04-25 15:00:00
pageClass: blog-page-class
---

# 表单验证太复杂？用 Zod 让它变得简单又安全 #

Zod 是一个 TypeScript-first 的数据验证库，旨在提供一种类型安全的方式来验证数据。它的设计哲学围绕 类型推导 和 可组合性，并与 TypeScript 的静态类型系统深度集成。通过这种设计，Zod 不仅仅是一个普通的数据验证工具，它还提供了非常强的 类型安全保障，让你在开发过程中尽可能地避免出错。

在传统的 JavaScript 库中，数据验证和类型定义是分开的，但 Zod 则将两者结合起来。它通过 zod 的验证规则同时生成与数据结构匹配的类型，这样开发者在编写代码时可以立即获得类型检查和自动补全功能，而无需额外编写冗长的类型定义。

Zod 的核心目标是：通过简洁的 API 提供高效且类型安全的数据验证，同时确保与 TypeScript 的高度兼容。

## Zod 的工作原理 ##

### Schema（模式） ###

Zod 的核心概念是 Schema，即数据的验证规则。每个 Schema 定义了一个特定的数据结构，可以对不同的数据类型进行验证。Zod 的 Schema 是类型安全的，意味着验证过程中不仅仅关注数据的合法性，还会通过 TypeScript 确保数据类型的准确性。

例如，你可以创建一个验证 字符串 类型的模式，Zod 会通过静态类型检查，确保该数据始终是一个字符串：

```typescript
import { z } from "zod";

// 创建一个简单的字符串模式
const stringSchema = z.string();

// 验证数据是否符合字符串类型
stringSchema.parse("Hello"); // 通过验证
stringSchema.parse(123); // 抛出错误，类型不匹配
```

### `parse()` 与 `safeParse()` 方法 ###

`parse()`：这是 Zod 的核心验证方法，调用后会立即验证数据是否符合定义的 Schema。如果数据不符合 Schema，Zod 会抛出一个详细的错误信息。

```typescript
z.string().parse("Hello"); // 通过验证
z.string().parse(123); // 抛出错误，因为类型不匹配
```

`safeParse()`：如果你不希望验证失败时抛出异常，可以使用 `safeParse()`。它返回一个包含验证结果的对象，并不会直接抛出错误。你可以通过 success 来判断验证是否成功，错误信息则通过 error 获取。

```typescript
const result = z.string().safeParse(123);
if (!result.success) {
  console.log(result.error.errors); // 错误信息
}
```

## Zod 的基本功能与常见使用场景 ##

### 基本类型验证 ###

Zod 提供了常见的数据类型验证，包括 `z.string()`, `z.number()`, `z.boolean()` 等。通过这些基本类型，你可以简单地验证数据类型是否符合预期。

```typescript
// 验证字符串类型
const stringSchema = z.string();
stringSchema.parse("Hello"); // 通过验证
stringSchema.parse(123); // 抛出错误

// 验证数字类型
const numberSchema = z.number();
numberSchema.parse(42); // 通过验证
numberSchema.parse("42"); // 抛出错误
```

### 对象验证 ###

你可以使用 `z.object()` 来验证一个对象的结构。它允许你定义对象的每个字段的类型，并为其设置验证规则。

```typescript
const userSchema = z.object({
  name: z.string().min(3), // name 字段必须是字符串，且长度至少为 3
  age: z.number().min(18), // age 字段必须是数字，且不小于 18
});

// 测试数据
const validUser = { name: "Alice", age: 25 };
userSchema.parse(validUser); // 通过验证

const invalidUser = { name: "Bob", age: 16 };
userSchema.parse(invalidUser); // 抛出错误，因为 age 小于 18
```

### 数组验证 ###

Zod 也支持数组类型的验证。你可以使用 `z.array()` 来验证数组中每个元素的类型。

```typescript
const numberArraySchema = z.array(z.number());
numberArraySchema.parse([1, 2, 3]); // 通过验证
numberArraySchema.parse([1, "two"]); // 抛出错误，因为 "two" 不是数字
```

### 联合类型验证 ###

使用 `z.union()`，你可以验证某个字段是否符合多个类型中的任意一种。

```typescript
const stringOrNumberSchema = z.union([z.string(), z.number()]);
stringOrNumberSchema.parse("Hello"); // 通过验证
stringOrNumberSchema.parse(42); // 通过验证
stringOrNumberSchema.parse(true); // 抛出错误，因为布尔值不在定义的类型中
```

### 枚举类型验证 ###

通过 `z.enum()`，Zod 支持验证枚举类型的值，确保数据符合预定义的有限值。

```typescript
const colorSchema = z.enum(["red", "green", "blue"]);
colorSchema.parse("red"); // 通过验证
colorSchema.parse("yellow"); // 抛出错误，因为 "yellow" 不在枚举范围内
```

## 高级功能：灵活的验证与数据处理 ##

### `.refine()` — 自定义验证 ###

`.refine()` 让你可以自定义验证逻辑。它接收一个函数，这个函数会根据自定义条件返回 true 或 false，如果返回 false，则会抛出错误。

```typescript
const passwordSchema = z
  .string()
  .min(8)
  .refine((val) => /[A-Z]/.test(val), {
    message: "密码必须包含大写字母",
  });

passwordSchema.parse("Password123"); // 通过验证
passwordSchema.parse("password123"); // 抛出错误，缺少大写字母
```

### `.transform()` — 数据转换 ###

`.transform()` 可以用来转换输入数据，例如，将字符串转换为数字。

```typescript
const ageSchema = z.string().transform((val) => parseInt(val, 10));
ageSchema.parse("25"); // 转换为数字 25
```

### `.default()` — 默认值 ###

`.default()` 可以为某个字段设置默认值，如果该字段的值为空（如 undefined），则会使用默认值。

```typescript
const userSchema = z.object({
  name: z.string(),
  age: z.number().default(18), // 如果 age 没有提供，则默认为 18
});

const user = { name: "Alice" };
console.log(userSchema.parse(user).age); // 输出 18，因为 age 未提供
```

### `.optional()` 与 `.nullable()` ###

`.optional()` 使得字段可以是 undefined，而 `.nullable()` 使得字段可以是 null。

```typescript
const userSchema = z.object({
  name: z.string(),
  age: z.number().optional(), // age 可以是 undefined
});

const validUser = { name: "Bob" };
userSchema.parse(validUser); // age 默认为 undefined

const nullableSchema = z.string().nullable(); // 字符串可以是 null
nullableSchema.parse(null); // 通过验证
```

## 错误处理与调试 ##

### 错误对象结构 ###

Zod 在验证失败时会抛出详细的错误信息，帮助你快速定位问题。每个错误对象包含：

- `path`：出错的字段路径，例如 `["age"]`。
- `message`：简短的错误信息，描述错误原因。
- `expected`：期望的数据类型或格式。
- `received`：收到的数据类型或格式。

例如，验证失败时，错误对象可能如下所示：

```json
{
  "path": ["age"],
  "message": "Expected number, received string",
  "expected": "number",
  "received": "string"
}
```

### 捕获错误 ###

可以通过 `safeParse()` 方法捕获验证失败的错误，而不会中断程序的执行。

```typescript
const result = z.number().safeParse("NaN");
if (!result.success) {
  console.log(result.error.errors); // 错误信息
}
```

### 调试与自定义错误 ###

Zod 还支持自定义错误信息，并且能够很容易地进行调试。你可以通过 `.refine()` 和 `.transform()` 等方法在验证过程中进行调试和记录。

```typescript
import { z } from "zod";

// 密码验证规则：长度至少 8 个字符，并且包含至少一个大写字母
const passwordSchema = z
  .string()
  .min(8, { message: "密码必须至少包含 8 个字符" }) // 密码长度检查
  .refine(
    (val) => {
      console.log("Checking password:", val);
      // 验证密码是否包含至少一个大写字母
      return /[A-Z]/.test(val);
    },
    {
      message: "密码必须包含大写字母", // 自定义错误消息
    }
  );

// 测试密码
const validPassword = "Password123";
const invalidPassword = "password123";

// 测试有效密码
try {
  passwordSchema.parse(validPassword);
  console.log("密码有效:", validPassword);
} catch (e) {
  console.log(e.errors); // 打印验证失败的错误
}

// 测试无效密码
try {
  passwordSchema.parse(invalidPassword);
  console.log("密码有效:", invalidPassword);
} catch (e) {
  console.log(e.errors); // 打印验证失败的错误
}
```

## 性能优化与最佳实践 ##

### 避免重复验证 ###

对于一些频繁验证的数据，可以通过缓存或减少验证频率来提升性能，尤其是在用户输入时。

### 使用 `z.lazy()` 来处理递归数据结构 ###

当你需要处理递归类型的数据（比如树结构），可以使用 `z.lazy()` 来延迟验证，避免无限递归。

```typescript
const schema = z.lazy(() =>
  z.object({
    name: z.string(),
    children: z.array(schema.optional()),
  })
);
```

### 批量验证与缓存 ###

如果你需要验证大量数据，考虑批量验证或将验证结果缓存，以提高验证的效率。

## Zod 在实际开发中的应用 ##

### 表单数据验证 ###

Zod 非常适合用于表单数据的验证，确保用户输入的数据符合预期。例如，验证用户注册表单中的用户名、密码和年龄。

```typescript
const registrationSchema = z.object({
  username: z.string().min(5),
  password: z.string().min(8),
  age: z.number().min(18),
});

const formData = { username: "user1", password: "securepass", age: 25 };
registrationSchema.parse(formData); // 通过验证
```

### API 请求数据验证 ###

Zod 还可以用于验证来自外部 API 请求的数据，确保请求体符合预期结构。

```typescript
const apiRequestSchema = z.object({
  userId: z.string(),
  data: z.object({
    message: z.string(),
  }),
});

apiRequestSchema.parse(req.body); // 验证请求数据
```

### 环境变量验证 ###

Zod 是验证环境变量的绝佳工具，它能够确保从环境中读取的配置数据是有效且符合预期格式的。

```typescript
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.number().min(1024).max(65535),
});

envSchema.parse(process.env); // 验证环境变量
```

## 总结 ##

Zod 是一个极为强大且灵活的 TypeScript-first 数据验证库，提供了类型安全的验证能力和简洁的 API。它不仅支持基础的类型验证，还允许你自定义复杂的验证逻辑。通过与 TypeScript 的无缝结合，Zod 能够确保数据验证的一致性，避免类型错误，并且能够通过详细的错误信息帮助你快速定位问题。

在现代 TypeScript 应用中，Zod 已经成为了数据验证领域的强大工具，它适用于各种场景，包括表单验证、API 请求验证、环境变量验证等。如果你在使用 TypeScript，并且需要高效且类型安全的数据验证，Zod 将是你的理想选择。

最后，我们再来看一个 demo：

```typescript
import { z } from "zod";

// 示例 1: 字符串验证
const stringSchema = z.string();
try {
  console.log(stringSchema.parse("Hello")); // 通过验证
  console.log(stringSchema.parse(123)); // 会抛出错误
} catch (e) {
  console.error(e.errors); // 错误信息
}

// 示例 2: 对象验证
const userSchema = z.object({
  name: z.string().min(3),
  age: z.number().min(18),
});

const validUser = { name: "Alice", age: 25 };
try {
  userSchema.parse(validUser); // 通过验证
  console.log("User is valid!");
} catch (e) {
  console.error(e.errors); // 错误信息
}

// 示例 3: 数字验证
const numberSchema = z.number();
try {
  console.log(numberSchema.parse(42)); // 通过验证
  console.log(numberSchema.parse("42")); // 会抛出错误
} catch (e) {
  console.error(e.errors); // 错误信息
}
```
