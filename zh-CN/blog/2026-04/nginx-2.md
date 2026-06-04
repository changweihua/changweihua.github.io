---
lastUpdated: true
commentabled: true
recommended: true
title: Nginx 从“能跑”到“封神”
description: 生产级配置、调优与避坑指南
date: 2026-04-30 09:00:00 
pageClass: blog-page-class
cover: /covers/nginx.svg
---

各位在互联网风口“裸泳”的战友们，大家好！👋

咱们后端开发，平时跟 Controller、Service打交道习惯了。但你是否想过，当用户敲下域名按下回车时，是谁第一个接住了这波流量？没错，是 Nginx。

如果把你的后端服务比作一家米其林餐厅（虽然可能只是个沙县小吃），Nginx 就是那个站在门口的最强接待员兼保安。他负责安排座位（负载均衡）、防止混混闯入（限流）、给 VIP 开绿色通道（动静分离）。🕶️

今天，咱们不光看 `nginx.conf`，还要把它拆解得连你家猫看了都能配！

## 核心骨架：看懂配置文件 🦴 ##

Nginx 的配置逻辑非常清晰，主要由三大块组成：Main (全局) 、Events (连接) 、Http (HTTP 行为) 。

```ini
# ==================== 1. Main 全局块（进程与权限） ====================
# 指定运行 Nginx 的用户和用户组，为了安全，通常不使用 root
user  nginx; 
# 工作进程数，最佳值是 CPU 核心数。设为 auto 可让 Nginx 自动检测
worker_processes  auto; 
# 错误日志路径，debug|info|notice|warn|error|crit 级别可选
error_log  /var/log/nginx/error.log warn;
# Nginx 主进程的 PID 存放文件
pid        /var/run/nginx.pid;

# 一个进程能打开的文件描述符上限。解决高并发下的 "Too many open files" 错误
worker_rlimit_nofile 65535;


# ==================== 2. Events 块（连接处理引擎） ====================
events {
    # 单个 worker 进程允许的最大并发连接数
    worker_connections  10240; 
    # 采用 Linux 下最高效的异步非阻塞 IO 多路复用模型（epoll）
    use epoll; 
    # 惊群效应优化：当新连接到来时，所有睡眠的 worker 都会被唤醒，但只有一个能拿到连接。
    # 设为 on 时，允许多个 worker 同时 accept 新连接，提升短连接场景下的吞吐量。
    accept_mutex on; 
}


# ==================== 3. Http 块（Web 流量与业务逻辑核心） ====================
http {
    # --- 3.1 基础元数据与格式 ---
    include       /etc/nginx/mime.types;   # 引入文件扩展名与 MIME 类型的映射表
    default_type  application/octet-stream; # 若找不到对应的 MIME 类型，默认当作二进制流
    
    # 定义日志格式，$remote_addr 是客户端IP，$request_time 是请求总耗时
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
    access_log  /var/log/nginx/access.log  main; # 访问日志路径及应用上述格式

    # --- 3.2 核心性能调优开关 ---
    sendfile        on;  # 开启零拷贝（Zero-copy）：内核直接将数据从磁盘发往网卡，跳过用户态，极大提升静态文件传输性能
    tcp_nopush     on;   # 仅在 sendfile 开启时有效。凑够一个数据包再发，减少网络拥塞
    tcp_nodelay    on;   # 禁用 Nagle 算法，小数据包立即发送，降低交互式应用的延迟
    keepalive_timeout  65; # 长连接超时时间（秒），设为 0 则为短连接
    types_hash_max_size 2048; # MIME 类型哈希表大小，加快文件类型查找速度

    # --- 3.3 Gzip 压缩模块（省带宽神器） ---
    gzip  on;                 # 开启 gzip 压缩
    gzip_disable "msie6";     # 对古老的 IE6 浏览器放弃压缩（它不支持）
    gzip_vary on;             # 响应头增加 Vary: Accept-Encoding，防止代理服务器缓存错误页面
    gzip_proxied any;         # 对所有代理的请求启用压缩
    gzip_comp_level 6;        # 压缩级别 1-9，级别越高压缩率越好但 CPU 消耗越大，6 是甜点区
    gzip_types text/plain text/css application/json application/javascript text/xml; # 指定需要压缩的 MIME 类型

    # --- 3.4 反向代理与负载均衡（上游服务器池） ---
    upstream backend_server {
        # 负载均衡策略：least_conn（最少连接数），可选 ip_hash（IP粘性）、round-robin（默认轮询）
        least_conn; 
        server 192.168.1.101:8080 weight=3 max_fails=2 fail_timeout=30s;
        server 192.168.1.102:8080 weight=2;
        server 192.168.1.103:8080 backup; # 备用机，只有其他机器全宕机时才启用
    }

    # --- 3.5 Server 块（虚拟主机配置，可存在多个） ---
    server {
        listen       80;          # 监听 80 端口
        server_name  api.example.com; # 域名匹配
        
        # 强制将 HTTP 重定向到 HTTPS（安全标配）
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;    # 监听 443 端口，并启用 SSL 及 HTTP/2 协议
        server_name  api.example.com;

        # SSL 证书配置
        ssl_certificate      /etc/nginx/ssl/example.crt;
        ssl_certificate_key  /etc/nginx/ssl/example.key;
        ssl_session_cache    shared:SSL:10m; # SSL 会话缓存，提升握手性能
        ssl_session_timeout  10m;

        # 文件上传大小限制（解决 413 Request Entity Too Large 错误）
        client_max_body_size 50m;

        # --- Location 块（URI 路由匹配，核心中的核心） ---
        
        # 规则1：精确匹配 API 接口，反向代理到 Tomcat/Spring Boot 后端
        location /api/ {
            proxy_pass http://backend_server; # 转发给上面定义的 upstream
            
            # 传递客户端真实 IP 和 Host 给后端应用（非常重要，否则后端拿到的全是 Nginx 的 IP）
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # 超时设置，防止后端卡死导致 Nginx 连接池耗尽
            proxy_connect_timeout 5s;
            proxy_read_timeout 60s;
            proxy_send_timeout 60s;
        }

        # 规则2：通用静态资源直接从本地磁盘读取（动静分离）
        location ~* .(jpg|jpeg|png|gif|ico|css|js)$ {
            root /usr/share/nginx/html; # 静态文件根目录
            expires 7d;                # 浏览器端缓存 7 天（通过 Cache-Control 响应头）
            access_log off;            # 不记录静态资源的访问日志，减少 IO 压力
        }
        
        # 规则3：兜底匹配，返回自定义 404 页面
        location / {
            try_files $uri $uri/ =404;
        }

        # 错误页面重定向
        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            root /usr/share/nginx/html;
        }
    }
}
```

