---
lastUpdated: true
commentabled: true
recommended: true
title: Docker Compose 部署certbot实现TLS证书签发和续期
description: Docker Compose 部署certbot实现TLS证书签发和续期
date: 2026-01-28 09:00:00
pageClass: blog-page-class
cover: /covers/nginx.svg
---

## 前提条件 ##

- 有现成的域名、公网IP
- 可访问公网的服务器
- 可用的邮箱

## 开始部署 ##

### Certbot 镜像拉取 ###

```shell
docker pull certbot/certbot:v5.1.0
```

### 创建 docker-compose.yml 文件 ###

```yml
services:
  nginx:
    image: nginx:1.25.4
    container_name: nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/localtime:/etc/localtime:ro                  # 和服务器时间同步
      - /root/docker/nginx/nginx/:/etc/nginx/             # 主配置目录
      - /root/docker/nginx/nginx/certs/:/etc/letsencrypt  # 证书配置目录
      - /root/docker/nginx/html/:/usr/share/nginx/html    # 网站根目录
      - /root/docker/nginx/log/:/var/log/nginx            # 日志目录
    networks:
      - nginx-network
    restart: always
    entrypoint: ["/docker-entrypoint.sh"]
    command: ["nginx", "-g", "daemon off;"]
    stop_signal: SIGQUIT
    logging:
      driver: json-file
    networks: 
      - nginx-network
    depends_on:
      - certbot   # 确保 Certbot 先启动（非必须）

  certbot:
    image: certbot/certbot
    container_name: certbot
    volumes:
      - /root/docker/nginx/nginx/certs/:/etc/letsencrypt      # 证书存储目录（与 Nginx 共享）
      - /root/docker/nginx/html/:/var/www/html                # HTTP 验证所需的 Webroot
    networks: 
      - nginx-network
    restart: always

networks:
  nginx-network:
    external: true
    driver: bridge
```

### 修改 nginx.conf 或 创建 tansuo.conf 文件 ###

```yml
server {
    listen 80;
    server_name tansuo.com;  # 替换为你的域名
    #配置http验证可访问
    location ^~ /.well-known/acme-challenge/ {
        #此目录都是nginx容器内的目录，对应宿主机volumes中的http验证目录，而宿主机的又与certbot容器中命令--webroot-path指定目录一致，从而就整个串起来了，解决了http验证问题
        root /etc/letsencrypt;
    }
    # 其他请求重定向到HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}
```

### 启动服务 ###

```bash
docker compose -f docker-compose.yml up -d
```

### 测试证书发放 ###

运行以下命令测试证书发放是否正常：

```bash
docker compose run --rm certbot certonly --webroot --webroot-path /etc/letsencrypt --dry-run -d tansuo.com
```

如果输出 `The dry run was successful.`，说明测试成功。

如果出现`：：404`字样，首先检查 `yml` 配置是否和文章中的匹配，其次检查域名和公网IP是否正确绑定。最后重启nginx服务。

### 正式获取证书 ###

如果测试成功，去掉 `--dry-run` 参数正式获取证书：

```bash
docker compose run --rm certbot certonly --webroot --webroot-path /etc/letsencrypt -d tansuo.com
```

按照提示输入邮箱等信息，完成证书申请。

### 生成证书文件 ###

Certbot 会在 `/root/docker/nginx/nginx/certs/live/tansuo.com/` 目录下生成证书文件，包括：

- `fullchain.pem`：完整的证书链
- `privkey.pem`：私钥

### 创建 HTTPS 配置文件 ###

在你自定义的配置文件，比如上文创建的 `tansuo.conf` 中配置 HTTPS 信息：

```nginx
server {
    listen       443 ssl;
    server_name  tansuo.com;

    ssl_certificate /etc/letsencrypt/live/xxx.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/xxx.com/privkey.pem;
    ssl_session_timeout 5m;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
    ssl_prefer_server_ciphers on;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

    location /api/ {
        proxy_pass http://gateway:18080/;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

将此文件挂载到 Nginx 的配置目录中，我的tansuo.conf位于conf.d目录下。

### 重启 Nginx ###

重新加载 Nginx 配置以应用 HTTPS：

```bash
docker compose restart nginx
```

### 配置定时任务自动续期 ###

为了避免证书过期，创建一个检查脚本，设置定时任务为每月 1 号凌晨 2 点检查证书是否过期&自动续期证书&重启 Nginx：

```bash
vi renew-certbot.sh
```

```bash
#!/bin/bash

