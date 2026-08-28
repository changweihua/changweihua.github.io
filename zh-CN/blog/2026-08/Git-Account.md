---
lastUpdated: true
commentabled: true
recommended: true
title: Git 多账号按域名/目录自动切换身份的终极指南
description: Git 多账号按域名/目录自动切换身份的终极指南
date: 2026-08-28 11:15:00
pageClass: blog-page-class
cover: /covers/git.svg
---

> 你有没有遇到过这种尴尬——公司代码提交后显示的是私人邮箱，或者开源项目提交用了公司账号？这篇教程彻底解决这个问题。

## Git 全局配置文件在哪？ ##

Git 的全局配置文件位于你的用户主目录下：

| 系统 | 路径 |
| :--- | :--- |
| macOS / Linux | `~/.gitconfig` |
| Windows | `C:\Users\你的用户名\.gitconfig` |

快速查看当前配置：

```bash
cat ~/.gitconfig
```

或者用命令列出所有全局配置：

```bash
git config --global --list
```

## 核心原理：includeIf 条件配置 ##

Git 支持通过 `includeIf` 指令，根据条件自动加载不同的配置文件。我们利用这个特性来实现按域名或目录切换身份。

## 方式一：按目标仓库 URL 匹配（推荐） ##

适合场景：不管代码放在哪个目录，只要是某个平台（如公司 GitLab）的仓库，就自动使用对应身份。

### 第 1 步：创建独立配置文件 ###

为公司账号创建一个配置文件：

```bash
# 创建公司专用配置
touch ~/.gitconfig-work
```

编辑 `~/.gitconfig-work`，写入公司身份：

```ini
[user]
name = 张三（公司名）
email = zhangsan@company.com
```

为个人账号再创建一个：

```bash
touch ~/.gitconfig-personal
```

编辑 `~/.gitconfig-personal`：

```ini
[user]
name = 张三
email = zhangsan@gmail.com
```

### 第 2 步：在全局配置中设置匹配规则 ###

编辑 `~/.gitconfig`，添加 `includeIf` 规则：

```ini
# 默认身份（兜底）
[user]
name = 张三
email = zhangsan@gmail.com

# 匹配公司 GitLab 域名 → 使用公司身份
[includeIf "hasconfig:remote.*.url:https://gitlab.company.com/**"]
path = ~/.gitconfig-work

# 匹配 GitHub → 使用个人身份
[includeIf "hasconfig:remote.*.url:https://github.com/**"]
path = ~/.gitconfig-personal
```

> 注意：`hasconfig:remote.*.url` 需要 Git 2.36+ 版本支持。
>
> 检查版本：git --version


## 方式二：按目录路径匹配 ##

适合场景：公司项目统一放在 `~/work/` 目录，个人项目放在 `~/personal/` 目录。

### 第 1 步：整理你的项目目录结构 ###

```txt
~/
├── work/          ← 公司所有项目放这里
│   ├── project-a/
│   └── project-b/
└── personal/      ← 个人项目放这里
    ├── blog/
    └── side-project/
```

### 第 2 步：配置目录匹配规则 ###

编辑 `~/.gitconfig`：

```ini
# 默认身份（兜底）
[user]
    name = 张三
    email = zhangsan@gmail.com

# 在 ~/work/ 目录下 → 自动切换为公司身份
[includeIf "gitdir:~/work/"]
    path = ~/.gitconfig-work

# 在 ~/personal/ 目录下 → 自动切换为个人身份
[includeIf "gitdir:~/personal/"]
    path = ~/.gitconfig-personal
```

> 路径末尾必须加 `/`，表示匹配该目录及所有子目录。

## 验证是否生效 ##

进入某个仓库目录，执行：

```bash
cd ~/work/project-a
git config user.name
git config user.email
```

输出应该是公司身份。再切换到个人项目目录验证：

```bash
cd ~/personal/blog
git config user.name
git config user.email
```

输出应该是个人身份。

## 两种方式对比 ##

| 维度 | 按 URL 匹配 | 按目录匹配 |
| :--- | :--- | :--- |
| 优点 | 与目录结构无关，更灵活 | 简单直观，不依赖 Git 版本 |
| 缺点 | 需要 Git 2.36+ | 需要严格管理目录结构 |
| 适合 | 项目散落各处的情况 | 有良好目录习惯的情况 |

## 快速备忘 ##

```bash
# 查看当前仓库生效的用户信息
git config user.name
git config user.email

# 查看全局配置文件路径
git config --global --edit

# 检查 Git 版本
git --version
```

> 配置一次，从此再也不用担心身份搞混！
