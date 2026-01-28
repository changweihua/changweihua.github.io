---
lastUpdated: true
commentabled: true
recommended: true
title: ES7、ES8、ES9、ES10、ES11、ES12新特性
description: ES7、ES8、ES9、ES10、ES11、ES12新特性
date: 2026-01-28 10:30:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

## ES7 新特性 ##

### `​Array.prototype.includes`​​ ###

用于判断数组是否包含特定元素，替代传统的 `indexOf` 检查，返回布尔值更直观。

#### 基本语法与功能 ####

- 语法​​：`arr.includes(searchElement, fromIndex)`
  - `searchElement`：需要查找的元素值；`fromIndex`（可选）：起始搜索的索引位置，默认为 0。
  - 返回值​​：布尔值（`true` 表示包含，`false` 表示不包含）

```js
[1, 2, 3].includes(2);      // true
[1, 2, 3].includes(4);      // false
[1, 2, NaN].includes(NaN); // true（正确处理 NaN）
```

- 参数 `fromIndex` 的详细规则​​

  - 正值​​：从指定索引开始向后搜索

  ```js
  [1, 2, 3].includes(3, 3); // false（从索引 3 开始，超出范围）
  ```

  - 负值​​：转换为 数组长度 + `fromIndex`，若结果仍为负数则从头开始搜索

  ```js
  ['a', 'b', 'c'].includes('a', -100); // true（等效于从索引 0 开始）
  ['a', 'b', 'c'].includes('a', -2);   // false（等效于从索引 1 开始）
  ```

  - ​超出数组长度​​：直接返回 `false`，不执行搜索

  ```js
  ['a', 'b', 'c'].includes('c', 100); // false[1,2]
  ```

### 指数运算符 ##

- 简化幂运算，替代 `Math.pow()`，提升代码可读性

```js
2 ** 3; // 8（等价于 Math.pow(2, 3)）
10 ** -2;   // 0.01
let num = 3;
num **= 2;  // num = 9
```

## ES8 新特性 ##

### `​Object.values()` 和 `Object.entries()` ###

- `Object.values()`：返回对象自身可枚举属性值的数组

```js
const obj = { a: 1, b: 2, c: 3 };
Object.values(obj); // [1, 2, 3] // 获取对象的值
Object.keys(obj); // ['a', 'b', 'c'] 获取对象的键名

// 用的非常少
console.log(Object.values(["abc", "cba", "nba"]))
console.log(Object.values("abc"))
```

- `Object.entries()` ：返回一个包含对象自身可枚举属性键值对的数组，每个键值对是一个 `[key, value]` 数组。

```js
const user = {
  name: 'Bob',
  age: 25,
  profession: 'Developer'
};

const entries = Object.entries(user);
console.log(entries);
/* 输出: 
[
  ["name", "Bob"],
  ["age", 25],
  ["profession", "Developer"]
]
*/
```

### 字符串填充方法​ `String.prototype.padStart()` 和 `String.prototype.padEnd()`

- 字符串填充（String Padding）主要是指两个字符串操作方法：`padStart` 和 `padEnd` 方法，分别是对字符串的首尾进行填充的

  - 主要用在某些字符串我们需要对其进行前后的填充，来实现某种格式化效果

  - 该两种方法都是来自String原型上的方法，所以可以在任何字符串后进行.符号调用和连续链式调用

  ```js
  '5'.padStart(3, '0'); // 开头填充 → "005"
  '5'.padEnd(3, '0');   // 结尾填充 → "500"
  //padStart:位数不够往前填充，第一个值填所需位数，第二个值填当位数不够时的填充内容
    const minute = "2".padStart(2,"0")
    //padEnd:位数不够往后填充
    const second = "1".padEnd(2,"0")
    console.log(`${minute}:${second}`);//02:10
    //连续链式调用
    const minute = "2".padStart(2,"0").padEnd(3,"0")//020
  ```

#### 常见使用场景​​ ####

