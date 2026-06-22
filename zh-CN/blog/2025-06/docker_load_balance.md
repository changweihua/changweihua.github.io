---
lastUpdated: true
commentabled: true
recommended: true
title: 基于Nginx的负载均衡部署
description: 基于Nginx的负载均衡部署
date: 2025-06-03 10:45:00 
pageClass: blog-page-class
cover: /covers/Dockerfile.svg
---

# 基于Nginx的负载均衡部署 #

随着业务增长，单个应用实例可能无法满足高并发需求。本章节介绍如何使用Nginx实现若依应用的负载均衡部署，提升系统的可用性和处理能力。

## 负载均衡架构说明 ##

### 架构组件 ###

- **Nginx负载均衡器**：作为入口，分发请求到后端应用实例
- **多个应用实例**：提供冗余和负载分担
- **共享数据层**：MySQL和Redis供所有应用实例共享

### 优势 ###

- 提高系统吞吐量
- 增强服务可用性
- 支持滚动更新
- 故障自动转移

## Nginx配置文件 ##

创建 `docker/nginx/nginx.conf`：

```text
# Nginx主配置文件
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'upstream_addr=$upstream_addr upstream_status=$upstream_status '
                    'request_time=$request_time upstream_response_time=$upstream_response_time';

    access_log /var/log/nginx/access.log main;

    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/xml+rss application/json;

    # 若依应用负载均衡配置
    upstream app_backend {
        # 负载均衡策略：默认轮询
        # 可选策略：ip_hash, least_conn, random
        
        # 应用实例1
        server app-1:8080 weight=1 max_fails=3 fail_timeout=30s;
        # 应用实例2  
        server app-2:8080 weight=1 max_fails=3 fail_timeout=30s;
        
        # 健康检查配置
        keepalive 32;
    }

    server {
        listen 80;
        server_name localhost;
        
        # 访问日志
        access_log /var/log/nginx/app_access.log main;
        
        # 健康检查端点
        location /nginx-health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
        
        # 主应用代理
        location / {
            proxy_pass http://app_backend;
            
            # 代理头设置
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # 超时设置
            proxy_connect_timeout 30s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
            
            # 缓冲设置
            proxy_buffering on;
            proxy_buffer_size 8k;
            proxy_buffers 8 8k;
            
            # 连接复用
            proxy_http_version 1.1;
            proxy_set_header Connection "";
        }
        
        # 静态资源缓存
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
            proxy_pass http://app_backend;
            proxy_set_header Host $host;
            
            # 缓存配置
            expires 1d;
            add_header Cache-Control "public, immutable";
        }
        
        # API接口代理
        location /api/ {
            proxy_pass http://app_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            
            # API特殊配置
            proxy_read_timeout 120s;
        }
    }

    # 负载均衡状态页面
    server {
        listen 8090;
        server_name localhost;
        
        location /nginx_status {
            stub_status on;
            access_log off;
            allow 172.16.0.0/12;  # 允许内网访问
            deny all;
        }
    }
}
```

## 负载均衡Docker Compose配置 ##

创建`docker-compose-loadbalancer.yml`：

```yml
services:
  # MySQL数据库（共享）
  mysql:
    image: mysql:8.0
    container_name: app-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: ry
      MYSQL_USER: app
      MYSQL_PASSWORD: 123456
      TZ: Asia/Shanghai
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/conf/my.cnf:/etc/mysql/conf.d/my.cnf
      - ./docker/mysql/init:/docker-entrypoint-initdb.d
      - mysql_logs:/var/log/mysql
    command: --default-authentication-plugin=mysql_native_password
    networks:
      - app-network

  # Redis缓存（共享）
  redis:
    image: redis:7-alpine
    container_name: app-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      - ./docker/redis/redis.conf:/etc/redis/redis.conf
    command: redis-server /etc/redis/redis.conf
    networks:
      - app-network

  # 应用实例1
  app-1:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: app-1
    restart: always
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=druid
      - TZ=Asia/Shanghai
      - SERVER_PORT=8080
      - INSTANCE_NAME=app-1
    volumes:
      - app1_logs:/app/logs
      - app_upload:/app/upload  # 共享上传目录
    depends_on:
      - mysql
      - redis
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # 应用实例2
  app-2:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: app-2
    restart: always
    ports:
      - "8081:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=druid
      - TZ=Asia/Shanghai
      - SERVER_PORT=8080
      - INSTANCE_NAME=app-2
    volumes:
      - app2_logs:/app/logs
      - app_upload:/app/upload  # 共享上传目录
    depends_on:
      - mysql
      - redis
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # Nginx负载均衡器
  nginx:
    image: nginx:1.24-alpine
    container_name: app-nginx
    restart: always
    ports:
      - "80:80"
      - "8090:8090"  # 状态监控端口
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf
      - nginx_logs:/var/log/nginx
    depends_on:
      - app-1
      - app-2
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/nginx-health"]
      interval: 30s
      timeout: 10s
      retries: 3

# 网络配置
networks:
  app-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

# 数据卷配置
volumes:
  mysql_data:
    driver: local
  mysql_logs:
    driver: local
  redis_data:
    driver: local
  app1_logs:
    driver: local
  app2_logs:
    driver: local
  app_upload:
    driver: local
  nginx_logs:
    driver: local
```

