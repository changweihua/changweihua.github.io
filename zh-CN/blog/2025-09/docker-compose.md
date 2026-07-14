---
lastUpdated: true
commentabled: true
recommended: true
title: Docker Compose 完全指南
description: 从入门到实战部署
date: 2025-09-24 15:00:00 
pageClass: blog-page-class
cover: /covers/docker.svg
---

## 前言 ##

在现代应用开发中，微服务架构已成为主流，一个应用往往由多个相互关联的服务组成。手动管理这些服务的启动、停止和互联变得异常复杂。Docker Compose 应运而生，它通过一个简单的 YAML 文件就能定义和运行多容器 Docker 应用，极大地简化了容器化应用的管理工作。

## 一、Docker Compose 是什么？ ##

### 核心概念 ###

Docker Compose 是一个用于定义和运行多容器 Docker 应用程序的工具。它允许您使用一个单独的 YAML 文件来配置应用的所有服务，然后通过一条命令就能创建并启动所有服务。

### 与原生 Docker 的区别 ###

|  特性   |  Docker CLI  |  Docker Compose  | 
| :-----------: | :-----------: | :-----------: |
| 单容器管理 | ✅ 优秀 | ⚠️ 支持但非主要用途 |
| 多容器管理 | ❌ 复杂，需要脚本 | ✅ 优秀，原生支持 |
| 配置方式 | 命令行参数 | YAML 声明式文件 |
| 依赖管理 | 手动处理 | 自动处理服务依赖 |
| 环境复现 | 困难 | 简单且一致 |

## 二、安装 Docker Compose ##

### 在不同系统上的安装 ###

Linux 系统安装：

```bash
# 下载最新版本的 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 授予执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version

Windows/macOS 安装：
Docker Desktop 已经包含了 Docker Compose，无需单独安装。
bash 体验AI代码助手 代码解读复制代码# 验证安装
docker compose version
```

### 升级 Docker Compose ###

```bash
# 查看当前版本
docker-compose --version

# 下载新版本
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 重新授权
sudo chmod +x /usr/local/bin/docker-compose
```

## 三、为什么要使用 Docker Compose？ ##

### 解决的主要痛点 ###

- **简化多容器管理**：一条命令管理所有服务
- **环境一致性**：确保开发、测试、生产环境一致
- **快速搭建开发环境**：新成员只需一条命令即可获得完整环境
- **服务依赖管理**：自动处理服务启动顺序
- **配置即代码**：版本控制所有环境配置

### 适用场景 ###

- 本地开发环境搭建
- 自动化测试环境
- 单主机小型部署
- CI/CD 流水线中的测试阶段
- 演示和教学环境

## 四、Docker Compose 核心概念 ##

### 核心组件 ###

- **Service**：一个容器化的应用/服务
- **Project**：由多个服务组成的完整应用
- **Compose File**：定义服务、网络、卷的 YAML 文件

### 文件结构 ###

典型的 Docker Compose 项目结构：

```text
my-app/
├── docker-compose.yml    # 主配置文件
├── .env                  # 环境变量文件
├── backend/              # 后端服务目录
│   ├── Dockerfile
│   └── src/
├── frontend/             # 前端服务目录
│   ├── Dockerfile
│   └── src/
└── database/             # 数据库初始化脚本
    └── init.sql
```

## 五、Docker Compose 文件语法详解 ##

### 文件版本和结构 ###

```yaml
version: '3.8'  # Compose 文件版本

services:       # 定义服务
  web:          # 服务名称
    build: .    # 构建配置
    ports:
      - "5000:5000"

  redis:
    image: "redis:alpine"

networks:       # 定义网络
  app-network:
    driver: bridge

volumes:        # 定义数据卷
  db-data:
    driver: local
```

### 常用配置指令详解 ###

基本配置：

```yaml
services:
  webapp:
    image: nginx:latest          # 使用现有镜像
    container_name: my-nginx     # 指定容器名称
    restart: unless-stopped      # 重启策略
    depends_on:                  # 服务依赖
      - db
      - redis
```

构建配置：

```yaml
services:
  app:
    build:
      context: ./dir            # 构建上下文路径
      dockerfile: Dockerfile    # Dockerfile 文件名
      args:                     # 构建参数
        buildno: 1
        user: someuser
```

网络配置：

```yaml
services:
  web:
    networks:                  # 网络配置
      - frontend
      - backend

networks:
  frontend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.16.238.0/24
  backend:
    driver: bridge
```

数据卷配置：

