//@ts-ignore
import { defineConfig } from "vite";
// vite.config.ts
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import Components from "unplugin-vue-components/vite";

import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import { fileURLToPath } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Components({
      resolvers: [
        IconsResolver(),
        AntDesignVueResolver({
          importStyle: false, // css in js
        })
      ],
    }),
    Icons({ autoInstall: true }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url))
    }
  },
  ssr: {
    noExternal: ["vitepress-plugin-nprogress"],
  },
});
