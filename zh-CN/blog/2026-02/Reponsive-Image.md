---
lastUpdated: true
commentabled: true
recommended: true
title: 响应式图片
description: 别只会 max-width:100%，真正关键是“选资源”
date: 2026-02-05 08:00:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

招聘里常写“要会响应式开发”，但很多人对“响应式图片”的理解停留在：`img { max-width:100% }`。

这确实能让图片跟着容器缩放，但手机可能仍然下载一张超大图 → 更慢、更费流量。

> 一句话结论：响应式图片 = 显示合适（缩放） + 下载合适（选资源）。

## 你将学到什么 ##

- 路线 A：`srcset + sizes`（同一构图，只换清晰度/文件大小）✅最常用
- 路线 B：`<picture>`（不同屏幕需要不同构图/裁切）✅更像“艺术指导”

# 一、为什么“看起来能缩放”还不算响应式图片？ ##

很多人写过这样的 CSS：

```css
img {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  height: auto;
}
```

它能做到：*图片不会超过容器宽度*。你拖动浏览器窗口，图片会变大变小，看起来“已经响应式”。

但这只解决了 *A：显示尺寸变了*，并没有解决 *B：下载资源跟着变*。

### 核心误区：只做到了“显示变了”，没做到“资源变了” ###

举个真实场景：

- 手机上的容器可能只有 360px
- 但你仍然让浏览器下载 `elva-800w.jpg`（宽 800px 的图片资源）
- 结果：下载更大图片 → 更慢 → 更费流量

> “不响应式”很多时候指的是：资源选择不智能（一张大图走天下）。

### 验证一下：你到底下载了多大的图？ ###

用最简单的方式验证（强烈建议写在文中让读者照做）：

- 打开 DevTools → Network
- 过滤 Img
- 刷新页面（建议先勾选 Disable cache）
- 看看下载的是不是永远同一张大图

如果你只用了 `max-width:100%`，你会发现：*图片显示变了，但下载的资源没变。*

### 更典型的“永远一刀切”：header 背景图 ###

```css
header {
  background: url(header.jpg) no-repeat center;
  height: 200px;
}
```

这意味着：

- 手机也下载 `header.jpg`
- 大屏也下载 `header.jpg`
- 永远只一张图（可能手机浪费流量，大屏又不够清晰）

## 二、真正的响应式图片到底要满足哪两件事？ ##

MDN 对响应式图片的解释：响应式图片是在不同屏幕尺寸、分辨率或具有其他类似特性的设备上都呈现良好的图片，并探究 HTML 提供的一些帮助实现它们的工具，以提升不同设备上的性能。

> 你可以把“响应式图片”拆成两个必须同时达成的目标：

### ✅ 显示合适（布局 / 缩放） ###

- 不溢出、不变形、排版正常
- 常用：`max-width:100%`、合理容器布局

### ✅ 下载合适（性能 / 清晰度）——真正关键 ###

- 手机别下载超大图（省流量/更快）
- 高清屏别糊（足够清晰）
- 需要：`srcset / sizes` 或 `<picture>`

## 三、两条路线怎么选（先把路选对） ##

|  场景  |  解决什么  |   用什么  |  一句话  |
| :-----------: | :----: | :----: | :----: |
| 同一张画面，不同清晰度/体积 |  省流量 + 不糊  |  `srcset + sizes` | ✅最常用：浏览器按“显示宽度 + DPR”选 |
| 不同屏幕要不同构图（裁切/近景/信息更清晰） |  画面信息清晰  |  `<picture>` + `source[media]` | ✅需要“换构图”才用 |

> 优先学 `srcset + sizes`（默认方案） ，只有当你确实需要换构图，再上 `<picture>`。

## 四、路线 A：`srcset + sizes`（同构图选尺寸）✅最常用 ##

你只需要记住一句话：

> `srcset` 提供候选资源，`sizes` 告诉浏览器“这张图大概会显示多宽”，浏览器再结合 DPR 选最合适的那张。

### 最小可用示例 ###

```html
<img
  srcset="
    elva-fairy-480w.jpg 480w,
    elva-fairy-800w.jpg 800w
  "
  sizes="(max-width: 600px) 100vw, 800px"
  src="elva-fairy-800w.jpg"
  alt="Elva dressed as a fairy"
/>
```

这三行分别干什么？

- `srcset="... 480w, ... 800w"`：告诉浏览器“我有两个宽度版本”
- `sizes="(max-width: 600px) 100vw, 800px"`：告诉浏览器“图片显示宽度的预估值”
- `src="..."`：兜底（旧浏览器不支持 `srcset/sizes` 时仍能显示）

### `sizes` 为什么是关键？ ###

```txt
sizes="(max-width: 600px) 100vw, 800px"
```

含义是：

- 屏幕 ≤ 600px：图片显示宽度 ≈ 100vw（占满屏幕）
- 否则：图片显示宽度 ≈ 800px

> `sizes` 不是“图片实际宽度”，而是你告诉浏览器的“显示宽度预估”。
> 预估越接近实际布局，浏览器选资源就越合理。

### 浏览器到底怎么选？（用一句“算账”帮助读者真正会用） ###

