<template>
  <div ref="logo">
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, useTemplateRef } from "vue";
import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";

const logoRef = useTemplateRef('logo')

let stats, clock;
let scene, camera, renderer, mixer;

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(50, 50, 100);
  camera.lookAt(scene.position);

  // all objects of this animation group share a common animation state
  // AnimationObjectGroup: 接收共享动画的一组对象
  const animationGroup = new THREE.AnimationObjectGroup();

  // BoxGeometry： 立方缓冲集合体
  const geometry = new THREE.BoxGeometry(5, 5, 5);
  // MeshBasicMaterial：基础网格材质，这种材质不受光照的影响
  const material = new THREE.MeshBasicMaterial({ transparent: true });

  //

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.x = 32 - 16 * i;
      mesh.position.y = 0;
      mesh.position.z = 32 - 16 * j;

      scene.add(mesh);
      animationGroup.add(mesh);
    }
  }

  // create some keyframe tracks

  const xAxis = new THREE.Vector3(1, 0, 0);
  // Quaternion：四元数，在three.js中用于表示旋转
  const qInitial = new THREE.Quaternion().setFromAxisAngle(xAxis, 0);
  // Math.PI: 表示一个圆的周长和直径的比例，约为 3.14159
  const qFinal = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI);
  // QuaternionKeyframeTrack： 四元数类型的关键帧轨道
  const quaternionKF = new THREE.QuaternionKeyframeTrack(
    ".quaternion",
    [0, 1, 2],
    [
      qInitial.x,
      qInitial.y,
      qInitial.z,
      qInitial.w,
      qFinal.x,
      qFinal.y,
      qFinal.z,
      qFinal.w,
      qInitial.x,
      qInitial.y,
      qInitial.z,
      qInitial.w,
    ]
  );
  // ColorKeyframeTrack： 反应颜色变化的关键帧轨道
  const colorKF = new THREE.ColorKeyframeTrack(
    ".material.color",
    [0, 1, 2],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    THREE.InterpolateDiscrete
  );
  // NumberKeyframeTrack： 数字类型的关键帧轨道
  const opacityKF = new THREE.NumberKeyframeTrack(
    ".material.opacity",
    [0, 1, 2],
    [1, 0, 1]
  );

  // create clip
  // AnimationClip： 动画剪辑，是一个可重用的关键帧轨道集，他代表动画
  const clip = new THREE.AnimationClip("default", 3, [
    quaternionKF,
    colorKF,
    opacityKF,
  ]);

  // AnimationMixer： 动画混合器是用于场景中特定对象的动画的播放器。 当场景中的多个对象独立动画时，每个对象都可以使用同一个动画混合器
  mixer = new THREE.AnimationMixer(animationGroup);
  // clipAction： 返回锁传入的剪辑参数的 AnimationAction， 根对象参数可选，默认值为混合器的默认根对象。
  // 第一个参数可以是动画剪辑对象或动画剪辑的名称
  const clipAction = mixer.clipAction(clip);
  clipAction.play();

  // WebGLRenderer： 用 WebGL 渲染出你精心制作的场景
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //

  stats = new Stats();
  // document.body.appendChild(stats.dom);

  //Clock： 用于跟踪时间
  clock = new THREE.Clock();

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

function render() {
  const delta = clock.getDelta();

  if (mixer) {
    mixer.update(delta);
  }

  renderer.render(scene, camera);

  stats.update();
}

onMounted(function () {
  init();
  animate();
});

onBeforeUnmount(function () {
  window.removeEventListener("resize", onWindowResize);
});
</script>
