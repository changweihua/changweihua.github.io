---
lastUpdated: true
commentabled: true
recommended: true
title: 告别数组冗余
description: 解锁 7 种高效数组去重的花式玩法
date: 2026-07-10 10:15:00
pageClass: blog-page-class
cover: /covers/html5.svg
---

在前端开发中，数组去重是高频出现的基础需求，从简单的业务数据处理到复杂的算法场景，干净的无重复数组总能让数据处理更高效。你还在只用一种方法做数组去重吗？本文将结合实战代码，拆解 6 种不同思路的数组去重方案，从时间复杂度 O (n²) 到 O (n)，从基础遍历到巧用 ES6 新特性，带你吃透数组去重的底层逻辑。

## 基础校验：数组去重的 “前置必修课”

无论哪种去重方案，参数校验都是提升代码健壮性的关键。因为传入的参数可能不是数组，若直接操作会导致代码报错。我们统一使用 `Array.isArray()` 做数组校验，非数组参数直接返回空数组并提示类型错误：

```javascript
if (!Array.isArray(arr)) {
  console.log('type error')
  return []
}
```

这一步是所有去重函数的基础，能避免因参数类型错误导致的程序崩溃。

## 暴力美学：双层循环去重（O (n²)）

这是最基础的去重思路，核心是 “双重遍历比对”，也是理解数组去重的入门案例：

```js
function unique(arr) {
  // 第一步：参数校验
  if (!Array.isArray(arr)) {
    console.log('type error')
    return []
  }
  // 初始化结果数组，默认放入第一个元素
  let res = [arr[0]]
  // 外层循环遍历原数组（从第二个元素开始）
  for (let i = 1; i < arr.length; i++) {
    let flag = true // 标记当前元素是否重复
    // 内层循环遍历结果数组，比对是否重复
    for (let j = 0; j < res.length; j++) {
      if (arr[i] === res[j]) {
        flag = false // 发现重复，标记为false
        break // 跳出内层循环，无需继续比对
      }
    }
    // 未重复则加入结果数组
    if (flag) {
      res.push(arr[i])
    }
  }
  return res
}
console.log(unique([1, 2, 3, 2, 5])) // 输出：[1,2,3,5]
```

解析：

- 时间复杂度：O (n²)，双层循环嵌套，数据量越大效率越低；
- 核心逻辑：用结果数组 “兜底”，逐个比对原数组元素，未出现过的才加入；

优点：逻辑简单，无 API 依赖，适合新手理解去重本质；

缺点：效率低，不适用于大数据量数组。

## 巧用 indexOf：单层循环去重（O (n²)）

基于 `indexOf` 的特性（找到元素返回下标，未找到返回 - 1），简化单层循环的比对逻辑：

```javascript
function unique(arr) {
  const res = []
  if (!Array.isArray(arr)) {
    console.log('type error')
    return []
  }
  for (let i = 0; i < arr.length; i++) {
    // 若结果数组中无当前元素，则加入
    if (res.indexOf(arr[i]) === -1) {
      res.push(arr[i])
    }
  }
  return res
}
```

解析：

- 时间复杂度：看似单层循环，但 `indexOf` 内部本质也是遍历，实际仍为 O (n²)；
- 核心逻辑：用 `indexOf` 替代内层循环，判断元素是否已存在于结果数组；

优点：代码更简洁，减少手动循环嵌套；

缺点：效率仍不高，和双层循环属于同一复杂度等级。

## filter 过滤：声明式去重（O (n²)）

利用数组 `filter` 方法的 “过滤特性”，结合 `indexOf` 实现声明式去重：

```javascript
function unique(arr) {
  if (!Array.isArray(arr)) {
    console.log('type error')
    return []
  }
  // filter返回满足条件的元素：元素第一次出现的下标等于当前下标
  return Array.prototype.filter.call(arr, function (item, index) {
    return arr.indexOf(item) === index
  })
}
```

解析：

- 时间复杂度：O (n²)（`filter`遍历 + `indexOf`遍历）；
- 核心逻辑：`indexOf(item)` 返回元素第一次出现的下标，若和当前下标 `index` 一致，说明是首次出现，保留该元素；若不一致，说明是重复元素，过滤掉；

优点：代码极简，符合声明式编程风格；

缺点：效率无提升，且无法直接兼容非数组类数组对象（需用 `call` 绑定 `this`）。

