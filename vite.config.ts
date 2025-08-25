import { defineConfig, loadEnv } from "vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import Components from "unplugin-vue-components/vite";
import UnoCSS from "unocss/vite";
import path, { resolve } from "path";
import { fileURLToPath } from "url";
import type { Plugin } from "vite";
import Inspect from "vite-plugin-inspect";
import mkcert from "vite-plugin-mkcert";
import Iconify from "unplugin-iconify-generator/vite";
import { envParse } from "vite-plugin-env-parse";
import { vitePluginFakeServer } from "vite-plugin-fake-server";
import { updateMetadata } from "./plugins/vitePluginUpdateMetadata";
import prefetchDnsPlugin from "./plugins/vite-plugin-dns-prefetch";
import vitePluginTryCatchConsole from "./plugins/vite-plugin-try-catch-console";
import versionInjector from "unplugin-version-injector/vite";
import imagePreload from "vite-plugin-image-preload";
import { robots } from "vite-plugin-robots";
import vueStyledPlugin from "@vue-styled-components/plugin";
import { qrcode } from "vite-plugin-qrcode";
import colors from "picocolors";
import llmstxt from "vitepress-plugin-llms";
import { ValidateEnv, Schema } from "@julr/vite-plugin-validate-env";
import { mockDevServerPlugin } from "vite-plugin-mock-dev-server";
import { shortcutsPlugin } from "vite-plugin-shortcuts";
import imagePlaceholder from "vite-plugin-image-placeholder";
import findImageDuplicates from "vite-plugin-find-image-duplicates";
import { px2rem } from "vite-plugin-px2rem";
import { codeInspectorPlugin } from "code-inspector-plugin";
import { VitePWA } from "vite-plugin-pwa";

const getEnvValue = (mode: string, target: string) => {
  const value = loadEnv(mode, process.cwd())[target];
  return value;
};

// ♻️ 重构
const yourPlugin: () => Plugin = () => ({
  name: "test-plugin",
  config(config) {
    // get version in vitePlugin if you open `ifGlobal`
    console.log(config.define);
  },
  configResolved(config) {
    console.log("options", config.optimizeDeps, config.oxc);
  },
  resolveId() {
    console.log(
      colors.red(`viteVersion: ${colors.italic(this.meta.viteVersion)} `),
      colors.green(
        ` rollupVersionersion: ${colors.italic(this.meta.rollupVersion)} `
      ),
      colors.blue(
        ` rolldownVersion: ${colors.italic(this.meta.rolldownVersion)} `
      )
    );
  },
});

