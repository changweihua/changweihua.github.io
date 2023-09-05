<script setup lang="ts">
import * as THREE from "three";
import gsap from "gsap";
import { onMounted, onUnmounted, ref } from "vue";
// @ts-ignore
import { OBJLoader } from "../three/jsm/loaders/OBJLoader.js";
// @ts-ignore
import { MTLLoader } from "../three/jsm/loaders/MTLLoader.js";
import Stage from "@/three/infras/stage";
import  building from "~/three/meshs/building"

const containerRef = ref<HTMLDivElement | null>(null);
const percent = ref(0);
const loading = ref(true);

let airPlane: any = null;
let positionAudio: THREE.PositionalAudio | null = null;
let stage: Stage | null = null;

onMounted(() => {
  if (!containerRef.value) {
    return;
  }

  //地面的长宽
  const laneWidth = 50;
  const laneHeight = 420;
  stage = new Stage(containerRef.value, 45, 100, 450);

  //创建一个地面的父容器
  const groundGroup = new THREE.Group();
  //创建马路容器
  const roadGroup = new THREE.Group();
  //使用平面几何体创建马路，参数为宽高，
  //这里我们创建单位为2，高度为10的马路，也许你会疑问为什么是高度，后面会给予解释，或者你可以直接查看官方文档。
  //搜索PlaneGeometry
  const roadPlaneG = new THREE.PlaneGeometry(laneWidth, laneHeight);
  //定义材质 和 颜色
  const roadPlaneM = new THREE.MeshStandardMaterial({ color: 0x4c4a4b });
  //创建网格 ，用于组织几何体和材质
  const roadPlane = new THREE.Mesh(roadPlaneG, roadPlaneM);

  const lineWidth = 0.5;
  //这里是左侧长实线
  const leftLine = new THREE.Mesh(
    new THREE.PlaneGeometry(lineWidth, laneHeight),
    new THREE.MeshStandardMaterial({ color: 0xf0c20e })
  );
  //设置实线位置
  leftLine.position.z = 0.0001;
  leftLine.position.x = (-laneWidth / 2) * 0.8;

  //克隆出右侧的实线
  const rightLine = leftLine.clone();
  rightLine.position.x = (laneWidth / 2) * 0.8; //同上

  const dashLineGroup = new THREE.Group();
  const dashHeight = 6;
  const dashGap = 3;
  const dashCount = Math.round(laneHeight / dashHeight);
  for (let i = 0; i < dashCount; i++) {
    const m = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const g = new THREE.PlaneGeometry(lineWidth, dashHeight);
    const mesh = new THREE.Mesh(g, m);
    mesh.position.z = 0.001;
    mesh.position.y = -laneHeight / 2 + (dashHeight + dashGap) * i;
    dashLineGroup.add(mesh);
  }

  roadGroup.add(roadPlane, leftLine, rightLine, dashLineGroup);

  // //前景草地
  // const frontGrass = new THREE.Mesh(
  //   new THREE.PlaneGeometry(groundW, groundH / 2),
  //   new THREE.MeshStandardMaterial({ color: 0x61974b })
  // );
  // frontGrass.position.z = -0.001;
  // frontGrass.position.y = -groundH / 4;
  // //后景草地
  // const backGrass = new THREE.Mesh(
  //   new THREE.PlaneGeometry(groundW, groundH / 2),
  //   new THREE.MeshStandardMaterial({ color: 0xb1d744 })
  // );
  // backGrass.position.z = -0.001;
  // backGrass.position.y = groundH / 4;

  // groundGroup.add(roadGroup, frontGrass, backGrass);
  // roadGroup.rotation.x = -0.25 * Math.PI;
  // roadGroup.position.z = laneHeight / 2;
  groundGroup.add(roadGroup);
  stage.addGroup(roadGroup);
  stage.add(building);

  // const treesGroup = new THREE.Group(); //整体树的集合
  // const leftTreeGroup = new THREE.Group(); //左边树的集合
  // const singTreeGroup = new THREE.Group(); //单个树的集合

  // //树的各个部分
  // const treeTop = new THREE.Mesh(
  //   new THREE.ConeGeometry(0.2, 0.2, 10),
  //   new THREE.MeshStandardMaterial({ color: 0x64a525 })
  // );
  // const treeMid = new THREE.Mesh(
  //   new THREE.ConeGeometry(0.3, 0.3, 10),
  //   new THREE.MeshStandardMaterial({ color: 0x64a525 })
  // );
  // //树干
  // const treeBottom = new THREE.Mesh(
  //   new THREE.CylinderGeometry(0.05, 0.05, 0.5),
  //   new THREE.MeshStandardMaterial({ color: 0x7a5753 })
  // );
  // //模拟树的阴影
  // const treeShadow = new THREE.Mesh(
  //   new THREE.CircleGeometry(0.3, 10),
  //   new THREE.MeshBasicMaterial({ color: 0x3f662d })
  // );
  // //设置各个部分的位置
  // treeTop.position.y = 0.55;
  // treeMid.position.y = 0.4;
  // //旋转阴影
  // treeShadow.rotation.x = -0.5 * Math.PI;
  // treeBottom.position.y = 0.2;
  // //组合单棵树
  // singTreeGroup.add(treeTop, treeMid, treeBottom, treeShadow);
  // //设置位置
  // singTreeGroup.scale.set(0.5, 0.5, 0.5);

  // //生成树的数量
  // const treeNum = 50;
  // for (let i = 0; i < treeNum; i++) {
  //   const group = singTreeGroup.clone();
  //   //z轴，默认为朝向屏幕的那一面
  //   group.position.z = -groundH + i * 0.5;
  //   group.position.x = -1.2;
  //   leftTreeGroup.add(group);
  // }
  // //右边的树，直接克隆生成
  // const rightTreeGroup = leftTreeGroup.clone();
  // //设置右边的树的位置
  // rightTreeGroup.position.x = 1.2 * 2;
  // //将树添加树的集合中
  // treesGroup.add(leftTreeGroup, rightTreeGroup);

  // renderer.addGroup(treesGroup);

  // // 非位置音频可用于不考虑位置的背景音乐
  // // 创建一个监听者
  // var listener = new THREE.AudioListener();
  // // camera.add( listener );
  // // 创建一个非位置音频对象  用来控制播放
  // var audio = new THREE.Audio(listener);
  // // 创建一个音频加载器对象
  // var audioLoader = new THREE.AudioLoader();
  // // 加载音频文件，返回一个音频缓冲区对象作为回调函数参数
  // audioLoader.load("/sounds/engine.mp3", function (AudioBuffer) {
  //   // console.log(AudioBuffer)
  //   // 音频缓冲区对象关联到音频对象audio
  //   audio.setBuffer(AudioBuffer);
  //   audio.setLoop(true); //是否循环
  //   audio.setVolume(0.5); //音量
  //   // 播放缓冲区中的音频数据
  //   audio.play(); //play播放、stop停止、pause暂停
  // });

  const geometry = new THREE.BoxGeometry(10, 10, 10);
  const material = new THREE.MeshLambertMaterial({
    color: 0x0000ff,
  }); //材质对象Material
  // 用来定位音源的网格模型
  var audioMesh = new THREE.Mesh(geometry, material);
  // 设置网格模型的位置，相当于设置音源的位置
  audioMesh.position.set(0, 0, 300);
  stage.addMesh(audioMesh);

  // 创建一个虚拟的监听者
  var listener = new THREE.AudioListener();
  // 监听者绑定到相机对象
  stage.addAudioListener(listener);
  // 创建一个位置音频对象,监听者作为参数,音频和监听者关联。
  positionAudio = new THREE.PositionalAudio(listener);
  //音源绑定到一个网格模型上
  audioMesh.add(positionAudio);
  // 创建一个音频加载器
  var audioLoader = new THREE.AudioLoader();
  // 加载音频文件，返回一个音频缓冲区对象作为回调函数参数
  audioLoader.load("/sounds/engine.mp3", function (AudioBuffer) {
    // console.log(buffer);
    // 音频缓冲区对象关联到音频对象audio
    positionAudio?.setBuffer(AudioBuffer);
    positionAudio?.setVolume(0.9); //音量
    positionAudio?.setRefDistance(200); //参数值越大,声音越大
  });

  const mtlLoader = new MTLLoader();
  const objLoader = new OBJLoader();
  mtlLoader.load("/ssj/SSJ100.mtl", function (materials: any) {
    materials.preload();
    objLoader.setMaterials(materials);
    objLoader.load(
      "/ssj/SSJ100.obj",
      function (gltf: any) {
        console.log(gltf)
        airPlane = gltf;
        airPlane.rotation.z = 1 * Math.PI;
        airPlane.position.set(0, -130, 0);
        // airPlane.rotation.x = -0.25 * Math.PI;
        // airPlane.setScaleToFitSize(airPlane);
        airPlane.scale.set(0.01, 0.01, 0.01);
        // airPlane.rotation.z = 0.25 * Math.PI;
        // 添加到场景
        stage?.add(airPlane);
        const box = new THREE.Box3().setFromObject(airPlane);
        const box3Helper = new THREE.Box3Helper(box);
        stage?.add(box3Helper);
      },
      (xhr: any) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        percent.value = Math.floor((xhr.loaded / xhr.total) * 100);
        if (percent.value === 100) {
          loading.value = false;
        }
      },
      (error: any) => {
        console.log("An error happened", error);
      }
    );
  });

  // //获取时钟方法
  // const clock = new THREE.Clock();

  // stage.render(() => {
  //   const time = clock.getElapsedTime();
  //   //不停的移动树和虚线的位置，产生一种在行进的感觉，下面计算后会重置位置
  //   // dashLineGroup.position.y = (-time * 1.5) % 3;
  //   // treesGroup.position.z = (time * 1.5) % 3;
  //   // if (airPlane) {
  //   //   airPlane.position.x += 2;
  //   //   if (airPlane.position.x > 2000) {
  //   //     airPlane.position.x = 10;
  //   //   }
  //   // }
  // });
});

