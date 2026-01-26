---
lastUpdated: true
commentabled: true
recommended: true
title: nginx 配置
description: nginx 配置
date: 2026-01-22 11:00:00
pageClass: blog-page-class
cover: /covers/nginx.svg
---

> 从一份 server 到看懂整套路由规则

## 引言：从「改一行配置」到「线上整站 502」 ##

有一次，一个同事说要「顺手改下 nginx 配置」，给某个接口加一条简单的转发规则。

几分钟后，测试环境一片 502，登录页面也打不开了，大家第一反应是：是不是后端挂了、是不是 Redis 崩了。

最后排查下来，问题既不是网络，也不是代码，而是：

- 在 `server` 里多加了一条 `location`；
- 少看了几行已有规则；
- 让一个优先级更高的 `location` 把全站请求都「截胡」了。

*nginx 配置最大的坑，不是你不会写，而是你以为你写的是这条路，其实它走的是另一条。*

我们就不从「指令大字典」开始，而是从一份最常见的 `server` 配置入手，把 `nginx` 的基本心智模型和路由优先级讲清楚。

## 一、先把大图看清：http / server / location 到底在干嘛？ ##

绝大部分人第一次看到 nginx 配置，大概是这样的结构：

```nginx
http {
    include       mime.types;
    default_type  application/octet-stream;

    server {
        listen       80;
        server_name  localhost;
        charset      utf-8;

        location / {
            root   html;
            index  index.html index.htm;
        }

        location /test {
            proxy_pass https://wangmiaozero.cn;
        }
    }
}
```

如果只记这一句就够用了：

> http 是「总配置」，server 是「虚拟主机」，location 是「这一台主机上的路由规则」。

### http：全局规则与公共基础设施 ###

`http { ... }` 里通常放的是「所有 HTTP 服务都能用到的东西」：

- `include mime.types`：引入文件类型映射；
- `default_type`：默认响应类型；
- 各种全局的缓存、日志、连接数、超时配置等。

你可以把 `http` 想象成「一个机房」：

- 机房里会有一堆机器（`server`）；
- 机房级别会有统一的规矩（`http` 里的配置）；
- 单个机器也可以在自己房间里加点特殊设置（`server` 级别覆盖）。

### server：一台逻辑上的「虚拟主机」 ###

`server { ... }` 就是一台虚拟主机，它通过：

- `listen`：监听端口；
- `server_name`：匹配域名；

来决定「这个请求是不是该我接」。

一个 `nginx.conf` 里可以有很多个 server：

- `server_name www.xxx.com`：网站 A；
- `server_name api.xxx.com`：网站 B；
- `server_name *.internal.xxx.com`：内部管理系统等。

用户的 HTTP 请求，先是被某一个 `server` 接住，才会往 `location` 里面走。

###  location：这一台主机上的「路由与分发规则」 ###

有了 `server` 之后，剩下的问题就是：

> 收到一个请求路径 `/foo/bar`，到底交给谁处理？

这就是 `location` 的工作了。

常见的指令大致长这样：

- `root`：静态资源根目录；
- `index`：默认首页文件；
- `proxy_pass`：把请求转发到后端；
- `rewrite`：在当前域名下改写路径。

日常开发中，**大部分「玄学问题」都出在 location 上**——要么没命中预期的规则，要么被更高优先级的规则截胡。

## 二、location 的 7 种写法，其实只是在玩**谁先说了算** ##

网上经常会看到这样的总结：

**`=` 精确匹配、`^~` 前缀、`~` 正则、`/` 通吃**，记完一遍下次又忘了。

我们换个更工程一点的视角：`location` 玩的是「优先级 + 是否继续匹配」这两个维度。

### 先看 7 种写法 ###

按照官方语义 + 实战行为，location 粗略可以分成 7 类，从高到低是：

- `=` 精确匹配
- 完整路径匹配（如 `location /test/aaa/bbb.html`）
- `^~ /test`：以 `/test` 开头，命中后不再往后找
- `~ pattern`：区分大小写的正则，命中后不再往后找
- `~* pattern`：不区分大小写的正则，命中后不再往后找
- `/test`：普通前缀匹配，命中后还会继续往后找更长的前缀
- `/`：兜底规则，什么都匹配，优先级最低

你可以记成两个简单的问题：

