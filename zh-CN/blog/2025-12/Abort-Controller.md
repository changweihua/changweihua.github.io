---
lastUpdated: true
commentabled: true
recommended: true
title: Abort Controller 被严重低估了
description: 任何中止逻辑都应该使用它
date: 2025-12-24 11:00:00 
pageClass: blog-page-class
cover: /covers/css.svg
---

## 前言 ##

今天我们来聊聊 Abort Controller。 你可能在取消网络请求时使用过它，但其实它的功能远不止于此。
这个被严重低估的 API 有很多其他的巧妙用法。

## 什么是 AbortController ##

`AbortController` 是 JavaScript 中的一个全局类，可以用来中止任何事情。

使用方法如下：

```js
const controller = new AbortController();
controller.signal
controller.abort()
```

可以看到，在创建完 AbortController 实例后，有两个重要的部分：

- `signal` 属性: 一个 `AbortSignal` 的实例，可以提供给各种 API （ 比如 `fetch` ） 来响应中止事件
- `abort()` 方法：触发 `signal` 上的中止事件

## 常见使用场景 ##

### 事件监听管理 ###

传统的事件监听器移除方式：

```js
window.addEventListener('resize', handleResize)
window.addEventListener('storage', handleStorage)
// 清理时需要记住所有的事件和处理函数
window.removeEventListener('resize', handleResize)
window.removeEventListener('storage', handleStorage)
```

我们为了能将函数更好的传递给 `removeEventListener` ，一般需要抽象成一个函数。
如果使用的是 TypeScript ，还需要定义一下函数里面的类型。但是使用 `AbortController` ，我们可以这样做：

```js
const controller = new AbortController()
const signal = controller.signal

window.addEventListener('resize',
  () => {
    // 处理 resize 事件
  },
  { signal }
)

window.addEventListener('storage',
  () => {
    // 处理 storage 事件
  },
  { signal }
)

// 清理时只需要调用 abort 方法
controller.abort()
```

在这个示例中，即使存在多个事件监听器，在移除的时候，我们也只需要一个 `AbortController` 实例就能统一清理。

> 更重要的是，这种方式让我们不再需要为每个事件处理函数单独命名和维护，使代码更加简洁优雅。

### 取消网络请求 ###

这是我们最常见的使用场景，使用 `fetch` 函数，在取消网络请求时，我们通常会使用 `AbortController` 来实现。

```js
function uploadFile(file: File) {
  const controller = new AbortController()

  const response = fetch('/upload', {
    method: 'POST',
    body: file,
    signal: controller.signal,
  })

  return { response, abort: controller.abort }
}
```

在上面这个例子中，用户上传文件的过程中，如果想要取消上传，只需要调用 abort 方法即可。

此外，`AbortSignal` 类还附带了一些静态方法来简化请求处理。

**AbortSignal.timeout**

在使用 `fetch` 时，如果想要设置超时后取消请求，甚至都无需创建 `AbortController` 实例，直接使用 `AbortSignal.timeout` 即可。

```js
fetch(url, {
  signal: AbortSignal.timeout(3000),
})
```

**AbortSignal.any**

和 `Promise.race` 类似，`AbortSignal.any` 可以监听多个信号，只要其中一个信号触发，就会触发 `AbortSignal.any` 的回调。

```js
const publicController = new AbortController()
const internalController = new AbortController()

channel.addEventListener('message', handleMessage, {
  signal: AbortSignal.any([publicController.signal, internalController.signal]),
})
```

在上面这个示例中，我们有两个 `AbortController` 实例，分别用于处理公共事件和内部事件。`publicController` 可以直接暴露给
外部使用，我们也有自己的 `internalController`，用于处理内部逻辑。只要任何一个 `AbortController` 实例触发中止事件，
`message` 事件监听器就会被删除。

### 错误处理 ###

`controller.abort()` 方法有一个可选参数，可以传递一个错误信息，这个错误信息会作为 `AbortSignal.reason` 属性返回。

```js
const controller = new AbortController()

controller.signal.addEventListener('abort', () => {
  console.log(controller.signal.reason) // "user cancellation"
})

// 提供一个错误信息
controller.abort('user cancellation')
```

```js
const controller = new AbortController()
controller.signal.reason
```

> Node.js 中的 `http` 模块发出的请求也支持 `signal` 属性 !

**stream**

在 `Next.js` 中，当我们使用服务端渲染页面，如果等整体页面渲染完成再进行传输，可能会导致页面长时间白屏。

所以，`Next.js` 会使用 `stream` 流式传输，把页面分解成更小的块，完成后逐步从服务器流式传输到客户端

通过流式传输，我们可以避免缓慢的数据请求阻塞整个页面的渲染。这使得用户在所有数据加载完成前，就能看到并交互页面的部分内容，大大提升了用户体验。

所以，当流式传输传输还未完成，如果用户取消了请求，那么我们就可以使用 `AbortController` 来取消这个流失传输的请求。

```js
const stream = new WritableStream({
  write(chunk, controller) {
    controller.signal.addEventListener('abort', () => {
      // 处理流式传输中止事件
    })
  },
})

const writer = stream.getWriter()
await writer.abort()
```

### 任何事务都可以终止 ###

`AbortController` API 最强大的地方在于你可以为任何操作添加中止功能。如果有一些第三方库不支持中止或者取消
功能，我们可以使用 `AbortController` 来实现。

比如，我们在使用 `Drizzle ORM` 时，如果想要取消多个事务，我们可以这样做：

```js
import { TransactionRollbackError } from 'drizzle-orm'

function makeCancelableTransaction(db) {
  return (callback, options = {}) => {
    return db.transaction((tx) => {
      return new Promise((resolve, reject) => {
        // 如果事务被中止，则回滚事务
        options.signal?.addEventListener('abort', async () => {
          reject(new TransactionRollbackError())
        })

        return Promise.resolve(callback.call(this, tx)).then(resolve, reject)
      })
    })
  }
}
```

上面的例子中，我们在 `signal` 上添加了 `abort` 事件监听器，当调用 `controller.abort()` 时，就会触发
触发我们的事件监听器回调，使用 `TransactionRollbackError` 来回滚整个事务。

使用方法如下：

```js
const db = drizzle(options)

const controller = new AbortController()
const transaction = makeCancelableTransaction(db)

await transaction(
  async (tx) => {
    await tx
      .update(accounts)
      .set({ balance: sql`${accounts.balance} - 100.00` })
      .where(eq(users.name, 'Dan'))
    await tx
      .update(accounts)
      .set({ balance: sql`${accounts.balance} + 100.00` })
      .where(eq(users.name, 'Andrew'))
  },
  { signal: controller.signal }
)
```

## 总结 ##

`AbortController` 是一个非常强大的 API，可以用来中止任何操作。如果只用来取消网络请求的话，那它就太浪费了。

当你想要删除事件监听器，取消流式传输，取消事务、或者进行任何中止逻辑时都可以使用 `AbortController` 来实现。
