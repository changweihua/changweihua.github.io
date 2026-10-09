<script setup lang="ts">
  import { computed, nextTick, onMounted, ref } from 'vue'
  import { inBrowser } from 'vitepress' // 仅引入 inBrowser，不使用 useRouter
  import 'vue3-next-qrcode/es/style.css'
  import type { UseQRCodeReturnType } from 'vue3-next-qrcode'

  const baseUrl = 'https://changweihua.github.io'

  // 将 shareUrl 改为 ref，在客户端赋值
  const shareUrl = ref('')

  const qrCodeModule = ref<typeof import('vue3-next-qrcode') | null>(null)
  const loading = ref(true)
  const qrCodeData = ref<UseQRCodeReturnType | null>(null)

  // 生成二维码函数（仅在客户端执行）
  const generateQrCode = async (url: string) => {
    loading.value = true
    try {
      if (!qrCodeModule.value) {
        const module = await import('vue3-next-qrcode')
        qrCodeModule.value = module
      }

      const { useQRCode } = qrCodeModule.value
      if (!useQRCode) {
        throw new Error('useQRCode 方法未找到')
      }

      qrCodeData.value = useQRCode()
      if (qrCodeData.value) {
        const { generate } = qrCodeData.value
        await generate({
          text: url,
          size: 300,
          margin: 20,
          logoImage: '/favicon.png',
          colorDark: '#000000',
          autoColor: true,
          colorLight: '#ffffff'
        })
      }
    } catch (err) {
      console.error('生成二维码失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 在客户端挂载时执行
  onMounted(async () => {
    if (!inBrowser) return

    // 动态导入 useRouter（仅在客户端）
    const { useRouter } = await import('vitepress')
    const router = useRouter()

    // 构造当前页面完整 URL
    const fullUrl = `${baseUrl}${router.route.path}`
    shareUrl.value = fullUrl

    // 生成二维码
    await nextTick()
    await generateQrCode(fullUrl)
  })
</script>

<template>
  <ClientOnly>
    <div class="flex items-center justify-center">
      <div
        class="scroll-hint bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
        继续滚动显示二维码
      </div>
      <div
        v-if="loading"
        class="loading-state"
      >
        <span>正在生成二维码...</span>
      </div>
      <ImageQRCode
        v-else-if="qrCodeData?.qrcodeURL"
        :image-url="qrCodeData.qrcodeURL.toString()"
        alt-text="文章二维码"
        title="扫码关注"
        description="扫描二维码获取更多信息"
        :trigger-distance="100"
      />
    </div>
  </ClientOnly>
</template>