- 当前规则优先级高不高？
- 命中之后还要不要继续往后找？

### 两条大原则 + 两条细则 ###

如果你只想背少量规则，把这 4 条刻进脑子就够了：

**整体优先级**：

精确匹配(`=`) > 完整路径 > `^~` > 正则(`~` / `~*`) > 普通前缀(`/xxx`) > `/`

**是否继续匹配**：

除了普通前缀 `/xxx` 会继续往后找，其它类型（`=` `/` `^~` `/` `~` `/` `~*`）一旦命中就停止。

**同类型之间**：

- 多个正则之间 `/` 多个 `^~` 之间：命中第一个就停，顺序很重要；
- 多个普通前缀（都是 `/xxx` 开头）：最长匹配优先，跟先后顺序无关。

**`/` 永远是兜底**：

不管前面写了多少规则，/ 都是最后一条救命稻草。

> 如果觉得记不住，可以把 location 理解成：「先挑最有资格说话的人，然后看他有没有把话说死」。

## 三、通过 5 个小实验，把优先级打进肌肉记忆 ##

理解规则是一回事，能不能在脑子里「算出结果」是另一回事。

下面的例子全部可以直接丢进 nginx 里测试。

### 示例一：精确匹配永远优先于普通 `/path` ###

```nginx
location /hello.json {
    default_type  text/html;
    return 200 '111';
}

location = /hello.json {
    default_type  text/html;
    return 200 '222';
}
```

访问 `/hello.json`，返回的是 `222`。

- 原因：`=` 精确匹配优先级最高，先命中就直接停；
- 普通 `/hello.json` 虽然看起来一样，但在规则里属于「前缀匹配」。

### 示例二：`^~` 比正则更「强势」 ###

```nginx
# 虽然 222 在后面，但是由于 ^~ 优先级更高，所以第二个生效
location ~ /test/aaa {
    return 200 '111';
}

location ^~ /test/aaa {
    return 200 '222';
}
```

访问 `/test/aaa/bbb.json`，返回的是 `222`。

**解释**：

- `^~ /test/aaa` 属于「前缀但不再继续找」这一类，优先级高于正则；
- 即便它在后面出现，依然会先拿到话语权。

### 示例三：多个正则，先写的先赢 ###

```nginx
# 多个正则之间，第一个匹配生效，与顺序有关
# 虽然越往后匹配越精确，但只要是正则，匹配到第一个就停止
location ~ / {
    return 200 '111';
}

location ~ /test/aaa {
    return 200 '222';
}

location ~ /test/aaa/.*\.(gif|jpg|jpeg)$ {
    return 200 '333';
}
```

访问 `/test/aaa/bbb.json`，命中的其实是第一条正则（返回 `111`），因为：

- `/` 这个正则也能匹配一切路径；
- 正则之间遵循「先写先赢」，匹配到第一个就不再往后看。

### 示例四：同路径前缀下，正则 > 普通前缀 ###

```nginx
# 不管二者如何交换顺序，始终都是第二个生效
location /test/aaa {
    return 200 '111';
}

location ~ /test/aaa {
    return 200 '222';
}
```

访问 `/test/aaa/bbb.json`，返回 `222`：

- `~ /test/aaa` 是正则，优先级比普通前缀 `/test/aaa` 更高；
- 先比「种类优先级」，再谈顺序。

### 示例五：都是前缀匹配时，看谁更长 ###

```nginx
# 都是 / 开头时，最长匹配生效，和先后顺序无关
location /test/ {
    return 200 '111';
}

location /test/aaa/ccc {
    return 200 '222';
}

location /test/aaa/ {
    return 200 '333';
}

location / {
    return 200 '444';
}
```

访问 `/test/aaa/bbb/ccc.json`：

- `/test/` 能匹配；
- `/test/aaa/` 也能匹配；
- `/test/aaa/ccc` 也能匹配；

最终选的是字符串最长的那条：`/test/aaa/ccc` → 返回 `222`。

## 四、rewrite 和 proxy_pass：重写 vs 转发，不要搞混 ##

日常配置里，大家最容易把 `rewrite` 和 `proxy_pass` 混成一团：「反正都是改 URL，对吧？」——其实差别挺大。

### rewrite：只在当前域名里改路由 ###

`rewrite` 的典型用途是：

