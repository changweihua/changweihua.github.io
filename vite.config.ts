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
import Inspect from "vite-plugin-inspect";
import updater from "./utils/updater";
import mkcert from "vite-plugin-mkcert";
import Iconify from "unplugin-iconify-generator/vite";
import { envParse } from "vite-plugin-env-parse";
import { preloadImages } from "./plugins/vitePreloadImage.ts";
import { vitePluginFakeServer } from "vite-plugin-fake-server";
import { updateMetadata } from "./plugins/vitePluginUpdateMetadata";
// import VueDevTools from 'vite-plugin-vue-devtools-cn'

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
      // https: {
      //   // key: fs.readFileSync("certs/cert-key.pem"),
      //   // cert: fs.readFileSync("certs/cert.pem"),
      //   cert: './certs/cert.pem',
      //   key: './certs/dev.pem'
      // },
      port: 2233,
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
      minify: "esbuild", // 使用esbuild进行压缩
      sourcemap: process.env.NODE_ENV !== "production", // Seems to cause JavaScript heap out of memory errors on build
      // minify: true, // 必须开启：使用terserOptions才有效果
      chunkSizeWarningLimit: 5000, // 设置 chunk 大小警告的限制为 2000 KiB
      emptyOutDir: true,
      rollupOptions: {
        // external: ["fs", "path"],
        // external: ["vue"], // 排除已配置 CDN 的依赖
        // output: {
        //   manualChunks: (id) => {
        //     // 自定义分包逻辑（如将工具库单独分包）
        //     if (id.includes("lodash")) return "lodash";
        //     if (id.includes("echarts")) return "echarts";
        //   },
        // },
      },
      // minify: 'terser', // 使用 Terser 进行压缩
      // terserOptions: {
      //   compress: {
      //     drop_console: true, // 删除 console.log
      //     drop_debugger: true, // 删除 debugger
      //   },
      // },
    },
    esbuild: {
      drop:
        process.env.NODE_ENV !== "production" ? [] : ["console", "debugger"],
    },
    define: {
      APP_VERSION: timestamp,
      __VUE_PROD_DEVTOOLS__: false,
      "process.env": {},
      // 注意要用 JSON.stringify
      "process.env.RSS_BASE": JSON.stringify(
        `${getEnvValue(
          process.env.NODE_ENV || "github",
          "VITE_APP_RSS_BASE_URL",
        )}`,
      ),
    },
    plugins: [
      envParse(),
      vitePluginVersionMark({
        // name: 'test-app',
        // version: '0.0.1',
        // command: 'git describe --tags',
        // ifGitSHA: true,
        ifShortSHA: true,
        ifMeta: true,
        ifLog: true,
        ifGlobal: true,
      }),
      // importToCDN({
      //   modules: process.env.NODE_ENV === 'production' ? [
      //     // 自动配置常见库的 CDN 地址
      //     {
      //       name: "vue",
      //       var: "Vue",
      //       path: "https://unpkg.com/vue@3.5.13/dist/vue.global.prod.js",
      //     },
      //   ] : [],
      // }),
      // versionInjector.vite(),
      updateMetadata(),
      yourPlugin(),
      updater({
        version: timestamp,
      }),
      // ViteCompressionPlugin({
      // 	algorithm: "brotliCompress",
      // 	ext: ".br",
      // 	deleteOriginFile: true,
      // }),
      chunkSplitPlugin({
        strategy: "default",
        // // 指定拆包策略
        // customSplitting: {
        //   // 1. 支持填包名。`react` 和 `react-dom` 会被打包到一个名为`render-vendor`的 chunk 里面(包括它们的依赖，如 object-assign)
        //   'react-vendor': ['react', 'react-dom'],
        //   // 2. 支持填正则表达式。src 中 components 和 utils 下的所有文件被会被打包为`component-util`的 chunk 中
        //   'components-util': [/src\/components/, /src\/utils/]
        // }
      }),
      Iconify({
        collections: {
          cmono: "./src/assets/icons/mono",
        },
      }),
      // vuePreviewPlugin({
      //   props: {
      //       // @ts-ignore
      //       collapse: true,
      //       // @ts-ignore
      //       ssr: false,
      //       // @ts-ignore
      //       encode: true,
      //       previewBodyStyle: {
      //         display: 'flex',
      //         justifyContent: 'center',
      //         alignItems: 'center',
      //       },
      //       previewAppStyle: {
      //         display: 'flex',
      //         justifyContent: 'center',
      //         alignItems: 'center',
      //         flexDirection: 'column',
      //       },
      //       importMap: {
      //         '@vue/shared': 'https://unpkg.com/@vue/shared@latest/dist/shared.esm-bundler.js',
      //       },
      //     },
      //   }),
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
      vitePluginFakeServer({
        include: "mock", // 设置目标文件夹，将会引用该文件夹里包含xxx.fake.{ts,js,mjs,cjs,cts,mts}的文件
        enableProd: true, // 是否在生产环境下设置mock
      }),
      mkcert({
        savePath: "./certs", // save the generated certificate into certs directory
        autoUpgrade: false,
        force: false, // force generation of certs even without setting https property in the vite config
      }),
      // visualizer({
      //   open: true,
      //   filename: "stats.html",
      // }),
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
    json: {
      stringify: "auto",
    },
    resolve: {
      // conditions: [],
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
      // extensions: ['.js', '.ts', '.json', '.vue', '.tsx', '.jsx']
    },
    ssr: {
      noExternal: ["fs"], // Externalize Node.js modules
    },
    optimizeDeps: {
      include: ["vitepress-plugin-nprogress"],
      exclude: ["vitepress", "svg2roughjs", "echarts", "echarts-gl"],
    },
  };
});
