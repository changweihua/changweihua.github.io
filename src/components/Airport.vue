<script setup lang="ts">
import * as THREE from "three";
import gsap from "gsap";
import { onMounted, onUnmounted, ref } from "vue";
import Stage from "@/three/infras/stage";
import building from "~/three/meshs/building";
import lane from "~/three/meshs/airport/lane";
import ground from "~/three/meshs/airport/ground";
import { loadPlane } from "~/three/meshs/airport/plane";
import Joystick from "vue-joystick-component";
// @ts-ignore
import { TextGeometry } from "~/three/jsm/geometries/TextGeometry.js";
// @ts-ignore
import { FontLoader } from "~/three/jsm/loaders/FontLoader.js";

const start = () => console.log("start");
const stop = () => console.log("stop");
const move = (e: any) => {
  // const { x, y, direction, distance } = e
  console.log("move", e);
};
const containerRef = ref<HTMLDivElement | null>(null);
const percent = ref(0);
const loading = ref(true);
let textMesh: THREE.Mesh | null = null;
let stage: Stage | null = null;
let flyPlane: THREE.Object3D | null = null

onMounted(() => {
  if (!containerRef.value) {
    return;
  }
  console.log("开始绘制机场");
  stage = new Stage(containerRef.value, 45, 0.1, 450);
  stage.add(ground);
  stage.add(building);
  building.position.x = 60;
  building.position.y = 115;
  building.position.z = 5;
  stage.addGroup(lane);
  // stage.add(tower);
  // stage.render(0);
  // stage.scene.rotateX(0.5 * Math.PI)

  const planes: Array<THREE.Object3D> = [];

  const loader = new FontLoader();
  loader.load("/fonts/JetBrains_Regular.json", function (response: any) {
    const font = response;
    console.log(font);

    loadPlane("/ssj/SSJ100.mtl", "/ssj/SSJ100.obj", () => {
      loading.value = false;
    }).then((plane) => {
      // stage && stage.add(plane);

      //   let textGeo = new TextGeometry("ZH9008", {
      //     size: 3,
      // height: 5,
      // //   fontWeight: "bold",
      // bevelSize: 3,
      // bevelEnabled: false,
      // steps: 7,
      // bevelThickness: 1,
      //     font,
      //   });

      //   let textMaterials = new THREE.MeshBasicMaterial({
      //     color: "red",
      //     wireframe: false,
      //     transparent: true,
      //     opacity: 1,
      //     side: THREE.DoubleSide,
      //   });
      //   let textMesh = new THREE.Mesh(textGeo, textMaterials);
      //   textMesh.name = "flightNO";
      //   textMesh.position.set(100, 100, 110); // 保持一点点的距离

      //   // 跟随物体旋转
      //   textMesh.rotation.y = -plane.rotateZ;
      //   // 不跟随物体扩大或者缩小
      //   textMesh.scale.x = 10; // item.originWidth / item.width;
      //   textMesh.scale.y = 10; //item.originHeight / item.height;
      //   textMesh.scale.z = 10; //item.originDepth / item.depth;

      //   // 新增至于物体中
      //   plane.add(textMesh);

      planes.push(
        plane.clone(),
        plane.clone(),
        plane.clone(),
        plane.clone(),
        plane.clone(),
        plane.clone()
      );
      planes.forEach((plane, index) => {
        planes[index].position.x = -130 + 50 * index;
        planes[index].position.y = 75;
        stage && stage.add(planes[index]);
      });
      gsap.to(planes[0].position, {
        y: 200,
        duration: 20,
        ease: "steps.inOut",
        repeat: 0, // -1,
        yoyo: false,
        delay: 5,
        onStart: () => {
          console.log("动画开始");
        },
        onComplete: () => {
          console.log("动画完成");
        },
      });

      // const points = [
      //   new THREE.Vector2(-80, 130),
      //   new THREE.Vector2(-150, 100),
      //   new THREE.Vector2(160, 100),
      //   new THREE.Vector2(160, -130),
      // ];

      const points = [
        new THREE.Vector3(-80, 75, 4),
        new THREE.Vector3(-150, 55, 4),
        new THREE.Vector3(160, 65, 4),
        new THREE.Vector3(160, -130, 4),
      ];
      // 创建二维样条曲线 start
      // for (let index = 0; index < 10; index++) {
      //   points.push(new THREE.Vector2(Math.random() * 20, Math.random() * 20));
      // }
      const curve = stage?.addPath3(points);
      const boatPosition = new THREE.Vector3();
      const boatTarget = new THREE.Vector3();
      requestAnimationFrame((time) => {
        stage?.render(time, (itime) => {
          itime *= 0.0005;
          const boatTime = itime * 0.05;
          curve?.getPointAt(boatTime % 1, boatPosition);
          // 获取路径前一点坐标，用于头部向前
          // curve?.getPointAt((boatTime + 0.01) % 1, boatTarget);
          // 位移
          planes[1].position.set(
            boatPosition.x,
            boatPosition.y,
            boatPosition.z
          );
          planes[1].lookAt(0, boatTarget.y, 0);

          if (flyPlane && textMesh) {
            textMesh.position.set(
              flyPlane.position.x,
              flyPlane.position.y,
              flyPlane.position.z + 20
            );
          }
        });
      });

      flyPlane = plane.clone();
      flyPlane.position.x = 160;
      flyPlane.position.y = -130;
      flyPlane.position.z = 4;
      flyPlane.rotation.z = -0.5 * Math.PI;


      let textGeo = new TextGeometry("ZH9008", {
        font: font,
        size: 5,
        height: 0.1,
      });
      let materials = [
        new THREE.MeshPhongMaterial({ color: 0xff0000, flatShading: true }), // front
        new THREE.MeshPhongMaterial({ color: 0xffff00 }), // side

        new THREE.MeshPhongMaterial({ color: 0xff0000, flatShading: true }),

        new THREE.MeshPhongMaterial({ color: 0xff0000, flatShading: true }),

        new THREE.MeshPhongMaterial({ color: 0xff0000, flatShading: true }),

        new THREE.MeshPhongMaterial({ color: 0xff0000, flatShading: true }),
      ];
      textMesh = new THREE.Mesh(textGeo, materials);
      textMesh.position.set(
        flyPlane.position.x,
        flyPlane.position.y,
        flyPlane.position.z + 20
      );
      // 跟随物体旋转
      textMesh.rotation.z = -flyPlane.rotateZ;
      flyPlane.add(textMesh);
      stage?.add(textMesh);


      gsap.to(flyPlane.position, {
        x: -300,
        y: -130,
        z: 30,
        duration: 20,
        ease: "steps.inOut",
        repeat: -1,
        yoyo: false,
        delay: 5,
        onStart: () => {
          console.log("动画开始");
        },
        onComplete: () => {
          console.log("动画完成");
        },
      });

      stage && stage.add(flyPlane);
    });
  });
  // // 1. 创建渲染器,指定渲染的分辨率和尺寸,然后添加到body中
  // const renderer = new THREE.WebGLRenderer({ antialias: true });
  // renderer.pixelRatio = window.devicePixelRatio;
  // renderer.setSize(window.innerWidth, window.innerHeight);
  // document.body.append(renderer.domElement);

  // // 2. 创建场景
  // const scene = new THREE.Scene();

  // // 3. 创建相机
  // const camera = new THREE.PerspectiveCamera(
  //   75,
  //   window.innerWidth / window.innerHeight,
  //   0.1,
  //   1000
  // );

  // camera.position.z = 10;
  // camera.position.x = 5;
  // camera.position.y = 5;
  // camera.lookAt(0, 0, 0);

  // // 4. 创建物体
  // const axis = new THREE.AxesHelper(5);
  // scene.add(axis);

  // // 5. 渲染
  // renderer.render(scene, camera);
});

onUnmounted(() => {
  // stage && stage.dispose()
});
</script>

<template>
  <div ref="containerRef" id="container" class="mt-3">
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
  <Joystick
    class="joy-stick"
    :size="100"
    base-color="pink"
    stick-color="purple"
    :throttle="100"
    @start="start"
    @stop="stop"
    @move="move"
  />
</template>

<style lang="less" scoped>
#container {
  width: calc(100vw - 50px);
  height: calc(100vh - 100px);
  position: relative;
}

.joy-stick {
  position: fixed;
  bottom: 20px;
  right: 20px;
}
</style>
