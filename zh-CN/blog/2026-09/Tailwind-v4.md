---
lastUpdated: true
commentabled: true
recommended: true
title: 2026 年 CSS 选型真相
description: 我用 Tailwind v4 + 原生新特性重构了一个组件库
date: 2026-09-08 14:25:00
pageClass: blog-page-class
cover: /covers/html5.svg
---

> 如果你也在纠结"项目到底用 Tailwind 还是原生 CSS"，这篇文章可能会让你省下两周的调研时间。

去年公司决定重构一套内部组件库，面对 BEM 命名混乱、样式泄露、维护成本高等老问题，团队内部爆发了激烈争论：继续用回 SCSS？上 Tailwind？还是拥抱原生 CSS 新特性？

我花了两周时间，把同一套组件用三种方案各实现了一遍。结果是：成年人不做选择，*Tailwind v4 + 原生 CSS 特性才是 2026 年的最优解*。

## 那些年我们是怎么写 CSS 的 ##

我 2016 年入行时，CSS 的"先进"写法还是 SCSS + BEM：

```css
// button.scss
.btn {
  &--primary { background: blue; }
  &--disabled { opacity: 0.5; cursor: not-allowed; }
}
```

BEM 确实解决了命名冲突，但它的成本太高了：

- *命名成本*：写一个组件要先想 5 分钟类名
- *文件成本*：一个项目动辄几十个 `.scss` 文件，`import` 地狱
- *构建成本*：需要 `node-sass`/`dart-sass` 预处理，CI 构建时间增加 20%
- *维护成本*：`.btn--large` 和 `.btn--big` 到底有什么区别？只有天知道

到了 2020 年前后，CSS-in-JS 横空出世，`styled-components` 一度让我以为"这就是未来"。但用了一段时间后发现，运行时生成样式的性能开销在大型项目里不可忽略——特别是配合 React Server Components 时，服务端渲染再注水，CSS 还没渲染完。

## CSS-in-JS 正在退场，零运行时方案崛起 ##

2024-2025 年，CSS-in-JS 的衰落已经非常明显。styled-components 和 Emotion 的下载量持续下滑，原因很直接：

- *运行时开销*：每个组件都生成唯一类名，浏览器要花额外时间解析
- *SSR 兼容性差*：服务端生成样式 → 客户端再生成一次，重复工作
- *包体积膨胀*：运行时库本身就要几十 KB

替代方案是*零运行时 CSS*：Vanilla Extract、Panda CSS、StyleX。它们的思路一致：在构建时把样式编译成普通 CSS，运行时零开销。

但这里有个陷阱——*如果你已经有了设计系统，再换一套零运行时方案，迁移成本极高*。直到 Tailwind v4 的出现，才让我看到了"不用迁移、直接升级"的曙光。

## 实战：用 Tailwind v4 + 原生 CSS 重构 Button 组件 ##

先看一下重构后的 Button 组件代码：

