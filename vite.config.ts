import { defineConfig, loadEnv } from "vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import Components from "unplugin-vue-components/vite";
import UnoCSS from "unocss/vite";
import path, { resolve } from "path";
import { fileURLToPath } from "url";
import type { Plugin } from "vite";
import { chunkSplitPlugin } from "vite-plugin-chunk-split";
import { compression } from "vite-plugin-compression2";
import Inspect from "vite-plugin-inspect";
import mkcert from "vite-plugin-mkcert";
import Iconify from "unplugin-iconify-generator/vite";
import { envParse } from "vite-plugin-env-parse";
import { vitePluginFakeServer } from "vite-plugin-fake-server";
import { updateMetadata } from "./plugins/vitePluginUpdateMetadata";
import prefetchDnsPlugin from "./plugins/vite-plugin-dns-prefetch";
import versionInjector from "unplugin-version-injector/vite";
import { viteMockServe } from "vite-plugin-mock";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import imagePreload from "vite-plugin-image-preload";
import { robots } from "vite-plugin-robots";
import vueStyledPlugin from "@vue-styled-components/plugin";
import { qrcode } from "vite-plugin-qrcode";
import colors from "picocolors";
import llmstxt from "vitepress-plugin-llms";
import { webUpdateNotice } from "@plugin-web-update-notification/vite";
import { ValidateEnv, Schema } from "@julr/vite-plugin-validate-env";
import ConditionalCompile from "vite-plugin-conditional-compiler";
import { mockDevServerPlugin } from "vite-plugin-mock-dev-server";
import { shortcutsPlugin } from "vite-plugin-shortcuts";
import imagePlaceholder from "vite-plugin-image-placeholder";
import findImageDuplicates from "vite-plugin-find-image-duplicates";
import { ViteTips } from "vite-plugin-tips";

const getEnvValue = (mode: string, target: string) => {
  const value = loadEnv(mode, process.cwd())[target];
  return value;
};

const yourPlugin: () => Plugin = () => ({
  name: "test-plugin",
  config(config) {
    // get version in vitePlugin if you open `ifGlobal`
    console.log(config.define);
  },
});

function getDevPlugins() {
  if (process.env.NODE_ENV === "production") {
    return [];
  }
  return [
    qrcode(),
    ViteTips(),
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
    Inspect(),
    // VitePluginBuildLegacy(),
    vitePluginFakeServer({
      include: "mock", // 设置目标文件夹，将会引用该文件夹里包含xxx.fake.{ts,js,mjs,cjs,cts,mts}的文件
      enableProd: true, // 是否在生产环境下设置mock
    }),
    llmstxt(),
  ];
}

