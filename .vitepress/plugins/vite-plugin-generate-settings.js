// vite-plugin-generate-settings.js
import fs from 'fs';
import path from 'path';
import { loadEnv } from 'vite';

/**
 * @param {object} options
 * @param {string} options.mode - Vite build mode
 * @param {string} options.envDir - Directory where .env files are located
 * @param {string | string[]} [options.prefixes=['VITE_']] - Prefixes to filter
 * @returns {import('vite').Plugin}
 */
function generateSettingsPlugin(options) { // 接收一个 options 对象
  const { mode, envDir, prefixes = ['VITE_'] } = options; // 解构参数

  if (!mode || !envDir) {
    // 在配置阶段就进行检查，确保必要参数已提供
    throw new Error('[Generate Settings] Missing required options: mode and envDir');
  }

  let viteConfig;
  let settings = {};

  return {
    name: 'vite-plugin-generate-settings',
    apply: 'build',

    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
      // 使用传入的 mode 和 envDir
      const env = loadEnv(mode, envDir, '');

      settings = {};
      const VITE_PREFIXES = Array.isArray(prefixes) ? prefixes : [prefixes];

      for (const envKey in env) {
        if (VITE_PREFIXES.some(prefix => envKey.startsWith(prefix))) {
          settings[envKey] = env[envKey];
        }
      }
    },

    writeBundle(options) {
      // ... (writeBundle 逻辑保持不变)
      if (!viteConfig) {
        console.error('[Generate Settings] Vite config not resolved.');
        return;
      }
      if (Object.keys(settings).length === 0) {
        console.warn('[Generate Settings] No variables starting with VITE_ found. settings.json will be empty or not generated.');
      }

      const outDir = options.dir || viteConfig.build.outDir || 'dist';
      const filePath = path.resolve(outDir, 'setting.json');

      try {
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(settings, null, 2));
      } catch (error) {
        console.error(`[Generate Settings] Error writing setting.json: ${error}`);
      }
    }
  };
}

export default generateSettingsPlugin;
