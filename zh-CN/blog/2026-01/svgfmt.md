---
lastUpdated: true
commentabled: true
recommended: true
title: 告别手动清理 SVG！
description: 前端er的图标自动化优化“神器”
date: 2026-01-30 08:00:00 
pageClass: blog-page-class
cover: /covers/npm.svg
---

## 前言：SVG 图标的常见问题 ##

在日常开发中，我们经常需要使用设计师提供的 SVG 图标。然而，从 Figma 等设计工具导出的 SVG 文件往往存在一些问题：

首先是代码冗余。设计工具导出的 SVG 通常包含大量不必要的标签，如 `<defs>`、`<g>`、`<clipPath> `等容器元素，这些元素在实际使用中往往是多余的。其次，颜色值被写死。SVG 中的颜色通常以 `fill="#333333"` 这样的形式硬编码，导致无法像 icon font 那样通过 CSS 的 `color` 属性动态控制图标颜色。此外，文件中还可能包含不必要的属性和元数据，使得文件体积偏大。

这些问题给开发者带来了不少困扰：无法灵活控制图标样式，手动清理每个文件效率低下且容易出错，难以构建统一的图标管理系统。

## svgfmt 简介 ##

svgfmt 是一个专门用于优化 SVG 图标的开源工具，它采用 monorepo 架构，包含两个核心包：

- `@svgfmt/cli`：命令行工具，提供便捷的文件处理能力，支持单文件和批量处理
- `@svgfmt/core`：核心库，可以轻松集成到自定义脚本和构建流程中

svgfmt 能够自动清理冗余标签、移除固定颜色值、合并路径，让 SVG 图标变得更加轻量和易于维护。

## 使用指南 ##

### 命令行使用（`@svgfmt/cli`） ##

首先安装 CLI 工具：

```bash
npm install -g @svgfmt/cli
```

#### 基础用法 ####

```bash
# 格式化单个文件（原地修改）
svgfmt icon.svg

# 批量处理并输出到指定目录
svgfmt "icons/**/*.svg" -o dist/icons

# 处理单个文件并输出到新位置
svgfmt logo.svg -o logo-optimized.svg
```

#### 自定义转换 ####

svgfmt 支持通过 `--transform` 参数自定义转换逻辑：

```bash
# 使用转换文件
svgfmt icons/*.svg --transform ./transform.js

# 使用内联代码
svgfmt icons/*.svg -t 'svg => svg.replace(/<svg/, "<svg class=\"icon\"")'
```

转换文件示例（transform.js）：

```javascript:transform.js
export default function(svg) {
  return svg.replace(/<svg/, '<svg class="icon"');
}

// 或者使用命名导出
export function transform(svg) {
  return svg.replace(/<svg/, '<svg data-processed="true"');
}
```

### 编程方式使用（`@svgfmt/core`） ###

在项目中安装核心库：

```bash
npm install @svgfmt/core
```

#### 基础示例 ####

```typescript
import { format } from '@svgfmt/core';

const svgContent = `<svg>...</svg>`;
const optimizedSvg = await format(svgContent);
```

#### 高级配置 ####

```typescript
import { format } from '@svgfmt/core';

const result = await format(svgContent, {
  // 提高路径追踪精度（默认 600）
  traceResolution: 800,
  
  // 自定义转换函数
  transform: (svg) => {
    return svg.replace(/<svg/, '<svg class="custom-icon"');
  }
});
```

对于需要异步处理的场景，`transform` 函数也支持异步：

```typescript
const result = await format(svgContent, {
  transform: async (svg) => {
    // 执行异步操作
    const processed = await someAsyncOperation(svg);
    return processed;
  }
});
```

## 优化效果对比 ##

让我们看一个实际的优化案例：

### 优化前 ###

```xml
<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g opacity="0.6" clip-path="url(#clip0_144244_67656)">
    <circle cx="6" cy="6" r="5" stroke="#333" style="stroke:#333;stroke-opacity:1;" />
    <path d="M6 3.5V6L7.25 7.25" stroke="#333" style="stroke:#333;stroke-opacity:1;" />
  </g>
  <defs>
    <clipPath id="clip0_144244_67656">
      <rect width="12" height="12" fill="#333" style="fill:#333;fill-opacity:1;" />
    </clipPath>
  </defs>
</svg>
```

### 优化后 ###

