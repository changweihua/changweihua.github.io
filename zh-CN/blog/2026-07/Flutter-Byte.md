---
lastUpdated: true
commentabled: true
recommended: true
title: Flutter 二进制通信原理
description: 从 ByteData 到 BinaryMessenger 一次讲透
date: 2026-07-02 08:25:00
pageClass: blog-page-class
cover: /covers/flutter.svg
---

## 为什么 Flutter 必须研究二进制传输

### Flutter 不只是 UI 框架

在常规认知中，Flutter 是一个专注于 Widget、动画和页面开发的 UI 框架。只要掌握了状态管理和生命周期，就能满足大部分常规业务需求。

但在复杂的工业级场景中，情况会有所不同。例如：

- 相机预览（实时滤镜与流处理）
- 音视频流（播放器与流媒体）
- AI 推理（端侧模型的高频输入输出）
- WebRTC（实时音视频通信）
- 蓝牙与物联网（硬件设备协议交互）
- 文件流与 Native SDK 对接

这些场景的核心挑战不在于 UI 渲染，而在于如何高效地处理和传输 Binary Data（二进制数据） 。

### 高频数据传输的性能挑战

以 Native 相机接入为例：

假设 Native 相机每秒输出 30 帧（30fps），分辨率为 1080p（1920 × 1080）。

- 每帧数据量：1920 × 1080 × 4 bytes (RGBA) ≈ 8MB
- 每秒数据量：8MB × 30 = 240MB/s

如果采用 JSON 序列化来传递这些数据：

```json
{
  "pixels": [255, 128, 0, 255, ...]
}
```

序列化和反序列化带来的 CPU 开销，以及瞬间产生的巨量字符串对象，会导致 Dart GC（垃圾回收）面临极大压力，引发严重的 UI 掉帧。因此，Flutter 与 Native 之间的高频通信，必须依赖纯粹的二进制传输。

### Flutter 到底在传递什么

在日常开发中，我们最常使用的通信代码如下：

```dart
channel.invokeMethod("getUserInfo", {"id": 123});
```

这容易产生一种错觉，即 Flutter 直接跨语言传递了对象字典。但实际上，无论上层传递的是 String、Map 还是 List，Flutter Framework 层暴露给 Dart 的最终二进制载体是 ByteData。上层的结构化对象最终都会被编码为连续的字节流。

> 注：进入 Engine 内部后，数据会进一步转化为 `platform message`、`std::vector<uint8_t>` 或 `fml::Mapping` 等更底层的 C++ 结构，但这超出了 Dart 层的操作范畴。

## Flutter 二进制体系总览

要深入理解 Flutter 的二进制流，需要理清其底层对象的流转层级：

```txt
  TypedData 家族     (1) 开发者操作的强类型字节数组视图 (如 Uint8List)
      ↓
  ByteBuffer         (2) 原始内存缓冲区 (Underlying Memory)
      ↓
  ByteData           (3) 负责按类型、字节序读写二进制的工具
      ↓
  MessageCodec       (4) 负责将上层数据结构编码/解码为二进制
      ↓
  BinaryMessenger    (5) 跨层级消息总线
      ↓
  Flutter Engine     (6) C++ 层的实际通信执行者
```

## Dart TypedData 家族

在讨论 ByteBuffer 之前，必须先理解 Dart 提供的 TypedData 体系。

### 为什么不能直接用 List

普通 List 并不保证底层采用紧凑连续的原始二进制内存布局。而 TypedData（如 Uint8List）则明确使用连续、紧凑的 Typed Memory Layout，因此更适合进行高性能二进制处理与 Native 交互。

### TypedData 的引入

为了解决密集型数据计算和底层交互的问题，Dart 引入了 TypedData 家族（类似于 JavaScript/WebAssembly 中的 TypedArray）。
它包含多种视图，如：

- Uint8List (8位无符号整数)
- Int32List (32位有符号整数)
- Float32List (32位浮点数)
- Float64List (64位浮点数)
- ByteData (支持混合类型读写)

Flutter Engine 偏爱 TypedData，正是因为它们在底层对应着紧凑的、连续的内存块，非常适合与 C++ 层进行高效的数据交换。

## ByteBuffer 到底是什么

### ByteBuffer 本质：连续内存抽象

