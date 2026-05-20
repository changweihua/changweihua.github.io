---
lastUpdated: true
commentabled: true
recommended: true
title: Docker 部署 Spring Boot 项目完整指南
description: 从零到生产环境
date: 2026-03-18 10:35:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 前言 ##

在当今的软件开发领域，容器化 技术已经成为应用部署的标准实践。Docker 作为容器技术的领导者，彻底改变了应用的打包、分发和运行方式。本指南将详细讲解如何使用 Docker 容器化部署 Java Spring Boot 项目，涵盖从基础概念到生产环境部署的完整流程。

## 第一章：Docker 基础概念与优势 ##

### 为什么选择 Docker？ ###

在传统部署方式中，我们常常遇到以下问题：

- 环境不一致：开发、测试、生产环境差异导致"在我机器上能运行"的问题
- 依赖冲突：不同应用需要不同版本的运行时环境
- 部署复杂：需要手动安装配置各种依赖和服务
- 资源浪费：每个应用独占完整操作系统资源

Docker 通过容器化技术解决了这些问题：

- 一致性：确保应用在任何环境运行一致
- 隔离性：应用运行在独立容器中，互不干扰
- 轻量级：容器共享主机操作系统内核，资源占用少
- 可移植性：一次构建，随处运行

### Docker 核心概念 ###

- 镜像（Image） ：只读模板，包含运行应用所需的所有内容
- 容器（Container） ：镜像的运行实例，是真正的执行环境
- 仓库（Registry） ：存储和分发镜像的地方（如 Docker Hub）
- Dockerfile：文本文件，包含构建镜像的指令

## 第二章：环境准备与安装 ##

### 系统要求 ###

- Linux（Ubuntu 18.04+、CentOS 7+）、macOS 或 Windows 10/11
- 至少 2GB RAM（建议 4GB 以上）
- 10GB 可用磁盘空间

### Docker 安装 ###

Ubuntu/Debian 系统安装：

```bash
# 1. 卸载旧版本（如果存在）
sudo apt-get remove docker docker-engine docker.io containerd runc
 
# 2. 更新 apt 包索引
sudo apt-get update
 
# 3. 安装依赖包
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
 
# 4. 添加 Docker 官方 GPG 密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
 
# 5. 设置稳定版仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
 
# 6. 更新 apt 包索引
sudo apt-get update
 
# 7. 安装 Docker Engine
sudo apt-get install docker-ce docker-ce-cli containerd.io
 
# 8. 验证安装是否成功
sudo docker --version
 
# 9. 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker
 
# 10. 测试运行 Hello World
sudo docker run hello-world
```

CentOS/RHEL 系统安装：

```bash
# 1. 卸载旧版本
sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine
 
# 2. 安装必要的包
sudo yum install -y yum-utils
 
# 3. 设置仓库
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo
 
# 4. 安装 Docker Engine
sudo yum install docker-ce docker-ce-cli containerd.io
 
# 5. 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker
 
# 6. 验证安装
sudo docker --version
sudo docker run hello-world
```

### 配置非 root 用户运行 Docker（可选但推荐） ###

```bash
# 创建 docker 用户组（如果不存在）
sudo groupadd docker
 
# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER
 
# 重新登录或使用以下命令立即生效
newgrp docker
 
# 验证非 root 用户是否能运行 Docker 命令
docker run hello-world
```

### 安装 Docker Compose ###

```bash
# 下载最新版本的 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.17.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
 
# 赋予执行权限
sudo chmod +x /usr/local/bin/docker-compose
 
# 创建软链接（如果需要）
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
 
# 验证安装
docker-compose --version
```

## 第三章：准备 Spring Boot 项目 ##

### 创建示例 Spring Boot 项目 ###

首先，我们创建一个简单的 Spring Boot 项目用于演示：

