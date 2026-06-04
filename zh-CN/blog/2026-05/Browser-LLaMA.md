---
lastUpdated: true
commentabled: true
recommended: true
title: 老板逼我上AI，我偷偷在浏览器里跑LLaMA
description: 省下20万API费
date: 2026-05-28 11:45:00 
pageClass: blog-page-class
cover: /covers/ai.svg
---

> 老板看了竞品，眼睛发光：“我们也上AI！用户问啥都得秒回！” 我默默算了算OpenAI的账单——一个月2万，一年24万，够全组去三亚团建三次。于是我干了件疯狂的事：把AI模型塞进用户浏览器里。不用服务器，不花一分钱API，用户电脑自己跟自己聊天。老板看着账单上的“0”，问我是不是偷偷充了值。

## 前言 ##

这事儿起因很简单：老板要AI客服。大模型API便宜吗？初看几分钱一次，用户一多，一个月一辆特斯拉没了。而且用户问的重复问题占80%，每问一次就烧一次钱，像开着水龙头浇花。

我寻思：能不能把模型直接扔到用户浏览器里？现在电脑、手机性能过剩，跑个小模型绰绰有余。说干就干，我找到了Transformers.js——一个能在浏览器里跑Hugging Face模型的库，完全本地推理，不花一分钱API，隐私还安全。

今天我就带你手把手在React里集成一个本地AI问答模型（用的还是微软的Phi-3 mini，效果媲美GPT-3.5，体积只有2GB左右，量化后更小）。用户打开网页，模型自动下载到IndexedDB，然后所有对话都在他电脑上完成。老板再也不用看账单了。

## 一、为什么敢在浏览器里跑AI？ ##

- 硬件进步：WebAssembly + WebGL，现代CPU/GPU能跑几十亿参数的小模型。
- 模型变小：Phi-3、TinyLLaMA、Gemma 2B，量化后几十到几百MB。
- 隐私：数据不上传，用户放心（尤其金融、医疗行业）。
- 成本：固定成本（服务器带宽），没有按次收费。

缺点：首次加载慢（下载模型），低端设备可能卡。但你可以用闲时下载+缓存策略，用户第一次访问花一分钟，之后秒开。

## 二、技术选型：Transformers.js + Phi-3 ##

Transformers.js 是Hugging Face官方库，支持在浏览器里运行Transformer模型。它自动利用WebGL加速，比纯CPU快5-10倍。

我们要用的模型：Phi-3-mini-4k-instruct（微软出品，38亿参数，量化后约2GB）。太大了？别急，有128k上下文版更小，或者用TinyLLaMA 1.1B（量产后几百MB）。我推荐先上onnx-community/Phi-3-mini-4k-instruct-onnx，经过ONNX优化，体积更友好。

## 三、实战：React + Transformers.js 实现本地问答 ##

### 安装依赖 ###

```bash
npm install @xenova/transformers
```

### 创建一个AI Hook ###

```js:hooks/useLocalLLM.js
import { pipeline, env } from '@xenova/transformers';

// 设置模型缓存路径（IndexedDB）
env.localModelPath = '/models/';
env.useBrowserCache = true;

export function useLocalLLM() {
  const [generator, setGenerator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadModel = async () => {
      // 加载文本生成模型（这里用Phi-3的ONNX版本）
      const pipe = await pipeline('text-generation', 'onnx-community/Phi-3-mini-4k-instruct-onnx', {
        progress_callback: (p) => {
          if (p.status === 'downloading') {
            setProgress(p.progress);
          }
        },
      });
      setGenerator(() => pipe);
      setLoading(false);
    };
    loadModel();
  }, []);

  const generate = async (prompt, options = {}) => {
    if (!generator) return;
    const result = await generator(prompt, {
      max_new_tokens: 256,
      temperature: 0.7,
      ...options,
    });
    return result[0].generated_text;
  };

  return { generate, loading, progress };
}
```

### 在组件中使用 ###

```js
function AIChat() {
  const { generate, loading, progress } = useLocalLLM();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const ask = async () => {
    if (!question.trim() || isGenerating) return;
    setIsGenerating(true);
    // Phi-3 指令格式
    const prompt = `<|user|>\n${question}\n<|end|>\n<|assistant|>\n`;
    const response = await generate(prompt);
    setAnswer(response.replace(prompt, '').trim());
    setIsGenerating(false);
  };

  if (loading) {
    return <div>正在加载AI模型 {Math.round(progress * 100)}% ... (首次约需1分钟)</div>;
  }

  return (
    <div>
      <textarea value={question} onChange={e => setQuestion(e.target.value)} />
      <button onClick={ask} disabled={isGenerating}>问AI</button>
      {isGenerating && <div>AI在你电脑里拼命想...</div>}
      {answer && <div className="answer">{answer}</div>}
    </div>
  );
}
```

