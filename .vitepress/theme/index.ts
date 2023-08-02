// .vitepress/theme/index.ts
import {
  HeadConfig,
  SiteConfig,
  createContentLoader,
  inBrowser,
  useData,
} from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h, watchEffect } from "vue";
import { Feed } from "feed";
import { AntDesignContainer } from "@vitepress-demo-preview/component";
// import "@vitepress-demo-preview/component/dist/style.css";

// import Antd from "ant-design-vue";
// import 'ant-design-vue/dist/antd.variable.min.css';
import "ant-design-vue/dist/reset.css";

import comment from "../components/Comment.vue";
import copyright from "../components/CopyRight.vue";
import HeaderProfile from "../components/HeaderProfile.vue";
import LottiePanel from "../components/LottiePanel.vue";

const hostname: string = "https://changweihua.github.io";

// import 'uno.css'
// import 'virtual:unocss-devtools'

import "vitepress-markdown-timeline/dist/theme/index.css";
import "./styles/timeline.fix.less";

// @ts-ignore
import AnimationTitle from "../components/AnimationTitle.vue";

import "./styles/index.less";
import "./styles/tailwind.css";

import vitepressNprogress from "vitepress-plugin-nprogress";
import "vitepress-plugin-nprogress/lib/css/index.css";

import "animate.css";

import "@iconify/iconify";
import { writeFileSync } from "fs";
import path from "path";

import { SitemapStream } from "sitemap";
import { createWriteStream } from "node:fs";
import { resolve } from "node:path";
import { createRssFile } from "../utils/rss";

// import Layout from './Layout.vue';

import { useCodeGroups } from "./composables/codeGroups";

import NotFound from "../components/NotFound.vue";
import CodeGroup from "../components/CodeGroup.vue";
import PlaceHolder from "../components/PlaceHolder.vue";

export default {
  ...DefaultTheme,
  // NotFound: () => 'custom 404',
  NotFound: NotFound, // <- this is a Vue 3 functional component
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
      // layout: 'home'
      // // "home-hero-before": () =>
      // //   h(PlaceHolder, {
      // //     name: "home-hero-before",
      // //   }),
      "home-hero-info": () =>
        h(AnimationTitle, {
          name: "常伟华",
          text: "Designer & Programmer",
          tagline: "伪前端+伪后端+伪需求=真全栈",
        }),
      // "home-hero-image": () =>
      //   h(PlaceHolder, {
      //     name: "home-hero-image",
      //   }),
      // "home-hero-after": () =>
      //   h(PlaceHolder, {
      //     name: "home-hero-after",
      //   }),
      // "home-features-before": () =>
      //   h(PlaceHolder, {
      //     name: "home-features-before",
      //   }),
      // "home-features-after": () =>
      //   h(PlaceHolder, {
      //     name: "home-features-after",
      //   }),
      // https://vitepress.dev/guide/extending-default-theme#layout-slots

      // layout: 'doc'
      // "doc-top": () =>
      //   h(PlaceHolder, {
      //     name: "doc-top",
      //   }),
      // "doc-bottom": () =>
      //   h(PlaceHolder, {
      //     name: "doc-bottom",
      //   }),
      // "doc-footer-before": () =>
      //   h(PlaceHolder, {
      //     name: "doc-footer-before",
      //   }),
      // "doc-before": () =>
      //   h(PlaceHolder, {
      //     name: "doc-before",
      //   }),
      "doc-after": () =>
        h(comment),
      // "sidebar-nav-before": () =>
      //   h(PlaceHolder, {
      //     name: "sidebar-nav-before",
      //   }),
      // "sidebar-nav-after": () =>
      //   h(PlaceHolder, {
      //     name: "sidebar-nav-after",
      //   }),
      // "aside-top": () =>
      //   h(PlaceHolder, {
      //     name: "aside-top",
      //   }),
      // "aside-bottom": () =>
      //   h(PlaceHolder, {
      //     name: "aside-bottom",
      //   }),
      // "aside-outline-before": () =>
      //   h(PlaceHolder, {
      //     name: "aside-outline-before",
      //   }),
      // "aside-outline-after": () =>
      //   h(PlaceHolder, {
      //     name: "aside-outline-after",
      //   }),
      // "aside-ads-before": () =>
      //   h(PlaceHolder, {
      //     name: "aside-ads-before",
      //   }),
      // "aside-ads-after": () =>
      //   h(PlaceHolder, {
      //     name: "aside-ads-after",
      //   }),

      // layout: 'page'
      // "page-top": () =>
      //   h(PlaceHolder, {
      //     name: "page-top",
      //   }),
      // "page-bottom": () =>
      //   h(PlaceHolder, {
      //     name: "page-bottom",
      //   }),

      "not-found": () => h(NotFound),

      //  Always
      // "layout-top": () =>
      //   h(PlaceHolder, {
      //     name: "layout-top",
      //   }),
      // "layout-bottom": () =>
      //   h(PlaceHolder, {
      //     name: "layout-bottom",
      //   }),
      // "nav-bar-title-before": () =>
      //   h(PlaceHolder, {
      //     name: "nav-bar-title-before",
      //   }),
      // "nav-bar-title-after": () =>
      //   h(PlaceHolder, {
      //     name: "nav-bar-title-after",
      //   }),
      // "nav-bar-content-before": () =>
      //   h(PlaceHolder, {
      //     name: "nav-bar-content-before",
      //   }),
      // "nav-bar-content-after": () =>
      //   h(PlaceHolder, {
      //     name: "nav-bar-content-after",
      //   }),
      // "nav-screen-content-before": () =>
      //   h(PlaceHolder, {
      //     name: "nav-screen-content-before",
      //   }),
      // "nav-screen-content-after": () =>
      //   h(PlaceHolder, {
      //     name: "nav-screen-content-after",
      //   }),
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
    app.component("header-profile", HeaderProfile);
    app.component("lottie-panel", LottiePanel);
    app.component("code-group", CodeGroup);

    // import("ant-design-vue").then((module) => {
    //   app.use(module);
    // });
    vitepressNprogress(ctx);

    useCodeGroups();
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
    const head: HeadConfig[] = [];
    head.push([
      "meta",
      { property: "og:title", content: pageData.frontmatter.title },
    ]);
    head.push([
      "meta",
      { property: "og:description", content: pageData.frontmatter.description },
    ]);

    return head;
  },
  lastUpdated: true,
  // buildEnd: createRssFile,
  // buildEnd: async (config: SiteConfig) => {
  //   const feed = new Feed({
  //     title: '常伟华',
  //     description: '伪前端+伪后端+伪需求=真全栈',
  //     id: hostname,
  //     link: hostname,
  //     language: 'en',
  //     image: '${hostname}.jpg',
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
  //           name: '常伟华',
  //           email: 'changweihua@outlook.com',
  //           link: 'https://changweihua.github.io'
  //         }
  //       ],
  //       date: frontmatter.date
  //     })
  //   }

  //   writeFileSync(path.join(config.outDir, 'feed.rss'), feed.rss2())

  //   const { outDir } = config

  //   const sitemap = new SitemapStream({ hostname: hostname})
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
