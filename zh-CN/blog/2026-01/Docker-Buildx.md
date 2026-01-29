---
lastUpdated: true
commentabled: true
recommended: true
title: Docker Buildx
description: 构建容器镜像的瑞士军刀
date: 2026-01-29 09:30:00
pageClass: blog-page-class
cover: /covers/docker.svg
---

## Docker Buildx ##

Docker Buildx 是一个 Docker CLI 插件，它基于 `BuildKit` 提供了扩展的构建能力。它旨在提供与 `docker build` 类似的用户界面，同时解锁 BuildKit 的全部功能集。

Buildx 支持多个构建器实例、用于跨平台镜像的多节点构建、Compose 构建支持以及使用 `Bake` 进行高级构建。

## 功能特性 ##

Buildx 集成了 BuildKit 的所有能力，并提供了以下关键特性：

- 熟悉的用户体验：命令界面与传统的 `docker build` 相似，降低了学习成本。
- 完整的 BuildKit 能力：利用容器驱动程序，支持所有 BuildKit 的高级功能。
- 多个构建器实例支持：可以创建和管理多个独立的构建器环境。
- 多平台构建：无需模拟，即可为多种架构（如 linux/amd64, linux/arm64）构建镜像。
- Compose 构建支持：直接从 Docker Compose 文件构建服务镜像。
- Bake 高级构建：通过声明式配置文件（HCL 或 JSON）定义和构建复杂的多目标构建工作流。
- 容器内驱动程序支持：支持在 Docker 容器和 Kubernetes Pod 中运行构建器。

## 安装指南 ##

使用 Buildx 需要 Docker Engine 19.03 或更高版本。

> 警告：使用不兼容的 Docker 版本可能导致意外行为，并很可能引发问题。

### Windows 和 macOS ###

Docker Desktop 已内置 Buildx，无需额外安装。

### Linux 包管理器安装 ###

可以通过系统的包管理器进行安装：

- Debian/Ubuntu: `apt-get install docker-buildx-plugin`
- RHEL/Fedora: `yum install docker-buildx-plugin`

### 手动下载 ###

从 GitHub Releases 页面下载预编译的二进制文件，将其放置于 Docker 插件目录下（例如 `~/.docker/cli-plugins/`），并确保其具有可执行权限。

### 使用 Dockerfile ###

您也可以在 Dockerfile 中使用 `FROM --platform=$BUILDPLATFORM` 指令，配合 Buildx 在多阶段构建中复制二进制文件。

### 安装为 Docker CLI 插件别名 ###

运行以下命令，将 Buildx 设置为 `docker builder` 的别名（旧版方式，现已不推荐）：

```bash
docker buildx install
```

若要移除别名，请运行：

```bash
docker buildx uninstall
```

## 使用说明 ##

### 基本构建 ###

使用 `buildx build` 命令进行构建，其参数与 `docker build` 类似：

```bash
docker buildx build -t your-image:tag .
```

### 管理构建器实例 ###

Buildx 支持多个构建器实例。查看当前实例：

```bash
docker buildx ls
```

创建新的构建器实例（例如使用 `docker-container` 驱动程序）：

```bash
docker buildx create --name mybuilder --driver docker-container --use
```

`--use` 标志会立即切换到新创建的构建器。

### 构建多平台镜像 ###

这是 Buildx 的核心优势之一。您可以使用 `--platform` 标志指定多个平台：

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t your-image:multiarch .
```

为了成功构建多平台镜像，需要确保您的构建器支持多平台（通常容器驱动程序支持），并且可能需要配置 `binfmt_misc` 来注册仿真器。

### 使用 Bake 进行高级构建 ###

Bake 允许您使用 HCL 或 JSON 文件定义构建目标。创建一个 `docker-bake.hcl` 文件：

```hcl
variable "TAG" {
  default = "latest"
}

group "default" {
  targets = ["app", "db"]
}

target "app" {
  context = "."
  dockerfile = "Dockerfile.app"
  tags = ["your-registry/app:${TAG}"]
}

target "db" {
  context = "./db"
  dockerfile = "Dockerfile"
  tags = ["your-registry/db:${TAG}"]
}
```

然后运行构建：

```bash
docker buildx bake --set *.tags=your-registry/my-app:custom-tag
```

Bake 支持从多个文件（包括 Docker Compose 文件）读取配置，并允许通过命令行进行覆盖。

## 核心代码 ##

以下是从 Buildx 项目中提取的一些核心代码片段，展示了其内部工作机制。

### Bake 配置文件解析 ###

`bake` 包负责解析 Bake 的配置文件（HCL/JSON/Compose）。以下代码展示了如何读取和合并本地文件：

```go
// 包 bake 负责解析和处理 Bake 配置文件。
package bake

import (
	"context"
	"io"
	"os"
	"path/filepath"
	"slices"
	"strings"
)

// File 结构体表示一个配置文件，包含文件名和内容。
type File struct {
	Name string
	Data []byte
}

