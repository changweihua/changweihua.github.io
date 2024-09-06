<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";

const heroRef = ref<HTMLDivElement>();
const percent = ref(0);
const loading = ref(false);

// 1、创建场景
let scene: THREE.Scene | null = null;
// 2、创建相机
let camera: THREE.PerspectiveCamera | null = null;
// 3、初始化渲染器
let renderer: THREE.WebGLRenderer | null = null;
let controls: OrbitControls | null = null;

const stats = new Stats();

onMounted(() => {
  if (!heroRef.value) {
    return;
  }

  const hero = heroRef.value;
  hero.appendChild(stats.dom);

  const width = hero.offsetWidth; //窗口宽度
  const height = hero.offsetHeight; //窗口高度

  scene = new THREE.Scene();

  const fov = 75; // 视野范围
  const aspect = width / height; // 相机默认值 画布的宽高比
  const near = 0.1; // 近平面
  const far = 100; // 远平面

  // 透视投影相机
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  // camera.position.set(30, 60, 80);
  camera.lookAt(new THREE.Vector3(0, 0, 0))
  // camera.up.set(0, 1, 0);
  scene.add(camera);

  // 初始化渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: true,
    alpha: true, //开启alpha
  });
  // 设置渲染的尺寸大小
  renderer.setSize(width, height);
  renderer.setClearColor(0xb9d3ff, 0); //设置背景颜色

  controls = new OrbitControls(camera, renderer.domElement);

  hero.appendChild(renderer.domElement);

  // 添加坐标轴辅助器
  // 6. 显示坐标轴(x轴: 红色; y轴: 绿色; z轴: 蓝色 rgb)
  // x轴水平方向(右正); y轴垂直方向(上正); z轴垂直xy平面即屏幕(外正)
  const axesHelper = new THREE.AxesHelper(80);
  scene.add(axesHelper);

  //灯光
  scene.add(new THREE.AmbientLight(0xffffff, 0.2)); //环境光
  const dLight = new THREE.DirectionalLight(0xffffff); //平行光
  dLight.position.set(0, 1, 1);
  scene.add(dLight);

  const light = new THREE.PointLight(0xffffff, 0.5); //点光源
  light.position.set(0, 0, 0);
  scene.add(light);

  //地面的长宽
  const groundW = 50;
  const groundH = 10;

  //创建一个地面的父容器
  const groundGroup = new THREE.Group();
  //创建马路容器
  const roadGroup = new THREE.Group();
  //使用平面几何体创建马路，参数为宽高，这里我们创建单位为2，高度为10的马路，也许你会疑问为什么是高度，后面会给予解释，或者你可以直接查看官方文档。搜索PlaneGeometry
  const roadPlaneG = new THREE.PlaneGeometry(2, groundH);
  //定义材质 和 颜色
  const roadPlaneM = new THREE.MeshStandardMaterial({ color: 0x4c4a4b });
  //创建网格 ，用于组织几何体和材质
  const roadPlane = new THREE.Mesh(roadPlaneG, roadPlaneM);

  //这里是左侧长实线
  const leftLine = new THREE.Mesh(
    new THREE.PlaneGeometry(0.05, groundH),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  //设置实线位置
  leftLine.position.z = 0.0001;
  leftLine.position.x = -0.8;

  //克隆出右侧的实线
  const rightLine = leftLine.clone();
  rightLine.position.x = 0.8; //同上

  const dashLineGroup = new THREE.Group();
  let dashNum = 24;
  for (let i = 0; i < dashNum; i++) {
    const m = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const g = new THREE.PlaneGeometry(0.01, 0.3);
    const mesh = new THREE.Mesh(g, m);
    mesh.position.z = 0.0001;
    mesh.position.y = -groundH / 2 + 0.5 * i;
    dashLineGroup.add(mesh);
  }

  roadGroup.add(roadPlane, leftLine, rightLine, dashLineGroup);
  // roadGroup.rotation.x = 0.5 * Math.PI;

  //前景草地
  const frontGrass = new THREE.Mesh(
    new THREE.PlaneGeometry(groundW, groundH / 2),
    new THREE.MeshStandardMaterial({ color: 0x61974b })
  );
  frontGrass.position.z = -0.001;
  frontGrass.position.y = -groundH / 4;
  //后景草地
  const backGrass = new THREE.Mesh(
    new THREE.PlaneGeometry(groundW, groundH / 2),
    new THREE.MeshStandardMaterial({ color: 0xb1d744 })
  );
  backGrass.position.z = -0.001;
  backGrass.position.y = groundH / 4;

  groundGroup.add(roadGroup, frontGrass, backGrass);
  groundGroup.rotation.x = -0.5 * Math.PI
  groundGroup.position.set(0, 0, 0)

  scene.add(groundGroup);

  const treesGroup = new THREE.Group(); //整体树的集合
  const leftTreeGroup = new THREE.Group(); //左边树的集合
  const singTreeGroup = new THREE.Group(); //单个树的集合

  //树的各个部分
  const treeTop = new THREE.Mesh(
    new THREE.ConeGeometry(0.2, 0.2, 10),
    new THREE.MeshStandardMaterial({ color: 0x64a525 })
  );
  const treeMid = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 0.3, 10),
    new THREE.MeshStandardMaterial({ color: 0x64a525 })
  );
  //树干
  const treeBottom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x7a5753 })
  );
  //模拟树的阴影
  const treeShadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.3, 10),
    new THREE.MeshBasicMaterial({ color: 0x3f662d })
  );
  //设置各个部分的位置
  treeTop.position.y = 0.55;
  treeMid.position.y = 0.4;
  //旋转阴影
  treeShadow.rotation.x = -0.5 * Math.PI;
  treeBottom.position.y = 0.2;
  //组合单棵树
  singTreeGroup.add(treeTop, treeMid, treeBottom, treeShadow);
  //设置位置
  singTreeGroup.scale.set(0.5, 0.5, 0.5);

  //生成树的数量
  const treeNum = 50;
  for (let i = 0; i < treeNum; i++) {
    const group = singTreeGroup.clone();
    //z轴，默认为朝向屏幕的那一面
    group.position.z = -groundH + i * 0.5;
    group.position.x = -1.2;
    leftTreeGroup.add(group);
  }
  //右边的树，直接克隆生成
  const rightTreeGroup = leftTreeGroup.clone();
  //设置右边的树的位置
  rightTreeGroup.position.x = 1.2 * 2;
  //将树添加树的集合中
  treesGroup.add(leftTreeGroup, rightTreeGroup);

  //添加到场景中
  scene.add(treesGroup);

  //获取时钟方法
  const clock = new THREE.Clock();
  function animation() {
    const time = clock.getElapsedTime();
    //不停的移动树和虚线的位置，产生一种在行进的感觉，下面计算后会重置位置
    dashLineGroup.position.y = (-time * 1.5) % 3;
    treesGroup.position.z = (time * 1.5) % 3;
    controls?.update();
    camera.updateProjectionMatrix();
    renderer?.render(scene!, camera);
    requestAnimationFrame(animation);
  }

  animation();
});

onUnmounted(() => {
  if (!scene) {
    return;
  }
});

const handleHeroResize = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  console.log(width, height);

  // requestAnimationFrame(function () {
  //   camera?.updateProjectionMatrix();
  //   renderer?.setSize(width, height);
  //   renderer?.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // });
};
</script>

<template>
  <div v-resize="handleHeroResize" ref="heroRef" id="heroRef">
    <div v-if="loading" class="flex w-full h-full items-center justify-center">
      <a-progress type="circle" trail-color="#e6f4ff" :stroke-color="{
        '0%': '#108ee9',
        '100%': '#87d068',
      }" :percent="percent" :stroke-width="20" :size="100" />
    </div>
  </div>
</template>

<style lang="less" scoped>
#heroRef {
  width: 600px;
  height: 300px;
}
</style>
