---
lastUpdated: true
commentabled: true
recommended: true
title: 🚀 12个TypeScript奇淫技巧你需要掌握😏😏😏
description: 🚀 12个TypeScript奇淫技巧你需要掌握😏😏😏
date: 2025-09-17 10:00:00 
pageClass: blog-page-class
cover: /covers/typescript.svg
---

话不多说，现在开启我们今天的前端丛林冒险之旅吧！

## Partial 深度递归版 ##

|  场景   |      更新一个嵌套对象，但只想传“任意深度”的片段 |
| :-----------: | :-----------: |
| 易错 | 原生  `Partial` 只擦一层，`{ address: { city: undefined } }` 会把外层 address 整个覆盖 |
| 进化 | 手写 `DeepPartial`，同时保留“数组”结构 |

```ts
// 工具
type DeepPartial<T> = T extends object
  ? T extends readonly any[]
    ? ReadonlyArray<DeepPartial<T[number]>>
    : { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

//  domain
interface User {
  id: number;
  profile: {
    name: string;
    avatar: { url: string; size: [number, number] };
  };
  tags: string[];
}

//  使用：只改头像宽度
const patch: DeepPartial<User> = {
  profile: { avatar: { size: [undefined, 128] } },
};

//  单元测试
function testDeepPartial() {
  const original: User = {
    id: 1,
    profile: { name: 'Tom', avatar: { url: 'a.png', size: [64, 64] } },
    tags: ['vip'],
  };
  const merged = merge(original, patch); // 手写 merge 或 lodash.merge
  console.assert(merged.profile.avatar.size[0] === 64); // 未被覆盖
  console.assert(merged.profile.avatar.size[1] === 128);
}
```

## Required 带“运行时检查” ##

|  场景   |      后端返沪配置字段全部可选，但前端初始化时必须补齐 |
| :-----------: | :-----------: |
| 进化 | 把 `Required` 丢给 `zod`，自动生成“运行时校验 + 类型” |

```ts
import { z } from 'zod';

const ConfigSchema = z.object({
  apiUrl: z.string().url(),
  timeout: z.number().int().positive(),
  retry: z.boolean(),
});

//  推导后全部是必填
type Config = z.infer<typeof ConfigSchema>; // Required<{apiUrl:string; timeout:number; retry:boolean}>

//  使用：本地 config.json 可能缺字段
function loadConfig(): Config {
  const raw = JSON.parse(readFileSync('./config.json', 'utf-8'));
  return ConfigSchema.parse(raw); // 缺字段会直接抛错
}
```

## Readonly 冻结“React 状态” ##

|  场景   |  把 Redux Toolkit 的 `state` 彻底锁死，防止误赋值 |
| :-----------: | :-----------: |
| 进化 | 结合 `immer` 的 `Draft` 类型，做到“写时复制、读时只读” |

```ts
import type { Draft } from 'immer';

interface State {
  user: { name: string };
  list: number[];
}

const initialState: Readonly<State> = {
  user: { name: 'Alice' },
  list: [1, 2, 3],
};

//  在 reducer 里只能改 Draft，外面拿到的是 Readonly
function reducer(state: Readonly<State>, action: any) {
  return produce(state, (draft: Draft<State>) => {
    draft.list.push(4); // ✅ 允许
  });
}

//  组件里
const state: Readonly<State> = useSelector(s => s);
state.list.push(5); // ❌ TS 报错：Property 'push' does not exist on readonly number[]
```

## `Pick<T,K>` 造“最小列”数据库查询 ##

|  场景   |  ORM 只查需要用到的列，减少网络传输 |
| :-----------: | :-----------: |
| 进化 | 把 `Pick` 做成“通用返回类型”，再配合 `sql tag` |

```ts
//  通用工具：指定列查询
type PickCol<T, K extends keyof T> = Pick<T, K>;

interface UserTable {
  id: number;
  name: string;
  password: string;
  createdAt: Date;
}

//  只查两列
async function getUserNames(): Promise<PickCol<UserTable, 'id' | 'name'>[]> {
  return sql<{ id: number; name: string }[]>`SELECT id, name FROM user`;
}

//  调用方永远拿不到 password
const list = await getUserNames();
list[0].password; // ❌ TS 报错
```

## `Omit<T,K>` 造“公有类型”同时保持单一代码源 ##

|  场景   |  同一个 User 实体，内部服务需要 `password`，开放给前端的 DTO |
| :-----------: | :-----------: |
| 进化 | 用 `Omit` 生成 PublicUser，但不手写第二份接口，保证“字段新增/删除”时两边同步 |

```ts
interface User {
  id: number;
  name: string;
  password: string;
  internalRemark: string;
}

//  所有对外接口都用 PublicUser
export type PublicUser = Omit<User, 'password' | 'internalRemark'>;

//  新增字段 email 时，只改 User，PublicUser 自动同步
```

## `Record<K,T>` 做“字典”时给 value 加“默认值函数” ##

|  场景   |  场景权限字典初始化时，希望缺失 key 自动兜底 |
| :-----------: | :-----------: |
| 进化 | 封装 `getWithDefault` 高阶函数，保持 Record 类型安全 |

```ts
type Role = 'admin' | 'user' | 'guest';
const defaultPerms = {
  admin: { read: true, write: true },
  user: { read: true, write: false },
  guest: { read: false, write: false },
} satisfies Record<Role, { read: boolean; write: boolean }>;

function getPerm<R extends Role>(r: R): Record<Role, typeof defaultPerms[R]> {
  return defaultPerms[r] ?? defaultPerms.guest;
}

//  使用
const p = getPerm('user');
p.write; // false
```

