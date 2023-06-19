# Docker 学习笔记 #

---

## Docker 概述 ##

> Docker 是一个用于开发，分发和运行应用程序的开放平台。Docker 使您能够将应用程序与基础架构分开，从而可以快速交付软件。借助 Docker，您可以以与管理应用程序相同的方式来管理基础架构。通过利用 Docker 的快速分发，测试和部署代码的方式，您可以大大减少编写代码和在生产环境中运行代码之间的延迟。

### Docker 平台（Docker platform） ###

Docker 提供了在松散隔离的环境（称为容器）中打包和运行应用程序的功能。隔离和安全性使您可以在给定主机上同时运行多个容器。容器很轻量级，因为它们不需要额外的虚拟程序，而是直接在主机的内核中运行。这意味着与使用虚拟机相比，在给定的硬件组合上可以运行更多的容器。您甚至可以在虚拟机的主机中运行 Docker 容器！

Docker 提供了工具和平台来管理容器的生命周期：

- 使用容器开发应用程序及其支持组件。
- 容器成为分发和测试您的应用程序的单元。
- 准备就绪后，可以将应用程序作为容器或编排服务部署到生产环境中。无论您的生产环境是本地数据中心，云提供商还是两者的混合，其工作原理都相同。

### Docker 引擎（Docker Engine） ###

Docker Engine 是具有以下主要组件的 客户端-服务器 应用程序：

服务器是一种长期运行的程序，称为守护程序进程（dockerd 命令）。
使用 REST API 来与守护程序进行通信并指示其操作的接口。
命令行界面（CLI）客户端（docker 命令）。
Docker 的组成图如下：

<img src="Files/1419160-20201023124226867-173185139.png" />

命令行（CLI）使用 Docker 的 REST API 来命令与 Docker 守护程序控制或交互。守护程序可以创建和管理Docker对象，例如图像，容器，网络和卷。

> 注意：Docker 在 Apache 2.0 许可证下进行开源

### 我能用 Docker 做什么 ###

**快速，一致地交付您的应用程序**

Docker 通过允许开发人员使用能提供应用和服务的标准本地环境，来简化开发流程。容器非常适合持续集成和持续交付（CI/CD）工作流程。

考虑以下示例场景：

- 开发人员在本地编写代码，并使用 Docker 容器与同事共享他们的工作。
- 开发人员使用 Docker 将其应用程序推送到测试环境中，并执行自动和手动测试。
- 当开发人员发现错误时，他们可以在开发环境中对其进行修复，然后将其重新部署到测试环境中以进行测试和验证。
- 测试完成后，修复用户问题就像将更新的镜像推送到生产环境一样简单。

**响应式部署和扩展**

Docker 基于容器的平台允许高度可移植的工作负载。Docker 容器可以在开发人员的本地笔记本电脑上，数据中心中的物理或虚拟机，云提供商或混合环境中运行。

Docker 的可移植性和轻量级的特性还使您可以轻松地动态管理工作负载，并根据业务需求扩展或关闭应用程序和服务。

**在同一硬件上运行更多工作负载**

Docker 轻巧快速。它为基于虚拟机管理程序的虚拟机提供了可行，经济高效的替代方案，因此您可以利用更多的计算能力来实现业务目标。Docker非 常适合高密度环境以及中小型部署，在这些部署中您需要用更少的资源做更多的事情。

### Docker 架构（Docker Architecture） ###

Docker 使用客户端-服务器架构。Docker 客户端与 Docker 守护进程进行交互，该守护程序完成构建，运行和分发 Docker 容器的繁重工作。 Docker 客户端和守护进程可以在同一系统上运行，或者您可以将 Docker 客户端连接到远程 Docker 守护进程。 Docker 客户端和守护进程在 UNIX 套接字或网络接口上使用 REST API 进行通信。

<img src="Files/1419160-20201023124356418-218515496.png" />

**Docker 守护进程（Docker daemon）**

Docker 守护进程（dockerd）侦听 Docker API 请求并管理 Docker 对象，例如图像，容器，网络和卷。守护程序还可以与其他守护程序通信以管理 Docker 服务。

**Docker 客户端（Docker client）**

Docker 客户端（docker）是许多 Docker 用户与 Docker 交互的主要方式。当您使用诸如 docker run 之类的命令时，客户端会将这些命令发送至 dockerd，然后执行它们。Docker 命令使用 Docker API。Docker 客户端可以与多个守护程序通信。

**Docker 仓库（Docker registries）**

Docker registry 存储 Docker 镜像。Docker Hub 是任何人都可以使用的公共 Registry，并且 Docker 配置为默认在 Docker Hub 上查找镜像。您甚至可以运行自己的私有 Registry。

使用 docker pull 或 docker run 命令时，所需的镜像将从配置的 Registry 中提取。使用 docker push 命令时，会将镜像推送到配置的 Registry。

### Docker 对象（Docker objects） ###

使用 Docker 时，您正在创建和使用镜像，容器，网络，卷，插件和其他对象。本节是其中一些对象的简要概述。

**镜像（IMAGES）**

