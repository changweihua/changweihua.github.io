---
lastUpdated: true
commentabled: true
recommended: false
title: Git使用小技巧：解除已被跟踪的文件
description: Git使用小技巧：解除已被跟踪的文件
date: 2024-03-27
---


# Git使用小技巧：解除已被跟踪的文件 #

---

> 当我们在使用git进行版本控制以及跟踪代码的时候，有一些文件是我们并不希望跟踪的，例如那些IDE的配置文件，例如Jetbrains家的.idea文件夹、Vscode的.vscode文件夹。他们包含了很多针对开发计算机的配置文件，例如python解释器的名称、路径、IDE的外观主题设置等等，如果我们需要进行协作开发或者多设备同步代码的时候，这些文件可能会干扰到我们其他设备上的正常配置，而且看起来也很不舒服.

所以我们需要去使用.gitignore文件来对这些文件或者文件夹进行忽略，让他们不参与commit & push。

一般的.gitignore文件都是这样的：

```json
  node_modules
  .temp
  .cache
  .vitepress/dist
  .vitepress/.temp
  .vitepress/cache
  ssj2
  A320
```

里面就只有要忽略的文件夹，就可以了

那么问题就来了，像我这样的一开始没有使用git进行版本控制，而且也不知道可以使用`.gitignore`文件进行忽略，已经将这些文件进行跟踪上传了，应该怎么样去取消跟踪呢？

### 使用Git取消跟踪目录 ###

1. 使用`cd`定位到`git`仓库的目录
2. 添加`.gitignore`文件规则（因为我们的目的就是为了取消对文件夹的跟踪）
3. 在终端中执行`git rm --cached <filename>`命令（for standalone files）或者`git rm --cached -r <directoryName>`（for directory）进行取消跟踪（我个人理解commit了一个规则，创建了一个提交对象，来告诉git服务器别跟踪了）
4. 所有`git`操作的目的肯定都是为了最后的`push`，我们直接进行`push`操作，在终端执行`git commit -m "Untrack <xxx>"`即可。
