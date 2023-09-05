<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { CanvasTexture, Group, Sprite, SpriteMaterial, Vector2 } from "three";
import gsap from "gsap"
import Stage from "@/three/infras/stage";
import { buildTerminal } from "@/three/meshs/airport/terminal";
import { buildGround } from "@/three/meshs/airport/ground";
import { buildLane } from "@/three/meshs/airport/lane";
import { loadGltfPlane } from "@/three/meshs/airport/plane";
import LabelUtils from "@/three/utils/LabelUtils";

const containerRef = ref<HTMLDivElement | null>(null);
const percent = ref(0);
const loading = ref(true);
let stage: Stage | null = null;
let textMesh: THREE.Mesh | null = null;
let flyPlane: THREE.Object3D | null = null;
let arrivalPlane: THREE.Object3D | null = null;
let nextPlane: THREE.Object3D | null = null;

onMounted(() => {
  if (!containerRef.value) {
    return;
  }
  console.log("开始绘制机场");
  const far = Math.max(
    containerRef.value.offsetWidth,
    containerRef.value.offsetHeight
  );
  stage = new Stage(containerRef.value, 45, 0.1, 0.8 * far);

  const ground = buildGround();
  stage.add(ground);

  const terminal = buildTerminal("T1");
  stage.add(terminal);
  terminal.position.x = 60;
  terminal.position.y = 115;
  terminal.position.z = 5;

  const lane = buildLane();
  stage.addGroup(lane);

  const planes: Array<THREE.Object3D> = [];

  loadGltfPlane("/ssj/SSJ100.gltf", () => {
    loading.value = false;
  }).then((plane) => {
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

    nextPlane = planes[1];

    const points = [
      new Vector2(-80, 75),
      new Vector2(-150, 55),
      new Vector2(160, 65),
      new Vector2(160, -130),
    ];
    const curve = stage?.addPath2(points);
    const boatPosition = new Vector2();
    const boatTarget = new Vector2();

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

    const flyPlaneGroup = new Group();

    flyPlane = plane.clone();
    flyPlaneGroup.position.x = 160;
    flyPlaneGroup.position.y = -130;
    flyPlaneGroup.position.z = 4;
    flyPlane.position.set(0, 0, 10);
    flyPlane.rotation.z = -0.5 * Math.PI;

    flyPlaneGroup.add(flyPlane);

    const c = LabelUtils.createLabel("ZH9008");

    const texture = new CanvasTexture(c.canvas);
    const spriteMaterial = new SpriteMaterial({
      map: texture,
    });
    const sprite = new Sprite(spriteMaterial);
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

  // requestAnimationFrame((time) => {
  //   stage?.render(time, (itime) => {});
  // });
});

onUnmounted(() => {
  stage && stage.dispose();
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
../three/meshs/terminal
