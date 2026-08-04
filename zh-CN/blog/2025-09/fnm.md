---
lastUpdated: true
commentabled: true
recommended: true
title: fnm 简介及使用
description: 管理不同项目nodejs版本
date: 2025-09-30 11:00:00 
pageClass: blog-page-class
cover: /covers/platform.svg
---

## FNM 简介 ##

一个快速、简单的 Node.js 版本管理工具，支持多版本切换、环境变量配置和镜像加速等功能。

## 常用命令 ##

| 命令 |  缩写 | 功能描述 |
| :-----------: | :-----------: | :-----------: |
| ​list-remote |  ​​ls-remote | ​列出所有远程可安装的 Node.js 版本 |
| ​list​ |  ​ls | ​列出本地已安装的 Node.js 版本 |
| ​install​ |  ​i | ​安装指定版本的 Node.js |
| ​use |  ​- | 切换到指定版本（临时生效） |
| ​default |  ​- | 设置默认版本（永久生效） |
| ​current |  ​- | 显示当前使用的 Node.js 版本 |
| ​uninstall​​ |  uni | ​卸载指定版本 |
| ​exec​ |  - | 在 fnm 上下文中运行命令（如 `fnm exec -- npm test`​） |
| ​env |  ​- | 生成环境变量配置（需配合 `eval`​ 使用） |
| ​alias |  ​- | 给版本设置别名（如 `fnm alias 18.0.0 latest` ​） |
| ​unalias |  ​- | 删除别名 |

## 常用选项 ##

| 选项 |  说明​ |
| :-----------: | :-----------: |
| `--node-dist-mirror` |  ​自定义 Node.js 下载镜像（默认：`nodejs.org/dist`​） |
| `​--fnm-dir` |  ​指定 fnm 安装根目录（通过环境变量 `FNM_DIR`​ 设置） |
| `​--arch` |  ​覆盖 Node 二进制文件的架构（如 x86​, arm64​） |
| `​--log-level` |  ​设置日志级别（可选：quiet​, error​, info​） |
| `​--corepack-enabled` |  ​为每个新安装的 Node.js 启用 Corepack |
| `​--resolve-engines` |  ​自动解析 `package.json`​ 中的 `engines.node`​ 版本（默认开启） |

## 基础用法示例 ##

**安装指定版本**：

```bash
fnm install 18.0.0     # 安装 18.0.0
fnm i 20 --latest     # 安装 20.x 最新版本
```

**版本切换**：

```bash
fnm use 18.0.0        # 临时切换到 18.0.0
fnm default 20.0.0    # 设置默认版本
```

**列出版本**：

```bash
fnm list-remote       # 查看所有远程版本
fnm ls                # 查看本地已安装版本
```

**卸载版本**：

```bash
fnm uninstall 18.0.0
```

**通过 package.json​ 自动切换版本（需启用 `--resolve-engines`​）**：

```bash
cd /project          # 项目目录包含 `package.json` 时自动切换
```

**配置 Shell 环境（如 Bash/Zsh）**：

```bash
eval "$(fnm env)"    # 初始化 fnm 环境变量
```

## 高级配置 ##

**镜像加速（国内用户推荐）**：

```bash
export FNM_NODE_DIST_MIRROR=https://npmmirror.com/mirrors/node/
```

**自动切换目录版本**：

```bash
# 在项目目录创建 `.node-version` 或 `.nvmrc` 文件
echo "18.0.0" > .node-version
```

**禁用 engines.node​ 解析**：

```bash
fnm install --resolve-engines=false
```

## 其他命令 ##

- `​fnm completions`​：生成 Shell 自动补全脚本。

- `​fnm help` ​：查看子命令帮助（如 `fnm help install`​）。

### `fnm help` 翻译 ###

