---
lastUpdated: true
commentabled: true
recommended: true
title: Nginx 配置，将前端项目配置到子路径下踩过的坑
description: Nginx 配置，将前端项目配置到子路径下踩过的坑
date: 2025-10-24 09:00:00 
pageClass: blog-page-class
cover: /covers/Nginx.svg
---

## 实战场景还原：为什么静态资源被误捕获？ ##

在项目中，使用了以下配置处理 Vue 子应用 `/pic/`：

```nginx
location /pic/ {
  alias /www/wwwroot/html2/dist/;
  index index.html;
  try_files $uri $uri/ /index.html;
}
```

发现：当存在全局正则 `location ~ .*\\.(js|css)?$` 匹配(Regular Expressions Matches)路径时：

```nginx
location ~ .*\\.(js|css)?$ {
  expires 12h;
  access_log /dev/null;
}
```

请求诸如 `/pic/assets/xxx.css` 时，竟然没有走 `/pic/` 块，而被这个正则拦住，导致静态资源 404 并且无日志输出——正因为 `access_log` 被重定向到 `/dev/null`。

因为没有日志，导致排查问题的时候产生困惑，多次排查才找到问题所在。

### 踩坑原因：Nginx 匹配优先级误区 ###

- 正则匹配的优先级高于普通前缀匹配 。默认情况下，即使 `/pic/` 前缀更具体，但是这是Nginx匹配里面的最低级匹配。
- 匹配到正则块后，由于缺少 `alias` 或 `root`，Nginx 会用 `server` 块的 `root` 去访问 `/html/_site/pic/assets/...` → 404。

## 官方匹配优先级机制（技术详解） ##

Nginx 官方文档及社区总结的是这样的匹配优先级逻辑：

1. Exact match `location = /foo` — 精确匹配，优先级最高；
2. Longest prefix match 普通前缀定位，选择最长匹配；
   - 若使用 ^~，一旦匹配则立即使用，不再检查正则；
3. Regex match `~` 或 `~*` 类型，按声明顺序依次检查，一旦匹配，中止查找；
4. 若无正则匹配，回退使用最长前缀。

**例如**：

- 请求 `/images/1.gif` 遇到明显 `/images/` 前缀，如果加了 `^~`，则跳过所有正则判断，直接进入该位置处理。
- 社区补充说明：“`^~` 修饰符能使前缀匹配优于 regex”。

## 解决方案 ##

### 推荐配置方式（屏蔽正则干扰，确保配置的 alias 生效）###

```nginx
server {
  ...

  # 针对 /pic/ 使用 ^~ 提高优先级
  location ^~ /pic/ {
    alias /www/wwwroot/html2/dist/;
    index index.html;
    try_files $uri $uri/ /index.html;
  }

  # 全局静态资源缓存
  location ~* \.(js|css|gif|jpg|jpeg|png|bmp|swf)$ {
    expires 12h;
    # 不要屏蔽日志，便于问题排查
    # access_log /dev/null;
  }

  ...
}
```

这样 `/pic/assets/*.css` 会优先进入 `/pic/`，避免 `regex` 抢匹配。

#### 关键配置原则总结 ###

- 遇到一些静态资源访问不到的问题，可以打开日志查看。
- 如果日志里面没有发现对应的请求，注意 `access_log` 的日志是否被屏蔽了。
- 用 `^~` 明确表示“前缀优先”，这种匹配方式仅次于 `nginx` 的完全匹配；
