// import { defineStore } from 'pinia'

// interface usePermission {
//   buttonPermission: string[]
// }

// export const usePermissionStore = defineStore('permission', {
//   state: (): usePermission => {
//     return {
//       buttonPermission: []
//     }
//   },
//   actions: {
//     getButtonPermission() {
//       // 请求按钮权限TODO
//       this.buttonPermission = ['aaa', 'bbb', 'ccc']
//     },
//     clearButtonPermission() {
//       this.buttonPermission = []
//       globalThis.localStorage.removeItem('buttonPermission')
//     },
//     // 额外提供是否存在权限的方法（有些地方指令不能用，只能用if判断）
//     hasPermission(code: string) {
//       if (!code) return true
//       return this.buttonPermission.includes(code)
//     }
//   },
//   // 添加持久化选项
//   persist: {
//     enabled: true, // 启用持久化
//     strategies: [
//       {
//         key: 'buttonPermission', // 本地存储的键
//         storage: localStorage // 使用localStorage存储
//       }
//     ]
//   }
// })
