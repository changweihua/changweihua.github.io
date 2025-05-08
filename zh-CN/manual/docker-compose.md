---
outline: false
aside: false
layout: doc
date: 2025-05
title: docker-compose.yaml语法规则
description: docker-compose.yaml语法规则
category: 文档
pageClass: manual-page-class
---

# docker-compose.yaml语法规则 #

## 版本（version） ##

- **含义**：指定 Compose 文件的版本。
- **所需值结构**：字符串（string）
- **示例**：

```text
version: '3.8'
```

## 服务（services） ##

- **含义**：定义应用的服务。
- **所需值结构**：映射（map）

### 服务下的关键字 ###

#### build ####

- **含义**：配置构建时信息。
- **所需值结构**：字符串（string）或映射（map）
- **示例**：

```yaml
build: ./path/to/dockerfile
# 或
build:
  context: ./path/to/dockerfile
  dockerfile: Dockerfile-alternate
```

#### cap_add, cap_drop ####

- **含义**：添加或删除容器的能力（Linux capabilities）。
- **所需值结构**：数组（array）
- **示例**：

```yaml
cap_add:
  - ALL
```

#### command ####

- **含义**：覆盖容器启动后默认执行的命令。
- **所需值结构**：数组（array）或字符串（string）
- **示例**：

```yaml
command: ["bundle", "exec", "thin", "-p", "3000"]
# 或
command: bundle exec thin -p 3000
```

#### configs ####

- **含义**：将配置项添加到容器中。
- **所需值结构**：数组（array）或映射（map）
- **示例**：

```yaml
configs:
  - my_config
# 或
configs:
  my_config:
    external: true
```

#### cgroup_parent ####

- **含义**：指定一个可选的父 cgroup 用于容器。
- **所需值结构**：字符串（string）
- **示例**：

```yaml
cgroup_parent: m-executor-abcd
```

#### container_name ####

- **含义**：指定自定义容器名称，而不是生成的默认名称。
- **所需值结构**：字符串（string）
- **示例**：

```yaml
container_name: my-web-container
```

#### depends_on ####

- **含义**：指定服务之间的依赖关系，影响启动顺序。
- **所需值结构**：数组（array）
- **示例**：

```yaml
depends_on:
  - db
  - redis
```

#### deploy ####

- **含义**：指定与服务的部署和运行有关的配置。
- **所需值结构**：映射（map）
- **示例**：

```yaml
deploy:
  replicas: 3
  update_config:
    order: start-first
```

#### devices ####

- **含义**：指定设备映射列表。
- **所需值结构**：数组（array）
- **示例**：

```yaml
devices:
  - "/dev/ttyUSB0:/dev/ttyUSB0"
```

#### dns ####

- **含义**：自定义 DNS 服务器。
- **所需值结构**：数组（array）
- **示例**：

```yaml
dns:
  - 8.8.8.8
  - 8.8.4.4
```

#### dns_search ####

- **含义**：自定义 DNS 搜索域。
- **所需值结构**：数组（array）
- **示例**：

```yaml
dns_search:
  - mydomain.com
```

#### entrypoint ####

- **含义**：覆盖容器的默认入口点。
- **所需值结构**：数组（array）或字符串（string）
- **示例**：

```yaml
entrypoint: ["php", "-d", "memory_limit=-1", "vendor/bin/phpunit"]
# 或
entrypoint: php -d memory_limit=-1 vendor/bin/phpunit
```

#### env_file ####

- **含义**：从一个文件中引入环境变量。
- **所需值结构**：数组（array）
- **示例**：

```yaml
env_file:
  - web-.env
```

#### environment ####

- **含义**：设置环境变量。
- **所需值结构**：映射（map）或数组（array）
- **示例**：

```yaml
environment:
  RACK_ENV: development
  SHOW: "true"
# 或
environment:
  - RACK_ENV=development
  - SHOW=true
```

#### expose ####

