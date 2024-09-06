import camera from "./camera";
import renderer from "./renderer";

export function resizePage() {
  //页面更新渲染页面
  window.addEventListener("resize", () => {
    //更新摄像头
    camera.aspect = window.innerWidth / window.innerHeight;
    //更新摄像头的投影矩阵
    camera.updateProjectionMatrix();
    //更新渲染器
    renderer.setSize(window.innerWidth, window.innerHeight);
    //设置渲染器像素比
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
}

export function removeResizePage() {
  window.removeEventListener("resize", resizePage);
}
