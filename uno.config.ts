import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'

export default defineConfig({
  // shortcuts: [
  //   // shortcuts to multiple utilities
  //   ['card','border-rd-30 bg-#FFFFFF shadow-[0px_6px_20px_0px_rgba(204,204,204,0.3)] w-100% mb-4vw p-2rem'],
  // ]
  // content: {
  //   pipeline: {
  //     include: [/\.vue$/, /\.md$/],
  //     // extract: {
  //     //   // 可选：打印被扫描的文件
  //     //   transform: (code, id) => {
  //     //     console.log('Scanning:', id)
  //     //     return code
  //     //   }
  //     // }
  //   },
  // },
  shortcuts: {
    "border-main": "border-gray-400 border-opacity-30",
    "bg-main": "bg-gray-400",
    "bg-base": "bg-white dark:bg-hex-1a1a1a",
    "uno-card":
      "border-rd-30 bg-#FFFFFF shadow-[0px_6px_20px_0px_rgba(204,204,204,0.3)] w-100% mb-4vw p-2rem",
    "markup-card":
      "border-rd-2 bg-#FFFFFF shadow-[0px_6px_20px_0px_rgba(204,204,204,0.3)] w-100% p-0.5rem",
  },
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
      prefix: ["i-"],
      extraProperties: {
        display: "inline-block",
      },
      collections: {
        mono: FileSystemIconLoader("src/assets/icons/mono"),
        custom: {
          circle:
            '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50"></circle></svg>',
        },
        carbon: () =>
          // @ts-ignore
          import("@iconify-json/carbon/icons.json").then((i) => i.default),
        "line-md": () =>
          // @ts-ignore
          import("@iconify-json/line-md/icons.json").then((i) => i.default),
        mdi: () =>
          // @ts-ignore
          import("@iconify-json/mdi/icons.json").then((i) => i.default),
        // ...collections
      },
    }),
  ],
  // rules: [
  //   [/^divider-x$/, () => ({
  //     'position': 'relative',
  //     '&::after': {
  //       content: '""',
  //       position: 'absolute',
  //       right: '-0.5rem',
  //       top: '0',
  //       height: '100%',
  //       width: '1px',
  //       'background-color': '#e5e7eb'
  //     }
  //   })]
  // ],
  // safelist: Object.values(icons).flat() as string[],
  theme: {
    animation: {
      keyframes: {
        'fade-in': '{0% {opacity:0;} 100% {opacity:1;}}',
        'slide-in': '{0% {transform:translateX(-100%);} 100% {transform:translateX(0);}}'
      },
      durations: {
        'fade-in': '0.5s',
        'slide-in': '0.8s'
      }
    },
    colors: {
      primary: "#3eaf7c",
    },
    fontFamily: {
      mono: "var(--vt-font-family-mono)",
    },
  },
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
