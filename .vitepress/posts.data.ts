import { spawn } from 'child_process'
import { basename, extname, normalize } from 'path'
import { createContentLoader } from 'vitepress'
import fs  from 'fs'

export interface Post {
  title: string
  url: string
  date: {
    time: number
    string: string
  }
  excerpt: string | undefined
}

declare const data: Post[]

export {
  data
}

// 获取文件提交时间
function getGitTimestamp(filePath: string) {
  return new Promise<[number, number]>((resolve) => {
    let output: number[] = [];

    // 开启子进程执行git log命令
    const child = spawn("git", [
      "--no-pager",
      "log",
      '--pretty="%ci"',
      filePath,
    ]);

    // 监听输出流
    child.stdout.on("data", (d) => {
      const data = String(d)
        .split("\n")
        .map((item) => +new Date(item))
        .filter((item) => item);
      output.push(...data);
    });

    // 输出接受后返回
    child.on("close", () => {
      if (output.length) {
        // 返回[发布时间，最近更新时间]
        resolve([+new Date(output[output.length - 1]), +new Date(output[0])]);
      } else {
        // 没有提交记录时获取文件时间
        const { birthtimeMs, mtimeMs } = fs.statSync(filePath);
        resolve([birthtimeMs, mtimeMs]);
      }
    });

    child.on("error", () => {
      // 获取失败时使用文件时间
      const { birthtimeMs, mtimeMs } = fs.statSync(filePath);
      resolve([birthtimeMs, mtimeMs]);
    });
  });
}

export default createContentLoader([
    "/blog/**/!(index|README).md",
  ], {
    excerpt: true,
//     async transform(data) {
//       const promises: Promise<any>[] = [];

//       data.forEach(({ frontmatter, src, url }) => {
//         // 用页面的一级标题作为文章标题（因为sidebar中可能是精简的标题）
//         let title =
//           src?.match(/^\s*#\s+(.*)\s*$/m)?.[1] ||
//           basename(url).replace(extname(url), "");

//         // 标题可能用到了变量，需要替换
//         const regexp = /\{\{\s*\$frontmatter\.(\S+?)\s*\}\}/g;
//         let match;
//         while ((match = regexp.exec(title)) !== null) {
//           const replaceReg = new RegExp(
//             "\\{\\{\\s*\\$frontmatter\\." + match[1] + "\\s*\\}\\}",
//             "g"
//           );
//           title = title.replace(replaceReg, frontmatter[match[1]]);
//         }
// const sep = '/'
//         // 链接去掉项目名
//         const link = normalize(url)
//           .split(sep)
//           .filter((item) => item)
//           .join(sep);

//         // 获取发布时间
//         const task = getGitTimestamp(link.replace(/\.html$/i, ".md")).then(
//           (fileTimeInfo) => ({
//             title,
//             details: src
//               // 去除html标签
//               ?.replace(/<[^>]+?>/g, "")
//               // 去除frontmatter
//               .replace(/^---[\s\S]*?---/, "")
//               // 去除标题
//               .replace(/^#+\s+.*?$/gm, "")
//               // 去除引用
//               .replace(/^\>/gm, "")
//               // 只保留反引号内部内容
//               .replace(/`(.+?)`/g, "$1")
//               // 只保留加粗、倾斜符号中的内容
//               .replace(/\*{1,3}(.+?)\*{1,3}/g, "$1")
//               // 只保留跳转内容
//               .replace(/\[(.+?)\]\(.+?\)/g, "$1")
//               // 去除提示块
//               .replace(/^:::.*$/gm, "")
//               // 统一空白字符为一个空格
//               .replace(/\s/g, " ")
//               // 仅保留可能显示的部分，减小数据大小
//               .slice(0, 200),
//             link,
//             // linkText 可以显示更新时间
//             linkText: new Date(fileTimeInfo[1]).toLocaleDateString(),
//             // 存储时间信息用于排序
//             fileTimeInfo,
//           })
//         );

//         promises.push(task);
//       });

//       const pages = await Promise.all(promises);
//       // 更新时间降序排列
//       return pages.sort((a, b) => b.fileTimeInfo[1] - a.fileTimeInfo[1]);
//       // 发布时间降序排列
//       // return pages.sort((a, b) => b.fileTimeInfo[0] - a.fileTimeInfo[0]);
//     },
  transform(raw): Post[] {
    return raw
      .filter(r => r.src !== 'index.md')
      .map(({ url, frontmatter, excerpt }) => ({
        title: frontmatter.title,
        url,
        excerpt,
        date: formatDate(frontmatter.date)
      }))
      .sort((a, b) => b.date.time - a.date.time)
      .slice(0, 12)
  },
  includeSrc: true// 包含原始 markdown 源?
})

function formatDate(raw: string): Post['date'] {
  const date = new Date(raw)
  date.setUTCHours(12)
  return {
    time: +date,
    string: date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}