- 在同一个域名下，把 `/old/path` 改写成 `/new/path`；
- 决定是内部跳转（`last`）还是返回 301/302（`redirect` / `permanent`）。

它做的只是路径层面的改写，不会帮你换服务器、换端口：

```nginx
location /old {
    rewrite ^/old/(.*)$ /new/$1 last;
}
```

### proxy_pass：把请求「交给别人处理」 ###

`proxy_pass` 则是反向代理：

- 可以把请求丢给任意地址：`http://127.0.0.1:8080`、`https://api.xxx.com`；
- 可以在这一层加各种 header、超时、缓冲配置等。

```nginx
location /api {
    proxy_set_header X-Real-IP        $remote_addr;
    proxy_set_header X-Forwarded-For  $proxy_add_x_forwarded_for;
    proxy_set_header Host             $http_host;
    proxy_connect_timeout 10;
    proxy_pass http://127.0.0.1:6666;
}
```

一句话区分：

- `rewrite`：路由改写，只在当前主机内「换一条路走」；
- `proxy_pass`：反向代理，把整条请求「交给另一台服务」。

## 五、nginx 配置的「可预期性」：从记语法到记行为 ##

很多人觉得 nginx 配置玄学，本质上是因为：

- 只记住了「怎么写」，没记住「会发生什么」；
- 只在单条规则上做实验，很少在多个 `location` 组合下做验证。

如果你把这一篇的核心知识点压缩成一张纸，大概就是：

- `http` / `server` / `location` 的分层职责；
- 7 种 `location` 写法的`优先级 + 是否继续匹配`；
- 5 个例子里「谁先说话、谁最后拍板」的行为模式；
- `rewrite` 只改路径，`proxy_pass` 才是真正转发。

> nginx 最容易犯错的地方，不在于你不会写指令，而在于你没能在脑子里把「真正的匹配过程」想一遍。

> HTTPS、转发、跨域与泛域名的实战套路

## 引言：当域名、证书和转发规则「搅在一起」 ##

有个同事接了个看似简单的需求：

- 把 `http://www.test.com` 转到内部服务 `127.0.0.1:6666`；
- 顺带上个 HTTPS，给前端 API 用；
- 再加一下 CORS，方便本地调试。

结果一顿操作之后：

- HTTP 可以访问，但被浏览器标红「不安全」；
- HTTPS 能连上，但接口 502，日志里全是「no resolver defined」之类的提示；
- 跨域头随缘返回，有时候 OPTIONS 直接 403。

域名、证书、转发、跨域，这些看起来零散的需求，最后都会聚在 nginx 这一层。

这一篇，我们沿着一个「入口流量」的视角，把 HTTPS、反向代理、CORS、永久跳转、泛二级域名这些高频场景串成一条线：让你对「nginx 作为流量入口」有一个完整、可落地的实战套路。

## 一、HTTPS：让 TLS 仅仅是「多写几行配置」 ##

HTTPS 本身的协议细节可以很复杂，但在 `nginx` 里，最基础的启用方式其实就几行：

```nginx
server {
    listen       443 ssl;
    server_name  example.com;

    ssl_certificate      cert.crt;
    ssl_certificate_key  cert.key;
    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;
    ssl_ciphers          HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        root   html;
        index  index.html index.htm;
    }
}
```

几个要点：

- `listen 443 ssl`：没有 `ssl` 关键字，nginx 不会以 TLS 模式监听；
- `ssl_certificate` / `ssl_certificate_key`：公钥证书 + 私钥；
- 其余如 `session_cache`、`ciphers` 是典型的「按安全基线抄」配置。

> 工程实践里，HTTPS 真正的难点往往不是「写哪几行」，而是证书申请、更新自动化，以及如何把 HTTP 流量低成本地引到 HTTPS 上。

## 二、反向代理：把前端流量稳稳送到后端 ##

最常见的 nginx 用法，依旧是反向代理：把「对外的域名」映射到「内部的服务」上。

### 标准反向代理模板 ###

例如，把 `http://www.test.com` 转发到本地 `127.0.0.1:6666`：

```nginx
server {
    listen       80;
    server_name  www.test.com;

    location / {
        # 透传真实客户端 IP
        proxy_set_header X-Real-IP       $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host            $http_host;

        # 代理连接超时设置为 10 秒，默认 60 秒太长
        proxy_connect_timeout 10;

        proxy_pass http://127.0.0.1:6666;
    }
}
```

