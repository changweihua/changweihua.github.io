// .vitepress/theme/index.ts
import { inBrowser, useData, useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'
import { h, watchEffect, watch, nextTick } from 'vue'
import AnimationTitle from '../components/AnimtedTitle.vue'
import DocAfter from '../components/DocAfter.vue'
import ArticleFooter from '../components/ArticleFooter.vue'
import HeroLogo from '../components/HeroLogo.vue'
import HoverableText from '../components/HoverableText.vue'
import CarouselGallery from '../components/CarouselGallery.vue'
import ProjectLab from '../components/ProjectLab.vue'
import CarouselCard from '../components/CarouselCard.vue'
import MarkdownEChart from '#.vitepress/components/MarkdownEChart.vue'
import codeblocksFold from 'vitepress-plugin-codeblocks-fold' // import method
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'
import { createMermaidRenderer } from 'vitepress-mermaid-renderer'
// @ts-ignore
import GlossaryTooltip from 'vitepress-plugin-glossary/vue'

// 彩虹背景动画样式
let homePageStyle: HTMLStyleElement | undefined

// 彩虹背景动画样式
function updateHomePageStyle(value: boolean) {
  if (value) {
    if (homePageStyle) return

    homePageStyle = document.createElement('style')
    homePageStyle.innerHTML = `
    :root {
      animation: rainbow 12s linear infinite;
    }`
    document.body.appendChild(homePageStyle)
  } else {
    if (!homePageStyle) return

    homePageStyle.remove()
    homePageStyle = undefined
  }
}

import 'virtual:uno.css'
import 'virtual:group-icons.css'
import 'animate.css'

import 'open-props/open-props.min.css'
import '@fontsource-variable/noto-sans-sc'
// import './styles/noto-sans.css'
import './styles/vitepress-variables.scss'
import './styles/maple-mono.scss'
import './styles/index.scss'
import './styles/rainbow.scss'
import './styles/vitepress.ext.scss'
import './styles/vitepress.print.css'
import './styles/vitepress.code.css'
import './styles/markdown.ext.css'
import './styles/mermaid.ext.css'
import 'vitepress-plugin-codeblocks-fold/style/index.css' // import style

import directives from '../directives'
// import vitepressNprogress from "vitepress-plugin-nprogress";
// import "vitepress-plugin-nprogress/lib/css/index.css";

import { NaiveUIContainer } from '@vitepress-demo-preview/component'
import '@vitepress-demo-preview/component/dist/style.css'

import { defineClientComponentConfig } from '@vitepress-demo-preview/core'

import '@catppuccin/vitepress/theme/frappe/lavender.css'

import PageLost from '../components/PageLost.vue'
import ArticleQRCode from '../components/ArticleQRCode.vue'

import { Icon } from '@iconify/vue'

import type { Theme } from 'vitepress'

import AnimatingLayout from './AnimatingLayout.vue'

import mermaid from 'mermaid'
import { icons } from '@iconify-json/logos'
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
])
import zenuml from '@mermaid-js/mermaid-zenuml'
mermaid.registerExternalDiagrams([zenuml])

import elkLayouts from '@mermaid-js/layout-elk'
mermaid.registerLayoutLoaders(elkLayouts)

import BackToTopButton from '@miletorix/vitepress-back-to-top-button'
import '@miletorix/vitepress-back-to-top-button/style.css'

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

import 'vitepress-markdown-timeline/dist/theme/index.css'
import 'vitepress-markdown-it-stepper/theme'

import DemoPreview, { useComponents } from '@vitepress-code-preview/container'
import '@vitepress-code-preview/container/dist/style.css'

// 导入hooks
import useVisitData from '../hooks/useVisitData'

import 'markdown-it-github-alerts/styles/github-colors-light.css'
import 'markdown-it-github-alerts/styles/github-colors-dark-media.css'
import 'markdown-it-github-alerts/styles/github-base.css'

