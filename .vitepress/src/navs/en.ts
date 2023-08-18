import { DefaultTheme } from "vitepress";
// activeMatch: "^/guide/",
const nav: DefaultTheme.NavItem[] | undefined = [
  { text: "Home", link: "/en/", activeMatch: "^/en/$|^/en/index/$" },
  {
    text: "Articles",
    link: "/en/blog/",
    activeMatch: "^/en/blog/",
  },
  {
    text: "Courses",
    link: "/en/course/",
    activeMatch: "^/en/course/",
  },
  {
    text: "About",
    link: "/en/about/index.md",
    activeMatch: "^/en/about/",
  },
  {
    text: "Categories",
    items: [
      {
        items: [
          { text: "Three3D", link: "/en/category/three3d.md" },
          { text: "Tools", link: "/en/category/tool.md" },
        ],
      },
      {
        items: [
          { text: "Flutter", link: "/en/category/flutter.md" },
          { text: "MiniProgram", link: "/en/category/wechat.md" },
          { text: "DotNET", link: "/en/category/dotnet.md" },
        ],
      },
      {
        items: [
          { text: "VueJS", link: "/en/category/vue.md" },
          { text: "TypeScript", link: "/en/category/typescript.md" },
        ],
      },
    ],
  },
];

export { nav };

export default nav;
