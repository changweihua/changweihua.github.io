<template>
  <div class="snake-timeline-container" ref="containerRef">
    <canvas
      ref="canvasRef"
      @mousemove="handleMouseMove"
      @click="handleClick"
      @mouseleave="handleMouseLeave"
    ></canvas>

    <!-- 提示框 -->
    <div
      v-if="activeTooltip && showTooltip"
      class="tooltip"
      :style="tooltipStyle"
    >
      <div class="tooltip-header">
        <span class="year-badge">{{ activeTooltip.year }}</span>
        <h3>{{ activeTooltip.event }}</h3>
      </div>
      <p class="tooltip-desc">{{ activeTooltip.description }}</p>
    </div>

    <!-- 控制面板 -->
    <div class="control-panel">
      <button
        @click="toggleAnimation"
        class="control-btn"
        :title="isPlaying ? '暂停' : '播放'"
      >
        {{ isPlaying ? '⏸️' : '▶️' }}
      </button>
      <button
        @click="toggleTheme"
        class="control-btn"
        :title="isDarkMode ? '亮色模式' : '暗色模式'"
      >
        {{ isDarkMode ? '☀️' : '🌙' }}
      </button>
      <button
        @click="toggleIcons"
        class="control-btn"
        :title="showIcons ? '隐藏图标' : '显示图标'"
      >
        {{ showIcons ? '🔡' : '🎨' }}
      </button>
      <button @click="resetAnimation" class="control-btn" title="重置动画">
        🔄
      </button>
    </div>

    <!-- 配置面板 -->
    <div class="config-panel">
      <label>
        <input
          type="range"
          v-model="config.waveAmplitude"
          min="50"
          max="200"
          step="10"
        />
        波浪幅度: {{ config.waveAmplitude }}
      </label>
      <label>
        <input
          type="range"
          v-model="config.animationSpeed"
          min="0.1"
          max="2"
          step="0.1"
        />
        动画速度: {{ config.animationSpeed }}
      </label>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>加载时间轴中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, useTemplateRef } from 'vue'

// 类型定义
interface Milestone {
  year: string
  event: string
  description: string
  color: string
  icon: string
}

interface Config {
  nodeRadius: number
  lineWidth: number
  animationSpeed: number
  waveAmplitude: number
  nodeSpacing: number
  hoverScale: number
  showProgressDots: boolean
}

interface Theme {
  background: string
  text: string
  nodeInactive: string
  lineInactive: string
  tooltipBg: string
  tooltipBorder: string
  nodeBorder: string
}

class TimelineNode {
  x: number
  y: number
  data: Milestone
  index: number
  total: number
  radius: number
  isActive: boolean
  isHovered: boolean
  progress: number
  scale: number

  constructor(x: number, y: number, data: Milestone, index: number, total: number) {
    this.x = x
    this.y = y
    this.data = data
    this.index = index
    this.total = total
    this.radius = 14
    this.isActive = false
    this.isHovered = false
    this.progress = 0
    this.scale = 1
  }
}

// 使用 useTemplateRef 获取模板引用（Vue 3.5+）
const containerRef = useTemplateRef<HTMLDivElement>('containerRef')
const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef')

// 响应式状态
const ctx = ref<CanvasRenderingContext2D | null>(null)
const animationFrame = ref<number | null>(null)
const activeTooltip = ref<Milestone | null>(null)
const showTooltip = ref(false)
const isLoading = ref(true)
const isPlaying = ref(true)
const isDarkMode = ref(false)
const showIcons = ref(true)
const mouseX = ref(0)
const mouseY = ref(0)

// 配置参数
const config = ref<Config>({
  nodeRadius: 14,
  lineWidth: 4,
  animationSpeed: 0.8,
  waveAmplitude: 120,
  nodeSpacing: 0.85,
  hoverScale: 1.3,
  showProgressDots: true
})

// 主题配置
const theme = computed<Theme>(() =>
  isDarkMode.value
    ? {
        background: '#1a1a1a',
        text: '#ffffff',
        nodeInactive: '#4a4a4a',
        lineInactive: '#3a3a3a',
        tooltipBg: '#2d2d2d',
        tooltipBorder: '#404040',
        nodeBorder: '#666666'
      }
    : {
        background: '#f8f9fa',
        text: '#333333',
        nodeInactive: '#9E9E9E',
        lineInactive: '#E0E0E0',
        tooltipBg: '#ffffff',
        tooltipBorder: '#e0e0e0',
        nodeBorder: '#cccccc'
      }
)

