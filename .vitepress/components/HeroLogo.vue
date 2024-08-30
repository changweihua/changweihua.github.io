<script setup lang="ts">
import * as THREE from "three";
// import gsap from "gsap";
// 导入轨道控制器
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { onMounted, ref } from "vue";

import "default-passive-events";

const hero_logo = ref<HTMLDivElement>();

// 1、创建场景
let scene: THREE.Scene | null = null;
// 2、创建相机
let camera: THREE.OrthographicCamera | null = null;
// 3、初始化渲染器
let renderer: THREE.WebGLRenderer | null = null;
let controls: OrbitControls | null = null;

// let materials: Array<THREE.MeshPhongMaterial> = [];
let textMesh: THREE.Mesh | null = null;
const cameraTarget = new THREE.Vector3(0, 150, 0);
let font: any = null;

const boundaryGroup = new THREE.Group();

const textureLoader = new THREE.TextureLoader();

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
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.4;

  const dirLight = new THREE.DirectionalLight(0xb9d3ff, 0.125);
  dirLight.position.set(0, 0, 1).normalize();
  scene.add(dirLight);

  // scene.background = new THREE.Color().setHex(0xb9d3ff);

  const pointLight = new THREE.PointLight(0xb9d3ff, 1.5);
  pointLight.color.setHex(0xb9d3ff);
  pointLight.position.set(0, 200, 90);
  scene.add(pointLight);

  // materials = [
  //   new THREE.MeshPhongMaterial({ color: 0xb9d3ff, flatShading: true }), // front
  //   new THREE.MeshPhongMaterial({ color: 0xb9d3ff }), // side
  // ];

  const group = new THREE.Group();
  // group.position.y = height * 0.5;

  scene.add(group);
  scene.add(boundaryGroup);

  // animation
  // const animations = () => {
  //   if (textMesh) {
  //     // 这里将mesh的x坐标，进行从0-》2-》0,实现这样子一个简单的动画效果
  //     gsap.to(textMesh!.position, {
  //       duration: 1,
  //       delay: 1,
  //       x: 10,
  //     });
  //     gsap.to(textMesh!.position, {
  //       duration: 1,
  //       delay: 2,
  //       x: -200,
  //     });
  //   }
  // };

  function loadFont() {
    const loader = new FontLoader();
    loader.load("/fonts/JetBrains_Regular.json", function (response: any) {
      console.log(response);
      font = response;
      refreshText();
    });
  }

  function createText() {
    const textGeo = new TextGeometry("CMONO.NET", {
      font: font,
      size: size,
      depth: height,
      curveSegments: curveSegments,
      bevelEnabled: true,
      bevelThickness: bevelThickness,
      bevelSize: bevelSize,
      bevelOffset: 0,
      bevelSegments: 5,
    });

    if (!textGeo) {
      return;
    }

    const textMaterial = new THREE.MeshBasicMaterial();
    textMaterial.wireframe = true;

    // textGeo.center(); // 居中
    textGeo.computeBoundingBox(); // 计算 box 边界

    // const box = new THREE.BoxHelper(textGeo, 0xffff00);
    // scene?.add(box);

    // if (textGeo.boundingBox) {
    //   textGeo.translate(
    //     -textGeo.boundingBox.max.x * 0.5, // Subtract bevel size
    //     -textGeo.boundingBox.max.y * 0.5, // Subtract bevel size
    //     -textGeo.boundingBox.max.z * 0.5 // Subtract bevel thickness
    //   );
    // }

    const matcapTexture = textureLoader.load("/textures/1.png");

    const boundaryMaterial = new THREE.MeshMatcapMaterial();
    boundaryMaterial.matcap = matcapTexture;

    textMesh = new THREE.Mesh(textGeo, boundaryMaterial);

    const centerOffset =
      -0.5 * (textGeo.boundingBox!.max.x - textGeo.boundingBox!.min.x);

    textMesh.position.x = centerOffset;
    textMesh.position.y = hover;
    textMesh.position.z = 0;

    textMesh.rotation.x = 0;
    textMesh.rotation.y = Math.PI * 2;

    group.add(textMesh);

    // const textBox = new THREE.BoxHelper(textMesh, 0xffff00);
    // group.add(textBox);
  }

  function refreshText() {
    if (textMesh) {
      group.remove(textMesh);
    }
    createText();
    // boundaryGroup.clear();
    createBoundary();
  }

  const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 2, 5);
  const boxGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);

  function createBoundary() {
    const matcapTexture = textureLoader.load("/textures/1.png");

    const boundaryMaterial = new THREE.MeshMatcapMaterial();
    boundaryMaterial.matcap = matcapTexture;

    for (let i = 0; i < 100; i += 1) {
      let mesh;
      if (i % 10 <= 2) {
        mesh = new THREE.Mesh(boxGeometry, boundaryMaterial);
      } else {
        mesh = new THREE.Mesh(donutGeometry, boundaryMaterial);
      }
      mesh.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      mesh.setRotationFromEuler(
        new THREE.Euler(
          Math.PI * Math.random(),
          Math.PI * Math.random(),
          Math.PI * Math.random()
        )
      );
      const radomeScale = Math.random() * 0.5 + 0.2;
      mesh.scale.set(radomeScale, radomeScale, radomeScale);
      boundaryGroup.add(mesh);
    }
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
    // animations();
  }

  console.log("加载Logo");

  animate();
});

const reverseFontMap = [];
const reverseWeightMap = [];
// @ts-ignore
for (const i in fontMap) reverseFontMap[fontMap[i]] = i;
// @ts-ignore
for (const i in weightMap) reverseWeightMap[weightMap[i]] = i;

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
  <div v-resize="handleHeroLogoResize" ref="hero_logo" id="hero_logo" class="w-full h-full"></div>
</template>

<style lang="less" scoped>
#hero_logo {
  width: 300px;
  height: 300px;
}
</style>
