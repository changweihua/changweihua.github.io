---
lastUpdated: true
commentabled: true
recommended: true
title: 基于 UnoCSS 的后台系统 SVG 图标方案实践
description: 基于 UnoCSS 的后台系统 SVG 图标方案实践
date: 2026-01-16 09:30:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

在后台管理系统中，图标通常并不是简单的装饰元素，而是*菜单结构、功能语义和状态表达的一部分*。为了在保证灵活性的同时降低维护成本，我在项目中基于 **UnoCSS** 的 **presetIcons** 实现了一套本地 SVG 图标方案。本文主要记录该方案的实现方式及其背后的机制设计。

## 一：实现思路 ##

- 使用 *本地 SVG 文件* 作为唯一图标源

- 借助 UnoCSS `presetIcons` 将 SVG 转换为 CSS 图标

- 通过统一的预处理逻辑，使 SVG 图标：

- 尺寸可控
- 颜色可继承
- 支持动态渲染

- 解决 UnoCSS 按需生成机制下，*动态图标类名无法被扫描的问题*

## 二：UnoCSS presetIcons 与本地图标集合 ##

### 配置 ###

```ts:uno.config.ts
import { defineConfig, presetIcons } from "unocss";
import { FileSystemIconLoader } from "@iconify/utils/lib/loader/node-loaders";
​
const iconDir = "./src/assets/icons";
​
export default defineConfig({
  presets: [
    presetIcons({
      extraProperties: {
        display: "inline-block",
        width: "1em",
        height: "1em",
      },
      collections: {
        svg: FileSystemIconLoader(iconDir),
      },
    }),
  ],
});
```

- 将 `src/assets/icons` 注册为一个图标集合
- 使用 `svg` 作为集合名，对应类名格式为：`i-svg:icon-name`
- 统一图标尺寸为 `1em`，使其行为与文字一致

## 三：SVG 预处理：注入 `fill="currentColor"` ##

在实际使用中，SVG 图标最大的痛点之一是 颜色控制不统一。

### 常见问题 ###

- 未声明 `fill`：浏览器默认渲染为黑色
- 写死 `fill="#000"`：无法通过 CSS 控制
- 多状态（hover / active / disabled）需要多份 SVG

### currentColor 的作用 ###

`currentColor` 并不是 SVG 私有属性，而是 *CSS 颜色关键字*，表示当前元素的 `color` 值。

```css
color: red;
/* currentColor === red */
```

如果 SVG 的 `fill` 使用 `currentColor`，即：SVG 图标的颜色，完全由外层元素的 `color` 决定。

### 注入逻辑 ###

```javascript
FileSystemIconLoader(iconDir, (svg) => {
  return svg.includes('fill="')
    ? svg
    : svg.replace(/^<svg /, '<svg fill="currentColor" ')
});
```

注入后，图标即可通过普通的文本颜色控制：

```html
<i class="i-svg:user text-gray-400"></i>
<i class="i-svg:user text-blue-500 hover:text-blue-600"></i>
<i class="i-svg:user text-red-500"></i>
```

## 四：动态场景下的关键问题：UnoCSS 的按需生成机制 ##

UnoCSS 是 **按需生成（JIT）** 的工具，它只会为 *在构建阶段扫描到的类名* 生成 CSS。

在后台系统中，一个非常典型的场景是：

```tsx
const iconClass = `i-svg:${menu.icon}`;
<i :class="iconClass"></i>
```

此时：

- `menu.icon` 来自后端
- 构建阶段无法确定具体类名
- UnoCSS 无法扫描到真实的 `i-svg:xxx`

结果就是： *运行时 DOM 上有 class，但 CSS 不存在，图标无法显示*。

## 五：safelist 解决动态图标的方案 ##

```ts
import fs from "fs";
​
const iconDir = "./src/assets/icons";
​
const generateIconSafeList = () => {
  return fs
    .readdirSync(iconDir)
    .filter(file => file.endsWith(".svg"))
    .map(file => `i-svg:${file.replace(".svg", "")}`);
};  
```

```ts
export default defineConfig({
  safelist: generateIconSafeList(),
});
```

**动态菜单图标在生产环境也能稳定渲染**

## 六：使用 ##

```html
<i class="i-svg:home text-sm"></i>
<i :class="`i-svg:${menu.icon}`"></i>
```

**完整代码示例**：

```ts:uno.config.ts
import { defineConfig } from "unocss";
​
import { FileSystemIconLoader } from "@iconify/utils/lib/loader/node-loaders";
import fs from "fs";
​
// 本地SVG图标目录
const iconDir = "./src/assets/icons";
​
// 读取本地 SVG 目录，自动生成 safelist
const generateIconSafeList = () => {
  try {
    return fs
      .readdirSync(iconDir)
      .filter((file) => file.endsWith(".svg"))
      .map((file) => `i-svg:${file.replace(".svg", "")}`);
  } catch (error) {
    console.error("无法读取图标:", error);
    return [];
  }
};
​
export default defineConfig({
  presets: [
    presetIcons({
      extraProperties: {
        display: "inline-block",
        width: "1em",
        height: "1em",
      },
      // 图标集合
      collections: {
        // svg 是图标集合名称，使用 `i-svg:图标名` 调用
        svg: FileSystemIconLoader(iconDir, (svg) => {
          // 如果 `fill` 没有定义，则添加 `fill="currentColor"`
          console.log(svg, "svgsvgsvsgvsgvsgvsg");
          return svg.includes('fill="') ? svg : svg.replace(/^<svg /, '<svg fill="currentColor" ');
        }),
      },
    }),
  ],
  safelist: generateIconSafeList(),
});
```