## 负载均衡部署步骤 ##

### 创建目录结构 ###

```bash
# 创建Nginx配置目录
mkdir -p docker/nginx

# 复制配置文件
# 将上述nginx.conf内容保存到docker/nginx/nginx.conf
```

### 修改Dockerfile支持健康检查 ###

更新Dockerfile添加wget支持：

```dockerfile
# 使用OpenJDK 8作为基础镜像
FROM openjdk:8-jre-alpine

# 设置维护者信息
LABEL maintainer="app@example.com"

# 安装wget用于健康检查
RUN apk add --no-cache wget tzdata && \
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

# 创建应用目录
WORKDIR /app

# 复制jar包到容器
COPY target/app-admin.jar app.jar

# 暴露端口
EXPOSE 8080

# 设置JVM参数
ENV JAVA_OPTS="-Xmx512m -Xms512m"

# 启动应用
ENTRYPOINT exec java $JAVA_OPTS -jar app.jar
```

### 启动负载均衡集群 ###

```bash
# 清理并打包项目
mvn clean package -DskipTests

# 使用负载均衡配置启动服务
docker-compose -f docker-compose-loadbalancer.yml up -d

# 查看所有服务状态
docker-compose -f docker-compose-loadbalancer.yml ps

# 查看Nginx日志
docker-compose -f docker-compose-loadbalancer.yml logs -f nginx
```

## 验证负载均衡效果 ##

### 基础连通性测试 ###

```bash
# 测试Nginx代理
curl -I http://localhost/

# 测试健康检查
curl http://localhost/nginx-health

# 查看Nginx状态
curl http://localhost:8090/nginx_status
```

### 负载分发测试 ###

创建测试脚本 `test_loadbalance.sh`：

```bash
#!/bin/bash

echo "开始负载均衡测试..."

# 发送10个请求，观察负载分发情况
for i in {1..10}; do
    echo "请求 $i:"
    curl -s -H "Cache-Control: no-cache" http://localhost/ | grep -o "实例.*" || echo "  请求处理完成"
    sleep 1
done

echo "查看Nginx访问日志（最后10条）："
docker exec app-nginx tail -10 /var/log/nginx/app_access.log
```

### 故障转移测试 ###

```bash
# 停止一个应用实例
docker stop app-1

# 测试服务是否仍可用
curl http://localhost/

# 查看Nginx错误日志
docker exec app-nginx tail -20 /var/log/nginx/error.log

# 重启停止的实例
docker start app-1
```

## 监控和调优 ##

### 实时监控脚本 ###

创建 `monitor_cluster.sh`：

```bash
#!/bin/bash

echo "=== 若依集群监控面板 ==="

while true; do
    clear
    echo "时间: $(date)"
    echo "================================="
    
    # 容器状态
    echo "容器状态:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep app
    echo ""
    
    # Nginx状态
    echo "Nginx状态:"
    curl -s http://localhost:8090/nginx_status 2>/dev/null || echo "Nginx状态页面不可用"
    echo ""
    
    # 系统资源
    echo "资源使用:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep app
    echo ""
    
    echo "按Ctrl+C退出监控"
    sleep 5
done
```

### 性能调优建议 ###

#### Nginx调优参数 ####

```nginx
# 在nginx.conf的http块中添加
worker_processes auto;
worker_connections 2048;

# 优化upstream配置
upstream app_backend {
    least_conn;  # 使用最少连接负载均衡
    server app-1:8080 weight=1 max_fails=2 fail_timeout=10s;
    server app-2:8080 weight=1 max_fails=2 fail_timeout=10s;
    keepalive 64;
}
```

#### 应用实例调优 ####

```yaml
# 在docker-compose中调整应用资源
app-1:
  deploy:
    resources:
      limits:
        memory: 1G
        cpus: '0.5'
      reservations:
        memory: 512M
        cpus: '0.25'
```
