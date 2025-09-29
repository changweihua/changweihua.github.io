import { readFileSync } from 'fs';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

// 加载 package.json
const packageJson: PackageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

console.log('🔍 检查 npm 包更新...\n');

// 检查每个包
for (const [name, currentVersion] of Object.entries(allDeps)) {
  try {
    const response = await fetch(`https://registry.npmjs.org/${name}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const packageInfo = await response.json();
    const latestVersion = packageInfo['dist-tags']?.latest;
    const time = packageInfo.time;

    if (time && latestVersion) {
      const lastUpdate = time[latestVersion] || time.modified;
      const daysAgo = Math.floor((Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24));

      console.log(`${name}:`);
      console.log(`  当前版本: ${currentVersion}`);
      console.log(`  最新版本: ${latestVersion}`);
      console.log(`  最后更新: ${new Date(lastUpdate).toLocaleDateString('zh-CN')} (${daysAgo}天前)`);
      console.log('---');
    }
  } catch (error) {
    console.log(`${name}: 获取信息失败 - ${error instanceof Error ? error.message : String(error)}`);
  }

  // 添加延迟
  await new Promise(resolve => setTimeout(resolve, 100));
}
