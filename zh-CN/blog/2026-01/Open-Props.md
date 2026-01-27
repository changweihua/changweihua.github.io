---
lastUpdated: true
commentabled: true
recommended: true
title: Open Props 简化 CSS 设计的革命性工具
description: 现代 Web 的 CSS 框架以及和Tailwind CSS的区别
date: 2026-01-14 10:30:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

> Tailwind CSS 是唯一一个开发者乐于继续使用的主要 UI 框架；而 Open Props 正在吸引一小部分充满热情的追随者。（State of CSS）

Open Props是一个相对较新的 CSS 框架，但已经在最新State of CSS调查的兴趣统计中名列前茅，很多指标已经超越了知名的Tailwind CSS。

## Open Props介绍 ##

Open Props 是一种前端开发工具，用于简化和优化 CSS 的编写方式。它主要以CSS *自定义属性* 为基础，提供了大量预定义的样式变量，开发者可以使用这些变量快速搭建用户界面 (UI)，而不必从头编写大量样式代码。

CSS *自定义属性*（通常被称为 CSS 变量）是现代 CSS 的一项强大功能，允许开发者定义一组全局变量，供整个项目中的不同部分共享使用。这使得样式更具可维护性、可重用性和灵活性。而 Open Props 则是预设了常用的变量集合，使开发者可以立即使用，不需要从零开始编写这些基础样式。

### 核心功能 ###

Open Props 提供了一组已经优化并且预定义好的变量，涵盖了以下方面：

- **颜色（Colors）**：Open Props 包含一系列常用的颜色调色板，适用于不同的 UI 风格设计。
- **字体（Typography）**：它提供了常用的字体大小、行高、字重等排版属性，便于快速搭建文本样式。
- **阴影（Shadows）**：多种阴影效果预设，开发者可以通过简单引用实现不同的视觉层次感。
- **间距（Spacing）**：预定义的间距值（padding、margin）使布局更加简洁，避免在项目中反复定义相同的数值。
- **动画（Animations）**：Open Props 还包含了基本的 CSS 动画，比如淡入淡出、平移等效果。
- **边框和圆角（Borders and Radii）**：它提供了不同的边框粗细和圆角值，方便开发者为元素添加轮廓或圆角效果。

### 优势 ###

- 易用性：开发者只需引入 Open Props 提供的变量，无需花时间去定义常见的样式，从而可以专注于业务逻辑和用户体验的改进。

- 一致性：使用 Open Props 可以确保整个项目中样式的一致性。所有的颜色、间距、阴影等都来源于同一组变量，这样可以有效避免样式的重复和冲突。

- 轻量级：Open Props 的设计宗旨之一是轻量化。它不需要任何 JavaScript，只是纯粹的 CSS，因此不会增加页面的性能开销。

- 可扩展性：虽然 Open Props 提供了一系列开箱即用的变量，但开发者仍然可以自由扩展和自定义。如果某个预设的变量不满足需求，开发者可以通过定义新的 CSS 自定义属性来扩展其功能。

### 应用场景 ###

#### 快速原型设计 ####

在早期的设计阶段，开发者需要迅速创建一个可交互的界面来展示给团队或客户。Open Props 提供了现成的颜色、排版和布局变量，开发者可以通过引用这些变量来快速搭建一个具有现代设计风格的 UI 原型。

例如，在一个简单的按钮设计中，我们可以使用 Open Props 预定义的颜色和间距来快速创建一个响应式的按钮样式：

```css
button {
  background-color: var(--blue);
  padding: var(--size-3);
  color: white;
  border-radius: var(--radius-2);
}
```

#### 维护大型项目 ####

对于大型项目，保持样式的一致性和可维护性是一大挑战。通过使用 Open Props，团队成员可以共享相同的样式库，从而减少重复工作，确保 UI 设计的一致性。

假设我们需要为一个大型网站创建一套响应式布局。我们可以利用 Open Props 提供的间距和栅格系统来实现：

```css
.container {
  display: grid;
  gap: var(--size-4);
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
```

#### 设计系统 ####

