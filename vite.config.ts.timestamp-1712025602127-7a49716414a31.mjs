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
      content: "vite html meta keywords"
    },
    {
      name: "description",
      content: "vite html meta description"
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
    htmlConfigs,
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
    noExternal: ["vitepress-plugin-nprogress"]
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9HaXRodWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvL3ZpdGUuY29uZmlnLnRzXCI7Ly8gdml0ZS5jb25maWcudHNcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IEljb25zIGZyb20gXCJ1bnBsdWdpbi1pY29ucy92aXRlXCI7XHJcbmltcG9ydCBJY29uc1Jlc29sdmVyIGZyb20gXCJ1bnBsdWdpbi1pY29ucy9yZXNvbHZlclwiO1xyXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tIFwidW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZVwiO1xyXG4vLyBpbXBvcnQgeyBBbnREZXNpZ25WdWVSZXNvbHZlciB9IGZyb20gXCJ1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnNcIjtcclxuLy8gaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gXCJub2RlOnVybFwiO1xyXG5pbXBvcnQgeyB2dWVQcmV2aWV3UGx1Z2luIH0gZnJvbSBcInZpdGUtcGx1Z2luLXZ1ZS1wcmV2aWV3XCI7XHJcbi8vIGltcG9ydCBBbnRkdlJlc29sdmVyIGZyb20gXCJhbnRkdi1jb21wb25lbnQtcmVzb2x2ZXJcIjtcclxuLy8gaW1wb3J0IHsgVml0ZUFsaWFzZXMgfSBmcm9tIFwidml0ZS1hbGlhc2VzXCI7XHJcbmltcG9ydCBVbm9DU1MgZnJvbSBcInVub2Nzcy92aXRlXCI7XHJcbmltcG9ydCB7IFNlYXJjaFBsdWdpbiB9IGZyb20gXCJ2aXRlcHJlc3MtcGx1Z2luLXNlYXJjaFwiO1xyXG5pbXBvcnQgZmxleFNlYXJjaEluZGV4T3B0aW9ucyBmcm9tIFwiZmxleHNlYXJjaFwiO1xyXG5pbXBvcnQgcGF0aCwgeyByZXNvbHZlIH0gZnJvbSBcIm5vZGU6cGF0aFwiO1xyXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSBcIm5vZGU6dXJsXCI7XHJcbmltcG9ydCBodG1sQ29uZmlnIGZyb20gXCJ2aXRlLXBsdWdpbi1odG1sLWNvbmZpZ1wiO1xyXG5cclxuY29uc3QgZ2V0RW52VmFsdWUgPSAobW9kZTogc3RyaW5nLCB0YXJnZXQ6IHN0cmluZykgPT4ge1xyXG4gIGNvbnN0IHZhbHVlID0gbG9hZEVudihtb2RlLCBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2VudicpKVt0YXJnZXRdXHJcbiAgY29uc29sZS5sb2codmFsdWUpXHJcbiAgcmV0dXJuIHZhbHVlXHJcbn1cclxuXHJcbmNvbnN0IGh0bWxDb25maWdzID0gaHRtbENvbmZpZyh7XHJcbiAgaGVhZFNjcmlwdHM6IFtcclxuICAgIC8vIHtcclxuICAgIC8vICAgc3JjOiAnanMvY2RuLmpzZGVsaXZyLm5ldF9ucG1fbHVja3lzaGVldEBsYXRlc3RfZGlzdF9wbHVnaW5zX2pzX3BsdWdpbi5qcydcclxuICAgIC8vIH0sXHJcbiAgICAvLyB7XHJcbiAgICAvLyAgIHNyYzogJ2pzL2Nkbi5qc2RlbGl2ci5uZXRfbnBtX2x1Y2t5c2hlZXRAbGF0ZXN0X2Rpc3RfbHVja3lzaGVldC51bWQuanMnXHJcbiAgICAvLyB9LFxyXG4gIF0sXHJcbiAgbGlua3M6IFtcclxuICAgIC8vIHtcclxuICAgIC8vICAgcmVsOiAnc3R5bGVzaGVldCcsXHJcbiAgICAvLyAgIGhyZWY6ICdqcy9jZG4uanNkZWxpdnIubmV0X25wbV9sdWNreXNoZWV0QGxhdGVzdF9kaXN0X2Fzc2V0c19pY29uZm9udF9pY29uZm9udC5jc3MnXHJcbiAgICAvLyB9LFxyXG4gICAgLy8ge1xyXG4gICAgLy8gICByZWw6ICdzdHlsZXNoZWV0JyxcclxuICAgIC8vICAgaHJlZjogJ2pzL2Nkbi5qc2RlbGl2ci5uZXRfbnBtX2x1Y2t5c2hlZXRAbGF0ZXN0X2Rpc3RfY3NzX2x1Y2t5c2hlZXQuY3NzJ1xyXG4gICAgLy8gfSxcclxuICAgIC8vIHtcclxuICAgIC8vICAgcmVsOiAnc3R5bGVzaGVldCcsXHJcbiAgICAvLyAgIGhyZWY6ICdqcy9jZG4uanNkZWxpdnIubmV0X25wbV9sdWNreXNoZWV0QGxhdGVzdF9kaXN0X3BsdWdpbnNfY3NzX3BsdWdpbnNDc3MuY3NzJ1xyXG4gICAgLy8gfSxcclxuICAgIC8vIHtcclxuICAgIC8vICAgcmVsOiAnc3R5bGVzaGVldCcsXHJcbiAgICAvLyAgIGhyZWY6ICdqcy9jZG4uanNkZWxpdnIubmV0X25wbV9sdWNreXNoZWV0QGxhdGVzdF9kaXN0X3BsdWdpbnNfcGx1Z2lucy5jc3MnXHJcbiAgICAvLyB9LFxyXG4gIF0sXHJcbiAgLy8gcHJlSGVhZFNjcmlwdHM6IFtcclxuICAvLyAgIGB2YXIgbXNnID0gJ3ByZSBoZWFkIHNjcmlwdCdcclxuICAvLyAgIGNvbnNvbGUubG9nKG1zZyk7YCxcclxuICAvLyAgIHtcclxuICAvLyAgICAgYXN5bmM6IHRydWUsXHJcbiAgLy8gICAgIHNyYzogJ2h0dHBzOi8vYWJjLmNvbS9iLmpzJyxcclxuICAvLyAgICAgdHlwZTogJ21vZHVsZScsXHJcbiAgLy8gICB9LFxyXG4gIC8vICAgeyBjb250ZW50OiBgY29uc29sZS5sb2coJ2hlbGxvJylgLCBjaGFyc2V0OiAndXRmLTgnIH0sXHJcbiAgLy8gXSxcclxuICAvLyBzY3JpcHRzOiBbXHJcbiAgLy8gICBgdmFyIG1zZyA9ICdib2R5IHNjcmlwdCdcclxuICAvLyAgICBjb25zb2xlLmxvZyhtc2cpO2AsXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIGFzeW5jOiB0cnVlLFxyXG4gIC8vICAgICBzcmM6ICdodHRwczovL2FiYy5jb20vYi5qcycsXHJcbiAgLy8gICAgIHR5cGU6ICdtb2R1bGUnLFxyXG4gIC8vICAgfSxcclxuICAvLyBdLFxyXG4gIG1ldGFzOiBbXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6IFwia2V5d29yZHNcIixcclxuICAgICAgY29udGVudDogXCJ2aXRlIGh0bWwgbWV0YSBrZXl3b3Jkc1wiLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgbmFtZTogXCJkZXNjcmlwdGlvblwiLFxyXG4gICAgICBjb250ZW50OiBcInZpdGUgaHRtbCBtZXRhIGRlc2NyaXB0aW9uXCIsXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBiYXI6IFwiY3VzdG9tIG1ldGFcIixcclxuICAgIH0sXHJcbiAgXSxcclxufSk7XHJcblxyXG4vLyBcdTUyMDZcdThCQ0RcdTU2NjhcdTY3NjVcdTZFOTBcclxuLy8gaHR0cHM6Ly93ZW5qaWFuZ3MuY29tL2FydGljbGUvc2VnbWVudC5odG1sXHJcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9sZWl6b25nbWluL25vZGUtc2VnbWVudFxyXG4vLyBcdTVCODlcdTg4QzVcdUZGMUFcclxuLy8geWFybiBhZGQgc2VnbWVudCAtRFxyXG4vLyBcdTRFRTVcdTRFMEJcdTRFM0FcdTY4MzdcdTRGOEJcclxuXHJcbi8vIFx1OEY3RFx1NTE2NVx1NkEyMVx1NTc1N1xyXG5pbXBvcnQgU2VnbWVudCBmcm9tICdzZWdtZW50JztcclxuaW1wb3J0IHsgdHJ1bmNhdGVTeW5jIH0gZnJvbSBcIm5vZGU6ZnNcIjtcclxuLy8gXHU1MjFCXHU1RUZBXHU1QjlFXHU0RjhCXHJcbmNvbnN0IHNlZ21lbnQgPSBuZXcgU2VnbWVudCgpO1xyXG4vLyBcdTRGN0ZcdTc1MjhcdTlFRDhcdThCQTRcdTc2ODRcdThCQzZcdTUyMkJcdTZBMjFcdTU3NTdcdTUzQ0FcdTVCNTdcdTUxNzhcdUZGMENcdThGN0RcdTUxNjVcdTVCNTdcdTUxNzhcdTY1ODdcdTRFRjZcdTk3MDBcdTg5ODExXHU3OUQyXHVGRjBDXHU0RUM1XHU1MjFEXHU1OUNCXHU1MzE2XHU2NUY2XHU2MjY3XHU4ODRDXHU0RTAwXHU2QjIxXHU1MzczXHU1M0VGXHJcbnNlZ21lbnQudXNlRGVmYXVsdCgpO1xyXG4vLyBcdTVGMDBcdTU5Q0JcdTUyMDZcdThCQ0RcclxuLy8gY29uc29sZS5sb2coc2VnbWVudC5kb1NlZ21lbnQoJ1x1OEZEOVx1NjYyRlx1NEUwMFx1NEUyQVx1NTdGQVx1NEU4RU5vZGUuanNcdTc2ODRcdTRFMkRcdTY1ODdcdTUyMDZcdThCQ0RcdTZBMjFcdTU3NTdcdTMwMDInKSk7XHJcblxyXG4vL2RlZmF1bHQgb3B0aW9uc1xyXG5jb25zdCBvcHRpb25zID0ge1xyXG4gIC4uLmZsZXhTZWFyY2hJbmRleE9wdGlvbnMsXHJcbiAgLy8gXHU5MUM3XHU3NTI4XHU1MjA2XHU4QkNEXHU1NjY4XHU0RjE4XHU1MzE2XHVGRjBDXHJcbiAgZW5jb2RlOiBmdW5jdGlvbiAoc3RyKSB7XHJcbiAgICByZXR1cm4gc2VnbWVudC5kb1NlZ21lbnQoc3RyLCB7IHNpbXBsZTogdHJ1ZSB9KTtcclxuICB9LFxyXG4gIHRva2VuaXplOiBcImZvcndhcmRcIiwgLy8gXHU4OUUzXHU1MUIzXHU2QzQ5XHU1QjU3XHU2NDFDXHU3RDIyXHU5NUVFXHU5ODk4XHUzMDAyXHU2NzY1XHU2RTkwXHVGRjFBaHR0cHM6Ly9naXRodWIuY29tL2VtZXJzb25ib3R0ZXJvL3ZpdGVwcmVzcy1wbHVnaW4tc2VhcmNoL2lzc3Vlcy8xMVxyXG5cclxuICAvLyBcdTRFRTVcdTRFMEJcdTRFRTNcdTc4MDFcdThGRDRcdTU2REVcdTVCOENcdTdGOEVcdTc2ODRcdTdFRDNcdTY3OUNcdUZGMENcdTRGNDZcdTUxODVcdTVCNThcdTRFMEVcdTdBN0FcdTk1RjRcdTZEODhcdTgwMTdcdTVERThcdTU5MjdcdUZGMENcdTdEMjJcdTVGMTVcdTY1ODdcdTRFRjZcdThGQkVcdTUyMzA4ME0rXHJcbiAgLy8gZW5jb2RlOiBmYWxzZSxcclxuICAvLyB0b2tlbml6ZTogXCJmdWxsXCIsXHJcbiAgcHJldmlld0xlbmd0aDogNTAsIC8vXHU2NDFDXHU3RDIyXHU3RUQzXHU2NzlDXHU5ODg0XHU4OUM4XHU5NTdGXHU1RUE2XHJcbiAgYnV0dG9uTGFiZWw6IFwiXHU2NDFDXHU3RDIyXCIsXHJcbiAgcGxhY2Vob2xkZXI6IFwiXHU2MEM1XHU4RjkzXHU1MTY1XHU1MTczXHU5NTJFXHU4QkNEXCIsXHJcbiAgYWxsb3c6IFtdLFxyXG4gIGlnbm9yZTogW10sXHJcbn07XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogNTk5OSxcclxuICAgIGhtcjoge1xyXG4gICAgICBvdmVybGF5OiBmYWxzZSxcclxuICAgIH0sXHJcbiAgICBmczoge1xyXG4gICAgICBhbGxvdzogW3Jlc29sdmUoX19kaXJuYW1lLCBcIi4uXCIpXSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBjbGVhclNjcmVlbjogZmFsc2UsIC8vIFx1OEJCRVx1NEUzQSBmYWxzZSBcdTUzRUZcdTRFRTVcdTkwN0ZcdTUxNEQgVml0ZSBcdTZFMDVcdTVDNEZcdTgwMENcdTk1MTlcdThGQzdcdTU3MjhcdTdFQzhcdTdBRUZcdTRFMkRcdTYyNTNcdTUzNzBcdTY3RDBcdTRFOUJcdTUxNzNcdTk1MkVcdTRGRTFcdTYwNkZcclxuICAvLyBhc3NldHNJbmNsdWRlOiBbXCIqKi8qLmdsdGZcIl0sIC8vIFx1NjMwN1x1NUI5QVx1OTg5RFx1NTkxNlx1NzY4NCBwaWNvbWF0Y2ggXHU2QTIxXHU1RjBGIFx1NEY1Q1x1NEUzQVx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1NTkwNFx1NzQwNlxyXG4gIGJ1aWxkOiB7XHJcbiAgICBzb3VyY2VtYXA6IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicsIC8vIFNlZW1zIHRvIGNhdXNlIEphdmFTY3JpcHQgaGVhcCBvdXQgb2YgbWVtb3J5IGVycm9ycyBvbiBidWlsZFxyXG4gICAgbWluaWZ5OiB0cnVlLCAvLyBcdTVGQzVcdTk4N0JcdTVGMDBcdTU0MkZcdUZGMUFcdTRGN0ZcdTc1Mjh0ZXJzZXJPcHRpb25zXHU2MjREXHU2NzA5XHU2NTQ4XHU2NzlDXHJcbiAgICAvLyB0ZXJzZXJPcHRpb25zOiB7XHJcbiAgICAvLyAgIGNvbXByZXNzOiB7XHJcbiAgICAvLyAgICAgLy9cdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTY1RjZcdTc5RkJcdTk2NjRjb25zb2xlXHJcbiAgICAvLyAgICAgZHJvcF9jb25zb2xlOiB0cnVlLFxyXG4gICAgLy8gICAgIGRyb3BfZGVidWdnZXI6IHRydWUsXHJcbiAgICAvLyAgIH0sXHJcbiAgICAvLyB9LFxyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAyMDAwLCAvLyBcdThCQkVcdTdGNkUgY2h1bmsgXHU1OTI3XHU1QzBGXHU4QjY2XHU1NDRBXHU3Njg0XHU5NjUwXHU1MjM2XHU0RTNBIDIwMDAgS2lCXHJcbiAgICAvLyBjaHVua1NpemVMaW1pdDogNTAwMCwgLy8gXHU4QkJFXHU3RjZFIGNodW5rIFx1NTkyN1x1NUMwRlx1NzY4NFx1OTY1MFx1NTIzNlx1NEUzQSA1MDAwIEtpQlxyXG4gICAgZW1wdHlPdXREaXI6IHRydWUsIC8vIFx1NTcyOFx1Njc4NFx1NUVGQVx1NEU0Qlx1NTI0RFx1NkUwNVx1N0E3QVx1OEY5M1x1NTFGQVx1NzZFRVx1NUY1NVxyXG4gICAgLy8gcm9sbHVwT3B0aW9uczoge1xyXG4gICAgLy8gICBjYWNoZTogZmFsc2UsXHJcbiAgICAvLyAgIG1heFBhcmFsbGVsRmlsZU9wczogMixcclxuICAgIC8vICAgb3V0cHV0OiB7XHJcbiAgICAvLyAgICAgLy8gXHU1MjA2XHU1MzA1XHJcbiAgICAvLyAgICAgbWFudWFsQ2h1bmtzKGlkKSB7XHJcbiAgICAvLyAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXNcIikpIHtcclxuICAgIC8vICAgICAgICAgcmV0dXJuIGlkXHJcbiAgICAvLyAgICAgICAgICAgLnRvU3RyaW5nKClcclxuICAgIC8vICAgICAgICAgICAuc3BsaXQoXCJub2RlX21vZHVsZXMvXCIpWzFdXHJcbiAgICAvLyAgICAgICAgICAgLnNwbGl0KFwiL1wiKVswXVxyXG4gICAgLy8gICAgICAgICAgIC50b1N0cmluZygpO1xyXG4gICAgLy8gICAgICAgfVxyXG4gICAgLy8gICAgIH0sXHJcbiAgICAvLyAgIH0sXHJcbiAgICAvLyB9LFxyXG4gICAgLy8gcm9sbHVwT3B0aW9uczoge1xyXG4gICAgLy8gICBvdXRwdXQ6IHtcclxuICAgIC8vICAgICBtYW51YWxDaHVua3MoaWQpIHtcclxuICAgIC8vICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcclxuICAgIC8vICAgICAgICAgLy8gXHU1MjA2XHU4OUUzXHU1NzU3XHVGRjBDXHU1QzA2XHU1OTI3XHU1NzU3XHU1MjA2XHU4OUUzXHU2MjEwXHU2NkY0XHU1QzBGXHU3Njg0XHU1NzU3LFx1NTcyOHZpdGUuY29uZmlnLmpzXHU1RjUzXHU0RTJEXHU3Njg0YnVpbGRcdTRFMEJcdTk3NjJcdThGREJcdTg4NENcdTkxNERcdTdGNkVcclxuICAgIC8vICAgICAgICAgcmV0dXJuIGlkLnRvU3RyaW5nKCkuc3BsaXQoJ25vZGVfbW9kdWxlcy8nKVsxXS5zcGxpdCgnLycpWzBdLnRvU3RyaW5nKCk7XHJcbiAgICAvLyAgICAgICAgIC8vIFx1NEY0Nlx1NjYyRlx1NzUxRlx1NjIxMFx1NzY4NFx1NjU4N1x1NEVGNlx1OTBGRFx1NTcyOGRpc3RcdTRFMEJcdTk3NjJcdTc2ODRhc3NldHNcdTY1ODdcdTRFRjZcdTRFMEJcdUZGMENcdTkxQ0NcdTk3NjJcdTY1RTJcdTY3MDlqc1x1MzAwMWNzc1x1N0I0OVx1N0I0OVx1MzAwMlxyXG4gICAgLy8gICAgICAgfVxyXG4gICAgLy8gICAgIH0sXHJcbiAgICAvLyAgICAgLy8gXHU1M0VGXHU0RUU1XHU1QzA2XHU0RTBEXHU1NDBDXHU3Njg0XHU2NTg3XHU0RUY2XHU2NTNFXHU1NzI4XHU0RTBEXHU1NDBDXHU3Njg0XHU2NTg3XHU0RUY2XHU0RTBCXHJcbiAgICAvLyAgICAgY2h1bmtGaWxlTmFtZXM6IChjaHVua0luZm8pID0+IHtcclxuICAgIC8vICAgICAgIGNvbnN0IGZhY2FkZU1vZHVsZUlkID0gY2h1bmtJbmZvLmZhY2FkZU1vZHVsZUlkID8gY2h1bmtJbmZvLmZhY2FkZU1vZHVsZUlkLnNwbGl0KCcvJykgOiBbXTtcclxuICAgIC8vICAgICAgIGNvbnN0IGZpbGVOYW1lID0gZmFjYWRlTW9kdWxlSWRbZmFjYWRlTW9kdWxlSWQubGVuZ3RoIC0gMl0gfHwgJ1tuYW1lXSc7XHJcbiAgICAvLyAgICAgICByZXR1cm4gYGpzLyR7ZmlsZU5hbWV9L1tuYW1lXS5baGFzaF0uanNgO1xyXG4gICAgLy8gICAgIH1cclxuICAgIC8vICAgfVxyXG4gICAgLy8gfSxcclxuICB9LFxyXG4gIGRlZmluZToge1xyXG4gICAgJ3Byb2Nlc3MuZW52Jzoge30sXHJcbiAgICAvLyBcdTZDRThcdTYxMEZcdTg5ODFcdTc1MjggSlNPTi5zdHJpbmdpZnlcclxuICAgICdwcm9jZXNzLmVudi5SU1NfQkFTRSc6IEpTT04uc3RyaW5naWZ5KGAke2dldEVudlZhbHVlKHByb2Nlc3MuZW52Lk5PREVfRU5WIHx8ICdnaXRodWInLCAnVklURV9BUFBfUlNTX0JBU0VfVVJMJyl9YCksXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICBodG1sQ29uZmlncyxcclxuICAgIC8vIHJlbW92ZUNvbnNvbGUoKSxcclxuICAgIC8vIGN1c3RvbVxyXG4gICAgLy8gTWFya2Rvd25UcmFuc2Zvcm0oKSxcclxuICAgIC8vIEF1dG9JbXBvcnQoe1xyXG4gICAgLy8gICBpbXBvcnRzOltcInZ1ZVwiLFwidnVlLXJvdXRlclwiXSxcclxuICAgIC8vICAgZHRzOidzcmMvYXV0by1pbXBvcnQuZC50cycsICAgLy8gXHU4REVGXHU1Rjg0XHU0RTBCXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwXHU2NTg3XHU0RUY2XHU1OTM5XHU1QjU4XHU2NTNFXHU1MTY4XHU1QzQwXHU2MzA3XHU0RUU0XHJcbiAgICAvLyAgIC8vIGR0czogdHJ1ZSwgLy8gXHU0RjFBXHU1NzI4XHU2ODM5XHU3NkVFXHU1RjU1XHU3NTFGXHU2MjEwYXV0by1pbXBvcnRzLmQudHNcdUZGMENcdTkxQ0NcdTk3NjJcdTUzRUZcdTRFRTVcdTc3MEJcdTUyMzBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTc2ODRhcGlcclxuICAgIC8vICAgaW5jbHVkZTogWy9cXC5bdGpdc3g/JC8sIC9cXC52dWUkL10sIC8vIFx1NTMzOVx1OTE0RFx1NzY4NFx1NjU4N1x1NEVGNlx1RkYwQ1x1NEU1Rlx1NUMzMVx1NjYyRlx1NTRFQVx1NEU5Qlx1NTQwRVx1N0YwMFx1NzY4NFx1NjU4N1x1NEVGNlx1OTcwMFx1ODk4MVx1ODFFQVx1NTJBOFx1NUYxNVx1NTE2NVxyXG4gICAgLy8gICAvLyBcdTY4MzlcdTYzNkVcdTk4NzlcdTc2RUVcdTYwQzVcdTUxQjVcdTkxNERcdTdGNkVlc2xpbnRyY1x1RkYwQ1x1OUVEOFx1OEJBNFx1NjYyRlx1NEUwRFx1NUYwMFx1NTQyRlx1NzY4NFxyXG4gICAgLy8gICBlc2xpbnRyYzoge1xyXG4gICAgLy8gICAgIGVuYWJsZWQ6IHRydWUgLy8gQGRlZmF1bHQgZmFsc2VcclxuICAgIC8vICAgICAvLyBcdTRFMEJcdTk3NjJcdTRFMjRcdTRFMkFcdTY2MkZcdTUxNzZcdTRFRDZcdTkxNERcdTdGNkVcdUZGMENcdTlFRDhcdThCQTRcdTUzNzNcdTUzRUZcclxuICAgIC8vICAgICAvLyBcdThGOTNcdTUxRkFcdTRFMDBcdTRFRkRqc29uXHU2NTg3XHU0RUY2XHVGRjBDXHU5RUQ4XHU4QkE0XHU4RjkzXHU1MUZBXHU4REVGXHU1Rjg0XHU0RTNBLi8uZXNsaW50cmMtYXV0by1pbXBvcnQuanNvblxyXG4gICAgLy8gICAgIC8vIGZpbGVwYXRoOiAnLi8uZXNsaW50cmMtYXV0by1pbXBvcnQuanNvbicsIC8vIEBkZWZhdWx0ICcuLy5lc2xpbnRyYy1hdXRvLWltcG9ydC5qc29uJ1xyXG4gICAgLy8gICAgIC8vIGdsb2JhbHNQcm9wVmFsdWU6IHRydWUsIC8vIEBkZWZhdWx0IHRydWUgXHU1M0VGXHU4QkJFXHU3RjZFIGJvb2xlYW4gfCAncmVhZG9ubHknIHwgJ3JlYWRhYmxlJyB8ICd3cml0YWJsZScgfCAnd3JpdGVhYmxlJ1xyXG4gICAgLy8gICB9XHJcbiAgICAvLyB9KSxcclxuICAgIC8vIHN0eWxlSW1wb3J0KHtcclxuICAgIC8vICAgcmVzb2x2ZXM6IFtcclxuICAgIC8vICAgICBBbmREZXNpZ25WdWVSZXNvbHZlKClcclxuICAgIC8vICAgXSxcclxuICAgIC8vICAgLy8gXHU4MUVBXHU1QjlBXHU0RTQ5XHU4OUM0XHU1MjE5XHJcbiAgICAvLyAgIGxpYnM6IFtcclxuICAgIC8vICAgICB7XHJcbiAgICAvLyAgICAgICBsaWJyYXJ5TmFtZTogJ2FudC1kZXNpZ24tdnVlJyxcclxuICAgIC8vICAgICAgIGVzTW9kdWxlOiB0cnVlLFxyXG4gICAgLy8gICAgICAgcmVzb2x2ZVN0eWxlOiAobmFtZSkgPT4ge1xyXG4gICAgLy8gICAgICAgICByZXR1cm4gYGFudC1kZXNpZ24tdnVlL2VzLyR7bmFtZX0vc3R5bGUvaW5kZXhgXHJcbiAgICAvLyAgICAgICB9XHJcbiAgICAvLyAgICAgfVxyXG4gICAgLy8gICBdXHJcbiAgICAvLyB9KSxcclxuICAgIENvbXBvbmVudHMoe1xyXG4gICAgICBkaXJzOiByZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9jb21wb25lbnRzXCIpLFxyXG4gICAgICBpbmNsdWRlOiBbL1xcLnZ1ZSQvLCAvXFwudnVlXFw/dnVlL10sXHJcbiAgICAgIGR0czogXCIuL3R5cGluZ3MvY29tcG9uZW50cy5kLnRzXCIsXHJcbiAgICAgIHRyYW5zZm9ybWVyOiBcInZ1ZTNcIixcclxuICAgICAgcmVzb2x2ZXJzOiBbXHJcbiAgICAgICAgLy8gQW50ZHZSZXNvbHZlcigpLFxyXG4gICAgICAgIEljb25zUmVzb2x2ZXIoKSxcclxuICAgICAgICAvLyBBbnREZXNpZ25WdWVSZXNvbHZlcih7XHJcbiAgICAgICAgLy8gICBpbXBvcnRTdHlsZTogdHJ1ZSwgLy8gY3NzIGluIGpzXHJcbiAgICAgICAgLy8gICByZXNvbHZlSWNvbnM6IHRydWVcclxuICAgICAgICAvLyB9KSxcclxuICAgICAgXSxcclxuICAgIH0pLFxyXG4gICAgSWNvbnMoeyBhdXRvSW5zdGFsbDogdHJ1ZSB9KSxcclxuICAgIHZ1ZVByZXZpZXdQbHVnaW4oe1xyXG4gICAgICBwcm9wczoge1xyXG4gICAgICAgIHByZXZpZXdCb2R5U3R5bGU6IHtcclxuICAgICAgICAgIGRpc3BsYXk6IFwiZmxleFwiLFxyXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXHJcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcHJldmlld0FwcFN0eWxlOiB7XHJcbiAgICAgICAgICBkaXNwbGF5OiBcImZsZXhcIixcclxuICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxyXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcclxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXHJcbiAgICAgICAgICBmb250RmFtaWx5OiBcIkpldEJyYWluc01vbm8sIEFsaWJhYmFQdUh1aVRpXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbXBvcnRNYXA6IHtcclxuICAgICAgICAgIFwiQHZ1ZS9zaGFyZWRcIjpcclxuICAgICAgICAgICAgXCJodHRwczovL3VucGtnLmNvbS9AdnVlL3NoYXJlZEBsYXRlc3QvZGlzdC9zaGFyZWQuZXNtLWJ1bmRsZXIuanNcIixcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSksXHJcbiAgICAvLyB2aXRlUGx1Z2luTW9uaXRvcih7XHJcbiAgICAvLyAgIC8vIGxvZzogZmFsc2UsXHJcbiAgICAvLyAgIG1vbml0b3IobGFiZWwsIHRpbWUsIG9yaWdpbkRhdGEpIHtcclxuICAgIC8vICAgICBpZiAob3JpZ2luRGF0YSkge1xyXG4gICAgLy8gICAgICAgY29uc3QgeyB0aW1lMSwgdGltZTIsIG9yaWdpblZhbHVlLCBjaGFsa1ZhbHVlIH0gPSBvcmlnaW5EYXRhO1xyXG4gICAgLy8gICAgICAgY29uc29sZS5sb2cob3JpZ2luVmFsdWUpO1xyXG4gICAgLy8gICAgICAgY29uc29sZS5sb2coY2hhbGtWYWx1ZSk7XHJcbiAgICAvLyAgICAgICBjb25zb2xlLmxvZyhsYWJlbCwgdGltZTEsIHRpbWUyLCBgJHt0aW1lfW1zYCk7XHJcbiAgICAvLyAgICAgfVxyXG4gICAgLy8gICB9LFxyXG4gICAgLy8gICBkZWJ1ZyhzdHIpIHtcclxuICAgIC8vICAgICAvLyBcdTYyNTNcdTUzNzBcdTVCOENcdTY1NzRcdTY1RTVcdTVGRDdcclxuICAgIC8vICAgICAvLyBwcm9jZXNzLnN0ZG91dC53cml0ZShzdHIpXHJcbiAgICAvLyAgIH0sXHJcbiAgICAvLyB9KSxcclxuICAgIC8vIFZpdGVBbGlhc2VzKHtcclxuICAgIC8vICAgLyoqXHJcbiAgICAvLyAgICAqIFJlbGF0aXZlIHBhdGggdG8gdGhlIHByb2plY3QgZGlyZWN0b3J5XHJcbiAgICAvLyAgICAqL1xyXG4gICAgLy8gICBkaXI6IFwic3JjXCIsXHJcbiAgICAvLyAgIC8qKlxyXG4gICAgLy8gICAgKiBQcmVmaXggc3ltYm9sIGZvciB0aGUgYWxpYXNlc1xyXG4gICAgLy8gICAgKi9cclxuICAgIC8vICAgcHJlZml4OiBcIn5cIixcclxuICAgIC8vICAgLyoqXHJcbiAgICAvLyAgICAqIEFsbG93IHNlYXJjaGluZyBmb3Igc3ViZGlyZWN0b3JpZXNcclxuICAgIC8vICAgICovXHJcbiAgICAvLyAgIGRlZXA6IHRydWUsXHJcbiAgICAvLyAgIC8qKlxyXG4gICAgLy8gICAgKiBTZWFyY2ggZGVwdGhsZXZlbCBmb3Igc3ViZGlyZWN0b3JpZXNcclxuICAgIC8vICAgICovXHJcbiAgICAvLyAgIGRlcHRoOiAxLFxyXG4gICAgLy8gICAvKipcclxuICAgIC8vICAgICogQ3JlYXRlcyBhIExvZ2ZpbGVcclxuICAgIC8vICAgICogdXNlIGBsb2dQYXRoYCB0byBjaGFuZ2UgdGhlIGxvY2F0aW9uXHJcbiAgICAvLyAgICAqL1xyXG4gICAgLy8gICBjcmVhdGVMb2c6IGZhbHNlLFxyXG4gICAgLy8gICAvKipcclxuICAgIC8vICAgICogUGF0aCBmb3IgTG9nZmlsZVxyXG4gICAgLy8gICAgKi9cclxuICAgIC8vICAgbG9nUGF0aDogXCJzcmMvbG9nc1wiLFxyXG4gICAgLy8gICAvKipcclxuICAgIC8vICAgICogQ3JlYXRlIGdsb2JhbCBwcm9qZWN0IGRpcmVjdG9yeSBhbGlhc1xyXG4gICAgLy8gICAgKi9cclxuICAgIC8vICAgY3JlYXRlR2xvYmFsQWxpYXM6IHRydWUsXHJcbiAgICAvLyAgIC8qKlxyXG4gICAgLy8gICAgKiBUdXJucyBkdXBsaWNhdGVzIGludG8gY2FtZWxDYXNlZCBwYXRoIGFsaWFzZXNcclxuICAgIC8vICAgICovXHJcbiAgICAvLyAgIGFkanVzdER1cGxpY2F0ZXM6IGZhbHNlLFxyXG4gICAgLy8gICAvKipcclxuICAgIC8vICAgICogVXNlZCBwYXRocyBpbiBKUy9UUyBjb25maWdzIHdpbGwgbm93IGJlIHJlbGF0aXZlIHRvIGJhc2VVcmxcclxuICAgIC8vICAgICovXHJcbiAgICAvLyAgIHVzZUFic29sdXRlOiBmYWxzZSxcclxuICAgIC8vICAgLyoqXHJcbiAgICAvLyAgICAqIEFkZHMgc2VwZXJhdGUgaW5kZXggcGF0aHNcclxuICAgIC8vICAgICogYXBwcm9hY2ggY3JlYXRlZCBieSBAZGF2aWRvaGxpblxyXG4gICAgLy8gICAgKi9cclxuICAgIC8vICAgdXNlSW5kZXhlczogZmFsc2UsXHJcbiAgICAvLyAgIC8qKlxyXG4gICAgLy8gICAgKiBHZW5lcmF0ZXMgcGF0aHMgaW4gSURFIGNvbmZpZyBmaWxlXHJcbiAgICAvLyAgICAqIHdvcmtzIHdpdGggSlMgb3IgVFNcclxuICAgIC8vICAgICovXHJcbiAgICAvLyAgIHVzZUNvbmZpZzogdHJ1ZSxcclxuICAgIC8vICAgLyoqXHJcbiAgICAvLyAgICAqIE92ZXJyaWRlIGNvbmZpZyBwYXRoc1xyXG4gICAgLy8gICAgKi9cclxuICAgIC8vICAgb3ZyQ29uZmlnOiBmYWxzZSxcclxuICAgIC8vICAgLyoqXHJcbiAgICAvLyAgICAqIFdpbGwgZ2VuZXJhdGUgUGF0aHMgaW4gdHNjb25maWdcclxuICAgIC8vICAgICogdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGB1c2VDb25maWdgXHJcbiAgICAvLyAgICAqIFR5cGVzY3JpcHQgd2lsbCBiZSBhdXRvIGRldGVjdGVkXHJcbiAgICAvLyAgICAqL1xyXG4gICAgLy8gICBkdHM6IGZhbHNlLFxyXG4gICAgLy8gICAvKipcclxuICAgIC8vICAgICogRGlzYWJsZXMgYW55IHRlcm1pbmFsIG91dHB1dFxyXG4gICAgLy8gICAgKi9cclxuICAgIC8vICAgc2lsZW50OiB0cnVlLFxyXG4gICAgLy8gICAvKipcclxuICAgIC8vICAgICogUm9vdCBwYXRoIG9mIFZpdGUgcHJvamVjdFxyXG4gICAgLy8gICAgKi9cclxuICAgIC8vICAgcm9vdDogcHJvY2Vzcy5jd2QoKSxcclxuICAgIC8vIH0pLFxyXG4gICAgU2VhcmNoUGx1Z2luKG9wdGlvbnMpLFxyXG4gICAgVW5vQ1NTKCksXHJcbiAgXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAvLyBcIkBcIjogZmlsZVVSTFRvUGF0aChuZXcgVVJMKFwiLlwiLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgICAgXCJAXCI6IGZpbGVVUkxUb1BhdGgobmV3IFVSTChcIi4vc3JjXCIsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICBcIkB2cFwiOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoXCIuLy52aXRlcHJlc3NcIiwgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICAgIHB1YmxpYzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKFwiLi9wdWJsaWNcIiwgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICAgIFwiflwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vXCIpLFxyXG4gICAgICAvLyBcIkBcIjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjXCIpLFxyXG4gICAgICAvLyAvLyBcdTZDRThcdTYxMEZcdTRFMDBcdTVCOUFcdTRFMERcdTg5ODFcdTk2OEZcdTYxMEZcdTU0N0RcdTU0MERcdUZGMENhIGIgY1x1OEZEOVx1NjgzN1x1NzY4NFx1RkYwQ1x1OTg3OVx1NzZFRVx1NzY4NFx1NzZFRVx1NUY1NVx1NEU1Rlx1NEUwRFx1ODBGRFx1NEUzQVx1NTE3M1x1OTUyRVx1NUI1N1x1NEZERFx1NzU1OVx1NUI1N1x1RkYwMVx1RkYwMVxyXG4gICAgICAvLyBcImNvbXBcIjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjL2NvbXBvbmVudHNcIiksXHJcbiAgICAgIC8vIC8vIFx1OTE0RFx1N0Y2RVx1NTZGRVx1NzI0N1x1ODk4MVx1OEZEOVx1NjgzN1x1NUYxNVx1NzUyOFxyXG4gICAgICAvLyBcIi9pbWdcIjogXCIuL3NyYy9hc3NldHNcIixcclxuICAgIH0sXHJcbiAgICAvLyBkZWR1cGU6IFtdLCAvLyBcdTVGM0FcdTUyMzYgVml0ZSBcdTU5Q0JcdTdFQzhcdTVDMDZcdTUyMTdcdTUxRkFcdTc2ODRcdTRGOURcdThENTZcdTk4NzlcdTg5RTNcdTY3OTBcdTRFM0FcdTU0MENcdTRFMDBcdTUyNkZcdTY3MkNcclxuICAgIC8vIGNvbmRpdGlvbnM6IFtdLCAvLyBcdTg5RTNcdTUxQjNcdTdBMEJcdTVFOEZcdTUzMDVcdTRFMkQgXHU2MEM1XHU2NjZGXHU1QkZDXHU1MUZBIFx1NjVGNlx1NzY4NFx1NTE3Nlx1NEVENlx1NTE0MVx1OEJCOFx1Njc2MVx1NEVGNlxyXG4gICAgLy8gbWFpbkZpZWxkczogW10sIC8vIFx1ODlFM1x1Njc5MFx1NTMwNVx1NTE2NVx1NTNFM1x1NzBCOVx1NUMxRFx1OEJENVx1NzY4NFx1NUI1N1x1NkJCNVx1NTIxN1x1ODg2OFxyXG4gICAgLy8gZXh0ZW5zaW9uczogWycuanMnLCAnLnRzJywgJy5qc29uJ10gLy8gXHU1QkZDXHU1MTY1XHU2NUY2XHU2MEYzXHU4OTgxXHU3NzAxXHU3NTY1XHU3Njg0XHU2MjY5XHU1QzU1XHU1NDBEXHU1MjE3XHU4ODY4XHJcbiAgfSxcclxuICBzc3I6IHtcclxuICAgIG5vRXh0ZXJuYWw6IFtcInZpdGVwcmVzcy1wbHVnaW4tbnByb2dyZXNzXCJdLFxyXG4gIH0sXHJcbiAgLy8gcmVzb2x2ZToge1xyXG4gIC8vICAgYWxpYXM6IHtcclxuICAvLyAgICAgJ21lcm1haWQnOiAnbWVybWFpZC9kaXN0L21lcm1haWQuZXNtLm1qcycsXHJcbiAgLy8gICB9LFxyXG4gIC8vIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsU0FBUyxjQUFjLGVBQWU7QUFDdEMsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sbUJBQW1CO0FBQzFCLE9BQU8sZ0JBQWdCO0FBR3ZCLFNBQVMsd0JBQXdCO0FBR2pDLE9BQU8sWUFBWTtBQUNuQixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLDRCQUE0QjtBQUNuQyxPQUFPLFFBQVEsZUFBZTtBQUM5QixTQUFTLHFCQUFxQjtBQUM5QixPQUFPLGdCQUFnQjtBQTZFdkIsT0FBTyxhQUFhO0FBNUZwQixJQUFNLG1DQUFtQztBQUFrSSxJQUFNLDJDQUEyQztBQWlCNU4sSUFBTSxjQUFjLENBQUMsTUFBYyxXQUFtQjtBQUNwRCxRQUFNLFFBQVEsUUFBUSxNQUFNLEtBQUssS0FBSyxRQUFRLElBQUksR0FBRyxLQUFLLENBQUMsRUFBRSxNQUFNO0FBQ25FLFVBQVEsSUFBSSxLQUFLO0FBQ2pCLFNBQU87QUFDVDtBQUVBLElBQU0sY0FBYyxXQUFXO0FBQUEsRUFDN0IsYUFBYTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBT2I7QUFBQSxFQUNBLE9BQU87QUFBQTtBQUFBO0FBQUE7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
