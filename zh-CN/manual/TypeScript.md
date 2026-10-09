---
outline: false
aside: false
layout: doc
date: 2025-10
title: TypeScript 教程
description: TypeScript 教程
category: 文档
pageClass: manual-page-class
---

## 如何用 TypeScript 折腾出全排列之你不知道的 ：“分布式条件类型”、“递归处理” ##

> 科学家说：复杂系统的美在于简洁的规则。
> 工程师说：我只希望编译器别红线。
> TypeScript 说：要不…我们在类型里递归一下？🙂

今天我们拆解一个经典的“类型体操”题，它也是理解 TypeScript 条件类型与联合类型分发机制的最佳入口。

主角只有一行：

```ts
type Permutation<T, K = T> =
  [T] extends [never]
    ? []
    : K extends K
      ? [K, ...Permutation<Exclude<T, K>>]
      : never
```

别急，让我们像逆向编译一样，一层层剥开它的心智模型和底层规则。

### 热身题：我们要得到什么？ ###

目标：给一个联合类型 T，例如 `'A' | 'B' | 'C'`，生成所有排列（全排列）的“元组联合”。

- `Permutation<'A' | 'B'> => ['A', 'B'] | ['B', 'A']`
- `Permutation<1 | 2 | 3> => [1,2,3] | [1,3,2] | [2,1,3] | [2,3,1] | [3,1,2] | [3,2,1]`

换句话说，我们要在“类型层面”算出排列，而不是在运行时。因为这能让你的 API 类型提示“预知未来”，对每一种顺序都给出精确校验。

### 编译器的“魔法棒”：联合类型的分发 ###

TypeScript 有个重要规则：如果条件类型的左侧是“裸露的类型参数”，它会对联合类型进行分发。

通俗点说：T 是 A | B 时，`T extends X ? Y : Z` 会被拆成 `(A extends X ? Y : Z) | (B extends X ? Y : Z)`。

- 这让我们能“逐个拿到联合成员”，像枚举一样地处理每一个分支。
- 这正是全排列的关键：对每个 K，放到第一位，然后对“剩下的”再去排列。

**小图标时间**：

🎩 => 你以为是一顶帽子，其实它是无限兔子的工厂。

联合类型 + 分发条件类型 = 无限兔子。

### 终止条件：为什么是 `[T] extends [never]` ？ ###

如果 T 没东西了（即 T 为 never），那全排列只剩一个空序列：[]。

难点是：如何判断“整个 T 是不是 never”。

- 如果写 `T extends never`，当 T 是 A | B 时会“分发”，分别判断 A 和 B，自然不是我们想要的“整体为 never 的判断”。
- 用一层方括号套住：`[T] extends [never]`。这会阻止分发，编译器把它当作“整体的 T”来看，只在 T 真的是 never 时为真。

这叫“禁用分发”技巧。

就像把糖果装进盒子里再称重，防止它们被拆散逐个称。

### 启动分发：为什么写 `K extends K` ？ ###

`K extends K ? ... : never` 看起来像自言自语，但它是一个经典“触发分发”的手段。

- 默认 K = T，且 K 在这个条件类型里是“裸露”的，因此对于联合类型 T，每个成员都会走一遍这个分支。
- 每个分支里的 K，就代表了“当前挑出来的那个元素”，也就是排列里“放在第一位”的人选。

设计巧妙在于：用 K 作为“当前挑选项”，而 T 保留为“全集”。

接下来用 `Exclude<T, K>` 拿到“剩余项”，递归生成后续位置的排列。

### 拼装递归：Exclude 与展开 ###

再看核心一行：

`[K, ...Permutation<Exclude<T, K>>]`

- 第一个元素是当前分发到的 K（被选中放在第一位）。
- 后面的元素来自“对剩余元素继续做全排列”，也就是 `Permutation<Exclude<T, K>>`。
- `Exclude<T, K>` 会把联合类型 T 里等于 K 的那一项排掉，得到剩余的候选集合。

所以，对于 T = 'A' | 'B' | 'C'：

