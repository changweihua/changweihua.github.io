---
lastUpdated: true
commentabled: true
recommended: true
title: 参与 Github 开源项目，提交 PR
description: 学习如何为开源项目贡献自己的力量
poster: /images/cmono-4c0cf778e497ab206289099ce51db5f.png
date: 2023-08
---

# 参与 Github 开源项目，提交 PR #

最近加入了 unFIX 官网开发组，是时候学习如何给开源项目提交 PR 了。

如何给开源项目提交pr，成为一名开源贡献者。PR 是Pull Request的缩写，当你在github上发现一个不错的开源项目，你可以将其fork到自己的仓库，然后再改动一写代码，再提交上去，如果项目管理员觉得你的提交还不错的话，就会将你的代码合并，然后你就成为了这个代码的贡献者了。

基础的git操作咱今天就不说了，直接步入正题，傻瓜式流程，直接按步操作即可。

## fork开源项目 ##

这里以 [https://github.com/un-fix/un-fix.github.io.git](https://github.com/un-fix/un-fix.github.io.git) 项目为例子，点击fork到自己仓库。

查看自己是否与远程仓库建立了连接

```bash
git remote -v
```


## 修改代码并获取更新提交 ##

### 开发规范 ###

所有改动必须创建功能分支 并修改代码提交到自己fork后的项目中

引入 `cz-customizable` 包，规范日志格式。

```bash
git checkout -b dev-xxx-xxx
npm run commit
git push origin dev-xxx-xxx
```

```js
module.exports = {
  // 可选类型
  types: [
    { value: 'feat', name: 'feat: 新功能' },
    { value: 'fix', name: 'fix: 修复一个bug' },
    { value: 'docs', name: 'docs: 文档变更' },
    { value: 'style', name: 'style: 代码格式(不影响代码运行的变动)' },
    { value: 'conflict', name: 'conflict: 修复代码冲突' },
    { value: 'font', name: 'font: 字体文件更新' },
    { value: 'refactor', name: 'refactor: 重构(既不是增加feature，也不是修复bug)'},
    { value: 'perf', name: 'perf: 性能优化' },
    { value: 'test', name: 'test: 增加测试' },
    { value: 'chore', name: 'chore: 构建过程或辅助工具或配置工具修改' },
    { value: 'revert', name: 'revert: 回退' },
    { value: 'build', name: 'build: 影响构建系统或外部依赖项的更改(如:webpack、npm)' }
  ],
  // 交互式消息提示步骤
  messages: {
    type: '请选择提交类型:',
    customScope: '请输入修改范围(可选):',
    subject: '请简要描述提交(必填):',
    body: '请输入详细描述(可选):',
    footer: '请输入要关闭的issue(可选):',
    confirmCommit: '确认使用以上信息提交？(y/n/e/h)'
  },
  // 跳过问题
  skipQuestions: ['body', 'footer'],
  // subject文字长度默认是72
  subjectLimit: 72
}
```

> 记得分支提交后，要删除，不然版本会很乱。

## 代码提交 ##

这个时候呢，先不要去提交pr，避免有其他人提交有更新的版本，先做一下同步。

为什么要这么做？因为当你在开发的时候，可能其他人也在开发，很有可能你fork的代码已经不是最新的了，这时你就需要不断更新你的代码，至少保证在push前要更新一次，这样才能确保不会发生代码冲突。

git rebase 和git merge的区别是 git rebase 形成的是一条线，会把你当前的几个commit，放到最新commit的后面。

git merge 会把公共分支和你当前的commit 按照提交时间合并在一起，形成一个新的 commit 提交，注意不要在公共分支使用rebase

//先设置 upstream 为开源项目地址，目的是为了把开源项目的更新 同步到自己fork的项目中
```bash
git remote add upstream https://github.com/changweihua/un-fix.github.io.git
```
//获取更新
```bash
git fetch upstream
```
//合并更新
```bash
git rebase upstream/main
```
//如果有冲突呢 修改文件冲突 修改后git add 冲突文件名 commit提交
```bash
git rebase --continue
```

## 创建 PR ##

我们回到自己仓库的项目主页，比如 [https://github.com/changweihua/un-fix.github.io.git](https://github.com/changweihua/un-fix.github.io.git)，可以看到刚才提交的记录，则表示之前的操作都已成功。接下来，点击箭头所指的Pull Requests选项。

点击 New pull request 按钮

接下来，点击 Creat pull request 即可提交成功。

最后，只需耐心等待管理员的审核即可。开源项目的所有pr记录可以在这里查看，包括你刚才提交的。

然后填写title和修改备注，等待维护者审查即可。

### 审查通过 ###

一个审查通过的大概例子： https://github.com/changweihua/un-fix.github.io/pull/1

![审查通过示例](/images/cmono-4c0cf778e497ab206289099ce51db5f.png){data-zoomable}