pom.xml（Maven 配置）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.5</version>
        <relativePath/>
    </parent>
    
    <groupId>com.example</groupId>
    <artifactId>docker-demo</artifactId>
    <version>1.0.0</version>
    <name>docker-demo</name>
    <description>Spring Boot Docker Demo Project</description>
    
    <properties>
        <java.version>11</java.version>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

项目结构：

```txt
docker-demo/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           └── dockerdemo/
│   │   │               ├── DockerDemoApplication.java
│   │   │               ├── controller/
│   │   │               │   └── HelloController.java
│   │   │               └── service/
│   │ │                   └── HelloService.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/
│   └── test/
├── Dockerfile
├── docker-compose.yml
└── pom.xml
```

HelloController.java：


```java:HelloController.java

package com.example.dockerdemo.controller;
 
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
 
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
 
@RestController
@RequestMapping("/api")
public class HelloController {
    
    @GetMapping("/hello")
    public Map<String, Object> hello() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Hello from Docker!");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", "success");
        return response;
    }
    
    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "docker-demo");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
}
```

application.properties：

```ini
# 应用配置
server.port=8080
server.servlet.context-path=/
 
# 应用信息
spring.application.name=docker-demo
 
# Actuator 配置
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=always
 
# 日志配置
logging.level.com.example.dockerdemo=DEBUG
logging.file.name=/var/log/docker-demo/app.log
```

### 构建项目 JAR 包 ###

```bash
# 进入项目根目录
cd docker-demo
 
# 使用 Maven 打包项目
mvn clean package
 
# 或者使用 Maven Wrapper（如果项目中有 mvnw）
./mvnw clean package
 
# 打包成功后，在 target 目录下会生成 JAR 文件
# docker-demo-1.0.0.jar
```

## 第四章：编写 Dockerfile ##

### Dockerfile 基础结构 ###

Dockerfile 是一个文本文件，包含了一系列构建 Docker 镜像的指令。每条指令都会在镜像 中创建一个新的层。

### 完整 Dockerfile 示例 ###

在项目根目录创建 Dockerfile（注意没有文件扩展名）：

```dockerfile
# 第一阶段：构建阶段
# 使用官方 Maven 镜像作为构建环境
FROM maven:3.8.4-openjdk-11-slim AS builder
 
# 设置工作目录
WORKDIR /app
 
# 复制 pom.xml 和源代码
COPY pom.xml .
COPY src ./src
 
# 下载依赖（利用 Docker 缓存层，如果 pom.xml 不变则不重新下载）
RUN mvn dependency:go-offline -B
 
# 构建应用（跳过测试以加快构建速度）
RUN mvn clean package -DskipTests
 
# 第二阶段：运行阶段
# 使用更小的 JRE 镜像作为运行环境
FROM openjdk:11-jre-slim
 
# 设置元数据标签（可选）
LABEL maintainer="your-email@example.com"
LABEL version="1.0"
LABEL description="Spring Boot application in Docker"
 
# 设置时区（根据需求调整）
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
 
# 创建一个非 root 用户运行应用（安全最佳实践）
RUN groupadd -r spring && useradd -r -g spring spring
USER spring
 
# 设置工作目录
WORKDIR /app
 
# 从构建阶段复制构建好的 JAR 文件
COPY --from=builder /app/target/docker-demo-*.jar app.jar
 
# 创建日志目录并设置权限
RUN mkdir -p /var/log/docker-demo && \
    chown -R spring:spring /var/log/docker-demo
 
# 暴露应用端口
EXPOSE 8080
 
# 设置 JVM 参数（根据实际情况调整）
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/docker-demo/heapdump.hprof"
 
# 启动应用
# 使用 exec 形式启动，确保 Java 进程成为 PID 1，能正确处理信号
ENTRYPOINT exec java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar app.jar
 
# 健康检查指令
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1
```

### Dockerfile 指令详解 ###

#### FROM：指定基础镜像 ####

- 使用多阶段构建：第一阶段用于构建，第二阶段用于运行
- 选择合适的基础镜像：官方镜像、版本固定、轻量级

