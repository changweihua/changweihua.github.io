---
lastUpdated: true
commentabled: true
recommended: true
title: CORS 到底谁说了算
description: 一份跨域配置的避坑指南
date: 2026-09-15 08:15:00
pageClass: blog-page-class
cover: /covers/html5.svg
---

改动一个响应头，让整条业务线静默失败数小时——这是跨域问题最典型的形态，一点都不夸张。CORS 看着简单，却是前端、后端、测试三方协作里最容易踩坑的环节之一。这篇文章把原理、利弊、避坑一次讲清，读完你应该能对每一个 CORS 配置问题，说出"为什么这么配、不这么配会怎样"。

## 先纠正一个误区：CORS 是浏览器在把关 ##

很多人以为 CORS 是服务端的一种"授权"，其实正好相反——*这道关是浏览器把的，服务端只能配合，无法绕过*。

一次跨域请求的完整判定，就三步：

1. 客户端发起跨域请求，浏览器自动注入 `Origin` 请求头。这个头是浏览器强制写入的，脚本删不掉、伪造不了，是 CORS 唯一可信的锚点（定义见 RFC 6454）。
2. 服务端返回响应，其中携带 `Access-Control-Allow-Origin`（下称 ACAO）响应头。
3. 浏览器拿 ACAO 和请求的 `Origin` 比对：匹配就放行，不匹配或没有就拦截。

所以服务端能做的，只是"正确设置 ACAO 去配合浏览器"，而无法"关闭"或"绕过"这道校验——拦截发生在浏览器内部，服务端甚至不知道前端到底有没有成功读到数据。

请求还分两类：

- 简单请求（`GET`/`HEAD`/`POST` 且仅含简单头）直接发出，收到响应后再校验 ACAO；
- 预检请求（用了 `PUT`/`DELETE`、自定义头、`Content-Type: application/json` 等）会先发一个 `OPTIONS` 问"允不允许"，通过了才发真正请求。

> 记住一点：预检的触发只跟方法、头、`Content-Type` 有关，跟 URL 参数无关。

## 最核心的一条规则：带凭据禁用 `*` ##

这条值得单独拎出来讲，因为它是 CORS 配置里最容易被写错、也最容易翻车的地方：

只要请求携带凭据，`Access-Control-Allow-Origin` 就一定不要写 `*`。

"凭据"指 `cookie`、`Authorization` 头、TLS 客户端证书。只要带了其中任意一个，浏览器就要求 ACAO 返回*明确、具体的源*，并且同时返回 `Access-Control-Allow-Credentials: true`。这时写 `* `会直接失效。

这不是经验之谈，有权威依据：MDN 的错误页「Credential is not supported if the CORS header 'Access-Control-Allow-Origin' is '*'」和 Fetch Standard 都明确写了这条。

客户端侧，三种写法是等价的：

- fetch 的 `credentials: 'include'`
- axios 的 `withCredentials: true`
- XHR 的 `xhr.withCredentials = true`

特别要留意 fetch 的默认值是 `same-origin`——同域请求默认带 `cookie`，跨域请求默认不带。所以跨域要带 `cookie`，一定得显式写 `include`，不是默认行为。

据此，接口按属性可以归成三类，对号入座就能决定怎么配：

| 接口类型 | 判据 | 正确策略 |
| :--- | :--- | :--- |
| 公共只读、无身份 | 无凭据、无副作用 | ACAO 用 `*` |
| 写操作 / 需身份 | 有副作用或依赖身份 | 反射 Origin + 白名单，服务端风控兜底 |
| 带凭据 | 携带 cookie / token | 禁用 `*`，必须反射具体源 |

## 两种正确做法，以及各自真实的代价 ##

### 同源代理：治本，但难在"域名收敛" ###

把跨域请求改成同域路径，由网关反代到目标服务。浏览器视角是同源，根本不触发 CORS，cookie 天然同源携带，后端也不用维护白名单。配置上可以收敛成"一条入口 + 一张路由表"，不会随接口数量线性膨胀：

```nginx
location /gw/ {
    proxy_pass http://gateway_upstream;
}

map $uri $backend {
    ~^/gw/order/   http://order-internal;
    ~^/gw/crm/     http://crm-internal;
    default        http://default-internal;
}
```

前端调用从 `https://api.example.com/order/...`（跨域）改成 `https://www.example.com/gw/order/...`（同域）。

但它的成本不在配置，而在*域名收敛*——要求所有调用方都走同一个网关域名，这在现实里往往最难推：

- *历史域名债务*：多业务线、不同时期各起各的域名，存量分散在不同团队手里，没人能一句话拍板收敛；
- *跨团队协调成本*：改域名/路径会牵连缓存、埋点、监控、CDN/WAF 白名单、防盗链，牵一发动全身；
- *网关能力不统一*：有的系统有统一网关，有的还是裸 Nginx 或服务直连，不具备统一反代条件。

