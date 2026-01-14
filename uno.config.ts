import {
  defineConfig,
  DynamicRule,
  presetAttributify,
  presetIcons,
  presetWind4,
  Shortcut,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";
import { FileSystemIconLoader } from "@iconify/utils/lib/loader/node-loaders";
import { dataScreenPreset } from "./data-screen.preset";

const dynamicPriceTagRules: DynamicRule[] = [
  [
    /^price-tag-(normal|flash|presale)$/,
    ([, type]) => ({
      "border-width": "2px",
      "border-style": type === "flash" ? "dashed" : "solid",
      "border-color": `var(--color-${type})`,
      background: `linear-gradient(to bottom, var(--color-${type}-bg) 0%, #fff 100%)`,
    }),
  ],
];

// 旧版表单样式迁移
const legacyFormRules = {
  "old-input": "border-1 border-gray-300 rounded-sm px-2 py-1",
  "old-select": "bg-gray-50 border-1 border-gray-300 rounded-sm",
} as const;

// 按钮快捷组合
const buttonShortcuts: Shortcut[] = [
  ["btn-base", "font-sans transition-colors duration-150 focus:outline-none"],
  ["btn", "btn-base inline-flex items-center justify-center"],
  ["btn-sm", "btn px-3 py-1.5 text-sm rounded-md"],
  ["btn-md", "btn px-4 py-2 text-base rounded-lg"],
  ["btn-primary", "bg-blue-600 hover:bg-blue-700 text-white"],
];

// export const bemTransformer: Transformer = {
//   name: 'bem',
//   enforce: 'pre',
//   transform(code) {
//     return code.replace(/(block)--(modifier)/g, 'block-modifier_$2')
//               .replace(/(block)__(element)/g, 'block_$2')
//   }
// }

export default defineConfig({
  shortcuts: {
    "border-main": "border-gray-400 border-opacity-30",
    "bg-main": "bg-gray-400",
    "bg-base": "bg-white dark:bg-hex-1a1a1a",
    "uno-card":
      "border-rd-30 bg-#FFFFFF shadow-[0px_6px_20px_0px_rgba(204,204,204,0.3)] w-100% mb-4vw p-2rem",
    "markup-card":
      "border-rd-2 bg-#FFFFFF shadow-[0px_6px_20px_0px_rgba(204,204,204,0.3)] w-100% p-0.5rem",
    ...buttonShortcuts,
  },
  presets: [
    dataScreenPreset,
    // presetWind3({
    //   dark: 'class' // 关键配置：告知 UnoCSS 使用类名模式而非媒体查询
    // }),
    presetWind4({
      // wind4 内置了重置样式，可通过 reset 选项启用
      reset: true,
      dark: "class", // 关键配置：告知 UnoCSS 使用类名模式而非媒体查询
    }),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
      prefix: ["i-"],
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
      },
      collections: {
        mono: FileSystemIconLoader("src/assets/icons/mono"),
        custom: {
          circle:
            '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50"></circle></svg>',
        },
        // carbon: () =>
        //   import("@iconify-json/carbon/icons.json").then((i) => i.default),
        // "line-md": () =>
        //   import("@iconify-json/line-md/icons.json").then((i) => i.default),
        // mdi: () =>
        //   import("@iconify-json/mdi/icons.json").then((i) => i.default),
        // logos: () =>
        //   import("@iconify-json/logos/icons.json", {
        //     assert: { type: "json" },
        //   }).then((i) => i.default),
        ci: () =>
          import("@opentiny/icons/json/icons.json", {
            assert: { type: "json" },
          }).then((i) => i.default),
        // ...collections
      },
    }),
  ],
  // 2. 安全列表 (针对 VitePress 的特别设置)
  safelist: [
    // 为 VitePress 的某些元素预生成常用样式，确保它们始终可用
    "prose",
    "prose-sm",
    "mx-auto", // 用于 Markdown 内容容器
    "text-left",
    "text-center",
    "text-right", // 文本对齐
    ...["normal", "flash", "presale"].map((type) => `price-tag-${type}`),
  ],
  rules: [
    // 多行文本截断工具类 text-truncate-2
    // 多行文本截断已自带了:line-clamp-2， line-clamp-3
    // @ts-ignore
    [
      /^text-truncate-(\d+)$/,
      ([, lines]) => ({
        display: "-webkit-box",
        "-webkit-line-clamp": lines,
        "-webkit-box-orient": "vertical",
        overflow: "hidden",
        "text-overflow": "ellipsis",
      }),
    ],
    // @ts-ignore
    ...dynamicPriceTagRules,
    // @ts-ignore
    [
      // @ts-ignore
      "modern-input",
      {
        // @ts-ignore
        "@apply": "border-2 border-primary rounded-md px-3 py-2",
        // @ts-ignore
        transition: "all 0.2s ease-in",
      },
    ],
    // @ts-ignore
    ...Object.entries(legacyFormRules).map(([key, value]) => [
      key,
      { "@apply": value },
    ]),
    // // @ts-ignore
    // [
    //   /^divider-x$/,
    //   () => ({
    //     position: "relative",
    //     "&::after": {
    //       content: '""',
    //       position: "absolute",
    //       right: "-0.5rem",
    //       top: "0",
    //       height: "100%",
    //       width: "1px",
    //       "background-color": "#e5e7eb",
    //     },
    //   }),
    // ],
  ],
  // safelist: Object.values(icons).flat() as string[],
  theme: {
    animation: {
      keyframes: {
        "fade-in": "{0% {opacity:0;} 100% {opacity:1;}}",
        "slide-in":
          "{0% {transform:translateX(-100%);} 100% {transform:translateX(0);}}",
      },
      durations: {
        "fade-in": "0.5s",
        "slide-in": "0.8s",
      },
    },
    colors: {
      primary: {
        dark: "#5eead4", // 暗色系青绿色
        DEFAULT: "var(--vp-c-brand)",
      },
    },
    fontFamily: {
      sans: "var(--vp-font-family-base)",
      mono: "var(--vp-font-family-mono)",
    },
    darkMode: "class", // 基于CSS类名切换
  },
  transformers: [transformerDirectives(), transformerVariantGroup()],
  // 统一暗色开关：与 VitePress 的 class="dark" 对齐（推荐）
  // dark: 'class', // 或者用选择器对象：dark: { light: '.light', dark: '.dark' }
  // 如需更强的类型提示，可补充安全列表（可选）
  // safelist: ['dark']
});