#### WORKDIR：设置工作目录 ####

- 后续指令都在此目录下执行
- 如果目录不存在会自动创建

#### COPY：复制文件到镜像 ####

- COPY pom.xml .：复制单个文件
- COPY src ./src：复制目录
- COPY --from=builder：从上一构建阶段复制文件

#### RUN：执行命令 ####

- 在镜像构建过程中执行
- 每条 RUN 指令都会创建一个新的镜像层

#### ENV：设置环境变量 ####

- 在镜像中设置环境变量
- 可以被后续指令和容器运行时使用

#### USER：指定运行用户 ####

- 安全最佳实践：不使用 root 用户运行应用

#### EXPOSE：声明端口 ####

- 仅声明容器运行时监听的端口
- 实际映射由 docker run 或 docker-compose 处理

#### ENTRYPOINT：容器启动命令 ####

- 容器启动时执行的命令
- 使用 exec 形式确保信号正确传递

#### HEALTHCHECK：健康检查 ####

- 定期检查容器健康状态
- 帮助 Docker 和编排系统了解应用状态

### 优化 Dockerfile 的技巧 ###

- 利用缓存：将不常变化的指令放在前面
- 多阶段构建：减小最终镜像大小
- 使用 .dockerignore：排除不需要的文件
- 合并 RUN 指令：减少镜像层数

创建 .dockerignore 文件：

```plaintext
# 忽略所有以 . 开头的文件
.*
# 忽略 IDE 配置文件
.vscode/
.idea/
*.iml
# 忽略构建输出
target/
build/
out/
# 忽略日志文件
*.log
logs/
# 忽略临时文件
*.tmp
*.temp
tmp/
temp/
# 忽略 Git 相关
.git/
.gitignore
# 忽略 Docker 相关
Dockerfile*
docker-compose*
.dockerignore
# 忽略文档
*.md
```

## 第五章：构建 Docker 镜像 ##

### 基础构建命令 ###

```bash
# 进入项目根目录（确保 Dockerfile 在此目录）
cd /path/to/docker-demo
 
# 构建镜像
# -t: 给镜像打标签（名称:版本）
# .: 构建上下文路径（当前目录）
docker build -t docker-demo:1.0.0 .
 
# 查看构建过程输出
# 可以看到每一层的构建情况
```

### 详细的构建过程 ###

让我们分解构建过程：

```bash
# 1. 验证 Dockerfile 语法
# 可以使用 docker build --dry-run 验证语法（需要 buildx）
docker buildx build --dry-run .
 
# 2. 实际构建镜像（详细输出）
docker build -t docker-demo:1.0.0 --progress=plain .
 
# 3. 查看构建的镜像
docker images
 
# 输出示例：
# REPOSITORY    TAG       IMAGE ID       CREATED          SIZE
# docker-demo   1.0.0     abc123def456   2 minutes ago    215MB
```

### 镜像构建优化 ###

```bash
# 1. 使用缓存加速构建
# 如果依赖没有变化，Docker 会使用缓存
docker build -t docker-demo:1.0.0 .
 
# 2. 不使用缓存（强制重新构建所有层）
docker build -t docker-demo:1.0.0 --no-cache .
 
# 3. 指定目标构建阶段
# 多阶段构建时，可以指定只构建到某个阶段
docker build -t docker-demo:builder --target builder .
 
# 4. 清理构建缓存
docker builder prune
 
# 5. 查看镜像构建历史
docker history docker-demo:1.0.0
```

### 镜像标签管理 ###

```bash
# 给镜像添加多个标签
docker build -t docker-demo:1.0.0 -t docker-demo:latest .
 
# 给现有镜像添加新标签
docker tag docker-demo:1.0.0 docker-demo:stable
 
# 查看所有镜像
docker images
 
# 删除镜像
docker rmi docker-demo:1.0.0
 
# 强制删除镜像（即使有容器使用）
docker rmi -f docker-demo:1.0.0
 
# 清理所有未使用的镜像
docker image prune -a
```

