// .vitepress/theme/index.ts
import { inBrowser, useData, useRoute } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h, Suspense, watchEffect, watch, ref } from "vue";
import DocAfter from "@vp/components/DocAfter.vue";
import { UAParser } from "ua-parser-js";
import Recommend from "../components/Recommend.vue";
import CopyRight from "../components/CopyRight.vue";
import HeaderProfile from "../components/HeaderProfile.vue";
import LottiePanel from "../components/LottiePanel.vue";
import ColorfulWord from "../components/ColorfulWord.vue";
import DacingNumber from "../components/DacingNumber.vue";
import DancingLogo from "../components/DancingLogo.vue";
import HeroImage from "#.vitepress/components/HeroImage.vue";
import AnimatedLogo from "#.vitepress/components/AnimatedLogo.vue";
import Vue3Autocounter from "vue3-autocounter";
import ThreeLogo from "#.vitepress/components/ThreeLogo.vue";
import CubicLoading from "#.vitepress/components/CubicLoading.vue";

import codeblocksFold from "vitepress-plugin-codeblocks-fold"; // import method
import "vitepress-plugin-codeblocks-fold/style/index.css"; // import style

import AnimationTitle from "../components/AnimationTitle.vue";

import DemoPreview, { useComponents } from "@vitepress-code-preview/container";
import "@vitepress-code-preview/container/dist/style.css";
import VueResizeObserver from "vue-resize-observer";
import yuppie from "yuppie-ui";

import { pinyin } from "pinyin-pro";

pinyin("常伟华");

import directives from "../directives";

// // import('pinyin-pro').then((exports) => {
// //   exports.pinyin('汉语拼音'); // 'hàn yǔ pīn yīn'
// // });

// // 引入前需要先通过 `npm install @pinyin-pro/data` 进行安装
// import CompleteDict from '@pinyin-pro/data/complete';
// import { pinyin, addDict } from 'pinyin-pro';

// addDict(CompleteDict);

// const result = pinyin('小明硕士毕业于中国科学院计算所，后在日本京都大学深造');
// console.log(result)
// 结果: 结果: xiǎo míng shuò shì bì yè yú zhōng guó kē xué yuàn jì suàn suǒ ， hòu zài rì běn jīng dū dà xué shēn zào

// import { VuePreview } from 'vite-plugin-vue-preview'
// import 'vite-plugin-vue-preview/style.css'

// // getColor 单个颜色
// // getPalette 多个颜色
// ColorThief.getColor(ImageRef).then(res=>{
//   console.log(res)
// })

import vitepressNprogress from "vitepress-plugin-nprogress";
import "vitepress-plugin-nprogress/lib/css/index.css";

import busuanzi from "busuanzi.pure.js";

// 引入 Ant Design Vue
import Antd from "ant-design-vue";

import "./styles/index.less";

import NotFound from "../components/NotFound.vue";
import CodeGroup from "../components/CodeGroup.vue";
import ArticleMetadata from "../components/ArticleMetadata.vue";
import Contributors from "../components/Contributors.vue";
import HomeContributors from "../components/HomeContributors.vue";
import PageFooter from "../components/PageFooter.vue";
import HoverGrid from "../components/HoverGrid.vue";
import MagicCard from "../components/MagicCard.vue";
import StyledMermaid from "../components/StyledMermaid.vue";
import MarkupView from "../components/MarkupView.vue";
import Confetti from "../components/Confetti.vue";
import "markmap-toolbar/dist/style.css";

import { Icon } from "@iconify/vue";

import "vitepress-markdown-timeline/dist/theme/index.css";
import "./styles/timeline.fix.less";

import "vitepress-markdown-it-stepper/theme";

import { Tab, Tabs } from "vue3-tabs-component";
import "@red-asuka/vitepress-plugin-tabs/dist/style.css";

import "virtual:group-icons.css";
import "uno.css";
import "animate.css";

import vitepressBackToTop from "vitepress-plugin-back-to-top";
import "vitepress-plugin-back-to-top/dist/style.css";

import type { Theme } from "vitepress";

import { defaultVTheme } from "../hooks/useVChart";
import VChart from "@visactor/vchart";
import { allThemeMap } from "@visactor/vchart-theme";
import AnimatingLayout from "./AnimatingLayout.vue";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("Asia/Shanghai");
dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

// register themes
allThemeMap.forEach((theme, name) => {
  theme.fontFamily = defaultVTheme.fontFamily;
  theme.background = defaultVTheme.background;
  VChart.ThemeManager.registerTheme(name, theme);
});

// apply a theme
VChart.ThemeManager.setCurrentTheme("legacyLight");

