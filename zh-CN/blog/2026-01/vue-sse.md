---
lastUpdated: true
commentabled: true
recommended: true
title: 🔥前端流式输出宇宙级攻略
description: 彻底吃透 SSE、Fetch Stream
date: 2026-01-06 14:45:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

在AI重塑前端开发的今天，AI应用框架前端工程师正成为最具潜力的技术方向。要成为这个领域的专家，你需要掌握这些核心能力：

> **🚀 AI交互全链路开发能力**
>
> - 智能对话引擎封装（LLM Integration）
> - 多模态输入/输出处理（Multi-modal IO）
> - 可视化Agent工作流（Agent Visualization）
> - 数据驱动UI架构（Data-driven Rendering）

今天，我们将深入其中最关键的交互技术——流式输出（Streaming） ，这是提升AI产品用户体验的胜负手！

## 🤔 一、什么是流式输出？为什么它这么香？ ##

想象一下，你去餐厅点菜：

**传统方式**：厨师做完整桌菜才一起端上来，你饿得前胸贴后背

**流式输出**：做好一道上一道，你可以边吃边等，体验爽翻天

流式输出就是数据一边生成一边传输，用户不用干等，看着内容逐渐出现，就像看直播一样过瘾！

## 🎯 二、适用场景 ##

- AI对话：ChatGPT那种打字机效果


## 💪 三、3大方案深度对比 ##

### 🌟 方案一：EventSource - 最简单但最“直男” ###

```javascript
// 基本用法（GET请求专用）  
const es = new EventSource('/api/chat');  
es.onmessage = (e) => {  
  console.log(e.data); // 数据长这样 → "你好呀..."  
};  
```

**优点**：

- 浏览器原生支持，不需要额外库
- 自动重连，网络断了会自己恢复

**缺点**：

- 只支持GET请求（想POST？没门！😅）
- 不能自定义请求头（想带token？抱歉！）
- 只支持UTF-8编码
- IE直接扑街：没错，微软又不支持！🙄

## 🚀 方案二：Fetch API + ReadableStream - 最灵活但手酸 ##

```javascript
// 高级玩家必备（能POST、能传Header！）  
const res = await fetch('/api/chat', {  
  method: 'POST',  
  headers: {'Token': '123'}  
});  
const reader = res.body.getReader(); // 拿到“水管龙头”  

while (true) {  
  const { done, value } = await reader.read(); // 一勺一勺喝汤  
  if (done) break;  
  const text = new TextDecoder().decode(value); // 二进制转文字  
  console.log(text);  
}  
```

**优点**：

- 支持所有HTTP方法，能发POST！能加Header！自由度拉满！
- 现代浏览器都支持
- 连二进制流（比如PDF下载进度）都能处理！

**缺点**：

- 要自己管关闭流、错误重试，代码写到你怀疑人生🤦‍♂️

## 🎨 方案三：fetch-event-source - 微软大佬的“轮椅” ##

```javascript
// 企业级推荐！（自带重试、断线续传）  
import { fetchEventSource } from '@microsoft/fetch-event-source';  

await fetchEventSource('/api/chat', {  
  method: 'POST',  
  headers: { 'Token': '123' },  
  onmessage(msg) {  
    console.log(msg.data); // 真香！  
  }  
});  
```

**优点**：

- 结合了前两者的优点
- 支持POST请求和自定义头部
- 自动重连和错误处理
- 微软出品，质量有保证

**缺点**：

- 需要额外安装库
- 包体积稍大一点

## 🎯 四、技术选型决策树 ##

```txt
你的项目需求是什么？
├── 简单的GET请求推送 → EventSource
├── 需要POST请求/自定义头部
│   ├── 项目允许引入外部库 → fetch-event-source  
│   └── 不允许外部依赖 → Fetch + ReadableStream
└── 需要精确控制流处理 → Fetch + ReadableStream
```

**💁‍♂️tips**：

- 流式输出经验少闭眼选 `fetch-event-source`
- 技术大佬选 `Fetch + ReadableStream`

