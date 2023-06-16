// .vitepress/theme/index.ts
import { inBrowser, useData } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h, watchEffect } from "vue";

import "./index.css";

import { AntDesignContainer } from "@vitepress-demo-preview/component";
import "@vitepress-demo-preview/component/dist/style.css";

import Antd from "ant-design-vue";

import AnimationTitle from "../components/AnimationTitle.vue";

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
          tagline: "阳光大男孩 666",
        }),
    });
  },
  enhanceApp(ctx) {
    const { app } = ctx;
    DefaultTheme.enhanceApp(ctx);
    app.use(Antd);
    app.component("demo-preview", AntDesignContainer);
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
