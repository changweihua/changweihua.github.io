---
lastUpdated: true
commentabled: true
recommended: true
title: 写到一半被叫去修 bug？
description: 别再 stash 了，用 Git Worktree 开张"新桌子"
date: 2026-10-08 09:35:00
pageClass: blog-page-class
cover: /covers/git.svg
---

> 本文是「通俗版」的加长加细版：概念更深、命令更全、场景更多，且所有示意图都用字符（ASCII）绘制，不依赖任何图形渲染，复制到哪里都能看。

## 为什么需要 worktree（痛点） ##

你一定遇到过这种情况：正在 `feature` 分支敲代码，线上突然报错要立刻修。

*老办法（只有一张桌子，反复换文件）*：

```txt
【同一张桌子，反复换分支】
  ┌──────────────┐
  │  工作目录      │
  │  branch=feature│── 改到一半
  └──────────────┘
          │ 急事来了
          ▼
  git stash                ← 先把半成品藏起来
  git checkout hotfix      ← 切过去
  改完、提交、push
  git checkout feature
  git stash pop            ← 再摊开，还可能对冲突
  （来回切，脑壳痛，stash 还有丢改动的风险）
```

*worktree 办法（多张桌子，各干各的）*：

```txt
【多张桌子，互不干扰】
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ 桌A:feature│  │ 桌B:hotfix │  │ 桌C:release│
  └────┬─────┘  └────┬─────┘  └────┬─────┘
       └─────────────┼──────────────┘
                     ▼
             ┌──────────────┐
             │   Git 仓库     │
             │    (.git)      │
             └──────────────┘
   三张桌子共享一个仓库，互不干扰，零切换
```

一句话：*worktree 让你在不 stash、不切分支的前提下，把同一仓库的多个分支同时铺开在多个目录里*。

## 什么是 Git Worktree ##

一个 Git 仓库可以拥有多个 *工作树（worktree）*：

- 主工作树（main worktree）：你 `git clone` / `git init` 出来的第一个目录。

- 链接工作树（linked worktree）：用 `git worktree add` 额外挂上去的目录。

所有工作树*共享同一个 `.git` 对象库*（commits/trees/blobs 只存一份），但各自有独立的工作文件、独立的分支、独立的 IDE 窗口。

```txt
一个仓库 = 一个 .git  +  多个工作树
                    ├── 主工作树（main 分支）
                    ├── 链接工作树 1（hotfix 分支）
                    └── 链接工作树 2（release 分支）
```

## 核心原理（`.git` 内部到底发生了什么） ##

很多人以为 worktree 是"又复制了一份仓库"，其实不是。关键在于：*链接工作树里的 `.git` 不是目录，而是一个指向主仓库的"文件"*。

```txt
主仓库 ~/project/.git/
├── HEAD
├── objects/          ← 所有版本数据，只有这一份
├── refs/
└── worktrees/        ← 每个链接工作树的"登记表"都在这
    ├── wt-hotfix/
    │   ├── HEAD
    │   └── gitdir      ← 内容指向链接树的 .git 文件
    └── wt-release/
        └── ...

链接工作树 ~/project-hotfix/
├── .git              ← 注意：是"文件"不是目录！
├── src/
└── README.md
```

`~/project-hotfix/.git` 这个文件内容长这样：

```txt
gitdir: /home/you/project/.git/worktrees/wt-hotfix
```

它告诉 Git："我的真实数据都在主仓库的那个 `worktrees/wt-hotfix` 里"。所以链接树本身几乎不占空间，全靠主仓库。

> 推论：删链接工作树时，不能直接 `rm -rf`，否则主仓库 `.git/worktrees/` 里的登记会残留（后面"排错"会讲怎么清理）。

## 完整命令参考 ##

### 列出所有工作树 ###

```bash
git worktree list
```

*输出示例*：

```txt
/home/you/project         abc123 [main]
/home/you/project-hotfix  def456 [hotfix/bug]
/home/you/project-rel     fed789 [release/1.0]
```

*机器可读格式（写脚本用）*：

```bash
git worktree list --porcelain
```

### 新增工作树（最常用的命令） ###

*基本句式*：

```bash
git worktree add <新目录路径> [<分支或提交>]
```