## 第六章：运行 Docker 容器 ##

### 基础运行命令 ###

```bash
# 最基本的方式运行容器
docker run docker-demo:1.0.0
 
# 但这会占用终端，且容器停止后会自动删除
```

### 完整的运行配置 ###

```bash
# 完整的容器运行命令
docker run -d \
  --name docker-demo-app \
  -p 8080:8080 \
  -e "SPRING_PROFILES_ACTIVE=prod" \
  -v /path/to/logs:/var/log/docker-demo \
  --restart unless-stopped \
  --memory=512m \
  --cpus="1.0" \
  --health-cmd="curl -f http://localhost:8080/api/health || exit 1" \
  --health-interval=30s \
  --health-timeout=3s \
  --health-retries=3 \
  docker-demo:1.0.0
```

参数解释：

- -d：后台运行（detached mode）
- --name：为容器指定名称
- -p：端口映射（主机端口:容器端口）
- -e：设置环境变量
- -v：卷挂载（主机目录:容器目录）
- --restart：重启策略
- --memory：内存限制
- --cpus：CPU 限制
- --health-*：健康检查配置

### 容器管理命令 ###

```bash
# 查看运行中的容器
docker ps
 
# 查看所有容器（包括停止的）
docker ps -a
 
# 查看容器日志
docker logs docker-demo-app
 
# 实时查看日志
docker logs -f docker-demo-app
 
# 查看最后 N 行日志
docker logs --tail 100 docker-demo-app
 
# 查看容器资源使用情况
docker stats docker-demo-app
 
# 进入容器内部（交互式 shell）
docker exec -it docker-demo-app /bin/bash
 
# 在容器内执行单个命令
docker exec docker-demo-app ls -la /app
 
# 停止容器
docker stop docker-demo-app
 
# 启动已停止的容器
docker start docker-demo-app
 
# 重启容器
docker restart docker-demo-app
 
# 删除容器（必须先停止）
docker rm docker-demo-app
 
# 强制删除运行中的容器
docker rm -f docker-demo-app
 
# 查看容器详细信息
docker inspect docker-demo-app
 
# 查看容器端口映射
docker port docker-demo-app
 
# 复制文件到容器
docker cp localfile.txt docker-demo-app:/app/
 
# 从容器复制文件
docker cp docker-demo-app:/app/logs/app.log ./
```

### 网络配置 ###

```bash
# 创建自定义网络（推荐）
docker network create app-network
 
# 查看网络列表
docker network ls
 
# 在自定义网络中运行容器
docker run -d \
  --name docker-demo-app \
  --network app-network \
  docker-demo:1.0.0
 
# 查看网络详情
docker network inspect app-network
 
# 连接容器到网络
docker network connect app-network docker-demo-app
 
# 断开容器与网络的连接
docker network disconnect app-network docker-demo-app
 
# 删除网络
docker network rm app-network
```

### 数据持久化 ###

```bash
# 1. 使用绑定挂载（bind mount）
docker run -d \
  -v /host/path/logs:/var/log/docker-demo \
  docker-demo:1.0.0
 
# 2. 使用 Docker 卷（volume）
# 创建卷
docker volume create app-logs
 
# 使用卷
docker run -d \
  -v app-logs:/var/log/docker-demo \
  docker-demo:1.0.0
 
# 查看卷列表
docker volume ls
 
# 查看卷详情
docker volume inspect app-logs
 
# 清理未使用的卷
docker volume prune
 
# 3. 使用临时文件系统（tmpfs）
docker run -d \
  --tmpfs /tmp \
  docker-demo:1.0.0
```

## 第七章：使用 Docker Compose 编排 ##

### 为什么需要 Docker Compose？ ###

- 管理多个容器的启动顺序和依赖关系
- 简化复杂的容器配置
- 方便本地开发环境搭建
- 支持环境变量和配置文件管理

