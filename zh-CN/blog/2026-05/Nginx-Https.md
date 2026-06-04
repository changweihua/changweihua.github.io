---
lastUpdated: true
commentabled: true
recommended: true
title: 免费 HTTPS 证书
description: acme.sh + Let's Encrypt + Nginx
date: 2026-05-08 09:15:00 
pageClass: blog-page-class
cover: /covers/nginx.svg
---

## 一、安装 acme.sh ##

```bash
curl https://get.acme.sh | sh
source ~/.bashrc
acme.sh --version
```

## 二、切换默认 CA 为 Let's Encrypt ##

acme.sh 从 v3.0 起默认使用 ZeroSSL，需要邮箱注册，建议切换为 Let's Encrypt（免费、自动续期、无需注册）：

```bash
acme.sh --set-default-ca --server letsencrypt
```

验证是否生效：

```bash
cat /root/.acme.sh/account.conf | grep CA_SERVER
# 应输出: CA_SERVER="https://acme-v02.api.letsencrypt.org/directory"
```

> 不需要手动修改 `account.conf`，`--set-default-ca` 会自动写入。手动 `echo >>` 追加反而可能产生重复条目。

如果不切换，签发时会看到类似提示要求注册邮箱：

```txt
[Wed Mar 11 04:59:28 PM CST 2026] acme.sh --register-account -m my@example.com
```

## 三、签发证书 ##

有三种方式，根据场景选择：

### 方式一：standalone（临时用） ###

```bash
acme.sh --issue -d example.com -d www.example.com --standalone
```

要求：

- 必须占用 80 端口，签发前需要先停掉 Nginx：`systemctl stop nginx`
- 签发完记得重新启动 Nginx

适合临时签发或测试，不适合线上环境（续签时也要停 Nginx）。

### 方式二：webroot（推荐生产环境） ###

```bash
acme.sh --issue -d example.com -d www.example.com -w /var/www/acme
```

前置条件：必须先在 Nginx 中配好验证路径，否则签发会失败：

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/acme;
        default_type "text/plain";
    }
}
```

配好后 reload Nginx 并验证：

```bash
systemctl reload nginx
mkdir -p /var/www/acme/.well-known/acme-challenge
echo "test" > /var/www/acme/.well-known/acme-challenge/test
curl http://example.com/.well-known/acme-challenge/test
# 应输出: test
```

验证通过后再执行签发命令。

### 方式三：nginx 自动模式（简单环境可用） ###

```bash
acme.sh --issue -d example.com -d www.example.com --nginx
```

acme.sh 会临时修改 Nginx 配置来完成验证，验证后还原。多 server 块或复杂配置下容易出问题，不太推荐。

#### 签发成功输出示例 ####

```txt
[Thu Mar 12 08:41:37 PM CST 2026] Your cert is in: /root/.acme.sh/example.com_ecc/example.com.cer
[Thu Mar 12 08:41:37 PM CST 2026] Your cert key is in: /root/.acme.sh/example.com_ecc/example.com.key
[Thu Mar 12 08:41:37 PM CST 2026] The intermediate CA cert is in: /root/.acme.sh/example.com_ecc/ca.cer
[Thu Mar 12 08:41:37 PM CST 2026] And the full-chain cert is in: /root/.acme.sh/example.com_ecc/fullchain.cer
```

## 四、安装证书到固定路径 ##

> 不要直接在 Nginx 中引用 `/root/.acme.sh/` 下的证书文件。 续签后这些文件内容会变化，但 Nginx 不会自动加载，会导致证书过期。

正确做法是用 `--install-cert` 把证书复制到固定路径，并配置续签后自动 reload：

```bash
mkdir -p /etc/nginx/ssl

acme.sh --install-cert -d example.com \
  --ecc \
  --key-file       /etc/nginx/ssl/example.com.key \
  --fullchain-file /etc/nginx/ssl/example.com.crt \
  --reloadcmd      "systemctl reload nginx"
```

这一步做了三件事：

- 把证书复制到 `/etc/nginx/ssl/`，路径固定不变
- 记录 reloadcmd，续签后自动执行 `systemctl reload nginx`
- 后续自动续签时会自动重复这个流程，不需要人工干预

## 五、自动续签 ##

acme.sh 安装时会自动创建 cron 定时任务，证书在到期前会自动续签（Let's Encrypt 证书有效期 90 天）。

查看定时任务：

```bash
crontab -l
```

手动测试续签是否正常（不会真的重新签发，除非加 `--force`）：

```bash
acme.sh --renew -d example.com --ecc --force
```

签发时用的 ECC 证书（路径带 `_ecc`），手动续签时也要加 `--ecc`，避免跟同域名的 RSA 证书混淆。

## 六、Nginx 完整配置 ##

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    # acme.sh 验证路径，续签时需要
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/acme;
        default_type "text/plain";
    }

    # 其余请求全部跳转 HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name example.com www.example.com;

    ssl_certificate     /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_timeout 10m;
    ssl_session_cache shared:SSL:10m;

    root /var/www/html;
    index index.html;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

如果需要 WebSocket 支持，在 http 块中加 map，并在 location 中补上 header：

```nginx
# 放在 http {} 块中
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

# 在需要 WebSocket 的 location 中添加
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $connection_upgrade;
```

验证并重载配置：

```bash
nginx -t
systemctl reload nginx
```

> 用 `reload` 而不是 `restart`，`reload` 不会中断现有连接。