- 分发时先取 K='A'，得到 `['A', ...Permutation<'B' | 'C'>]`
- 然后取 K='B'，得到 `['B', ...Permutation<'A' | 'C'>]`
- 再取 K='C'，得到 `['C', ...Permutation<'A' | 'B'>]`
- 递归到底时，`T=never => []`

最终，这些分支的结果被联合起来，就是“所有可能的元组”。

### 运行时类比：用 JS 复刻思路（仅作心智模型） ###

这段 JS 只是解释思路，真实类型计算完全发生在编译期。

```js
function permutations(arr) {
  if (arr.length === 0) return [[]];
  const res = [];
  for (const k of arr) {
    const rest = arr.filter(x => x !== k);
    for (const p of permutations(rest)) {
      res.push([k, ...p]);
    }
  }
  return res;
}

// 心智印象：TypeScript 的类型系统在做逻辑上类似的拆分和合成，
// 但它处理的是“联合类型”的成员，而不是运行时数组元素。
```

相似之处：一个“选当前 + 排剩下”的递归。

不同之处：TS 是在类型层计算，靠分发条件类型展开所有分支；JS 是运行时递归。

### 浏览器级“底层”：never 和联合的“吸收性” ###

- never 在类型世界里是“空集合”。当我们把 T 缩小到空集时，排列应当是“只有一种空排列”，即 []。
- 条件类型遇到 never 通常会直接短路，这正好配合我们做递归终止。
- 联合类型是“并集”，分发条件类型就是“对并集的每一个成员都套一遍规则，再把结果并起来”。

你可以把整个过程想象为：

“从一个集合里挑一个，剩下的再递归；当集合为空，返回唯一的空排列。”

### 类型系统的“精巧副作用”：K 的存在价值 ###

为什么不是只写一个参数 T？

因为我们需要“既能判断整体 T 是否为空”，又需要“对联合成员逐个分发”。

- `[T] extends [never]` 用于整体判断，禁止分发。
- `K extends K` 则用于分发。

设置默认值 K = T，让它总能覆盖 T 的所有成员，又不需要额外传参。

这就像在算法里同时维护“全集”和“当前元素”，但在类型系统里需要借助两个类型参数来表达不同的分发策略。

### 可视化小卡片：执行树 ###

让我们以 T = 'A' | 'B' | 'C' 为例（用表情模拟展开树）：

**选 A**

- 选 B → `['A','B', ...perm('C')]` → `['A','B','C']`
- 选 C → `['A','C', ...perm('B')]` → `['A','C','B']`

**选 B**

- 选 A → `['B','A','C']`
- 选 C → `['B','C','A']`

**选 C**

- 选 A → `['C','A','B']`
- 选 B → `['C','B','A']`

**小图标**：

- 🎯 当前选中
- 🪄 分发展开
- 🧩 递归拼装

### 常见问题与“踩坑排雷” ###

- “为什么我改成 T extends never 就挂了？”

因为发生了分发，A | B 会被拆开分别判断，不再是“整体为 never”的判断。用 `[T]` 套一下阻止分发。

- “为什么不直接递归 T 呢？”

你需要同时“整体判断 + 逐个分发”，所以分两步：整体用 `[T]`，分发用 K。

- “我能把 never 作为一个元素参与排列吗？”

不行，never 是空集合，不表示某个具体值。

- “复杂度会不会爆炸？”

是的，n 个元素的排列数是 n!。类型展开在大 n 时会很慢。实际工程中谨慎使用，确保 T 的规模很小。

### 结合实际工程的用法建议 ###

- 用于声明 API 的“顺序敏感的元组参数”。比如某些指令流水、按键组合、动画队列。
- 与映射类型、模式字符串联合使用，可以生成严格的路由段排列。
- 控制规模：对 3～5 个元素很友好；大于 7 基本会让 TS 编译器抱怨人生。

### 附：互动型“类型游乐园”（仅演示） ###

试试这些类型别名（粘到你的 ts 文件里，用鼠标悬停查看推导结果）：

