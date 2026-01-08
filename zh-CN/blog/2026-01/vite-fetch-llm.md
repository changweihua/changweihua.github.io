---
lastUpdated: true
commentabled: true
recommended: true
title: 前端调用大模型实战
description: Vite 全栈配置 + Fetch 请求最佳实践
date: 2026-01-08 10:30:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

在 AI 原生应用开发中，前端直接调用大模型 API 已成为高频场景 —— 无需后端中转即可快速实现对话、生成等核心功能。本文结合工程化实践，从 Vite 全栈项目初始化到 Fetch 复杂请求封装，手把手教你搭建可落地的前端大模型调用方案，干货密集，新手也能直接复用！

## 一、项目初始化：Vite 全栈脚手架搭建 ##

相比原生 HTML/CSS/JS 项目，Vite 的热更新、工程化支持、全栈适配能力更适合生产级项目。以下是完整初始化流程：

### 基础项目创建 ###

```bash
# 初始化Vite项目（支持Vue/React/原生JS，这里以原生TS为例）
npm create vite@latest llm-frontend -- --template vanilla-ts
cd llm-frontend
npm install

# 安装可选依赖（请求工具增强、类型提示）
npm install axios  # 可选，本文以原生Fetch为主，axios作为补充方案
npm install -D @types/node  # 环境变量类型支持
```

### 核心 Vite 配置（vite.config.ts） ###

重点解决*跨域问题*（前端直接调用第三方 LLM API 必踩坑）和*环境变量暴露*，配置如下：

```javascript
import { defineConfig, loadEnv } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  // 加载环境变量（区分开发/生产环境）
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  
  return {
    // 项目基础配置
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'), // 路径别名，方便导入
      },
    },
    // 开发服务器配置（解决跨域）
    server: {
      proxy: {
        // 配置代理前缀，避免直接暴露第三方API地址
        '/api/llm': {
          target: env.VITE_LLM_API_BASE_URL, // 目标API地址（如https://api.deepseek.com）
          changeOrigin: true, // 开启跨域代理
          rewrite: (path) => path.replace(/^/api/llm/, ''), // 重写路径（去掉代理前缀）
        },
      },
    },
    // 生产环境构建配置
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development', // 开发环境生成sourcemap
    },
  };
});
```

### 目录结构设计（工程化核心） ###

```plaintext
llm-frontend/
├─ src/
│  ├─ api/            # API封装目录（工程化关键）
│  │  └─ llm.ts       # 大模型请求封装
│  ├─ utils/          # 工具函数
│  │  └─ env.ts       # 环境变量工具
│  ├─ types/          # 类型定义（TS必备）
│  │  └─ llm.ts       # 大模型请求/响应类型
│  ├─ main.ts         # 入口文件
│  └─ style.css       # 样式文件
├─ .env.development   # 开发环境变量
├─ .env.production    # 生产环境变量
├─ .gitignore         # 忽略文件（关键：排除.env）
└─ vite.config.ts     # Vite配置
```

## 二、核心实战：Fetch 调用 LLM API（复杂请求封装） ##

大模型 API 调用属于 *POST 复杂请求*，需严格配置请求行、请求头、请求体，且必须处理异步逻辑和错误捕获。

### 环境变量配置（.env 文件） ###

创建 `.env.development`（开发环境）和 `.env.production`（生产环境），API 密钥必须放在环境变量中，避免硬编码泄露：

```ini
# .env.development
VITE_LLM_API_BASE_URL=https://api.deepseek.com
VITE_LLM_API_KEY=your-deepseek-api-key  # 替换为你的密钥
VITE_LLM_MODEL=deepseek-chat  # 模型名称（根据API文档配置）
```

> ⚠️ 关键提醒：在 `.gitignore` 中添加 `.env*`，禁止提交环境变量文件：

```txt
# .gitignore
node_modules/
dist/
.env
.env.*
!.env.example  # 可选：保留示例文件（不含真实密钥）
```

### 类型定义（types/llm.ts，TS 提升开发体验） ###

提前定义请求和响应类型，避免类型混乱：

```typescript:llm.ts
/** 大模型请求参数类型 */
export interface LLMRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system'; // 角色（用户/助手/系统）
    content: string; // 消息内容
  }>;
  temperature?: number; // 随机性（0-1）
  max_tokens?: number; // 最大响应长度
}

/** 大模型响应类型 */
export interface LLMResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/** 错误响应类型 */
export interface LLMErrorResponse {
  error: {
    message: string;
    code: string;
  };
}
```

### Fetch 请求封装（ `api/llm.ts`，工程化核心） ###

封装通用请求函数，处理请求配置、JSON 序列化、异步逻辑、错误捕获，避免重复代码：

