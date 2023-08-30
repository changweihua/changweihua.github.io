import { WebGLRenderer } from "three";

//初始化渲染
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

export default renderer;
