<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "../../threejs/jsm/controls/OrbitControls.js";
import { SVGLoader } from "../../threejs/jsm/loaders/SVGLoader.js";
import { onMounted, ref } from "vue";

import "default-passive-events";

const hero_logo = ref<HTMLDivElement>();

// 1、创建场景
let scene: THREE.Scene | null = null;
// 2、创建相机
let camera: THREE.PerspectiveCamera | null = null;
// 3、初始化渲染器
let renderer: THREE.WebGLRenderer | null = null;
let container: HTMLDivElement | null = null;

function init() {
  //创建一个三维场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#F7F7F7");

  //创建一个透视相机，窗口宽度，窗口高度
  // width和height用来设置Three.js输出的Canvas画布尺寸(像素px)
  const width = container!.offsetWidth,
    height = container!.offsetHeight;
  // 30:视场角度, width / height:Canvas画布宽高比, 1:近裁截面, 3000：远裁截面
  camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
  //设置相机位置xyz坐标
  camera.position.set(500, 150, 600);
  //设置相机方向
  camera.lookAt(0, 0, 0);

  //添加光源 //会照亮场景里的全部物体（氛围灯），前提是物体是可以接受灯光的，这种灯是无方向的，即不会有阴影。
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  const light = new THREE.PointLight(0xffffff, 1); //点光源，color:灯光颜色，intensity:光照强度
  scene.add(ambient);
  light.position.set(200, 300, 400);
  scene.add(light);

  // 添加网格辅助线grid
  var gridHelper = new THREE.GridHelper(600, 50, 0xb3b3b3, 0xcccccc); //网格宽度、等分数、中心线颜色，网格线颜色
  gridHelper.position.y = -50;
  // gridHelper和普通的网格模型、线模型一样需要插入到场景中才会被渲染显示出来
  scene.add(gridHelper);

  //加载svg
  setTitleGroup();

  //创建一个WebGL渲染器
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height); //设置渲染区尺寸
  renderer.render(scene, camera); //执行渲染操作、指定场景、相机作为参数
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement); //创建控件对象
  controls.addEventListener("change", () => {
    render(); //监听鼠标，键盘事件
  });
}

// 加载svg
const titleGroup = new THREE.Group();
titleGroup.scale.y = -1; // 解决图像颠倒渲染问题
titleGroup.position.y = 35; // 离中心点的位置
function setTitleGroup() {
  const loader = new SVGLoader();
  loader.load(
    "/images/juejin.svg",
    (data) => {
      const paths = data.paths;
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];

        const material = new THREE.MeshLambertMaterial({
          color: path.color, // svg本身颜色
          // color: 0x006CBE, //自定义颜色
          side: THREE.DoubleSide,
          depthWrite: false,
        });

        // const shapes = SVGLoader.createShapes(path);
        const shapes = path.toShapes(true);

        for (let j = 0; j < shapes.length; j++) {
          const shape = shapes[j];
          // const geometry = new THREE.ShapeGeometry(shape); // 二维svg
          var extrudeSettings = {
            steps: 1, // 用于沿着挤出样条的深度细分的点的数量，默认值为1
            depth: 5, // 挤出形状的深度，默认值为1
            bevelEnabled: false, // 是否在侧面添加斜角， 默认值为true
          };
          const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings); // 三维svg
          const mesh = new THREE.Mesh(geometry, material);
          titleGroup.add(mesh);
        }
      }
      setCenter(titleGroup);
      scene?.add(titleGroup);
      render();
    },
    // called when loading is in progresses
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function (error) {
      console.log("An error happened", error);
    }
  );
}

// 设置位置居中
function setCenter(group) {
  const box = new THREE.Box3();
  //通过传入的object3D对象来返回当前模型的最小大小，值可以使一个mesh也可以使group
  box.expandByObject(group);

  const mdlen = box.max.x - box.min.x;
  const mdwid = box.max.z - box.min.z;
  const mdhei = box.max.y - box.min.y;
  const x1 = box.min.x + mdlen / 2;
  const y1 = box.min.y + mdhei / 2;
  const z1 = box.min.z + mdwid / 2;

  group.position.set(-x1, -y1, -z1);
}

// 模型点击事件
// 创建射线检测器
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var intersects, selectedObj;
// 添加鼠标事件监听器
// container!.addEventListener("mousedown", onDocumentMouseDown, false);

function onDocumentMouseDown(event) {
  event.preventDefault();

  // 计算鼠标在canvas中的坐标
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // 把鼠标坐标转换为three.js中的坐标
  raycaster.setFromCamera(mouse, camera!);

  // 计算射线和立方体的交点
  intersects = raycaster.intersectObjects(titleGroup.children);
  // 处理点击事件,拾取物体数大于0时
  if (intersects.length > 0) {
    // console.log(intersects);
    if (selectedObj != intersects[0].object) {
      //鼠标的变换
      document.body.style.cursor = "pointer";
      if (selectedObj)
        selectedObj.material.color.setHex(selectedObj.currentHex);
      selectedObj = intersects[0].object;
      selectedObj.currentHex = selectedObj.material.color.getHex(); // 记录当前选择的颜色
      // 改变物体的颜色（红色）
      selectedObj.material.color.set(0xff0000);
    }
  } else {
    document.body.style.cursor = "auto";
    if (selectedObj) selectedObj.material.color.set(selectedObj.currentHex); //恢复选择前的默认颜色
    selectedObj = null;
  }
  render();
}

// 更新场景render
function render() {
  renderer!.render(scene!, camera!);
}

onMounted(() => {
  if (!hero_logo.value) {
    return;
  }

  const hero = hero_logo.value;
  container = hero;
  init();
});

const handleHeroLogoResize = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  console.log(width, height);
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