function getDevPlugins() {
  if (process.env.NODE_ENV === "production") {
    return [];
  }
  return [
    qrcode(),
    mockDevServerPlugin(),
    findImageDuplicates({ imagePath: ["public/images"] }),
    shortcutsPlugin({
      shortcuts: [
        {
          key: "c",
          description: "close console",
          action: (server) => {
            server.config.logger.clearScreen("error");
          },
        },
        {
          key: "s",
          description: "reset console",
          action: (server) => {
            server.config.logger.clearScreen("error");
            server.printUrls();
          },
        },
        // {
        //   key: 'r',
        //   description: 'restart the server',
        //   async action(server) {
        //     await server.restart();
        //   },
        // },
        // {
        //   key: 'u',
        //   description: 'show server url',
        //   action(server) {
        //     server.config.logger.info('');
        //     server.printUrls();
        //   },
        // },
        // {
        //   key: 'q',
        //   description: 'quit',
        //   async action(server) {
        //     await server.close().finally(() => process.exit());
        //   },
        // },
      ],
    }),
    // // 仅对以 `.svg?react` 结尾的文件加载 `svgr` 插件
    // withFilter(
    //   svgr({
    //     /*...*/
    //   }),
    //   { load: { id: /\.svg\?react$/ } },
    // ),
    Inspect(),
    envParse(),
    yourPlugin(),
    vitePluginTryCatchConsole(),
    vitePluginFakeServer({
      include: "fake", // 设置目标文件夹，将会引用该文件夹里包含xxx.fake.{ts,js,mjs,cjs,cts,mts}的文件
      enableProd: true, // 是否在生产环境下设置mock
    }),
    ValidateEnv({
      validator: "builtin",
      schema: {
        VITE_APP_PRIMARY_COLOR: Schema.string(),
      },
    }),
    imagePlaceholder({ prefix: "image/placeholder" }),
    codeInspectorPlugin({
      bundler: "vite",
    }),
    // 开发环境错误提示优化
    {
      name: "dev-error-handler",
      configureServer(server) {
        server.middlewares.use("/api", (req, res, next) => {
          // ✅ 开发环境API错误处理
          console.log(`🔍 API Request: ${req.method} ${req.url}`);
          next();
        });
      },
    },
    shortcutsPlugin({
      shortcuts: [
        {
          key: "c",
          description: "close console",
          action: (server) => {
            server.config.logger.clearScreen("error");
          },
        },
        {
          key: "s",
          description: "reset console",
          action: (server) => {
            server.config.logger.clearScreen("error");
            server.printUrls();
          },
        },
        // {
        //   key: 'r',
        //   description: 'restart the server',
        //   async action(server) {
        //     await server.restart();
        //   },
        // },
        // {
        //   key: 'u',
        //   description: 'show server url',
        //   action(server) {
        //     server.config.logger.info('');
        //     server.printUrls();
        //   },
        // },
        // {
        //   key: 'q',
        //   description: 'quit',
        //   async action(server) {
        //     await server.close().finally(() => process.exit());
        //   },
        // },
      ],
    }),
    mkcert({
      savePath: "./certs", // save the generated certificate into certs directory
      autoUpgrade: false,
      force: false, // force generation of certs even without setting https property in the vite config
    }),
  ];
}

function manualChunks(id, { getModuleInfo }) {
  const match = /.*\.strings\.(\w+)\.js/.exec(id);
  if (match) {
    const language = match[1]; // e.g. "en"
    const dependentEntryPoints: Array<any> = [];

    // 我们在这里使用 Set 集合，这样每个模块最多处理一次。
    // 这可以防止循环依赖情况下的无限循环
    const idsToHandle = new Set(getModuleInfo(id).dynamicImporters);

    for (const moduleId of idsToHandle) {
      const { isEntry, dynamicImporters, importers } = getModuleInfo(moduleId);
      if (isEntry || dynamicImporters.length > 0)
        dependentEntryPoints.push(moduleId);

      // Set 迭代器足够智能，可以迭代迭代过程中添加的元素
      for (const importerId of importers) idsToHandle.add(importerId);
    }

    // 如果有唯一条目，我们会根据条目名称将其放入一个块中
    if (dependentEntryPoints.length === 1) {
      return `${
        dependentEntryPoints[0].split("/").slice(-1)[0].split(".")[0]
      }.strings.${language}`;
    }
    // 对于多个条目，我们将其放入“共享”块中
    if (dependentEntryPoints.length > 1) {
      return `shared.strings.${language}`;
    }
  }
}