```txt
A fast and simple Node.js manager

Usage: fnm [OPTIONS] <COMMAND>

Commands:
  list-remote  List all remote Node.js versions [aliases: ls-remote]
  list         List all locally installed Node.js versions [aliases: ls]
  install      Install a new Node.js version [aliases: i]
  use          Change Node.js version
  env          Print and set up required environment variables for fnm
  completions  Print shell completions to stdout
  alias        Alias a version to a common name
  unalias      Remove an alias definition
  default      Set a version as the default version
  current      Print the current Node.js version
  exec         Run a command within fnm context
  uninstall    Uninstall a Node.js version [aliases: uni]
  help         Print this message or the help of the given subcommand(s)

Options:
      --node-dist-mirror <NODE_DIST_MIRROR>
          <https://nodejs.org/dist/> mirror

          [env: FNM_NODE_DIST_MIRROR]
          [default: https://nodejs.org/dist]

      --fnm-dir <BASE_DIR>
          The root directory of fnm installations

          [env: FNM_DIR]

      --log-level <LOG_LEVEL>
          The log level of fnm commands

          [env: FNM_LOGLEVEL]
          [default: info]
          [possible values: quiet, error, info]

      --arch <ARCH>
          Override the architecture of the installed Node binary. Defaults to arch of fnm binary

          [env: FNM_ARCH]

      --version-file-strategy <VERSION_FILE_STRATEGY>
          A strategy for how to resolve the Node version. Used whenever `fnm use` or `fnm install` is called without a version, or when `--use-on-cd` is configured on evaluation

          [env: FNM_VERSION_FILE_STRATEGY]
          [default: local]

          Possible values:
          - local:     Use the local version of Node defined within the current directory
          - recursive: Use the version of Node defined within the current directory and all parent directories

      --corepack-enabled
          Enable corepack support for each new installation. This will make fnm call `corepack enable` on every Node.js installation. For more information about corepack see <https://nodejs.org/api/corepack.html>

          [env: FNM_COREPACK_ENABLED]

      --resolve-engines [<RESOLVE_ENGINES>]
          Resolve `engines.node` field in `package.json` whenever a `.node-version` or `.nvmrc` file is not present.
          This feature is enabled by default. To disable it, provide `--resolve-engines=false`.

          Note: `engines.node` can be any semver range, with the latest satisfying version being resolved.
          Note 2: If you disable it, please open an issue on GitHub describing _why_ you disabled it.
                  In the future, disabling it might be a no-op, so it's worth knowing any reason to
                  do that.

          [env: FNM_RESOLVE_ENGINES]
          [possible values: true, false]

  -h, --help
          Print help (see a summary with '-h')

  -V, --version
          Print version
```

```txt
一个快速简单的 Node.js 管理器

用法：fnm [选项] <命令>

命令：
  list-remote  列出所有远程的 Node.js 版本 [别名: ls-remote]
  list         列出所有本地安装的 Node.js 版本 [别名: ls]
  install      安装一个新的 Node.js 版本 [别名: i]
  use          更改 Node.js 版本
  env          打印并设置 fnm 所需的环境变量
  completions  打印 shell 补全到标准输出
  alias        将一个版本别名为一个常用名称
  unalias      删除一个别名定义
  default      设置一个版本为默认版本
  current      打印当前的 Node.js 版本
  exec         在 fnm 上下文中运行一个命令
  uninstall    卸载一个 Node.js 版本 [别名: uni]
  help         打印此消息或给定子命令的帮助信息

选项：
      --node-dist-mirror <NODE_DIST_MIRROR>
          <https://nodejs.org/dist/> 的镜像地址

          [环境变量: FNM_NODE_DIST_MIRROR]
          [默认值: https://nodejs.org/dist]

      --fnm-dir <BASE_DIR>
          fnm 安装的根目录

          [环境变量: FNM_DIR]

      --log-level <LOG_LEVEL>
          fnm 命令的日志级别

          [环境变量: FNM_LOGLEVEL]
          [默认值: info]
          [可能的值: quiet, error, info]

      --arch <ARCH>
          覆盖安装的 Node 二进制文件的架构。默认使用 fnm 二进制文件的架构

          [环境变量: FNM_ARCH]

      --version-file-strategy <VERSION_FILE_STRATEGY>
          用于解析 Node 版本的策略。每次调用 `fnm use` 或 `fnm install` 而没有指定版本，或者当 `--use-on-cd` 配置启用时使用。

          [环境变量: FNM_VERSION_FILE_STRATEGY]
          [默认值: local]

          可能的值：
          - local:     使用当前目录中定义的本地 Node 版本
          - recursive: 使用当前目录和所有父目录中定义的 Node 版本

      --corepack-enabled
          启用每个新安装的 corepack 支持。这将导致 fnm 在每次安装 Node.js 时调用 `corepack enable`。有关 corepack 的更多信息，请参见 <https://nodejs.org/api/corepack.html>

          [环境变量: FNM_COREPACK_ENABLED]

      --resolve-engines [<RESOLVE_ENGINES>]
          每当没有 `.node-version` 或 `.nvmrc` 文件时解析 `package.json` 中的 `engines.node` 字段。
          此功能默认启用。要禁用它，请提供 `--resolve-engines=false`。

          注意：`engines.node` 可以是任何 semver 范围，会解析最新满足的版本。
          注意 2：如果您禁用了它，请在 GitHub 上打开一个 issue 描述 _为什么_ 禁用了它。
                  未来，禁用它可能不会有任何效果，因此了解您这样做的原因是有价值的。

          [环境变量: FNM_RESOLVE_ENGINES]
          [可能的值: true, false]

  -h, --help
          打印帮助（使用 '-h' 查看摘要）

  -V, --version
          打印版本
```