export default {
  ...DefaultTheme,
  NotFound: NotFound, // <- this is a Vue 3 functional component
  // extends: DefaultTheme,
  // 使用注入插槽的包装组件覆盖 Layout
  // Layout: MyLayout,
  Layout() {
    const props: Record<string, any> = {};
    // 获取 frontmatter
    const { frontmatter } = useData();

    /* 添加自定义 class */
    if (frontmatter.value?.layoutClass) {
      props.class = frontmatter.value.layoutClass;
    }

    const route = useRoute();
    const isTransitioning = ref(false);

    watch(
      () => route.path,
      () => {
        console.log("页面动画");
      }
    );

    return h(AnimatingLayout, null, {
      // "home-hero-before": () => h(AnimationTitle),
      // "home-hero-after": () => h(AnimationTitle),
      // "home-features-after": () =>
      //   h(AnimationTitle, {
      //     name: "常伟华",
      //     text: "DOTNET Developer",
      //     tagline: "阳光大男孩",
      //   }),
      // layout: 'home'
      "home-hero-info": () =>
        h(AnimationTitle, {
          name: "CMONO.NET",
          text: "知识汪洋只此一瓢",
          tagline: "伪前端+伪后端+伪需求=真全栈",
        }),
      // "home-hero-image": () => h(Suspense, ThreeLogo),
      // "home-hero-image": () => h(ThreeLogo),
      // "home-hero-image": () => h('div', {
      //   class: "w-full h-full flex items-center justify-center",
      //   style: "position: relative;"
      // }, [
      //   h('img', {
      //     src: '/cwh.svg',
      //     class: 'VPImage image-src',
      //   })
      // ]),
      "home-hero-image": () =>
        h(
          "div",
          {
            class: "w-full h-full flex items-center justify-center",
            style: "position: relative;",
          },
          [
            h(HeroImage),
            // h(ColorfulWord),
            // h('div', [
            //   h(AnimatedLogo),
            // ])
            h("img", {
              src: "/cwh.svg",
              class: "VPImage image-src",
            }),
          ]
        ),
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
      "doc-bottom": () => h(Recommend),
      // "doc-footer-before": () => h(Changelog),
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

      // // 为较宽的屏幕的导航栏添加阅读增强菜单
      // 'nav-bar-content-after': () => h(NolebaseEnhancedReadabilitiesMenu),
      // // 为较窄的屏幕（通常是小于 iPad Mini）添加阅读增强菜单
      // 'nav-screen-content-after': () => h(NolebaseEnhancedReadabilitiesScreenMenu),

      // 'layout-top': () => [
      //   h(NolebaseHighlightTargetedHeading),
      // ],

      // 'nav-bar-content-after': () => h(OtherComponent), // 你的其他导航栏组件
      // 'nav-bar-content-after': () => [
      //   h(OtherComponent), // 你的其他导航栏组件
      //   h(NolebaseEnhancedReadabilitiesMenu), // 阅读增强菜单
      // ],
      // 'nav-screen-content-after': () => h(OtherComponent), // 你的其他导航栏组件
      // 'nav-screen-content-after': () => [
      //   h(OtherComponent), // 你的其他导航栏组件
      //   h(NolebaseEnhancedReadabilitiesScreenMenu), // 阅读增强移动端菜单
      // ],
    });
  },
  enhanceApp: async (ctx) => {
    // app is the Vue 3 app instance from `createApp()`. router is VitePress'
    // custom router. `siteData`` is a `ref`` of current site-level metadata.
    const { app, router } = ctx;

    DefaultTheme.enhanceApp(ctx);

    if (inBrowser) {
      router.onAfterRouteChanged = () => {
        // busuanzi.fetch();
      };
    }

    if (!import.meta.env.SSR) {
      // const plugin = await import('@vp/plugins/markdown/rough-mermaid')
      // app.use(plugin.default)

      vitepressBackToTop({
        // default
        threshold: 300,
      });

      app.use(yuppie);
      app.use(VueResizeObserver);

      app.use(directives);

      app.directive("aria-empty", {
        //指令绑定到元素时调用
        mounted(el, binding) {
          el.removeAttribute("aria-hidden");
          // // 获取节点
          // let ariaEls = el.querySelectorAll("svg");
          // ariaEls.forEach((item) => {
          //   item.removeAttribute("aria-hidden");
          // });
        },
        //指令与元素解绑时调用
        unmounted(el, binding) {},
      });

      // app.mixin({
      //   async mounted() {
      //     //你自己的插件地址
      //     import('svg-pan-zoom').then(module => {
      //         app.use(module);
      //     })
      //   },
      // });

      router.onBeforeRouteChange = async (to) => {
        console.log("onBeforeRouteChange");
        //'Mozilla/5.0 (X11; U; Linux armv7l; en-GB; rv:1.9.2a1pre) Gecko/20090928 Firefox/3.5 Maemo Browser 1.4.1.22 RX-51 N900'
        const { browser, cpu, device } = UAParser();

        console.log(browser.name); // Maemo Browser
        console.log(cpu.is("arm")); // true
        console.log(device.is("mobile")); // true
        console.log(device.model); // N900

        // Here you can set the routes you want to configure.
        if (to == "/") {
          await router.go("/zh-CN/");
          return false;
        }

        // if (typeof window._hmt !== 'undefined') {
        //   window._hmt.push(['_trackPageview', to]);
        // }

        return true;
      };

      router.onAfterPageLoad = async () => {
        console.log("onAfterPageLoad");
      };

      vitepressNprogress(ctx);

      useComponents(app, DemoPreview);

      app.use(Antd);

      app.component("vue3-autocounter", Vue3Autocounter);
      app.component("StyledMermaid", StyledMermaid);
      app.component("MarkupView", MarkupView);
      app.component("DacingNumber", DacingNumber);

      app.component("Tab", Tab);
      app.component("Tabs", Tabs);

      app.component("m-icon", Icon);

      app.component("header-profile", HeaderProfile);
      app.component("lottie-panel", LottiePanel);
      app.component("code-group", CodeGroup);
      app.component("ArticleMetadata", ArticleMetadata);
      app.component("Contributors", Contributors);
      app.component("HomeContributors", HomeContributors);
      app.component("CopyRight", CopyRight);
      app.component("HoverGrid", HoverGrid);
      app.component("DancingLogo", DancingLogo);
      app.component("MagicCard", MagicCard);
      app.component("Confetti", Confetti); //注册全局组件
    }

    if (inBrowser) {
    }
  },
  setup() {
    // get frontmatter and route
    const { lang, frontmatter } = useData(); //
    const route = useRoute();
    // basic use
    codeblocksFold({ route, frontmatter }, true, 400);
    watchEffect(() => {
      if (inBrowser) {
        document.cookie = `nf_lang=${
          lang.value
        }; expires=${new Date().toUTCString()}; path=/`;
      }
    });
  },
} satisfies Theme;