### 全局块 (Main) ###

这里决定了 Nginx 的“体质”。

```ini
# 工作进程数：通常等于 CPU 核心数，别瞎写！
worker_processes auto; 

# 错误日志路径及级别
error_log /var/log/nginx/error.log warn;

# PID 文件
pid /var/run/nginx.pid;
```

### Events 块 (连接处理) ###

这里是 Nginx 高性能的秘密之一。

```ini
events {
    # 单个 worker 允许的最大并发连接数
    # 注意：这里指的是连接数，不是请求数
    worker_connections 10240; 
    
    # 采用 epoll 模型（Linux 2.6+ 推荐），效率高到飞起
    use epoll; 
}
```

### Http 块 (重头戏) ###

这里是咱们 Java 开发最常改的地方。

```ini
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式（为了排查问题，这个必须有）
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # 发送文件开关（开启后性能飙升）
    sendfile on;
    
    # 防止网络阻塞
    tcp_nopush on;
    tcp_nodelay on;

    # 客户端保持连接的超时时间
    keepalive_timeout 65;

    # 引入虚拟主机配置（模块化配置，别全写在一个文件里！）
    include /etc/nginx/conf.d/*.conf;
}
```

## 实战落地：Java 后端最爱用的三种配置 🛠️ ##

### 场景一：反向代理 + 负载均衡 (Load Balancer) ⚖️ ###

这是 Nginx 的看家本领。假设你有三台 Tomcat 服务器，端口分别是 8080, 8081, 8082。

```ini
# 定义一个名为 java_backend 的服务器池
upstream java_backend {
    # 默认轮询（Round Robin）
    server 10.0.0.1:8080 weight=1; # weight 权重，谁机器好谁吃肉
    server 10.0.0.2:8081 weight=2; # 这台性能好，多分点流量
    server 10.0.0.3:8082 backup;   # 备胎服务器，只有前两台挂了才上
    
    # ip_hash; # 如果想绑定 IP（比如为了 Session 一致性），用这个
}

server {
    listen 80;
    server_name api.yourcompany.com;

    location / {
        proxy_pass http://java_backend;
        
        # 传递真实客户端 IP（非常重要！Java 代码里拿到的就是它）
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # 超时设置，防止连接卡死
        proxy_connect_timeout 5s;
        proxy_read_timeout 60s;
    }
}
```

