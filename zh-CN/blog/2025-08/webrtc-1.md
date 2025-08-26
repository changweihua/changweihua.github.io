---
lastUpdated: true
commentabled: true
recommended: true
title: WebRTC 入门指南：实时通信完全解析
description: WebRTC 入门指南：实时通信完全解析
date: 2025-08-26 09:35:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

## 🚀 简介 ##

WebRTC（Web 实时通信）是一项强大的技术，支持浏览器和移动应用实时交换音视频与数据——无需中间服务器中转。它是现代视频通话、屏幕共享工具及实时协作平台的核心底层技术。

本文将完整覆盖 WebRTC 技术流程：从获取用户媒体到建立安全的点对点（P2P）连接，并提供基于 TypeScript 风格的 JavaScript 实战示例。

## 🎥 捕获媒体流 ##

### 什么是媒体流（Media Stream）？ ###

流（Stream）是连续的数据传输流——在 WebRTC 中，特指实时传输的音频或视频数据。

### 使用 getUserMedia 捕获音视频 ###

通过 `navigator.mediaDevices.getUserMedia()` 方法可请求访问用户的麦克风和摄像头，示例如下：

```ts
// 配置：同时捕获音频和视频
const constraints = { audio: true, video: true }; 

navigator.mediaDevices
  .getUserMedia(constraints)
  .then((mediaStream) => {
    console.log('成功获取媒体流：', mediaStream);
  })
  .catch((err) => {
    console.error('获取媒体流失败：', err);
  });
```

> 💡 注意：浏览器会先弹出权限请求，仅在用户允许后才会提供音视频访问权限。

### 在 `<video>` 元素中显示视频 ###

首先在 HTML 中定义用于显示视频的元素：

```html
<video autoplay playsinline id="local-video"></video>
<!-- autoplay：自动播放；playsinline：在页面内播放（避免全屏） -->
```

再通过 JavaScript 将捕获到的媒体流绑定到视频元素：

```ts
const videoElement = document.getElementById('local-video') as HTMLVideoElement;

navigator.mediaDevices.getUserMedia({ video: true }) // 仅捕获视频
  .then((stream) => {
    videoElement.srcObject = stream; // 将媒体流赋值给视频元素
  });
```

## 🎛 枚举与选择设备 ##

### 枚举所有设备 ###

通过以下方法可列出设备上所有可用的音视频输入/输出设备（如麦克风、摄像头、扬声器）：

```ts
navigator.mediaDevices.enumerateDevices()
  .then((devices) => {
    devices.forEach((device) => {
      console.log(`${device.kind}：${device.label}`); 
      // 示例输出：videoinput：USB 摄像头、audioinput：内置麦克风
    });
  });
```

### 监听设备变化 ###

当有新设备（如外接摄像头）连接或设备断开时，可通过事件监听实时更新设备列表：

```ts
navigator.mediaDevices.addEventListener('devicechange', () => {
  console.log('设备列表已更新！');
  // 可在此处重新调用 enumerateDevices() 刷新设备列表
});
```

## 🧪 使用媒体约束（Media Constraints） ##

媒体约束允许精细化配置音视频参数，例如指定使用某台摄像头、设置视频分辨率或帧率：

```ts
const preferredDeviceId = 'abc123'; // 从 enumerateDevices() 获取的目标设备 ID

const constraints = {
  video: {
    deviceId: { exact: preferredDeviceId }, // 精确指定使用某台设备
    width: { ideal: 1280 }, // 理想宽度：1280px
    height: { ideal: 720 }, // 理想高度：720px（720P）
    frameRate: { ideal: 30 }, // 理想帧率：30fps
  },
  audio: {
    echoCancellation: true, // 开启回声消除
  },
};

// 按约束条件获取媒体流
navigator.mediaDevices.getUserMedia(constraints);
```

## 🖥 捕获屏幕 ##

通过 `getDisplayMedia()` 方法可捕获屏幕内容（如整个屏幕、特定窗口或应用），示例如下：

