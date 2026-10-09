---
lastUpdated: true
commentabled: true
recommended: true
title: 告别 TS 运行时类型漏洞！
description: Zod 完整入门实战教程
date: 2026-07-03 10:25:00
pageClass: blog-page-class
cover: /covers/typescript.svg
---

## Zod 是什么？

Zod 是一个*TypeScript 优先的类型校验库*，核心作用是：

- 用简洁的语法定义「数据校验规则 + TypeScript 类型」（一份代码，双重收益）；
- 校验前端表单、API 响应、环境变量等任意数据，返回清晰的错误信息；
- 零依赖、体积小，适配前端 / Node.js 项目，是替代 Joi、Yup 的主流选择。

## 5 分钟快速上手（Vue3/Vite 项目为例）

### 步骤 1：安装

```bash
npm install zod
# 或 yarn/pnpm
pnpm add zod
```

### 步骤 2：核心用法（定义 → 校验 → 提取类型）

Zod 的核心逻辑是：先定义 Schema 校验规则 → 用 Schema 校验数据 → 自动推导 TS 类型。

```typescript
// src/utils/validate.ts
import { z } from 'zod'

// 1. 定义校验规则（Schema）
const UserSchema = z.object({
  // 必选字符串，非空
  username: z.string().min(2, '用户名至少2个字符').max(20),
  // 可选数字，大于0
  age: z.number().optional().positive('年龄必须为正数'),
  // 邮箱格式校验
  email: z.string().email('请输入正确的邮箱格式'),
  // 枚举值限制
  role: z.enum(['admin', 'user', 'guest'], '角色只能是admin/user/guest'),
  // 嵌套对象
  address: z.object({
    city: z.string(),
    street: z.string().optional()
  })
})

// 2. 提取 TS 类型（无需手动写 interface）
type User = z.infer<typeof UserSchema>

// 3. 校验数据
function validateUser(data: unknown) {
  try {
    // 严格校验：不符合规则会抛错
    const validData = UserSchema.parse(data)
    console.log('校验通过', validData)
    return { success: true, data: validData }
  } catch (error) {
    // 捕获错误并格式化
    if (error instanceof z.ZodError) {
      const errMsg = error.errors.map((item) => ({
        field: item.path.join('.'), // 错误字段（如 address.city）
        message: item.message // 错误提示
      }))
      return { success: false, errors: errMsg }
    }
    return { success: false, errors: [{ field: 'unknown', message: '未知错误' }] }
  }
}

// 测试：校验合法数据
const validUser = {
  username: '张三',
  email: 'zhangsan@test.com',
  role: 'user',
  address: { city: '北京' }
}
console.log(validateUser(validUser)) // success: true

// 测试：校验非法数据
const invalidUser = {
  username: '张', // 长度不足
  email: '123', // 邮箱格式错误
  role: 'super', // 枚举值错误
  address: { city: 123 } // 类型错误
}
console.log(validateUser(invalidUser))
// success: false，errors 包含所有错误字段和提示
```

### 步骤 3：项目实战场景

#### 场景 1：校验前端表单（Vue3 示例）

```vue
<!-- src/components/LoginForm.vue -->
<template>
  <form @submit.prevent="submitForm">
    <input
      v-model="form.email"
      placeholder="邮箱"
    />
    <div v-if="errors.email">{{ errors.email }}</div>

    <input
      v-model="form.password"
      placeholder="密码"
    />
    <div v-if="errors.password">{{ errors.password }}</div>

    <button type="submit">提交</button>
  </form>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { z } from 'zod'

  // 定义表单校验规则
  const LoginSchema = z.object({
    email: z.string().email('请输入正确的邮箱'),
    password: z.string().min(6, '密码至少6位')
  })
  type LoginForm = z.infer<typeof LoginSchema>

  // 表单数据
  const form = ref<LoginForm>({ email: '', password: '' })
  const errors = ref<Record<string, string>>({})

  // 提交表单
  const submitForm = () => {
    // 清空之前的错误
    errors.value = {}

    // 校验数据（safeParse 不抛错，返回结果）
    const result = LoginSchema.safeParse(form.value)
    if (!result.success) {
      // 格式化错误信息
      result.error.errors.forEach((item) => {
        errors.value[item.path[0]] = item.message
      })
      return
    }

    // 校验通过，调用接口
    console.log('表单数据合法', result.data)
  }
</script>
```

