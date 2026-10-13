---
lastUpdated: true
commentabled: true
recommended: true
title: GitHub Actions 工作流 CI/CD 触发器与执行顺序
description: GitHub Actions 工作流 CI/CD 触发器与执行顺序
date: 2026-10-12 10:35:00
pageClass: blog-page-class
cover: /covers/git.svg
---

## 先理解 GitHub Actions 是怎么工作的 ##

可以把 GitHub Actions 理解成 GitHub 提供的一套自动化执行系统。

你平时可能会这样操作：

1. 修改项目代码。
2. 把代码提交到 Git。
3. 将代码推送到 GitHub。
4. 手动构建 Docker 镜像。
5. 把镜像推送到阿里云 ACR。
6. 登录服务器，更新容器。

GitHub Actions 的作用，就是把这些步骤写进配置文件，让 GitHub 在指定的条件满足时，自动执行这些任务。

*整体过程如下*：

```mermaid
flowchart TD
    A["发生某个事件\n例如 push、Pull Request、定时任务"] --&gt; B["匹配 Workflow 的触发条件\n检查事件类型、分支、路径等规则"]
    B --&gt; C["创建一次 Workflow 运行\nGitHub 根据 Jobs 安排执行任务"]
    C --&gt; D["启动 Runner 执行 Jobs\nRunner 是实际运行命令的执行环境"]
    D --&gt; E["测试 → 构建 → 推送 → 部署\n具体执行哪些步骤，由你的配置文件决定"]
```

这里要先区分三个概念：

| 名称 | 含义 | 举例 |
| :--- | :--- | :--- |
| Event（事件） | 什么事情发生了 | 推送代码到 `main` |
| Workflow（工作流） | 一份自动化任务配置 | `docker-ci.yml` |
| Runner（执行器） | 实际运行命令的机器或环境 | `ubuntu-latest` |

*最重要的一点：GitHub Actions 不会因为你修改了本地代码就自动启动。* 它需要 GitHub 收到符合条件的事件，或者有人手动触发等符合配置的触发方式。

## GitHub Actions 到底在什么情况下启动？ ##

控制触发条件的主要配置是 `on`。

例如：

```yml
name: File Server CI/CD

on:
  push:
    branches:
      - main
```

这段配置的意思是：

> 当有代码推送到 main 分支时，触发这个 Workflow。

注意，这里不是说只有你本人推送才触发。只要 GitHub 收到符合条件的 `push` 事件，就可能触发；推送者可以是你，也可以是其他有权限的人或自动化程序。

### push：推送代码时触发 ###

例如你本地执行：

```bash
git add .
git commit -m "Update upload feature"
git push origin main
```

过程是：

1. 本地修改代码。
2. git commit 创建本地提交。
3. git push 把提交推送到 GitHub。
4. GitHub 收到 push 事件。
5. 检查 Workflow 的 on.push 条件。
6. 如果条件匹配，创建一次 Workflow 运行。

但如果配置是：

```yml
on:
  push:
    branches:
      - main
```

你推送到 dev 分支，就不会因为这条规则触发。

还有一个容易忽略的细节：路径过滤

```yml
on:
  push:
    branches:
      - main
    paths:
      - "src/**"
      - "Dockerfile"
```

这意味着要同时满足：

- 推送目标分支是 main；
- 本次推送涉及的文件路径符合 `src/**` 或 `Dockerfile`。

比如，只修改 `README.md`，就不会匹配这条 push 规则。

路径过滤适合大型项目，避免修改文档也重新构建所有镜像。不过，如果你给 Dockerfile、依赖文件或 Workflow 自身设置了不完整的路径规则，也可能漏掉本来应该执行的构建。

### pull_request：有人创建或更新 Pull Request 时触发 ###

例如：

```yml
on:
  pull_request:
    branches:
      - main
```

这里的 `branches: main` 指的是 Pull Request 的目标分支，不是你创建分支时所在的源分支。

假设：

```txt
feature/upload  ──────┐
                      ├── Pull Request → main
feature/login   ──────┘
```

有人创建一个从 `feature/upload` 合并到 main 的 Pull Request，或者向这个 PR 对应的分支继续推送提交，都可能触发检查。

常见用途：

- 检查代码能否编译。
- 执行单元测试。
- 构建 Docker 镜像，验证 Dockerfile 是否有效。
- 在合并到 `main` 之前拦截错误。

通常推荐把流程分成两类：

- PR 阶段： 测试和验证，不直接部署生产环境。
- 合并或推送到 `main` 后： 发布正式镜像，再决定是否部署。

这样可以避免一段尚未审核的代码直接影响正在运行的文件服务器。