```yaml
services:
  db:
    volumes:
      - db-data:/var/lib/mysql        # 命名卷
      - ./logs:/app/logs              # 绑定挂载
      - /etc/localtime:/etc/localtime:ro  # 只读挂载

volumes:
  db-data:
    driver: local
    driver_opts:
      type: nfs
      o: addr=192.168.1.1,rw
      device: ":/path/to/nfs"
```

环境变量配置：

```yaml
services:
  web:
    environment:
      - DATABASE_HOST=db
      - REDIS_HOST=redis
      - DEBUG=false
    env_file:
      - ./common.env
      - ./apps/web.env
```

## 六、Docker Compose 常用命令 ##

### 基本操作命令 ###

```bash
# 启动所有服务（后台模式）
docker-compose up -d

# 启动特定服务
docker-compose up -d web redis

# 停止所有服务
docker-compose down

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs
docker-compose logs -f web  # 跟踪特定服务日志

# 重启服务
docker-compose restart web

# 暂停和恢复服务
docker-compose pause web
docker-compose unpause web
```

### 调试和维护命令 ###

```bash
# 在运行中的容器中执行命令
docker-compose exec web bash
docker-compose exec db mysql -u root -p

# 运行一次性命令
docker-compose run --rm web python manage.py migrate

# 查看服务配置
docker-compose config

# 查看服务依赖图
docker-compose images

# 强制重建镜像
docker-compose build --no-cache

# 缩放服务实例数量
docker-compose up --scale web=3 --scale worker=2
```

## 七、实战案例：部署 WordPress 网站 ##

### 项目结构 ###

```text
wordpress-site/
├── docker-compose.yml
├── .env
├── mysql/
│   └── init.sql
└── wordpress/
    └── wp-config.php
```

### Docker Compose 配置文件 ###

```yaml
version: '3.8'

services:
  # 数据库服务
  db:
    image: mysql:8.0
    container_name: wordpress_db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql
      - ./mysql/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - wordpress_network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 30s
      timeout: 10s
      retries: 5

  # WordPress 服务
  wordpress:
    image: wordpress:6.3
    container_name: wordpress_app
    restart: always
    depends_on:
      db:
        condition: service_healthy
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: ${DB_USER}
      WORDPRESS_DB_PASSWORD: ${DB_PASSWORD}
      WORDPRESS_DB_NAME: ${DB_NAME}
    volumes:
      - wp_data:/var/www/html
      - ./wordpress/wp-config.php:/var/www/html/wp-config.php
    ports:
      - "80:80"
    networks:
      - wordpress_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 5

  # phpMyAdmin 数据库管理
  phpmyadmin:
    image: phpmyadmin:latest
    container_name: wordpress_phpmyadmin
    restart: always
    depends_on:
      - db
    environment:
      PMA_HOST: db
      PMA_PORT: 3306
      PMA_USER: ${DB_USER}
      PMA_PASSWORD: ${DB_PASSWORD}
    ports:
      - "8080:80"
    networks:
      - wordpress_network

volumes:
  db_data:
    driver: local
  wp_data:
    driver: local

networks:
  wordpress_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### 环境变量文件 (.env) ###

```ini
# 数据库配置
DB_ROOT_PASSWORD=secure_root_password_123
DB_NAME=wordpress_db
DB_USER=wordpress_user
DB_PASSWORD=secure_password_456

# WordPress 配置
WP_DEBUG=false
WP_HOME=http://localhost
```

### 部署和操作 ###

```bash
# 进入项目目录
cd wordpress-site

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止服务并删除数据卷
docker-compose down -v

# 备份数据卷
docker run --rm -v wordpress-site_db_data:/source -v $(pwd):/backup alpine tar czf /backup/db-backup-$(date +%Y%m%d).tar.gz -C /source .

# 扩展WordPress实例（负载均衡）
docker-compose up -d --scale wordpress=3
```

## 八、实战案例：部署微服务应用 ##

### 复杂的微服务架构 ###

```yaml
version: '3.8'

x-common-variables: &common-variables
  SPRING_PROFILES_ACTIVE: docker
  EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE: http://discovery:8761/eureka

