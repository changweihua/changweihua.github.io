---
lastUpdated: true
commentabled: true
recommended: true
title: ECMAScript 2025 正式发布
description: 10 个让你眼前一亮的 JavaScript 新特性！
date: 2025-11-25 10:00:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

2025 年 6 月 26 日，ECMA 国际正式批准 ECMAScript 2025（第 16 版） 规范。作为 JavaScript 演进的重要里程碑，ES2025 引入了多项实用且强大的新特性，涵盖异步处理、集合操作、模块加载、正则表达式等多个核心领域。

本文将带你快速掌握 ES2025 最值得关注的 10 个新 API 和语法特性，助你写出更简洁、高效、可维护的现代 JavaScript 代码！

## 1️⃣ Promise.try()：统一同步与异步错误处理 ##

### 问题背景 ###

以往封装一个可能抛错的同步函数时，常需用 `Promise.resolve().then(fn)`，但这会引入不必要的微任务延迟，且异常捕获逻辑割裂。

### 新方案 ###

```javascript
function mightThrow() {
  if (Math.random() > 0.5) throw new Error("Oops");
  return "Success";
}

Promise.try(mightThrow)
  .then(console.log)
  .catch(console.error);
```

### 优势 ###

- 同步错误自动转为 `Promise reject`；
- 避免微任务延迟，执行更及时；
- 统一 `.catch` 处理所有异常。


> ✅ 适用于封装第三方同步 API，提升错误调试效率。

## 2️⃣ Set 集合运算方法：告别手写交并差！ ##

ES2025 为 `Set` 新增 7 个原生方法，支持标准集合论操作：

```javascript
const A = new Set([1, 2, 3]);
const B = new Set([3, 4, 5]);

console.log(A.union(B));              // Set {1, 2, 3, 4, 5}
console.log(A.intersection(B));       // Set {3}
console.log(A.difference(B));         // Set {1, 2}
console.log(A.symmetricDifference(B)); // Set {1, 2, 4, 5}

console.log(A.isSubsetOf(B));         // false
console.log(A.isSupersetOf(B));       // false
console.log(A.isDisjointFrom(B));     // false
```

> 💡 这些方法让 JS 的集合操作终于媲美 Python！适用于权限管理、标签筛选、数据去重等场景。

## 3️⃣ 原生 JSON 模块导入（Import Attributes） ##

无需 `fetch`，直接把 `.json` 文件当作模块导入！

### 静态导入 ###

```ts
import config from './config.json' with { type: 'json' };
console.log(config.apiKey);
```

### 动态导入 ###

```ts
const { default: data } = await import('./data.json', {
  with: { type: 'json' }
});
```

> 🔒 浏览器通过 `with { type: 'json' }` 显式声明资源类型，提升安全性与可读性。

## 4️⃣ 同步迭代器链式操作（Iterator Helpers） ##

现在所有可迭代对象（如数组、Set、Map、字符串）的迭代器都支持链式方法：

```ts
const arr = ['a', '', 'b', '', 'c', 'd'];
const result = arr.values()
  .filter(x => x)
  .map(x => x.toUpperCase())
  .toArray();

console.log(result); // ['A', 'B', 'C', 'D']
```

**支持的方法包括**：

- `.filter()`, `.map()`, .`flatMap()`
- `.some()`, `.every()`, `.find()`
- `.reduce()`, `.forEach()`
- `.drop(n)`, `.take(n)`, `.toArray()`

> ⚡ 惰性求值 + 内存友好，特别适合处理大型数据流或生成器。

## 5️⃣ `RegExp.escape()`：安全转义正则字符串 ##

动态构建正则时，再也不用手动转义特殊字符！

```ts
const raw = "(foo)*+?";
const escaped = RegExp.escape(raw);
console.log(escaped); // "\(foo\)\*\+\?"
```

> 🛡️ 有效防止正则注入漏洞，替代自定义 `escapeRegExp` 函数。

## 6️⃣ 正则表达式内联标志（局部修饰符） ##

可在正则内部局部启用/禁用标志，如 `i`（忽略大小写）：

```javascript
const re = /^x(?i:HELLO)x$/;
console.log(re.test('xHELLOx')); // true
console.log(re.test('xhellox')); // true
console.log(re.test('XhelloX')); // false ← 外围仍区分大小写
```

> 🎯 精准控制匹配行为，避免全局标志污染。

## 7️⃣ 重复命名捕获组 ##

不同分支可复用相同捕获组名，简化日期、ID 等多格式解析：

```ts
const DATE_REGEX = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})
  |(?<month>\d{2})/(?<day>\d{2})/(?<year>\d{4})$/;

const match = '2025-11-25'.match(DATE_REGEX);
const { year, month, day } = match.groups; // 直接解构，无需判断分支
```

> 🧩 极大简化多格式文本解析逻辑。

## 8️⃣ 延迟模块加载（`defer import`） ##

预加载但延迟执行，优化首屏性能：

```javascript
defer import { heavyModule } from './heavy.js';

button.onclick = async () => {
  await heavyModule.run(); // 此时模块已加载完毕，仅执行代码
};
```

vs 动态 `import()`

| 特性   |   `defer import`     |   `import()` |
| :----------: | :----------: | :---------:  |
| 加载时机 | 声明时并行加载 | 调用时加载 |
| 执行时机 | 首次访问导出时 | 加载后立即执行 |
| 适用场景 | 高频交互模块（弹窗、编辑器） | 路由级懒加载 |

> 🚀 实现“预加载 + 按需执行”的完美平衡。

## 9️⃣ BigInt 增强支持 ##

虽然 BigInt 在 ES2020 已引入，但 ES2025 进一步优化其与标准库的兼容性，例如：

- 支持 `BigInt` 作为 `Array.prototype.sort` 的比较值；
- 更完善的 `JSON.stringify` 行为（需配合 `reviver` 使用）。

## 🔟 其他改进 ##

- `Symbol.prototype.description` 属性更稳定；
- 更严格的模块解析错误提示；
- 性能优化：减少闭包内存占用、提升 Promise 链执行效率。

## 🌐 浏览器支持情况（截至 2025 年 11 月） ##

| 特性   |   Chrome 128+     |   Firefox 130+ |   Safari 18+ |   Node.js 22+ |
| :----------: | :----------: | :---------:  | :---------:  | :---------:  |
| `Promise.try()` | ✅ | ✅ | ✅ | ✅ |
| Set 方法 | ✅ | ✅ | ✅ | ✅ |
| JSON 模块导入 | ✅ | ⚠️（实验） | ✅ | ✅（需 flag） |
| Iterator Helpers | ✅ | ✅ | ✅ | ✅ |
| `RegExp.escape()` | ✅ | ✅ | ✅ | ✅ |
| `defer import` | ✅ | ❌ | ⚠️ | ❌（暂未支持） |

> 💡 建议搭配 Babel 或 TypeScript 编译以兼容旧环境。

## ✅ 结语 ##

ECMAScript 2025 不仅延续了 JavaScript “渐进增强” 的设计哲学，更在**开发体验、性能、安全性**上迈出坚实一步。无论是简化日常编码，还是优化大型应用架构，这些新特性都值得你立即尝试！