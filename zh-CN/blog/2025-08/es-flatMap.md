---
lastUpdated: true
commentabled: false
recommended: false
title: Array.prototype.flatMap
description: Array.prototype.flatMap：数组 “扁平化 + 映射” 的高效组合拳
date: 2025-08-12 11:45:00 
pageClass: blog-page-class
cover: /covers/typescript.svg
---

在 JavaScript 数组处理中，我们经常需要先对每个元素进行转换（映射），再将结果 “铺平”（扁平化）。比如将数组中的每个字符串按空格拆分，然后合并成一个新数组。传统做法是先用 `map()` 转换，再用 `flat()` 扁平化，但这样会创建中间数组，影响效率。ES2019 引入的flatMap()方法，就像一套 “组合拳”，将映射和扁平化两步操作合并为一，既简洁又高效。今天，我们就来解锁这个提升数组处理效率的实用方法。

## 一、认识 flatMap ()：映射与扁平化的 “二合一” 工具 ##

`flatMap()` 是数组原型上的方法，它的作用可以概括为：*先对数组中的每个元素执行映射操作（类似 `map()` ），再对结果执行一层扁平化（类似 `flat(1)` ）*。简单说，`flatMap()` 等价于 `map()` followed by `flat(1)`，但性能更优。

### 与 map () + flat () 的对比 ###

```ts
const sentences = ["Hello world", "I love JavaScript", "flatMap is useful"];

// 方法1：map() + flat()
const words1 = sentences
  .map((sentence) => sentence.split(" ")) // 先映射：拆分成子数组
  .flat(); // 再扁平化：合并子数组

// 方法2：flatMap()
const words2 = sentences.flatMap((sentence) => sentence.split(" "));
console.log(words1); // ["Hello", "world", "I", "love", "JavaScript", "flatMap", "is", "useful"]
console.log(words2); // 同上，结果完全一致
```

两者结果相同，`但flatMap()` 只遍历一次数组，且不创建中间数组（ `map()` 的结果），因此在处理大型数组时性能更优。

### 基础语法：简洁的回调函数 ###

`flatMap()` 的语法与 `map()` 类似，接收一个回调函数和可选的 `this` 指向：

```ts
array.flatMap(callback(element[, index[, array]])[, thisArg])
```

- `callback`：对每个元素执行的函数，返回一个数组（或其他可迭代对象），该数组会被扁平化一层。
- `thisArg`：执行 `callback` 时的 `this` 值。
- 返回值：经过映射和扁平化后的新数组。

### 示例：将数组元素翻倍并拆分 ###

```ts
const numbers = [1, 2, 3];

// 映射：每个元素翻倍后放在数组中；扁平化：合并子数组
const result = numbers.flatMap((num) => [num * 2, num * 3]);
console.log(result); // [2, 3, 4, 6, 6, 9]
```

回调函数返回 `[num * 2, num * 3]`，`flatMap()` 会将这些子数组合并成一个数组。

## 二、核心特性：只扁平化一层的 “精准控制” ##

`flatMap()` 的扁平化能力是有限的 —— 它只会将映射结果扁平化一层，不会递归处理深层嵌套的数组。这一点与 `flat(depth)` 不同（ `flat()` 可指定深度），也是 `flatMap()` 的关键特性。

### 与 `flat ()` 不同的扁平化深度 ###

```ts
const arr = [1, [2, [3]], 4];

// flatMap()：只扁平化一层
const result1 = arr.flatMap((item) => {
  // 映射：原样返回元素（模拟不映射，只看扁平化效果）
  return item;
});

// flat(1)：同样扁平化一层
const result2 = arr.flat(1);

// flat(2)：扁平化两层
const result3 = arr.flat(2);

console.log(result1); // [1, 2, [3], 4]（仅扁平一层）
console.log(result2); // [1, 2, [3], 4]（与flatMap结果一致）
console.log(result3); // [1, 2, 3, 4]（深层扁平）
```

可以看到，`flatMap()` 的扁平化效果等价于 `flat(1)` ，无法处理深层嵌套。如果需要深层扁平化，仍需在 `flatMap()` 之后调用 `flat(depth)`。

### 过滤元素的 “小技巧” ###

