import { DefaultTheme } from "vitepress";
import { version } from "../../../package.json";
// , activeMatch: "^/$|^/index/"
export const getZhCNNav: () => DefaultTheme.NavItem[] = () => {
  return [
    // { text: "首页", link: "/zh-CN/" },
    {
      text: "博客",
      link: "/zh-CN/blog/index.md",
      activeMatch: "/blog/",
    },
    // {
    //   text: "关于",
    //   link: "/zh-CN/about.md",
    //   activeMatch: "/about/",
    //   target: "blank",
    // },
    {
      text: "归档",
      link: "/zh-CN/archives.md",
    },
    {
      text: "万花筒",
      link: "/zh-CN/cases.md",
    },
    {
      text: "手册",
      link: "/zh-CN/manual/index.md",
      activeMatch: "/zh-CN/manual/",
    },
    {
      text: "那些年",
      items: [
        { text: "2026", link: "/zh-CN/me.2026.md" },
        { text: "2025", link: "/zh-CN/me.2025.md" },
        { text: "2024", link: "/zh-CN/me.2024.md" },
        { text: "2023", link: "/zh-CN/me.2023.md" },
        { text: "2022", link: "/zh-CN/me.2022.md" },
        { text: "2021", link: "/zh-CN/me.2021.md" },
        { text: "2020", link: "/zh-CN/me.2020.md" },
        { text: "2019", link: "/zh-CN/me.2019.md" },
      ],
    },
    {
      text: `v${version}`,
      items: [
        {
          text: "发布日志",
          link: "https://github.com/changweihua/changweihua.github.io/releases",
        },
        {
          text: "提交 Issue",
          link: "https://github.com/changweihua/changweihua.github.io/issues",
        },
        {
          component: "RainbowAnimationSwitcher",
          props: {
            text: "彩虹动画",
          },
        },
      ],
    },
    // {
    //   text: "分类",
    //   link: "/tags.md",
    //   activeMatch: "^/tags",
    // },
    // {
    //   text: "课程",
    //   link: "/course/",
    //   activeMatch: "^/course/",
    // },
    // {
    //   text: "文章分类",
    //   items: [
    //     {
    //       items: [
    //         { text: "3D 开发", link: "/category/three3d.md" },
    //         { text: "工具&平台", link: "/category/tool.md" },
    //       ],
    //     },
    //     {
    //       items: [
    //         { text: "Flutter", link: "/category/flutter.md" },
    //         { text: "微信小程序", link: "/category/wechat.md" },
    //         { text: "DotNET", link: "/category/dotnet.md" },
    //       ],
    //     },
    //     {
    //       items: [
    //         { text: "VueJS", link: "/category/vue.md" },
    //         { text: "TypeScript", link: "/category/typescript.md" },
    //       ],
    //     },
    //   ],
    // },
  ];
};
