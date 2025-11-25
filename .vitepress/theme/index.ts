// .vitepress/theme/index.ts
import { inBrowser, useData, useRoute } from "vitepress";
import DefaultTheme from "vitepress/theme-without-fonts";
import { h, watchEffect, watch, nextTick } from "vue";
import DocAfter from "../components/DocAfter.vue";
import Recommend from "../components/Recommend.vue";
import CopyRight from "../components/CopyRight.vue";
import HeaderProfile from "../components/HeaderProfile.vue";
import LottiePanel from "../components/LottiePanel.vue";
import DacingNumber from "../components/DacingNumber.vue";
import HrefCard from "../components/HrefCard.vue";
import DancingLogo from "../components/DancingLogo.vue";
import ReadText from "../components/ReadText.vue";
import ColorfulName from "../components/ColorfulName.vue";
import CubesLoader from "../components/CubesLoader.vue";
import CubeLoader from "../components/CubeLoader.vue";
import PyramidLoader from "../components/PyramidLoader.vue";
import HoverableText from "../components/HoverableText.vue";
import ArticleFooter from "../components/ArticleFooter.vue";
import LiquidCard from "../components/LiquidCard.vue";
import Robot from "../components/Robot.vue";
import LiquidMetaCard from "../components/LiquidMetaCard.vue";
import CarouselCard from "../components/CarouselCard.vue";
import AboutMe from "../components/AboutMe.vue";
import NoticeBar from "../components/NoticeBar.vue";
import HeroLogo from "#.vitepress/components/HeroLogo.vue";
import MarkdownEChart from "#.vitepress/components/MarkdownEChart.vue";
import codeblocksFold from "vitepress-plugin-codeblocks-fold"; // import method
import "vitepress-plugin-codeblocks-fold/style/index.css"; // import style
import AnimationTitle from "../components/AnimtedTitle.vue";
import TransitionNavBar from "../components/TransitionNavBar.vue";
import RainbowAnimationSwitcher from "../components/RainbowAnimationSwitcher.vue";
import { enhanceAppWithTabs } from "vitepress-plugin-tabs/client";
import mediumZoom from "medium-zoom";
import yuppie from "yuppie-ui";
import * as AntIconsVue from "@ant-design/icons-vue";
// 彩虹背景动画样式
let homePageStyle: HTMLStyleElement | undefined;

// #v-ifdef VITE_MY_ENV

import { pinyin } from "pinyin-pro";

// console.log(styleText('italic', styleText('bold', styleText('blue', pinyin("常伟华")))));

import { xlogs } from "xlogs";

import PinyinMatch from "pinyin-match";

let test = "123曾经沧海难为水除却巫山不是云";

console.log(PinyinMatch.match(test, "23曾")); // [1, 3]
console.log(PinyinMatch.match(test, "cjc")); // [3, 5]
console.log(PinyinMatch.match(test, "cengjingcanghai")); // [3, 6]
console.log(PinyinMatch.match(test, "cengjingcangha")); // [3, 6]
console.log(PinyinMatch.match(test, "engjingcanghai")); // false
console.log(PinyinMatch.match(test, "zengjingcang")); // [3, 5]
console.log(PinyinMatch.match(test, "sdjkelwqf")); // false
console.log(PinyinMatch.match(test, "zengji ng cang")); // [3, 5]
console.log(PinyinMatch.match(test, "zengji ng cangsdjfkl")); // false
console.log(PinyinMatch.match("   我 爱你 中   国   ", "nzg")); // [6, 12]
console.log(PinyinMatch.match("   我 爱你 中   国   ", "爱你中")); // [5, 8]
console.log(PinyinMatch.match("發", "fa")); // [0, 0]

// import 'dotenv/config'

const text = "白日依山尽，黄河入海流";

// 直接中文匹配
console.log(PinyinMatch.match(text, "黄河"));
// [6, 7]

// 拼音全拼匹配
console.log(PinyinMatch.match(text, "bairiyishanjin"));
// [0, 4]

// 拼音缩写匹配
console.log(PinyinMatch.match(text, "hhrhl"));
// [6, 9]

// 模糊输入（最后一个字母没打完）
console.log(PinyinMatch.match(text, "huan"));
// [6, 6]

// 拼音 + 汉字混合
console.log(PinyinMatch.match(text, "bai日"));
// [0, 1]

// 无法命中
console.log(PinyinMatch.match(text, "abcdef"));
// false

// 气泡对话
xlogs.bubble(`Hello!`, "bot");
xlogs.bubble("Hi there!", "user");

// 天气主题
xlogs.weather("sunny", "Nice weather today!");
xlogs.weather("rainy", "Remember your umbrella");

// ASCII艺术
xlogs.ascii("Important", "box");
xlogs.ascii("Warning", "cloud");

// 3D文字
xlogs.banner(pinyin("常伟华"), "neon");

// #v-endif

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

import directives from "../directives";
import { NProgress } from "nprogress-v2/dist/index.js"; // 进度条组件
import "nprogress-v2/dist/index.css"; // 进度条样式

// 引入 Ant Design Vue
import Antd from "ant-design-vue";

import { AntDesignContainer } from "@vitepress-demo-preview/component";
import "@vitepress-demo-preview/component/dist/style.css";

import { defineClientComponentConfig } from "@vitepress-demo-preview/core";

import "@catppuccin/vitepress/theme/frappe/lavender.css";