- **含义**：暴露端口，但不映射到宿主机，只被连接的服务访问。
- **所需值结构**：数组（array）
- **示例**：

```yaml
expose:
  - "8080"
```

#### extra_hosts ####

- **含义**：添加主机名映射。
- **所需值结构**：映射（map）
- **示例**：

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

#### healthcheck ####

- **含义**：配置运行健康检查的命令。
- **所需值结构**：映射（map）
- **示例**：

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost"]
  interval: 10s
  timeout: 1s
```

#### image ####

- **含义**：指定容器启动所使用的镜像。
- **所需值结构**：字符串（string）
- **示例**：

```yaml
image: nginx:latest
```

#### labels ####

- **含义**：添加元数据到容器，以“label”形式。
- **所需值结构**：映射（map）
- **示例**：

```yaml
labels:
  com.example.version: 1.0.0
```

#### links ####

- **含义**：链接到其它服务中的容器，已被废弃，建议使用网络别名。
- **所需值结构**：数组（array）
- **示例**：

```yaml
links:
  - db
  - redis
```

#### logging ####

- **含义**：配置日志驱动。
- **所需值结构**：映射（map）
- **示例**：

```yaml
logging:
  driver: "json-file"
```

#### network_mode ####

- **含义**：设置网络模式。
- **所需值结构**：字符串（string）
- **示例**：

```yaml
network_mode: "bridge"
```

#### networks ####

- **含义**：将容器加入指定网络。
- **所需值结构**：数组（array）或映射（map）
- **示例**：

```yaml
networks:
  - webnet
```

#### ports ####

- **含义**：映射容器端口到宿主机。
- **所需值结构**：数组（array）
- **示例**：

```yaml
ports:
  - "80:80"
  - "443:443"
```

#### restart ####

- **含义**：配置容器的重启策略。
- **所需值结构**：字符串（string）
- **示例**：

```yaml
restart: always
```

#### secrets ####

- **含义**：配置存储敏感数据。
- **所需值结构**：数组（array）或映射（map）
- **示例**：

```yaml
secrets:
  - my_secret
# 或
secrets:
  my_secret:
    external: true
```

#### security_opt ####

- **含义**：为每个容器覆盖默认的标签。
- **所需值结构**：数组（array）
- **示例**：

```yaml
security_opt:
  - "apparmor:unconfined"
```

#### stop_grace_period ####

- **含义**：指定在容器无法处理 SIGTERM 信号，等待多久后发送 SIGKILL 信号强制停止容器。
- **所需值结构**：字符串（string）
- **示例**：

```yaml
stop_grace_period: 10s
```

#### stop_signal ####

- **含义**：设置替代信号来停止容器。
- **所需值结构**：字符串（string）
- **示例**：

```yaml
stop_signal: SIGINT
```

## 网络（networks） ##

- **含义**：定义自定义网络。
- **所需值结构**：映射（map）

### 网络下的关键字 ###

#### driver ####

- **含义**：指定网络驱动类型。
- **所需值结构**：字符串（string）
- **示例**：

```yaml
driver: bridge
```

#### driver_opts ####

- **含义**：指定网络驱动程序选项。
- **所需值结构**：映射（map）
- **示例**：

```yaml
driver_opts:
  com.docker.network.bridge.enable_icc: "true"
```

#### external ####

- **含义**：指定网络是否是外部定义的。
- **所需值结构**：布尔值（boolean）
- **示例**：

```yaml
external: true
```

#### ipam ####

- **含义**：自定义 IPAM 配置。
- **所需值结构**：映射（map）
- **示例**：

```yaml
ipam:
  driver: default
```

#### internal ####

- **含义**：限制对网络的访问。
- **所需值结构**：布尔值（boolean）
- **示例**：

```yaml
internal: true
```

#### labels ####

- **含义**：为网络添加元数据。
- **所需值结构**：映射（map）
- **示例**：

```yaml
labels:
  com.example.version: 1.0.0
