---
lastUpdated: true
commentabled: true
recommended: true
title: Web字体使用最佳实践
description: 在SCSS中高效使用 `@font-face` 引入自定义字体
date: 2026-01-06 15:30:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

> 网页设计中90%的视觉信息由文本承载，而字体选择直接影响用户体验。掌握 `@font-face` 是前端开发的核心技能之一

## `@font-face` 基础概念 ##

`@font-face` 是 CSS 原生的字体引入规则，允许加载服务器托管的字体文件，突破"Web安全字体"的限制。与传统CSS相比，在SCSS中使用可借助以下优势：

- 变量管理：字体路径/名称统一维护
- 嵌套组织：相关字体规则逻辑分组
- 混合宏：创建可复用的字体模板

## 核心属性解析 ##

```css
@font-face {
  font-family: 'CustomFont';  // 定义引用时的字体名称
  src: 
    local('Custom Font'),    // 优先使用本地安装字体
    url('fonts/custom.woff2') format('woff2'),
    url('fonts/custom.woff') format('woff'); // 多格式兼容
  font-weight: 700;         // 精确控制字重
  font-style: italic;       // 定义斜体变体
  font-display: swap;       // FOIT优化方案
}
```

关键属性说明：

- `src` 支持级联加载（顺序很重要！）
- `format()` 声明格式提高加载效率
- `font-display` 控制 FOIT(不可见文本闪烁)行为

## SCSS优化实践策略 ##

### 方案1：变量集中管理 ###

```scss
// _variables.scss
$font-path: '../assets/fonts/';
$primary-font: 'CustomFont';

@mixin font-face($name, $filename, $weight: normal, $style: normal) {
  @font-face {
    font-family: $name;
    src: 
      url('#{$font-path}#{$filename}.woff2') format('woff2'),
      url('#{$font-path}#{$filename}.woff') format('woff');
    font-weight: $weight;
    font-style: $style;
    font-display: swap;
  }
}

// 使用混合宏统一引入
@include font-face($primary-font, 'custom-regular', 400);
@include font-face($primary-font, 'custom-bold', 700);
@include font-face($primary-font, 'custom-italic', 400, italic);
```

### 方案2：字重映射系统 ###

```scss
$font-weights: (
  thin: 100,
  light: 300,
  regular: 400,
  medium: 500,
  bold: 700,
  black: 900
);

@each $name, $weight in $font-weights {
  @include font-face($primary-font, 'custom-#{$name}', $weight);
}
```

### 方案3：字体族分组管理 ###

```scss
// 建立完整字体族体系
$font-stack: (
  'CustomFont': (
    (weight: 300, style: normal, file: 'light'),
    (weight: 400, style: normal, file: 'regular'),
    (weight: 700, style: italic, file: 'bold-italic')
  ),
  'SecondFont': (...)
);

@each $family, $variants in $font-stack {
  @each $v in $variants {
    @include font-face(
      $family, 
      $v[file], 
      $v[weight], 
      $v[style]
    );
  }
}
```

## 性能优化关键措施 ##

### 字体格式最佳组合 ###

```css
src: 
  url('font.woff2') format('woff2'),  // Web开放字体格式2.0
  url('font.woff') format('woff');    // 兼容旧浏览器
```

### 子集化处理（使用pyftsubset等工具） ###

```shell
# 中文字体压缩示例
pyftsubset font.ttf --text="前端开发SCSS"
```

### 加载策略强化 ###

```html
<!-- 预加载关键字体 -->
<link rel="preload" href="font.woff2" as="font" crossorigin>
```

## 常见问题排错指南 ##

### 路径错误（编译后路径不一致） ###

```scss
// 解决方案：使用相对根目录路径
$font-path: '/assets/fonts/';
```

### 字重不匹配 ###

```scss
/* 错误：400字重规则应用在600文本 */
.bold-text {
  font-family: 'CustomFont';
  font-weight: 600; /* 需明确定义600字重的@font-face */
}
```

### FOUT/FOUC现象 ###

```css
/* 添加过渡效果 */
body {
  font-family: sans-serif;
  transition: font-family 0.3s;
}
.font-loaded body {
  font-family: 'CustomFont';
}
```

### 浏览器兼容方案 ###

```css
src: 
  url('font.eot?#iefix') format('embedded-opentype'), /* IE9 */
  url('font.woff2') format('woff2'),
  url('font.ttf') format('truetype');
```

## 实战建议 ##

- 字库选择：Google Fonts可查看使用率数据（如 `Inter>74%`）
- 文件托管：考虑CDN加速（Fonts.com、Typekit）
- 动态加载：

