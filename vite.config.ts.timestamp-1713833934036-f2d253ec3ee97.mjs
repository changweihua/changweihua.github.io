// vite.config.ts
import { defineConfig, loadEnv } from "file:///D:/Github/changweihua.github.io/node_modules/vite/dist/node/index.js";
import Icons from "file:///D:/Github/changweihua.github.io/node_modules/unplugin-icons/dist/vite.js";
import IconsResolver from "file:///D:/Github/changweihua.github.io/node_modules/unplugin-icons/dist/resolver.js";
import Components from "file:///D:/Github/changweihua.github.io/node_modules/unplugin-vue-components/dist/vite.js";
import { vuePreviewPlugin } from "file:///D:/Github/changweihua.github.io/node_modules/vite-plugin-vue-preview/dist/index.js";
import UnoCSS from "file:///D:/Github/changweihua.github.io/node_modules/unocss/dist/vite.mjs";
import { SearchPlugin } from "file:///D:/Github/changweihua.github.io/node_modules/vitepress-plugin-search/dist/vitepress-plugin-search.es.mjs";
import flexSearchIndexOptions from "file:///D:/Github/changweihua.github.io/node_modules/flexsearch/dist/flexsearch.bundle.min.js";
import path, { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import htmlConfig from "file:///D:/Github/changweihua.github.io/node_modules/vite-plugin-html-config/dist/index.js";
import Segment from "file:///D:/Github/changweihua.github.io/node_modules/segment/index.js";
var __vite_injected_original_dirname = "D:\\Github\\changweihua.github.io";
var __vite_injected_original_import_meta_url = "file:///D:/Github/changweihua.github.io/vite.config.ts";
var getEnvValue = (mode, target) => {
  const value = loadEnv(mode, path.join(process.cwd(), "env"))[target];
  console.log(value);
  return value;
};
var htmlConfigs = htmlConfig({
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
      content: "CMONO.NET,changweihua,\u5E38\u4F1F\u534E,Lance,changweihua.github.io,Vite,VitePress,AntDesign"
    },
    {
      name: "description",
      content: "CMONO.NET \u5B98\u65B9\u7AD9\u70B9\uFF0C\u4E3B\u8981\u8BB0\u5F55\u5E73\u65F6\u5DE5\u4F5C\u603B\u7ED3\u53CA\u9879\u76EE\u7ECF\u5386"
    },
    {
      bar: "custom meta"
    }
  ]
});
var segment = new Segment();
segment.useDefault();
var options = {
  ...flexSearchIndexOptions,
  // 采用分词器优化，
  encode: function(str) {
    return segment.doSegment(str, { simple: true });
  },
  tokenize: "forward",
  // 解决汉字搜索问题。来源：https://github.com/emersonbottero/vitepress-plugin-search/issues/11
  // 以下代码返回完美的结果，但内存与空间消耗巨大，索引文件达到80M+
  // encode: false,
  // tokenize: "full",
  previewLength: 50,
  //搜索结果预览长度
  buttonLabel: "\u641C\u7D22",
  placeholder: "\u60C5\u8F93\u5165\u5173\u952E\u8BCD",
  allow: [],
  ignore: []
};
var vite_config_default = defineConfig({
  server: {
    port: 5999,
    hmr: {
      overlay: false
    },
    fs: {
      allow: [resolve(__vite_injected_original_dirname, "..")]
    }
  },
  clearScreen: false,
  // 设为 false 可以避免 Vite 清屏而错过在终端中打印某些关键信息
  // assetsInclude: ["**/*.gltf"], // 指定额外的 picomatch 模式 作为静态资源处理
  build: {
    sourcemap: process.env.NODE_ENV !== "production",
    // Seems to cause JavaScript heap out of memory errors on build
    minify: true,
    // 必须开启：使用terserOptions才有效果
    // terserOptions: {
    //   compress: {
    //     //生产环境时移除console
    //     drop_console: true,
    //     drop_debugger: true,
    //   },
    // },
    chunkSizeWarningLimit: 2e3,
    // 设置 chunk 大小警告的限制为 2000 KiB
    // chunkSizeLimit: 5000, // 设置 chunk 大小的限制为 5000 KiB
    emptyOutDir: true
    // 在构建之前清空输出目录
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
    "process.env": {},
    // 注意要用 JSON.stringify
    "process.env.RSS_BASE": JSON.stringify(`${getEnvValue(process.env.NODE_ENV || "github", "VITE_APP_RSS_BASE_URL")}`)
  },
  plugins: [
    // htmlConfigs,
    // removeConsole(),
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
      dirs: resolve(__vite_injected_original_dirname, "./src/components"),
      include: [/\.vue$/, /\.vue\?vue/],
      dts: "./typings/components.d.ts",
      transformer: "vue3",
      resolvers: [
        // AntdvResolver(),
        IconsResolver()
        // AntDesignVueResolver({
        //   importStyle: true, // css in js
        //   resolveIcons: true
        // }),
      ]
    }),
    Icons({ autoInstall: true }),
    vuePreviewPlugin({
      props: {
        previewBodyStyle: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        },
        previewAppStyle: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          fontFamily: "JetBrainsMono, AlibabaPuHuiTi"
        },
        importMap: {
          "@vue/shared": "https://unpkg.com/@vue/shared@latest/dist/shared.esm-bundler.js"
        }
      }
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
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)),
      "@vp": fileURLToPath(new URL("./.vitepress", __vite_injected_original_import_meta_url)),
      public: fileURLToPath(new URL("./public", __vite_injected_original_import_meta_url)),
      "~": path.resolve(__vite_injected_original_dirname, "./")
      // "@": resolve(__dirname, "src"),
      // // 注意一定不要随意命名，a b c这样的，项目的目录也不能为关键字保留字！！
      // "comp": resolve(__dirname, "src/components"),
      // // 配置图片要这样引用
      // "/img": "./src/assets",
    }
    // dedupe: [], // 强制 Vite 始终将列出的依赖项解析为同一副本
    // conditions: [], // 解决程序包中 情景导出 时的其他允许条件
    // mainFields: [], // 解析包入口点尝试的字段列表
    // extensions: ['.js', '.ts', '.json'] // 导入时想要省略的扩展名列表
  },
  ssr: {
    noExternal: [
      // 如果还有别的依赖需要添加的话，并排填写和配置到这里即可
      "@nolebase/vitepress-plugin-enhanced-readabilities",
      "@nolebase/vitepress-plugin-highlight-targeted-heading"
    ]
  },
  optimizeDeps: {
    include: [
      "vitepress-plugin-nprogress",
      "@nolebase/vitepress-plugin-enhanced-readabilities > @nolebase/ui > @rive-app/canvas",
      "@nolebase/vitepress-plugin-highlight-targeted-heading"
    ],
    exclude: ["vitepress"]
  }
  // resolve: {
  //   alias: {
  //     'mermaid': 'mermaid/dist/mermaid.esm.mjs',
  //   },
  // },
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9HaXRodWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvL3ZpdGUuY29uZmlnLnRzXCI7Ly8gdml0ZS5jb25maWcudHNcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IEljb25zIGZyb20gXCJ1bnBsdWdpbi1pY29ucy92aXRlXCI7XHJcbmltcG9ydCBJY29uc1Jlc29sdmVyIGZyb20gXCJ1bnBsdWdpbi1pY29ucy9yZXNvbHZlclwiO1xyXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tIFwidW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZVwiO1xyXG4vLyBpbXBvcnQgeyBBbnREZXNpZ25WdWVSZXNvbHZlciB9IGZyb20gXCJ1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnNcIjtcclxuLy8gaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gXCJub2RlOnVybFwiO1xyXG5pbXBvcnQgeyB2dWVQcmV2aWV3UGx1Z2luIH0gZnJvbSBcInZpdGUtcGx1Z2luLXZ1ZS1wcmV2aWV3XCI7XHJcbi8vIGltcG9ydCBBbnRkdlJlc29sdmVyIGZyb20gXCJhbnRkdi1jb21wb25lbnQtcmVzb2x2ZXJcIjtcclxuLy8gaW1wb3J0IHsgVml0ZUFsaWFzZXMgfSBmcm9tIFwidml0ZS1hbGlhc2VzXCI7XHJcbmltcG9ydCBVbm9DU1MgZnJvbSBcInVub2Nzcy92aXRlXCI7XHJcbmltcG9ydCB7IFNlYXJjaFBsdWdpbiB9IGZyb20gXCJ2aXRlcHJlc3MtcGx1Z2luLXNlYXJjaFwiO1xyXG5pbXBvcnQgZmxleFNlYXJjaEluZGV4T3B0aW9ucyBmcm9tIFwiZmxleHNlYXJjaFwiO1xyXG5pbXBvcnQgcGF0aCwgeyByZXNvbHZlIH0gZnJvbSBcIm5vZGU6cGF0aFwiO1xyXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSBcIm5vZGU6dXJsXCI7XHJcbmltcG9ydCBodG1sQ29uZmlnIGZyb20gXCJ2aXRlLXBsdWdpbi1odG1sLWNvbmZpZ1wiO1xyXG5jb25zdCBnZXRFbnZWYWx1ZSA9IChtb2RlOiBzdHJpbmcsIHRhcmdldDogc3RyaW5nKSA9PiB7XHJcbiAgY29uc3QgdmFsdWUgPSBsb2FkRW52KG1vZGUsIHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnZW52JykpW3RhcmdldF1cclxuICBjb25zb2xlLmxvZyh2YWx1ZSlcclxuICByZXR1cm4gdmFsdWVcclxufVxyXG5cclxuY29uc3QgaHRtbENvbmZpZ3MgPSBodG1sQ29uZmlnKHtcclxuICBoZWFkU2NyaXB0czogW1xyXG4gICAgLy8ge1xyXG4gICAgLy8gICBzcmM6ICdqcy9jZG4uanNkZWxpdnIubmV0X25wbV9sdWNreXNoZWV0QGxhdGVzdF9kaXN0X3BsdWdpbnNfanNfcGx1Z2luLmpzJ1xyXG4gICAgLy8gfSxcclxuICAgIC8vIHtcclxuICAgIC8vICAgc3JjOiAnanMvY2RuLmpzZGVsaXZyLm5ldF9ucG1fbHVja3lzaGVldEBsYXRlc3RfZGlzdF9sdWNreXNoZWV0LnVtZC5qcydcclxuICAgIC8vIH0sXHJcbiAgXSxcclxuICBsaW5rczogW1xyXG4gICAgLy8ge1xyXG4gICAgLy8gICByZWw6ICdzdHlsZXNoZWV0JyxcclxuICAgIC8vICAgaHJlZjogJ2pzL2Nkbi5qc2RlbGl2ci5uZXRfbnBtX2x1Y2t5c2hlZXRAbGF0ZXN0X2Rpc3RfYXNzZXRzX2ljb25mb250X2ljb25mb250LmNzcydcclxuICAgIC8vIH0sXHJcbiAgICAvLyB7XHJcbiAgICAvLyAgIHJlbDogJ3N0eWxlc2hlZXQnLFxyXG4gICAgLy8gICBocmVmOiAnanMvY2RuLmpzZGVsaXZyLm5ldF9ucG1fbHVja3lzaGVldEBsYXRlc3RfZGlzdF9jc3NfbHVja3lzaGVldC5jc3MnXHJcbiAgICAvLyB9LFxyXG4gICAgLy8ge1xyXG4gICAgLy8gICByZWw6ICdzdHlsZXNoZWV0JyxcclxuICAgIC8vICAgaHJlZjogJ2pzL2Nkbi5qc2RlbGl2ci5uZXRfbnBtX2x1Y2t5c2hlZXRAbGF0ZXN0X2Rpc3RfcGx1Z2luc19jc3NfcGx1Z2luc0Nzcy5jc3MnXHJcbiAgICAvLyB9LFxyXG4gICAgLy8ge1xyXG4gICAgLy8gICByZWw6ICdzdHlsZXNoZWV0JyxcclxuICAgIC8vICAgaHJlZjogJ2pzL2Nkbi5qc2RlbGl2ci5uZXRfbnBtX2x1Y2t5c2hlZXRAbGF0ZXN0X2Rpc3RfcGx1Z2luc19wbHVnaW5zLmNzcydcclxuICAgIC8vIH0sXHJcbiAgXSxcclxuICAvLyBwcmVIZWFkU2NyaXB0czogW1xyXG4gIC8vICAgYHZhciBtc2cgPSAncHJlIGhlYWQgc2NyaXB0J1xyXG4gIC8vICAgY29uc29sZS5sb2cobXNnKTtgLFxyXG4gIC8vICAge1xyXG4gIC8vICAgICBhc3luYzogdHJ1ZSxcclxuICAvLyAgICAgc3JjOiAnaHR0cHM6Ly9hYmMuY29tL2IuanMnLFxyXG4gIC8vICAgICB0eXBlOiAnbW9kdWxlJyxcclxuICAvLyAgIH0sXHJcbiAgLy8gICB7IGNvbnRlbnQ6IGBjb25zb2xlLmxvZygnaGVsbG8nKWAsIGNoYXJzZXQ6ICd1dGYtOCcgfSxcclxuICAvLyBdLFxyXG4gIC8vIHNjcmlwdHM6IFtcclxuICAvLyAgIGB2YXIgbXNnID0gJ2JvZHkgc2NyaXB0J1xyXG4gIC8vICAgIGNvbnNvbGUubG9nKG1zZyk7YCxcclxuICAvLyAgIHtcclxuICAvLyAgICAgYXN5bmM6IHRydWUsXHJcbiAgLy8gICAgIHNyYzogJ2h0dHBzOi8vYWJjLmNvbS9iLmpzJyxcclxuICAvLyAgICAgdHlwZTogJ21vZHVsZScsXHJcbiAgLy8gICB9LFxyXG4gIC8vIF0sXHJcbiAgbWV0YXM6IFtcclxuICAgIHtcclxuICAgICAgbmFtZTogXCJrZXl3b3Jkc1wiLFxyXG4gICAgICBjb250ZW50OiBcIkNNT05PLk5FVCxjaGFuZ3dlaWh1YSxcdTVFMzhcdTRGMUZcdTUzNEUsTGFuY2UsY2hhbmd3ZWlodWEuZ2l0aHViLmlvLFZpdGUsVml0ZVByZXNzLEFudERlc2lnblwiLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgbmFtZTogXCJkZXNjcmlwdGlvblwiLFxyXG4gICAgICBjb250ZW50OiBcIkNNT05PLk5FVCBcdTVCOThcdTY1QjlcdTdBRDlcdTcwQjlcdUZGMENcdTRFM0JcdTg5ODFcdThCQjBcdTVGNTVcdTVFNzNcdTY1RjZcdTVERTVcdTRGNUNcdTYwM0JcdTdFRDNcdTUzQ0FcdTk4NzlcdTc2RUVcdTdFQ0ZcdTUzODZcIixcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGJhcjogXCJjdXN0b20gbWV0YVwiLFxyXG4gICAgfSxcclxuICBdLFxyXG59KTtcclxuXHJcbi8vIFx1NTIwNlx1OEJDRFx1NTY2OFx1Njc2NVx1NkU5MFxyXG4vLyBodHRwczovL3dlbmppYW5ncy5jb20vYXJ0aWNsZS9zZWdtZW50Lmh0bWxcclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2xlaXpvbmdtaW4vbm9kZS1zZWdtZW50XHJcbi8vIFx1NUI4OVx1ODhDNVx1RkYxQVxyXG4vLyB5YXJuIGFkZCBzZWdtZW50IC1EXHJcbi8vIFx1NEVFNVx1NEUwQlx1NEUzQVx1NjgzN1x1NEY4QlxyXG5cclxuLy8gXHU4RjdEXHU1MTY1XHU2QTIxXHU1NzU3XHJcbmltcG9ydCBTZWdtZW50IGZyb20gJ3NlZ21lbnQnO1xyXG5pbXBvcnQgeyB0cnVuY2F0ZVN5bmMgfSBmcm9tIFwibm9kZTpmc1wiO1xyXG4vLyBcdTUyMUJcdTVFRkFcdTVCOUVcdTRGOEJcclxuY29uc3Qgc2VnbWVudCA9IG5ldyBTZWdtZW50KCk7XHJcbi8vIFx1NEY3Rlx1NzUyOFx1OUVEOFx1OEJBNFx1NzY4NFx1OEJDNlx1NTIyQlx1NkEyMVx1NTc1N1x1NTNDQVx1NUI1N1x1NTE3OFx1RkYwQ1x1OEY3RFx1NTE2NVx1NUI1N1x1NTE3OFx1NjU4N1x1NEVGNlx1OTcwMFx1ODk4MTFcdTc5RDJcdUZGMENcdTRFQzVcdTUyMURcdTU5Q0JcdTUzMTZcdTY1RjZcdTYyNjdcdTg4NENcdTRFMDBcdTZCMjFcdTUzNzNcdTUzRUZcclxuc2VnbWVudC51c2VEZWZhdWx0KCk7XHJcbi8vIFx1NUYwMFx1NTlDQlx1NTIwNlx1OEJDRFxyXG4vLyBjb25zb2xlLmxvZyhzZWdtZW50LmRvU2VnbWVudCgnXHU4RkQ5XHU2NjJGXHU0RTAwXHU0RTJBXHU1N0ZBXHU0RThFTm9kZS5qc1x1NzY4NFx1NEUyRFx1NjU4N1x1NTIwNlx1OEJDRFx1NkEyMVx1NTc1N1x1MzAwMicpKTtcclxuXHJcbi8vZGVmYXVsdCBvcHRpb25zXHJcbmNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgLi4uZmxleFNlYXJjaEluZGV4T3B0aW9ucyxcclxuICAvLyBcdTkxQzdcdTc1MjhcdTUyMDZcdThCQ0RcdTU2NjhcdTRGMThcdTUzMTZcdUZGMENcclxuICBlbmNvZGU6IGZ1bmN0aW9uIChzdHIpIHtcclxuICAgIHJldHVybiBzZWdtZW50LmRvU2VnbWVudChzdHIsIHsgc2ltcGxlOiB0cnVlIH0pO1xyXG4gIH0sXHJcbiAgdG9rZW5pemU6IFwiZm9yd2FyZFwiLCAvLyBcdTg5RTNcdTUxQjNcdTZDNDlcdTVCNTdcdTY0MUNcdTdEMjJcdTk1RUVcdTk4OThcdTMwMDJcdTY3NjVcdTZFOTBcdUZGMUFodHRwczovL2dpdGh1Yi5jb20vZW1lcnNvbmJvdHRlcm8vdml0ZXByZXNzLXBsdWdpbi1zZWFyY2gvaXNzdWVzLzExXHJcblxyXG4gIC8vIFx1NEVFNVx1NEUwQlx1NEVFM1x1NzgwMVx1OEZENFx1NTZERVx1NUI4Q1x1N0Y4RVx1NzY4NFx1N0VEM1x1Njc5Q1x1RkYwQ1x1NEY0Nlx1NTE4NVx1NUI1OFx1NEUwRVx1N0E3QVx1OTVGNFx1NkQ4OFx1ODAxN1x1NURFOFx1NTkyN1x1RkYwQ1x1N0QyMlx1NUYxNVx1NjU4N1x1NEVGNlx1OEZCRVx1NTIzMDgwTStcclxuICAvLyBlbmNvZGU6IGZhbHNlLFxyXG4gIC8vIHRva2VuaXplOiBcImZ1bGxcIixcclxuICBwcmV2aWV3TGVuZ3RoOiA1MCwgLy9cdTY0MUNcdTdEMjJcdTdFRDNcdTY3OUNcdTk4ODRcdTg5QzhcdTk1N0ZcdTVFQTZcclxuICBidXR0b25MYWJlbDogXCJcdTY0MUNcdTdEMjJcIixcclxuICBwbGFjZWhvbGRlcjogXCJcdTYwQzVcdThGOTNcdTUxNjVcdTUxNzNcdTk1MkVcdThCQ0RcIixcclxuICBhbGxvdzogW10sXHJcbiAgaWdub3JlOiBbXSxcclxufTtcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiA1OTk5LFxyXG4gICAgaG1yOiB7XHJcbiAgICAgIG92ZXJsYXk6IGZhbHNlLFxyXG4gICAgfSxcclxuICAgIGZzOiB7XHJcbiAgICAgIGFsbG93OiBbcmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi5cIildLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGNsZWFyU2NyZWVuOiBmYWxzZSwgLy8gXHU4QkJFXHU0RTNBIGZhbHNlIFx1NTNFRlx1NEVFNVx1OTA3Rlx1NTE0RCBWaXRlIFx1NkUwNVx1NUM0Rlx1ODAwQ1x1OTUxOVx1OEZDN1x1NTcyOFx1N0VDOFx1N0FFRlx1NEUyRFx1NjI1M1x1NTM3MFx1NjdEMFx1NEU5Qlx1NTE3M1x1OTUyRVx1NEZFMVx1NjA2RlxyXG4gIC8vIGFzc2V0c0luY2x1ZGU6IFtcIioqLyouZ2x0ZlwiXSwgLy8gXHU2MzA3XHU1QjlBXHU5ODlEXHU1OTE2XHU3Njg0IHBpY29tYXRjaCBcdTZBMjFcdTVGMEYgXHU0RjVDXHU0RTNBXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHU1OTA0XHU3NDA2XHJcbiAgYnVpbGQ6IHtcclxuICAgIHNvdXJjZW1hcDogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJywgLy8gU2VlbXMgdG8gY2F1c2UgSmF2YVNjcmlwdCBoZWFwIG91dCBvZiBtZW1vcnkgZXJyb3JzIG9uIGJ1aWxkXHJcbiAgICBtaW5pZnk6IHRydWUsIC8vIFx1NUZDNVx1OTg3Qlx1NUYwMFx1NTQyRlx1RkYxQVx1NEY3Rlx1NzUyOHRlcnNlck9wdGlvbnNcdTYyNERcdTY3MDlcdTY1NDhcdTY3OUNcclxuICAgIC8vIHRlcnNlck9wdGlvbnM6IHtcclxuICAgIC8vICAgY29tcHJlc3M6IHtcclxuICAgIC8vICAgICAvL1x1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NjVGNlx1NzlGQlx1OTY2NGNvbnNvbGVcclxuICAgIC8vICAgICBkcm9wX2NvbnNvbGU6IHRydWUsXHJcbiAgICAvLyAgICAgZHJvcF9kZWJ1Z2dlcjogdHJ1ZSxcclxuICAgIC8vICAgfSxcclxuICAgIC8vIH0sXHJcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDIwMDAsIC8vIFx1OEJCRVx1N0Y2RSBjaHVuayBcdTU5MjdcdTVDMEZcdThCNjZcdTU0NEFcdTc2ODRcdTk2NTBcdTUyMzZcdTRFM0EgMjAwMCBLaUJcclxuICAgIC8vIGNodW5rU2l6ZUxpbWl0OiA1MDAwLCAvLyBcdThCQkVcdTdGNkUgY2h1bmsgXHU1OTI3XHU1QzBGXHU3Njg0XHU5NjUwXHU1MjM2XHU0RTNBIDUwMDAgS2lCXHJcbiAgICBlbXB0eU91dERpcjogdHJ1ZSwgLy8gXHU1NzI4XHU2Nzg0XHU1RUZBXHU0RTRCXHU1MjREXHU2RTA1XHU3QTdBXHU4RjkzXHU1MUZBXHU3NkVFXHU1RjU1XHJcbiAgICAvLyByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAvLyAgIGNhY2hlOiBmYWxzZSxcclxuICAgIC8vICAgbWF4UGFyYWxsZWxGaWxlT3BzOiAyLFxyXG4gICAgLy8gICBvdXRwdXQ6IHtcclxuICAgIC8vICAgICAvLyBcdTUyMDZcdTUzMDVcclxuICAgIC8vICAgICBtYW51YWxDaHVua3MoaWQpIHtcclxuICAgIC8vICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlc1wiKSkge1xyXG4gICAgLy8gICAgICAgICByZXR1cm4gaWRcclxuICAgIC8vICAgICAgICAgICAudG9TdHJpbmcoKVxyXG4gICAgLy8gICAgICAgICAgIC5zcGxpdChcIm5vZGVfbW9kdWxlcy9cIilbMV1cclxuICAgIC8vICAgICAgICAgICAuc3BsaXQoXCIvXCIpWzBdXHJcbiAgICAvLyAgICAgICAgICAgLnRvU3RyaW5nKCk7XHJcbiAgICAvLyAgICAgICB9XHJcbiAgICAvLyAgICAgfSxcclxuICAgIC8vICAgfSxcclxuICAgIC8vIH0sXHJcbiAgICAvLyByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAvLyAgIG91dHB1dDoge1xyXG4gICAgLy8gICAgIG1hbnVhbENodW5rcyhpZCkge1xyXG4gICAgLy8gICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xyXG4gICAgLy8gICAgICAgICAvLyBcdTUyMDZcdTg5RTNcdTU3NTdcdUZGMENcdTVDMDZcdTU5MjdcdTU3NTdcdTUyMDZcdTg5RTNcdTYyMTBcdTY2RjRcdTVDMEZcdTc2ODRcdTU3NTcsXHU1NzI4dml0ZS5jb25maWcuanNcdTVGNTNcdTRFMkRcdTc2ODRidWlsZFx1NEUwQlx1OTc2Mlx1OEZEQlx1ODg0Q1x1OTE0RFx1N0Y2RVxyXG4gICAgLy8gICAgICAgICByZXR1cm4gaWQudG9TdHJpbmcoKS5zcGxpdCgnbm9kZV9tb2R1bGVzLycpWzFdLnNwbGl0KCcvJylbMF0udG9TdHJpbmcoKTtcclxuICAgIC8vICAgICAgICAgLy8gXHU0RjQ2XHU2NjJGXHU3NTFGXHU2MjEwXHU3Njg0XHU2NTg3XHU0RUY2XHU5MEZEXHU1NzI4ZGlzdFx1NEUwQlx1OTc2Mlx1NzY4NGFzc2V0c1x1NjU4N1x1NEVGNlx1NEUwQlx1RkYwQ1x1OTFDQ1x1OTc2Mlx1NjVFMlx1NjcwOWpzXHUzMDAxY3NzXHU3QjQ5XHU3QjQ5XHUzMDAyXHJcbiAgICAvLyAgICAgICB9XHJcbiAgICAvLyAgICAgfSxcclxuICAgIC8vICAgICAvLyBcdTUzRUZcdTRFRTVcdTVDMDZcdTRFMERcdTU0MENcdTc2ODRcdTY1ODdcdTRFRjZcdTY1M0VcdTU3MjhcdTRFMERcdTU0MENcdTc2ODRcdTY1ODdcdTRFRjZcdTRFMEJcclxuICAgIC8vICAgICBjaHVua0ZpbGVOYW1lczogKGNodW5rSW5mbykgPT4ge1xyXG4gICAgLy8gICAgICAgY29uc3QgZmFjYWRlTW9kdWxlSWQgPSBjaHVua0luZm8uZmFjYWRlTW9kdWxlSWQgPyBjaHVua0luZm8uZmFjYWRlTW9kdWxlSWQuc3BsaXQoJy8nKSA6IFtdO1xyXG4gICAgLy8gICAgICAgY29uc3QgZmlsZU5hbWUgPSBmYWNhZGVNb2R1bGVJZFtmYWNhZGVNb2R1bGVJZC5sZW5ndGggLSAyXSB8fCAnW25hbWVdJztcclxuICAgIC8vICAgICAgIHJldHVybiBganMvJHtmaWxlTmFtZX0vW25hbWVdLltoYXNoXS5qc2A7XHJcbiAgICAvLyAgICAgfVxyXG4gICAgLy8gICB9XHJcbiAgICAvLyB9LFxyXG4gIH0sXHJcbiAgZGVmaW5lOiB7XHJcbiAgICAncHJvY2Vzcy5lbnYnOiB7fSxcclxuICAgIC8vIFx1NkNFOFx1NjEwRlx1ODk4MVx1NzUyOCBKU09OLnN0cmluZ2lmeVxyXG4gICAgJ3Byb2Nlc3MuZW52LlJTU19CQVNFJzogSlNPTi5zdHJpbmdpZnkoYCR7Z2V0RW52VmFsdWUocHJvY2Vzcy5lbnYuTk9ERV9FTlYgfHwgJ2dpdGh1YicsICdWSVRFX0FQUF9SU1NfQkFTRV9VUkwnKX1gKSxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIC8vIGh0bWxDb25maWdzLFxyXG4gICAgLy8gcmVtb3ZlQ29uc29sZSgpLFxyXG4gICAgLy8gY3VzdG9tXHJcbiAgICAvLyBNYXJrZG93blRyYW5zZm9ybSgpLFxyXG4gICAgLy8gQXV0b0ltcG9ydCh7XHJcbiAgICAvLyAgIGltcG9ydHM6W1widnVlXCIsXCJ2dWUtcm91dGVyXCJdLFxyXG4gICAgLy8gICBkdHM6J3NyYy9hdXRvLWltcG9ydC5kLnRzJywgICAvLyBcdThERUZcdTVGODRcdTRFMEJcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTBcdTY1ODdcdTRFRjZcdTU5MzlcdTVCNThcdTY1M0VcdTUxNjhcdTVDNDBcdTYzMDdcdTRFRTRcclxuICAgIC8vICAgLy8gZHRzOiB0cnVlLCAvLyBcdTRGMUFcdTU3MjhcdTY4MzlcdTc2RUVcdTVGNTVcdTc1MUZcdTYyMTBhdXRvLWltcG9ydHMuZC50c1x1RkYwQ1x1OTFDQ1x1OTc2Mlx1NTNFRlx1NEVFNVx1NzcwQlx1NTIzMFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1NzY4NGFwaVxyXG4gICAgLy8gICBpbmNsdWRlOiBbL1xcLlt0al1zeD8kLywgL1xcLnZ1ZSQvXSwgLy8gXHU1MzM5XHU5MTREXHU3Njg0XHU2NTg3XHU0RUY2XHVGRjBDXHU0RTVGXHU1QzMxXHU2NjJGXHU1NEVBXHU0RTlCXHU1NDBFXHU3RjAwXHU3Njg0XHU2NTg3XHU0RUY2XHU5NzAwXHU4OTgxXHU4MUVBXHU1MkE4XHU1RjE1XHU1MTY1XHJcbiAgICAvLyAgIC8vIFx1NjgzOVx1NjM2RVx1OTg3OVx1NzZFRVx1NjBDNVx1NTFCNVx1OTE0RFx1N0Y2RWVzbGludHJjXHVGRjBDXHU5RUQ4XHU4QkE0XHU2NjJGXHU0RTBEXHU1RjAwXHU1NDJGXHU3Njg0XHJcbiAgICAvLyAgIGVzbGludHJjOiB7XHJcbiAgICAvLyAgICAgZW5hYmxlZDogdHJ1ZSAvLyBAZGVmYXVsdCBmYWxzZVxyXG4gICAgLy8gICAgIC8vIFx1NEUwQlx1OTc2Mlx1NEUyNFx1NEUyQVx1NjYyRlx1NTE3Nlx1NEVENlx1OTE0RFx1N0Y2RVx1RkYwQ1x1OUVEOFx1OEJBNFx1NTM3M1x1NTNFRlxyXG4gICAgLy8gICAgIC8vIFx1OEY5M1x1NTFGQVx1NEUwMFx1NEVGRGpzb25cdTY1ODdcdTRFRjZcdUZGMENcdTlFRDhcdThCQTRcdThGOTNcdTUxRkFcdThERUZcdTVGODRcdTRFM0EuLy5lc2xpbnRyYy1hdXRvLWltcG9ydC5qc29uXHJcbiAgICAvLyAgICAgLy8gZmlsZXBhdGg6ICcuLy5lc2xpbnRyYy1hdXRvLWltcG9ydC5qc29uJywgLy8gQGRlZmF1bHQgJy4vLmVzbGludHJjLWF1dG8taW1wb3J0Lmpzb24nXHJcbiAgICAvLyAgICAgLy8gZ2xvYmFsc1Byb3BWYWx1ZTogdHJ1ZSwgLy8gQGRlZmF1bHQgdHJ1ZSBcdTUzRUZcdThCQkVcdTdGNkUgYm9vbGVhbiB8ICdyZWFkb25seScgfCAncmVhZGFibGUnIHwgJ3dyaXRhYmxlJyB8ICd3cml0ZWFibGUnXHJcbiAgICAvLyAgIH1cclxuICAgIC8vIH0pLFxyXG4gICAgLy8gc3R5bGVJbXBvcnQoe1xyXG4gICAgLy8gICByZXNvbHZlczogW1xyXG4gICAgLy8gICAgIEFuZERlc2lnblZ1ZVJlc29sdmUoKVxyXG4gICAgLy8gICBdLFxyXG4gICAgLy8gICAvLyBcdTgxRUFcdTVCOUFcdTRFNDlcdTg5QzRcdTUyMTlcclxuICAgIC8vICAgbGliczogW1xyXG4gICAgLy8gICAgIHtcclxuICAgIC8vICAgICAgIGxpYnJhcnlOYW1lOiAnYW50LWRlc2lnbi12dWUnLFxyXG4gICAgLy8gICAgICAgZXNNb2R1bGU6IHRydWUsXHJcbiAgICAvLyAgICAgICByZXNvbHZlU3R5bGU6IChuYW1lKSA9PiB7XHJcbiAgICAvLyAgICAgICAgIHJldHVybiBgYW50LWRlc2lnbi12dWUvZXMvJHtuYW1lfS9zdHlsZS9pbmRleGBcclxuICAgIC8vICAgICAgIH1cclxuICAgIC8vICAgICB9XHJcbiAgICAvLyAgIF1cclxuICAgIC8vIH0pLFxyXG4gICAgQ29tcG9uZW50cyh7XHJcbiAgICAgIGRpcnM6IHJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjL2NvbXBvbmVudHNcIiksXHJcbiAgICAgIGluY2x1ZGU6IFsvXFwudnVlJC8sIC9cXC52dWVcXD92dWUvXSxcclxuICAgICAgZHRzOiBcIi4vdHlwaW5ncy9jb21wb25lbnRzLmQudHNcIixcclxuICAgICAgdHJhbnNmb3JtZXI6IFwidnVlM1wiLFxyXG4gICAgICByZXNvbHZlcnM6IFtcclxuICAgICAgICAvLyBBbnRkdlJlc29sdmVyKCksXHJcbiAgICAgICAgSWNvbnNSZXNvbHZlcigpLFxyXG4gICAgICAgIC8vIEFudERlc2lnblZ1ZVJlc29sdmVyKHtcclxuICAgICAgICAvLyAgIGltcG9ydFN0eWxlOiB0cnVlLCAvLyBjc3MgaW4ganNcclxuICAgICAgICAvLyAgIHJlc29sdmVJY29uczogdHJ1ZVxyXG4gICAgICAgIC8vIH0pLFxyXG4gICAgICBdLFxyXG4gICAgfSksXHJcbiAgICBJY29ucyh7IGF1dG9JbnN0YWxsOiB0cnVlIH0pLFxyXG4gICAgdnVlUHJldmlld1BsdWdpbih7XHJcbiAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgcHJldmlld0JvZHlTdHlsZToge1xyXG4gICAgICAgICAgZGlzcGxheTogXCJmbGV4XCIsXHJcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcclxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBwcmV2aWV3QXBwU3R5bGU6IHtcclxuICAgICAgICAgIGRpc3BsYXk6IFwiZmxleFwiLFxyXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXHJcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxyXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcclxuICAgICAgICAgIGZvbnRGYW1pbHk6IFwiSmV0QnJhaW5zTW9ubywgQWxpYmFiYVB1SHVpVGlcIixcclxuICAgICAgICB9LFxyXG4gICAgICAgIGltcG9ydE1hcDoge1xyXG4gICAgICAgICAgXCJAdnVlL3NoYXJlZFwiOlxyXG4gICAgICAgICAgICBcImh0dHBzOi8vdW5wa2cuY29tL0B2dWUvc2hhcmVkQGxhdGVzdC9kaXN0L3NoYXJlZC5lc20tYnVuZGxlci5qc1wiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICAgIC8vIHZpdGVQbHVnaW5Nb25pdG9yKHtcclxuICAgIC8vICAgLy8gbG9nOiBmYWxzZSxcclxuICAgIC8vICAgbW9uaXRvcihsYWJlbCwgdGltZSwgb3JpZ2luRGF0YSkge1xyXG4gICAgLy8gICAgIGlmIChvcmlnaW5EYXRhKSB7XHJcbiAgICAvLyAgICAgICBjb25zdCB7IHRpbWUxLCB0aW1lMiwgb3JpZ2luVmFsdWUsIGNoYWxrVmFsdWUgfSA9IG9yaWdpbkRhdGE7XHJcbiAgICAvLyAgICAgICBjb25zb2xlLmxvZyhvcmlnaW5WYWx1ZSk7XHJcbiAgICAvLyAgICAgICBjb25zb2xlLmxvZyhjaGFsa1ZhbHVlKTtcclxuICAgIC8vICAgICAgIGNvbnNvbGUubG9nKGxhYmVsLCB0aW1lMSwgdGltZTIsIGAke3RpbWV9bXNgKTtcclxuICAgIC8vICAgICB9XHJcbiAgICAvLyAgIH0sXHJcbiAgICAvLyAgIGRlYnVnKHN0cikge1xyXG4gICAgLy8gICAgIC8vIFx1NjI1M1x1NTM3MFx1NUI4Q1x1NjU3NFx1NjVFNVx1NUZEN1xyXG4gICAgLy8gICAgIC8vIHByb2Nlc3Muc3Rkb3V0LndyaXRlKHN0cilcclxuICAgIC8vICAgfSxcclxuICAgIC8vIH0pLFxyXG4gICAgLy8gVml0ZUFsaWFzZXMoe1xyXG4gICAgLy8gICAvKipcclxuICAgIC8vICAgICogUmVsYXRpdmUgcGF0aCB0byB0aGUgcHJvamVjdCBkaXJlY3RvcnlcclxuICAgIC8vICAgICovXHJcbiAgICAvLyAgIGRpcjogXCJzcmNcIixcclxuICAgIC8vICAgLyoqXHJcbiAgICAvLyAgICAqIFByZWZpeCBzeW1ib2wgZm9yIHRoZSBhbGlhc2VzXHJcbiAgICAvLyAgICAqL1xyXG4gICAgLy8gICBwcmVmaXg6IFwiflwiLFxyXG4gICAgLy8gICAvKipcclxuICAgIC8vICAgICogQWxsb3cgc2VhcmNoaW5nIGZvciBzdWJkaXJlY3Rvcmllc1xyXG4gICAgLy8gICAgKi9cclxuICAgIC8vICAgZGVlcDogdHJ1ZSxcclxuICAgIC8vICAgLyoqXHJcbiAgICAvLyAgICAqIFNlYXJjaCBkZXB0aGxldmVsIGZvciBzdWJkaXJlY3Rvcmllc1xyXG4gICAgLy8gICAgKi9cclxuICAgIC8vICAgZGVwdGg6IDEsXHJcbiAgICAvLyAgIC8qKlxyXG4gICAgLy8gICAgKiBDcmVhdGVzIGEgTG9nZmlsZVxyXG4gICAgLy8gICAgKiB1c2UgYGxvZ1BhdGhgIHRvIGNoYW5nZSB0aGUgbG9jYXRpb25cclxuICAgIC8vICAgICovXHJcbiAgICAvLyAgIGNyZWF0ZUxvZzogZmFsc2UsXHJcbiAgICAvLyAgIC8qKlxyXG4gICAgLy8gICAgKiBQYXRoIGZvciBMb2dmaWxlXHJcbiAgICAvLyAgICAqL1xyXG4gICAgLy8gICBsb2dQYXRoOiBcInNyYy9sb2dzXCIsXHJcbiAgICAvLyAgIC8qKlxyXG4gICAgLy8gICAgKiBDcmVhdGUgZ2xvYmFsIHByb2plY3QgZGlyZWN0b3J5IGFsaWFzXHJcbiAgICAvLyAgICAqL1xyXG4gICAgLy8gICBjcmVhdGVHbG9iYWxBbGlhczogdHJ1ZSxcclxuICAgIC8vICAgLyoqXHJcbiAgICAvLyAgICAqIFR1cm5zIGR1cGxpY2F0ZXMgaW50byBjYW1lbENhc2VkIHBhdGggYWxpYXNlc1xyXG4gICAgLy8gICAgKi9cclxuICAgIC8vICAgYWRqdXN0RHVwbGljYXRlczogZmFsc2UsXHJcbiAgICAvLyAgIC8qKlxyXG4gICAgLy8gICAgKiBVc2VkIHBhdGhzIGluIEpTL1RTIGNvbmZpZ3Mgd2lsbCBub3cgYmUgcmVsYXRpdmUgdG8gYmFzZVVybFxyXG4gICAgLy8gICAgKi9cclxuICAgIC8vICAgdXNlQWJzb2x1dGU6IGZhbHNlLFxyXG4gICAgLy8gICAvKipcclxuICAgIC8vICAgICogQWRkcyBzZXBlcmF0ZSBpbmRleCBwYXRoc1xyXG4gICAgLy8gICAgKiBhcHByb2FjaCBjcmVhdGVkIGJ5IEBkYXZpZG9obGluXHJcbiAgICAvLyAgICAqL1xyXG4gICAgLy8gICB1c2VJbmRleGVzOiBmYWxzZSxcclxuICAgIC8vICAgLyoqXHJcbiAgICAvLyAgICAqIEdlbmVyYXRlcyBwYXRocyBpbiBJREUgY29uZmlnIGZpbGVcclxuICAgIC8vICAgICogd29ya3Mgd2l0aCBKUyBvciBUU1xyXG4gICAgLy8gICAgKi9cclxuICAgIC8vICAgdXNlQ29uZmlnOiB0cnVlLFxyXG4gICAgLy8gICAvKipcclxuICAgIC8vICAgICogT3ZlcnJpZGUgY29uZmlnIHBhdGhzXHJcbiAgICAvLyAgICAqL1xyXG4gICAgLy8gICBvdnJDb25maWc6IGZhbHNlLFxyXG4gICAgLy8gICAvKipcclxuICAgIC8vICAgICogV2lsbCBnZW5lcmF0ZSBQYXRocyBpbiB0c2NvbmZpZ1xyXG4gICAgLy8gICAgKiB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggYHVzZUNvbmZpZ2BcclxuICAgIC8vICAgICogVHlwZXNjcmlwdCB3aWxsIGJlIGF1dG8gZGV0ZWN0ZWRcclxuICAgIC8vICAgICovXHJcbiAgICAvLyAgIGR0czogZmFsc2UsXHJcbiAgICAvLyAgIC8qKlxyXG4gICAgLy8gICAgKiBEaXNhYmxlcyBhbnkgdGVybWluYWwgb3V0cHV0XHJcbiAgICAvLyAgICAqL1xyXG4gICAgLy8gICBzaWxlbnQ6IHRydWUsXHJcbiAgICAvLyAgIC8qKlxyXG4gICAgLy8gICAgKiBSb290IHBhdGggb2YgVml0ZSBwcm9qZWN0XHJcbiAgICAvLyAgICAqL1xyXG4gICAgLy8gICByb290OiBwcm9jZXNzLmN3ZCgpLFxyXG4gICAgLy8gfSksXHJcbiAgICBTZWFyY2hQbHVnaW4ob3B0aW9ucyksXHJcbiAgICBVbm9DU1MoKSxcclxuICBdLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIC8vIFwiQFwiOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoXCIuXCIsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICBcIkBcIjogZmlsZVVSTFRvUGF0aChuZXcgVVJMKFwiLi9zcmNcIiwgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICAgIFwiQHZwXCI6IGZpbGVVUkxUb1BhdGgobmV3IFVSTChcIi4vLnZpdGVwcmVzc1wiLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgICAgcHVibGljOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoXCIuL3B1YmxpY1wiLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgICAgXCJ+XCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9cIiksXHJcbiAgICAgIC8vIFwiQFwiOiByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmNcIiksXHJcbiAgICAgIC8vIC8vIFx1NkNFOFx1NjEwRlx1NEUwMFx1NUI5QVx1NEUwRFx1ODk4MVx1OTY4Rlx1NjEwRlx1NTQ3RFx1NTQwRFx1RkYwQ2EgYiBjXHU4RkQ5XHU2ODM3XHU3Njg0XHVGRjBDXHU5ODc5XHU3NkVFXHU3Njg0XHU3NkVFXHU1RjU1XHU0RTVGXHU0RTBEXHU4MEZEXHU0RTNBXHU1MTczXHU5NTJFXHU1QjU3XHU0RkREXHU3NTU5XHU1QjU3XHVGRjAxXHVGRjAxXHJcbiAgICAgIC8vIFwiY29tcFwiOiByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvY29tcG9uZW50c1wiKSxcclxuICAgICAgLy8gLy8gXHU5MTREXHU3RjZFXHU1NkZFXHU3MjQ3XHU4OTgxXHU4RkQ5XHU2ODM3XHU1RjE1XHU3NTI4XHJcbiAgICAgIC8vIFwiL2ltZ1wiOiBcIi4vc3JjL2Fzc2V0c1wiLFxyXG4gICAgfSxcclxuICAgIC8vIGRlZHVwZTogW10sIC8vIFx1NUYzQVx1NTIzNiBWaXRlIFx1NTlDQlx1N0VDOFx1NUMwNlx1NTIxN1x1NTFGQVx1NzY4NFx1NEY5RFx1OEQ1Nlx1OTg3OVx1ODlFM1x1Njc5MFx1NEUzQVx1NTQwQ1x1NEUwMFx1NTI2Rlx1NjcyQ1xyXG4gICAgLy8gY29uZGl0aW9uczogW10sIC8vIFx1ODlFM1x1NTFCM1x1N0EwQlx1NUU4Rlx1NTMwNVx1NEUyRCBcdTYwQzVcdTY2NkZcdTVCRkNcdTUxRkEgXHU2NUY2XHU3Njg0XHU1MTc2XHU0RUQ2XHU1MTQxXHU4QkI4XHU2NzYxXHU0RUY2XHJcbiAgICAvLyBtYWluRmllbGRzOiBbXSwgLy8gXHU4OUUzXHU2NzkwXHU1MzA1XHU1MTY1XHU1M0UzXHU3MEI5XHU1QzFEXHU4QkQ1XHU3Njg0XHU1QjU3XHU2QkI1XHU1MjE3XHU4ODY4XHJcbiAgICAvLyBleHRlbnNpb25zOiBbJy5qcycsICcudHMnLCAnLmpzb24nXSAvLyBcdTVCRkNcdTUxNjVcdTY1RjZcdTYwRjNcdTg5ODFcdTc3MDFcdTc1NjVcdTc2ODRcdTYyNjlcdTVDNTVcdTU0MERcdTUyMTdcdTg4NjhcclxuICB9LFxyXG4gIHNzcjoge1xyXG4gICAgbm9FeHRlcm5hbDogW1xyXG4gICAgICAvLyBcdTU5ODJcdTY3OUNcdThGRDhcdTY3MDlcdTUyMkJcdTc2ODRcdTRGOURcdThENTZcdTk3MDBcdTg5ODFcdTZERkJcdTUyQTBcdTc2ODRcdThCRERcdUZGMENcdTVFNzZcdTYzOTJcdTU4NkJcdTUxOTlcdTU0OENcdTkxNERcdTdGNkVcdTUyMzBcdThGRDlcdTkxQ0NcdTUzNzNcdTUzRUZcclxuICAgICAgJ0Bub2xlYmFzZS92aXRlcHJlc3MtcGx1Z2luLWVuaGFuY2VkLXJlYWRhYmlsaXRpZXMnLFxyXG4gICAgICAnQG5vbGViYXNlL3ZpdGVwcmVzcy1wbHVnaW4taGlnaGxpZ2h0LXRhcmdldGVkLWhlYWRpbmcnLFxyXG4gICAgXSxcclxuICB9LFxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgaW5jbHVkZTogW1xyXG4gICAgICBcInZpdGVwcmVzcy1wbHVnaW4tbnByb2dyZXNzXCIsXHJcbiAgICAgICdAbm9sZWJhc2Uvdml0ZXByZXNzLXBsdWdpbi1lbmhhbmNlZC1yZWFkYWJpbGl0aWVzID4gQG5vbGViYXNlL3VpID4gQHJpdmUtYXBwL2NhbnZhcycsXHJcbiAgICAgICdAbm9sZWJhc2Uvdml0ZXByZXNzLXBsdWdpbi1oaWdobGlnaHQtdGFyZ2V0ZWQtaGVhZGluZycsXHJcbiAgICBdLFxyXG4gICAgZXhjbHVkZTogWyd2aXRlcHJlc3MnXSxcclxuICB9LFxyXG4gIC8vIHJlc29sdmU6IHtcclxuICAvLyAgIGFsaWFzOiB7XHJcbiAgLy8gICAgICdtZXJtYWlkJzogJ21lcm1haWQvZGlzdC9tZXJtYWlkLmVzbS5tanMnLFxyXG4gIC8vICAgfSxcclxuICAvLyB9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMsY0FBYyxlQUFlO0FBQ3RDLE9BQU8sV0FBVztBQUNsQixPQUFPLG1CQUFtQjtBQUMxQixPQUFPLGdCQUFnQjtBQUd2QixTQUFTLHdCQUF3QjtBQUdqQyxPQUFPLFlBQVk7QUFDbkIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyw0QkFBNEI7QUFDbkMsT0FBTyxRQUFRLGVBQWU7QUFDOUIsU0FBUyxxQkFBcUI7QUFDOUIsT0FBTyxnQkFBZ0I7QUE0RXZCLE9BQU8sYUFBYTtBQTNGcEIsSUFBTSxtQ0FBbUM7QUFBa0ksSUFBTSwyQ0FBMkM7QUFnQjVOLElBQU0sY0FBYyxDQUFDLE1BQWMsV0FBbUI7QUFDcEQsUUFBTSxRQUFRLFFBQVEsTUFBTSxLQUFLLEtBQUssUUFBUSxJQUFJLEdBQUcsS0FBSyxDQUFDLEVBQUUsTUFBTTtBQUNuRSxVQUFRLElBQUksS0FBSztBQUNqQixTQUFPO0FBQ1Q7QUFFQSxJQUFNLGNBQWMsV0FBVztBQUFBLEVBQzdCLGFBQWE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU9iO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQWlCUDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFvQkEsT0FBTztBQUFBLElBQ0w7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLFNBQVM7QUFBQSxJQUNYO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sU0FBUztBQUFBLElBQ1g7QUFBQSxJQUNBO0FBQUEsTUFDRSxLQUFLO0FBQUEsSUFDUDtBQUFBLEVBQ0Y7QUFDRixDQUFDO0FBYUQsSUFBTSxVQUFVLElBQUksUUFBUTtBQUU1QixRQUFRLFdBQVc7QUFLbkIsSUFBTSxVQUFVO0FBQUEsRUFDZCxHQUFHO0FBQUE7QUFBQSxFQUVILFFBQVEsU0FBVSxLQUFLO0FBQ3JCLFdBQU8sUUFBUSxVQUFVLEtBQUssRUFBRSxRQUFRLEtBQUssQ0FBQztBQUFBLEVBQ2hEO0FBQUEsRUFDQSxVQUFVO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUtWLGVBQWU7QUFBQTtBQUFBLEVBQ2YsYUFBYTtBQUFBLEVBQ2IsYUFBYTtBQUFBLEVBQ2IsT0FBTyxDQUFDO0FBQUEsRUFDUixRQUFRLENBQUM7QUFDWDtBQUdBLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQSxJQUNYO0FBQUEsSUFDQSxJQUFJO0FBQUEsTUFDRixPQUFPLENBQUMsUUFBUSxrQ0FBVyxJQUFJLENBQUM7QUFBQSxJQUNsQztBQUFBLEVBQ0Y7QUFBQSxFQUNBLGFBQWE7QUFBQTtBQUFBO0FBQUEsRUFFYixPQUFPO0FBQUEsSUFDTCxXQUFXLFFBQVEsSUFBSSxhQUFhO0FBQUE7QUFBQSxJQUNwQyxRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBUVIsdUJBQXVCO0FBQUE7QUFBQTtBQUFBLElBRXZCLGFBQWE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBa0NmO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixlQUFlLENBQUM7QUFBQTtBQUFBLElBRWhCLHdCQUF3QixLQUFLLFVBQVUsR0FBRyxZQUFZLFFBQVEsSUFBSSxZQUFZLFVBQVUsdUJBQXVCLENBQUMsRUFBRTtBQUFBLEVBQ3BIO0FBQUEsRUFDQSxTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFrQ1AsV0FBVztBQUFBLE1BQ1QsTUFBTSxRQUFRLGtDQUFXLGtCQUFrQjtBQUFBLE1BQzNDLFNBQVMsQ0FBQyxVQUFVLFlBQVk7QUFBQSxNQUNoQyxLQUFLO0FBQUEsTUFDTCxhQUFhO0FBQUEsTUFDYixXQUFXO0FBQUE7QUFBQSxRQUVULGNBQWM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS2hCO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxNQUFNLEVBQUUsYUFBYSxLQUFLLENBQUM7QUFBQSxJQUMzQixpQkFBaUI7QUFBQSxNQUNmLE9BQU87QUFBQSxRQUNMLGtCQUFrQjtBQUFBLFVBQ2hCLFNBQVM7QUFBQSxVQUNULGdCQUFnQjtBQUFBLFVBQ2hCLFlBQVk7QUFBQSxRQUNkO0FBQUEsUUFDQSxpQkFBaUI7QUFBQSxVQUNmLFNBQVM7QUFBQSxVQUNULGdCQUFnQjtBQUFBLFVBQ2hCLFlBQVk7QUFBQSxVQUNaLGVBQWU7QUFBQSxVQUNmLFlBQVk7QUFBQSxRQUNkO0FBQUEsUUFDQSxXQUFXO0FBQUEsVUFDVCxlQUNFO0FBQUEsUUFDSjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBbUZELGFBQWEsT0FBTztBQUFBLElBQ3BCLE9BQU87QUFBQSxFQUNUO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUE7QUFBQSxNQUVMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsTUFDcEQsT0FBTyxjQUFjLElBQUksSUFBSSxnQkFBZ0Isd0NBQWUsQ0FBQztBQUFBLE1BQzdELFFBQVEsY0FBYyxJQUFJLElBQUksWUFBWSx3Q0FBZSxDQUFDO0FBQUEsTUFDMUQsS0FBSyxLQUFLLFFBQVEsa0NBQVcsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQU1uQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFLRjtBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0gsWUFBWTtBQUFBO0FBQUEsTUFFVjtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVMsQ0FBQyxXQUFXO0FBQUEsRUFDdkI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBTUYsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