// 节点数据
const milestones = ref<Milestone[]>([
  {
    year: '2018',
    event: '梦想起航',
    description: '初创团队5人，在北京中关村开始了创业之旅',
    color: '#FF6B6B',
    icon: '🚀'
  },
  {
    year: '2019',
    event: '首轮融资',
    description: '获得千万级天使投资，产品研发加速',
    color: '#4ECDC4',
    icon: '💸'
  },
  {
    year: '2020',
    event: '产品发布',
    description: '首款产品正式上线，获得市场积极反馈',
    color: '#45B7D1',
    icon: '🎯'
  },
  {
    year: '2021',
    event: '用户增长',
    description: '用户数突破百万，团队扩张至50人',
    color: '#FFBE0B',
    icon: '📈'
  },
  {
    year: '2022',
    event: '国际化',
    description: '服务拓展至全球15个国家和地区',
    color: '#FF9F1C',
    icon: '🌍'
  },
  {
    year: '2023',
    event: '技术突破',
    description: 'AI大模型集成，产品智能化升级',
    color: '#E71D36',
    icon: '🤖'
  },
  {
    year: '2024',
    event: '生态建设',
    description: '构建完整的产品生态系统，服务千万用户',
    color: '#2EC4B6',
    icon: '🏆'
  }
])

const nodes = ref<TimelineNode[]>([])
const offScreenCanvas = ref<HTMLCanvasElement | null>(null)
const offScreenCtx = ref<CanvasRenderingContext2D | null>(null)
const resizeObserver = ref<ResizeObserver | null>(null)

// 计算属性
const tooltipStyle = computed(() => ({
  left: mouseX.value + 20 + 'px',
  top: mouseY.value - 40 + 'px',
  opacity: showTooltip.value ? 1 : 0,
  transform: `translateY(${showTooltip.value ? 0 : '10px'})`
}))

// 事件
const emit = defineEmits<{
  (e: 'nodeClick', data: Milestone): void
}>()

// 初始化画布
const initCanvas = async (): Promise<void> => {
  const container = containerRef.value
  const canvas = canvasRef.value
  if (!container || !canvas) return

  isLoading.value = true

  const { width, height } = container.getBoundingClientRect()
  canvas.width = width
  canvas.height = height - 2

  ctx.value = canvas.getContext('2d', { alpha: false })

  // 初始化离屏canvas
  offScreenCanvas.value = document.createElement('canvas')
  offScreenCanvas.value.width = width
  offScreenCanvas.value.height = height
  offScreenCtx.value = offScreenCanvas.value.getContext('2d', { alpha: false })

  createNodes()
  cacheStaticElements()

  await new Promise(resolve => setTimeout(resolve, 300))
  isLoading.value = false

  if (isPlaying.value) {
    startAnimation()
  }
}

// 创建节点
const createNodes = (): void => {
  const canvas = canvasRef.value
  if (!canvas) return
  const { width, height } = canvas
  nodes.value = milestones.value.map((milestone, index) => {
    const x = 100 + (index * (width - 200)) / (milestones.value.length - 1)
    const y =
      height / 2 +
      Math.sin((index * config.value.waveAmplitude) / 100) * config.value.waveAmplitude
    const node = new TimelineNode(x, y, milestone, index, milestones.value.length)
    node.radius = config.value.nodeRadius
    return node
  })
}

// 缓存静态元素
const cacheStaticElements = (): void => {
  const offCtx = offScreenCtx.value
  const offCanvas = offScreenCanvas.value
  if (!offCtx || !offCanvas) return

  const { width, height } = offCanvas

  // 绘制背景
  offCtx.fillStyle = theme.value.background
  offCtx.fillRect(0, 0, width, height)

  // 绘制连接线（静态部分）
  offCtx.strokeStyle = theme.value.lineInactive
  offCtx.lineWidth = config.value.lineWidth
  offCtx.lineCap = 'round'

  for (let i = 0; i < nodes.value.length - 1; i++) {
    const currentNode = nodes.value[i]
    const nextNode = nodes.value[i + 1]

    offCtx.beginPath()
    offCtx.moveTo(currentNode.x, currentNode.y)

    const cpX1 = currentNode.x + (nextNode.x - currentNode.x) * 0.5
    const cpY1 = currentNode.y
    const cpX2 = currentNode.x + (nextNode.x - currentNode.x) * 0.5
    const cpY2 = nextNode.y

    offCtx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, nextNode.x, nextNode.y)
    offCtx.stroke()
  }

  // 绘制节点背景
  nodes.value.forEach(node => {
    offCtx.beginPath()
    offCtx.arc(node.x, node.y, node.radius + 2, 0, Math.PI * 2)
    offCtx.fillStyle = theme.value.background
    offCtx.fill()

    offCtx.strokeStyle = theme.value.lineInactive
    offCtx.lineWidth = 2
    offCtx.stroke()
  })
}

