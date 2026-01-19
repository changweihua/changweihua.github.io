<template>
  <div class="public-gallery p-5">
    <div
      v-if="loading"
      class="flex items-center justify-center h-full min-h-24"
    >
      <LoadingSpinner>加载中...</LoadingSpinner>
    </div>
    <div v-else class="grid md:grid-cols-2 lg:grid-cols-4 images-grid">
      <div v-for="image in imageList" :key="image" class="image-card">
        <ImageZoom
          loading="lazy"
          class="medium-zoom-image"
          :src="`/images/${image}`"
          :alt="image"
          data-zoomable
          @error="handleImageError"
        />
        <p class="filename">{{ image }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const imageList = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    // 读取生成的图片列表
    const response = await fetch("/image-list.json");
    imageList.value = await response.json();
  } catch (error) {
    console.error("加载图片列表失败:", error);
    // 备用方案：使用硬编码的图片列表
    imageList.value = getFallbackImages();
  } finally {
    loading.value = false;
  }
});

const handleImageError = (event) => {
  console.error("图片加载失败:", event.target.src);
  event.target.style.display = "none";
};

// 备用图片列表
const getFallbackImages = () => {
  // 这里可以返回一个默认的图片列表
  return [];
};
</script>

<style scoped>
.images-grid {
  display: grid-lanes;
  grid-template-columns:
    repeat(auto-fill, minmax(8rem, 1fr) minmax(16rem, 2fr))
    minmax(8rem, 1fr);
  gap: 16px;
}

.image-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 6px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  /* 核心的背景滤镜效果 */
  backdrop-filter: blur(16px) saturate(180%);
  /* 半透明背景 */
  background: rgba(255, 255, 255, 0.15);
  /* 玻璃质感边框 */
  border: 1px solid rgba(255, 255, 255, 0.2);
  /* 多层阴影营造深度 */
  box-shadow:
    0 8px 32px rgba(31, 38, 135, 0.2),
    inset 0 4px 20px rgba(255, 255, 255, 0.3);
}

.image-card:hover {
  transform: translateY(-5px);
}

.image-card img {
  width: 100%;
  object-fit: cover;
  display: block;
}

.filename {
  padding: 10px;
  margin: 0;
  font-size: 12px;
  text-align: center;
  word-break: break-all;
}
</style>