### 创建 docker-compose.yml ###

```yml 
# 定义网络（所有服务共享）
networks:
  app-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
 
# 定义卷
volumes:
  app-logs:
    driver: local
  mysql-data:
    driver: local
 
# 定义服务
services:
  # Spring Boot 应用服务
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - BUILD_VERSION=${BUILD_VERSION:-1.0.0}
    image: docker-demo:${BUILD_VERSION:-1.0.0}
    container_name: docker-demo-app
    restart: unless-stopped
    ports:
      - "8080:8080"
      - "8081:8081"  # 管理端口（如果需要）
    environment:
      - SPRING_PROFILES_ACTIVE=${PROFILE:-dev}
      - JAVA_OPTS=${JAVA_OPTS:--Xms256m -Xmx512m}
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_NAME=docker_demo
      - DB_USER=${DB_USER:-root}
      - DB_PASSWORD=${DB_PASSWORD:-password}
    volumes:
      - app-logs:/var/log/docker-demo
      - ./config:/app/config:ro  # 只读挂载配置文件
    networks:
      - app-network
    depends_on:
      mysql:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
        reservations:
          memory: 256M
          cpus: '0.5'
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    # 开发模式配置（覆盖默认）
    profiles: ["dev"]
    ports:
      - "8080:8080"
      - "5005:5005"  # 远程调试端口
    environment:
      - JAVA_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005 -Xms256m -Xmx512m
 
  # MySQL 数据库服务
  mysql:
    image: mysql:8.0
    container_name: docker-demo-mysql
    restart: unless-stopped
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_PASSWORD:-password}
      - MYSQL_DATABASE=docker_demo
      - MYSQL_USER=${DB_USER:-appuser}
      - MYSQL_PASSWORD=${DB_PASSWORD:-password}
    volumes:
      - mysql-data:/var/lib/mysql
      - ./mysql/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
      - ./mysql/my.cnf:/etc/mysql/conf.d/my.cnf:ro
    networks:
      - app-network
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5
    command: 
      - --default-authentication-plugin=mysql_native_password
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
 
  # Redis 缓存服务
  redis:
    image: redis:7-alpine
    container_name: docker-demo-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - app-network
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-redispass}
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3
 
  # Nginx 反向代理
  nginx:
    image: nginx:1.21-alpine
    container_name: docker-demo-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/logs:/var/log/nginx
    networks:
      - app-network
    depends_on:
      - app
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s
      timeout: 10s
      retries: 3
 
  # 监控服务（Prometheus + Grafana）
  monitoring:
    image: prom/prometheus:latest
    container_name: docker-demo-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    networks:
      - app-network
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
 
  grafana:
    image: grafana/grafana:latest
    container_name: docker-demo-grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
    networks:
      - app-network
    depends_on:
      - monitoring
```

### 创建环境变量文件 ###

创建 .env 文件（不会被提交到版本控制）：

```ini
# 应用配置
BUILD_VERSION=1.0.0
PROFILE=prod
JAVA_OPTS=-Xms256m -Xmx512m
 
# 数据库配置
DB_USER=appuser
DB_PASSWORD=StrongPassword123!
DB_NAME=docker_demo
 
# Redis 配置
REDIS_PASSWORD=RedisPass123!
 
# Grafana 配置
GRAFANA_PASSWORD=GrafanaAdmin123!
```

### Docker Compose 命令 ###

