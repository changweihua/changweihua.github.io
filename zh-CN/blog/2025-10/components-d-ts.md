---
lastUpdated: true
commentabled: true
recommended: true
title: 自定义 `components.d.ts`
description: 自定义 `components.d.ts`
date: 2025-10-10 09:30:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

在使用 Vue3 + Vite 的项目中，`unplugin-vue-components` 是一个非常实用的插件，它可以 *自动按需导入组件*，免去手动 import 的麻烦。同时，它会生成一个 `components.d.ts` 文件，为 TypeScript 提供全局组件类型提示。

不过，很多团队会遇到一个问题：

> 每次新增组件，`components.d.ts` 都会变动，需要提交到 Git，非常烦人。有没有办法不提交，又不影响功能？

本文就来分享一个 **完整、优雅的解决方案**。

## 1️⃣ 背景与问题 ##

*为什么我会这么反感？*

每次用到新组件，它都会自动更新一次，虽然我这项目就是一个 TypeScript 项目，我不喜欢在项目里看到任意生成文件，你给我生成一个 `components.d.ts`，而且我压根就不想去提交这个文件的更新。

- 文件每次更新组件都会变化
- Git 会跟踪，导致每次都要提交
- 对于 CI/CD 或团队协作，非常麻烦

## 2️⃣ 解决方案 ##

> 常语录：看到什么不爽，那就干掉他

### 步骤 1：忽略文件 ##

在 `.gitignore` 中添加：

```gitignore:.gitignore
# 忽略自动生成的组件类型声明
src/components.d.ts
```

> 注意：如果文件之前已经提交到 Git，仅仅添加 `.gitignore` 不会生效，需要先从 Git 索引中移除。

### 步骤 2：从 Git 中移除（保留本地） ###

**执行**：

```bash
git rm --cached src/components.d.ts
```

**解释**：

- `--cached` 表示 只从 Git 索引中删除
- 本地文件仍然保留
- 确保路径和实际文件一致

### 步骤 3：提交更改 ###

```bash
git add .gitignore
git commit -m "chore: 忽略自动生成的 components.d.ts"
git push
```

**✅ 完成后**：

- 本地 IDE 仍然可以补全组件类型
- Git 不再跟踪 `components.d.ts`
- 新增组件不会再频繁修改提交

### 步骤 4：可选优化 ###

在 `vite.config.ts` 中可以增加对 `Components` 的配置，有一个 `dts` 属性，可以指定 `components.d.ts` 的生成目录，如果不设置的化，默认会自动生成到根目录下

#### 方案 A：生成到临时目录 ####

可以把类型文件生成到 `node_modules/.types`，彻底不提交：

```ts:vite.config.ts
Components({
  dts: 'node_modules/.types/components.d.ts',
})
```

- IDE 仍然识别
- Git 自动忽略 `node_modules`

#### 方案 B：关闭文件生成 ####

如果项目没有用到 typescript，所以可以直接选择关闭类型生成

```js
Components({
  dts: false, // 不生成 d.ts 文件
})
```

## 3️⃣ 小结 ##

- `components.d.ts` 是 类型声明文件，不影响运行时
- 可以安全地 从 Git 中移除并忽略
- 本地 IDE 的类型提示依然有效
- 可根据团队喜好选择生成路径或关闭生成
