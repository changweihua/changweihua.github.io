import {
  AmbientLight,
  Mesh,
  MeshNormalMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

export default class WebLogo {
  scene: Scene | null = null;
  camera: PerspectiveCamera | null = null;
  renderer: WebGLRenderer | null = null;
  ambientLight: AmbientLight | null = null;
  mesh: Mesh | null = null;
  container: HTMLDivElement | null = null;

  constructor(container: HTMLDivElement) {
    this.init(container);
  }

  init(container: HTMLDivElement): void {
    this.container = container;
    // this.setStats();
    this.setScene();
    this.setCamera();
    this.setRenderer();
    this.setCube();
    this.render();
  }

  setScene(): void {
    this.scene = new Scene();
  }

  setCamera(): void {
    if (this.container) {
      // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
      this.camera = new PerspectiveCamera(
        75,
        this.container.offsetWidth / this.container.offsetHeight,
        0.1,
        1000
      );
      this.camera.position.z = 10;
    }
  }

  setRenderer(): void {
    this.renderer = new WebGLRenderer();
    // 设置画布的大小
    this.renderer.setSize(
      this.container?.offsetWidth!,
      this.container?.offsetHeight!
    );
    //这里 其实就是canvas 画布  renderer.domElement
    document.body.appendChild(this.renderer.domElement);
  }

  setLight(): void {
    if (this.scene) {
      this.ambientLight = new AmbientLight(0xffffff); // 环境光
      this.scene.add(this.ambientLight);
    }
  }

  setCube(): void {
    const loader = new FontLoader();
    loader.load("/fonts/JetBrains_Regular.json", (res) => {
      if (this.scene) {
        const font = new TextGeometry("CMONO.NET", {
          font: res,
          size: 0.8,
          height: 0.1,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.1,
          bevelSize: 0.05,
          bevelSegments: 3,
        });
        font.center();
        const material = new MeshNormalMaterial({
          flatShading: true,
          transparent: true,
          opacity: 0.9,
        });
        this.mesh = new Mesh(font, material);
        this.mesh.position.set(0, 0, 0);
        this.scene.add(this.mesh);
      }
    });
  }

  render(): void {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // 动画
  animate(): void {
    if (this.mesh) {
      requestAnimationFrame(this.animate.bind(this));
      this.mesh.rotation.x += 0.01;
      this.mesh.rotation.y += 0.01;
      this.render();
    }
  }
}
