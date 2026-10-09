---
lastUpdated: true
commentabled: true
recommended: true
title: C#程序员的前端LINQ解决方案
description: 一个为前端而生的 TypeScript LINQ 风格集合操作库
date: 2026-07-09 10:05:00
pageClass: blog-page-class
cover: /covers/vue.svg
---

在前端项目里，我们几乎每天都在处理集合数据：表格列表、接口返回的数组、筛选条件、分页、分组统计、报表汇总、下拉选项、权限菜单、订单明细、库存数据。

原生 JavaScript 已经提供了 `map`、`filter`、`reduce`、`sort` 等方法，但当业务逻辑稍微复杂一点时，代码很容易变成这样：

```ts
const activeUsers = users
  .filter((user) => user.enabled)
  .filter((user) => user.age >= 18)
  .sort((a, b) => {
    const deptCompare = a.department.localeCompare(b.department)
    if (deptCompare !== 0) return deptCompare
    return b.score - a.score
  })
  .map((user) => ({
    id: user.id,
    label: `${user.department} - ${user.name}`
  }))
```

这还只是过滤、排序和映射。如果再加上分组、聚合、连接、去重、分页、集合差集，代码会越来越难读。

`linqable` 想解决的就是这个问题：用接近 C# LINQ 的链式写法，让前端集合处理更清晰、更稳定，也更适合 TypeScript 项目。

```ts
import { from } from 'linqable'

const activeUsers = from(users)
  .where((user) => user.enabled)
  .where((user) => user.age >= 18)
  .orderBy((user) => user.department)
  .thenByDescending((user) => user.score)
  .select((user) => ({
    id: user.id,
    label: `${user.department} - ${user.name}`
  }))
  .toArray()
```

## linqable 是什么

`linqable` 是一个 TypeScript first 的前端集合操作库。

它参考 C# LINQ 的 API 风格，为数组、`Iterable`、`Set`、`Map`、`NodeList` 等数据源提供统一的链式查询能力。

_它适合这些场景_：

- 后台管理系统中的表格筛选、排序、分页。
- 报表页面中的分组、聚合、统计。
- 接口数据清洗、格式转换、字段映射。
- 多个数据源之间的关联查询。
- 列表去重、交集、并集、差集处理。
- 前端页面里的轻量数据分析。

_它的设计目标很明确_：

- 零第三方运行时依赖。
- TypeScript 类型友好。
- API 简洁稳定。
- 尽量懒执行，减少不必要的中间数组。
- 自动融合常见的连续 `where()` / `select()` 链条，减少中间迭代层。
- 对数组、`NodeList` 等类数组数据保留下标访问能力，常见直达操作不用从头遍历。
- 对前端开发者常见业务足够顺手。
- 所有公开方法都有中文 JSDoc，编辑器悬浮即可看到说明。

## 安装

```bash
npm install linqable
```

也可以使用 pnpm 或 yarn：

```bash
pnpm add linqable
yarn add linqable
```

## 快速开始

```ts
import { from } from 'linqable'

type User = {
  id: number
  name: string
  age: number
  department: string
  score: number
}

const users: User[] = [
  { id: 1, name: 'Alice', age: 28, department: 'R&D', score: 95 },
  { id: 2, name: 'Bob', age: 17, department: 'Sales', score: 81 },
  { id: 3, name: 'Cathy', age: 33, department: 'R&D', score: 88 },
  { id: 4, name: 'David', age: 24, department: 'Sales', score: 92 }
]

const names = from(users)
  .where((user) => user.age >= 18)
  .orderBy((user) => user.department)
  .thenByDescending((user) => user.score)
  .select((user) => user.name)
  .toArray()

console.log(names)
// ["Alice", "Cathy", "David"]
```

你可以把 `from(users)` 理解为把普通数组包装成一个可链式查询的集合。中间操作会继续返回新的查询对象，最后通过 `toArray()`、`sum()`、`first()`、`count()` 等方法得到结果。

## 支持哪些数据源

