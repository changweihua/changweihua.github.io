import { Plugin } from "vite";

// vite-plugin-spy.ts
export default function spyPlugin(): Plugin {
  return {
    name: 'vite-plugin-spy',
    enforce: 'pre',
    // 1. 修改配置阶段
    config(config) {
      console.log('🟢 [Config] 配置开始合并...');
    },
    // 2. 核心编译阶段
    transform(code, id) {
      if (!id.includes('node_modules')) {
        console.log(`🔵 [Transform] 正在转换: ${id.split('/').pop()}`);
      }
    },
    // 3. 产物输出阶段 (仅 Build 生效)
    renderChunk(code, chunk) {
      console.log(`🔴 [RenderChunk] 生成文件: ${chunk.fileName}`);
      console.log(`   - 包含模块: ${Object.keys(chunk.modules).length} 个`);
    },
    generateBundle(options, bundle) {
      console.log('📦 [GenerateBundle] 最终产物清单:');
      Object.keys(bundle).forEach(file => console.log(`   📄 ${file}`));
    }
  };
}