```js
// 格式化日期
const date = new Date();
const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
console.log(formattedDate); // 输出：2025-05-29
//文本对齐
const text = 'Hello';
console.log(text.padStart(10, ' ')); // 输出：'     Hello'
console.log(text.padEnd(10, ' '));   // 输出：'Hello     '
// 数据脱敏
const cardNumber = "110102YYYYMMDD888X"//身份证号码
const lastFourNumber = cardNumber.slice(-4)//获取身份证后四位
const finalCardNumber = lastFourNumber.padStart(cardNumber.length,"*")//要求达到身份证位要求的位数，不满足时缺少几位就往开头填入几位*
console.log(finalCardNumber);
```

> 注意：如果 `targetLength` 小于原字符串的长度，则返回原字符串如果 `padString` 为空字符串或未指定，则默认使用空格 (`' '`) 进行填充这些方法不会修改原字符串，而是返回一个新的字符串

### 异步函数 `Async`/`Await` ###

`async`/`await` 是 ES8 (2017) 引入的革命性异步编程特性，它基于 `Promise`，但提供了更直观、更同步风格的代码结构来处理异步操作 `async` 函数。

- 声明一个异步函数：`async function myFunction() { ... }`
- 总是返回一个 `Promise`
- 允许在函数内部使用 `await` 关键字
- `await` 表达式
- 暂停异步函数的执行，等待 `Promise` 解决
- 只能在 `async` 函数内部使用
- 返回 `Promise` 解决的值（如果是拒绝，则抛出异常）

```js
// 使用 async/await
async function fetchData() {
  const user = await getUser(); 
  const posts = await getPosts(user.id);
  return { user, posts };
}

function fetchData() {
  return getUser()
    .then(user => getPosts(user.id))
    .then(posts => ({ user, posts }));
}
// 代码纵向扩展而非横向嵌套，逻辑清晰易维护
```

#### `​try/catch` 统一捕获​​ ####

`async/await` 允许使用同步代码的 `try/catch` 结构处理异步错误，替代 `Promise` 的 `.catch()` 分散处理

```js
async function fetchWithRetry() {
  try {
    const data = await fetchData();
    return process(data);
  } catch (error) {
    console.error("失败重试:", error);
    return fetchWithRetry(); // 自动重试
  }
}
```

### `Object.getOwnPropertyDescriptors()` ###

`Object.getOwnPropertyDescriptors()` 是 ES8（ECMAScript 2017）引入的静态方法，用于获取对象 ​​所有自身属性（非继承属性）​​ 的描述符。这些描述符包含属性的元信息（如可写性、可配置性等），为高级对象操作提供了基础支持

- `Object.getOwnPropertyDescriptors(obj)`

  - `obj`：目标对象（包括普通对象、数组、函数等）。
  - ​返回值​​：一个对象，键为属性名，值为对应的属性描述符对象

```js
const obj = { a: 1 };
const descriptors = Object.getOwnPropertyDescriptors(obj);
// 输出：
// {
//   a: {
//     value: 1,
//     writable: true,
//     enumerable: true,
//     configurable: true
//   }
// }
```

描述符可能包含以下字段：

- `value`：属性值（数据属性）。
- `get/set`：访问器属性的函数（访问器属性）。
- `writable`：是否可修改值。
- `enumerable`：是否可枚举（如 `for...in` 遍历）。
- `configurable`：是否可删除或修改属性特性

#### 应用场景​ ####

```js
// ​​深度克隆对象
function deepClone(obj) {
  const descriptors = Object.getOwnPropertyDescriptors(obj);
  return Object.create(Object.getPrototypeOf(obj), descriptors);
}
const obj = { a: 1, get b() { return 2; } };
const clone = deepClone(obj); // 包含属性描述符的完整副本

//处理 Symbol 属性与不可枚举属性​​
//可获取 Symbol 键名属性及不可枚举属性的描述符，弥补 Object.keys() 和 Object.values() 的不足
const sym = Symbol('key');
const obj = { [sym]: 'value', a: 1 };
Object.defineProperty(obj, 'b', { value: 2, enumerable: false });
const descriptors = Object.getOwnPropertyDescriptors(obj); // 包含 Symbol 和 'b'
```

### `​​Object.defineProperties()` 方法详解​ ###

