<script setup lang="ts">
import * as THREE from "three";
// 导入动画库
import gsap from "gsap";
// @ts-ignore
import Stats from "../three/jsm/libs/stats.module.js";
// 导入轨道控制器
// @ts-ignore
import { OrbitControls } from "../three/jsm/controls/OrbitControls.js";
// @ts-ignore
import { TextGeometry } from "../three/jsm/geometries/TextGeometry.js";
// @ts-ignore
import { OBJLoader } from "../three/jsm/loaders/OBJLoader.js";
// @ts-ignore
import { MTLLoader } from "../three/jsm/loaders/MTLLoader.js";
import { onMounted, onUnmounted, ref } from "vue";

import "default-passive-events";

const heroRef = ref<HTMLDivElement>();

// 1、创建场景
let scene: THREE.Scene | null = null;
// 2、创建相机
let camera: THREE.PerspectiveCamera | null = null;
// 3、初始化渲染器
let renderer: THREE.WebGLRenderer | null = null;
let controls: OrbitControls | null = null;

const stats = new Stats();

// 首页进入相机的视角,这个视角可以在三维模型中建立一个摄像机获取摄像机的坐标,如C4D,非常准确.
const cameraPosition = {
  x: -180,
  y: 430,
  z: 333,
};
const cameraLookat = {
  x: 0,
  y: 0,
  z: 0,
};
// 声明一个方法传入参数可以在不同的地方调用相机
const cameraReset = (position: any, lookAt: any, time = 1) => {
  gsap.to(camera!.position, {
    x: position.x,
    y: position.y,
    z: position.z,
    duration: time,
    ease: "power4.out",
    // onComplete: function () {
    // 这是相机运动完成的回调,可以执行其他的方法.
    // }
  });
  gsap.to(camera!.lookAt, {
    x: lookAt.x,
    y: lookAt.y,
    z: lookAt.z,
    duration: time,
    ease: "power4.out",
  });
  gsap.to(controls.target, {
    x: lookAt.x,
    y: lookAt.y,
    z: lookAt.z,
    duration: time,
    ease: "power4.out",
  });
};