#### 场景 2：校验 API 响应

```typescript
// src/api/user.ts
import { z } from 'zod'
import axios from 'axios'

// 定义 API 响应规则
const UserListSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    avatar: z.string().url().optional() // 可选URL
  })
)

// 请求接口并校验响应
async function getUserList() {
  const res = await axios.get('/api/users')
  // 校验响应数据，确保符合预期
  const validData = UserListSchema.parse(res.data)
  return validData
}
```

#### 场景 3：校验环境变量（Vite 项目）

```typescript
// src/utils/env.ts
import { z } from 'zod'

// 定义环境变量规则
const EnvSchema = z.object({
  VITE_API_BASE: z.string().url('API地址必须是合法URL'),
  VITE_GA_ID: z.string().optional()
})

// 校验 Vite 环境变量
const env = EnvSchema.parse(import.meta.env)
// 导出类型安全的环境变量
export default env
```

## 高频实用 API 速查

| API 示例                      | 作用                         |
| :---------------------------- | :--------------------------- |
| `z.string().min(2)`           | 字符串，最小长度 2           |
| `z.number().int()`            | 整数                         |
| `z.boolean()`                 | 布尔值                       |
| `z.array(z.string())`         | 字符串数组                   |
| `z.object({ a: z.string() })` | 对象校验                     |
| `z.enum(['a', 'b'])`          | 枚举值限制                   |
| `z.date()`                    | 日期类型                     |
| `z.any()`                     | 任意类型                     |
| `z.optional(z.string())`      | 可选字符串                   |
| `z.nullable(z.string())`      | 可空字符串                   |
| `schema.parse(data)`          | 严格校验，失败抛错           |
| `schema.safeParse(data)`      | 安全校验，返回结果（不抛错） |
| `z.infer<typeof schema>`      | 从 Schema 提取 TS 类型       |

## 总结

- Zod 核心是「Schema 定义 → 数据校验 → 自动推导 TS 类型」，一份代码兼顾校验和类型；

- 常用场景：表单校验、API 响应校验、环境变量校验，适配前端 / Node.js；

- 核心 API：`z.object`/`z.string`/`z.number` 定义规则，`parse`/`safeParse` 校验数据，`z.infer` 提取类型。

> 上手关键：先定义 `Schema`，再用 `safeParse` 校验数据（避免抛错），最后格式化错误信息返回给用户。

## 前言：为什么 TypeScript 不够用？

日常开发中我们依赖 TypeScript 做静态类型约束，在代码编译阶段拦截类型写错、参数不匹配等问题，大幅降低低级 bug。但 TS 存在一个致命短板：类型校验仅存在编译阶段，项目打包运行后类型信息会完全丢失。

线上绝大多数动态数据都不受 TS 管控：后端接口返回 JSON、用户表单输入、第三方接口回调、本地存储读取的数据，全部属于运行时动态值，TS 无法提前校验。

举个直观的业务场景：我们定义用户信息类型

```typescript
interface Customer {
  username: string
  birthday: number
}
```

在本地硬编码赋值时，TS 会直接标红报错：

```typescript
// 编辑器直接提示类型不匹配
const user: Customer = {
  username: 2000,
  birthday: '2000-01-01'
}
```

但如果数据是接口返回的 JSON 字符串解析而来，情况完全不同：

```typescript
// 模拟后端返回错误格式数据
const rawData = JSON.parse('{"username":1999,"birthday":"2000-05-20"}')
// 强制断言类型，TS不会抛出任何警告
const customer: Customer = rawData
```

此时代码能正常打包运行，但实际数据和我们定义的类型完全相悖：用户名是数字、生日是字符串。后续代码读取`customer.birthday`做日期计算时，会直接抛出线上报错，这类问题很难提前复现排查。

简单总结痛点：TS 只能管编译期，运行时数据校验完全空白，而 Zod 就是为解决这个问题而生的工具。

## Zod 核心介绍

Zod 是一款优先适配 TypeScript的 Schema 定义与数据校验库，核心目标是统一静态类型定义与运行时数据校验，实现「一次定义，两处复用」：

- 运行时校验：通过内置方法校验任意外部数据，自动捕获格式、类型、字段缺失问题；

- 自动 TS 类型推导：无需手动编写 interface/type，从 Schema 自动生成静态类型，杜绝类型重复定义。

