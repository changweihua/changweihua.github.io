---
lastUpdated: true
commentabled: true
recommended: true
title: Sass 模块化革命
description: 告别 `@import`，拥抱 `@use` 和 `@forward`
date: 2026-01-16 11:30:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

> 为什么你的 Sass 代码突然开始报错？是时候彻底理解 Sass 的模块化系统了！

最近很多前端开发者突然发现自己的 Sass 代码开始报出各种警告和错误：

- `@import rules are deprecated`
- `There's already a module with namespace "math"`
- `Using / for division is deprecated`

这一切都源于 **Dart Sass 的模块化革命**。如果你还在使用传统的 `@import`，那么这篇文章将带你彻底理解新的模块系统，并手把手教你如何迁移。

## 为什么要弃用 `@import`？ ##

### 传统 `@import` 的问题 ###

让我们先回顾一下 `@import` 的常见用法：

```scss:variables.scss
$primary-color: #1890ff;
$font-size: 14px;

// main.scss
@import "variables";
@import "mixins";
@import "components/button";

.button {
  color: $primary-color;
  font-size: $font-size;
}
```

看起来很简单对吧？但 `@import` 有几个致命缺陷：

- **全局污染**：所有变量、mixin、函数都混入全局作用域
- **无法避免冲突**：同名变量会被覆盖，且很难追踪来源
- **无法控制可见性**：无法隐藏私有变量
- **性能问题**：每次 `@import` 都会重新计算
- **依赖混乱**：无法知道模块间的依赖关系

### 新系统的优势 ###

`@use` 和 `@forward` 组成的模块系统解决了所有这些问题：

- **命名空间隔离**：每个模块有自己的作用域
- **明确的依赖关系**：清晰知道每个变量来自哪里
- **更好的封装**：可以隐藏私有成员
- **更快的编译**：模块只被计算一次

## 核心概念：`@use` vs `@forward` ##

### `@use`：使用模块 ###

`@use` 用于在当前文件中使用其他模块的功能。

```scss
// 基本用法
@use "sass:math";
@use "variables";

// 通过命名空间访问
.element {
  width: math.div(100%, 3);
  color: variables.$primary-color;
}

// 使用通配符（类似旧版行为）
@use "variables" as *;
.element {
  color: $primary-color; // 直接使用，无需前缀
}

// 自定义命名空间
@use "variables" as vars;
.element {
  color: vars.$primary-color;
}
```

### `@forward`：转发模块 ###

`@forward` 用于转发模块的成员，但不直接使用它们。常见于库的入口文件。

```scss
// 转发整个模块
@forward "variables";

// 选择性转发
@forward "sass:math" show div, ceil, floor;
@forward "components/button" hide _private-mixin;

// 重命名转发
@forward "sass:math" as math-*;
// 使用时会变成：math-div(), math-ceil()
```

## 实战迁移指南 ##

### 场景1：基础变量和工具迁移 ###

**迁移前（`@import`）**：

```scss:styles/variables.scss
$primary-color: #1890ff;
$border-radius: 4px;

// styles/mixins.scss
@mixin rounded-corners($radius: $border-radius) {
  border-radius: $radius;
}

// main.scss
@import "styles/variables";
@import "styles/mixins";

.button {
  color: $primary-color;
  @include rounded-corners;
}
```

#### 迁移方案A：直接使用 ####

```scss:main.scss
@use "styles/variables" as vars;
@use "styles/mixins";

.button {
  color: vars.$primary-color;
  @include mixins.rounded-corners;
}
```

#### 迁移方案B：创建库入口 ####

```scss
// styles/_index.scss （库入口）
@forward "variables";
@forward "mixins";

// main.scss
@use "styles" as *; // 所有成员直接可用

.button {
  color: $primary-color;
  @include rounded-corners;
}
```

### 场景2：处理第三方库冲突 ###

**问题场景**： 第三方库和你的代码都需要 `sass:math`

```scss
// ❌ 可能冲突的情况
// element-plus 内部已使用: @use "sass:math" as math;
// 你的代码中也使用: @use "sass:math" as math;

// ✅ 解决方案1：使用不同命名空间
@use "sass:math" as original-math;

.element {
  width: original-math.div(100%, 3);
}

// ✅ 解决方案2：创建包装函数
// utils/_math-utils.scss
@use "sass:math" as sass-math;

@function divide($a, $b) {
  @return sass-math.div($a, $b);
}

// 使用
@use "utils/math-utils" as math;
.element {
  width: math.divide(100%, 3);
}
```

### 场景3：构建组件库 ###

**项目结构**：

```txt
ui-library/
├── foundation/
│   ├── _variables.scss
│   ├── _colors.scss
│   └── _index.scss
├── components/
│   ├── _button.scss
│   ├── _card.scss
│   └── _index.scss
└── index.scss
```

