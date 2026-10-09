---
lastUpdated: true
commentabled: true
recommended: true
title: 前端vite项目自动化打包部署到服务器
description: 前端vite项目自动化打包部署到服务器
date: 2026-01-19 09:35:00
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 一、引言

在前端开发领域，高效的部署流程对于项目的快速迭代和上线至关重要。传统的手动部署方式不仅效率低下，还容易出现人为错误。而自动化部署能够显著提高部署效率，减少出错概率，确保项目能够稳定、快速地部署到生产环境。本文将详细介绍如何使用 `scp2`、`chalk` 和 `ora` 这三个库实现前端 vue/vite 项目的自动化打包部署。

## 二、自动化部署理论基础

### SCP 协议

SCP（Secure Copy Protocol）是一种基于 SSH（Secure Shell）协议的文件传输协议，它提供了安全的文件传输方式。在自动化部署中，SCP 协议常用于将本地的文件或目录复制到远程服务器。通过 SCP 协议，我们可以在不暴露敏感信息的情况下，将打包好的前端项目文件安全地传输到服务器上。

### 控制台输出美化

在部署过程中，控制台输出的信息对于开发者了解部署状态非常重要。使用彩色输出可以使信息更加清晰、易读，提高开发者的体验。`chalk` 库就是一个专门用于美化控制台输出的工具，它可以为输出的文本添加不同的颜色和样式，让重要信息更加突出。

### 命令行加载动画

当部署过程较为耗时，用户可能会因为长时间没有反馈而感到焦虑。命令行加载动画可以在部署过程中提供视觉反馈，让用户知道程序正在运行，增强用户体验。`ora` 库可以在命令行中创建各种加载动画，直观地展示部署进度。

### 三、环境搭建：导入必要的库

在开始自动化部署之前，我们需要安装几个必要的库。这些库将帮助我们完成文件传输、控制台输出美化和加载动画显示等功能。

```bash
# 安装自动化部署工具（基于SCP协议）
npm install scp2 --save

# 安装控制台彩色输出库
npm install chalk --save

# 安装命令行加载动画库（用于显示上传进度）
npm install ora --save
```

## 四、核心代码实现

### 创建部署脚本文件

首先，我们需要在项目主目录下创建一个 `deploy` 文件夹，并在其中创建 `index.js` 文件。这个文件将包含自动化部署的核心逻辑。注意，`deploy` 文件夹要和`package.json` 以及 `dist` 目录在同级下。

### `deploy/index.js`代码分析 ###

```javaScript
import scpClient from 'scp2'; // 自动化部署
import chalk from 'chalk'; // 控制台输出的语句
import ora from 'ora'; // 命令行加载动画库

const spinner = ora('xxx系统正在自动部署...');
const server = {
    host: '192.168.1.x', // 服务器的IP地址
    port: 22, // 服务器端口，默认一般为22
    username: 'root', // 用户名
    password: 'xxxxx', // 密码
    path: '/data/test', // 项目部署的服务器目标位置
}

spinner.start();

// 本地打包文件的位置 ./dist
scpClient.scp('./dist', server, (err) => {
    spinner.stop();
    if (!err) {
        console.log(chalk.blue('xxx系统自动化部署完毕!'));
    } else {
        console.log(chalk.red('xxx系统自动化部署出现异常'), err);
    }
});
```

这段代码的具体功能如下：

1. 导入库：导入scp2、chalk和ora三个库，分别用于文件传输、控制台输出美化和加载动画显示。
2. 创建加载动画实例：使用ora创建一个加载动画实例，并设置提示信息为 “xxx 系统正在自动部署...”。
3. 配置服务器信息：定义一个server对象，包含服务器的 IP 地址、端口、用户名、密码和项目部署的目标位置。
4. 启动加载动画：调用 `spinner.start()` 方法启动加载动画。
5. 执行文件传输：使用 `scpClient.scp()` 方法将本地./dist目录的打包文件上传到服务器。
   处理部署结果：根据文件传输的结果，停止加载动画，并使用chalk库输出不同颜色的提示信息。如果部署成功，输出蓝色的 “xxx 系统自动化部署完毕！”；如果出现异常，输出红色的 “xxx 系统自动化部署出现异常” 并打印错误信息。

### package.json脚本配置 ###

```json
"scripts": {
    "dev": "vite --host --open",
    "serve": "vite build && vite preview --host --open",
    "build": "vite build",
    "deploy": "vite build && node ./deploy", //前端vue/vite项目自动化打包部署
},
```

在 `package.json` 的scripts部分添加deploy脚本，该脚本会先执行`vite build`命令进行项目打包，然后调用`node ./deploy`执行自动化部署脚本。

## 五、总结

通过使用scp2、chalk和ora这三个库，我们实现了前端 vue/vite 项目的自动化打包部署。整个过程包括安装必要的库、编写核心部署脚本和配置package.json脚本。自动化部署不仅提高了部署效率，还增强了部署的稳定性和可靠性。同时，通过控制台彩色输出和加载动画，提升了开发者的使用体验。在实际项目中，你可以根据需要修改服务器信息和部署路径，以适应不同的生产环境。
