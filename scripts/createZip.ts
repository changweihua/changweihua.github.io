import path from "path";
import JSZip from "jszip";
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "fs-extra";

// import { defineConfig } from "vite";
// import vue from "@vitejs/plugin-vue";
// import createZipPlugin from "./createZip";

// export default defineConfig(({ mode }) => ({
//   plugins: [
//     vue(),
//     createZipPlugin({
//       enabled: mode === "development", // 仅开发模式启用
//     }),
//   ],
//   build: {
//     outDir: "dist",
//   },
// }));

interface ZipPluginOptions {
  fileName: string;
  outputPath?: string;
  enabled: boolean;
}

export default function createZipPlugin(options: ZipPluginOptions) {
  const {
    fileName = "dist",
    outputPath,
    enabled = process.env.NODE_ENV === "development", // 默认开发环境启用
  } = options;

  if (!enabled) {
    // 如果禁用，返回一个空插件
    return {
      name: "vite-plugin-auto-zip",
      apply: "build",
      closeBundle: () => {}, // 空函数
    };
  }

  const output = outputPath || path.resolve(process.cwd(), "./dist");
  const zipFileName = `${fileName}.zip`;

  const makeZip = () => {
    const zip = new JSZip();
    const distPath = path.resolve(output);

    // 递归读取文件夹
    const readDir = (zipInstance: any, dirPath: string) => {
      const files = readdirSync(dirPath);
      files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        const stats = statSync(filePath);
        if (stats.isDirectory()) {
          const folder = zipInstance.folder(file);
          readDir(folder, filePath);
        } else {
          zipInstance.file(file, readFileSync(filePath));
        }
      });
    };

    // 生成 ZIP
    readDir(zip, distPath);
    zip
      .generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 9 },
      })
      .then((content) => {
        const destPath = path.join(distPath, "../", zipFileName);
        if (existsSync(destPath)) unlinkSync(destPath);
        writeFileSync(destPath, content);
      });
  };

  return {
    name: "vite-plugin-auto-zip",
    apply: "build",
    closeBundle: makeZip,
  };
}