## 💡 五、Vue/React里怎么用？ ##

### 🔥 Vue 3 + fetch-event-source：响应式流数据处理 ###

**封装流式请求工具(sseUtils.js)**

```JavaScript
// src/utils/sseUtils.js
import { fetchEventSource } from '@microsoft/fetch-event-source';

/**
 * 流式请求封装
 * @param {string} url - 请求地址
 * @param {Object} options - 配置选项
 * @param {Object} options.body - 请求体
 * @param {Object} options.headers - 请求头
 * @param {function} options.onMessage - 消息处理回调
 * @param {function} options.onOpen - 连接打开回调
 * @param {function} options.onClose - 连接关闭回调
 * @param {function} options.onError - 错误处理回调
 * @returns {Promise} 返回一个可取消的Promise
 */
export const createSSEConnection = (url, {
  body,
  headers = {},
  onMessage,
  onOpen,
  onClose,
  onError
}) => {
  // 创建一个AbortController用于取消请求
  const ctrl = new AbortController();
  
  // 返回一个包含取消方法的Promise
  return {
    promise: fetchEventSource(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
      async onopen(response) {
        if (response.ok) {
          onOpen?.();
          return; // 一切正常，继续
        }
        throw new Error(`Server error: ${response.status}`);
      },
      onmessage(msg) {
        try {
          // 如果数据是JSON格式则解析，否则直接使用
          const data = msg.data ? JSON.parse(msg.data) : msg.data;
          onMessage?.(data);
        } catch (err) {
          console.error('Failed to parse message data', err);
        }
      },
      onclose() {
        onClose?.();
      },
      onerror(err) {
        onError?.(err);
        throw err; // 重新抛出以停止重试
      }
    }),
    cancel: () => ctrl.abort()
  };
};
```

**在 Vue3 组件中使用 (StreamComponent.vue)**

```vue
<script setup>
import { ref, onUnmounted } from 'vue';
import { createSSEConnection } from '@/utils/sseUtils';

const streamData = ref(''); // 存储流式数据
const isLoading = ref(false); // 加载状态
const error = ref(null); // 错误信息
let sseConnection = null; // 存储SSE连接

// 发起流式请求
const startStream = async () => {
  try {
    // 重置状态
    streamData.value = '';
    isLoading.value = true;
    error.value = null;
    
    // 创建SSE连接
    sseConnection = createSSEConnection('https://api.example.com/stream', {
      body: { query: '获取流式数据' },
      onMessage: (data) => {
        // 企业技巧1: 使用函数式更新避免重复触发响应式
        streamData.value += data;
        
        // 企业技巧2: 自动滚动到底部 (适用于聊天场景)
        nextTick(() => {
          const container = document.getElementById('stream-container');
          if (container) {
            container.scrollTop = container.scrollHeight;
          }
        });
      },
      onOpen: () => {
        console.log('连接已建立');
      },
      onClose: () => {
        isLoading.value = false;
        console.log('连接已关闭');
      },
      onError: (err) => {
        isLoading.value = false;
        error.value = err.message;
        console.error('发生错误:', err);
      }
    });
    
    await sseConnection.promise;
  } catch (err) {
    if (err.name !== 'AbortError') {
      error.value = err.message;
    }
  } finally {
    isLoading.value = false;
  }
};

// 停止流式请求
const stopStream = () => {
  if (sseConnection) {
    sseConnection.cancel();
    sseConnection = null;
  }
};

// 组件卸载时自动取消请求
onUnmounted(() => {
  stopStream();
});

// 企业技巧3: 使用计算属性处理流式数据
const processedStreamData = computed(() => {
  return streamData.value
    .replace(/\n/g, '<br>') // 换行转换
    .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;'); // 制表符转换
});
</script>

<template>
  <div class="stream-container">
    <h2>流式数据演示</h2>
    
    <!-- 控制按钮 -->
    <div class="controls">
      <button @click="startStream" :disabled="isLoading">开始流式请求</button>
      <button @click="stopStream" :disabled="!isLoading">停止</button>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading">加载中...</div>
    
    <!-- 错误显示 -->
    <div v-if="error" class="error">{{ error }}</div>
    
    <!-- 流式数据展示 -->
    <div 
      id="stream-container"
      class="stream-content"
      v-html="processedStreamData"
    ></div>
    
    <!-- 企业技巧4: 显示数据统计 -->
    <div class="stats">
      已接收: {{ streamData.length }} 字符 | 
      行数: {{ (streamData.match(/\n/g) || []).length + 1 }}
    </div>
  </div>
</template>
```

