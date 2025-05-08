import { defineConfig, presetUno } from "unocss";
import presetIcons from "@unocss/preset-icons";
import { FileSystemIconLoader } from "@iconify/utils/lib/loader/node-loaders";
import fs from "fs";

// 本地 SVG 图标存放目录
const iconsDir = "./src/assets/icons";

// 读取本地 SVG 目录，自动生成 `safelist`
const generateSafeList = () => {
  try {
    return fs
      .readdirSync(iconsDir)
      .filter((file) => file.endsWith(".svg"))
      .map((file) => `i-svg:${file.replace(".svg", "")}`);
  } catch (error) {
    console.error("无法读取图标目录:", error);
    return [];
  }
};

export default defineConfig({
  presets: [
    presetIcons({
      // 设置全局图标默认属性
      extraProperties: {
        width: "1em",
        height: "1em",
        display: "inline-block",
      },
      // 注册本地 SVG 图标集合
      collections: {
        // svg 是图标集合名称，使用 `i-svg:图标名` 调用
        svg: FileSystemIconLoader(iconsDir, (svg) => {
          // 如果 SVG 文件未定义 `fill` 属性，则默认填充 `currentColor`
          // 这样图标颜色会继承文本颜色，方便在不同场景下适配
          return svg.includes('fill="')
            ? svg
            : svg.replace(/^<svg /, '<svg fill="currentColor" ');
        }),
      },
    }),
  ],
  safelist: generateSafeList(), // 动态生成 `safelist`
});
