---
lastUpdated: true
commentabled: true
recommended: true
title: 🚀 Web 图片优化实践
description: 2026年，我们该为网站选择哪种下一代图片格式？
date: 2026-01-29 09:50:00
pageClass: blog-page-class
cover: /covers/html5.svg
---

## AVIF 格式优势一览 ##

- 📦 更高压缩率：同等画质下，体积远小于 WebP 和 JPEG。
- 🌈 更好画质：低码率下细节保留更好，压缩痕迹更少。
- 🧊 支持透明通道：媲美 PNG，体积更小。
- 🎞️ 支持动画：媲美 GIF/WebP 动图。
- 🌠 高色深/HDR 支持：色彩表现更丰富。
- 🆓 免版权，开源友好。


## 2️⃣ 实际图片对比 ##

- AVIF：细节丰富，色彩平滑，压缩痕迹极少。
- WebP：细节尚可，部分区域有轻微模糊。
- JPEG：色带、马赛克明显，细节损失严重。

## 3️⃣ 总结 ##

AVIF 是目前主流图片格式中压缩率最高、画质最优的选择，非常适合对性能和体验要求极高的 Web 项目。

兼容性在主流浏览器中已逐步完善，建议采用“AVIF + WebP + JPEG/PNG”多格式兜底策略，兼顾所有用户。

动手试试 AVIF，网站加载速度和画质都能明显提升！🚀

> 大概从五六年前开始，WebP作为Google推出的图片格式，凭借其出色的压缩能力，逐渐取代了JPEG和PNG，成为我们前端性能优化的首选。

但技术总是在进步。当我们还在享受WebP带来的红利时，两个更强大的“挑战者”已经悄然成熟，它们就是 AVIF 和 JPEG XL。

这两个格式，都号称比WebP有更强的压缩率和更好的画质。那么，在2026年的今天，当我们需要为新项目选择图片格式时，到底该选谁？它们之间又有什么关键的区别？

这篇文章，将从压缩率与画质、功能特性、编解码速度和浏览器支持度这几个核心维度，对它们进行一次全面的对比，希望能帮你做出明智的决策。

## 两种格式的背景 ##

在对比之前，我们先简单了解一下它们的来历。

**AVIF (AV1 Image File Format)**：它的“父亲”是AV1视频编码标准，背后是开放媒体联盟（AOMedia），成员包括Google、Apple、Netflix、Amazon这些行业巨头。可以说，AVIF是含着“金钥匙”出生的，它的核心优势继承自AV1，就是*极高的压缩率*。

**JPEG XL (JXL)**：它的出身则更为“正统”，由JPEG委员会（就是创造JPEG格式的那个组织）推出，目标是成为JPEG的下一代“完全体”。它的核心优势是*全面的功能*和*对现有生态的向后兼容*。

## 四大维度的全面比较 ##

### 维度一：压缩率与画质 ###

这是大家最关心的部分。一个图片格式好不好，最直观的就是“体积小不小，图片清不清晰”。

总的来说，AVIF和JXL的压缩率都显著优于WebP和JPEG。但在不同场景下，二者表现有所差异。

- AVIF：在*极低的比特率*下（也就是把图片压到非常小的时候），AVIF通常能保持比JXL更好的可用画质，涂抹感控制得更好。
- JPEG XL：在*中高画质*下，JXL对细节和纹理的保留能力非常出色，画面更自然、更接近原图，很少出现AVIF那种色块和振铃效应。

### 维度二：功能特性 ###

如果说压缩率是“硬实力”，那功能特性就是“软实力”。

|  **特性**  |   **AVIF**   | **JPEG XL**  |   **说明**   |
| :-------- | :------: |:-------- | :------: |
|  无损/有损压缩  | 支持  |  支持  | 两者都支持  |
|  动画  | 支持  |  支持  | 两者都能取代GIF  |
|  Alpha透明通道  | 支持  |  支持  | 两者都能取代PNG  |
|  渐进式渲染  | 不支持  |  原生支持  | JXL的巨大优势，图片可以由模糊变清晰，体验更好  |
|  广色域/HDR  | 支持  |  支持  | 两者都支持高动态范围和广色域  |
|  JPEG无损再压缩  | 不支持  |  原生支持  | JXL的“杀手级特性”，可以将现有JPEG无损转换为JXL，体积减小约20%  |

