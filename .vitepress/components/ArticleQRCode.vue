<script setup lang="ts">
import { computed, nextTick, onMounted } from "vue";
import { inBrowser, useData, useRouter } from "vitepress";
import { useQRCode } from "vue3-next-qrcode";
import "vue3-next-qrcode/es/style.css";

const baseUrl = "https://changweihua.github.io";

const { page, frontmatter } = useData();

// 获取页面相关信息
console.log(page.value.filePath); // 页面路径
console.log(page.value.relativePath); // 相对路径
console.log(page.value.title); // 页面标题
console.log(frontmatter.value); // 页面 Frontmatter

const router = useRouter();

const shareUrl = computed(() => {
  // if (typeof window !== 'undefined') {
  //   return window.location.href
  // }
  return `${baseUrl}${router.route.path}`;
});

const { qrcodeURL, isLoading, error, generate, clear } = useQRCode();

onMounted(async () => {
  await nextTick();

  if (inBrowser) {
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
      <ImageQRCode
        v-if="qrcodeURL"
        :image-url="qrcodeURL.toString()"
        alt-text="示例二维码"
        title="扫码关注"
        description="扫描二维码获取更多信息"
        :trigger-distance="100"
      />
    </div>
  </ClientOnly>
</template>
