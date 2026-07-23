---
lastUpdated: true
commentabled: true
recommended: true
title: 别再滥用 Base64 了
description: Blob 才是前端减负的正确姿势
date: 2026-01-07 10:30:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

## 一、什么是 Blob？ ##

Blob（Binary Large Object，二进制大对象）是浏览器提供的一种不可变、类文件的原始数据容器。它可以存储任意类型的二进制或文本数据，例如图片、音频、PDF、甚至一段纯文本。与 `File` 对象相比，Blob 更底层，File 实际上继承自 Blob，并额外携带了 `name`、`lastModified` 等元信息 。

Blob 最大的特点是*纯客户端、零网络*：数据一旦进入 Blob，就活在内存里，无需上传服务器即可预览、下载或进一步加工。

## 二、构造一个 Blob：一行代码搞定 ##

```js
const blob = new Blob(parts, options);
```

| **参数**        |      **说明**      |
| :------------- | :-----------: |
|  `parts`  | 数组，元素可以是 `String`、`ArrayBuffer`、`TypedArray`、`Blob` 等。  |
|  `options`  | 可选对象，常用字段：`type` MIME 类型，默认 `application/octet-stream`；`endings` 是否转换换行符，几乎不用。  |

示例：动态生成一个 Markdown 文件并让用户下载

```js
const content = '# Hello Blob\n> 由浏览器动态生成';
const blob = new Blob([content], { type: 'text/markdown' });
const url = URL.createObjectURL(blob);

const a = document.createElement('a');
a.href = url;
a.download = 'hello.md';
a.click();

// 内存用完即弃
URL.revokeObjectURL(url);
```

## 三、Blob URL：给内存中的数据一个“临时地址” ##

### 生成方式 ###

```js
const url = URL.createObjectURL(blob);
// 返回值样例
// blob:https://localhost:3000/550e8400-e29b-41d4-a716-446655440000
```

### 生命周期 ###

- 作用域：仅在当前文档、当前会话有效；页面刷新、`close()`、手动调用 `revokeObjectURL()` 都会使其失效 。
- 性能陷阱：不主动释放会造成内存泄漏，尤其在单页应用或大量图片预览场景 。

**最佳实践封装**：

```js
function createTempURL(blob) {
  const url = URL.createObjectURL(blob);
  // 自动 revoke，避免忘记
  requestIdleCallback(() => URL.revokeObjectURL(url));
  return url;
}
```

## 四、Blob vs. Base64 vs. ArrayBuffer：如何选型？ ##

| **场景**        |      **推荐格式**      | **理由**        |
| :------------- | :-----------: | :------------- |
|  图片回显、`<img>`/`<video>`  | `Blob URL`  |  浏览器可直接解析，无需解码；内存占用低。  |
|  小图标内嵌在 `CSS`/`JSON`  | `Base64`  |  减少一次 HTTP 请求，但体积增大约 33%。  |
|  纯计算、`WebAssembly` 传递  | `ArrayBuffer`  |  可写、可索引，适合高效运算。  |
|  上传大文件、断点续传  | `Blob.slice`  |  流式分片，配合 `File.prototype.slice` 做断点续传 。  |

## 五、高频实战场景 ##

### 本地图片/视频预览（零上传） ###

```html
<input type="file" accept="image/*" id="uploader">
<img id="preview" style="max-width: 100%">

<script>
uploader.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  preview.src = url;
  preview.onload = () => URL.revokeObjectURL(url); // 加载完即释放
};
</script>
```

### 将 Canvas 绘图导出为 PNG 并下载 ###

```js
canvas.toBlob(blob => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'snapshot.png';
  a.click();
  URL.revokeObjectURL(url);
}, 'image/png');
```

### 抓取远程图片→Blob→本地预览（跨域需 CORS） ###

```js
fetch('https://i.imgur.com/xxx.png', { mode: 'cors' })
  .then(r => r.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob);
    document.querySelector('img').src = url;
  });
```

> 若出现图片不显示，99% 是因为服务端未返回 `Access-Control-Allow-Origin` 头 。

## 六、踩坑指南与性能锦囊 ##

| **坑点**        |      **解决方案**      |
| :------------- | :-----------: |
|  内存暴涨  | 每次 `createObjectURL` 后，务必在合适的时机 `revokeObjectURL` 。  |
|  跨域失败  | 确认服务端开启 CORS；fetch 时加 `{credentials: 'include'}` 如需 Cookie。  |
|  移动端大视频卡顿  | 避免一次性读完整文件，使用 `blob.slice(start, end)` 分段读取。  |
|  旧浏览器兼容  | IE10+ 才原生支持 Blob；如需更低版本，请引入 `Blob.js` 兼容库。  |

## 七、延伸：Blob 与 Stream 的梦幻联动 ##

当文件超大（GB 级）时，全部读进内存并不现实。可以借助 `ReadableStream` 把 `Blob` 转为流，实现渐进式上传：

```js
const stream = blob.stream(); // 返回 ReadableStream
await fetch('/upload', {
  method: 'POST',
  body: stream,
  headers: { 'Content-Type': blob.type }
});
```

Chrome 85+、Edge 85+、Firefox 已经支持 `blob.stream()`，能以流式形式边读边传，内存占用极低。

## 八、总结：记住“三句话” ##

- Blob = 浏览器端的二进制数据仓库，File 只是它的超集。
- Blob URL = 指向内存的临时指针，用完后必须手动或自动释放。
- 凡是“本地预览、零上传、动态生成下载”的需求，优先考虑 Blob + Blob URL 组合。

> 用好 Blob，既能提升用户体验（秒开预览），又能降低服务端压力（无需中转），是每一位前端工程师的必备技能。
