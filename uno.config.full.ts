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
  CSSObject,
} from 'unocss'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import { dataScreenPreset } from './data-screen.preset'

// 类型安全的动态规则定义
const dynamicPriceTagRules: DynamicRule[] = [
  [
    /^price-tag-(normal|flash|presale)$/,
    ([, type]) => ({
      'border-width': '2px',
      'border-style': type === 'flash' ? 'dashed' : 'solid',
      'border-color': `var(--color-${type})`,
      background: `linear-gradient(to bottom, var(--color-${type}-bg) 0%, #fff 100%)`,
    }),
  ],
]

// 使用 Record 类型确保类型安全
const legacyFormRules: Record<string, string> = {
  'old-input': 'border-1 border-gray-300 rounded-sm px-2 py-1',
  'old-select': 'bg-gray-50 border-1 border-gray-300 rounded-sm',
}

// 明确的规则定义
const textTruncateRule: Rule = [
  /^text-truncate-(\d+)$/,
  ([, lines]) => ({
    display: '-webkit-box',
    '-webkit-line-clamp': lines,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
    'text-overflow': 'ellipsis',
  }),
]

const modernInputRule: Rule = [
  'modern-input',
  {
    '@apply': 'border-2 border-primary rounded-md px-3 py-2',
    transition: 'all 0.2s ease-in',
  },
]

// 类型安全的规则定义
const iframeRules: Rule[] = [
  // 基础 iframe 容器规则
  [
    'iframe-container',
    {
      position: 'relative',
      'padding-bottom': '56.25%',
      height: '0',
      overflow: 'hidden',
    } as CSSObject,
  ],

  // iframe 元素基础规则
  [
    'iframe-full',
    {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      border: '0',
    } as CSSObject,
  ],

  // 动态宽高比规则
  [
    /^iframe-ratio-(\d+)-(\d+)$/,
    (match): CSSObject => {
      const width = parseInt(match[1], 10)
      const height = parseInt(match[2], 10)

      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        return {} as CSSObject
      }

      const paddingPercent = (height / width) * 100

      return {
        position: 'relative',
        'padding-bottom': `${paddingPercent}%`,
        height: '0',
        overflow: 'hidden',
      } as CSSObject
    },
  ],

  [
    'iframe-inner',
    {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      border: '0',
    } as CSSObject,
  ],

  [
    'iframe-var',
    {
      '--iframe-pos': 'absolute',
      '--iframe-top': '0',
      '--iframe-left': '0',
      '--iframe-w': '100%',
      '--iframe-h': '100%',
      '--iframe-border': '0',
    } as CSSObject,
  ],
]

// 将旧版规则转换为 Rule 类型
const legacyFormRulesConverted: Rule[] = Object.entries(legacyFormRules).map(([key, value]) => [
  key,
  { '@apply': value },
]) as Rule[]

// 添加自定义预检规则（Preflight）来解决 "iframe" 问题
const customPreflightRules: Rule[] = [
  // 基础 iframe 重置规则
  [
    'iframe',
    {
      border: '0',
      display: 'block',
      'max-width': '100%',
    } as CSSObject,
  ],

  // 选择器形式的规则
  [
    '.iframe-wrapper iframe',
    {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      border: '0',
    } as CSSObject,
  ],

  // 使用属性选择器
  [
    '[data-iframe]',
    {
      position: 'relative',
      'padding-bottom': '56.25%',
      height: '0',
      overflow: 'hidden',
    } as CSSObject,
  ],

  [
    '[data-iframe] iframe',
    {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      border: '0',
    } as CSSObject,
  ],
]

// 创建主题规则
const themeRule: Rule = [
  /^theme-([a-z]+)-([a-z]+)$/,
  ([, mode, color]) => ({
    'background-color': `rgb(var(--theme-${mode}-bg-${color}))`,
    color: `rgb(var(--theme-${mode}-text-${color}))`,
  }),
  { autocomplete: 'theme-(dark|light)-(primary|secondary)' },
]

