<script setup lang="ts">
import * as THREE from "three";
// 导入轨道控制器
// @ts-ignore
import { OrbitControls } from "../three/jsm/controls/OrbitControls.js";
import { onMounted } from "vue";
import { ref } from "vue";
// 导入动画库
// import gsap from "gsap";
// console.log(THREE);

// 目标：控制3d物体移动

defineProps({
  name: {
    type: String,
    value: "PlaceHolder",
  },
  text: {
    type: String,
  },
  tagline: {
    type: String,
  },
});

const home_hero_3d = ref<HTMLDivElement>();

onMounted(() => {
  if (!home_hero_3d.value) {
    return;
  }

  // 1、创建场景
  const scene = new THREE.Scene();

  const hero = home_hero_3d.value;

  // 2、创建相机
  const camera = new THREE.PerspectiveCamera(
    75,
    hero.offsetWidth / hero.offsetHeight,
    0.1,
    1000
  );

  const radius = 10;
  const radials = 16;
  const circles = 8;
  const divisions = 64;
  const helper = new THREE.PolarGridHelper(radius, radials, circles, divisions);
  scene.add(helper);

  const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper);

  const perspectiveCamera = new THREE.PerspectiveCamera(
    75,
    hero.offsetWidth / hero.offsetHeight,
    0.1,
    1000
  );
  const perspectiveHelper = new THREE.CameraHelper(perspectiveCamera);
  scene.add(perspectiveHelper);

  // const hemisphereLight = new THREE.HemisphereLight(0x0000ff, 0xff0000, 0.6);
  // scene.add(hemisphereLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  const directionalLightHelper = new THREE.DirectionalLightHelper(
    directionalLight,
    5
  );
  scene.add(directionalLightHelper);

  // 设置相机位置
  camera.position.set(0, 0, 10);
  scene.add(camera);

  // 添加物体
  // 创建几何体
  const cubeGeometry = new THREE.CylinderGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    specular: 0xffffff,
    shininess: 30,
  });
  // const material = new THREE.MeshStandardMaterial({ color: 0xff0000, metalness: 0.5, roughness: 0.5 });
  // const material = new THREE.MeshLambertMaterial({ color: 0xffff00 });

  //   const vertexShader = `
  //   varying vec3 vWorldPosition;
  //   void main() {
  //     vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  //     vWorldPosition = worldPosition.xyz;
  //     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  //   }
  // `;
  //   const fragmentShader = `
  //   varying vec3 vWorldPosition;
  //   void main() {
  //     vec3 color = vec3(vWorldPosition.x, vWorldPosition.y, vWorldPosition.z);
  //     gl_FragColor = vec4(color, 1.0);
  //   }
  // `;
  //   const material = new THREE.ShaderMaterial({
  //     vertexShader: vertexShader,
  //     fragmentShader: fragmentShader,
  //   });

  // 根据几何体和材质创建物体
  const cube = new THREE.Mesh(cubeGeometry, material);

  // 修改物体的位置
  // cube.position.set(5, 0, 0);
  // cube.position.x = 3;

  // 修改物体的位置
  // cube.position.set(5, 0, 0);
  // cube.position.x = 3;
  // 缩放
  // cube.scale.set(3, 2, 1);
  // cube.scale.x = 5;
  // 旋转
  cube.rotation.set(Math.PI / 4, 0, 0, "XZY");

  // 将几何体添加到场景中
  scene.add(cube);

  // THREE.Geometry will be removed from core with r125
  // // 创建一个空的几何体对象
  // const geometry = THREE.Geometry();
  // // 定义三个顶点
  // const v1 = new THREE.Vector3(0, 0, 0);
  // const v2 = new THREE.Vector3(1, 0, 0);
  // const v3 = new THREE.Vector3(0, 1, 0);
  // // 将顶点添加到几何体中
  // geometry.vertices.push(v1);
  // geometry.vertices.push(v2);
  // geometry.vertices.push(v3);
  // // 创建一个面，使用顶点的索引定义
  // const face = new THREE.Face3(0, 1, 2);
  // // 将面添加到几何体中
  // geometry.faces.push(face);
  // // 更新法线（这对于渲染和光照计算非常重要）
  // geometry.computeFaceNormals();
  // // 创建一个材质
  // const material = new THREE.MeshBasicMaterial({
  //   color: 0xff0000,
  //   side: THREE.DoubleSide,
  // });
  // // 创建一个网格对象
  // const triangle = new THREE.Mesh(geometry, material);
  // // 添加到场景中
  // scene.add(triangle);

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

  // const customShadowTexture = new THREE.TextureLoader().load('/images/texture.jpg');
  // const customShadowMaterial = new THREE.MeshLambertMaterial({ map: customShadowTexture });
  // const customShadowMesh = new THREE.Mesh(cubeGeometry, customShadowMaterial);
  // scene.add(customShadowMesh);

  // 初始化渲染器
  const renderer = new THREE.WebGLRenderer();
  // 设置渲染的尺寸大小
  renderer.setSize(hero.offsetWidth, hero.offsetHeight);
  renderer.shadowMap.type = THREE.PCFShadowMap;

  // console.log(renderer);
  // 将webgl渲染的canvas内容添加到body
  hero.appendChild(renderer.domElement);

  // // 使用渲染器，通过相机将场景渲染进来
  // renderer.render(scene, camera);

  // 创建轨道控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  // 设置控制器阻尼，让控制器更有真实效果,必须在动画循环里调用.update()。
  controls.enableDamping = true;

  // // 如果OrbitControls改变了相机参数，重新调用渲染器渲染三维场景
  // controls.addEventListener("change", function () {
  //   renderer.render(scene, camera); //执行渲染操作
  //   console.log("camera.position", camera.position);
  // }); //监听鼠标、键盘事件
  // //相关限制方法：
  // controls.enablePan = false; //禁止平移
  // controls.enableZoom = false; //禁止缩放
  // controls.enableRotate = false; //禁止旋转
  // // 缩放范围
  // controls.minZoom = 0.5;
  // controls.maxZoom = 2;
  // // 上下旋转范围
  // controls.minPolarAngle = 0;
  // controls.maxPolarAngle = Math.PI / 2;
  // // 左右旋转范围
  // controls.minAzimuthAngle = -Math.PI / 2;
  // controls.maxAzimuthAngle = Math.PI / 2;

  // 添加坐标轴辅助器
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  // 设置时钟
  // const clock = new THREE.Clock();

  // window.addEventListener("dblclick", () => {
  //   const fullScreenElement = document.fullscreenElement;
  //   if (!fullScreenElement) {
  //     //   双击控制屏幕进入全屏，退出全屏
  //     // 让画布对象全屏
  //     renderer.domElement.requestFullscreen();
  //   } else {
  //     //   退出全屏，使用document对象
  //     document.exitFullscreen();
  //   }
  //   //   console.log(fullScreenElement);
  // });

  // 渲染循环
  let angle = 0; //用于圆周运动计算的角度值
  const R = 10; //相机圆周运动的半径

  function render() {
    // 获取时钟运行的总时长
    // let time = clock.getElapsedTime();
    // console.log("时钟运行总时长：", time);
    //   let deltaTime = clock.getDelta();
    //     console.log("两次获取时间的间隔时间：", deltaTime);
    // let t = time % 5;
    // cube.position.x = t * 1;
    // cube.rotation.x = t * 1;
    // if (cube.position.x > 5) {
    //   cube.position.x = 0;
    // }

    angle += 0.01; // 相机y坐标不变，在XOZ平面上做圆周运动
    camera.position.x = R * Math.cos(angle);
    camera.position.z = R * Math.sin(angle);
    // .position改变，重新执行lookAt(0,0,0)计算相机视线方向
    camera.lookAt(0, 0, 0);
    controls.update();
    renderer.render(scene, camera);
    //渲染下一帧的时候就会调用render函数
    requestAnimationFrame(render);
  }

  render();

  // // 监听画面变化，更新渲染画面
  // window.addEventListener("resize", () => {
  //   //   console.log("画面变化了");
  //   // 更新摄像头
  //   camera.aspect = hero.offsetWidth / hero.offsetHeight;
  //   //   更新摄像机的投影矩阵
  //   camera.updateProjectionMatrix();

  //   //   更新渲染器
  //   renderer.setSize(hero.offsetWidth, hero.offsetHeight);
  //   //   设置渲染器的像素比
  //   renderer.setPixelRatio(window.devicePixelRatio);
  // });
  // const dir = new THREE.Vector3( 1, 2, 0 );

  // //normalize the direction vector (convert to vector of length 1)
  // dir.normalize();

  // const origin = new THREE.Vector3( 0, 0, 0 );
  // const length = 1;
  // const hex = 0xffff00;

  // const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
  // scene.add( arrowHelper )

  // function render() {
  //   cube.position.x += 0.01;
  //   cube.rotation.x += 0.01;
  //   if (cube.position.x > 5) {
  //     cube.position.x = 0;
  //   }
  //   renderer.render(scene, camera);
  //   //   渲染下一帧的时候就会调用render函数
  //   requestAnimationFrame(render);
  // }

  // render();
});
</script>

<template>
  <div ref="home_hero_3d" id="home_hero_3d" class="w-100 h-100"></div>
</template>

<style lang="less" scoped></style>
