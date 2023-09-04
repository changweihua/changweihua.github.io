import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";

export default function createMesh(color) {
  const geometry = new BoxGeometry(1, 1, 1);
  const material = new MeshBasicMaterial({ color });
  const cube = new Mesh(geometry, material);
  return cube
}
