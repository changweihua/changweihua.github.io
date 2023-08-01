<template>
  <div style="width: 100%; height: 60px;margin: 0 auto;" class="justify-center items-center flex">
    <lottie-panel :animation-data="party"></lottie-panel>
  </div>
</template>

<script setup lang="ts">
import party from "../../public/lotties/waitingmore.json";
</script>

<style lang="less">
lottie-panel {
  width: 200px;
  height: 100px;
}
</style>
