import { defineConfig } from "vite";
import { resolve } from "path";
// vite.config.ts
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
// import UnoCSS from 'unocss/vite';

// // 引入 图标预设 和 工具类预设
// import { presetAttributify, presetIcons, presetUno } from "unocss";

function pathResolve(dir: string) {
  return resolve(__dirname, ".", dir);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Components({
      resolvers: [
        IconsResolver(),
      ]
    }),
    Icons({ autoInstall: true }),
    // UnoCSS(
    //   {
    //     // presets: [presetAttributify(), presetIcons(), presetUno()],
    //   }
    // ),
    // AutoImport({
    //   resolvers: [
    //     IconsResolver({
    //       prefix: "i",
    //     }),
    //   ],
    // }),
    // Components({
    //   resolvers: [
    //     IconsResolver({
    //       enabledCollections: [
    //         "ep",
    //         "ant-design",
    //         "icon-park",
    //         "openmoji",
    //         "material-symbols",
    //         "svg-spinners",
    //         "fluent",
    //         "wi",
    //         "line-md",
    //         "ic",
    //         "svg-spinners",
    //         "prime",
    //         "icon-park-outline",
    //         "arcticons",
    //         "mdi",
    //         "carbon",
    //       ],
    //     }),
    //   ],
    // }),
    // Icons({ autoInstall: true }),
  ],
  ssr: {
    noExternal: ["vitepress-plugin-nprogress"],
  },
});