// https://vitejs.dev/config/
export default defineConfig(() => {
  const timestamp = new Date().getTime();

  return {
    server: {
      port: 5500,
      hmr: {
        overlay: false,
      },
      fs: {
        allow: [resolve(__dirname, "..")],
      },
    },
    clearScreen: false, // 设为 false 可以避免 Vite 清屏而错过在终端中打印某些关键信息
    build: {
      // target: 'es2022',
      // cssTarget: 'chrome118',
      // minify: 'esbuild',
      // terserOptions: {
      //   format: {
      //     comments: false,
      //   }
      // },
      sourcemap: false, // Seems to cause JavaScript heap out of memory errors on build
      chunkSizeWarningLimit: 5000, // 设置 chunk 大小警告的限制为 2000 KiB
      emptyOutDir: true,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ["vue", "vue-router", "pinia"],
            echarts: ["echarts"],
            vp: ["./.vitepress"],
            core: ["./src"],
            utils: ["./utils"],
            app: ["./src/App.vue"],
          },
          entryFileNames: `js/[name]-[hash].js`,
          chunkFileNames: `js/[name]-[hash].js`,
          assetFileNames(assetInfos) {
            // if (assetInfos.name.endsWith(".css")) {
            //   return `css/[name]-[hash].css`;
            // }
            return `[ext]/[name]-[hash].[ext]`;
          },
        },
      },
    },
    esbuild: {
      exclude:
        process.env.NODE_ENV !== "production" ? [] : ["console", "debugger"],
    },
    // experimental: {
    //   importGlobRestoreExtension: true,
    //   hmrPartialAccept: true,
    //   webComponents: true
    // },
    define: {
      APP_VERSION: timestamp,
      __VUE_PROD_DEVTOOLS__: false,
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
      ...getDevPlugins(),
      envParse(),
      updateMetadata(),
      yourPlugin(),
      chunkSplitPlugin({
        strategy: "default",
      }),
      vueStyledPlugin(),
      // progress({
      //   format:  `${colors.green(colors.bold('Bouilding'))} ${colors.cyan('[:bar]')} :percent`
      // }),
      Iconify({
        collections: {
          cmono: "./src/assets/icons/mono",
        },
      }),
      // ConditionalCompile(),
      ValidateEnv({
        validator: "builtin",
        schema: {
          VITE_APP_PRIMARY_COLOR: Schema.string(),
        },
      }),
      webUpdateNotice({
        logVersion: true,
        notificationProps: {
          title: "系统更新",
          description: "系统有更新，请刷新页面",
          buttonText: "刷新",
        },
      }),
      imagePlaceholder({ prefix: "image/placeholder" }),
     // findImageDuplicates({ imagePath: ["public/images"] }),
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
      ViteImageOptimizer({
        png: { quality: 80 },
        jpeg: { quality: 75 },
        svg: { multipass: true },
        // 排除不需要优化的文件夹/文件
        exclude: [
          // 忽略整个目录（正则表达式）
          // /\/src\/assets\/raw\/.*/,

          // 忽略特定文件类型
          // /.*\.svg$/,

          // 使用 glob 模式（插件内部转为正则）
          "**/fonts/**",
          // "public/do-not-optimize/*.png"
        ],
      }),
      // ViteImageOptimizer({
      //   png: { quality: 80 },
      //   jpeg: { quality: 75 },
      //   svg: { multipass: true },
      //   exclude: ['fonts']
      // }),
      robots(),
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
      // VueDevTools(),
      UnoCSS(),
      prefetchDnsPlugin(),
      mkcert({
        savePath: "./certs", // save the generated certificate into certs directory
        autoUpgrade: false,
        force: false, // force generation of certs even without setting https property in the vite config
      }),
      compression(),
      versionInjector(),
      imagePreload({
        dir: "images/**/*.{png,jpg,jpeg,gif,svg,webp}",
        attrs: {
          rel: "prefetch",
        },
      }),
      // Sonda(),
      // llmstxt({
      //   generateLLMsFullTxt: false,
      //   ignoreFiles: ['sponsors/*'],
      //   customLLMsTxtTemplate: `# {title}\n\n{foo}`,
      //   title: 'Awesome tool',
      //   customTemplateVariables: {
      //     foo: 'bar'
      //   }
      // })
      // viteMockServe({
      //   mockPath: './mock/',
      //   localEnabled: command === 'serve', // 开发环境启用
      //   prodEnabled: command !== 'serve', // 生产环境启用
      //   supportTs: true, // 支持 TypeScript 文件
      //   watchFiles: true, // 监视文件更改
      //   injectCode: `
      //     import { setupProdMockServer } from './mockProdServer';
      //     setupProdMockServer();
      //   `,
      // }),
    ],
    css: {
      codeSplit: false,
      preprocessorOptions: {
        less: {
          modifyVars: {
            hack: 'true; @import "@vp/theme/styles/vars.less"',
          },
          javascriptEnabled: true,
          globalVars: {},
        },
      },
      // transform: 'lightningcss',
      // lightningcss: {
      //   drafts: {
      //     nesting: true,
      //     customMedia: true
      //   }
      // },
      // devSourcemap: true
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
      noExternal: ["fs"], // Externalize Node.js modules
    },
    optimizeDeps: {
      include: ["vue"],
      exclude: ["vitepress", "svg2roughjs", "echarts", "echarts-gl"],
      // esbuildOptions: {
      //   treeShaking: true,
      //   legalComments: true
      // }
    },
  };
});