所以结论是：接口多、域名分散又短期收敛不了的团队，同源代理的隐性成本很高，不宜硬上。这时用下面这套更务实。

### 反射 Origin + 白名单：通用，但白名单要管好 ###

不能同域的接口，服务端校验 `Origin` 后原样反射，不要用 `*`。白名单命中才反射，没命中就不返回 ACAO，浏览器自动拒绝。

Spring Boot 里，关键是用 `allowedOriginPatterns`（Spring 5.3+），而不是 `allowedOrigins("*")`：

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOriginPatterns(            // 用 allowedOriginPatterns，不能用 allowedOrigins("*")
                "https://www.example.com",
                "https://m.example.com",
                "https://test.example.com"
            )
            .allowedMethods("GET", "POST", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

Nginx / 网关层用 `map` 正则反射：

```nginx
map $http_origin $cors_origin {
    default "";
    "~^https://[a-z0-9.-]+\.example\.com$" $http_origin;
}

server {
    location /api/ {
        add_header Access-Control-Allow-Origin $cors_origin always;
        add_header Access-Control-Allow-Credentials true always;
        add_header Vary Origin always;

        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
            add_header Access-Control-Max-Age 3600 always;
            return 204;
        }
    }
}
```

两个配套必须一起做，否则会翻车：

- `Vary: Origin`：告诉缓存层"响应随 Origin 变化"。但只在源站返回 Vary 不够，CDN 还得把 Origin 纳入缓存键（腾讯云/阿里云 CDN 的"自定义 Cache Key"里加 Origin，自研 Nginx 在 `proxy_cache_key` 里拼 `$http_origin`）。少做这一步，多站点会互相串缓存。
- 白名单正则要锚定 `^...$`：写 `example.com` 会放行 `evilexample.com`，必须写完整边界。

## 三个最容易踩的实战盲区 ##

反射 Origin 方案的坑，大多不在"反射"本身，而在"白名单怎么管理"：

- *多环境域名漏配*：测试、预发、线上域名各不相同，白名单如果硬编码线上域名，测试/预发页面调线上接口就直接跨域失败（端口也参与匹配）。正确的做法是白名单从配置中心或环境变量注入，不硬编码。

- *后端先行发布*：接口先上线、前端还在预发时，预发页面调线上接口是标准发布流程，却会被白名单误伤。正确做法是预发走同源代理，或把预发域名当作一等环境常驻白名单。

- *白名单管理失控*：为了联调临时加域名、事后忘了撤，白名单越积越多还没人说得清。正确做法是纳入配置中心统一管理，配合变更评审。

## 三种"图省事"的反面做法 ##

这三种写法都"能跑"，但本质是把本该精细的决策做成了全局默认，最后都会还回来：

- *把 Origin 塞进 URL 参数*：服务端反射 URL 参数到 ACAO，技术上确实能过浏览器校验，但等于把来源校验彻底作废——任何站点都能过，CORS 从"白名单门禁"退化成了"敞开大门"。

- 所有接口一律 `*`：带凭据接口配 `*` 直接失效；写接口配 `*` 等于对全网开放，拆掉了来源防线。

- *前端默认 `withCredentials: true`*：所有跨域请求都带 cookie，导致所有接口被迫弃用 `*`，而且 cookie 无谓暴露、扩大了 CSRF 攻击面。

## 一张落地清单，按需自取 ##

按"需不需要用户信息"对号入座：

- A. 不需要用户信息（资讯、官网、纯展示）：确认接口公共只读无副作用、请求不带凭据，直接配 `*`。

- B. 需要用户信息（后台、会员、个性化）：明确鉴权方式；带凭据禁用 `*`，走反射 Origin + 白名单；cookie 鉴权要有 CSRF 防护（token 或 SameSite），token 鉴权天然抗 CSRF。

- C. 混合应用（活动页、留资、抽奖）：公共展示部分走 *，写接口走白名单 + 风控，并在接口契约里写清"哪些接口需要身份"。

顺带推荐一个自查方式：把 Chrome 里的请求导出成 HAR（F12 → Network → 右键 "Save all as HAR with content"），写个小脚本逐条核对 ACAO 和凭据是否匹配，比肉眼翻 DevTools 靠谱得多。导出前可以先在 Network 过滤框用 `-domain:当前host` 排除本域，聚焦跨域请求。

## 总结 ##

一句话收束：CSRF 防"冒名"，CORS 管"跨域"，防刷靠"限流 + 风控"——三者各管一段，互不替代。 记住"带凭据禁用 *"这一条核心规则，按接口属性定性、用工具验证，就能避开绝大多数跨域配置的坑。