// ReadLocalFiles 读取指定的配置文件列表。如果未提供文件名，则使用默认文件名列表。
// 它支持从标准输入（"-"）读取，并会为不存在的默认文件跳过错误。
func ReadLocalFiles(names []string, stdin io.Reader, l progress.SubLogger) ([]File, error) {
	isDefault := false
	if len(names) == 0 {
		isDefault = true
		names = defaultFilenames() // 获取默认文件名列表，如 docker-bake.hcl, docker-compose.yml 等
	}
	out := make([]File, 0, len(names))

	// 设置进度日志状态的回调函数
	setStatus := func(st *client.VertexStatus) {
		if l != nil {
			l.SetStatus(st)
		}
	}

	for _, n := range names {
		var dt []byte
		var err error
		if n == "-" {
			// 从标准输入读取
			dt, err = readWithProgress(stdin, setStatus)
			if err != nil {
				return nil, err
			}
		} else {
			// 从文件读取，如果是默认文件且不存在，则静默跳过。
			dt, err = readFileWithProgress(n, isDefault, setStatus)
			if dt == nil && err == nil {
				continue
			}
			if err != nil {
				return nil, err
			}
		}
		out = append(out, File{Name: n, Data: dt})
	}
	return out, nil
}
```

### HCL 解析器中的函数调用提取 ###

`hclparser` 包包含用于处理 HCL 配置的实用函数。以下代码展示了如何从 HCL 表达式中提取函数调用：

```go
// 包 hclparser 提供了解析和处理 HCL 配置文件的工具。
package hclparser

import (
	"reflect"
	"unsafe"

	"github.com/hashicorp/hcl/v2"
	"github.com/hashicorp/hcl/v2/hclsyntax"
	"github.com/pkg/errors"
)

// funcCalls 递归遍历 HCL 表达式，收集其中所有函数调用的名称。
// 它处理原生的 hclsyntax 表达式和 JSON 格式的表达式。
func funcCalls(exp hcl.Expression) ([]string, hcl.Diagnostics) {
	node, ok := exp.(hclsyntax.Node)
	if !ok {
		// 对于 JSON 表达式，使用递归函数处理
		fns, err := jsonFuncCallsRecursive(exp)
		if err != nil {
			return nil, wrapErrorDiagnostic("Invalid expression", err, exp.Range().Ptr(), exp.Range().Ptr())
		}
		return fns, nil
	}

	var funcnames []string
	// 使用 hclsyntax.VisitAll 遍历语法树节点
	hcldiags := hclsyntax.VisitAll(node, func(n hclsyntax.Node) hcl.Diagnostics {
		if fe, ok := n.(*hclsyntax.FunctionCallExpr); ok {
			funcnames = append(funcnames, fe.Name) // 收集函数名
		}
		return nil
	})
	if hcldiags.HasErrors() {
		return nil, hcldiags
	}
	return funcnames, nil
}
```

### 驱动程序接口与实现 ###

`driver` 包定义了构建器驱动程序的通用接口，不同的驱动程序（如 `docker-container`, `kubernetes`）都实现此接口。以下代码展示了驱动程序信息查询和客户端连接的核心方法：

```go
// 包 driver 定义了构建器驱动程序的接口和基础结构。
package driver

import (
	"context"
	"net"
	"sync"
	"time"

	"github.com/moby/buildkit/client"
	"github.com/pkg/errors"
)

// Driver 接口是所有 Buildx 驱动程序（如 docker、docker-container、kubernetes、remote）必须实现的契约。
type Driver interface {
	Factory() Factory
	Bootstrap(context.Context, progress.Logger) error
	Info(context.Context) (*Info, error)
	Version(context.Context) (string, error)
	Stop(ctx context.Context, force bool) error
	Rm(ctx context.Context, force, rmVolume, rmDaemon bool) error
	Dial(ctx context.Context) (net.Conn, error)
	Client(ctx context.Context, opts ...client.ClientOpt) (*client.Client, error)
	Features(ctx context.Context) map[Feature]bool
	HostGatewayIP(ctx context.Context) (net.IP, error)
	IsMobyDriver() bool
	Config() InitConfig
}

// Boot 是一个辅助函数，用于引导驱动程序并获取 BuildKit 客户端。
// 它会尝试启动驱动程序（如果尚未运行），并在失败时重试。
func Boot(ctx, clientContext context.Context, d *DriverHandle, pw progress.Writer) (*client.Client, error) {
	try := 0
	logger := discardLogger
	if pw != nil {
		logger = pw.Write
	}

	for {
		info, err := d.Info(ctx) // 查询驱动程序状态
		if err != nil {
			return nil, err
		}
		try++
		if info.Status != Running {
			if try > 2 {
				return nil, errors.Errorf("failed to bootstrap %T driver in attempts", d)
			}
			// 如果未运行，则尝试引导启动
			if err := d.Bootstrap(ctx, logger); err != nil {
				return nil, err
			}
		}

		// 获取 BuildKit 客户端
		c, err := d.Client(clientContext)
		if err != nil {
			if errors.Is(err, ErrNotRunning{}) && try <= 2 {
				continue // 如果是未运行错误，且尝试次数未超，则重试循环
			}
			return nil, err
		}
		return c, nil
	}
}
```

这些代码片段体现了 Buildx 项目的几个核心设计：模块化（通过驱动程序支持多种后端）、声明式配置（通过 Bake 和 HCL）以及对 BuildKit 所有功能的充分利用。
