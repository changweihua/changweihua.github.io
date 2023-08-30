<script setup lang="ts">
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
// 导入动画库
import gsap from "gsap";
// @ts-ignore
import Stats from "../three/jsm/libs/stats.module.js";
// 导入轨道控制器
// @ts-ignore
import { OrbitControls } from "../three/jsm/controls/OrbitControls.js";
// @ts-ignore
import { OBJLoader } from "../three/jsm/loaders/OBJLoader.js";
// @ts-ignore
import { MTLLoader } from "../three/jsm/loaders/MTLLoader.js";
// @ts-ignore
import { FBXLoader } from "../three/jsm/loaders/FBXLoader.js";
import { onMounted, onUnmounted, ref } from "vue";

import "default-passive-events";

const heroRef = ref<HTMLDivElement>();
const percent = ref(0);
const loading = ref(true);

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

function fitOnScreen(bldg: any, camera: any) {
  const box = new THREE.Box3().setFromObject(bldg);
  const boxSize = box.getSize(new THREE.Vector3()).length();
  const boxCenter = box.getCenter(new THREE.Vector3());

  frameArea(boxSize * 1.5, boxSize, boxCenter, camera);

  controls.maxDistance = boxSize * 10;
  controls.target.copy(boxCenter);
  controls.update();
}

