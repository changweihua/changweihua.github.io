---
lastUpdated: true
commentabled: true
recommended: true
title: 使用 docker-compose 构建
description: 离线使用 Docker 镜像
date: 2026-01-28 13:00:00
pageClass: blog-page-class
cover: /covers/nginx.svg
---

如何使用 Docker Compose 来同时构建和管理 MySQL 与 Redis。

本文将从零开始，介绍从安装所需环境到编写 `docker-compose.yml` 文件再到启动、测试的全过程，并在文末给出一些常见的注意事项和排错思路。

## 一、环境准备 ##

### 安装 Docker ###

- 针对不同操作系统（Windows、macOS、Linux），可以参考Docker 官方文档进行安装。
- 安装完成后，可在命令行终端输入以下命令，检查 Docker 是否安装并启动成功：

```bash
docker version
```

如果成功显示 Docker 的版本信息，就说明安装成功。

### 安装 Docker Compose ###

- 如果使用的是 Docker Desktop（Windows 或 macOS），通常已经自带了 Docker Compose。
- 如果是在 Linux 上，需要另外安装 Docker Compose。一般可以通过包管理器或官方安装脚本进行安装。
- 验证 Docker Compose 安装是否成功，可以执行：

```bash
docker compose version
```

或

```bash
docker-compose version
```

> 注意：Docker 版本更新后，可能使用 `docker compose` 命令，而早期版本是 `docker-compose`，两者在使用时略有不同，但本质功能一致。

### 确认安装结果 ###

- 确保以下命令都可成功执行且能看到版本输出：

```bash
docker version
docker compose version
```

或

```bash
docker-compose version
```

## 二、创建项目目录 ##

- 在本地新建一个目录（文件夹），用于存放我们的 `docker-compose.yml` 文件以及一些额外的配置文件（如果需要）。

  - 例如，我们创建一个名为 `compose-demo` 的文件夹。

- 进入该目录：

```bash
cd compose-demo
```

## 三、编写 docker-compose.yml 文件 ##

在 `compose-demo` 目录下，新建一个名为 `docker-compose.yml` 的文件，内容示例如下（可根据需求自行修改）：

```yaml
services:
  mysql:
    image: mysql:8.0  # 使用 MySQL 8.0 官方镜像
    container_name: demo-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root123  # 设置root用户密码
      MYSQL_DATABASE: demo_db       # 初始化时自动创建一个名为 demo_db 的数据库
      MYSQL_USER: demo_user         # 初始化用户
      MYSQL_PASSWORD: demo_pass     # 初始化用户密码
    ports:
      - "3306:3306"  # 将容器的3306端口映射到宿主机的3306端口
    volumes:
      - ./mysql_data:/var/lib/mysql  # 将容器中的MySQL数据存储目录挂载到宿主机目录（持久化数据）
    networks:
      - mynet

  redis:
    image: redis:6.0  # 使用 Redis 6.0 官方镜像
    container_name: demo-redis
    restart: always
    ports:
      - "6379:6379"  # 将容器6379端口映射到宿主机6379端口
    volumes:
      - ./redis_data:/data         # 挂载Redis的数据目录（持久化数据）
    command: ["redis-server", "--appendonly", "yes"]  # 默认开启appendonly模式
    networks:
      - mynet

networks:
  mynet:
    driver: bridge
```

### 文件内容详解 ###

- `version: "3.8"`

  - 表示使用 Docker Compose 配置文件的 3.8 版本格式。

- `services`

  - 在 `services` 节点下定义了多个服务（MySQL、Redis），它们会同时被启动且放在同一个网络中，可通过服务名互相访问。

- `mysql` 服务

  - `image: mysql:8.0`

    使用官方的 mysql:8.0 镜像，如果对版本有其他需求可自行替换。

  - `container_name: demo-mysql`
    
    容器名称，可自定义。

  - `restart: always`

    如果容器意外停止或服务器重启后会自动重启容器。
  
  - `environment`

    - `MYSQL_ROOT_PASSWORD`: 设置数据库 root 用户的登录密码。
    - `MYSQL_DATABASE`: 指定初始化时自动创建的数据库名称。
    - `MYSQL_USER / MYSQL_PASSWORD`: 指定一个新用户及其密码，默认会在初始化时自动创建。

  - `ports: - "3306:3306"`

    将容器的 3306 端口映射到宿主机的 3306 端口，以便在宿主机用 mysql -h 127.0.0.1 -P 3306 -u root -p 进行访问。

  - `volumes: - ./mysql_data:/var/lib/mysql`

    将容器内部的 `/var/lib/mysql` 挂载到宿主机当前目录下的 `mysql_data` 文件夹，用于数据持久化。如果不设置，一旦容器删除，容器内部的数据也会丢失。