```tsx
// Button.tsx
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
}

const buttonVariants = cva(
  // 基础样式（所有变体共享）
  'inline-flex items-center justify-center rounded-md font-medium '
  + 'transition-colors duration-200 focus-visible:ring-2 '
  + 'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300',
        ghost: 'bg-transparent text-gray-900 hover:bg-gray-100',
      },n      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export function Button({ variant, size, disabled, children, className }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

Tailwind v4 最大的升级是 `Oxide` 引擎——用 Rust 重写后，冷构建从 v3 的 3-5 秒降到 200ms 以内，HMR 更新几乎无感。更重要的是，v4 内部用上了原生 CSS 的 `@layer`，生成的 CSS 不再是一堆散乱的 utility class，而是有层级的、可预测的。

但 Tailwind 再强，也覆盖不了所有场景。比如主题切换，纯靠 Tailwind 的 `dark:` 前缀在复杂场景下会很啰嗦。这时候就需要原生 CSS 新特性出马了。

## 原生 CSS 新特性：这才是"组合拳"的关键 ##

### CSS 变量 + `light-dark()` 做主题系统 ###

Tailwind 有 `darkMode` 配置，但项目里的颜色值散落在 config 和各处 class 里，维护成本不低。用原生 CSS 变量 + `light-dark()` 可以把主题色集中管理：

```css
/* theme.css - 项目单一主题源 */
:root {
  /* 语义化颜色变量 */
  --color-bg: light-dark(#ffffff, #0a0a0a);
  --color-text: light-dark(#171717, #e5e5e5);
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-border: light-dark(#e5e5e5, #262626);

  /* 字体与间距 */
  --font-sans: 'Inter', system-ui, sans-serif;
  --radius-md: 0.5rem;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

/* 在 Tailwind v4 的 @theme 中引用 */
@theme {
  --color-bg: var(--color-bg);
  --color-text: var(--color-text);
  --color-primary: var(--color-primary);
  --font-sans: var(--font-sans);
}
```

`light-dark()` 是 2025 年 Chrome/Edge/Firefox 全支持的特性，一行代码搞定亮/暗色主题，比 Tailwind 的 `dark:` 前缀更语义化。而且原生 CSS 变量是运行时动态计算的，用户切换主题只需要改一个 HTML 属性，零 JavaScript 参与。

### `@layer` + `@scope` 解决样式隔离 ###

Tailwind 的 utility class 虽然避免了命名冲突，但在大型项目里，第三方组件库的样式还是可能和你的冲突。用 `@layer` 和 `@scope` 可以构建一个层级分明的样式系统：

```css
/* layers.css */
@layer reset, tokens, base, layout, components, utilities;

/* 1. 重置层 - 最底层 */
@layer reset {
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
}

/* 2. 令牌层 - 设计系统 */
@layer tokens {
  :root {
    --spacing-unit: 0.25rem;
    --color-primary: #2563eb;
  }
}

/* 3. 组件层 - 自定义组件 */
@layer components {
  /* 用 @scope 限制作用域 */
  @scope (.data-table) to (.data-table *) {
    th {
      background: var(--color-primary);
      color: white;
      font-weight: 600;
    }
    td {
      border-bottom: 1px solid #e5e5e5;
      padding: calc(var(--spacing-unit) * 3);
    }
  }
}

/* 4. 工具层 - Tailwind utilities */
@layer utilities {
  .text-balance { text-wrap: balance; }
}
```

这里的关键是 `@scope`：它让 `.data-table` 内部的 `th`/`td` 样式不会泄漏到页面其他表格，彻底告别 BEM 的命名噩梦。

### 容器查询做组件级响应式 ###

Tailwind 有响应式前缀 `md:`/`lg:`，但它们基于视口宽度。如果组件放在侧边栏和主内容区，同样的组件需要不同的布局——这时候容器查询就派上用场了：

```tsx
<!-- 组件内部根据容器宽度自适应 -->
<div class="@container">
  <div class="@max-md:flex-col @md:flex-row flex gap-4">
    <div class="@max-md:w-full @md:w-1/3">侧边信息</div>
    <div class="@max-md:w-full @md:w-2/3">主内容</div>
  </div>
</div>
```

Tailwind v4 已经内置了对 `@container` 的支持，配合原生容器查询，组件真正做到了"放哪都能自适应"。

## 2026 年我的 CSS 选型建议 ##

经过这次重构，我的结论很清晰：

### 新项目直接上 Tailwind v4 ###

- Oxide 引擎的构建速度让开发体验飞跃
- 内置 `@layer` 支持，和其他样式系统和平共处
- `class-variance-authority` + `tailwind-merge` 搞定组件变体

### 原生 CSS 新特性作为"补丁" ###

- 用 CSS 变量 + `light-dark()` 做主题，比 Tailwind 的 dark mode 更语义化
- 用 `@scope` 解决复杂组件的样式隔离，替代 BEM
- 用容器查询做组件级响应式，脱离"全局 breakpoint"的束缚

### 不要二选一，要组合 ###

Tailwind v4 的 `@theme` 可以直接引用 CSS 变量，原生特性可以无缝接入。这不是"选 Tailwind 还是选原生"的问题，而是Tailwind 负责开发效率，原生特性负责精准控制的分工。

最后说个数据：重构后的组件库，CSS 体积从原来的 45KB（压缩后）降到了 12KB，构建时间从 8.5s 降到 0.3s。而且最爽的是——再也不用想类名了。

如果你还在纠结项目用什么 CSS 方案，我的建议是：先试试 Tailwind v4 + CSS 变量这套组合。它可能不是最"酷"的，但一定是最务实的。