```ts
type Permutation<T, K = T> =
  [T] extends [never]
    ? []
    : K extends K
      ? [K, ...Permutation<Exclude(T, K)>]
      : never;

// 小试牛刀
type P2 = Permutation<'A' | 'B'>;
//   ^? 期望：['A','B'] | ['B','A']

type P3 = Permutation<1 | 2 | 3>;
//   ^? 期望：
// [1,2,3] | [1,3,2] |
// [2,1,3] | [2,3,1] |
// [3,1,2] | [3,2,1]
```

温馨提示：把鼠标放在 P3 上，IDE 会给你展开一个足够壮观的联合类型“瀑布”。

### 结语：当类型系统开始“干算法” ###

Permutation 看似炫技，但它不是炫技的终点。它展示的是：

- 如何控制“分发”与“禁用分发”的开关；
- 如何利用 never 作为递归的地板；
- 如何在“类型层”复现“递归算法”的结构。

当你理解了这行代码，你就同时掌握了 TypeScript 条件类型的两把钥匙：

- 盒子技巧（`[T]`）
- 裸露触发（K extends K）

编译器不懂浪漫，但我们可以在它的语义空间里，创造出一种精致的秩序。
至于优雅？让没有红线的代码自己去证明吧。✨

## TypeScript防御性编程：让Bug无处遁形的艺术 ##

### 🌱 一、前言：为什么要防御性编程？ ###

防御性编程，顾名思义，就是要假设世界会崩溃、同事会乱写、接口会变形，而你的代码依然要坚如磐石。

如果你是一位“前端武僧”，TypeScript 就是你的“心法宝典”——它能帮你在动态 JavaScript 的江湖中活得更久。


> 💭 防御性编程的信条：
>
> 不信任任何输入，不依赖任何假设，不放过任何潜在的异常。

### 🧠 二、TypeScript 的哲学内核：类型即契约 ###

在底层原理上，TypeScript 的类型系统并不“运行”于程序时，而是存在于编译期的逻辑空间中。

这意味着它更像一个“数学证明辅助系统”——防御性编程的第一关，就是在类型层面封锁错误的入口。

我们先看一个简单例子👇

```js
// ❌ 潜在灾难的JS写法
function getUserAge(user) {
  return user.age + 1;
}

// ✅ 防御性TypeScript修正版
function getUserAge(user: { age?: number }): number {
  if (typeof user.age !== "number") {
    throw new Error("Invalid user object: missing or invalid age");
  }
  return user.age + 1;
}
```

这里，我们不仅声明了 `user.age` 可能不存在，还在运行时加上了安全检查。

> TS在编译期防御，JS在运行时防御——这才是双保险的真正意义。

### 🛡️ 三、类型防线：从“信任”到“验证”的进化 ###

#### 🧩 1. 类型守卫（Type Guards） ####

类型守卫是一种运行期的类型筛查机制，它能让你的编译器变得更“聪明”。

```js
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function printUppercase(input: unknown) {
  if (isString(input)) {
    console.log(input.toUpperCase());
  } else {
    console.warn("🤷‍♂️ 输入不是字符串");
  }
}
```

> 这段代码相当于在类型系统中安插了一只“逻辑天眼”，能在 TS 编译时精确预测输入的合法边界。


#### ⚙️ 2. Never类型：逻辑闭环的守卫者 ####

never 代表“不可能发生的类型”。

它常用在穷尽检查中，确保逻辑分支没有遗漏。

```typescript
type Shape = "circle" | "square" | "triangle";

function getArea(shape: Shape): number {
  switch (shape) {
    case "circle":
      return 3.14 * 2 * 2;
    case "square":
      return 4 * 4;
    case "triangle":
      return (3 * 4) / 2;
    default:
      const _exhaustiveCheck: never = shape;
      throw new Error(`💥 Unexpected shape: ${_exhaustiveCheck}`);
  }
}
```

> 如果未来新增了 `shape = "hexagon"` 而忘记处理，TypeScript 会立刻尖叫：
>
> “兄弟，你漏算一个维度！”