### ⚛️ React + Fetch ReadableStream：Hooks让一切变简单 ###

```javascript
import { useState, useEffect, useCallback } from 'react';

function useStreamData(url) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const startStream = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url);
      const reader = response.body.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
          if (line.startsWith('data: ')) {
            const jsonData = JSON.parse(line.slice(6));
            // 使用函数式更新，避免闭包陷阱
            setData(prev => [...prev, jsonData]);
          }
        });
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [url]);
  
  return { data, isLoading, error, startStream };
}

// 使用自定义Hook
function ChatComponent() {
  const { data, isLoading, startStream } = useStreamData('/api/chat');
  
  return (
    <div>
      <button onClick={startStream}>开始对话</button>
      {data.map((msg, index) => (
        <div key={index}>{msg.content}</div>
      ))}
    </div>
  );
}
```

## 🎯 六、框架集成的关键要点 ##

**Vue最佳实践**：

- `streamData.value + data` 增量更新，减少不必要的重新渲染
- 使用计算属性处理流式数据
- 别忘了在 `onUnmounted` 里清理资源

**React最佳实践**：

- 用 `useCallback` 缓存函数，避免无限重渲染
- 用函数式更新 `setData(prev => [...prev, newData])`，避免闭包问题
- 自定义 `Hook` 让逻辑复用更简单

## 💥 七、常见的坑，踩过的都懂 ##

### 🕳️ 坑1：内存泄漏大户 ###

```javascript
// ❌ 错误示范：忘记关闭连接
function BadComponent() {
  useEffect(() => {
    const eventSource = new EventSource('/api/stream');
    // 没有清理，组件卸载后连接还在！
  }, []);
}

// ✅ 正确姿势：记得清理
function GoodComponent() {
  useEffect(() => {
    const eventSource = new EventSource('/api/stream');
    
    return () => {
      eventSource.close(); // 组件卸载时关闭连接
    };
  }, []);
}
```

### 🕳️ 坑2：移动端的无情背刺 ###

```javascript
// 移动端网络切换时，需要重新连接
function handleNetworkChange() {
  window.addEventListener('online', () => {
    // 网络恢复，重新连接
    reconnectStream();
  });
  
  window.addEventListener('offline', () => {
    // 网络断开，清理连接
    closeStream();
  });
}
```

### 🕳️ 坑3：CORS的老大难 ###

```javascript
// 后端需要设置正确的CORS头
// Access-Control-Allow-Origin: *
// Access-Control-Allow-Headers: Cache-Control
// Cache-Control: no-cache  // SSE必须设置，不然浏览器会缓存

// 前端带认证token的正确姿势
const eventSource = new EventSource('/api/stream?token=your-token');
// 或者用fetch-event-source
fetchEventSource('/api/stream', {
  headers: {
    'Authorization': 'Bearer your-token'
  }
});
```

## 🚀 八、高级玩法：让你的应用更丝滑 ##

### 📊 大数据量流式渲染优化 ###

当流数据量很大时（比如AI生成长文、实时日志），需要考虑性能优化：