浏览器会估算：

> 目标资源像素宽度 ≈ 图片显示宽度 × DPR

举例：

- 手机 viewport 360px
- `sizes` 告诉浏览器图片显示宽度是 `100vw` → 约 360px
- `DPR=2` → 目标像素宽度约 720px → 浏览器更可能选 `800w` 而不是 `480w`

这就是为什么：同一手机上，不同 DPR 可能选不同资源。

### 怎么验证你成功了？ ###

- DevTools → Network → Img
- 拖动窗口宽度（跨过 600px）
- 或在不同 DPR 设备/模拟器上看
- 你应该能看到请求的图片文件名/尺寸发生变化

## 五、路线 B：`<picture>`（换构图）✅当你需要裁切/近景时才用 ###

如果小屏上主体太小、信息看不清，就不是“缩小同一张图”能解决的，而是要换一张更适合小屏的构图（art direction）。

### 最小可用示例 ###

```html
<picture>
  <source media="(max-width: 799px)" srcset="elva-480w-close-portrait.jpg">
  <source media="(min-width: 800px)" srcset="elva-800w.jpg">
  <img src="elva-800w.jpg" alt="Chris standing up holding his daughter Elva">
</picture>
```

### 三句话搞懂 `<picture>` ###

- `<picture>` 不负责渲染，真正渲染出来的是里面的 `<img>`
- 浏览器从上到下匹配 `<source>`，第一个匹配的就用
- 如果都不匹配或浏览器不支持 `<picture>`，就用 `<img src="...">` 兜底

### 两个新手最常踩的坑（建议保留在文中） ###

#### 坑 1：`media` 判断的是 `viewport` 宽度，不是图片容器宽度 ####

- 它看的是浏览器可视区域（窗口/屏幕）宽度
- 不是你 `.card` 或 `.container` 的宽度

#### 坑 2：如果你要支持 AVIF/WebP，要写 `type` ####

```html
<picture>
  <source type="image/avif" srcset="a.avif">
  <source type="image/webp" srcset="a.webp">
  <img src="a.jpg" alt="">
</picture>
```

### 怎么验证 `<picture>` 切换成功？ ###

- DevTools → Network → Img
- 勾选 Disable cache（避免缓存干扰）
- 拖动窗口跨过 799/800
- 看请求的图片资源是否从 `close-portrait` 切到 `800w`

> 注意：有些浏览器在缓存/已加载的情况下，可能需要刷新才能重新触发选择。

## 六、实战落地：我在项目里的默认规则（建议保留） ##

以后开发拿到一张图片，问自己两件事：

### 显示是否要“缩放得体” ###

- 不溢出、不变形、排版正常
- 通常用：

```css
img {
  max-width: 100%;
  height: auto;
  display: block;
}
```

### 资源是否要“下载得体”（关键） ###

- 默认用 `srcset + sizes`（同构图）

- 只有需要换构图时用 `<picture>`

- 最好配合：

  - `loading="lazy"`（非首屏）
  - 写好 `width/height` 或占位（减少布局抖动 CLS）

## 七、总结 ##

> 响应式图片 = 显示合适（缩放） + 下载合适（选资源）

- 只做 `max-width:100%`：✅能缩放，但 ❌资源不变（不够响应式）
- 只需换清晰度/大小：用 `srcset + sizes`
- 需要换构图/裁切：用 `<picture>`

## 八、代码附录 ##

### 响应式图片（只具备缩放特征） ###

```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>Not responsive demo</title>
    <style>
      html {
        font-family: sans-serif;
        background-color: gray;
      }
      body {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        background-color: white;
      }
      header {
        background: url(header.jpg) no-repeat center;
        height: 200px;
      }
      section {
        padding: 20px;
      }
      p {
        line-height: 1.5;
      }
      img {
        display: block;
        margin: 0 auto;
        max-width: 100%;
        height: auto;
      }
    </style>
  </head>
  <body>
    <header></header>
    <main>
      <section>
        <h1>My website</h1>

        <p>Lorem ipsum dolor sit amet...</p>

        <img src="elva-800w.jpg" alt="Chris standing up holding his daughter Elva">

        <p>Suspendisse potenti...</p>

        <img src="elva-fairy-800w.jpg" alt="Elva dressed as a fairy">
      </section>
    </main>
  </body>
</html>
```

### 响应式图片（具备缩放、性能、清晰度特征） ###

```html
<main>
  <section>
    <h1>My website</h1>

    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>

    <picture>
      <source media="(max-width: 799px)" srcset="elva-480w-close-portrait.jpg">
      <source media="(min-width: 800px)" srcset="elva-800w.jpg">
      <img src="elva-800w.jpg" alt="Chris standing up holding his daughter Elva">
    </picture>

    <p>Suspendisse potenti. Ut in luctus eros...</p>

    <img
      srcset="elva-fairy-480w.jpg 480w,
              elva-fairy-800w.jpg 800w"
      sizes="(max-width: 600px) 100vw, 800px"
      src="elva-fairy-800w.jpg"
      alt="Elva dressed as a fairy"
    >
  </section>
</main>
```
