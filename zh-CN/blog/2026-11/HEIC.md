---
lastUpdated: true
commentabled: true
recommended: true
title: iPhone 用户传了张 HEIC，我的前端崩了
description: iPhone 用户传了张 HEIC，我的前端崩了
date: 2026-11-23 12:15:00
pageClass: blog-page-class
cover: /covers/html5.svg
---

去年做的一个小程序，有个功能让用户上传证件照做简历。测试阶段一切正常，上线第一天就收到反馈：“上传照片之后页面白屏了。”

一开始以为是图片太大，让用户换了一张还是白屏。后来让用户截了个相册的图发过来，发现照片格式是 `.HEIC`。

好吧，这个坑迟早要踩。

## HEIC 是什么 ##

HEIC（High Efficiency Image Container）是苹果从 iOS 11 开始默认使用的图片格式，底层编码是 HEVC（H.265）。相比 JPEG，同等画质下文件体积能小一半左右。所以苹果用它是有道理的——省存储空间。

但问题在于，除了苹果生态，其他地方对 HEIC 的支持基本拉胯：

- Chrome 直到 2020 年底才开始部分支持（而且需要操作系统层面支持 HEVC 解码）
- Firefox 不支持
- 大部分后端图片处理库默认不支持
- Windows 自带的照片查看器老版本打不开

所以现实情况就是：iPhone 用户拍了张照片，传到你的网站，你的前端不认识这个格式，后端也不认识，然后就崩了。

## 我遇到的具体问题 ##

我们那个小程序是用 Canvas 来做图片预览和裁剪的。流程是这样的：

1. 用户选择文件
2. 用 `FileReader` 读取为 `DataURL`
3. 赋值给 `Image` 对象
4. 画到 `Canvas` 上做裁剪

JPEG 和 PNG 走这个流程没有任何问题。但 HEIC 文件在第 3 步就挂了——`Image` 对象的 `onerror` 触发，因为浏览器解不了 `HEVC` 编码。

当时看了一眼控制台，`net::ERR_UNKNOWN_URL_SCHEME` 还是什么乱七八糟的报错，总之就是浏览器说"我不认识这个东西"。

## 几个处理方案 ##

### 服务端转换 ###

最直接的思路是把 HEIC 转成 JPEG 放到服务端做。Node.js 有 `heic-convert` 这个库，用法也很简单：

```ts
const convert = require('heic-convert');

const result = await convert({
  buffer: inputBuffer,
  format: 'JPEG',
  quality: 0.85,
});
```

但这个库的底层依赖 libheif，安装的时候需要编译 C++ 依赖。在 Docker 里跑还行，直接在云函数（比如 AWS Lambda 或阿里云函数计算）里跑就比较折腾，镜像要自己构建。

另外，用户先把 HEIC 传到服务器（可能 5-8MB），然后服务器转换，再把 JPEG 返回来。整个链路长了一圈，用户等待时间也长。

### 客户端 WASM 解码 ###

后来发现有个叫 `heic2any` 的 JS 库，用 `WebAssembly` 在浏览器里解码 HEIC。不需要服务端参与，直接在客户端把 HEIC 转成 JPEG 或 PNG 的 Blob。

```ts
import heic2any from 'heic2any';

const jpegBlob = await heic2any({
  blob: heicFile,
  toType: 'image/jpeg',
  quality: 0.85,
});
```

这个方案的好处是省掉了上传大文件的环节——用户在浏览器里选完文件，本地转成 JPEG，然后再上传压缩后的文件。

缺点是 WASM 解码器本身有大概 600KB 的大小（gzip 后约 200KB），加载一次还是有感知的。所以我的做法是懒加载——只有检测到文件类型是 HEIC 的时候才去加载这个解码器。

### 在线工具做应急方案 ###

有时候不是自己的产品需要处理 HEIC，而是临时碰到一个场景：运营同事从 iPhone 上拍了几张产品图，需要转成 JPEG 放到后台系统里。后台系统不支持 HEIC 上传，运营也不会用 PS 转格式。

这种情况下我一般直接用在线工具。试过好几个，有的会上传文件到服务器处理（不太放心，毕竟是产品图），有的处理速度很慢。后来固定用的是 glazlo.com/heic-to-jpg 这个页面，它是在浏览器本地转换的，不上传文件。操作也简单，选文件、等转换、下载 JPEG，几秒钟搞定一张。

它这个页面的设计比较克制——没有广告弹窗，没有"注册后下载无限制"之类的套路，选完文件直接出结果。对偶尔用一次的人来说挺合适的。

## 最终方案 ##

我们那个小程序最后用的是客户端 WASM 解码 + 服务端兜底的双保险策略：

```ts
async function handleImageUpload(file) {
  // 检测 HEIC
  if (file.type === 'image/heic' || file.name.endsWith('.heic')) {
    try {
      // 优先客户端转换
      const { default: heic2any } = await import('heic2any');
      const jpegBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.85,
      });
      return new File([jpegBlob], file.name.replace(/\.heic$/i, '.jpg'), {
        type: 'image/jpeg',
      });
    } catch (e) {
      // 客户端转换失败，原样上传让服务端处理
      console.warn('HEIC client-side conversion failed, falling back to server', e);
      return file;
    }
  }
  return file;
}
```

服务端那边用 heic-convert 做了一层兜底，万一客户端转换失败（有些老版本浏览器的 WASM 支持有问题），服务端还能接住。

上线之后 HEIC 白屏的问题基本消失了。偶尔有用户反馈上传慢，查了一下是网络问题，跟 HEIC 没关系。

## 一些经验 ##

- *永远不要假设用户上传的图片格式。* 你觉得只有 JPEG 和 PNG？用户会给你 HEIC、AVIF、甚至 TIFF。
- *文件类型检测不要只看 MIME type。* `file.type` 在某些浏览器和系统上可能返回空字符串。保险起见也检查一下文件扩展名和文件头（magic number）。
- *HEIC 的 MIME type 有两种写法*： `image/heic` 和 `image/heif`。两个都要判断。
- *客户端解码 HEIC 的性能不算快。* 一张 4000x3000 的照片在手机上可能要转 3-5 秒，记得加个 `loading` 状态，别让用户以为页面卡了。
- *图片格式兼容这件事，说大不大说小不小。*但一旦你的产品面向普通用户（而不是只有开发者），HEIC 就是一个绕不过去的坎。早点处理好，比上线后被用户骂强。