services:
  # 服务发现
  discovery:
    image: springcloud/eureka-server:latest
    container_name: eureka-discovery
    ports:
      - "8761:8761"
    networks:
      - microservices-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8761"]
      interval: 30s

  # API 网关
  gateway:
    build: ./api-gateway
    container_name: api-gateway
    ports:
      - "8080:8080"
    environment:
      <<: *common-variables
    depends_on:
      - discovery
    networks:
      - microservices-net
    restart: on-failure

  # 用户服务
  user-service:
    build: ./user-service
    container_name: user-service
    environment:
      <<: *common-variables
      DATABASE_URL: jdbc:postgresql://user-db:5432/userdb
    depends_on:
      - discovery
      - user-db
    networks:
      - microservices-net
    deploy:
      replicas: 2

  # 订单服务
  order-service:
    build: ./order-service
    container_name: order-service
    environment:
      <<: *common-variables
      DATABASE_URL: jdbc:postgresql://order-db:5432/orderdb
    depends_on:
      - discovery
      - order-db
    networks:
      - microservices-net

  # 数据库服务
  user-db:
    image: postgres:13
    container_name: user-database
    environment:
      POSTGRES_DB: userdb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password123
    volumes:
      - user-data:/var/lib/postgresql/data
      - ./init/user-db-init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - microservices-net

  order-db:
    image: postgres:13
    container_name: order-database
    environment:
      POSTGRES_DB: orderdb
      POSTGRES_USER: order
      POSTGRES_PASSWORD: password123
    volumes:
      - order-data:/var/lib/postgresql/data
    networks:
      - microservices-net

  # 监控服务
  zipkin:
    image: openzipkin/zipkin:latest
    container_name: zipkin
    ports:
      - "9411:9411"
    networks:
      - microservices-net

  adminer:
    image: adminer:latest
    container_name: adminer
    ports:
      - "8081:8080"
    networks:
      - microservices-net

volumes:
  user-data:
    driver: local
  order-data:
    driver: local

networks:
  microservices-net:
    driver: bridge
    ipam:
      config:
        - subnet: 172.25.0.0/16
```

### 操作和管理微服务 ###

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 只构建和启动特定服务
docker-compose up -d --build gateway user-service

# 查看服务日志
docker-compose logs -f gateway

# 扩展用户服务实例
docker-compose up -d --scale user-service=3

# 执行数据库迁移
docker-compose run --rm user-service ./migrate.sh

# 监控服务状态
docker-compose ps
docker-compose top

# 进入容器调试
docker-compose exec user-service bash

# 更新特定服务
docker-compose build user-service
docker-compose up -d --no-deps user-service
```

## 九、最佳实践和高级技巧 ##

### 配置文件优化 ###

使用多个 Compose 文件：

```bash
# 基础配置文件
docker-compose.yml

# 开发环境覆盖配置
docker-compose.override.yml

# 生产环境配置
docker-compose.prod.yml

# 使用多个配置文件
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

环境特定的配置：

```yaml
# docker-compose.override.yml（开发环境）
version: '3.8'

services:
  web:
    volumes:
      - ./src:/app/src  # 代码热重载
    ports:
      - "9229:9229"     # 调试端口
    environment:
      - NODE_ENV=development
      - DEBUG=true

  db:
    ports:
      - "5432:5432"     # 暴露数据库端口
```

### 性能和资源管理 ###

```yaml
services:
  web:
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 安全最佳实践 ###

```yaml
services:
  database:
    read_only: true  # 容器只读
    security_opt:
      - no-new-privileges:true
    tmpfs:
      - /tmp:rw,size:64M

  app:
    user: "1000:1000"  # 非root用户运行
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

## 十、常见问题排查 ##

### 网络连接问题 ###

```bash
# 检查网络配置
docker-compose network ls

# 检查服务DNS解析
docker-compose exec web nslookup database

# 查看端口映射
docker-compose port web 80
```

### 服务启动失败 ###

```bash
# 查看详细错误信息
docker-compose logs --tail=100 web

# 强制重建服务
docker-compose up -d --force-recreate web

# 检查服务依赖
docker-compose config --services
```

### 资源冲突处理 ###

```bash
# 解决端口冲突
docker-compose down
sudo lsof -i :8080  # 查找占用端口的进程

# 解决卷冲突
docker-compose down -v
docker volume prune
```

## 总结 ##

Docker Compose 是一个极其强大的工具，它通过声明式的 YAML 配置文件简化了多容器应用的管理。通过本文的学习，你应该能够：

- 理解 Docker Compose 的核心概念和价值主张
- 掌握 Compose 文件的语法和结构，能够编写复杂的配置
- 使用各种 Compose 命令来管理应用生命周期
- 部署实际项目，如 WordPress 和微服务架构
- 遵循最佳实践，确保配置的可维护性和安全性

记住，Docker Compose 特别适合开发、测试和单机部署场景。对于生产环境的多机部署，建议考虑 Docker Swarm 或 Kubernetes 等编排工具。

通过不断实践和探索，你将能够充分利用 Docker Compose 的强大功能，显著提高开发效率和部署可靠性。
