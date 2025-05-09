---
outline: false
aside: false
layout: doc
date: 2025-05
title: BFF建设—— Fastify
description: BFF建设—— Fastify
category: 文档
pageClass: manual-page-class
---

# BFF建设—— Fastify #

> 为什么要用BFF（Backend for Frontend）？以及BFF和在layout里面处理数据的区别

## 本质区别总结 ##

|  比较维度  |  layout 中处理  |  BFF 中处理  |  描述  |
|  :---  |  :----:  |  :---  |   :---  |
| 位置 | 客户端或 SSR 组件内部（如 `layout.tsx`, `page.tsx`） | Node.js 服务中间层（如 Fastify） |  |
| 作用时机 | 页面渲染前（Server/Client） | 请求前或请求聚合时 |  |
| 能处理的内容 | 页面渲染逻辑、展示逻辑、轻量 fetch | 接口聚合、权限校验、数据预处理、缓存、转发等 |  |
| 适合处理 | 单个 API 请求、UI 层级逻辑 | 多接口聚合、复杂 token 验证、微服务聚合 |  |
| 可重用性 | 低，业务耦合在组件中 | 高，可复用多个页面和前端应用 |  |
| 安全性 | 数据暴露风险高 | 可隐藏真实 API，实现安全代理 |  |


## 典型场景对比 ##

## layout.tsx 中处理的适合场景 ##

适合中小型项目，数据结构简单，不需要聚合或转发。

```ts
// app/layout.tsx
export default async function RootLayout({ children }) {
  const user = await getUserFromSession(); // 从 cookie/session 拿用户信息
  return (
    <html>
      <body>
        <Sidebar user={user} />
        {children}
      </body>
    </html>
  );
}
```

- 只访问单一接口
- SSR 获取数据用于初始化页面
- 不涉及多服务聚合、复杂验证


### 使用 BFF 的适合场景 ###

适合复杂系统、接口数量多、权限控制复杂、后端服务分散（微服务）场景。

```ts
// Fastify 路由聚合
fastify.get('/api/home', async (req, reply) => {
  const [user, dashboardData] = await Promise.all([
    getUser(req.headers.token),
    fetchDashboardInfo(),
  ]);
  return { user, dashboardData };
});
```

- 聚合多个后端接口
- 做权限校验、token 校验
- 服务转发（代理其他服务）
- 隐藏后端真实地址
- 实现缓存、日志等统一中间件逻辑

### 如果你在 layout.tsx 中做这些，会遇到的问题 ###

- 多接口调用分散在页面里，逻辑重复
- 无法实现统一 token 校验（需要每个组件处理）
- API 曝露，前端请求直接暴露真实后端地址
- 服务间依赖强，后端结构变化会影响前端

在 Next.js 中是否有必要做 BFF（Backend for Frontend）转发，主要取决于你的业务复杂度、系统架构，以及前后端职责边界。*layout 更适合做页面初始化与 UI 逻辑，而 BFF 是后端服务的抽象与聚合，两者关注点不同*。

它不是鸡肋，而是在*复杂应用场景下非常实用的一种架构模式*。

### 常见的 Node.js Web 框架简单对比一下，具体不阐述 ###

```txt
Node.js 体验AI代码助手 代码解读复制代码  ├── Express  （传统老牌，简单快速）
  ├── Fastify  （极速高性能，接口项目神器）
  ├── Koa      （极简核心，自由度高）
  └── NestJS   （大型工程标准，企业级项目）
```

## 我们本次使用Fastify ##

### 什么时候推荐使用 Fastify 搭配 Next.js？ ###

|  场景  |  是否推荐使用 Fastify  |
|  :---  |  :---  |
| 需要自定义后端接口（非 Next API 路由） | ✅ 推荐 |
| 需要统一中间件处理逻辑（如 token 校验、日志） | ✅ 推荐 |
| 微服务架构：需要做服务聚合 / 转发 | ✅ 推荐 |
| 对性能要求极高 | ✅ 推荐（Fastify 性能高） |
| 想要将 Next.js 融入已有 Node.js/Fastify 项目 | ✅ 推荐 |
| 只做前端页面展示 | ❌ 不推荐（鸡肋） |


### 使用 Fastify + Next.js 的优点 ###

|  优点  |  说明  |
|  :---  |  :---  |
|  💨 性能好  |  Fastify 是目前最快的 Node.js 框架之一，响应更快  |
|  🧩 灵活拓展  |  可以轻松挂载第三方插件（如认证、日志、限流）  |
|  🔌 支持微服务  |  可以作为 API 网关使用，将请求路由到其他服务  |
|  🧠 更好的控制  |  可以控制请求生命周期，比如请求前校验、埋点等  |
|  🧰 和传统后端更兼容  |  更像真实后端框架，便于和其他服务对接  |


### 使用 Fastify 的缺点 ###

|  缺点  |  说明  |
|  :---  |  :---  |
|  🧱 增加复杂度  |  你得写自定义服务脚本`server.js`，部署方式也变了  |
|  🐞 API 路由不能共用  |  Fastify 和 Next 的 API 路由是分开的（重复写 API）  |
|  ⚠️ 需要管理原始 req/res  |  Fastify 是封装的，Next.js 需要原生 req.raw，容易出错  |
|  🛠️ 编写调试更复杂  |  不如直接 next dev 启动来得简单直接  |


> 🧠 总结一句话：如果你只做页面渲染，不涉及复杂后端逻辑，Fastify 是鸡肋；但如果你需要自定义 API、集成第三方服务、性能优化或构建 BFF 层，那 Fastify 是很好的搭档。


## NextJS中使用 Fastify ##

NextJS有两个模式Pages Router 和 App Router，不管是 Pages Router 还是 App Router，Next.js 都需要一个 Node 服务来运行，Fastify可以包裹它，但不能直接拿 Fastify完全替代 Next.js 自带 Server。所以：

- 不能**直接只跑 Fastify**。
- 要么用**Fastify 包裹 Next.js**，做成一个统一的 Node 应用。
- 要么**Fastify 跑自己的 API，Next.js 跑自己的页面服务**（两套服务）。

我们本次做的是用**Fastify 包裹 Next.js**，一张流程图解释一下，

```txt
[浏览器访问]
       ↓
[Fastify Server]
       ↓
[Next.js 处理页面或API]
```

### 操作步骤 ###

#### 先安装依赖 ###

```bash
npm install fastify
```

#### 新建一个 `server.js` 文件（放在项目根目录） ####

```js
// server.js
const Fastify = require('fastify');
const Next = require('next');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = Next({ dev });
const handle = app.getRequestHandler();

const fastify = Fastify({
  logger: true,
  maxParamLength: 5000
});

async function start() {
  await app.prepare();

  // 处理 Next.js 页面请求
  fastify.all('/*', async (request, reply) => {
    await handle(request.raw, reply.raw);
    reply.sent = true;
  });

  try {
    await fastify.listen({ port });
    console.log(`> Ready on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
```

> 注意这里用的是 `request.raw` 和 `reply.raw`，因为 Next.js 原本基于 Node.js `req` 和 `res`。

#### 修改 `package.json` 的 `start` 脚本 ####

把启动命令改成用 `node server.js`，而不是默认的 `next start`：

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "NODE_ENV=production node server.js"
}
```

开发环境你可以直接 `next dev`，生产环境就走 Fastify 接管。

#### 项目目录结构示例（假设你用 App Router） ####

```txt
/app
  /page.tsx
  /api/xxx/route.ts
/public
/server.js
/package.json
/next.config.js
...
```
