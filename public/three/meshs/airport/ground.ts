import { Mesh, MeshBasicMaterial,PlaneGeometry,  RepeatWrapping,  TextureLoader } from "three"
//@ts-ignore
import ground from "/images/ground.jpg"

const textloader = new TextureLoader()
const geometry = new PlaneGeometry(400,400)
const texture = textloader.load(ground)
// texture.repeat.set(100,100)
texture.wrapS=RepeatWrapping;//MirroredRepeatWrapping镜像平铺 RepeatWrapping重复平铺
const material = new MeshBasicMaterial({
  map:texture
})

const groundMesh = new Mesh(geometry, material)
// groundMesh.rotation.x = Math.PI * -0.5;
export default groundMesh
