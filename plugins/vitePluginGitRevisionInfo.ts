import { Plugin } from 'vite';

function vitePluginGitRevisionInfo(): Plugin {
  return {
    name: 'vite-plugin-git-revision-info',
    transformIndexHtml() {
      const HtmlStr = `const gitInfo = 'aa'`;
      // 将htmlStr插到body里
      return [
        {
          tag: 'script',
          attrs: { defer: true },
          children: HtmlStr,
          injectTo: 'body',
        },
      ];
    },
  };
}

export { vitePluginGitRevisionInfo as default };