## 快速上手：安装与基础校验

### 安装依赖

支持 npm、pnpm、yarn 任意包管理器

```bash
npm install zod
```

### 基础 Schema 定义

Zod 的核心开发思路：_先定义数据模板 Schema，再用模板校验真实数据_

```typescript
import { z } from 'zod'

// 基础单字段规则
const NicknameSchema = z.string()
const ScoreSchema = z.number()

// 组合对象模板（用户信息）
const UserSchema = z.object({
  nickname: NicknameSchema,
  score: ScoreSchema
})
```

### 两种数据校验方式

Zod 提供 `parse` 与 `safeParse` 两套校验方案，适配不同业务场景

#### 方式 1：parse（校验失败直接抛出异常）

适合接口全局拦截、初始化校验，搭配 try/catch 捕获错误

```typescript
// 合法数据，直接返回格式化后对象
UserSchema.parse({ nickname: '前端小周', score: 96 })

// 非法数据，抛出ZodError
UserSchema.parse({ nickname: 888, score: '满分' })
```

抛出的错误包含完整字段定位信息：字段路径、预期类型、实际传入值，方便定位问题。

#### 方式 2：safeParse（返回结果对象，不抛异常）

适合前端表单实时校验，无需捕获异常，通过success字段判断结果

```typescript
// 校验成功
const successRes = UserSchema.safeParse({ nickname: '小李', score: 82 })
// { success: true, data: { nickname: "小李", score: 82 } }

// 校验失败
const failRes = UserSchema.safeParse({ nickname: 666, score: '九十' })
/*
{
  success: false,
  error: ZodError {
    issues: [
      { path: ["nickname"], expected: "string", message: "类型错误，预期字符串" },
      { path: ["score"], expected: "number", message: "类型错误，预期数字" }
    ]
  }
}
*/
```

## 全量常用 Schema 类型详解

Zod 内置覆盖 JS/TS 全部基础数据结构，下面分大类讲解实战常用模板

### 基础原始类型

覆盖字符串、数字、布尔、日期、特殊空类型等

```typescript
// 字符串
const text = z.string()
text.parse('前端开发') // 通过
text.parse(123) // 报错

// 数字
const num = z.number()
num.parse(60) // 通过
num.parse('60') // 报错

// 布尔、BigInt、Date
const flag = z.boolean()
const bigNum = z.bigint()
const day = z.date()
day.parse(new Date()) // 通过
day.parse('2026-06-30') // 报错

// 空值相关
z.null()
z.undefined()
z.any() // 不做任何校验
z.unknown() // 仅做类型占位，需二次校验
z.never() // 不允许传入任何值
```

### 对象类型（业务最常用）

用于固定字段结构化数据，配套多种扩展 API

```typescript
const StudentSchema = z.object({
  name: z.string(),
  age: z.number()
})

// 扩展新增字段
const StudentWithEmail = StudentSchema.extend({ email: z.string().email() })
// 全部字段改为可选
StudentSchema.partial()
// 全部字段强制必填
StudentSchema.required()
```

### 数组 & 元组

数组：统一约束数组内所有元素类型，长度不固定

```typescript
const numList = z.array(z.number())
numList.parse([12, 34, 56]) // 通过
numList.parse(['12', '34']) // 报错
```

元组：固定长度、固定顺序、每个位置单独约束类型

```typescript
const tagTuple = z.tuple([z.string(), z.number()])
tagTuple.parse(['前端', 1]) // 通过
tagTuple.parse([1, '前端']) // 顺序错误，报错
```

### 集合类型 Record / Map / Set

Record：动态键值对象，所有键 / 值统一类型（和 object 区分：object 是固定字段，record 是任意字段）

```typescript
// 键为数字，值为字符串
const Dict = z.record(z.number(), z.string())
Dict.parse({ 1: '首页', 2: '详情页' }) // 通过
Dict.parse({ 1: 999 }) // 值类型错误，报错
```

Map/Set：校验 ES 原生集合对象

```typescript
const strMap = z.map(z.string(), z.number())
const numSet = z.set(z.number())
numSet.parse(new Set([1, 2, 3])) // 通过
```

### 字面量、枚举校验

字面量：仅允许固定单一值

```typescript
const statusDraft = z.literal('draft')
statusDraft.parse('draft') // 通过
statusDraft.parse('publish') // 报错
```

字符串枚举：限定可选字符串列表

