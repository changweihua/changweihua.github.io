---
lastUpdated: true
commentabled: true
recommended: true
title: ESLint Flat Config 工程化实战
description: 从规则配置到团队代码规范落地
date: 2026-09-14 08:25:00
pageClass: blog-page-class
cover: /covers/typescript.svg
---

## 摘要 ##

深入ESLint v10 Flat Config，解析 `defineConfig`、`files` 匹配、`rules` 规则等级与 `typescript-eslint` 集成，用统一配置强制团队代码风格一致、避免bug。

ESLint 是前端工程化中代码质量管控的核心工具。它强制团队写出一致风格的代码，在开发和代码审查阶段拦截潜在的 bug。ESLint v9 引入的 Flat Config 体系彻底取代了传统的 `.eslintrc` 多层配置，用单一的 `eslint.config.mjs` 统一管理所有规则。

## 项目初始化与技术栈 ##

一个最小化的 ESLint 工程由几个文件组成：

```txt
eslint-demo/
├── eslint.config.mjs    # Flat Config 配置文件
├── index.mjs            # 待检查的代码
├── package.json
└── pnpm-lock.yaml
```

依赖项集中在 `devDependencies` 中——ESLint 是开发时工具，不参与生产构建：

```json
{
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "eslint": "^10.8.1",
    "globals": "^17.11.0",
    "typescript-eslint": "^8.67.0"
  }
}
```

`eslint` 是核心引擎，`@eslint/js` 提供 JavaScript 推荐的规则预设，`globals` 提供各种运行时的全局变量定义，`typescript-eslint` 提供 TypeScript 相关的规则和解析器。

## Flat Config 的入口结构 ##

`eslint.config.mjs` 是 ESLint 配置的单一入口。ESLint v9 之后不再读取 `.eslintrc`、`.eslintrc.json` 或 `eslintConfig` 字段，全部集中在 `eslint.config.mjs` 中：

```javascript
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
    rules: {
      "no-var": 2,
      "no-console": 1,
      "quotes": ["error", "double"],
      "semi": ["error", "always"],
      "indent": ["error", 2],
    },
  },
  tseslint.configs.recommended,
]);
```

`defineConfig` 接受一个数组，数组中的每个元素是一个配置对象或预设。配置对象是按顺序合并的——后面的配置会覆盖或补充前面的配置。这种设计让配置组合变得透明：基础预设 + 自定义规则 + 扩展预设，按优先级排列。

## files 匹配：精确控制作用范围 ##

`files` 字段指定了当前配置块适用的文件范围。`["**/*.{js,mjs,cjs,ts,mts,cts}"]` 匹配所有 JavaScript 和 TypeScript 文件——`**` 递归匹配任意层级的目录，`{js,mjs,cjs,ts,mts,cts}` 列出所有支持的扩展名。

如果项目有不同的文件类型需要不同的规则（比如测试文件 `*.test.js` 允许 `console.log`，而生产代码禁止），可以拆分为多个配置块，每个配置块使用不同的 `files` 匹配模式。

## globals：声明运行环境 ##

`languageOptions: { globals: globals.node }` 声明了代码的运行环境是 Node.js。globals 包提供了多个预定义的环境变量集合：

- `globals.node` —— Node.js 内置全局变量（`process`、`Buffer`、`__dirname` 等）
- `globals.browser` —— 浏览器全局变量（`window`、`document`、`fetch` 等）
- `globals.es2021` —— ES2021 标准全局变量
- `globals.jest` —— Jest 测试框架全局变量

如果代码使用了某个环境下的全局变量但没有声明，ESLint 会报 `no-undef` 错误。例如，在 Node.js 环境中使用 `window` 会被标记为未定义变量。

## rules：规则等级设计 ##

ESLint 规则有三个等级，对应不同的拦截策略：

| 等级 | 配置值 | 行为 | 用途 |
| :--- | :--- | :--- | :--- |
| off | 0 或 `"off"` | 关闭规则 | 明确不检查 |
| warn | 1 或 `"warn"` | 警告，不阻塞流程 | 建议性规范 |
| error | 2 或 `"error"` | 错误，阻塞流程 | 硬性规范 |

