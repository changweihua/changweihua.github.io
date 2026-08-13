import { Command } from 'commander';
import { NpmUpdateChecker } from './check-npm-updates';

const program = new Command();

program
  .name('npm-update-checker')
  .description('检查 package.json 中 npm 包的最新更新日期')
  .version('1.0.0')
  .option('-f, --file <path>', 'package.json 文件路径', './package.json')
  .option('-o, --output <path>', '报告输出路径', './npm-update-report.json')
  .option('-c, --concurrency <number>', '并发请求数量', '5')
  .option('-j, --json', '仅输出 JSON 格式结果')
  .action(async (options) => {
    try {
      const checker = new NpmUpdateChecker(options.file);
      const concurrency = parseInt(options.concurrency) || 5;
      const results = await checker.checkUpdates(concurrency);

      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
      } else {
        await checker.generateReport(options.output);
      }
    } catch (error) {
      console.error('错误:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();
