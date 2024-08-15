<template>
  <div
    style="
      width: 600px;
      height: 300px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
    "
    class="w-3/5 h-1 justify-center items-center flex"
  >
    <lottie-panel class="" :animation-data="notfound"></lottie-panel>
  </div>
</template>

<script setup lang="ts">
import notfound from "@/lotties/notfound.json";
</script>

<style lang="less" scoped></style>