### workflow_dispatch：手动启动 ###

配置：

```yml
on:
  workflow_dispatch:
```

它允许你在 GitHub 仓库的 Actions 页面手动启动工作流。

*常见用途*：

- 重新构建镜像。
- 手动发布指定版本。
- 重新执行部署。
- 执行维护任务。

还可以设置手动输入参数，例如选择发布版本。但要注意，输入参数只是数据，不会自动改变部署逻辑；你需要在 Workflow 中明确使用它们。

还有一个小细节：手动启动的 Workflow 文件通常需要存在于仓库的默认分支中，才能正常从 Actions 页面触发。

### schedule：定时启动 ###

例如：

```yml
on:
  schedule:
    - cron: "0 2 * * *"
```

这是一个 Cron 表达式，表示每天在 UTC 时间 02:00 运行。

如果你的服务器或团队按北京时间工作，记得转换时区。北京时间是 UTC+8，所以这个例子对应北京时间每天上午 10:00。

定时任务适合：

- 定期检查依赖。
- 清理构建缓存。
- 检查外部服务。
- 定时同步镜像。

不过，GitHub Actions 的定时任务可能延迟执行，并不适合要求秒级精度的调度。

### tags：发布版本时触发 ###

例如：

```yml
on:
  push:
    tags:
      - "v*"
```

当推送符合 `v*` 的标签时，例如：

```txt
git tag v1.0.0
git push origin v1.0.0
```

就会触发匹配的工作流。

这种方式适合正式版本发布：

```txt
v1.0.0 → 构建镜像 → 推送 ACR → 部署
v1.1.0 → 构建镜像 → 推送 ACR → 部署
```

但请注意，Git 标签和 Docker 镜像标签是两个不同的东西。前者标记 Git 中的代码版本，后者标记镜像仓库中的镜像。你需要在工作流中把它们关联起来。

### 一个 Workflow 可以配置多个触发条件 ###

例如：

```yml
on:
  push:
    branches:
      - main

  pull_request:
    branches:
      - main

  workflow_dispatch:
```

这表示同一份 Workflow 可以由三种不同事件启动：

- 向 main 推送代码。
- 向 main 提交或更新 PR。
- 人工点击运行。

但这并不意味着三种情况都会执行完全相同的操作。你可以通过 if、事件类型判断、分支判断等方式决定是否发布或部署。

例如，PR 适合执行测试，而生产部署通常应限制在可信的分支或受保护的发布环境中。

## 启动之后，代码到底按照什么顺序执行？ ##

这是整个 GitHub Actions 最值得理解的部分。

一个 Workflow 的结构通常是：

```txt
Workflow
├── Job A
│   ├── Step 1
│   ├── Step 2
│   └── Step 3
├── Job B
│   ├── Step 1
│   └── Step 2
└── Job C
    ├── Step 1
    └── Step 2
```

这里有两个不同层次的执行规则：

- Job 内部的 Step： 默认按配置顺序依次执行。
- Job 与 Job 之间： 默认可以并行执行；如果设置了 needs，则按依赖关系执行。

这两个规则一定要分开理解。

### 同一个 Job 内部：Step 按顺序执行 ###

看这个例子：

```yml
jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Show files
        run: ls -la

      - name: Build image
        run: docker build -t file-server:latest .

      - name: Show result
        run: docker images
```

执行顺序是固定的：

```mermaid
flowchart TD
    S1["1. Checkout\n把仓库代码检出到 Runner 工作目录。"]
    --&gt; S2["2. Show files\n列出当前目录的文件，确认代码是否存在。"]
    --&gt; S3["3. Build image\n读取 Dockerfile，尝试构建镜像。"]
    --&gt; S4["4. Show result\n列出已构建的镜像。"]
```


为什么 `Checkout` 通常要放在前面？

因为后面的步骤要读取仓库中的 Dockerfile、源代码和配置文件。如果没有检出代码，Runner 的工作目录通常没有你的项目文件，后续构建就可能失败。

`uses` 和 `run` 也有区别：

```yml
- uses: actions/checkout@v4
```

表示使用一个现成的 Action。

```yml
- run: docker build -t file-server:latest .
```

表示让 Runner 的 Shell 执行一条命令。

它们都是 Step，并且默认遵守同一套顺序规则。

### 如果某个 Step 失败，后面的 Step 怎么办？ ###

继续看：

```yml
steps:
  - name: Step A
    run: echo "A"

  - name: Step B
    run: exit 1

  - name: Step C
    run: echo "C"
```

执行结果：

| Step | 结果 |
| :--- | :--- |
| Step A | 成功 |
| Step B | 失败，退出码为 `1` |
| Step C | 默认跳过 |