配置中的四条规则各自代表了不同的质量管控意图：

```javascript
rules: {
  "no-var": 2,       // 禁止使用 var，必须用 let/const
  "no-console": 1,   // 不建议使用 console.log（开发调试用，上线后移除）
  "quotes": ["error", "double"],  // 字符串必须用双引号
  "semi": ["error", "always"],    // 语句末尾必须加分号
  "indent": ["error", 2],         // 缩进必须为 2 个空格
}
```

`no-var: 2` 是硬性规则。var 存在作用域提升和全局污染问题，ES6 之后 let 和 const 完全取代了 var。这条规则设为 error 级别，意味着团队中任何人的代码出现 var 都无法通过 ESLint 检查。

`no-console: 1` 是警告级别。开发阶段大量使用 `console.log` 是正常的，但上线前应该清理掉。设成 warn 而不是 error，让团队在开发时可以正常使用 console.log，但 eslint 检查时会给出警告提示，提醒开发者注意。

`quotes` 和 `semi` 使用数组语法配置带参数的规则：`["error", "double"]` 表示规则等级为 error，双引号是具体的规则参数。"always" 表示必须加分号，"never" 表示禁止分号。

## 运行检查：`pnpm lint` ##

`package.json` 中定义了两个脚本：

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint --fix ."
  }
}
```

`eslint .` 对当前目录下所有匹配的文件执行检查。`eslint --fix .` 在检查的基础上自动修复可修复的规则（如 `quotes`、`semi`、`indent` 等格式化规则）。

对 `index.mjs` 执行 `pnpm lint` 后的输出：

```javascript
/path/to/index.mjs
  1:1  error    Unexpected var, use let or const instead  no-var
  1:5  warning  Unexpected console statement              no-console
  4:3  error    Expected indentation of 2 spaces but found 4  indent
```

每个错误都包含：行号列号、问题描述、违反的规则名。开发者不需要记住所有规则，ESLint 在输出中精确指出了每一条违规。

## typescript-eslint：TypeScript 生态的扩展 ##

tseslint.configs.recommended 集成了 TypeScript 的推荐规则预设，提供了针对 TypeScript 语法的检查能力——类型推断、未使用的变量、空值检查等。typescript-eslint 包包含了 TypeScript 解析器（`@typescript-eslint/parser`）和规则集（`@typescript-eslint/eslint-plugin`），通过预设配置一次性注入。

注意 `tseslint.configs.recommended` 是作为 defineConfig 数组的第二个元素传入的，与第一个配置块并列。这意味着 TypeScript 规则与自定义规则是平行关系，ESLint 会合并两者，遇到冲突时后面的配置优先。

## ESLint 的工程化价值 ##

ESLint 在工程化中的角色不仅仅是"代码检查"。它解决了三个核心问题：

*风格统一*。团队成员来自不同背景，有人习惯分号，有人不写分号；有人用单引号，有人用双引号。ESLint 用配置消除了这类无意义的争论——规则写死了，所有人都按同一套规范执行。

*缺陷拦截*。`no-var` 防止了作用域提升带来的 bug，`no-undef` 捕获了未定义变量的引用，`no-unused-vars` 清理了遗留的废弃代码。ESLint 在代码进入代码审查之前就完成了第一轮质量筛选。

*规范落地*。规则三个等级的设计让规范落地有梯度——`error` 是硬性红线，`warn` 是柔性提醒，`off` 是明确放行。团队可以逐步收紧规则，而不是一次性强制执行全部规范。

## 总结 ##

ESLint Flat Config 用 `eslint.config.mjs` 单一入口替代了传统的多层配置体系。`defineConfig` 接收配置数组，通过 `files` 匹配文件范围、`globals` 声明运行环境、`rules` 定义三个等级的规则，配合 `typescript-eslint` 扩展支持 TypeScript。

`no-var: 2` 禁止 `var` 声明，`no-console: 1` 提醒清理调试日志，`quotes`、`semi`、`indent` 统一代码风格。`eslint --fix` 自动修复可修正的格式问题。ESLint 的核心价值不在于检查本身，而在于将代码规范从"约定"转化为"强制"——让团队代码风格一致、可读性强、潜在 bug 在第一道防线就被拦截。
