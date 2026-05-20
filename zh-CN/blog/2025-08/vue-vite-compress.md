---
lastUpdated: true
commentabled: true
recommended: true
title: Vue + Vite 全链路性能提升与打包体积压缩指南
description: Vue + Vite 全链路性能提升与打包体积压缩指南
date: 2025-08-27 09:05:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 加载与渲染优化 ##

### 懒加载（延迟加载）###

对于页面中非首屏的图片或者组件，可以采用延迟加载的方式，可以有效减少首屏加载资源数，提升页面初始加载速度。

#### 路由懒加载 ####

不要一次性加载所有页面的代码，而是按需加载

```ts
const User = () => import('@/views/User.vue')
```

#### 组件懒加载 ####

对于首屏不重要的组件，用 `defineAsyncComponent` 或者异步组件加载

```ts
import { defineAsyncComponent } from 'vue'
const Chart = defineAsyncComponent(() => import('@/components/Chart.vue'))
```

有时候资源拆分过细也不好，可能造成浏览器 http 请求过多，以下三种场景适合组件懒加载的场景：

- **页面 JS 文件体积较大**

页面打开较慢时，可通过组件懒加载拆分资源，让浏览器并行下载，提高首屏加载速度（例如首页）。

- **按需加载的组件**

某些组件不是页面初始化就需要的，而是在特定条件下才显示，可使用懒加载（例如弹窗组件）。

- **高复用组件**

对于多个页面都会用到的组件，可懒加载进行抽离，一方面利用缓存减少重复下载，另一方面减小每个页面的 JS 文件体积（例如表格组件、图表组件）。

### 预加载与预连接 ###

对于关键的资源，可以使用 `preload` 来提示浏览器尽快下载。对于需要连接的第三方域名，可以使用 `preconnect` 或 `dns-prefetch` 来提前建立连接，减少后续请求的等待时间。

下面是图片预加载示例

在打包或开发时，自动扫描指定目录下的图片文件，并在 HTML 中注入 `<link rel="prefetch" href="...">`，实现预加载图片，提高页面性能。

```ts
import fg from "fast-glob";

// vite 使用
export const preloadImages = options => {
  return {
    name: "vite-plugin-preload-images",
    transformIndexHtml(html, ctx) {
      // console.log(html);
      // return html.replace("<title>Vite App</title>", "<title>Hello word</title>");
      const {dir, attrs} = options;

      const files = fg.sync(dir, {
        cwd: ctx.server?.config.publicDir,
      });

      const images = files.map(file => ctx.server?.config.base + file);

      return images.map(herf => {
        return {
          tag: "link",
          attrs: {
            rel: "prefetch", // preload
            href: herf,
            as: "image",
            ...attrs,
          },
        };
      });
    },
  };
};
```

```js:vite.config.js
import {fileURLToPath, URL} from "node:url";
import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import {resolve} from "path";
import vueJsx from "@vitejs/plugin-vue-jsx";
import {preloadImages} from "./src/utils/preloadImages";

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    preloadImages({
      dir: "images/**/*.{png,jpg,jpeg,webp,gif,svg}",
      attrs: {
        rel: "preload",
      },
    }),
  ],
  resolve: {
    alias: {
      // "@": resolve(__dirname, "src"),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

```vue
<template>
	<div class=''>
		<h1>图片预加载</h1>
		<img src="http://localhost:5173/images/image1.png" alt="">
		<img src="http://localhost:5173/images/image2.png" alt="">
		<img src="http://localhost:5173/images/image3.png" alt="">
		<img src="http://localhost:5173/images/image4.png" alt="">
		<img src="http://localhost:5173/images/image5.png" alt="">
		<img src="http://localhost:5173/images/image6.png" alt="">
		<img src="http://localhost:5173/images/image7.png" alt="">
		<img src="http://localhost:5173/images/image8.png" alt="">
		<img src="http://localhost:5173/images/image9.png" alt="">
	</div>