几个实践建议：

- 不要用 localhost，对于某些配置（尤其结合变量）会踩到解析坑，IP 更稳妥；
- 一定要设置 proxy_connect_timeout，否则后端服务半死不活时，前端会等到怀疑人生；
- 把 Host 透传给后端，很多应用会根据 Host 做路由或多租户判断。

### 再加一层：入口 + BFF + 后端 ###

在真实生产环境中，nginx 一般只是「最外面那层」：

- nginx 把流量打到 BFF（Node.js / Nest / Hono）；
- BFF 再去调内部服务（Go / Java / 微服务集群）。

nginx 里这层的目标只有两个字：**干净**。

- 不做业务逻辑，只做协议层的事情：TLS、限流、基本鉴权、CORS、流量分流；
- 其余复杂逻辑交给 BFF / 网关层处理。

## 三、CORS：把跨域放在入口统一处理 ##

前端最常见的一句抱怨：「明明后端已经在接口里加了 CORS，怎么浏览器还是说跨域？」

如果你的 nginx 在最外层挡着，而后端只给应用服务加了 CORS，很可能出现：

- 预检（OPTIONS）被 nginx 拦下了，根本没到后端；
- 或者 nginx 自己返回了 4xx/5xx，却没带任何 CORS 头。

最简单的解决方式，就是直接在 nginx 入口层加 CORS 头：

```nginx
server {
    listen       80;
    server_name  www.test.com;

    location / {
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Headers' 'Origin, No-Cache, X-Requested-With, If-Modified-Since, Pragma, Last-Modified, Cache-Control, Expires, Content-Type, X-E4M-With' always;
        add_header 'Access-Control-Allow-Methods' 'POST, GET, OPTIONS' always;

        # 如果需要处理 OPTIONS 预检，可以单独拦一条
        if ($request_method = OPTIONS) {
            return 204;
        }

        proxy_pass http://127.0.0.1:6666;
    }
}
```

要点：

- `always` 可以确保即便返回 4xx/5xx 也带上 CORS 头；
- 尽可能在**入口层统一处理 CORS**，而不是每个后端服务都写一遍。

> CORS 这种「协议层」的东西，放在入口统一做，比撒在各个业务代码里要可靠得多。

## 四、永久跳转：把「历史域名」优雅收束起来 ##

历史域名、带不带 `www`、从 HTTP 到 HTTPS，这些需求本质上都是「跳转」问题。

### 从带 www 跳到不带：www → 非 www ###

例如，将 `http://www.wangmiaozero.cn` 永久跳转到 `http://wangmiaozero.cn`，并丢弃路径：

```nginx
server {
    listen       80;
    server_name  www.wangmiaozero.cn;

    location / {
        rewrite ^(.*) http://wangmiaozero.cn permanent;
    }
}
```

这里的 `permanent = 301`，浏览器会长期记住。

### 从 HTTP + www 跳到 HTTPS + 非 www ###

如果希望：

- `http://www.wangmiaozero.cn/foo` → 永久跳转到 `https://wangmiaozero.cn/foo` （保留路径）：

```nginx
server {
    listen       80;
    server_name  www.wangmiaozero.cn;

    location / {
        rewrite ^(.*) https://wangmiaozero.cn$document_uri permanent;
    }
}
```

注意：

- `$document_uri` 是「不含查询参数」的路径；
- 如果需要连 `query` 一起保留，可以用 `$request_uri`。

> 推荐做法是：所有 HTTP 流量统一跳到 HTTPS + 归一后的主域名，用户访问路径尽量保持不变。

## 五、泛二级域名：一套配置搞定「N 个子站点」 ##

当你有一堆类似：

- `tenant-a.example.com`
- `tenant-b.example.com`
- `foo.internal.example.com`

的需求时，就轮到「泛二级域名」登场了。

### 基于转发的泛二级域名：不同子域名 → 不同后端路径 ###

目标：`http://*.wangmiaozero.cn/` 统一转发到 `http://127.0.0.1:8080/*/`。

示例配置：

