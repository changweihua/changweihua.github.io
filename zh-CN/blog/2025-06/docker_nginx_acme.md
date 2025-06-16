---
lastUpdated: true
commentabled: true
recommended: true
title: docker 部署nginx+acme.sh 申请阿里云域名证书并且自动更新
description: docker 部署nginx+acme.sh 申请阿里云域名证书并且自动更新
date: 2025-06-12 15:55:00 
pageClass: blog-page-class
---

# 从界面到API对接：实现AI回复效果的完整实践 #

### 创建挂载目录 ###

```bash
mkdir /data/nginx/conf
mkdir /data/nginx/logs
mkdir /data/nginx/certs
```

## 在 `/data/nginx/conf` 目录下创建nginx的配置文件 `https.conf` ##

```nginx
server {
    listen       80;
    listen  [::]:80;
    server_name  localhost;

    access_log  /var/log/nginx/host.access.log  main;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }
    
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
} 
```

## 部署nginx ##

```nginx
docker run --name nginx -d -v /data/nginx/conf:/etc/nginx/conf.d -v /data/nginx/certs:/etc/nginx/certs -v /data/nginx/logs:/var/log/nginx -p 80:80 -p 443:443 --restart=always nginx
```

## 部署acme.sh ##

```bash
docker run --name alidns_acme -d --net=host --restart=always -v /data/nginx/certs:/certs -v  /var/run/docker.sock:/var/run/docker.sock -v /data/acme.sh/:/acme.sh -e Ali_Key=[阿里云appid] -e  Ali_Secret=[阿里云secret] neilpang/acme.sh daemon
```

进入容器 `docker exec -it alidns_acme /bin/sh`,安装docker客户端 `apk update & apk add docker & apk add docker-cli`

## 设置证书服务商以及 `acme.sh` 自动更新 ##

```bash
docker exec -it alidns_acme --set-default-ca --server letsencrypt --upgrade --auto-upgrade
```

## 生成证书 ##

```bash
docker exec -it alidns_acme --issue --dns dns_ali -d 需要生成证书的域名,例如abc.aa.com
```

## 创建对应域名证书的目录 ##

```bash
mkdir /data/nginx/certs/abc.aa.com
```

## 安装证书到对应的目录 ##

```bash
docker exec -it alidns_acme --install-cert -d 域名 --key-file /certs/abc.aa.com/key.pem --fullchain-file /certs/abc.aa.com/fullchain.pem --reloadcmd "docker exec nginx nginx -s reload"
```

## nginx 创建 https.conf 配置文件 ##

```nginx
server {
        listen 80;
        server_name abc.aa.com;

        location /.well-known/acme-challenge/ {
            root /usr/share/nginx/html;
            try_files $uri =404;
        }
        #所有http请求重定向到https
        location / {
            return 301 https://$host$request_uri;
        }
    }

    server {
        listen 443 ssl;
        server_name abc.aa.com;

        ssl_certificate /etc/nginx/certs/abc.aa.com/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/abc.aa.com/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
        }
    }
```

## reload nginx ##

```bash
docker exec -it nginx nginx -s reload
```

## 编写自动更新脚本，在 `/data/nginx` 目录下创建 `update_domain.sh` 文件 ## 

```bash
#!/bin/bash
#acme容器名称
CONTAINER_NAME="alidns_acme"
#脚本日志输出目录
LOG_FILE="./acme_renew.log"
#acme 证书目录
CERTS_DIR="/acme.sh"
#需要监控的域名列表，等号后面为续订成功后需要执行的命令
declare -A DOMAIN_ACTIONS=(
    ["gitlab.vijay.work"]="docker exec -it gitlab_17_7 gitlab-ctl hup nginx"
    #["api.example.com"]="systemctl restart api_service"
)

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

check_cert_hash() {
    docker exec $CONTAINER_NAME sha256sum "${CERTS_DIR}/${1}_ecc/fullchain.cer" 2>/dev/null | awk '{print $1}'
}

process_domain() {
    local domain=$1
    log "处理域名: $domain"
    
    local before_hash=$(check_cert_hash "$domain")
    if [[ -z "$before_hash" ]]; then
        log "错误：无法获取证书初始哈希值"
        return 3
    fi

    local output=$(docker exec $CONTAINER_NAME acme.sh --renew -d "$domain" --dns dns_ali 2>&1)
    local exit_code=$?
    echo "$output" >> "$LOG_FILE"

    if [[ "$output" == *"Skipping. Next renewal time"* ]]; then
        log "域名 $domain 未到期，跳过续订"
        return 2
    elif [[ $exit_code -ne 0 ]]; then
        log "域名 $domain 续订失败（状态码: $exit_code）"
        return 1
    fi

    local after_hash=$(check_cert_hash "$domain")
    if [[ "$before_hash" != "$after_hash" ]]; then
        log "证书更新成功（${before_hash:0:8} → ${after_hash:0:8}）"
        return 0
    else
        log "错误：证书文件未变化"
        return 4
    fi
}

execute_action() {
    local domain=$1
    local action="${DOMAIN_ACTIONS[$domain]}"
    
    if [[ -n "$action" ]]; then
        log "执行操作: $action"
        if eval "$action" >> "$LOG_FILE" 2>&1; then
            log "操作执行成功"
        else
            log "操作执行失败（状态码: $?）"
            return 1
        fi
    else
        log "未配置后续操作"
    fi
}

main() {
    for domain in "${!DOMAIN_ACTIONS[@]}"; do
        process_domain "$domain"
        case $? in
            0)
                execute_action "$domain"
                ;;
            2)
                log "[$domain] 未到期无需处理"
                ;;
            *)
                log "[$domain] 异常状态码: $?"
                ;;
        esac
    done
}
```

## 给脚本授予执行权限 ##

```bash
chmod 777 update_domain.sh
```

## 设置定时任务每天检查一次域名是否需要更新 ##

```bash
crontab -e 添加 0 0 * * * /data/nginx/update_domain.sh 保存退出
```