## 先排序再去重：降维时间复杂度（O (nlogn)）

先通过 `sort()` 排序（时间复杂度 O (nlogn)），再比对相邻元素，将整体复杂度从 O (n²) 降到 O (nlogn)：

```javascript
function unique(arr) {
  if (!Array.isArray(arr)) {
    console.log('type error')
    return []
  }
  // 先排序，让重复元素相邻
  arr = arr.sort()
  let res = [arr[0]] // 初始化结果数组
  for (let i = 1; i < arr.length; i++) {
    // 相邻元素不同则保留
    if (arr[i] !== arr[i - 1]) {
      res.push(arr[i])
    }
  }
  return res
}
```

解析：

- 时间复杂度：O (nlogn)（排序的核心复杂度）；
- 核心逻辑：排序后重复元素会相邻，只需比对当前元素和前一个元素是否相同；

优点：效率优于前三种方法，适合中等数据量数组；

缺点：排序会改变原数组顺序，若需保留原数组顺序则不适用。

## 空间换时间：对象哈希表去重（O (n)）

利用 JavaScript 对象的 “键唯一性”，实现 O (n) 时间复杂度的高效去重（空间换时间思想）：

```javascript
function unique(arr) {
  if (!Array.isArray(arr)) {
    console.log('type error')
    return []
  }
  let res = [],
    obj = {} // 用对象模拟HashMap，存储已出现的元素
  for (let i = 0; i < arr.length; i++) {
    // 若对象中无当前元素的键，则加入结果数组
    if (!obj[arr[i]]) {
      res.push(arr[i])
      obj[arr[i]] = 1 // 标记为已出现
    } else {
      obj[arr[i]]++ // 重复元素，计数+1（可选）
    }
  }
  return res
}
```

解析：

- 时间复杂度：O (n)，仅需遍历一次数组，对象的键查找是 O (1)；
- 核心逻辑：将数组元素作为对象的键，利用键的唯一性快速判断是否重复；

优点：效率最高，适合大数据量数组；

缺点：占用额外空间（对象存储），且对特殊类型（如 NaN、对象）处理有局限（需额外兼容）。

## ES6 新特性：Set 数据结构去重（O (n)）

ES6 新增的 `Set` 是专门的 “无重复值集合”，结合扩展运算符 `...` 可一行实现去重：

```javascript
function unique(arr) {
  if (!Array.isArray(arr)) {
    console.log('type error')
    return []
  }
  return [...new Set(arr)]
}
```

解析：

- 时间复杂度：O (n)，Set 的底层实现类似 HashMap，查找效率为 O (1)；
- 核心逻辑：`new Set(arr)`会自动过滤重复元素，扩展运算符将 Set 转回数组；

优点：代码极简，原生支持，效率高，且能兼容更多类型（如 NaN）；

缺点：依赖 ES6 环境（现代浏览器 / Node.js 已全面支持，低版本需转译）。

## 总结：不同场景的去重方案选型

| 方法             | 时间复杂度 | 优点                 | 缺点               | 适用场景               |
| :--------------- | :--------- | :------------------- | :----------------- | :--------------------- |
| 双层循环         | O(n²)      | 逻辑简单，无依赖     | 效率低             | 新手学习、小数据量     |
| indexOf 单层循环 | O(n²)      | 代码简洁             | 效率低             | 小数据量、追求代码简洁 |
| filter+indexOf   | O(n²)      | 声明式编程，极简     | 效率低、改变 this  | 小数据量、函数式编程   |
| 排序 + 相邻比对  | O(n log n) | 效率优于 O(n²)       | 改变数组顺序       | 中等数据量、无需保存   |
| 对象哈希表       | O(n)       | 效率最高             | 占用空间、兼容局限 | 大数据量、性能优先     |
| Set 数据结构     | O(n)       | 极简、原生、兼容性好 | 依赖 ES6           | 现代环境、全场景       |

数组去重看似简单，实则是对 “时间复杂度、空间复杂度、API 运用、代码健壮性” 的综合考察。在实际开发中，优先选择 `Set`（简洁高效）或对象哈希表（极致性能），特殊场景（如低版本环境、需保序）可灵活选择排序或 `indexOf` 方案。记住：好的代码不仅能完成功能，更要兼顾效率、可读性和健壮性