```nginx
http {
    include       mime.types;
    default_type  application/octet-stream;

    # 重要：当 proxy_pass 里用变量构造地址时，必须配置 resolver
    resolver 8.8.8.8;

    sendfile        on;
    keepalive_timeout  65;

    # 某些特殊域名单独写在前面
    server {
        listen       80;
        server_name  www.wangmiaozero.cn www.test.com test.com;

        location / {
            rewrite ^(.*) http://wangmiaozero.cn permanent;
        }
    }

    server {
        listen       80;
        server_name  demo.wangmiaozero.cn;

        location / {
            root   D:/Workspace/github/demo;
            index  index.html index.jsp;
        }
    }

    # 泛二级域名：匹配 *.wangmiaozero.cn
    server {
        listen       80;
        server_name  ~^(.+)?\.wangmiaozero\.cn$;

        location / {
            # 注意这里要用 127.0.0.1，不要用 localhost
            proxy_pass http://127.0.0.1:8080/$1$request_uri;
        }
    }
}
```

说明：

- `server_name ~^(.+)?\.wangmiaozero\.cn$` 用正则把子域名拿出来；
- `$1` 就是子域名，可以直接拼在转发路径里；
- 前面可以加若干「特殊子域名」的 `server`，nginx 会先命中那些更具体的配置。

### 基于目录的泛二级域名：不同子域名 → 不同静态目录 ###

如果你想把 `a.wangmiaozero.cn` 映射到 `D:/Workspace/github/test/a`，`b.wangmiaozero.cn` 映射到 `.../test/b`，可以这样写：

```nginx
server {
    listen       80;
    server_name  ~^(.+)?\.wangmiaozero\.cn;

    location / {
        root   D:/Workspace/github/test/$1;
        index  index.html index.jsp;
    }
}
```

这套配置对「多租户静态站点」特别友好：

- 每个子域名一个目录；
- 上线只需要把对应目录挂上去。

### no resolver defined to resolve localhost：别再踩一次的坑 ###

当你在 `proxy_pass` 里用变量拼接地址时，例如：

```nginx
proxy_pass http://$http_host$request_uri;
```

如果没有配置 resolver，nginx 会报：

```text
no resolver defined to resolve localhost
```

这就是前面配置里那句：

```nginx
resolver 8.8.8.8;
```

存在的意义：*当 nginx 需要在运行时解析一个域名（通过变量构造时），必须有 DNS 可以用*。

## 六、`server_names_hash_bucket_size`：域名多了，表要加大 ##

当你在一个 `http {}` 里写了大量 `server_name` 时，有可能在 reload 时看到这样的错误：

```text
could not build the server_names_hash, you should increase server_names_hash_bucket_size: 64
```

大意就是：「存域名的 hash 桶不够大了，请你调大点」。

解决办法也很简单，在 `http {}` 里加一行：

```nginx
http {
    include       mime.types;
    default_type  application/octet-stream;

    # 域名过多时需要配置这个参数，一般是 2 的指数，比如 512
    server_names_hash_bucket_size 512;
}
```

> 工程视角下，这类「hash bucket」报错的本质，就是 nginx 在帮你暗戳戳管理一张「域名路由表」，当这张表太挤时，你需要多给它一点空间。

## 七、路径追加规则：`root / proxy_pass` 到底怎么拼 URL？ ##

路径拼接规则，是另一个高频「凭感觉写」然后翻车的地方。

看一段典型配置：

```nginx
server {
    listen       80;
    server_name  www.test.com;

    location / {
        root  E:/Workspace/test/htdocs/;
        index index.html;
    }

    location /test_root {
        # 访问 www.test.com/test_root/aaa/index.html
        # 实际访问的是 htdocs/test_root/aaa/index.html
        root  E:/Workspace/test/htdocs/;
        index index.html;
    }

    location /test_proxy1 {
        # 访问 www.test.com/test_proxy1/aaa/index.html
        # 实际访问 www.proxy.com/test_proxy1/aaa/index.html
        proxy_pass http://www.proxy.com;
        proxy_buffering off;
    }

    location /test_proxy2 {
        # 访问 www.test.com/test_proxy2/aaa/index.html
        # 实际访问 www.proxy.com//aaa/index.html
        proxy_pass http://www.proxy.com/;
        proxy_buffering off;
    }

    location /test_proxy3 {
        # 访问 www.test.com/test_proxy3/aaa/index.html
        # 实际访问 www.proxy.com/bbb/aaa/index.html
        proxy_pass http://www.proxy.com/bbb;
        proxy_buffering off;
    }
}
```

