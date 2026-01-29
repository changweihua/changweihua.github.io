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

  // **修正：移除嵌套语法，使用独立规则**
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

  // **修正：使用 CSS 变量方法**
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

// 类型安全的快捷方式定义
const iframeShortcuts: Shortcut[] = [
  // 基础组合
  ['iframe-responsive', 'iframe-container iframe-full'],

  // 常用比例容器
  ['iframe-16-9', 'iframe-ratio-16-9'],
  ['iframe-4-3', 'iframe-ratio-4-3'],
  ['iframe-1-1', 'iframe-ratio-1-1'],
  ['iframe-21-9', 'iframe-ratio-21-9'],

  // **修正：使用字符串拼接而不是正则表达式**
  ['iframe-complete-16-9', 'iframe-ratio-16-9 iframe-inner'],
  ['iframe-complete-4-3', 'iframe-ratio-4-3 iframe-inner'],
  ['iframe-complete-1-1', 'iframe-ratio-1-1 iframe-inner'],
  ['iframe-complete-21-9', 'iframe-ratio-21-9 iframe-inner'],

  // **添加 CSS 变量版本**
  ['iframe-var-16-9', 'iframe-ratio-16-9 iframe-var'],
]

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

  // 选择器形式的规则（正确语法）
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

// 将旧版规则转换为 Rule 类型
const legacyFormRulesConverted: Rule[] = Object.entries(legacyFormRules).map(([key, value]) => [
  key,
  { '@apply': value },
]) as Rule[]

// 按钮快捷方式 - 直接放在 shortcuts 对象中
const buttonShortcuts = {
  'btn-base': 'font-sans transition-colors duration-150 focus:outline-none',
  btn: 'btn-base inline-flex items-center justify-center',
  'btn-sm': 'btn px-3 py-1.5 text-sm rounded-md',
  'btn-md': 'btn px-4 py-2 text-base rounded-lg',
  'btn-primary': 'bg-blue-600 hover:bg-blue-700 text-white',
}

export default defineConfig({
  shortcuts: {
    'border-main': 'border-gray-400 border-opacity-30',
    'bg-main': 'bg-gray-400',
    'bg-base': 'bg-white dark:bg-hex-1a1a1a',
    'uno-card':
      'border-rd-30 bg-#FFFFFF shadow-[0px_6px_20px_0px_rgba(204,204,204,0.3)] w-100% mb-4vw p-2rem',
    'markup-card':
      'border-rd-2 bg-#FFFFFF shadow-[0px_6px_20px_0px_rgba(204,204,204,0.3)] w-100% p-0.5rem',
    ...buttonShortcuts,
    ...iframeShortcuts,
  },

  presets: [
    dataScreenPreset,
    presetWind4({
      reset: true,
      dark: 'class',
      // 禁用或自定义 :host 样式
      // ':host': false, // 完全禁用
      // 或者自定义
      ':host': {
        'font-family': 'inherit', // 继承父级字体
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
    'iframe-container',
    'iframe-full',
    'iframe-inner',
    'iframe-responsive',
    'iframe-16-9',
    'iframe-4-3',
    'iframe-1-1',
    'iframe-21-9',
    'iframe-complete-16-9',
    'iframe-complete-4-3',
    'iframe-complete-1-1',
    'iframe-complete-21-9',
    'iframe-var',
    'iframe-var-16-9',
  ],
  // **添加预检配置**
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
      `,
    },
  ],
  // 类型安全的 rules 数组
  rules: [
    textTruncateRule,
    ...dynamicPriceTagRules,
    modernInputRule,
    ...legacyFormRulesConverted,
    ...iframeRules,
    ...customPreflightRules,
    [
      /^theme-([a-z]+)-([a-z]+)$/, // 限制匹配格式
      // @ts-ignore
      ([, mode, color]) => ({
        'background-color': `rgb(var(--theme-${mode}-bg-${color}))`,
        color: `rgb(var(--theme-${mode}-text-${color}))`,
      }),
      { autocomplete: 'theme-(dark|light)-(primary|secondary)' }, // 增强 IDE 提示
    ] as any,
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
      enforce: 'pre', // 在 CSS 处理前转换
      // 启用严格模式确保语法正确
      // enforce: 'pre',
      // 启用变量支持
      varStyle: '--',
    }),
    transformerVariantGroup(),
  ],
})