ByteBuffer 本身不具备类似 List 的数据结构特性（无法 `add` 或 `remove`）。它是 Dart VM Heap 上的一块连续内存抽象。

你可以将其类比为 C 语言中通过 `malloc` 分配出的一块内存，或者 Java NIO 中的 ByteBuffer。它仅仅标记了这块内存在哪里、有多大。

### Uint8List 与 ByteBuffer 的关系

我们在 Dart 中通常这样获取底层内存：

```dart
Uint8List list = Uint8List(8);
ByteBuffer buffer = list.buffer;
```

在这里：

```txt
┌──────────────────────┐
│   backing memory     │
└──────────────────────┘
        ▲
        │
   ByteBuffer
      ▲   ▲
      │   │
Uint8List ByteData
(View)     (View)
```

- Uint8List 仅仅是一个 “视图 (View)” ，它定义了如何解释这块内存（每 8 bit 为一个整数）。
- ByteBuffer 是对底层 backing memory 的抽象访问接口，真正的内存仍由 Dart VM 管理。

### 共享 Buffer：避免额外的用户态复制

TypedData 的设计允许我们在不复制底层数据的情况下，通过不同的视图去映射同一块内存。

```dart
Uint8List u8 = Uint8List(8);
// 创建一个指向相同内存的 ByteData 视图，无需发生内存 Copy
ByteData data = ByteData.view(u8.buffer);

data.setInt16(0, 255);
print(u8[0]); // u8 视图的数据同步变化
```

这种多个 TypedData View 共享同一块底层 Buffer 的机制，有效减少了不必要的内存复制（Avoid Extra User-Space Copy） ，在解析复杂的自定义网络协议或多媒体头部信息时极为高效。

## ByteData：Flutter 二进制读写核心

### ByteData 的定位

当你绕过所有的上层封装，直接与 Flutter Framework 的底层通信接口交互时，方法的签名通常是这样的：

```dart
Future<ByteData?>? send(String channel, ByteData? message)
```

跨越 Dart 与 Engine 边界传输的核心载体，正是 ByteData。

### 支持按类型与字节序读写

ByteData 提供基于 Offset（偏移量）的读写能力，并且强依赖于字节序（Endianness）的指定：

```dart
ByteData data = ByteData(8);
data.setInt32(0, 100, Endian.little); // 小端序
data.setInt32(4, 200, Endian.big);    // 大端序
```

字节序在底层通信中至关重要。现代移动设备（Android ARM, iOS ARM64）在内存中普遍采用小端序 (Little-Endian) ，而标准的网络协议（如 TCP/IP）则规定使用大端序 (Big-Endian) 。在处理蓝牙外设或网络裸流时，必须明确指定，否则会导致数据解析异常。

## Flutter Platform Channel 的二进制本质

### invokeMethod 的完整流转

调用 `invokeMethod()` 并非直接的跨语言函数调用。在架构层面上，Platform Channel 完全是 Dart Framework 层的封装。其底层数据流转路径如下：

```txt
Dart Object
     ↓
MessageCodec
     ↓
ByteData
     ↓
BinaryMessenger
     ↓
Flutter Engine
     ↓
Platform Message
     ↓
Platform Thread
     ↓
Android/iOS Native
```

### StandardMessageCodec 的类型标签

以 StandardMessageCodec 为例，它为各种类型分配了专属的 Type Tag。例如：`0x08` 代表 int，`0x0A` 代表 string，而 `0x0B` 代表 Uint8List。

对于 String、List、Uint8List 等变长数据，StandardMessageCodec 不仅会写入 Type Tag，还会额外写入 Length Prefix（长度前缀），随后才会写入实际 payload。这种设计使接收方能够准确地从二进制流中解析边界。

当 Codec 在序列化时遇到 `0x0B`，它不需要递归遍历结构，而是直接计算长度，并将整块底层 ByteBuffer 追加到通信数据流中。这就解释了为什么在传输大块数据时，直接传递 Uint8List 的性能远高于传递包含大量数字的 List。

## BinaryMessenger：跨层级的消息总线

### 协议层与传输层的分离

开发者最常接触的 MethodChannel、EventChannel 等，实际上属于协议层。

而真正负责调度的核心是 BinaryMessenger（传输层）。

需要注意的是：