- `redis` 服务

  - `image: redis:6.0`

    使用官方的 `redis:6.0` 镜像，同样可以根据需要调整版本。

  - `container_name: demo-redis`

    容器名称，可自定义。

  - `ports: - "6379:6379"`

    将容器的 6379 端口映射到宿主机的 6379 端口，默认端口用于 Redis 连接。

  - `volumes: - ./redis_data:/data`

    将 Redis 的 `/data` 目录挂载到宿主机当前目录下的 `redis_data` 文件夹，方便持久化存储。

  - `command: ["redis-server", "--appendonly", "yes"]`

    指定容器启动时执行的命令，这里开启 appendonly 持久化模式。

  - `restart: always`

    同 MySQL，一旦重启或异常退出会自动拉起。

- `networks`

  - 定义了一个名为 `mynet` 的网络，使 MySQL 和 Redis 处于同一网络之中，容器之间可以通过 mysql、redis 进行互相访问（例如 `redis` 容器可通过 `mysql:3306` 访问 MySQL 服务）。

## 四、启动 Docker Compose ##

- 确保在 `compose-demo` 目录下（即包含 `docker-compose.yml` 的路径）。

- 执行启动命令：

```bash
docker compose up -d
```

如果是早期 Docker Compose 版本，可以使用：

```bash
docker-compose up -d
```

- `-d` 参数表示后台运行（detached mode）。

- 等待容器拉取镜像并启动。可以使用以下命令查看容器运行状态：

```bash
docker ps -a
```

或者查看日志：

```bash
docker compose logs -f
```

> 早期版本则使用 `docker-compose logs -f`

## 五、测试与验证 ##

### 验证 MySQL ###

#### 方式一：通过宿主机的 MySQL 客户端 ####

如果本地已经安装了 MySQL 客户端，可以在命令行执行：

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p
```

输入在 `docker-compose.yml` 中指定的 `root` 密码（上例中是 root123），如果能正常登录说明容器内的 MySQL 已经可用。

#### 方式二：进入容器内部 ####

```bash
docker exec -it demo-mysql bash
# 然后在容器内执行
mysql -u root -p
```

同样输入密码 `root123` 进入 MySQL。

**查看数据库**

```sql
SHOW DATABASES;
```

应该能看到 demo_db（由于在 docker-compose.yml 中指定了 `MYSQL_DATABASE: demo_db`）。

直接用第三方可视化界面连接也行

### 验证 Redis ###

直接用第三方可视化界面连接也行

#### 方式一：通过宿主机的 redis-cli ####

如果本地安装了 redis-cli，可以直接：

```bash
redis-cli -h 127.0.0.1 -p 6379
```

然后执行一些命令进行测试，比如：

```bash
set foo bar
get foo  # 结果应该为 "bar"
```

#### 方式二：进入容器内部 ####

```bash
docker exec -it demo-redis bash
# 容器内部若没有redis-cli，需要在Dockerfile里安装或使用指定带cli的镜像
# 也可以在镜像中通过redis自带的 CLI 进行访问
redis-cli
# 测试读写
set foo bar
get foo
```

## 六、常见操作 ##

### 查看容器日志 ###

```bash
docker compose logs -f mysql
docker compose logs -f redis
```

可实时查看 MySQL 或 Redis 容器的日志输出。

### 停止容器 ###

```bash
docker compose stop
```

或只停止其中一个服务：

```bash
docker compose stop mysql
```

### 重启容器 ###

```bash
docker compose restart
```

### 移除容器 ###

```bash
docker compose down
```

这会停止并移除所有在 `docker-compose.yml` 中定义的容器。如果希望同时删除数据卷（注意数据会丢失），可加上 `-v` 参数：

```bash
docker compose down -v
```

## 七、注意事项 ##

### 端口冲突 ###

- 如果宿主机上已经有其他进程占用了 3306 或 6379 端口，需要在 `docker-compose.yml` 中更换映射端口，比如：

```yml
ports:
  - "3307:3306"
