<script setup lang="ts">
import * as THREE from "three";
import gsap from "gsap";
// 导入轨道控制器
// @ts-ignore
import { OrbitControls } from "../three/jsm/controls/OrbitControls.js";
// @ts-ignore
import { FontLoader } from "../three/jsm/loaders/FontLoader.js";
// @ts-ignore
import { TextGeometry } from "../three/jsm/geometries/TextGeometry.js";
import { onMounted, ref } from "vue";

const hero_logo = ref<HTMLDivElement>();

// 1、创建场景
let scene: THREE.Scene | null = null;
// 2、创建相机
let camera: THREE.OrthographicCamera | null = null;
// 3、初始化渲染器
let renderer: THREE.WebGLRenderer | null = null;
let controls: OrbitControls | null = null;

let materials: Array<THREE.MeshPhongMaterial> = [];
let textMesh: THREE.Mesh | null = null;
const cameraTarget = new THREE.Vector3(0, 150, 0);
let font: any = null;

const size = 80,
  hover = -30,
  curveSegments = 8,
  bevelThickness = 3,
  bevelSize = 1.5;

const fontMap = {
  helvetiker: 0,
  optimer: 1,
  gentilis: 2,
  "droid/droid_sans": 3,
  "droid/droid_serif": 4,
};

const weightMap = {
  regular: 0,
  bold: 1,
};

const reverseFontMap = [];
const reverseWeightMap = [];
// @ts-ignore
for (const i in fontMap) reverseFontMap[fontMap[i]] = i;
// @ts-ignore
for (const i in weightMap) reverseWeightMap[weightMap[i]] = i;

onMounted(() => {
  if (!hero_logo.value) {
    return;
  }

  const hero = hero_logo.value;

  var width = hero.offsetWidth; //窗口宽度
  var height = hero.offsetHeight; //窗口高度
  var k = width / height; //窗口宽高比
  var s = 220; //三维场景显示范围控制系数，系数越大，显示的范围越大

  scene = new THREE.Scene();
  // 2、创建相机
  camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1100);
  // 设置相机位置
  camera!.position.set(100, 100, 1200);
  scene.add(camera);

  loadFont();

  // 初始化渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  // 设置渲染的尺寸大小
  renderer.setSize(hero.offsetWidth, hero.offsetHeight);
  renderer.setClearColor(0xb9d3ff, 0); //设置背景颜色
  renderer.shadowMap.enabled = true;
  // 将webgl渲染的canvas内容添加到body
  hero.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);

  const dirLight = new THREE.DirectionalLight(0xb9d3ff, 0.125);
  dirLight.position.set(0, 0, 1).normalize();
  scene.add(dirLight);

  // scene.background = new THREE.Color().setHex(0xb9d3ff);

  const pointLight = new THREE.PointLight(0xb9d3ff, 1.5);
  pointLight.color.setHex(0xb9d3ff);
  pointLight.position.set(0, 200, 90);
  scene.add(pointLight);

  materials = [
    new THREE.MeshPhongMaterial({ color: 0xb9d3ff, flatShading: true }), // front
    new THREE.MeshPhongMaterial({ color: 0xb9d3ff }), // side
  ];

  const group = new THREE.Group();
  // group.position.y = height * 0.5;

  scene.add(group);

  // animation
  const animations = () => {
    if (textMesh) {
      // 这里将mesh的x坐标，进行从0-》2-》0,实现这样子一个简单的动画效果
      gsap.to(textMesh!.position, {
        duration: 1,
        delay: 1,
        x: 10,
      });
      gsap.to(textMesh!.position, {
        duration: 1,
        delay: 2,
        x: -200,
      });
    }
  };

  function loadFont() {
    const loader = new FontLoader();
    loader.load("/fonts/JetBrains_Regular.json", function (response: any) {
      console.log(response);
      font = response;
      refreshText();
    });
  }

  function createText() {
    console.log(font);
    console.log(curveSegments);
    const textGeo = new TextGeometry("CMONO.NET", {
      font: font,
      size: size,
      height: height,
      curveSegments: curveSegments,
      bevelThickness: bevelThickness,
      bevelSize: bevelSize,
      bevelEnabled: true,
    });

    textGeo.computeBoundingBox();

    const centerOffset =
      -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

    textMesh = new THREE.Mesh(textGeo, materials);

    textMesh.position.x = centerOffset;
    textMesh.position.y = hover;
    textMesh.position.z = 0;

    textMesh.rotation.x = 0;
    textMesh.rotation.y = Math.PI * 2;

    group.add(textMesh);
  }

  function refreshText() {
    if (textMesh) {
      group.remove(textMesh);
    }
    createText();
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  function render() {
    camera!.lookAt(cameraTarget);
    controls!.update();
    renderer!.clear();
    renderer!.render(scene!, camera!);
    animations();
  }

  console.log("加载Logo");

  animate();
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
    // camera!.aspect = width /height;
    camera!.updateProjectionMatrix();
    renderer!.setSize(width, height);
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
    class="w-full h-full"
  ></div>
</template>

<style lang="less" scoped></style>