# Certbot SSL 证书自动续期脚本（针对90天有效期优化）
# 证书有效期：90天，推荐每30天检查续期

echo "=== SSL 证书自动续期脚本开始执行 ==="
echo "执行时间: $(date)"
echo "证书类型: Let's Encrypt (90天有效期)"

# 设置变量
LOG_FILE="/var/log/certbot-renew.log"
COMPOSE_DIR="/root/docker"

# 记录开始时间
START_TIME=$(date +%s)

# 检查必要目录
if [ ! -d "$COMPOSE_DIR" ]; then
    echo "错误: Docker Compose 目录不存在: $COMPOSE_DIR" | tee -a "$LOG_FILE"
    exit 1
fi

# 切换到工作目录
cd "$COMPOSE_DIR" || {
    echo "错误: 无法切换到目录 $COMPOSE_DIR" | tee -a "$LOG_FILE"
    exit 1
}

echo "工作目录: $(pwd)" | tee -a "$LOG_FILE"

# 检查 Docker 服务
if ! systemctl is-active --quiet docker; then
    echo "错误: Docker 服务未运行，尝试启动..." | tee -a "$LOG_FILE"
    systemctl start docker
    sleep 10
fi

# 检查证书过期时间（可选）
echo "检查证书状态..." | tee -a "$LOG_FILE"
docker compose run --rm certbot certificates 2>&1 | grep -E "(EXPIRED|VALID|Domains)" | tee -a "$LOG_FILE"

# 执行证书续期（--quiet 模式减少输出）
echo "开始证书续期检查..." | tee -a "$LOG_FILE"
docker compose run --rm certbot renew --quiet --non-interactive 2>&1 | tee -a "$LOG_FILE"

RENEW_RESULT=${PIPESTATUS[0]}

if [ $RENEW_RESULT -eq 0 ]; then
    echo "✓ 证书续期检查完成" | tee -a "$LOG_FILE"
    
    # 检查是否有证书被更新
    if docker compose run --rm certbot certificates 2>&1 | grep -q "待续期"; then
        echo "检测到证书需要更新，重启 Nginx..." | tee -a "$LOG_FILE"
        
        # 重启 Nginx
        docker compose restart nginx 2>&1 | tee -a "$LOG_FILE"
        
        if [ ${PIPESTATUS[0]} -eq 0 ]; then
            echo "✓ Nginx 重启成功" | tee -a "$LOG_FILE"
            # 发送通知（可选）
            echo "证书续期成功 - $(date)" >> /tmp/cert-renew-success.log
        else
            echo "⚠ Nginx 重启失败，请手动检查" | tee -a "$LOG_FILE"
        fi
    else
        echo "ℹ 无需续期，证书仍在有效期内" | tee -a "$LOG_FILE"
    fi
else
    echo "✗ 证书续期失败，退出码: $RENEW_RESULT" | tee -a "$LOG_FILE"
    # 可以在这里添加报警通知
    exit $RENEW_RESULT
fi

# 计算执行时间
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "脚本执行完成，耗时: ${DURATION}秒" | tee -a "$LOG_FILE"
echo "完成时间: $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
```

设置定时任务：

```bash
crontab -e
```

添加以下内容：

```bash
# Let's Encrypt 证书自动续期（90天有效期）
# 每月1号凌晨2点检查（足够安全）
0 2 1 * * /root/renew-certbot.sh >/dev/null 2>&1

# 日志清理（每月清理一次旧日志）
0 3 1 * * find /var/log -name "certbot-renew.*.log" -mtime +30 -delete
```

保存后，定时任务将自动运行。

## 总结 ##

通过以上步骤，使用 Certbot 为你的网站配置了TLS证书，并设置了自动续期任务。确保网站始终安全可靠，避免因证书过期导致的服务中断。