利用 `flatMap()` 只扁平化一层的特性，我们可以在映射时返回空数组[]，实现 “过滤” 效果（空数组会被扁平化为空，相当于删除元素）：

```ts
const numbers = [1, 2, 3, 4, 5, 6];

// 保留偶数，过滤奇数（奇数返回空数组）
const evenNumbers = numbers.flatMap((num) => {
  return num % 2 === 0 ? [num] : [];
});

console.log(evenNumbers); // [2, 4, 6]
```

这比 `filter() + map()` 的组合更简洁 `（numbers.filter(num => num % 2 === 0).map(num => num)）`，且只遍历一次数组。

## 三、实战场景：`flatMap ()` 的高效应用 ##

`flatMap()` 在需要同时进行映射和扁平化的场景中表现出色，以下是几个典型案例：

### 拆分字符串并去重 ###

处理包含多个标签的字符串数组，拆分后去重：

```ts
const tagGroups = ["html,css", "javascript,html", "css,react"];

// 拆分所有标签并去重
const uniqueTags = [...new Set(tagGroups.flatMap((group) => group.split(",")))];

console.log(uniqueTags); // ["html", "css", "javascript", "react"]
```


- `flatMap()`先将每个字符串按,拆分，再合并成一个标签数组。
- 用 `Set` 去重后转回数组，实现高效处理。

### 生成新的对象数组 ###

将用户数组转换为 “用户名 - 邮箱” 对数组：

```ts
const users = [
  { name: "Alice", emails: ["alice@a.com", "alice.work@a.com"] },
  { name: "Bob", emails: ["bob@b.com"] },
];

// 生成 [{ name: "Alice", email: "alice@a.com" }, ...]
const userEmails = users.flatMap((user) =>
  user.emails.map((email) => ({ name: user.name, email: email }))
);

console.log(userEmails);

/*
[
 { name: "Alice", email: "alice@a.com" },
 { name: "Alice", email: "alice.work@a.com" },
 { name: "Bob", email: "bob@b.com" }
]
*/
```

`flatMap()` 先对每个用户映射出包含多个邮箱对象的数组，再合并成一个数组，避免了 `map()` 后额外的 `flat()` 操作。

### 处理树形结构数据 ###

将嵌套的评论数据 “铺平” 为一维数组：

```ts
const comments = [
  {
    id: 1,
    text: "第一条评论",
    replies: [
      { id: 11, text: "回复1" },
      { id: 12, text: "回复2" },
    ],
  },
  {
    id: 2,
    text: "第二条评论",
    replies: [],
  },
];

// 提取所有评论（包括回复）的id和text
const allComments = comments.flatMap((comment) => [
  // 先包含当前评论
  { id: comment.id, text: comment.text },
  // 再包含所有回复（会被扁平化）
  ...comment.replies.map((reply) => ({ id: reply.id, text: reply.text })),
]);

console.log(allComments);

/*
[
 { id: 1, text: "第一条评论" },
 { id: 11, text: "回复1" },
 { id: 12, text: "回复2" },
 { id: 2, text: "第二条评论" }
]
*/
```

通过 `flatMap()` 将嵌套的回复与主评论合并，一步完成映射和扁平化。

### 数据转换与过滤结合 ###

处理订单数据，提取有效商品并转换格式：

```ts
const orders = [
  { id: 1, products: ["apple", "banana"], valid: true },
  { id: 2, products: ["orange"], valid: false }, // 无效订单
  { id: 3, products: ["grape", "mango"], valid: true },
];

// 提取有效订单的商品，格式化为 { orderId, product }
const validProducts = orders.flatMap((order) => {
  // 过滤无效订单（返回空数组）
  if (!order.valid) return [];

  // 映射有效商品
  return order.products.map((product) => ({
    orderId: order.id,
    product: product,
  }));
});

console.log(validProducts);

/*
[
 { orderId: 1, product: "apple" },
 { orderId: 1, product: "banana" },
 { orderId: 3, product: "grape" },
 { orderId: 3, product: "mango" }
]
*/
```

一次遍历完成过滤和转换，效率高于 `filter() + map() + flat()` 的组合。

## 四、避坑指南：使用 `flatMap ()` 的注意事项 ##

### 不要期望深层扁平化 ###

`flatMap()` 只能扁平化一层，对于深层嵌套的数组，需要额外处理：

