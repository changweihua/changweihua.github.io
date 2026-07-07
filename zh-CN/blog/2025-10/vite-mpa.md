---
lastUpdated: true
commentabled: true
recommended: true
title: Vue3+Vite单页面应用(SPA)改造为多页面应用(MPA)
description: Vite配置多页面应用，看这一篇就够了
date: 2025-10-16 09:00:00 
pageClass: blog-page-class
cover: /covers/vite.svg
---

在 Vue 开发中，默认创建的项目通常是单页面应用（SPA）。然而，在某些特定场景下，我们可能需要将其改造成多页面应用（MPA）以满足不同的业务需求。以下是详细的改造步骤，以通过 Vue CLI 创建的项目为例进行说明。

## 创建项目 ##

在开始之前，请确保你已经正确安装了 npm（推荐 node.js v20+）。安装完成后，我们可以使用以下命令创建一个新的 Vue 项目：

```bash
npm create vue@latest
# 按照脚手架的提示信息，创建一个名称为 my-mpa-project 的项目，创建完成后进入该项目目录
cd my-mpa-project
```

## 配置多页面 ##

### 新增目录结构 ###

为了支持多个静态页面，我们需要创建一个新的目录 `src/pages/`。接着，将 `index.html`、`src/App.vue` 和 `src/main.js` 文件移动到 `src/pages/index/` 目录下。在移动文件后，需要调整页面中的组件引用地址，确保所有引用的地址都是正确的。以下是修改后的 `index.html` 文件示例：

```html [index.html]
<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>首页</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/pages/index/main.js"></script>
  </body>
</html>
```

### 创建一个新页面 ###

为了实现多页面应用，我们可以复制 `src/pages/index` 目录到 `src/pages/about` 目录。复制完成后，需要调整 `about` 目录下 `index.html` 文件中的 `script` 地址，使其指向正确的 `main.js` 文件。调整后的 `index.html` 文件内容如下：

```html [index.html]
<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>关于我们</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/pages/about/main.js"></script>
  </body>
</html>
```

### 集成多页面插件 ###

为了更好地管理多页面应用，我们需要集成一个多页面插件。这里我们使用 `vite-plugin-mpa` 插件，可以通过以下命令进行安装：

```bash
npm install -D vite-plugin-mpa
```

安装完成后，需要修改 `vite.config.js` 文件，添加与多页面应用相关的配置代码。具体代码如下：

```javascript [vite.config.js]
import mpa from 'vite-plugin-mpa';

export default defineConfig({
  base: '/',
  plugins: [
    ...
    mpa.default({
      open: 'index/index.html',
      scanDir: 'src/pages',
      scanFile: 'main.js',
      filename: 'index.html',
    }),
  ],
})
```

## 多页面路由支持（可选） ##

如果你的项目需要不同的页面使用不同的路由，可以将 `src/router/index.js` 文件复制为 `indexRouter.js` 和 `aboutRouter.js`，并分别用于不同的页面。复制完成后，需要同步调整页面 `main.js` 文件中的路由引用地址，确保路由的正确使用。

## 运行和构建项目 ##

### 运行项目 ###

使用以下命令运行项目：

```bash
npm run dev
```

项目运行后，你可以通过 `http://localhost:5173/index/` 和 `http://localhost:5173/about/`访问不同的页面，检查多页面应用是否正常工作。

### 构建项目 ###

当项目开发完成后，需要进行构建以生成生产环境所需的文件。使用以下命令进行项目构建：

```bash
npm run build
```

构建完成后，在 `dist` 目录下会生成多个 HTML 文件目录，这些目录包含了多页面应用的静态文件。

通过以上步骤，你就可以将 Vue 的单页面应用成功改造成多页面应用。

## 项目简介 ##

本项目提供了一个 `Vite` 的多页面配置案例
可以在已有项目中快速扩展或拆分路由将应用变更为多页面应用

## 项目缘由 ##

