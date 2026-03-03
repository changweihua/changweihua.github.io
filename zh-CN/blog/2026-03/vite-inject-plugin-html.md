---
lastUpdated: true
commentabled: true
recommended: true
title: vite-plugin-html 插件详解
description: vite-plugin-html 插件详解
date: 2026-03-03 08:45:00 
pageClass: blog-page-class
cover: /covers/vite.svg
---

> Vite 是现代 Web 开发工具链中备受推崇的构建工具，以其快速的开发服务器和轻量的打包方案闻名。Vite 的核心理念是基于原生 ES 模块的开发服务器，并通过 Rollup 进行生产构建。在实际开发中，开发者经常需要处理 HTML 文件的注入和修改工作，这时 `vite-plugin-html` 插件便提供了非常便捷的解决方案。本文将详细介绍 Vite 中的 `vite-plugin-html` 插件，并展示其在实际开发中的应用场景。

## 一、`vite-plugin-html` 插件概述 ##

### 插件介绍 ###

`vite-plugin-html` 是一个专门为 Vite 项目设计的插件，旨在提供对 HTML 文件的灵活控制。通过该插件，开发者可以在 HTML 模板中插入动态数据、自定义 meta 标签，甚至可以根据不同环境进行 HTML 的定制。它使得 Vite 项目中的 HTML 文件处理更加灵活和可定制化，极大地提升了开发效率。

### 核心功能 ###

vite-plugin-html 插件主要提供以下功能：

- 动态注入变量：通过将数据注入到 HTML 文件中，开发者可以灵活地控制页面的标题、描述、关键字等元数据。
- 环境特定内容：支持根据不同的构建环境动态注入不同的内容，例如在开发和生产环境中插入不同的 meta 信息或脚本。
- 模板解析：该插件支持基于 EJS 等模板引擎对 HTML 文件进行解析，从而在 HTML 中使用条件逻辑和循环。

## 二、vite-plugin-html 的基本用法 ##

在 Vite 项目中使用 vite-plugin-html 插件非常简单，首先需要进行插件的安装：

```sh
npm install vite-plugin-html --save-dev // [!=npm auto]
```

接着在 `vite.config.ts` 配置文件中引入并使用该插件：

```ts:vite.config.ts
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  plugins: [
    createHtmlPlugin({
      inject: {
        data: {
          title: '我的Vite项目',
        },
      },
    }),
  ],
});
```

在这个示例中，`vite-plugin-html` 插件被配置为将一个名为 title 的数据注入到 HTML 文件中，之后我们可以在 HTML 模板中使用它。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= title %></title>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

上面的 HTML 模板通过 EJS 语法插入了动态变量 title，最终生成的 HTML 文件将根据插件的配置来设置页面的标题为 “我的Vite项目”。

## 三、动态注入和模板解析 ##

### 动态注入数据 ###

`vite-plugin-html` 的一大优势在于它可以轻松实现数据的动态注入，这对于需要在不同环境或构建阶段插入不同信息的场景尤为适用。以下是一个更复杂的示例，展示如何注入多个数据字段：

```ts
createHtmlPlugin({
  inject: {
    data: {
      title: '我的Vite项目',
      description: '这是一个使用Vite构建的现代Web应用程序',
      keywords: 'Vite, JavaScript, Web开发',
    },
  },
});
```

在 HTML 模板中，可以通过以下方式使用这些注入的数据：

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><%= title %></title>
  <meta name="description" content="<%= description %>" />
  <meta name="keywords" content="<%= keywords %>" />
