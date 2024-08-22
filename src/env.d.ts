/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  readonly VITE_APP_RSS_BASE_URL: string;//定义提示信息 数据是只读的无法被修改
  readonly VITE_APP_PRIMARY_COLOR: string;
  //多个变量定义多个...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