## Exclude & Extract 玩“可分配路线图” ##

|  场景   |  一个组件只接受部分颜色，需要把系统级颜色过滤出来 |
| :-----------: | :-----------: |
|  |  |

```ts
type SystemColor = 'red' | 'green' | 'blue' | 'yellow';
type AllowedColor = Extract<SystemColor, 'red' | 'green'>; // 'red' | 'green'
type DisallowedColor = Exclude<SystemColor, AllowedColor>; // 'blue' | 'yellow'

//  再进一步做运行时 map 检查
const COLOR_MAP: Record<AllowedColor, string> = {
  red: '#ff0000',
  green: '#00ff00',
};

function setColor(c: AllowedColor) {
  document.body.style.color = COLOR_MAP[c];
}
```

## NonNullable 与“空值断言”组合拳 ##

|  场景   |  场景数组查找后立刻使用，不想写一堆 `if` |
| :-----------: | :-----------: |
| 进化 | 封装“查找 or 抛”函数，返回 `NonNullable<T>` |

```ts
function findStrict<T, K extends keyof T>(
  arr: T[],
  key: K,
  value: T[K]
): NonNullable<T> {
  const item = arr.find(v => v[key] === value);
  if (!item) throw new Error(`Not found`);
  return item!; // ! 断言后类型擦除 null|undefined
}

//  使用
const users: ({ id: number; name: string } | null)[] = [
  { id: 1, name: 'A' },
  null,
];
const u = findStrict(users, 'id', 1); // 返回类型 {id:number; name:string}，null 被排除
```

## ReturnType + Parameters 做“函数装饰器”不改类型 ##

|  场景   |  给任意 `async` 函数加“自动重试”包裹，但保持原类型 |
| :-----------: | :-----------: |
|  |  |

```ts
function withRetry<F extends (...args: any[]) => Promise<any>>(fn: F) {
  return async (...args: Parameters<F>): Promise<ReturnType<F>> => {
    let lastErr: unknown;
    for (let i = 0; i < 3; i++) {
      try {
        return (await fn(...args)) as ReturnType<F>;
      } catch (e) {
        lastErr = e;
        await new Promise(r => setTimeout(r, 100 * 2 ** i));
      }
    }
    throw lastErr;
  };
}

//  使用：类型完全不变
const fetchUser = async (id: number) => ({ id, name: 'A' });
const safeFetch = withRetry(fetchUser);
//  safeFetch 签名仍是 (id:number)=>Promise<{id:number; name:string}>
```
 
## ConstructorParameters + InstanceType 造“通用工厂” ##

|  场景   |  写 DI 容器，需要根据“类”自动产生工厂函数 |
| :-----------: | :-----------: |
|  |  |

```ts
class Logger {
  constructor(public prefix: string) {}
  log(msg: string) {
    console.log(`[${this.prefix}] ${msg}`);
  }
}

//  通用工厂
function createFactory<T extends abstract new (...args: any) => any>(Cls: T) {
  return (...args: ConstructorParameters<T>): InstanceType<T> =>
    new Cls(...args);
}

//  使用
const makeLogger = createFactory(Logger);
const log = makeLogger('App'); // 类型自动推导为 Logger
log.log('started');
```

## `ThisParameterType` 给“方法链”锁上下文 ##

|  场景   |  jQuery 风格链式调用，确保 `this` 指向不被丢失  |
| :-----------: | :-----------: |
|  |  |

```ts
interface Query {
  where<K extends keyof User>(
    field: K,
    val: User[K]
  ): ThisParameterType<typeof where>;
}
function where(this: Query[], field: any, val: any) {
  return this.filter(u => u[field] === val);
}

const chain: Query & ThisParameterType<typeof where> = [] as any;
chain.where('name', 'Tom').where('age', 18); // 全程 this 被约束
```

## 组合技：API 返回 → 隐藏敏感 → 局部更新 → 深度合并 ##

把上面所有知识串一个完整案例：

```ts
//  1. 原始实体
interface User {
  id: number;
  name: string;
  password: string;
  profile: { avatar: { url: string }; bio: string };
}

//  2. 返回给前端的安全 DTO
type UserDto = Omit<User, 'password'>;

//  3. 更新时允许深度局部
type UserPatch = DeepPartial<UserDto>;

//  4. 实现：查 → 删敏感 → 合并 → 返
async function updateUser(id: number, patch: UserPatch): Promise<UserDto> {
  const raw = await db.user.findUnique({ where: { id } });
  if (!raw) throw new Error('404');
  const sanitized: UserDto = exclude(raw, ['password']); // 手写工具
  const merged = deepMerge(sanitized, patch);
  await db.user.update({ where: { id }, data: merged });
  return merged;
}
```

一键复制清单

|  技巧   |  一句话记忆  |
| :-----------: | :-----------: |
| DeepPartial | 更新嵌套对象，不丢兄弟字段 |
| Required + zod | 类型 & 运行时一次搞定 |
| Readonly + immer | 状态不可变，写时复制 |
| Pick 列 | 查多少返多少，带宽省 70% |
| Omit 敏感 | 同一份实体，对外自动脱敏 |
| Record 字典 | 枚举 key 全铺平，再配默认值函数 |
| Exclude/Extract | 联合类型做“白名单/黑名单” |
| NonNullable | 去掉 null，后面代码不再 ?. |
| ReturnType + Parameters | 装饰器、包裹器必备，类型零丢失 |
| ConstructorParameters + InstanceType | 工厂函数一行代码泛型化 |
| ThisParameterType | 方法链、库作者专用，防 this 丢失 |

把上面 12 组代码全部跑通，你就在项目中把 TypeScript 内置工具类型“吃干抹净”了。
