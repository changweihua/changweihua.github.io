import { DefaultTheme } from "vitepress";
// , activeMatch: "^/en/$|^/en/index/$"
export const getEnUSNav: () => DefaultTheme.NavItem[] = () => {
  return [
    { text: "Home", link: "/en-US/" },
    {
      text: "Articles",
      link: "/en-US/blog/"
    },
    {
      text: "About",
      link: "/en-US/about/index.md"
    }
  ]
}