```bash
# 1. 构建并启动所有服务（后台运行）
docker-compose up -d
 
# 2. 构建镜像（不启动）
docker-compose build
 
# 3. 启动已存在的服务
docker-compose start
 
# 4. 停止所有服务
docker-compose stop
 
# 5. 停止并删除所有容器、网络
docker-compose down
 
# 6. 停止并删除所有容器、网络、卷
docker-compose down -v
 
# 7. 查看服务状态
docker-compose ps
 
# 8. 查看服务日志
docker-compose logs
 
# 9. 查看特定服务日志
docker-compose logs app
 
# 10. 实时查看日志
docker-compose logs -f app
 
# 11. 进入容器
docker-compose exec app /bin/bash
 
# 12. 在服务上执行命令
docker-compose exec app ls -la
 
# 13. 重启服务
docker-compose restart app
 
# 14. 扩展服务实例数
docker-compose up -d --scale app=3
 
# 15. 拉取服务镜像
docker-compose pull
 
# 16. 查看服务配置
docker-compose config
 
# 17. 暂停服务
docker-compose pause app
 
# 18. 恢复暂停的服务
docker-compose unpause app
 
# 19. 使用特定环境文件
docker-compose --env-file .env.production up -d
 
# 20. 使用特定配置文件
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
 
# 21. 只启动部分服务
docker-compose up -d app mysql
 
# 22. 重新构建服务
docker-compose up -d --build app
 
# 23. 清理未使用的资源
docker-compose down --rmi local
```

### 多环境配置 ###

创建 docker-compose.override.yml（用于开发环境）：

```yml 
services:
  app:
    ports:
      - "8080:8080"
      - "5005:5005"
    environment:
      - SPRING_PROFILES_ACTIVE=dev
      - JAVA_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005 -Xms256m -Xmx512m
    volumes:
      - ./src:/app/src
```

创建 docker-compose.prod.yml（用于生产环境）：

```yml
services:
  app:
    restart: always
    deploy:
      resources:
        limits:
          memory: 1g
          cpus: '2.0'
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - JAVA_OPTS=-Xms512m -Xmx1024m -XX:+UseG1GC
```

## 第八章：生产环境部署实践 ##

### 安全最佳实践 ###

```bash
# 1. 使用非 root 用户运行容器
# 在 Dockerfile 中已设置
USER spring
 
# 2. 扫描镜像安全漏洞
docker scan docker-demo:1.0.0
 
# 3. 使用内容信任
export DOCKER_CONTENT_TRUST=1
docker build -t docker-demo:1.0.0 .
 
# 4. 限制容器能力
docker run -d \
  --cap-drop ALL \
  --cap-add NET_BIND_SERVICE \
  docker-demo:1.0.0
 
# 5. 设置只读根文件系统
docker run -d \
  --read-only \
  --tmpfs /tmp \
  -v app-logs:/var/log/docker-demo \
  docker-demo:1.0.0
```

### 日志管理 ###

```yml
# docker-compose.yml 中的日志配置
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
    compress: "true"
    labels: "production"
    env: "os,customer"
```

```bash
# 查看日志驱动
docker info --format '{{.LoggingDriver}}'
 
# 使用日志驱动
docker run -d \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  docker-demo:1.0.0
 
# 使用 syslog 驱动
docker run -d \
  --log-driver syslog \
  --log-opt syslog-address=udp://syslog-server:514 \
  docker-demo:1.0.0
```

### 资源限制与监控 ###

```bash
# 设置资源限制
docker run -d \
  --memory="512m" \
  --memory-swap="1g" \
  --cpus="1.5" \
  --cpu-shares="1024" \
  --blkio-weight="500" \
  docker-demo:1.0.0
 
# 查看容器资源使用
docker stats docker-demo-app
 
# 设置容器重启策略
docker run -d \
  --restart always \		# 总是重启
  --restart on-failure \	# 失败时重启
  --restart unless-stopped \	# 除非手动停止，否则重启
  docker-demo:1.0.0
```

### 镜像仓库与持续集成 ###

