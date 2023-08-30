import { PerspectiveCamera } from "three";

const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 5);

export function useCamera(
  fov: number,
  aspect: number,
  near: number,
  far: number
) {
  const camera = new PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 0, 5);

  return camera;
}

export default camera;
