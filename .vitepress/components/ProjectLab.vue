<template>
  <div class="public-gallery p-5">
    <div
      v-if="loading"
      class="flex items-center justify-center h-full min-h-24"
    >
      <LoadingSpinner>加载中...</LoadingSpinner>
    </div>
    <div
      v-else
      class="grid md:grid-cols-2 lg:grid-cols-4 images-grid"
    >
      <div
        v-for="image in imageList"
        :key="image"
        class="image-card"
      >
        <ImageZoom
          loading="lazy"
          class="medium-zoom-image"
          :src="`/images/${image}`"
          :alt="image"
          data-zoomable
          @error="handleImageError"
        />
        <!-- <figure data-zoomable class="vp-image medium-zoom-image">
          <picture>
            <source data-zoomable :srcset="`/images/${getFileNameWithoutExtension(image)}.webp`" type="image/webp">
            <source data-zoomable :srcset="`/images/${getFileNameWithoutExtension(image)}.avif`" type="image/avif">
            <img data-zoomable :src="`/images/${image}`" :alt="image">
          </picture>
          <figcaption>{{ image }}</figcaption>
        </figure> -->
        <p class="filename">{{ image }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue'

  const imageList = ref([])
  const loading = ref(true)

  onMounted(async () => {
    try {
      // 读取生成的图片列表
      const response = await fetch('/image-list.json')
      imageList.value = await response.json()
    } catch (error) {
      console.error('加载图片列表失败:', error)
      // 备用方案：使用硬编码的图片列表
      imageList.value = getFallbackImages()
    } finally {
      loading.value = false
    }
  })

  const handleImageError = (event: any) => {
    console.error('图片加载失败:', event.target.src)
    event.target.style.display = 'none'
  }

  // 备用图片列表
  const getFallbackImages = () => {
    // 这里可以返回一个默认的图片列表
    return []
  }

  // function getFileNameWithoutExtension(filePath: string) {
  //   const fileName = filePath.split(/[\\/]/).pop() || '';
  //   const lastDotIndex = fileName.lastIndexOf('.');

  //   if (lastDotIndex === -1) return fileName;
  //   return fileName.substring(0, lastDotIndex);
  // }
</script>

<style scoped>
  .public-gallery {
    --image-card-bg: rgba(255, 255, 255, 0.35);
    --color-primary: #2563eb;
    /* 色轮上均匀分布 120 度 */
    --color-secondary: hsl(from var(--color-primary) calc(h + 120) s l);
    --color-tertiary: hsl(from var(--color-primary) calc(h - 120) s l);

    /* 比基础色亮 25% */
    --color-primary-lighter: hsl(from var(--color-primary-base) h s calc(l + 25));

    /* 比基础色暗 25% */
    --color-primary-darker: hsl(from var(--color-primary-base) h s calc(l - 25));

    --surface-base-light: hsl(240 67% 97%);
    --surface-base-dark: hsl(252 21% 9%);

    --shadow-elevation-low: 0 3px 5px hsl(0 0% 0% / 0.2);
    --shadow-elevation-medium: 0 6px 12px hsl(0 0% 0% / 0.2);
    --shadow-elevation-high: 0 15px 40px hsl(0 0% 0% / 0.2);

    --base-color: hsl(225, 87%, 56%);

    [data-toast='info'] {
      /* 只改变色相，保持亮度和色度 */
      --toast-color: oklch(from var(--base-color) l c 275);
    }

    [data-toast='warning'] {
      --toast-color: oklch(from var(--base-color) l c 80);
    }

    [data-toast='error'] {
      --toast-color: oklch(from var(--base-color) l c 35);
    }

    /* 不用手动算中间的每个颜色，color-mix 帮你搞定 */
    .banded-gradient {
      background: linear-gradient(
        to right,
        red,
        color-mix(in oklch, red 75%, blue),
        color-mix(in oklch, red 50%, blue),
        color-mix(in oklch, red 25%, blue),
        blue
      );
    }

    /* 用熟悉的 HSL 定义 */

    /* 第一层：基础层 */
    .surface-1 {
      background: light-dark(var(--surface-base-light), var(--surface-base-dark));
    }

    /* 第二层：稍微亮一点 */
    .surface-2 {
      background: light-dark(
        var(--surface-base-light),
        hsl(from var(--surface-base-dark) h s calc(l + 4))
      );
    }

    /* 第三层：再亮一点 */
    .surface-3 {
      background: light-dark(
        var(--surface-base-light),
        hsl(from var(--surface-base-dark) h s calc(l + 8))
      );
    }

    /* 基础布局：使用标准网格，所有浏览器都支持 */
    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      grid-gap: 20px;
      grid-auto-flow: dense;
    }

    /* 渐进增强：为支持grid-lanes的浏览器提供瀑布流体验 */
    @supports (display: grid-lanes) {
      .images-grid {
        display: grid-lanes;
        grid-template-columns:
          repeat(auto-fill, minmax(8rem, 1fr) minmax(16rem, 2fr))
          minmax(8rem, 1fr);
        gap: 16px;
      }
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
      background: var(--image-card-bg, rgba(255, 255, 255, 0.15));
      /* 玻璃质感边框 */
      border: 1px solid rgba(255, 255, 255, 0.2);
      /* 多层阴影营造深度 */
      box-shadow:
        0 8px 32px rgba(31, 38, 135, 0.2),
        inset 0 4px 20px rgba(255, 255, 255, 0.3);

      background: light-dark(
        var(--surface-base-light),
        hsl(from var(--surface-base-dark) h s calc(l + 4))
      );

      box-shadow: var(--shadow-elevation-medium);

      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      background:
        linear-gradient(45deg, #00cec9 25%, transparent 25%, transparent 75%, #00cec9 75%, #00cec9),
        linear-gradient(135deg, #00cec9 25%, transparent 25%, transparent 75%, #00cec9 75%, #00cec9);
      background-position:
        0 0,
        10px 10px;
      background-size: 20px 20px;
    }

    .image-card:nth-child(odd) {
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 15px;
      position: relative;
      overflow: hidden;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      background: linear-gradient(
        45deg,
        #ff9ff3 25%,
        #feca57 25%,
        #feca57 50%,
        #ff9ff3 50%,
        #ff9ff3 75%,
        #feca57 75%
      );
      background-repeat: no-repeat;
      background-position: center center;
    }

    .image-card:hover {
      transform: translateY(-5px);
    }

    .image-card img {
      width: 100%;
      object-fit: scale-down;
      display: block;
      /* h s l 不是字母，是变量！ */
      background: hsl(from var(--image-card-bg) h s l / 0.5);
    }

    .filename {
      padding: 10px;
      margin: 0;
      font-size: 12px;
      text-align: center;
      word-break: break-all;
    }
  }
</style>