#### 🧱 3. Immutable思维：防御性程序员的信条之一 ####

可变数据结构是Bug的天堂。

要真正做到防御性，我们需学会“冻结”对象。

```ts
type Config = {
  readonly apiUrl: string;
  readonly retries: number;
};

const config: Config = {
  apiUrl: "https://api.example.com",
  retries: 3
};

// ❌ config.retries = 5; // 编译器直接阻止这种“叛变”行为！
```

> “冻结”不仅是性能优化的姿势，更是一种“防止未来同事作恶”的预防性措施 🧊。

### 🔍 四、运行时防御：类型检查的最后防线 ###

TypeScript 的类型检查在编译期生效，但当代码运行在浏览器或Node里时，一切类型信息都蒸发成风。

所以，防御性程序员必须用运行时验证库（比如 zod 或 io-ts）筑起第二道墙。

```ts
import { z } from "zod";

const UserSchema = z.object({
  name: z.string(),
  age: z.number().min(0),
});

function createUser(input: unknown) {
  const user = UserSchema.parse(input); // 会在不合法时直接报错
  return user;
}
```

> 💬 “TypeScript 保你免于手滑，Zod 保你免于他人代码。”

### 📊 五、错误处理：优雅地“不信任世界” ###

没有错误处理的防御性编程，就像只有盾没有剑。

我们要让程序“优雅地失败”，而不是“一炸到底”。

```javascript
function safeFetch(url: string) {
  return fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("🚨 网络异常：" + res.status);
      return res.json();
    })
    .catch(err => {
      console.error("❌ 请求失败：", err.message);
      return null;
    });
}
```

> 这是程序设计的浪漫之处：**错误不是耻辱，它是边界的提醒。**

#### 🌈 图示：防御性编程的护盾结构 ####

（手绘风格思维导图 🧠）

```txt
      🧩 TypeScript 防御性体系
                 │
       ┌─────────┴──────────┐
       │                    │
  编译期防线            运行时防线
（类型系统）          （逻辑验证）
       │                    │
  ┌────┴────┐         ┌────┴──────┐
  │ 类型守卫 │         │ Schema校验 │
  │ Never保障│         │ try-catch │
  └──────────┘         └───────────┘
```

### 🚀 六、结语：防御性编码是一种修行 ###

TypeScript 的强类型并不是牢笼，而是一套自我约束哲学。

它让你在开发的混沌世界中拥有可验证的确定性 —— *这不止是对Bug的防御，更是对混乱的抵抗。*

> 💡 “写防御性代码，不是因为你不信任别人，而是因为你尊重未知。”

## TypeScript 错误处理工具：优雅的 Result 模式实现 ##

### 前言 ###

在现代 JavaScript/TypeScript 开发中，错误处理一直是一个令人头疼的问题。传统的 `try-catch` 语句虽然功能强大，但往往会导致代码嵌套过深、可读性差，特别是在处理多层异步调用时。本文将介绍一个基于 Result 模式的错误处理工具，它借鉴了 Rust 语言的设计理念，为 TypeScript 项目提供了一种更加优雅和类型安全的错误处理方案。

### 什么是 Result 模式？ ###

Result 模式是一种函数式编程中的错误处理模式，它将操作的结果封装在一个联合类型中：

- 成功时包含结果值
- 失败时包含错误信息

这种模式的核心优势在于：

- 显式错误处理：强制开发者处理可能的错误情况
- 类型安全：编译时就能发现潜在的错误处理问题
- 函数式风格：支持链式调用和值转换
- 避免异常抛出：减少运行时异常的风险

### 核心设计 ###

#### Result 类型定义 ####

```typescript
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
```

这个联合类型是整个工具的核心，它明确区分了成功和失败两种状态：

- `T`：成功时的值类型
- `E`：错误类型，默认为 `Error`
- `ok` 字段：用于类型守卫，区分成功和失败状态

#### 安全执行函数 ####

**同步代码执行：safeRun**

