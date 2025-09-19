---
lastUpdated: true
commentabled: true
recommended: true
title: 20 个「零依赖」浏览器原生能力！
description: 20 个「零依赖」浏览器原生能力！
date: 2025-09-19 16:30:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

## ResizeObserver ##

精准监听任意 DOM 宽高变化，图表自适应、虚拟滚动必备。

```ts
new ResizeObserver(([e]) => chart.resize(e.contentRect.width))
  .observe(chartDom);
```

## IntersectionObserver ##

检测元素进出视口，一次搞定懒加载 + 曝光埋点，性能零损耗。

```ts
new IntersectionObserver(entrieList =>
  entrieList.forEach(e => e.isIntersecting && loadImg(e.target))
).observe(img);
```

## Page Visibility ##

侦测标签页隐藏，自动暂停视频、停止轮询，移动端省电神器。

```ts
document.addEventListener('visibilitychange', () =>
  document.hidden ? video.pause() : video.play()
);
```

## Web Share ##

一键唤起系统分享面板，直达微信、微博、Telegram，需 HTTPS。

```ts
navigator.share?.({ title: '好文', url: location.href });
```

## Wake Lock ##

锁定屏幕常亮，直播、PPT、阅读器不再自动息屏。

```ts
await navigator.wakeLock.request('screen');
```

## Broadcast Channel ##

同域标签实时广播消息，登录态秒同步，告别 localStorage 轮询。

```ts
const bc = new BroadcastChannel('auth');
bc.onmessage = () => location.reload();
```

## PerformanceObserver ##

无侵入采集 FCP、LCP、FID，一行代码完成前端性能监控。

```ts
new PerformanceObserver(list =>
  list.getEntries().forEach(sendMetric)
).observe({ type: 'largest-contentful-paint', buffered: true });
```

## requestIdleCallback ##

把埋点、日志丢进浏览器空闲时间，首帧零阻塞。

```ts
requestIdleCallback(() => sendBeacon('/log', data));
```

## scheduler.postTask ##

原生优先级任务队列，低优任务后台跑，主线程丝滑。

```ts
scheduler.postTask(() => sendBeacon('/log', data), { priority: 'background' });
```

## AbortController ##

随时取消 fetch，路由切换不再旧请求竞态，兼容 100%。

```ts
const ac = new AbortController();
fetch(url, { signal: ac.signal });
ac.abort();
```

## ReadableStream ##

分段读取响应流，边下载边渲染，大文件内存零爆涨。

```ts
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  appendChunk(value);
}
```

## WritableStream ##

逐块写入磁盘或网络，实时保存草稿、上传大文件更稳。

```ts
const writer = stream.writable.getWriter();
await writer.write(chunk);
```

## Background Fetch ##

PWA 后台静默下载，断网恢复继续，课程视频提前缓存。

```ts
await registration.backgroundFetch.fetch('video', ['/course.mp4']);
```

## File System Access ##

读写本地真实文件，需用户授权，Web IDE 即开即用。

```ts
const [fh] = await showOpenFilePicker();
editor.value = await (await fh.getFile()).text();
```

## Clipboard ##

异步读写剪贴板，无需第三方库，HTTPS 环境安全复制。

```ts
await navigator.clipboard.writeText('邀请码 9527');
```

> 不在https下，可以用浏览器自带的 `Document.execCommand()`

## URLSearchParams ##

解析、修改、构造 URL 查询串，告别手写正则。

```ts
const p = new URLSearchParams(location.search);
p.set('page', 2);
history.replaceState({}, '', `?${p}`);
```

## structuredClone ##

深拷贝对象、数组、Map、Date，循环引用也能完美复制。

```ts
const copy = structuredClone(state);
```

## Intl.NumberFormat ##

千分位、货币、百分比一次格式化，国际化零配置。

```ts
new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' })
  .format(1234567); // ¥1,234,567.00
```

## EyeDropper ##

浏览器级吸管工具，像素级取色，设计系统直接调用。

```ts
const { sRGBHex } = await new EyeDropper().open();
```

## WebCodecs ##

原生硬解码音视频，4K 60 帧流畅播放，CPU 占用直降。

```ts
const decoder = new VideoDecoder({
  output: frame => ctx.drawImage(frame, 0, 0),
  error: console.error
});
decoder.configure({ codec: 'vp09.00.10.08' });
```
