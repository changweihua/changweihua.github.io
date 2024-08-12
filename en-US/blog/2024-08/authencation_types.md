---
lastUpdated: true
commentabled: true
recommended: true
title: 前端身份验证终极指南：Session、JWT、SSO 和 OAuth 2.0
description: 前端身份验证终极指南：Session、JWT、SSO 和 OAuth 2.0
date: 2024-08-08 12:18:00
pageClass: blog-page-class
---

# 前端身份验证终极指南：Session、JWT、SSO 和 OAuth 2.0 #

在前端项目开发中，验证用户身份主要有 4 种方式：Session、JWT、SSO 和 OAuth 2.0。

那么这四种方式各有什么优缺点呢？今天，咱们就来对比下！

## 基于 Session 的经典身份验证方案 ##

**什么是基于Session的身份验证？**

基于 Session 的身份验证是一种在前端和后端系统中常用的用户认证方法。

它主要依赖于服务器端创建和管理用户会话。

### Session 运行的基本原理 ###

Session 的运行流程分为 6 步：

1. 用户登录：用户在登录页面输入凭据（如用户名和密码）。这些凭据通过前端发送到后端服务器进行验证。
2. 创建会话：后端服务器验证凭据后，创建一个会话（session）。这个会话通常包括一个唯一的会话 ID，该 ID 被存储在服务器端的会话存储中。
3. 返回会话 ID：服务器将会话 ID 返回给前端，通常是通过设置一个 cookie。这个 cookie 被发送到用户的浏览器，并在后续的请求中自动发送回服务器。
4. 保存会话 ID：浏览器保存这个 cookie，并在用户每次向服务器发起请求时都会自动包含这个 cookie。这样，服务器就能识别出该用户的会话，从而实现身份验证。
5. 会话验证：服务器根据会话 ID 查找和验证该用户的会话信息，并确定用户的身份。服务器可以使用会话信息来确定用户的权限和访问控制。
6. 会话过期与管理：服务器可以设置会话过期时间，定期清除过期的会话。用户注销或会话超时后，服务器会删除或使会话失效。


通过以上流程，我们可以发现：基于 Session 的身份验证，前端是**不需要主动参与**的。核心是 **浏览器** 和 **服务器** 进行处理

### 优缺点 ###

**优点：**

- 简单易用：对开发者而言，管理会话和验证用户身份相对简单。
- 兼容性好：大多数浏览器支持 cookie，能够自动发送和接收 cookie。

**缺点：**

- 扩展性差：在分布式系统中，多个服务器可能需要共享会话存储，这可能会增加复杂性。
- 必须配合 HTTPS：如果 cookie 被窃取，可能会导致会话劫持。因此需要使用 HTTPS 来保护传输过程中的安全性，并实施其他安全措施（如设置 cookie 的 HttpOnly 和 Secure 属性）。

### 示例代码 ###

我们通过 Express 实现一个基本的 Session 验证示例

```js
const express = require('express'); 
const session = require('express-session'); 
const app = express(); 

// 配置和使用 express-session 中间件
app.use(session({
  secret: 'your-secret-key', // 用于签名 Session ID cookie 的密钥，确保会话的安全
  resave: false, // 是否每次请求都重新保存 Session，即使 Session 没有被修改
  saveUninitialized: true, // 是否保存未初始化的 Session
  cookie: { 
    secure: true, // 是否只通过 HTTPS 发送 cookie，设置为 true 需要 HTTPS 支持
    maxAge: 24 * 60 * 60 * 1000 // 设置 cookie 的有效期，这里设置为 24 小时
  }
}));

// 登录路由处理
app.post('/login', (req, res) => {
  // 进行用户身份验证（这里假设用户已经通过验证）
  // 用户 ID 应该从数据库或其他存储中获取
  const user = { id: 123 }; // 示例用户 ID
  req.session.userId = user.id; // 将用户 ID 存储到 Session 中
  res.send('登录成功'); 
});

app.get('/dashboard', (req, res) => {
  if (req.session.userId) {
    // 如果 Session 中存在用户 ID，说明用户已登录
    res.send('返回内容...');
  } else {
    // 如果 Session 中没有用户 ID，说明用户未登录
    res.send('请登录...'); // 提示用户登录
  }
});

app.listen(3000, () => {
  console.log('服务器正在监听 3000 端口...');
});
```

## 基于JWT的身份验证方案 ##

**什么是基于JWT的身份验证？**

这应该是我们目前 **最常用** 的身份验证方式。

服务端返回 Token 表示用户身份令牌。在请求中，把 token 添加到请求头中，以验证用户信息。

因为 HTTP 请求本身是无状态的，所以这种方式也被成为是 **无状态身份验证方案**

### JWT 运行的基本原理 ###

