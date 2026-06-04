---
lastUpdated: true
commentabled: true
recommended: true
title: 让数组操作更优雅：深挖Array.from
description: 让数组操作更优雅：深挖Array.from
date: 2024-11-26 13:18:00
pageClass: blog-page-class
---

# 让数组操作更优雅：深挖Array.from #

在日常的前端开发中，我们经常需要对数据进行转换、处理。在面对**类数组对象**和**可迭代对象**的处理时， 我们的 `forEach`、`map`等常用的数组方法似乎显得有些吃力。比如，我们处理 `document.querySelectorAll` 返回的 `NodeList` **类数组对象集合**，用`forEach`就是为难自己。这时候，`Array.from` 就能派上用场，帮助我们以更优雅的方式实现需求。


## Array.from 是什么 ##

`Array.from` 是一个静态方法，用于从以下数据类型生成数组：

- **类数组对象**： 包含 `length` 属性的对象，例如 `arguments`。
- **可迭代对象**： 可以被迭代的对象，例如 `Map`、`Set` 或 `String` 对象。

### 类数组对象与可迭代对象的区别 ###

| 特性      | 类数组对象 | 可迭代对象     |
| :---        |    :----:   |          ---: |
| 核心特征      | 拥有 length属性和索引键       | 实现了 [Symbol.iterator] 方法   |
| 是否支持迭代   | 不支持（for...of无法遍历）        | 支持（for...of可遍历）      |
| 是否具备数组方法      | 否 | 不一定，具体视对象而定常见     |
| 例子      | arguments、NodeList | Array、String、Set、Map     |

### Array.from语法 ###

```js
Array.from(arrayLike, mapFn, thisArg);
```

| 参数      | 描述 | 备注     |
| :---        |    :----:   |          ---: |
| arrayLike      | 必须。类数组对象或可迭代对象。 |      |
| mapFn      | 可选。对每个元素调用的映射函数，相当于 Array.prototype.map。 |      |
| thisArg      | 可选。指定 mapFn 中 this 的值。 |      |

## 基本用法 ##

### 字符串转数组 ###

字符串是**可迭代对象**，`Array.from` 可以将其直接转换为字符数组：

```js
const str = "快乐就是哈哈哈";
const charArray = Array.from(str);
console.log(charArray); // ['快', '乐', '就', '是', '哈', '哈', '哈']
```

### 将 arguments 转换为数组 ###

函数中的 `arguments` 是**类数组对象**，用 `Array.from` 可以轻松转为数组，方便操作：

```js
function toArray() {
  const argsArray = Array.from(arguments);
  console.log(argsArray);
}
toArray("你好", "我是", "快乐就是哈哈哈"); // ["你好", "我是", "快乐就是哈哈哈"]
```

`arguments` 是 JavaScript 函数中一个内置的类数组对象，它包含了函数调用时传入的所有参数。即使函数没有定义参数，`arguments` 也可以捕获调用时的所有传参。

### 从集合（Set）或映射（Map）中生成数组 ###

```js
const set = new Set(["马龙", "樊振东", "许昕"]);
console.log(Array.from(set)); // ['马龙', '樊振东', '许昕']

// 使用中国的地名及其相关信息创建一个Map对象
const map = new Map([
  ["北京", "中国的首都"],
  ["西安", "我家"],
  ["XX", "你家"]
]);
console.log(Array.from(map)); // [['北京', '中国的首都'], ['西安', '我家'], ['XX', '你家']]
```

## mapFn 的妙用 ##

`Array.from` 提供了一个映射函数 `mapFn`，可以在生成数组时直接对元素进行处理。

### 对数据进行包装 ###

```js
const nums = [1, 2, 3, 4];
const squares = Array.from(nums, num => num ** 2);
console.log(squares); // [1, 4, 9, 16]
```

### 从字符串中提取 ASCII 码 ###

```js
const chars = "ABC";
const asciiCodes = Array.from(chars, char => char.charCodeAt(0));
console.log(asciiCodes); // [65, 66, 67]
```

### 动态生成范围数组 ###

通过 `mapFn`，我们可以快速生成一个特定范围的数组：

```js
const range = (start, end) => Array.from(
  { length: end - start + 1 }, 
  (_, i) => start + i
);
console.log(range(5, 10)); // [5, 6, 7, 8, 9, 10]
```

上述代码中，我们使用 `{ length: end - start + 1 }` **创建了一个指定长度的类数组对象**。

使用对象字面量 `{ length: ... }` 创建一个类数组对象，其长度为 `end - start + 1`，表示范围内数字的总数。

## 超实用场景 ##

### 去除数组中的空值 ###

`Array.from` 可以配合 `filter` 清理数据：

```js
const rawData = [1, , 2, null, 3, undefined, 4];
const cleanedData = Array.from(rawData, item => item || 0);
console.log(cleanedData); // [1, 0, 2, 0, 3, 0, 4]
```

### 批量操作dom ###

将 DOM 查询结果转换为数组，便于使用数组方法：

```js
const divs = document.querySelectorAll("div");
const divArray = Array.from(divs);
console.log(divArray); // [div, div, div, ...]
```

### 结合Set实现去重效果 ###

利用 `Set` 去重后，再通过 `Array.from` 转为数组：

```js
const nums = [1, 2, 2, 3, 4, 4];
const uniqueNums = Array.from(new Set(nums));
console.log(uniqueNums); // [1, 2, 3, 4]
```

上述代码的去重原理如下：

- 使用 ****Set****去重：
  - Set 是一个集合数据结构，它不允许有重复的值。
  - 当我们将一个数组（如 nums）转换为 Set 时，Set 会自动去除数组中的重复元素。
- 转换回数组：
  - 由于 Set 不是数组，如果我们需要得到一个数组形式的结果，可以使用 Array.from 方法将 Set 转换回数组。

当然，不使用Array.from也可以实现：

```js
const nums = [1, 2, 2, 3, 4, 4];
const uniqueNums = [...new Set(nums)]; // 也可以使用扩展运算符(...)代替Array.from
console.log(uniqueNums); // [1, 2, 3, 4]
```

## 结语 ##

**Array.from** 是一个灵活且功能强大的工具，能轻松将类数组或可迭代对象转化为数组，还可以通过映射函数完成各种复杂的处理。在处理字符串、DOM 集合、范围生成和数据去重时，它能让代码更加优雅、简洁。
