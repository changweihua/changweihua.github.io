<script setup lang="ts">
import * as THREE from "three";
import gsap from "gsap";
import { onMounted, onUnmounted, ref } from "vue";
import Stage from "@/three/infras/stage";
import LabelUtils from "@/three/utils/LabelUtils";
import building from "~/three/meshs/building";
import lane from "~/three/meshs/airport/lane";
import ground from "~/three/meshs/airport/ground";
import { loadGltfPlane } from "~/three/meshs/airport/plane";
// @ts-ignore
import { TextGeometry } from "~/three/jsm/geometries/TextGeometry.js";
// @ts-ignore
import { FontLoader } from "~/three/jsm/loaders/FontLoader.js";

const containerRef = ref<HTMLDivElement | null>(null);
const percent = ref(0);
const loading = ref(true);
let textMesh: THREE.Mesh | null = null;
let stage: Stage | null = null;
let flyPlane: THREE.Object3D | null = null;
let arrivalPlane: THREE.Object3D | null = null;
let nextPlane: THREE.Object3D | null = null;

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

    loadGltfPlane("/ssj/SSJ100.gltf", () => {
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
        // planes[index].rotation.y = 0.5 * Math.PI;
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

      nextPlane = planes[1];

      const points = [
        new THREE.Vector2(-80, 75),
        new THREE.Vector2(-150, 55),
        new THREE.Vector2(160, 65),
        new THREE.Vector2(160, -130),
      ];
      const curve = stage?.addPath2(points);
      const boatPosition = new THREE.Vector2();
      const boatTarget = new THREE.Vector2();

      // const points = [
      //   new THREE.Vector3(-80, 75, 4),
      //   new THREE.Vector3(-150, 55, 4),
      //   new THREE.Vector3(160, 65, 4),
      //   new THREE.Vector3(160, -130, 4),
      // ];
      // const curve = stage?.addPath3(points);
      // const boatPosition = new THREE.Vector3();
      // const boatTarget = new THREE.Vector3();

      let lastZ = 0;
      requestAnimationFrame((time) => {
        stage?.render(time, (itime) => {
          itime *= 0.0005;
          const boatTime = itime * 0.05;
          curve?.getPointAt(boatTime % 1, boatPosition);
          // 获取路径前一点坐标，用于头部向前
          curve?.getPointAt((boatTime + 0.01) % 1, boatTarget);

          // 位移
          nextPlane?.position.set(boatPosition.x, boatPosition.y, 4);
          if (Math.abs(lastZ - boatTarget.x) > 45) {
            lastZ = boatTarget.x;
            nextPlane!.rotation.z = -boatTarget.x;
          }
          // nextPlane?.lookAt(boatTarget.y, boatTarget.x, 4);

          // // 位移
          // planes[1].position.set(
          //   boatPosition.x,
          //   boatPosition.y,
          //   4
          // );
          // planes[1].rotation.set(
          //   -0.5 * Math.PI, 0.5 * Math.PI, Math.PI
          // );
          // planes[1].lookAt(0, 0, 0);

          if (flyPlane && textMesh) {
            textMesh.position.set(
              flyPlane.position.x,
              flyPlane.position.y,
              flyPlane.position.z + 20
            );
          }
        });
      });

      const flyPlaneGroup = new THREE.Group();

      flyPlane = plane.clone();
      flyPlaneGroup.position.x = 160;
      flyPlaneGroup.position.y = -130;
      flyPlaneGroup.position.z = 4;
      flyPlane.position.set(0, 0, 10);
      flyPlane.rotation.z = -0.5 * Math.PI;

      flyPlaneGroup.add(flyPlane);

      const c = LabelUtils.createLabel("ZH9008");

      const texture = new THREE.CanvasTexture(c.canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(50, 50, 50); //只需要设置x、y两个分量就可以
      sprite.position.set(0, 0, 10);

      // 父对象group位置变化,网格模型及其对象的标签同样发生变化
      flyPlaneGroup.position.set(
        flyPlaneGroup.position.x,
        flyPlaneGroup.position.y,
        flyPlaneGroup.position.z
      );
      // 表示标签信息的精灵模型对象相对父对象设置一定的偏移
      sprite.translateX(0);

      // 把精灵模型插入到模型对象的父对象下面
      flyPlaneGroup.add(sprite);

      gsap.to(flyPlaneGroup.position, {
        x: -300,
        y: -130,
        z: 60,
        duration: 20,
        ease: "steps.inOut",
        repeat: -1,
        yoyo: false,
        delay: 35,
        onStart: () => {
          console.log("动画开始");
        },
        onComplete: () => {
          console.log("动画完成");
        },
      });

      stage && stage.add(flyPlaneGroup);

      arrivalPlane = plane.clone();
      arrivalPlane.position.x = 160;
      arrivalPlane.position.y = -130;
      arrivalPlane.position.z = 60;
      arrivalPlane.rotation.z = -0.5 * Math.PI;

      gsap.to(arrivalPlane.position, {
        x: -300,
        y: -130,
        z: 0,
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

      stage && stage.add(arrivalPlane);
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
  stage && stage.dispose()
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