### 场景二：动静分离 (Static vs Dynamic) 🎨 ###

别让 Tomcat 去处理图片和 JS，那是 Nginx 的活儿，Tomcat 干这个太浪费 CPU 了。

```ini
server {
    listen 80;
    server_name www.yourcompany.com;
    
    # 静态资源
    location ~ .*.(html|gif|jpg|jpeg|png|bmp|swf|js|css)$ {
        root /usr/share/nginx/html; # 静态文件路径
        expires 30d; # 浏览器缓存 30 天，减少重复请求
        access_log off; # 静态资源不记录访问日志，省 IO
    }
    
    # 动态请求转发给 Java
    location /api/ {
        proxy_pass http://localhost:8080;
    }
}
```

### 场景三：HTTPS 终结 (SSL Termination) 🔒 ###

SSL 握手很耗 CPU，让 Nginx 帮你把 HTTPS 解密成 HTTP 再发给后端。

```ini
server {
    listen 443 ssl http2; # 开启 http2，速度更快
    server_name www.yourcompany.com;

    ssl_certificate /etc/nginx/ssl/yourcompany.pem;
    ssl_certificate_key /etc/nginx/ssl/yourcompany.key;
    
    # SSL 优化参数
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_protocols TLSv1.2 TLSv1.3; # 别用老旧的 TLSv1.0 了，不安全！

    location / {
        proxy_pass http://java_backend;
    }
}

# 强制 HTTP 跳转 HTTPS
server {
    listen 80;
    server_name www.yourcompany.com;
    return 301 https://$server_name$request_uri;
}
```

## 生产级优化：让你的服务器“飞”起来 🚀 ##

光会配不行，还得会调优。

### 文件句柄数 ###

Linux 默认只允许 1024 个文件句柄，Nginx 很容易就爆了。

*操作*：

编辑 `/etc/security/limits.conf`：

```ini
* soft nofile 65535
* hard nofile 65535
```

编辑 `/etc/nginx/nginx.conf`：

```ini
worker_rlimit_nofile 65535; # 要和系统保持一致
```

### Gzip 压缩 ###

把文本文件压小一点，省带宽，速度快。

```ini
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6; # 压缩级别，6 性价比最高
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### 缓冲区 (Proxy Buffering) ###

防止后端响应太快，Nginx 来不及发，导致阻塞。

```ini
proxy_buffering on;
proxy_buffer_size 4k;
proxy_buffers 8 4k;
```

## 资深工程师的“避坑”清单 ⚠️ ##

|  坑点   |      现象 |   解决方案  |
| :-----------: | :-----------: | :-----------: |
|    上传文件大小限制 |   ​413 Request Entity Too Large |   在 `http/server/location` 块加 `client_max_body_size 100m;`  |
|    跨域问题 (CORS)  |   ​浏览器报错 Blocked by CORS |   加 `add_header 'Access-Control-Allow-Origin' '*';`(生产环境慎用 *)  |
|    502 Bad Gateway |   ​后端服务挂了或 Nginx 连不上 |   检查 `proxy_pass` 地址，检查防火墙，查看 `error.log`  |
|    404 Not Found |   ​路径映射不对 |   检查 `root` 和 `alias` 的区别（新手杀手！）  |

rootvs alias的区别：

- `root /data/image/`: 访问 `/pic/a.jpg` -> 实际找 `/data/image/pic/a.jpg`
- `alias /data/image/`: 访问 `/pic/a.jpg` -> 实际找 `/data/image/a.jpg`


## Nginx UI界面推荐 ##

```bash
docker run -dit \ --name=nginx-ui \ --restart=always \ -e TZ=Asia/Shanghai \ -v /Users/zhoupb/data/nginx:/etc/nginx \ -v /Users/zhoupb/data/nginx-ui:/etc/nginx-ui \ -v /Users/zhoupb/data/www:/var/www \ -v /var/run/docker.sock:/var/run/docker.sock \ -p 8080:80 -p 8443:443 \ uozi/nginx-ui:latest
```

## 总结 🎓 ##

Nginx 不难，难的是知其所以然。

- 用 *Upstream​* 解决高可用。
- 用 *动静分离​* 减轻后端压力。
- 用 *Gzip* 和 *缓冲区​* 压榨性能。

下次运维兄弟找你吐槽“Nginx 又挂了”，请把这篇文章甩给他，然后淡定地喝一口咖啡说：“小问题，看日志。” ☕