onUnmounted(() => {
  if (positionAudio) {
    positionAudio.stop();
  }
  stage && stage.dispose()
});

const engineStarted = ref(false);
const launching = ref(false);

function startEngine() {
  if (!positionAudio) {
    return;
  }
  positionAudio.setLoop(true); //是否循环
  positionAudio.play(); //播放
  engineStarted.value = true;
}

function launch() {
  if (!positionAudio) {
    return;
  }
  positionAudio.setLoop(false);
  gsap.to(airPlane.position, {
    y: 200,
    duration: 20,
    ease: "steps.inOut",
    repeat: 0, // -1,
    yoyo: false,
    delay: 5,
    onStart: () => {
      console.log("动画开始");
      launching.value = true;
    },
    onComplete: () => {
      console.log("动画完成");
      launching.value = false;
      airPlane.position.y = -130;
      stage?.refresh();
    },
  });

  // renderer.move(
  //   {
  //     x: airPlane.position.x,
  //     y: airPlane.position.y,
  //     z: airPlane.position.z,
  //   },
  //   {
  //     x: airPlane.position.x,
  //     y: 300,
  //     z: airPlane.position.z,
  //   }
  // );
  // renderer.render(() => {
  //   // dashLineGroup.position.y = (-time * 1.5) % 3;
  //   if (airPlane) {
  //     airPlane.position.y += 2;
  //     if (airPlane.position.y >= 300) {
  //       airPlane.position.y = -150;
  //     }
  //   }
  // });
}
</script>

<template>
  <div ref="containerRef" id="container">
    <div v-if="loading" class="flex w-full h-full items-center justify-center">
      <a-progress
        type="circle"
        trail-color="#e6f4ff"
        :stroke-color="{
          '0%': '#108ee9',
          '100%': '#87d068',
        }"
        :percent="percent"
        :stroke-width="20"
        :size="100"
      />
    </div>
  </div>
  <a-button :disabled="engineStarted" @click="startEngine"
    >Start Engine</a-button
  >

  <a-button :disabled="!engineStarted || launching" @click="launch"
    >Launch</a-button
  >
</template>

<style lang="less" scoped>
#container {
  width: 450px;
  height: 600px;
}
</style>
@/three/meshs/terminal.js
