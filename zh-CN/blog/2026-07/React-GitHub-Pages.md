---
lastUpdated: true
commentabled: true
recommended: true
title: React 项目一键部署至 GitHub Pages 实操教程
description: React 项目一键部署至 GitHub Pages 实操教程
date: 2026-07-23 08:35:00
pageClass: blog-page-class
cover: /covers/vue.svg
---

在前端日常开发中，开发者完成 React 项目开发后，往往需要一个免费环境快速预览项目效果、展示个人作品。GitHub Pages 依托 GitHub 平台提供免费静态资源托管服务，无需购买服务器、域名备案，搭配 `gh-pages` 第三方工具，是中小型 React 项目、个人 demo 项目上线的最优选择之一。Create React App（CRA）作为官方标配 React 脚手架，生成的项目为纯静态打包产物，完美适配 GitHub Pages 部署规范。

本文结合前端工程化开发思路，从环境准备、项目创建、依赖安装、工程配置、仓库管理、部署发布以及问题优化全维度拆解部署流程，梳理落地细节与避坑要点，系统化讲解 React 项目上架 GitHub Pages 的实现逻辑。

## 部署前置环境准备

正式开始部署前，本地需要配齐前端基础运行环境，这是项目创建与打包部署的底层前提。

- Node 环境：安装 Node.js，自带 npm 包管理工具，推荐 14.0 以上稳定版本，安装完成后终端执行`node -v`、`npm -v`验证安装。
- Git 环境：安装 Git 版本控制工具，用于代码提交、远程仓库关联，`git --version`可校验是否安装成功。
- GitHub 仓库准备：提前登录 GitHub 官网，新建空白仓库，仓库名与后续本地项目名称统一，创建时不勾选README、开源协议等初始化文件，避免本地与远程代码冲突。

## 使用 CRA 初始化 React 项目

CRA 是 React 官方零配置脚手架，内部集成 Webpack、Babel 等编译工具，开箱即用，规避原生前端繁杂配置。打开终端，切换至自定义项目目录，执行命令创建项目：

```bash
npm init react-app my-app
cd my-app
```

项目创建完毕后，执行`npm start`启动本地开发服务，访问`localhost:3000`，页面正常渲染即代表项目本地运行无异常，满足上线前置条件。

## 安装 gh-pages 开发依赖

gh-pages是 GitHub Pages 专用部署工具，原理是读取打包后的build目录，自动在远端创建gh-pages分支并推送静态资源。该包仅打包部署阶段使用，归类于开发依赖，安装命令：

```bash
npm install gh-pages --save-dev
```

安装成功后可在 `package.json` 的 `devDependencies` 中查看对应依赖版本，区分生产 / 开发依赖是前端工程化基础规范。

## 修改 package.json 核心配置

`package.json` 是前端项目配置核心文件，两处关键配置直接决定部署是否成功。

### 配置 `homepage` 访问地址

在顶层 `name` 字段上方新增 `homepage` 配置，替换用户名与仓库名：

```json
"homepage": "https://git_username.github.io/my-app/"
```

> 作用：CRA 打包时自动修正静态资源引用路径，防止上线后 css、图片、js 资源 404、页面空白。

### 配置部署脚本 scripts

利用 npm 钩子 `predeploy` 实现打包自动化，完善脚本配置：

```json
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

- `predeploy`：执行 `deploy` 命令前自动打包生成 `build` 文件夹；
- `gh-pages -d build`：指定 `build` 为部署资源目录。

## 绑定远程 GitHub 仓库

配置完成后通过 Git 关联本地与远端仓库，遵循前端版本管控规范。

```bash
# 初始化本地git仓库
git init
# 绑定远程仓库地址
git remote add origin https://github.com/user_name/my-app.git
# 提交源码并推送至主分支
git add .
git commit -m "初始化项目代码"
git push -u origin master
```

> 备注：新版 GitHub 默认主分支为 `main`，推送报错可将 `master` 替换为 `main`。源码存放主分支，打包静态资源单独存放gh-pages分支，实现代码分层管理。

## 一键部署上线站点

全部配置完成，终端执行部署指令：

```bash
npm run deploy
```

执行逻辑：

- 触发 `predeploy` 自动执行 `build` 打包，生成静态资源目录；
- `gh-pages` 自动创建远端 `gh-pages` 分支并上传所有打包文件。

部署无报错后等待 3~10 分钟，进入仓库 `Settings-Pages`，确认部署源为 `gh-pages` 分支，即可通过 `homepage` 配置的链接在线访问项目。

## 前端拓展优化与故障排查

### 项目迭代更新

本地修改代码后，使用 Git 提交更新至主分支，再次执行 `npm run deploy` 即可覆盖线上资源，完成网站更新。

### react-router 路由适配

使用BrowserRouter路由上线刷新 404 解决方案：

- 简易方案：替换为 `HashRouter` 哈希路由；
  规范方案：路由标签添加 `basename="/仓库名/"`，与 `homepage` 路径保持统一。

### 常见部署问题

- 页面白屏：检查 `homepage` 内用户名、仓库名称拼写错误；
- 部署推送失败：网络异常或未登录 GitHub 账号，切换网络配置 `git` 凭证；
- 无法访问网页：进入仓库设置手动切换 `Pages` 部署分支为 `gh-pages`。

## 总结

借助 `gh-pages` 部署 React 至 GitHub Pages，遵循*环境搭建→项目开发→依赖管理→配置适配→版本管理→打包部署→迭代优化*完整前端工程化流程。该方案零成本、上手简单，适用于前端作品集、练习项目快速上线，同时可以帮助开发者理解前端打包原理、静态路径规则与 Git 分支管理逻辑，为后续 Vercel、Netlify 等静态平台部署积累实操经验。
