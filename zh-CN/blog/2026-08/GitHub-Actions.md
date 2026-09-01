---
lastUpdated: true
commentabled: true
recommended: true
title: GitHub Actions 从入门到实战
description: 一文搞懂 CI/CD 自动化
date: 2026-08-31 10:15:00
pageClass: blog-page-class
cover: /covers/git.svg
---

## 什么是 GitHub Actions？ ##

GitHub Actions 是 GitHub 官方提供的 CI/CD（持续集成/持续部署）平台，它允许你在代码仓库中直接定义自动化工作流。

简单说：代码提交 → 自动触发 → 自动构建/测试/部署，一条龙搞定。

### 它能做什么？ ###

- ✅ 自动运行单元测试
- ✅ 自动构建 Docker 镜像
- ✅ 自动部署到服务器/云厂商
- ✅ 自动发布 npm 包
- ✅ 自动格式化代码、生成 changelog
- ✅ 定时任务（如每日数据抓取）

## 核心概念速览 ##

| 概念 | 说明 |
| :--- | :--- |
| Workflow | 工作流，定义在 `.github/workflows/*.yml` 中 |
| Event | 触发事件，如 `push`、`pull_request`、`schedule` |
| Job | 任务，一个 workflow 可包含多个 job，默认并行执行 |
| Step | 步骤，一个 job 中的执行单元 |
| Action | 可复用的动作，如 `actions/checkout@v4` |
| Runner | 执行环境，GitHub 提供 Linux/macOS/Windows |

## 配置文件详解 ##

### 文件位置 ###

```txt
你的仓库/
├── .github/
│   └── workflows/
│       ├── ci.yml          # 持续集成
│       ├── deploy.yml      # 自动部署
│       └── release.yml     # 发布流程
```

### 基础语法结构 ###

```yaml
# .github/workflows/basic.yml
name: 基础工作流示例

# 触发条件
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

# 权限控制
permissions:
  contents: read

# 环境变量（全局）
env:
  NODE_VERSION: '20'

jobs:
  # 第一个 Job：构建
  build:
    runs-on: ubuntu-latest

    steps:
      # 1. 检出代码
      - name: 检出代码
        uses: actions/checkout@v4

      # 2. 设置 Node.js 环境
      - name: 设置 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      # 3. 安装依赖
      - name: 安装依赖
        run: npm ci

      # 4. 运行测试
      - name: 运行测试
        run: npm test

      # 5. 构建项目
      - name: 构建项目
        run: npm run build
```

## 实战配置文件合集 ##

### 📌 示例 1：前端项目 CI（Vue/React） ###

```yaml
# .github/workflows/frontend-ci.yml
name: 前端 CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]  # 多版本测试

    steps:
      - uses: actions/checkout@v4

      - name: 使用 Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: 安装依赖
        run: npm ci

      - name: ESLint 检查
        run: npm run lint

      - name: 运行单元测试
        run: npm run test:unit

      - name: 构建生产包
        run: npm run build

      - name: 上传构建产物
        uses: actions/upload-artifact@v4
        with:
          name: dist-${{ matrix.node-version }}
          path: dist/
```

### 📌 示例 2：自动部署到服务器（SSH + rsync） ###

```yaml
# .github/workflows/deploy.yml
name: 自动部署

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: 设置 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 安装并构建
        run: |
          npm ci
          npm run build

      # 使用 SSH 密钥部署到服务器
      - name: 部署到服务器
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          source: "dist/*"
          target: "/var/www/my-app/"
          strip_components: 1

      # 可选：SSH 登录执行命令（如重启 Nginx）
      - name: 重启服务
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            sudo nginx -s reload
            echo "部署完成于 $(date)"
```

> 💡 Secrets 设置路径：仓库 Settings → Secrets and variables → Actions → New repository secret

### 📌 示例 3：构建并推送 Docker 镜像 ###

