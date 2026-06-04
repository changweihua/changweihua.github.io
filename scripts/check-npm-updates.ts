import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 定义类型
interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface NpmPackageInfo {
  name: string;
  'dist-tags': {
    latest: string;
  };
  time: {
    created: string;
    modified: string;
    [version: string]: string;
  };
}

interface PackageUpdateInfo {
  name: string;
  currentVersion: string;
  latestVersion: string;
  lastUpdated: string;
  daysAgo: number;
  error?: string;
}

interface CheckResults {
  packages: PackageUpdateInfo[];
  stats: {
    total: number;
    successful: number;
    failed: number;
    avgDaysAgo: number;
  };
}

class NpmUpdateChecker {
  private packageJson: PackageJson;
  private results: PackageUpdateInfo[] = [];

  constructor(private packageJsonPath: string = './package.json') {
    this.packageJson = this.loadPackageJson();
  }

  /**
   * 加载 package.json 文件
   */
  private loadPackageJson(): PackageJson {
    try {
      const content = readFileSync(this.packageJsonPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`无法读取 package.json 文件: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取所有依赖包
   */
  private getAllDependencies(): Record<string, string> {
    return {
      ...this.packageJson.dependencies,
      ...this.packageJson.devDependencies,
    };
  }

  /**
   * 使用 fetch 获取包信息
   */
  private async fetchPackageInfo(packageName: string): Promise<NpmPackageInfo> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`https://registry.npmjs.org/${packageName}`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'NPM-Update-Checker/1.0.0',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json() as NpmPackageInfo;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('请求超时');
        }
        throw error;
      }
      throw new Error(`网络请求失败: ${String(error)}`);
    }
  }

  /**
   * 计算天数差
   */
  private calculateDaysAgo(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 格式化日期
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * 检查单个包的更新信息
   */
  private async checkPackageUpdate(packageName: string, currentVersion: string): Promise<PackageUpdateInfo> {
    try {
      const packageInfo = await this.fetchPackageInfo(packageName);
      const latestVersion = packageInfo['dist-tags']?.latest;

      if (!latestVersion) {
        throw new Error('无法获取最新版本信息');
      }

      const time = packageInfo.time;
      const lastUpdated = time[latestVersion] || time.modified || time.created;

      if (!lastUpdated) {
        throw new Error('无法获取更新时间');
      }

      const daysAgo = this.calculateDaysAgo(lastUpdated);

      return {
        name: packageName,
        currentVersion,
        latestVersion,
        lastUpdated,
        daysAgo,
      };
    } catch (error) {
      return {
        name: packageName,
        currentVersion,
        latestVersion: 'N/A',
        lastUpdated: 'N/A',
        daysAgo: -1,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 批量检查包更新（带并发控制）
   */
  async checkUpdates(concurrency: number = 5): Promise<CheckResults> {
    const dependencies = this.getAllDependencies();
    const packageNames = Object.keys(dependencies);

    console.log('🔍 正在检查 npm 包更新...\n');
    console.log('包名'.padEnd(30), '当前版本'.padEnd(15), '最新版本'.padEnd(15), '最后更新'.padEnd(20), '天数前');
    console.log('-'.repeat(100));

    // 使用并发控制处理请求
    const results: PackageUpdateInfo[] = [];
    const packages = Object.entries(dependencies);

    for (let i = 0; i < packages.length; i += concurrency) {
      const batch = packages.slice(i, i + concurrency);

      const batchResults = await Promise.all(
        batch.map(async ([packageName, currentVersion]) => {
          const result = await this.checkPackageUpdate(packageName, currentVersion);

          // 实时显示结果
          if (result.error) {
            console.log(
              result.name.padEnd(30),
              result.currentVersion.padEnd(15),
              result.latestVersion.padEnd(15),
              result.lastUpdated.padEnd(20),
              result.error
            );
          } else {
            const dateStr = this.formatDate(result.lastUpdated);
            console.log(
              result.name.padEnd(30),
              result.currentVersion.padEnd(15),
              result.latestVersion.padEnd(15),
              dateStr.padEnd(20),
              result.daysAgo.toString()
            );
          }

          // 添加延迟避免请求过快
          await new Promise(resolve => setTimeout(resolve, 50));
          return result;
        })
      );

      results.push(...batchResults);
    }

    this.results = results;

    // 按更新时间排序（最近更新的在前）
    this.results.sort((a, b) => {
      if (a.daysAgo === -1) return 1;
      if (b.daysAgo === -1) return -1;
      return a.daysAgo - b.daysAgo;
    });

    this.displayStats();

    return this.getResults();
  }

  /**
   * 显示统计信息
   */
  private displayStats(): void {
    const stats = this.calculateStats();

    console.log('\n📊 统计信息:');
    console.log(`📦 总包数: ${stats.total}`);
    console.log(`✅ 成功检查: ${stats.successful}`);
    console.log(`❌ 检查失败: ${stats.failed}`);
    console.log(`📅 平均更新天数: ${stats.avgDaysAgo} 天前`);

    // 显示最旧和最新的包
    const successfulPackages = this.results.filter(p => !p.error && p.daysAgo >= 0);
    if (successfulPackages.length > 0) {
      const oldest = successfulPackages[successfulPackages.length - 1];
      const newest = successfulPackages[0];

      console.log('\n🏆 更新情况:');
      console.log(`🆕 最近更新的包: ${newest.name} (${newest.daysAgo} 天前)`);
      console.log(`🕰️  最久未更新的包: ${oldest.name} (${oldest.daysAgo} 天前)`);
    }
  }

  /**
   * 计算统计信息
   */
  private calculateStats(): CheckResults['stats'] {
    const successful = this.results.filter(p => !p.error).length;
    const failed = this.results.filter(p => p.error).length;
    const successfulPackages = this.results.filter(p => !p.error && p.daysAgo >= 0);

    const avgDaysAgo = successfulPackages.length > 0
      ? Math.round(successfulPackages.reduce((sum, p) => sum + p.daysAgo, 0) / successfulPackages.length)
      : 0;

    return {
      total: this.results.length,
      successful,
      failed,
      avgDaysAgo,
    };
  }

  /**
   * 获取检查结果
   */
  getResults(): CheckResults {
    return {
      packages: this.results,
      stats: this.calculateStats(),
    };
  }

  /**
   * 生成报告文件
   */
  async generateReport(outputPath: string = './npm-update-report.json'): Promise<void> {
    const report = {
      generatedAt: new Date().toISOString(),
      ...this.getResults(),
    };

    try {
      writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
      console.log(`\n📄 报告已生成: ${outputPath}`);
    } catch (error) {
      console.error(`❌ 生成报告失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// 主函数
async function main(): Promise<void> {
  try {
    const checker = new NpmUpdateChecker();
    const results = await checker.checkUpdates();

    // 生成报告文件
    await checker.generateReport();

    // 如果有包很久没更新，给出警告
    const oldPackages = results.packages.filter(p => !p.error && p.daysAgo > 365);
    if (oldPackages.length > 0) {
      console.log('\n⚠️  警告: 以下包超过一年未更新:');
      oldPackages.forEach(pkg => {
        console.log(`   - ${pkg.name}: ${pkg.daysAgo} 天前`);
      });
    }

  } catch (error) {
    console.error('❌ 程序执行失败:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// 运行程序
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { NpmUpdateChecker };
export type { PackageUpdateInfo, CheckResults };
