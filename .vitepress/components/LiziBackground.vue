<template>
  <div
    class="lizi-container"
    ref="liziContainer"
  >
    <div
      class="three-container"
      v-element-size="onWindowResize"
      ref="containerRef"
    >
      <!-- 上下文丢失时的提示信息 -->
      <div
        v-if="showContextLostMessage"
        class="context-lost-message"
      >
        <p>3D 渲染上下文已丢失</p>
        <button @click="recoverContext">尝试恢复</button>
      </div>

      <!-- WebGL不支持时的提示信息 -->
      <div
        v-if="showWebGLNotSupported"
        class="webgl-not-supported"
      >
        <p>您的浏览器不支持WebGL 2.0，无法显示3D效果</p>
        <p>请尝试使用Chrome、Firefox或Edge等现代浏览器</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import * as THREE from 'three'
  import { ref, onMounted, onUnmounted, watch, useTemplateRef, computed } from 'vue'
  import { vElementSize } from '@vueuse/components'
  import { useDocumentVisibility, useRafFn, useThrottleFn, useDebounceFn } from '@vueuse/core'

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

  // VueUse 响应式状态
  const visibility = useDocumentVisibility()

  // Three.js相关变量
  const SEPARATION = 100
  let container: HTMLDivElement | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let scene: THREE.Scene | null = null
  let renderer: THREE.WebGLRenderer | null = null
  let particles: THREE.Points | null = null
  let count = 0
  let canvasElement: HTMLCanvasElement | null = null

  // 状态管理
  const windowHalfX = ref(0)
  const height = 200
  const isContextLost = ref(false)
  const showContextLostMessage = ref(false)
  const showWebGLNotSupported = ref(false)
  const isMobile = ref(
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  )

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
      opacity: parseFloat(rgbaValues[3]),
    }
  })

  const isPageVisible = computed(() => visibility.value === 'visible')

  // 安全的材质销毁函数
  const disposeMaterial = (material: THREE.Material | THREE.Material[]) => {
    if (Array.isArray(material)) {
      material.forEach((m) => m.dispose())
    } else {
      material.dispose()
    }
  }

  // 创建粒子几何体
  const createParticlesGeometry = () => {
    const numParticles = props.amountX * props.amountY
    const positions = new Float32Array(numParticles * 3)
    const scales = new Float32Array(numParticles)

    let i = 0,
      j = 0

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
    const vertexShader = isMobile.value
      ? `
    attribute float scale;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = scale * (150.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `
      : `
    attribute float scale;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = scale * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `

    const fragmentShader = isMobile.value
      ? `
    uniform vec3 color;
    void main() {
      float dist = length(gl_PointCoord - vec2(0.5, 0.5));
      if (dist > 0.5) discard;
      gl_FragColor = vec4(color, 0.8);
    }
  `
      : `
    uniform vec3 color;
    void main() {
      if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
      gl_FragColor = vec4(color, 1.0);
    }
  `

    return new THREE.ShaderMaterial({
      uniforms: {
        color: {
          value: particleColor.value.color,
        },
      },
      opacity: particleColor.value.opacity,
      transparent: true,
      vertexShader,
      fragmentShader,
    })
  }

  // 初始化粒子系统
  const initParticles = () => {
    if (!scene) return

    const geometry = createParticlesGeometry()
    const material = createParticlesMaterial()

    particles = new THREE.Points(geometry, material)
    scene.add(particles)
  }

  // 类型安全的WebGL上下文检查函数
  const isWebGL2RenderingContext = (
    context: RenderingContext | null
  ): context is WebGL2RenderingContext => {
    return (
      context !== null &&
      'drawingBufferWidth' in context &&
      'drawingBufferHeight' in context &&
      'getExtension' in context
    )
  }

  const isWebGLRenderingContext = (
    context: RenderingContext | null
  ): context is WebGLRenderingContext => {
    return (
      context !== null &&
      'drawingBufferWidth' in context &&
      'drawingBufferHeight' in context &&
      'getExtension' in context
    )
  }

  // 检查WebGL支持情况
  const checkWebGLSupport = (): boolean => {
    try {
      const canvas = document.createElement('canvas')

      // 首先尝试WebGL 2.0
      const gl2 = canvas.getContext('webgl2')
      if (isWebGL2RenderingContext(gl2)) {
        return true
      }

      // 如果WebGL 2.0不支持，尝试WebGL 1.0
      const gl1 = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (isWebGLRenderingContext(gl1)) {
        return true
      }

      return false
    } catch (error) {
      console.error('WebGL支持检查失败:', error)
      return false
    }
  }

  // 创建Three.js渲染器，处理WebGL版本兼容性
  const createRenderer = (canvas: HTMLCanvasElement): THREE.WebGLRenderer | null => {
    try {
      const contextAttributes = {
        alpha: true,
        antialias: !isMobile.value,
        powerPreference: isMobile.value ? 'default' : 'high-performance',
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
      }

      // 尝试获取WebGL 2.0上下文
      const gl2 = canvas.getContext('webgl2', contextAttributes)
      if (isWebGL2RenderingContext(gl2)) {
        console.log('使用WebGL 2.0渲染器')
        const renderer = new THREE.WebGLRenderer({
          canvas,
          context: gl2,
          alpha: true,
          antialias: !isMobile.value,
          powerPreference: isMobile.value ? 'default' : 'high-performance',
        })

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile.value ? 1 : 2))
        renderer.setClearAlpha(0)
        return renderer
      }

      // 如果WebGL 2.0不支持，尝试WebGL 1.0
      console.log('WebGL 2.0不可用，尝试WebGL 1.0')
      const gl1 =
        canvas.getContext('webgl', contextAttributes) ||
        canvas.getContext('experimental-webgl', contextAttributes)

      if (isWebGLRenderingContext(gl1)) {
        console.log('使用WebGL 1.0渲染器')

        const renderer = new THREE.WebGLRenderer({
          canvas,
          context: gl1,
          alpha: true,
          antialias: !isMobile.value,
          powerPreference: isMobile.value ? 'default' : 'high-performance',
        })

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile.value ? 1 : 2))
        renderer.setClearAlpha(0)

        // 检查渲染器是否正常工作
        if (renderer.getContext()) {
          console.log('WebGL 1.0渲染器创建成功')
          return renderer
        }
      }

      console.error('无法创建WebGL渲染器')
      return null
    } catch (error) {
      console.error('创建渲染器失败:', error)
      return null
    }
  }

  // 恢复上下文的手动触发
  const recoverContext = () => {
    if (renderer && isContextLost.value) {
      const canvas = renderer.domElement
      const context = canvas.getContext('webgl') || canvas.getContext('webgl2')

      if (context && (isWebGLRenderingContext(context) || isWebGL2RenderingContext(context))) {
        const loseContextExt = context.getExtension('WEBGL_lose_context')
        if (loseContextExt) {
          loseContextExt.restoreContext()
        }
      }
    }
  }

  // 释放隐藏时的资源
  const releaseResourcesOnHide = useDebounceFn(() => {
    if (!renderer || !isPageVisible.value) return

    renderer.forceContextLoss()

    if (isMobile.value && particles) {
      particles.geometry.dispose()
      const newGeometry = createParticlesGeometry()
      particles.geometry = newGeometry
    }
  }, 2000)

  // WebGL上下文事件处理
  const setupContextListeners = () => {
    if (!renderer || !canvasElement) return

    canvasElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault()
      console.warn('WebGL上下文丢失，正在尝试恢复...')
      isContextLost.value = true
      showContextLostMessage.value = true
      pauseRendering()
    })

    canvasElement.addEventListener('webglcontextrestored', async () => {
      console.log('WebGL上下文已恢复，开始重建场景...')
      isContextLost.value = false
      showContextLostMessage.value = false

      if (renderer) {
        renderer.resetState()
      }

      await rebuildSceneResources()

      if (isPageVisible.value) {
        startRendering()
      }
    })
  }

  // 重建场景资源
  const rebuildSceneResources = async () => {
    if (scene && particles) {
      scene.remove(particles)
      particles.geometry.dispose()
      disposeMaterial(particles.material)
      particles = null
    }

    if (!camera) {
      camera = new THREE.PerspectiveCamera(100, window.innerWidth / height, 1, 10000)
      camera.position.z = 1000
    }

    if (!scene) {
      scene = new THREE.Scene()
    }

    initParticles()

    if (renderer) {
      renderer.setSize(window.innerWidth, height)
    }

    console.log('场景资源重建完成')
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

    const updateFrequency = isMobile.value ? 2 : 1
    const shouldUpdate = Math.floor(count) % updateFrequency === 0

    if (shouldUpdate) {
      let i = 0,
        j = 0
      for (let ix = 0; ix < props.amountX; ix++) {
        for (let iy = 0; iy < props.amountY; iy++) {
          positions[i + 1] = Math.sin((ix + count) * 0.3) * 50 + Math.sin((iy + count) * 0.5) * 50
          scales[j] =
            (Math.sin((ix + count) * 0.3) + 1) * 10 + (Math.sin((iy + count) * 0.5) + 1) * 10
          i += 3
          j++
        }
      }

      particles.geometry.attributes.position.needsUpdate = true
      particles.geometry.attributes.scale.needsUpdate = true
    }

    renderer.render(scene, camera)
    count += isMobile.value ? 0.05 : 0.1
  }

  // 使用 useRafFn 创建渲染循环
  const { pause: pauseRaf, resume: resumeRaf } = useRafFn(
    () => {
      if (isPageVisible.value && !isContextLost.value) {
        render()
      }
    },
    { immediate: false }
  )

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
      releaseResourcesOnHide()
    }
  }

  // 监听页面可见性变化
  watch(
    isPageVisible,
    (visible) => {
      handleVisibilityChange(visible)
    },
    { immediate: true }
  )

  // 初始化场景
  const init = () => {
    if (!containerRef.value) return

    // 检查WebGL支持
    const webglSupported = checkWebGLSupport()
    if (!webglSupported) {
      showWebGLNotSupported.value = true
      console.error('浏览器不支持WebGL')
      return
    }

    showWebGLNotSupported.value = false

    // 确保完全清理旧的资源
    cleanup()

    // 创建容器
    container = document.createElement('div')
    containerRef.value.appendChild(container)

    // 创建相机
    camera = new THREE.PerspectiveCamera(
      100,
      containerRef.value.clientWidth / height,
      1,
      isMobile.value ? 5000 : 10000
    )
    camera.position.z = 1000

    // 创建场景
    scene = new THREE.Scene()

    // 初始化粒子系统
    initParticles()

    // 创建canvas元素
    canvasElement = document.createElement('canvas')
    canvasElement.style.display = 'block'
    container.appendChild(canvasElement)

    // 创建渲染器
    renderer = createRenderer(canvasElement)

    if (!renderer) {
      showWebGLNotSupported.value = true
      console.error('无法创建Three.js渲染器')
      return
    }

    // 设置渲染器大小
    renderer.setSize(window.innerWidth, height)

    // 设置上下文监听器
    setupContextListeners()

    // 启动渲染
    startRendering()
  }

  // 窗口大小调整处理
  const onWindowResize = useThrottleFn(() => {
    windowHalfX.value = window.innerWidth / 2

    if (camera && renderer) {
      camera.aspect = window.innerWidth / height
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, height)
    }
  }, 250)

  // 完全清理资源
  const cleanup = () => {
    pauseRendering()

    // 移除事件监听器
    if (canvasElement) {
      canvasElement.removeEventListener('webglcontextlost', () => {})
      canvasElement.removeEventListener('webglcontextrestored', () => {})
    }

    // 清理Three.js资源
    if (scene && particles) {
      scene.remove(particles)
      particles.geometry.dispose()
      disposeMaterial(particles.material)
      particles = null
    }

    if (renderer) {
      renderer.dispose()
      renderer.forceContextLoss()
      renderer = null
    }

    // 清理canvas元素
    if (canvasElement && canvasElement.parentNode === container) {
      container?.removeChild(canvasElement)
    }
    canvasElement = null

    // 清理场景和相机
    if (scene) {
      scene.clear()
      scene = null
    }

    camera = null

    // 清理容器
    if (container && containerRef.value && containerRef.value.contains(container)) {
      containerRef.value.removeChild(container)
      container = null
    }
  }

  // 监听props变化，重新初始化
  watch(
    () => [props.amountX, props.amountY, props.color],
    () => {
      init()
    },
    { deep: true }
  )

  // 生命周期
  onMounted(() => {
    windowHalfX.value = window.innerWidth / 2
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

  .context-lost-message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    z-index: 1000;
    backdrop-filter: blur(10px);
  }

  .context-lost-message button {
    margin-top: 10px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .context-lost-message button:hover {
    transform: translateY(-2px);
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  }

  .webgl-not-supported {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 0, 0, 0.8);
    color: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    z-index: 1000;
    backdrop-filter: blur(10px);
    max-width: 80%;
  }

  .webgl-not-supported p {
    margin: 5px 0;
  }
</style>
