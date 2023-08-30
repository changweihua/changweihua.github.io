import { Camera } from "three";
// @ts-ignore
import { OrbitControls } from "../jsm/controls/OrbitControls.js";

export default function orbitControls(
  camera: Camera,
  container: HTMLDivElement
) {
  const controls = new OrbitControls(camera, container);
  controls.enableDamping = true;
  controls.update();
}
