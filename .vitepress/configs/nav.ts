import { DefaultTheme } from "vitepress";

const navConfig: DefaultTheme.NavItem[] | undefined = [
  { text: "首页", link: "/", activeMatch: "^/guide/" },
  {
    text: "案例",
    link: "/markdown-examples",
    activeMatch: "^/markdown-examples/",
  },
];

export default navConfig;