Open Props 非常适合构建和维护设计系统。设计系统通常包含大量重复使用的 UI 组件和样式规范，Open Props 提供的全局 CSS 变量让这些组件可以轻松地复用和统一管理。

在一个设计系统中，你可能会有一个全局的颜色调色板。使用 Open Props 可以确保所有的组件都引用同一组颜色变量：

```css
:root {
  --primary-color: var(--blue);
  --secondary-color: var(--green);
}

.button-primary {
  background-color: var(--primary-color);
}

.button-secondary {
  background-color: var(--secondary-color);
}
```

#### 与其他框架的集成 ####

Open Props 还可以与其他前端框架（如 React、Vue、Angular）结合使用。虽然它本质上是纯 CSS 的解决方案，但可以在这些框架中通过引入和使用其变量来实现 UI 风格的统一。例如，在 React 项目中，你可以通过直接引用 Open Props 提供的变量来定义组件的样式：

```jsx
const Button = () => (
  <button style={{ backgroundColor: 'var(--blue)', padding: 'var(--size-3)' }}>
    Click Me
  </button>
);
```

#### Open Props使用 ####

使用 Open Props 非常简单。开发者可以通过 CDN 或 npm 安装，并将其引入到项目中。例如，通过 CDN 引入 Open Props：

```html
<link rel="stylesheet" href="https://unpkg.com/open-props">
```

或者通过 npm 安装：

```bash
npm install open-props
```

安装后，就可以在 CSS 文件中直接引用 Open Props 提供的变量。

## 与TailWind CSS的区别 ##

Open Props 和 Tailwind CSS 都是前端开发中常用的工具，旨在简化 CSS 编写，提升开发效率，但它们在*理念、实现方式和应用场景*上有很大的区别。

### 理念和设计哲学 ###

- Open Props：基于 CSS 自定义属性（CSS Variables） 的预定义样式库。它的主要目的是为开发者提供一组现成的 CSS 变量（例如颜色、间距、阴影、动画等），供项目中全局使用。这些变量是通过纯 CSS 文件定义的，开发者可以在任何地方直接调用这些变量。它提供了高度的灵活性，允许开发者在代码中定义、覆盖和扩展自定义属性。

  - 设计哲学：增强 CSS 的可维护性和一致性，减少重复定义基础样式的工作，重点在于全局共享和重用 CSS 变量，同时保持 CSS 的原始灵活性。

- Tailwind CSS：是一种 *实用工具优先（Utility-First）* 的 CSS 框架。它提供了大量预定义的实用类（utility classes），用于快速构建用户界面。开发者通过在 HTML 标签上添加各种类名（如 `text-center`, `bg-blue-500`, `p-4` 等）来实现样式的定义。这种方式完全基于类选择器，而不是依赖于传统的样式表编写模式。

  - 设计哲学：鼓励开发者使用小而独立的 CSS 类来组合复杂的 UI 样式，从而避免编写自定义的 CSS 文件。它侧重于直接在 HTML 中定义样式，避免上下文切换和 CSS 文件的维护。

### 使用方式 ###

- Open Props：开发者使用 Open Props 时，通过在 CSS 中引用预定义的变量来设置样式。其核心是通过 CSS 自定义属性实现变量化样式定义，因此它保留了 CSS 代码的灵活性，开发者仍然需要编写自定义的 CSS 文件。

**示例**：


:::demo

```vue
<template>
<button class="button">
  Click Me
</button>
</template>
<script setup>
/* the props */
import "open-props/open-props.min.css";
import "open-props/colors-hsl";
/* optional imports that use the props */
// import "open-props/buttons.min.css";

/* individual imports */
// import "open-props/indigo.min.css";
// import "open-props/easings.min.css";
// import "open-props/animations.min.css";
// import "open-props/sizes.min.css";
// import "open-props/gradients.min.css";
/* see PropPacks for the full list */
</script>
<style scoped>
.button {
  background-color: var(--blue-6);
  background-color: hsl(var(--gray-9-hsl) / 30%);
  padding: var(--size-3);
  border-radius: var(--radius-2);
}
</style>
```

:::