import { initComponent as initMarkmapComponent } from 'vitepress-markmap-preview/component'
import 'vitepress-markmap-preview/dist/index.css'

import vitepressBprogress from 'vitepress-plugin-bprogress'
// Import CSS styles (both imports work)
import 'vitepress-plugin-bprogress/style.css'

import { HtmlPreview } from '@miletorix/vitepress-html-preview'

export default {
  ...DefaultTheme,
  NotFound: PageLost, // <- this is a Vue 3 functional component
  // extends: DefaultTheme,
  // 使用注入插槽的包装组件覆盖 Layout
  // Layout: MyLayout,
  Layout() {
    const props: Record<string, any> = {}
    // 获取 frontmatter
    const { frontmatter } = useData()

    /* 添加自定义 class */
    if (frontmatter.value?.layoutClass) {
      props.class = frontmatter.value.layoutClass
    }

    // const { isDark } = useData();

    // const initMermaid = () => {
    //   const mermaidRenderer = createMermaidRenderer({
    //     theme: isDark.value ? "dark" : "neutral",
    //     layout: "elk",
    //     startOnLoad: false,
    //     sequence: {
    //       diagramMarginX: 50,
    //       diagramMarginY: 10,
    //     },
    //     look: "handDrawn",
    //     handDrawnSeed: 3,
    //     fontFamily: "MapleMono, AlibabaPuHuiTi, '阿里巴巴普惠体 3.0'",
    //     altFontFamily: "MapleMono, AlibabaPuHuiTi, '阿里巴巴普惠体 3.0'",
    //     flowchart: {
    //       useMaxWidth: true,
    //       htmlLabels: true,curve: "basis", defaultRenderer: "elk" },
    //     class: {
    //       defaultRenderer: "elk",
    //     },
    //     state: {
    //       defaultRenderer: "elk",
    //     },
    //     securityLevel: "loose",
    //     logLevel: "error",
    //     suppressErrorRendering: true,
    //   });

    //   // mermaidRenderer.setToolbar({
    //   //   showLanguageLabel: true,
    //   //   desktop: {
    //   //     zoomIn: "disabled",
    //   //     zoomLevel: "enabled",
    //   //     positions: { vertical: "top", horizontal: "left" },
    //   //   },
    //   //   mobile: {
    //   //     zoomLevel: "disabled",
    //   //     positions: { vertical: "bottom", horizontal: "left" },
    //   //   },
    //   //   fullscreen: {
    //   //     zoomLevel: "enabled",
    //   //     positions: { vertical: "top", horizontal: "right" },
    //   //   },
    //   // });
    // };

    // // initial mermaid setup
    // nextTick(() => initMermaid());

    // // on theme change, re-render mermaid charts
    // watch(
    //   () => isDark.value,
    //   () => {
    //     initMermaid();
    //   },
    // );

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
      'home-hero-info': () =>
        h(AnimationTitle, {
          name: 'CMONO.NET',
          slogon: '知识汪洋只此一瓢',
          tagline: '伪前端+伪后端+伪需求=真全栈',
        }),
      'home-hero-image': () =>
        h(
          'div',
          {
            class: 'sm:hidden md:(visible flex h-full items-center justify-center)',
            style: 'position: relative;',
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
      'doc-footer-before': () => [h(ArticleQRCode), h(ArticleFooter)],
      // "doc-footer-before": () =>
      //   h(PlaceHolder, {
      //     name: "doc-footer-before",
      //   }),
      // "doc-before": () =>
      //   h(PlaceHolder, {
      //     name: "doc-before",
      //   }),
      // "doc-before": () => h(Breadcrumb, { breadcrumb: true }),
      'doc-after': () => h(DocAfter),
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

      'not-found': () => h(PageLost),

      //  Always
      // "layout-top": () =>
      //   h(NoticeBar, {
      //     name: "layout-top",
      //   }),
      // 'layout-top': () => [h(PageCursor)],
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
    })
  },
  enhanceApp: (ctx) => {
    const { app, router } = ctx
    DefaultTheme.enhanceApp(ctx)

    // vitepressNprogress(ctx);

    const bProgress = vitepressBprogress(ctx)

    // Custom configuration (optional)
    if (bProgress) {
      bProgress.configure({
        showSpinner: false, // Show loading spinner
        speed: 300, // Animation speed in ms
        easing: 'ease-out', // CSS easing function
        minimum: 0.1, // Minimum progress (0-1)
        trickle: true, // Auto increment
        trickleSpeed: 200, // Trickle speed
        direction: 'ltr', // Progress direction
      })
    }

    BackToTopButton(ctx.app, {
      progressColor: 'var(--vp-c-brand-1)', //"#2563eb", // default is #42b983
      arrowSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
	<g fill="none" fill-rule="evenodd">
		<path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path>
		<path fill="currentColor" d="M11.293 8.293a1 1 0 0 1 1.414 0l5.657 5.657a1 1 0 0 1-1.414 1.414L12 10.414l-4.95 4.95a1 1 0 0 1-1.414-1.414z"></path>
	</g>
</svg>`, // only svg code
    })

    // 定义国际化配置
    defineClientComponentConfig({
      // 保持向后兼容
      copySuccessText: '代码已复制到剪贴板！',
      vueApp: app,
      // 国际化配置
      i18n: {
        zh: {
          copySuccessText: '代码已复制到剪贴板！',
          copyCode: '复制代码',
          foldCode: '折叠代码',
          expandCode: '展开代码',
          hideSourceCode: '隐藏源代码',
        },
        en: {
          copySuccessText: 'Code copied to clipboard!',
          copyCode: 'Copy code',
          foldCode: 'Fold code',
          expandCode: 'Expand code',
          hideSourceCode: 'Hide source code',
        },
      },
      // 设置默认语言为中文
      defaultLanguage: 'zh',
    })

    if (inBrowser) {
      initMarkmapComponent(app)
      enhanceAppWithTabs(app)

      useComponents(app, DemoPreview)

      // 在 markdown 文件中使用，必须手动注册
      app.component('demo-preview', NaiveUIContainer)
      app.component('HoverableText', HoverableText)
      app.component('CarouselGallery', CarouselGallery)
      app.component('ProjectLab', ProjectLab)
      app.component('CarouselCard', CarouselCard)
      app.component('MarkdownEChart', MarkdownEChart)
      app.component('m-icon', Icon)
      app.component('GlossaryTooltip', GlossaryTooltip)
      app.component('HtmlPreview', HtmlPreview)

      // <HtmlPreview src="/demo/point-sketch.html" height="600px" />

      // 彩虹背景动画样式
      if (typeof window !== 'undefined') {
        watch(
          () => router.route.data.relativePath,
          () => updateHomePageStyle(location.pathname === '/zh-CN/'),
          { immediate: true }
        )
      }

      app.use(directives)

      if (router) {
        router.onBeforeRouteChange = async (to) => {
          // Here you can set the routes you want to configure.
          if (to == '/') {
            await router.go('/zh-CN/', {
              initialLoad: true,
              smoothScroll: true,
              replace: true,
            })
            return false
          }

          return true
        }

        router.onAfterRouteChange = () => {
          nextTick(() => {
            // 等待 DOM 更新后执行清理
            const styleSheets = document.styleSheets
            // 可能的清理操作
          })
        }

        // 路由加载完成，在加载页面组件后（在更新页面组件之前）调用。
        router.onAfterPageLoad = async () => {
          useVisitData()
        }
      }
    }
  },
  setup() {
    // get frontmatter and route
    const { lang, frontmatter } = useData() //
    const route = useRoute()
    // basic use
    codeblocksFold({ route, frontmatter }, true, 400)
    watchEffect(() => {
      if (inBrowser) {
        document.cookie = `nf_lang=${lang.value}; expires=${new Date().toUTCString()}; path=/`
      }
    })
  },
} satisfies Theme