## 四、效果与优化 ##

- 首次访问：下载模型（约1.5GB，看网速），之后缓存在IndexedDB，第二次秒加载。
- 推理速度：Intel i7 16GB 上，生成20个token约2秒。M1 Mac 更快。手机上可换更小模型。
- 优化技巧：

  - 用Web Worker运行模型，避免阻塞UI。
  - 提前预加载：用户鼠标悬停在聊天按钮时就开始下模型。
  - 量化：选择int8或fp16版本，体积减半。

## 五、这和Vercel AI SDK有什么区别？ ##

- Vercel AI SDK：后端调API，前端拿流式响应。还是要花钱，但开发快。
- Transformers.js：完全本地，零成本，但首次加载慢，设备性能要求高。

我的建议：混合模式。默认用本地模型，如果用户设备太老或模型下载失败，fallback到云端API。既省钱又不丢用户体验。

## 六、老板的反应 ##

上线后，老板问：“这月AI账单怎么是0？” 我说：“我把AI搬到用户浏览器里了。” 他沉默了三秒：“那岂不是我们没数据了？” 我说：“要数据干嘛？又卖不掉。省下的钱给我们加鸡腿。” 老板居然同意了。

## 七、总结：本地AI不是梦，是未来 ##

- Transformers.js 让浏览器跑大模型成为可能。
- 适合隐私敏感、成本敏感的场景（客服、笔记、翻译）。
- 首次加载慢，但配合缓存和进度提示，用户能接受。
- 技术选型：模型选Phi-3/TinyLLaMA，量化版几十到几百MB。

下次老板再让你接入AI，你可以淡定地说：“本地跑，不花钱，隐私好。” 然后默默打开这篇文章——代码都给他准备好了。

> 前文是一个基于 React 的实现，而且用的还是旧的 `@xenova/transformers` 包。下面我用 Vue 3 + TypeScript + Transformers.js v4（`@huggingface/transformers`） 重新实现，同时融入 Web Worker 避免阻塞 UI、Vite 构建配置、以及最新的模型推荐。

## 一、安装依赖 ##

```bash
npm install @huggingface/transformers
```

> 注意：这是 Transformers.js v4 的新包名，旧版 `@xenova/transformers` 是 `v2.x`，不再推荐使用。

Vite 项目需要处理 `.onnx`、`.wasm` 等二进制文件，Vite 会尝试用默认 `loader` 处理 `.onnx` 文件导致报错或打包体积膨胀，需要额外配置。

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  worker: {
    format: 'es', // Web Worker 使用 ES 模块格式
  },
  optimizeDeps: {
    exclude: ['@huggingface/transformers'], // 避免预构建时处理 ONNX 二进制
  },
  build: {
    rollupOptions: {
      external: ['@huggingface/transformers'], // 保持为外部依赖
    },
  },
});
```

## 二、Web Worker 架构 ##

Transformers.js 的官方示例采用了 split architecture 模式：UI 状态在主线程，模型加载和推理操作全部在 Web Worker 中执行。这样可以避免模型推理时阻塞页面渲染和用户交互。

### 定义 Worker 消息类型 ###

```typescript
// types/llm.ts
export interface WorkerRequest {
  type: 'load' | 'generate';
  modelId?: string;
  prompt?: string;
  options?: GenerateOptions;
}

export interface WorkerResponse {
  type: 'progress' | 'ready' | 'result' | 'error';
  progress?: number;
  status?: string;
  text?: string;
  fullResponse?: string;
  message?: string;
  tps?: number; // tokens per second
}

export interface GenerateOptions {
  max_new_tokens?: number;
  temperature?: number;
  top_p?: number;
  do_sample?: boolean;
}
```

### Worker 脚本 ###

```typescript
// workers/llm.worker.ts
import { pipeline, env } from '@huggingface/transformers';
import type { WorkerRequest, WorkerResponse, GenerateOptions } from '../types/llm';

// 配置：使用浏览器缓存（IndexedDB）
env.useBrowserCache = true;
env.allowLocalModels = false; // 首次从 HF 下载，后续从缓存读取

let generator: any = null;

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { type, modelId, prompt, options } = e.data;

  try {
    if (type === 'load') {
      await loadModel(modelId ?? 'onnx-community/Phi-3-mini-4k-instruct-onnx');
      const msg: WorkerResponse = { type: 'ready', status: '模型已就绪' };
      self.postMessage(msg);
    } else if (type === 'generate') {
      if (!generator) {
        throw new Error('模型尚未加载，请先发送 load 消息');
      }
      const response = await generate(prompt!, options ?? {});
      const msg: WorkerResponse = { type: 'result', text: response };
      self.postMessage(msg);
    }
  } catch (err: any) {
    const msg: WorkerResponse = { type: 'error', message: err.message };
    self.postMessage(msg);
  }
};

