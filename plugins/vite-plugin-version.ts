// vite-plugin-version.ts
import { execSync } from 'child_process';
import type { Plugin, IndexHtmlTransformContext, ResolvedConfig } from 'vite';

export interface VersionPluginOptions {
  /** 自定义版本号的全局键名，默认 'app_version' */
  versionKey?: string;
  /** 自定义构建时间的全局键名，默认 'app_build_time' */
  timeKey?: string;
  /** 是否注入 meta 标签，默认 true */
  injectMeta?: boolean;
  /** 是否生成 version.json 文件，默认 false */
  generateVersionJson?: boolean;
  /** 自定义 Git 命令（例如获取完整 hash） */
  gitCommand?: string;
  /** 时区格式化选项，默认 'zh-CN' */
  locale?: string;
  /** 构建完成回调 */
  onBuildComplete?: (info: VersionInfo) => void;
}

export interface VersionInfo {
  version: string;
  buildTime: string;
  branch?: string;
  env?: string;
}

/**
 * Vite 版本管理插件
 * 自动注入 Git commit 信息和构建时间到 HTML 和编译时常量
 */
export default function versionPlugin(
  options: VersionPluginOptions = {}
): Plugin {
  const {
    versionKey = 'app_version',
    timeKey = 'app_build_time',
    injectMeta = true,
    generateVersionJson = false,
    gitCommand = 'git rev-parse --short HEAD',
    locale = 'zh-CN',
    onBuildComplete,
  } = options;

  // 获取 Git commit ID
  let commitId = 'unknown';
  let branch = 'unknown';

  try {
    commitId = execSync(gitCommand).toString().trim();
    // 尝试获取分支名（可选）
    try {
      branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    } catch {
      // 非 git 环境或获取失败，保持 unknown
    }
  } catch (error) {
    console.warn('[vite-plugin-version] 非 Git 仓库或命令执行失败，使用 unknown 版本');
  }

  const buildTime = new Date().toLocaleString(locale);
  const env = process.env.NODE_ENV || 'production';

  const versionInfo: VersionInfo = {
    version: commitId,
    buildTime,
    branch,
    env,
  };

  const versionConst = `__${versionKey.toUpperCase()}__`;
  const timeConst = `__${timeKey.toUpperCase()}__`;

  let resolvedConfig: ResolvedConfig;

  return {
    name: 'vite-plugin-version',

    configResolved(config) {
      resolvedConfig = config;
    },

    config() {
      // 注入编译时常量
      return {
        define: {
          [versionConst]: JSON.stringify(commitId),
          [timeConst]: JSON.stringify(buildTime),
          // 可选注入环境变量
          __BUILD_ENV__: JSON.stringify(env),
        },
      };
    },

    transformIndexHtml(html: string, ctx?: IndexHtmlTransformContext) {
      // 开发环境下不注入（避免热更新干扰）
      if (resolvedConfig?.command === 'serve') {
        return html;
      }

      const metaTags = injectMeta
        ? `
    <meta name="${versionKey}" content="${commitId}" />
    <meta name="${timeKey}" content="${buildTime}" />
    <meta name="build_env" content="${env}" />`
        : '';

      const script = `
    <script>
      window.${versionKey} = "${commitId}";
      window.${timeKey} = "${buildTime}";
      window.build_env = "${env}";
      console.log("[版本信息] 版本: ${commitId} | 构建时间: ${buildTime} | 环境: ${env}");
    </script>`;

      const injectContent = `${metaTags}\n    ${script}`;

      // 更健壮的插入方式：确保插入到 </head> 前，如果不存在则插入到 <body> 前
      if (html.includes('</head>')) {
        return html.replace('</head>', injectContent + '\n</head>');
      } else if (html.includes('<body>')) {
        return html.replace('<body>', injectContent + '\n<body>');
      }
      return html + injectContent;
    },

    generateBundle(_, bundle) {
      // // 在 closeBundle 或 generateBundle 中读取上次构建的版本文件
      // const lastVersionPath = path.resolve(process.cwd(), '.last-version');
      // if (fs.existsSync(lastVersionPath)) {
      //   const lastVersion = fs.readFileSync(lastVersionPath, 'utf-8');
      //   if (lastVersion === commitId) {
      //     console.warn(`⚠️ [版本警告] 版本号未变化: ${commitId}，请确认是否需要构建新版本`);
      //   }
      // }
      // fs.writeFileSync(lastVersionPath, commitId);


      // 生成 version.json 文件
      if (generateVersionJson) {
        const versionJsonContent = JSON.stringify(versionInfo, null, 2);
        this.emitFile({
          type: 'asset',
          fileName: 'version.json',
          source: versionJsonContent,
        });
      }

      // 可选：输出版本信息到控制台
      if (resolvedConfig?.build?.sourcemap) {
        // 如果开启了 sourcemap，可以额外输出映射信息（示例扩展）
      }
    },

    closeBundle() {
      const infoMsg = `
✅ [vite-plugin-version] 构建完成
   版本号: ${commitId}
   分支: ${branch}
   构建时间: ${buildTime}
   环境: ${env}
   访问方式: window.${versionKey} 或 ${versionConst}
   ${generateVersionJson ? '已生成 version.json' : ''}
      `;
      console.log(infoMsg);

      if (onBuildComplete) {
        onBuildComplete(versionInfo);
      }
    },
  };
}

// 同时导出类型，方便使用者
export type { Plugin as ViteVersionPlugin } from 'vite';