BinaryMessenger 并不知道 MethodChannel、invokeMethod 或 RPC 的存在。MethodChannel 只是建立在 BinaryMessenger 之上的协议层封装。对于 BinaryMessenger 而言，它只负责：

- channel name
- binary payload（ByteData）

的收发与调度。

### 核心接口

```dart
abstract class BinaryMessenger {
  Future<ByteData?>? send(String channel, ByteData? message);
  void setMessageHandler(String channel, MessageHandler? handler);
}
```

它是一个纯粹的二进制消息总线。无论是 JSON、Protocol Buffers 还是自定义裸流，最终都要被抹平为 ByteData 交由它发送。

## BasicMessageChannel 与高频数据流

### 为什么不推荐 MethodChannel 处理高频流

MethodChannel 的设计初衷是 RPC 调用（如获取电量、调用一次相机扫码）。它的方法匹配、参数拆解以及 Codec 开销，在面对高频持续的数据流（如 30fps 图像帧）时显得过于笨重。

### BasicMessageChannel 的优势

对于高频二进制流，推荐使用指定了 BinaryCodec 的 BasicMessageChannel：

```dart
const BasicMessageChannel<ByteData?> rawChannel =
    BasicMessageChannel<ByteData?>(
      'my_raw_stream',
      BinaryCodec(),
    );
```

注：BinaryCodec 的泛型约束为 `ByteData?`，需保持类型严谨。

使用这种方式，可以跳过复杂的对象序列化过程，直接暴露出底层的 ByteData 进行收发，非常适合构建持续的消息流传输通道。

需要注意的是：

即使使用 BinaryCodec，消息依然需要经过 Platform Message Pipeline。因此它只能减少 Codec 层的序列化开销，并不能彻底消除：

- Platform Message 调度
- Thread Hop
- Buffer Allocation
- Memory Copy

等底层成本。

## 真正的性能瓶颈在哪里

即便采用了纯二进制通道，通信瓶颈依然存在，我们需要从 Runtime 的视角来审视：

### Dart Isolate 与 Engine Thread 的调度延迟

Flutter 的 BinaryMessenger 并不是直接将消息抛给 Android/iOS 的 UI Thread。

Dart 侧发出的消息，首先运行于当前 Isolate 的 Event Loop 中；随后，Engine 会将 Platform Message 转发到对应的平台线程。
高频的消息发送不仅会带来序列化压力，更会对 Isolate 的事件调度产生挤压，阻塞其他微任务（Microtask）和 UI 渲染任务的执行，导致卡顿。

### 多次内存复制 (Memory Copy)

对于高频大内存数据，从 Native 到 Dart 通常会经历：
Native Buffer ➜ Engine Buffer ➜ Dart Heap
这里的跨层级搬运会发生内存复制。即使是二进制格式，频繁拷贝几 MB 的图像帧依然会大量占用系统内存带宽。在高频图像流场景下，真正消耗性能的往往不是“发送动作”，而是跨 Runtime 边界时产生的 Memory Copy。
9.3 进阶优化思路
因此，在极限性能场景下，仅仅依靠 Channel 是不够的：

图像渲染类：应当放弃通过 Channel 搬运数据，转而使用 Texture 或 ExternalTexture 共享 GPU 显存。因为在视频流场景下，真正高效的方案是：避免 CPU 侧的大规模数据搬运，直接共享 GPU 纹理或 Native Surface。
计算类（AI 推理） ：可以利用 Dart FFI (Foreign Function Interface) 直接调用底层 C/C++ 指针，或者探索 Shared Memory 技术。
并发处理：将高频数据的接收和预处理放在独立的 Isolate 中，避免污染主 Isolate 的 Event Loop。

十、总结
理解 Flutter 的架构，不能仅仅停留在 Widget 树与声明式 UI 层面。
穿透 Framework 层，无论是负责跨端通信的 BinaryMessenger，管理内存视图的 TypedData，还是底层的 C++ Engine，其运转的核心基础都建立在高效的二进制数据流转之上。
深入理解 ByteData 与底层通信机制，是跳出常规 UI 开发限制、构建高性能跨平台基建（如音视频处理、硬件协议交互、AI 端侧推理）的关键一步。

作者：RaidenLiu
链接：https://juejin.cn/post/7641054984592031754
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
