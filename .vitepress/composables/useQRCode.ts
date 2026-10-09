// import { ref, computed, onMounted, onUnmounted } from 'vue'

// export interface UseQRCodeOptions {
//   /** 触发距离（像素） */
//   triggerDistance?: number
//   /** 是否启用滚动监听 */
//   enableScroll?: boolean
//   /** 是否检查本地存储 */
//   checkStorage?: boolean
//   /** 存储过期时间（毫秒） */
//   storageExpiry?: number
//   /** 防抖延迟（毫秒） */
//   debounceDelay?: number
// }

// export interface UseQRCodeReturn {
//   /** 是否显示 */
//   isVisible: ReturnType<typeof ref<boolean>>
//   /** 用户是否已关闭 */
//   userClosed: ReturnType<typeof ref<boolean>>
//   /** 是否应该显示（计算属性） */
//   shouldShow: ReturnType<typeof computed<boolean>>
//   /** 关闭方法 */
//   close: () => void
//   /** 显示方法 */
//   show: () => void
//   /** 重置方法 */
//   reset: () => void
//   /** 计算滚动位置 */
//   getScrollPosition: () => {
//     scrollTop: number
//     windowHeight: number
//     documentHeight: number
//     distanceFromBottom: number
//   }
// }

// /**
//  * 使用二维码的组合式 API
//  */
// export function useQRCode(options: UseQRCodeOptions = {}): UseQRCodeReturn {
//   const {
//     triggerDistance = 200,
//     enableScroll = true,
//     checkStorage = true,
//     storageExpiry = 24 * 60 * 60 * 1000, // 24小时
//     debounceDelay = 150
//   } = options

//   const isVisible = ref(false)
//   const userClosed = ref(false)
//   let scrollTimeout: NodeJS.Timeout | null = null

//   // 计算是否应该显示
//   const shouldShow = computed(() => {
//     if (userClosed.value) return false
//     return isVisible.value
//   })

//   // 获取滚动位置信息
//   const getScrollPosition = () => {
//     const scrollTop = window.pageYOffset || document.documentElement.scrollTop
//     const windowHeight = window.innerHeight
//     const documentHeight = document.documentElement.scrollHeight
//     const distanceFromBottom = documentHeight - (scrollTop + windowHeight)

//     return { scrollTop, windowHeight, documentHeight, distanceFromBottom }
//   }

//   // 检查是否应该显示（基于滚动位置）
//   const checkShouldShow = () => {
//     const { distanceFromBottom } = getScrollPosition()
//     return distanceFromBottom < triggerDistance
//   }

//   // 检查本地存储
//   const checkLocalStorage = () => {
//     if (!checkStorage || typeof localStorage === 'undefined') return false

//     const hidden = localStorage.getItem('qrcode-hidden')
//     const timestamp = localStorage.getItem('qrcode-hidden-timestamp')

//     if (!hidden || !timestamp) return false

//     const timeDiff = Date.now() - parseInt(timestamp)
//     return timeDiff < storageExpiry
//   }

//   // 滚动处理函数
//   const handleScroll = () => {
//     if (!enableScroll || userClosed.value) return

//     if (scrollTimeout) {
//       clearTimeout(scrollTimeout)
//     }

//     scrollTimeout = setTimeout(() => {
//       isVisible.value = checkShouldShow()
//     }, debounceDelay)
//   }

//   // 关闭方法
//   const close = () => {
//     userClosed.value = true
//     isVisible.value = false

//     if (checkStorage && typeof localStorage !== 'undefined') {
//       localStorage.setItem('qrcode-hidden', 'true')
//       localStorage.setItem('qrcode-hidden-timestamp', Date.now().toString())
//     }
//   }

//   // 显示方法
//   const show = () => {
//     userClosed.value = false
//     isVisible.value = true
//   }

//   // 重置方法
//   const reset = () => {
//     userClosed.value = false
//     isVisible.value = false

//     if (checkStorage && typeof localStorage !== 'undefined') {
//       localStorage.removeItem('qrcode-hidden')
//       localStorage.removeItem('qrcode-hidden-timestamp')
//     }
//   }

//   // 初始化
//   const init = () => {
//     if (checkLocalStorage()) {
//       userClosed.value = true
//       return
//     }

//     if (enableScroll) {
//       window.addEventListener('scroll', handleScroll)
//       // 初始检查
//       handleScroll()
//     }
//   }

//   // 清理函数
//   const cleanup = () => {
//     if (enableScroll) {
//       window.removeEventListener('scroll', handleScroll)
//     }

//     if (scrollTimeout) {
//       clearTimeout(scrollTimeout)
//     }
//   }

//   onMounted(init)
//   onUnmounted(cleanup)

//   return {
//     isVisible,
//     userClosed,
//     shouldShow,
//     close,
//     show,
//     reset,
//     getScrollPosition
//   }
// }

// /**
//  * 生成二维码配置
//  */
// export function useQRCodeConfig() {
//   /**
//    * 获取默认配置
//    */
//   const getDefaultConfig = () => ({
//     size: 180,
//     level: 'M' as const,
//     background: '#ffffff',
//     foreground: '#000000',
//     margin: 2,
//     renderAs: 'svg' as const
//   })

//   /**
//    * 生成二维码数据
//    */
//   const generateQRData = (data: string, options?: {
//     size?: number
//     level?: 'L' | 'M' | 'Q' | 'H'
//     background?: string
//     foreground?: string
//     margin?: number
//   }) => ({
//     value: data,
//     ...getDefaultConfig(),
//     ...options
//   })

//   /**
//    * 获取暗色模式配置
//    */
//   const getDarkModeConfig = () => ({
//     background: '#1f2937',
//     foreground: '#f9fafb'
//   })

//   return {
//     getDefaultConfig,
//     generateQRData,
//     getDarkModeConfig
//   }
// }
