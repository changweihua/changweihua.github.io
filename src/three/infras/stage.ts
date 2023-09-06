import {
  AmbientLight,
  AudioListener,
  Box3,
  BoxHelper,
  BufferGeometry,
  CatmullRomCurve3,
  DirectionalLight,
  GridHelper,
  Group,
  Line,
  LineBasicMaterial,
  MOUSE,
  MathUtils,
  Mesh,
  Object3D,
  PerspectiveCamera,
  PointLight,
  Raycaster,
  SRGBColorSpace,
  Scene,
  SplineCurve,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import TWEEN from "@tweenjs/tween.js";
import { OrbitControls } from "../../../threejs/jsm/controls/OrbitControls";
import { GUI } from "../../../threejs/jsm/libs/lil-gui.module.min";
// 引入Stats性能监视器
import Stats from "../../../threejs/jsm/libs/stats.module";
import axesHelper from "./axesHelper";
//导入TweenMax动画控件
import gsap, { Expo } from "gsap";

const enum StageMode {
  TWO,
  THREE,
}

class Stage implements VueThree.IStage {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls: OrbitControls;
  gridHelper: GridHelper;
  objects: Array<Object3D>;
  container: HTMLDivElement | null;
  width: number;
  height: number;
  mode: StageMode = StageMode.THREE;

  cameraConfig: VueThree.ICameraConfig;

  gui = new GUI({ width: 310 });
  // 创建stats对象
  stats = new Stats();

  constructor(container: HTMLDivElement | null, fov = 45, near = 1, far = 100) {
    this.container = container;
    let width = window.innerWidth;
    let height = window.innerHeight;

    if (container) {
      console.log("container is HTMLDivElement");
      width = container.offsetWidth;
      height = container.offsetHeight;
    }

    this.scene = new Scene();

    this.width = width;
    this.height = height;
    this.cameraConfig = {
      aspect: width / height,
      fov: fov,
      near: near,
      far: far,
      viewX: 0,
      viewY: 0,
      viewZ: far * 0.8,
      rotationY: 0,
    };

    this.camera = new PerspectiveCamera(
      this.cameraConfig.fov,
      this.cameraConfig.aspect,
      this.cameraConfig.near,
      this.cameraConfig.far
    );
    // .multiplyScalar() 矩阵的每个元素乘以参数。
    // camera.position.set(-20, 20, 80).multiplyScalar(3);
    this.camera.position.set(
      this.cameraConfig.viewX,
      this.cameraConfig.viewY,
      this.cameraConfig.viewZ
    );
    // this.camera.lookAt(this.scene.position);
    this.camera.lookAt(0, 0, 0);
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
    const ambient = new AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient); //环境光

    const directionalLight = new DirectionalLight(0xffffff); //平行光
    directionalLight.position.set(0, 1, 1);
    this.scene.add(directionalLight);

    const light = new PointLight(0xffffff, 0.5); //点光源
    light.position.set(0, 0, 0);
    this.scene.add(light);

    this.renderer = new WebGLRenderer({
      antialias: true,
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
    //解决加载gltf格式模型纹理贴图和原图不一样问题
    // 获取你屏幕对应的设备像素比.devicePixelRatio告诉threejs,以免渲染模糊问题
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setClearColor(0xb9d3ff, 0); //设置背景颜色
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    if (!container) {
      document.body.append(this.renderer.domElement);
    } else {
      container.appendChild(this.renderer.domElement);
    }
    // stats.domElement:web 页面上输出计算结果，一个div元素
    document.body.appendChild(this.stats.dom);

    const cameraConfg = {
      fov: this.cameraConfig.fov,
      viewX: this.cameraConfig.viewX,
      viewY: this.cameraConfig.viewY,
      viewZ: this.cameraConfig.viewZ,
      rotationY: this.cameraConfig.rotationY,
    };

    this.gui.add(document, "title");
    const cameraFolder = this.gui.addFolder("相机属性设置");
    cameraFolder
      .add(cameraConfg, "fov", 0, 100)
      .name("修改相机远近")
      .onChange((num: number) => {
        this.camera.fov = num;
        this.camera.updateProjectionMatrix();
      });

    cameraFolder
      .add(cameraConfg, "viewX", -180, 180)
      .name("修改视角-x")
      .onChange((num: number) => {
        cameraConfg.viewX = num;
        this.camera.position.set(
          cameraConfg.viewX,
          cameraConfg.viewY,
          cameraConfg.viewZ
        );
      });
    cameraFolder
      .add(cameraConfg, "viewY", -720, 720)
      .name("修改视角-y")
      .onChange((num: number) => {
        cameraConfg.viewY = num;
        this.camera.position.set(
          cameraConfg.viewX,
          cameraConfg.viewY,
          cameraConfg.viewZ
        );
      });
    cameraFolder
      .add(cameraConfg, "viewZ", 0.1, this.cameraConfig.far)
      .name("修改视角-z")
      .onChange((num: number) => {
        cameraConfg.viewZ = num;
        this.camera.position.set(
          cameraConfg.viewX,
          cameraConfg.viewY,
          cameraConfg.viewZ
        );
      });

    const sceneConfig = {
      rotationY: this.scene.rotation.y,
    };

    const sceneFolder = this.gui.addFolder("Scene属性设置");
    sceneFolder
      .add(this.scene.rotation, "x", -180, 180)
      .name("旋转视角-X")
      .onChange((num: number) => {
        // sceneConfig.rotationY = num;
        // this.scene.rotateY(MathUtils.degToRad(num));
      });
    sceneFolder
      .add(this.scene.rotation, "y", -180, 180)
      .name("旋转视角-Y")
      .onChange((num: number) => {
        // sceneConfig.rotationY = num;
        // this.scene.rotateY(MathUtils.degToRad(num));
      });
    sceneFolder
      .add(this.scene.rotation, "z", -180, 180)
      .name("旋转视角-Z")
      .onChange((num: number) => {
        // sceneConfig.rotationY = num;
        // this.scene.rotateY(MathUtils.degToRad(num));
      });

    const lightFolder = this.gui.addFolder("光线属性设置");
    lightFolder
      .add(ambient, "intensity", 0, 2.0)
      .name("环境光强度")
      .step(0.1)
      .onChange((num: number) => {
        // sceneConfig.rotationY = num;
        // this.scene.rotateY(MathUtils.degToRad(num));
      });

    lightFolder.add(directionalLight, "intensity", 0, 2.0).name("平行光强度");

    // 平行光位置
    lightFolder.add(directionalLight.position, "x", -400, 400);
    lightFolder.add(directionalLight.position, "y", -400, 400);
    lightFolder.add(directionalLight.position, "z", -400, 400);

    this.gui.close();

    //调用生成一次图形
    // this.gui.asGeom();

    // 监听画面变化，更新渲染界面
    window.addEventListener("resize", () => {
      // 更新摄像头
      this.camera.aspect = this.width / this.height;
      // 更新摄像机的投影矩阵
      this.camera.updateProjectionMatrix();
      // 更新渲染器
      this.renderer.setSize(this.width, this.height);
      // 设置渲染器的像素比
      this.renderer.setPixelRatio(window.devicePixelRatio);
    });

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.update();

    this.gridHelper = new GridHelper(1000, 50, 0x0000ff, 0xff8080);
    // helper.setCol
    this.scene.add(this.gridHelper);

    this.init();
    // this.rayClick();
  }

  //光线检测，获取点击物体的坐标值
  rayClick() {
    const raycaster = new Raycaster();
    const mouse = new Vector2();
    const camera = this.camera;
    const scene = this.scene;

    //对页面进行鼠标点击事件绑定
    this.renderer.domElement.addEventListener("mouseup", mouseup);

    //添加点击方法
    function mouseup(e: any) {
      // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // 通过摄像机和鼠标位置更新射线
      //这里的摄像机要将外部定义的摄像机通过新的变量接受到，再次赋值使用，同下方的scene
      raycaster.setFromCamera(mouse, camera);

      // 计算物体和射线的焦点
      const intersects = raycaster.intersectObjects(scene.children);

      console.log(intersects);
      //选中后进行操作
      if (intersects.length) {
        var selected = intersects[0];

        //点击世界中的物体，改变摄像机位置到物体前，实现从远景到近景的切换效果
        gsap.to(camera.position, 2, {
          x: selected.point.x + 50,
          y: selected.point.y,
          z: selected.point.z + 100,
          ease: Expo.easeInOut,
          onComplete: function () {},
        });
        console.log("x坐标" + selected.point.x);
        console.log("y坐标" + selected.point.y);
        console.log("z坐标" + selected.point.z);
      }
    }
  }

  private init() {
    this.scene.rotateY(-0.5 * Math.PI);
    // const that = this
    // this.renderer.domElement.addEventListener('click', function (event) {
    //   // .offsetY、.offsetX以canvas画布左上角为坐标原点,单位px
    //   const px = event.offsetX;
    //   const py = event.offsetY;
    //   //屏幕坐标px、py转WebGL标准设备坐标x、y
    //   //width、height表示canvas画布宽高度
    //   const x = (px / this.width) * 2 - 1;
    //   const y = -(py / this.height) * 2 + 1;
    //   //创建一个射线投射器`Raycaster`
    //   const raycaster = new Raycaster();
    //   //.setFromCamera()计算射线投射器`Raycaster`的射线属性.ray
    //   // 形象点说就是在点击位置创建一条射线，射线穿过的模型代表选中
    //   raycaster.setFromCamera(new Vector2(x, y), that.camera);
    //   //.intersectObjects([mesh1, mesh2, mesh3])对参数中的网格模型对象进行射线交叉计算
    //   // 未选中对象返回空数组[],选中一个对象，数组1个元素，选中两个对象，数组两个元素
    //   const intersects = raycaster.intersectObjects(that.scene.children);//[...that.objects]
    //   console.log("射线器返回的对象", intersects);
    //   // intersects.length大于0说明，说明选中了模型
    //   if (intersects.length > 0) {
    //       // 选中模型的第一个模型，设置为红色
    //       intersects[0].object.material.color.set(0xff0000);
    //   }
    // })
  }

  //更新相机位置
  changeCameraPosition() {
    console.log(this.camera.position);
    //解除滑动限制. 如果你在创建模型的时候设置了滑动平移放大缩小等限制在这里需要解除限制，不然达不到你想要的结果。
    this.controls.minDistance = 0;
    this.controls.maxPolarAngle = Math.PI / 1;
    this.controls.enableRotate = false;
    this.controls.enableZoom = false;
    this.controls.update();
    // 相机从当前位置camera.position飞行三维场景中某个世界坐标附近
    new TWEEN.Tween({
      // 相机开始坐标
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z,
      // 相机开始指向的目标观察点
      tx: 0,
      ty: 0,
      tz: 0,
    })
      .to(
        {
          // 相机结束坐标
          x: 0,
          y: 0,
          z: 0,
          // 相机结束指向的目标观察点
          tx: 0,
          ty: 0,
          tz: 0,
        },
        1000
      )
      // .onUpdate(function (e) {
      // 	//小程序中使用e，H5中使用this，获取结束的位置信息
      // 	// 动态改变相机位置
      // 	this.camera.position.set(this.x, this.y, this.z);
      // 	// 模型中心点
      // 	this.controls.target.set(this.tx, this.ty, this.tz);
      // 	controls.update();//内部会执行.lookAt()
      // })
      .start();
  }

  render(time: number, callback?: (itime: number) => void) {
    TWEEN.update();
    this.stats.update();
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(this.scene.position);
    this.controls.update();
    if (this.mode === StageMode.TWO) {
      this.controls.mouseButtons = {
        //控制器的鼠标事件替换为平移和缩放
        LEFT: MOUSE.PAN,
        MIDDLE: MOUSE.DOLLY,
        RIGHT: MOUSE.PAN,
      };
    } else {
      this.controls.mouseButtons = {
        LEFT: MOUSE.ROTATE,
        MIDDLE: MOUSE.MIDDLE,
        RIGHT: MOUSE.PAN,
      };
    }
    this.renderer.render(this.scene, this.camera);
    callback && callback(time);
    requestAnimationFrame((rtime) => {
      this.render(rtime, callback);
    });
  }

  ChangeControl(mode: StageMode) {
    this.mode = mode;
    if (this.mode === StageMode.TWO) {
      this.tween2D({
        x: 0,
        y: 0,
        z: 0,
      });
    } else {
      this.controls.reset(); //将控制器重置为初始状态，重置平移后的中心点
      this.tween3D({
        x: 20,
        y: 20,
        z: 20,
      });
    }
  }
  tween3D(position: { x: number; y: number; z: number }) {
    //传递任意目标位置，从当前位置运动到目标位置
    if (this.mode === StageMode.THREE) {
      let that = this;
      this.camera.lookAt(new Vector3(0, 0, 0));
      var p1 = {
        //定义相机位置是目标位置到中心点距离的2.2倍
        x: this.camera.position.x / 2.2,
        y: this.camera.position.y - 15,
        z: this.camera.position.z / 2.2,
      };
      var p2 = {
        x: position.x,
        y: position.y,
        z: position.z,
      };
      var tween = new TWEEN.Tween(p1).to(p2, 1200); //第一段动画
      var update = function (object: { x: number; y: number; z: number }) {
        that.camera.position.set(object.x * 2.2, object.y + 15, object.z * 2.2);
        that.camera.lookAt(0, 0, 0); //保证动画执行时，相机焦距在中心点
        that.controls.enabled = false;
        that.controls.update();
      };
      tween.onUpdate(update);
      // 动画完成后的执行函数
      tween.onComplete(() => {
        that.controls.enabled = true; //执行完成后开启控制
      });
      tween.easing(TWEEN.Easing.Quadratic.InOut);
      tween.start();
    }
  }
  tween2D(position: { x: number; y: number; z: number }) {
    //传递平面展示的中心位置，x:0,y:0,z:0。将相机视角切换到中心位置的正上方
    let that = this;
    this.camera.lookAt(new Vector3(0, 0, 0));
    var p1 = {
      x: this.camera.position.x,
      y: this.camera.position.y - 40,
      z: this.camera.position.z,
    };
    var p2 = {
      x: position.x,
      y: position.y,
      z: position.z,
    };
    var tween = new TWEEN.Tween(p1).to(p2, 1200); //第一段动画
    var update = function (object: { x: number; y: number; z: number }) {
      that.camera.position.set(object.x, object.y + 40, object.z);
      that.camera.lookAt(0, 0, 0); //保证动画执行时，相机焦距在中心点
      that.controls.enabled = false; //执行动画时禁止控制
      that.controls.update();
    };
    tween.onUpdate(update);
    // 动画完成后的执行函数
    tween.onComplete(() => {
      that.controls.enabled = true; //执行完成后开启控制
    });
    tween.easing(TWEEN.Easing.Quadratic.InOut);
    tween.start();
  }

  add(obj: any, centered = true) {
    this.objects.push(obj);
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
    this.objects.push(mesh);
  }

  addGroup(group: Group) {
    // this.fitOnScreen(group, this.camera);
    this.scene.add(group);
    this.objects.push(group);
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
    document.body.removeChild(this.stats.dom);
    document.body.removeChild(this.gui.domElement);
    this.gui.destroy();
  }

  /**
   * 添加路径，平面
   */
  addPath2(points: Array<Vector2>) {
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
    splineObject.position.z = 3;
    this.scene.add(splineObject);
    return curve;
  }

  //   //模型对象旋转的函数，每次设置一个坐标轴的变换
  // function rotateAroundWorldAxis(object, axis, radians) {
  //   let rotWorldMatrix = new THREE.Matrix4();
  //   rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
  //      rotWorldMatrix.multiply(object.matrix);
  //   object.matrix = rotWorldMatrix;
  //     object.rotation.setFromRotationMatrix(object.matrix);
  //      }

  //      //调用方式，设置x、y、z轴的旋转
  //      let xAxis = new THREE.Vector3(1, 0, 0);
  //      let yAxis = new THREE.Vector3(0, 1, 0);
  //      let zAxis = new THREE.Vector3(0, 0, 1);
  //      //模型、旋转轴和旋转角度（弧度）
  //      rotateAroundWorldAxis(model, xAxis, Math.PI / 8);

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

    curve.curveType = "catmullrom";
    // curve.closed = true// 设置是否闭环
    curve.tension = 1; // 设置线的张力，0为无弧度折线

    // 为曲线添加材质在场景中显示出来，不显示也不会影响运动轨迹，相当于一个helper
    // 50等分获取曲线点数组
    const curvePoints = curve.getPoints(50);
    //把顶点坐标赋值给几何体
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
