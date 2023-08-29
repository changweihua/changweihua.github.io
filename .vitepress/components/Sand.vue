<script lang="ts" setup>
// @ts-ignore
import * as PANOLENS from "panolens";

const sandViewer = new PANOLENS.Viewer({
  container: document.getElementById('sand_viewer'), // 传入父容器dom
  output: "console", // 为了后面打印位置信息
});

// 传入官方案例的全景图片，初始化一个球形的全景
const panorama_main_image = new PANOLENS.ImagePanorama('/images/zhoushan.jpg')
// 把全景添加到场景中
sandViewer.add(panorama_main_image)


</script>

<template>
  <div id="sand_viewer" class="w-full h-28"></div>
</template>