```javascript
// React实现：大数据量虚拟滚动
import { useState, useMemo, useCallback } from 'react';

function useLargeStreamRenderer(containerHeight = 400, itemHeight = 60) {
  const [allMessages, setAllMessages] = useState([]);
  const [scrollTop, setScrollTop] = useState(0);

  // 计算可见区域
  const visibleData = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 5); // 5个缓冲
    const endIndex = Math.min(allMessages.length - 1, startIndex + visibleCount + 10);
    
    return {
      items: allMessages.slice(startIndex, endIndex + 1),
      startIndex,
      totalHeight: allMessages.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [allMessages, scrollTop, containerHeight, itemHeight]);

  const addMessage = useCallback((message) => {
    setAllMessages(prev => {
      const updated = [...prev, message];
      // 超过1万条消息时，保留最新的8000条
      return updated.length > 10000 ? updated.slice(-8000) : updated;
    });
  }, []);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    visibleData,
    totalCount: allMessages.length,
    addMessage,
    handleScroll
  };
}
```

### 🔄 智能重连策略 ###

```javascript
// 企业级重连管理器
class SmartReconnector {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 5;
    this.backoffStrategy = options.backoffStrategy || 'exponential';
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    
    this.retryCount = 0;
    this.isConnecting = false;
  }

  async reconnect(connectFn) {
    if (this.retryCount >= this.maxRetries) {
      throw new Error('已达到最大重试次数');
    }

    const delay = this.calculateDelay();
    await this.sleep(delay);

    this.isConnecting = true;
    this.retryCount++;

    try {
      await connectFn();
      this.reset(); // 连接成功，重置计数
      return true;
    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }

  calculateDelay() {
    switch (this.backoffStrategy) {
      case 'linear':
        return Math.min(this.baseDelay * this.retryCount, this.maxDelay);
      case 'exponential':
        return Math.min(this.baseDelay * Math.pow(2, this.retryCount), this.maxDelay);
      default:
        return this.baseDelay;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  reset() {
    this.retryCount = 0;
    this.isConnecting = false;
  }
}
```

## 🎉 总结 ##

掌握了这些内容，你就能：

- 被面试官问到项目难点，直接把前文中的流式请求组件封装甩给他
- 面试时自信地讨论各种流式输出方案的优劣
- 项目里写出健壮、高性能的企业级代码

SSE流式输出不再是难题，而是你技术栈中的一把利器！🔥

## Vue3连接SSE，并且返回结果用打字机效果呈现 ##

```vue
<script setup>
import { ref,onMounted,onUnmounted } from 'vue';
const sse = ref()
const reconnectAttempts = ref(0)
const timer = ref()
onMounted(()=>{
    initSSE();
})
onUnmounted(() => {
    if (sse.value) {
        sse.value.close();
    }
    // 清除定时器
    clearTimeout(timer.value);
});
const initSSE = () => {
    sse.value = new EventSource(`http://192.168.16.18:8888/sse/subscribe?userId=1`);
    sse.value.onopen = function (e) {
        console.log(e, "连接成功");
        reconnectAttempts.value = 0; // 重置重连次数
    };
    sse.value.onmessage = (event) => {
        console.log(event.data)
    }
    sse.value.onerror = (error) => {
        console.error("SSE 连接出错：", error);
        sse.value.close();
        sse.value = null;
        // 自动重连逻辑
        reconnectAttempts.value++;
        const reconnectDelay = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts.value)); // 计算重连延迟，最大延迟为30秒
        console.log(`将在 ${reconnectDelay} 毫秒后尝试重连...`);
        // 等待一定时间后重连
        setTimeout(() => {
            if (!sse.value) {
                console.log("尝试重连 SSE...");
                initSSE(); // 递归调用重连
            }
        }, reconnectDelay);
    }
}
</script>
```

## `@microsoft/fetch-event-source` 如何捕获非流式错误响应 ##

### 概述 ###

在使用 `@microsoft/fetch-event-source` 库处理 Server-Sent Events (SSE) 流式请求时，虽然正常情况下该库表现良好，但在处理服务器错误响应时存在错误捕获困难的问题。本文档提供了完整的解决方案和最佳实践。

### 技术背景 ###

#### SSE 流式请求特点 ####

- 长连接通信：建立持久化连接接收服务器推送数据
- 实时数据流：适用于 AI 对话、实时通知等场景
- 错误处理复杂：网络错误、服务器错误、数据格式错误等多种异常情况

#### 库的默认行为 ####

```javascript
// 默认配置
{
  headers: {
    "Accept": "text/event-stream"  // 仅接受 SSE 格式
  }
}
```

### 问题分析 ###

#### 问题 1：HTTP 500 错误无法捕获 ####

**故障现象**：

- 服务器返回 500 状态码
- 控制台中无可预览的响应内容
- `onerror` 回调无法获取详细错误信息
- 开发者无法判断具体错误原因

**根本原因**：

```javascript
// 问题代码
headers: {
  "Accept": "text/event-stream"  // 仅接受 SSE 格式，拒绝其他类型响应
}
```

当服务器返回错误时，通常以 `application/json` 格式返回错误详情，但由于 Accept 头限制，浏览器拒绝处理非 SSE 格式的响应。

#### 问题 2：响应体解析失败 ####

**故障现象**：

- 控制台可以看到错误响应
- 代码中无法获取响应体内容
- 错误处理逻辑无法执行
- 用户体验受影响

**根本原因**：

缺少对非流式响应的处理逻辑，错误响应通常是一次性的 JSON 数据而非流式数据。

### 解决方案 ###

#### 方案 1：Accept 头配置优化 ####

**核心修改**：

```javascript
// ❌ 错误配置
headers: {
  "Accept": "text/event-stream"
}

