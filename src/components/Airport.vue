<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Euler,
  FrontSide,
  Group,
  Line,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Sprite,
  SpriteMaterial,
  Vector3,
} from "three";
import * as THREE from "three";
import gsap from "gsap";
import Stage from "@/three/infras/stage";
import { buildTerminal } from "@/three/meshs/airport/terminal";
import { buildGround } from "@/three/meshs/airport/ground";
import { buildLane } from "@/three/meshs/airport/lane";
import { loadGltfPlane } from "@/three/meshs/airport/plane";
import LabelUtils from "@/three/utils/LabelUtils";

const containerRef = useTemplateRef<HTMLDivElement>('container');
const percent = ref(0);
const loading = ref(true);
let stage: Stage | null = null;
let textMesh: THREE.Mesh | null = null;
let flyPlane: THREE.Object3D | null = null;
let arrivalPlane: THREE.Object3D | null = null;
let nextPlane: THREE.Object3D | null = null;

// 创建运动轨迹
function makeCurve() {
  const curve = new CatmullRomCurve3([
    new Vector3(0, 0, 0),
    new Vector3(0, 0, 10),
    new Vector3(10, 0, 0),
  ]);
  curve.curveType = "catmullrom";
  curve.closed = true; // 设置是否闭环
  curve.tension = 1; // 设置线的张力，0为无弧度折线

  // 为曲线添加材质在场景中显示出来，不显示也不会影响运动轨迹，相当于一个helper
  const points = curve.getPoints(50); // 50等分获取曲线点数组
  const geometry = new BufferGeometry().setFromPoints(points); //把顶点坐标赋值给几何体
  const materail = new LineBasicMaterial({ color: 0x000000 });
  const curveObject = new Line(geometry, materail);
  return [curve, curveObject];
}

// //让模型沿着运动轨迹移动
// moveOnCurve(curve:CatmullRomCurve3, model: Object3D){
//      if(this.curve==null || this.model == null){
//          console.log('loading')
//      }else{
//          if(this.progress <= 1-this.velocity){
//              // 获取样条曲线指定点坐标
//              const point = this.curve.getPointAt(this.progress)
//              const pointBox = this.curve.getPointAt(this.progress + this.velocity)
//              if(point && pointBox){
//                  this.model.position.set(point.x, point.y, point.z)

//                  // 因为模型加载进来默认面部是正对Z轴负方向的，所以直接lookAt会导致出现倒着跑的现象，这里用重新设置朝向的方法来解决
//                  // this.model.lookAt(pointBox.x, pointBox.y, pointBox.z)

//                  let targetPos = pointBox//目标位置点
//                  let offsetAngle = 0//目标移动时的朝向偏移
//                  //以下代码在多段路径时可重复执行
//                  let mtx = new THREE.Matrix4()//创建一个4维矩阵

//                  // .lookAt ( eye : Vector3, target : Vector3, up : Vector3 ) : this,构造一个旋转矩阵，从eye 指向 target，由向量 up 定向。
//                  mtx.lookAt(this.model.position, targetPos, this.model.up)
//                  // .multiply ( m : Matrix4 ) 将当前矩阵乘以矩阵
//                  mtx.multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, offsetAngle, 0,'ZYX')))
//                  // Quaternion 四元数在three.js中用于表示 rotation （旋转）
//                  let toRot = new THREE.Quaternion().setFromRotationMatrix(mtx)//计算出需要进行旋转的四元数值
//                  this.model.quaternion.slerp(toRot, 0.2)
//              }
//              this.progress +=this.velocity
//          }else{
//              this.progress = 0
//          }
//      }
//  }

