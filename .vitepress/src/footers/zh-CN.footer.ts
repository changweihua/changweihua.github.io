import { DefaultTheme } from "vitepress";

export const getZhCNFooter: () => DefaultTheme.Footer = () => {
  return {
    message: "MIT Licensed",
    copyright: `版权所有 © 2009-${new Date().getFullYear()} CMONO.NET`,
  };
};