```ts
const screenStream = await navigator.mediaDevices.getDisplayMedia({
  video: true, // 屏幕捕获仅支持视频（无音频）
});
// 将屏幕流绑定到视频元素显示
document.querySelector('video').srcObject = screenStream;
```

> 📌 注意：浏览器会弹出选择窗口，要求用户指定要捕获的屏幕、窗口或应用。

## 🎚 管理媒体轨道（Media Tracks） ##

每个媒体流（Stream）包含一个或多个轨道（Track），分别对应音频轨道或视频轨道。可对轨道进行单独禁用、停止等操作：

```ts
// 获取仅含视频的媒体流
const stream = await navigator.mediaDevices.getUserMedia({ video: true });
// 提取流中的所有轨道
const tracks = stream.getTracks();

// 1. 禁用轨道（临时关闭，可重新启用）
tracks[0].enabled = false; // 禁用第一个轨道（此处为视频轨道）

// 2. 完全停止轨道（释放设备资源，无法恢复）
tracks.forEach((track) => track.stop());
```

## 🌐 建立对等连接（Peer Connection） ##

WebRTC 的核心是 RTCPeerConnection 接口，它负责在两个对等端（如两台设备）之间建立直接连接：

```ts
// 配置 ICE 服务器（用于穿透 NAT，建立 P2P 连接）
const config = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' } // 谷歌公共 STUN 服务器
  ],
};

// 创建对等连接实例
const peerConnection = new RTCPeerConnection(config);
```

## 📡 ICE、STUN、TURN 概念解析 ##

WebRTC 依赖以下三种技术实现对等端之间的网络连接：

- **ICE（Interactive Connectivity Establishment，交互式连接建立）**：核心框架，负责寻找对等端之间可用的网络路径。
- **STUN（Session Traversal Utilities for NAT，NAT 会话穿越工具）**：帮助设备发现自身在公网中的 IP 地址和端口（解决 NAT 遮挡问题）。
- **TURN（Traversal Using Relays around NAT，通过中继穿越 NAT）**：当 P2P 直接连接失败时，作为中继服务器转发音视频数据（确保通信不中断）。

### 含 TURN 服务器的配置示例 ###

```ts
const config = {
  iceServers: [
    // 优先使用 STUN 尝试直接连接
    { urls: ['stun:stun.l.google.com:19302'] },
    // 备用 TURN 服务器（需自行部署或使用商业服务）
    {
      urls: 'turn:turn.example.com', // TURN 服务器地址
      username: 'user', // 认证用户名
      credential: 'pass' // 认证密码
    },
  ],
};
```

## 🔄 ICE 候选者交换 ##

ICE 候选者（ICE Candidate）是包含设备网络信息（如 IP、端口、传输协议）的数据，对等端需交换候选者才能找到可通信的路径。交换需通过信令服务器（如 WebSocket）完成：

### 发送 ICE 候选者（本地 → 远程） ###

```ts
// 监听本地 ICE 候选者生成事件
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    // 通过信令服务器将候选者发送给远程对等端
    signalingServer.send('ice-candidate', event.candidate);
  }
};
```

### 接收 ICE 候选者（远程 → 本地） ###

```ts
// 监听信令服务器的 ICE 候选者消息
signalingServer.on('ice-candidate', async (candidate) => {
  // 将远程候选者添加到本地对等连接
  await peerConnection.addIceCandidate(candidate);
});
```

## 🤝 提议/应答交换（SDP） ##

对等连接建立前，需交换 SDP（Session Description Protocol，会话描述协议）信息，用于协商媒体格式、编码方式等参数。交换过程分为“提议（Offer）”和“应答（Answer）”两步：

### 发起方创建并发送提议 ###

```ts
// 1. 创建提议（包含本地媒体配置）
const offer = await peerConnection.createOffer();
// 2. 将提议设置为本地描述（保存本地配置）
await peerConnection.setLocalDescription(offer);
// 3. 通过信令服务器发送提议给接收方
signalingServer.send('offer', offer);
```

### 接收方处理提议并发送应答 ###