JPEG XL的功能全面性，可以说是“降维打击”。特别是 *渐进式渲染* 和 *JPEG无损再压缩* 这两个特性，对于提升用户体验和降低迁移成本，具有巨大的现实意义。

### 维度三：编解码速度 ###

- 编码速度（生成图片）：这是AVIF目前最大的短板。AVIF的编码过程非常消耗计算资源，速度很慢。而JPEG XL的编码速度则快得多，几乎和使用mozjpeg压缩JPEG一样快。
- 解码速度（浏览器显示图片）：两者解码速度都很快，能满足Web需求。JPEG XL的设计考虑到了多线程并行解码，理论上更具优势。

### 维度四：浏览器支持度（2026年的现状） ###

这是决定一个技术能否被广泛使用的关键，也是两者“恩怨情仇”的开始。

- AVIF：得益于Google的强力推动，到2026年，AVIF的支持度已经非常好，几乎所有主流浏览器（Chrome, Firefox, Safari）都已稳定支持。

- JPEG XL：JXL的经历则要曲折得多。Chrome曾在2022年底以“生态系统利益不足”为由，移除了对JXL的支持，引发了社区的巨大争议。但在其他浏览器厂商（特别是苹果和Mozilla）的坚持，以及社区的持续呼吁下，情况迎来了转机。

> 好消息是，到了2026年的今天，我们可以发现JXL已经在 Safari 上开始支持，尽管其普及率可能还不能用在生产环境中，但将来各大浏览器肯定会追上脚步。

## 我到底该怎么选？ ##

好了，分析了这么多，我们来总结一下，在你的项目中到底该如何选择。

**让浏览器自己选！哈哈哈哈😀**

其实，我们不必做出“二选一”的决定。最好的方式，是同时提供多种格式，利用HTML的 `<picture>` 元素，让浏览器根据自己的支持情况，去加载最优的格式。

```html
<picture>
  <source srcset="image.jxl" type="image/jxl">
  
  <source srcset="image.avif" type="image/avif">
  
  <source srcset="image.webp" type="image/webp">
  
  <img src="image.jpg" alt="描述文字">
</picture>
```

## 常规解决方案 ##

一般情况下，前端开发主要使用 `<img>` 标签及 PNG/JPG 格式，再一定程度结合图片压缩、懒加载、CDN（多节点分发、缓存预热）等优化方案来满足性能要求。部分 CDN 平台还提供一站式图片解决方案，例如图片压缩、裁剪、格式转换等功能。

其中格式转换功能通过识别浏览器请求头 `Accept`（如：`Accept:image/avif,image/webp,...`），智能下发 AVIF/WebP 等格式图片，以实现更优的压缩率和更快的加载速度。这对开发而言是符合标准且无需额外工作量的终极方案，但该功能尚未普及，因此本文将介绍其他实现相同效果的方式。

## AVIF/WebP 简介 ##

### WebP 格式 ###

WebP（Web Picture Format）是由 Google 推出的一种现代图片格式，提供有损和无损压缩两种模式。与传统的 PNG 和 JPG 格式相比，WebP 在保持相同视觉质量的情况下，可显著减少文件大小：

- 相比 PNG，WebP 无损压缩可减少 26% 的文件大小；
- 相比 JPG，WebP 有损压缩可减少 25-34% 的文件大小。

WebP 还支持动画和透明通道，是 GIF 和 PNG 的理想替代方案。目前，WebP 已得到所有现代浏览器的支持（IE 浏览器和部分旧版本移动端浏览器除外）。

### AVIF 格式 ###

AVIF（AV1 Image File Format）是基于 AV1 视频编码的新一代图片格式，压缩效率高于 WebP：

- 相比 WebP，AVIF 可减少约 20% 的文件大小；
- 相比 PNG/JPG，AVIF 可减少约 50% 的文件大小。

AVIF 支持高动态范围（HDR）和广色域，色彩表现更丰富。但目前 AVIF 的浏览器支持度弱于 WebP，主要在较新版本的 Chrome、Firefox 和 Opera 等主流浏览器中可用。

在实际使用中，可通过调整压缩参数进一步提升压缩率，以下是兼容性汇总图：

## 使用 Picture 标签实现图片优化 ##

### Picture 标签应用 ###

HTML5 的 `<picture>` 标签允许我们为不同的显示场景提供多个图片源，浏览器会根据当前环境自动选择最合适的图片进行加载。其基本结构如下：