*几种常见写法*：

```bash
# 基于已有分支 hotfix 开一个 worktree（要求 hotfix 没被别的树占用）
git worktree add ../project-hotfix hotfix

# 新建分支 hotfix/bug 并开 worktree（最常用）
git worktree add -b hotfix/bug ../project-hotfix main

# 分离 HEAD，临时看某次提交/标签，不占任何分支
git worktree add --detach ../project-v1 v1.0

# 基于某次提交开新分支
git worktree add -b exp/fix ../project-exp a1b2c3d
```

> 规则：如果给的分支名已存在且没被占用，就直接检出它；如果不存在，Git 会自动以当前 HEAD 为基新建该分支（等价于隐式 `-b`）。想显式控制就用 `-b`。

### 移除工作树 ###

```bash
git worktree remove ../project-hotfix
```

只能移除链接工作树，不能移除主工作树。

工作树里有未提交改动时会拒绝，加 `-f` 可强制（会丢改动，慎用）。

### 移动工作树 ###

```bash
git worktree move ../project-hotfix ../hotfix-new
```

等价于把目录挪位置，并自动更新 `.git/worktrees/` 里的登记。比手动 `mv` 再 `repair` 省事。

### 锁定 / 解锁 ###

```bash
git worktree lock ../project-hotfix
git worktree unlock ../project-hotfix
```

用途：当 `worktree` 放在*可移动磁盘 / NFS / 临时会离线*的位置时，`git worktree prune` 可能误以为它"失效"并清理登记。先 `lock` 就能防止被 `prune` 误删。

### 清理失效登记 ###

```bash
git worktree prune
```

当你手快直接 `rm -rf` 删了某个 `worktree` 目录，主仓库里还留着它的登记，`list` 会显示 (`error`)，此时跑 `prune` 把残留记录清掉。

### 修复路径（仓库被移动后） ###

```bash
git worktree repair
```

如果主仓库目录被挪了位置，链接工作树里的 `.git` 指向就失效了，在任一工作树里跑 repair 可批量修正所有登记。

## 实战 Walkthrough（从零到收工） ##

假设你有个项目 `~/project`，当前在 `main` 分支。现在要并行修一个紧急 bug。

```txt
【开始前】
~/project/            ← 主工作树（main 分支，正写着 feature）
```

### 步骤 1：开一张新桌子 ###

```bash
cd ~/project
git worktree add -b hotfix/login ../project-hotfix main
```

```txt
【执行后】
~/project/            ← 主工作树（main，feature 原封不动）
~/project-hotfix/     ← 新 worktree（hotfix/login 分支）
两者共享 ~/project/.git
```

### 步骤 2：在新桌子干活 ###

```bash
cd ~/project-hotfix
# 改代码、跑测试
git add -A
git commit -m "fix: 登录空指针"
git push -u origin hotfix/login
```

此时 `~/project` 里的 `feature` 一行没动，IDE 也不用来回切。

### 步骤 3：合并后收桌子 ###

```bash
# 在 Git 平台合并 hotfix/login 到 main 后
git worktree remove ../project-hotfix
```

```txt
【收工后】
~/project/            ← 只剩它，干干净净
```

### 步骤 4（可选）：盘点 ###

```bash
git worktree list
# 输出只剩 ~/project 一行
```

## 典型场景 ##

### 场景 A：线上紧急 bug ###

最经典用法，见上面 Walkthrough。核心就一句：`add -b` 开新树 → 改完 → `remove` 收工。

### 场景 B：对比两个版本 ###

```bash
git worktree add --detach ../v1.0 v1.0
git worktree add --detach ../v2.0 v2.0
```

然后用编辑器/对比工具同时打开 `./`、`../v1.0`、`../v2.0`，diff 一目了然。

### 场景 C：评审别人的 PR ###

```bash
git fetch origin
git worktree add -b review/pr123 ../pr123 origin/pr/123
cd ../pr123
# 本地把 PR 跑起来看效果，看完 remove 掉
```

### 场景 D：同时维护多个 release 分支 ###

```txt
project/          ← main（开发下一代）
project-1.0/      ← release/1.0（修老版本）
project-2.0/      ← release/2.0（维护当前线上）
```