`linqable` 不只支持数组。只要是 `Iterable` 或类数组对象，都可以使用 `from()` 包装。

```ts
import { from } from 'linqable'

from([1, 2, 3])
from(new Set([1, 2, 3]))
from(
  new Map([
    ['a', 1],
    ['b', 2]
  ])
)
from(document.querySelectorAll('li'))
```

`Map` 会被视为键值对序列：

```ts
const pairs = from(
  new Map([
    ['a', 1],
    ['b', 2]
  ])
).toArray()

// [["a", 1], ["b", 2]]
```

## 为什么不是继续写 `filter`/`map`/`reduce`

原生数组方法很好，但它们有几个常见问题：

第一，复杂业务会产生大量中间数组。

```ts
const result = users
  .filter((x) => x.enabled)
  .map((x) => x.orders)
  .flat()
  .filter((x) => x.status === 'paid')
  .map((x) => x.amount)
```

第二，多级排序写起来很繁琐。

```ts
users.sort((a, b) => {
  const dept = a.department.localeCompare(b.department)
  if (dept !== 0) return dept
  const score = b.score - a.score
  if (score !== 0) return score
  return a.name.localeCompare(b.name)
})
```

第三，分组、连接、集合运算不是原生数组 API 的强项。

比如你想做：

- 按部门分组。
- 每组统计人数、总薪资、平均薪资。
- 按总薪资倒序排序。
- 只保留前 5 个部门。

用 `linqable` 会自然很多：

```ts
const departmentReport = from(users)
  .groupBy((user) => user.department)
  .select((group) => ({
    department: group.key,
    count: group.values.length,
    totalSalary: from(group).sum((user) => user.salary),
    averageSalary: from(group).average((user) => user.salary)
  }))
  .orderByDescending((row) => row.totalSalary)
  .take(5)
  .toArray()
```

## 核心概念：转换、排序、分组、终结

linqable 的方法大致可以分成四类。

### 转换方法

转换方法会返回新的 Enumerable，可以继续链式调用。

```ts
from(users)
  .where((user) => user.enabled)
  .select((user) => user.name)
  .skip(10)
  .take(20)
  .toArray()
```

常见转换方法：

- `where`
- `select`
- `selectMany`
- `skip`
- `take`
- `skipWhile`
- `takeWhile`
- `concat`
- `append`
- `prepend`
- `reverse`
- `chunk`
- `zip`
- `defaultIfEmpty`

### 排序方法

支持多级排序：

```ts
const rows = from(users)
  .orderBy((user) => user.department)
  .thenByDescending((user) => user.score)
  .thenBy((user) => user.name)
  .toArray()
```

也支持自定义比较器：

```ts
const files = from(fileList)
  .orderBy(
    (file) => file.name,
    (a, b) => a.localeCompare(b, 'zh-CN')
  )
  .toArray()
```

### 分组和连接

分组：

```ts
const groups = from(orders)
  .groupBy((order) => order.status)
  .toArray()

for (const group of groups) {
  console.log(group.key, group.values)
}
```

连接：

```ts
const rows = from(users)
  .join(
    departments,
    (user) => user.departmentId,
    (department) => department.id,
    (user, department) => ({
      userName: user.name,
      departmentName: department.name
    })
  )
  .toArray()
```

分组连接：

```ts
const rows = from(users)
  .groupJoin(
    orders,
    (user) => user.id,
    (order) => order.userId,
    (user, matchedOrders) => ({
      name: user.name,
      orderCount: matchedOrders.count(),
      totalAmount: matchedOrders.sum((order) => order.amount)
    })
  )
  .toArray()
```

### 终结方法

终结方法会真正产生结果。

```ts
from(users).toArray()
from(users).count()
from(users).first()
from(users).sum((user) => user.salary)
from(users).average((user) => user.score)
from(users).toMap((user) => user.id)
from(users).toSet()
```

常见终结方法：

