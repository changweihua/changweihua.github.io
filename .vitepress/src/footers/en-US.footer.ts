import dayjs from "dayjs";
import { DefaultTheme } from "vitepress";
// , activeMatch: "^/$|^/index/"
export const getEnUSFooter: () => DefaultTheme.Footer = () => {
  return {
    message: "MIT Licensed",
    copyright: `版权所有 © 2009-${dayjs().year()} CMONO.NET`,
  };
};
