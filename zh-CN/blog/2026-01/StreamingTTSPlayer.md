---
lastUpdated: true
commentabled: true
recommended: true
title: 在 Web 前端实现流式 TTS 播放
description: 在 Web 前端实现流式 TTS 播放
date: 2026-01-05 11:00:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

## 🧠 在 Web 前端实现流式 TTS 播放：从卡顿杂音到丝滑顺畅的演进之路 ##

在做前端实时语音合成（TTS）时，很多人都会遇到同样的问题：

- 播放出来的语音一顿一顿的，很卡顿
- 声音中夹杂“咔嗒”声、杂音、断裂
- 明明音频格式是 MP3，也无法做到“接收到就播放”

本文将带你走一遍真实的排坑过程，最终用一种优雅的方式在浏览器中实现 低延迟、不卡顿、无杂音 的流式 TTS 播放。

## 💥 问题的起点：AudioBufferSourceNode 方案 ##

一开始我们采用最直观的方式：

1. 后端流式返回 Base64 MP3 块
2. 前端每收到一块：

  - Base64 → ArrayBuffer
  - 用 `decodeAudioData()` 解码成 PCM
  - 用 `AudioBufferSourceNode` 播放

听起来没什么问题，但结果是：

- **频繁卡顿**：每次解码都要等主线程空闲，播放中途就被打断
- **杂音爆音**：每块是独立的 AudioNode，时间轴无法无缝拼接
- **延迟明显**：必须解码完成才能播，没法“边下边播”

这是绝大多数开发者第一次尝试流式 TTS 时会踩的坑。

## 🚀 真正流畅的做法：MediaSource + SourceBuffer ##

后来我们换成浏览器原生支持的 **MediaSource Extensions (MSE)** 技术：

- 创建 `MediaSource` 作为音频流容器
- `mediaSource.addSourceBuffer('audio/mpeg')` 声明要接收 MP3 流
- 每收到一块 Base64 MP3：
  - 转为 `ArrayBuffer`
  - `sourceBuffer.appendBuffer(buffer)` 追加到播放流
- 浏览器底层会自动解码 + 缓冲 + 拼接播放

结果立刻变得丝滑：

- ✅ 接收即播，低延迟
- ✅ 无缝拼接，无杂音
- ✅ 不再卡顿，性能极佳
- ✅ 兼容所有现代浏览器（Chrome / Edge / Firefox / Safari）

## 🧩 最终实现：StreamingTTSPlayer ##

下面是一份可直接使用的封装类，只需传入 Base64 MP3 数据块，即可实现流式播放：

```ts:StreamingTTSPlayer.ts
/**
 * StreamingTTSPlayer.ts
 * 
 * 一个用于播放「流式 Base64 MP3」音频的播放器。
 * 使用 MediaSource + SourceBuffer 实现边接收边播放，不卡顿无杂音。
 */

export interface StreamingTTSPlayerOptions {
  /** 用于监听播放器状态（ready、error 等）的回调 */
  onEvent?: (event: string, data?: any) => void;
}

export class StreamingTTSPlayer {
  private audio: HTMLAudioElement;           // 播放用的 <audio> 元素
  private mediaSource: MediaSource;           // 媒体源（支持流式拼接）
  private sourceBuffer: SourceBuffer | null = null; // 用于接收音频块的缓冲区
  private queue: ArrayBuffer[] = [];          // 等待写入 SourceBuffer 的音频块队列
  private isBufferUpdating = false;            // 是否正在写入数据（避免并发）
  private onEvent?: (event: string, data?: any) => void; // 事件回调

  constructor(options?: StreamingTTSPlayerOptions) {
    this.onEvent = options?.onEvent;

    // 1. 创建 HTMLAudioElement
    this.audio = new Audio();

    // 2. 创建 MediaSource 并挂载到 audio 元素
    this.mediaSource = new MediaSource();
    this.audio.src = URL.createObjectURL(this.mediaSource);

    // 3. 等待 mediaSource 初始化完成
    this.mediaSource.addEventListener("sourceopen", () => {
      try {
        // 4. 创建一个 MP3 类型的 SourceBuffer，用于接收音频块
        this.sourceBuffer = this.mediaSource.addSourceBuffer('audio/mpeg');

        // 5. 设置拼接模式为 sequence（自动按顺序拼接）
        this.sourceBuffer.mode = 'sequence';

        // 6. 每次 appendBuffer 完成后触发 updateend，继续处理队列
        this.sourceBuffer.addEventListener('updateend', () => this.feedQueue());

        this.emit("ready");
      } catch (err) {
        console.error("Failed to add sourceBuffer:", err);
        this.emit("error", err);
      }
    });

    // 监听 audio 元素播放错误
    this.audio.addEventListener("error", (e) => {
      this.emit("error", e);
    });
  }

  /**
   * 接收一段 base64 MP3 数据块并放入播放队列
   * @param base64 base64 编码的 MP3 数据块
   * @param autoPlay 是否自动开始播放（默认 true）
   */
  receiveBase64(base64: string, autoPlay = true) {
    try {
      const buffer = this.base64ToArrayBuffer(base64);
      this.queue.push(buffer);
      this.feedQueue(); // 立即尝试送入 SourceBuffer
      if (autoPlay) this.play();
    } catch (err) {
      console.error("TTS decode error:", err);
      this.emit("error", err);
    }
  }

  /** 播放（如果已暂停） */
  play() {
    if (this.audio.paused) {
      this.audio.play().catch(() => {});
    }
  }

  /** 暂停播放 */
  pause() {
    if (!this.audio.paused) {
      this.audio.pause();
    }
  }

  /**
   * 停止播放并清空缓冲
   * （会丢弃所有未播放的数据）
   */
  stop() {
    this.pause();
    this.queue = [];
    if (this.mediaSource.readyState === "open" && this.sourceBuffer && !this.sourceBuffer.updating) {
      try {
        this.sourceBuffer.abort(); // 终止当前的缓冲区写入
      } catch {}
    }
    this.audio.currentTime = 0;
  }

  /**
   * 内部方法：尝试把队列中的数据 append 到 SourceBuffer
   */
  private feedQueue() {
    // 没有 SourceBuffer 或正在写入时不处理
    if (!this.sourceBuffer || this.isBufferUpdating) return;
    if (this.queue.length === 0) return;

    if (!this.sourceBuffer.updating) {
      const chunk = this.queue.shift()!;
      try {
        this.isBufferUpdating = true;
        this.sourceBuffer.appendBuffer(chunk); // 核心：追加 MP3 数据到播放流
        this.isBufferUpdating = false;
      } catch (err) {
        console.error("Failed to append buffer:", err);
        this.emit("error", err);
      }
    }
  }

  /**
   * Base64 -> ArrayBuffer 转换工具
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64.replace(/^data:audio\/\w+;base64,/, ""));
    const len = binary.length;
    const buffer = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return buffer.buffer;
  }

  /** 触发事件回调 */
  private emit(event: string, data?: any) {
    this.onEvent?.(event, data);
  }
}
```

**使用**

```js
const player = new StreamingTTSPlayer();

// 每收到一块 TTS 音频数据就塞进去
ws.onmessage = (e) => {
  const data = JSON.parse(e.data);
  if (data.audio) player.receiveBase64(data.audio);
};
```
