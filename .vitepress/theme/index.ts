// .vitepress/theme/index.ts
import { inBrowser, useData } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h, watchEffect } from "vue";

import { AntDesignContainer } from "@vitepress-demo-preview/component";
import "@vitepress-demo-preview/component/dist/style.css";

import Antd from "ant-design-vue";
import 'ant-design-vue/dist/antd.css';
import AnimationTitle from "../components/AnimationTitle.vue";

import "./styles/index.less";

export default {
  ...DefaultTheme,
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
          text: "DOTNET Developer",
          tagline: "Sometimes it occurred, sometimes all world in peace !",
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
    app.use(Antd);
    app.component("demo-preview", AntDesignContainer);
    import("ant-design-vue").then((module) => {
      app.use(module);
    });
  },
  setup() {
    const { lang } = useData();
    watchEffect(() => {
      if (inBrowser) {
        document.cookie = `nf_lang=${lang.value}; expires=Mon, 1 Jan 2024 00:00:00 UTC; path=/`;
      }
    });
  },
};