```javascript:llm.ts
import { LLMRequest, LLMResponse, LLMErrorResponse } from '@/types/llm';

// 从环境变量获取配置
const LLM_API_BASE_URL = import.meta.env.VITE_LLM_API_BASE_URL;
const LLM_API_KEY = import.meta.env.VITE_LLM_API_KEY;
const LLM_MODEL = import.meta.env.VITE_LLM_MODEL;

/**
 * 调用大模型API（通用封装）
 * @param messages 对话消息数组
 * @param options 额外配置（temperature/max_tokens等）
 */
export async function callLLM(
  messages: LLMRequest['messages'],
  options?: Omit<LLMRequest, 'model' | 'messages'>
): Promise<LLMResponse['choices'][0]['message']['content']> {
  // 1. 校验必要配置
  if (!LLM_API_KEY || !LLM_API_BASE_URL) {
    throw new Error('请配置LLM_API_KEY和LLM_API_BASE_URL环境变量');
  }

  // 2. 构造请求参数
  const requestData: LLMRequest = {
    model: LLM_MODEL,
    messages,
    temperature: options?.temperature || 0.7,
    max_tokens: options?.max_tokens || 1024,
    ...options,
  };

  try {
    // 3. 发送Fetch请求（复杂请求核心配置）
    const response = await fetch('/api/llm/chat/completions', {
      method: 'POST', // 必须POST
      headers: {
        'Authorization': `Bearer ${LLM_API_KEY}`, // 令牌固定前缀Bearer
        'Content-Type': 'application/json', // 必须JSON格式
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData), // 序列化JSON对象（关键：不能直接传对象）
    });

    // 4. 处理响应（区分成功/失败）
    const data = await response.json() as LLMResponse | LLMErrorResponse;

    if (!response.ok) {
      // 解析错误信息
      const errorMsg = (data as LLMErrorResponse).error?.message || '请求失败';
      throw new Error(`LLM API错误: ${errorMsg}`);
    }

    // 5. 提取响应内容（简化返回结果）
    return (data as LLMResponse).choices[0].message.content;
  } catch (error) {
    // 6. 统一错误捕获
    console.error('LLM调用失败:', error);
    throw error; // 抛出错误，让调用方处理
  }
}
```

### 调用示例（main.ts） ###

使用 `async`/`await` 简化异步逻辑（比 `.then` 更清晰）：

```typescript:main.ts
import { callLLM } from '@/api/llm';

// 立即执行函数（ES模块中无法直接写顶层await，需包裹）
(async () => {
  try {
    // 调用大模型（用户消息+系统提示）
    const messages = [
      { role: 'system', content: '你是一个前端助手，回答简洁明了' },
      { role: 'user', content: '如何用前端调用大模型API？' },
    ];

    console.log('正在请求大模型...');
    const result = await callLLM(messages, { temperature: 0.5 });
    console.log('大模型响应:', result);

    // 渲染到页面
    document.body.innerHTML = `
      <div style="max-width: 800px; margin: 2rem auto; padding: 0 1rem;">
        <h2>前端大模型调用示例</h2>
        <div style="margin: 1rem 0; padding: 1rem; background: #f5f5f5; border-radius: 8px;">
          <p><strong>用户:</strong> 如何用前端调用大模型API？</p>
          <p><strong>助手:</strong> ${result}</p>
        </div>
      </div>
    `;
  } catch (error) {
    document.body.innerHTML = `<div style="color: red; margin: 2rem;">调用失败: ${(error as Error).message}</div>`;
  }
})();
```

## 三、工程化进阶：让代码更可维护 ##

### 环境变量工具封装（ `utils/env.ts`） ###

统一处理环境变量，避免重复写 `import.meta.env`：

```typescript:env.ts
/** 获取环境变量（带默认值） */
export function getEnv<T = string>(key: string, defaultValue?: T): T {
  const value = import.meta.env[key] as unknown as T;
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`环境变量${key}未配置`);
  }
  return value ?? defaultValue!;
}

// 常用环境变量快捷访问
export const llmEnv = {
  apiBaseUrl: getEnv('VITE_LLM_API_BASE_URL'),
  apiKey: getEnv('VITE_LLM_API_KEY'),
  model: getEnv('VITE_LLM_MODEL', 'deepseek-chat'),
};
```

### 扩展：Axios 替代方案（可选） ###

如果项目中已使用 `Axios`，可替换 `Fetch`（优势：拦截器、取消请求）：

