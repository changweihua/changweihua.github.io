/// <reference types="vite/client" />
/// <reference types="./global.d.ts" />
/// <reference types="./shims-vue.d.ts" />
/// <reference types="../components.d.ts" />
/// <reference types="./axios.d.ts" />
/// <reference types="./shims-module.d.ts" />
/// <reference types="./shims-tree.d.ts" />
/// <reference types="./shims-directive.d.ts" />

interface ImportMetaEnv {
  readonly VITE_APP_HOST: string;
  readonly VITE_APP_RSS_BASE_URL: string;
  readonly VITE_ASSETS_URL: string;
  readonly VITE_APP_PRIMARY_COLOR: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
