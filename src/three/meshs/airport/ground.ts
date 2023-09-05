import {
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  RepeatWrapping,
  TextureLoader,
} from "three";

const buildGround = function() {

  const textloader = new TextureLoader();
  const geometry = new PlaneGeometry(400, 400);
  const texture = textloader.load("/images/ground.jpg");
  // texture.repeat.set(100,100)
  texture.wrapS = RepeatWrapping; //MirroredRepeatWrapping镜像平铺 RepeatWrapping重复平铺
  const material = new MeshBasicMaterial({
    map: texture,
  });

  const groundMesh = new Mesh(geometry, material);
  // groundMesh.rotation.x = Math.PI * -0.5;

  return groundMesh
}

export {
  buildGround
};
