import { DefaultTheme } from "vitepress";
// , activeMatch: "^/en/$|^/en/index/$"
export const getEnUSNav: () => DefaultTheme.NavItem[] = () => {
  return [
    // { text: "Home", link: "/en-US/" },
    {
      text: "Blog",
      link: "/en-US/blog/"
    },
    {
      text: "Archive",
      link: "/en-US/archives.md"
    },
  ]
}
