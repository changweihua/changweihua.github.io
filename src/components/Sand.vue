<script lang="ts" setup>
import PANOLENS from "@enra-gmbh/panolens";
import { onMounted } from "vue";

onMounted(() => {
  const sand_viewer = document.getElementById("sand_viewer");
  if (sand_viewer) {
    // 传入官方案例的全景图片，初始化一个球形的全景
    const panorama_main_image = new PANOLENS.ImagePanorama(
      "/images/zhoushan.jpg"
    );

    const sandViewer = new PANOLENS.Viewer({
      container: sand_viewer, // 传入父容器dom
      output: "console", // 为了后面打印位置信息
    });

    // 把全景添加到场景中
    sandViewer.add(panorama_main_image);
  }
});
</script>

<template>
  <div id="sand_viewer" class="w-full h-28"></div>
</template>
