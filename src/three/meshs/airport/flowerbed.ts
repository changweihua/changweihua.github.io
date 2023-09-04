import {
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Shape,
  TextureLoader
} from "three";
//@ts-ignore
import land from "/public/images/land.webp"
//@ts-ignore
import grass from "/public/images/grass.jpg"

// //创建一个自定义的形状
// // x,y,z 是整个Mesh的位置
// // rx ry rz
// // THREE.Line 是 THREE.Mesh
// function addShape(shape, color, x, y, z, rx, ry, rz, s) {
//   //统一绘制，返回所有生成的点
//   var points = shape.createPointsGeometry(25); // 5 表示被切分成 5 段，参数值越大，曲线越光滑

//   var line = new Line(
//     points,
//     new LineBasicMaterial({ color: color })
//   );
//   line.position.set(x, y, z - 25);
//   line.rotation.set(rx, ry, rz);
//   line.scale.set(s, s, s);
//   group.add(line);
// }

// Circle

// var circleRadius = 180;
// var circleShape = new THREE.Shape();
//  circleShape.moveTo( circleRadius ,0);
//  circleShape.quadraticCurveTo( 0, circleRadius, -circleRadius, 0 );
//  // moveTo circleRadius ,0
// // quadraticCurveTo   0, circleRadius, -circleRadius, 0 二次贝塞尔, 调用这两句生成命令

//  addShape( circleShape, 0x00f000,  0,0, 0, 0, 0, 0, 1 );

const flowerBedGroup = new Group();

// const flowerBedPlaneG = new BoxGeometry(40, 25, 10);
// const flowerBedPlaneM = new MeshStandardMaterial({ color: 0x606060 });
// const flowerBedPlane = new Mesh(flowerBedPlaneG, flowerBedPlaneM);

// flowerBedGroup.add(flowerBedPlane);

// function initShapeGeometry() {
//   var shape = new Shape();
//   shape.moveTo(0, 20);
//   shape.bezierCurveTo(0, 10, -18, 0, -25, 0);
//   shape.bezierCurveTo(-55, 0, -55, 35, -55, 35);
//   shape.bezierCurveTo(-55, 55, -35, 77, 0, 95);
//   shape.bezierCurveTo(35, 77, 55, 55, 55, 35);
//   shape.bezierCurveTo(55, 35, 55, 0, 25, 0);
//   shape.bezierCurveTo(18, 0, 0, 10, 0, 20);

//   var geometry = new ShapeGeometry(shape);
//   var material = new MeshBasicMaterial({ color: 0xff0000 });
//   var mesh = new Mesh(geometry, material);
//   flowerBedGroup.add(mesh);
// }

// initShapeGeometry();

// 圆弧与直线连接
var shape = new Shape(); //Shape对象
var R = 10;
// 绘制一个半径为R、圆心坐标(0, 0)的半圆弧
shape.absarc(0, 0, R, 0, Math.PI, false);
//从圆弧的一个端点(-R, 0)到(-R, -200)绘制一条直线
shape.lineTo(-R, -30);
// 绘制一个半径为R、圆心坐标(0, -200)的半圆弧
shape.absarc(0, -30, R, Math.PI, 2 * Math.PI, false);
//从圆弧的一个端点(R, -200)到(-R, -200)绘制一条直线
shape.lineTo(R, 0);

var extrudeSettings = {
  depth: 5,
  bevelEnabled: false,
  steps: 1
};

var geometry = new ExtrudeGeometry(shape, extrudeSettings);
const textloader = new TextureLoader()
const flowerBedPlaneM = new MeshStandardMaterial({
  map: textloader.load(grass)
 });
// var material = new MeshPhongMaterial( {
//   color: 0xffffff, specular: 0x111111, shininess: 200 } )

const flowerBedPlane = new Mesh(geometry, flowerBedPlaneM);

flowerBedGroup.add(flowerBedPlane);
flowerBedGroup.rotation.z = Math.PI / 2
// flowerBedGroup.position.z = -4;
// flowerBedGroup.position.y = 80;
// flowerBedGroup.position.x = 80;


// var wireGeometry = new WireframeGeometry( geometry );
// var wireMaterial = new LineBasicMaterial( { color: 0xffffff } );
// var wireframe = new LineSegments( wireGeometry, wireMaterial );
// flowerBedGroup.add( wireframe );

export default flowerBedGroup;
