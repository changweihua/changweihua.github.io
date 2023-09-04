import { BoxGeometry, Group, Mesh, MeshStandardMaterial, PlaneGeometry } from "three";

  //跑道的长宽
  const laneWidth = 420 ;
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
  roadPlane.position.z = -4

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
  const dashCount = Math.round(laneWidth / dashHeight);
  for (let i = 0; i < dashCount; i++) {
    const m = new MeshStandardMaterial({ color: 0xffffff });
    const g = new PlaneGeometry(dashHeight,lineWidth);
    const mesh = new Mesh(g, m);
    mesh.position.z = 1.1;
    mesh.position.x = -laneWidth / 2 + (dashHeight + dashGap) * i;
    dashLineGroup.add(mesh);
  }

  roadGroup.add(roadPlane, leftLine, rightLine, dashLineGroup);

  groundGroup.add(roadGroup);
  groundGroup.position.y = -130

  export default groundGroup