async function loadModel(modelId: string) {
  generator = await pipeline('text-generation', modelId, {
    progress_callback: (p: any) => {
      if (p.status === 'downloading') {
        const msg: WorkerResponse = {
          type: 'progress',
          progress: p.progress,
          status: p.file,
        };
        self.postMessage(msg);
      }
    },
  });
}

async function generate(prompt: string, options: GenerateOptions): Promise<string> {
  const result = await generator(prompt, {
    max_new_tokens: 256,
    temperature: 0.7,
    top_p: 0.9,
    do_sample: true,
    ...options,
  });
  // v4 中 text-generation 返回的是数组，取第一项的 generated_text
  const out = Array.isArray(result) ? result[0] : result;
  return out.generated_text ?? out;
}
```

## 三、Vue 3 Composable ##

Vue 3 的 Composables 对标 React Hooks，下面用 Composable 封装模型加载与推理的全部逻辑。

```typescript
// composables/useLocalLLM.ts
import { ref, onUnmounted, type Ref } from 'vue';
import type { WorkerRequest, WorkerResponse } from '../types/llm';

export function useLocalLLM() {
  const loading: Ref<boolean> = ref(false);
  const ready: Ref<boolean> = ref(false);
  const progress: Ref<number> = ref(0);
  const progressFile: Ref<string> = ref('');
  const error: Ref<string | null> = ref(null);

  let worker: Worker | null = null;

  function initWorker(modelId?: string) {
    if (worker) return; // 防止重复初始化

    // Vite 中通过 new URL 的方式创建 Worker，支持 HMR
    worker = new Worker(new URL('../workers/llm.worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { type, progress: p, status, text, message } = e.data;

      switch (type) {
        case 'progress':
          progress.value = p ?? 0;
          progressFile.value = status ?? '';
          break;
        case 'ready':
          loading.value = false;
          ready.value = true;
          error.value = null;
          break;
        case 'result':
          // 通过回调将结果传出
          break;
        case 'error':
          loading.value = false;
          error.value = message ?? '未知错误';
          break;
      }
    };

    loading.value = true;
    error.value = null;

    const msg: WorkerRequest = {
      type: 'load',
      modelId: modelId ?? 'onnx-community/Phi-3-mini-4k-instruct-onnx',
    };
    worker.postMessage(msg);
  }

  function generate(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!worker) {
        reject(new Error('Worker 尚未初始化'));
        return;
      }

      const handler = (e: MessageEvent<WorkerResponse>) => {
        if (e.data.type === 'result') {
          worker!.removeEventListener('message', handler);
          resolve(e.data.text ?? '');
        } else if (e.data.type === 'error') {
          worker!.removeEventListener('message', handler);
          reject(new Error(e.data.message));
        }
      };

      worker.addEventListener('message', handler);

      const msg: WorkerRequest = {
        type: 'generate',
        prompt,
      };
      worker.postMessage(msg);
    });
  }

  function terminate() {
    worker?.terminate();
    worker = null;
    ready.value = false;
    loading.value = false;
  }

  onUnmounted(() => {
    terminate();
  });

  return {
    loading,
    ready,
    progress,
    progressFile,
    error,
    initWorker,
    generate,
    terminate,
  };
}
```

## 四、Vue 3 组件中使用 ##

```vue
<template>
  <div class="ai-chat">
    <!-- 模型加载进度 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <p>正在加载 AI 模型...</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: (progress * 100) + '%' }" />
        </div>
        <p class="progress-text">{{ Math.round(progress * 100) }}%</p>
        <p v-if="progressFile" class="file-name">下载中：{{ progressFile }}</p>
      </div>
    </div>

    <!-- 对话区域 -->
    <div v-if="ready" class="chat-area">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message', msg.role]"
      >
        <div class="message-content">{{ msg.content }}</div>
      </div>

      <div v-if="isGenerating" class="message assistant">
        <div class="typing-indicator">AI 正在思考...</div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <textarea
        v-model="question"
        placeholder="在这里输入你的问题..."
        :disabled="!ready || isGenerating"
        @keydown.enter.exact.prevent="ask"
      />
      <button
        @click="ask"
        :disabled="!ready || isGenerating || !question.trim()"
      >
        {{ isGenerating ? '思考中...' : '问 AI' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useLocalLLM } from '../composables/useLocalLLM';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const PHI3_USER_PREFIX = '<|user|>\n';
const PHI3_USER_SUFFIX = '\n<|end|>\n';
const PHI3_ASSISTANT_PREFIX = '<|assistant|>\n';

const { loading, ready, progress, progressFile, initWorker, generate } = useLocalLLM();

const question = ref('');
const messages = ref<Message[]>([]);
const isGenerating = ref(false);

onMounted(() => {
  // 页面加载时自动初始化模型
  initWorker('onnx-community/Phi-3-mini-4k-instruct-onnx');
});

async function ask() {
  const q = question.value.trim();
  if (!q || isGenerating.value) return;

  messages.value.push({ role: 'user', content: q });
  question.value = '';
  isGenerating.value = true;

  try {
    // 拼接 Phi-3 的指令格式
    const prompt = `${PHI3_USER_PREFIX}${q}${PHI3_USER_SUFFIX}${PHI3_ASSISTANT_PREFIX}`;
    const response = await generate(prompt);

    // 去除 prompt 前缀，只保留助手回复
    const cleanResponse = response.replace(prompt, '').trim();
    messages.value.push({ role: 'assistant', content: cleanResponse });
  } catch (err: any) {
    messages.value.push({
      role: 'assistant',
      content: `出错了：${err.message}`,
    });
  } finally {
    isGenerating.value = false;
  }
}
</script>

<style scoped>
.ai-chat {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

.loading-overlay {
  text-align: center;
  padding: 60px 20px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin: 12px 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  transition: width 0.3s ease;
}

.chat-area {
  min-height: 300px;
  margin-bottom: 20px;
}

.message {
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 85%;
}

.message.user {
  background: #4f46e5;
  color: white;
  margin-left: auto;
}

.message.assistant {
  background: #f3f4f6;
  color: #1f2937;
}

.typing-indicator {
  color: #9ca3af;
  font-style: italic;
}

.input-area {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.input-area textarea {
  flex: 1;
  min-height: 60px;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  resize: vertical;
  font-size: 14px;
}

.input-area button {
  padding: 10px 24px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.input-area button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>
```

## 五、关键优化与注意事项 ##

### 首屏加载优化 ###

Transformers.js 生产部署面临三大瓶颈：ONNX 模型体积导致的下载延迟、模型反序列化耗时、以及 WASM/WebGPU 初始化开销。推荐两种预加载策略：闲时预加载（页面 onload 后静默初始化 Worker）或 悬停预加载（用户鼠标悬停在聊天入口时触发加载）。

### Vite 构建配置 ###

一个常见坑是，Vite 在 `npm run dev` 时能正常加载模型，但 `npm run build` 后报 404。这是因为生产构建会将模型文件哈希化但路径引用未同步更新。解决方案：

```typescript
// vite.config.ts 补充
export default defineConfig({
  // ...
  build: {
    rollupOptions: {
      output: {
        // 确保 .onnx / .wasm 文件原样输出，不被哈希化
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.onnx') || assetInfo.name?.endsWith('.wasm')) {
            return 'models/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
```

### WebGPU 加速 ###

Transformers.js v4 的 WebGPU 运行时用 C++ 重写，默认在支持的浏览器上自动启用。如果你的目标设备支持 WebGPU，推理速度可比 WASM 快 4 倍左右。Chrome 113+、Edge 113+ 均已支持，无需额外配置。

### 模型选择建议 ###

前文推荐的 `onnx-community/Phi-3-mini-4k-instruct-onnx`（约 2GB）是通用选择。如果希望更快的首次加载速度，可考虑 2026 年的更轻量替代品，如 `Xenova/Qwen1.5-0.5B-Chat` 或面壁智能的 `MiniCPM5-1B`（INT4 量化仅 0.5GB）。

六、总结

| 维度 | 前文（React / v2） | 本文（Vue 3 / v4） |
|------|-------------------|-------------------|
| 框架 | React + useState | Vue 3 Composition API + Composable |
| Transformers.js 版本 | v2（`@xenova/transformers`） | v4（`@huggingface/transformers`） |
| 推理后端 | WebGL | WebGPU（C++ 运行时，速度提升 4×） |
| 线程模型 | 主线程直接调用 | Web Worker（不阻塞 UI） |
| 状态管理 | React useState | Vue 3 ref + Composable |
| 构建工具 | 未涉及 | Vite + 专项配置 |
| 最新轻量模型 | 未涉及 | MiniCPM5-1B / Qwen1.5-0.5B |

Vue 3 的 Composition API 与 React Hooks 在思想上高度相似（都是函数式、响应式的组合逻辑），所以从 React 版本迁移到 Vue 3 并不复杂。核心差异在于：Vue 3 用 `ref` / `reactive` 管理状态，React 用 `useState` / `useRef`；而在 Transformers.js v4 中，最大的升级是 WebGPU C++ 运行时的引入，让浏览器端 AI 从"能跑"变成了"能快速跑"。
