import { execSync } from "child_process";
import os from "os";
import fs from "fs";
import path from "path";
const platform = os.platform();

let code = 0;

export default function VitePluginBuildLegacy() {
  let config;
  return {
    name: "vite-plugin-build-legacy",
    apply: "build",
    configResolved(resolvedConfig) {
      // 存储最终解析的配置
      config = resolvedConfig;
    },
    generateBundle(_options, bundle) {
      let content = `| 文件名 | 大小 | \n| :---: | --- | \n`;
      // @ts-ignore
      const [assets, chunks] = Object.values(bundle).reduce(
        // @ts-ignore
        (r, i) => (r[i.type === "asset" ? 0 : 1].push(i), r),
        [[], []]
      );
      assets.forEach(
        (item) =>
          (content += `| ${item.fileName} | ${formatSize(
            item.source.length
          )} | \n`)
      );
      chunks.forEach(
        (item) =>
          (content += `| ${item.fileName} | ${formatSize(
            item.code.length
          )} | \n`)
      );
      const totalSize =
        assets.reduce((total, item) => total + item.source.length, 0) +
        chunks.reduce((total, item) => total + item.code.length, 0);
      content += `| 总计 | ${formatSize(totalSize)}（仅构建资产） | \n`;

      this.emitFile({ type: "asset", fileName: "assets.md", source: content });
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: JSON.stringify(
          GeneratVersion(config.publicDir + path.sep),
          null,
          2
        ),
      });
    },
  };
}

function formatSize(size) {
  if (size < 1024) {
    return size + "B";
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + "KB";
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + "MB";
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + "GB";
  }
}

export function GeneratVersion(assets_dir) {
  try {
    const commitId = execSync('git log -n1 --format=format:"%H"')
      .toString()
      .trim();
    const author = execSync('git log -n1 --format=format:"%an"')
      .toString()
      .trim();
    let branch;

    try {
      branch = execSync("git symbolic-ref --short HEAD").toString().trim();
    } catch (error) {
      branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
    }
    const commitTime = execSync('git log -n1 --format=format:"%ad" --date=iso')
      .toString()
      .substring(0, 19);
    const content = execSync('git log -n1 --format=format:"%s"')
      .toString()
      .trim();

    const json = {
      platform,
      commitId,
      author,
      branch,
      commitTime,
      content,
      code,
    };

    assets_dir && fs.writeFileSync(assets_dir, JSON.stringify(json, null, 2));

    return json;
  } catch (error) {
    return { msg: "获取版本信息失败", error: error.message };
  }
}
