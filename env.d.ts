/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Auto generate by env-parse
  readonly VITE_APP_HOST: string
  readonly VITE_APP_RSS_BASE_URL: string
  readonly VITE_ASSETS_URL: string
  readonly VITE_APP_PRIMARY_COLOR: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

