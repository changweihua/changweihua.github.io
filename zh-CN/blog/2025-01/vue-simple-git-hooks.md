---
lastUpdated: true
commentabled: true
recommended: true
title: 用simple-git-hooks防止提交不合规代码
description: 用simple-git-hooks防止提交不合规代码
date: 2025-01-03 10:18:00
pageClass: blog-page-class
---

# 用simple-git-hooks防止提交不合规代码 #

## 认识 git hooks ##

在学习这个库之前，我们先要知道什么是git hooks，git hooks其实很好理解，它和Vue的生命周期钩子函数类似，所谓hooks就是一些shell脚本，会在Git的某些事件发生时被触发执行，比如在我们进行git commit操作前就会触发 pre-commit 钩子函数执行。

Git Hooks主要分为`客户端hooks`和`服务端hooks`两大类，客户端就是我们个人电脑，服务端就是远程Git仓库。

### 客户端hooks ###

- `pre-commit`：在执行git commit命令但在生成提交对象之前被触发。通常可以用来检查代码格式，比如为了防止大家提交的代码格式不规范，我们在提交代码之前强制进行eslint校验。
- `commit-msg`：在提交信息编辑器启动之前被调用，可以用来检查提交信息的格式。
- `pre-push`：在git push命令发送数据到远程仓库之前被触发，可以用来自动运行测试用例等。

### 服务端hooks ###

- `pre-receive`：在接收推送数据之前被调用，可以用来验证推送的引用是否合法。
- `update`：在更新某个引用之前被调用，可以为每一个准备更新的分支各运行一次。
- `post-receive`：在接收并处理完数据后被触发，可以用来更新其他系统服务或通知用户。

现在我们来看看Git Hooks长什么样。

首先我们创建一个测试仓库：

```bash
mkdir git-hooks-study
cd git-hooks-study
git init
```

默认情况下，Git Hooks会放在 `.git/hooks` 目录下，我们可以看到里面有一些默认的钩子脚本示例。

```bash
# 查看默认的钩子脚本示例
ls .git/hooks
```

不出意外我们可以看到很多名为 `.sample` 的hooks示例

![预览图](/images/QQ截图20250103091259.png){class="flex items-center justify-center"}

比如我们来看看 `pre-commit`  钩子脚本长什么样：

```bash
#!/bin/sh
#
# An example hook script to verify what is about to be committed.
# Called by "git commit" with no arguments.  The hook should
# exit with non-zero status after issuing an appropriate message if
# it wants to stop the commit.
#
# To enable this hook, rename this file to "pre-commit".

if git rev-parse --verify HEAD >/dev/null 2>&1
then
        against=HEAD
else
        # Initial commit: diff against an empty tree object
        against=$(git hash-object -t tree /dev/null)
fi

# If you want to allow non-ASCII filenames set this variable to true.
allownonascii=$(git config --type=bool hooks.allownonascii)

# Redirect output to stderr.
exec 1>&2

# Cross platform projects tend to avoid non-ASCII filenames; prevent
# them from being added to the repository. We exploit the fact that the
# printable range starts at the space character and ends with tilde.
if [ "$allownonascii" != "true" ] &&
        # Note that the use of brackets around a tr range is ok here, (it's
        # even required, for portability to Solaris 10's /usr/bin/tr), since
        # the square bracket bytes happen to fall in the designated range.
        test $(git diff --cached --name-only --diff-filter=A -z $against |
          LC_ALL=C tr -d '[ -~]\0' | wc -c) != 0
then
        cat <<\EOF
Error: Attempt to add a non-ASCII file name.

This can cause problems if you want to work with people on other platforms.

To be portable it is advisable to rename the file.

If you know what you are doing you can disable this check using:

  git config hooks.allownonascii true
EOF
        exit 1
fi

# If there are whitespace errors, print the offending file names and fail.
```

可以看到，这其实就是一个shell脚本，我们可以在里面编写一些逻辑来满足我们的需求，不过我们自己编写这个脚本比较麻烦，而且也不好在团队成员之间共享这些脚本(.git是隐藏文件)，这就有了simple-git-hooks。

## simple-git-hooks ##

simple-git-hooks是一个轻量级且易于配置的Git钩子管理工具，在安装之前我们先弄个测试项目，比如我们来搭建一个最简单的支持eslint的项目，后面我们通过simple-git-hooks来实现commit之前进行eslint检查。