- `Object.defineProperties()` 是 ES5 引入的方法，用于一次性定义多个属性描述符。它接受两个参数：目标对象和属性描述符对象
- 语法​​：`Object.defineProperties(target, descriptors)`
  - `target`：目标对象。
  - `descriptors`：属性描述符对象，键为属性名，值为对应的属性描述符。

```js
const obj = {};
Object.defineProperties(obj, {
  property1: { value: 42, writable: true },
  property2: { get() { return this._prop; }, set(val) { this._prop = val; } }
});
```

### 属性描述符类型​​ ###

描述符分为两类，​​不可同时混用​​（否则报错）：

#### ​数据描述符​​ ####

定义属性的值和可写性：

- `value`：属性值（默认 `undefined`）。
- `writable`：是否允许赋值修改（默认 `false`）。
- `configurable`：是否允许删除或修改特性（默认 `false`）。
 - `enumerable`：是否可枚举（如 `for...in` 遍历，默认 `false`）。

#### ​访问器描述符​​ ####

通过 `getter` 和 `setter` 控制属性访问：

- `get()`：读取属性时触发，返回值为属性值。
- `set(val)`：写入属性时触发，参数 `val` 为新值。
​
> ​注意​​：若未显式设置 `value/writable` 或 `get/set`，默认为数据描述符

## ES9 新特性 ##

### ​Rest 和 Spread 操作符 ###

Rest 和 Spread 操作符是 ES9 (2018) 引入的语法糖，用于简化数组和对象的操作

#### Rest 操作符（`...`） ####

- 用于解构数组或对象，将剩余元素收集到一个新数组或对象中

- 语法​​：`...array/object`

  - `array`：数组。
  - `object`：对象。

```js
// 解构数组
const [first, ...rest] = [1, 2, 3, 4];
console.log(first); // 1
console.log(rest);  // [2, 3, 4]
// 解构对象
const { a, ...rest } = { a: 1, b: 2, c: 3 };
console.log(a);     // 1
console.log(rest);  // { b: 2, c: 3 }
```

#### Spread 操作符（`...`） ####

- 用于展开数组或对象，将其元素或属性复制到新数组或对象中

- 语法​​：`...array/object`

  - `array`：数组。
  - `object`：对象。

```js
// 展开数组
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];
console.log(arr2); // [1, 2, 3, 4, 5]
// 展开对象
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 };
console.log(obj2); // { a: 1, b: 2, c: 3 }
```

### `​Promise.finally()` ###

`Promise.finally()` 是 ES9 (2018) 引入的方法，用于在 `Promise` 无论成功或失败时执行清理操作

- 语法​​：`promise.finally(onFinally)`

  - `onFinally`：一个无参数的回调函数，在 `Promise` 完成（无论成功或失败）后执行。

```js
fetchData()
  .then(result => console.log(result))
  .catch(error => console.error(error))
  .finally(() => console.log("清理操作"));
```

### 正则表达式命名捕获组 ###

正则表达式命名捕获组是 ES9 (2018) 引入的特性，允许为捕获组指定名称，增强了正则表达式的可读性和可维护性

- 语法​​：(`?pattern`)

  - `name`：捕获组的名称。
  - `pattern`：匹配模式。

```js
const regex = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const match = regex.exec("2025-05-29");
console.log(match.groups.year); // 2025
console.log(match.groups.month); // 05
console.log(match.groups.day); // 29
```

### 异步迭代器 ###

异步迭代器是 ES9 (2018) 引入的概念，用于处理异步迭代操作，如 `for...await...of` 循环

- 异步迭代器：具有 `Symbol.asyncIterator` 方法的对象，用于生成异步迭代器

- 异步迭代器对象：具有 `next()` 方法的对象，用于获取异步迭代结果

```js
async function* asyncIterable() {
  yield 1;
  yield 2;
  yield 3;  
}

for await (const value of asyncIterable()) {
  console.log(value); // 1, 2, 3
}
```

## ES10 新特性 ##

### `flat()` 和 `flatMap()` ###

`flat()` 是 ES10 (2019) 引入的方法，用于扁平化数组，支持指定深度

