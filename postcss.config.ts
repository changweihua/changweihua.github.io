import { postcssIsolateStyles } from 'vitepress'

export default {
  plugins: [
    // autoprefixer(),
    // cssnano(),
    postcssIsolateStyles({
      includeFiles: [/vp-doc\.css/], // 默认为 /base\.css/
    }),
  ],
};