// 直接定义的 shortcuts，不使用数组形式避免索引问题
const getShortcuts = (): Record<string, string | string[]> => {
  const baseShortcuts: Record<string, string> = {
    // 基础快捷方式
    'border-main': 'border-gray-400 border-opacity-30',
    'bg-main': 'bg-gray-400',
    'bg-base': 'bg-white dark:bg-hex-1a1a1a',
    'uno-card':
      'border-rd-30 bg-#FFFFFF shadow-[0px_6px_20px_0px_rgba(204,204,204,0.3)] w-100% mb-4vw p-2rem',
    'markup-card':
      'border-rd-2 bg-#FFFFFF shadow-[0px_6px_20px_0px_rgba(204,204,204,0.3)] w-100% p-0.5rem',

    // 按钮快捷方式
    'btn-base': 'font-sans transition-colors duration-150 focus:outline-none',
    btn: 'btn-base inline-flex items-center justify-center',
    'btn-sm': 'btn px-3 py-1.5 text-sm rounded-md',
    'btn-md': 'btn px-4 py-2 text-base rounded-lg',
    'btn-primary': 'bg-blue-600 hover:bg-blue-700 text-white',

    // iframe 快捷方式 - 使用字符串直接定义
    'iframe-responsive': 'iframe-container iframe-full',
    'iframe-16-9': 'iframe-ratio-16-9',
    'iframe-4-3': 'iframe-ratio-4-3',
    'iframe-1-1': 'iframe-ratio-1-1',
    'iframe-21-9': 'iframe-ratio-21-9',
    'iframe-complete-16-9': 'iframe-ratio-16-9 iframe-inner',
    'iframe-complete-4-3': 'iframe-ratio-4-3 iframe-inner',
    'iframe-complete-1-1': 'iframe-ratio-1-1 iframe-inner',
    'iframe-complete-21-9': 'iframe-ratio-21-9 iframe-inner',
    'iframe-var-16-9': 'iframe-ratio-16-9 iframe-var',
  }

  return baseShortcuts
}

export default defineConfig({
  // 定义规则 - 必须放在 shortcuts 前面
  rules: [
    // 文本截断规则
    textTruncateRule,

    // 价格标签动态规则
    ...dynamicPriceTagRules,

    // 现代输入框规则
    modernInputRule,

    // 旧版表单规则
    ...legacyFormRulesConverted,

    // iframe 规则
    ...iframeRules,

    // 自定义预检规则
    ...customPreflightRules,

    // 主题规则
    themeRule,

    // 添加一些额外规则以确保 iframe 相关类可用
    [
      'iframe-responsive-container',
      {
        position: 'relative',
        'padding-bottom': '56.25%',
        height: '0',
        overflow: 'hidden',
      } as CSSObject,
    ],
    [
      'iframe-responsive-iframe',
      {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        border: '0',
      } as CSSObject,
    ],
  ],

  // 使用函数返回 shortcuts 确保规则已注册
  shortcuts: getShortcuts(),

  presets: [
    dataScreenPreset,
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
      warn: true,
      prefix: ['i-'],
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
      collections: {
        mono: FileSystemIconLoader('src/assets/icons/mono'),
        custom: {
          circle: '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50"></circle></svg>',
        },
        ci: () => import('@opentiny/icons/json/icons.json').then((i) => i.default),
      },
    }),
  ],

  safelist: [
    'prose',
    'prose-sm',
    'mx-auto',
    'text-left',
    'text-center',
    'text-right',
    ...['normal', 'flash', 'presale'].map((type) => `price-tag-${type}`),

    // iframe 相关类 - 确保这些类可用
    'iframe-container',
    'iframe-full',
    'iframe-inner',
    'iframe-var',
    'iframe-responsive',
    'iframe-16-9',
    'iframe-4-3',
    'iframe-1-1',
    'iframe-21-9',
    'iframe-complete-16-9',
    'iframe-complete-4-3',
    'iframe-complete-1-1',
    'iframe-complete-21-9',
    'iframe-var-16-9',
    'iframe-responsive-container',
    'iframe-responsive-iframe',

    // 动态生成的类
    ...Array.from({ length: 10 }, (_, i) => `iframe-ratio-${i + 1}-${i + 1}`),
    ...Array.from({ length: 10 }, (_, i) => `text-truncate-${i + 1}`),
    ...['dark', 'light'].flatMap((mode) =>
      ['primary', 'secondary'].map((color) => `theme-${mode}-${color}`)
    ),
  ],

  preflights: [
    {
      getCSS: () => `
        /* 自定义 iframe 预检样式 */
        iframe {
          border: 0;
          display: block;
          max-width: 100%;
          border-radius: 20px;
        }

        /* 响应式 iframe 容器 */
        .iframe-wrapper {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
        }

        .iframe-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }

        /* 备用 iframe 样式 */
        .iframe-backup {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 56.25%;
          overflow: hidden;
        }

        .iframe-backup iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }
      `,
    },
  ],

  theme: {
    animation: {
      keyframes: {
        'fade-in': '{0% {opacity:0;} 100% {opacity:1;}}',
        'slide-in': '{0% {transform:translateX(-100%);} 100% {transform:translateX(0);}}',
      },
      durations: {
        'fade-in': '0.5s',
        'slide-in': '0.8s',
      },
    },
    colors: {
      primary: {
        dark: '#5eead4',
        DEFAULT: 'var(--vp-c-brand)',
      },
    },
    fontFamily: {
      sans: 'var(--font-sans)',
      mono: 'Noto Sans SC Variable',
    },
    darkMode: 'class',
  },

  transformers: [
    transformerDirectives({
      enforce: 'pre',
      varStyle: '--',
    }),
    transformerVariantGroup(),
  ],

  // 添加分层配置确保处理顺序
  layers: {
    shortcuts: 2, // shortcuts 在规则之后
    default: 1, // 默认规则层
    preflights: 0, // 预检样式最先
  },
})