三个目录各对应一个长期维护分支，互不打架，构建缓存也各自独立。

### 场景 E：多分支同时跑构建/测试 ###

主目录跑 feature 的单测，另一个 worktree 跑 release 的集成测试，不用等一个跑完再切。

## 与 git clone 的对比 ##

很多人分不清"再 clone 一份"和"开 worktree"的区别：

```txt
【克隆两份】                          【worktree】
project/    (仓库 A 的完整副本)        project/     (主，共享 .git)
project2/   (仓库 A 的完整副本)        project-b/   (链接，共享 .git)
 ├─ 两份 .git，占双倍磁盘              ├─ 一份 .git，几乎不占额外空间
 ├─ 两边历史各自独立，久了易"漂移"      ├─ 历史天然一致（同一对象库）
 └─ 适合：完全独立的两个开发机          └─ 适合：同机并行多分支
```

*什么时候用 clone*：需要在另一台机器、或想要完全隔离的副本时。

*什么时候用 worktree*：同一台机器上，想并行处理同一仓库的多个分支时。

## 常见坑与排错 ##

### 坑 1：分支被占用 ###

- 现象：`fatal: 'main' is already checked out at '...'`
- 原因：同一分支不能被两个 worktree 同时检出
- 解决：开新分支（`-b`），或用 `--detach` 看旧版本

### 坑 2：直接 `rm -rf` 删了 worktree 目录 ###

- 现象：git worktree list 显示 (error) / 路径失效

- 解决：git worktree prune   清理残留登记

### 坑 3：忘记自己开过几个 worktree ###

- 现象：磁盘里一堆目录，搞不清哪个还在用

- 解决：定期 git worktree list 盘点；不用的及时 remove

### 坑 4：可移动磁盘上的 worktree 被 prune 误删登记 ###

- 现象：磁盘还在，但 list 里显示失效

- 解决：长期离线前先 git worktree lock，回来再 unlock

### 坑 5：想 remove 主工作树 ###

- 现象：报错，主工作树不能直接 remove

- 解决：主工作树随仓库本身存在，要"删"就直接删整个项目目录

### 坑 6：在 worktree 里又 clone 了一份 ###

- 现象：worktree 套 worktree，空间翻倍

- 解决：不必，worktree 本就共享对象库

## 最佳实践 ##

*命名有规律*：worktree 目录用 `../<项目>-<分支>` 或 `<项目>@<分支>` 风格，一眼知道对应什么。
*短期任务用完即 remove*：临时修 bug / 看 PR 的 worktree，合并后顺手删，别堆着。
*长期维护分支才留常驻 worktree*：如 `release/1.0` 这种。
*别在 worktree 间硬拷文件*：改动走 commit，保持各树干净，方便 remove 不报错。
*CI / 脚本里用 `--porcelain`*：便于程序解析 list 输出。
*仓库搬家后跑一次 `repair`*：确保所有链接树登记同步更新。

## 速查表 ##

| 命令 | 作用 |
| :--- | :--- |
| `git worktree list` | 列出所有工作树（--porcelain 机器可读） |
| `git worktree add <p> <b>` | 新增工作树并检出已有分支 b |
| `git worktree add -b <nb> <p>` | 新建分支 nb 并开工作树 |
| `git worktree add --detach <p> <commit>` | 分离 HEAD 看某版本 |
| `git worktree remove <p>` | 移除工作树（-f 强制） |
| `git worktree move <p> <np>` | 移动工作树路径 |
| `git worktree lock <p>` | 锁定，防 prune 误删 |
| `git worktree unlock <p>` | 解锁 |
| `git worktree prune` | 清理失效登记 |
| `git worktree repair` | 修复仓库移动后的路径登记 |

## 总结 ##

git worktree 的本质：一个 `.git`，多张"办公桌"。

- 想并行多分支 → 开 worktree，告别 stash 反复切。
- 同一分支不能同时被两个 worktree 检出 → 用新分支或 `--detach`。
- 删 worktree 用 remove，别直接 rm；手快删了就 prune 补救。

> 把它放进你的日常工具箱，下一次"写到一半被打断"，你会感谢现在的自己。
