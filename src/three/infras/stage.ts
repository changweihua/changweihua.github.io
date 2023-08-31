import {
  AmbientLight,
  AudioListener,
  Box3,
  BoxHelper,
  DirectionalLight,
  Group,
  MathUtils,
  Mesh,
  Object3D,
  PerspectiveCamera,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
// import TWEEN from "@tweenjs/tween.js";
// @ts-ignore
import { OrbitControls } from "../jsm/controls/OrbitControls.js";
// @ts-ignore
import { GUI } from "../jsm/libs/lil-gui.module.min.js";
// 引入Stats性能监视器
// @ts-ignore
import Stats from "../jsm/libs/stats.module";
import axesHelper from "./axesHelper";
import orbitControls from "./orbitControls.js";

class Stage implements VueThree.IStage {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls: OrbitControls;
  objects: Array<Object3D>;

  gui = new GUI({ width: 310 });
  // 创建stats对象
  stats = Stats();

  fov = 45; // 视野范围
  aspect = 2; // 相机默认值 画布的宽高比
  near = 1; // 近平面
  far = 100; // 远平面

  constructor(container: HTMLDivElement, fov = 45, near = 1, far = 100) {
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    this.aspect = width / height;
    this.fov = fov;
    this.near = near;
    this.far = far;
    this.camera = new PerspectiveCamera(
      this.fov,
      this.aspect,
      this.near,
      this.far
    );
    this.camera.position.set(0, 0, this.far * 0.8);
    //相机拍照你需要控制相机的拍照目标，具体说相机镜头对准哪个物体或说哪个坐标。
    //对于threejs相机而言，就是设置.lookAt()方法的参数，指定一个3D坐标。

    // //相机观察目标指向Threejs 3D空间中某个位置
    // camera.lookAt(0, 0, 0); //坐标原点
    // camera.lookAt(mesh.position);//指向mesh对应的位置
    // 注意：如果OrbitControls有target属性，则相机的lookAt属性就失效了
    // this.camera.lookAt(0, 0, 1);
    // this.camera.up.set(0, 0, 1);
    // this.camera.position.set(0, 0, 8);
    // // camera.position.set(30, 60, 80);
    // camera.lookAt(new THREE.Vector3(0, 0, 0));
    // // camera.up.set(0, 1, 0);
    this.objects = [];
    this.scene = new Scene();
    // 辅助坐标
    this.scene.add(axesHelper(this.far));
    // 场景添加摄像机
    this.scene.add(this.camera);

    //灯光
    this.scene.add(new AmbientLight(0xffffff, 0.2)); //环境光
    const dLight = new DirectionalLight(0xffffff); //平行光
    dLight.position.set(0, 1, 1);
    this.scene.add(dLight);

    const light = new PointLight(0xffffff, 0.5); //点光源
    light.position.set(0, 0, 0);
    this.scene.add(light);

    this.controls = orbitControls(this.camera, container);

    this.renderer = new WebGLRenderer({
      alpha: true, // true/false 表示是否可以设置背景色透明
      precision: "highp", // highp/mediump/lowp 表示着色精度选择
      premultipliedAlpha: false, // true/false 表示是否可以设置像素深度（用来度量图像的分率）
      //是否保留缓直到手动清除或被覆盖，想把canvas画布上内容下载到本地，需要设置为true
      preserveDrawingBuffer: true, // true/false 表示是否保存绘图缓冲
      stencil: false, // false/true 表示是否使用模板字体或图案
      // 设置对数深度缓冲区，优化深度冲突问题
      logarithmicDepthBuffer: true,
      // //将Canvas绑定到renderer
      // canvas: document.getElementById('three_canvas')
    });
    this.renderer.setClearColor(0x95e4e8);
    // this.renderer.setClearColor(0xb9d3ff, 0.4); //设置背景颜色和透明度
    // this.renderer.setClearAlpha(0.0);//完全透明
    // this.renderer.setClearColor(0xb9d3ff, 0); //设置背景颜色
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;

    container.appendChild(this.renderer.domElement);
    // stats.domElement:web 页面上输出计算结果，一个div元素
    document.body.appendChild(this.stats.domElement);

    this.camera.lookAt(this.scene.position);

    this.gui.add(document, "title");

    // 监听画面变化，更新渲染界面
    window.addEventListener("resize", () => {
      // 更新摄像头
      // this.camera.aspect = window.innerWidth / window.innerHeight
      // 更新摄像机的投影矩阵
      this.camera.updateProjectionMatrix();
      // 更新渲染器
      // this.renderer.setSize(window.innerWidth,window.innerHeight)
      // 设置渲染器的像素比
      this.renderer.setPixelRatio(window.devicePixelRatio);
    });
  }

  render(callback?: () => void) {
    // TWEEN.update();
    this.stats.update();
    this.camera.updateProjectionMatrix();
    this.controls?.update();
    this.renderer.render(this.scene, this.camera);
    callback && callback();
    requestAnimationFrame(() => {
      this.render(callback);
    });
  }

  add(obj: any, centered = true) {
    if (centered) {
      // this.fitOnScreen(obj, this.camera);
      // obj.applyMatrix( new Matrix4().makeTranslation(0, 0,0) );
    }
    this.scene.add(obj);
    // const box = new Box3().setFromObject(obj);
    // const box3Helper = new Box3Helper(box);
    // this.scene.add(box3Helper);
  }

  addAudioListener(listener: AudioListener) {
    this.camera.add(listener);
  }

  addMesh(mesh: Mesh) {
    this.scene.add(mesh);
  }

  addGroup(group: Group) {
    // this.fitOnScreen(group, this.camera);
    this.scene.add(group);
  }

  refresh() {
    // this.camera.lookAt(0, 0, 0);
  }

  /**
   * 相机移动方法
   */
  move(
    origin: {
      x: number;
      y: number;
      z: number;
    },
    target: {
      x: number;
      y: number;
      z: number;
    },
    ticks = 10 * 1000
  ) {
    // 设定相机初始位置
    // var coords = origin;
    // const tween = new TWEEN.Tween(coords)
    //   .to(target, ticks) // 指定目标位置和耗时.
    //   .easing(TWEEN.Easing.Quadratic.Out) // 指定动画效果曲线.
    //   .onUpdate(() => {
    //     console.log("tween onUpdate");
    //     // 渲染时每一帧执行：设定相机位置
    //     // this.camera.position.set(0,0,0);
    //   })
    //   .onComplete(() => {
    //     // 动画结束后执行
    //     console.log("tween onComplete");
    //   })
    //   .start(); // 即刻开启动画
  }

  //适合模型观察的缩放比例
  setScaleToFitSize(obj: Object3D) {
    const boxHelper = new BoxHelper(obj);
    boxHelper.geometry.computeBoundingBox();
    const box = boxHelper.geometry.boundingBox;
    if (box) {
      const maxDiameter = Math.max(
        box.max.x - box.min.x,
        box.max.y - box.min.y,
        box.max.z - box.min.z
      );
      const scaleValue = this.camera.position.z / maxDiameter;
      obj.scale.set(scaleValue, scaleValue, scaleValue);
    }
  }

  fitOnScreen(obj: Object3D) {
    const box = new Box3().setFromObject(obj);
    const boxSize = box.getSize(new Vector3()).length();
    const boxCenter = box.getCenter(new Vector3());

    this.frameArea(boxSize * 1.5, boxSize, boxCenter);

    if (this.controls) {
      this.controls.maxDistance = boxSize * 10;
      this.controls.target.copy(boxCenter);
      this.controls.update();
    }
  }

  frameArea(sizeToFitOnScreen: number, boxSize: number, boxCenter: Vector3) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = MathUtils.degToRad(this.camera.fov * 0.5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

    const direction = new Vector3()
      .subVectors(this.camera.position, boxCenter)
      .multiply(new Vector3(1, 0, 1))
      .normalize();

    this.camera.position.copy(
      direction.multiplyScalar(distance).add(boxCenter)
    );

    this.camera.near = boxSize / 100;
    this.camera.far = boxSize * 100;
    const fov = this.camera.fov * (Math.PI / 180);
    const cameraZ = boxSize / 2 / Math.tan(fov / 2);
    this.camera.position.z = cameraZ;
    this.camera.up.set(0, 0, 1);
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }
}

export default Stage;
