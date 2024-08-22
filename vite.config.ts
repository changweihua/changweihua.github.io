import { defineConfig, loadEnv } from "vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import Components from "unplugin-vue-components/vite";// 自动导入vue中hook reactive ref等
import UnoCSS from "unocss/vite";
import path, { resolve } from "path";
import { fileURLToPath } from "url";

const getEnvValue = (mode: string, target: string) => {
  const value = loadEnv(mode, path.join(process.cwd(), 'env'))[target]
  console.log(value)
  return value
}

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
    minify: false, // 必须开启：使用terserOptions才有效果
    chunkSizeWarningLimit: 2000, // 设置 chunk 大小警告的限制为 2000 KiB
    emptyOutDir: true
  },
  define: {
    'process.env': {},
    // 注意要用 JSON.stringify
    'process.env.RSS_BASE': JSON.stringify(`${getEnvValue(process.env.NODE_ENV || 'github', 'VITE_APP_RSS_BASE_URL')}`),
  },
  plugins: [
    Components({
      dirs: resolve(__dirname, "./src/components"),
      include: [/\.vue$/, /\.vue\?vue/],
      dts: "./typings/components.d.ts",
      transformer: "vue3",
      resolvers: [
        IconsResolver()
      ],
    }),
    Icons({ autoInstall: true }),
    UnoCSS(),
  ],
  resolve: {
    alias: {
      // "@": fileURLToPath(new URL(".", import.meta.url)),
      // "@": fileURLToPath(new URL("./src", import.meta.url)),
      // "@vp": fileURLToPath(new URL("./.vitepress", import.meta.url)),
      // public: fileURLToPath(new URL("./public", import.meta.url)),
      "~": path.resolve(__dirname, "./"),
      '*': path.resolve(''),
      "@": path.resolve(__dirname, "src"),
      "@vp": path.resolve(__dirname, ".vitepress"),
      public: fileURLToPath(new URL("./public", import.meta.url)),
      // // 注意一定不要随意命名，a b c这样的，项目的目录也不能为关键字保留字！！
      // "comp": resolve(__dirname, "src/components"),
      // // 配置图片要这样引用
      // "/img": "./src/assets",
    },
    extensions: ['.js', '.ts', '.json', '.vue']
  },
  ssr: {
    noExternal: [
    ],
  },
  optimizeDeps: {
    include: [
      "vitepress-plugin-nprogress"
    ],
    exclude: ['vitepress', 'svg2roughjs'],
  }
});
