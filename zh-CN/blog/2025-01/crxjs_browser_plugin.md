---
lastUpdated: true
commentabled: true
recommended: true
title: crxjs 实现浏览器插件
description: crxjs 实现浏览器插件
date: 2025-01-15 11:00:00
pageClass: blog-page-class
---

# crxjs 实现浏览器插件 #

浏览器插件开发一直以来都是前端开发者的一块重要阵地。它能让我们通过扩展浏览器功能，为用户提供便捷的工具和更流畅的使用体验。然而，许多开发者在尝试插件开发时，却常常因为复杂的 API、缺乏现代开发工具支持以及传统工具链无法实现热重载而望而却步。每次修改代码都需要重新打包、加载插件，甚至重启浏览器，不仅耗时，还容易打断开发思路。如果你也有类似的困扰，那么 **crxjs** 能成为你的终极解决方案。


## 什么是 crxjs ##

crxjs 是一个专为现代浏览器插件开发打造的工具，它以 Vite 为基础，目标是让插件开发变得像普通前端项目一样简单。通过提供*快速构建*、*热重载*、*多浏览器兼容*等特性，它帮助开发者摆脱繁琐的流程，专注于功能实现。同时，它还能跟现代web框架( vue.js 、React.js )  完全兼容，并完美支持 typescript。

### crxjs 是如何解决插件开发中的痛点的 ###

- **复杂的 API 调用**：通过内置工具和模板，crxjs 简化了繁琐的配置和代码管理。
- **低效的开发流程**：支持热重载，避免反复手动加载插件，实时查看效果，大幅提升开发效率。
- **多浏览器兼容性**：crxjs 提供智能的 `manifest.json` 配置生成，助你轻松适配 Chrome、Edge 甚至 Firefox。

> 无论你是初次尝试插件开发，还是想改进现有流程，crxjs 都能让你的开发体验焕然一新。

## crxjs 基础入门 ##

接下来，通过一个结合 crxjs 和 Vue 的简单例子，带你快速上手浏览器插件的开发。

### 初始化项目 ###

首先，使用以下命令,  初始化一个 Vite 项目：

```bash
npm init vite@^2.9.4
```

### 安装CRXJS ###

```bash
npm install --save-dev @crxjs/vite-plugin@beta
```

### 配置 vite config.ts 文件 ###

初始化完成，基础工程。 我们需要对 `vite.config.ts` 文件进行配置。

#### vite.config.ts ####

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// +++++++++++++++++++ 增加如下代码 ++++++++++++++++++++
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' // Node >=17
// ++++++++++++++++++++++++++++++++++++++++++++++++++++

export default defineConfig({
  plugins: [
    vue(),
    // +++++++++++++ 增加部分代码 +++++++++++
    crx({ manifest }),
    // +++++++++++++++++++++++++++++++++++++
  ],
})
```

#### 配置 `manifest.json` ####

接下来，我们需要配置插件的 `manifest.json` 文件，让浏览器识别我们的插件：

```json
{
  "manifest_version": 3,
  "name": "Vue 插件示例",
  "version": "1.0.0",
  "action": {
    "default_popup": "index.html"
  }
}
```

#### 最终目录结构 ####

经过如上配置，我们就得到了一个crx的最终工程。 这个工程看起来跟我们的Vue 工程不能说一模一样吧。 至少也是八九不离十。

## 启动开发服务器 ##

运行以下命令启动开发环境：

```bash
npm run dev
```

此时，你可以加载dist目录下的内容作为浏览器插件，看到带有 Vue 界面的 Popup 并测试交互功能。

如果不知道怎么加载可以看我之前的chrome 插件快速入门文章。

通过以上步骤，我们快速完成了一个基于 crxjs 和 Vue 的简单浏览器插件。如果你习惯使用 Vue 开发，那么 crxjs 能让你的插件开发变得既高效又得心应手！

## 编译与发布 ##

在完成插件开发后，crxjs 同样简化了插件的编译、发布和加载流程。

### 编译与打包 ###

crxjs 提供了与 Vite 无缝结合的打包功能。你只需运行以下命令，即可生成优化后的插件包：

```bash
npm run build
```

打包完成后，插件的所有文件将被输出到 `dist` 目录，并根据 `manifest.json` 的配置自动整理，确保文件结构符合浏览器的加载要求。

### 本地加载 ###

在开发完成后，你可以通过浏览器的“加载解压缩的扩展程序”功能，直接加载 `dist` 目录，快速验证插件的功能和表现。

### 发布到 Chrome Web Store ###

crxjs 生成的插件包完全符合 Chrome Web Store 的要求。你只需压缩 dist 目录中的内容为 ZIP 文件，然后上传到 Chrome Web Store 即可发布。

通过这样的编译与发布流程，开发者无需担心繁琐的手动打包和兼容性问题，整个过程既高效又省心。

## 总结 ##

crxjs 让浏览器插件开发不再是一项复杂的任务，而是变得和开发普通的前端项目一样直观且高效。如果你正在考虑涉足浏览器插件开发领域，或者希望提升现有插件项目的开发效率，不妨试试 crxjs。

让 crxjs 成为你浏览器插件开发的得力助手！

期待你用过crxjs 开发的插件像推荐插件一样获得巨大的用户群体。