```javascript:llm-axios.ts
import axios from 'axios';
import { llmEnv } from '@/utils/env';
import { LLMRequest } from '@/types/llm';

// 创建Axios实例
const llmAxios = axios.create({
  baseURL: '/api/llm',
  headers: {
    'Authorization': `Bearer ${llmEnv.apiKey}`,
    'Content-Type': 'application/json',
  },
});

// 请求拦截器（统一添加配置）
llmAxios.interceptors.request.use((config) => {
  config.data = config.data || {};
  config.data.model = llmEnv.model;
  return config;
});

// 响应拦截器（统一处理响应）
llmAxios.interceptors.response.use(
  (response) => response.data.choices[0].message.content,
  (error) => {
    const errorMsg = error.response?.data?.error?.message || '请求失败';
    console.error('LLM调用失败:', errorMsg);
    throw new Error(errorMsg);
  }
);

// 调用函数
export async function callLLMAxios(messages: LLMRequest['messages'], options?: Omit<LLMRequest, 'model' | 'messages'>) {
  return llmAxios.post('/chat/completions', { messages, ...options });
}
```

### 安全最佳实践 ###

- **密钥安全**：前端环境变量仍可能被破解，生产环境建议通过后端中转请求（前端调用自己的后端，后端再调用 LLM API，密钥存储在后端）。
- **请求限制**：添加请求频率限制，避免滥用 API。
- **输入过滤**：对用户输入进行安全过滤，防止注入攻击。

## 四、避坑指南（高频问题解决） ##

- **跨域报错**：确保 Vite 代理配置正确，`changeOrigin: true` 必须开启，且代理路径重写正确。
- **401 Unauthorized**：检查 API 密钥是否正确，`Authorization` 头格式是否为 `Bearer + 空格 + 密钥`。
- **请求体格式错误**：必须用 `JSON.stringify` 序列化请求体，且字段名与 API 文档一致（如 `messages` 不能写成 `message`）。
- **环境变量未生效**：Vite 环境变量必须以 `VITE_` 为前缀，且修改 `.env` 后需重启开发服务器。

## 五、扩展方向 ##

- **流式响应**：大模型支持 SSE（Server-Sent Events），可实现打字机效果（需修改 Fetch 为 `response.body.getReader()`）。
- **缓存策略**：缓存重复请求，减少 API 调用成本（如使用 `localStorage` 或 `sessionStorage`）。
- **多模型支持**：封装通用 API，支持切换 DeepSeek、OpenAI、Anthropic 等不同模型。
- **UI 组件化**：将调用逻辑封装为 Vue/React 组件（如 `ChatInput`、`ChatMessage`）。

## 总结 ##

前端调用大模型的核心是**规范的 HTTP 请求配置+工程化的代码组织*：Vite 解决了跨域和环境变量问题，Fetch/Axios 负责请求封装，TypeScript 提升类型安全，环境变量和目录结构保证可维护性。按照本文方案，你可以快速搭建一个稳定、安全、可扩展的前端大模型调用方案，直接应用到生产项目中。

> 如何优雅终止 Fetch 请求：提升前端应用性能与用户体验

在现代前端开发中，`fetch()` 已成为发起网络请求的主流 API。然而，当用户切换页面、取消操作或请求超时时，如何终止正在进行的请求成为提升应用性能的关键技术。本文将深入探讨终止 Fetch 请求的多种方案与最佳实践。

## 一、为何需要主动终止 Fetch 请求？ ##

### 必要性分析 ###

- 避免资源浪费：未完成的请求持续占用网络带宽和服务器资源
- 提升用户体验：用户离开页面时立即停止无关请求，加速页面切换
- 防止竞态条件：解决快速连续操作导致的前后请求响应顺序错乱问题
- 优化性能指标：减少不必要的请求可显著降低内存占用和CPU消耗

### 典型应用场景 ###

- 搜索框输入时的实时搜索建议
- 分页表格快速切换时的数据加载
- 大文件上传/下载的中途取消
- 页面跳转时中断未完成的请求
- 自定义请求超时控制

## 二、核心技术：AbortController API ##

### AbortController 工作原理 ###

```javascript
// 创建控制器与信号对象
const controller = new AbortController();
const signal = controller.signal;

// 发起可终止的fetch请求
fetch('https://api.example.com/data', { signal })
  .then(response => response.json())
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('请求已被终止');
    } else {
      console.error('网络错误', err);
    }
  });

// 终止请求
controller.abort();
```

**关键组件解析**

- Controller：提供 `abort()` 方法的控制对象
- Signal：传递终止状态的信号对象
- AbortError：请求终止时抛出的特定错误类型

### 实现请求超时自动终止 ###

```javascript
// 设置5秒超时自动终止
const timeout = 5000;

function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return fetch(url, {
    ...options,
    signal: controller.signal
  }).finally(() => clearTimeout(timeoutId));
}

// 使用示例
fetchWithTimeout('https://api.example.com/slow-data')
  .catch(err => console.error(err)); // 超时将触发AbortError
```

## 三、实战应用场景解析 ##

### 用户主动取消操作 ###

