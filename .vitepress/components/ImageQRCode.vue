<template>
  <Transition name="qr-fade">
    <div v-if="showQRCode" class="image-qrcode" :class="positionClass">
      <div
        class="qr-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 w-60 relative overflow-hidden"
      >
        <button
          class="close-btn absolute top-3 right-3 w-7 h-7 flex-center rounded-full bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200 dark:hover:bg-gray-600 transition-base text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 z-10 border-0 cursor-pointer"
          @click="closeQRCode"
          aria-label="关闭二维码"
        >
          <svg
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div class="qr-content p-5 text-center">
          <h4
            v-if="title"
            class="qr-title font-semibold text-gray-900 dark:text-gray-100 mb-4 pr-7"
          >
            {{ title }}
          </h4>

          <div class="qr-image-container mb-4 relative">
            <img
              :src="imageUrl"
              :alt="altText"
              class="qr-image w-45 h-45 rounded-lg shadow-md shadow-gray-300/50 dark:shadow-gray-900/50 mx-auto transition-transform duration-300 hover:scale-102"
              loading="lazy"
            />
          </div>

          <p
            v-if="description"
            class="qr-description text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
          >
            {{ description }}
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";

interface Props {
  // 二维码图片URL
  imageUrl: string;
  // 触发距离（距离底部多少像素时显示）
  triggerDistance?: number;
  // 图片描述
  altText?: string;
  title?: string;
  description?: string;
  // 位置
  position?: "bottom-right" | "bottom-left";
}

const props = withDefaults(defineProps<Props>(), {
  triggerDistance: 150,
  altText: "二维码",
  position: "bottom-right",
});

// 显示状态
const showQRCode = ref(false);
const userClosed = ref(false);
let scrollTimer: NodeJS.Timeout | null = null;

// 位置类
const positionClass = computed(() => ({
  "fixed bottom-6 right-6 z-1000": props.position === "bottom-right",
  "fixed bottom-6 left-6 z-1000": props.position === "bottom-left",
}));

// 检查是否滚动到底部附近
const checkScrollPosition = () => {
  if (userClosed.value) return;

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  // 距离底部的距离
  const distanceFromBottom = documentHeight - (scrollTop + windowHeight);

  // 如果距离底部小于触发距离，显示二维码
  showQRCode.value = distanceFromBottom < props.triggerDistance;
};

// 防抖滚动处理
const handleScroll = () => {
  if (scrollTimer) clearTimeout(scrollTimer);
  scrollTimer = setTimeout(checkScrollPosition, 150);
};

// 关闭二维码
const closeQRCode = () => {
  showQRCode.value = false;
  userClosed.value = true;
};

// 重置显示
const reset = () => {
  userClosed.value = false;
  checkScrollPosition();
};

// 暴露方法给父组件
defineExpose({ reset });

// 初始化
onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  checkScrollPosition(); // 初始检查
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  if (scrollTimer) clearTimeout(scrollTimer);
});
</script>

<style>
/* 淡入淡出动画 */
.qr-fade-enter-active,
.qr-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.qr-fade-enter-from,
.qr-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.qr-fade-enter-to,
.qr-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 响应式设计 - 使用媒体查询 */
@media (max-width: 768px) {
  .image-qrcode.fixed.bottom-6.right-6,
  .image-qrcode.fixed.bottom-6.left-6 {
    bottom: 16px;
    right: 16px;
    left: auto;
  }

  .qr-card {
    width: 52vw !important;
    max-width: 200px;
  }

  .qr-image.w-45 {
    width: 40vw !important;
    height: 40vw !important;
    max-width: 150px;
    max-height: 150px;
  }
}

@media (max-width: 640px) {
  .image-qrcode.fixed.bottom-6.right-6,
  .image-qrcode.fixed.bottom-6.left-6 {
    left: 50% !important;
    right: auto !important;
    transform: translateX(-50%);
  }
}
</style>
