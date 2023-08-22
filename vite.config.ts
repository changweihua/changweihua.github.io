import { defineConfig } from "vite";
// vite.config.ts
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import Components from "unplugin-vue-components/vite";
import AntdvResolver from "antdv-component-resolver";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import { fileURLToPath } from "node:url";
import { vuePreviewPlugin } from "vite-plugin-vue-preview";
import { ViteAliases } from "vite-aliases";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Components({
      resolvers: [
        AntdvResolver(),
        IconsResolver(),
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),
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
    ViteAliases({
      /**
       * Relative path to the project directory
       */
      dir: "src",
      /**
       * Prefix symbol for the aliases
       */
      prefix: "~",
      /**
       * Allow searching for subdirectories
       */
      deep: true,
      /**
       * Search depthlevel for subdirectories
       */
      depth: 1,
      /**
       * Creates a Logfile
       * use `logPath` to change the location
       */
      createLog: false,
      /**
       * Path for Logfile
       */
      logPath: "src/logs",
      /**
       * Create global project directory alias
       */
      createGlobalAlias: true,
      /**
       * Turns duplicates into camelCased path aliases
       */
      adjustDuplicates: false,
      /**
       * Used paths in JS/TS configs will now be relative to baseUrl
       */
      useAbsolute: false,
      /**
       * Adds seperate index paths
       * approach created by @davidohlin
       */
      useIndexes: false,
      /**
       * Generates paths in IDE config file
       * works with JS or TS
       */
      useConfig: true,
      /**
       * Override config paths
       */
      ovrConfig: false,
      /**
       * Will generate Paths in tsconfig
       * used in combination with `useConfig`
       * Typescript will be auto detected
       */
      dts: false,
      /**
       * Disables any terminal output
       */
      silent: true,
      /**
       * Root path of Vite project
       */
      root: process.cwd(),
    }),
  ],
  // resolve: {
  //   alias: {
  //     "@": fileURLToPath(new URL(".", import.meta.url)),
  //   },
  // },
  ssr: {
    noExternal: ["vitepress-plugin-nprogress", "local-pkg"],
  },
});
