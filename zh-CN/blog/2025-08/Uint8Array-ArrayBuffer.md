---
lastUpdated: true
commentabled: true
recommended: true
title: 关于`Uint8Array` 和 `ArrayBuffer`的使用
description: 关于`Uint8Array` 和 `ArrayBuffer`的使用
date: 2025-08-04 13:30:00 
pageClass: blog-page-class
cover: /covers/typescript.svg
---

在 JavaScript 中处理二进制数据时，`Uint8Array` 和 `ArrayBuffer` 是密切相关的两个概念，以下是它们的核心区别和使用场景的详细说明：

## 核心关系图解 ##

```javascript
ArrayBuffer (原始二进制数据容器)
     |
     ˅ 
通过视图访问
     |
     ˅ 
Uint8Array (具体操作二进制数据的类型化数组)
```

## ArrayBuffer：原始二进制容器 ##

- **本质**：表示一段原始的二进制数据缓冲区
- **特点**：
  - 不能直接读写，必须通过视图（TypedArray或DataView）操作
  - 固定长度，创建后不可改变大小
  - 仅存储原始字节，无数据类型信息

### 创建示例 ###

```ts
// 创建 16 字节的缓冲区
const buffer = new ArrayBuffer(16);
console.log(buffer.byteLength); // 16
```

## Uint8Array：类型化数组视图 ##

- **本质**：基于 ArrayBuffer 的视图，以 8 位无符号整数形式解释数据
- **特点**：
  - 可以直接操作二进制数据
  - 自动处理字节对齐
  - 提供数组式访问接口

### 创建示例 ###

```ts
// 方式1：基于已有 ArrayBuffer
const buffer = new ArrayBuffer(8);
const uint8 = new Uint8Array(buffer);

// 方式2：直接创建独立缓冲区
const uint8 = new Uint8Array(8); // 自动创建 8 字节的 ArrayBuffer
```

## 关键区别对比 ##


| 特性  |  ArrayBuffer  |  Uint8Array  |   备注 |
| :-------: | :---------: | :--------: | :----------: |
| 数据类型 | 原始二进制 | 容器类型化视图（8位无符号整数） |  |
| 直接访问数据 | ❌ 不可直接访问 | ✅ 可通过索引读写 |  |
| 内存分配 | 需要明确分配字节数 | 自动管理底层 ArrayBuffer |  |
| 方法功能 | 无操作方法 | 具有数组方法（map/fill等） |  |
| 字节操作粒度 | 无类型概念 | 按 8 位（1字节）单元操作 |  |

## 相互转换方法 ##

### ArrayBuffer → Uint8Array ###

```ts
const buffer = new ArrayBuffer(16);
const uint8Array = new Uint8Array(buffer);
```

### Uint8Array → ArrayBuffer ###

```ts
// 方法1：直接获取底层 buffer（共享内存）
const buffer1 = uint8Array.buffer;

// 方法2：创建拷贝（独立内存）
const buffer2 = uint8Array.slice().buffer;
```

## 实际应用场景 ##

### 场景1：文件读写操作 ###

```ts
// 读取文件到 ArrayBuffer
const fileReader = new FileReader();
fileReader.onload = () => {
  const arrayBuffer = fileReader.result;
  const uint8 = new Uint8Array(arrayBuffer);
  // 修改第一个字节
  uint8[0] = 0x89; // PNG 文件头标识
};
fileReader.readAsArrayBuffer(file);
```

### 场景2：网络通信协议处理 ###

```ts
// WebSocket 接收二进制数据
ws.binaryType = 'arraybuffer';
ws.onmessage = (event) => {
  const uint8Data = new Uint8Array(event.data);
  // 解析协议头
  const protocolVersion = uint8Data[0] & 0xF0;
};
```

### 场景3：加密算法实现 ###

```ts
function sha256(arrayBuffer) {
  const uint8 = new Uint8Array(arrayBuffer);
  // 执行位操作
  for (let i = 0; i < uint8.length; i++) {
    uint8[i] ^= 0xFF; // 简单异或处理
  }
  return crypto.subtle.digest('SHA-256', uint8);
}
```

## 性能关键点 ##

### 内存共享特性 ###

```ts
const buffer = new ArrayBuffer(4);
const view1 = new Uint8Array(buffer);
const view2 = new Uint32Array(buffer);

view1[0] = 0x01;
console.log(view2[0]); // 0x01000000（小端序）
```

### 高效拷贝技巧 ###

```ts
// 更快的拷贝方式
const copy = new Uint8Array(originalUint8Array);
```

### 大文件处理建议 ###

```ts
// 分块处理大型文件
const chunkSize = 1024 * 1024; // 1MB
for (let i = 0; i < hugeUint8Array.length; i += chunkSize) {
  const chunk = hugeUint8Array.subarray(i, i + chunkSize);
  processChunk(chunk);
}
```

## 特殊技巧集合 ##

### 技巧1：快速初始化 ###

```ts
// 创建并填充初始值
const uint8 = Uint8Array.from([72, 101, 108, 108, 111]); // "Hello" 的 ASCII
```

### 技巧2：类型联合视图 ###

```ts
const buffer = new ArrayBuffer(8);
const header = new Uint8Array(buffer, 0, 4);  // 前4字节作为头
const payload = new Float32Array(buffer, 4);  // 后4字节作为浮点数
```

### 技巧3：字符串互转 ###

```ts
// TextEncoder/Decoder API
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const uint8 = encoder.encode('你好');
console.log(decoder.decode(uint8)); // "你好"
```

## 常见误区警示 ##

### 字节序问题 ###

```ts
const buffer = new ArrayBuffer(4);
const uint32View = new Uint32Array(buffer);
const uint8View = new Uint8Array(buffer);

uint32View[0] = 0x12345678;
console.log(uint8View[0].toString(16)); // 0x78（小端系统）或 0x12（大端系统）
```

### 越界访问静默处理 ###

```ts
const uint8 = new Uint8Array(2);
uint8[2] = 255; // 无错误，但不会实际写入
```

### 内存共享导致的意外修改 ###

```ts
const buffer = new ArrayBuffer(2);
const view1 = new Uint8Array(buffer);
const view2 = new Uint8Array(buffer);

view1[0] = 0xFF;
console.log(view2[0]); // 0xFF（同步变化）
```

## Electron 中的典型应用 ##

### 在 IPC 通信时推荐使用 ArrayBuffer ###

```ts
// 主进程发送
ipcMain.on('get-binary', (event) => {
  const buffer = fs.readFileSync('data.bin');
  event.reply('binary-data', buffer.buffer); // 发送 ArrayBuffer
});

// 渲染进程接收
ipcRenderer.on('binary-data', (_, arrayBuffer) => {
  const uint8 = new Uint8Array(arrayBuffer);
  // 处理二进制数据...
});
```

## 总结选择策略 ##

| 场景  |  推荐选择  |  原因  |   备注 |
| :-------: | :---------: | :--------: | :----------: |
| 需要原始二进制存储 | ArrayBuffer | 纯粹的数据容器，无额外开销 |  |
| 需要操作单个字节 | Uint8Array | 提供直观的字节级访问接口 |  |
| 与其他类型数据混合使用 | DataView | 处理多字节类型和字节序 |  |
| 高频数据操作 | Uint8Array | 直接访问内存，操作效率高 |  |
