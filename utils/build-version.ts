// build-version.ts
import pkg from "../package.json";
import { resolve } from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const version = new Date().getTime();
const content = `getVersion(${version})`;

// // 创建版本文件
// fs.writeFile(
//   `${resolve(__dirname, "../.viterpress/dist")}/version1.js`,
//   content,
//   (err) => (err ? console.log(err) : console.log("版本文件创建成功")),
// );

// 创建版本文件
fs.writeFile(
  fileURLToPath(new URL("../.vitepress/dist/version.js", import.meta.url)),
  content,
  (err) => (err ? console.log(err) : console.log("版本文件创建成功")),
);

export const run = () => {
  console.log(`${pkg.name} - build successfully!`);
};
