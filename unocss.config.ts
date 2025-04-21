import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
// import path from 'node:path'
// import { globSync } from 'glob'

// function getIcons() {
//   const icons = {}
//   const files = globSync('src/assets/icons/**/*.svg', { nodir: true, strict: true })
//   files.forEach((filePath) => {
//     const fileName = path.basename(filePath) // 获取文件名，包括后缀
//     const fileNameWithoutExt = path.parse(fileName).name // 获取去除后缀的文件名
//     const folderName = path.basename(path.dirname(filePath)) // 获取文件夹名
//     if (!icons[folderName]) {
//       icons[folderName] = []
//     }
//     icons[folderName].push(`i-${folderName}:${fileNameWithoutExt}`)
//   })
//   return icons
// }

// const icons = getIcons()
// const collections = Object.fromEntries(Object.keys(icons).map(item => [item, FileSystemIconLoader(`src/assets/icons/${item}`)]))

export default defineConfig({
  // shortcuts: [
  //   // shortcuts to multiple utilities
  //   ['card','border-rd-30 bg-#FFFFFF shadow-[0px_6px_20px_0px_rgba(204,204,204,0.3)] w-100% mb-4vw p-2rem'],
  // ]
  include: [
    /\.vue$/, // 扫描 Vue 组件
    /\.md$/,  // 扫描 Markdown 文件
    /\.vitepress\/theme\/.*\.vue/, // 扫描主题组件
    // 补充其他可能使用样式的文件路径
  ],
  shortcuts: {
    'border-main': 'border-gray-400 border-opacity-30',
    'bg-main': 'bg-gray-400',
    'bg-base': 'bg-white dark:bg-hex-1a1a1a',
    'uno-card': 'border-rd-30 bg-#FFFFFF shadow-[0px_6px_20px_0px_rgba(204,204,204,0.3)] w-100% mb-4vw p-2rem',
    'markup-card': 'border-rd-2 bg-#FFFFFF shadow-[0px_6px_20px_0px_rgba(204,204,204,0.3)] w-100% p-0.5rem',
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
      prefix: ['i-'],
      extraProperties: {
        display: 'inline-block',
      },
      collections: {
        mono: FileSystemIconLoader('src/assets/icons/mono'),
        custom: {
          circle: '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50"></circle></svg>',
        },
        carbon: () =>
          import('@iconify-json/carbon/icons.json').then(i => i.default),
        'line-md': () => import('@iconify-json/line-md/icons.json').then(i => i.default),
        mdi: () =>
          import('@iconify-json/mdi/icons.json').then(i => i.default),
        // ...collections
      },
    }),
  ],
  // safelist: Object.values(icons).flat() as string[],
  theme: {
    colors: {
      primary: '#3eaf7c',
    },
    fontFamily: {
      mono: 'var(--vt-font-family-mono)',
    },
  },
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
