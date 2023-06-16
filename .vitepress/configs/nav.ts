import { DefaultTheme } from "vitepress";
// activeMatch: "^/guide/", 
const navConfig: DefaultTheme.NavItem[] | undefined = [
  { text: "首页", link: "/", activeMatch: "^/$|^/index/" },
  {
    text: "案例",
    link: "/markdown-examples",
    activeMatch: "^/markdown-examples/",
  },
  {
    text: "Drop Menu",
    items: [
      {
        items: [
          { text: "Item A1", link: "/item-A1" },
          { text: "Item A2", link: "/item-A2" },
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
