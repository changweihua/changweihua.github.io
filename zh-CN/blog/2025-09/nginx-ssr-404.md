---
lastUpdated: true
commentabled: true
recommended: true
title: 用户访问到一个不存在的路由，如何重定向到404 Not Found的页面
description: 用户访问到一个不存在的路由，如何重定向到404 Not Found的页面
date: 2025-09-22 14:00:00 
pageClass: blog-page-class
cover: /covers/Nginx.svg
---

在前端或服务端开发中，处理“用户访问不存在路由”的情况是必不可少的。它既影响用户体验，也关系到 SEO 与服务器正确返回状态。一般来说，SPA、SSR 和静态托管环境下的实现方式会有所不同，需要根据场景采用相应的策略。

我们先给个总原则：

- 客户端路由（SPA）：用“兜底路由（catch-all）”匹配一切未命中的路径，渲染你的 `NotFound` 组件。不要做 302/301“重定向”；SPA 内部只是显示 404 页。
- SSR/服务端：除了渲染 404 页面，还要返回 HTTP 404 状态码，这样对 SEO/爬虫/CDN 都正确。
- 静态托管/反向代理：配置服务器的 404 页面或 “history fallback”，避免刷新直接 404 白页。

## 客户端路由（SPA） ##

在 React 中，我们通常通过在路由配置的最后添加一个 兜底路由（catch-all） 来处理所有未匹配的路径，从而渲染一个 404 页面组件。这样做能够保证无论用户输入了什么不存在的地址，都会正确显示自定义的 NotFound 页面。

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />

        {/* 兜底匹配：必须放在最后 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

> 注意：在 SPA 环境 中，不要用 `navigate("/404")` 做“重定向”。这种方式虽然能跳转到 /404 路由，但本质上仍然返回 200 状态码，对 SEO 没有帮助。正确做法是直接渲染 `<NotFound />` 组件，让用户立即看到 404 页面即可。

## SSR / 同构框架 ##

在 Next.js 中，处理 404 页面有专门的机制。与 React Router 需要手动添加兜底路由不同，Next.js 提供了内置的 `notFound()` 方法和特殊页面文件来自动完成这一逻辑。

- 新建 `app/not-found.tsx` 文件：当调用 `notFound()` 或访问了未匹配的动态路由时，Next.js 会自动渲染该页面，并返回正确的 HTTP 404 状态码。
- 在具体页面逻辑中可以主动调用 `notFound()`，用于在数据不存在时触发 404 页面。

```tsx:app/not-found.tsx
export default function NotFound() {
  return <h1>404 - Not Found</h1>;
}

// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";

export default async function Page({ params }) {
  const post = await getPost(params.slug);
  if (!post) notFound(); // 自动触发 404 页面和状态码
  return <Article post={post} />;
}
```

> 补充：如果你想要顶层兜底，可以新建 `app/[...notFound]/page.tsx` 来捕获所有未知路径，但官方更推荐在具体页面调用 `notFound()`，这样能更清晰地表达“数据不存在”的语义。

## Node/Express（服务端渲染或 API） ##

在 Express 里，路由是顺序匹配的，所以 404 处理逻辑需要放在 所有路由之后。常见做法如下：

```js
// 兜底处理：放在所有路由后面
app.use((req, res) => {
  res.status(404);

  // SSR 页面
  res.render("404", { url: req.originalUrl });

  // 如果是 API
  // res.json({ error: "Not Found", path: req.originalUrl });
});
```

如果需要更通用，可以配合全局错误处理中间件，统一处理 404、500 等错误，并根据请求类型返回 `HTML`/`JSON`/`文本`。

## Nginx / 静态托管 ##

在 Nginx/静态托管下，核心目标是：用户刷新页面不白屏、真实缺失资源返回 404、前端路由与静态资源/接口彼此不“串台”、并对带指纹的资源开启长缓存。

对于纯静态站点（非 SPA），每个 URL 都应该严格对应一个真实文件或目录的 `index.html`，因此用 `try_files $uri $uri/ =404`; 保证未命中就走自定义 404 页面（状态码仍为 404），示例：

```nginx
server {
  root /var/www/site;
  index index.html;

  # 未命中文件或目录就返回 404（并触发下方 error_page）
  location / {
    try_files $uri $uri/ =404;
  }

  # 静态资源直出并长缓存（仅限带指纹的构建产物）
  location ~* \.(?:js|css|png|jpe?g|gif|svg|ico|woff2?)$ {
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000, immutable";
    access_log off;
  }

  # 自定义 404 页面：仅在出错时由服务器内部调用
  error_page 404 /404.html;
  location = /404.html { internal; }
}
```

而对于 SPA（history 模式），页面路径应该在“真实文件不存在”时回退到入口 `index.html`，但图片、CSS/JS 和 `/api/` 这类接口必须各走各的，不要被回退吞掉；注意 `try_files` 顺序要写成 `$uri $uri/ /index.html` 才是“命中文件优先，最后才回退”，示例：

```nginx
server {
  root /var/www/app;
  index index.html;

  # 资源命中就返回，否则明确 404（不要回退到 index.html）
  location ~* \.(?:js|css|png|jpe?g|gif|svg|ico|woff2?)$ {
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000, immutable";
    access_log off;
  }

  # 后端接口与前端路由隔离，避免被前端回退“吞掉”
  location /api/ {
    proxy_pass http://backend;
    # proxy_set_header Host $host; 等按需补充
  }

  # 页面路由回退：仅当文件不存在时回退到入口
  location / {
    try_files $uri $uri/ /index.html;
  }

  # 真实 404（例如 /assets/ 下未命中）
  error_page 404 /404.html;
  location = /404.html { internal; }
}
```

如果你的应用部署在子路径（例如挂在 `/app/`），就不要简单地用 `root` 拼接路径，推荐使用 `alias` 让物理路径与 URL 前缀解耦，同时回退到“子路径下的入口页”，示例：

```nginx
server {
  root /var/www;               # 站点根目录（可用于其它页面）
  index index.html;

  # /app/ 子应用（注意 alias 末尾保留 /）
  location /app/ {
    alias /var/www/app/;
    try_files $uri $uri/ /app/index.html;
  }

  # 子应用的静态资源单独兜底为 404
  location /app/assets/ {
    alias /var/www/app/assets/;
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  error_page 404 /404.html;
  location = /404.html { internal; }
}
```

若站点是混合形态（部分路径是预渲染文档、其余路径走 SPA），可以对需要 SEO 的栏目（如 `/docs`、`/blog`）坚持严格文件匹配，而其余路径交给前端回退，这样“真缺页真 404，前端路由可刷新”，示例：

```nginx
server {
  root /var/www/site;
  index index.html;

  # 预渲染栏目：严格命中文件/目录，否则真 404
  location ~ ^/(docs|blog)/ {
    try_files $uri $uri/ =404;
  }

  # 其余页面交由 SPA 回退
  location / {
    try_files $uri $uri/ /index.html;
  }

  # 静态资源与 404
  location ~* \.(?:js|css|png|jpe?g|gif|svg|ico|woff2?)$ { try_files $uri =404; }
  error_page 404 /404.html;
  location = /404.html { internal; }
}
```

最后提醒两点：

第一，不要把 `/404` 仅做成前端路由，那样状态码仍是 200，是“假 404”，正确做法是让服务端返回 404 并（可选）渲染自定义 404 页；

第二，`try_files` 的顺序至关重要，写错会导致所有请求都被 `index.html` 吞掉或者永远返回 200。需要的话，把你的部署路径、是否有后端接口、以及构建产物目录结构贴出来，我可以把上面的片段拼成一份能直接上线的配置。

## 总结 ##

当遇到不存在路由时，SPA 应用用兜底路由直接渲染 `NotFound`，不要重定向到 `/404`，否则依旧是 200。

SSR/服务端（如 Next/Express）在未匹配或数据缺失时应渲染 404 并返回 HTTP 404，以保证 SEO 与爬虫正确识别。

Nginx/静态托管下，非 SPA 用 `try_files $uri $uri/ =404`，SPA 用 `try_files $uri $uri/ /index.html`，并让静态资源与 `/api/` 各自匹配，未命中就真 404。关键避坑是 `try_files` 顺序不要写反、不要用前端“假 404”，同时对带指纹的资源启用长缓存、HTML 采用短缓存以兼顾更新与性能。