最近遇到一个需求，项目中的某些偏通用/展示类页面需要供其他系统嵌入，嵌入的方式自然是 `iframe`，但是目前的项目是基于Vite + Vue3 + Ts的 SPA，提供给其他系统嵌入必然会加载大量其他系统本不需要的资源，除此之外，当前的系统是有一套 `layout` 的，这意味着其他系统嵌入目标路由时也会加载 `layout`，尽管一种方式是可以将目标路由调整为不需要 `layout`，但是这也意味着破坏了目标路由在当前系统中的展示

## 解决方案 ##

思来想去还是将当前的项目扩展为多页面应用，将需要嵌入其他系统的路由页面全部修改为独立的页面，在当前项目中同样使用 `iframe` 嵌入该独立的页面（也即是修改前的目标路由），当然，由于修改后的独立页面仍然在当前项目中，亦可不通过 `iframe` 嵌入，直接 `import` 组件像正常开发一样使用

## 配置实现 ##

按照Vite 官网的多页面应用配置文档所说，我组织了如下的项目结构

```txt
* 部分文件已忽略
vite-multipage-demo
                 |-pages                     // 多页面目录
                 |   |-about                 // 关于页面
                 |   |   |-assets            // 关于页面资源
                 |   |   |-src               // 页面源码
                 |   |   |   |-App.vue       // 页面组件
                 |   |   |   |-main.ts       // 入口文件
                 |   |   |-index.html        // 页面入口
                 |   |-agreement             // 协议页面
                 |   |   |-assets            // 关于页面资源
                 |   |   |-src               // 页面源码
                 |   |   |   |-App.vue       // 页面组件
                 |   |   |   |-main.ts       // 入口文件
                 |   |   |-index.html        // 页面入口
                 |-src                       // 公共源码
                 |   |-assets                // 公共资源
                 |   |-components            // 公共组件
                 |   |- App.vue               // 根组件
                 |   |-main.ts               // 入口文件
                 |-index.html                // 根入口
                 |-tsconfig.json             // TypeScript 配置
                 |-package.json              // 项目依赖配置
                 |-vite.config.ts            // Vite 配置文件
```

而后修改了 `vite.config.ts` 配置如下

```ts [vite.config.ts]
// @ts-nocheck
import type { UserConfig, ViteDevServer } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";

const root = process.cwd();

function pathResolve(dir: string) {
  return resolve(root, ".", dir);
}

// 所有页面
const pages = [
  { name: "index", htmlName: "index.html", htmlPath: "" },
  { name: "about", htmlName: "index.html", htmlPath: "pages/about/" },
  { name: "agreement", htmlName: "index.html", htmlPath: "pages/agreement/" },
];

pages.forEach((page) => {
  page.path = pathResolve(page.htmlPath + page.htmlName);
});

export default (): UserConfig => {
  return {
    plugins: [vue()],
    build: {
      rollupOptions: {
        input: pages.reduce((res: Record<string, string>, cur) => {
          res[cur.name] = cur.path;
          return res;
        }, {}),
      },
    },
  };
};
```

效果并不如预期，初步猜测是 `Vite Server` 并没有正确处理响应，通过查阅资料知道 Vite 的插件 API提供了一个 `configureServer`，是用于配置开发服务器的钩子，关于这一API源码的注释如下：

大概了解了下，在中间件替换了 `Vite Server` 接收到的请求信息，其实最主要的改动就是修改了请求的 `url`，配置如下


```ts [vite.config.ts]
// .....

// server插件
const multiplePagePlugin = () => ({
  name: "multiple-page-plugin",
  configureServer(server: ViteDevServer) {
    server.middlewares.use((req, res, next) => {
      for (let page of pages) {
        if (page.name === "index") {
          continue;
        }

        if (req.url.startsWith(`/${page.name}`)) {
          req.url = `/${page.htmlPath}${page.htmlName}`;
          break;
        }
      }
      next();
    });
  },
});

export default (): UserConfig => {
  return {
    plugins: [vue(), multiplePagePlugin()],
    // .....
  };
};
```

