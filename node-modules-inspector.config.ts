import { defineConfig } from "node-modules-inspector";

export default defineConfig({
  defaultFilters: {
    excludes: [
      "eslint", // 排除开发工具类依赖，减少干扰
      "postcss", // 按需隐藏特定类型包
    ],
    includes: ["@vue/**"], // 仅关注 Vue 相关依赖
  },
  defaultSettings: {
    moduleTypeSimple: true, // 简化模块类型显示（如隐藏冗余的 CJS/DUAL 标签）
    showDependencySize: "both", // 同时显示单个包体积和占比
  },
  experimental: {
    publint: true, // 启用实验性依赖健康检查（如是否有未维护的包）
  },
});
