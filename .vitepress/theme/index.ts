// .vitepress/theme/index.ts
import { HeadConfig, PageData, inBrowser, useData, useRoute } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h, nextTick, onMounted, watch, watchEffect } from "vue";
import {
  Tag,
  Button,
  Empty,
  Progress,
  Radio,
  Spin,
  Space,
  Tabs,
  RangePicker,
  DatePicker
} from "ant-design-vue";
import { AntDesignContainer } from "@vitepress-demo-preview/component";

import DocAfter from "../components/DocAfter.vue";
import recommend from "../components/Recommend.vue";
import copyright from "../components/CopyRight.vue";
import HeaderProfile from "../components/HeaderProfile.vue";
import LottiePanel from "../components/LottiePanel.vue";

import { VuePreview } from "vite-plugin-vue-preview";
import "vite-plugin-vue-preview/style.css";

// import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'

import { Sandbox } from "vitepress-plugin-sandpack";

// @ts-ignore
import AnimationTitle from "../components/AnimationTitle.vue";

import "./styles/index.less";

import vitepressNprogress from "vitepress-plugin-nprogress";
import "vitepress-plugin-nprogress/lib/css/index.css";
import vitepressLifeProgress from "vitepress-plugin-life-progress";
import "vitepress-plugin-life-progress/lib/css/index.css";
import "animate.css";

import "@iconify/iconify";
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css';

const links: { url: string; lastmod: PageData["lastUpdated"] }[] = [];

import NotFound from "../components/NotFound.vue";
import CodeGroup from "../components/CodeGroup.vue";
import ArticleMetadata from "../components/ArticleMetadata.vue";
import Contributors from "../components/Contributors.vue";
import HomeContributors from "../components/HomeContributors.vue";
import ShamingLogo from "../components/ShamingLogo.vue";
import PageFooter from "../components/PageFooter.vue";
import HoverGrid from "../components/HoverGrid.vue"

import { Icon } from "@iconify/vue";
import mediumZoom from "medium-zoom";
import "uno.css";
import VueResizeObserver from "vue-resize-observer";

import "vitepress-markdown-timeline/dist/theme/index.css";
import "./styles/timeline.fix.less";

import vitepressBackToTop from "vitepress-plugin-back-to-top";
import "vitepress-plugin-back-to-top/dist/style.css";

import { defaultVTheme } from '../hooks/useVChart';
import VChart from '@visactor/vchart';
import { allThemeMap } from '@visactor/vchart-theme';

// register themes
allThemeMap.forEach((theme, name) => {
  console.log('theme', name)
  theme.fontFamily = defaultVTheme.fontFamily
  theme.backround = defaultVTheme.background
  VChart.ThemeManager.registerTheme(name, theme);
});

// apply a theme
VChart.ThemeManager.setCurrentTheme('legacyLight');


export default {
  ...DefaultTheme,
  NotFound: NotFound, // <- this is a Vue 3 functional component
  Layout() {

    const props: Record<string, any> = {}
    // 获取 frontmatter
    const { frontmatter } = useData()

    /* 添加自定义 class */
    if (frontmatter.value?.layoutClass) {
      props.class = frontmatter.value.layoutClass
    }

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
          name: "CMONO.NET",
          text: "知识汪洋只此一瓢",
          tagline: "伪前端+伪后端+伪需求=真全栈",
        }),
      // "home-hero-image": () => h(Suspense, ShamingLogo),
      "home-hero-image": () => h(ShamingLogo),
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
      "doc-bottom": () => h(recommend),
      // "doc-footer-before": () =>
      //   h(PlaceHolder, {
      //     name: "doc-footer-before",
      //   }),
      // "doc-before": () =>
      //   h(PlaceHolder, {
      //     name: "doc-before",
      //   }),
      "doc-after": () => h(DocAfter),
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
      "layout-bottom": () => h(PageFooter),
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
  enhanceApp: async (ctx) => {
    // app is the Vue 3 app instance from `createApp()`. router is VitePress'
    // custom router. `siteData`` is a `ref`` of current site-level metadata.
    const { app, router, siteData, isServer } = ctx;
    DefaultTheme.enhanceApp(ctx);

    if (inBrowser) {
      vitepressNprogress(ctx);
      vitepressBackToTop({
        // default
        threshold: 300,
      });
      // enhanceAppWithTabs(app);
      // app.use(useResize);
      // registerAnalytics(siteIds)
      // window.addEventListener('hashchange', () => {
      //   const { href: url } = window.location
      //   trackPageview(siteIds, url)
      // })
      // router.onAfterRouteChanged = (to) => {
      //   trackPageview(siteIds, to)
      // }

      app
        .use(Space)
        .use(Tag)
        .use(Button)
        .use(Progress)
        .use(Empty)
        .use(Spin)
        .use(Tabs)
        .use(Radio)
        .use(RangePicker)
        .use(DatePicker);
    }

    app.component("demo-preview", AntDesignContainer);
    app.component("my-icon", Icon);

    app.component("VuePreview", VuePreview);
    app.component("header-profile", HeaderProfile);
    app.component("lottie-panel", LottiePanel);
    app.component("code-group", CodeGroup);
    app.component("Sandbox", Sandbox);
    app.component("ArticleMetadata", ArticleMetadata);
    app.component("Contributors", Contributors);
    app.component("HomeContributors", HomeContributors);
    app.component("CopyRight", copyright);
    app.component("HoverGrid", HoverGrid);

    app.use(VueResizeObserver);
    app.use(FloatingVue);
  },
  setup() {
    const { lang } = useData();
    watchEffect(() => {
      if (inBrowser) {
        document.cookie = `nf_lang=${lang.value}; expires=Mon, 1 Jan 2024 00:00:00 UTC; path=/`;
      }
    });
    const route = useRoute();
    const initZoom = () => {
      mediumZoom("[data-zoomable]", { background: "var(--clr)" }); // Should there be a new?
      // new mediumZoom('.main img', { background: 'var(--vp-c-bg)' });
    };
    onMounted(() => {
      initZoom();
      // ConsoleBan.init({
      //   // Redirect to /404 relative url
      //   redirect: '/404',
      //   // Redirect to absolute url
      //   // redirect: 'http://domain.com/path'
      // })
    });
    watch(
      () => route.path,
      () => nextTick(() => initZoom())
    );
    vitepressLifeProgress();
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
  /* 站点地图 */
  transformHtml: (_, id, { pageData }) => {
    if (!/[\\/]404\.html$/.test(id))
      links.push({
        url: pageData.relativePath.replace(/((^|\/)index)?\.md$/, "$2"),
        lastmod: pageData.lastUpdated,
      });
  },
};
