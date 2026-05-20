import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

// 获取当前文件的目录名（替代 __dirname）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootFolder = process.cwd();

console.log("移动生成好的字体");

// 获取命令行参数
const myArgs = process.argv.slice(2);
console.log("myArgs: ", myArgs);

let fontName = "MapleMono";

// 解析命令行参数
if (myArgs.length >= 2) {
  const argName = myArgs[0];
  const argValue = myArgs[1];

  switch (argName) {
    case "--font":
      console.log(`使用字体: ${argValue}`);
      fontName = argValue;
      break;
    case "compliment":
      console.log(`${argValue} is really cool.`);
      break;
    default:
      console.log("使用默认字体设置");
  }
} else {
  console.log("使用默认字体设置");
}

// 定义字体目录路径类型
interface FontPaths {
  sourceDir: string;
  publicDir: string;
  vitepressAssetsDir: string;
  woff2SourceDir: string;
}

// 创建字体目录路径对象
function createFontPaths(fontName: string): FontPaths {
  return {
    sourceDir: path.join(rootFolder, `fonts-spider/${fontName}`),
    publicDir: path.join(rootFolder, `public/fonts/${fontName}`),
    vitepressAssetsDir: path.join(rootFolder, `.vitepress/assets/fonts/${fontName}`),
    woff2SourceDir: path.join(rootFolder, `fonts-spider/${fontName}/woff2`)
  };
}

// 检查目录是否存在
function directoryExists(dirPath: string): boolean {
  return fs.existsSync(dirPath);
}

// 移动字体文件的主函数
async function moveFontFiles(): Promise<void> {
  try {
    const paths = createFontPaths(fontName);

    // 检查源目录是否存在
    if (!directoryExists(paths.sourceDir)) {
      throw new Error(`字体源目录不存在: ${paths.sourceDir}`);
    }

    // 清空目标目录（如果存在则清空，不存在则创建）
    if (directoryExists(paths.publicDir)) {
      await fs.emptyDir(paths.publicDir);
      console.log(`已清空目录: ${paths.publicDir}`);
    } else {
      await fs.ensureDir(paths.publicDir);
      console.log(`已创建目录: ${paths.publicDir}`);
    }

    // 确保 .vitepress/assets/fonts 目录存在
    await fs.ensureDir(path.join(rootFolder, `.vitepress/assets/fonts`));

    // 清空或创建 .vitepress/assets/fonts 下的字体目录
    if (directoryExists(paths.vitepressAssetsDir)) {
      await fs.emptyDir(paths.vitepressAssetsDir);
    } else {
      await fs.ensureDir(paths.vitepressAssetsDir);
    }

    // 复制主字体目录到 public/fonts
    await fs.copy(paths.sourceDir, paths.publicDir);
    console.log(`已将字体从 ${paths.sourceDir} 复制到 ${paths.publicDir}`);

    // 检查 woff2 目录是否存在并复制
    if (directoryExists(paths.woff2SourceDir)) {
      await fs.copy(paths.woff2SourceDir, paths.vitepressAssetsDir);
      console.log(`已将 woff2 字体从 ${paths.woff2SourceDir} 复制到 ${paths.vitepressAssetsDir}`);
    } else {
      console.warn(`警告: woff2 目录不存在: ${paths.woff2SourceDir}`);
    }

    // 以下是注释掉的代码，可根据需要启用或删除
    // await moveOtherFonts();

    console.log(`生成好的字体 ${fontName} 已完成移动`);
  } catch (error) {
    console.error("移动字体文件时发生错误:", error);
    process.exit(1);
  }
}

// 其他字体的移动函数（原注释代码）
async function moveOtherFonts(): Promise<void> {
  const fonts = [
    { name: "JetBrains", source: "font/JetBrains", dest: "public/fonts/JetBrains" },
    { name: "Alibaba", source: "font/Alibaba", dest: "public/fonts/Alibaba" },
    { name: "JetBrainsMapleMono", source: "font/JetBrainsMapleMono", dest: "public/fonts/JetBrainsMapleMono" }
  ];

  for (const font of fonts) {
    const sourceDir = path.join(rootFolder, font.source);
    const destDir = path.join(rootFolder, font.dest);

    if (directoryExists(sourceDir)) {
      if (directoryExists(destDir)) {
        await fs.emptyDir(destDir);
      } else {
        await fs.ensureDir(destDir);
      }

      await fs.copy(sourceDir, destDir);
      console.log(`已移动字体 ${font.name} 从 ${sourceDir} 到 ${destDir}`);
    } else {
      console.warn(`警告: 字体源目录不存在: ${sourceDir}`);
    }
  }
}

// 主函数
async function main(): Promise<void> {
  try {
    await moveFontFiles();
    console.log("字体移动操作完成！");
  } catch (error) {
    console.error("执行过程中发生错误:", error);
    process.exit(1);
  }
}

// 执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// 导出函数供其他模块使用
export { moveFontFiles, createFontPaths, directoryExists };
