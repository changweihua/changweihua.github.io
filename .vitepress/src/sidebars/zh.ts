import { DefaultTheme } from "vitepress";

const sidebar: DefaultTheme.Sidebar | undefined = {
  articles: [
    {
      text: "Examples",
      items: [
        { text: "Markdown Examples", link: "/markdown-examples" },
        { text: "Runtime API Examples", link: "/api-examples" },
      ],
    },
  ],
  '/course/typescript/': [
    {
      text: "TypeScript",
      items: [
        { text: "TypeScript内置类型", link: "/course/typescript/preset_type" },
        { text: "TypeScript拓展", link: "/course/typescript/extension_type" },
        { text: "默认 tsconfig.json", link: "/course/typescript/default_tsconfig" },
      ],
    },
  ],
  '/course/algorithm/': [
    {
      text: "algorithm",
      items: [
      ],
    },
  ],
  // gallery: [
  //   {
  //     text: "项目案例",
  //     items: [
  //       { text: "无锡硕放机场阳光服务平台", link: "/gallery/sunny-land" },
  //       { text: "扬泰机场智慧出行微信小程序", link: "/api-examples" },
  //       {
  //         text: "上海民航华东凯亚江苏分公司疫情防控平台",
  //         link: "/api-examples",
  //       },
  //       { text: "无锡硕放机场安检效能分析系统", link: "/api-examples" },
  //       {
  //         text: "无锡硕放机场进出港/无纸化系统",
  //         link: "/api-examples",
  //       },
  //       { text: "扬泰机场客源地分析系统", link: "/api-examples" },
  //     ],
  //   },
  // ],
  // blog: [
  //   {
  //     text: "2023-06",
  //     items: [
  //       {
  //         text: "P-Touch P900 打印机使用",
  //         link: "/blog/2023-06/P-Touch P900 打印机使用",
  //       },
  //       { text: "Vitest 使用", link: "/blog/2023-06/15" },
  //     ],
  //   },
  //   {
  //     text: "2023-05",
  //     items: [
  //       { text: "搭建 Github 个人主页", link: "/blog/2023-05/15" },
  //       {
  //         text: "使用 SkiaSharp 实现图片水印",
  //         link: "/blog/2023-05/skiashap_watermark.md",
  //       },
  //     ],
  //   },
  //   {
  //     text: "2022",
  //     items: [
  //       {
  //         text: "从 Docker 安装 Gitea",
  //         link: "/blog/2022/从 Docker 安装 Gitea.md",
  //       },
  //       {
  //         text: "敏捷开发学习笔记",
  //         link: "/blog/2022/敏捷开发学习笔记.md",
  //       },
  //       {
  //         text: "私有nuget服务器部署",
  //         link: "/blog/2022/私有nuget服务器部署.md",
  //       },

  //       {
  //         text: "为docker配置HTTP代理服务器",
  //         link: "/blog/2022/为docker配置HTTP代理服务器.md",
  //       },
  //       {
  //         text: "私有nuget服务器部署",
  //         link: "/blog/2022/私有nuget服务器部署.md",
  //       },
  //       {
  //         text: "正向代理和反向代理",
  //         link: "/blog/2022/正向代理和反向代理.md",
  //       },
  //       {
  //         text: "正向代理和反向代理详解",
  //         link: "/blog/2022/正向代理和反向代理详解.md",
  //       },
  //     ],
  //   },
  // ],
};

export {
  sidebar
}

export default sidebar;
