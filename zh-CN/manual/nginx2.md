---
outline: false
aside: false
layout: doc
date: 2025-06
title: Nginx 配置实战：从摸鱼到部署，手把手教你搞定生产级配置
description: Nginx 配置实战：从摸鱼到部署，手把手教你搞定生产级配置
category: 文档
pageClass: manual-page-class
---

# Nginx 配置实战：从摸鱼到部署，手把手教你搞定生产级配置 #

> 先灵魂拷问一下：写了一堆接口却不会部署？服务器被恶意请求打崩过？静态资源加载慢到用户想摔手机？别慌！Nginx 作为后端工程师的「部署瑞士军刀」，能搞定反向代理、负载均衡、限流防刷等一堆骚操作。记住咯：不会部署项目的后端不是一个合格的后端，咱摸鱼可以，但服务器必须稳如老狗！

## 一、Nginx 是啥？能摸鱼吗？ ##

简单说，Nginx 是个高性能的「反向代理服务器」，就像你公司门口的保安：

- 外部请求先经过它，再转发到你的后端服务（反向代理）
- 它能同时处理上万个并发连接，比 Tomcat 单线程傻等强 100 倍（高并发处理）
- 还能帮你处理静态文件、压缩数据、防恶意攻击（摸鱼时的安全保镖）

举个栗子：你写了个电商接口，直接暴露 IP 怕被攻击？让 Nginx 当「中间人」，外部只知道 Nginx 的地址，真实服务器 IP 藏得严严实实，安心摸鱼不怕被抓包！

## 二、实战场景一：反向代理 & 负载均衡（高并发必备） ##

### 场景：多个后端服务负载不均，大促时部分服务器被压爆 ###

**配置目标**：让 Nginx 把请求均匀转发到 3 台后端服务器，隐藏真实 IP，还能自动剔除挂掉的节点。

```nginx
# 全局配置：定义Nginx运行的基本参数
user  nginx;  # 运行用户，默认就行
worker_processes  1;  # 工作进程数，一般设为CPU核心数，摸鱼主机设1也行
# 错误日志和PID文件
error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;
# 负载均衡配置：定义后端服务器列表
upstream backend_servers {
    # 轮询策略：默认按顺序转发请求
    server 192.168.1.10:8080;  # 后端服务器A
    server 192.168.1.11:8080;  # 后端服务器B
    server 192.168.1.12:8080;  # 后端服务器C
    
    # 进阶配置：健康检查（服务器挂了自动踢掉）
    least_conn;  # 最小连接数策略，哪个服务器空闲就转发给谁
    keepalive 32;  # 保持32个长连接，减少TCP三次握手开销
    proxy_next_upstream error timeout http_500;  # 转发失败时，自动重试下一台服务器
}
# 服务器配置：定义Nginx对外提供服务的端口和规则
server {
    listen       80;  # 监听80端口（HTTP）
    server_name  www.yourdomain.com;  # 域名，改成你的域名或IP
    
    # 反向代理规则：所有以/api/开头的请求转发到后端服务器
    location /api/ {
        proxy_pass http://backend_servers/;  # 转发到upstream定义的服务器组
        
        # 传递客户端真实IP（后端需要获取用户IP时用）
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # 超时配置：防止某个请求长时间阻塞
        proxy_connect_timeout 30s;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
```

**关键点**：

- 后端服务器 IP 全藏在 Nginx 里，外部只能访问 Nginx 的公网 IP。
- 大促时流量均匀分散到 3 台服务器，再也不用担心自己写的接口被压崩。

## 三、实战场景二：静态资源处理 & 动静分离（网页加载速度起飞） ##

**场景**：前端小姐姐抱怨图片 / JS 加载慢，甩锅说后端接口卡。

**配置目标**：让 Nginx 直接处理图片、CSS、JS 等静态文件，减轻后端压力。

```nginx
server {
    listen       80;
    server_name  www.yourdomain.com;
    # 静态资源路径：假设图片存在/data/images/，JS/CSS在/data/static/
    location /static/ {
        root /data/;  # 根路径，实际文件路径是/data/static/...
        autoindex off;  # 禁止列出目录（安全考虑）
        expires 30d;  # 浏览器缓存30天，减少重复请求
        gzip on;  # 开启压缩，减小文件传输大小
        gzip_types text/css application/javascript image/png;  # 压缩类型
    }
    location /images/ {
        root /data/;
        # 防盗链：防止其他网站盗用你的图片
        valid_referers none blocked www.yourdomain.com;
        if ($invalid_referer) {
            return 403;  # 非法引用返回403错误
        }
    }
    # 动态请求（如登录接口）还是转发给后端
    location /api/ {
        proxy_pass http://backend_servers/;
    }
}
```

