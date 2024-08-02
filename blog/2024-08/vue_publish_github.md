---
lastUpdated: true
commentabled: true
recommended: true
title: Vue应用创建并将其部署到GitHub Pages的过程
description: Vue应用创建并将其部署到GitHub Pages的过程
date: 2024-08-01 14:18:00
pageClass: blog-page-class
---

创建一个Vue应用并将其部署到GitHub Pages的全流程可以分为以下几个步骤：

## 创建Vue应用 ##

首先，确保你的开发环境中已安装`Node.js`和`npm`。然后，使用`Vue CLI`来创建一个新的`Vue`项目。

1. 全局安装`Vue CLI`（如果尚未安装）:

```bash
npm install -g @vue/cli
```

2. 创建一个新的Vue项目:

```bash
vue create my-vue-app
```

3. 按照提示选择配置（你可以选择默认配置）。

4. 进入项目目录:

```bash
cd my-vue-app
```

## 配置Vue项目以适应GitHub Pages ##

你需要做一些配置，以确保Vue应用可以在GitHub Pages上正确运行。

在`vue.config.ts`文件中配置`publicPath`。如果文件不存在，你需要创建它。

```javascript
module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/<REPO_NAME>/' // 替换<REPO_NAME>为你的GitHub仓库名称
    : '/'
}
```

## 构建项目 ##

运行以下命令来构建生产环境的代码：

```bash
npm run build
```

这将在`dist`目录中生成生产环境的代码。

## 将构建的文件推送到GitHub ##

在`GitHub`上创建一个新的仓库。

初始化本地`git`仓库并添加`GitHub`仓库为远程仓库：

```bash
git init
git remote add origin https://github.com/<USERNAME>/<REPO_NAME>.git
```

替换`<USERNAME>`和`<REPO_NAME>`为你的GitHub用户名和仓库名。

添加`dist`目录到一个新的`git分支`，通常命名为`gh-pages`：

```bash
git add dist
git commit -m "Initial dist subtree commit"
git subtree push --prefix dist origin gh-pages
```

## 配置GitHub Pages ##

在`GitHub`仓库页面，转到`“Settings”`。

在左侧菜单中找到`“Pages”`部分。

在`“Source”`部分，选择`gh-pages`分支并保存。

## 访问你的应用 ##

`GitHub Pages`将在几分钟内自动部署你的页面。你可以通过访问`https://<USERNAME>.github.io/<REPO_NAME>/`来查看你的Vue应用，其中`<USERNAME>`是你的GitHub用户名，`<REPO_NAME>`是你的仓库名。

通过遵循这些步骤，你可以成功地将你的Vue应用部署到`GitHub Pages`。
