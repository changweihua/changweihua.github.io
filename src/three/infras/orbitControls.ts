import { Camera } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function orbitControls(
  camera: Camera,
  container: HTMLDivElement
) {
  const controls = new OrbitControls(camera, container);
  controls.enableDamping = true;
  controls.update();
}
