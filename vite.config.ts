import { defineConfig } from "vite";
import { resolve } from "path";

function pathResolve(dir: string) {
  return resolve(__dirname, ".", dir);
}

// https://vitejs.dev/config/
export default defineConfig({
  ssr: {
    noExternal: ["vitepress-plugin-nprogress"],
  },
});