镜像是一个只读模板，其中包含创建 Docker 容器的说明。通常，一个镜像基于另一个镜像，并进行一些其他自定义。例如，您可以构建基于 ubuntu 镜像的镜像，安装 Apache Web 服务器和您的应用程序，以及运行应用程序所需的配置详细信息。

您可以创建自己的镜像，也可以使用其他人创建并在 Registry 中发布的镜像。要构建自己的镜像，您可以使用简单的语法创建一个 Dockerfile，以定义创建镜像并运行它所需的步骤。Dockerfile 中的每条指令都会在镜像中创建一个层。当您更改 Dockerfile 并重建镜像时，仅重建那些已更改的层。与其他虚拟化技术相比，这是使镜像如此轻巧，小型和快速的部分原因。

**容器（CONTAINERS）**

容器是镜像的运行实例。您可以使用 Docker API 或 CLI 创建，启动，停止，移动或删除容器。您可以将容器连接到一个或多个网络，或者存储，甚至根据其当前状态创建一个新镜像。

默认情况下，容器与其他容器及其主机之间的隔离度相对较高。您可以控制容器的网络，存储或其他基础子系统与其他容器或与主机的隔离程度。

容器由其镜像以及在创建或启动时为其提供的任何配置选项定义。删除容器后，未存储在永久性存储中的状态更改将消失。

**服务（SERVICES）**

服务使您可以在多个 Docker 守护程序之间扩展容器，这些守护程序都可以与多个管理者和工作人员一起工作。 每个成员都是 Docker 守护程序，所有守护程序都使用 Docker API 进行通信。服务允许您定义所需的状态，例如在任何给定时间必须可用的服务副本的数量。默认情况下，该服务在所有工作节点之间是负载平衡的。对于消费者而言，Docker 服务似乎是一个单独的应用程序。 Docker Engine 在 Docker 1.12 及更高版本中支持集群模式。


## 命令 version ##

### 环境 ###

- virtual box 6.1
- centos 7.8
- docker 19.03

### 命令格式 ###

	docker version [OPTIONS]

默认情况下，Docker 使用易于阅读的格式显示所有的信息。如果指定了显示的格式，将会按照指定的格式进行输出。

### 命令选项 ###

**format**

根据指定的格式显示输出信息，其中 `-f` 是 `--format` 的短命令形式。一般来说，在命令行手动输入命令时，使用短命令形式，可以减少输入。而长命令的形式，用在编写脚本的文件中，增强可读性。

### 示例 ###

**默认输出**

	$ docker version
	Client: Docker Engine - Community
	 Version:           19.03.6
	 API version:       1.40
	 Go version:        go1.12.16
	 Git commit:        369ce74a3c
	 Built:             Thu Feb 13 01:27:49 2020
	 OS/Arch:           linux/amd64
	 Experimental:      true
	
	Server: Docker Engine - Community
	 Engine:
	  Version:          19.03.6
	  API version:      1.40 (minimum version 1.12)
	  Go version:       go1.12.16
	  Git commit:       369ce74a3c
	  Built:            Thu Feb 13 01:26:21 2020
	  OS/Arch:          linux/amd64
	  Experimental:     false
	 containerd:
	  Version:          1.2.10
	  GitCommit:        b34a5c8af56e510852c35414db4c1f4fa6172339
	 runc:
	  Version:          1.0.0-rc8+dev
	  GitCommit:        3e425f80a8c931f88e6d94a8c831b9d5aa481657
	 docker-init:
	  Version:          0.18.0
	  GitCommit:        fec3683

**获取版本信息**

	$ docker version --format '{{.Server.Version}}'
	19.03.6

**输出 json 格式**

	$ docker version --format '{{json .}}'
	{"Client":{"Platform":{"Name":"Docker Engine - Community"},"Version":"19.03.6","ApiVersion":"1.40","DefaultAPIVersion":"1.40","GitCommit":"369ce74a3c","GoVersion":"go1.12.16","Os":"linux","Arch":"amd64","BuildTime":"Thu Feb 13 01:27:49 2020","Experimental":true},"Server":{"Platform":{"Name":"Docker Engine - Community"},"Components":[{"Name":"Engine","Version":"19.03.6","Details":{"ApiVersion":"1.40","Arch":"amd64","BuildTime":"Thu Feb 13 01:26:21 2020","Experimental":"false","GitCommit":"369ce74a3c","GoVersion":"go1.12.16","KernelVersion":"4.15.0-88-generic","MinAPIVersion":"1.12","Os":"linux"}},{"Name":"containerd","Version":"1.2.10","Details":{"GitCommit":"b34a5c8af56e510852c35414db4c1f4fa6172339"}},{"Name":"runc","Version":"1.0.0-rc8+dev","Details":{"GitCommit":"3e425f80a8c931f88e6d94a8c831b9d5aa481657"}},{"Name":"docker-init","Version":"0.18.0","Details":{"GitCommit":"fec3683"}}],"Version":"19.03.6","ApiVersion":"1.40","MinAPIVersion":"1.12","GitCommit":"369ce74a3c","GoVersion":"go1.12.16","Os":"linux","Arch":"amd64","KernelVersion":"4.15.0-88-generic","BuildTime":"2020-02-13T01:26:21.000000000+00:00"}}