```

这样 MySQL 就映射到宿主机的 3307 端口。

### 数据卷持久化 ###

- 默认配置中，我们将 MySQL 和 Redis 的数据都持久化到当前目录下的 `mysql_data` 和 `redis_data` 文件夹。必须保证当前用户对这些文件夹拥有读写权限，否则可能会造成容器启动错误或权限问题。
- 如果仅作测试，可以不做数据持久化，但生产环境中一定要设置数据挂载路径以防数据丢失。

### 密码安全 ###

- 本文示例中仅作演示，实际环境中应设置较复杂的 root 密码与用户密码。
- 切勿将敏感信息直接硬编码在 `docker-compose.yml`，建议使用环境变量文件（如 `.env`）或其他安全方式管理密码。

### 网络配置 ###

- Compose 会默认创建一个桥接网络（bridge），上例中命名为 `mynet`，容器之间可以通过服务名相互访问。
- 如果要与外部或其他网络通信，可根据需要在 `docker-compose.yml` 文件中新增更多网络配置。

### MySQL 配置调优 ###

- 如果对 MySQL 有特定配置需求，比如 charset、collation、最大连接数等，可以通过挂载配置文件的方式或使用环境变量进行自定义。

### Redis 配置调优 ###

- 同样可以通过挂载 `redis.conf` 配置文件、设置持久化策略（RDB 或 AOF 或混合）等方式来满足不同场景的需求。

## 八、总结 ##

通过以上步骤，我们就可以使用一份简单的 `docker-compose.yml` 文件来同时管理 MySQL 和 Redis。使用 Docker Compose 不仅可以更轻松地启动、停止和维护多个容器服务，也使得环境可移植性、部署一致性得到极大提升。以上仅是最基础的入门示例，更复杂或生产环境中可能还需要对网络、存储、权限、安全等方面做更详细的配置调整。

## 容器和镜像 ##

容器和镜像在 Docker 中是两个核心概念，它们各自扮演不同的角色。让我们深入了解一下它们的区别：

### 镜像（Image） ###

- 是什么：镜像是一个只读的、包含运行容器所需的所有文件、依赖项、配置和应用程序代码的模板。它相当于一个打包好的快照，是容器的基础。

- 用途：镜像类似于虚拟机的磁盘镜像，但它不包含操作系统内核，它更像是一个程序的可执行文件或一个虚拟机的快照。

- 特性：

  - 只读：一旦镜像创建，它的内容不会改变。
  - 静态：镜像不能运行，但它包含了创建可运行容器所需的所有东西。
  - 层次结构：Docker 镜像由多个层组成，每一层代表了一个镜像的历史版本，可以共用这些层来节省空间。

- 获取方式：通常你会从 Docker Hub 拉取镜像，也可以通过 Dockerfile 自行构建镜像。

### 容器（Container）###

- 是什么：容器是镜像的运行时实例。当你通过镜像启动一个容器时，它就变成了一个独立的进程，运行你的应用程序。容器是镜像的动态版本，具有可读写的文件系统和分配的资源。

- 用途：容器的目的是在隔离的环境中运行应用程序。它为应用程序提供了独立的执行环境，确保在不同的系统上可以一致运行。

- 特性：

  - 读写：容器可以读写，它在运行时可以创建、修改和删除文件。
  - 动态：容器是动态的，它可以运行、停止、重新启动等。运行时容器是基于镜像创建的，但与镜像不同，它具有可变的状态。
  - 可销毁：容器是短暂的，容器可以随时销毁并重新创建，不会影响到镜像。

### 总结 ###

- 镜像：是创建容器的模板，是只读的，类似于快照。
- 容器：是运行中的镜像实例，有读写权限，并且可以执行、修改数据。

**一个常用的类比是**：

- 镜像类似于一个应用程序的安装包（静态、只读）。
- 容器类似于安装并运行了这个应用程序的实例（动态、可操作）。

你可以从一个镜像创建多个容器，每个容器独立运行，但它们都基于同一个镜像。

**抽象** 就相当于我们使用的QQ QQ是一个镜像 登录不同的账号就是运行多个容器

- QQ 软件本身 ：相当于 Docker 镜像 。它是一个应用程序的模板，包含所有运行这个应用所需的代码和资源。
- 登录不同的 QQ 账号 ：相当于运行多个 容器 。每个登录的账号都是 QQ 软件的一个独立实例（容器）。这些实例都是基于同一个 QQ 软件（镜像），但每个实例运行时的状态、数据（比如聊天记录、好友列表）都是独立的，互不影响。

> 就像你可以通过一个 QQ 软件登录多个不同的账号（每个账号在自己独立的环境中运行），在 Docker 中，你也可以通过同一个镜像创建并运行多个容器，每个容器都有自己的环境和状态。

## 离线使用 Docker 镜像 ##

当我们无法拉取任何远程镜像，我们只能通过离线方式。你需要：

### 从其他能上网的机器下载镜像 ###

在一台能访问外网的机器上执行：

```bash
# 下载redis:7.2-alpine镜像
docker pull redis:7.2-alpine

# 保存为tar文件
docker save -o redis_7.2_alpine.tar redis:7.2-alpine

# 同时可能需要cubejs相关的镜像，一并下载
docker pull cubejs/cube
docker save -o cubejs_cube.tar cubejs/cube
```

### 传输并导入到当前服务器 ###

将 `tar` 文件复制到要执行的目录，然后执行：

```bash
# 导入镜像
docker load -i redis_7.2_alpine.tar
docker load -i cubejs_cube.tar

# 查看导入的镜像
docker images
```

### 修改 docker-compose.yml 直接使用本地镜像 ###

确保 docker-compose.yml 中使用正确的镜像名：

```yaml
services:
  redis:
    image: redis:7.2-alpine
    # ... 其他配置
```