效果符合预期

> 本来到这里就结束了，但是在打包之后发现实际上所有的资源都统一被打包到了 `assets` 目录下，如下图：

实际 `about` 页面的 `logo.png` 最终输出在根目录下的 `dist/assets` 下，尽管这并不影响我当下的需求，但是考虑到 `pages` 下的产物的灵活性，于是再研究了下 `rollupOptions` 配置项，发现可以通过 `output` 配置实现，新增配置如下：

```ts [vite.config.ts]
// .....

// 此处将pages拆分为默认pages和mutltiPages，是因为默认页面的打包资源无需处理
// 在output中只需匹配多页面，没有匹配到的资源仍然放在根目录assets下

// 多页面信息
const mutltiPages = [
  { name: "about", htmlName: "index.html", htmlPath: "pages/about/", outPagePath: "pages/about/" },
  { name: "agreement", htmlName: "index.html", htmlPath: "pages/agreement/", outPagePath: "pages/agreement/" },
];

// 所有页面
const pages = [{ name: "index", htmlName: "index.html", htmlPath: "", outPagePath: "" }, ...mutltiPages];

// ......

export default (): UserConfig => {
  return {
    // ......
    build: {
      rollupOptions: {
        // ......
        output: {
          // 自定义输出目录和文件名
          entryFileNames: (chunkInfo) => {
            // 尝试通过chunk名匹配多页面路径 若匹配到则放置在对应目录 否则放置在根目录
            const page = mutltiPages.find((p) => p.name === chunkInfo.name);
            return page ? `${page.outPagePath.replace(/^\//, "")}assets/[name].[hash].js` : "assets/[name].[hash].js";
          },
          chunkFileNames: (chunkInfo) => {
            const page = mutltiPages.find((p) => chunkInfo.name.includes(p.name));
            return page ? `${page.outPagePath.replace(/^\//, "")}assets/[name].[hash].js` : "assets/[name].[hash].js";
          },
          assetFileNames: (assetInfo) => {
            // 处理 CSS、图片等资源
            // 优先按照原始文件名处理 若匹配到多页面路径则放置在对应目录 否则放置在根目录assets
            if (assetInfo.originalFileName) {
              const page = mutltiPages.find((p) => assetInfo.originalFileName?.includes(p.outPagePath));
              return page ? `${page.outPagePath.replace(/^\//, "")}assets/[name].[hash][extname]` : "assets/[name].[hash][extname]";
            } else {
              // 如果没有原始文件名，通过name匹配
              const page = mutltiPages.find((p) => assetInfo.name?.includes(p.name));
              return page ? `${page.outPagePath.replace(/^\//, "")}assets/[name].[hash][extname]` : "assets/[name].[hash][extname]";
            }
          },
        },
      },
    },
  };
};
```

`entryFileNames`，`chunkFileNames`，`assetFileNames` 三项配置分别处理入口文件，其他`chunk`，静态资源的输出目录，配置好后打包目录符合预期。

本来到这里就结束了，但是有时候多页面的需求可能并不那么纯粹，简单来说，基于我一开始提出的缘由，尽管目标路由变成了独立的页面，但实际上独立出去的页面仍然需要访问目前系统的许多公共资源（ `根目录/src` 下），若是一股脑地全部搬到对应的 `pages` 下，虽然逻辑和结构清晰了，但系统中的公共资源却变成了两份甚至多份，同时后续系统中的公共资源若有变更，则需要维护多处内容，而如果直接在 `pages` 对应的代码中引入公共资源，则会造成结构的破坏，这两个方案都有不足，既然两个方案我都不满意，那么只能将 `pages` 挪到 `根目录/src` 下，或者说至少要支持这样的情况，这样一来，独立出去的页面访问系统公共资源自然是合乎逻辑的。

于是我添加了如下的 `inner-pages`

```txt
                 |-src                       // 公共源码
                 |   |-assets                // 公共资源
                 |   |-components            // 公共组件
                 |   |-inner-pages           // 内部页面
                 |   |   |-releases           // 发布页面
                 |   |   |   |-src           // 发布页面源码
                 |   |   |   |   |-App.vue   // 发布页面组件
                 |   |   |   |   |-main.ts   // 发布页面入口
                 |   |   |   |-index.html    // 发布页面入口
                 |   |- App.vue               // 根组件
                 |   |-main.ts               // 入口文件
                 |-index.html                // 根入口