onMounted(() => {
  if (!containerRef.value) {
    return;
  }
  console.log("开始绘制机场");
  const far = Math.max(
    containerRef.value.offsetWidth,
    containerRef.value.offsetHeight
  );
  stage = new Stage(containerRef.value, 45, 0.1, 0.4 * far);

  const ground = buildGround();
  stage.add(ground);

  const terminal = buildTerminal("T1");
  stage.add(terminal);
  terminal.position.x = 60;
  terminal.position.y = 115;
  terminal.position.z = 5;

  const lane = buildLane();
  stage.addGroup(lane);

  const curve = new CatmullRomCurve3([
    new Vector3(-10, 10, 10),
    new Vector3(-5, 5, 5),
    new Vector3(0, 0, 0),
    new Vector3(5, -5, 5),
    new Vector3(10, 0, 10),
    new Vector3(10, 90, 10),
  ]);

  const geometry1 = new BufferGeometry();
  const vertices1 = new Float32Array(curve.getPoints(50).length * 3);
  geometry1.setAttribute("position", new BufferAttribute(vertices1, 3));
  var line = new Line(
    geometry1.clone(),
    new LineBasicMaterial({
      color: 0xff0000,
      opacity: 0.35,
      linewidth: 2,
    })
  );
  stage.add(line);

  const geometry = new BufferGeometry();
  // create a simple square shape. We duplicate the top left and bottom right
  // vertices because each vertex needs to appear once per triangle.
  const vertices = new Float32Array([
    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0,

    1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0,
  ]);

  // itemSize = 3 because there are 3 values (components) per vertex
  geometry.setAttribute("position", new BufferAttribute(vertices, 3));
  //  geometry.setAttribute( 'color', new THREE.BufferAttribute( vertices, 3 ) );
  //  geometry.setAttribute( 'normal', new THREE.BufferAttribute( vertices, 3 ) );
  const material = new MeshBasicMaterial({ color: 0xff0000 });
  const mesh = new Mesh(geometry, material);

  stage.add(mesh);

  stage.add(makeCurve()[1]);

  // // 创建一个立方体
  // var geometry2 = new BoxGeometry(1, 1, 1);

  // // 设置UV属性
  // geometry2.faceVertexUvs[0][0] = [new Vector2(0,0), new Vector2(0,1), new Vector2(1,1)];
  // geometry.faceVertexUvs[0][1] = [new Vector2(0,0), new Vector2(1,1), new Vector2(1,0)];
  // geometry.faceVertexUvs[0][2] = [new Vector2(0,0), new Vector2(1,0), new Vector2(1,1)];
  // geometry.faceVertexUvs[0][3] = [new Vector2(0,0), new Vector2(0,1), new Vector2(1,1)];
  // geometry.faceVertexUvs[0][4] = [new Vector2(0,0), new Vector2(1,0), new Vector2(1,1)];
  // geometry.faceVertexUvs[0][5] = [new Vector2(0,0), new Vector2(0,1), new Vector2(1,1)];

  // // 设置法向属性
  // geometry.computeVertexNormals();

  // // 创建一个材质和网格
  // var material = new THREE.MeshPhongMaterial({color: 0xffffff});
  // var mesh = new THREE.Mesh(geometry, material);

  // // 添加网格到场景中
  // scene.add(mesh);

  const material2 = new MeshBasicMaterial({
    color: 0x0000ff,
    side: FrontSide, //默认只有正面可见
  });
  const geometry2 = new BufferGeometry();
  //创建顶点数据
  const vertices2 = new Float32Array([
    0,
    0,
    0, //顶点1坐标
    100,
    0,
    0, //顶点2坐标
    0,
    100,
    0, //顶点3坐标
    0,
    0,
    30, //顶点4坐标
    0,
    0,
    100, //顶点5坐标
    60,
    0,
    20, //顶点6坐标
  ]);
  const attribute2 = new BufferAttribute(vertices2, 3);
  geometry2.attributes.position = attribute2;

  // 创建线模型对象
  const line0 = new Line(geometry2, material2);
  // 闭合线条
  const line1 = new LineLoop(geometry2, material2);
  //非连续的线条
  const line2 = new LineSegments(geometry2, material2);
  stage.add(line0);
  stage.add(line1);
  stage.add(line2);

  const planes: Array<THREE.Object3D> = [];

  loadGltfPlane("/ssj/SSJ100.gltf", () => {
    loading.value = false;
  }).then((plane) => {
    planes.push(
      plane.clone(),
      plane.clone(),
      plane.clone(),
      plane.clone(),
      plane.clone(),
      plane.clone()
    );
    planes.forEach((plane, index) => {
      planes[index].position.x = -130 + 50 * index;
      planes[index].position.y = 75;
      stage && stage.add(planes[index]);
    });
    gsap.to(planes[0].position, {
      y: 200,
      duration: 20,
      ease: "steps.inOut",
      repeat: 0, // -1,
      yoyo: false,
      delay: 5,
      onStart: () => {
        console.log("动画开始");
      },
      onComplete: () => {
        console.log("动画完成");
      },
    });

    nextPlane = planes[1];

    // const points = [
    //   new Vector2(-80, 75),
    //   new Vector2(-150, 55),
    //   new Vector2(160, 65),
    //   new Vector2(160, -130),
    // ];
    // const curve = stage?.addPath2(points);
    // const boatPosition = new Vector2();
    // const boatTarget = new Vector2();

    const points = [
      new Vector3(-80, 75, 8),
      new Vector3(-150, 55, 8),
      new Vector3(160, 65, 8),
      new Vector3(160, -130, 8),
      // new Vector3(0, 0, 0),
      // new Vector3(0, 0, 10),
      // new Vector3(10, 0, 0),
    ];
    const curve = stage?.addPath3(points);
    const boatPosition = new Vector3();
    const boatTarget = new Vector3();

    // let lastPostion: Vector2 | null = null;
    requestAnimationFrame((time) => {
      stage?.render(time, (itime) => {
        itime *= 0.0005;
        const boatTime = itime * 0.05;
        const p1 = curve?.getPointAt(boatTime % 1, boatPosition);
        // 获取路径前一点坐标，用于头部向前
        const p2 = curve?.getPointAt((boatTime + 0.01) % 1, boatTarget);
        console.log(p1, p2);
        const model = nextPlane!;
        if (model && p1 && p2) {
          const angle = boatPosition.angleTo(boatTarget);
          // 位移
          model.position.set(p2.x, p2.y, p2.z + 10);
          // model.rotateZ(Math.PI / 2);
          // 因为模型加载进来默认面部是正对Z轴负方向的，所以直接lookAt会导致出现倒着跑的现象，这里用重新设置朝向的方法来解决
          // model.lookAt(p2.x, p2.y, p2.z);

          let targetPos = p2; //目标位置点
          let offsetAngle = angle// Math.PI / 2; //目标移动时的朝向偏移
          //以下代码在多段路径时可重复执行
          let mtx = new Matrix4(); //创建一个4维矩阵

          // .lookAt ( eye : Vector3, target : Vector3, up : Vector3 ) : this,构造一个旋转矩阵，从eye 指向 target，由向量 up 定向。
          mtx.lookAt(model.position, targetPos, model.up);
          // .multiply ( m : Matrix4 ) 将当前矩阵乘以矩阵
          mtx.multiply(
            new Matrix4().makeRotationFromEuler(
              new Euler(0, offsetAngle, 0, "XYZ")
            )
          );
          // Quaternion 四元数在three.js中用于表示 rotation （旋转）
          let toRot = new Quaternion().setFromRotationMatrix(mtx); //计算出需要进行旋转的四元数值
          model.quaternion.slerp(toRot, 0.2);
        }

        // let v1 = boatPosition;
        // if (lastPostion) {
        //   // nextPlane!.rotation.z = -Math.PI /2
        //   const v = new Vector2(v1.x, v1.y);
        //   const angle = v.cross(lastPostion);
        //   // console.log(angle, v);
        //   if (angle > 0) {
        //     //角度是逆时针方向的
        //     nextPlane!.rotateZ(angle);
        //   } else {
        //     //角度是顺时针方向的
        //     nextPlane!.rotateZ(angle);
        //   }
        //   nextPlane!.rotation.z = MathUtils.degToRad(angle)
        // }
        // lastPostion = boatPosition;

        // // nextPlane!.rotateZ(lastZ - boatTarget.x)
        // const diff = Math.abs(Math.abs(lastZ) - Math.abs(boatTarget.x));
        // if (diff > 55) {
        //   lastZ = boatTarget.x;
        //   nextPlane!.rotateZ(-diff);
        //   // nextPlane?.lookAt(boatTarget.y, boatTarget.x, 4);
        // }

        // var targetPos = new Vector3(p2?.x, p2?.y, 14); //目标位置点
        // var offsetAngle = -Math.PI / 2; //目标移动时的朝向偏移
        // var model = nextPlane!;

        // //以下代码在多段路径时可重复执行
        // var mtx = new Matrix4(); //创建一个4维矩阵
        // mtx.lookAt(model.position.clone(), targetPos, model.up); //设置朝向
        // mtx.multiply(
        //   new Matrix4().makeRotationFromEuler(new Euler(0, offsetAngle, 0))
        // );
        // var toRot = new Quaternion().setFromRotationMatrix(mtx); //计算出需要进行旋转的四元数值
        // model.quaternion.slerp(toRot, 0.2); //应用旋转。0.2代表插值step。可以做到平滑旋转过渡
        // // //使用Tween线性改变model的position。此处的action方法Tween官方可能没有，你可以使用Tween的其他方法，只要能线性插值改变position就可以了。
        // // Tween.Tween.(model.position , 1000 , targetPos ,Tween.Easing.Linear,function(){
        // // //oncomplete
        // // },function(){
        // //    //onupdate
        // //   model.quaternion.slerp(toRot , 0.2)  //应用旋转。0.2代表插值step。可以做到平滑旋转过渡
        // // }
        // // )

        // // 位移
        // planes[1].position.set(
        //   boatPosition.x,
        //   boatPosition.y,
        //   4
        // );
        // planes[1].rotation.set(
        //   -0.5 * Math.PI, 0.5 * Math.PI, Math.PI
        // );
        // planes[1].lookAt(0, 0, 0);

        // if (flyPlane && textMesh) {
        //   textMesh!.position.set(
        //     flyPlane.position.x,
        //     flyPlane.position.y,
        //     flyPlane.position.z + 20
        //   );
        // }
      });
    });

    const flyPlaneGroup = new Group();

    flyPlane = plane.clone();
    flyPlaneGroup.position.x = 160;
    flyPlaneGroup.position.y = -130;
    flyPlaneGroup.position.z = 4;
    flyPlane.position.set(0, 0, 10);
    flyPlane.rotation.z = -0.5 * Math.PI;

    flyPlaneGroup.add(flyPlane);

    const c = LabelUtils.createLabel("ZH9008");

    const texture = new CanvasTexture(c.canvas);
    const spriteMaterial = new SpriteMaterial({
      map: texture,
    });
    const sprite = new Sprite(spriteMaterial);
    sprite.scale.set(50, 50, 50); //只需要设置x、y两个分量就可以
    sprite.position.set(0, 0, 10);

    // 父对象group位置变化,网格模型及其对象的标签同样发生变化
    flyPlaneGroup.position.set(
      flyPlaneGroup.position.x,
      flyPlaneGroup.position.y,
      flyPlaneGroup.position.z
    );
    // 表示标签信息的精灵模型对象相对父对象设置一定的偏移
    sprite.translateX(0);

    // 把精灵模型插入到模型对象的父对象下面
    flyPlaneGroup.add(sprite);

    gsap.to(flyPlaneGroup.position, {
      x: -300,
      y: -130,
      z: 60,
      duration: 20,
      ease: "steps.inOut",
      repeat: -1,
      yoyo: false,
      delay: 35,
      onStart: () => {
        console.log("动画开始");
      },
      onComplete: () => {
        console.log("动画完成");
      },
    });

    stage && stage.add(flyPlaneGroup);

    arrivalPlane = plane.clone();
    arrivalPlane.position.x = 160;
    arrivalPlane.position.y = -130;
    arrivalPlane.position.z = 60;
    arrivalPlane.rotation.z = -0.5 * Math.PI;

    gsap.to(arrivalPlane.position, {
      x: -300,
      y: -130,
      z: 0,
      duration: 20,
      ease: "steps.inOut",
      repeat: -1,
      yoyo: false,
      delay: 5,
      onStart: () => {
        console.log("动画开始");
      },
      onComplete: () => {
        console.log("动画完成");
      },
    });

    stage && stage.add(arrivalPlane);
  });

  // requestAnimationFrame((time) => {
  //   stage?.render(time, (itime) => {});
  // });
});

onUnmounted(() => {
  stage && stage.dispose();
});

function handleSave() {
  stage && stage.export()
}

</script>

<template>
  <div ref="container" id="container" class="mt-3">
    <div v-if="loading" class="flex w-full h-full items-center justify-center">
      <a-progress type="circle" trail-color="#e6f4ff" :stroke-color="{
        '0%': '#108ee9',
        '100%': '#87d068',
      }" :percent="percent" :stroke-width="20" :size="100" />
    </div>
  </div>
  <a-button @click="handleSave">保存图片</a-button>
</template>

<style lang="less" scoped>
#container {
  width: calc(100vw - 50px);
  height: calc(100vh - 100px);
  position: relative;
}

.joy-stick {
  position: fixed;
  bottom: 20px;
  right: 20px;
}
</style>
../three/meshs/terminal
