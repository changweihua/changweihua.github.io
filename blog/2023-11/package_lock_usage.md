---
lastUpdated: true
commentabled: false
recommended: true
title: 为什么要使用 package-lock.json
description: 为什么要使用 package-lock.json
poster: /images/cmono-4c0cf778e497ab206289099ce51db5f.png
date: 2023-11-10
---

# 为什么要使用 package-lock.json #

> 随着`JavaScript`在现代软件开发中的日益重要地位，`Node.js`生态系统中的`npm`成为了不可或缺的工具。在`npm`管理依赖的过程中，`package-lock.json`文件的作用日益凸显。本文将深入探讨为什么要使用`package-lock.json`，以及它在项目开发中的重要性。


## 什么是 package-lock.json ##

在讨论`package-lock.json`的重要性之前，我们先来了解一下`package-lock.json`是什么？当使用`npm`安装项目依赖时，`npm`会自动生成两个重要的文件：`package.json`和`package-lock.json`。其中，`package.json`包含了项目的基本信息、依赖列表以及一些脚本配置；而`package-lock.json`则是用来记录当前项目依赖的详细信息，包括了依赖的版本、哈希值等。

## package-lock.json的优势 ##

### 确保依赖版本一致性 ###

在多人协作或长期项目维护中，确保所有开发者使用相同的依赖版本至关重要。这可以避免因为不同开发环境中依赖版本不一致而导致的奇怪问题。`package-lock.json`会记录每个依赖的准确版本号，以及该版本依赖的其他模块，形成一个依赖树。这确保了所有开发者安装的依赖版本都是一致的，从而减少了因版本不一致引发的错误。

### 提供可重复性安装 ###

在项目部署、持续集成和持续交付等流程中，可重复性的构建和部署至关重要。`npm install`会根据`package.json`中的版本范围安装符合条件的最新版本，而`npm ci`则会精确安装`package-lock.json`中记录的依赖版本。通过使用`npm ci`，您可以确保在不同的环境中安装相同的依赖版本，从而避免了随机安装不同版本的依赖所带来的不稳定性。

>

*npm install和npm ci的区别*

>

下面就通过一个实际示例来更好地理解`npm install`和`npm ci`之间的区别。假设有一个项目，其中的`package.json`如下所示：

```bash
{ 
    "name": "example-project",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "author": "",
    "license": "ISC",
    "dependencies": { 
        "lodash": "^4.17.21"
    }
}
```

在这个示例中，项目依赖了`lodash`模块，版本范围为**^4.17.21**。这意味着`npm`可以安装符合4.x版本的最新版本。


下面就分别使用`npm install`和`npm ci`来安装依赖，然后观察`package-lock.json`的变化

首先，运行以下命令使用`npm install`安装依赖：

```bash
npm install
```

然后，运行以下命令使用`npm ci`安装依赖：

```bash
  npm ci
```

比较两种方式安装后生成的`package-lock.json`文件，会发现`npm install`会根据`package.json`中的版本范围安装最新版本的依赖，而`npm ci`会精确地安装`package-lock.json`中记录的依赖版本，确保了可重复性的安装。

### 加速依赖安装过程 ###

在没有`package-lock.json`的情况下，`npm`可能会根据`package.json`中的版本范围安装符合条件的最新版本。但这可能会导致在不同的时间安装不同版本，从而影响项目的稳定性。而`package-lock.json`中记录的是每个依赖的精确版本，这可以避免重复下载和安装不同版本的依赖，从而加速安装过程。

### 避免不必要的更新 ###

有时候，新的依赖版本可能引入了不稳定的功能或破坏性变更。如果项目依赖的是`package.json`中的版本范围，`npm`可能会在安装时自动更新依赖，这可能导致项目出现问题。而有了`package-lock.json`，可以锁定每个依赖的版本，确保只有在明确更新`package-lock.json`并运行`npm install`的情况下，依赖才会被升级，从而避免了不必要的更新。

## 结论 ##

在目前的`JavaScript`项目开发中，使用`package-lock.json`是一个明智的选择。它可以确保依赖版本一致性，提供可重复性安装，加速依赖安装过程，避免不必要的更新等诸多好处。通过`package-lock.json`，开发者可以更加稳定地管理项目依赖，减少潜在的问题和风险。因此，无论是个人项目还是团队合作，都应该充分利用`package-lock.json`来优化项目的开发流程。