1. 用户登录：用户在登录页面输入凭据（如用户名和密码），这些凭据通过前端发送到后端服务器进行验证。
2. 生成 JWT：后端服务器验证用户凭据后，生成一个 JWT。这个 JWT 通常包含用户的基本信息（如用户 ID）和一些元数据（如过期时间）。
3. 返回 JWT：服务器将生成的 JWT 发送回前端，通常通过响应的 JSON 数据返回。
4. 存储 JWT：前端将 JWT 存储在客户端（Token），通常是 localStorage 。极少数的情况下会保存在 cookie 中（但是需要注意安全风险，如：跨站脚本攻击（XSS）和跨站请求伪造（CSRF））
5. 使用 JWT 进行请求：在用户进行 API 调用时，前端将 JWT（Token） 附加到请求的 Authorization 头部（格式为 Bearer `<token>`）发送到服务器。
6. 验证 JWT：服务器接收到请求后，提取 JWT（Token） 并验证其有效性。验证过程包括检查签名、过期时间等。如果 JWT 合法，服务器会处理请求并返回相应的资源或数据。
7. 响应请求：服务器处理请求并返回结果，前端根据需要展示或处理这些结果。

### 优缺点 ###

**优点**

- 无状态：JWT 是自包含的，不需要在服务器端存储会话信息，简化了扩展性和负载均衡。
- 跨域支持：JWT 可以在跨域请求中使用（例如，API 与前端分离的场景）。

**缺点**

- 安全性：JWT 的安全性取决于密钥的保护和有效期的管理。JWT 一旦被盗用，可能会带来安全风险。

### 示例代码 ###

我们通过 Express 实现一个基本的 JWT 验证示例

```js
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const secretKey = 'your-secret-key'; // JWT 的密钥，用于签名和验证

// 登录路由，生成 JWT
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // 用户身份验证（假设验证通过）
  const user = { id: 1, username: 'user' }; // 示例用户信息
  const token = jwt.sign(user, secretKey, { expiresIn: '24h' }); // 生成 JWT
  res.json({ token }); // 返回 JWT
});

// 受保护的路由
app.get('/dashboard', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).send('没有提供令牌');
  }
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).send('无效的令牌');
    }
    res.send('返回仪表板内容'); 
  });
});

app.listen(3000, () => {
  console.log('服务器正在监听 3000 端口...');
});
```

## 基于 SSO 的身份验证方案 ##

**什么是基于 SSO（Single Sign-On，单点登录） 的身份验证？**

SSO 身份验证多用在 “成套” 的应用程序中，通过 登录中心 的方式，可以实现 一次登录，在多个应用中均可以获取身份

### SSO 运行的基本原理 ###

1. 用户访问应用：用户访问一个需要登录的应用（称为服务提供者或 SP）。
2. 重定向到身份提供者：由于用户尚未登录，应用会将用户重定向到 SSO 身份提供者（Identity Provider，简称 IdP）（一般称为 登录中心）。登录中心 是负责处理用户登录和身份验证的系统。
3. 用户登录：用户在 登录中心 输入凭据进行登录。如果用户已经在 IdP 处登录过（例如，已登录到公司内部的 SSO 系统），则可能直接跳过登录步骤。
4. 生成 SSO 令牌：SSO 身份提供者验证用户身份后，生成一个 SSO 令牌（如 OAuth 令牌或 SAML 断言），并将用户重定向回原应用，同时附带令牌。
5. 令牌验证：原应用（服务提供者）接收到令牌后，会将其发送到 SSO 身份提供者进行验证。SSO 身份提供者返回用户的身份信息。
6. 用户访问应用：一旦身份验证成功，原应用会根据用户的身份信息提供访问权限。用户现在可以访问应用中的受保护资源，而无需再次登录。
7. 访问其他应用：如果用户访问其他应用，这些应用会重定向用户到相同的 登录中心 进行身份验证。由于用户已经登录，登录中心 会自动验证并将用户重定向回目标应用，从而实现无缝登录。

### 优缺点 ###

**优点**

- 简化用户体验：用户只需登录一次，即可访问多个应用或系统，减少了重复登录的麻烦。
- 集中管理：管理员可以集中管理用户的身份和访问权限，提高了管理效率和安全性。
- 提高安全性：减少了密码泄露的风险，因为用户只需记住一个密码，并且可以使用更强的认证机制（如多因素认证）。

**缺点**

- 单点故障：如果 登录中心 出现问题，可能会影响所有依赖该 SSO 服务的应用。
复杂性：SSO 解决方案的部署和维护可能较为复杂，需要确保安全配置和互操作性。

### 常见的 SSO 实现技术 ###


- SAML（Security Assertion Markup Language）：
  - 一个 XML-based 标准，用于在身份提供者和服务提供者之间传递认证和授权数据。
  - 常用于企业环境中的 SSO 实现。
- OAuth 2.0 和 OpenID Connect：
  - OAuth 2.0 是一种授权框架，用于授权第三方访问用户资源。
  - OpenID Connect 是建立在 OAuth 2.0 之上的身份层，提供用户身份认证功能。
  - 常用于 Web 和移动应用中的 SSO 实现。
