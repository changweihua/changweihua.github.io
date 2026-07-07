---
lastUpdated: true
commentabled: true
recommended: true
title: 从 uno.config.ts 看懂 UnoCSS 图标方案
description: 从 uno.config.ts 看懂 UnoCSS 图标方案
date: 2026-06-12 13:35:00
pageClass: blog-page-class
cover: /covers/vue.svg
---

> 从项目的 `uno.config.ts` 出发，详解 UnoCSS presetIcons 如何把本地 SVG 编译成 `i-custom-*` 原子类，并配合 VS Code Iconify 扩展实现开发体验闭环。

## 钩子：为什么图标也要「原子化」？

在 Vue 项目里，图标通常有三条路：组件库内置图标、`<svg>` 内联、或 Sprite 组件。它们都能用，但每种方式都多一层心智负担——要 import 组件、记 props，或在模板和脚本之间来回切换。

UnoCSS 的 presetIcons 走另一条路：图标就是 CSS 类名。写 `class="i-custom-confirm-circle-filled text-success"`，UnoCSS 在构建时把 SVG 转成背景图工具类，颜色、尺寸继续用现有的原子类控制。

本文从本仓库的 `uno.config.ts` 出发，拆解这套方案如何落地。

## 背景：项目里的图标分层

打开任意业务页面，你会看到两套图标并存，这是有意为之：

| 场景                                | 方案                           | 示例                             |
| :---------------------------------- | :----------------------------- | :------------------------------- |
| Element Plus 组件的 `:icon` prop    | `@element-plus/icons-vue` 组件 | `<el-button :icon="Search" />`   |
| 自定义 SVG、Tooltip、指令等轻量场景 | UnoCSS `presetIcons`           | `i-custom-confirm-circle-filled` |

Element Plus 的按钮、输入框需要 Vue 组件实例 作为 `icon`，所以继续用官方图标包。而复制成功提示、装饰性小图标等场景，用 纯 class 更简洁——这正是 `uno.config.ts` 里 `presetIcons` 的职责。

## 核心：uno.config.ts 里的图标管线

项目的 UnoCSS 配置如下（节选）：

```ts
import { deOptimisePaths, importDirectorySync, runSVGO } from '@iconify/tools'
import { defineConfig, presetIcons, presetWind3 } from 'unocss'

const customIconPrefix = 'custom'
const customIconSvgDir = 'src/assets/svg'

const loadCustomIconSet = () => {
  const iconSet = importDirectorySync(customIconSvgDir, {
    prefix: customIconPrefix
  })

  iconSet.forEachSync((name) => {
    const svg = iconSet.toSVG(name)!
    runSVGO(svg)
    deOptimisePaths(svg)
    iconSet.fromSVG(name, svg)
  })

  if (process.env.NODE_ENV === 'development') {
    const iconSetContent = iconSet.export()
    fs.writeFile('.vscode/icons.json', JSON.stringify(iconSetContent, null, '\t'))
  }

  return () => iconSet.export()
}

export default defineConfig({
  presets: [
    presetWind3(),
    presetIcons({
      collections: { custom: loadCustomIconSet() },
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle'
      }
    })
  ]
})
```

可以把它理解成 四条流水线：

### 约定：目录 + 前缀

- SVG 源文件放在 `src/assets/svg/`
- 集合前缀为 `custom（customIconPrefix）`
- 文件名 `confirm-circle-filled.svg` → 类名 `i-custom-confirm-circle-filled`

UnoCSS presetIcons 的默认命名规则是 `i-{collection}-{icon-name}`。前缀 `custom` 与项目 `custom-` 组件命名空间一致，一眼能区分「自家图标」和 Iconify 在线集合（如 `i-carbon-logo`）。

### 构建：`@iconify/tools` 预处理 SVG

`importDirectorySync` 把整个目录读成 Iconify 集合格式。随后对每个图标：

- `runSVGO`：压缩路径、去掉冗余属性，减小产物体积
- `deOptimisePaths`：把过度优化的 path 还原，避免某些 SVG 在转 mask 时渲染异常

这一步在 UnoCSS 编译前 完成，保证最终注入 CSS 的 SVG 数据干净、可预期。

### 输出：presetIcons 生成 CSS 工具类

`presetIcons` 基于 Iconify 生态，把 SVG 转成 mask 或 background 形式的单类图标。配合 `extraProperties`：

```ts
extraProperties: {
  display: 'inline-block',
  vertical-align: 'middle',
}
```

图标在文本行内与文字对齐，不会出现「图标偏上/偏下」的常见问题。

### 开发体验：导出 `.vscode/icons.json`

仅在 `development` 下，把图标集合写入 `.vscode/icons.json`（已在 `.gitignore` 中忽略）。VS Code 配合 Iconify IntelliSense（`antfu.iconify`）：

```json
{
  "iconify.excludes": ["el"],
  "iconify.customCollectionJsonPaths": ["./.vscode/icons.json"]
}
```