```html
<picture>
  <source srcset="image.avif" type="image/avif" />
  <source srcset="image.webp" type="image/webp" />
  <img src="image.png" alt="img" />
</picture>
```

在这个结构中，浏览器会按照以下顺序进行判断：

- 首先检查是否支持 AVIF 格式，若支持则加载 `image.avif`；
- 若不支持 AVIF，则检查是否支持 WebP 格式，若支持则加载 `image.webp`；
- 若以上两种格式均不支持，则回退到传统的 `image.png`。

### 已知问题 ###

虽然 `<picture>` 的兜底策略比较完善（即使 AVIF/WebP 格式或 `<picture>`/`<source>` 标签不被浏览器支持，仍可降级到 `<img>` 处理），但因各浏览器厂商实现方式不同，依然存在部分问题。

#### 问题 1：iOS 14.3、14.4 版本的 Safari WebP 兼容性问题 ####

在 iOS 14.3、14.4 版本的 Safari 中，`<picture>` 标签会尝试使用 WebP 格式渲染，但图片无法正常显示。需额外通过 JavaScript 检测实际是否支持 WebP 格式，示例如下：

```tsx
// WebP 支持检测函数
const checkWebP = () => {
  return new Promise<boolean>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.height === 160);
    img.onerror = () => resolve(false);
    img.src =
      "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvn8AnAAdQiUpUov+BiOh/AAA=";
  });
};

// 使用示例（简单版，无缓存、占位图等优化机制）
const Image = () => {
  const [supportWebp, setSupportWebp] = useState(false);

  useEffect(() => {
    const checkSupportWebP = async () => {
      const isSupported = await checkWebP();
      setSupportWebp(isSupported);
    };
    checkSupportWebP();
  }, []);

  return (
    <picture>
      {supportWebp && <source srcset="image.webp" type="image/webp" />}
      <img src="image.png" alt="img" />
    </picture>
  );
};
```

不过站在 2026 年来看，iOS 14.3、14.4 版本的占比可能不到 1%，因此可根据实际情况考虑是否兼容这两个版本的 Safari。

#### 问题 2：部分 Safari 版本同时加载 `<source>` 和 `<img>` 资源 ####

社区解决方案如下：

```tsx
// 方案一：把 <img> 标签放在 <source> 标签的前面
<picture>
  <img src="image.png" alt="img" />
  <source srcset="image.webp" type="image/webp" />
</picture>;

// 方案二：只保留 img 标签
{
  isSafari ? (
    <img src={supportWebp ? "image.webp" : "image.png"} alt="img" />
  ) : (
    <picture>{/* some things */}</picture>
  );
}
```

#### 问题 3：Firefox 93-112、Safari 16.1-16.3 会将 AVIF 动图解析为静态图片，无动画效果 ####

解决方式同问题1，通过 JavaScript 检测是否完整支持 AVIF 格式，以决定是否使用 AVIF 图片。

```tsx
// AVIF 支持检测函数
const checkAVIF = () => {
  return new Promise<boolean>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const supportAvif = img.width === 1;
      resolve(supportAvif);
    };
    img.onerror = () => resolve(false);
    // avif 动图 base64 编码，内容省略
    img.src = "data:image/avif;base64,...";
  });
};

// 使用示例
const Image = () => {
  const [supportAvif, setSupportAvif] = useState(false);

  useEffect(() => {
    const checkSupportAVIF = async () => {
      const isSupported = await checkAVIF();
      setSupportAvif(isSupported);
    };
    checkSupportAVIF();
  }, []);

  return (
    <picture>
      {supportAvif && <source srcset="image.avif" type="image/avif" />}
      <img src="image.png" alt="img" />
    </picture>
  );
};
```

通过上述优化，该活动的图片体积显著降低，加载速度也明显加快，具体数据如下：

## 总结与思考 ##

随着新技术的发展，图片优化方式也逐渐多种多样，但目前还没有普及的银弹方案。前端开发仍然要了解相关技术细节及坑点，以便实现可靠的程序。

通过 AVIF/WebP 等现代格式的应用及浏览器兼容性检测，可以在保持图片质量的同时，将体积减少约 50%，明显提升加载速度。

在实际应用中，还可以结合多格式降级策略、懒加载及 CDN 优化等手段，进一步提升加载速度与用户体验，并解决在不同浏览器环境下的兼容性问题。