- 语法​​：`array.flat([depth])`

  - `depth`：可选，指定要扁平化的深度，默认为 1。

```js
// 基本用法
[1, 2, [3, 4]].flat();       // [1, 2, 3, 4]

// 多层嵌套
[1, [2, [3, [4]]]].flat(2);   // [1, 2, 3, [4]]

// 无限层级展平
[1, [2, [3, [4]]]].flat(Infinity); // [1, 2, 3, 4]

// 稀疏数组处理
[1, , 3, [4, , 6]].flat();   // [1, 3, 4, 6] (空位会被移除)
```

`flatMap()` 是 ES10 (2019) 引入的方法，用于映射数组后扁平化

- 语法​​：`array.flatMap(callback[, thisArg])`

  - `callback`：用于处理每个元素的回调函数，返回一个新数组。
  - `thisArg`：可选，执行 `callback` 时的 `this` 值。

```js
// 基本用法
[1, 2, 3].flatMap(x => [x, x * 2]);
// [1, 2, 2, 4, 3, 6]

// 与 map + flat 对比
[1, 2, 3].map(x => [x, x * 2]).flat();
// 等效结果，但 flatMap 性能更好

// 返回非数组值
['hello world', 'es2019'].flatMap(str => str.split(' '));
// ['hello', 'world', 'es2019']

// 可以返回空数组实现过滤效果
[-1, 2, -3].flatMap(num => num < 0 ? [] : [num]);
// [2] (替代 filter + map 组合)
```

### `​Object.fromEntries()` ###

`Object.fromEntries()` 是 ES10 (2019) 引入的方法，用于将键值对数组转换为对象,与 `Object.entries()` 互为逆操作。

- 语法​​：`Object.fromEntries(iterable)`

  - `iterable`：可迭代对象，包含键值对数组。

```js
const entries = [['a', 1], ['b', 2]];
const obj = Object.fromEntries(entries);
console.log(obj); // { a: 1, b: 2 }

// 2.Object.fromEntries的应用场景
const queryString = 'name=why&age=18&height=1.88'
const queryParams = new URLSearchParams(queryString)
for (const param of queryParams) {
  console.log(param)
}
// [ 'name', 'why' ]
// [ 'age', '18' ]
// [ 'height', '1.88' ]

const paramObj = Object.fromEntries(queryParams)
// { name: 'why', age: '18', height: '1.88' }
```

### `trimStart` `trimEnd` ###

`trimStart()` 是 ES10 (2019) 引入的方法，用于去除字符串开头的空格

- 语法​​：`str.trimStart()`

```js
const str = '   Hello World   ';
console.log(str.trimStart()); // 'Hello World    '

trimEnd() 是 ES10 (2019) 引入的方法，用于去除字符串结尾的空格
```

- 语法​​：`str.trimEnd()`

```js
const str ='  Hello World    ';
console.log(str.trimEnd()); // '  Hello World'
```

### `​Symbol.description` ###

`Symbol.description` 是 ES10 (2019) 引入的属性，用于获取 `Symbol` 的描述字符串

- 语法​​：`symbol.description`

```js
const sym = Symbol('description');
console.log(sym.description); // 'description'
// Symbol 描述字符串
```

## ES11 新特性 ##

### ​BigInt ###

`BigInt` 是 ES11 (2020) 引入的基本数据类型，用于表示任意精度的整数,`BigInt` 的表示方法是在数值的后面加上 `n`

- 语法​​：`BigInt(value)`

  - `value`：整数或字符串表示的整数。

```js
const bigInt = 1234567890123456789012345678901234567890n;
console.log(bigInt); // 1234567890123456789012345678901234567890n

onst bigInt = 900719925474099100n
console.log(bigInt + 10n) // 900719925474099110n

const num = 100
console.log(bigInt + BigInt(num)) //900719925474099200n

const smallNum = Number(bigInt)  //900719925474099100
```

### ​可选链操作符 `?.` ###

可选链操作符 `?.` 是 ES11 (2020) 引入的特性，用于安全访问对象的属性或方法，避免出现空值或未定义的情况,主要作用是让我们的代码在进行 `null` 和 `undefined` 判断时更加清晰

