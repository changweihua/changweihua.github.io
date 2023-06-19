import { DefaultTheme } from "vitepress";
// activeMatch: "^/guide/", 
const navConfig: DefaultTheme.NavItem[] | undefined = [
  { text: "首页", link: "/", activeMatch: "^/$|^/index/" },
  {
    text: "博客",
    link: "/blog/",
    activeMatch: "^/blog/",
  },
  {
    text: "历史归档",
    items: [
      {
        items: [
          { text: "从 Docker 安装 Gitea", link: "/blog/2022/从 Docker 安装 Gitea.md" },
          { text: "敏捷开发学习笔记", link: "/blog/2022/敏捷开发学习笔记.md" },
        ],
      },
      {
        items: [
          { text: "Item B1", link: "/item-B1" },
          { text: "Item B2", link: "/item-B2" },
        ],
      },
    ],
  },
];

export default navConfig;