```ts
// 1. 接收并设置远程描述（保存发起方的配置）
peerConnection.setRemoteDescription(offer).then(async () => {
  // 2. 创建应答（包含接收方的媒体配置）
  const answer = await peerConnection.createAnswer();
  // 3. 将应答设置为本地描述（保存接收方配置）
  await peerConnection.setLocalDescription(answer);
  // 4. 通过信令服务器发送应答给发起方
  signalingServer.send('answer', answer);
});
```

## 🎤 向连接添加本地媒体 ##

将本地捕获的音视频流添加到对等连接，才能向远程对等端传输媒体：

```ts
// 1. 获取本地音视频流
const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
// 2. 将流中的所有轨道添加到对等连接
stream.getTracks().forEach((track) => {
  peerConnection.addTrack(track, stream);
});
```

### 接收远程媒体 ###

监听 track 事件，获取远程对等端发送的媒体流并显示：

```ts
peerConnection.addEventListener('track', (event) => {
  // 从事件中提取远程媒体流
  const remoteStream = event.streams[0];
  // 将远程流绑定到视频元素（显示对方画面）
  document.getElementById('remote-video').srcObject = remoteStream;
});
```

## 🔁 动态管理轨道 ##

连接建立后，可动态调整媒体轨道（如关闭麦克风、切换摄像头）：

### 切换麦克风（禁用/启用音频轨道） ###

```ts
// 1. 找到音频轨道的发送器（Sender）
const audioSender = peerConnection
  .getSenders()
  .find((sender) => sender.track?.kind === 'audio');

// 2. 禁用/启用音频轨道
if (audioSender) audioSender.track.enabled = false; // 禁用（静音）
// if (audioSender) audioSender.track.enabled = true; // 启用（取消静音）
```

### 连接后添加新轨道 ###

```ts
// 假设已获取新的视频轨道（如切换摄像头后的轨道）
const newVideoTrack = stream.getVideoTracks()[0];
// 将新轨道添加到对等连接
peerConnection.addTrack(newVideoTrack, stream);
```

## ❌ 关闭 WebRTC 连接 ##

结束通信时，需停止所有媒体轨道并关闭对等连接，释放资源：

```ts
// 1. 停止所有发送器的轨道
peerConnection.getSenders().forEach((sender) => sender.track.stop());
// 2. 关闭对等连接
peerConnection.close();
```

## 👥 群组通话：Mesh、SFU 与 MCU 对比 ##

当通话参与者超过 2 人时，需选择合适的架构方案。以下是三种主流群组通话架构的对比：

### Mesh 架构 ###

- 原理：每个参与者直接与其他所有参与者建立 P2P 连接（如 3 人通话需建立 3 条连接）。
- 优点：架构简单，无需专用媒体服务器，延迟低。
- 缺点：参与者数量越多，CPU 占用和网络带宽消耗呈指数级增长（仅适合 4 人以下小规模通话）。

### SFU（选择性转发单元） ###

- 原理：所有参与者将媒体流发送到 SFU 服务器，服务器不解码媒体，仅根据需求将流转发给其他参与者（如只转发说话者的流）。
- 优点：客户端负载低（仅需处理 1 条上传流和 N 条下载流），支持中等规模群组（20 人以内）。
- 主流方案：LiveKit、mediasoup、Mirotalk。

### MCU（多点控制单元） ###

- 原理：所有参与者将媒体流发送到 MCU 服务器，服务器解码并混合所有流（如将多个人的画面合成一个分屏画面），再将混合后的单一流转发给所有参与者。
- 优点：客户端负载极低（仅需处理 1 条上传流和 1 条下载流）。
- 缺点：服务器解码/混合需大量计算资源，延迟较高，服务器成本高（适合大规模但对延迟不敏感的场景）。

## 🧩 总结 ##

WebRTC 仅需几行 JavaScript 代码，就能实现实时音视频与数据传输。虽然入门简单，但它涉及 ICE、SDP、信令等深层技术概念。

无论你是想开发类似 Zoom 的视频会议工具，还是实时代码面试平台——理解如何捕获、发送和接收点对点媒体流，都是迈出的第一步。