function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
  const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
  const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
  const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

  const direction = new THREE.Vector3()
    .subVectors(camera.position, boxCenter)
    .multiply(new THREE.Vector3(1, 0, 1))
    .normalize();

  camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

  camera.near = boxSize / 100;
  camera.far = boxSize * 100;
  const fov = camera.fov * (Math.PI / 180);
  const cameraZ = boxSize / 2 / Math.tan(fov / 2);
  camera.position.z = cameraZ;
  camera.up.set(0, 0, 1);
  camera.updateProjectionMatrix();
  camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);

  // camera.lookAt(0, 0, 0);
}

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

  const ambient = new THREE.AmbientLight(0xfffddf);
  scene.add(ambient);

  const fov = 40; // 视野范围
  const aspect = width / height; // 相机默认值 画布的宽高比
  const near = 0.1; // 近平面
  const far = 10000; // 远平面
  // 透视投影相机
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);
  camera.lookAt(0, 0, 1);
  camera.up.set(0, 0, 1);
  scene.add(camera);

  const cameraHelper = new THREE.CameraHelper(camera);
  scene.add(cameraHelper);

  // 初始化渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: true,
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
  // controls.autoRotate = true;
  // controls.autoRotateSpeed = 14;
  // controls.dampingFactor = 0.5;

  // 添加坐标轴辅助器
  // 6. 显示坐标轴(x轴: 红色; y轴: 绿色; z轴: 蓝色 rgb)
  // x轴水平方向(右正); y轴垂直方向(上正); z轴垂直xy平面即屏幕(外正)
  const axesHelper = new THREE.AxesHelper(2500);
  scene.add(axesHelper);

  // let light = new THREE.PointLight();
  // camera.add(light);

  const light = new THREE.DirectionalLight(0xfffddf); //光源颜色
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

  var pointColor = "#ffffff";
  var spotLight = new THREE.SpotLight(pointColor);
  spotLight.position.set(-40, 60, -10); //设置光源的位置
  spotLight.castShadow = true; //开启阴影效果
  // spotLight.shadowCameraNear = 2; // 投影近点，距离光源多近能产生阴影
  // spotLight.shadowCameraFar = 200; //投影远点，到哪一点为止不再产生阴影
  // spotLight.shadowCameraFov = 30; //投影视场，聚光的角度大小
  // spotLight.target = plane; //光照的方向。 plane： 地面
  spotLight.distance = 0; //光照距离，默认为0.
  spotLight.angle = 0.4; //光源发射的宽度（弧度）

  scene.add(spotLight);

  camera.lookAt(scene.position); //设置相机方向(指向的场景对象)

  let airPlane: any = null;

  // 相机移动动画
  function initTween(targetX, targetY, targetZ) {
    // 获取当前相机位置
    let initPosition = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    };
    //定义相机移动方法
    let tween = new TWEEN.Tween(initPosition)
      .to({ x: targetX, y: targetY, z: targetZ }, 2000)
      .easing(TWEEN.Easing.Sinusoidal.InOut);
    //格子位置参数
    let onUpdate = (pos) => {
      let x = pos.x;
      let y = pos.y;
      let z = pos.z;
      //z<0为背面格子，z>0为正面格子，并设置相机的位置
      if (pos.z < 0) {
        camera.position.set(x, y, z - 12);
      } else {
        camera.position.set(x, y, z + 12);
      }
    };
    //调用相机方法并传入格子位置参数
    tween.onUpdate(onUpdate);
    tween.start();
    //设置相机target位置（相机看向格子的位置）
    if (airPlane.position.z < 0) {
      controls.target.set(airPlane.position.x, airPlane.position.y - 0.4, -12);
    } else {
      controls.target.set(airPlane.position.x, airPlane.position.y - 0.4, 12);
    }
  }

  // 模型角度变化函数
  function animateCamera(oldP, oldC, newP, newC, e) {
    let _this = this;
    var p1 = {
      x1: oldP.x,
      y1: oldP.y,
      z1: oldP.z,
      x2: oldC.x,
      y2: oldC.y,
      z2: oldC.z,
    };
    var p2 = {
      x1: newP.x,
      y1: newP.y,
      z1: newP.z,
      x2: newC.x,
      y2: newC.y,
      z2: newC.z,
    };
    var tween = new TWEEN.Tween(p1).to(p2, 1800); //第一段动画
    var update = function (object) {
      camera.position.set(object.x1, object.y1, object.z1);
      _this.controls.target.set(object.x2, object.y2, object.z2);
      camera.lookAt(0, 0, 0); //保证动画执行时，相机焦距在中心点
      _this.controls.enabled = false;
      _this.controls.update();
    };
    tween.onUpdate(update);
    // 动画完成后的执行函数
    tween.onComplete(() => {
      _this.controls.enabled = true; //执行完成后开启控制
    });
    tween.easing(TWEEN.Easing.Quadratic.InOut);
    tween.start();
  }

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
  // const mtlLoader = new MTLLoader();
  // mtlLoader.load(
  //   "/A320/Airbus A320 Airplane 3D model.mtl",
  //   function (materials: any) {
  //     materials.preload();
  //     objLoader.setMaterials(materials);
  //     // 加载obj
  //     objLoader.load(
  //       "/A320/Airbus A320 Airplane 3D model.obj",
  //       function (gltf: any) {
  //         // // 模型文件太大，缩小一下比例，方便显示
  //         // gltf.scale.set(0.1, 0.1, 0.1);
  //         // // 设置可以投影
  //         // gltf.children.forEach((item: any) => {
  //         //   item.castShadow = true;
  //         //   item.receiveShadow = true;
  //         // });

  //         fitOnScreen(gltf, camera);

  //         airPlane = gltf;
  //         // 添加到场景
  //         scene!.add(gltf);
  //         // scene!.add(gltf.scene);
  //         // 模型加载完,进行相机的初始化,传入设置的参数,模型加载为异步
  //         // cameraReset(cameraPosition, cameraLookat);

  //         // // 设置平面角度和位置
  //         // gltf.rotation.x = -0.5 * Math.PI;
  //         // gltf.position.x = 0;
  //         // gltf.position.y = 0;
  //         // gltf.position.z = 0;
  //       }
  //     );
  //   }
  // );

  // const mtlLoader = new MTLLoader();
  // mtlLoader.load("/ssj/SSJ100.mtl", function (materials: any) {
  //   materials.preload();
  //   objLoader.setMaterials(materials);
  //   // 加载obj
  //   objLoader.load("/ssj/SSJ100.obj", function (gltf: any) {
  //     fitOnScreen(gltf, camera);

  //     // const box3_2 = new THREE.Box3().setFromObject(gltf); //新建一个Box3包裹盒把模型包裹起来
  //     // const boxSize = box3_2.getSize(new THREE.Vector3()).length(); //综合计算出模型的长度值，利用它设置相机位置
  //     // const boxCenter = box3_2.getCenter(new THREE.Vector3());
  //     // const fov = camera.fov * (Math.PI / 180);
  //     // const cameraZ = boxSize / 2 / Math.tan(fov / 2);
  //     // camera.position.z = cameraZ;
  //     // camera.lookAt(boxCenter);

  //     // 设置平面角度和位置
  //     // gltf.rotation.x = -0.5 * Math.PI;
  //     // gltf.position.x = 0;
  //     // gltf.position.y = 1 * Math.PI;
  //     // gltf.position.x = 2 * Math.PI;

  //     // gltf.rotation.x = 0.5 * Math.PI;
  //     gltf.rotation.y = 0.5 * Math.PI;

  //     // 添加包围盒的辅助对象
  //     const boxHelper = new THREE.BoxHelper(gltf, 0xffff00);
  //     scene.add(boxHelper);

  //     airPlane = gltf;
  //     // 添加到场景
  //     scene!.add(gltf);
  //   });
  // });

  // // 非位置音频可用于不考虑位置的背景音乐
  // // 创建一个监听者
  // var listener = new THREE.AudioListener();
  // // camera.add( listener );
  // // 创建一个非位置音频对象  用来控制播放
  // var audio = new THREE.Audio(listener);
  // // 创建一个音频加载器对象
  // var audioLoader = new THREE.AudioLoader();
  // // 加载音频文件，返回一个音频缓冲区对象作为回调函数参数
  // audioLoader.load("/sounds/engine.mp3", function (AudioBuffer) {
  //   // console.log(AudioBuffer)
  //   // 音频缓冲区对象关联到音频对象audio
  //   audio.setBuffer(AudioBuffer);
  //   audio.setLoop(true); //是否循环
  //   audio.setVolume(0.5); //音量
  //   // 播放缓冲区中的音频数据
  //   audio.play(); //play播放、stop停止、pause暂停
  // });

  const geometry = new THREE.BoxGeometry(10, 10, 10);
  const material = new THREE.MeshLambertMaterial({
    color: 0x0000ff,
  }); //材质对象Material
  // 用来定位音源的网格模型
  var audioMesh = new THREE.Mesh(geometry, material);
  // 设置网格模型的位置，相当于设置音源的位置
  audioMesh.position.set(0, 0, 300);
  scene.add(audioMesh);

  // 创建一个虚拟的监听者
  var listener = new THREE.AudioListener();
  // 监听者绑定到相机对象
  camera.add(listener);
  // 创建一个位置音频对象,监听者作为参数,音频和监听者关联。
  var PosAudio = new THREE.PositionalAudio(listener);
  //音源绑定到一个网格模型上
  audioMesh.add(PosAudio);
  // 创建一个音频加载器
  var audioLoader = new THREE.AudioLoader();
  // 加载音频文件，返回一个音频缓冲区对象作为回调函数参数
  audioLoader.load("/sounds/engine.mp3", function (AudioBuffer) {
    // console.log(buffer);
    // 音频缓冲区对象关联到音频对象audio
    PosAudio.setBuffer(AudioBuffer);
    PosAudio.setVolume(0.9); //音量
    PosAudio.setLoop(false); //是否循环
    PosAudio.setRefDistance(200); //参数值越大,声音越大
    PosAudio.play(); //播放
  });

  const mtlLoader = new MTLLoader();
  // let manager = new THREE.LoadingManager();
  //   manager.addHandler(/\.tga$/i, new TGALoader());
  const fbxLoader = new FBXLoader();
  mtlLoader.load(
    "/A320/Airbus A320 Airplane 3D model.mtl",
    function (materials: any) {
      materials.preload();
      objLoader.setMaterials(materials);
      // 加载obj
      objLoader.load(
        "/A320/Airbus A320 Airplane 3D model.obj",
        function (gltf: any) {
          fitOnScreen(gltf, camera);

          airPlane = gltf;
          // 添加到场景
          scene!.add(gltf);

          // 设置平面角度和位置
          // gltf.rotation.x = -0.5 * Math.PI;
          // gltf.position.x = 0;
          // gltf.position.y = 1 * Math.PI;
          // gltf.position.x = 2 * Math.PI;

          // initTween(2000, airPlane.position.y, airPlane.position.z);

          gltf.rotation.x = 0.5 * Math.PI;
          gltf.rotation.y = -0.5 * Math.PI;
        },
        (xhr: any) => {
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");

          percent.value = Math.floor((xhr.loaded / xhr.total) * 100);
          if (percent.value === 100) {
            loading.value = false;
          }
        },
        (error: any) => {
          console.log("An error happened", error);
        }
      );
      // fbxLoader.load("/A320/Airbus A320 Airplane 3D model.fbx", (gltf) => {
      //   console.log(gltf, "object");
      //   gltf.name = "person";
      //   fitOnScreen(gltf, camera);

      //   airPlane = gltf;
      //   // 添加到场景
      //   scene!.add(gltf);
      // });
    }
  );

  // 渲染循环
  let angle = 0; //用于圆周运动计算的角度值
  const R = 10; //相机圆周运动的半径

  function render() {
    TWEEN.update();
    controls.update();
    renderer!.render(scene!, camera);
    // 更新性能控件
    stats.update();
    if (airPlane) {
      angle += 0.01; // 相机y坐标不变，在XOZ平面上做圆周运动
      // airPlane.rotation.x = R * Math.cos(angle);
      // airPlane.rotation.y = R * Math.sin(angle);
      // airPlane.rotation.z = R * Math.sin(angle);
      // .position改变，重新执行lookAt(0,0,0)计算相机视线方向
      // camera.lookAt(0, 0, 0);
      airPlane.position.x += 2;
      if (airPlane.position.x > 2000) {
        airPlane.position.x = 10;
      }
      audioMesh.position.set(
        airPlane.position.x,
        airPlane.position.y,
        airPlane.position.z
      );
    }
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

// // const progressBar = document.querySelector('#progress-bar');
// // import MyWorker from "../../three/workers/model-loader-worker.js"
// const myWorker = new Worker("../../three/workers/model-loader-worker.ts");

// myWorker.onmessage = function (e) {
//   if (e.data.type === "model") {
//     const model = e.data.data;
//     // 将模型添加到场景中
//     // scene.add(model);

//     // 隐藏加载进度条
//     // progressBar.hidden = true;
//   }
// };

// myWorker.postMessage({
//   type: "load",
//   url: "/ssj/SSJ100.obj",
// });

// function updateProgress(percentComplete) {
//   // 更新加载进度条
//   console.log(percentComplete + "%");
//   // progressBar.style.width = percentComplete + '%';
// }

// myWorker.addEventListener("message", function (e) {
//   if (e.data.type === "progress") {
//     const percentComplete = e.data.data;
//     updateProgress(percentComplete);
//   }
// });
</script>

<template>
  <div v-resize="handleHeroResize" ref="heroRef" id="heroRef">
    <div
      v-if="loading"
      class="flex w-full h-full items-center justify-center"
    >
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
#heroRef {
  width: 600px;
  height: 600px;
}
</style>