// https://vitejs.dev/config/
// @ts-ignore
export default defineConfig(() => {
  const timestamp = new Date().getTime();

  return {
    builder: {
      buildApp: async (builder) => {
        const environments = Object.values(builder.environments);
        console.log("environments", environments);
        return Promise.all(
          environments.map((environment) => builder.build(environment))
        );
      },
    },
    server: {
      // ✅ 服务器基础配置
      host: "0.0.0.0", // 允许外部访问
      port: 5500,
      open: true, // 自动打开浏览器

      // HMR配置
      hmr: {
        overlay: true, // 显示错误覆盖层
      },

      // // 文件监听配置
      // watch: {
      //   usePolling: true, // 在某些系统上启用轮询
      //   interval: 1000, // 轮询间隔
      // },

      fs: {
        allow: [resolve(__dirname, "..")],
      },
      // vite-plugin-mock-dev-server
      // plugin will read `server.proxy`
      // proxy: {
      //   "^/api": { target: "http://example.com" },
      // },
    },
    clearScreen: false, // 设为 false 可以避免 Vite 清屏而错过在终端中打印某些关键信息
    dev: {
      bundler: "rolldown",
    },
    build: {
      bundler: "rolldown", // 显式声明使用 Rolldown
      sourcemap: false, // Seems to cause JavaScript heap out of memory errors on build
      chunkSizeWarningLimit: 20 * 1000 * 1000, // 设置 chunk 大小警告的限制为 2000 KiB
      emptyOutDir: true,
      // rollupOptions: {
      //   output: {
      //     // advancedChunks: manualChunks
      //     advancedChunks: {
      //       groups: [
      //         { name: "vendor", test: /\/vue(?:-dom)?/ },
      //         { name: "vitepress", test: /\/vitepress/g },
      //         { name: "echarts", test: /\/echarts/g },
      //         { name: "vite-plugin", test: /\/vite-plugin/g },
      //         { name: "markdown", test: /\/markdown-/ },
      //       ],
      //     },
      //   },
      // },
      reportCompressedSize: false,
      // cssMinify: "lightningcss", // 确保生产构建使用相同配置
    },
    experimental: {
      importGlobRestoreExtension: true,
      hmrPartialAccept: true,
      webComponents: true,
      enableNativePlugin: true,
      fullBundleMode: true,
    },
    // The fields defined here can also be used in mock.
    define: {
      APP_VERSION: timestamp,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_OPTIONS_API__: true,
      // __version__: JSON.stringify(GeneratVersion()),
      "process.env": {},
      // 注意要用 JSON.stringify
      "process.env.RSS_BASE": JSON.stringify(
        `${getEnvValue(
          process.env.NODE_ENV || "github",
          "VITE_APP_RSS_BASE_URL"
        )}`
      ),
    },
    plugins: [
      Components({
        resolvers: [
          IconsResolver({
            // 自动引入的Icon组件统一前缀，默认为icon，设置false为不需要前缀
            prefix: "icon",
            strict: true,
            // 当图标集名字过长时，可使用集合别名
            // alias: {
            //   system: 'system-uicons'
            // },
            // enabledCollections: ['logos']
          }),
        ],
      }),
      Icons({
        compiler: "vue3",
        autoInstall: true,
      }),
      UnoCSS(),
      ...getDevPlugins(),
      updateMetadata(),
      vueStyledPlugin(),
      Iconify({
        collections: {
          cmono: "./src/assets/icons/mono",
        },
      }),
      // px2rem({
      //   width: 1920,
      //   rootFontSize: 16,
      // }),
      robots(),
      prefetchDnsPlugin(),
      versionInjector(),
      imagePreload({
        dir: "images/**/*.{png,jpg,jpeg,gif,svg,webp}",
        attrs: {
          rel: "prefetch",
        },
      }),
      llmstxt({
        generateLLMsFullTxt: false,
        ignoreFiles: ["sponsors/*"],
        customLLMsTxtTemplate: `# {title}\n\n{foo}`,
        title: "CMONO.NET - Changweihua.github.io",
        customTemplateVariables: {
          foo: "bar",
        },
        experimental: {
          depth: 2, // Generate llms.txt and llms-full.txt in root and first-level subdirectories
        },
      }),
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          maximumFileSizeToCacheInBytes: 2 * 10 * 1000 * 1000,
        },
      }),
    ],
    css: {
      // postcss: {
      //   postcssIsolateStyles: {
      //     includeFiles: [/vp-doc\.css/],
      //   },
      // },
      lightningcss: {
        // 关键配置：标记 deep 为合法伪类
        pseudoClasses: { deep: true, deepSelectorCombinator: true },
        // 禁用特定优化
        minify: true,
        drafts: {
          nesting: true, // 启用嵌套语法
          customMedia: true, // 启用媒体查询变量
          keyframes: true, // 启用实验性关键帧支持
        },
        // 解决 scoped 样式问题
        cssModules: {
          // 禁用对 scoped 样式的命名转换
          // pattern: "[name]__[local]",
          // 配置CSS模块化
          pattern: "[name]__[local]__[hash:base64:5]",
        },
        // 允许特殊规则
        unrecognized: {
          pseudos: "ignore", // 忽略未知伪类错误
          atRules: "ignore", // 忽略无法识别的规则（包括 @keyframes）
        },
      },
      devSourcemap: true,
      // transformer: "postcss", // 使用 Rust 实现的 CSS 处理器
      codeSplit: false,
      /**
       * 如果启用了这个选项，那么 CSS 预处理器会尽可能在 worker 线程中运行；即通过多线程运行 CSS 预处理器，从而极大提高其处理速度
       * https://cn.vitejs.dev/config/shared-options#css-preprocessormaxworkers
       */
      preprocessorMaxWorkers: 3,
      /**
       * 建议只用来嵌入 SCSS 的变量声明文件，嵌入后全局可用
       * 该选项可以用来为每一段样式内容添加额外的代码。但是要注意，如果你添加的是实际的样式而不仅仅是变量，那这些样式在最终的产物中会重复
       * https://cn.vitejs.dev/config/shared-options.html#css-preprocessoroptions-extension-additionaldata
       */
      preprocessorOptions: {
        scss: {
          sourceMap: true,
          additionalData: `@use "@/assets/styles/variables.scss" as vars;`, // 强制全局注入
          // // 全局注入变量和混合宏
          // additionalData: `
          //   @import "@/assets/styles/variables.scss";
          //   @import "@/assets/styles/mixins.scss";
          // `,
        },
      },
    },
    resolve: {
      alias: {
        // Redirect 'fs' to an empty module or a browser-safe shim
        fs: path.resolve("./src/empty-module.js"),
        "*": fileURLToPath(new URL(".", import.meta.url)),
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        // "@vp": fileURLToPath(new URL("./.vitepress", import.meta.url)),
        public: fileURLToPath(new URL("./public", import.meta.url)),
        // "~": path.resolve(__dirname, "./"),
        // '*': path.resolve(__dirname),
        // "@": path.resolve(__dirname, "src"),
        "@vp": path.resolve(__dirname, ".vitepress"),
        // public: fileURLToPath(new URL("./public", import.meta.url)),
        // // 注意一定不要随意命名，a b c这样的，项目的目录也不能为关键字保留字！！
        // "comp": resolve(__dirname, "src/components"),
        // // 配置图片要这样引用
        // "/img": "./src/assets",
      },
      // conditions: [],
      // mainFields: []
    },
    ssr: {
      noExternal: ["fs", "markdown-it-multiple-choice"], // Externalize Node.js modules
    },
    esbuild: false,
    // 强制预构建
    optimizeDeps: {
      // 注意：force 选项已被移除，现在使用 --force 命令行参数
      // 或者删除 node_modules/.vite 目录来强制重新构建
      // ✅ 强制预构建指定依赖
      // 将常用的第三方库加入预构建列表
      include: ["vue"],
      // 排除不需要预构建的依赖
      // 排除本地开发的包，避免不必要的构建
      exclude: [
        "vitepress",
        "echarts",
      ],
      // @ts-ignore
      rollupOptions: {
        jsx: "preserve",
      },
      esbuild: false,
      // esbuildOptions: {

      // }
    },
    vite: {
      css: {
        transformer: "lightningcss",
      },
      build: {
        cssMinify: "lightningcss",
      },
    },
  };
});
