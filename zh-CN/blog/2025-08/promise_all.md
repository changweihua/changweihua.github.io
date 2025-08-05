---
lastUpdated: true
commentabled: true
recommended: true
title: 一网打尽 Promise 组合技：race vs any, all vs allSettled，再也不迷糊！
description: 一网打尽 Promise 组合技：race vs any, all vs allSettled，再也不迷糊！
date: 2025-08-05 10:00:00 
pageClass: blog-page-class
cover: /covers/typescript.svg
---

## 引言 ##

处理异步操作是 JavaScript 的核心挑战之一，而 `Promise` 是解决这个问题的利器。当我们有多个异步任务需要协同处理时，ES6 及后续版本提供了几个强大的组合方法：`Promise.race`, `Promise.any`, `Promise.all`, `Promise.allSettled`。它们名字相似，行为却各有侧重，常常让人傻傻分不清。这篇文章就用最直白的语言和例子，帮你彻底理清它们的区别和应用场景！

## 核心概念 ##

在深入之前，记住每个方法都：

- **接收一个可迭代对象（通常是数组）**：里面包含多个 Promise。
- **返回一个新的 Promise**：这个新 Promise 的状态（成功/失败）和值/原因，由传入的 Promise 们如何完成或拒绝来决定。
- **处理异步并发**：它们都同时启动传入的所有 Promise。

### 第一组对决：Promise.race vs Promise.any ###

- **共同点**：  都关心“第一个”完成（settled）的 Promise。
- **关键区别**：  对“第一个”结果的态度不同！

#### Promise.race (赛跑 - 赢家通吃，不论好坏) ####

- **行为**：只要传入的 Promise 中**任何一个率先完成（settled）** ——无论是成功（fulfilled）还是失败（rejected）—— `race` 返回的新 Promise 就立即采用这个**第一个完成**的 Promise 的状态和结果（值或原因）。

- **结果**：

  - 如果第一个完成的是成功的 Promise，则 `race` 成功，值为该 Promise 的值。
  - 如果第一个完成的是失败的 Promise，则 `race` 失败，原因为该 Promise 的原因。

- **特点：“快者为王”，只认最先响应的那个，不管它是好是坏。其他 Promise 的结果会被忽略（但它们仍然会执行完）。

- **典型应用**：

  - **设置超时控制**：将一个异步操作和一个延迟一定时间后拒绝的 Promise 进行 race。如果延迟 Promise 先完成（即超时），则整个操作失败。
  - ** 竞速获取资源**：从多个镜像源请求同一资源，谁先响应就用谁的结果。

```ts
const promise1 = new Promise((res) => setTimeout(res, 100, 'Result 1 (Fast Win)'));
const promise2 = new Promise((_, rej) => setTimeout(rej, 200, 'Error 2'));
const promise3 = new Promise((res) => setTimeout(res, 300, 'Result 3'));

Promise.race([promise1, promise2, promise3])
  .then(result => console.log('Race Success:', result)) // 输出: Race Success: Result 1 (Fast Win)
  .catch(error => console.error('Race Error:', error));

// 另一个例子：超时控制
const fetchData = fetch('https://api.example.com/data');
const timeout = new Promise((_, rej) => setTimeout(rej, 5000, 'Request Timed Out'));

Promise.race([fetchData, timeout])
  .then(data => console.log('Data received:', data))
  .catch(err => console.error('Error:', err)); // 如果5秒内fetchData没成功，这里会捕获到 'Request Timed Out'
```

#### Promise.any (寻求第一个成功者 - 失败被忽略，直到全败) ####

- **行为**：等待传入的 Promise 中 **任何一个率先成功（fulfilled）** 。只要有一个成功，any 返回的新 Promise 就立即成功，并采用这个**第一个成功**的 Promise 的值。**如果所有 Promise 都失败了**，那么 `any` 返回的 Promise 才会失败，并带有一个特殊的 `AggregateError`（ES2021+），这个错误对象包含所有失败 Promise 的原因。

- **结果**：

  - 只要有一个成功，`any` 成功，值为第一个成功的值。
  - 只有全部失败，`any` 失败，原因为 `AggregateError`（包含所有错误）。

- **特点**：“只认成功者”，忽略失败，直到实在没有成功者才报错。它是 race 的“乐观”版本。

- **典型应用**：

  - **寻找最快可用的资源**：向多个冗余服务请求数据，只要其中一个服务返回可用数据即可，不关心哪些服务挂了（除非全挂了）。
  - **提供备用方案**：尝试多种可能成功的方法，只要其中一种成功就行。

```ts
const promise1 = new Promise((_, rej) => setTimeout(rej, 100, 'Error 1 (Fast Fail)'));
const promise2 = new Promise((res) => setTimeout(res, 200, 'Result 2 (First Success)'));
const promise3 = new Promise((_, rej) => setTimeout(rej, 300, 'Error 3'));

Promise.any([promise1, promise2, promise3])
  .then(result => console.log('Any Success:', result)) // 输出: Any Success: Result 2 (First Success)
  .catch(aggregateError => {
    console.error('All promises failed! Reasons:');
    aggregateError.errors.forEach(err => console.error('-', err));
  });

// 如果全部失败：
Promise.any([Promise.reject('Fail1'), Promise.reject('Fail2')])
  .catch(aggregateError => {
    console.error('All failed!');
    aggregateError.errors.forEach(e => console.log(e)); // 输出: 'Fail1', 'Fail2'
  });
```

### 第二组对决：Promise.all vs Promise.allSettled ###

