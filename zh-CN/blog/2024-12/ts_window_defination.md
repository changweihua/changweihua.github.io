---
lastUpdated: true
commentabled: true
recommended: true
title: TS中如何正确处理window类型
description: TS中如何正确处理window类型
date: 2024-12-18 10:18:00
pageClass: blog-page-class
---

# TS中如何正确处理window类型 #

在Typescript项目中，你可能都遇到过这个错误：


![预览图](/images/ts_window.png)

> 'Window & typeof globalThis' 类型上不存在属性 'X'。


## 快速修复方案 ##

我们将介绍几种不同的解决方案来解决这个问题。

`Window` 接口是在名为 `lib.dom.d.ts` 的文件中全局定义的。你可以使用各种技术来更改它：

- 要在 `.ts` 或 `.tsx` 文件中全局更改它，你可以使用 `declare global` 和 `interface Window`：

```typescript
declare global {
  interface Window {
    X: number;
  }
}
```

- 要在 `.d.ts` 文件中全局更改它，你只需指定 `interface Window`。


```ts
interface Window {
  X: number;
}
```

- 要仅为一个文件更改它，你可以在 `.ts` 或 `.tsx` 文件中使用 `declare const window`：

```ts
declare const window: {
  X: number;
} & Window;
```

## 详细原因分析 ##

`Windowx` 接口位于 TypeScript 的全局作用域中。它作为 DOM 类型的一部分随 `lib.dom.d.ts` 提供，描述了浏览器中可用的方法。

当第三方脚本（或我们自己的代码）向window添加内容时，问题就出现了：

```ts
window.X = Date.now();
```

这是一个问题，因为 TypeScript 不知道 `X` 属性，所以当你尝试访问它时会抛出错误：

所以，我们需要以某种方式更改 `Window` 的全局定义，以包含 TypeScript 不知道的新属性。

## 解决方案 ##

### 在 `.ts` 或 `.tsx` 文件中使用 `declare global` ###

使用 `declare global` 来更改 `Window` 的全局定义：

```typescript
declare global {
  interface Window {
    X: number;
  }
}
```

这之所以有效有两个原因。首先，`declare global` 告诉 TypeScript，其中的内容应该添加到全局作用域中。

其次，我们利用了声明合并。这是 TypeScript 中的一个规则，同一作用域中同名的接口会合并。因此，通过在同一作用域中重新声明 `Window`，我们可以向它添加新属性。

如果我们使用 `type`，这将不起作用，因为类型不支持声明合并。

这个解决方案只在 `.ts` 或 `.tsx` 文件中有效，因为 `declare global` 只在模块内工作。所以这个解决方案在项目中放置定义的位置有点尴尬。在自己的模块中？与其他地方一起？

### .d.ts 文件 ###

一个更整洁的解决方案是使用 `.d.ts` 文件中的 `interface Window`：

```ts
// window.d.ts（选择你喜欢的任何文件名）

interface Window {
  X: number;
}
```

这之所以有效，是因为你在 `.d.ts` 中放置的任何内容都会自动进入全局作用域，所以不需要 `declare global`。

它还允许你将全局定义放在一个单独的文件中，这比试图弄清楚要放在哪个 .ts 文件中要干净一些。

### 单模块覆盖 ###

如果你担心将类型添加到全局作用域，你可以使用 `declare const window` 在单个模块中覆盖 window 的类型：

```ts
declare const window: {
  X: number;
} & Window;
```

`declare const window` 就像 `const window`，但在类型层面上。所以它只作用于当前作用域——在这种情况下，是模块。我们声明类型为当前的 `Window` 加上新属性 `X`。

如果你需要在多个文件中访问 `window.X`，这个解决方案会有点烦人，因为你需要在每个文件中添加 `declare const window` 行。

## 我应该使用哪种解决方案？ ##

就我个人而言，我倾向于使用**`.d.ts`文件**。它是代码行数最少的，也最容易放在项目中。

我不介意将类型添加到全局作用域。通过实际更改 `Window` 的类型，你更准确地描述了你的代码执行的环境。

> 在我看来，这是一个加分项。

但如果你真的担心这个问题，使用 `declare const` 解决方案。