```typescript
export function safeRun<T, E = Error>(fn: () => T): Result<T, E> {
    try {
        return { ok: true, value: fn() };
    } catch (error) {
        return { ok: false, error: error as E };
    }
}
```

`safeRun` 函数将任何可能抛出异常的同步函数包装成返回 Result 类型的安全函数。

使用示例：

```typescript
// 解析 JSON 字符串
const parseResult = safeRun(() => JSON.parse(jsonString));
if (parseResult.ok) {
    console.log('解析成功:', parseResult.value);
} else {
    console.error('解析失败:', parseResult.error);
}

// 数组访问
const getItemResult = safeRun(() => array[index]);
if (getItemResult.ok) {
    // 安全使用 getItemResult.value
}
```

**异步代码执行：to**

```typescript
export async function to<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
    try {
        return { ok: true, value: await promise };
    } catch (error) {
        return { ok: false, error: error as E };
    }
}
```

`to` 函数专门用于处理 Promise，将可能 reject 的 Promise 转换为返回 Result 的 Promise。

**使用示例**：

```typescript
// API 调用
const apiResult = await to(fetch('/api/users'));
if (apiResult.ok) {
    const response = apiResult.value;
    // 处理响应
} else {
    console.error('API 调用失败:', apiResult.error);
}

// 文件操作
const fileResult = await to(fs.readFile('config.json', 'utf8'));
if (fileResult.ok) {
    const content = fileResult.value;
    // 处理文件内容
}
```

#### ResultHandler 处理类 ####

`ResultHandler` 类提供了强大的链式操作能力，让错误处理变得更加灵活和优雅。

**map 方法：转换成功值**

```typescript
map<U>(fn: (value: T) => U): ResultHandler<U, E>
```

`map` 方法只在结果成功时执行转换函数，失败时直接传递错误。

使用示例：

```typescript
const result = new ResultHandler(parseResult)
    .map(data => data.users)           // 提取用户数组
    .map(users => users.length)        // 获取用户数量
    .map(count => `共有 ${count} 个用户`); // 格式化消息

if (result.get().ok) {
    console.log(result.get().value); // "共有 10 个用户"
}
```

**mapErr 方法：转换错误值**

```typescript
mapErr<F>(fn: (error: E) => F): ResultHandler<T, F>
```

`mapErr` 方法只在结果失败时执行转换函数，成功时直接传递值。

使用示例：

```typescript
const result = new ResultHandler(apiResult)
    .mapErr(error => ({
        code: 'API_ERROR',
        message: `API 调用失败: ${error.message}`,
        timestamp: new Date().toISOString()
    }));
```

**unwrap 方法：获取值或抛出异常**

```typescript
unwrap(): T
```

`unwrap` 方法用于获取成功的值，如果结果是失败状态，则抛出异常。

> 注意： 只有在确定结果一定成功时才使用此方法。

**get 方法：获取原始 Result**

```typescript
get(): Result<T, E>
```

`get` 方法返回原始的 Result 结构，用于最终的错误检查。

### 实际应用场景 ###

#### API 调用链 ####

```typescript
async function getUserProfile(userId: string) {
    const userResult = await to(fetchUser(userId));
    const profileResult = await to(fetchUserProfile(userId));
    
    return new ResultHandler(userResult)
        .map(user => ({ user }))
        .map(async data => {
            if (profileResult.ok) {
                return { ...data, profile: profileResult.value };
            }
            return data;
        })
        .mapErr(error => ({
            type: 'USER_FETCH_ERROR',
            message: `获取用户信息失败: ${error.message}`,
            userId
        }));
}
```

#### 数据验证和转换 ####

```typescript
function processUserInput(input: string) {
    return new ResultHandler(safeRun(() => JSON.parse(input)))
        .map(data => validateUserData(data))
        .map(userData => transformUserData(userData))
        .mapErr(error => ({
            field: 'user_input',
            message: '用户输入格式错误',
            originalError: error
        }));
}
```

#### 配置文件加载 ####