```javascript
// 使用Web Font Loader控制
WebFont.load({
  custom: { families: ['CustomFont'] }
});
```

## 结语 ##

在SCSS中实施 `@font-face`是高效字体管理的起点。通过构建可复用的字体系统、优化加载策略，结合现代格式如WOFF2，可显著提升网站性能指标（LCP降低约40%）。

当Typography成为界面设计的核心表达，恰当的字体工程化方案将使你的网站在体验层面脱颖而出。良好的字体实践如同精妙的排版艺术：用户可能说不出哪里好，但处处感受得到品质的存在。

> 利用“字体分块”提升网页性能

## 什么是字体分块？ ##

字体分块（Font Chunking / Subsetting by Range）是一种针对网页字体（Web Font）的性能优化技术。它的核心思想是将一个庞大的完整字体文件，根据字符的 Unicode 范围或其他标准（如使用频率、语言等），预先分割成多个较小的字体片段（Chunks）。然后，利用 CSS 的 `@font-face` 规则和 `unicode-range` 描述符，让浏览器*只下载当前页面实际需要渲染的字符所在的那个（或那些）字体片段*，而不是一次性下载整个庞大的字体文件。

这种技术对于包含大量字形（Glyphs）的字体尤其有效，例如中文字体（GBK、GB2312、GB18030 覆盖数千甚至数万汉字）、日文、韩文等 CJK 字体，以及一些包含多种语言符号的大型西文字体。

## 为什么需要字体分块？ ##

- **性能问题**： 完整的中文字体文件通常体积巨大，动辄几 MB 甚至几十 MB。在网页加载时，如果需要等待整个字体文件下载完成才能正确渲染文本，会导致页面加载速度变慢，甚至出现字体闪烁（FOIT/FOUT）或长时间白屏，严重影响用户体验。
- **带宽浪费**： 一个页面通常只会用到字体库中很少一部分字符。下载整个字体文件意味着用户下载了大量根本用不到的字形数据，造成了不必要的带宽消耗，对移动端用户尤其不友好。

> 字体分块通过**按需加载**，有效解决了以上两个问题。

## 字体分块的具体机制 ##

字体分块的实现主要依赖以下几个步骤和技术：

- 字体分析 (Font Analysis)：

  - 确定如何划分字体，最常用的是基于 *Unicode 字符范围*。
  - 例子：基本拉丁、常用标点、CJK 符号、常用汉字（可分多级）、生僻字等。
  - 自动化工具（如 `font-spider`）可分析项目找出实际使用字符生成精确子集，但字体分块更侧重预先按 范围 划分以应对动态内容。

- 字体子集生成 (Subset Generation)：

  - 使用字体工具（如 `pyftsubset`）根据定义的范围，从原始字体生成多个小的字体文件（推荐 `WOFF2` 格式）。
  - 每个小文件只包含其负责范围的字形。

- CSS `@font-face` 配置：

  - 为同一个 `font-family` 定义多个 `@font-face` 规则。
  - 每个规则指向一个分块字体文件 (src)。
  - 关键： 每个规则使用 `unicode-range` 描述符声明该字体文件负责的 `Unicode` 范围。

- 浏览器按需加载 (Browser On-Demand Loading)：

  - 核心机制澄清： 浏览器并不会在解析 CSS 时就立刻下载所有 `@font-face` 中定义的字体块 URL。`unicode-range` 的关键作用在于告知浏览器每个字体块负责哪些字符范围。
  - 真正的下载发生在页面渲染阶段：

    - 当浏览器渲染页面，遇到需要使用该 `font-family` 的文本时，它会检查文本中的每一个字符的 `Unicode` 值。
    - 浏览器查找所有为该 `font-family` 定义的 `@font-face` 规则，看哪个规则的 `unicode-range` 覆盖了当前字符的 `Unicode` 值。
    - 关键点： 如果找到了匹配的 `@font-face` 规则，并且其 `src` 指向的字体块文件尚未被下载，浏览器此时才会发起网络请求去下载那个特定的字体块。
    - 一旦下载完成，浏览器就使用该字体块中的字形来渲染对应的字符。
    - 如果一个字符的范围对应的字体块已经被下载（可能因为页面上之前的某个字符触发了下载），浏览器会直接使用缓存，不会重复下载。
    - 如果页面需要多个范围的字符（如英文和中文），浏览器会根据需要分别触发下载对应的多个字体块。

## 完整示例 ##

假设我们有一个名为 `MyCustomFont.ttf` 的中文字体，体积很大 (15MB)。我们的网站主要内容是中文，但也包含少量英文和数字。我们希望通过字体分块来优化加载。

### 第 1 步：分析与定义分块策略 ###

