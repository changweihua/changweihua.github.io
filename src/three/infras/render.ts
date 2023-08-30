import camera from "./camera";
import renderer from "./renderer";
import scene from "./scene";

//渲染动画帧
export default function render() {
  renderer.render(scene, camera);
  window.requestAnimationFrame(render);
}

class ThreeRender {
  constructor() {}
}
