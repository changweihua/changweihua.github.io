import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
} from "three";
import { buildFlowerBed } from "./flowerbed";

const buildLane = function () {
  //跑道的长宽
  const laneWidth = 420;
  const laneHeight = 50;

  //创建一个跑道的父容器
  const groundGroup = new Group();
  //创建马路容器
  const roadGroup = new Group();
  //使用平面几何体创建马路，参数为宽高，
  //这里我们创建单位为2，高度为10的马路，也许你会疑问为什么是高度，后面会给予解释，或者你可以直接查看官方文档。
  //搜索PlaneGeometry
  const roadPlaneG = new BoxGeometry(laneWidth, laneHeight, 10);
  //定义材质 和 颜色
  const roadPlaneM = new MeshStandardMaterial({ color: 0x4c4a4b });
  //创建网格 ，用于组织几何体和材质
  const roadPlane = new Mesh(roadPlaneG, roadPlaneM);
  roadPlane.position.z = -4;

  const lineWidth = 1;
  //这里是左侧长实线
  const leftLine = new Mesh(
    new PlaneGeometry(laneWidth, lineWidth),
    new MeshStandardMaterial({ color: 0xf0c20e })
  );
  //设置实线位置
  leftLine.position.z = 1.1;
  leftLine.position.y = (-laneHeight / 2) * 0.8;

  //克隆出右侧的实线
  const rightLine = leftLine.clone();
  rightLine.position.y = (laneHeight / 2) * 0.8; //同上

  const dashLineGroup = new Group();
  const dashHeight = 6;
  const dashGap = 3;
  const dashCount = Math.floor(laneWidth / (dashGap + dashHeight));
  for (let i = 0; i < dashCount; i++) {
    const m = new MeshStandardMaterial({ color: 0xffffff });
    const g = new PlaneGeometry(dashHeight, lineWidth);
    const mesh = new Mesh(g, m);
    mesh.position.z = 1.1;
    mesh.position.x = -laneWidth / 2 + (dashHeight + dashGap) * i;
    dashLineGroup.add(mesh);
  }

  const edgeLineGroup = new Group();
  const edgeLineHeight = 2;
  const edgeLineWidth = 30;
  const edgeGap = 3;
  const edgeCount = Math.floor(laneHeight / (edgeLineHeight + edgeGap));
  for (let i = 0; i < edgeCount; i++) {
    const m = new MeshStandardMaterial({ color: 0xffffff });
    const g = new PlaneGeometry(edgeLineWidth, edgeLineHeight);
    const mesh = new Mesh(g, m);
    mesh.position.z = 1.1;
    mesh.position.x = 195;
    mesh.position.y = -20 + (edgeLineHeight + edgeGap) * i;
    edgeLineGroup.add(mesh);
  }

  roadGroup.add(roadPlane, leftLine, rightLine, dashLineGroup, edgeLineGroup);

  groundGroup.add(roadGroup);

  const roadPlane1G = new BoxGeometry(30, 60, 10);
  const roadPlane1 = new Mesh(roadPlane1G, roadPlaneM);
  roadPlane1.position.z = -4;
  roadPlane1.position.y = 55;
  roadPlane1.position.x = 195;

  // const waitingEntranceStops = [10, 60, 120];
  // const waitingEntranceWidth = 30;
  const waitingLaneHeight = 30;
  // //定义材质 和 颜色
  // const waitingRoadPlaneM = new MeshStandardMaterial({ color: 0x808080 });
  // //创建网格 ，用于组织几何体和材质
  // waitingEntranceStops.forEach((stop, index) => {

  //   if(index === 0){
  //     const waitingRoadPlaneG = new BoxGeometry(
  //       Math.abs(stop - (-laneWidth / 2)),
  //       waitingLaneHeight,
  //       10
  //     );
  //     const waitingRoadPlane = new Mesh(waitingRoadPlaneG, waitingRoadPlaneM);
  //     waitingRoadPlane.position.z = -4;
  //     waitingRoadPlane.position.y = 100;
  //     waitingRoadPlane.translateX( -laneWidth / 4);
  //     groundGroup.add(waitingRoadPlane);
  //   } else if(index === waitingEntranceStops.length - 1){
  //     const waitingRoadPlaneG = new BoxGeometry(
  //       Math.abs(stop - (-laneWidth / 2)),
  //       waitingLaneHeight,
  //       10
  //     );
  //     const waitingRoadPlane = new Mesh(waitingRoadPlaneG, waitingRoadPlaneM);
  //     waitingRoadPlane.position.z = -4;
  //     waitingRoadPlane.position.y = 100;
  //     waitingRoadPlane.translateX( -laneWidth / 4);
  //     groundGroup.add(waitingRoadPlane);
  //   }
  //   // const waitingRoadPlane = new Mesh(waitingRoadPlaneG, waitingRoadPlaneM);
  //   // waitingRoadPlane.position.z = -4;
  //   // waitingRoadPlane.position.y = 100;
  //   // waitingRoadPlane.position.x = -laneWidth / 2 + stop;
  //   // groundGroup.add(waitingRoadPlane);
  // });

  const waitingRoadPlaneG = new BoxGeometry(laneWidth, waitingLaneHeight, 10);
  const waitingRoadPlaneM = new MeshStandardMaterial({ color: 0x808080 });
  const waitingRoadPlane = new Mesh(waitingRoadPlaneG, waitingRoadPlaneM);
  waitingRoadPlane.position.z = -4;
  waitingRoadPlane.position.y = 100;
  groundGroup.add(waitingRoadPlane);

  groundGroup.add(roadPlane1);

  const flowerbed = buildFlowerBed()
  flowerbed.position.z = -4;
  flowerbed.position.y = 125;

  const flowerbeds = [
    flowerbed.clone(),
    flowerbed.clone(),
    flowerbed.clone(),
    flowerbed.clone(),
  ];

  flowerbeds[0].position.x = 10;
  flowerbeds[1].position.x = 80;
  flowerbeds[2].position.x = -80;
  flowerbeds[3].position.x = -150;

  groundGroup.add(...flowerbeds);
  groundGroup.position.y = -130;

  // const cornerCircle = new CylinderGeometry(30,60,10,5);
  // const corner = new Mesh(cornerCircle, roadPlaneM);
  // corner.position.z = -4;
  // corner.position.y = 65;
  // groundGroup.add(corner);//半圆)

  // const cornerGroup = new Group();

  return groundGroup;
};

export { buildLane };