```bash
# 登录 Docker Hub
docker login
 
# 给镜像打标签（用于推送到仓库）
docker tag docker-demo:1.0.0 yourusername/docker-demo:1.0.0
docker tag docker-demo:1.0.0 yourusername/docker-demo:latest
 
# 推送到 Docker Hub
docker push yourusername/docker-demo:1.0.0
docker push yourusername/docker-demo:latest
 
# 从仓库拉取镜像
docker pull yourusername/docker-demo:1.0.0
 
# 使用私有仓库
docker tag docker-demo:1.0.0 registry.example.com/yourproject/docker-demo:1.0.0
docker push registry.example.com/yourproject/docker-demo:1.0.0
 
# 配置私有仓库（非安全）
docker run -d \
  -p 5000:5000 \
  --name registry \
  registry:2
 
# 推送镜像到私有仓库
docker tag docker-demo:1.0.0 localhost:5000/docker-demo:1.0.0
docker push localhost:5000/docker-demo:1.0.0
```

### 备份与恢复 ###

```bash
# 备份容器数据
docker run --rm \
  --volumes-from docker-demo-app \
  -v $(pwd):/backup \
  ubuntu tar czf /backup/app-data-$(date +%Y%m%d).tar.gz /var/log/docker-demo
 
# 备份 Docker 卷
docker run --rm \
  -v app-logs:/data \
  -v $(pwd):/backup \
  ubuntu tar czf /backup/app-logs-$(date +%Y%m%d).tar.gz /data
 
# 导出容器
docker export docker-demo-app > docker-demo-container.tar
 
# 导入容器
cat docker-demo-container.tar | docker import - docker-demo:imported
 
# 保存镜像为文件
docker save -o docker-demo-1.0.0.tar docker-demo:1.0.0
 
# 从文件加载镜像
docker load -i docker-demo-1.0.0.tar
 
# 创建数据卷容器（用于数据共享）
docker create -v /var/log/docker-demo \
  --name app-data \
  busybox /bin/true
 
# 使用数据卷容器
docker run -d \
  --volumes-from app-data \
  docker-demo:1.0.0
```

## 第九章：常见问题与解决方案 ##

### 构建问题 ###

#### 问题1：构建速度慢 ####

解决方案：使用构建缓存和镜像加速器

```bash
# 1. 配置 Docker 镜像加速器
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://registry.docker-cn.com"
  ]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker

# 2. 使用构建缓存
docker build -t docker-demo:1.0.0 --cache-from docker-demo:latest .
```

#### 问题2：镜像过大 ####

解决方案：使用多阶段构建和轻量级基础镜像

```dockerfile
# 使用 alpine 版本的镜像
FROM openjdk:11-jre-slim  # 而不是 openjdk:11
 
# 或者使用更小的发行版
FROM openjdk:11-jre-alpine
```

### 运行问题 ###

#### 问题1：应用启动后立即退出 ####

解决方案：检查日志，确保应用在前台运行

```bash
# 错误的 CMD：
CMD java -jar app.jar &
 
# 正确的 CMD：
CMD ["java", "-jar", "app.jar"]
# 或使用 ENTRYPOINT：
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 问题2：端口被占用 ####

解决方案：更改端口或停止占用进程

```bash
# 检查端口占用
sudo netstat -tlnp | grep :8080
 
# 停止占用进程
sudo kill <PID>
 
# 或者使用不同端口
docker run -d -p 8081:8080 docker-demo:1.0.0
```

### 网络问题 ###

#### 问题：容器间无法通信 ####

```bash
# 解决方案：使用自定义网络
 
# 创建网络
docker network create my-network
 
# 将容器连接到同一网络
docker run -d --network my-network --name app1 docker-demo:1.0.0
docker run -d --network my-network --name app2 docker-demo:1.0.0
 
# 在容器内部可以通过容器名访问
 
# 从 app1 访问 app2
docker exec app1 curl http://app2:8080/api/health
```

### 数据持久化问题 ###

#### 问题：容器重启后数据丢失 ####

```bash
# 解决方案：使用数据卷
 
# 创建命名卷
docker volume create app-data
 
# 使用卷
docker run -d \
  -v app-data:/app/data \
  docker-demo:1.0.0
 
# 或者使用绑定挂载
docker run -d \
  -v /host/path/data:/app/data \
  docker-demo:1.0.0
