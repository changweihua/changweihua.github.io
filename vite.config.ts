// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import Components from "unplugin-vue-components/vite";// 自动导入vue中hook reactive ref等
import AutoImport from "unplugin-auto-import/vite"
// import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
// import { fileURLToPath } from "node:url";
import { vuePreviewPlugin } from "vite-plugin-vue-preview";
// import { ViteAliases } from "vite-aliases";
import UnoCSS from "unocss/vite";
import createExternal from 'vite-plugin-external'
import { viteExternalsPlugin } from 'vite-plugin-externals'
// import { SearchPlugin } from "vitepress-plugin-search";
import flexSearchIndexOptions from "flexsearch";
import path, { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { autoComplete, Plugin as importToCDN } from 'vite-plugin-cdn-import'
import htmlConfig from "vite-plugin-html-config";
import { viteDemoPreviewPlugin } from '@vitepress-code-preview/plugin'
import vueJsx from '@vitejs/plugin-vue-jsx'

const getEnvValue = (mode: string, target: string) => {
  const value = loadEnv(mode, path.join(process.cwd(), 'env'))[target]
  console.log(value)
  return value
}

const htmlConfigs = htmlConfig({
  headScripts: [
    // {
    //   src: 'js/cdn.jsdelivr.net_npm_luckysheet@latest_dist_plugins_js_plugin.js'
    // },
    // {
    //   src: 'js/cdn.jsdelivr.net_npm_luckysheet@latest_dist_luckysheet.umd.js'
    // },
  ],
  links: [
    // {
    //   rel: 'stylesheet',
    //   href: 'js/cdn.jsdelivr.net_npm_luckysheet@latest_dist_assets_iconfont_iconfont.css'
    // },
    // {
    //   rel: 'stylesheet',
    //   href: 'js/cdn.jsdelivr.net_npm_luckysheet@latest_dist_css_luckysheet.css'
    // },
    // {
    //   rel: 'stylesheet',
    //   href: 'js/cdn.jsdelivr.net_npm_luckysheet@latest_dist_plugins_css_pluginsCss.css'
    // },
    // {
    //   rel: 'stylesheet',
    //   href: 'js/cdn.jsdelivr.net_npm_luckysheet@latest_dist_plugins_plugins.css'
    // },
  ],
  // preHeadScripts: [
  //   `var msg = 'pre head script'
  //   console.log(msg);`,
  //   {
  //     async: true,
  //     src: 'https://abc.com/b.js',
  //     type: 'module',
  //   },
  //   { content: `console.log('hello')`, charset: 'utf-8' },
  // ],
  // scripts: [
  //   `var msg = 'body script'
  //    console.log(msg);`,
  //   {
  //     async: true,
  //     src: 'https://abc.com/b.js',
  //     type: 'module',
  //   },
  // ],
  metas: [
    {
      name: "keywords",
      content: "CMONO.NET,changweihua,常伟华,Lance,changweihua.github.io,Vite,VitePress,AntDesign",
    },
    {
      name: "description",
      content: "CMONO.NET 官方站点，主要记录平时工作总结及项目经历",
    },
    {
      bar: "custom meta",
    },
  ],
});

// 分词器来源
// https://wenjiangs.com/article/segment.html
// https://github.com/leizongmin/node-segment
// 安装：
// yarn add segment -D
// 以下为样例

// 载入模块
import Segment from 'segment';
import { truncateSync } from "node:fs";
// 创建实例
const segment = new Segment();
// 使用默认的识别模块及字典，载入字典文件需要1秒，仅初始化时执行一次即可
segment.useDefault();
// 开始分词
// console.log(segment.doSegment('这是一个基于Node.js的中文分词模块。'));

//default options
const options = {
  ...flexSearchIndexOptions,
  // 采用分词器优化，
  encode: function (str) {
    return segment.doSegment(str, { simple: true });
  },
  tokenize: "forward", // 解决汉字搜索问题。来源：https://github.com/emersonbottero/vitepress-plugin-search/issues/11

  // 以下代码返回完美的结果，但内存与空间消耗巨大，索引文件达到80M+
  // encode: false,
  // tokenize: "full",
  previewLength: 50, //搜索结果预览长度
  buttonLabel: "搜索",
  placeholder: "情输入关键词",
  allow: [],
  ignore: [],
};

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5999,
    hmr: {
      overlay: false,
    },
    fs: {
      allow: [resolve(__dirname, "..")],
    },
  },
  clearScreen: false, // 设为 false 可以避免 Vite 清屏而错过在终端中打印某些关键信息
  // assetsInclude: ["**/*.gltf"], // 指定额外的 picomatch 模式 作为静态资源处理
  build: {
    sourcemap: process.env.NODE_ENV !== 'production', // Seems to cause JavaScript heap out of memory errors on build
    minify: true, // 必须开启：使用terserOptions才有效果
    // terserOptions: {
    //   compress: {
    //     //生产环境时移除console
    //     drop_console: true,
    //     drop_debugger: true,
    //   },
    // },
    chunkSizeWarningLimit: 2000, // 设置 chunk 大小警告的限制为 2000 KiB
    // chunkSizeLimit: 5000, // 设置 chunk 大小的限制为 5000 KiB
    emptyOutDir: true, // 在构建之前清空输出目录
    // rollupOptions: {
    //   output: {
    //     format: 'iife'
    //   }
    // },
    // rollupOptions: {
    //   cache: false,
    //   maxParallelFileOps: 2,
    //   output: {
    //     // 分包
    //     manualChunks(id) {
    //       if (id.includes("node_modules")) {
    //         return id
    //           .toString()
    //           .split("node_modules/")[1]
    //           .split("/")[0]
    //           .toString();
    //       }
    //     },
    //   },
    // },
    // rollupOptions: {
    //   output: {
    //     manualChunks(id) {
    //       if (id.includes('node_modules')) {
    //         // 分解块，将大块分解成更小的块,在vite.config.js当中的build下面进行配置
    //         return id.toString().split('node_modules/')[1].split('/')[0].toString();
    //         // 但是生成的文件都在dist下面的assets文件下，里面既有js、css等等。
    //       }
    //     },
    //     // 可以将不同的文件放在不同的文件下
    //     chunkFileNames: (chunkInfo) => {
    //       const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/') : [];
    //       const fileName = facadeModuleId[facadeModuleId.length - 2] || '[name]';
    //       return `js/${fileName}/[name].[hash].js`;
    //     }
    //   }
    // },
  },
  define: {
    'process.env': {},
    // 注意要用 JSON.stringify
    'process.env.RSS_BASE': JSON.stringify(`${getEnvValue(process.env.NODE_ENV || 'github', 'VITE_APP_RSS_BASE_URL')}`),
  },
  plugins: [
    viteDemoPreviewPlugin(),
    vueJsx(),
    // htmlConfigs,
    // removeConsole(),
    // custom
    // MarkdownTransform(),
    // AutoImport({
    //   //安装两行后，在组件中不用再导入ref，reactive等
    //   imports: ['vue', 'vue-router'],
    //   dts: "src/auto-import.d.ts",
    // }),
    // AutoImport({
    //   imports:["vue","vue-router"],
    //   dts:'src/auto-import.d.ts',   // 路径下自动生成文件夹存放全局指令
    //   // dts: true, // 会在根目录生成auto-imports.d.ts，里面可以看到自动导入的api
    //   include: [/\.[tj]sx?$/, /\.vue$/], // 匹配的文件，也就是哪些后缀的文件需要自动引入
    //   // 根据项目情况配置eslintrc，默认是不开启的
    //   eslintrc: {
    //     enabled: true // @default false
    //     // 下面两个是其他配置，默认即可
    //     // 输出一份json文件，默认输出路径为./.eslintrc-auto-import.json
    //     // filepath: './.eslintrc-auto-import.json', // @default './.eslintrc-auto-import.json'
    //     // globalsPropValue: true, // @default true 可设置 boolean | 'readonly' | 'readable' | 'writable' | 'writeable'
    //   }
    // }),
    // styleImport({
    //   resolves: [
    //     AndDesignVueResolve()
    //   ],
    //   // 自定义规则
    //   libs: [
    //     {
    //       libraryName: 'ant-design-vue',
    //       esModule: true,
    //       resolveStyle: (name) => {
    //         return `ant-design-vue/es/${name}/style/index`
    //       }
    //     }
    //   ]
    // }),
    Components({
      dirs: resolve(__dirname, "./src/components"),
      include: [/\.vue$/, /\.vue\?vue/],
      dts: "./typings/components.d.ts",
      transformer: "vue3",
      resolvers: [
        // AntdvResolver(),
        IconsResolver(),
        // AntDesignVueResolver({
        //   importStyle: true, // css in js
        //   resolveIcons: true
        // }),
      ],
    }),
    Icons({ autoInstall: true }),
    vuePreviewPlugin({
      props: {
        previewBodyStyle: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
        previewAppStyle: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          fontFamily: "JetBrainsMono, AlibabaPuHuiTi",
        },
        importMap: {
          "@vue/shared":
            "https://unpkg.com/@vue/shared@latest/dist/shared.esm-bundler.js",
        },
      },
    }),
    // vitePluginMonitor({
    //   // log: false,
    //   monitor(label, time, originData) {
    //     if (originData) {
    //       const { time1, time2, originValue, chalkValue } = originData;
    //       console.log(originValue);
    //       console.log(chalkValue);
    //       console.log(label, time1, time2, `${time}ms`);
    //     }
    //   },
    //   debug(str) {
    //     // 打印完整日志
    //     // process.stdout.write(str)
    //   },
    // }),
    // ViteAliases({
    //   /**
    //    * Relative path to the project directory
    //    */
    //   dir: "src",
    //   /**
    //    * Prefix symbol for the aliases
    //    */
    //   prefix: "~",
    //   /**
    //    * Allow searching for subdirectories
    //    */
    //   deep: true,
    //   /**
    //    * Search depthlevel for subdirectories
    //    */
    //   depth: 1,
    //   /**
    //    * Creates a Logfile
    //    * use `logPath` to change the location
    //    */
    //   createLog: false,
    //   /**
    //    * Path for Logfile
    //    */
    //   logPath: "src/logs",
    //   /**
    //    * Create global project directory alias
    //    */
    //   createGlobalAlias: true,
    //   /**
    //    * Turns duplicates into camelCased path aliases
    //    */
    //   adjustDuplicates: false,
    //   /**
    //    * Used paths in JS/TS configs will now be relative to baseUrl
    //    */
    //   useAbsolute: false,
    //   /**
    //    * Adds seperate index paths
    //    * approach created by @davidohlin
    //    */
    //   useIndexes: false,
    //   /**
    //    * Generates paths in IDE config file
    //    * works with JS or TS
    //    */
    //   useConfig: true,
    //   /**
    //    * Override config paths
    //    */
    //   ovrConfig: false,
    //   /**
    //    * Will generate Paths in tsconfig
    //    * used in combination with `useConfig`
    //    * Typescript will be auto detected
    //    */
    //   dts: false,
    //   /**
    //    * Disables any terminal output
    //    */
    //   silent: true,
    //   /**
    //    * Root path of Vite project
    //    */
    //   root: process.cwd(),
    // }),
    // SearchPlugin(options),
    UnoCSS(),
    // createExternal({
    //   externals: {
    //     vue: 'Vue',
    //   },
    // }),
    // importToCDN({
    //   modules: [
    //     'vue',
    //     {
    //       name: 'vue-demi',
    //       var: 'VueDemi',
    //       path: `https://unpkg.com/vue-demi@0.14.10`,
    //     },
    //     // {
    //     //   name: 'element-plus',
    //     //   var: 'ElementPlus', //根据main.js中定义的来
    //     //   // version: '2.2.17',
    //     //   path: 'dist/index.full.js',
    //     //   css: 'dist/index.css'
    //     // }
    //   ],
    //   enableInDevMode: true
    // }),
    // viteExternalsPlugin({
    //   vue: 'Vue',
    //   // react: 'React',
    //   // 'react-dom': 'ReactDOM',
    //   // // value support chain, transform to window['React']['lazy']
    //   // lazy: ['React', 'lazy']
    // }, { disableInServe: true }),
  ],
  resolve: {
    alias: {
      // "@": fileURLToPath(new URL(".", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@vp": fileURLToPath(new URL("./.vitepress", import.meta.url)),
      public: fileURLToPath(new URL("./public", import.meta.url)),
      "~": path.resolve(__dirname, "./"),
      // "@": resolve(__dirname, "src"),
      // // 注意一定不要随意命名，a b c这样的，项目的目录也不能为关键字保留字！！
      // "comp": resolve(__dirname, "src/components"),
      // // 配置图片要这样引用
      // "/img": "./src/assets",
    },
    // dedupe: [], // 强制 Vite 始终将列出的依赖项解析为同一副本
    // conditions: [], // 解决程序包中 情景导出 时的其他允许条件
    // mainFields: [], // 解析包入口点尝试的字段列表
    // extensions: ['.js', '.ts', '.json'] // 导入时想要省略的扩展名列表
  },
  ssr: {
    noExternal: [
      // 如果还有别的依赖需要添加的话，并排填写和配置到这里即可
      // '@nolebase/vitepress-plugin-enhanced-readabilities/client',
      // '@nolebase/vitepress-plugin-highlight-targeted-heading/client',
    ],
  },
  optimizeDeps: {
    include: [
      "vitepress-plugin-nprogress",
      // '@nolebase/vitepress-plugin-enhanced-readabilities/client > @nolebase/ui > @rive-app/canvas',
      // '@nolebase/vitepress-plugin-highlight-targeted-heading/client',
    ],
    exclude: ['vitepress', 'svg2roughjs'],
  },
  // resolve: {
  //   alias: {
  //     'mermaid': 'mermaid/dist/mermaid.esm.mjs',
  //   },
  // },
});