在这里，`--blue`、`--size-3` 和 `--radius-2` 是 Open Props 提供的 CSS 自定义属性。

- Tailwind CSS：Tailwind 强调通过 HTML 类来控制样式，因此开发者几乎不需要编写自定义的 CSS 文件，而是直接在 HTML 中添加大量的实用类。例如，定义一个按钮样式可能看起来像这样：

:::demo

```vue
<template>
<button class="bg-blue-500 text-white py-2 px-4 rounded-md">
  Click Me
</button>
</template>
```

:::

Tailwind 中的 bg-blue-500、py-2、px-4 等类名是直接对应具体样式的实用工具类。

### 学习曲线 ###

- Open Props：使用 Open Props 的学习曲线较低，因为它依赖于 CSS 自定义属性，并且保持了 CSS 编写的传统模式。只要熟悉 CSS，开发者只需要了解 Open Props 提供的变量集，就可以轻松上手。

- Tailwind CSS：由于它采用了大量的实用工具类，开发者需要学习和记住这些类名。虽然 Tailwind 提供了清晰的文档，但因为其独特的类命名方式和实用工具优先的开发理念，对于习惯传统 CSS 编写方式的开发者来说，初次接触时可能需要一些时间来适应。

### 可维护性 ###

- Open Props：通过 CSS 变量的方式，全局样式的可维护性较高。开发者可以集中定义或修改某些变量，项目中的所有相关部分会自动更新。这对于样式的统一和一致性管理非常方便，特别是在大型项目中。

- Tailwind CSS：Tailwind 的维护性依赖于实用类的合理使用。由于所有的样式都直接在 HTML 中定义，当项目规模较大时，HTML 代码可能会变得臃肿，不太容易维护和阅读。不过 Tailwind 提供了 `@apply` 规则，可以将实用类合并为自定义的样式规则，以此来简化代码。

**Tailwind 示例**：

```css
.btn {
  @apply bg-blue-500 text-white py-2 px-4 rounded-md;
}
```

使用 `@apply` 可以避免在 HTML 中堆积过多的类名，提升代码的可读性。

### 灵活性 ###

- Open Props：提供的灵活性较高，因为它本质上还是依赖于 CSS 的原生功能。开发者可以轻松地扩展、覆盖和组合变量，也可以根据项目需求自定义新的 CSS 变量。而且，Open Props 与任何框架（如 React、Vue、Angular）或工具链都可以轻松集成，不依赖特定的开发工具或流程。

- Tailwind CSS：Tailwind 灵活性相对较低，因为它强制使用实用类，这意味着开发者大部分时间需要在 HTML 中操作。如果不喜欢在 HTML 中添加大量类名，Tailwind 的使用可能会显得限制较多。此外，尽管 Tailwind 提供了自定义配置的功能，允许开发者通过配置文件扩展和调整预定义类，但它依然保持着较为固定的开发模式。

### 性能 ###

- Open Props：由于 Open Props 主要依赖于 CSS 自定义属性，其性能表现非常好，不会增加额外的 CSS 文件大小。浏览器原生支持自定义属性的解析，加载速度也很快。适用于任何规模的项目，尤其是希望优化性能的场景。

- Tailwind CSS：Tailwind CSS 默认会生成大量的实用类，这可能导致 CSS 文件非常大。不过，Tailwind 提供了*树摇（tree-shaking）*功能，可以在构建过程中移除未使用的类，从而极大地减少生成的 CSS 文件大小。这使得 Tailwind 在生产环境中的性能同样优秀。

### 应用场景 ###

- Open Props：适用于希望保持传统 CSS 编写模式，同时利用 CSS 变量提升样式一致性和维护性的项目。特别是大型、复杂的项目，或者需要与现有样式系统集成的项目。

- Tailwind CSS：更适合那些注重快速开发、UI 元素组合频繁的项目，如开发速度要求高的中小型应用、原型设计或希望使用实用类的项目。Tailwind 对于项目样式的结构化管理较少，需要开发者遵循其独特的类命名体系。