import "./styles/variables.scss";
import "./styles/index.scss";
import "./styles/rainbow.scss";
import "./styles/vitepress.ext.scss";
import "./styles/vitepress.print.css";
import "./styles/vitepress.code.css";
import "./styles/markdown.ext.css";
import "./styles/mermaid.ext.css";

import NotFound from "../components/NotFound.vue";
import NotFounds from "../components/NotFounds.vue";
import CodeGroup from "../components/CodeGroup.vue";
import ArticleMetadata from "../components/ArticleMetadata.vue";
import Contributors from "../components/Contributors.vue";
import HomeContributors from "../components/HomeContributors.vue";
import LiquidPageFooter from "../components/LiquidPageFooter.vue";
import HoverGrid from "../components/HoverGrid.vue";
import MagicCard from "../components/MagicCard.vue";
import Confetti from "../components/Confetti.vue";
import Guidance from "../components/Guidance.vue";
import TaskList from "../components/TaskList.vue";
import ScrollableParagraph from "../components/ScrollableParagraph.vue";
import GalleryCard from "../components/GalleryCard.vue";

import { Icon } from "@iconify/vue";

import type { Theme } from "vitepress";

import AnimatingLayout from "./AnimatingLayout.vue";

import { nanoid, customAlphabet } from "nanoid";

const id = nanoid();
// 默认ID 长度为21字符
// 随机，URL安全（不会出现 + / = ）
console.log(id); // 如：Kh_1OuFVecVCKfMdj1NXq

console.log(nanoid(10)); // 10位ID，如: Y3Xh9md3Wz
console.log(nanoid(32)); // 32位ID

const aids = Array.from({ length: 5 }, () => nanoid());
console.log(aids); // ['wr9bcsr1Te5HKEn_WYVKx','Fho3hazZDYNGWorG7APit','VIuIpbrVamSjnKMVg9IpO','3ArbZPt8qc_JL_IF8WTbJ','V9YCFTNFgaWF6hnQRgJBH']

// 仅数字ID
const nanoidNumber = customAlphabet("1234567890", 8);
console.log(nanoidNumber()); // 24736672

// 全大写字母+数字
const nanoidUpper = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);
console.log(nanoidUpper()); // OO8QE8V0

import mermaid from "mermaid";
import { icons } from "@iconify-json/logos";
mermaid.registerIconPacks([
  {
    name: icons.prefix, // To use the prefix defined in the icon pack
    icons,
  },
  {
    name: "devicon",
    loader: () =>
      import("@iconify-json/devicon").then((module) => module.icons),
  },
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

import "virtual:uno.css";
import "virtual:group-icons.css";
import "animate.css";

import vitepressBackToTop from "vitepress-plugin-back-to-top";
import "vitepress-plugin-back-to-top/dist/style.css";

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

    return h(AnimatingLayout, null, {
      "home-hero-before": () => h(NoticeBar),
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
              "hidden lg:(visible flex h-full items-center justify-center)",
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
      "doc-bottom": () => h(Recommend),
      "doc-footer-before": () => h(ArticleFooter),
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

      "not-found": () => h(NotFounds),

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
    const { app, router, siteData } = ctx;
    DefaultTheme.enhanceApp(ctx);

    // 使用别名机制覆写默认的VPFooter组件
    // app.component('VPFooter', LiquidPageFooter)

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

    useComponents(app, DemoPreview);

    app.component("demo-preview", AntDesignContainer);
    app.component("RainbowAnimationSwitcher", RainbowAnimationSwitcher);
    app.component("TransitionNavBar", TransitionNavBar);

    if (inBrowser) {
      initMarkmapComponent(app);
      enhanceAppWithTabs(app);
      // const { promise, resolve, reject } = Promise.withResolvers();
      //   // 一些异步操作
      // setTimeout(() => {
      //     if (/* 条件满足 */) {
      //         resolve('成功');
      //     } else {
      //         reject('失败');
      //     }
      // }, 1000);
    }

    if (inBrowser) {
      NProgress.configure({ showSpinner: false });

      // 彩虹背景动画样式
      if (typeof window !== "undefined") {
        watch(
          () => router.route.data.relativePath,
          () => updateHomePageStyle(location.pathname === "/zh-CN/"),
          { immediate: true }
        );
      }

      vitepressBackToTop({
        // default
        threshold: 300,
      });

      app.use(yuppie);

      app.component("MarkdownEChart", MarkdownEChart);
      app.component("HrefCard", HrefCard);
      app.component("ColorfulName", ColorfulName);
      app.component("HoverableText", HoverableText);
      app.component("LiquidMetaCard", LiquidMetaCard);
      app.component("CarouselCard", CarouselCard);
      app.component("AboutMe", AboutMe);
      app.component("Robot", Robot);
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

      app.use(Antd);
      for (const [key, component] of Object.entries(AntIconsVue)) {
        app.component(key, component);
      }
      app.component("DacingNumber", DacingNumber);
      app.component("TaskList", TaskList);
      app.component("ScrollableParagraph", ScrollableParagraph);
      app.component("GalleryCard", GalleryCard);
      app.component("CubesLoader", CubesLoader);
      app.component("PyramidLoader", PyramidLoader);
      app.component("CubeLoader", CubeLoader);
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
      app.component("Confetti", Confetti);
      app.component("LiquidCard", LiquidCard);
      app.component("Guidance", Guidance);
      app.component("m-read-text", ReadText);

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