- **共同点**：都关心*所有* Promise 的结果。
- **关键区别**：对失败（rejection）的容忍度不同！

#### Promise.all (团队协作 - 一荣俱荣，一损俱损) ####

- **行为**：等待传入的**所有 Promise 都成功（fulfilled）** 。如果全部成功，`all` 返回的新 Promise 成功，其值是一个数组，按传入顺序包含所有 Promise 的成功值。**如果其中任何一个 Promise 失败（rejected）** ，`all` 返回的新 Promise **立即失败**，并采用这个**第一个失败**的 Promise 的原因。其他 Promise 的结果（无论成功失败）都会被忽略（但它们仍会执行完）。

- **结果**：

  - 全部成功：成功，值为结果数组 `[val1, val2, ...]`。
  - 有一个失败：立即失败，原因为第一个失败的原因。

- **特点**：“要么全赢，要么全输”。要求所有操作必须成功，适用于任务强依赖的场景。

- ** 典型应用**：

  - **并行加载多个必需资源**：例如页面渲染需要同时加载用户数据和配置数据，缺一不可。
  - **执行多个相互依赖的异步操作**：所有步骤都成功才算成功。

```ts
const promise1 = Promise.resolve(1);
const promise2 = Promise.resolve(2);
const promise3 = Promise.resolve(3);

Promise.all([promise1, promise2, promise3])
  .then(results => console.log('All Success:', results)) // 输出: All Success: [1, 2, 3]
  .catch(error => console.error('All Error:', error));

// 其中一个失败
const goodPromise = Promise.resolve('Ok');
const badPromise = Promise.reject('Oops!');

Promise.all([goodPromise, badPromise])
  .then(results => console.log(results))
  .catch(error => console.error('Caught:', error)); // 输出: Caught: Oops! (goodPromise的结果被丢弃)
```

#### Promise.allSettled (打扫战场 - 无论成败，悉数汇报) ####

- **行为**：等待传入的**所有 Promise 都完成（settled）** ——无论结果是成功（fulfilled）还是失败（rejected）。`allSettled` 返回的新 Promise **总是成功**（不会失败！）。其值是一个数组，按传入顺序包含每个 Promise 的最终状态描述对象。

  - 每个状态描述对象都有一个 `status` 属性：

    - 如果成功：`status: 'fulfilled'`，同时包含 `value` 属性（成功值）。
    - 如果失败：`status: 'rejected'`，同时包含 `reason` 属性（失败原因）。

- **结果**：总是成功！值为 `{ status, value? }` 或 `{ status, reason? }` 对象的数组。

- **特点**：“有始有终”。不关心单个成功失败，只确保拿到所有操作的最终结果报告。绝对不会进入 `.catch`（除非 `allSettled` 本身使用出错）。

- **典型应用**：

  - **收集批量操作的结果（无论成败）**：例如发送多个通知、记录多个事件、批量处理数据，需要知道每个任务的具体结果（成功或失败详情）。
  - **在发生错误后仍需处理其他结果时**：即使某些操作失败，也需要清理或处理那些成功的操作。

```ts
const promise1 = Promise.resolve('Success');
const promise2 = Promise.reject('Failure');
const promise3 = new Promise(res => setTimeout(res, 100, 'Delayed Success'));

Promise.allSettled([promise1, promise2, promise3])
  .then(results => {
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        console.log(`✅ ${result.value}`);
      } else { // status === 'rejected'
        console.log(`❌ ${result.reason}`);
      }
    });
  });
// 可能的输出:
// ✅ Success
// ❌ Failure
// ✅ Delayed Success
```

## 终极总结表 ##

| 方法   |  关心点  | 成功条件  | 失败条件  | 成功时结果值  | 失败时结果原因  |  特点 |
| :-------: | :-----: | :-----: | :-----: | :-----: | :-----: | :-----: |
| `Promise.race` | *第一个完成* (无论成败)  |  第一个完成的 Promise 是成功的 | 第一个完成的 Promise 是失败的 | 第一个成功的值 | 第一个失败的原因 | 快者为王 |
| `Promise.any` | *第一个成功* | 至少有一个 Promise 成功 (取第一个成功的) | *所有* Promise 都失败 | 第一个成功的值 | AggregateError (包含所有失败原因) | 寻求成功，忽略失败 |
| `Promise.all` | *所有都成功* | 所有 Promise 都成功 | *任何一个* Promise 失败 | 按顺序排列的所有成功值的数组 `[val1, ...]` | 第一个失败的原因 | 一票否决，要求全胜 |
| `Promise.allSettled` | *所有都完成* (无论成败) | *总是成功！*  (等待所有完成) | *永远不会失败！*  (等待所有完成) | 按顺序排列的状态对象数组 `[{status, value?}, {status, reason?}, ...]` | (无) | 打扫战场，悉数汇报 |


## 如何选择？ ##

- **需要第一个响应，且不在意结果好坏？**  -> `Promise.race` (如超时控制)。
- **需要第一个成功的响应，可以容忍部分失败？**  -> `Promise.any` (如寻找最快可用服务)。
- **需要所有操作都成功才能继续？**  -> `Promise.all` (如加载所有必需资源)。
- **需要知道每个操作的最终结果（无论成功失败）？**  -> `Promise.allSettled` (如批量处理结果汇总)。

掌握了这四个组合方法的精髓，你就能更加优雅和高效地处理复杂的异步并发场景了！现在，下次再看到它们，应该不会迷糊了吧？