总之， **Open Props** 提供了一套基于 CSS 变量的工具，允许开发者在保持传统 CSS 灵活性的同时，提升样式的一致性和可维护性。 **Tailwind CSS** 则是一种实用类优先的 CSS 框架，通过在 HTML 中直接定义样式类，减少编写自定义 CSS 的需求，专注于快速搭建用户界面。

## 总结 ##

前端技术的未来正在朝着模块化、轻量化的方向发展。随着Web应用程序复杂度的增加，开发者更倾向于采用能够提供灵活性、可扩展性和一致性的新工具。Open Props正好顺应了这一趋势，它不仅可以与现代的前端框架（如React、Vue）结合使用，还可以独立运作，成为开发者控制样式的有力助手。

无论是为小型项目提供设计变量，还是为大型项目建立统一的设计系统，Open Props都展现了其独特的价值。CSS的未来发展方向将更加关注可维护性和灵活性，而Open Props正是这一趋势的体现。

> Open Props：简化CSS设计的革命性工具

在Web开发的世界里，CSS（层叠样式表）是构建网页外观的核心。然而，随着项目的增大，CSS变得越来越冗长、难以管理，尤其是当涉及到响应式设计、变量的重用和全局样式时。Open Props，作为一个现代的CSS工具，旨在解决这些问题，提升开发效率并使设计更具可维护性和灵活性。

这篇文章将深入探讨Open Props的概念、特点以及如何使用它来简化和优化CSS设计，并展示实际的示例和代码，帮助你快速上手。

## 什么是Open Props？ ##

**Open Props** 是一个轻量级的、开放源代码的CSS工具库，它提供了一组可复用的CSS自定义属性（CSS Variables），以实现快速的布局、颜色、间距、字体等样式的管理。通过使用Open Props，开发者能够更容易地管理全局样式，统一设计规范，同时提高代码的可读性和可维护性。

与传统的CSS变量不同，Open Props不仅仅提供一组样式，而是通过一整套系统化的工具和方法，帮助开发者高效地设计和开发网页。

## Open Props的主要特点 ##

- **简化设计流程**： Open Props 的核心优势在于它提供了一组预设的CSS变量，涵盖了布局、颜色、间距、字体等常用的设计系统元素。开发者可以快速使用这些变量，而不需要手动定义每个变量。
- **响应式设计**： Open Props自动支持响应式设计。通过使用内置的断点和布局工具，开发者可以轻松适配不同的屏幕尺寸，提供流畅的用户体验。
- **高可定制性**： 尽管Open Props提供了许多预设值，但它也非常灵活，允许开发者根据需求覆盖这些默认值。你可以根据自己的设计系统来调整颜色、字体、间距等。
- **易于集成**： Open Props非常轻量，适用于任何项目。你只需将其引入到项目中，便能开始使用它提供的变量和功能。
- **开源和社区支持**： Open Props是一个开源项目，你可以自由使用并进行贡献。同时，社区也在不断扩展和改进这一工具。

## 如何使用Open Props？ ##

### 引入Open Props ###

最简单的使用Open Props的方式就是通过CDN引入。你只需将以下代码添加到HTML文件的 `<head>` 部分：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/open-props@1.0.0/dist/open-props.css">
```

### 使用CSS变量 ###

一旦你引入了Open Props，你就可以开始在你的CSS文件中使用它提供的CSS变量。比如，Open Props定义了一个名为 `--space-xs` 的变量，它代表了一些预设的间距大小，你可以像下面这样使用它：

```css
.container {
  padding: var(--space-lg);
}
```

这行代码将应用Open Props中的 `--space-lg` 值作为 `padding`，它的值是一个预设的常规大小。你不需要手动计算，直接引用变量即可。

### 覆盖默认值 ###

Open Props的一个重要特点是它允许你覆盖默认的CSS变量值，以适应你自己项目的需求。如果你想调整整个项目的间距，你只需修改 `--space-xs`、`--space-sm` 等变量的值，便能全局生效，而不需要在每个样式表中逐一更改。

```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 32px;
}
```

### 使用响应式布局 ###

Open Props内置了一些响应式布局工具，能够让开发者更加轻松地进行多屏适配。你可以使用诸如 `--breakpoint-xs`、`--breakpoint-sm` 等变量来控制响应式断点。

```css
@media (max-width: var(--breakpoint-sm)) {
  .container {
    padding: var(--space-md);
  }
}
```

这种方式让你在不同的屏幕尺寸下快速调整布局和间距，而无需每次都手动定义断点。

### 示例：一个完整的页面布局 ###

下面是一个简单的示例，演示如何使用Open Props来创建一个响应式的页面布局。

:::demo

```vue
<template>
  <div class="container">
    <header class="header">Welcome to Open Props</header>
    <div class="content">
      <div class="card">Card 1</div>
      <div class="card">Card 2</div>
      <div class="card">Card 3</div>
    </div>
  </div>