```js
const user = { name: 'Alice' };
console.log(user?.name); // 'Alice'
```

### ​Nullish 合并运算符 `??` ###

Nullish 合并运算符 `??` 是 ES11 (2020) 引入的特性，用于处理可能为 `null` 或 `undefined` 的值，返回第一个定义的值

```js
const name = null ?? 'Guest'; // 'Guest'
const age = 0?? 18; // 0  
const foo = undefined
// const bar = foo || "default value"
const bar = foo ?? "defualt value" // "default value"
```

### Global This ###

Global This 是 ES11 (2020) 引入的特性，用于表示全局对象，无论在哪个环境中，`this` 的值都指向全局对象

- 在之前我们希望获取JavaScript环境的全局对象，不同的环境获取的方式是不一样的

  - 比如在浏览器中可以通过 `this`、`window` 来获取；
  - 比如在 Node 中我们需要通过 `global` 来获取；

- 那么在ES11中对获取全局对象进行了统一的规范：`globalThis`

```js
// 获取某一个环境下的全局对象(Global Object)

// 在浏览器下
// console.log(window)
// console.log(this)

// 在node下
 console.log(global)

// ES11
console.log(globalThis)
```

### `​Promise.allSettled()` ###

`Promise.allSettled()` 是 ES11 (2020) 引入的方法，用于等待所有 `Promise` 完成（无论成功或失败），返回一个新的 `Promise`

- 语法​​：`Promise.allSettled(iterable)`

  - `iterable`：可迭代对象，包含多个 `Promise`。

```js
const promises = [Promise.resolve(1), Promise.reject(2), Promise.resolve(3)];
Promise.allSettled(promises)
  .then(results => {
    console.log(results);
    // [
    //   { status: 'fulfilled', value: 1 },
    //   { status: 'rejected', reason: 2 },
    //   { status: 'fulfilled', value: 3 }
    // ]
  }); 
```

### `for..in` 标准化 ###

在 ES11 之前，虽然很多浏览器支持 `for...in` 来遍历对象类型，但是并没有被 ECMA 标准化。

在ES11中，对其进行了标准化，`for...in` 是用于遍历对象的 `key` 的：

```js
const obj = {name: "why", age: 18, height: 1.88}
for (const key in obj) {
  console.log(key)
}
// name
// age
```

### ​动态导入 `import()` ###

在 ES11（ECMAScript 2020）中，动态 `import()` 是一个非常强大的特性，它允许你在运行时动态地加载模块。这种动态导入的行为不是在编译时决定的，而是在运行时根据条件或事件来决定要加载哪个模块。这在很多场景中都非常有用，比如按需加载模块以优化性能、根据用户操作加载特定功能等

- 基本用法：动态 `import()` 是一个函数，它接受一个模块路径作为参数，并返回一个 `Promise`。这个 `Promise` 在模块成功加载后会解析为该模块的命名空间对象

```js
import(moduleSpecifier)
  .then((module) => {
    // 使用加载的模块
  })
  .catch((error) => {
    // 处理加载错误
  });
```

#### 案例分析 ####

```js
// 按需加载模块
document.getElementById('loadButton').addEventListener('click', () => {
  import('./dynamicModule.js')
   .then((module) => {
      // 使用加载的模块
    })
   .catch((error) => {
      // 处理加载错误
    });
});
// 条件加载模块
const loadModule = (condition) => {
  let modulePath;
  if (condition) {
    modulePath = './moduleA.js';
  } else {
    modulePath = './moduleB.js';
  }

  return import(modulePath)
    .then((module) => {
      // 使用加载的模块
      return module;
    })
    .catch((error) => {
      console.error('Failed to load module:', error);
      throw error;
    });
};

// 使用示例
loadModule(someCondition)
  .then((module) => {
    // 执行模块中的逻辑
  })
  .catch((error) => {
    // 处理错误
  });
```

### `import.meta` ###

`import.meta` 是 ES11 (2020) 引入的对象，用于提供模块的元信息，包括模块的 `URL` 和其他相关信息

- 获取模块的 URL