### 总结 ###

介绍了 version 命令的使用，可以输出 docker 的版本信息。介绍了 --format 选项的作用，可以获取指定的值，也可以对输出的内容进行格式化。

## 命令 info ##

### 环境 ###

- virtual box 6.1
- centos 7.8
- docker 19.03

## 命令格式 ##

	docker info [OPTIONS]

此命令显示有关 Docker 安装的系统信息。显示的信息包括内核版本，容器和镜像数量。显示的镜像数量是唯一镜像的数量。用不同名称标记的同一个镜像仅计算一次。如果指定了显示的格式，则会按照指定的格式进行显示。

根据所使用的存储驱动，可以显示其他额外的信息，例如池名称，数据文件，元数据文件，使用的数据空间，总数据空间，使用的元数据空间和总元数据空间。

数据文件是存储镜像的位置，元数据文件是存储与那些镜像有关的元数据的位置。首次运行时，Docker 将从 /var/lib/docker 的卷上的可用空间中分配一定数量的数据空间和元数据空间。

## 命令选项 ##

**format**

根据指定的格式显示输出信息，其中 -f 是 --format 的短命令形式。一般来说，在命令行手动输入命令时，使用短命令形式，可以减少输入。而长命令的形式，用在编写脚本的文件中，增强可读性。

## 示例 ##

### 默认输出 ###

	$ docker info
	Client:
	 Debug Mode: false
	 Plugins:
	  app: Docker Application (Docker Inc., v0.8.0)
	  buildx: Build with BuildKit (Docker Inc., v0.3.1-tp-docker)
	
	Server:
	 Containers: 20
	  Running: 20
	  Paused: 0
	  Stopped: 0
	 Images: 31
	 Server Version: 19.03.6
	 Storage Driver: overlay
	  Backing Filesystem: extfs
	  Supports d_type: true
	 Logging Driver: json-file
	 Cgroup Driver: cgroupfs
	 Plugins:
	  Volume: local
	  Network: bridge host ipvlan macvlan null overlay
	  Log: awslogs fluentd gcplogs gelf journald json-file local logentries splunk syslog
	 Swarm: inactive
	 Runtimes: runc
	 Default Runtime: runc
	 Init Binary: docker-init
	 containerd version: b34a5c8af56e510852c35414db4c1f4fa6172339
	 runc version: 3e425f80a8c931f88e6d94a8c831b9d5aa481657
	 init version: fec3683
	 Security Options:
	  apparmor
	  seccomp
	   Profile: default
	 Kernel Version: 4.15.0-88-generic
	 Operating System: Ubuntu 18.04.4 LTS
	 OSType: linux
	 Architecture: x86_64
	 CPUs: 2
	 Total Memory: 2.403GiB
	 Name: minikube
	 ID: YI4C:27UO:6YUV:SOB6:SD7C:MHMS:JUDN:O46N:KUPH:SZDY:TGEA:WTEQ
	 Docker Root Dir: /var/lib/docker
	 Debug Mode: true
	  File Descriptors: 129
	  Goroutines: 119
	  System Time: 2020-08-22T06:06:06.139588271Z
	  EventsListeners: 0
	 Registry: https://index.docker.io/v1/
	 Labels:
	 Experimental: false
	 Insecure Registries:
	  registry.test.training.katacoda.com:4567
	  127.0.0.0/8
	 Live Restore Enabled: false
	
	WARNING: No swap limit support
	WARNING: the overlay storage-driver is deprecated, and will be removed in a future release.

**显示 debug 信息**

	$ docker -D info
	Client:
	 Debug Mode: true
	
	Server:
	 Containers: 14
	  Running: 3
	  Paused: 1
	  Stopped: 10
	 Images: 52
	 Server Version: 1.13.0
	 Storage Driver: overlay2
	  Backing Filesystem: extfs
	  Supports d_type: true
	  Native Overlay Diff: false
	 Logging Driver: json-file
	 Cgroup Driver: cgroupfs
	 Plugins:
	  Volume: local
	  Network: bridge host macvlan null overlay
	 Swarm: active
	 ...

**输出 json 格式**

	$ docker info --format '{{json .}}'
	
	{"ID":"I54V:OLXT:HVMM:TPKO:JPHQ:CQCD:JNLC:O3BZ:4ZVJ:43XJ:PFHZ:6N2S","Containers":14, ...}

**内核警告**

如果操作系统不支持某些功能，当你运行 docker info 的时候，你可能会看到以下警告之一：

- WARNING: Your kernel does not support swap limit capabilities. Limitation discarded.
- WARNING: No swap limit support

除非您确实需要限制这些资源的能力，否则您可以忽略这些警告，在这种情况下，应查阅操作系统的文档以启用它们。

### 总结 ###
介绍了 info 命令的使用，可以输出 docker 和系统的一些信息。介绍了 --format 选项的作用，可以获取指定的值，也可以对输出的内容进行格式化。


##  ##