```ts
const deepArray = [1, [2, [3, [4]]]];

// 错误：flatMap()无法深层扁平化
const result1 = deepArray.flatMap((item) => item);
console.log(result1); // [1, 2, [3, [4]]]（仅扁平一层）

// 正确：先flatMap()再flat()
const result2 = deepArray.flatMap((item) => item).flat(2);
console.log(result2); // [1, 2, 3, 4]
```

### 回调函数需返回可迭代对象 ###

`flatMap()` 的回调函数应返回数组或其他可迭代对象（如 `字符串`、`Set` 等），否则会将返回值包装成数组再扁平化：

```ts
const numbers = [1, 2, 3];

// 回调返回非数组（数字）
const result = numbers.flatMap((num) => num * 2);
console.log(result); // [2, 4, 6]

// 等价于：[ [2], [4], [6] ].flat() → [2,4,6]
``

虽然返回非数组也能工作，但建议始终返回数组，明确意图。

### 性能考量：大型数组的处理 ###

`flatMap()` 比 `map() + flat()` 高效，但在处理超大型数组时，仍需注意：

- 免在回调函数中执行复杂操作（会增加单次迭代耗时）。
- 如需多次处理，考虑分批次处理（避免阻塞主线程）。

### 浏览器兼容性 ###

`flatMap()` 兼容所有现代浏览器（`Chrome 69+`、`Firefox 62+`、`Safari 12+`、`Edge 79+`），但 `IE` 完全不支持。如需兼容旧浏览器，可使用 Polyfill：

```ts
// flatMap()的简易Polyfill
if (!Array.prototype.flatMap) {
  Array.prototype.flatMap = function (callback, thisArg) {
    return this.map(callback, thisArg).flat(1);
  };
}
```

## 五、总结 ##

`flatMap()` 作为 `map()` 和 `flat(1)` 的组合，虽然功能看似简单，却在数组处理中有着不可替代的价值：

- **简洁高效**：一行代码完成映射和扁平化，减少中间数组创建。
- **灵活多用**：既能转换数据，又能过滤元素，还能处理嵌套结构。
- **性能更优**：比 `map()` + `flat()` 少一次遍历，适合大型数组。

在实际开发中，当你需要对数组元素进行转换并希望结果是一维数组时，`flatMap()` 往往是最佳选择。无论是处理字符串拆分、对象转换，还是嵌套数据铺平，它都能让代码更简洁、高效。

> 记住：好的工具能让复杂问题变简单，`flatMap()` 就是这样一个 “四两拨千斤” 的数组方法。下次处理数组时，不妨想想：这个场景能用 `flatMap()` 吗？

```echarts
{
  "xAxis": { "type": "category", "data": ["A", "B", "C", "D"] },
  "yAxis": { "type": "value" },
  "series": [
    {
      "name": "系列1",
      "type": "bar",
      "stack": "total",
      "data": [10, 20, 30, 40],
      "itemStyle": { "color": "#5470C6", "borderColor": "transparent", "borderWidth": 4 }
    },
    {
      "name": "间隙",
      "type": "bar",
      "stack": "total",
      "data": [2, 2, 2, 2],
      "itemStyle": { "color": "transparent" }
    },
    {
      "name": "系列2",
      "type": "bar",
      "stack": "total",
      "data": [15, 25, 35, 45],
      "itemStyle": { "color": "#91CC75", "borderColor": "transparent", "borderWidth": 4 }
    }
  ]
}
```

<script lang="ts" setup>
import { readonly } from "vue"
const dataList = [
  { name: 'Direct', data: [320, 332, 301, 334, 390, 330, 320] },
  { name: 'Email', data: [320, 332, 301, 334, 390, 330, 320] },
  { name: 'Union Ads', data: [320, 332, 301, 334, 390, 330, 320] },
  { name: 'Video Ads', data: [320, 332, 301, 334, 390, 330, 320] }
];

const option = readonly({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    }
  ],
  yAxis: [
    {
      type: 'value'
    }
  ],
  series: dataList.map((v) => ({
    ...v,
    type: 'bar',
    stack: 'Ad',
    itemStyle: {
      borderColor: 'transparent', // 设置透明边框
      borderWidth: 4 // 控制间隙高度
    }
  }))
})

</script>