onMounted(() => {
  console.log(heroRef);
  if (!heroRef.value) {
    return;
  }

  const hero = heroRef.value;

  hero.appendChild(stats.dom);

  const width = hero.offsetWidth; //窗口宽度
  const height = hero.offsetHeight; //窗口高度

  scene = new THREE.Scene();

  const ambient = new THREE.AmbientLight(0xffffff);
  scene.add(ambient);

  const fov = 40; // 视野范围
  const aspect = width / height; // 相机默认值 画布的宽高比
  const near = 0.1; // 近平面
  const far = 10000; // 远平面
  // 透视投影相机
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);
  camera.lookAt(0, 0, 0);
  scene.add(camera);

  const cameraHelper = new THREE.CameraHelper(camera);
  scene.add(cameraHelper);

  // 初始化渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true, //开启alpha
  });
  // 设置渲染的尺寸大小
  renderer.setSize(hero.offsetWidth, hero.offsetHeight);
  renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色
  renderer.shadowMap.enabled = true;
  // renderer.inputEncoding = true;
  // renderer.outputEncoding = THREE.sRGBEncoding;
  // 将webgl渲染的canvas内容添加到body
  hero.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.4;
  controls.dampingFactor = 0.1;

  // 添加坐标轴辅助器
  const axesHelper = new THREE.AxesHelper(50);
  scene.add(axesHelper);

  // let light = new THREE.PointLight();
  // camera.add(light);

  const light = new THREE.DirectionalLight(0xffffff); //光源颜色
  light.position.set(20, 10, 1305); //光源位置
  scene.add(light); //光源添加到场景中

  // 跑道图片
  // createPlaneGeometryBasicMaterial()

  // // 创建一个几何平面，作为地板，400，400
  // const planeGeometry = new THREE.PlaneGeometry(400, 400);
  // // 创建带颜色材质,更换为MeshLambertMaterial材质，去掉网格结构
  // const planeMaterial = new THREE.MeshLambertMaterial({
  //   color: "rgb(110,110,110)",
  // });
  // const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  // // 平面开启接收阴影效果
  // plane.receiveShadow = true;
  // // 设置平面角度和位置
  // plane.rotation.x = -0.5 * Math.PI;
  // plane.position.x = 0;
  // plane.position.y = 0;
  // plane.position.z = 0;
  // // 添加平面
  // scene.add(plane);

  // //添加网格地面
  // const gridHelper = new THREE.GridHelper(10, 10);
  // gridHelper.material.opacity = 0.2;
  // // gridHelper.material.transparent = true;
  // scene.add(gridHelper);

  let airPlane: any = null;

  // 加载飞机
  const objLoader = new OBJLoader();
  // objLoader.load(
  //   "/objs/SSJ100.obj",
  //   (gltf: any) => {
  //     console.log(gltf, "------我是3D的模型");
  //     // const scene = gltf.scene;
  //     // const box = new THREE.Box3().setFromObject(scene);
  //     // const x = box.max.x - box.min.x;
  //     // const y = box.max.y - box.min.y;
  //     // const z = box.max.z - box.min.z;
  //     // const maxDim = Math.max(x, y, z);
  //     // const scale = 250 / maxDim;
  //     // scene.scale.set(scale, scale, scale);
  //     // // scene.scale.set(25, 25, 25)
  //     // scene.add(scene);
  //     // // this.calcMeshCenter(scene)

  //     // gltf.children[0].material.color.set(0xe8b73b);
  //     const box3_2 = new THREE.Box3().setFromObject(gltf); //新建一个Box3包裹盒把模型包裹起来
  //     const boxSize = box3_2.getSize(new THREE.Vector3()).length(); //综合计算出模型的长度值，利用它设置相机位置
  //     const boxCenter = box3_2.getCenter(new THREE.Vector3());
  //     const fov = camera.fov * (Math.PI / 180);
  //     const cameraZ = boxSize / 2 / Math.tan(fov / 2);
  //     camera.position.z = cameraZ;
  //     camera.lookAt(boxCenter);
  //     scene!.add(gltf);

  //     // // fit camera to object
  //     // var bBox = new THREE.Box3().setFromObject(scene!);
  //     // var height = bBox.getSize(bBox).y;
  //     // var dist = height / (2 * Math.tan((camera.fov * Math.PI) / 360));
  //     // var pos = scene!.position;

  //     // // fudge factor so the object doesn't take up the whole view
  //     // camera.position.set(pos.x, pos.y, dist * 1.5);
  //     // camera.lookAt(pos);
  //   },
  //   (xhr: any) => {
  //     console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  //   },
  //   (error: any) => {
  //     console.log("An error happened", error);
  //   }
  // );

  // 加载mtl
  const mtlLoader = new MTLLoader();
  mtlLoader.load("/objs/SSJ100.mtl", function (materials: any) {
    materials.preload();
    objLoader.setMaterials(materials);
    // 加载obj
    objLoader.load("/objs/SSJ100.obj", function (gltf: any) {
      // // 模型文件太大，缩小一下比例，方便显示
      // gltf.scale.set(0.1, 0.1, 0.1);
      // // 设置可以投影
      // gltf.children.forEach((item: any) => {
      //   item.castShadow = true;
      //   item.receiveShadow = true;
      // });

      const box3_2 = new THREE.Box3().setFromObject(gltf); //新建一个Box3包裹盒把模型包裹起来
      const boxSize = box3_2.getSize(new THREE.Vector3()).length(); //综合计算出模型的长度值，利用它设置相机位置
      const boxCenter = box3_2.getCenter(new THREE.Vector3());
      const fov = camera.fov * (Math.PI / 180);
      const cameraZ = boxSize / 2 / Math.tan(fov / 2);
      camera.position.z = cameraZ;
      camera.lookAt(boxCenter);

      airPlane = gltf;
      // 添加到场景
      scene!.add(gltf);
      // scene!.add(gltf.scene);
      // 模型加载完,进行相机的初始化,传入设置的参数,模型加载为异步
      // cameraReset(cameraPosition, cameraLookat);

      // // 设置平面角度和位置
      // gltf.rotation.x = -0.5 * Math.PI;
      // gltf.position.x = 0;
      // gltf.position.y = 0;
      // gltf.position.z = 0;
    });
  });

  // // 渲染循环
  // let angle = 0; //用于圆周运动计算的角度值
  // const R = 10; //相机圆周运动的半径

  function render() {
    controls.update();
    renderer!.render(scene!, camera);
    // 更新性能控件
    stats.update();
    // if (airPlane) {
    //   angle += 0.01; // 相机y坐标不变，在XOZ平面上做圆周运动
    //   airPlane.rotation.x = R * Math.cos(angle);
    //   airPlane.rotation.y = R * Math.sin(angle);
    //   airPlane.rotation.z = R * Math.sin(angle);
    //   // .position改变，重新执行lookAt(0,0,0)计算相机视线方向
    //   // camera.lookAt(0, 0, 0);
    // }
    //渲染下一帧的时候就会调用render函数
    requestAnimationFrame(render);
  }
  render();
});

onUnmounted(() => {
  if (!scene) {
    return;
  }
  scene.traverse((e: any) => {
    if (e.BufferGeometry) e.BufferGeometry.dispose();
    if (e.material) {
      if (Array.isArray(e.material)) {
        e.material.forEach((m: any) => {
          m.dispose();
        });
      } else {
        e.material.dispose();
      }
    }
    if (e.isMesh) {
      e.remove();
    }
  });
  scene.remove();
  renderer!.dispose();
  // renderer!.content = null;
  // window.removeEventListener("resize", onWindowResize, false);
});

const handleHeroResize = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  console.log(width, height);

  requestAnimationFrame(function () {
    // camera!.aspect = width /height;
    camera?.updateProjectionMatrix();
    renderer?.setSize(width, height);
    renderer?.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // camera!.lookAt(cameraTarget);
    // controls!.update();
    // renderer!.clear();
    // renderer!.render(scene!, camera!);
  });
};
</script>

<template>
  <div v-resize="handleHeroResize" ref="heroRef" id="heroRef"></div>
</template>

<style lang="less" scoped>
#heroRef {
  width: 600px;
  height: 600px;
}
</style>
