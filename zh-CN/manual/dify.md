---
outline: false
aside: false
layout: doc
date: 2025-05
title: Dify
description: 架构、部署、扩展与二次开发指南
category: 文档
pageClass: manual-page-class
---

# Dify - 架构、部署、扩展与二次开发指南 #

本文详细解析 Dify 的架构、部署流程、高可用中间件的独立部署方法，以及二次开发流程，帮助开发者更高效地管理和扩展 Dify。

## 本地DEMO部署 ##

安装 Docker 和 Docker Compose ，执行下面脚本，可能需要配置镜像。

```bash
git clone https://github.com/langgenius/dify.git
cd dify
cd docker
cp .env.example .env
docker compose up -d
```

![示例图](/images/dify1.png)

## Dify 部署后的整体结构 ##

Dify 使用容器部署，主要由多个模块组成，分为 Dify 核心服务、中间件组件 和 存储支持，所有流量经过 Nginx 反向代理 进行管理。

![示例图](/images/dify2.png)

### Dify 核心服务 ###

|  组件  |  作用  |  端口  |
|  :---  |  :----:  |  :---  |
| api | 核心 API 服务，处理用户请求 | 5001 |
| work | 核心任务服务，处理用户任务执行 | 请求前或请求聚合时 |
| web | Web 前端 | 3000 |
| plugin_daemon | 插件管理守护进程 | 5002 |
| sandbox | 代码沙箱，提供安全执行环境，执行shell、调用url | 8194 |

### 中间件 ###

Dify 依赖多个中间件组件来存储数据和提供缓存支持：

|  组件  |  作用  |  端口  |
|  :---  |  :----:  |  :---  |
| PostgreSQL | 主要数据库，存储核心数据 | 5432 |
| Redis | 缓存层，提升性能 | 6379 |
| Weaviate / Qdrant / Milvus/… | 向量数据库，支持多种向量数据库 | 8080 (Weaviate), 6333 (Qdrant), 19530 (Milvus) |
| ssrf_proxy | 请求代理，使用squid，防止 SSRF 攻击 | 3128 |

### Nginx 作为网关 ###

Nginx 充当反向代理，管理所有流量：

- `nginx:80` 处理所有进入的流量，并路由到 `web:3000`、`api:5001`、`plugin_daemon:5002`。
- `plugin_daemon:5002` 可连接到 `Marketplace`，连接 `Marketplace` 需要 `Docker` 配置代理。

### 一个专用网络 ###

在sandbox、api和ssrf_proxy之间创建一个网络，sandbox不能直接访问外部，防止SSRF攻击。

## 如何单独部署高可用中间件 ##

如果希望将 PostgreSQL、Redis 等中间件独立部署以提升可靠性，可以参考以下方式。

### 部署高可用 PostgreSQL ###

可以使用 *PostgreSQL* 主从复制 或 *Patroni + etcd* 方案：

```yml
services:
  db_primary:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: "difyai123456"
      POSTGRES_DB: "dify"
    volumes:
      - ./volumes/db/primary:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  db_replica:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: "difyai123456"
      POSTGRES_DB: "dify"
      POSTGRES_REPLICATION_ROLE: "replica"
      POSTGRES_PRIMARY_HOST: "db_primary"
    volumes:
      - ./volumes/db/replica:/var/lib/postgresql/data
```

修改 `.env` 或 `docker-compose.yaml` 配置 PostgreSQL 地址：

```yml
environment:
  DB_HOST: "your-external-postgres-host"
  DB_PORT: "5432"
```

### 部署高可用 Redis ###

使用 Redis Sentinel 进行高可用部署：

```yml
services:
  redis_master:
    image: redis:6-alpine
    command: redis-server --requirepass "difyai123456"
    ports:
      - "6379:6379"

  redis_sentinel:
    image: bitnami/redis-sentinel
    environment:
      REDIS_MASTER_HOST: "redis_master"
      REDIS_MASTER_PASSWORD: "difyai123456"
    ports:
      - "26379:26379"
```

修改 `.env` 或 `docker-compose.yaml` 配置 Redis 地址：

```yml
environment:
  REDIS_HOST: "your-external-redis-host"
  REDIS_PORT: "6379"
```

### 部署外部向量数据库 ###

Dify 支持 Milvus, Qdrant, Weaviate 等向量数据库，独立部署方式如下：

```yml
services:
  milvus:
    image: milvusdb/milvus:v2.5.0-beta
    ports:
      - "19530:19530"
```

修改 `docker-compose.yaml` 配置 Milvus 地址：

```yaml
environment:
  VECTOR_STORE: "milvus"
  MILVUS_URI: "http://your-external-milvus-host:19530"
```

## 如何进行二次开发 ##

![示例图](/images/dify3.png)

### 修改代码 ###

如果需要修改 Dify API 代码，例如添加自定义 API 端点：

1. 克隆 Dify 代码仓库：

```bash
git clone https://github.com/langgenius/dify.git
cd dify
```

2. 进入 api 目录，修改 Python 代码：

```bash
cd api
vim app/routes/custom.py
```

**示例：添加新接口**

```python
from flask import Blueprint, jsonify

custom_api = Blueprint('custom_api', __name__)

@custom_api.route('/custom-endpoint', methods=['GET'])
def custom_endpoint():
    return jsonify({'message': 'Hello from custom API!'})

app.register_blueprint(custom_api)
```

### 重新打包 API 镜像 ###

1. 进入 api 目录，构建新的 API 镜像：

```bash
docker build -t dify-api-custom .
```

2. 修改 docker-compose.yaml 以使用自定义镜像：

```yaml
services:
  api:
    image: dify-api-custom
```

3. 重新部署：

```bash
docker-compose down && docker-compose up -d
```

### 修改 Web 前端 ###

1. 进入 web 目录：

```bash
cd web
vim src/pages/index.tsx
```

2. 重新构建 Web 镜像：

```bash
docker build -t dify-web-custom .
```

3. 修改 docker-compose.yaml 以使用自定义镜像：

```yml
services:
  web:
    image: dify-web-custom
```

4. 重新部署：

```bash
docker-compose down && docker-compose up -d
```

### 修改环境变量 ###

Dify 依赖多个 .env 配置文件：

- 修改 middleware.env （用于中间件）
- 修改 .env（用于核心 API）

例如，修改 .env 使用阿里云 OSS：

```ini
STORAGE_TYPE=opendal
OPENDAL_SCHEME=oss
ALIYUN_OSS_BUCKET_NAME=your-bucket-name
ALIYUN_OSS_ACCESS_KEY=your-access-key
ALIYUN_OSS_SECRET_KEY=your-secret-key
ALIYUN_OSS_ENDPOINT=https://oss-cn-shanghai.aliyuncs.com
```

## 总结 ##

- **Dify 架构**：由 API、Web 前端、插件系统、沙箱环境和多个中间件组成。
- **独立部署高可用中间件**：可以单独部署 PostgreSQL、Redis 和向量数据库，并修改 docker-compose.middleware.yaml 进行配置。
- **二次开发流程**：
  - 修改 api 或 web 代码
  - 重新打包 Docker 镜像
  - 修改 docker-compose.yaml 使其使用新的镜像
  - 修改 .env 适配存储配置

通过本指南，你可以更高效地管理 Dify 的部署、扩展和二次开发，提高 AI 应用的灵活性和可维护性。
