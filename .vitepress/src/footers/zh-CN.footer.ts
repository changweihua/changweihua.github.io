import date from "../../utils/date";
import { DefaultTheme } from "vitepress";
// , activeMatch: "^/$|^/index/"
export const getZhCNFooter: () => DefaultTheme.Footer = () => {
  return {
    message: "MIT Licensed",
    copyright: `版权所有 © 2009-${date.tz().year()} CMONO.NET`,
  };
};