为什么？

GitHub Actions 默认会跳过后续那些因为前面失败而不应继续执行的普通步骤。

这里的 `exit 1` 是主动返回失败状态。一般来说，Shell 命令返回 0 表示成功，非零值表示失败。

但不是所有失败都会让整个流程永久终止。你可以通过条件表达式明确规定后续动作。

例如，失败后仍然收集日志：

```yml
- name: Run tests
  run: ./run-tests.sh

- name: Collect logs
  if: ${{ failure() }}
  run: ./collect-logs.sh
```

这样，即使测试失败，日志收集步骤仍然可以执行。

另外，`continue-on-error: true` 可以让某个步骤的失败不按普通失败方式阻断后续流程。不过，这会改变失败状态的处理方式，不能随便用在生产发布的关键步骤上。

### 不同 Job 之间：默认可以并行执行 ###

假设你写了：

```yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Run tests"

  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Build image"

  lint:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Check code style"
```

这三个 Job 之间没有依赖关系。

GitHub Actions 可以在有可用 Runner 和并发额度时，让它们并行执行，而不是保证 `test` 一定先于 `build`。

可能的执行顺序是：

```txt
test  ─────────────── 完成
build ─────── 完成
lint  ────────── 完成
```

也可能是另一种顺序。

注意：*可以并行，不代表一定同时运行*。 并发限制、Runner 可用性和排队情况都会影响实际开始时间。

如果你要求先测试、再构建、最后部署，就不能只依靠 YAML 中的书写顺序。

你需要用 `needs` 明确表达依赖关系。

### needs：决定 Job 之间的先后顺序 ###

这是 CI/CD 中最重要的配置之一。

例如：

```yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo "1. Test"

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: echo "2. Build image"

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: echo "3. Deploy"
```

这次执行顺序就被明确规定了：

```mermaid
flowchart TD
    T["Job: test\n测试代码"] --&gt; B["Job: build\n等待 test 成功后才执行"]
    B --&gt; D["Job: deploy\n等待 build 成功后才执行"]
```

这里的关键是：

```yml
needs: test
```

它表示当前 Job 依赖 test。在没有覆盖默认条件的情况下，依赖 Job 必须成功，当前 Job 才会执行。

如果 `test` 失败：

- test：失败。
- build：跳过。
- deploy：跳过。

这就是为什么生产环境通常应该设计成：

> 测试成功 → 构建成功 → 镜像推送成功 → 部署 → 健康检查。

不应该出现测试失败了，却仍然把新版本发布到生产环境的情况。

如果多个 Job 都依赖同一个 Job 呢？

```yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Test"

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: echo "Build"

  security:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: echo "Security scan"

  deploy:
    needs: [build, security]
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploy"
```

执行关系变成：

```mermaid
flowchart TD
    T["test"] --&gt; B["build\n构建镜像"]
    T --&gt; S["security\n安全扫描"]
    B --&gt; D["deploy\n等待 build 和 security 都成功"]
    S --&gt; D
```

`build` 和 `security` 之间没有依赖，因此可以并行执行。

而 `deploy` 使用：

```yml
needs: [build, security]
```

意味着它需要等待两个 Job 都完成，而且在默认条件下，两个 Job 都必须成功。

这就叫 *依赖图（DAG，Directed Acyclic Graph，有向无环图）*。GitHub Actions 根据这张依赖图调度 Job，而不是简单地从上到下逐行执行整个文件。

## 一次完整的 GitHub Actions 运行，时间线是什么样的？ ##

假设你给 `file-server-docker` 配置了以下流程：

```txt
你推送代码到 main
        │
        ▼
GitHub 收到 push 事件
        │
        ▼
匹配 Workflow 的触发条件
        │
        ▼
创建 Workflow 运行
        │
        ▼
Runner 执行 test Job
        │
        ▼
测试成功？
   ┌────┴────┐
   │         │
  失败       成功
   │         │
   ▼         ▼
停止后续    build Job
发布流程       │
               ▼
           构建 Docker 镜像
               │
               ▼
           推送镜像到 ACR
               │
               ▼
           deploy Job
               │
               ▼
           服务器更新容器
               │
               ▼
           健康检查
          ┌────┴────┐
          │         │
         失败       成功
          │         │
          ▼         ▼
        回滚       发布完成
```

这是一个概念性的完整流程。实际配置中，你可以把镜像构建和推送放在同一个 Job，也可以拆成多个 Job；回滚也需要你明确编写脚本或调用相应的部署机制。

## 再补充几个容易搞混的细节 ##

### 每个 Job 的 Runner 不一定是同一台机器 ###

如果你使用：

