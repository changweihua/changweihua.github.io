// .vitepress/theme/index.ts
import { inBrowser, useData, useRoute } from "vitepress";
import DefaultTheme from "vitepress/theme-without-fonts";
import { h, watchEffect, watch, nextTick } from "vue";
import AnimationTitle from "../components/AnimtedTitle.vue";
import DocAfter from "../components/DocAfter.vue";
import ArticleFooter from "../components/ArticleFooter.vue";
import HeroLogo from "../components/HeroLogo.vue";
import CarouselCard from "../components/CarouselCard.vue";
import MarkdownEChart from "#.vitepress/components/MarkdownEChart.vue";
import codeblocksFold from "vitepress-plugin-codeblocks-fold"; // import method
import { enhanceAppWithTabs } from "vitepress-plugin-tabs/client";
import mediumZoom from "medium-zoom";

// 彩虹背景动画样式
let homePageStyle: HTMLStyleElement | undefined;

// 彩虹背景动画样式
function updateHomePageStyle(value: boolean) {
  if (value) {
    if (homePageStyle) return;

    homePageStyle = document.createElement("style");
    homePageStyle.innerHTML = `
    :root {
      animation: rainbow 12s linear infinite;
    }`;
    document.body.appendChild(homePageStyle);
  } else {
    if (!homePageStyle) return;

    homePageStyle.remove();
    homePageStyle = undefined;
  }
}

import "virtual:uno.css";
import "virtual:group-icons.css";
import "animate.css";

import "open-props/open-props.min.css";
import "./styles/vitepress-variables.scss";
import "./styles/maple-mono.scss";
import "./styles/index.scss";
import "./styles/rainbow.scss";
import "./styles/vitepress.ext.scss";
import "./styles/vitepress.print.css";
import "./styles/vitepress.code.css";
import "./styles/markdown.ext.css";
import "./styles/mermaid.ext.css";
import "vitepress-plugin-codeblocks-fold/style/index.css"; // import style

import directives from "../directives";
import { NProgress } from "nprogress-v2/dist/index.js"; // 进度条组件
import "nprogress-v2/dist/index.css"; // 进度条样式

import { AntDesignContainer } from "@vitepress-demo-preview/component";
import "@vitepress-demo-preview/component/dist/style.css";

import { defineClientComponentConfig } from "@vitepress-demo-preview/core";

import "@catppuccin/vitepress/theme/frappe/lavender.css";

// 引入组件库的少量全局样式变量
import "tdesign-vue-next/es/style/index.css";

import PageLost from "../components/PageLost.vue";
import ArticleQRCode from "../components/ArticleQRCode.vue";

import { Icon } from "@iconify/vue";

import type { Theme } from "vitepress";

import AnimatingLayout from "./AnimatingLayout.vue";


import TDesign from "tdesign-vue-next";

import mermaid from "mermaid";
import { icons } from "@iconify-json/logos";
mermaid.registerIconPacks([
  {
    name: icons.prefix, // To use the prefix defined in the icon pack
    icons,
  },
  // {
  //   name: "devicon",
  //   loader: () =>
  //     import("@iconify-json/devicon").then((module) => module.icons),
  // },
  // {
  //   name: skillIcons.prefix, // To use the prefix defined in the icon pack
  //   icons: skillIcons,
  // },
  // {
  //   name: devIcons.prefix, // To use the prefix defined in the icon pack
  //   icons: devIcons,
  // },
]);
import zenuml from "@mermaid-js/mermaid-zenuml";
mermaid.registerExternalDiagrams([zenuml]);

import elkLayouts from "@mermaid-js/layout-elk";
mermaid.registerLayoutLoaders(elkLayouts);

// mermaid.initialize({
//   look: "handDrawn",
//   handDrawnSeed: 2,
//   fontFamily: "MapleMono, AlibabaPuHuiTi, '阿里巴巴普惠体 3.0'",
//   altFontFamily: "MapleMono, AlibabaPuHuiTi, '阿里巴巴普惠体 3.0'",
//   theme: "neutral",
//   flowchart: { curve: "basis" },
//   securityLevel: "loose",
//   logLevel: "error",
//   suppressErrorRendering: false,
//   startOnLoad: true,
//   maxTextSize: 100000, // 防止大文本出错
//   // ... other Mermaid configuration options
// });