```yaml
# .github/workflows/docker.yml
name: Docker 构建与推送

on:
  push:
    tags:
      - 'v*'  # 只有打 tag 时触发

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: 检出代码
        uses: actions/checkout@v4

      - name: 设置 QEMU
        uses: docker/setup-qemu-action@v3

      - name: 设置 Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: 登录 GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: 提取元数据
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=tag
            type=sha,prefix=,suffix=,format=short

      - name: 构建并推送
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 📌 示例 4：Go 项目 CI + 自动 Release ###

```yaml
# .github/workflows/go-release.yml
name: Go CI & Release

on:
  push:
    branches: [main]
    tags:
      - 'v*'
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 设置 Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'

      - name: 下载依赖
        run: go mod download

      - name: 运行测试
        run: go test -v ./...

      - name: 构建
        run: go build -v ./...

  release:
    needs: test  # 依赖 test job 成功后才执行
    if: startsWith(github.ref, 'refs/tags/')
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4

      - name: 设置 Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'

      # 使用 GoReleaser 自动发布多平台二进制文件
      - name: 发布 Release
        uses: goreleaser/goreleaser-action@v6
        with:
          distribution: goreleaser
          version: latest
          args: release --clean
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 📌 示例 5：定时任务（数据抓取/备份） ###

```yaml
# .github/workflows/cron.yml
name: 每日数据备份

on:
  schedule:
    # 每天 UTC 02:00 执行（北京时间 10:00）
    - cron: '0 2 * * *'
  workflow_dispatch:  # 支持手动触发

jobs:
  backup:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: 设置 Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: 安装依赖
        run: pip install requests

      - name: 执行备份脚本
        run: python scripts/backup.py
        env:
          API_KEY: ${{ secrets.API_KEY }}

      - name: 提交备份文件
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add backup/
          git commit -m "chore: 自动备份 $(date +%Y-%m-%d)" || exit 0
          git push
```

## 进阶技巧 ##

### 条件执行 ###

```yaml
steps:
  - name: 仅在 main 分支执行
    if: github.ref == 'refs/heads/main'
    run: echo "当前是 main 分支"

  - name: 仅在 PR 时执行
    if: github.event_name == 'pull_request'
    run: echo "这是 PR"
```

### Job 之间的依赖与产物传递 ###

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: dist/

  deploy:
    needs: build  # 等 build 完成
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-files
          path: dist/
      - run: ls dist/  # 可以使用 build 的产物
```

### 复用工作流（Reusable Workflows） ###

```yaml
# .github/workflows/reusable-lint.yml
name: 可复用的 Lint 工作流

on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm ci && npm run lint
```

```yaml
# 其他 workflow 中调用
jobs:
  call-lint:
    uses: ./.github/workflows/reusable-lint.yml
    with:
      node-version: '20'
```

## 常用 Actions 推荐 ##

| Action | 用途 |
| :--- | :--- |
| `actions/checkout@v4` | 检出代码 |
| `actions/setup-node@v4` | 设置 Node.js |
| `actions/setup-python@v5` | 设置 Python |
| `actions/setup-go@v5` | 设置 Go |
| `actions/cache@v4` | 缓存依赖 |
| `actions/upload-artifact@v4` | 上传产物 |
| `actions/download-artifact@v4` | 下载产物 |
| `docker/login-action@v3` | Docker 登录 |
| `docker/build-push-action@v5` | 构建推送镜像 |
| `softprops/action-gh-release@v2` | 发布 GitHub Release |
| `peter-evans/create-pull-request@v6` | 自动创建 PR |

## 总结 ##

| 场景 | 推荐配置 |
| :--- | :--- |
| 前端项目 CI | 示例 1 |
| 部署到自有服务器 | 示例 2 |
| 容器化项目 | 示例 3 |
| Go/Rust 等编译型语言 | 示例 4 |
| 定时任务 | 示例 5 |

GitHub Actions 的强大之处在于与 GitHub 生态深度集成，无需额外配置 Jenkins、GitLab CI 等外部工具，直接在仓库里写 YAML 就能搞定自动化。

> 📌 小提示：调试 workflow 时，可以在步骤里加 `set -x`（bash）或加 `continue-on-error: true` 查看详细日志。也可以在 Actions 页面点击「Re-run jobs」重新触发。
