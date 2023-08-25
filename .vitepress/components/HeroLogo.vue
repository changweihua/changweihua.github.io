<script setup lang="ts">
import * as THREE from "three";
// 导入轨道控制器
// @ts-ignore
import { OrbitControls } from "../three/jsm/controls/OrbitControls.js";
// @ts-ignore
import { STLLoader } from "../three/jsm/loaders/STLLoader.js";
import { onMounted, ref } from "vue";
import { onUnmounted } from "vue";

const hero_logo = ref<HTMLDivElement>();

// 1、创建场景
let scene: THREE.Scene | null = null;
// 2、创建相机
let camera: THREE.OrthographicCamera | null = null;
// 3、初始化渲染器
let renderer: THREE.WebGLRenderer | null = null;

onMounted(() => {
  if (!hero_logo.value) {
    return;
  }

  const hero = hero_logo.value;

  var width = hero.offsetWidth; //窗口宽度
  var height = hero.offsetHeight; //窗口高度
  var k = width / height; //窗口宽高比
  var s = 150; //三维场景显示范围控制系数，系数越大，显示的范围越大

  scene = new THREE.Scene();
  // 2、创建相机
  camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
  // 设置相机位置
  camera!.position.set(200, 300, 200);
  scene.add(camera);

  // 初始化渲染器
  renderer = new THREE.WebGLRenderer();
  // 设置渲染的尺寸大小
  renderer.setSize(hero.offsetWidth, hero.offsetHeight);
  renderer.setClearColor(0xb9d3ff, 0); //设置背景颜色
  renderer.shadowMap.enabled = true;

  // const perspectiveHelper = new THREE.CameraHelper(camera);
  // scene.add(perspectiveHelper);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1200);
  scene.add(directionalLight);

  // const directionalLightHelper = new THREE.DirectionalLightHelper(
  //   directionalLight,
  //   5
  // );
  // scene.add(directionalLightHelper);

  var loader = new STLLoader();

  let cube: THREE.Mesh | null = null;

  loader.load("/stls/output3.stl", function (geometry: THREE.BufferGeometry) {
    console.log("Logo 加载成功");
    var material = new THREE.MeshLambertMaterial({
      color: 0x747bff,
    }); //材质对象Material
    cube = new THREE.Mesh(geometry, material);
    scene!.add(cube);
  });

  const planeGeometry = new THREE.PlaneGeometry(10, 10);
  const planeGeometryTexture = new THREE.TextureLoader().load(
    "/images/texture.jpg"
  );
  const planeMaterial = new THREE.MeshLambertMaterial({
    map: planeGeometryTexture,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -1;
  scene.add(plane);

  // 创建轨道控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  // 设置控制器阻尼，让控制器更有真实效果,必须在动画循环里调用.update()。
  controls.enableDamping = true;
  //相关限制方法：
  controls.enablePan = false; //禁止平移
  controls.enableZoom = false; //禁止缩放
  controls.enableRotate = false; //禁止旋转
  // 缩放范围
  controls.minZoom = 0.5;
  controls.maxZoom = 2;
  // 上下旋转范围
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2;
  // 左右旋转范围
  controls.minAzimuthAngle = -Math.PI / 2;
  controls.maxAzimuthAngle = Math.PI / 2;

  // console.log(renderer);
  // 将webgl渲染的canvas内容添加到body
  hero.appendChild(renderer.domElement);

  // //环境光
  // var ambient = new THREE.AmbientLight(0x444444);
  // scene.add(ambient);

  // // 添加坐标轴辅助器
  // // 辅助坐标系  参数250表示坐标系大小，可以根据场景大小去设置
  // const axesHelper = new THREE.AxesHelper(5);
  // scene.add(axesHelper);

  // 设置时钟
  const clock = new THREE.Clock();
  // 渲染循环
  // let angle = 0; //用于圆周运动计算的角度值
  // const R = 10; //相机圆周运动的半径

  function render() {
    if (cube) {
      // 获取时钟运行的总时长
      let time = clock.getElapsedTime();
      // console.log("时钟运行总时长：", time);
      // let deltaTime = clock.getDelta();
      //   console.log("两次获取时间的间隔时间：", deltaTime);
      let t = time % 5;
      cube!.position.x = t * 1;
      cube!.rotation.y = t * 1;
      if (cube!.position.x > 5) {
        cube!.position.x = 0;
      }
    }

    // angle += 0.01; // 相机y坐标不变，在XOZ平面上做圆周运动
    // camera!.position.x = R * Math.cos(angle);
    // camera!.position.z = R * Math.sin(angle);
    // .position改变，重新执行lookAt(0,0,0)计算相机视线方向

    // camera!.lookAt(0, 0, 0);

    controls.update();
    renderer!.render(scene!, camera!);
    //渲染下一帧的时候就会调用render函数
    requestAnimationFrame(render);
  }

  render();
});

onUnmounted(() => {
  console.log("onUnmounted");
});

const handleHeroLogoResize = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  console.log(width, height);

  renderer!.render(scene!, camera!);
};
</script>

<template>
  <div
    v-resize="handleHeroLogoResize"
    ref="hero_logo"
    id="hero_logo"
    class="w-full h-full"
  ></div>
</template>

<style lang="less" scoped></style>
