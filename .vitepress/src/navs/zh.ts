import { DefaultTheme } from "vitepress";
// activeMatch: "^/guide/",
const nav: DefaultTheme.NavItem[] | undefined = [
  { text: "首页", link: "/", activeMatch: "^/$|^/index/" },
  {
    text: "博客",
    link: "/blog/",
    activeMatch: "^/blog/",
  },
  {
    text: "关于",
    link: "/about/index.md",
    activeMatch: "^/about/",
  },
  {
    text: "文章分类",
    items: [
      {
        items: [
          { text: "工具&平台", link: "/category/tool.md" },
        ],
      },
      {
        items: [
          { text: "Flutter", link: "/category/flutter.md" },
          { text: "微信小程序", link: "/category/wechat.md" },
          { text: "DotNET", link: "/category/dotnet.md" },
        ],
      },
      {
        items: [
          { text: "VueJS", link: "/category/vue.md" },
          { text: "TypeScript", link: "/category/typescript.md" },
        ],
      },
    ],
  },
];

export {
  nav
}

export default nav;