- `toArray`
- `toMap`
- `toSet`
- `forEach`
- `first`
- `firstOrDefault`
- `single`
- `singleOrDefault`
- `last`
- `lastOrDefault`
- `elementAt`
- `elementAtOrDefault`
- `sum`
- `average`
- `count`
- `any`
- `all`
- `contains`
- `min`
- `max`
- `minBy`
- `maxBy`
- `aggregate`

## 懒执行：更少的中间数组

`linqable` 会尽量懒执行。像 `where`、`select`、`skip`、`take` 这些方法不会立刻遍历数据源。

```ts
const query = from(users)
  .where((user) => user.enabled)
  .select((user) => user.name)

// 此时还没有真正遍历 users

const result = query.toArray()
// 到这里才开始执行
```

这意味着你可以先组合查询逻辑，最后再决定如何消费结果。

`take` 还会在拿到足够结果后停止读取数据源：

```ts
function* numbers() {
  for (let i = 1; i <= 100000; i += 1) {
    yield i
  }
}

const firstThreeEvenNumbers = from(numbers())
  .where((x) => x % 2 === 0)
  .take(3)
  .toArray()

// [2, 4, 6]
```

## where/select 融合：链式写法，不必为每一层付全部成本

链式 API 很好读，但朴素实现里，每个 `where()`、`select()` 都可能多包一层迭代器。链条越长，数据在内部管道里传递的层数就越多。

linqable 会针对最常见的过滤和映射链做融合：

```ts
const result = from(users)
  .where((user) => user.enabled)
  .where((user) => user.age >= 18)
  .select((user) => user.name)
  .select((name) => name.trim())
  .toArray()
```

大白话说，能合在一趟里做的过滤和映射，就尽量不要拆成好几趟内部管道。这样代码还是清楚的链式写法，但运行时少走一些中间层。

当前会优先优化这些常见组合：

- `where().where()`
- `where().select()`
- `select().select()`
- `where().where().select().select()` 这类组合链

如果回调需要索引，linqable 会回到普通懒迭代方式：

```ts
const rows = from(users)
  .where((user, index) => index > 0)
  .select((user, index) => ({ user, index }))
  .toArray()
```

这是为了保证 index 语义准确。比如 `where()` 的 index 和 `select()` 的 index 可能来自不同阶段，不能为了性能把它们混在一起。

## 数组和类数组：能直接拿，就不绕远路

数组、`NodeList`、`HTMLCollection` 这类数据都有一个共同点：它们知道自己的 `length`，也能通过下标直接取值。

linqable 会保留这个信息。就是如果数据已经像书架一样编好了号，取第 50000 本书时就直接去第 50000 个位置，不会从第一本开始一本本数。

```ts
const rows = from(largeArray)

rows.count() // 直接读取 length
rows.last() // 直接读取最后一个下标
rows.elementAt(50000) // 直接读取指定下标
rows.reverse() // 倒序按下标读取
```

这类优化只发生在语义明确的直达场景里。如果你写了 `where()`、`select()` 等转换，结果已经变成新的逻辑序列，linqable 会继续使用正常的懒迭代方式，保证结果不会因为快路径而变味。

## 场景一：表格筛选、排序、分页

前端后台系统最常见的场景之一就是表格处理。

```ts
import { from } from 'linqable'

type Product = {
  id: number
  name: string
  category: string
  price: number
  stock: number
  enabled: boolean
}

function queryProducts(
  products: Product[],
  keyword: string,
  category: string | undefined,
  pageIndex: number,
  pageSize: number
) {
  const query = from(products)
    .where((product) => product.enabled)
    .where((product) => product.name.includes(keyword))
    .where((product) => category === undefined || product.category === category)
    .orderBy((product) => product.category)
    .thenByDescending((product) => product.stock)
    .thenBy((product) => product.price)

  return {
    total: query.count(),
    rows: query
      .skip((pageIndex - 1) * pageSize)
      .take(pageSize)
      .toArray()
  }
}
```

这段代码很接近业务描述：

- 只看启用商品。
- 按关键词过滤。
- 按分类过滤。
- 按分类、库存、价格排序。
- 统计总数。
- 返回当前页。