- CAS（Central Authentication Service）：
  - 一个用于 Web 应用的开源 SSO 解决方案，允许用户通过一次登录访问多个 Web 应用。


## 基于 OAuth 2.0 的身份验证方案 ##

**什么是基于 OAuth 2.0 的身份验证？**

基于 OAuth 2.0 的身份验证是一种用于授权第三方应用访问用户资源的标准协议。常见的有：微信登录、QQ 登录、APP 扫码登录等

OAuth 2.0 **主要用于授权，而不是身份验证**，但通常与身份验证结合使用来实现用户登录功能。

### OAuth 2.0 运行的基本原理 ###

OAuth 2.0 比较复杂，在了解它的原理之前，我们需要先明确一些基本概念。

### OAuth 2.0 的基本概念 ###

- **资源拥有者（Resource Owner）**：通常是用户，拥有需要保护的资源（如个人信息、文件等）。
- **资源服务器（Resource Server）**：提供资源的服务器，需要保护这些资源免受未经授权的访问。
- **客户端（Client）**：需要访问资源的应用程序或服务。客户端需要获得资源拥有者的授权才能访问资源。
- **授权服务器（Authorization Server）**：责认证资源拥有者并授权客户端访问资源。它颁发访问令牌（Access Token）给客户端，允许客户端访问资源服务器上的受保护资源。

### 运行原理 ###

- **用户授权**：用户使用客户端应用进行操作时，客户端会请求授权访问用户的资源。用户会被重定向到授权服务器进行授权。
- **获取授权码（Authorization Code）**：如果用户同意授权，授权服务器会生成一个授权码，并将其发送回客户端（通过重定向 URL）。
- **获取访问令牌（Access Token）**：客户端使用授权码向授权服务器请求访问令牌。授权服务器验证授权码，并返回访问令牌。
- **访问资源**：客户端使用访问令牌向资源服务器请求访问受保护的资源。资源服务器验证访问令牌，并返回请求的资源。

### 常见的授权流程 ###

- **授权码流程（Authorization Code Flow）**：最常用的授权流程，适用于需要与用户交互的客户端（如 Web 应用）。用户在授权服务器上登录并授权，客户端获取授权码后再交换访问令牌。
- **隐式流程（Implicit Flow）**：适用于公共客户端（如单页应用）。用户直接获得访问令牌，适用于不需要安全存储的情况，但不推荐用于高度安全的应用。
- **资源所有者密码凭据流程（Resource Owner Password Credentials Flow）**：适用于信任客户端的情况。用户直接将用户名和密码提供给客户端，客户端直接获得访问令牌。这种流程不推荐用于公开的客户端。
- **客户端凭据流程（Client Credentials Flow）**：适用于机器对机器的情况。客户端直接向授权服务器请求访问令牌，用于访问与客户端本身相关的资源。

### 优缺点 ###

**优点**

- 灵活性：OAuth 2.0 支持多种授权流程，适应不同类型的客户端和应用场景。
- 安全性：通过分离授权和认证，增强了系统的安全性。使用令牌而不是用户名密码来访问资源。

**缺点**

- 复杂性：OAuth 2.0 的实现和配置可能较复杂，需要正确管理访问令牌和刷新令牌。
- 安全风险：如果令牌泄露，可能会导致安全风险。因此需要采取适当的安全措施（如使用 HTTPS 和适当的令牌管理策略）。

我们通过 Express 实现一个基本的 OAuth 2.0 验证示例

```js
const express = require('express');
const axios = require('axios');
const app = express();

// OAuth 2.0 配置
const clientId = 'your-client-id';
const clientSecret = 'your-client-secret';
const redirectUri = 'http://localhost:3000/callback';
const authorizationServerUrl = 'https://authorization-server.com';
const resourceServerUrl = 'https://resource-server.com';

// 登录路由，重定向到授权服务器
app.get('/login', (req, res) => {
  const authUrl = `${authorizationServerUrl}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=read`;
  res.redirect(authUrl);
});

// 授权回调路由，处理授权码
app.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Authorization code is missing');
  }
  
  try {
    // 请求访问令牌
    const response = await axios.post(`${authorizationServerUrl}/token`, {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret
    });
    
    const { access_token } = response.data;
    
    // 使用访问令牌访问资源
    const resourceResponse = await axios.get(`${resourceServerUrl}/user-info`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    res.json(resourceResponse.data);
  } catch (error) {
    res.status(500).send('Error during token exchange or resource access');
  }
});

app.listen(3000, () => {
  console.log('服务器正在监听 3000 端口...');
});
```

::: tip 总结

目前这四种验证方案均有对应的 优缺点、应用场景：

- Session：非常适合简单的服务器呈现的应用程序
- JWT：适用于现代无状态架构和移动应用
- SSO：非常适合具有多种相关服务的企业环境
- OAuth 2.0：第三方集成和 API 访问的首选

:::