</template>
```

### 优化关键渲染路径 ###

- **CSS 置顶，JS 置底**：将 CSS  标签放在  中，以便浏览器能尽早开始构建 CSSOM（CSS 对象模型）。将 JavaScript  结束标签前，以避免 JavaScript 的加载和执行阻塞 HTML 的解析和渲染。
- **避免渲染阻塞资源**：对于非关键的 CSS 和 JavaScript，可以使用 async 或 defer 属性进行异步加载，避免阻塞页面的渲染。

### 服务端渲染（SSR）或预渲染 ###

对于需要关注 SEO 和首屏加载速度的应用，可以采用服务端渲染的方式。SSR 在服务端将页面渲染成 HTML 字符穿串，然后发给浏览器，使得浏览器可以更快的显示页面内容，对于静态页面，也可以在构建时进行预渲染，生成静态 HTML 文件。

## Tree Shaking ##

### 什么是 Tree Shaking？ ###

你可以把 *Tree Shaking* 理解成：

在打包时，自动把“用不到的代码”像树叶一样抖掉，只保留真正用到的部分。

名字来源于“摇树掉叶子”——想象你的代码像一棵大树，树枝是模块，叶子是函数/变量，没用的叶子会被打包工具摇下来丢掉。

在 Vue 项目里它的作用是：

- 减少打包体积（加载更快）
- 去掉无用的代码（提升性能）
- 按需引入组件/方法

### Vue 中 Tree Shaking 的核心思路 ###

在 Vue + Vite/Webpack 环境中，Tree Shaking 一般基于 `ES Model（ESM）` 特性来做：

```ts
// ESM 语法
import { ref, reactive } from 'vue';
```

编译的时候打包工具能分析出哪些 `import` 的内容没有用到，然后移除没用的部分。

**例子**：

```ts
import { ref, reactive } from 'vue'

const count = ref(0) // reactive 没用到，所以会被移除
```

打包后的代码里，只会保留 `ref` 相关代码。

### 新手常见错误（Tree Shaking 失效） ###

#### 使用 CommonJS（require） ####

```ts
const vue = require('vue') // 无法 Tree Shaking
```

要用 ES Module：

```ts
import { ref } from 'vue' 
```

#### 引入整个库 ####

```ts
import _ from 'lodash' // 会把整个 lodash 都打进去
```

**按需引入**：

```ts
import debounce from 'lodash/debounce' 
```

#### 在动态代码里用 `import` ####

如果写了动态 `require/import`，打包工具就没法静态分析哪些代码没用。

### Vue 中如何让 Tree Shaking 更高效 ###

- 按需引入组件库（特别是 UI 库）
- 不要用 `import * as`， 这样会引入所有导出内容，Tree Shaking 不好用。
- 用 Vite/Webpack 默认的 ES Model，不要手动切成 CommonJS。

## 打包优化 ##

### 开启代码压缩 （Terser、Esbuild） ###

- 减小代码体积：删除多余的空格、换行、注释，缩短变量名与函数名，去掉调试信息
- 简单说：压缩就是让生产环境的代码更小、更快、更安全。

Vite 在 `mode: 'production'` 打包时，默认就会启用压缩（使用 *esbuild*）。

所以即使什么都不配，也会自动压缩。也可以手动配置

#### 使用 Esbuild 压缩（默认，速度快） ####

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    minify: 'esbuild', // 默认就是 esbuild
    target: 'esnext',  // 目标语法，可以是 'es2015'
  }
})
```

#### 使用 Terser 压缩（压缩率更高，可配置更多） ####

```bash
npm install terser -D
```

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    minify: 'terser', // 启用 Terser
    terserOptions: {
      compress: {
        drop_console: true,   // 删除 console.log
        drop_debugger: true,  // 删除 debugger
      },
      format: {
        comments: false,      // 删除注释
      }
    }
  }
})
```

### 开启 gzip 或 brotil 压缩（nginx 配置 gzip on） ###

- 开启 gzip/brotli 压缩就是为了让网络传输更快、更省流量，同时提升用户体验。
- 当开启 gzip 的时候， 服务器会生成 `.gz` 文件 ，浏览器访问服务器会返回压缩内容，浏览器负责解压，用户无感知，体积小传输快， 从而提升页面加载速度和降低带宽消耗。

```ts
import viteCompression from "vite-plugin-compression";
```

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression'  // ✅ 这里要引入

export default defineConfig({
  plugins: [
    vue(),
    viteCompression({   // 开启gzip
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({   // 开启brotil 
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
})
```

我这里使用 docker 部署，需要配置 nginx.conf + Dockerfile

