import { postcssIsolateStyles } from 'vitepress'
import UnoCSS from 'unocss/postcss'

export default {
  plugins: [
    UnoCSS(), // 作为 PostCSS 插件运行
    postcssIsolateStyles({
      //includeFiles: [/vp-doc\.css/, /base\.css/],
    }),
  ],
}
