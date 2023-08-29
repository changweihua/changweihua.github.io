<script setup lang="ts">
import * as THREE from "three";
// 导入轨道控制器
// @ts-ignore
import { OrbitControls } from "../three/jsm/controls/OrbitControls.js";

import { onMounted, ref } from "vue";
// 引入物理引擎
import * as CANNON from "cannon-es";

import "default-passive-events";

const hero_logo = ref<HTMLDivElement>();

// 1、创建场景
let scene: THREE.Scene | null = null;
// 2、创建相机
let camera: THREE.PerspectiveCamera | null = null;
// 3、初始化渲染器
let renderer: THREE.WebGLRenderer | null = null;
let controls: OrbitControls | null = null;

const cameraTarget = new THREE.Vector3(0, 150, 0);

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

  // 创建一个小球
  const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
  //创建一个标准网格材质
  const material = new THREE.MeshStandardMaterial();
  //创建物体
  const sphere = new THREE.Mesh(sphereGeometry, material);
  //物体添加到场景中
  scene.add(sphere);
  //开启物体投射阴影
  sphere.castShadow = true;

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

  // 创建物理世界
  const world = new CANNON.World();
  // 设置重力
  world.gravity.set(0, -9.8, 0);
  //世界的小球
  const sphereWorld = new CANNON.Sphere(1);
  //材质
  const worldSphereMaterial = new CANNON.Material();
  const sphereBody = new CANNON.Body({
    shape: sphereWorld,
    material: worldSphereMaterial,
    position: new CANNON.Vec3(0, 0, 0),
    // 小球的质量
    mass: 1,
  });
  // 添加到世界
  world.addBody(sphereBody);

  //物理世界平面
  const floorShape = new CANNON.Plane();
  const floorBody = new CANNON.Body();
  const floorMaterial = new CANNON.Material();
  floorBody.material = floorMaterial;
  // 设置质量为0，让地面不动
  floorBody.mass = 0;
  floorBody.addShape(floorShape);
  floorBody.position.set(0, -5, 0);
  floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  world.addBody(floorBody);

  //  设置碰撞材质的参数。将两种材质关联
  const defaultContactMaterial = new CANNON.ContactMaterial(
    worldSphereMaterial,
    floorMaterial,
    {
      // 摩擦力
      friction: 0.1,
      // 弹力
      restitution: 0.8,
    }
  );
  // 这些API直接看官网就好了，不用都记住
  world.addContactMaterial(defaultContactMaterial);

  // 添加碰撞音效
  const listener = new THREE.AudioListener();
  camera.add(listener);
  const sound = new THREE.Audio(listener);
  scene.add(sound);
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/sounds/3989.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.play();
  });

  const clock = new THREE.Clock();
  function render() {
    //阻尼
    controls.update();
    // 获取每一帧的时间间隔
    let time = clock.getDelta();
    // 根据指定的时间步长来更新物体的物体的位置、旋转，同时计算碰撞、应用力和其他物理效果。来推荐物体运动。
    // 这里的1/120是时间步长，也就是多久更新一次物体的物理状态。time是上次调用step到当前的时间间隔。
    // 时间步长要根据准确性和性能来设置
    world.step(1 / 120, time);
    sphere.position.copy(new THREE.Vector3(sphereBody.position.x,sphereBody.position.y,sphereBody.position.z));
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
    camera!.aspect = width /height;
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
  <div
    v-resize="handleHeroLogoResize"
    ref="hero_logo"
    id="hero_logo"
    class="container w-full h-full"
  ></div>
</template>

<style lang="less" scoped>
.container {
  min-height: 350px;
}
</style>