可以总结出几个实用结论：

- `root` + `location`：

  - `location /foo` + `root /var/www` → 实际路径是 `/var/www/foo/`...；
  - 不管 `foo` 后面写不写 `/`，`location` 里的那段都会被拼到真实路径上。

- `proxy_pass`：

  - 以不带 `/` 结尾的形式（如 `http://www.proxy.com`）：会保留原始路径前缀；
  - 以 `/` 或子路径结尾（如 `http://www.proxy.com/`、`http://www.proxy.com/bbb`）：会替换掉 `location` 的那一段前缀。

> 简单记忆：root 是「前缀 + 原路径」，proxy_pass 则取决于你最后写没写 /。

## 八、nginx 做代理服务器：能用，但别太依赖 ##

理论上，你甚至可以用 nginx 搭一个通用 HTTP 代理：

```nginx
# 代理服务器
server {
    listen   6587;
    resolver 8.8.8.8;

    location / {
        proxy_pass http://$http_host$request_uri;
        #allow 127.0.0.1;
        #deny all;
    }
}
```

然后把浏览器的代理设置成 `192.168.1.111:6587`（假设 nginx 在这台机器）。

这玩意儿能跑，但问题也很多：

- 不支持 HTTPS 透明转发；
- 对某些协议 / 头部支持不完善；
- 稳定性和观测能力都比专业代理差太多。

大部分场景下，更推荐用：

- 专门的 HTTP/HTTPS 代理（mitmproxy、Squid、Charles 等）；
- 或者在网关 / sidecar 层做统一代理逻辑。

> 把 nginx 当万能代理工具，只是「能用」，把它当成清晰的流量入口，才是「好用」的正确打开方式。

## 九、总结：让 nginx 真正成为「流量入口的工程设施」 ##

- HTTPS 层面，nginx 的目标是：*让证书接入和 HTTP→HTTPS 跳转变成标准套路*；
- 反向代理层面，它是最外面那层「干净的流量路由」，只做协议相关的事情；
跨域层面，在入口统一加 CORS，比在每个后端服务里散着写要可靠；
- 域名与泛域名层面，通过正则 `server_name` + `resolver` + `hash bucket`，可以优雅地管理一堆历史域名与子域名；
- 路径与转发层面，搞清楚 `root` 与 `proxy_pass` 的拼接规则，就能少掉一大半「怎么转发到奇怪路径」的 Bug。

> 全局变量、调试思路与可观测性

## 引言：当你只剩下一行 `access.log` 可以看 ##

线上出问题的时候，nginx 往往是离用户最近、离应用最远的一层。

如果这时候：

- 应用日志还没写到；
- APM 没有覆盖到入口层；
- 监控图上只看到一条平躺的 5xx 曲线；

你最后能抓得住的，可能就只有*nginx 的访问日志和那一堆 $ 开头的内置变量*。

很多人知道 `$remote_addr`、`$request_uri` 这些变量的存在，

但很少系统性地用它们来：

- 快速定位「是谁」发起的请求；
- 看清楚「请求到底长什么样」；
- 在日志里还原「请求在各种反代 / 跳转中经历了什么」。

这一篇，我们不再讲更多配置技巧，而是聚焦三件事：

- nginx 的核心内置变量到底有哪些值得记；
- 如何用这些变量把「请求上下文」写进日志；
- 在真实排障场景里，如何靠这些变量快速判断问题出在入口、网关还是应用。

## 一、nginx 内置变量：把「请求元信息」变成可用数据 ##

nginx 内置了大量 $ 开头的变量，大多是从 HTTP 头、连接信息或内部状态里抽出来的。

你可以简单理解成：「一个请求从外面到里面，沿途所有关键节点的快照」。

### 实战中最常用、值得背下来的那一批 ###

以下这些基本属于「日常调试必备」级别（均已在实践中验证）：

- `$remote_addr`：客户端 IP 地址；
- `$remote_port`：客户端源端口；
- `$http_host`：请求头里的 Host（等价于 `request.getHeader('Host')`）；
- `$http_origin`：Origin 请求头，跨域、前端来源排查时非常有用；
- `$http_referer`：Referer 请求头，可以看请求从哪个页面发出；
- `$request_uri`：原始请求 URI，包含 query，但不含主机名，例如 `/foo/bar?a=1&b=2`；
- `$uri / $document_uri`：当前内部处理用的 URI，不含 query；
- `$args / $query_string`：URL 查询参数；
- `$server_name`：命中的 server_name；
- `$server_addr` / `$server_port`：当前处理请求的 nginx 地址和端口；
- `$scheme`：http 或 https。