```typescript
const ArticleStatus = z.enum(['draft', 'publish', 'archived'])
ArticleStatus.parse('draft') // 通过
```

原生 TS 枚举：校验自定义 enum

```typescript
enum OrderState {
  Pending,
  Completed
}
const OrderEnum = z.nativeEnum(OrderState)
OrderEnum.parse(OrderState.Pending)
```

## Schema 修饰与组合语法

真实业务中字段不会全是必填固定类型，Zod 提供修饰符、组合语法处理可选、空值、多类型合并场景

### 空值修饰符

`.optional()`：允许当前值为定义类型 /undefined（表单非必填字段）

```typescript
const optStr = z.string().optional()
optStr.parse('测试')
optStr.parse(undefined)
```

`.nullable()`：允许当前值为定义类型 /null

```typescript
const nullStr = z.string().nullable()
nullStr.parse(null)
```

`.nullish()`：同时支持 null、undefined、原类型

```typescript
const allEmptyStr = z.string().nullish()
allEmptyStr.parse(null)
allEmptyStr.parse(undefined)
```

`.default()`：传入 undefined 时自动填充默认值

```typescript
const strWithDefault = z.string().default('无备注')
strWithDefault.parse(undefined) // 输出 "无备注"
```

### 多 Schema 组合

联合类型 union：满足任意一种 Schema 即可

```typescript
const strOrNum = z.union([z.string(), z.number()])
strOrNum.parse(99)
strOrNum.parse('99')
```

交叉类型 intersection：必须同时满足两个 Schema（合并对象字段）

```typescript
const HasName = z.object({ name: z.string() })
const HasScore = z.object({ score: z.number() })
const Student = z.intersection(HasName, HasScore)
```

判别联合 discriminatedUnion：带标识字段的多对象联合，报错精准、校验性能更高适用于多类型区分对象（如不同类型订单、不同组件配置）

```typescript
// 两种商品类型，通过type字段区分
const Book = z.object({
  type: z.literal('book'),
  page: z.number()
})
const Food = z.object({
  type: z.literal('food'),
  weight: z.number()
})
const Goods = z.discriminatedUnion('type', [Book, Food])
Goods.parse({ type: 'book', page: 200 })
```

## 精细化自定义校验规则

基础类型仅能校验基础格式，业务场景需要长度、正则、跨字段对比等自定义约束

### 内置链式校验方法

字符串、数字自带大量业务常用校验规则，支持自定义报错文案

```typescript
// 用户名：3-12位小写字母
const username = z
  .string()
  .min(3, { message: '用户名最少3位字符' })
  .max(12, { message: '用户名最多12位字符' })
  .regex(/^[a-z]+$/, { message: '仅允许小写英文' })

// 年龄：0~120之间整数
const userAge = z.number().int({ message: '年龄必须为整数' }).min(0).max(120)

// 邮箱、链接、UUID快捷校验
z.string().email()
z.string().url()
z.string().uuid()
```

### 单字段自定义校验 refine

内置规则无法满足时，自定义校验逻辑，自定义错误提示

```typescript
// 密码最少8位
const pwdSchema = z.string().refine((val) => val.length >= 8, {
  message: '密码长度不能小于8位'
})
```

### 跨字段全局校验 superRefine

读取整个对象数据，实现多字段联动校验（如密码二次确认）

```typescript
const LoginForm = z
  .object({
    password: z.string(),
    confirmPwd: z.string()
  })
  .superRefine((formData, ctx) => {
    if (formData.password !== formData.confirmPwd) {
      // 指定错误绑定到confirmPwd字段
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPwd'],
        message: '两次输入密码不一致'
      })
    }
  })
```

### 错误格式化` format ()`

原始 ZodError 的错误结构层级深，不适合前端表单渲染，`format()`会自动转为「字段为 key」的对象结构

```typescript
const FormSchema = z.object({
  name: z.string().min(3),
  age: z.number().min(18)
})
const res = FormSchema.safeParse({ name: 'A', age: 16 })

if (!res.success) {
  // 格式化错误，直接绑定表单UI
  const errInfo = res.error.format()
  console.log(errInfo.name._errors[0]) // 获取name字段错误文案
}
```

## 数据转换：coerce /transform/pipe

很多场景输入数据格式不符合需求，Zod 支持在校验前后自动转换数据，无需手动处理

