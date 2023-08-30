import {
  AmbientLight,
  Box3,
  Box3Helper,
  BoxHelper,
  Camera,
  DirectionalLight,
  Group,
  MathUtils,
  Matrix4,
  Mesh,
  PerspectiveCamera,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
// @ts-ignore
import { OrbitControls } from "../jsm/controls/OrbitControls.js";
import axesHelper from "./axesHelper";
import orbitControls from "./orbitControls.js";

class ThreeRenderer {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls?: OrbitControls;

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
    // this.camera.lookAt(0, 0, 1);
    // this.camera.up.set(0, 0, 1);
    // this.camera.position.set(0, 0, 8);
    // // camera.position.set(30, 60, 80);
    // camera.lookAt(new THREE.Vector3(0, 0, 0));
    // // camera.up.set(0, 1, 0);

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
      antialias: true,
      logarithmicDepthBuffer: true,
      alpha: true, //开启alpha
    });
    this.renderer.setClearColor(0x95e4e8);
    // this.renderer.setClearColor(0xb9d3ff, 0); //设置背景颜色
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;

    container.appendChild(this.renderer.domElement);

    this.camera.lookAt(this.scene.position);
  }

  render(callback?: () => void) {
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

  //适合模型观察的缩放比例
  setScaleToFitSize(obj) {
    const boxHelper = new BoxHelper(obj);
    boxHelper.geometry.computeBoundingBox();
    const box = boxHelper.geometry.boundingBox;
    const maxDiameter = Math.max(
      box.max.x - box.min.x,
      box.max.y - box.min.y,
      box.max.z - box.min.z
    );
    const scaleValue = this.camera.position.z / maxDiameter;
    obj.scale.set(scaleValue, scaleValue, scaleValue);
  }

  fitOnScreen(obj: any, camera: any) {
    const box = new Box3().setFromObject(obj);
    const boxSize = box.getSize(new Vector3()).length();
    const boxCenter = box.getCenter(new Vector3());

    this.frameArea(boxSize * 1.5, boxSize, boxCenter, camera);

    if (this.controls) {
      this.controls.maxDistance = boxSize * 10;
      this.controls.target.copy(boxCenter);
      this.controls.update();
    }
  }

  frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = MathUtils.degToRad(camera.fov * 0.5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

    const direction = new Vector3()
      .subVectors(camera.position, boxCenter)
      .multiply(new Vector3(1, 0, 1))
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
  }
}

export default ThreeRenderer;