// ✅ 正确配置
headers: {
  "Accept": "*/*"  // 接受所有类型的响应
}
```

**生效结果**：

- 实际请求头变为：`Accept: */*,text/event-stream`
- 兼容 SSE 流式响应和 JSON 错误响应
- 控制台可正常显示错误信息

#### 方案 2：onopen 回调增强 ####

**实现错误捕获逻辑**：

```javascript
onopen: async (response) => {
  if (response.ok) {
    const contentType = response.headers.get("content-type");

    // 检查响应类型
    if (!contentType?.startsWith("text/event-stream")) {
      try {
        // 解析非流式响应（通常是错误信息）
        const errorData = await response.json();

        // 处理业务错误
        if (errorData.code === 202 && !errorData.success) {
          console.error("业务错误:", errorData.message);
          // 执行错误处理逻辑
          handleBusinessError(errorData);
        }
      } catch (parseError) {
        console.error("响应解析失败:", parseError);
      }
    }
  } else {
    // HTTP 状态码错误处理
    console.error(`HTTP ${response.status}: ${response.statusText}`);
  }
};
```

### 完整实现方案 ###

#### 基础配置 ####

```javascript
import { fetchEventSource } from "@microsoft/fetch-event-source";

/**
 * 创建增强的 SSE 连接
 * @param {Object} config - 配置参数
 */
function createEnhancedSSEConnection(config) {
  const controller = new AbortController();

  return fetchEventSource(config.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Accept: "*/*", // 关键配置：接受所有响应类型
      Token: config.token,
      ...config.headers,
    },
    body: JSON.stringify(config.data),
    signal: controller.signal,

    // 连接建立时的处理
    onopen: async (response) => {
      console.log("SSE连接状态:", response.status, response.statusText);

      if (response.ok) {
        const contentType = response.headers.get("content-type");

        // 判断是否为流式响应
        if (!contentType?.startsWith("text/event-stream")) {
          try {
            const responseData = await response.json();

            // 业务错误处理
            if (!responseData.success) {
              handleBusinessError(responseData);
              return;
            }

            // 非预期的非流式成功响应
            console.warn("收到非流式成功响应:", responseData);
          } catch (error) {
            console.error("非流式响应解析失败:", error);
          }
        }
      } else {
        // HTTP 错误处理
        try {
          const errorText = await response.text();
          console.error(`HTTP ${response.status}:`, errorText);
        } catch (error) {
          console.error(`HTTP ${response.status}: 无法读取错误详情`);
        }
      }
    },

    // 消息处理
    onmessage: (event) => {
      try {
        const data = JSON.parse(event.data);
        config.onMessage?.(data);
      } catch (error) {
        console.error("SSE消息解析失败:", error, "原始数据:", event.data);
      }
    },

    // 连接关闭处理
    onclose: () => {
      console.log("SSE连接已关闭");
      config.onClose?.();
    },

    // 错误处理
    onerror: (error) => {
      console.error("SSE连接错误:", error);
      config.onError?.(error);
    },
  });
}

