---
lastUpdated: true
commentabled: true
recommended: true
title: 使用 Docker Compose 部署单机版 Redis
description: 简单高效的数据缓存与存储
date: 2026-04-21 09:45:00 
pageClass: blog-page-class
cover: /covers/docker.svg
---

## 什么是 Redis？ ##

Redis（Remote Dictionary Server的缩写）是一个开源的内存数据存储系统，它可以用作数据库、缓存和消息中间件。Redis 支持多种数据结构，包括字符串、列表、哈希、集合、有序集合等，这些数据结构使得 Redis 在处理数据时非常灵活高效。

Redis 的优点：

- 高性能：Redis 将数据存储在内存中，因此读写速度非常快，适用于高并发读写的场景。
- 持久化：Redis 支持数据持久化到硬盘，保证数据不会因为服务器重启而丢失。
- 丰富的数据结构：Redis 支持多种数据结构，适用于各种不同的应用场景。
- 分布式：虽然本文介绍的是单机版 Redis，但 Redis 本身支持分布式部署，能够满足大规模应用的需求。

## 使用 Docker Compose 部署 Redis ##

在开始之前，请确保你已经安装了 Docker 和 Docker Compose。如果还没有安装，你可以根据你的操作系统类型，参考 Docker 和 Docker Compose 的官方文档进行安装。

以下是使用 Docker Compose 部署 Redis 的简单步骤：

### 第一步：创建 Docker Compose 文件 ###

在你喜欢的文本编辑器中创建一个名为 `docker-compose.yml` 的文件，并将以下内容复制粘贴进去：

```yml
services:
  redis:
    image: redis:latest
    container_name: redis
    restart: always
    ports:
      - '6379:6379'
    volumes:
      - ./data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
      - ./logs:/logs
    #配置文件启动
    command: redis-server /usr/local/etc/redis/redis.conf
```

这个 Docker Compose 文件定义了一个名为 redis 的服务，使用了 Redis 官方镜像，将容器的 6379 端口映射到主机的 6379 端口（Redis 默认端口）。

#### 配置文件 redis.conf ####

```conf
# Redis 服务器的端口号（默认：6379）
port 6379

# 绑定的 IP 地址，如果设置为 127.0.0.1，则只能本地访问；若设置为 0.0.0.0，则监听所有接口（默认：127.0.0.1）
bind 0.0.0.0

# 设置密码，客户端连接时需要提供密码才能进行操作，如果不设置密码，可以注释掉此行（默认：无）
# requirepass foobared
requirepass xj2023

# 设置在客户端闲置一段时间后关闭连接，单位为秒（默认：0，表示禁用）
# timeout 0

# 是否以守护进程（daemon）模式运行，默认为 "no"，设置为 "yes" 后 Redis 会在后台运行
daemonize no

# 设置日志级别（默认：notice）。可以是 debug、verbose、notice、warning
loglevel notice

# 设置日志文件的路径（默认：空字符串），如果不设置，日志会输出到标准输出
logfile ""

# 设置数据库数量（默认：16），Redis 使用数据库索引从 0 到 15
databases 16

# 是否启用 AOF 持久化，默认为 "no"。如果设置为 "yes"，将在每个写操作执行时将其追加到文件中
appendonly no

# 设置 AOF 持久化的文件路径（默认：appendonly.aof）
# appendfilename "appendonly.aof"

# AOF 持久化模式，默认为 "always"。可以是 always、everysec 或 no
# always：每个写操作都立即同步到磁盘
# everysec：每秒钟同步一次到磁盘
# no：完全依赖操作系统的行为，可能会丢失数据，但性能最高
# appendfsync always

# 设置是否在后台进行 AOF 文件重写，默认为 "no"
# auto-aof-rewrite-on-rewrite no

# 设置 AOF 文件重写触发时，原 AOF 文件大小与新 AOF 文件大小之间的比率（默认：100）
# auto-aof-rewrite-percentage 100

# 设置是否开启 RDB 持久化，默认为 "yes"。如果设置为 "no"，禁用 RDB 持久化功能
save 900 1
save 300 10
save 60 10000

# 设置 RDB 持久化文件的名称（默认：dump.rdb）
# dbfilename dump.rdb

# 设置 RDB 持久化文件的保存路径，默认保存在当前目录
# dir ./

# 设置是否开启对主从同步的支持，默认为 "no"
# slaveof <masterip> <masterport>

# 设置主从同步时是否进行数据完整性校验，默认为 "yes"
# repl-diskless-sync no

# 设置在复制时是否进行异步复制，默认为 "yes"，可以加快复制速度，但会增加数据丢失的风险
# repl-backlog-size 1mb

# 设置是否开启集群模式（cluster mode），默认为 "no"
# cluster-enabled no

# 设置集群中的节点超时时间（默认：15000毫秒）
# cluster-node-timeout 15000

# 设置集群中节点间通信使用的端口号（默认：0）
# cluster-announce-port 0

# 设置集群中节点间通信使用的 IP 地址
# cluster-announce-ip 127.0.0.1

# 设置是否开启慢查询日志，默认为 "no"
# slowlog-log-slower-than 10000

# 设置慢查询日志的最大长度，默认为 128
# slowlog-max-len 128

# 设置每秒最大处理的写入命令数量，用于保护 Redis 服务器不被超负荷写入（默认：0，表示不限制）
# maxclients 10000

# 设置最大连接客户端数量（默认：10000，0 表示不限制）
# maxmemory <bytes>

# 设置最大使用内存的策略（默认：noeviction）。可以是 volatile-lru、allkeys-lru、volatile-random、allkeys-random、volatile-ttl 或 noeviction
# maxmemory-policy noeviction

# 设置允许最大使用内存的比例（默认：0），设置为 0 表示禁用
# maxmemory-samples 5
```

