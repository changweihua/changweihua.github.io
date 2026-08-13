import { defineConfig } from 'node-modules-inspector'

export default defineConfig({
  // 默认过滤规则
  defaultFilters: {
    excludes: [
      'eslint', // 排除开发工具类依赖，减少干扰
      'postcss' // 按需隐藏特定类型包
    ]
    // 注意：FilterOptions 没有 includes 属性，如需指定包含规则请参考官方文档确认
  },

  // 默认显示设置
  defaultSettings: {
    moduleTypeSimple: true, // 简化模块类型显示
    colorizePackageSize: true, // 根据大小对包进行颜色标记
    showInstallSizeBadge: true // 显示安装大小标签
    // showDependencySize 不是有效属性，已移除
  },

  // 实验性功能
  publint: true // 启用 publint 依赖健康检查
})