## 场景二：销售报表分组统计

```ts
type Order = {
  id: number
  region: string
  status: 'paid' | 'pending' | 'refunded'
  amount: number
}

const orders: Order[] = [
  { id: 1, region: 'East', status: 'paid', amount: 120 },
  { id: 2, region: 'East', status: 'paid', amount: 80 },
  { id: 3, region: 'West', status: 'pending', amount: 50 },
  { id: 4, region: 'West', status: 'paid', amount: 200 },
  { id: 5, region: 'North', status: 'refunded', amount: 20 }
]

const report = from(orders)
  .where((order) => order.status === 'paid')
  .groupBy((order) => order.region)
  .select((group) => {
    const rows = from(group)

    return {
      region: group.key,
      orderCount: rows.count(),
      totalAmount: rows.sum((order) => order.amount),
      averageAmount: rows.average((order) => order.amount),
      maxOrder: rows.maxBy((order) => order.amount)
    }
  })
  .orderByDescending((row) => row.totalAmount)
  .toArray()
```

结果示例：

```ts
;[
  {
    region: 'West',
    orderCount: 1,
    totalAmount: 200,
    averageAmount: 200,
    maxOrder: { id: 4, region: 'West', status: 'paid', amount: 200 }
  },
  {
    region: 'East',
    orderCount: 2,
    totalAmount: 200,
    averageAmount: 100,
    maxOrder: { id: 1, region: 'East', status: 'paid', amount: 120 }
  }
]
```

## 场景三：关联用户、部门和订单

当页面需要把多个接口数据合并展示时，`join` 和 `groupJoin` 会很有用。

```ts
type User = {
  id: number
  name: string
  departmentId: number
}

type Department = {
  id: number
  name: string
}

type Order = {
  id: number
  userId: number
  amount: number
}

const userRows = from(users)
  .join(
    departments,
    (user) => user.departmentId,
    (department) => department.id,
    (user, department) => ({
      user,
      department
    })
  )
  .groupJoin(
    orders,
    (row) => row.user.id,
    (order) => order.userId,
    (row, userOrders) => ({
      userId: row.user.id,
      userName: row.user.name,
      departmentName: row.department.name,
      orderCount: userOrders.count(),
      totalAmount: userOrders.sum((order) => order.amount)
    })
  )
  .orderBy((row) => row.departmentName)
  .thenByDescending((row) => row.totalAmount)
  .toArray()
```

这类代码在前端 BFF、管理后台、数据看板里非常常见。使用链式 API 后，数据流会比散落的临时变量更清晰。

## 场景四：库存对账和集合运算

`union`、`intersect`、`except` 适合处理集合关系。

```ts
const warehouseA = ['A-1', 'B-1', 'C-1']
const warehouseB = ['B-1', 'D-1', 'E-1']
const discontinued = ['C-1', 'E-1']
const promoted = ['A-1', 'B-1', 'X-1']

const activeSkus = from(warehouseA)
  .union(warehouseB)
  .except(discontinued)
  .orderBy((sku) => sku)
  .toArray()

const promotedAndActive = from(activeSkus).intersect(promoted).toArray()

console.log(activeSkus)
// ["A-1", "B-1", "D-1"]

console.log(promotedAndActive)
// ["A-1", "B-1"]
```

如果要分批处理，还可以接上 `chunk` 和 `zip`：

```ts
const batches = from(activeSkus)
  .chunk(2)
  .zip(['morning', 'afternoon'], (skus, slot) => ({
    slot,
    skus
  }))
  .toArray()

// [
//   { slot: "morning", skus: ["A-1", "B-1"] },
//   { slot: "afternoon", skus: ["D-1"] },
// ]
```

## 场景五：展开嵌套数据

`selectMany` 可以把嵌套集合展平成一层。