本地跑 `pnpm dev` 后，输入 `i-custom-` 即可自动补全；`iconify.excludes` 排除 Element Plus 集合，避免与 `el-icon` 混淆。

## 原理：一个 class 背后发生了什么？

以复制指令里的用法为例：

```ts
h('div', { class: 'i-custom-confirm-circle-filled text-14' })
```

UnoCSS 扫描源码中的 `i-custom-confirm-circle-filled`，向 Iconify 集合查询对应 SVG，生成类似下面的工具类（概念示意）：

```css
.i-custom-confirm-circle-filled {
  display: inline-block;
  vertical-align: middle;
  width: 1em;
  height: 1em;
  background-color: currentColor;
  -webkit-mask: /* SVG mask data */;
  mask: /* SVG mask data */;
}
```

要点：

- 尺寸：默认 `1em`，可用 `text-14`、`w-4` 等工具类覆盖（本项目 `presetRemToPx` 把 rem 基准设为 4px，`text-14` 即 14px 字号，图标随 `em` 缩放）
- 颜色：SVG 源文件使用 `currentColor`（见 `confirm-circle-filled.svg` 中的 `fill="currentColor"`），因此 `text-success`、`text-primary` 直接生效
- 按需：只有源码里出现过的 `i-*` 类才会进入最终 CSS，无全局图标包体积问题

## 与 Element Plus 图标的协作

```vue
<!-- Element Plus：需要组件 -->
<el-button :icon="Search">查询</el-button>

<!-- UnoCSS：需要 class -->
<div class="i-custom-confirm-circle-filled text-success text-14" />
```

不要试图把 `i-custom-*` 传给 `:icon——prop` 要的是组件，不是 class。在 h() 渲染函数、Tooltip 插槽、或纯展示 DOM 上，UnoCSS 图标更合适。

## 实战：添加并使用一个新图标

### 步骤 1：放入 SVG

将 `my-icon.svg` 放到 `src/assets/svg/`。建议：

- 使用 `currentColor` 作为填充色，便于主题色继承
- viewBox 规范（常见 `0 0 24 24`），避免尺寸怪异
- 复杂动画 SVG 可用，但静态图标更利于 SVGO 压缩

### 步骤 2：启动开发服务器

```bash
pnpm dev
```

首次启动会生成 `.vscode/icons.json`，IDE 中即可补全 `i-custom-my-icon`。

### 步骤 3：在模板或脚本中使用

```vue
<template>
  <span
    class="i-custom-my-icon text-primary text-16"
    aria-hidden="true"
  />
  <span>操作成功</span>
</template>
```

装饰性图标建议加 `aria-hidden="true"`，避免读屏重复朗读。

### 步骤 4：在渲染函数中使用

```ts
h('div', { class: 'flex items-center gap-2' }, [
  h('div', { class: 'i-custom-confirm-circle-filled text-14 text-success' }),
  '复制成功'
])
```

项目里 `src/directives/copy.ts` 正是这种模式。

## 可选扩展：使用 Iconify 在线图标集

当前配置只注册了本地 `custom` 集合。若需 Material Design、Carbon 等开源集，可在 `presetIcons` 中增加：

```ts
presetIcons({
  collections: {
    custom: loadCustomIconSet()
    // 按需安装 @iconify-json/carbon 等
  }
  // 或 scale: 1.2, warn: true 等选项
})
```

在线集合类名形如 `i-carbon-user`，与 `i-custom-*` 命名空间清晰分离。团队规范上建议：业务定制走 `custom`，通用图标走 Iconify 官方集。

## 常见问题

### Q：i-custom-xxx 不显示？

- 确认 `src/assets/svg/xxx.svg` 存在，且文件名与类名一致（kebab-case）
- 确认类名字符串完整出现在源码中（UnoCSS 静态扫描，动态拼接类名可能被漏扫）
- 开发环境下检查 `.vscode/icons.json` 是否已生成

### Q：颜色改不动？

检查 SVG 是否写死 `fill="#000"` 而非 `currentColor`。`presetIcons` 依赖 `currentColor` + `background-color` 着色。

## 总结

- `presetIcons` 把 Iconify 能力接进 UnoCSS，图标变成可组合的原子类
- `@iconify/tools` 在配置阶段优化本地 SVG，并导出 IDE 补全数据
- 命名约定 `i-custom-{文件名}`，颜色/尺寸交给 `text-*`、`w-*` 等现有工具类
- 与 Element Plus 分工：组件 `prop` 用 `icons-vue`，轻量 UI 用 UnoCSS class

## 下一步

- 在 `src/assets/svg/` 添加你的业务图标，跑一遍 `pnpm dev` 验证补全
- 阅读 UnoCSS presetIcons 文档 了解 scale、mode、customizations 等高级选项
- 在团队规范中明确：何时用 `i-custom-*`，何时用 `@element-plus/icons-vue`