**配置入口文件**：

```scss
// ui-library/foundation/_index.scss
@forward "variables";
@forward "colors";
@forward "typography";

// ui-library/components/_index.scss
@forward "button" show button, button-variants;
@forward "card" show card;
// 隐藏私有成员
@forward "modal" hide _private-styles;

// ui-library/index.scss
@forward "foundation";
@forward "components";

// 业务代码中使用
@use "ui-library" as ui;

.custom-button {
  @extend ui.button;
  background-color: ui.$primary-color;
}
```

## 常见陷阱和解决方案 ##

### 陷阱1：命名空间冲突 ###

```scss
// ❌ 错误：相同的命名空间
@use "module1" as utils;
@use "module2" as utils; // 错误：命名空间 "utils" 重复

// ✅ 正确：使用不同的命名空间
@use "module1" as utils1;
@use "module2" as utils2;
```

### 陷阱2：`@use` 和 `@forward` 顺序错误 ###

```scss
// ❌ 错误：@forward 必须在 @use 之前
@use "sass:color";
@forward "sass:math"; // 错误！

// ✅ 正确：正确的顺序
@forward "sass:math"; // 先转发
@use "sass:color";    // 后使用
```

### 陷阱3：忽略除法运算迁移 ###

```scss
// ⚠️ 警告：传统除法将弃用
$ratio: 16/9; // 警告：Using / for division is deprecated

// ✅ 正确：使用 math.div()
@use "sass:math";
$ratio: math.div(16, 9);
```

### 陷阱4：在 `@forward` 文件中直接使用转发的成员 ###

```scss
// utils/_index.scss
@forward "math-tools";

// ❌ 错误：不能在转发文件中直接使用转发的成员
$value: math.div(100, 2); // 错误！math 不可用

// ✅ 正确：需要单独 @use
@use "sass:math" as math;
$value: math.div(100, 2);
@forward "math-tools";
```

## 自动化迁移工具 ##

Sass 官方提供了强大的迁移工具：

```bash
# 安装迁移工具
npm install -g sass-migrator

# 1. 迁移 @import 到 @use
sass-migrator import-to-use **/*.scss

# 2. 迁移除法运算
sass-migrator division **/*.scss

# 3. 同时处理多种文件类型
sass-migrator import-to-use --recursive "**/*.{scss,sass,vue}"

# 4. 带参数的迁移
sass-migrator import-to-use --namespace=lib "src/**/*.scss"
```

## 最佳实践总结 ##

### 命名策略 ###

```scss
// 基础变量 → 通配符导入（方便使用）
@use "variables" as *;

// 工具函数 → 命名空间导入（避免冲突）
@use "utils/math" as math;

// 第三方库 → 使用短命名空间
@use "element-plus" as ep;
```

### 文件组织 ###

```scss
// 库/框架：使用 @forward 构建清晰的API
// _index.scss
@forward "foundation" show $colors, $typography;
@forward "components" hide _private-*;
@forward "utilities" as utils-*;

// 业务代码：使用 @use 明确依赖
@use "ui-library" as ui;
@use "project/utils" as utils;
```

### 处理依赖关系 ###

```scss
// 依赖图：A → B → C
// c.scss
$value: red;

// b.scss
@use "c" as *;
$color: $value;

// a.scss
@use "b" as *;
.element { color: $color; }
```

## 性能优化建议 ##

- **减少重复计算**：模块只计算一次，即使被多次 `@use`
- **合理使用缓存**：构建工具通常会缓存编译结果
- **避免深层嵌套**：过深的 `@forward` 链可能影响性能
- **按需导入**：使用 `show/hide` 只导入需要的成员

## 版本兼容性 ##

```json
// package.json 版本建议
{
  "devDependencies": {
    "sass": "^1.58.0",     // 支持完整模块系统
    "sass-loader": "^13.2.0"
  }
}
```

## 写在最后 ##

迁移到新的 Sass 模块系统看起来有些挑战，但带来的好处是实实在在的：

- **🎯 代码更清晰**：明确的依赖关系和命名空间
- **🔧 维护更容易**：模块化的结构便于重构
- **⚡ 性能更好**：智能的缓存和编译优化
- **🚀 面向未来**：符合现代前端开发的最佳实践

*迁移不是一次性的痛苦，而是一次性的投资。*现在花时间迁移，未来将节省大量的调试和维护时间。

记住这个简单的决策流程：

1. **构建库/框架** → 优先使用 `@forward`
2. **编写业务代码** → 主要使用 `@use`
3. **基础变量/配置** → 考虑 `@use ... as *`
4. **工具函数** → 使用命名空间避免冲突

行动起来吧！ 从今天开始，逐步将你的项目迁移到新的模块系统。你的未来代码库会感谢你现在做出的努力！
