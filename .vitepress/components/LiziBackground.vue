<template>
  <div
    class="lizi-container"
    ref="liziContainer"
  >
    <div
      class="three-container"
      ref="containerRef"
    >
      <canvas ref="canvasRef"></canvas>
      
      <!-- 上下文丢失时的提示信息 -->
      <div
        v-if="showContextLostMessage"
        class="context-lost-message"
      >
        <p>3D渲染上下文丢失</p>
        <button @click="recoverContext">恢复</button>
      </div>
      
      <!-- WebGL不支持时的提示信息 -->
      <div
        v-if="showWebGLNotSupported"
        class="webgl-not-supported"
      >
        <p>浏览器不支持3D渲染</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { ref, onMounted, onUnmounted, watch, useTemplateRef, computed } from 'vue'
import { 
  useDocumentVisibility,
  useRafFn
} from '@vueuse/core'

interface Props {
  amountX?: number
  amountY?: number
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  amountX: 50,
  amountY: 50,
  color: 'rgba(163, 185, 190, 0.2)',
})

// DOM引用
const containerRef = useTemplateRef<HTMLElement>('containerRef')
const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef')

// VueUse 响应式状态
const visibility = useDocumentVisibility()

// Three.js相关变量
let camera: THREE.PerspectiveCamera | null = null
let scene: THREE.Scene | null = null
let renderer: THREE.WebGLRenderer | null = null
let particles: THREE.Points | null = null
let count = 0

// 状态管理
const isContextLost = ref(false)
const showContextLostMessage = ref(false)
const showWebGLNotSupported = ref(false)

// 计算属性
const particleColor = computed(() => {
  const rgbaString = props.color || 'rgba(163, 185, 190, 0.3)'
  const rgbaValues = rgbaString.match(/[\d.]+/g)!
  return {
    color: new THREE.Color(
      parseInt(rgbaValues[0]) / 255,
      parseInt(rgbaValues[1]) / 255,
      parseInt(rgbaValues[2]) / 255
    ),
    opacity: parseFloat(rgbaValues[3])
  }
})

const isPageVisible = computed(() => visibility.value === 'visible')

// 安全的材质销毁函数
const disposeMaterial = (material: THREE.Material | THREE.Material[]) => {
  if (Array.isArray(material)) {
    material.forEach(m => m.dispose())
  } else {
    material.dispose()
  }
}

// 创建粒子几何体
const createParticlesGeometry = () => {
  const numParticles = props.amountX * props.amountY
  const positions = new Float32Array(numParticles * 3)
  const scales = new Float32Array(numParticles)
  
  const SEPARATION = 100
  
  let i = 0, j = 0
  
  for (let ix = 0; ix < props.amountX; ix++) {
    for (let iy = 0; iy < props.amountY; iy++) {
      positions[i] = ix * SEPARATION - (props.amountX * SEPARATION) / 2
      positions[i + 1] = 0
      positions[i + 2] = iy * SEPARATION - (props.amountY * SEPARATION) / 2
      scales[j] = 1
      i += 3
      j++
    }
  }
  
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1))
  return geometry
}

