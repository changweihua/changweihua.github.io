// vite-plugin-dns-prefetch.ts
import type { Plugin, ResolvedConfig, HtmlTagDescriptor } from 'vite'

const DOMAIN_REGEX = /https?:\/\/([^/\s"'`]+)/gi

const EXCLUDED_DOMAINS = ['react.dev', 'www.w3.org']

export default function viteDnsPrefetchPlugin(): Plugin {
  let config: ResolvedConfig
  const domains = new Set<string>()

  return {
    name: 'vite:dns-prefetch',
    apply: 'build',

    configResolved(resolved) {
      config = resolved
    },

    generateBundle(_, bundle) {
      for (const file of Object.values(bundle)) {
        if (/\.(js|css|html)$/.test(file.fileName)) {
          const content =
            file.type === 'chunk' ? file.code : file.source?.toString()
          getDomains(content)
        }
      }
    },

    transformIndexHtml(html) {
      getDomains(html)
      const prefetchLinks: HtmlTagDescriptor[] = Array.from(domains).map(
        (domain) => ({
          tag: 'link',
          attrs: {
            rel: 'dns-prefetch',
            href: `//${domain}`
          },
          injectTo: 'head'
        })
      )
      return {
        html,
        tags: prefetchLinks
      }
    }
  }

  function getDomains(content: string) {
    if (content) {
      let match
      while ((match = DOMAIN_REGEX.exec(content))) {
        const domain = match[1]
        if (
          domain &&
          !domain.includes(config.base) &&
          !EXCLUDED_DOMAINS.includes(domain) &&
          !domain.startsWith('localhost')
        ) {
          domains.add(domain)
        }
      }
    }
  }
}

// // vite中使用
// import { defineConfig } from 'vite'
// import prefetchDnsPlugin from './vite-plugin-prefetch-dns'

// export default defineConfig({
//   plugins: [
//     prefetchDnsPlugin()
//   ]
// })