```javascript
// 获取DOM元素
const fetchButton = document.getElementById('fetch-btn');
const cancelButton = document.getElementById('cancel-btn');

let controller;

fetchButton.addEventListener('click', async () => {
  controller = new AbortController();
  
  try {
    const response = await fetch('/api/data', { 
      signal: controller.signal 
    });
    const data = await response.json();
    renderData(data);
  } catch (err) {
    if (err.name !== 'AbortError') {
      showError('请求失败: ' + err.message);
    }
  }
});

cancelButton.addEventListener('click', () => {
  if (controller) controller.abort();
});
```

### 组件卸载时自动清理 ###

```jsx
// React组件中自动终止请求
useEffect(() => {
  const controller = new AbortController();
  
  const loadData = async () => {
    try {
      const res = await fetch('/api/data', {
        signal: controller.signal
      });
      setData(await res.json());
    } catch (err) {
      if (!err.name === 'AbortError') {
        setError(err.message);
      }
    }
  };

  loadData();

  // 组件卸载时执行清理
  return () => controller.abort();
}, []);
```

### 批量请求统一终止 ###

```javascript
// 创建主控制器
const masterController = new AbortController();

// 发起多个关联请求
const requests = [
  fetch('/api/users', { signal: masterController.signal }),
  fetch('/api/products', { signal: masterController.signal }),
  fetch('/api/orders', { signal: masterController.signal })
];

Promise.all(requests)
  .then(responses => {/* 处理响应 */})
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('所有请求已终止');
    }
  });

// 一键终止所有请求
document.getElementById('cancel-all').addEventListener('click', () => {
  masterController.abort();
});
```

## 四、高级技巧与边界处理 ##

### 中断后重试机制 ###

```javascript
async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name !== 'AbortError' || i === retries - 1) {
        throw err;
      }
      console.log(`第${i+1}次重试...`);
    }
  }
}
```

### 内存管理最佳实践 ###

```javascript
// 避免内存泄漏的模式
function fetchData() {
  const controller = new AbortController();
  
  fetch(url, { signal: controller.signal })
    .then(handleResponse)
    .catch(handleError)
    .finally(() => {
      // 清除引用以便垃圾回收
      controller = null; 
    });
  
  return {
    abort: () => controller.abort(),
    // 其他方法...
  };
}
```

## 五、浏览器兼容性与替代方案 ##

### 兼容性处理方案 ###

```javascript
// 检测AbortController支持情况
const supportsAbortController = typeof AbortController !== 'undefined';

// 兼容的请求终止函数
function abortableFetch(url, options) {
  if (supportsAbortController) {
    const controller = new AbortController();
    const signal = controller.signal;
    
    const promise = fetch(url, { ...options, signal });
    return {
      promise,
      abort: () => controller.abort()
    };
  } else {
    // 回退到XMLHttpRequest
    const xhr = new XMLHttpRequest();
    xhr.open(options.method || 'GET', url);
    
    return {
      promise: new Promise((resolve, reject) => {
        xhr.onload = () => resolve(new Response(xhr.response));
        xhr.onerror = reject;
        xhr.send(options.body);
      }),
      abort: () => xhr.abort()
    };
  }
}
```

### 主流框架的集成方案 ###

#### Axios 取消令牌 ####

```javascript
const source = axios.CancelToken.source();

axios.get('/api/data', {
  cancelToken: source.token
}).catch(err => {
  if (axios.isCancel(err)) {
    console.log('请求已取消');
  }
});

// 取消请求
source.cancel();
```

#### Vue Composition API 封装 ####

```javascript
import { ref } from 'vue';

export function useAbortableFetch() {
  const controller = ref(null);
  
  const fetchData = async (url, options = {}) => {
    // 终止之前的请求
    if (controller.value) {
      controller.value.abort();
    }
    
    controller.value = new AbortController();
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.value.signal
      });
      return await response.json();
    } catch (err) {
      if (err.name !== 'AbortError') throw err;
    }
  };
  
  return { fetchData };
}
```

## 六、总结：构建健壮的请求管理策略 ##

终止 Fetch 请求不仅是技术需求，更是优化用户体验的关键环节。通过合理应用 AbortController：

- 实现精准的请求生命周期控制
- 降低服务器负载与客户端资源消耗
- 避免无效渲染与状态更新
- 提升复杂交互场景下的应用稳定性

在 SPA 成为主流的今天，请求终止能力已成为前端工程师的必备技能。建议在项目中统一封装请求工具库，集成终止、重试、缓存等高级特性，为应用性能提供坚实保障。

> 技术扩展：关注新兴的 `Navigator.sendBeacon()` 对于页面关闭时请求的特殊处理方案，以及 React 18 Suspense 对数据获取模式的革新，它们与请求终止技术共同构成了现代前端数据获取的完整解决方案。
