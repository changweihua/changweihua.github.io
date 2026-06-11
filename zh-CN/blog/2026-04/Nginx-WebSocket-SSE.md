---
lastUpdated: true
commentabled: true
recommended: true
title: Nginx 反向代理 WebSocket 和 SSE 的踩坑
description: Nginx 反向代理 WebSocket 和 SSE 的踩坑
date: 2026-04-30 09:50:00 
pageClass: blog-page-class
cover: /covers/nginx.svg
---

项目上了 Nginx 反向代理之后，HTTP 接口全部正常，WebSocket 却连不上，SSE 推送也收不到消息。控制台没有报错，Network 面板看着像是连上了，数据就是不过来。先给结论：WebSocket 和 SSE 都不是标准的 HTTP 请求-响应模型，Nginx 默认配置会把它们当成普通 HTTP 处理，要么握手失败，要么连接被提前关掉。 两者的解法不同，不能混为一谈。

## WebSocket 反向代理：三行配置解决 90% 的问题 ##

最小可用配置只需要三行，把 `Upgrade` 和 `Connection` 头透传给后端：

```nginx
location /ws {
    proxy_pass http://backend:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

`proxy_http_version 1.1` 这行容易被忽略。Nginx 代理后端时默认用 HTTP/1.0，而 HTTP/1.0 压根不支持 `Upgrade` 机制，所以必须显式声明。`$http_upgrade` 是 Nginx 内置变量，值就是客户端发来的 `Upgrade` 头内容。

配好之后可以用 `wscat` 快速验证：通过 Nginx 代理地址连接 `wscat -c ws://your-domain.com/ws`，能发消息能收消息就说明配置生效了。

## 超时问题：连上了但过一会儿自动断 ##

大部分人配好 WebSocket 之后会遇到第二个坑——连接建立了，过 60 秒没有数据传输就自动断开。

原因是 Nginx 的 `proxy_read_timeout` 默认 60 秒。对普通 HTTP 请求来说，60 秒没响应大概率是后端挂了，断开合理。但 WebSocket 连接可能几分钟才有一次消息，60 秒的超时就太短了。一个直接的做法是把 `proxy_read_timeout` 和 `proxy_send_timeout` 调到 3600 秒，但这不是最优解。

更靠谱的做法是让应用层做心跳保活——WebSocket 协议本身支持 `Ping`/`Pong` 帧，服务端每 30 秒发一个 `ws.ping()`，超时计时器就会被重置。这样 `proxy_read_timeout` 保持默认 60 秒都行，还能及时检测到真正的死连接。无脑调大超时反而会让死连接长时间占用资源。

下面是 Node.js 服务端心跳的核心逻辑，每 30 秒向所有活跃连接发送协议级 Ping 帧，客户端会自动回复 Pong，Nginx 感知到数据传输就不会断连：

```javascript
const wss = new WebSocket.Server({ port: 3000 });
wss.on('connection', (ws) => {
    const heartbeat = setInterval(() => {
        if (ws.readyState === ws.OPEN) ws.ping();
    }, 30000);
    ws.on('close', () => clearInterval(heartbeat));
});
```

## Connection 头的条件判断 ##

有些教程把 `Connection` 头写死为 `"upgrade"`，如果这个 `location` 只处理 `WebSocket` 请求没问题。但如果普通 `HTTP` 和 `WebSocket` 请求共用同一个路径前缀，写死就容易出事——我在一个项目里踩过这个坑，前端 `fetch` 请求和 `WebSocket` 用了同一个路径前缀 `/api`，写死 `Connection "upgrade"` 导致普通接口偶尔返回 `502`。

