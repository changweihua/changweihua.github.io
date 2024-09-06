import { BoxGeometry, LatheGeometry, Mesh, MeshBasicMaterial, TextureLoader, Vector2 } from "three"
//@ts-ignore
import wall from "/public/images/wall1.webp"
//@ts-ignore
import glass_wall from "/public/images/glass_wall.webp"
//@ts-ignore
import line from  "/public/images/line1.webp"
//@ts-ignore
import top from  "/public/images/top.webp"


const textloader = new TextureLoader()
const geometry = new BoxGeometry(200,30,80)
const materials = [
  new MeshBasicMaterial({
    map: textloader.load(glass_wall)
  }),
  new MeshBasicMaterial({
    map: textloader.load(glass_wall)
  }),
  new MeshBasicMaterial({
    map: textloader.load(glass_wall)
  }),
  new MeshBasicMaterial({
    map: textloader.load(glass_wall)
  }),
  new MeshBasicMaterial({
    map: textloader.load(top)
  }),
  new MeshBasicMaterial({
    map: textloader.load(wall)
  }),
]

const building = new Mesh(geometry, materials)

export default building


// 创建顶点集合
const points = [];
for (let i = 0; i < 1; i += 0.1) {
 // 画曲线
  const x = (Math.sin(i * Math.PI * 1.8 + 3) + 1) / 5 + 0.02;
  points.push(new Vector2(x, i));
}
const tower = new LatheGeometry(points, 32, 0, Math.PI);

export {
  tower
}