```ts
const departments = [
  { name: 'R&D', members: ['Alice', 'Cathy'] },
  { name: 'Sales', members: ['Bob'] }
]

const memberNames = from(departments)
  .selectMany((department) => department.members)
  .toArray()

// ["Alice", "Cathy", "Bob"]
```

也可以保留父级信息：

```ts
const rows = from(departments)
  .selectMany(
    (department) => department.members,
    (department, member) => ({
      department: department.name,
      member
    })
  )
  .toArray()

// [
//   { department: "R&D", member: "Alice" },
//   { department: "R&D", member: "Cathy" },
//   { department: "Sales", member: "Bob" },
// ]
```

## 场景六：一个更完整的数据看板示例

下面这个例子把过滤、连接、分组、去重、展开、聚合、多级排序和分页串在一起，模拟一个区域销售看板。

```ts
import { from } from 'linqable'

const customers = [
  { id: 1, name: 'Alice', region: 'East', active: true },
  { id: 2, name: 'Bob', region: 'West', active: true },
  { id: 3, name: 'Cathy', region: 'East', active: false },
  { id: 4, name: 'David', region: 'North', active: true }
]

const orders = [
  { id: 101, customerId: 1, status: 'paid', amount: 120, items: ['book', 'pen'] },
  { id: 102, customerId: 1, status: 'paid', amount: 80, items: ['notebook'] },
  { id: 103, customerId: 2, status: 'pending', amount: 50, items: ['pen'] },
  { id: 104, customerId: 2, status: 'paid', amount: 200, items: ['bag', 'pen'] },
  { id: 105, customerId: 3, status: 'paid', amount: 300, items: ['laptop'] },
  { id: 106, customerId: 4, status: 'refunded', amount: 20, items: ['clip'] },
  { id: 107, customerId: 4, status: 'paid', amount: 30, items: ['paper'] }
]

const dashboard = from(customers)
  .where((customer) => customer.active)
  .join(
    from(orders).where((order) => order.status === 'paid'),
    (customer) => customer.id,
    (order) => order.customerId,
    (customer, order) => ({ customer, order })
  )
  .groupBy((row) => row.customer.region)
  .select((group) => {
    const rows = from(group)

    return {
      region: group.key,
      customers: rows
        .distinctBy((row) => row.customer.id)
        .select((row) => row.customer.name)
        .orderBy((name) => name)
        .toArray(),
      total: rows.sum((row) => row.order.amount),
      averageOrder: rows.average((row) => row.order.amount),
      orderCount: rows.count(),
      itemCount: rows.selectMany((row) => row.order.items).count(),
      topOrderId: rows.maxBy((row) => row.order.amount).order.id
    }
  })
  .orderByDescending((row) => row.total)
  .thenBy((row) => row.region)
  .take(10)
  .toArray()
```

结果会是类似这样的结构：

```ts
;[
  {
    region: 'East',
    customers: ['Alice'],
    total: 200,
    averageOrder: 100,
    orderCount: 2,
    itemCount: 3,
    topOrderId: 101
  },
  {
    region: 'West',
    customers: ['Bob'],
    total: 200,
    averageOrder: 200,
    orderCount: 1,
    itemCount: 2,
    topOrderId: 104
  },
  {
    region: 'North',
    customers: ['David'],
    total: 30,
    averageOrder: 30,
    orderCount: 1,
    itemCount: 1,
    topOrderId: 107
  }
]
```

这段代码的重点不是“少写几行”，而是让数据处理流程更像业务说明：活跃客户、已支付订单、按区域分组、统计指标、排序、取前几条。

## 默认值与错误行为

linqable 区分“必须存在”和“可以不存在”的场景。

如果你确定一定有元素，可以使用：

```ts
from(users).first()
from(users).single((user) => user.id === 1)
from(users).last()
from(users).elementAt(0)
```

如果你希望找不到时返回默认值，可以使用：

```ts
from(users).firstOrDefault(undefined)
from(users).singleOrDefault(undefined, (user) => user.id === 1)
from(users).lastOrDefault(undefined)
from(users).elementAtOrDefault(10, fallbackUser)
```