这是 `import.meta` 最常见的用途之一，特别是在需要知道模块所在的 URL 时非常有用。例如，在处理相对路径、动态加载资源或者在不同环境下需要知道模块的位置时

```js
// test.js
const moduleURL = import.meta.url;
console.log(moduleURL); // 'file:///Users/xx/xx/sumu/typescript-vue3/markdown/markdown-md/md/Javascript/test.js'
```

- 访问环境特定的元数据

在某些环境中，比如浏览器或特定的构建工具（如 Vite），`import.meta` 可能会被扩展以提供额外的信息。例如，Vite 在开发和生产环境中会通过 `import.meta.env` 提供环境变量

```js
// 在 Vite 中访问环境变量
console.log(import.meta.env.MODE); // 当前模式（开发/生产）
console.log(import.meta.env.BASE_URL); // 基础 URL

// .env 文件
VITE_API_URL=https://api.example.com

// 在模块中使用
console.log(import.meta.env.VITE_API_URL); // 输出：https://api.example.com
```

- 动态加载资源

结合 `import.meta.url`，可以动态地加载与模块相关的资源，比如图片、样式表等

```js
// 假设模块位于 /src/components/Component.js
const componentStyleUrl = new URL('./styles.css', import.meta.url).href;
console.log(componentStyleUrl); // 输出：file:///src/components/styles.css
```

## ES12 新特性 ##

### `​String.prototype.replaceAll()` ###

`String.prototype.replaceAll()` 是 ES12 (2021) 引入的方法，用于替换字符串中所有匹配的子字符串

- 语法​​：`str.replaceAll(searchValue, replaceValue)`

  - `searchValue`：要替换的子字符串或正则表达式。
  - `replaceValue`：替换后的字符串或生成替换字符串的函数。

```js
const str = 'hello world';
console.log(str.replaceAll('l', 'L')); // 'heLLo worLd'

const str = 'hello world, hello everyone';
const newStr = str.replaceAll('hello', 'hi');
console.log(newStr); // "hi world, hi everyone"
```

### ​逻辑赋值运算符 ###

逻辑赋值运算符是 ES12 (2021) 引入的特性，用于简化逻辑表达式中的赋值操作（ `&&=`，`||=`，`??=` ）

```js
let x = 5;
x &&= 10; // 等价于 x = x && 10;
console.log(x); // 10
let y = null;
y ||= 10; // 等价于 y = y || 10;
console.log(y); // 10
let z = undefined;
z ??= 10; // 等价于 z = z ?? 10;
console.log(z); // 10
let message = 0
message ??= "default value"; // 等价于 message = message?? "default value"; // 0
```

### ​Numeric Separators ###

Numeric Separators 是 ES12 (2021) 引入的特性，用于在数字字面量中添加分隔符，提高数字的可读性

```js
const num1 = 1000000; // 传统方式
const num2 = 1_000_000; // 使用分隔符
console.log(num1); // 1000000
console.log(num2); // 1000000 
```

### `​Promise.any()` ###

`Promise.any()` 是 ES12 (2021) 引入的方法，用于等待一组 `Promise` 中的任意一个完成（无论成功或失败），返回第一个完成的 `Promise` 的值

```js
const promises = [Promise.reject(1), Promise.reject(2), Promise.resolve(3)];
Promise.any(promises)
 .then((value) => {
    console.log(value); // 3
  })
 .catch((errors) => {
    console.log(errors); // [1, 2]
  });
```

### FinalizationRegistry ###

FinalizationRegistry 是 ES12 (2021) 引入的特性，用于注册对象的清理回调，当对象被垃圾回收时执行

- 语法​​：`new FinalizationRegistry(callback)`

  - `callback`：清理回调函数，接受一个对象作为参数。

```js
// ES12: FinalizationRegistry类
const finalRegistry = new FinalizationRegistry((value) => {
  console.log("注册在finalRegistry的对象, 某一个被销毁", value)
})

let obj = { name: "why" }
let info = { age: 18 }

finalRegistry.register(obj, "obj")
finalRegistry.register(info, "info")

obj = null
info = null
// 注册在finalRegistry的对象, 某一个被销毁obj
// 注册在finalRegistry的对象, 某一个被销毁info
```

