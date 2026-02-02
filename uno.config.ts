import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import { dataScreenPreset } from './data-screen.preset'

export default defineConfig({
  // 核心优化：减少预置和规则
  presets: [
    // 只保留必需的预设
    presetWind4({
      reset: true,
      dark: 'class',
      ':host': {
        'font-family': 'inherit',
      },
    }),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: false, // 关闭警告减少内存
      prefix: ['i-'],
      collections: {
        mono: FileSystemIconLoader('src/assets/icons/mono'),
      },
    }),
  ],

  // 简化规则，只保留最常用的
  rules: [
    // 文本截断
    [
      /^text-truncate-(\d+)$/,
      ([, lines]) => ({
        display: '-webkit-box',
        '-webkit-line-clamp': lines,
        '-webkit-box-orient': 'vertical',
        overflow: 'hidden',
      }),
    ],

    // 价格标签
    [
      /^price-tag-(normal|flash|presale)$/,
      ([, type]) => ({
        border: `2px ${type === 'flash' ? 'dashed' : 'solid'} var(--color-${type})`,
      }),
    ],
  ],

  // 使用对象格式的 shortcuts，更简洁
  shortcuts: {
    // 基础
    'border-main': 'border-gray-400/30',
    'bg-main': 'bg-gray-400',
    'bg-base': 'bg-white dark:bg-gray-900',

    // 卡片
    'uno-card': 'rounded-30 bg-white shadow-lg w-full mb-4 p-8',
    'markup-card': 'rounded-2 bg-white shadow-lg w-full p-2',

    // 按钮
    btn: 'font-sans transition-colors focus:outline-none inline-flex items-center justify-center',
    'btn-sm': 'btn px-3 py-1.5 text-sm rounded-md',
    'btn-md': 'btn px-4 py-2 text-base rounded-lg',
    'btn-primary': 'bg-blue-600 hover:bg-blue-700 text-white',

    // iframe - 使用简单组合
    'iframe-container': 'relative w-full h-0 pb-[56.25%] overflow-hidden',
    'iframe-full': 'absolute top-0 left-0 w-full h-full border-0',

    // iframe 快捷方式使用直接类名
    'iframe-responsive': 'relative w-full h-0 pb-[56.25%] overflow-hidden',
  },

  // 减少 safelist 数量
  safelist: [
    'prose',
    'prose-sm',
    'mx-auto',
    'text-left',
    'text-center',
    'text-right',
    'btn',
    'btn-sm',
    'btn-md',
    'btn-primary',
    'iframe-responsive',
  ],

  // 简化预检样式
  preflights: [
    {
      getCSS: () => `
        iframe {
          border: 0;
          max-width: 100%;
        }
      `,
    },
  ],

  theme: {
    colors: {
      primary: {
        dark: '#5eead4',
        DEFAULT: '#3b82f6',
      },
    },
    fontFamily: {
      sans: 'system-ui, -apple-system, sans-serif',
    },
  },

  transformers: [
    transformerDirectives({
      enforce: 'pre',
    }),
    transformerVariantGroup(),
  ],
})