</template>
<script setup>
import "open-props/open-props.min.css";
</script>
<style lang="scss" scoped>
    :root {
      --space-sm: 16px;
      --space-md: 32px;
      --space-lg: 64px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-md);
    }
    
    .header {
      font-size: 2rem;
      margin-bottom: var(--space-lg);
    }
    
    .content {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: var(--space-sm);
    }
    
    .card {
      background-color: #f3f3f3;
      padding: var(--space-sm);
      border-radius: 8px;
    }
    
  </style>
```

:::

在这个例子中，我们使用了Open Props的CSS变量（如 `--space-sm`、`--space-md`）来定义全局的间距，布局则通过 `grid-template-columns` 和 `gap` 来设置。此外，响应式设计通过 `@media` 查询和Open Props内置的断点变量来实现。

## Open Props的优点与挑战 ##

**优点**：

- 易于使用： 只需简单引入即可开始使用，减少了开发者的工作量。
- 一致性： 通过共享的变量和设计系统，保持了项目中的样式一致性。
- 灵活性： Open Props提供的变量可以轻松覆盖，适应不同项目的需求。
- 提高生产力： 开发者可以专注于开发，而不是花费大量时间在样式的定义和调整上。

**挑战**：

- 学习曲线： 对于一些刚接触CSS变量的新手，Open Props的使用可能需要一些学习时间。
- 依赖性： Open Props依赖于浏览器对CSS变量的支持，因此可能在一些较旧的浏览器上无法正常工作。
- 自定义程度： 尽管Open Props提供了许多有用的工具，但在一些非常复杂的设计系统中，可能需要手动调整和扩展。

## 结语：Open Props，提升设计效率的利器 ##

Open Props通过提供一组统一、可复用的CSS变量，帮助开发者大幅提高了开发效率和设计的一致性。无论是在开发小型项目，还是构建大规模的Web应用，它都能成为开发者的得力工具。通过简化复杂的设计工作流，Open Props使得Web开发变得更加高效、灵活。

对于前端开发者来说，Open Props是一个值得深入了解和使用的工具，它让你在代码中无需再关心复杂的细节，直接关注设计和用户体验。而随着它在前端开发中的应用越来越广泛，我们可以预见，Open Props将会成为未来Web开发中不可或缺的工具之一。

> 还在使用Tailwind CSS，老厂长推荐 Open Props

你可能被 Tailwind 这样支配过：

“设计:这个按钮要改个圆角…”

“稍等,我找找 `rounded-lg` 后面是不是跟了 `md:rounded-xl` 还有 `hover:rounded-2xl`…”  如果你每天在 `class` 里堆砌几十个 Tailwind 原子类，像在破解摩斯密码——恭喜，你已经被 Tailwind “优雅地绑架” 了。  

今天要给大家介绍一个一个更加清爽、灵活、符合现代 CSS 发展的方案：Open Props。

## Tailwind 的痛点：你以为的“高效”可能是幻觉 ##

Tailwind 的优点众所周知（原子化、无需命名、设计系统约束），但用久了会发现：事情并不会像我们想的那样美好。

### Class 爆炸，代码像乱码 ###

:::demo

```vue
<template>
<!-- 一个普通的卡片，Tailwind 版 -->
<div class="w-full max-w-md p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800">
  <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">标题</h3>
  <p class="text-gray-600 dark:text-gray-300">内容...</p>