解决方案是在 `http` 块里用 `map` 做条件判断：当客户端请求携带 `Upgrade` 头时，Connection 设为 `upgrade`；普通请求没有该头，则回退为 `close`。这样同一个 `location` 就能同时服务 `WebSocket` 和普通 `HTTP` 请求：

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }
}
```

## SSE 反向代理：关缓冲、关压缩、调超时 ##

SSE 看起来比 WebSocket 简单——毕竟就是个长连接的 HTTP 响应，不涉及协议升级。但 Nginx 对 SSE 的干扰点更多，也更隐蔽。

### 第一坑：`proxy_buffering` 吃掉实时性 ###

这是 SSE 最常见的坑。Nginx 默认开启 `proxy_buffering`，会把后端的响应数据攒到缓冲区，攒够一定量（默认 4K 或 8K，取决于系统页大小）才发给客户端。普通接口无所谓，SSE 要的就是"服务端写一条、客户端立刻收到一条"，缓冲直接破坏了实时性。

表现很有迷惑性：连接建立成功，后端日志显示事件已发送，但前端 `EventSource` 的 `onmessage` 迟迟不触发，过几秒突然一口气收到一堆消息。排查时抓包看 Nginx 到客户端的响应，会发现数据是批量到达的而非逐条到达。

解法很简单，在 `SSE` 的 `location` 里关闭代理缓冲，同时关闭 `proxy_cache` 防止响应被缓存：

```nginx
location /sse {
    proxy_pass http://backend:3000;
    proxy_buffering off;
    proxy_cache off;
}
```

### 第二坑：`gzip` 压缩阻塞数据流 ###

如果全局开了 `gzip on`，`SSE` 的数据流也会被压缩。`gzip` 算法需要攒够一定量的数据才能输出一个压缩块，效果和 `proxy_buffering` 一样——消息被攒着了。

这个坑隐蔽得很。我曾经在一个内部监控系统（Nginx 1.22 + Node.js 18）上排查 SSE 延迟，`proxy_buffering` 早就关了，后端日志确认消息已发出，但前端就是 3-5 秒才收到一批。翻了大半天配置，最后发现是全局 `gzip on` 藏在一个 `include` 的公共配置文件里。SSE 消息通常很短，几十到几百字节，压缩收益几乎为零，延迟代价却很大。在 SSE 的 `location` 里加一行 `gzip off` 就解决了。

### 第三坑：超时断连 ###

SSE 和 WebSocket 一样面临超时问题。服务端长时间没有事件要推，Nginx 的 `proxy_read_timeout` 到了就会断开连接。配置思路类似——可以调大超时，也可以让服务端定时发心跳注释。

SSE 协议规范里约定以冒号开头的行是注释，客户端的 EventSource 不会触发 `onmessage`，天然适合做保活。

```javascript
app.get('/sse', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const heartbeat = setInterval(() => {
        res.write(': heartbeat\n\n');
    }, 15000);
    req.on('close', () => clearInterval(heartbeat));
});
```

把上面三个坑点的配置合在一起，就是 SSE 完整的 Nginx 配置。

```nginx
location /sse {
    proxy_pass http://backend:3000;
    proxy_http_version 1.1;
    proxy_set_header Connection '';
    proxy_buffering off;
    proxy_cache off;
    gzip off;
    chunked_transfer_encoding off;
    proxy_read_timeout 86400s;
}
```

## 生产环境的边界情况 ##

### 连接数限制 ###

每个 WebSocket/SSE 连接都占用一个文件描述符。Nginx 的 `worker_connections` 默认值是 1024，同时在线 500 个 WebSocket 用户就可能打满（Nginx 自身也需要连接对接后端，一个客户端连接对应一个上游连接，实际容量要折半）。

系统层面需要同步调整，否则 Nginx 配置再大也会被 OS 限制挡住。worker_rlimit_nofile 控制 Nginx worker 进程的文件描述符上限，需要大于等于 `worker_connections`。系统级的 `ulimit` 也必须配合调高，否则 Nginx 启动时拿不到足够的文件描述符：

```nginx
# nginx.conf 主配置
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 65535;
    multi_accept on;
}
```

系统级文件描述符限制需要在 `/etc/security/limits.conf` 中设置，确保 Nginx 进程用户有足够的配额：

```nginx
# /etc/security/limits.conf
nginx soft nofile 65535
nginx hard nofile 65535
```

改完后用 `ulimit -n` 确认生效，再 `nginx -s reload`。可以通过 `cat /proc/<nginx_worker_pid>/limits` 验证 `worker` 进程实际拿到的限制值。

### 多层代理的头丢失 ###

生产环境经常不止一层代理：客户端 → CDN/SLB → Nginx → 后端。经过多层转发，Upgrade、Connection 这些逐跳（hop-by-hop）头会被中间层剥掉，WebSocket 握手到了 Nginx 时已经丢失了关键头信息，后端收到的是一个普通 HTTP 请求。

表现为：开发环境直连 Nginx 一切正常，上了生产经过负载均衡器就连不上 WebSocket，返回 400 或 502。

解法分两步。

第一步，确认前置代理（SLB/CDN）支持 WebSocket 透传并开启了相关选项，阿里云 SLB 需要在监听配置里勾选"开启 WebSocket"，AWS ALB 原生支持但 CLB 需要用 TCP 监听。

第二步，在 Nginx 层用 proxy_set_header 显式补上可能丢失的头，而不是依赖客户端传过来的值：

```nginx
location /ws {
    proxy_pass http://backend:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade websocket;
    proxy_set_header Connection "upgrade";
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

注意这里 `Upgrade` 直接写死 `websocket` 而不是用 `$http_upgrade` 变量，因为变量值可能已经被前置代理清空了。

### Nginx reload 断连接 ###

执行 `nginx -s reload` 时，Nginx 会优雅关闭旧的 `worker` 进程。

如果没配 `worker_shutdown_timeout`，旧 `worker` 会一直等，直到所有长连接自然断开，导致 `reload` 后系统里同时跑着新旧两套 worker，内存持续上涨。配了超时（比如 30 秒），`reload` 时所有 WebSocket/SSE 用户会在 30 秒后被强制断开。

两种策略都不完美，实际操作中建议：

```nginx
# nginx.conf 主配置
worker_shutdown_timeout 60s;
```

把超时设为 60 秒，给正在传输数据的连接留够缓冲时间。同时客户端必须实现自动重连——WebSocket 用库自带的 `reconnect` 机制，SSE 的 `EventSource` 本身就有自动重连能力（断开后默认 3 秒重试）。这样 `reload` 造成的断连对用户来说只是一次短暂的闪断，几秒后自动恢复。在需要频繁改配置的场景下，可以考虑用 `upstream` 的灰度策略，先切走流量再 reload，彻底避免断连。

## 各配置项速查 ##

|  配置项   |      WebSocket |   SSE |   默认值 |   建议值 |
| :-----------: | :-----------: | :-----------: | :-----------: | :-----------: |
|    `proxy_http_version` |   1.1（必须） |   1.1（推荐） |   1.0 |  1.1  |
|    `proxy_set_header Upgrade` |   `$http_upgrade` |   不需要 |   — |   — |
|    `proxy_set_header Connection` |   `$connection_upgrade` |   `''` |   — |   — |
|    `proxy_buffering` |   默认即可 |   off（必须） |   on |   — |
|    `gzip` |   默认即可 |   off（必须） |  on  |   — |
|    `proxy_read_timeout` |   心跳间隔×2 |   心跳间隔×2 |   60s |   60-3600s |
|    `worker_connections` |   按最大连接数设 |   按最大连接数设 |   1024 |   65535 |
|  `worker_shutdown_timeout`   |      建议设置 |   建议设置 |   无限制 |   60s |
