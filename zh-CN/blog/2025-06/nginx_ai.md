---
lastUpdated: true
commentabled: true
recommended: true
title: Nginx AI 服务代理与认证配置
description: Nginx AI 服务代理与认证配置
date: 2025-06-05 15:35:00 
pageClass: blog-page-class
cover: /covers/Nginx.svg
---

# Nginx AI 服务代理与认证配置 #

## 核心功能 ##

- **代理AI服务**：将 `/ai/service/` 请求转发到后端 `http://10.11.13.57/v1/`。
- **跨域支持**：处理 `OPTIONS `预检请求，配置CORS头。
- **请求认证**：通过子请求 (`auth_request`) 验证权限。
- **长连接优化**：设置超时时间（1小时）和HTTP/1.1长连接。

## CORS 跨域配置 ##

```nginx
if ($request_method = 'OPTIONS') {
    add_header 'Access-Control-Allow-Origin' $http_origin;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,...,Authorization';
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range';
    add_header 'Access-Control-Max-Age' 1728000;
    add_header 'Content-Length' 0;
    return 204;
}
```

- **作用**：响应浏览器预检请求，允许跨域访问。
- **关键头**：
  - `Access-Control-Allow-Origin`: 动态允许请求来源。
- `Access-Control-Max-Age`: 预检结果缓存20天。

## 认证机制 ##

### 认证流程 ###

1. 客户端请求 → Nginx 触发子请求 `/service/auth` 验证权限。
2. 认证服务
  - 返回 200：继续代理到后端。
  - 返回 401/403：拒绝请求。
3. 代理请求：通过后转发到AI服务。

### 关键配置 ###

```nginx
auth_request /service/auth;                  # 启用子请求认证
auth_request_set $auth_query_string $args;   # 传递原始参数
set $token $http_authorization;              # 提取客户端Token（未实际使用）
proxy_set_header Authorization 'Bearer app-B6t8hAv2'; # 硬编码Token（风险点）
```

### 认证服务实现（需补充） ###

#### 静态验证（Nginx直接检查） ####

```nginx
location /service/auth {
    if ($http_authorization != "Bearer valid-token") {
        return 403;
    }
    return 200;
}
```

#### 动态验证（调用外部服务） ####

```nginx
location /service/auth {
    proxy_pass http://auth-service/validate;
    proxy_pass_request_body off;
    proxy_set_header X-Original-Token $http_authorization;
}
```

## 代理配置 ##

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_http_version 1.1;
proxy_read_timeout 3600s;
proxy_cache off;
proxy_pass http://10.11.13.57/v1/;
```

- 关键项
  - 传递真实客户端IP（`X-Real-IP`）。
  - 禁用缓存（`proxy_cache off`），适合流式响应。
  - 超时设为1小时（适用于长耗时AI任务）。

## 安全风险与改进 ##

### 当前问题 ###

- **硬编码Token**：所有请求使用固定Token `app-B6t8hAv2`，泄露后无法撤销。
- **认证逻辑冲突**：`auth_request` 验证客户端Token，但代理时覆盖为固定值。

### 改进建议 ###

- 动态传递Token
  ```nginx
  proxy_set_header Authorization $http_authorization; # 原样传递客户端Token
  ```

### 双向认证 ###

- 认证服务生成临时Token供后端验证。
- 或启用mTLS（双向TLS）认证后端服务。

### 隐藏敏感信息 ###

- 避免Nginx日志记录Authorization头。

## 完整优化示例* ##

```nginx
location /ai/service/ {
# CORS处理
if ($request_method = 'OPTIONS') { ... }

# 认证
auth_request /service/auth;
auth_request_set $auth_status $upstream_status;
error_page 401 = @auth_error;

# 代理设置
proxy_set_header Authorization $http_authorization; # 动态Token
proxy_set_header X-Original-IP $remote_addr;
proxy_pass http://10.11.13.57/v1/;
}

location @auth_error {
return 401 "Authentication failed";
}
```

## 认证服务（示例） ##

```nginx
location /service/auth {
  proxy_pass http://auth-service/validate;
  proxy_pass_request_body off;
  proxy_set_header X-Original-Token $http_authorization;
}
```

## 关键总结 ##

- **认证核心**：`auth_request` + 子请求验证逻辑。
- **安全原则**：避免硬编码敏感信息，动态传递或生成凭证。
- **性能优化**：长超时、禁用缓存适合AI服务场景。