### ​WeakRef ###

`WeakRef` 是 ES12 (2021) 引入的特性，用于创建弱引用对象，允许在对象被垃圾回收时保持对其的引用

如果我们默认将一个对象赋值给另外一个引用，那么这个引用是一个强引用：如果我们希望是一个弱引用的话，可以使用 `WeakRef`

```js
// ES12: WeakRef类
// WeakRef.prototype.deref: 
// > 如果原对象没有销毁, 那么可以获取到原对象
// > 如果原对象已经销毁, 那么获取到的是undefined
const finalRegistry = new FinalizationRegistry((value) => {
  console.log("注册在finalRegistry的对象, 某一个被销毁", value)
})

let obj = { name: "sumu" }
let info = new WeakRef(obj)

finalRegistry.register(obj, "obj")

obj = null

setTimeout(() => {
  console.log(info.deref()?.name)
  console.log(info.deref() && info.deref().name)
}, 10000)
```


> 解构是ES6的的重要特性之一，用于从JavaScript对象和数组中提取数据，语法上比ES5所提供的更加简洁、紧凑、清晰。掌握好它不仅能让代码更简洁，还能大大提高开发效率。分享实用的解构用法，让你的代码更优雅。


## 基础用法 ##

### 数组基础解构 ###

最基本的数组解构让我们能够轻松地提取数组元素：

```js
// 基础解构
const [first, second] = [1, 2, 3];
console.log(first);  // 1
console.log(second); // 2

// 跳过元素
const [, , third] = [1, 2, 3];
console.log(third);  // 3
```

### 对象解构重命名 ###

当我们需要避免命名冲突时，可以给解构的属性起新名字：

```js
const person = {
  name: '张三',
  age: 25
};

const { name: userName, age: userAge } = person;
console.log(userName); // '张三'
console.log(userAge);  // 25
```

### 设置默认值 ###

解构时可以设置默认值，防止取到 `undefined`：

```js
// 数组默认值
const [x = 1, y = 2] = [undefined, null];
console.log(x); // 1
console.log(y); // null

// 对象默认值
const { title = '默认标题', count = 0 } = {};
console.log(title); // '默认标题'
console.log(count); // 0
```

### 嵌套解构 ###

对于复杂的嵌套数据结构，我们可以使用嵌套解构：

```js
const user = {
  id: 1,
  info: {
    name: '李四',
    address: {
      city: '北京'
    }
  }
};

const { info: { name, address: { city } } } = user;
console.log(name); // '李四'
console.log(city); // '北京'
```

### 结合扩展运算符 ###

扩展运算符配合解构使用，能够轻松处理剩余元素：

```js
// 数组结合扩展运算符
const [head, ...tail] = [1,2,3,4];
console.log(head); // 1
console.log(tail); // [2,3,4]
// 对象结合扩展运算符
const {id, ...rest} = {id:1, name:'李四', age: 35}
console.log(id); // 1
console.log(rest); // {name:'李四', age: 35}
```

### 函数参数解构 ###

在函数参数中使用解构可以让代码更清晰：

```js
// 对象参数解构
function user({name, age = 35}){
    console.log(`${name}今年${age}岁`)
}
user({name:'李四'}) // "李四今年35岁"
//数组参数解构
function sum([a,b] = [0,0]){
    return a + b;
}
console.log(sum([1,3])) // 4
```

### 动态属性解构 ###

可以使用计算属性名进行解构：

```js
const key = 'name';
const { [key]: value } = { name: '李四' }
console.log(value) // '李四'
```

### 解构用于交换变量 ###

使用解构可以优雅地交换变量值：

```js
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a) // 2
console.log(b) // 1
```

### 链式解构赋值 ###

可以在一行中进行多个解构赋值：

```js
const obj = { a: 1, b: 2 };
const arr = [3, 4];
const { a, b } = obj, [c, d] = arr;
```

### 解构配合正则匹配 ###

在处理正则表达式结果时，解构特别有用：

```js
const [,year, month, day] = /(\d{4})-(\d{2})-(\d{2})/.exec('2025-02-26');
console.log(year, month, day) // 2025 02 26
```

