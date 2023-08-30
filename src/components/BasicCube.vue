<template>
  <div class="container" ref="container"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import axesHelper from "~/three/infras/axesHelper";
import createMesh from "~/three/infras/boxgeometry";
import camera from "~/three/infras/camera";
import orbitControls from "~/three/infras/orbitControls";
import render from "~/three/infras/render";
import renderer from "~/three/infras/renderer";
import { resizePage } from "~/three/infras/resize";
import scene from "~/three/infras/scene";
// import gsap from "gsap";

// 初始化渲染器

// 场景添加摄像机
scene.add(camera);

const container = ref(null);
// 辅助坐标
scene.add(axesHelper(3));

// 创建物体 材质
createMesh(0x00ff00);

// 页面伸缩
resizePage();

onMounted(() => {
  orbitControls(camera, container.value);
  container.value.appendChild(renderer.domElement);
  render();
});
</script>
<style>
.container {
  height: 100vh;
  width: 100vw;
  background-color: #f0f0f0;
}
.label {
  color: #fff;
  text-shadow: 0 0 10px #000;
  font-size: 16px;
}
</style>