</head>
```

### 环境特定注入 ###

另一个常见的需求是根据开发环境动态注入不同的内容。vite-plugin-html 支持根据 Vite 的环境变量 进行条件注入。以下是一个根据环境注入不同 Google Analytics 脚本的示例：

```ts
createHtmlPlugin({
  inject: {
    data: {
      isProd: process.env.NODE_ENV === 'production',
    },
  },
});
```

在 HTML 文件中，可以这样使用该变量：

```html
<% if (isProd) { %>
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-XXXXX-Y"></script>
<% } %>
```

当项目在生产环境中构建时，Google Analytics 脚本将自动插入到 HTML 中，而在开发环境中则不会被插入。

## 四、vite-plugin-html 的高级用法 ##

### 自定义模板引擎 ###

虽然 vite-plugin-html 默认支持 EJS 模板引擎，但你也可以使用其他模板引擎进行自定义处理。例如，可以选择 Mustache 或 Handlebars 作为模板解析工具。以下示例展示了如何使用 Mustache：

```sh
npm install mustache --save-dev // [!=npm auto]
```

然后在 `vite.config.ts` 中引入 Mustache：

```ts:vite.config.ts
import mustache from 'mustache';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  plugins: [
    createHtmlPlugin({
      inject: {
        data: {
          title: '我的Vite项目',
        },
      },
      template: {
        injectOptions: {
          engine: mustache.render,
        },
      },
    }),
  ],
});
```

在 HTML 中，你可以像使用 EJS 一样使用 Mustache 语法：

```html
<title>{{ title }}</title>
```

### 多页面应用支持 ###

对于多页面应用（MPA）开发者，vite-plugin-html 也提供了非常便捷的支持。你可以为不同的页面提供不同的模板和注入数据。例如：

```ts
createHtmlPlugin({
  pages: {
    index: {
      entry: '/src/main.js',
      template: '/public/index.html',
      inject: {
        data: {
          title: '首页',
        },
      },
    },
    about: {
      entry: '/src/about.js',
      template: '/public/about.html',
      inject: {
        data: {
          title: '关于我们',
        },
      },
    },
  },
});
```

在该示例中，我们为 `index` 和 `about` 页面分别配置了不同的 HTML 模板和注入内容。

## 五、实际应用场景 ##

### 动态 SEO 标签的注入 ###

在一些需要针对不同页面设置不同 SEO 元数据的项目中，`vite-plugin-html` 可以通过动态注入 meta 标签来帮助提升页面的搜索引擎 友好性。例如：

```ts
createHtmlPlugin({
  inject: {
    data: {
      title: '关于我们',
      description: '这是关于我们页面的描述',
    },
  },
});
```

这种方式在优化单页应用（SPA）或多页面应用（MPA）时，能够针对不同的页面设置特定的 SEO 内容，从而提升网站在搜索引擎中的排名。

### 插入外部脚本或样式表 ###

有时你需要在构建的 HTML 中插入外部的脚本或样式表，而不希望在每个 HTML 文件中手动添加。通过 vite-plugin-html，可以轻松地在构建过程中自动注入这些资源：

```ts
inject: {
  data: {
    externalCss: 'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css',
  },
}
```

然后在 HTML 中使用：

```html
<link rel="stylesheet" href="<%= externalCss %>">
```

## 六、总结 ##

vite-plugin-html 插件为 Vite 项目提供了强大的 HTML 文件定制功能，使得开发者能够轻松处理模板、注入动态数据和环境特定内容。通过合理利用该插件，开发者可以提升开发效率，创建更加灵活的 项目结构。在实际项目中，vite-plugin-html 可以帮助你更好地管理 HTML 文件，并确保它们在不同的开发阶段或环境中始终保持一致。希望本文对你理解和使用该插件有所帮助。

## vite-plugin-simple-html ##

Vite plugin for HTML processing and minification. "Lite" version of `vite-plugin-html`, supporting a subset of its features.

### 安装步骤 ###

- Install by executing `npm install vite-plugin-simple-html` or `yarn add vite-plugin-simple-html`.
Import by adding `import simpleHtmlPlugin from 'vite-plugin-simple-html'`.
Use it by adding `simpleHtmlPlugin()` to plugins section of your Vite config.

### Usage ###

Here's an example of basic configuration:

```ts
import { defineConfig } from 'vite';
import simpleHtmlPlugin from 'vite-plugin-simple-html';

