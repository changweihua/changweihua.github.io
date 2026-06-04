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

> 在广阔的 CSS 世界中，除了那些广为人知的常见属性，其实还隐藏着不少低调却强大的功能。它们可能不常被提及，却能在实际开发中发挥巨大作用——用更精简的代码实现更细腻的效果，让界面构建变得更加高效与优雅。

## accent-color：一键美化表单控件 ##

过去，自定义复选框和单选按钮往往需要复杂 hack 或借助 JavaScript，而 `accent-color` 属性让我们仅用一行代码，就能轻松设置其主题色：

```css
input[type="checkbox"] {
    accent-color: hotpink;
}
```

主流浏览器均已支持，使用无忧！

## caret-color：自定义输入光标颜色 ##

在深色背景的表单中，默认的黑色光标可能显得突兀。`caret-color` 可帮助我们统一光标的颜色，提升整体设计的一致性：

```css
input {
    caret-color: limegreen;
}
```

## currentColor：实现动态颜色继承 ##

这是一个非常有用的关键字，代表当前元素的文字颜色。借助 `currentColor`，我们可以让边框、背景等属性自动继承文本色，减少重复代码，更易于维护：

```css
button {
    color: #007bff;
    border: 2px solid currentColor;
}
```

## `::marker`：灵活定制列表标记 ##

现在我们可以直接使用 `::marker` 伪元素改变列表项目符号的样式，不再需要图片或额外标签：

```css
li::marker {
    color: crimson;
    font-size: 1.2rem;
}
```

## `:user-valid`：智能表单验证样式 ##

与 `:valid` 不同，`:user-valid` 只在用户与表单发生交互之后才显示验证结果，避免初始状态就出现错误提示，体验更加友好：

```css
input:user-valid {
    border-color: green;
}
```

## `:placeholder-shown`：根据占位符状态设定样式 ##

该伪类可以选择正处于显示占位符状态的输入框，非常适合用来制作浮动标签或动态效果：

```css
input:placeholder-shown {
    opacity: 0.5;
}
```

## `all: unset`：快速重置元素样式 ##

如果你正在设计一个完全自定义的组件，可以使用 `all: unset` 快速清除该元素的所有默认样式，让你从“零”开始：

```css
button {
    all: unset;
}
```

> ⚠️ 注意它会同时清除继承样式，需配合后续定制使用。

## inset：简写定位属性 ##

在进行绝对或固定定位时，不再需要分别设置 top/right/bottom/left。`inset` 提供了一种更简洁的写法：

```css
.element {
    inset: 0;            /* 四边均为 0 */
    inset: 10px 20px;    /* 上下10px，左右20px */
}
```

## `text-wrap: balance`：智能文本平衡 ##

这一属性可自动平衡多行文本（如标题）的字数分布，让排版更加美观。目前虽兼容性有限，但非常值得关注：

```css
h1 {
    text-wrap: balance;
}
```
> 这些 CSS 功能也许平时容易被忽略，却在合适的场景中能大幅提升开发效率与设计效果。不妨在接下来的项目中尝试使用，或许会带来意想不到的收获。
