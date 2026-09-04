---
lastUpdated: true
commentabled: true
recommended: true
title: Git Worktree
description: 一个仓库，多个分身
date: 2026-09-04 08:15:00
pageClass: blog-page-class
cover: /covers/git.svg
---

你一定遇到过这种场景——

正在 feature 分支上写功能，写到一半，线上出 bug 了。怎么办？

stash 暂存，切到 main，修 bug，提交，切回来， stash pop。如果 stash 有冲突，还得手动解。

或者更惨的：你有三个功能同时在开发，每个都在不同的分支上。来回复切，脑子都乱了。

*Git Worktree* 就是来解决这个问题的。

## 它是什么？ ##

一句话：*让同一个 Git 仓库同时拥有多个工作目录，每个目录在不同的分支上*。

你不用切分支。你同时拥有好几个文件夹，每个文件夹就是一个分支。

```bash
my-project/           ← main 分支
my-project-feature/   ← feature 分支
my-project-hotfix/    ← hotfix 分支
```

三个文件夹，三个分支，互不干扰。在任何一个里面正常 commit、push，都作用于同一个仓库。

## 怎么用？ ##

*创建一个 worktree*：

```bash
git worktree add ../my-project-hotfix hotfix-branch
```

这一条命令，就在上级目录创建了一个新文件夹 `my-project-hotfix`，切到 `hotfix-branch` 分支。你的主工作目录完全不受影响。

*查看所有 worktree*：

```bash
git worktree list
```

*删除一个 worktree*：

```bash
git worktree remove ../my-project-hotfix
```

就这三条命令，核心用法就这些。

## 它和 git clone 有什么区别？ ##

很多人第一反应：这不就是多 clone 一份吗？

不是。区别很大：

`clone` 是复制整个仓库——独立的 `.git` 目录、独立的提交历史、独立的一切。两个仓库之间要通过 remote 来同步。

`worktree` 是共享同一个 `.git` 仓库。所有分支、所有提交记录、所有 stash 都是同一份。你在 worktree A 里 commit 了，worktree B 里 git log 就能看到。

*这意味着*：

- 不会浪费磁盘空间（只有工作文件是独立的）
- 不会出现"我修了 bug 但忘了 push，另一个仓库没更新"的问题
- 不会有 remote 同步的麻烦

## 几个真实的场景 ##

### 场景一：紧急修 bug ###

你正在 feature 分支上写代码，写到一半。线上出 bug 了。

不用 stash，不用切分支。直接打开另一个终端，进 hotfix 的 worktree 目录，修 bug，提交，推送。然后继续回 feature 目录写你的功能。

两件事并行，互不干扰。

### 场景二：同时开发多个功能 ###

三个功能三个 worktree，每个目录打开一个编辑器窗口。想写哪个写哪个，随时切换。不用 stash，不用担心切分支把未提交的代码搞丢。

### 场景三：代码审查 ###

主工作目录在写自己的代码，另一个 worktree 拉同事的分支来 review。两个完全隔离，你的改动和同事的改动互不影响。

### 场景四：跑长时间测试 ###

在一个 worktree 里跑测试（可能要几十分钟），同时在另一个 worktree 里继续写代码。测试跑完了再回来看结果。

## 注意事项 ##

同一个分支不能同时出现在两个 worktree 里。

这很好理解——如果两个目录都在改同一个分支，那到底以谁为准？Git 会直接报错阻止你。

删除 worktree 前先确认分支状态。

如果 worktree 里有未提交的改动，删之前要处理掉。否则会成为"悬空"的 worktree，Git 会提醒你清理。

用完记得删。

worktree 是轻量的，但也不是免费的。每个 worktree 都会占一个工作目录。用完的分支及时 git worktree remove。

## 为什么现在值得学？ ##

因为 AI 编程助手正在让多分支并行开发成为常态。

像 Superpowers 这样的框架，在开始实现功能时会自动创建一个 worktree。AI 在隔离的分支上干活，你可以继续在主分支上做其他事。等 AI 干完了，审查通过，再合并回来。

就算你不用 AI 助手，worktree 本身就是一个被严重低估的 Git 功能。大多数人的 Git 工作流还停留在"单目录来回切分支"的模式。一旦习惯了多 worktree 并行，你就回不去了。
