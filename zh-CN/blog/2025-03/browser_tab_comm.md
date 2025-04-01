---
lastUpdated: true
commentabled: true
recommended: true
title: Vue3 跨标签页通信攻略：四大主流方案解析
description: Vue3 跨标签页通信攻略：四大主流方案解析
date: 2025-03-31 10:00:00
pageClass: blog-page-class
---

# Vue3 跨标签页通信攻略：四大主流方案解析 #

我们假设我们需求是需要新开一个页面，并且这两个页面需要通信，就可以使用到以下的通信方式

## localStorage+storage事件 ##

原理 ：利用浏览器同源标签页共享的 localStorage 存储数据，并通过 storage 事件监听数据变化。

```vue
<!-- src/views/Home.vue -->
<template>
  <div>
    <h1>Home Page</h1>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
onMounted(() => {
  // 标签页 Home：写入数据
  localStorage.setItem("message", "Home Page");
});
</script>
```

`localStorage` 是 HTML5 新增的一个会话存储对象，它允许网页在浏览器中存储键值对形式的数据，并且这些数据不会随着页面的关闭而消失，除非手动删除。

```vue
<!-- src/views/About.vue -->
<template>
  <div>
    <h1>About Page</h1>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
onMounted(() => {
  // 标签页 About：监听变化
  window.addEventListener("storage", (event) => {
    if (event.key === "message") {
      console.log("收到消息:", event.newValue);
    }
  });
});
</script>
```

这样当页面 Home 设置 localStorage 的时候就会被监听到，达到一个不同标签的通信效果。

### 优缺点 ###

- ✅ 简单易用，无需服务器
- ❌ 无法监听当前标签页修改，数据需序列化传输
- ⚠️ 注意：sessionStorage无法触发跨标签事件，因其数据仅窗口级别共享。

那么有人就会有问题了，既然 localStorage  可以，那 sessionStorage 可不可以呢？答案是不行的。
因为 storage 事件的触发条件是：当 localStorage 或 sessionStorage 中的数据发生变化时，除了触发变化的窗口（或标签页）之外，同一源下的其他窗口（或标签页）会收到 storage 事件。

由于 sessionStorage 的数据是窗口（或标签页）级别的，不同标签页之间的 sessionStorage 是相互隔离的，一个标签页对 sessionStorage 的修改不会影响其他标签页，因此 sessionStorage 的变化不会触发其他标签页的 storage 事件。


## BroadcastChannel API ##

原理 ：BroadcastChannel API 是 HTML5 新增的一种在浏览器中实现跨窗口、跨标签页甚至跨工作线程进行通信的机制。它提供了一种简单而有效的方式，让同源的不同浏览上下文（如不同窗口、标签页、iframe 或 Web Worker）之间可以相互发送和接收消息。

```vue
<!-- src/views/Home.vue -->
<template>
  <div>
    <h1>Home Page</h1>
    <el-button @click="sendMessage">发送消息</el-button>
  </div>
</template>

<script setup>
const sendMessage = () => {
  // 标签页 Home：发送消息
  //   1. 创建 BroadcastChannel 实例
  // 要使用 BroadcastChannel，首先需要创建一个 BroadcastChannel 实例，并指定一个频道名称。频道名称是一个字符串，用于标识不同的通信频道。这里的频道就是 "chat"。
  const channel = new BroadcastChannel("chat");

  //   2. 发送消息
  // 使用 postMessage 方法向指定频道发送消息。消息可以是任何可以序列化的数据类型，如字符串、对象、数组等。
  channel.postMessage("Home Message");
};
</script>
```

```vue
<!-- src/views/About.vue -->
<template>
  <div>
    <h1>About Page</h1>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
onMounted(() => {
  const channel = new BroadcastChannel("chat");
  //   3. 接收消息
  // 通过监听 message 事件来接收其他上下文发送到该频道的消息。
  channel.onmessage = (event) => {
    console.log("收到消息:", event.data); // 监听消息
  };
});
</script>
```

这是现代项目中常用的一种通信方式，利用 BroadcastChannel Api 在两个页面分别发送与监听

### 优缺点 ###

- ✅ 实时性强，代码简洁
- ❌ 不支持 IE 浏览器
- ⚠️ 需注意频道名称全局唯一，避免冲突。


## WebSocket ##

原理 ：通过服务器中转消息，实现全双工通信。