```typescript
async function loadConfig(configPath: string) {
    const fileResult = await to(fs.readFile(configPath, 'utf8'));
    
    return new ResultHandler(fileResult)
        .map(content => safeRun(() => JSON.parse(content)))
        .map(parseResult => {
            if (parseResult.ok) {
                return parseResult.value;
            }
            throw new Error('配置文件格式错误');
        })
        .map(config => validateConfig(config))
        .mapErr(error => ({
            configPath,
            error: error.message,
            suggestion: '请检查配置文件格式是否正确'
        }));
}
```

### 与传统错误处理的对比 ###

#### 传统 try-catch 方式 ####

```typescript
async function traditionalApproach(userId: string) {
    try {
        const user = await fetchUser(userId);
        try {
            const profile = await fetchUserProfile(userId);
            try {
                const settings = await fetchUserSettings(userId);
                return {
                    user,
                    profile,
                    settings
                };
            } catch (settingsError) {
                console.error('获取用户设置失败:', settingsError);
                return { user, profile };
            }
        } catch (profileError) {
            console.error('获取用户资料失败:', profileError);
            return { user };
        }
    } catch (userError) {
        console.error('获取用户失败:', userError);
        throw new Error('无法获取用户信息');
    }
}
```

#### Result 模式方式 ####

```typescript
async function resultApproach(userId: string) {
    const userResult = await to(fetchUser(userId));
    const profileResult = await to(fetchUserProfile(userId));
    const settingsResult = await to(fetchUserSettings(userId));
    
    return new ResultHandler(userResult)
        .map(user => ({ user }))
        .map(data => profileResult.ok ? { ...data, profile: profileResult.value } : data)
        .map(data => settingsResult.ok ? { ...data, settings: settingsResult.value } : data)
        .mapErr(error => ({
            type: 'USER_DATA_ERROR',
            message: '获取用户数据失败',
            details: error
        }));
}
```

### 最佳实践 ###

#### 错误类型定义 ####

为不同的错误场景定义具体的错误类型：

```typescript
interface ApiError {
    code: string;
    message: string;
    statusCode?: number;
}

interface ValidationError {
    field: string;
    message: string;
    value: any;
}

// 使用具体的错误类型
const apiResult: Result<User, ApiError> = await to(fetchUser(id));
```

#### 错误处理策略 ####

```typescript
function handleResult<T>(result: Result<T, any>) {
    if (result.ok) {
        return result.value;
    }
    
    // 根据错误类型采取不同的处理策略
    if (result.error.code === 'NETWORK_ERROR') {
        // 网络错误，可以重试
        return retryOperation();
    } else if (result.error.code === 'VALIDATION_ERROR') {
        // 验证错误，提示用户
        showValidationError(result.error);
    } else {
        // 其他错误，记录日志
        logger.error('Unexpected error:', result.error);
    }
}
```

#### 组合多个操作 ####

```typescript
async function complexOperation(data: InputData) {
    const step1 = await to(validateInput(data));
    if (!step1.ok) return step1;
    
    const step2 = await to(processData(step1.value));
    if (!step2.ok) return step2;
    
    const step3 = await to(saveResult(step2.value));
    return step3;
}
```

### 性能考虑 ###

Result 模式的性能开销主要来自：

- 对象创建：每次操作都会创建新的 Result 对象
- 类型检查：运行时需要检查 ok 字段

但这些开销通常是可以接受的，特别是考虑到它带来的类型安全和代码可维护性提升。

### 总结 ###

这个 TypeScript 错误处理工具通过引入 Result 模式，为项目提供了一种更加优雅、类型安全的错误处理方案。它的主要优势包括：

- 类型安全：编译时就能发现错误处理问题
- 可读性强：避免了深层嵌套的 try-catch 结构
- 函数式风格：支持链式调用和值转换
- 显式错误处理：强制开发者考虑错误情况
- 统一接口：所有操作都返回统一的 Result 类型

虽然这种模式需要一定的学习成本，但一旦掌握，它将大大提升代码的健壮性和可维护性。特别是在复杂的业务逻辑和异步操作处理中，Result 模式的优势会更加明显。
