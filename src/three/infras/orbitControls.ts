import { Camera } from "three";
import { OrbitControls } from "../../../threejs/jsm/controls/OrbitControls.js";

export default function orbitControls(
  camera: Camera,
  container: HTMLDivElement
) {
  const controls = new OrbitControls(camera, container);
  controls.enableDamping = true;
  controls.update();
}