聚合时也有清晰的错误行为：

```ts
from([]).average() // 空序列会抛错
from([]).min() // 空序列会抛错
from([]).max() // 空序列会抛错
```

这种设计让代码语义更明确：到底是“必须有”，还是“没有也可以”。

## 转换成原生集合

最后通常需要把查询结果交给 UI 组件、缓存、状态管理或其他函数。

```ts
const array = from(users).toArray()
const set = from(users)
  .select((user) => user.department)
  .toSet()
const map = from(users).toMap((user) => user.id)
```

也可以指定 Map 的值：

```ts
const nameMap = from(users).toMap(
  (user) => user.id,
  (user) => user.name
)
```

如果序列本身就是键值对，可以直接转成 Map：

```ts
const map = from([['a', 1] as const, ['b', 2] as const]).toMap()
```

## API 总览

入口：

- `from`
- `empty`

筛选和映射：

- `where`
- `select`
- `selectMany`

排序：

- `orderBy`
- `thenBy`
- `orderByDescending`
- `thenByDescending`
- `reverse`

分组和连接：

- `groupBy`
- `join`
- `groupJoin`

去重和集合运算：

- `distinct`
- `distinctBy`
- `union`
- `intersect`
- `except`

分页和切片：

- `skip`
- `take`
- `skipWhile`
- `takeWhile`
- `chunk`

聚合和判断：

- `sum`
- `average`
- `count`
- `any`
- `all`
- `contains`
- `min`
- `max`
- `minBy`
- `maxBy`
- `aggregate`

元素获取：

- `first`
- `firstOrDefault`
- `single`
- `singleOrDefault`
- `last`
- `lastOrDefault`
- `elementAt`
- `elementAtOrDefault`
- `defaultIfEmpty`

序列组合：

- `concat`
- `append`
- `prepend`
- `zip`

物化输出：

- `toArray`
- `toMap`
- `toSet`
- `forEach`

## 方法速查表

下面是常用方法的用途和最小示例，适合在文章中作为快速参考。

| 方法                                       | 用途                     | 示例                                                             |
| :----------------------------------------- | :----------------------- | :--------------------------------------------------------------- |
| `from(source)`                             | 创建查询对象             | `from(users)`                                                    |
| `empty(t)`                                 | 创建空序列               | `empty(number)`                                                  |
| `where(predicate)`                         | 过滤元素                 | `from(users).where((x) => x.enabled)`                            |
| `select(selector)`                         | 映射元素                 | `from(users).select((x) => x.name)`                              |
| `selectMany(selector)`                     | 展开嵌套集合             | `from(groups).selectMany((x) => x.items)`                        |
| `groupBy(keySelector)`                     | 分组                     | `from(users).groupBy((x) => x.department)`                       |
| `orderBy(selector)`                        | 升序排序                 | `from(users).orderBy((x) => x.name)`                             |
| `thenBy(selector)`                         | 追加升序排序             | `query.orderBy((x) => x.group).thenBy((x) => x.name)`            |
| `orderByDescending(selector)`              | 降序排序                 | `from(users).orderByDescending((x) => x.score)`                  |
| `thenByDescending(selector)`               | 追加降序排序             | `query.orderBy((x) => x.group).thenByDescending((x) => x.score)` |
| `distinct()`                               | 按值去重                 | `from([1, 1, 2]).distinct()`                                     |
| `distinctBy(selector)`                     | 按键去重                 | `from(users).distinctBy((x) => x.id)`                            |
| `first()`                                  | 获取第一个元素           | `from(users).first()`                                            |
| `firstOrDefault(defaultValue)`             | 获取第一个元素或默认值   | `from(users).firstOrDefault(undefined)`                          |
| `single(predicate)`                        | 获取唯一匹配元素         | `from(users).single((x) => x.id === id)`                         |
| `singleOrDefault(defaultValue, predicate)` | 获取唯一匹配元素或默认值 | `from(users).singleOrDefault(undefined, (x) => x.id === id)`     |
| `last()`                                   | 获取最后一个元素         | `from(users).last()`                                             |
| `lastOrDefault(defaultValue)`              | 获取最后一个元素或默认值 | `from(users).lastOrDefault(undefined)`                           |
| `elementAt(index)`                         | 获取指定索引元素         | `from(users).elementAt(0)`                                       |
| `elementAtOrDefault(index, defaultValue)`  | 获取指定索引元素或默认值 | `from(users).elementAtOrDefault(10, fallback)`                   |
| `sum(selector)`                            | 求和                     | `from(users).sum((x) => x.amount)`                               |
| `average(selector)`                        | 平均值                   | `from(users).average((x) => x.amount)`                           |
| `count(predicate)`                         | 计数                     | `from(users).count((x) => x.enabled)`                            |
| `any(predicate)`                           | 是否存在元素             | `from(users).any((x) => x.enabled)`                              |
| `all(predicate)`                           | 是否全部满足条件         | `from(users).all((x) => x.enabled)`                              |
| `contains(value)`                          | 是否包含元素             | `from(ids).contains(1)`                                          |
| `min()`                                    | 最小值                   | `from(numbers).min()`                                            |
| `max()`                                    | 最大值                   | `from(numbers).max()`                                            |
| `minBy(selector)`                          | 按键取最小元素           | `from(users).minBy((x) => x.age)`                                |
| `maxBy(selector)`                          | 按键取最大元素           | `from(users).maxBy((x) => x.score)`                              |

