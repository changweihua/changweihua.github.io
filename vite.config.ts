import { defineConfig } from "vite";
import { resolve } from "path";
// vite.config.ts
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
// import AntdvResolver from "antdv-component-resolver";
import Components from "unplugin-vue-components/vite";

import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import { fileURLToPath } from "node:url";
// 引入Unocss
// import Unocss from "unocss/vite";

// import {theme} from "ant-design-vue"

// const { theme } = require("ant-design-vue/lib");
// const convertLegacyToken = require("ant-design-vue/lib/theme/convertLegacyToken");

// const { defaultAlgorithm, defaultSeed } = theme;

// const mapToken = defaultAlgorithm(defaultSeed);
// const v3Token = convertLegacyToken(mapToken);

function pathResolve(dir: string) {
  return resolve(__dirname, ".", dir);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Components({
      resolvers: [
        IconsResolver(),
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),
      ], //, AntdvResolver()
    }),
    // Unocss(),
    Icons({ autoInstall: true }),
    // autoVersionPlugin()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url))
    }
  },
  ssr: {
    noExternal: ["vitepress-plugin-nprogress"],
  },
  // css: {
  //   preprocessorOptions: {
  //     less: {
  //       math: "always",
  //       modifyVars: theme.useToken().hashId,
  //     },
  //   },
  // },
});