> 刚开始使用nvm进行nodejs版本管理，但是老旧项目同时维护，版本切来切去，十分麻烦。

## Window 下安装 fnm ##

- 设置全局默认版本
- 为版本设置别名，以便随意调用
- 为当前 shell 窗口临时切换 node 版本
- 使用 `.node-version` 文件为项目配置默认版本以自动切换

## 安装 chocolatey ##

```bash
# 必须使用powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
```

## 安装 fnm ##

```bash
# 安装
choco install fnm
# 测试是否成功
fnm -h
```

## 环境变量配置 ##

### Powershell ###

```bash
%USERPROFILE%\Documents\WindowsPowerShell\profile.ps1  
  
# 文件内容  
fnm env --use-on-cd | Out-String | Invoke-Expression
```

`%USERPROFILE%:` 表示用户目录，直接在文件管理的地址栏输入 `%USERPROFILE%`，然后回车

> WindowsPowerShell 为新建的目录, 如果安装 node 后命令仍然无法识别，将文件夹名称改为 PowerShell

### cmd ###

1. 搜索 cmd
2. 打开文件所在位置
3. 对 “命令提示符” 右键，点击属性
4. 修改 目标 为下面的值

```shell
%windir%\system32\cmd.exe /k %USERPROFILE%\bashrc.cmd
```

5.  进入用户目录(`%USERPROFILE%`)，添加文件 `bashrc.cmd`
6.  将下面的代码写入到上面的配置文件里面

```bash
@echo off
FOR /f "tokens=*" %%z IN ('fnm env --use-on-cd') DO CALL %%z
```

### git bash ###

**linux 或者 mac 中**

```bash
# 进入用户目录
cd ~
```

然后找到 `.bash_profile` 文件

**windows 中**

进入用户目录(`%USERPROFILE%`)，新建文件 `.bash_profile`

**将下面代码粘贴到 `.bash_profile` 中**

```bash
eval $(fnm env | sed 1d)
export PATH=$(cygpath $FNM_MULTISHELL_PATH):$PATH

if [[ -f .node-version || -f .nvmrc ]]; then
   fnm use
fi
```

## fnm 使用 ##

### 安装 NodeJS ###

```bash
fnm install 16
fnm install 14
fnm install 12
# 默认从官方下载，如果慢，可以如下操作
fnm install 16 --node-dist-mirror=https://npmmirror.com/mirrors/node
```

### 使用 NodeJS ###

```bash
# 在当前控制台中切换nodejs 版本
fnm use 18
# 全局设置nodejs版本
fnm default 18
```

### fnm 切换 node 默认版本 ###

```bash
# 全局设置
fnm default 14
```

## 在特定项目中自动切换 nodejs 版本 ##

当某个项目和默认node版本不一致，想持久化node版本，但是又不想影响全局node版本时，可以如下操作。
在特定项目根目录执行如下命令，或者手动创建 `.node-version` 文件，内容是nodejs版本号

```bash
echo '18' > .node-version
```

这样，当 `.node-version` 版本号和默认版本不一致时，会自动切换到当前版本。
