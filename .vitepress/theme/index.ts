// .vitepress/theme/index.ts
import { HeadConfig, SiteConfig, createContentLoader, inBrowser, useData } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h, watchEffect } from "vue";
import { Feed } from 'feed'
import { AntDesignContainer } from "@vitepress-demo-preview/component";
// import "@vitepress-demo-preview/component/dist/style.css";

// import Antd from "ant-design-vue";
// import 'ant-design-vue/dist/antd.variable.min.css';
import 'ant-design-vue/dist/reset.css';

const hostname: string = 'https://changweihua.github.io'

// import 'uno.css'
// import 'virtual:unocss-devtools'

import "vitepress-markdown-timeline/dist/theme/index.css";
import "./styles/timeline.fix.less";

// @ts-ignore
import AnimationTitle from "../components/AnimationTitle.vue";

import "./styles/index.less";
import "./styles/tailwind.css";

import vitepressNprogress from 'vitepress-plugin-nprogress'
import 'vitepress-plugin-nprogress/lib/css/index.css'

import 'animate.css';

import '@iconify/iconify';
import { writeFileSync } from "fs";
import path from "path";

import { SitemapStream } from 'sitemap'
import { createWriteStream } from 'node:fs'
import { resolve } from 'node:path'

// import Layout from './Layout.vue';

export default {
  ...DefaultTheme,
  NotFound: () => 'custom 404', // <- this is a Vue 3 functional component
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // "home-hero-before": () => h(AnimationTitle),
      // "home-hero-after": () => h(AnimationTitle),
      // "home-features-after": () =>
      //   h(AnimationTitle, {
      //     name: "常伟华",
      //     text: "DOTNET Developer",
      //     tagline: "阳光大男孩",
      //   }),
      "home-hero-info": () =>
        h(AnimationTitle, {
          name: "常伟华",
          text: "Designer & Programmer",
          tagline: "伪前端+伪后端+伪需求=真全栈",
        }),
    });
  },
  // enhanceApp(ctx) {
  //   const { app } = ctx;
  //   DefaultTheme.enhanceApp(ctx);
  //   app.use(Antd);
  //   app.component("demo-preview", AntDesignContainer);
  //   // 用于过滤一些组件，不重要
  //   // app.config.compilerOptions.isCustomElement = (tag) => tag.includes("r-");
  // },
  enhanceApp: async (ctx) => {
    // app is the Vue 3 app instance from `createApp()`. router is VitePress'
    // custom router. `siteData`` is a `ref`` of current site-level metadata.
    const { app, router, siteData, isServer } = ctx;
    DefaultTheme.enhanceApp(ctx);
    // app.use(Antd);
    app.component("demo-preview", AntDesignContainer);
    // import("ant-design-vue").then((module) => {
    //   app.use(module);
    // });
    vitepressNprogress(ctx)
  },
  setup() {
    const { lang } = useData();
    watchEffect(() => {
      if (inBrowser) {
        document.cookie = `nf_lang=${lang.value}; expires=Mon, 1 Jan 2024 00:00:00 UTC; path=/`;
      }
    });
  },
  transformHead: ({ pageData }) => {
    const head: HeadConfig[] = []
    head.push(['meta', { property: 'og:title', content: pageData.frontmatter.title }])
    head.push(['meta', { property: 'og:description', content: pageData.frontmatter.description }])

    return head
  },
  lastUpdated: true,
  // buildEnd: async (config: SiteConfig) => {
  //   const feed = new Feed({
  //     title: 'Paul Laros',
  //     description: 'My personal blog',
  //     id: hostname,
  //     link: hostname,
  //     language: 'en',
  //     image: 'https://laros.io/images/paul-laros.jpg',
  //     favicon: `${hostname}/favicon.ico`,
  //     copyright:
  //       'Copyright (c) 2023-present, Paul Laros'
  //   })

  //   // You might need to adjust this if your Markdown files
  //   // are located in a subfolder
  //   const posts = await createContentLoader('../../blog/*.md', {
  //     excerpt: true,
  //     render: true
  //   }).load()

  //   posts.sort(
  //     (a, b) =>
  //       +new Date(b.frontmatter.date as string) -
  //       +new Date(a.frontmatter.date as string)
  //   )

  //   for (const { url, excerpt, frontmatter, html } of posts) {
  //     feed.addItem({
  //       title: frontmatter.title,
  //       id: `${hostname}${url}`,
  //       link: `${hostname}${url}`,
  //       description: excerpt,
  //       content: html,
  //       author: [
  //         {
  //           name: 'Paul Laros',
  //           email: 'hey@laros.io',
  //           link: 'https://laros.io/authors/paul'
  //         }
  //       ],
  //       date: frontmatter.date
  //     })
  //   }

  //   writeFileSync(path.join(config.outDir, 'feed.rss'), feed.rss2())

  //   const { outDir } = config

  //   const sitemap = new SitemapStream({ hostname: 'https://laros.io/' })
  //   const pages = await createContentLoader('../../blog/*.md').load()
  //   const writeStream = createWriteStream(resolve(outDir, 'sitemap.xml'))

  //   sitemap.pipe(writeStream)
  //   pages.forEach((page) => sitemap.write(
  //     page.url
  //       // Strip `index.html` from URL
  //       .replace(/index.html$/g, '')
  //       // Optional: if Markdown files are located in a subfolder
  //       .replace(/^\/docs/, '')
  //     ))
  //   sitemap.end()

  //   await new Promise((r) => writeStream.on('finish', r))
  // }
};