</div>
</template>
```

:::

- 问题：每个样式都要记 class 名，`dark:` 和 `hover:` 等前缀让代码像天书。

- 维护成本：改个间距？你得在 `p-4`、`m-2`、`gap-3` 里大海捞针。  有时候生气就直接上style覆盖样式了，

### 设计系统？还是手动拼凑？ ###

Tailwind 的主题配置（`tailwind.config.js`）虽然灵活，但：

- 改一个颜色？全局搜索替换 `bg-blue-500`。

- 想用 `14px` 字体？默认没这选项，得手动扩展配置。

### 响应式基本就是前缀地狱 ###

```html
<div class="text-sm md:text-base lg:text-lg xl:text-xl ..."></div>
```

每加一个断点，class 长度指数级增长。说时候这样的代码我自己看的都想吐，并且太长了。

## Open Props：CSS 变量的终极方案 ##

Open Props 是一套基于 CSS 变量的设计系统，提供：

- 170+ 标准化变量（颜色、间距、字体、动画等）。
- 零运行时：直接调用原生 CSS 变量，无需编译。
- 按需使用：像乐高一样组合，不强制全家桶。

### 核心优势：用 CSS 的方式写 CSS ###

这种是我比较喜欢的书写css的方式。class可以语义化命名，页面可以实现模块化css复用。例如：

:::demo

```vue
<template>
<!-- 同一个卡片，Open Props 版 -->
<div class="card">
  <h3>标题</h3>
  <p>内容...</p>
</div>
</template>
<style scoped>
  .card {
    width: var(--size-full);
    max-width: var(--size-md);
    padding: var(--size-6);
    background: var(--surface-2);
    border-radius: var(--radius-2);
    box-shadow: var(--shadow-2);
    transition: box-shadow 0.3s var(--ease-3);
  }
  .card:hover {
    box-shadow: var(--shadow-4);
  }
  /* 暗黑模式？一行搞定 */
  @media (prefers-color-scheme: dark) {
    .card { background: var(--surface-4); }
  }
</style>
```

:::

- 语义化：`--size-6` 难道不比 `p-6` 更直观。
- 复用性强：变量可跨组件共享。
- 原生支持：直接对接 `@media`、`:hover` 等 CSS 特性。

我们何乐而不为呢？

## Open Props 的特性 ##

相对于tailwind我们要反思的是，能不能用原生的css，写出高效简洁的css代码呢？答案是肯定的。

### 拥抱 CSS 原生生态 ###

- 直接使用 `@container`、`:has()` 等新特性，不用等 Tailwind 封装。

- 与 PostCSS、Sass 无缝兼容，不破坏现有工具链。

### 设计系统自由 ###

```css
/* 修改主题？只需覆盖变量 */
:root {
  --brand-1: #ff7e33; /* 主色一键换 */
  --font-serif: "Your Custom Font";
}
```

不用啃 `tailwind.config.js`，CSS 变量天然全局生效。

### 响应式更简洁 ###

```css
.title {
  font-size: var(--font-size-3); /* 默认 */
  @container (width > 600px) {
    font-size: var(--font-size-5); /* 容器查询！ */
  }
}
```

### 实践建议 ###

- 渐进式迁移：在现有项目中逐步替换 Tailwind 工具类。

- 搭配 UnoCSS：如果你离不开原子化，UnoCSS 的 CSS 变量模式能兼容 Open Props。

- 善用浏览器调试：DevTools 直接修改变量值，实时预览效果。

## 结语：CSS 的尽头是变量，不是 class ##

Tailwind 是时代的产物，但 CSS 的发展从未停止。Open Props 让我们回归 CSS 本应如此的体验：

- 更干净的代码，

- 更原生的兼容性，

- 更未来的适配能力。

是时候给你的 class="..." 减减肥了！

现在就去试试 Open Props，评论区等你来吐槽！

（附：Open Props 官方提供的[交互式文档](https://open-props.style/#interactive)，比 Tailwind 的文档更友好哟！）
