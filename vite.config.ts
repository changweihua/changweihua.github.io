// vite.config.ts
import { defineConfig } from "vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
// import { fileURLToPath } from "node:url";
import { vuePreviewPlugin } from "vite-plugin-vue-preview";
import AntdvResolver from "antdv-component-resolver";
import { ViteAliases } from "vite-aliases";
import UnoCSS from 'unocss/vite'
import { SearchPlugin } from "vitepress-plugin-search";
import flexSearchIndexOptions from "flexsearch";
import path, { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import htmlConfig from 'vite-plugin-html-config';
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
      name: 'keywords',
      content: 'vite html meta keywords',
    },
    {
      name: 'description',
      content: 'vite html meta description',
    },
    {
      bar: 'custom meta',
    },
  ],
});

// import vitePluginMonitor from "vite-plugin-monitor";
// import AutoImport from 'unplugin-auto-import/vite'
// import { MarkdownTransform } from './.vitepress/plugins/markdownTransform'
// import styleImport, {
//   AndDesignVueResolve
// } from 'vite-plugin-style-import'

//default options
var options = {
  ...flexSearchIndexOptions,
  previewLength: 100, //搜索结果预览长度
  buttonLabel: "搜索",
  placeholder: "情输入关键词",
};

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    hmr: {
      overlay: false,
    },
    fs: {
      allow: [
        resolve(__dirname, '..'),
      ],
    },
  },
  plugins: [
    htmlConfigs,
    // custom
    // MarkdownTransform(),
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
      dts: "./components.d.ts",
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
    SearchPlugin(options),
    UnoCSS()
  ],
  resolve: {
    alias: {
      // "@": fileURLToPath(new URL(".", import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      public: fileURLToPath(new URL('./public', import.meta.url)),
      "~": path.resolve(__dirname, './src/'),
    },
  },
  ssr: {
    noExternal: ["vitepress-plugin-nprogress"],
  },
  // resolve: {
  //   alias: {
  //     'mermaid': 'mermaid/dist/mermaid.esm.mjs',
  //   },
  // },
});