### 解构导入模块 ###

在导入模块时，解构可以只引入需要的部分：

```js
// 只导入需要的方法
import { useStste，useEffect } from 'react';
// 重命名导入
import { useStste as useStsteHook } from 'react';
```

### 条件解构 ###

结合空值合并运算符，可以实现条件解构：

```js
const data = null;
const { value = 'default' } = data ?? {};
console.log(value); // 'default'
```

### 安全解构 ###

解构 `null`/`undefined` 会报错，建议前置空值处理

```js
const safeObj = maybeNull || {}; 
const { value } = safeObj;
```

### 字符串解构 ###

```js
const [a, b] = 'ES6'; // a='E', b='S'
```

### 默认值触发条件 ###

仅在值为 `undefined` 时生效

```js
const { status = 'pending' } = { status: null }; // null
const { status = 'pending' } = { status: undefined }; // 'pending'
```

## 高级用法 ##

### `Map` 结构解构 ###

```js
const map = new Map([['react', 18], ['vue', 3]]);
for (const [lib, version] of map) {
    console.log(`${lib}@${version}`) 
}
// react@18
// vue@3
```

### 生成器 `Yield` 解构 ###

```js
function* dataStream() { 
    yield [1, { val: '2025' }] 
} 
const [[index, { val }]] = dataStream(); // index=1, val='2025'
```

### Web API 响应解构 ###

```js
const { 
    headers: { 'x-2025-version': apiVersion }, 
    body: { results: [firstItem] } 
} = await fetch('/2025-api').then(r => r.json());
```

### ArrayBuffer 解构 ###

```js
const buffer = new Uint8Array([72, 101]); 
const [firstByte, secondByte] = buffer; // 72, 101 → 'He'
```

### 防御性解构 ###

```js
// 可选链保护 
const { 
    user?.?.profile: { 
        email = 'default@2025.com' 
    } = {} 
} = serverResponse ?? {}; 
// 异常捕获模式 
try { 
    const { data } = JSON.parse(apiResponse);
} catch { 
    const { data } = { data: 'Fallback 2025 Data' }; 
}
```

### 柯里化参数解构 ###

```js
const createRequest = ({ headers }) => ({ body }) => fetch('/api', { headers, body });
```

### 管道式解构 ###

```js
const parseUser = ([, { name, age }]) => ({ name, birthYear: 2025 - age }); 
parseUser(['header', { name: 'Bob', age: 30 }]) // → {name: 'Bob', birthYear: 1995}
```

### Proxy 拦截解构 ###

```js
const reactiveObj = new Proxy({ x: 10 }, { 
    get(t, p) { return t[p] * 2 } // 解构时会触发计算 
}); 
const { x } = reactiveObj; // x = 20
```

### 递归保护解构 ###

```js
const safeGet = (obj, path) => { 
    try { 
        return Function( 
            'o', 
            `return o?.${path.join('?.')}`
        )(obj); 
    } catch { 
        const [firstKey] = path; 
        return { [firstKey]: null }; 
    } 
};
```

## 注意 ##

那么前面讲了那么多我们来看看在解构时候需要注意什么吧。

- 在解构时候不推荐使用 `var` 来进行，因为 `var` 声明的是全局变量,防止造成歧义;

- 解构时候变量名不能重复,不能对已经声明的变量名进行解构,否则会Error,也就是说只有在进行解构时候才可以进行声明变量;

- 当然如果非得要对已经声明的变量进行解构,那么我们可以采用圆括号`()`把整个解构赋值括起来,那么也可以达到我们想要的效果;

- 在对数组进行解构的时候会发现我们使用的是中括号`[]`,因为数组是根据索引来进行取值的,所以我们就相当于在用索引来对其进行值的提取;

- 在对对象进行解构的时候我们采用的是花括号{},因为在对象中我们使用的是键值对`(key:value)`来进行取值的,所以我们给出了相对应的键(key),那么我们就会拿到相对应的值(value);

> 总结:本文介绍了解构的使用方法以及规则，在以后的使用中我们会发现解构会大大减少我们的代码量,也会提高我们的编程效率。
