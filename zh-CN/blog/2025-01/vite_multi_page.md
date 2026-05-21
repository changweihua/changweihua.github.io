---
lastUpdated: true
commentabled: true
recommended: true
title: vite 实现多页面打包，html模板插槽自动引入插件
description: vite 实现多页面打包，html模板插槽自动引入插件
date: 2025-01-07 09:18:00
pageClass: blog-page-class
---

# vite 实现多页面打包，html模板插槽自动引入插件 #

> 前端项目开发中，多页面打包是常见需求，vite 原生支持多页面打包，但需要手动配置，本文介绍如何使用vite 实现多页面打包。
> 静态html并没有相互引用的功能，很多情况下，html界面的页首页脚是相同的。每个页面都引用相同的html代码，太冗余了，也不方便修改。下面基于vite插件，实现html模板插槽自动引入模板文件功能。

## 场景 ##

有时候需要登录页、推广页等独立页面和业务 SPA 页分离的情况。尤其是在登录页中使用我觉得是不错的方案。

它可以直接和带有 vue-router、vuex、pinia 的 SPA 应用解耦，避免在登录页调用了一些 SPA 页面初始化行为。

## 原理 ##

原理上其实也很简单，就是通过 Vite 的多入口、多出口来实现产出多个独立的 HTML 文件。

## 示例 ##

### 创建登录页 ###

用最新的 vue3 脚手架为例，先创建项目

```bash
npm create vue@latest
```

然后在根目录创建 login.html，其实就是复制了一份。不过如果是真实项目中可以把 index.html 中注入的各种 JS 和 CSS 清除掉。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vite App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/login.js"></script>
  </body>
</html>
```

然后在 `/src` 目录下创建登录页的入口文件 login.ts 和具体渲染 login.vue.

```ts
import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import Login from "./Login.vue";

const app = createApp(Login);

// 去掉 pinia、vue-router 等不需要的库

app.use(ElementPlus);

app.mount("#app");
```

一个简单的 .vue 文件

```vue
<template>
  <div>
    <el-input v-model="username" placeholder="请输入账号"></el-input>
    <el-input
      v-model="password"
      type="password"
      placeholder="请输入密码"
    ></el-input>
    <el-button type="primary" @click="login">登录</el-button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const username = ref("");
const password = ref("");

function login() {
  window.location.href = "/"; // 登录进入 SPA 页面
}
</script>

<style scoped></style>
```

以上就实现了一个简单的登录页了，其中登录和登出就靠着 window.location.href 来实现

```ts
function login() {
  window.location.href = "/";
}

function logout() {
  window.location.href = "/login.html";
}
```

另外，其实也可以在进入登录页的时候清空域名下的用户信息、实现真正的前后端登出。

```vue
// login.vue

onMounted(() => {
  apiLogout()
})
```

### Vite 配置 ###

以上就实现了独立登录页功能，但是在执行 `npm run build` 的时候发现打包并没有把 `login.html` 包含进去。

所以需要修改下 vite 的配置。

vite 的配置是基于 rollup 的，所以除了 vite 官网外，也可以参考 rollup 打包相关的配置。

```ts
// vite.config.ts
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, './index.html'), 
        login: resolve(__dirname, './login.html'),
      },
    },
  },
})
```

在加上了 `build.rollupOptions.input` 后再执行 `npm run build` 就可以在 dist 目录下看到 `login.html` 了。

### login.html 路径的隐藏 ###

这个可以让代理服务器的同学加个 Nginx 代理。

```nginx
server
{
    listen 80;
    ...
    

    location /login {
          proxy_pass http://localhost:7001/login.html;
    }
}
```

如此就可以通过 `https://domain.com/login` 来访问登录页啦~

## 解析 ##

### vite.config.ts ###

> 配置多页面入口，与自定义的html模板插件

```ts
import { defineConfig } from 'vite';
import { resolve } from 'path';
import myHtmlTemplatePlugin from './plugins/htmlTemplate';

export default defineConfig({
  plugins: [myHtmlTemplatePlugin()],
  build: {
    rollupOptions: {
      input: {
        index:resolve(__dirname, 'pages/index.html'),
        about:resolve(__dirname, 'pages/about.html')
      },
    },
  },
});
```

### html 模板 ###

> index.html, about.html

**about.html**

```html
<div>about</div>
<script type="module" src="/src/about.ts"></script>
```

**index.html**

```html
<include src="./components/header.html"></include>
<div>index</div>
<include src="./components/footer.html"></include>
<script type="module" src="/src/index.ts"></script>
```

### entry.ts文件 ###

> src/index.ts, src/about.ts

**about.ts**

```ts
import './style.css'
console.log('Hello Vite!','about.ts')
```
**index.ts**

```ts
import './style.css'
console.log('Hello Vite!','index.ts')
```

### 打包 ###

```bash
npm run build
```

### 输出 ###

```js
dist
├── assets
│   ├── 
│─ about.html
│─ index.html
```

## htmlTemplate 插件，处理html插槽 ##

> 在build/dev时处理html模板里的插槽数据，把插槽替换为对应的html文件。

**plugins/htmlTemplate.ts**

```ts
import { Plugin } from 'vite';
import fs from 'fs'
import { dirname, join } from 'path'

function compressHTML(html) {
  // 去除注释
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  // 去除多余空白
  html = html.replace(/\s+/g, " ");
  // 去除标签之间空格
  html = html.replace(/>\s+</g, "><");
  return html.trim();
}

export default function myHtmlTemplatePlugin(): Plugin {
  return {
    name: 'my-html-template-plugin',
    // vite特有钩子，填充html文件插槽
    transformIndexHtml:{
      enforce:'pre',
      async transform(html, ctx) {
        const directory = dirname(ctx.filename);
        html = html.replace(/\<include.*src="(.*)">.*\<\/include\>/gi, (match, p1, offset, string) => {
          const filePath = join(directory, p1);
          let inc_data = fs.readFileSync(filePath, 'utf8');
          return inc_data;
        });
        html = compressHTML(html);
        return { html, tags:[] };
    }}
  };
}
```

## 最后 ##

其实原理并不难，记录下此文主要是提供一种思路。面对一些独立性较强的页面的时候不用拘泥于 SPA 中的路由功能，是可以利用 vite 或者 webpack 做多页应用的。

> 一开始是接入的公司公共 SSO 页，后面要自行开发登录页的情况。也适合用这种多页应用的模式。