在上面我们创建的`git-hooks-study`目录中执行以下命令，创建一个简单的eslint项目：

```bash
# 首先初始化npm项目，然后一路回车即可
npm init

# 安装eslint
npm install eslint --save-dev
```

接下来创建eslint的配置文件 `eslint.config.mjs`，增加一条配置，当有未使用的变量时报错

```javascript
//eslint.config.mjs文件
export default [
  {
    rules: {
      "no-unused-vars": "error"
    }
  }
];
```

接下来创建一个测试文件 test1.js，在里面故意写一个未使用的变量：

```javascript
//test1.js
let a = 1;
```

现在我们在控制台执行 npx eslint，不出意外，我们会看到有错误提示。

现在我们进行commit 操作，不出意外可以正常进行，并不会被拦截。

```bash
git add .
git commit -m "test"
```

这不符合我们预期，我们想在commit之前进行eslint校验，如果校验不通过则阻止提交。

接下来我们安装`simple-git-hooks`库：

```bash
npm install simple-git-hooks --save-dev
```

修改我们的package.json文件，里面增加以下配置：

```json
{
  "simple-git-hooks": {
    "pre-commit": "npx eslint ."
  }
}
```

这里就是在配置git hooks，key就是hooks名称，值就是要执行的命令，现在我们只是修改了package.json文件，接下来还要真正的生成git hooks，执行以下命令：

```bash
npx simple-git-hooks

# 看看命令是否生效
ls .git/hooks
```

可以看到现在在 .git/hooks 目录下生成了 pre-commit 文件

pre-commit内容如下，可以看到，里面确实执行了我们配置的 npx eslint . 命令。

```bash
#!/bin/sh

if [ "$SKIP_SIMPLE_GIT_HOOKS" = "1" ]; then
    echo "[INFO] SKIP_SIMPLE_GIT_HOOKS is set to 1, skipping hook."
    exit 0
fi

if [ -f "$SIMPLE_GIT_HOOKS_RC" ]; then
    . "$SIMPLE_GIT_HOOKS_RC"
fi

npx eslint .%  
```

现在修改我们的test1.js文件，比如把变量值改为2，然后再次执行git commit操作，不出意外报错了，commit操作被阻止了。

接下来我们构造另外一个场景：

先把test1.js文件强制commit下，可以把package.json中simple-git-hooks的配置改为空。

```json
{
  "simple-git-hooks": {

  }
}
```

```bash
npx simple-git-hooks
git add .
git commit -m "test"
```

再把package.json中simple-git-hooks的配置改回来，别忘记`npx simple-git-hooks`重新生成hooks。

```json
{
  "simple-git-hooks": {
    "pre-commit": "npx eslint ."
  }
}
```

新增一个test2.js文件，故意写一个未使用的变量，然后执行commit 操作看看发生了什么。

可以看到，虽然本次我只修改了test2.js文件，但是还是会对原来已经提交的test1.js进行eslint检查。

如果我们的项目很大，这样会产生很多耗时较长且不必要的检查，我们其实只想对本次git add 的文件发起检查，这时候lint-staged这个库就派上用场了。

## lint-staged ##

lint-staged是一个在Git暂存文件上运行linters（代码检查工具）的开源工具。 比如上面我们进行了 git add test2.js 操作，我们只希望对test2.js进行eslint检查（npx eslint test2.js），而不是对整个项目进行检查。

接下来我们需要安装lint-staged：

```bash
npm install lint-staged --save-dev
```

然后在package.json中增加一个字段 lint-staged，同时修改pre-commit钩子函数，改为在commit之前执行 npx lint-staged 命令。

```json
{
  "simple-git-hooks": {
    "pre-commit": "npx lint-staged"
  },
  "lint-staged": {
    "*.js": "npx eslint"
  }
}
```

在lint-staged的配置中，我们可以指明对某种文件进行某种操作，比如上面，我们对所有暂存的js文件执行eslint检查。

别忘记通过  npx simple-git-hooks 命令更新hooks。

好了，现在我们再次执行git commit操作，会发现只有test2.js文件被检查了。

这样就能让commit前置检查更加高效了。

## 总结 ##

- git hooks让我们有机会在git操作时执行自定义脚本
- 使用simple-git-hooks库可以很方便地生成这些脚本
- 使用lint-staged可以只对暂存的特定文件进行某种操作