### coerce 强制类型转换

常用于表单、URL 参数（全部为字符串，需要转数字 / 日期）

```typescript
const coerceNum = z.coerce.number()
coerceNum.parse('96') // 自动转为数字96
```

支持：`z.coerce.string()`、`z.coerce.boolean()`、`z.coerce.date()`

### transform 校验后数据加工

校验通过后，对值做格式化、裁剪、计算等操作

```typescript
// 自动去除首尾空格
const trimText = z.string().transform((val) => val.trim())
trimText.parse('  掘金文章  ') // 输出 "掘金文章"
```

### pipe 多 Schema 管道串联

将多个 Schema 按顺序串联，前一个校验结果传入下一个 Schema

```typescript
// 数字转字符串
const numToStr = z.number().pipe(z.string())
numToStr.parse(2026) // 输出 "2026"
```

## TypeScript 类型自动推断（Zod 核心亮点）

不用手动写 interface，通过`z.infer`直接从 Schema 提取 TS 静态类型，保证运行校验和静态类型完全同步

```typescript
const ArticleSchema = z.object({
  title: z.string(),
  readCount: z.number()
})

// 自动推导静态类型
type Article = z.infer<typeof ArticleSchema>
/*
等价于手动定义：
interface Article {
  title: string;
  readCount: number;
}
*/
```

### 区分输入 / 输出类型 z.input/z.output

如果使用 transform、pipe 转换数据，输入原始值和最终输出值类型不一致，可分别提取：

```typescript
const LenSchema = z.string().transform((val) => val.length)
type RawInput = z.input<typeof LenSchema> // string
type FinalOutput = z.output<typeof LenSchema> // number
```

## 高阶实用特性

### 递归树形结构 `z.lazy`

处理无限嵌套树形数据（分类、评论、菜单），解决 Schema 自引用报错

```typescript
// 树形分类结构
const CategorySchema: z.ZodType<any> = z.object({
  label: z.string(),
  children: z.array(z.lazy(() => CategorySchema))
})
```

### 对象多余字段控制

默认会保留未定义的额外字段，三种模式按需切换

```typescript
// strict：禁止传入额外字段，多字段直接报错
z.object({ name: z.string() }).strict()

// strip：自动剔除多余字段，只保留定义字段
z.object({ name: z.string() }).strip()

// passthrough：保留额外字段，不做校验
z.object({ name: z.string() }).passthrough()
```

### Schema 描述 describe

给字段添加注释，用于生成接口文档、JSON Schema 导出

```typescript
const User = z.object({
  username: z.string().describe('用户账号'),
  createTime: z.date().describe('账号创建时间')
})
```

## 生态集成实战

### 导出 JSON Schema

Zod4 内置toJSONSchema，将 Schema 转为标准 JSON Schema，用于 OpenAPI 接口文档、配置校验

```typescript
import { z } from 'zod'
const User = z.object({ name: z.string(), age: z.number().min(18) })
const jsonSchema = z.toJSONSchema(User)
console.log(jsonSchema)
```

### 搭配 React Hook Form 表单校验

前端表单最常用组合，zodResolver直接对接表单库，自动绑定错误信息

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email('邮箱格式错误'),
  password: z.string().min(8, '密码至少8位')
})

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(LoginSchema)
  })

  const submit = (data) => console.log('表单数据', data)
  return (
    <form onSubmit={handleSubmit(submit)}>
      <input
        {...register('email')}
        placeholder="请输入邮箱"
      />
      {errors.email && <span className="err">{errors.email.message}</span>}

      <input
        type="password"
        {...register('password')}
        placeholder="请输入密码"
      />
      {errors.password && <span className="err">{errors.password.message}</span>}
      <button type="submit">登录</button>
    </form>
  )
}
```

## 总结

TypeScript 解决了编译期类型安全，但无法管控接口、表单、本地存储等运行时动态数据，而 Zod 完美填补这块空白。
只需要定义一套 Schema，就能同时拿到静态 TS 类型和运行时数据校验能力，大幅减少线上类型异常、字段缺失、格式错误等 bug，同时简化表单、接口参数校验代码。

不管是前端表单、前后端接口入参出参校验、配置文件解析，Zod 都是现代 TS 项目的标准解决方案。如果你的项目还在手动写 if 判断校验数据，不妨尝试接入 Zod，一次性简化所有数据校验逻辑。