/**
 * 业务错误处理函数
 */
function handleBusinessError(errorData) {
  const errorMap = {
    202: "认证失败，请重新登录",
    400: "请求参数错误",
    403: "权限不足",
    429: "请求过于频繁，请稍后重试",
    500: "服务器内部错误",
  };

  const message = errorMap[errorData.code] || errorData.message || "未知错误";

  console.error(`业务错误 [${errorData.code}]:`, message);

  // 根据错误类型执行相应操作
  switch (errorData.code) {
    case 202:
      // 认证失败，跳转登录
      redirectToLogin();
      break;
    case 429:
      // 频率限制，显示提示
      showRateLimitWarning();
      break;
    default:
      // 通用错误提示
      showErrorMessage(message);
  }
}
```

> 从 Buffer 到响应式流：Vue3 实现 AI 流式输出的完整实践

在现代 Web 开发中，AI 聊天机器人、智能助手等应用越来越普及。为了提升用户体验，流式输出（Streaming Output）成为一种重要的交互方式——用户无需等待模型生成全部内容，而是随着 token 的生成实时看到结果，仿佛“打字机”般逐字呈现。

结合 HTML5 的 `Buffer` 概念与 Vue3 响应式机制，深入讲解如何实现一个简洁高效的 AI 流式输出前端实例。

## 理解 Buffer：流式数据的基础 ##

在开始构建 Vue 应用之前，有必要先理解 *Buffer（缓冲区）* 的作用。任何网络传输或文件读写本质上都是以二进制形式进行的。JavaScript 提供了 `ArrayBuffer` 作为底层内存容器，配合 `TypedArray`（如 `Uint8Array`）进行操作。

HTML5 引入了两个关键 API：

- `TextEncoder`：将字符串编码为 `UTF-8` 格式的 `Uint8Array`
- `TextDecoder`：将 `Uint8Array` 解码回字符串

```vue
<!-- 示例：Buffer 编解码 -->
<script>
  const encoder = new TextEncoder();
  const myBuffer = encoder.encode("你好 HTML5"); // Uint8Array [228, 189, 160, ...]
  
  const buffer = new ArrayBuffer(12);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < myBuffer.length; i++) {
    view[i] = myBuffer[i];
  }
  
  const decoder = new TextDecoder();
  const originalText = decoder.decode(buffer); // "你好 HTML5"
</script>
```

这个过程揭示了：*所有文本在网络中传输时，都以二进制流（Buffer）的形式存在*。当我们通过 `fetch` 接收 AI 模型的流式响应时，返回的正是这种原始字节流，需要通过 `TextDecoder` 逐步解码为可读文本。

## 为什么需要流式输出？ ##

传统 API 调用通常采用“请求-等待-返回全部结果”的模式。但对于大语言模型（LLM），生成一段长文本可能耗时数秒。若等到全部生成完毕才返回，用户会感到卡顿、无反馈，体验极差。

而 *流式输出（Streaming）* 允许后端一边生成 token，一边向前端推送。前端则可以即时渲染，让用户感受到“正在思考”的动态过程，极大提升交互流畅度和心理预期。

主流 LLM API（如 DeepSeek、OpenAI）均支持 `stream: true` 参数，返回格式为 Server-Sent Events (SSE) ，每条消息以 `data: {...}` 开头，结束时发送 `data: [DONE]`。

下面是一个 `Streaming` 的实例的展示：

![](/images/ai_sse.gif){data-zoomable}

## Vue3 + Vite 快速搭建流式聊天界面 ##

使用 Vite 初始化 Vue3 项目是当前最高效的开发方式：

```bash
npm init vite@latest
# 选择 Vue + TypeScript
```

核心逻辑集中在 `<script setup>` 中，利用 Vue3 的 ref 实现响应式数据绑定。

### 响应式状态管理 ###

```ts
import { ref } from 'vue'