**几个容易混淆的点**：

- `$request_uri` vs `$uri`：
  - `$request_uri` = 用户原样请求路径 + 查询参数（除非被 `rewrite ... redirect/permanent` 改写）；
  - `$uri` / `$document_uri` = 当前请求在 `nginx` 内部的 URI，可能被内部 `rewrite` 改过。

- `$http_origin` vs `$http_referer`：
  - `$http_origin`：调用方的域名（如 `https://www.example.com`），更适合做 CORS 判断；
  - `$http_referer`：不含 `hash` 的完整 URL（如 `https://www.example.com/page?a=1`），适合做行为分析。

> 一个简单的经验是：如果你在某个变量名前加上 `$http_`，大概率就是在拿对应的请求头，比如 `$http_user_agent`、`$http_cookie` 等。

### 来自网络但也值得顺手一记的一批 ###

以下是常见文档里提到、但容易被忽略的一些变量（不一一定要背，知道有就行）：

- `$content_length`：请求头中的 `Content-Length`；
- `$content_type`：请求头中的 `Content-Type`；
- `$http_user_agent`：`User-Agent`；
- `$http_cookie`：Cookie；
- `$limit_rate`：可以用来限制某个连接的传输速率；
- `$request_method`：请求方法（GET / POST / PUT / DELETE ...）；
- `$request_filename`：由 `root`/`alias` + URI 拼出来的实际文件路径；
- `$server_protocol`：`HTTP/1.0` 或 `HTTP/1.1` 等。

这些变量的价值，在于你可以按需拉取它们，拼成一条足够信息密度的日志。

## 二、让 access.log 真正「说人话」：定制日志格式 ##

默认的 access.log 格式通常长这样：

```nginx
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" "$http_x_forwarded_for"';

access_log logs/access.log main;
```

对排障来说，很多时候你需要的是：

- 调用来源（`Origin` / `Referer`）；
- 请求最终命中的 URI；
- 被转发到哪台后端；
- 某些业务 Header（如 traceId、userId）。

你完全可以自定义一个更「工程化」的日志格式，例如：

```nginx
log_format  traceable_main
    '$remote_addr:$remote_port '
    '[$time_local] '
    '"$request" '
    'status=$status '
    'bytes=$body_bytes_sent '
    'host="$host" '
    'origin="$http_origin" '
    'referer="$http_referer" '
    'ua="$http_user_agent" '
    'req_uri="$request_uri" '
    'uri="$uri" '
    'upstream_addr="$upstream_addr" '
    'trace_id="$http_x_trace_id"';

access_log  logs/access.log traceable_main;
```

这样一条日志就能回答很多问题：

- 用户来自哪个 IP、哪个 Origin；
- 实际命中了哪个 `uri`（被 rewrite 过没有）；
- 请求被打到了哪个后端实例（`$upstream_addr`）；
- traceId 是什么，方便跟应用日志串起来。

> 和其在监控平台上一脸懵逼，不如多给 access.log 加几个变量，让每一条日志都变成「带上下文的证言」。

## 三、排障实战：变量 + 日志，快速缩小问题范围 ##

说几个非常日常的排障问题，看看变量如何帮你「定点打击」。

### 场景一：用户说「偶发 502」，但后端压根没看到请求 ###

现象：

- 客户端日志看到 502；
- 后端应用和网关没有对应 trace；
- 只有 nginx 层有 502。

可以在 access.log 里重点看：

- `$upstream_addr`：有没有真正转发到后端？
- `$upstream_status`：后端返回的状态码（如果有）；
- `$request_time` / `$upstream_response_time`：请求在哪一段耗时。

示例日志格式调整：

```nginx
log_format with_upstream
    '$remote_addr - [$time_local] '
    '"$request" status=$status '
    'req_time=$request_time '
    'upstream="$upstream_addr" '
    'upstream_status="$upstream_status" '
    'upstream_time="$upstream_response_time"';
```

如果你看到：