```nginx
server {
  listen 80;
  server_name localhost;

  root /usr/share/nginx/html;
  index index.html;

  # 前端路由 history 模式需要重定向
  location / {
    try_files $uri $uri/ /index.html;
  }

  # 开启 gzip
  gzip on;
  gzip_min_length 1k;
  gzip_comp_level 6;
  gzip_types text/plain text/css application/javascript application/json application/xml+rss image/svg+xml;
  gzip_vary on;

  # 如果打包时生成了 .br 文件，可以启用 brotli
  # 需要 nginx 编译了 brotli 模块才行
  brotli on;
  brotli_comp_level 6;
  brotli_types text/plain text/css application/javascript application/json image/svg+xml;

  # 缓存策略
  location ~* .(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$ {
    expires 30d;
    add_header Cache-Control "public";
  }

  # HTML 不缓存，避免版本不更新
  location ~* .(html)$ {
    expires -1;
    add_header Cache-Control "no-cache";
  }
}
```

```Dockerfile
# 使用官方 nginx 镜像作为基础镜像
FROM nginx:alpine

# 删除默认配置
RUN rm /etc/nginx/conf.d/default.conf

# 拷贝自定义配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 拷贝构建后的前端资源
COPY dist/ /usr/share/nginx/html/

# 暴露端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

然后把 dist、Dockerfile、nginx.conf 传到服务器进行构建，然后看到 gzip 代表成功了。

## 缓存策略 ##

合理利用缓存可以极大地提升二次访问的速度。

### 浏览器缓存 ###

通过设置合理的 HTPP 缓存头（如 `Cache-Control`、`Expires`, `ETag`、`Last-Modified`），可以让浏览器缓存静态资源。当用户再次访问时，浏览器可以直接从本地缓存中读取，无需再次向服务器请求。

### 使用 CDN 加载第三方库（Vue、ECharts、Lodash 等） ###

- 减少项目打包体积：第三方代码不再打包进代码，打包后的 js 文件更小，首屏加载更快。
- CDN 节点分布全球离用户更近下载更快，CDN 服务器一般宽带大性能好，支持高并发访问。
- 用户可能访问过其他使用相同的 CDN 网站，浏览器已经缓存了这些库不需要再次下载。
- 第三方库从 CDN 下载，不占用自己服务器宽带，服务器只需要提供自家的业务代码。

### Ajax 缓存 ###

对于一些不长变化的 Ajax 请求，可以将结果缓存起来，当再次发起相同的请求时，可以直接从缓存中读取数据，减少服务器压力，提升响应速度。

## 资源优化 ##

### 文件优化 ###

文件压缩与合并：通过对 CSS、JavaScript 等文件进行压缩，可以有效减小文件体积。将多个小文件合成一个大文件，减少 HTPP 请求次数，从而降低网络延迟。

### 图片优化 ###

- 使用懒加载（`loading="lazy"` 或 Vue 指令）
- 用雪碧图减少请求数量
- 图片转 base64 格式

## 分片更新（避免一次渲染太多 DOM）—— 减少重(Repaint)绘与重排(Reflow) ##

DOM 操作和样式的改变可能会引发浏览器的重绘与重排，这是非常消耗性能的操作。应尽量减少不必要的 DOM 操作，比如：批量修改 DOM 元素、批量修改样式、或者使用 `CSS transform` 等不会触发回流的属性来实现动画效果。。

### 使用 requestAnimationFrame ###

`requestAnimationFrame` 是浏览器提供的一个 API，用来告诉浏览器：*我想要执行一个动画，请在下次重绘（repaint）之前调用指定的函数来更新动画*。

它的本质是一个 *动画调度器*，让动画和显示器的刷新率（一般是 60Hz，也就是 1 秒 60 帧）保持同步。

```ts
let id = requestAnimationFrame(callback)