## 和 C# LINQ 的关系

linqable 借鉴的是 C# LINQ 的思路，而不是完全复制。

它保留了前端开发者更熟悉的 JavaScript / TypeScript 使用方式：

- 使用箭头函数作为选择器和谓词。
- 输出原生 `Array`、`Map`、`Set`。
- 支持任意 `Iterable`。
- 类型声明面向 TypeScript 编辑器提示优化。
- 不引入运行时依赖，不改变原始数据。

如果你写过 C# LINQ，会觉得它很自然。如果你没写过，也可以把它当作一组更完整、更统一的数组处理工具。

## 适合什么时候使用

适合：

- C# 开发者写前端代码
- 前端开发者想学C#代码
- 前端页面中有较多列表处理逻辑。
- 管理后台、数据看板、报表页面。
- 需要频繁做分组、聚合、排序、分页。
- 想把复杂的数组处理逻辑写得更可读。
- 希望 TypeScript 类型提示更完整。

不一定适合：

- 只做一两个简单的 `map` 或 `filter`。
- 数据规模非常大且需要专门的数据处理引擎。
- 已经使用数据库、后端查询语言或专门分析工具完成所有聚合。

## 项目质量

linqable 当前具备这些工程保障：

- TypeScript 编写。
- 生成 `.d.ts` 类型声明。
- 零第三方运行时依赖。
- Node.js 内置测试运行器测试发布产物。
- 覆盖每个公开方法的测试示例。
- 包含复杂链式调用测试。
- 针对 `where()` / `select()` 融合链、索引回退、懒执行和短路行为有测试覆盖。
- 针对数组和类数组的 `count()`、`last()`、`elementAt()`、`reverse()` 有下标快路径测试。
- 支持 `pnpm run typecheck`、`pnpm run test`、`pnpm run build`。
- README 可直接作为 npmjs 展示文档。

## 一个简单结论

如果你的前端项目里经常出现这样的代码：

```ts
data
  .filter(...)
  .map(...)
  .sort(...)
  .reduce(...)
```

并且你开始觉得分组、聚合、连接、去重、分页越来越难维护，那么可以试试 linqable。

它不是为了替代所有数组 API，而是给复杂集合处理提供一套更完整、更清晰、更接近业务语义的表达方式。

```ts
import { from } from "linqable";

const result = from(data)
  .where(...)
  .groupBy(...)
  .select(...)
  .orderByDescending(...)
  .take(...)
  .toArray();
```

让前端数据处理，从“堆数组方法”，变成一条可读的查询链。
