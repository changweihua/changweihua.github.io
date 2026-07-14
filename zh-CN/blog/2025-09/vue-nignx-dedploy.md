---
lastUpdated: true
commentabled: true
recommended: true
title: 前端项目部署 nginx 代理
description: Vue3 + Vite 项目部署到 Nginx 的配置方案
date: 2025-09-29 13:00:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---


## Vue3 + Vite 项目部署到 Nginx 的配置方案 ##

根据你的需求，你需要将多个 Vue3 + Vite 项目部署到同一个 Nginx 服务器上，并且希望通过不同端口或路径访问不同项目。以下是几种配置方案：

### 方案一：通过不同路径访问不同项目（共享端口） ###

假设你的项目结构如下：

- `/mydist/`- 第一个项目
- `/mydemo/`- 第二个项目
- `/mylist/`- 第三个项目

**Nginx 配置示例**：

```nginx
  server {
    listen 80;
    server_name your-domain.com;
     # 第一个项目 - mydist
    location /mydist/ {
        alias /path/to/your/mydist/;
        try_files $uri $uri/ /mydist/index.html;
    }

    # 第二个项目 - mydemo
    location /mydemo/ {
        alias /path/to/your/mydemo/;
        try_files $uri $uri/ /mydemo/index.html;
    }

    # 第三个项目 - mylist
    location /mylist/ {
        alias /path/to/your/mylist/;
        try_files $uri $uri/ /mylist/index.html;
    }
}
```

**注意事项**​：

确保每个 Vue 项目的 `vite.config.ts` 中设置了正确的 `base`：

```ts
// mydist 项目的配置
export default defineConfig({
  base: '/mydist/',
  // 其他配置...
})
```

### 方案二：通过不同端口访问不同项目 ###

```nginx
# 第一个项目 - mydist (端口 8001)
server {
    listen 8001;
    server_name your-domain.com;

    location / {
        root /path/to/your/mydist;
        try_files $uri $uri/ /index.html;
    }
}

# 第二个项目 - mydemo (端口 8002)
server {
    listen 8002;
    server_name your-domain.com;

    location / {
        root /path/to/your/mydemo;
        try_files $uri $uri/ /index.html;
    }
}

# 第三个项目 - mylist (端口 8003)
server {
    listen 8003;
    server_name your-domain.com;

    location / {
        root /path/to/your/mylist;
        try_files $uri $uri/ /index.html;
    }
}
```

**注意事项**​：

这种情况下，Vue 项目的 `base` 可以设置为 `/`：

```ts
export default defineConfig({
  base: '/',
  // 其他配置...
})
```

**访问方式**：

- mydist: `http://your-domain.com:8001`
- mydemo: `http://your-domain.com:8002`
- mylist: `http://your-domain.com:8003`

## Nginx 中 `root` 和 `alias` 的区别与使用场景 ##

`root` 和 `alias` 都是 Nginx 中用于指定文件系统路径的指令，但它们的工作方式有重要区别。

### 主要区别 ###

|  特性   |  `root`  |  `alias`  |
| :-----------: | :-----------: | :-----------: |
| ​路径处理 | ​会将 `location` 部分追加到路径后 | 完全替换 `location` 部分 |
| ​结尾斜杠 | ​通常不需要 | 必须与 `location` 匹配 |
| ​使用场景 | ​一般目录 | 需要精确映射的特殊目录 |

### `root` 的工作方式 ###

```nginx
location /static/ {
    root /var/www/html;
}
```

当访问 `/static/image.jpg` 时，Nginx 会查找：

```txt
/var/www/html/static/image.jpg
```

*注意*：`root` 会将完整的 URI 路径（包括 `location` 部分）追加到指定的目录后。

### `alias` 的工作方式 ###

```nginx
location /static/ {
    alias /var/www/static_files/;
}
```

当访问 `/static/image.jpg` 时，Nginx 会查找：

```txt
/var/www/static_files/image.jpg
```

*注意*：`alias` 会用指定的路径完全替换 `location` 部分

### 重要注意事项 ###

**​斜杠问题**​：

使用 `alias` 时，`location` 和 `alias` 的结尾斜杠必须一致

*正确*：

```nginx
location /static/ {
     alias /var/www/files/;
}
```

*错误*：

```nginx
location /static {
     alias /var/www/files/;
}
```

**​正则表达式 `location`**​：

在正则表达式 `location` 块中只能使用 `alias`，不能使用 `root`

**​性能考虑**​：

`root` 通常比 `alias` 稍微高效一点，因为少了一次路径替换操作,但在大多数情况下差异可以忽略不计
