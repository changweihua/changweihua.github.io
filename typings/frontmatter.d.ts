// .vitepress/types/frontmatter.d.ts
declare module 'vitepress' {
  interface PageData {
    fileHash?: string
  }
}

declare global {
  interface Frontmatter {
    fileHash?: string
  }
}

export {}