import "vitepress-markdown-timeline/dist/theme/index.css";
import "vitepress-markdown-it-stepper/theme";

import DemoPreview, { useComponents } from "@vitepress-code-preview/container";
import "@vitepress-code-preview/container/dist/style.css";

// 导入hooks
import useVisitData from "../hooks/useVisitData";

import "markdown-it-github-alerts/styles/github-colors-light.css";
import "markdown-it-github-alerts/styles/github-colors-dark-media.css";
import "markdown-it-github-alerts/styles/github-base.css";

import { initComponent as initMarkmapComponent } from "vitepress-markmap-preview/component";
import "vitepress-markmap-preview/dist/index.css";
import PageCursor from "../components/PageCursor.vue";

// Setup medium zoom with the desired options
const setupMediumZoom = () => {
  mediumZoom("[data-zoomable]", {
    background: "var(--vp-c-bg)",
    container: document.body,
  });
};

export default {
  ...DefaultTheme,
  NotFound: PageLost, // <- this is a Vue 3 functional component
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

    return h(AnimatingLayout, null, {
      // "home-hero-before": () => h(NoticeBar),
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
          slogon: "知识汪洋只此一瓢",
          tagline: "伪前端+伪后端+伪需求=真全栈",
        }),
      "home-hero-image": () =>
        h(
          "div",
          {
            class:
              "sm:hidden md:(visible flex h-full items-center justify-center)",
            style: "position: relative;",
          },
          [h(HeroLogo)]
        ),
      // "home-hero-image": () =>
      //   h(
      //     "div",
      //     {
      //       class:
      //         "hidden lg:(visible flex w-full h-full items-center justify-center)",
      //       style: "position: relative;",
      //     },
      //     [
      //       h(HeroLogo),
      //       // h(ColorfulWord),
      //       // h('div', [
      //       //   h(AnimatedLogo),
      //       // ])
      //       h("img", {
      //         src: "/cwh.svg",
      //         class: "VPImage image-src",
      //       }),
      //     ]
      //   ),
      // "home-hero-after": () =>
      //   h(PlaceHolder, {
      //     name: "home-hero-after",
      //   }),
      // "home-features-before": () =>
      //   h(NoticeBar, {
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
      // "doc-bottom": () => [h(ArticleQRCode), h(Recommend)],
      "doc-footer-before": () => [h(ArticleQRCode), h(ArticleFooter)],
      // "doc-footer-before": () =>
      //   h(PlaceHolder, {
      //     name: "doc-footer-before",
      //   }),
      // "doc-before": () =>
      //   h(PlaceHolder, {
      //     name: "doc-before",
      //   }),
      // "doc-before": () => h(Breadcrumb, { breadcrumb: true }),
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

      "not-found": () => h(PageLost),

      //  Always
      // "layout-top": () =>
      //   h(NoticeBar, {
      //     name: "layout-top",
      //   }),
      "layout-top": () => [h(PageCursor)],
      // "layout-bottom": () => [h(PageFooter)], //, h(RegisterSW)
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
  enhanceApp: (ctx) => {
    const { app, router } = ctx;
    DefaultTheme.enhanceApp(ctx);

    // 定义国际化配置
    defineClientComponentConfig({
      // 保持向后兼容
      copySuccessText: "代码已复制到剪贴板！",
      vueApp: app,
      // 国际化配置
      i18n: {
        zh: {
          copySuccessText: "代码已复制到剪贴板！",
          copyCode: "复制代码",
          foldCode: "折叠代码",
          expandCode: "展开代码",
          hideSourceCode: "隐藏源代码",
        },
        en: {
          copySuccessText: "Code copied to clipboard!",
          copyCode: "Copy code",
          foldCode: "Fold code",
          expandCode: "Expand code",
          hideSourceCode: "Hide source code",
        },
      },
      // 设置默认语言为中文
      defaultLanguage: "zh",
    });

    if (inBrowser) {
      initMarkmapComponent(app);
      enhanceAppWithTabs(app);

      useComponents(app, DemoPreview);

      app.component("demo-preview", AntDesignContainer);

      // import("hover-tilt/web-component").then((module) => {
      //   // 模块已经加载，Web Component 应该已经注册
      //   console.log("hover-tilt loaded");
      // });

      app.use(TDesign);
      // const { promise, resolve, reject } = Promise.withResolvers();
      //   // 一些异步操作
      // setTimeout(() => {
      //     if (/* 条件满足 */) {
      //         resolve('成功');
      //     } else {
      //         reject('失败');
      //     }
      // }, 1000);

      NProgress.configure({ showSpinner: false });

      // 彩虹背景动画样式
      if (typeof window !== "undefined") {
        watch(
          () => router.route.data.relativePath,
          () => updateHomePageStyle(location.pathname === "/zh-CN/"),
          { immediate: true }
        );
      }

      app.component("CarouselCard", CarouselCard);
      app.component("MarkdownEChart", MarkdownEChart);

      // app.component("HrefCard", HrefCard);
      // app.component("ColorfulName", ColorfulName);
      // app.component("HoverableText", HoverableText);
      // app.component("LiquidMetaCard", LiquidMetaCard);

      // app.component("CarouselGallery", CarouselGallery);
      // app.component("AboutMe", AboutMe);
      // app.component("Robot", Robot);
      app.use(directives);

      // app.directive("aria-empty", {
      //   //指令绑定到元素时调用
      //   mounted(el, binding) {
      //     el.removeAttribute("aria-hidden");
      //     // // 获取节点
      //     // let ariaEls = el.querySelectorAll("svg");
      //     // ariaEls.forEach((item) => {
      //     //   item.removeAttribute("aria-hidden");
      //     // });
      //   },
      //   //指令与元素解绑时调用
      //   unmounted(el, binding) {},
      // });

      // app.component("DacingNumber", DacingNumber);
      // app.component("TaskList", TaskList);
      // app.component("ScrollableParagraph", ScrollableParagraph);
      // app.component("GalleryCard", GalleryCard);
      // app.component("CubesLoader", CubesLoader);
      // app.component("PyramidLoader", PyramidLoader);
      // app.component("CubeLoader", CubeLoader);
      app.component("m-icon", Icon);

      // app.component("header-profile", HeaderProfile);
      // app.component("lottie-panel", LottiePanel);
      // app.component("code-group", CodeGroup);
      // app.component("ArticleMetadata", ArticleMetadata);
      // app.component("Contributors", Contributors);
      // app.component("HomeContributors", HomeContributors);
      // app.component("CopyRight", CopyRight);
      // app.component("HoverGrid", HoverGrid);
      // app.component("DancingLogo", DancingLogo);
      // app.component("MagicCard", MagicCard);
      // app.component("LiquidCard", LiquidCard);
      // app.component("Guidance", Guidance);
      // app.component("m-read-text", ReadText);

      if (router) {
        router.onBeforeRouteChange = async (to) => {
          console.log("onBeforeRouteChange");
          NProgress.start(); // 开始进度条

          // nextTick(() => mermaidRenderer.renderMermaidDiagrams());
          // //'Mozilla/5.0 (X11; U; Linux armv7l; en-GB; rv:1.9.2a1pre) Gecko/20090928 Firefox/3.5 Maemo Browser 1.4.1.22 RX-51 N900'
          // const { browser, cpu, device } = UAParser();

          // console.log(browser.name); // Maemo Browser
          // console.log(cpu.is("arm")); // true
          // console.log(device.is("mobile")); // true
          // console.log(device.model); // N900

          // 🧪 console.log(await getDeviceFingerprint(true));

          // Here you can set the routes you want to configure.
          if (to == "/") {
            await router.go("/zh-CN/", {
              initialLoad: true,
              smoothScroll: true,
              replace: true,
            });
            return false;
          }

          // if (typeof window._hmt !== 'undefined') {
          //   window._hmt.push(['_trackPageview', to]);
          // }

          return true;
        };

        // 路由加载完成，在加载页面组件后（在更新页面组件之前）调用。
        router.onAfterPageLoad = async () => {
          console.log("onAfterPageLoad"); // 调用统计访问接口hooks
          useVisitData();
          NProgress.done(); // 停止进度条
          nextTick(function () {
            setupMediumZoom();
          });
        };
      }
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
