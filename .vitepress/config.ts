import { defineConfig } from "vitepress";
import { themeConfig } from "./src/theme";
import { defaultConfig } from "./src/defaults";
import { head } from "./src/head";

//配置的英文文档设置
import { enConfig } from "./src/configs/en";

//配置的中文文档设置
import { zhConfig } from "./src/configs/zh";

export default defineConfig({
  ...defaultConfig,
  /* 标头配置 */
  head,
  /* 主题配置 */
  themeConfig,
  /* 语言配置 */
  locales: {
    root: { label: "简体中文", lang: "zh-CN", link: "/", ...zhConfig },
    en: { label: "English", lang: "en-US", link: "/en/", ...enConfig },
  },
  titleTemplate: ':title - Custom Suffix',
  sitemap: {
    hostname: 'https://changweihua.github.io',
    transformItems: (items) => {
      // add new items or modify/filter existing items
      items.push({
        url: '/extra-page',
        changefreq: 'monthly',
        priority: 0.8
      })
      return items
    }
  }
});
