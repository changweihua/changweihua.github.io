---
lastUpdated: true
commentabled: true
recommended: true
title: Web Worker和Shared Worker的教程以及案例
description: Web Worker和Shared Worker的教程以及案例
date: 2025-08-26 10:35:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

## 前言 ##

最近做的项目出现了界面卡顿的问题，经过一番排查，发现是因为有个数据做了一些格式化和生成转换，本来只有 1000 条数据，处理完之后变成了 N 万条数据（业务需求），导致页面渲染很慢，甚至会崩溃。于是就想着优化一下。初始化的时候不加载，等需要的时候，再使用 Web Worker 来处理数据，避免主线程卡顿。

## 介绍 Web Worker ##

在介绍之前，先说一下Web Worker是为什么而诞生的。

因为 JavaScript 语言采用的是单线程模型，也就是说，所有任务只能在一个线程上完成，一次只能做一件事。前面的任务没做完，后面的任务只能等着。随着电脑计算能力的增强，尤其是多核 CPU 的出现，单线程带来很大的不便，无法充分发挥计算机的计算能力。

Web Worker 的作用，就是为 JavaScript 创造多线程环境。它是 HTML5 标准的一部分，它赋予了开发者利用 JavaScript 操作多线程的能力。允许主线程创建 Worker 线程，将一些任务分配给 Worker 线程运行。在主线程运行的同时，Worker 线程在后台运行，两者互不干扰。等到 Worker 线程完成计算任务，再把结果返回给主线程。这样的好处是，一些计算密集型或高延迟的任务，被 Worker 线程负担了，主线程（通常负责 UI 交互）就会很流畅，不会被阻塞或拖慢。

## 使用须知及兼容性 ##

在使用 Worker 前，需要先了解一些规则和浏览器的兼容性，避免出现一些问题。

### 使用须知 ###

- **资源耗费**：Worker 线程一旦新建成功就会始终运行，不会被主线程上的活动（比如用户点击按钮、提交表单）打断。这样有利于随时响应主线程的通信。但是也造成了 Worker 比较耗费资源，建议使用完毕就关闭。
- **同源限制**：分配给 Worker 线程运行的脚本文件，必须与主线程的脚本文件同源。
- **DOM 限制**：Worker 线程所在的全局对象是 self，它与主线程不一样，无法读取主线程所在网页的 window，DOM，document，parent 等全局对象，但可以读取主线程的：navigator 和 location 对象。
- **脚本限制**：Web Worker 中可以使用 XMLHttpRequest 和 Axios 发送请求。
- **通信联系**：Worker 线程和主线程不在同一个上下文环境，它们不能直接通信，必须通过消息完成。
- **文件限制**：Worker 线程中无法读取本地文件，即不能打开本机的文件系统（file://），它所加载的脚本，必须来自网络。

### 兼容性 ###

| 浏览器        |      兼容性      |  最低兼容版本 |
| :-----------: | :-----------: | :----: |
| Chrome | 完全兼容 | 4.0 (2008 年) |
| Firefox | 完全兼容 | 3.5 (2009 年) |
| Safari | 完全兼容 | 3.1 (2007 年) |
| Edge | 完全兼容 | 79 (2020 年) |
| IE | 部分兼容 | 10 (2012 年) |
| Opera | 完全兼容 | 10.5 (2010 年) |

## 使用 Web Worker ##

直接使用 JavaScript 原生的 Worker()构造函数，它的参数如下：

| 参数        |      说明      |
| :-----------: | :-----------: |
| path | 有效的 js 脚本的地址，必须遵守同源策略 |
| options.type | 可选。用以指定 worker 类型。该值可以是 classic 或 module，默认 classic |
| options.credentials | 可选。指定 worker 凭证。该值可以是 omit, same-origin，或 include。如果未指定，或者 type 是 classic，将使用默认值 omit (不要求凭证) |
| options.name | 可选。在 DedicatedWorkerGlobalScope 的情况下，用来表示 worker 的 scope 的一个 DOMString 值，主要用于调试目的。 |

### 创建 Web Worker ###

**主线程**

```js
const myWorker = new Worker('/worker.js')

// 接收消息
myWorker.addEventListener('message', (e) => {
	console.log(e.data)
})

// 向 worker 线程发送消息
myWorker.postMessage('Greeting from Main.js')
```

### 与主线程通信 ###

**worker 线程**

```js
// 接收到消息
self.addEventListener('message', (e) => {
	console.log(e.data)
})

// 一顿计算后 发送消息
const calculateDataFn = () => {
	self.postMessage('ok')
}
```

### 终止 Web Worker ###

两个线程里都可以操作，自由选择。

**在主线程中操作**：

```js
// 创建worker
const myWorker = new Worker('/worker.js')
// 关闭worker
myWorker.terminate()
```

**在 worker 线程中操作**：

```javascript
self.close()
```

### 监听错误信息 ###

Web Worker 提供了两个事件监听错误回调，error 和 messageerror。

| 事件        |      描述      |
| :-----------: | :-----------: |
| error | 当 worker 内部出现错误时触发 |
| messageerror | 当 message 事件接收到无法被反序列化的参数时触发 |

**在主线程中操作**：

```js
// 创建worker
const myWorker = new Worker('/worker.js')

myWorker.addEventListener('error', (err) => {
	console.log(err.message)
})

myWorker.addEventListener('messageerror', (err) => {
	console.log(err.message)
})
```

**在 worker 线程**：

```js
self.addEventListener('error', (err) => {
	console.log(err.message)
})
self.addEventListener('messageerror', (err) => {
	console.log(err.message)
})
```

## 使用 Shared Worker ##

