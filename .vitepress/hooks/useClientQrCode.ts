// // utils/useClientQrCode.ts
// import { ref, onMounted, watch, type Ref, type ComputedRef } from 'vue'
// import type {
//   QRCodeInst,
//   QRCodeLevel,
//   QRCodeStatus,
//   QRCodeProps,
//   QRCodeOptions,
//   UseQRCodeOptions,
//   UseQRCodeReturnType,
// } from 'vue3-next-qrcode'

// // 定义 useQrCode 的参数和返回类型
// // 根据 vue3-next-qrcode 的实际类型进行调整
// export interface QrCodeOptions {
//   size?: number
//   level?: 'L' | 'M' | 'Q' | 'H'
//   background?: string
//   foreground?: string
//   // 添加其他选项...
// }

// export type UseQrCodeReturn = {
//   // 根据实际返回值调整
//   toDataURL: () => string
//   toCanvas: (canvas: HTMLCanvasElement) => void
//   // 或者其他方法/数据...
// }

// /**
//  * 客户端专用的 useQrCode Hook
//  * @param text 二维码文本（响应式或普通字符串）
//  * @param options 二维码配置（响应式或普通对象）
//  * @returns 包含二维码数据和状态的响应式对象
//  */
// export function useClientQrCode(
//   text: string | Ref<string> | ComputedRef<string>,
//   options?: QrCodeOptions | Ref<QrCodeOptions> | ComputedRef<QrCodeOptions>
// ) {
//   const qrCodeData = ref<QRCodeRenderResponse   | null>(null)
//   const loading = ref(true)
//   const error = ref<Error | null>(null)
//   const qrCodeModule = ref<typeof import('vue3-next-qrcode') | null>(null)

//   // 获取响应式值的原始值
//   const getRawValue = <T>(value: T | Ref<T> | ComputedRef<T>): T => {
//     return value && typeof value === 'object' && 'value' in value
//       ? (value as Ref<T>).value
//       : value as T
//   }

//   // 生成二维码的函数
//   const generateQrCode = async () => {
//     try {
//       // 动态导入模块（仅在客户端执行）
//       if (!qrCodeModule.value) {
//         const module = await import('vue3-next-qrcode')
//         qrCodeModule.value = module
//       }

//       // 使用具名导出的 useQrCode
//       const { useQRCode } = qrCodeModule.value

//       if (!useQRCode) {
//         throw new Error('useQRCode 方法未在 vue3-next-qrcode 中找到')
//       }

//       // 获取当前值
//       const currentText = getRawValue(text)
//       const currentOptions = options ? getRawValue(options) : {}

//       // 调用 useQrCode
//       const { qrcodeURL, isLoading, error, generate, clear } = useQRCode();

//       qrCodeData.value =
//       error.value = null
//     } catch (err) {
//       console.error('生成二维码失败:', err)
//       error.value = err instanceof Error ? err : new Error(String(err))
//     } finally {
//       loading.value = false
//     }
//   }

//   // 在客户端执行
//   onMounted(() => {
//     generateQrCode()
//   })

//   // 监听响应式参数变化
//   if (text && typeof text === 'object' && 'value' in text) {
//     watch(text, generateQrCode, { deep: false })
//   }

//   if (options && typeof options === 'object' && 'value' in options) {
//     watch(options, generateQrCode, { deep: true })
//   }

//   return {
//     qrCodeData,
//     loading,
//     error,
//     regenerate: generateQrCode
//   }
// }
