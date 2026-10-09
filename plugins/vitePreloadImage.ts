import { type Plugin } from "vite";
import fg from "fast-glob";
interface PreloadImagesOptions {
  dir: string;
  attrs: {
    rel: "prefetch" | "preload";
  };
}
export const preloadImages = (optons: PreloadImagesOptions): Plugin => {
  const { dir, attrs = {} } = optons;
  return {
    name: "vite-plugin-image-prefetch",
    transformIndexHtml(_html, ctx) {
      let images = fg.sync(dir, {
        cwd: ctx.server?.config.publicDir,
      }); // 拿到目录下所有的图片路径
      images = images.map((file) => ctx.server?.config.base + file);
      return images.map((href) => {
return {
          tag: "link",
          attrs: {
            rel: "prefetch",
            href: href,
            as: "image",
            ...attrs,
          },
        };
      });
    },
  };
};

import { glob, globSync } from "tinyglobby";

await glob(["files/*.ts", "!**/*.d.ts"], { cwd: "src" });
globSync(["src/**/*.ts"], { ignore: ["**/*.d.ts"] });