```

修改 `vite.config.ts` 配置如下

```ts [vite.config.ts]
// 多页面信息
const mutltiPages = [
  { name: "releases", htmlName: "index.html", htmlPath: "src/inner-pages/releases/", outPagePath: "inner-pages/releases/" },
  // ......
];
```

本以为万事大吉，但是打包后发现 `inner-pages` 的资源符合预期，但是 `index.html` 文件却保留了原来的路径

原因在 Vite 的文档中自然提到了

简单来说，`HTML` 文件路径生成的 `id` 也将作为输出产物的对应路径，但是如果就这样的话，实在有些割裂。

大模型问了半天也没有方案，最后还是仔细看了下 `rollupOptions` 的配置才解决，新增配置如下

```ts [vite.config.ts]

// 处理html输出路径
const htmlPlugin = () => {
  return {
    name: "html-path-manual",
    generateBundle(options, bundle) {
      // 对inner-pages下的index.html的输出路径单独进行处理
      const innerPages = mutltiPages.filter((page) => page.outPagePath.startsWith("inner-pages"));
      for (let page of innerPages) {
        const htmlFile = bundle[page.htmlPath + page.htmlName];
        if (htmlFile) {
          htmlFile.fileName = page.outPagePath + page.htmlName;
        }
      }
    },
  };
};

export default (): UserConfig => {
  return {
    // ......
    build: {
      rollupOptions: {
       // ......
        plugins: [htmlPlugin()],
      },
    },
  };
};
```

到此，终于结束了。

## 其他 ##

写了这么多，主要是为了还原我在处理这一需求时的历程，如果是一个全新的项目，我相信自然一开始就有很好的多页面应用组织，但可惜不是，不过掉进了坑里再爬出来，将会拥有更大的自由度，比如此刻，我相信如果你看到了这里，在你的项目中你将可以任意地组织多页面的输入和输出。

Vite 毕竟是新兴的事物，虽然应用越来越多，但是其本身的迭代也很快，相关的需求参考博客都比较少，加上本人对 `rollup` 并不熟悉，所以还是花了大半天时间，所以也希望这篇记录有一些贡献，下次当别人再有需求时直接就能搜到可用的解决方案了，毕竟在项目中，大多数的朋友都不太会参与项目基建或配置的改动。

最后，对Vite的配置虽然完成了，但生产环境还需要做配置，因为不同的项目背景不同，部署方式也不同，这里只贴一下 nginx 的配置参考

```nginx

    http {
        include       mime.types;
        default_type  application/octet-stream;
        keepalive_timeout  65;
        gzip  on;
        client_max_body_size 2048m;
    	
        server {
            listen 8000; # 监听的端口
            server_name 0.0.0.0; # 域名或ip

            location /about {
                alias html/pages/about/;
                try_files $uri $uri/ /index.html;
                index index.html index.htm;
                error_page 405 =200 $uri;
            }

            location /agreement {
                alias html/pages/agreement/;
                try_files $uri $uri/ /index.html;
                index index.html index.htm;
                error_page 405 =200 $uri;
            }

            location /releases {
                alias html/inner-pages/releases/;
                try_files $uri $uri/ /index.html;
                index index.html index.htm;
                error_page 405 =200 $uri;
            }

            location / {
                root html/;# 根目录
                try_files $uri $uri/ /index.html;
                index index.html index.htm; # 默认页
                error_page 405 =200 $uri;
            }
    	
        }

    }
```