```

## 第十章：进阶部署方案 ##

### 使用 Docker Swarm（集群部署） ###

```bash
# 初始化 Swarm 集群
docker swarm init
 
# 查看节点
docker node ls
 
# 创建 overlay 网络
docker network create --driver overlay app-network
 
# 部署服务栈
docker stack deploy -c docker-compose.yml docker-demo
 
# 查看服务
docker service ls
 
# 查看服务详情
docker service ps docker-demo_app
 
# 扩展服务
docker service scale docker-demo_app=3
 
# 更新服务
docker service update --image docker-demo:2.0.0 docker-demo_app
 
# 回滚服务
docker service update --rollback docker-demo_app
 
# 删除服务栈
docker stack rm docker-demo
```

### 使用 Kubernetes（生产级编排） ###

创建 deployment.yaml：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: docker-demo-deployment
  labels:
    app: docker-demo
spec:
  replicas: 3
  selector:
    matchLabels:
      app: docker-demo
  template:
    metadata:
      labels:
        app: docker-demo
    spec:
      containers:
      - name: docker-demo
        image: yourusername/docker-demo:1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
          requests:
            memory: "256Mi"
            cpu: "250m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: docker-demo-service
spec:
  selector:
    app: docker-demo
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

### CI/CD  流水线示例 ###

.gitlab-ci.yml 示例：

```yaml
stages:
  - build
  - test
  - dockerize
  - deploy
 
variables:
  DOCKER_IMAGE: registry.example.com/yourproject/docker-demo:$CI_COMMIT_REF_SLUG
  MAVEN_OPTS: "-Dmaven.repo.local=.m2/repository"
 
cache:
  paths:
    - .m2/repository/
    - target/
 
build:
  stage: build
  image: maven:3.8.4-openjdk-11
  script:
    - mvn clean compile
 
test:
  stage: test
  image: maven:3.8.4-openjdk-11
  script:
    - mvn test
 
docker-build:
  stage: dockerize
  image: docker:20.10
  services:
    - docker:20.10-dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $DOCKER_IMAGE .
    - docker push $DOCKER_IMAGE
 
deploy:
  stage: deploy
  image: alpine:latest
  script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan $DEPLOY_SERVER >> ~/.ssh/known_hosts
    - chmod 644 ~/.ssh/known_hosts
    - |
      ssh $DEPLOY_USER@$DEPLOY_SERVER "
        docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY &&
        docker pull $DOCKER_IMAGE &&
        docker stop docker-demo-app || true &&
        docker rm docker-demo-app || true &&
        docker run -d \
          --name docker-demo-app \
          -p 8080:8080 \
          --restart unless-stopped \
          $DOCKER_IMAGE
      "
  only:
    - master
```

## 总结 ##

通过本文的详细讲解，您应该已经掌握了使用 Docker 部署 Spring Boot 项目的完整流程。我们从基础概念开始，逐步深入，涵盖了：

- 环境准备：在不同系统上安装 Docker 和 Docker Compose

- 项目准备：创建 Spring Boot 项目并配置 Dockerfile

- 镜像构建：使用多阶段构建优化镜像大小

- 容器运行：各种运行选项和参数配置

- 服务编排：使用 Docker Compose 管理多容器应用

- 生产部署：安全、监控、备份等最佳实践

- 问题解决：常见问题排查和解决方案

## 进阶方案：Docker Swarm 和 Kubernetes 部署 ##

Docker 作为现代应用部署的标准工具，掌握它对于开发者和运维人员都至关重要。实践是学习的最佳方式，建议您按照本文的步骤实际操作，遇到问题时查阅官方文档和社区资源。

- 记住，好的部署策略应该具备：

- 可重复性：每次部署结果一致

- 可观测性：完善的日志和监控

- 可恢复性：快速回滚和故障恢复能力

- 安全性：最小权限原则和安全配置

- 自动化：尽可能自动化部署流程