我们决定按以下范围划分字体块：

- 基础拉丁与数字 (Basic Latin & Digits): `U+0020-U+007E` (空格、标点、0-9、A-Z、a-z)
- 常用中文标点 (Common CJK Punctuation): `U+3000-U+303F` (如：，。？！；：)
- 一级常用汉字 (Common Hanzi - Set 1): `U+4E00-U+62FF` (假设这是我们根据分析确定的最高频使用的汉字范围)
- 二级常用汉字 (Common Hanzi - Set 2): `U+6300-U+7FFF`
- 其他常用汉字 (Other Common Hanzi): `U+8000-U+9FA5`
- (可选) 其他字符块...

### 第 2 步：生成字体子集文件 ###

使用 `pyftsubset` 工具（需要安装 `fonttools`：`pip install fonttools`）：

```bash
# 原始字体文件
SOURCE_FONT="MyCustomFont.ttf"

# 输出目录
OUTPUT_DIR="font-chunks"
mkdir -p $OUTPUT_DIR

# 生成 WOFF2 格式的字体块
pyftsubset $SOURCE_FONT --output-file="$OUTPUT_DIR/myfont-latin.woff2" --unicodes="U+0020-007E" --flavor=woff2 --with-zopfli
pyftsubset $SOURCE_FONT --output-file="$OUTPUT_DIR/myfont-cjk-punct.woff2" --unicodes="U+3000-303F" --flavor=woff2 --with-zopfli
pyftsubset $SOURCE_FONT --output-file="$OUTPUT_DIR/myfont-hanzi-1.woff2" --unicodes="U+4E00-62FF" --flavor=woff2 --with-zopfli
pyftsubset $SOURCE_FONT --output-file="$OUTPUT_DIR/myfont-hanzi-2.woff2" --unicodes="U+6300-7FFF" --flavor=woff2 --with-zopfli
pyftsubset $SOURCE_FONT --output-file="$OUTPUT_DIR/myfont-hanzi-3.woff2" --unicodes="U+8000-9FA5" --flavor=woff2 --with-zopfli

# ... 可以根据需要生成更多块 ...
```

执行后，`font-chunks` 目录下会生成多个 `.woff2` 文件，每个文件都比原始字体小得多。

### 第 3 步：在 CSS 中配置 `@font-face` ###

在你的 CSS 文件 (e.g., `style.css`) 中添加如下规则：

```css
/* 定义基础拉丁字母和数字块 */
@font-face {
  font-family: 'MyCustomFont';
  src: url('font-chunks/myfont-latin.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap; /* 推荐设置，改善加载体验 */
  unicode-range: U+0020-007E; /* 关键：指定此块负责的 Unicode 范围 */
}

/* 定义中文标点块 */
@font-face {
  font-family: 'MyCustomFont';
  src: url('font-chunks/myfont-cjk-punct.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
  unicode-range: U+3000-303F; /* 关键：指定此块负责的 Unicode 范围 */
}

/* 定义一级常用汉字块 */
@font-face {
  font-family: 'MyCustomFont';
  src: url('font-chunks/myfont-hanzi-1.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
  unicode-range: U+4E00-62FF; /* 关键：指定此块负责的 Unicode 范围 */
}

/* 定义二级常用汉字块 */
@font-face {
  font-family: 'MyCustomFont';
  src: url('font-chunks/myfont-hanzi-2.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
  unicode-range: U+6300-7FFF; /* 关键：指定此块负责的 Unicode 范围 */
}

/* 定义其他常用汉字块 */
@font-face {
  font-family: 'MyCustomFont';
  src: url('font-chunks/myfont-hanzi-3.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
  unicode-range: U+8000-9FA5; /* 关键：指定此块负责的 Unicode 范围 */
}

/* ... 可以根据需要定义更多块 ... */

/* 在需要的地方使用字体 */
body {
  font-family: 'MyCustomFont', sans-serif;
}

h1 {
  font-family: 'MyCustomFont', serif;
}
```

### 第 4 步：HTML 页面 ###

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>字体分块示例</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>你好，世界！(Hello World!)</h1>
  <p>
    这是一个字体分块的简单示例。
    This is a simple example of font chunking.
    数字 12345。
    常用标点：，。？！
  </p>
  <p>
    这里包含一些汉字，比如“体验” (U+4F53 U+9A8C) 和 “范围” (U+8303 U+56F4)。
  </p>