// 绘制动态内容
const drawDynamicContent = (): void => {
  const context = ctx.value
  const canvas = canvasRef.value
  const offCanvas = offScreenCanvas.value
  if (!context || !canvas || !offCanvas) return

  const { width, height } = canvas

  context.clearRect(0, 0, width, height)
  context.drawImage(offCanvas, 0, 0)

  drawProgressLines()
  drawActiveConnections()
  drawNodes()
}

// 绘制进度线条
const drawProgressLines = (): void => {
  const context = ctx.value
  if (!context) return
  context.lineWidth = config.value.lineWidth
  context.lineCap = 'round'

  nodes.value.forEach((node, index) => {
    if (node.progress > 0 && index < nodes.value.length - 1) {
      const nextNode = nodes.value[index + 1]

      context.beginPath()
      context.moveTo(node.x, node.y)

      const cpX1 = node.x + (nextNode.x - node.x) * 0.5
      const cpY1 = node.y
      const cpX2 = node.x + (nextNode.x - node.x) * 0.5
      const cpY2 = nextNode.y

      context.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, nextNode.x, nextNode.y)
      context.strokeStyle = node.data.color
      context.stroke()

      if (config.value.showProgressDots) {
        const progressX = node.x + (nextNode.x - node.x) * node.progress
        const progressY = node.y + (nextNode.y - node.y) * node.progress

        context.beginPath()
        context.arc(progressX, progressY, 5, 0, Math.PI * 2)
        context.fillStyle = node.data.color
        context.fill()

        context.strokeStyle = theme.value.background
        context.lineWidth = 1
        context.stroke()
      }
    }
  })
}

// 绘制节点
const drawNodes = (): void => {
  const context = ctx.value
  if (!context) return
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  nodes.value.forEach(node => {
    const scale = node.isHovered ? config.value.hoverScale : 1

    context.save()
    context.translate(node.x, node.y)
    context.scale(scale, scale)

    context.beginPath()
    context.arc(0, 0, node.radius, 0, Math.PI * 2)

    context.fillStyle = node.isActive ? node.data.color : theme.value.nodeInactive
    context.fill()

    context.strokeStyle = node.isActive ? node.data.color : theme.value.lineInactive
    context.lineWidth = 2
    context.stroke()

    if (showIcons.value && node.data.icon) {
      context.fillStyle = '#ffffff'
      context.font = '16px Arial'
      context.fillText(node.data.icon, 0, 0)
    } else {
      context.fillStyle = '#ffffff'
      context.font = 'bold 12px Arial'
      context.fillText(node.data.year.slice(2), 0, 0)
    }

    context.restore()

    if (!node.isHovered) {
      context.fillStyle = theme.value.text
      context.font = 'bold 14px Arial'
      context.fillText(node.data.year, node.x, node.y - 28)

      context.font = '12px Arial'
      context.fillText(node.data.event, node.x, node.y + 28)
    }
  })
}

// 绘制激活的连接线
const drawActiveConnections = (): void => {
  const context = ctx.value
  if (!context) return
  context.strokeStyle = '#4CAF50'
  context.lineWidth = config.value.lineWidth
  context.lineCap = 'round'

  for (let i = 0; i < nodes.value.length - 1; i++) {
    if (nodes.value[i].isActive) {
      const currentNode = nodes.value[i]
      const nextNode = nodes.value[i + 1]

      context.beginPath()
      context.moveTo(currentNode.x, currentNode.y)

      const cpX1 = currentNode.x + (nextNode.x - currentNode.x) * 0.5
      const cpY1 = currentNode.y
      const cpX2 = currentNode.x + (nextNode.x - currentNode.x) * 0.5
      const cpY2 = nextNode.y

      context.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, nextNode.x, nextNode.y)
      context.stroke()
    }
  }
}

// 动画循环
const animate = (): void => {
  updateAnimation()
  drawDynamicContent()
  if (isPlaying.value) {
    animationFrame.value = requestAnimationFrame(animate)
  }
}

// 更新动画状态
const updateAnimation = (): void => {
  const now = Date.now() * config.value.animationSpeed
  const cycleDuration = 8000 // 8秒一个完整周期

  nodes.value.forEach((node, index) => {
    // 计算当前激活的节点索引（基于时间进度）
    const progress = (now % cycleDuration) / cycleDuration // 0-1
    const activeIndex = Math.floor(progress * nodes.value.length)
    node.isActive = index <= activeIndex

    // 计算当前段落的进度（用于进度点）
    if (index < nodes.value.length - 1) {
      const segmentProgress = Math.max(0, Math.min(1, progress * nodes.value.length - index))
      node.progress = segmentProgress
    }
  })
}

