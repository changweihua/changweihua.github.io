<template>
  <!-- 使用v-if判断是否是SVG -->
  <div v-if="isSVG(item.cover)"
    class="svg-container rounded-sm overflow-hidden transition-transform duration-500 group-hover:scale-105">
    <svg class="svg-animated" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" :aria-label="item.coverAlt">
      <!-- 这里可以动态加载SVG内容 -->
      <!-- 使用v-html动态插入SVG路径 -->
      <g v-html="svgContent"></g>
    </svg>
  </div>

  <!-- 非SVG仍然使用img -->
  <img v-else class="rounded-sm object-cover transition-transform duration-500 group-hover:scale-105"
    crossorigin="anonymous" :src="`${item.cover || '/logo.png'}`" :alt="item.coverAlt" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  cover: {
    type: String,
    required: true
  }
})

// 检查是否为SVG
const isSVG = (url) => {
  if (!url) return false
  return url.toLowerCase().endsWith('.svg') || url.includes('.svg?') || url.includes('data:image/svg+xml')
}

// SVG内容
const svgContent = ref('')

// 初始化SVG内容
onMounted(async () => {
  if (isSVG(props.item.cover)) {
    await loadSVGContent()
  }
})

// 加载SVG内容
const loadSVGContent = async () => {
  try {
    const response = await fetch(props.item.cover)
    const svgText = await response.text()

    // 提取SVG中的路径
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
    const paths = svgDoc.querySelectorAll('path, circle, rect, polygon, line, ellipse')

    // 为所有路径添加动画类
    paths.forEach(path => {
      path.classList.add('svg-path-animated')
    })

    // 将修改后的SVG内容转换为字符串
    const serializer = new XMLSerializer()
    let content = ''
    paths.forEach(path => {
      content += serializer.serializeToString(path)
    })

    svgContent.value = content
  } catch (error) {
    console.error('加载SVG失败:', error)
    // 使用默认的SVG内容
    svgContent.value = `
      <path class="svg-path-animated" d="M50,85 C20,65 10,40 20,20 C30,5 45,5 50,15 C55,5 70,5 80,20 C90,40 80,65 50,85 Z" fill="currentColor"/>
    `
  }
}
</script>

<style scoped>
.svg-container {
  width: 100%;
  height: 100%;
  background: transparent;
}

.svg-animated {
  width: 100%;
  height: 100%;
  color: #3498db;
  /* 默认颜色，可以通过CSS变量覆盖 */
}

/* SVG路径动画 */
.svg-path-animated {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: drawStroke 3s ease-in-out infinite;
  transform-origin: center;
}

@keyframes drawStroke {
  0% {
    stroke-dashoffset: 200;
    opacity: 0.7;
  }

  50% {
    stroke-dashoffset: 0;
    opacity: 1;
  }

  100% {
    stroke-dashoffset: 200;
    opacity: 0.7;
  }
}
</style>