```yml
runs-on: ubuntu-latest
```

GitHub 会为 Job 分配符合要求的 Runner 环境。

如果 `test`、`build` 和 `deploy` 是不同 Job，不能默认认为它们共享同一个本地文件系统。

例如，`build` Job 生成了一个 `file-server.tar` 文件，后面的 deploy Job 不会自动获得这个文件。你需要使用构建产物（Artifacts）、镜像仓库，或者其他明确的数据传递方式。

对于 Docker 项目，常见方式是：

- 构建 Job 生成镜像。
- 把镜像推送到 ACR。
- 部署 Job 通过服务器拉取同一个镜像版本。

这样，部署环境拿到的是仓库中的镜像，而不是依赖前一个 Runner 的本地状态。

### 同一个仓库的不同 Workflow 也不一定有顺序关系 ###

假设你有两个文件：

```txt
.github/workflows/test.yml
.github/workflows/deploy.yml
```

两者都配置了：

```yml
on:
  push:
    branches:
      - main
```

一次向 `main` 推送的操作可能同时触发这两个 Workflow。

不能认为 `test.yml` 一定先执行，`deploy.yml` 一定后执行。

即使你在 GitHub 仓库里把测试 Workflow 文件放在前面，也不会因此获得执行顺序保证。

如果部署必须依赖测试结果，就应该把测试和部署放在有明确依赖关系的同一工作流中，或者使用 workflow_run 等机制建立跨 Workflow 的触发关系，并谨慎检查触发事件和安全权限。

### 重新运行失败的 Workflow，不代表重新使用最新代码 ###

在 GitHub Actions 中，重新运行一次历史 Workflow，通常会针对原来那次运行关联的提交重新执行，而不是自动切换到仓库最新的提交。

这对排错很有用：你可以确认同一份代码是否由于暂时的网络故障或仓库不可用而失败。

不过，如果你希望部署最新版本，就应该明确选择要发布的提交或镜像版本，而不是把“重新运行旧工作流”当成“发布最新代码”。

### if 可以改变默认执行条件 ###

例如：

```yml
- name: Notify failure
  if: ${{ failure() }}
  run: echo "Something failed"
```

这个步骤在前面的步骤失败时执行，适合发通知或收集日志。

而：

```yml
- name: Always collect diagnostics
  if: ${{ always() }}
  run: echo "Collect diagnostics"
```

会尝试无论之前成功还是失败都执行诊断步骤。但如果 Runner 被强制终止、任务被取消或环境不可用，它仍然不能保证一定运行。

生产部署中不要随意使用 `always()` 覆盖依赖关系，否则可能让原本应该被阻止的后续操作在失败后继续执行。

## 用一个小实验彻底理解执行顺序 ##

你可以直接在测试分支中创建一个简单的 Workflow，观察 GitHub Actions 的运行日志。

```yml
name: Execution Order Demo

on:
  workflow_dispatch:

jobs:
  first:
    runs-on: ubuntu-latest
    steps:
      - name: Step A
        run: echo "A - first job"

      - name: Step B
        run: echo "B - second step"

  second:
    needs: first
    runs-on: ubuntu-latest
    steps:
      - name: Step C
        run: echo "C - dependent job"

  third:
    runs-on: ubuntu-latest
    steps:
      - name: Step D
        run: echo "D - independent job"
```

这个实验里：

- `first` 内的 A 一定先于 B。
- `second` 必须等待 `first` 成功。
- `third` 与 `first` 没有依赖，可以独立调度，不保证它在 `first` 前还是后运行。
- 只有手动触发时，这份 Workflow 才会因这里的 workflow_dispatch 配置而启动。

你可以分别在 GitHub Actions 页面查看三个 Job 的运行时间和日志。如果想进一步观察失败传播，可以把 Step A 临时改成 run: exit 1，再观察后续 Job 的状态。实验结束后记得恢复。

## 最后，把这四条记牢 ##

| 你想知道的问题 | 应该看哪里 |
| :--- | :--- |
| 什么时候启动？ | `on` |
| 一个 Job 内先做什么？ | `steps` 的排列顺序 |
| 不同 Job 谁先执行？ | `needs` 依赖关系 |
| 失败后还会不会继续？ | 默认失败行为、`if`、`continue-on-error` |

如果只记住一句话，那就是：

`on` 决定什么时候触发，`needs` 决定 Job 之间的依赖，`steps` 决定 Job 内部的执行顺序，而退出状态和条件表达式决定失败后怎么处理。

理解这四点之后，你再看复杂的 Docker 构建、ACR 镜像推送、SSH 部署和自动回滚 Workflow，就不会再觉得它是一大堆看不懂的 YAML 了。
