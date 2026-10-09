// .vitepress/plugins/aliasLangPlugin.ts
import type { Plugin } from 'vite'

export function aliasLangPlugin(aliasMap: Record<string, string>): Plugin {
  return {
    name: 'vitepress-alias-lang',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.md')) return
      let transformed = code
      for (const [alias, target] of Object.entries(aliasMap)) {
        const regex = new RegExp(`(\`\`\`)\\s*${alias}(\\s|$)`, 'g')
        transformed = transformed.replace(regex, `$1${target}$2`)
      }
      return transformed
    }
  }
}