**关键点**：

- 静态文件直接由 Nginx 返回，速度比后端处理快 10 倍以上。
- 浏览器缓存 + 压缩，用户第二次访问秒加载，前端小姐姐再也不甩锅。

## 四、实战场景三：限流防刷 & IP 黑白名单（防恶意攻击） ##

**场景**：接口被恶意 IP 高频访问，服务器日志爆满。

**配置目标**：限制单个 IP 的并发连接数和请求频率，拉黑恶意 IP。

```nginx
# 先定义限流策略，放在http块里（和upstream同级）
http {
    # 1. 并发连接限制：单个IP最多同时保持10个连接
    limit_conn_zone $binary_remote_addr zone=ip_conn:10m;  # 定义存储IP连接数的共享内存区
    # 2. 请求频率限制：单个IP每秒最多5个请求（令牌桶算法）
    limit_req_zone $binary_remote_addr zone=ip_req:10m rate=5r/s;  # 每秒生成5个令牌
    # 3. 黑白名单：定义允许/禁止访问的IP段
    set $allow_ip "192.168.1.0/24";  # 允许访问的内网IP段
    deny 10.0.0.1;  # 单独禁止某个IP
}
server {
    listen 80;
    server_name www.yourdomain.com;
    location /api/login {  # 登录接口重点保护
        # 应用并发连接限制：每个IP最多10个并发连接
        limit_conn ip_conn 10;
        # 应用请求频率限制：突发请求最多排队10个（超出返回503）
        limit_req zone=ip_req burst=10 nodelay;
        
        # 黑白名单检查
        if ($remote_addr !~* $allow_ip) {  # 如果IP不在允许列表
            return 403;  # 禁止访问
        }
        proxy_pass http://backend_servers/;
    }
}
```

**关键点**：

- 恶意 IP 频繁刷接口？直接返回 403，服务器日志再也不会爆了。
- 登录接口限流后，再也不用担心被 CC 攻击打崩。

## 五、实战场景四：HTTPS 配置（数据加密传输） ##

**场景**：用户反馈登录时浏览器提示「不安全」，被产品经理骂哭。

**配置目标**：启用 HTTPS，让数据加密传输，浏览器显示小绿锁。

```nginx
server {
    listen       443 ssl;  # 监听443端口（HTTPS）
    server_name  www.yourdomain.com;
    # 证书路径（从CA机构申请的证书和私钥）
    ssl_certificate      /etc/nginx/ssl/yourdomain.crt;
    ssl_certificate_key  /etc/nginx/ssl/yourdomain.key;
    ssl_protocols TLSv1.2 TLSv1.3;  # 启用安全的TLS协议版本
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384;  # 加密算法
    ssl_prefer_server_ciphers on;  # 优先使用服务器端的加密算法
    # 重定向HTTP到HTTPS（让用户输入http自动转https）
    rewrite ^(.*)$ https://$host$1 permanent;
    location / {
        proxy_pass http://backend_servers/;
    }
}
```

**关键点**：

- 小绿锁一亮，产品经理再也挑不出毛病。
- 数据加密传输，用户密码不怕被中间人窃取。

## 六、如何让 Nginx 跑起来？（部署） ##

### 安装 Nginx ###

- Linux：yum install nginx（CentOS）或apt-get install nginx（Ubuntu）
- Windows：官网下载解压，双击nginx.exe
- docker: docker run nginx

### 启动 / 重启 ###

```bash
sudo systemctl start nginx  # 启动
sudo systemctl restart nginx  # 改完配置后重启
```

### 检查配置是否正确 ###

```bash
nginx -t  # 报错的话回去改配置，别硬启动！
```

## 总结：Nginx 摸鱼指南 ##

- **反向代理**：藏好后端 IP，安心摸鱼不怕攻击。
- **负载均衡**：流量均分，再也不用背锅服务器崩了。
- **静态资源**：让 Nginx 处理图片 JS，后端专注写接口。
- **限流防刷**：恶意请求全拦下，日志清净心情好。
- **HTTPS**：小绿锁一挂，产品经理笑哈哈。

记住：**Nginx 配置不是一次性的**！上线后要根据服务器压力、用户反馈动态调整，比如大促时加大限流阈值，发现恶意 IP 及时拉黑。
