<script setup lang="ts">
import { onMounted, ref } from "vue";
import WebLogo from "./WebLogo";

const hero_logo = ref<HTMLDivElement>();

onMounted(() => {
  if (!hero_logo.value) {
    return;
  }

  const hero = hero_logo.value;

  new WebLogo(hero).animate();
});

const handleHeroLogoResize = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  console.log(width, height);
};
</script>

<template>
  <div
    v-resize="handleHeroLogoResize"
    ref="hero_logo"
    id="hero_logo"
    class="w-full h-full"
  ></div>
</template>

<style lang="less" scoped></style>