```vue
<template>
  <div>
    <h1>WebSocket 示例</h1>
    <el-button @click="connectWebSocket">连接 WebSocket</el-button>
    <el-button @click="sendMessage" :disabled="!socket">发送消息</el-button>
    <el-button @click="closeWebSocket" :disabled="!socket">关闭连接</el-button>
    <ul>
      <li v-for="(message, index) in receivedMessages" :key="index">
        {{ message }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 存储 WebSocket 实例
const socket = ref(null);
// 存储接收到的消息
const receivedMessages = ref([]);

// 连接 WebSocket
const connectWebSocket = () => {
  // 创建 WebSocket 实例，这里以 echo.websocket.org 为例，它是一个公共的 WebSocket 测试服务器，省去了自己搭建服务器的麻烦
  socket.value = new WebSocket("wss://echo.websocket.org");

  // WebSocket 连接成功时触发
  socket.value.onopen = () => {
    console.log("WebSocket 连接成功");
    receivedMessages.value.push("WebSocket 连接成功");
  };

  // 接收到服务器消息时触发
  socket.value.onmessage = (event) => {
    console.log("接收到消息:", event.data);
    receivedMessages.value.push(event.data);
  };

  // WebSocket 连接关闭时触发
  socket.value.onclose = () => {
    console.log("WebSocket 连接已关闭");
    receivedMessages.value.push("WebSocket 连接已关闭");
    socket.value = null;
  };

  // WebSocket 发生错误时触发
  socket.value.onerror = (error) => {
    console.error("WebSocket 发生错误:", error);
    receivedMessages.value.push("WebSocket 发生错误");
  };
};

// 发送消息到服务器
const sendMessage = () => {
  if (socket.value) {
    const message = "Hello, WebSocket!";
    socket.value.send(message);
    receivedMessages.value.push(`发送消息: ${message}`);
  }
};

// 关闭 WebSocket 连接
const closeWebSocket = () => {
  if (socket.value) {
    socket.value.close();
  }
};
</script>
```

实际项目中 WebSocket 的服务器一般由后端搭建，这里用一个公共的测试服务器为例

### 优缺点 ###

- ✅ 支持跨域，实时性高
- ❌ 需维护服务器，复杂度高
- ⚠️ 实际项目需自建服务器，确保安全性。

## SharedWorker ##

原理 ：SharedWorke r是一种特殊类型的Worker，它可以在多个浏览器上下文（如窗口、iframe等）之间共享。

```vue
<template>
  <el-card>
    <template #header>
      <div class="card-header">SharedWorker 通信示例</div>
    </template>
    <el-button id="sendMessageButton" @click="sendMessage"
      >发送消息到 SharedWorker</el-button
    >
    <el-card v-if="response" style="margin-top: 20px">
      <template #header>
        <div>响应内容</div>
      </template>
      <div>{{ response }}</div>
    </el-card>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from "vue";

// 创建 SharedWorker 实例，指定工作线程脚本文件路径
const worker = new SharedWorker("sharedWorker.js");

// 存储接收到的响应
const response = ref("");

const sendMessage = () => {
  const message = "Hello, SharedWorker!";
  // 向 SharedWorker 发送消息
  worker.port.postMessage(message);
  console.log("向 SharedWorker 发送消息:", message);
};

onMounted(() => {
  // 监听 SharedWorker 的消息事件
  worker.port.onmessage = function (event) {
    const newResponse = event.data;
    console.log("从 SharedWorker 接收到响应:", newResponse);
    // 更新响应内容
    response.value = newResponse;
  };

  // 启动端口通信
  worker.port.start();
});
</script>
```

```js
// sharedWorker.js 文件，需要放在 public
// 创建一个消息通道，用于在不同上下文和工作线程之间通信
self.onconnect = function (e) {
  // 获取端口对象，用于接收和发送消息
  const port = e.ports[0];

  // 监听端口的消息事件
  port.onmessage = function (event) {
    const message = event.data;
    console.log("SharedWorker 接收到消息:", message);

    // 向发送消息的端口回复消息
    const response = `SharedWorker 已收到消息: ${message}`;
    port.postMessage(response);
  };
};
```

### 注意： ###

- **同源策略**：SharedWorker 遵循同源策略，即 sharedWorker.js 文件必须与主页面文件同源（相同的协议、域名和端口）。如果直接通过 file:// 协议打开 HTML 文件，会因同源策略限制而导致 SharedWorker 无法正常工作。如果想在本地用html文件进行测试，需要启动一个服务器，Live Serve 可以满足需求。
- **文件路径**：在 Vue 项目中，通常将 sharedWorker.js 文件放在 public 目录下，因为该目录下的文件不会经过 Webpack、vite 处理，构建后文件的路径和名称保持不变，确保 SharedWorker 能够正确加载脚本文件。
- **兼容性**：SharedWorker 在现代浏览器中得到了广泛支持，但在一些旧版本的浏览器中可能不支持。在使用时，建议进行兼容性检查或使用 Polyfill 来确保在不同浏览器中的兼容性。

### 优缺点 ###

- ✅ 无需服务器，支持复杂逻辑
- ❌ 兼容性有限（不支持 IE），调试困难
- ⚠️ 需注意同源策略，本地测试需启动服务器。

常见的跨标签页通信就是这四种，还有一些不常用的比如：postMessage 、ServiceWorker。 要么比较复杂，要么有明显缺陷，在这里就不多展开。总结一下使用场景 👇

| **场景**        |      **推荐方案**      |  **原因** |
| :------------- | :-----------: | :----: |
| 简单数据同步      | localStorage / BroadcastChannel | 轻量且无需服务器 |
| 实时通信      | BroadcastChannel / WebSocket | 事件驱动或服务器推送 |
| 跨域需求      | WebSocket | 支持跨域协议 |
| 复杂计算逻辑      | SharedWorker | 分担主线程压力 |
| 兼容性优先      | localStorage + WebSocket | 覆盖旧浏览器与跨域需求 |