详细redis.conf文件大家可参考redis官方文档。

### 第二步：运行 Docker Compose ###

保存好 `docker-compose.yml` 文件后，打开终端或命令行，进入到存放该文件的目录，并执行以下命令：

```bash
docker-compose up -d
```

这个命令会启动 Redis 容器，并在后台运行。如果一切顺利，你应该会看到类似以下输出：

```txt
Attaching to redis
redis    | 1:C 31 Jul 2023 14:59:35.753 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
redis    | 1:C 31 Jul 2023 14:59:35.753 # Redis version=6.2.6, bits=64, commit=00000000, modified=0, pid=1, just started
redis    | 1:C 31 Jul 2023 14:59:35.756 # Configuration loaded
redis    | 1:M 31 Jul 2023 14:59:35.757 * monotonic clock: POSIX clock_gettime
redis    | 1:M 31 Jul 2023 14:59:35.758 * Running mode=standalone, port=6379.
redis    | 1:M 31 Jul 2023 14:59:35.758 # Server initialized
```

### 第三步：连接到 Redis ###

现在，Redis 已经在 Docker 容器中运行起来了。你可以使用任何支持 Redis 的客户端工具来连接到它，例如 redis-cli。

如果你的ubuntu服务器上未安转 `redis-cli`，可以直接在终端中输入以下命令安转：

```bash
sudo apt install redis-tools
```

安转成功之后连接到redis

```bash
redis-cli -h 192.168.10.108 -p 6379   -a 'xj2023'  --raw
```

如果一切顺利，你应该能够看到 Redis 客户端的命令行提示符，表示你已经成功连接到 Redis 服务器。

### 第四步：开始使用 Redis ###

恭喜你！现在你已经成功地使用 Docker Compose 部署了单机版 Redis。你可以使用 Redis 的各种命令来进行数据的读写、存储、删除等操作。比如：

- 存储数据：

```bash
set xj "修己!"
```

- 获取数据：

```bash
get xj
```

- 删除数据：

```bash
del xj
```

这只是 Redis 提供的众多功能中的一小部分，更多命令和用法你可以在 Redis 的官方文档中找到。

## 总结 ##

在本文中，我们学习了如何使用 Docker Compose 快速部署单机版 Redis。Docker Compose 的优势在于能够简化多容器应用的管理，并且使得部署过程更加便捷。Redis 作为一个简单高效的数据缓存与存储解决方案，适用于各种不同规模的应用场景。

希望本文对你理解并使用 Redis 与 Docker Compose 有所帮助。如果你对 Redis 的更多高级特性感兴趣，比如持久化配置、集群模式等，建议你继续深入学习 Redis 的官方文档。谢谢阅读，祝你在使用 Redis 中取得成功！