- `status=502`；
- `upstream=""`（空）；
- 或者 `upstream` 指向某些特定 IP/端口，`upstream_status` 是 502/504；

就可以很快判断：

- 要么是 `upstream` 配置不对 / 服务不通；
- 要么是某个后端实例挂了。

### 场景二：跨域问题，前端说「我没跨域」，后端说「我没看到请求」 ###

这时候 `$http_origin` 和 `$http_referer` 就很有用。

你可以这样先加一条临时日志：

```nginx
log_format cors_debug
    '$remote_addr [$time_local] '
    'method=$request_method '
    'host="$host" '
    'origin="$http_origin" '
    'referer="$http_referer" '
    'uri="$request_uri" '
    'status=$status';

access_log logs/cors_debug.log cors_debug;
```

然后专门抓一段时间访问：

- 看看 `$http_origin` 到底是什么（很多时候是写错了 schema / 子域名）；
- OPTIONS 请求到底有没有打到这台 nginx / 这个 `location` 上；
- 是 nginx 直接回了 4xx，还是 upstream 拒绝的。

### 场景三：怀疑某个用户脚本 / 爬虫把你打挂了 ###

这时候组合的变量可能是：

- `$remote_addr` + `$remote_port`；
- `$http_user_agent`；
- `$http_referer`；
- `$request_uri`。

你可以：

- 先用 `grep` 把某个可疑 IP 或 UA 的访问拉出来；
- 观察它的行为模式（URI、频率、是否遍历所有路径）；
- 再考虑在 nginx 上做限流或封禁。

> 这里的关键始终是：在请求刚刚进入系统的时候，就捕获足够多的上下文信息。

## 四、用变量做一点「轻量逻辑」：按来源做差异化处理 ##

虽然不推荐在 nginx 里写复杂业务逻辑，但基于变量做一点轻量分流还是很常见的。

### 按域名 / Origin 做简单白名单 ###

例如只允许某些域的前端调用某个接口：

```nginx
location /api/internal {
    if ($http_origin !~* ^https?://(www\.trusted\.com|admin\.trusted\.com)$) {
        return 403;
    }

    proxy_pass http://127.0.0.1:9000;
}
```

这里的关键就是 `$http_origin` 和正则的一起使用。

### 按 UA 做简单灰度 / 降级 ###

在真·紧急情况（背锅现场）下，也有人会用 nginx 做一点 UA 级别的降级：

```nginx
location /feature-heavy {
    if ($http_user_agent ~* 'MSIE|Trident') {
        # 老浏览器直接给降级页
        return 200 '您的浏览器版本过低，建议使用现代浏览器访问本功能';
    }

    proxy_pass http://127.0.0.1:9001;
}
```

这类逻辑不建议长期存在，但在「一小时内必须止血」的场景下，变量 + 简单判断会非常好用。

## 五、从变量到可观测性：让 nginx 不再是「黑盒」 ##

如果放在一起看，会发现一个演进路径：

- 「路由规则」：请求到底会命中哪条 location；
- 「流量入口」：域名、TLS、转发、跨域、泛域名这些入口层职责；
- 「可观测性」：怎么知道这一层到底干了什么。

内置变量是 nginx 给你的「观察窗口」：

- 你可以用它们定制 access.log，让每条日志都带上关键上下文；
- 可以在关键路径上输出必要的 debug 信息，快速缩小问题范围；
- 可以用简单的条件判断，对不同来源、不同 UA 做轻量的路由差异化。

> 真正成熟的 nginx 使用方式，不是「背一堆指令」，而是让它变成：既能稳稳扛住流量，又能在出问题时，给你足够多的线索。

## 尾声：从会配 nginx，到敢把 nginx 当「工程设施」 ##

回顾：

- 你应该已经能比较自信地回答：某个路径最终会命中哪条 location，会不会被正则截胡；
- 你大概也能设计一套比较干净的入口层：域名归一、HTTPS、反向代理、CORS、泛域名；
- 最后，你有能力为 nginx 加上一层可观测性：变量、日志、简单的调试逻辑。


会写 nginx 配置，只是把系统「搭起来」；敢把 nginx 当成工程设施来设计，才算是真正把它「用起来」。

当你下次看到一行 `$http_origin` 或 `$request_uri` 时，也许会意识到：它不是一个随手抄来的变量，而是你和复杂系统对话的一只探针。
