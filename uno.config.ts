import {
  defineConfig,
  type DynamicRule,
  type Rule,
  presetAttributify,
  presetIcons,
  presetWind4,
  type Shortcut,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";
import { FileSystemIconLoader } from "@iconify/utils/lib/loader/node-loaders";
import { dataScreenPreset } from "./data-screen.preset";

// 类型安全的动态规则定义
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

// 使用 Record 类型确保类型安全
const legacyFormRules: Record<string, string> = {
  "old-input": "border-1 border-gray-300 rounded-sm px-2 py-1",
  "old-select": "bg-gray-50 border-1 border-gray-300 rounded-sm",
};

// 明确的规则定义
const textTruncateRule: Rule = [
  /^text-truncate-(\d+)$/,
  ([, lines]) => ({
    display: "-webkit-box",
    "-webkit-line-clamp": lines,
    "-webkit-box-orient": "vertical",
    overflow: "hidden",
    "text-overflow": "ellipsis",
  }),
];

const modernInputRule: Rule = [
  "modern-input",
  {
    "@apply": "border-2 border-primary rounded-md px-3 py-2",
    transition: "all 0.2s ease-in",
  },
];

// 将旧版规则转换为 Rule 类型
const legacyFormRulesConverted: Rule[] = Object.entries(legacyFormRules).map(
  ([key, value]) => [key, { "@apply": value }]
) as Rule[];

// 按钮快捷方式 - 直接放在 shortcuts 对象中
const buttonShortcuts = {
  "btn-base": "font-sans transition-colors duration-150 focus:outline-none",
  btn: "btn-base inline-flex items-center justify-center",
  "btn-sm": "btn px-3 py-1.5 text-sm rounded-md",
  "btn-md": "btn px-4 py-2 text-base rounded-lg",
  "btn-primary": "bg-blue-600 hover:bg-blue-700 text-white",
};

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
    presetWind4({
      reset: true,
      dark: "class",
      // 禁用或自定义 :host 样式
      // ':host': false, // 完全禁用
      // 或者自定义
      ":host": {
        "font-family": "inherit", // 继承父级字体
      },
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
        ci: () =>
          import("@opentiny/icons/json/icons.json").then((i) => i.default),
      },
    }),
  ],

  safelist: [
    "prose",
    "prose-sm",
    "mx-auto",
    "text-left",
    "text-center",
    "text-right",
    ...["normal", "flash", "presale"].map((type) => `price-tag-${type}`),
  ],

  // 类型安全的 rules 数组
  rules: [
    textTruncateRule,
    ...dynamicPriceTagRules,
    modernInputRule,
    ...legacyFormRulesConverted,
  ],

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
        dark: "#5eead4",
        DEFAULT: "var(--vp-c-brand)",
      },
    },
    fontFamily: {
      sans: "var(--font-sans)",
      mono: "var(--vp-font-family-mono)",
    },
    darkMode: "class",
  },

  transformers: [
    transformerDirectives({
      enforce: "pre", // 在 CSS 处理前转换
    }),
    transformerVariantGroup(),
  ],
});