// 创建粒子材质
const createParticlesMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      color: {
        value: particleColor.value.color
      }
    },
    opacity: particleColor.value.opacity,
    transparent: true,
    vertexShader: `
      attribute float scale;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = scale * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      void main() {
        if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  })
}

// 获取canvas尺寸
const getCanvasSize = () => {
  if (!canvasRef.value) return { width: 0, height: 200 }
  
  // 获取canvas父容器的宽度
  const containerWidth = containerRef.value?.clientWidth || 0
  
  // 固定高度为200px，宽度为容器宽度
  return {
    width: containerWidth,
    height: 200
  }
}

// 检查WebGL支持情况
const checkWebGLSupport = (): boolean => {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return gl instanceof WebGLRenderingContext
  } catch {
    return false
  }
}

// 恢复上下文的手动触发
const recoverContext = () => {
  if (isContextLost.value) {
    cleanup()
    init()
  }
}

// WebGL上下文事件处理
const setupContextListeners = () => {
  if (!renderer || !canvasRef.value) return
  
  canvasRef.value.addEventListener('webglcontextlost', (event) => {
    event.preventDefault()
    isContextLost.value = true
    showContextLostMessage.value = true
  })
  
  canvasRef.value.addEventListener('webglcontextrestored', () => {
    isContextLost.value = false
    showContextLostMessage.value = false
    
    if (renderer) {
      renderer.resetState()
      rebuildScene()
    }
  })
}

// 重建场景
const rebuildScene = () => {
  if (scene && particles) {
    scene.remove(particles)
    particles.geometry.dispose()
    disposeMaterial(particles.material)
    particles = null
  }
  
  const size = getCanvasSize()
  
  if (!camera) {
    camera = new THREE.PerspectiveCamera(75, size.width / size.height, 0.1, 10000)
    camera.position.z = 1000
  }
  
  if (!scene) {
    scene = new THREE.Scene()
  }
  
  const geometry = createParticlesGeometry()
  const material = createParticlesMaterial()
  
  particles = new THREE.Points(geometry, material)
  scene.add(particles)
}

// 渲染函数
const render = () => {
  if (!camera || !scene || !renderer || !particles || isContextLost.value) return
  
  if (!isPageVisible.value) {
    return
  }
  
  camera.position.x = 100
  camera.position.y = 400
  camera.lookAt(scene.position)
  
  const positions = particles.geometry.attributes.position.array as Float32Array
  const scales = particles.geometry.attributes.scale.array as Float32Array
  
  let i = 0, j = 0
  for (let ix = 0; ix < props.amountX; ix++) {
    for (let iy = 0; iy < props.amountY; iy++) {
      positions[i + 1] = Math.sin((ix + count) * 0.3) * 50 + Math.sin((iy + count) * 0.5) * 50
      scales[j] = (Math.sin((ix + count) * 0.3) + 1) * 8 + (Math.sin((iy + count) * 0.5) + 1) * 8
      i += 3
      j++
    }
  }
  
  particles.geometry.attributes.position.needsUpdate = true
  particles.geometry.attributes.scale.needsUpdate = true
  
  renderer.render(scene, camera)
  
  count += 0.1
}

// 使用 useRafFn 创建渲染循环
const { pause: pauseRaf, resume: resumeRaf } = useRafFn(() => {
  if (isPageVisible.value && !isContextLost.value) {
    render()
  }
}, { immediate: false })

// 启动渲染
const startRendering = () => {
  if (isPageVisible.value && !isContextLost.value) {
    resumeRaf()
  }
}

// 暂停渲染
const pauseRendering = () => {
  pauseRaf()
}

// 页面可见性变化处理
const handleVisibilityChange = (visible: boolean) => {
  if (visible) {
    if (!isContextLost.value) {
      startRendering()
    }
  } else {
    pauseRendering()
  }
}

// 监听页面可见性变化
watch(isPageVisible, (visible) => {
  handleVisibilityChange(visible)
}, { immediate: true })

// 初始化
const init = () => {
  if (!canvasRef.value) return
  
  // 检查WebGL支持
  if (!checkWebGLSupport()) {
    showWebGLNotSupported.value = true
    return
  }
  
  showWebGLNotSupported.value = false
  
  const size = getCanvasSize()
  
  // 创建相机
  camera = new THREE.PerspectiveCamera(75, size.width / size.height, 0.1, 10000)
  camera.position.z = 1000
  
  // 创建场景
  scene = new THREE.Scene()
  
  // 创建粒子系统
  const geometry = createParticlesGeometry()
  const material = createParticlesMaterial()
  
  particles = new THREE.Points(geometry, material)
  scene.add(particles)
  
  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ 
    canvas: canvasRef.value,
    antialias: true,
    alpha: true
  })
  
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearAlpha(0)
  renderer.setSize(size.width, size.height)
  
  // 设置上下文监听器
  setupContextListeners()
  
  // 启动渲染
  startRendering()
}

// 清理资源
const cleanup = () => {
  pauseRendering()
  
  if (scene && particles) {
    scene.remove(particles)
    particles.geometry.dispose()
    disposeMaterial(particles.material)
    particles = null
  }
  
  if (renderer) {
    renderer.dispose()
    renderer = null
  }
  
  if (scene) {
    scene.clear()
    scene = null
  }
  
  camera = null
}

// 监听props变化，重新初始化
watch(
  () => [props.amountX, props.amountY, props.color],
  () => {
    cleanup()
    init()
  },
  { deep: true }
)

// 生命周期
onMounted(() => {
  init()
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.lizi-container {
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
}

.three-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.three-container canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.context-lost-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  z-index: 1000;
}

.context-lost-message button {
  margin-top: 8px;
  padding: 6px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.webgl-not-supported {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(220, 53, 69, 0.8);
  color: white;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  z-index: 1000;
}

@media (max-width: 768px) {
  .lizi-container {
    height: 150px;
  }
}
</style>
