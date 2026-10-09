---
lastUpdated: true
commentabled: true
recommended: true
title: Vite的HMR怎么突然失效了？
description: Vite的HMR怎么突然失效了？
date: 2026-05-21 10:35:00 
pageClass: blog-page-class
cover: /covers/vite.svg
---

## 引言 ##

在现代前端开发中，Vite凭借其极速的启动时间和高效的热模块替换（HMR）机制，迅速成为开发者们的新宠。然而，正如任何工具一样，Vite的HMR也并非完美无缺。最近，我在一个项目中遇到了一个诡异的问题：原本运行良好的HMR突然失效了，页面不再自动刷新，修改代码后需要手动刷新浏览器才能看到变化。经过一番深入排查，我才发现问题的根源竟是一个看似微不足道的配置细节。这篇文章将记录我的排查过程、问题的本质原因以及解决方案，希望能帮助其他遇到类似问题的开发者少走弯路。

## 主体 ##

### HMR的基本原理 ###

在深入问题之前，有必要先理解 Vite 的 HMR 是如何工作的。HMR（Hot Module Replacement）是Vite的核心功能之一，它允许开发者在不刷新整个页面的情况下更新模块。其基本原理可以概括为以下几步：

- 文件变更监听：Vite通过文件系统监听（如 `chokidar`）检测到文件变动。
- 模块依赖分析：Vite会分析变更文件的依赖关系，确定需要更新的模块范围。
- 消息通知：Vite通过WebSocket向浏览器发送更新通知。
- 模块替换：浏览器接收到通知后，动态加载新模块并替换旧模块，完成局部更新。

这一过程的顺畅运行依赖于Vite开发服务器、WebSocket通信以及浏览器端的HMR客户端的协同工作。

### 问题现象描述 ###

在我的项目中，HMR的失效表现为：

- 修改代码后，浏览器控制台没有显示任何HMR相关的日志（如 `[vite] hot updated`）。
- WebSocket连接正常建立（可以通过浏览器开发者工具的Network面板确认）。
- 手动刷新浏览器后更改才会生效。

起初，我以为是项目配置出了问题，但检查后发现vite.config.js中并未显式禁用HMR。于是我开始逐步排查可能的原因。

### 排查过程 ###

#### 检查基础配置 ####

首先确认 `vite.config.ts` 中是否禁用了HMR：

```ts
export default {
  server: {
    hmr: true // 默认即为true
  }
}
```

确认配置无误后，排除了显式关闭 HMR 的可能性。

#### WebSocket连接状态 ####

通过浏览器开发者工具的 Network 面板检查 WebSocket 连接：

- WebSocket 连接正常建立（状态码 `101`）。
- 修改文件时能看到 WebSocket 消息传递（如 `{ type: 'update', path: '/src/main.js' }`）。

这说明服务端确实发送了更新通知，但浏览器端似乎没有正确处理这些消息。

### HMR客户端注入问题 ###

Vite 会在 HTML 中自动注入 HMR 客户端脚本（如 `@vite/client`），这是 HMR 正常运行的关键。检查项目的HTML文件发现：

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="/src/main.js"></script>
</head>
<body>
</body>
</html>
```

注意到这里直接加载了 `main.ts` 而没有引入 `@vite/client`！原来是因为我手动编写了 HTML 文件并遗漏了这一步。

#### Vite的特殊要求 ####

进一步查阅文档发现：如果使用自定义 HTML 入口文件（而非让 `Vite` 自动生成），需要显式添加以下内容以确保 HMR 客户端被注入：

```html
<script type="module" src="/@vite/client"></script>
```

如果没有这一行，浏览器无法加载 HMR 客户端逻辑，自然无法响应服务端的更新通知。

### 问题根源与修复 ###

问题的根本原因是：自定义HTML文件中缺少了对 `@vite/client` 的引用。由于Vite不会强制修改用户提供的HTML文件（这是为了灵活性），因此开发者需要手动确保这一点。修复方法很简单：在自定义HTML中添加以下脚本即可：

```html
<script type="module" src="/@vite/client"></script>
<script type="module" src="/src/main.ts"></script>
```

### HMR的其他常见陷阱 ###

除了上述问题外，还有一些可能导致HMR失效的场景值得注意：

#### `base` 配置不匹配 ####

如果项目配置了 `base` 选项（如部署到子路径）：

```javascript
export default {
  base: '/sub-path/'
}
```

则需要在HTML中调整脚本路径为绝对路径或动态变量：

```html
<script type="module" src="/sub-path/@vite/client"></script>
```

#### Proxy或中间件干扰 ####

如果项目使用了自定义服务器中间件或反向代理（如Nginx），可能会拦截WebSocket请求导致HMR失效。此时需要确保代理配置允许WebSocket升级请求通过。

#### Chrome扩展冲突 ####

某些Chrome扩展（如广告拦截器）可能会屏蔽WebSocket通信或脚本注入。尝试禁用扩展或在隐身模式下测试。

## 总结 ##

这次经历让我深刻认识到工具链的“黑箱”特性——即使是最简单的遗漏也可能导致核心功能的完全失效。对于Vite这样的现代工具来说，“约定优于配置”的设计理念虽然提高了开发效率，但也要求开发者对底层机制有更深入的理解。尤其是在自定义项目结构时，必须关注框架的隐式依赖和关键入口点。