export default defineConfig({
  plugins: [
    simpleHtmlPlugin({
      inject: {
        data: {
          title: 'My app',
          script: '<script src="index.js"></script>',
        },
        tags: [
          {
            tag: 'meta',
            attrs: {
              name: 'description',
              content: 'My awesome app',
            },
          },
        ],
      },
      minify: true,
    }),
  ],
});
```

## User guide ##

### Minification ###

Minification is handled by `@swc/html`.

To minify your HTML files, set `minify` to true:

```ts
import { defineConfig } from 'vite';
import simpleHtmlPlugin from 'vite-plugin-simple-html';

export default defineConfig({
  plugins: [
    simpleHtmlPlugin({
      minify: true,
    }),
  ],
});
```

The default configuration in this case is:

```ts
{
  collapseWhitespaces: 'all',
  minifyCss: true,
  minifyJs: false,
  minifyJson: true,
  quotes: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeRedundantAttributes: 'all',
  tagOmission: false,
}
```

You can access that configuration by importing defaultMinifyOptions from the plugin:

```ts
import { defaultMinifyOptions } from 'vite-plugin-simple-html';
```

> [!NOTE] The default configuration is designed for compatibility with vite-plugin-html. For more aggressive minification, consider adjusting the settings to better suit your needs.

If you want to customize the minification process, for example to minify JS, you can pass your own configuration object:

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    simpleHtmlPlugin({
      minify: {
        minifyJs: true,
      },
    }),
  ],
});
```

For a full list of available options, refer to `@swc/html` documentation.

### EJS variables support ###

You can inject variables into your HTML files using EJS syntax.

```ts
import { defineConfig } from 'vite';
import simpleHtmlPlugin from 'vite-plugin-simple-html';

export default defineConfig({
  plugins: [
    simpleHtmlPlugin({
      inject: {
        data: {
          title: 'My app',
        },
      },
    }),
  ],
});
```

```html
<!doctype html>
<html lang="en">
  <head>
    <title><%= title %></title>
  </head>
  <body>
    <h1><%= title %></h1>
  </body>
</html>
```

### Tag injection ###

You can inject tags into your HTML files.

```ts
import { defineConfig } from 'vite';
import simpleHtmlPlugin from 'vite-plugin-simple-html';

export default defineConfig({
  plugins: [
    simpleHtmlPlugin({
      inject: {
        tags: [
          {
            tag: 'meta',
            attrs: {
              name: 'description',
              content: 'My awesome app',
            },
          },
        ],
      },
    }),
  ],
});
```

By default, they are injected at the end of the `<head>` section of your HTML file. You can change that behavior by setting injectTo:

- head: Injects tags at the end of the `<head>` section of your HTML file (default).
- head-prepend: Injects tags at the beginning of the `<head>` section of your HTML file.
- body: Injects tags at the end of the `<body>` section of your HTML file.
- body-prepend: Injects tags at the beginning of the `<body>` section of your HTML file.

## Detailed comparison with vite-plugin-html ##

|  Feature  | vite-plugin-simple-html | vite-plugin-html |
|  :------------: | :-----------: | :-----------: |
|  EJS support  |  ⚠️ Variables only |  ✅ |
|  HTML tags injection  | ✅  |  ✅ |
|  HTML/CSS/JS minification  |  ✅ |  ❌ |
|  JSON minification  |  ✅ |  ❌ |
|  entry script injection  |  ❌ |  ✅ |
|  template customization  |  ❌ |  ✅ |
|  multi-page support  |  ❌ |  ✅ |

### Why bother? ###

- vite-plugin-simple-html has considerably fewer dependencies. Compare:

  - vite-plugin-html dependency graph
  - vite-plugin-simple-html dependency graph

- vite-plugin-simple-html does not suffer from issue that breaks Vite proxy (which was the reason I created this plugin in the first place).

- vite-plugin-simple-html does not use options deprecated in Vite 5, and thus does not produce deprecation warnings:

```txt
WARN  plugin 'vite:html' uses deprecated 'enforce' option. Use 'order' option instead.

WARN  plugin 'vite:html' uses deprecated 'transform' option. Use 'handler' option instead.
```