```xml
<svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M5.660 0.521 C 4.899 0.566,4.190 0.760,3.500 1.111 C 2.479 1.630,1.630 2.479,1.111 3.500 C 0.702 4.303,0.516 5.086,0.516 6.000 C 0.516 6.748,0.635 7.374,0.904 8.050 C 1.386 9.261,2.332 10.295,3.500 10.889 C 4.085 11.187,4.680 11.369,5.332 11.451 C 5.675 11.494,6.325 11.494,6.668 11.451 C 8.173 11.262,9.516 10.479,10.410 9.270 C 10.792 8.753,11.059 8.227,11.248 7.620 C 11.517 6.754,11.562 5.741,11.369 4.842 C 11.027 3.241,9.959 1.853,8.500 1.111 C 7.617 0.662,6.653 0.461,5.660 0.521 M6.720 1.549 C 7.447 1.673,8.126 1.965,8.720 2.408 C 8.964 2.590,9.410 3.036,9.592 3.280 C 10.040 3.880,10.330 4.559,10.454 5.298 C 10.505 5.599,10.505 6.401,10.454 6.702 C 10.330 7.441,10.040 8.120,9.592 8.720 C 9.410 8.964,8.964 9.410,8.720 9.592 C 8.120 10.040,7.441 10.330,6.702 10.454 C 6.401 10.505,5.599 10.505,5.298 10.454 C 4.559 10.330,3.880 10.040,3.280 9.592 C 3.035 9.410,2.589 8.963,2.408 8.720 C 1.955 8.111,1.671 7.445,1.546 6.702 C 1.495 6.401,1.495 5.599,1.546 5.298 C 1.671 4.556,1.955 3.891,2.408 3.280 C 2.588 3.036,3.036 2.588,3.280 2.408 C 3.968 1.898,4.680 1.618,5.560 1.512 C 5.729 1.492,6.537 1.517,6.720 1.549 M5.500 4.845 L 5.500 6.190 6.200 6.890 L 6.900 7.590 7.245 7.245 L 7.590 6.900 7.045 6.355 L 6.500 5.810 6.500 4.655 L 6.500 3.500 6.000 3.500 L 5.500 3.500 5.500 4.845"
    fill-rule="evenodd"
  />
</svg>
```

主要改进包括：

- **移除冗余标签**：去除了不必要的 `<defs>`、`<g>`、`<clipPath>` 等容器元素
- **颜色属性移除**：删除固定的 fill 属性，图标将继承父元素的 color，可以通过 CSS 灵活控制
- **路径合并**：多个子元素被智能合并为单一路径

## 实践场景 ##

### 集成到开发流程 ###

在 `package.json` 中添加脚本命令：

```json:package.json
{
  "scripts": {
    "optimize-icons": "svgfmt raw-icons/**/*.svg -o src/assets/icons",
    "build": "npm run optimize-icons && vite build"
  }
}
```

这样在每次构建前都会自动优化图标文件。

### 配合构建工具使用 ###

在构建脚本中使用编程 API：

```typescript
import { formatPattern } from '@svgfmt/cli';

// 在构建时自动优化图标
async function buildIcons() {
  const summary = await formatPattern('icons/**/*.svg', {
    output: 'dist/icons'
  });

  console.log(`优化完成: ${summary.success}/${summary.total}`);
  
  // 检查单个文件结果
  for (const result of summary.results) {
    if (result.success) {
      console.log(`✓ ${result.input} → ${result.output}`);
    } else {
      console.error(`✗ ${result.input}: ${result.error}`);
    }
  }
}

buildIcons();
```

### 自定义转换示例 ###

创建一个转换文件 transform.js，为所有 SVG 添加统一属性：

```javascript:transform.js
export default function(svg) {
  return svg
    .replace(/<svg/, '<svg class="icon"')
    .replace(/viewBox/, 'preserveAspectRatio="xMidYMid meet" viewBox');
}
```

然后在命令行中使用：

```bash
svgfmt icons/*.svg --transform ./transform.js -o dist/icons
```

## 注意事项 ##

在使用 svgfmt 时，有几点需要注意：

- **仅支持单色图标**：该工具专为单色图标设计。多色 SVG 在路径追踪过程中会被转换为单色，因为工具会将 SVG 转换为 PNG 再转回 SVG，这个过程会丢失颜色信息。

- **路径精度配置**：`traceResolution` 参数控制路径追踪的精度，默认值为 600。提高该值可以获得更精细的路径，但会增加处理时间。建议的取值范围是 600-1200。

- **文件覆盖提醒**：使用命令行工具时，默认会覆盖原文件。建议在处理前先备份原始文件，或使用 `-o` 参数指定输出目录。

- **复杂图形检查**：对于复杂的多色插图或渐变效果的 SVG，建议在优化后手动检查结果，确保视觉效果符合预期。

- **工具组合**：svgfmt 可以与其他 SVG 工具配合使用，如 SVGO（进一步优化）、svgr（转换为 React 组件）等，构建完整的 SVG 处理流程。

## 总结 ##

svgfmt 通过自动化的方式解决了 SVG 图标在实际使用中的常见问题，让图标文件更轻量、更易维护。无论是通过命令行快速处理一批图标，还是将其集成到构建流程中实现自动化优化，svgfmt 都能显著提升开发效率。
