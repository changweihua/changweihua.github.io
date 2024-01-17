// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_RSS_BASE_URL: string;//定义提示信息 数据是只读的无法被修改
  //多个变量定义多个...
}

// declare module '*.vue' {
//   import type { DefineComponent } from 'vue'
//   const component: DefineComponent<{}, {}, any>
//   export default component
// }