// ========== 修复关键：鼠标交互处理 ==========
const handleMouseMove = (event: MouseEvent): void => {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  mouseX.value = event.clientX
  mouseY.value = event.clientY
  const canvasX = event.clientX - rect.left
  const canvasY = event.clientY - rect.top

  // 重置所有节点的悬停状态
  nodes.value.forEach(node => {
    node.isHovered = false
  })

  // 使用 find 查找悬停节点（类型自动推断为 TimelineNode | undefined）
  const hoveredNode = nodes.value.find(node => {
    const distance = Math.hypot(canvasX - node.x, canvasY - node.y)
    return distance <= node.radius * config.value.hoverScale
  })

  if (hoveredNode) {
    hoveredNode.isHovered = true
    activeTooltip.value = hoveredNode.data // ✅ 类型安全，hoveredNode 被收窄为 TimelineNode
    showTooltip.value = true
    canvas.style.cursor = 'pointer'
  } else {
    showTooltip.value = false
    canvas.style.cursor = 'default'
  }
}

const handleMouseLeave = (): void => {
  showTooltip.value = false
  nodes.value.forEach(node => {
    node.isHovered = false
  })
}

const handleClick = (event: MouseEvent): void => {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const canvasX = event.clientX - rect.left
  const canvasY = event.clientY - rect.top

  const clickedNode = nodes.value.find(node => {
    const distance = Math.hypot(canvasX - node.x, canvasY - node.y)
    return distance <= node.radius * config.value.hoverScale
  })

  if (clickedNode) {
    emit('nodeClick', clickedNode.data)
  }
}
// ========== 修复结束 ==========

// 控制函数
const toggleAnimation = (): void => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    startAnimation()
  }
}

const toggleTheme = (): void => {
  isDarkMode.value = !isDarkMode.value
  cacheStaticElements()
  drawDynamicContent()
}

const toggleIcons = (): void => {
  showIcons.value = !showIcons.value
  drawDynamicContent()
}

const resetAnimation = (): void => {
  nodes.value.forEach(node => {
    node.isActive = false
    node.progress = 0
  })
  if (isPlaying.value) {
    startAnimation()
  }
}

const startAnimation = (): void => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }
  animate()
}

// 响应式处理
const setupResizeObserver = (): void => {
  resizeObserver.value = new ResizeObserver(entries => {
    if (!entries[0]) return
    initCanvas()
  })

  const container = containerRef.value
  if (container) {
    resizeObserver.value.observe(container)
  }
}

// 生命周期
onMounted(() => {
  setupResizeObserver()
  initCanvas()
})

onUnmounted(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  }
})

// 监听变化
watch(isDarkMode, () => {
  cacheStaticElements()
  drawDynamicContent()
})

watch(milestones, () => {
  createNodes()
  cacheStaticElements()
  drawDynamicContent()
})

watch(
  [() => config.value.waveAmplitude, () => config.value.animationSpeed],
  () => {
    createNodes()
    cacheStaticElements()
    if (isPlaying.value) {
      startAnimation()
    }
  }
)
</script>

<style scoped>
.snake-timeline-container {
  position: relative;
  width: 100%;
  height: 500px;
  background: var(--background, #f8f9fa);
  border-radius: 16px;
  overflow: hidden;
  transition: background-color 0.3s ease;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 16px;
}

.tooltip {
  position: fixed;
  background: v-bind('theme.tooltipBg');
  border: 1px solid v-bind('theme.tooltipBorder');
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  z-index: 1000;
  max-width: 280px;
  transition: all 0.3s ease;
  pointer-events: none;
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.year-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
}

.tooltip-header h3 {
  margin: 0;
  color: v-bind('theme.text');
  font-size: 14px;
  font-weight: 600;
}

.tooltip-desc {
  margin: 0;
  color: v-bind('theme.text');
  font-size: 12px;
  line-height: 1.5;
  opacity: 0.8;
}

.control-panel {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.control-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.control-btn:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 1);
}

.config-panel {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}

.config-panel label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.config-panel input[type='range'] {
  width: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  z-index: 20;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .snake-timeline-container {
    height: 400px;
    border-radius: 12px;
  }

  .tooltip {
    max-width: 200px;
    font-size: 11px;
  }

  .control-panel {
    top: 8px;
    right: 8px;
  }

  .control-btn {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }

  .config-panel {
    bottom: 8px;
    left: 8px;
    right: 8px;
    min-width: auto;
  }
}
</style>