</body>
</html>
```

**浏览器行为解释（结合按需加载机制）**：

1. 浏览器解析 CSS，记录下 `MyCustomFont` 的所有 `@font-face` 规则及其 `unicode-range`。此时不下载任何字体文件。
2. 渲染 `<h1>` 和 `<p>` 中的文本 "你好，世界！(Hello World!) 这是一个..."。
3. 遇到 'H' (U+0048)，匹配 `unicode-range: U+0020-007E`;。检查 `myfont-latin.woff2` 是否已下载？否 -> 发起下载 `myfont-latin.woff2`。
4. 遇到 'e', 'l', 'l', 'o', ' ', 'W', 'o', 'r', 'l', 'd', '!', '(', ')' 等，都在 `U+0020-U+007E` 范围，使用已发起下载或已完成下载的 `myfont-latin.woff2`，不重复触发下载。
5. 遇到 '你' (U+4F60)，匹配 `unicode-range: U+4E00-62FF`;。检查 `myfont-hanzi-1.woff2` 是否已下载？否 -> 发起下载 `myfont-hanzi-1.woff2`。
遇到 '好' (U+597D), '这' (U+8FD9), '是' (U+662F), '个' (U+4E2A), '字' (U+5B57), '体' (U+4F53), '分' (U+5206), '块' (U+5757), '简' (U+7B80), '单' (U+5355), '示' (U+793A), '例' (U+4F8B), '体' (U+4F53), '验' (U+9A8C), '范' (U+8303), '围' (U+56F4) 等汉字：

   - 落在 `U+4E00-62FF` 的（如 '你', '好', '个', '字', '体', '分', '块', '例'）：使用已发起或已完成的 `myfont-hanzi-1.woff2`。
   - 落在 `U+6300-7FFF` 的（如 '是', '简', '示'）：检查 `myfont-hanzi-2.woff2` 是否下载？否 -> 发起下载 `myfont-hanzi-2.woff2`。
   - 落在 `U+8000-9FA5` 的（如 '这', '验', '范', '围'）：检查 `myfont-hanzi-3.woff2` 是否下载？否 -> 发起下载 `myfont-hanzi-3.woff2`。

6. 遇到 '，' (U+FF0C), '。' (U+3002), '？' (U+FF1F), '！' (U+FF01) 等标点。假设它们未包含在基础拉丁块中（实际情况可能复杂，取决于字体本身），并且我们定义了 `myfont-cjk-punct.woff2` 包含 `U+3000-U+303F` 等范围。
7. 遇到 '。' (U+3002)，匹配 `unicode-range: U+3000-303F`;。检查 `myfont-cjk-punct.woff2` 是否下载？否 -> 发起下载 `myfont-cjk-punct.woff2`。
8. 其他标点如果也在这个范围，则复用。

**结果**： 浏览器仅根据页面实际出现的字符，触发了对应 `unicode-range` 的字体块下载请求（在这个例子中是 `myfont-latin.woff2`, `myfont-hanzi-1.woff2`, `myfont-hanzi-2.woff2`, `myfont-hanzi-3.woff2`, `myfont-cjk-punct.woff2`）。

因此，浏览器无需下载那个庞大的原始 15MB MyCustomFont.ttf 文件（因为它并未在 `@font-face` 的 `src` 中直接引用）。更重要的是，只有当页面上实际包含了某个字体块 `unicode-range` 所覆盖的字符时，该字体块才会被下载。如果一个页面恰好需要所有分块范围内的字符，那么理论上所有分块都会被下载，但这仍然远优于一次性下载整个未分块的巨大字体。对于那些其 `unicode-range` 内的字符完全没有在当前页面使用的字体块，浏览器是不会去下载它们的，从而实现了有效的按需加载和带宽节省。

## 优点 ##

- 显著减少首屏加载时间： 利用浏览器 `unicode-range` 的特性实现按需（懒）加载。
- 节省用户带宽： 避免下载未使用的字形数据。
- 改善用户体验： 更快地显示文本，减少 FOUT/FOIT。
- 灵活性： 可以根据需求设计分块策略。

## 注意事项与缺点 ##

- 分块策略的复杂性： 合理划分 `unicode-range` 需要权衡，过细可能增加请求数，过粗则优化效果打折。
- 工具依赖： 需要字体工具生成子集。
- 维护成本： 字体更新或策略调整需重新生成。
- 覆盖不全风险： `unicode-range` 定义若遗漏字符，会导致回退。
- 动态内容： 对无法预知字符的内容，可能需更保守分块或结合其他技术。

总结来说，字体分块是一种利用 CSS `unicode-range` 让浏览器智能地按需下载字体片段的高效 Web 字体优化技术，特别适合大型字体库，能大幅提升性能。关键在于理解浏览器并非预先加载所有块，而是根据页面渲染需求实时、精确地加载所需部分。