const question = ref('讲一个风与风铃的故事,不低于200字')
const stream = ref(true)
const content = ref("")
```

- `question`：用户输入的问题
- `stream`：是否启用流式输出（可切换调试）
- `content`：AI 生成的内容，模板中直接绑定，自动更新

### 调用 DeepSeek API ###

```javascript
const askLLM = async () => {
  if (!question.value) return
  
  content.value = "烧烤中..." // 用户友好提示
  
  const endpoint = 'https://api.deepseek.com/chat/completions'
  const headers = {
    'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
    'Content-Type': 'application/json'
  }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      stream: stream.value,
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: question.value }]
    })
  })
```

注意：API Key 通过 `.env` 文件配置（`VITE_DEEPSEEK_API_KEY`），避免硬编码泄露。

## 处理流式响应：逐块解析 SSE 数据 ##

当 `stream: true` 时，`response.body` 是一个可读流（ReadableStream）。我们需要通过 `getReader()` 获取 `reader`，并循环读取数据块。

```ts
if (stream.value) {
  content.value = ""
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  let done = false
  let buffer = '' // 用于拼接不完整的 chunk

  while (!done) {
    const { value, done: doneReading } = await reader?.read()
    done = doneReading
    
    // 将新 chunk 与缓冲区拼接
    const chunkValue = buffer + decoder.decode(value, { stream: true })
    buffer = ''
    
    // 按行分割，过滤出 data 行
    const lines = chunkValue.split('\n').filter(line => line.startsWith('data: '))
    
    for (const line of lines) {
      const incoming = line.slice(6) // 去掉 "data: "
      
      if (incoming === '[DONE]') {
        done = true
        break
      }
      
      try {
        const data = JSON.parse(incoming)
        const delta = data.choices[0].delta.content
        if (delta) {
          content.value += delta // 响应式更新！
        }
      } catch (err) {
        // 若 JSON 解析失败，说明该行不完整，暂存到 buffer
        buffer += `data: ${incoming}\n`
      }
    }
  }
}
```

**关键细节解析**：

- `decoder.decode(value, { stream: true })`

告诉解码器这不是最后一块数据，避免因 UTF-8 多字节字符被截断而报错。

- 缓冲区 `buffer` 的作用

网络传输可能将一行 `data: {...}` 拆成多个 chunk。若某次读取只收到一半，需暂存到 `buffer`，下次拼接后再解析。

- 错误处理

使用 `try...catch` 捕获 `JSON.parse` 异常，防止因不完整数据导致程序崩溃。

- 响应式更新

`content.value += delta` 会自动触发 Vue 模板重渲染，无需手动操作 DOM。

## 模板与样式：简洁直观的 UI ##

```vue
<template>
  <div class="container">
    <div>
      <label>输入：</label>
      <input v-model="question" />
      <button @click="askLLM">提交</button>
    </div>
    <div class="output">
      <label>Streaming</label>
      <input type="checkbox" v-model="stream"/>
      <div>{{ content }}</div>
    </div>
  </div>
</template>
```

通过 `v-model` 实现双向绑定，用户可随时切换流式/非流式模式，便于对比体验差异。

## 总结：技术融合带来卓越体验 ##

本项目虽小，却融合了多项现代 Web 技术：

- **HTML5 Buffer API**：理解底层数据流
- **Fetch + ReadableStream**：处理实时网络流
- **Vue3 响应式系统**：简化状态管理与 DOM 更新
- **LLM Streaming 协议**：对接 AI 能力

流式输出不仅是技术实现，更是对用户体验的尊重。它让 AI 不再是“黑箱”，而是有呼吸、有节奏的对话伙伴。

未来，可进一步优化：

- 添加加载动画
- 支持多轮对话
- 自动滚动到底部
- 错误重试机制

但核心思想不变：用 `Buffer` 理解数据，用响应式拥抱变化，用流式传递温度。

> 代码即思想，体验即产品。
