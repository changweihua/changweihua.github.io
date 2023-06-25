import { defineConfig } from "vite";
import { resolve } from "path";
import AutoImport from "unplugin-auto-import/vite";
import IconsResolver from "unplugin-icons/resolver";
import Components from "unplugin-vue-components/vite";
import Icons from "unplugin-icons/vite";

function pathResolve(dir: string) {
  return resolve(__dirname, ".", dir);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    AutoImport({
      resolvers: [
        IconsResolver({
          prefix: "i",
        }),
      ],
    }),
    Components({
      resolvers: [
        IconsResolver({
          enabledCollections: [
            "ep",
            "ant-design",
            "icon-park",
            "openmoji",
            "material-symbols",
            "svg-spinners",
            "fluent",
            "wi",
            "line-md",
            "ic",
            "svg-spinners",
            "prime",
            "icon-park-outline",
            "arcticons",
            "mdi",
            "carbon",
          ],
        }),
      ],
    }),
    Icons({ autoInstall: true }),
  ],
  ssr: {
    noExternal: ["vitepress-plugin-nprogress"],
  },
});
