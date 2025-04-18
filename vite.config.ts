import { defineConfig, loadEnv } from "vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import Components from "unplugin-vue-components/vite";
import UnoCSS from "unocss/vite";
import path, { resolve } from "path";
import { fileURLToPath } from "url";
import type { Plugin } from "vite";
import { vitePluginVersionMark } from "vite-plugin-version-mark";
import { chunkSplitPlugin } from "vite-plugin-chunk-split";
import { compression } from 'vite-plugin-compression2'
import Inspect from "vite-plugin-inspect";
import updater from "./utils/updater";
import mkcert from "vite-plugin-mkcert";
import Iconify from "unplugin-iconify-generator/vite";
import { envParse } from "vite-plugin-env-parse";
import { preloadImages } from "./plugins/vitePreloadImage.ts";
import { vitePluginFakeServer } from "vite-plugin-fake-server";
import { updateMetadata } from "./plugins/vitePluginUpdateMetadata";

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

// https://vitejs.dev/config/
export default defineConfig(() => {
  const timestamp = new Date().getTime();

  return {
    server: {
      port: 2233,
      hmr: {
        overlay: false,
      },
      fs: {
        allow: [resolve(__dirname, "..")],
      },
    },
    clearScreen: false, // 设为 false 可以避免 Vite 清屏而错过在终端中打印某些关键信息
    build: {
      sourcemap: process.env.NODE_ENV !== "production", // Seems to cause JavaScript heap out of memory errors on build
      chunkSizeWarningLimit: 5000, // 设置 chunk 大小警告的限制为 2000 KiB
      emptyOutDir: true,
    },
    esbuild: {
      exclude:
        process.env.NODE_ENV !== "production" ? [] : ["console", "debugger"],
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
      envParse(),
      vitePluginVersionMark({
        ifShortSHA: true,
        ifMeta: true,
        ifLog: true,
        ifGlobal: true,
      }),
      updateMetadata(),
      yourPlugin(),
      updater({
        version: timestamp,
      }),
      chunkSplitPlugin({
        strategy: "default",
      }),
      Iconify({
        collections: {
          cmono: "./src/assets/icons/mono",
        },
      }),
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
      Inspect(),
      preloadImages({
        dir: "**.{jpg,png,svg,jpeg}",
        attrs: {
          rel: "preload",
        },
      }),
      // VitePluginBuildLegacy(),
      vitePluginFakeServer({
        include: "mock", // 设置目标文件夹，将会引用该文件夹里包含xxx.fake.{ts,js,mjs,cjs,cts,mts}的文件
        enableProd: true, // 是否在生产环境下设置mock
      }),
      mkcert({
        savePath: "./certs", // save the generated certificate into certs directory
        autoUpgrade: false,
        force: false, // force generation of certs even without setting https property in the vite config
      }),
      compression()
    ],
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            hack: 'true; @import "@vp/theme/styles/vars.less"',
          },
          javascriptEnabled: true,
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
    },
    ssr: {
      noExternal: ["fs"], // Externalize Node.js modules
    },
    optimizeDeps: {
      // include: [],
      exclude: ["vitepress", "svg2roughjs", "echarts", "echarts-gl"],
    },
  };
});
