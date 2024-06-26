<script setup lang="ts">
import * as THREE from "three";
// 导入轨道控制器
import { OrbitControls } from "~/threejs/jsm/controls/OrbitControls.js";

import { onMounted, ref } from "vue";

import { loadGltf } from '@/three/infras/loader'
import { IntervalTime } from '@/three/infras/timer'

const hero_logo = ref<HTMLDivElement>();

// 1、创建场景
let scene: THREE.Scene | null = null;
// 2、创建相机
let camera: THREE.PerspectiveCamera | null = null;
// 3、初始化渲染器
let renderer: THREE.WebGLRenderer | null = null;
let controls: OrbitControls | null = null;

// const cameraTarget = new THREE.Vector3(0, 150, 0);

// const intervalTime = new IntervalTime();

// // 更新时间
// intervalTime.interval(() => {
//   console.log('refresh render')
//   render()
// }, 1000)



onMounted(() => {
  if (!hero_logo.value) {
    return;
  }

  const hero = hero_logo.value;

  var width = hero.offsetWidth; //窗口宽度
  var height = hero.offsetHeight; //窗口高度
  var k = width / height; //窗口宽高比

  scene = new THREE.Scene();
  // 2、创建相机
  // 创建相机
  camera = new THREE.PerspectiveCamera(75, k, 0.1, 600);
  // 设置相机位置
  camera.position.set(0, 0, 10);
  scene.add(camera);

  // 初始化渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  // 设置渲染的尺寸大小
  renderer.setSize(hero.offsetWidth, hero.offsetHeight);
  renderer.setClearColor(0xb9d3ff, 0); //设置背景颜色
  renderer.shadowMap.enabled = true;
  // 将webgl渲染的canvas内容添加到body
  hero.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.4;

  //辅助坐标轴
  const axesHelp = new THREE.AxesHelper();
  scene.add(axesHelp);

  //创建环境光，环境光会均匀的照亮场景中的所有物体。
  const light = new THREE.AmbientLight(0x404040);
  //将环境光添加到场景
  scene.add(light);
  // 创建平行光
  const directionalLight = new THREE.DirectionalLight();
  //设置光源位置
  directionalLight.position.set(0, 5, 0);
  //添加到场景
  scene.add(directionalLight);
  //设置光源投射阴影
  directionalLight.castShadow = true;


  //创建一个标准网格材质
  const material = new THREE.MeshStandardMaterial();
  // 创建一个平面
  const planeGeometry = new THREE.PlaneGeometry(30, 30);
  const plane = new THREE.Mesh(planeGeometry, material);
  scene.add(plane);
  //设置平面位置
  plane.position.set(0, -5, 0);
  //设置平面角度
  plane.rotation.x = -Math.PI / 2;
  //接收阴影
  plane.receiveShadow = true;

  Promise.all([loadGltf('/three/models/model0.gltf'), loadGltf('/three/models/model1.gltf'), loadGltf('/three/models/model2.gltf'), loadGltf('/three/models/model3.gltf'), loadGltf('/three/models/model4.gltf'), loadGltf('/three/models/model5.gltf'), loadGltf('/three/models/model6.gltf')]).then(gltfs => {
    gltfs.forEach(gltf => {
      console.log('控制台查看加载gltf文件返回的对象结构', gltf);
      console.log('gltf对象场景属性', gltf.scene);
      // 返回的场景对象gltf.scene插入到threejs场景中
      scene!.add(gltf.scene)
    })
  })

  // loadGltf('/three/models/model2.gltf').then(gltf => {
  //   console.log('控制台查看加载gltf文件返回的对象结构', gltf);
  //   console.log('gltf对象场景属性', gltf.scene);
  //   // 返回的场景对象gltf.scene插入到threejs场景中
  //   scene!.add(gltf.scene)
  // })

  function render() {
    //阻尼
    controls?.update();
    // 获取每一帧的时间间隔
    renderer!.render(scene!, camera!);
    requestAnimationFrame(render);
  }

  // 初始化渲染函数
  render();
});

const handleHeroLogoResize = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  console.log(width, height);

  requestAnimationFrame(function () {
    // 更新摄像头
    camera!.aspect = width / height;
    //   更新摄像机的投影矩阵
    camera!.updateProjectionMatrix();
    //   更新渲染器
    renderer!.setSize(width, height);
    //   设置渲染器的像素比
    renderer!.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // camera!.lookAt(cameraTarget);
    // controls!.update();
    // renderer!.clear();
    // renderer!.render(scene!, camera!);
  });
};
</script>

<template>
  <div v-resize="handleHeroLogoResize" ref="hero_logo" id="hero_logo" class="container w-full h-full"></div>
</template>

<style lang="less" scoped>
.container {
  min-height: 350px;
}
</style>
