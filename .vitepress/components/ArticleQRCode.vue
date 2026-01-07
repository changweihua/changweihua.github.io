<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { inBrowser, useRouter } from "vitepress";
import "vue3-next-qrcode/es/style.css";
import { UseQRCodeReturnType } from "vue3-next-qrcode";

const baseUrl = "https://changweihua.github.io";

// const { page, frontmatter } = useData();

// // 获取页面相关信息
// console.log(page.value.filePath); // 页面路径
// console.log(page.value.relativePath); // 相对路径
// console.log(page.value.title); // 页面标题
// console.log(frontmatter.value); // 页面 Frontmatter

const router = useRouter();

const shareUrl = computed(() => {
  // if (typeof window !== 'undefined') {
  //   return window.location.href
  // }
  return `${baseUrl}${router.route.path}`;
});

const qrCodeModule = ref<typeof import("vue3-next-qrcode") | null>(null);
const loading = ref(true);
const qrCodeData = ref<UseQRCodeReturnType | null>(null);

// 生成二维码的函数
const generateQrCode = async () => {
  loading.value = true;
  try {
    // 动态导入模块（仅在客户端执行）
    if (!qrCodeModule.value) {
      const module = await import("vue3-next-qrcode");
      qrCodeModule.value = module;
    }

    // 使用具名导出的 useQrCode
    const { useQRCode } = qrCodeModule.value;

    if (!useQRCode) {
      throw new Error("useQRCode 方法未在 vue3-next-qrcode 中找到");
    }

    // // 获取当前值
    // const currentText = getRawValue(text);
    // const currentOptions = options ? getRawValue(options) : {};

    // 调用 useQrCode
    qrCodeData.value = useQRCode();
  } catch (err) {
    console.error("生成二维码失败:", err);
    // error.value = err instanceof Error ? err : new Error(String(err));
  } finally {
    loading.value = false;
  }
};

// 在客户端执行
onMounted(async () => {
  await nextTick();

  if (inBrowser) {
    await generateQrCode();
    if (qrCodeData.value) {
      const { qrcodeURL, isLoading, error, generate, clear } = qrCodeData.value;
      await generate({
        text: shareUrl.value,
        size: 300,
        margin: 20,
        logoImage: "/favicon.png",
        colorDark: "#000000",
        autoColor: true,
        colorLight: "#ffffff",
      });
    }
  }
});
</script>

<template>
  <ClientOnly>
    <div class="flex items-center justify-center">
      <div
        class="scroll-hint bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
        继续滚动显示二维码
      </div>
      <div v-if="loading" class="loading-state">
        <span>正在生成二维码...</span>
      </div>
      <ImageQRCode
        v-else-if="qrCodeData && qrCodeData.qrcodeURL"
        :image-url="qrCodeData.qrcodeURL.toString()"
        alt-text="文章二维码"
        title="扫码关注"
        description="扫描二维码获取更多信息"
        :trigger-distance="100"
      />
    </div>
  </ClientOnly>
</template>
