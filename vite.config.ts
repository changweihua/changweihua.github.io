import { defineConfig, loadEnv } from "vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import Components from "unplugin-vue-components/vite";
import UnoCSS from "unocss/vite";
import path, { resolve } from "path";
import { fileURLToPath } from "url";
import type { Plugin } from "vite";
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
  resolveId() {
    console.log(
      this.meta.viteVersion,this.meta.rollupVersion,
      this.meta.rolldownVersion
    );
    if (this.meta.rolldownVersion) {
      console.log("rolldown-vite 的逻辑");
    } else {
      console.log("rollup-vite 的逻辑");
    }
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
    vitePluginFakeServer({
      include: "mock", // 设置目标文件夹，将会引用该文件夹里包含xxx.fake.{ts,js,mjs,cjs,cts,mts}的文件
      enableProd: true, // 是否在生产环境下设置mock
    }),
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
    llmstxt(),
  ];
}

function manualChunks(id, { getModuleInfo }) {
  const match = /.*\.strings\.(\w+)\.js/.exec(id);
  if (match) {
    const language = match[1]; // e.g. "en"
    const dependentEntryPoints = [];

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
      sourcemap: false, // Seems to cause JavaScript heap out of memory errors on build
      chunkSizeWarningLimit: 5000, // 设置 chunk 大小警告的限制为 2000 KiB
      emptyOutDir: true,
      rollupOptions: {
        output: {
          advancedChunks: manualChunks
        },
      },
      reportCompressedSize: false,
    },
    experimental: {
      importGlobRestoreExtension: true,
      hmrPartialAccept: true,
      webComponents: true,
      enableNativePlugin: true,
    },
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
      robots(),
      prefetchDnsPlugin(),
      compression(),
      versionInjector(),
      imagePreload({
        dir: "images/**/*.{png,jpg,jpeg,gif,svg,webp}",
        attrs: {
          rel: "prefetch",
        },
      }),
    ],
    css: {
      devSourcemap: false,
      codeSplit: false,
      preprocessorOptions: {
        less: {
          timeout: 30000, // 超时延长至 30 秒
          math: "parens", // 避免严格模式性能问题
          // math: "parens-division", // 提升计算性能
          javascriptEnabled: false, // 如需在 Less 中使用 JS 表达式
          // modifyVars: {
          //   hack: 'true; @import "@vp/theme/styles/vars.less"',
          // },
          additionalData: `@import "@vp/theme/styles/vars.less";`,
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
      noExternal: ["fs"], // Externalize Node.js modules
    },
    optimizeDeps: {
      // force: true,
      include: ["vue"],
      exclude: [
        "vitepress",
        "svg2roughjs",
        "echarts",
        "echarts-gl",
        ".vite",
        "node-modules/.vite",
        "node-modules/.cache",
      ],
      // esbuildOptions: {
      //   treeShaking: true,
      //   legalComments: true
      // }
    },
  };
});
