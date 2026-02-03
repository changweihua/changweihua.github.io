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
    </div>
  </div>
</template>

<script setup lang="ts">
  import * as THREE from 'three'
  import { ref, onMounted, onUnmounted, watch, useTemplateRef } from 'vue'
  import { vElementSize } from '@vueuse/components'

  interface Props {
    // 控制x轴波浪的长度
    amountX?: number
    // 控制y轴波浪的长度
    amountY?: number
    // 控制点颜色
    color?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    amountX: 50,
    amountY: 50,
    color: 'rgba(163, 185, 190, 0.2)',
  })

  // DOM引用
  const containerRef = useTemplateRef<HTMLElement>('containerRef')

  // Three.js相关变量
  const SEPARATION = 100
  let container: HTMLDivElement | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let scene: THREE.Scene | null = null
  let renderer: THREE.WebGLRenderer | null = null
  let particles: THREE.Points | null = null
  let count = 0
  let animationFrameId: number | null = null

  // 响应式变量
  const windowHalfX = ref(0)
  const height = 200

  // 初始化场景
  const init = () => {
    if (!containerRef.value) return

    container = document.createElement('div')
    containerRef.value.appendChild(container)

    // 创建透视相机
    camera = new THREE.PerspectiveCamera(
      100, // 摄像机视锥体垂直视野角度
      containerRef.value.clientWidth / containerRef.value.clientHeight, // 摄像机视锥体长宽比
      1, // 摄像机视锥体近端面
      10000 // 摄像机视锥体远端面
    )

    // 设置相机z轴视野
    camera.position.z = 1000

    // 创建场景
    scene = new THREE.Scene()
    const numParticles = props.amountX * props.amountY
    const positions = new Float32Array(numParticles * 3)
    const scales = new Float32Array(numParticles)

    let i = 0,
      j = 0

    // 初始化粒子位置和大小
    for (let ix = 0; ix < props.amountX; ix++) {
      for (let iy = 0; iy < props.amountY; iy++) {
        positions[i] = ix * SEPARATION - (props.amountX * SEPARATION) / 2 // x
        positions[i + 1] = 0 // y
        positions[i + 2] = iy * SEPARATION - (props.amountY * SEPARATION) / 2 // z
        scales[j] = 1
        i += 3
        j++
      }
    }

    // 创建BufferGeometry
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1))

    const rgbaString = 'rgba(163, 185, 190, 0.3)'
    const rgbaValues = rgbaString.match(/[\d.]+/g)!

    // 创建着色器材质
    const material = new THREE.ShaderMaterial({
      uniforms: {
        // 设置球的颜色
        color: {
          value: new THREE.Color(
            parseInt(rgbaValues[0]) / 255,
            parseInt(rgbaValues[1]) / 255,
            parseInt(rgbaValues[2]) / 255
          ),
        },
      },
      opacity: parseFloat(rgbaValues[3]),
      transparent: true,
      // 顶点着色器
      vertexShader: `
      attribute float scale;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = scale * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
      // 片段着色器
      fragmentShader: `
      uniform vec3 color;
      void main() {
        if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    })

    // 创建点云
    particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearAlpha(0)
    renderer.setSize(window.innerWidth, height)
    container.appendChild(renderer.domElement)
    container.style.touchAction = 'none'
  }

  // 渲染函数
  const render = () => {
    if (!camera || !scene || !renderer || !particles) return

    camera.position.x = 100
    camera.position.y = 400
    camera.lookAt(scene.position)

    const positions = particles.geometry.attributes.position.array as Float32Array
    const scales = particles.geometry.attributes.scale.array as Float32Array

    // 设置粒子位置和大小
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
    renderer.render(scene, camera)
    count += 0.1
  }

  // 动画循环
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)
    render()
  }

  // 窗口大小调整处理
  const onWindowResize = () => {
    windowHalfX.value = window.innerWidth / 2

    if (camera && renderer) {
      camera.aspect = window.innerWidth / height
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, height)
    }
  }

  // 清理资源
  const cleanup = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }

    if (renderer) {
      renderer.dispose()
      renderer = null
    }

    if (scene && particles) {
      scene.remove(particles)
      particles.geometry.dispose()
      ;(particles.material as THREE.Material).dispose()
      particles = null
    }

    if (container && containerRef.value && containerRef.value.contains(container)) {
      containerRef.value.removeChild(container)
      container = null
    }
  }

  // 监听props变化，重新初始化
  watch(
    () => [props.amountX, props.amountY, props.color],
    () => {
      cleanup()
      init()
      animate()
    },
    { deep: true }
  )

  // 生命周期
  onMounted(() => {
    windowHalfX.value = window.innerWidth / 2
    init()
    animate()
  })

  onUnmounted(() => {
    cleanup()
  })
</script>

<style lang="scss" scoped>
  .three-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ripple-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
  }
</style>