SharedWorker 允许多个页面共享同一个后台线程，从而实现更高效的资源利用和协同计算。如下，是一个例子，`page1` 和 `page2` 共享一个后台线程：

```javascript:sharedWorker.js

/**
 * @description 所有连接这个worker的集合
 */
const portsList = []

/**
 * @description 连接成功回调
 */
self.onconnect = (event) => {
	// 当前触发连接的端口
	const port = event.ports[0]
	// 添加进去
	portsList.push(port)
	// 接收到消息的回调
	port.onmessage = (event) => {
		// 获取传递的消息
		const { message, value } = event.data
		// 计算
		let result = 0
		switch (message) {
			case 'add':
				result = value * 2
				break
			case 'multiply':
				result = value * value
				break
			default:
				result = value
		}
		// 给所有连接的目标发送消息
		portsList.forEach((port) => port.postMessage(`${message}结果是：${result}`))
	}
}
```

```js:sharedWorkerHook.js

const sharedWorker = new SharedWorker(new URL('../../utils/webworker.js', import.meta.url), 'test')

export default sharedWorker
```

```vue:page1.vue

<template>
  <div @click="sendMessage">点击1</div>
</template>

<script>
import sharedWorkerHook from './sharedWorkerHook'

export default {
  name: '',
  data() {
    return {}
  },
  computed: {},
  created() {},
  mounted() {
    sharedWorkerHook.port.start()
    // 接收SharedWorker返回的结果
    sharedWorkerHook.port.onmessage = event => {
      console.log(event.data)
    }
  },
  methods: {
    sendMessage() {
      sharedWorkerHook.port.postMessage({ message: 'add', value: 1 })
    }
  }
}
</script>
```

```vue:page2.vue

<template>
  <div @click="sendMessage">点击2</div>
</template>

<script>
import sharedWorkerHook from './sharedWorkerHook'

export default {
  name: '',
  data() {
    return {}
  },
  computed: {},
  created() {},
  mounted() {
    sharedWorkerHook.port.start()
    // 接收SharedWorker返回的结果
    sharedWorkerHook.port.onmessage = event => {
      console.log(event.data)
    }
  },
  methods: {
    sendMessage() {
      sharedWorkerHook.port.postMessage({ message: 'multiply', value: 1 })
    }
  }
}
</script>
```

### 调试 Shared Worker ###

sharedWorker 中调试，使用 console 打印信息，不会出现在主线程的的控制台中，需要在 Chrome 浏览器地址栏输入 chrome://inspect/，进入调试面板才能看到，步骤如下：

1. 在 Chrome 浏览器地址栏输入 `chrome://inspect`，并回车进入
2. 左边菜单栏，点击 sharedWorker
3. 右边菜单栏，点击 inspect，即可打开调试面板


## 使用中的一些坑 ##

在使用中，虽然查阅了一些文档和博客，但是还是出现了以下问题，记录一下。

### Web Worker 中引入了其余文件 ###

有一些场景，需要放到 worker 进程去处理的任务很复杂，就会引入其余文件，这时候，可以在worker线程中利用importScripts()方法加载我们需要的js文件

```javascript
importScripts('./utils.js')
```

如果引入的是ESModule模式，需要在初始化的时候，指定type的模式。

```javascript
const worker = new Worker('/worker.js', { type: 'module' })
```

### 在 WebPack 或 Vite 中使用 ###

在webpack和vite中使用，步骤如下：

#### webpack中使用 ####

第一步：安装插件：`worker-plugin`

```bash
npm install worker-plugin -D
```

第二步：在 `vue.config.js` 的 `configureWebpack.plugins` 中配置

```javascript
const WorkerPlugin = require('worker-plugin')

module.exports = {
  outputDir: 'dist',
  // 其余配置......
  configureWebpack: {
    devServer: {
      open: false,
      host: 'localhost',
      // 其余配置......
    },
    plugins: [
      // 其余配置......
      new WorkerPlugin()
    ]
  }
}
```

第三步：使用

```javascript
const webWorker = new Worker(new URL('../utils/worker.js', import.meta.url), {
  type: 'module'
})
```

#### vite中使用 ####

第一步：安装插件：worker-plugin

```bash
npm install worker-plugin -D
```

第二步：在 `vite.config.js` 的 `plugins` 中配置

```js
import worker from 'worker-plugin'

const viteConfig = defineConfig((mode: ConfigEnv) => {
	return {
		plugins: [vue(), worker()],
		server: {
			host: '0.0.0.0',
			port: 7001,
			open: true
		}
	}
})

export default viteConfig
```

第三步：使用

```javascript
const webWorker = new Worker(new URL('../utils/worker.ts', import.meta.url), {
  type: 'module'
})
```

### sharedWorker的引入问题 ###

在使用sharedWorker的过程中，发现sharedWorker进程里，始终只有一个实例，但是我确实在几个页面都初始化了同一个sharedWorker的js文件，最后调试发现，原因是通过插件引入之后名字变了，一个是 `xxxx0.js`，一个是 `xxxx1.js`，所以导致我每次初始化的时候，都不认为是同一个实例，所以消息无法同步。

**解决办法**：如`[使用 Shared Worker](#5-使用 Shared Worker)`里的例子一样，专门用一个文件new好这个sharedWorker，然后导出，在需要的页面导入后再执行即可。

## 后语 ##

在本文中，我们学习了Web Worker的作用和使用方法，以及如何在Vue中使用Web Worker，最后，我们还学习了Shared Worker的使用方法。

其实webworker家族里还有一位更加强大的成员，那就是Service Worker。它可以做的东西很多，比如拦截全局的fetch事件、缓存静态资源/离线缓存用于首屏加载、后台同步，消息推送等等，奈何篇幅有限，下回再做讲解。
