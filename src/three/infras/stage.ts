import {
  AmbientLight,
  AudioListener,
  Box3,
  BoxHelper,
  BufferGeometry,
  CatmullRomCurve3,
  DirectionalLight,
  Group,
  Line,
  LineBasicMaterial,
  MathUtils,
  Mesh,
  Object3D,
  PerspectiveCamera,
  PointLight,
  Scene,
  SplineCurve,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import TWEEN from "@tweenjs/tween.js";
// @ts-ignore
import { OrbitControls } from "../jsm/controls/OrbitControls.js";
// @ts-ignore
import { GUI } from "../jsm/libs/lil-gui.module.min.js";
// 引入Stats性能监视器
// @ts-ignore
import Stats from "../jsm/libs/stats.module";
import axesHelper from "./axesHelper";

class Stage implements VueThree.IStage {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls: OrbitControls;
  objects: Array<Object3D>;
  container: HTMLDivElement | null;
  width: number;
  height: number

  cameraConfig:VueThree.ICameraConfig

  gui = new GUI({ name: "ss", width: 310 });
  // 创建stats对象
  stats = Stats();

  constructor(
    container: HTMLDivElement | null,
    fov = 45,
    near = 1,
    far = 100
  ) {
    this.container = container;
    let width = window.innerWidth;
    let height = window.innerHeight;

    if (container) {
      console.log('container is HTMLDivElement')
      width = container.offsetWidth;
      height = container.offsetHeight;
    }

    this.scene = new Scene();

    this.width = width;
    this.height = height;
    this.cameraConfig = {
      aspect: width / height,
      fov:fov,
      near: near,
      far : far,
viewX:0,
viewY:0,
viewZ:far*0.5
    }

    this.camera = new PerspectiveCamera(
      this.cameraConfig.fov,
      this.cameraConfig.aspect,
      this.cameraConfig.near,
      this.cameraConfig.far
    );
    // .multiplyScalar() 矩阵的每个元素乘以参数。
    // camera.position.set(-20, 20, 80).multiplyScalar(3);
    this.camera.position.set(this.cameraConfig.viewX, this.cameraConfig.viewY, this.cameraConfig.viewZ);
    this.camera.lookAt(this.scene.position);
    //相机拍照你需要控制相机的拍照目标，具体说相机镜头对准哪个物体或说哪个坐标。
    //对于threejs相机而言，就是设置.lookAt()方法的参数，指定一个3D坐标。

    // //相机观察目标指向Threejs 3D空间中某个位置
    // camera.lookAt(0, 0, 0); //坐标原点
    // camera.lookAt(mesh.position);//指向mesh对应的位置
    // 注意：如果OrbitControls有target属性，则相机的lookAt属性就失效了
    // this.camera.lookAt(0, 0, 0);
    // this.camera.up.set(0, 0, 1);
    // this.camera.position.set(0, 0, 8);
    // // camera.position.set(30, 60, 80);
    // camera.lookAt(new THREE.Vector3(0, 0, 0));
    // // camera.up.set(0, 1, 0);
    this.objects = [];

    // 辅助坐标
    this.scene.add(axesHelper(this.cameraConfig.far));
    // 场景添加摄像机
    this.scene.add(this.camera);

    // 绕Y轴旋转180度
    // 使用Math.PI
    // mesh.rotation.set(-Math.PI / 2, 0, Math.PI);
    // 使用MathUtils.degToRad
    // mesh.rotation.set(-THREE.MathUtils.degToRad(90), 0 ,THREE.MathUtils.degToRad(180));

    // 绕X轴逆时针旋转90度
    // this.scene.rotation.set(0,-0.5 * Math.PI,0);

    //灯光
    this.scene.add(new AmbientLight(0xffffff, 0.6)); //环境光
    const dLight = new DirectionalLight(0xffffff); //平行光
    dLight.position.set(0, 1, 1);
    this.scene.add(dLight);

    const light = new PointLight(0xffffff, 0.5); //点光源
    light.position.set(0, 0, 0);
    this.scene.add(light);

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
    // this.renderer.setClearColor(0x95e4e8);
    // this.renderer.setClearColor(0xb9d3ff, 0.4); //设置背景颜色和透明度
    // this.renderer.setClearAlpha(0.0);//完全透明
    this.renderer.setClearColor(0xb9d3ff, 0); //设置背景颜色
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    if(!container) {
      document.body.append(this.renderer.domElement);
    }else{
      container.appendChild(this.renderer.domElement);
    }
    // stats.domElement:web 页面上输出计算结果，一个div元素
    document.body.appendChild(this.stats.domElement);

    const cameraConfg = { fov: this.cameraConfig.fov,viewX: this.cameraConfig.viewX,
      viewY: this.cameraConfig.viewY,
      viewZ: this.cameraConfig.viewZ }

    this.gui.add(document, "title");
    const cameraFolder = this.gui.addFolder("相机属性设置");
  cameraFolder.add(cameraConfg, "fov", 0, 100).name("修改相机远近").onChange((num:number) => {
    this.camera.fov = num;
    this.camera.updateProjectionMatrix();
  });

  cameraFolder.add(cameraConfg, "viewX", -180, 180).name("修改视角-x").onChange((num:number) => {
    cameraConfg.viewX = num;
    this.camera.position.set(cameraConfg.viewX, cameraConfg.viewY, cameraConfg.viewZ);
  });
  cameraFolder.add(cameraConfg, "viewY", -180, 180).name("修改视角-y").onChange((num:number) => {
    cameraConfg.viewY = num;
    this.camera.position.set(cameraConfg.viewX, cameraConfg.viewY, cameraConfg.viewZ);
  });
  cameraFolder.add(cameraConfg, "viewZ", 0.1, this.cameraConfig.far).name("修改视角-z").onChange((num:number) => {
    cameraConfg.viewZ = num;
    this.camera.position.set(cameraConfg.viewX, cameraConfg.viewY, cameraConfg.viewZ);
  });

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

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.update();

    this.init();
  }

  private init() {
    this.scene.rotateY(-0.5 * Math.PI);
  }

  render(time: number, callback?: (itime: number) => void) {
    TWEEN.update();
    this.stats.update();
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(this.scene.position);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    callback && callback(time);
    requestAnimationFrame((rtime) => {
      this.render(rtime, callback);
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

  dispose() {
    this.scene.traverse((e: any) => {
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
    this.scene.remove();
    this.renderer.dispose();
    document.body.removeChild(this.stats.domElement);
    document.body.removeChild(this.gui.domElement);
    this.gui.destroy();
  }

  /**
     * 添加路径，平面
     */
  addPath2(points:Array<Vector2>) {
    // let pointArr = [];
    // // 随机点
    // for (let i = 0; i < 10; i++) {
    //     const point = new Vector2(Math.random() * 20,Math.random() * 20)
    //     pointArr.push(new Vector2(point[0], point[1]));
    // }
    // // 封闭路径
    // pointArr.push(JSON.parse(JSON.stringify(pointArr[0])));
    /**
     * 样条曲线（SplineCurve）
     * 从一系列的点中，创建一个平滑的二维样条曲线。内部使用Interpolations.CatmullRom来创建曲线。
     * SplineCurve( points : Array )
     * points – 定义曲线的Vector2点的数组。
     *
     * 方法
     * .getPoints ( divisions : Integer ) : Array
     * divisions -- 要将曲线划分为的分段数。默认是 5.
     * 使用getPoint（t）返回一组divisions+1的点
     *
     * .getPointAt ( u : Float, optionalTarget : Vector ) : Vector
     * u - 根据弧长在曲线上的位置。必须在范围[0，1]内。
     * optionalTarget — (可选) 如果需要, (可选) 如果需要, 结果将复制到此向量中，否则将创建一个新向量。
     * 根据弧长返回曲线上给定位置的点。
     * @type {SplineCurve}
     */
    const curve = new SplineCurve(points);

    const curvePoints = curve.getPoints(50);
    const geometry = new BufferGeometry().setFromPoints(curvePoints);
    const material = new LineBasicMaterial({ color: 0xffffff });
    const splineObject = new Line(geometry, material);
    // splineObject.rotation.x = Math.PI * 0.5;
    // splineObject.position.y = 0.05;
    splineObject.position.z = 3
    this.scene.add(splineObject);
    return curve;
}

/**
     * 添加路径
     */
addPath3(points: Array<Vector3>) {
  // let max = num;
  // let min = -num;
  // let pointArr = [];
  // // 随机点
  // for (let i = 0; i < 10; i++) {
  //     let point = Pieces.getRandomNumberByCount(3, max, 0, min);
  //     pointArr.push(new THREE.Vector3(point[0], point[1], point[2]));
  // }
  /**
   * CatmullRomCurve3
   * 使用Catmull-Rom算法， 从一系列的点创建一条平滑的三维样条曲线。
   * CatmullRomCurve3( points : Array, closed : Boolean, curveType : String, tension : Float )
   * points – Vector3点数组
   * closed – 该曲线是否闭合，默认值为false。
   * curveType – 曲线的类型，默认值为centripetal。
   * tension – 曲线的张力，默认为0.5。
   * @type {CatmullRomCurve3}
   */
  const curve = new CatmullRomCurve3(points, false);

  const curvePoints = curve.getPoints(50);
  const geometry = new BufferGeometry().setFromPoints(curvePoints);
  const material = new LineBasicMaterial({ color: 0xffffff });
  const splineObject = new Line(geometry, material);
  this.scene.add(splineObject);

  const boxHelper = new BoxHelper(splineObject);
  this.scene.add(boxHelper);

  return curve;
}


}

export default Stage;
