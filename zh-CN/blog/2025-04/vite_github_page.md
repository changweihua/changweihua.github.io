---
lastUpdated: true
commentabled: true
recommended: true
title: 将 Vite 项目打包并部署到 GitHub Pages 的经验分享
description: 将 Vite 项目打包并部署到 GitHub Pages 的经验分享
date: 2025-04-25 16:00:00
pageClass: blog-page-class
---

# 将 Vite 项目打包并部署到 GitHub Pages 的经验分享 #

## 项目概述 ##

今天分享一下如何将我名为 **EnvoyFront** 的项目中的 Vite 前端目录打包并顺利部署到 GitHub Pages 的过程。项目中有一个 **envoy_front** 的 Vite 前端目录，起初它是未打包的。通过一些探索和不断尝试，我总结出了以下步骤。

## 操作步骤 ##

### 进入 Vite 项目目录 ###

首先，我们需要打开终端并切换到 **envoy_front** 目录。接下来的所有命令和文件修改都将在这里进行，所以务必要确保我们处于正确的目录中：

```bash
cd envoy_front
```

### 安装 `gh-pages` 包 ###

接下来，我们需要安装一个叫做 `gh-pages` 的包，它可以帮助我们将项目部署到 GitHub Pages。可以在终端中输入以下命令：

```bash
npm install gh-pages --save-dev
```

### 修改 Vite 配置 ###

为了确保打包后的文件能够正确找到静态资源，我们需要稍微调整一下 **vite.config.ts** 文件。在 `plugins` 的旁边添加 `base` 配置，如下所示：

```ts
export default {
  // 其他配置...
  base: '/envoy-front/',
}
```
这样设置后，生成的 index.html 就会去 `/envoy-front/` 这个路径寻找资源。

### 更新 `package.json` 文件 ###

接下来，我们要对 **package.json** 文件中的 `scripts` 部分进行一些修改。这里新增的 `predeploy`、`deploy` 和 `homepage` 字段可以

```json
"scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist --repo git@github.com:changweihua/EnvoyFront.git"
},
"homepage": "https://changweihua.github.io/EnvoyFront/"
```

### 提交并推送更改 ###

完成上述修改后，我们要将更改提交到本地 Git 仓库并推送到远程仓库。可以使用以下命令：

```bash
git add .
git commit -m "Update Vite config and package.json for deployment"
git push origin main
```

### 执行部署命令 ###

这时候，我们可以在终端输入以下命令来开始部署。这将自动打包项目并将生成的内容推送到 `gh-pages` 分支中，部署到指定的网址：

```bash
npm run deploy
```

### 检查部署状态 ###

最后，在 GitHub 仓库中查看 **Actions** 选项卡，确认是否有正在运行的部署工作流。等候片刻（通常约一分钟），一旦完成，你就可以访问这个网址来查看效果。


> 小贴士
> 在访问部署网址时，记得等 GitHub Actions 工作流运行完成后再打开链接。浏览器的缓存可能会让你在刷新后看不到最新内容，最好在工作流完成后直接访问。
