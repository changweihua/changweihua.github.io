---
lastUpdated: true
commentabled: true
recommended: true
title: 使用husky+commitizen+semantic-release实现项目的全自动版本管理和发布
description: 使用husky+commitizen+semantic-release实现项目的全自动版本管理和发布
date: 2025-03-12 11:00:00
pageClass: blog-page-class
---

# 使用husky+commitizen+semantic-release实现项目的全自动版本管理和发布 #

为了从一个调包侠变成一个前端工程师，发一个npm包是必不可少的，但是手动npm publish并不方便，下面记录一种实现项目的全自动版本管理和发布的流程

## 安装依赖 ##

```bash
npm install -D husky @commitlint/config-conventional @commitlint/cli
npm install -D commitizen cz-conventional-changelog
npm install -D semantic-release @semantic-release/git @semantic-release/changelog @semantic-release/npm
```

## 初始化husky ##

### npx husky init（v9）###

- 此命令会在 .husky/ 中创建 pre-commit 脚本，并更新 package.json 中的 prepare 脚本
- 如果要添加pre-commit钩子（比如lint操作），执行echo "pnpm run lint-staged" >> .husky/pre-commit（不要使用echo >，会覆盖文件）

### 使用commitlint校验commit信息（避免有人不用配置好的命令） ###

创建 commitlint.config.cjs并写入：
    
```javascript
  module.exports = {
    extends: ["@commitlint/config-conventional"]
  };
```
添加钩子echo 'npx --no-install commitlint --edit "$1"' >> .husky/commit-msg（commit-msg也是一个git hook，作用在git commit 之后，但 commit 还未完成时）

## 初始化commitizen ##

在 package.json 中添加 config.commitizen 配置：

```javascript
{
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  }
}
```

此时运行pnpm cz即有交互式界面，如果想更简化，可以在package.json的scripts中添加"commit": "git add . && pnpm cz && git push origin main"

## 配置semantic-release ##

新建release.config.cjs文件，写入：

```javascript
module.exports = {
  branches: ["main"], // 仅在 main 分支发布
  repositoryUrl: "git@github.com:osmanthuspeace/osp-cli.git",  // 强制使用 SSH（如果不允许https链接的话）
  plugins: [
    "@semantic-release/commit-analyzer",  // 分析 commit 记录，确定版本号（major/minor/patch）
    "@semantic-release/release-notes-generator",  // 生成 release notes
    "@semantic-release/changelog",  // 更新 CHANGELOG.md
    ["@semantic-release/npm", {
      "npmPublish": true, // 修改 package.json 版本，并发布到 npm
    }],
    ["@semantic-release/git", {
      "assets": ["package.json", "CHANGELOG.md"], // 自动更新的文件
      "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }]
  ]
};
```

commit信息为feat!会触发major改变，feat触发minor，fix触发patch

## 使用Github Action ##

在 .github/workflows/release.yml 中写入（注意注释）：

```yml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
      id-token: write # <https://github.com/semantic-release/npm/blob/master/README.md#npm-provenance-on-github-actions>

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # 重要：必须获取完整的 Git 历史

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "latest" # 需要20+
          registry-url: "<https://registry.npmjs.org/>"

      - name: Set up pnpm
        uses: pnpm/action-setup@v2 # 使用官方的 pnpm action
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run Semantic Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # 无需手动设置，GitHub 会自动注入
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }} # 手动设置，使用Automation类型的Token
        run: npx semantic-release
```

NPM_TOKEN在npm个人页面→Access Tokens→Generate New Token→Classic Token→Automation获取，
然后放在github上Settings→Secrets and variables→Actions→Repository secret中

## 踩坑记录 ##

默认生成的npm test命令会抛错，可以先用

```bash
"test": "echo \"No tests yet\"",代替
```

根目录要有.npmrc，写入一行

```ini
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

NPM_TOKEN要使用Automation类型，其他的不行

semantic-release使用git tag来分析版本号，运行git tag检查仓库中的 tag，运行git ls-remote --tags origin检查远程仓库中的tag，运行npm view project_name versions查看npm仓库中的tag

运行npx semantic-release --dry-run可以进行测试

如果之前已经发布了几版，那么可能版本会有冲突，需要删除package.json中的version字段重新推送