// 取消动画
cancelAnimationFrame(id)
```

- `callback`：你定义的函数，浏览器会在下一次绘制前调用它，并把一个 时间戳（DOMHighResTimeStamp） 传进去。
- `id`：返回一个 ID，可以用来取消动画。

**setTimeout / setInterval / requestAnimationFrame 的区别**：

- `setTimeout` 是延时执行一次代码，到期后把回调函数丢进事件队列，排队执行（受 CPU 负载和事件队列影响，不精确 ）。就像闹钟，设定好时间，到时间了就提醒一次，常用在“延时执行一次任务”。
- `setInterval` 是定时循环执行代码，按设定的时间间隔丢进队列（同上，不精确，可能堆积）。就像时钟，每隔一段时间滴答一次，不管上次有没有执行完，都会继续安排下次，容易出现堆积卡顿，所以不太适合做动画。
- `requestAnimationFrame` 是浏览器专门给动画准备的，它会在屏幕每次刷新之前（通常是 16.7ms 一次，60帧/秒） 自动调用函数，既保证了动画流畅， 又能在后台标签页自动暂停，节省性能（上面的两个仍然执行但是会降频）。

### 虚拟滚动（比如 vue-virtual-scroller）来优化长列表 ###

想象一下，如果有 10000 条数据需要展示，如果用最常规的方法，比如 Vue 中的 `v-for` 会发生什么？

```html
<ul>
  <li v-for="friend in friendsList" :key="friend.id">
    {{ friend.name }}
  </li>
</ul>
```

浏览器会一次性地、真实地创建 10000 个 `<li>` 元素并把它们全部渲染到 DOM (文档对象模型) 中。这会带来一系列严重的性能问题：

- **DOM 元素过多**：浏览器需要管理海量的 DOM 节点，这会消耗大量内存。
- **渲染时间过长**：首次渲染页面时，需要创建和绘制所有 10,000 个元素，导致页面长时间白屏，用户体验极差。
- **滚动卡顿**：当用户滚动这个长列表时，浏览器需要计算成千上万个元素的位置和样式，这会占用大量 CPU，导致滚动动画掉帧，感觉非常卡顿。

**核心问题**：用户的屏幕（视口）一次只能看到大约 10-20 个列表项，但却渲染了 10,000 个，造成了巨大的性能浪费。

那么这种情况就非常适合*虚拟列表*了！

虚拟列表是一种 *性能优化技术*，用于渲染超长列表。只渲染可视区域内的元素，以及上下预留的一小部分，其他看不见的元素不会渲染，随着用户的滚动，旧的 DOM 被复用，新进入的视野才会生成，这样无论数据有上千条还是上万条，页面上始终基友十几个 DOM 节点，大幅度降低内存和渲染压力。

推荐几个基于框架的开源实现：

- 基于React的 `react-virtualized`
- 基于Vue 的 `vue-virtual-scroll-list`
- 基于Angular的 `ngx-virtual-scroller`

![](/images/vue-vite-compress-1.jpg){data-zoomable}

```vue
<template>
  <div class="test-container">
    <h1>虚拟滚动测试</h1>
    <p>正在渲染 {{ listData.length }} 条数据</p>

    <RecycleScroller class="scroller" :items="listData" :item-size="60" key-field="id" v-slot="{ item }">
      <!-- 这是一个标准的、不会出错的列表项模板 -->
      <div class="list-item">
        <div class="item-id">ID: {{ item.id }}</div>
        <div class="item-content">
          <h3>{{ item.name }}</h3>
          <p>{{ item.content }}</p>
        </div>
      </div>
    </RecycleScroller>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  // 关键：确保组件是从新安装的包中局部导入的
  import { RecycleScroller } from 'vue-virtual-scroller';

  // 生成测试数据
  const listData = ref(
    Array.from(Array(10000).keys()).map(i => ({
      id: i + 1,
      name: `项目 ${i + 1}`,
      content: `这是第 ${i + 1} 个列表项的详细内容。`
    }))
  );
</script>

<style>
  @import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

  .test-container {
    padding: 20px;
    border: 2px dashed #42b983;
    margin: 20px;
  }

  /* 必须为滚动容器指定一个固定的高度 */
  .scroller {
    height: 500px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  /* 列表项的样式，确保布局不会出错 */
  .list-item {
    height: 60px;
    /* 必须和 :item-size 属性值保持一致 */
    padding: 0 15px;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    /* 垂直居中 */
  }

  .item-id {
    font-weight: bold;
    color: #888;
    margin-right: 15px;
  }

  .item-content {
    text-align: left;
  }

  .item-content h3,
  .item-content p {
    margin: 0;
    padding: 0;
  }
</style>
```
