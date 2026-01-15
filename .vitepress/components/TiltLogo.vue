<template>
  <!-- 外层容器，负责监听鼠标移动和离开事件 -->
  <div class="logo-container" @mousemove="handleMouseMove" @mouseleave="resetEffect">
    <!-- 中心 Logo 容器，包含所有球体 -->
    <div class="logo" ref="logo">
      <!-- 循环生成球体 -->
      <div v-for="(sphere, index) in spheresConfig" :key="index" class="sphere" ref="spheres" :style="{
        width: sphere.size + 'px',       // 球体直径
        height: sphere.size + 'px',      // 球体直径
        top: sphere.top,                 // 定位：上边距
        left: sphere.left,               // 定位：左边距
        right: sphere.right,             // 定位：右边距
        bottom: sphere.bottom,           // 定位：下边距
        backgroundColor: sphere.color    // 球体颜色
      }"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 中心 Logo 元素引用
const logo = ref(null)
// 所有球体元素的引用
const spheres = ref([])

// 球体配置数组
const spheresConfig = [
  { size: 60, top: '40px', left: '40px', color: '#3498db' },
  { size: 60, top: '40px', right: '40px', color: '#e74c3c' },
  { size: 60, bottom: '40px', left: '40px', color: '#2ecc71' },
  { size: 60, bottom: '40px', right: '40px', color: '#f39c12' },
  { size: 70, top: '120px', left: '120px', color: '#9b59b6' },
  { size: 50, top: '70px', left: '170px', color: '#1abc9c' },
  { size: 45, top: '180px', left: '70px', color: '#d35400' },
  { size: 40, top: '150px', right: '60px', color: '#27ae60' },
  { size: 35, top: '210px', right: '120px', color: '#8e44ad' },
  { size: 25, top: '30px', left: '150px', color: '#c0392b' }
]

// 鼠标移动事件
const handleMouseMove = (e) => {
  const container = e.currentTarget
  const rect = container.getBoundingClientRect()

  // 计算鼠标在容器中的相对位置（-1 ~ 1）
  const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
  const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2

  // 中心 Logo 随鼠标旋转
  logo.value.style.transform = `rotateX(${-y * 20}deg) rotateY(${x * 20}deg)`

  // 每个球体根据鼠标位置做视差位移
  spheres.value.forEach((sphere, index) => {
    const sphereX = x * 35 * Math.cos(index * 0.8) // X 方向位移
    const sphereY = y * 35 * Math.sin(index * 0.8) // Y 方向位移
    const sphereZ = Math.abs(x * y) * 70 + index * 8 // Z 方向位移（层次感）

    sphere.style.transform = `translate3d(${sphereX}px, ${sphereY}px, ${sphereZ}px)`
  })
}

// 鼠标移出时恢复初始位置
const resetEffect = () => {
  logo.value.style.transform = 'rotateX(0) rotateY(0)'
  spheres.value.forEach(sphere => {
    sphere.style.transform = 'translate3d(0, 0, 0)'
  })
}
</script>

<style scoped>
/* 外层容器，定义大小和透视深度 */
.logo-container {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 100px auto;
  perspective: 1200px;
}

/* 中心 Logo 容器 */
.logo {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out;
}

/* 球体公共样式 */
.sphere {
  position: absolute;
  border-radius: 50%;
  transition: transform 0.3s ease-out;
  box-shadow: inset -8px -8px 16px rgb(0 0 0 / 30%),
    8px 16px rgb(255 255 255 / 30%);
}
</style>