```

#### name ####

- **含义**：为网络设置自定义名称。
- **所需值结构**：字符串（string）
- **示例**：

```yaml
name: webnet
```

## 卷（volumes） ##

- **含义**：定义命名卷。
- **所需值结构**：映射（map）

### 卷下的关键字 ###

#### driver ####

- **含义**：指定卷驱动类型。
- **所需值结构**：字符串（string）
- **示例**：

```yaml
driver: local
```

#### driver_opts ####

- **含义**：指定卷驱动程序选项。
- **所需值结构**：映射（map）
- **示例**：

```yaml
driver_opts:
  o: bind
```

#### external ####

- **含义**：指定卷是否是外部定义的。
- **所需值结构**：布尔值（boolean）或映射（map）
- **示例**：

```yaml
external: true
```

#### labels ####

- **含义**：为卷添加元数据。
- **所需值结构**：映射（map）
- **示例**：

```yaml
labels:
  com.example.version: 1.0.0
```

#### name ####

- **含义**：为卷设置自定义名称。
- **所需值结构**：字符串（string）
- **示例**：

```yaml
name: webdata
```

## 配置项（configs） ##

- **含义**：定义配置项，可以在服务中引用。
- **所需值结构**：映射（map）

### 配置项下的关键字 ###

#### file ####

- **含义**：指定配置文件的路径。
- **所需值结构**：字符串（string）
- **示例**：

```yaml
file: ./path/to/config.yml
```

#### external ####

- **含义**：指定配置项是否是外部定义的。
- **所需值结构**：布尔值（boolean）
- **示例**：

```yaml
external: true
```

#### name ####

- **含义**：为配置项设置自定义名称。
- **所需值结构**：字符串（string）
- **示例**：

```yaml
name: my_config
```

## 密钥（secrets） ##

- **含义**：定义敏感数据，可以在服务中引用。
- **所需值结构**：映射（map）

### 密钥下的关键字 ###

#### file ####

- **含义**：指定包含密钥内容的文件路径。
- **所需值结构**：字符串（string）
- **示例**：

```yaml
file: ./path/to/secret.txt
```

#### external ####

- **含义**：指定密钥是否是外部定义的。
- **所需值结构**：布尔值（boolean）
- **示例**：

```yaml
external: true
```

#### name ####

- **含义**：为密钥设置自定义名称。
- **所需值结构**：字符串（string）
- **示例**：

```yaml
name: my_secret
```

## 完整示例&注意说明 ##

以下是一个包含上述关键字的 `docker-compose.yml` 文件示例：

```yaml
# 注意📢，如果是关键字，其冒号后面都有空格或回车

version: '3.8' #冒号后面有空格，是kv对，值为字符串

services: #值是map，有换行，其后的web和db是关键字
  web:
    image: nginx:latest #nginx:latest是字符串，里面的冒号后没空格
    ports: #值是列表，列表的元素值是字符串
      - "80:80" #是字符串
    environment: #值是列表，列表的元素值是字符串
      - NGINX_HOST=example.com #是字符串
    volumes: #值是列表，列表的元素值是字符串
      - /data/nginx:/usr/share/nginx/html #是字符串
    networks:
      - webnet

  db:
    image: mysql:5.7 #字符串，如果冒号后面有空格才算是kv对，最好使用双引号包围好
    environment:
      - MYSQL_ROOT_PASSWORD=root #字符串
      - MYSQL_DATABASE=example
    volumes:
      - db_data:/var/lib/mysql #这种算是字符串，如果冒号后面有空格才算是kv对
    networks:
      - webnet

networks:
  webnet:
    driver: bridge

volumes:
  db_data:
    driver: local
```

这个例子中定义了两个服务：web 和 db，它们分别使用 nginx 和 mysql 镜像。web 服务映射了端口 80，并设置了环境变量。db 服务设置了数据库的环境变量，并挂载了一个卷。两个服务都加入了名为 webnet 的网络。此外，还定义了一个名为 db_data 的卷。
