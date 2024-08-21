<template>
  <ConfigProvider :theme="{
    algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
    token: {
      colorPrimary: colorPrimary,
      colorLink: colorPrimary,
    },
  }">
    <slot />
  </ConfigProvider>
</template>

<script lang="ts" setup>
import { ConfigProvider, theme } from "ant-design-vue";
import { useData } from "vitepress";

const colorPrimary = "#646cff"

const { darkAlgorithm, defaultAlgorithm } = theme;

const { isDark } = useData();
</script>
