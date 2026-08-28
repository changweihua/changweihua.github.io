---
lastUpdated: true
commentabled: true
recommended: true
title: Git Commit Signing 完全指南
description: 为什么你的 Git 提交需要签名？
date: 2026-08-28 10:15:00
pageClass: blog-page-class
cover: /covers/git.svg
---

在参与开源项目（如 Tauri）或对安全性有要求的团队开发中，你可能会遇到这样的情况：提交的代码在 GitHub 上显示为 "Unverified"（未验证），甚至因为没有签名而被禁止合并。

这篇博客将带你深入了解 Git 提交签名的必要性，并手把手教你如何使用 SSH 密钥配置最简单的签名流程。

## 为什么我们需要提交签名？(The Why) ##

很多开发者认为，我在 `git config` 里设置了 `user.name` 和 `user.email`，不就已经证明了“这是我提交的”吗？

> 答案是：不能。

### Git 的“天真”与安全隐患 ###

Git 在设计之初是非常信任使用者的。你可以在任何一台机器上，把提交者的名字和邮箱设置成任何人。
比如，我可以轻易地用 Linus Torvalds 的名字和邮箱提交一段包含恶意后门的代码。如果这段代码被合并了，看起来就像是 Linux 之父本人提交的一样。

### 签名的作用 ###

数字签名（GPG 或 SSH 签名）解决了这个问题。它类似于现实生活中的 **“亲笔签名”+“防伪印章”**。

- 身份验证 (Identity)：只有拥有私钥的你，才能签出这个名。GitHub 通过你上传的公钥验证签名，确认“这确实是你本人提交的”。
- 完整性 (Integrity)：签名还能确保提交内容在传输过程中没有被篡改。
- 项目合规：许多大型开源项目（Tauri, Kubernetes 等）为了防止供应链攻击，强制开启了“分支保护规则”，要求所有合并的 Commits 必须是 Verified（已验证）的。

## 如何配置？(The How) ##

以前大家常用 GPG Key 进行签名，但配置繁琐且容易出错。现在 Git 和 GitHub 都支持使用 SSH Key 进行签名，这使得配置变得异常简单！

我们直接复用你用于拉取代码的 SSH Key 即可。

## 第一步：准备 SSH Key ##

如果你还没有 SSH Key，或者想用现有的（推荐算法为 ed25519）：

```bash
# 检查现有的 SSH keys
ls -al ~/.ssh/

# 如果没有，生成一个新的 (一直回车即可)
ssh-keygen -t ed25519 -C "your_email@example.com"
```

### 第二步：告诉 Git 使用 SSH 签名 ###

在你的终端中运行以下命令。你可以选择 `--global` (全局生效，推荐) 或 `--local` (仅当前仓库生效)。

```bash
# 1. 告诉 Git 我们要用 SSH 格式来签名 (默认是 gpg)
git config --global gpg.format ssh

# 2. 指定你的 SSH 公钥路径 (注意是 .pub 结尾的文件)
git config --global user.signingkey ~/.ssh/id_ed25519.pub

# 3. 开启自动签名 (关键步骤！开启后以后提交都不用加参数了)
git config --global commit.gpgsign true
```

## 第三步：在 GitHub 上添加 Signing Key ##

这是最容易被忽略的一步！Git 签好了名，GitHub 得有你的“公钥备案”才能验证。

1. 复制你的公钥内容：

```bash
cat ~/.ssh/id_ed25519.pub
```

2. 打开 GitHub SSH and GPG keys 设置页面。
3. 点击 New SSH key。
4. 关键点：在 Key type 下拉菜单中，必须选择 Signing Key (默认是 Authentication Key)。
5. 粘贴公钥并保存。

## 怎么使用？(The Usage) ##

配置完成后，使用起来是完全透明的。

### 日常提交 ###

你不需要改变任何习惯。

```bash
git commit -m "feat: add amazing feature"
```

由于我们配置了 `commit.gpgsign true`，Git 会在后台自动调用 SSH Key 对这次提交进行加密签名。

### 验证签名 ###

你可以通过以下方式检查是否成功：

*在本地*：

```bash
git log --show-signature
```

你会看到类似 `Good "git" signature for ...` 的提示。

*在 GitHub 上*：

提交推送到 GitHub 后，你的 Commit 旁边会出现一个绿色的 `Verified` 徽章。

## 常见问题 (FAQ) ##

### Q: 为什么我配置了，GitHub 还是显示 Unverified？ ###

A: 检查两点：

- GitHub 上添加 SSH Key 时，Type 选对了吗？必须是 Signing Key。
- 你的 Git `user.email` 和 GitHub 账号的主邮箱一致吗？签名验证是绑定邮箱的。

### Q: 我有多个电脑怎么办？ ###

A: 每台电脑生成自己的 SSH Key，并分别添加到 GitHub 的 Signing Keys 中即可。

### Q: 我之前的提交没有签名，怎么办？ ###

A: 你可以使用 rebase 来重新签名过去的提交（注意：这会修改提交 Hash，只能在未合并的分支上操作）：

```bash
git rebase -i HEAD~n --exec 'git commit --amend --no-edit -S'
```

## 小结 ##

配置 Git 签名是迈向专业开发者的重要一步，它不仅保护了你的身份，也是对项目安全负责的体现。建议所有开发者都开启全局 SSH 签名配置。
