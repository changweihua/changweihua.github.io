<template>
  <svg style="height: 42px;width: 100%;">
    <!-- <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#FFCF02" />
                <stop offset="100%" stop-color="#FF7352" />
              </linearGradient>
            </defs> -->
    <defs>
      <linearGradient id="gradient">
        <stop offset="0%" stop-color="#FFCF02" />
        <stop offset="100%" stop-color="#FF7352" />
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="0" flood-color="#333" />
      </filter>
    </defs>
    <text class="shadow-logo" x="50%" y="50%">{{ props.text }}</text>
  </svg>
</template>

<script lang="ts" setup>
const props = defineProps({
  text: {
    type: String,
    default: "为你定制 发现精彩",
  }
});
</script>

<style scoped>
.shadow-logo {
  font-size: 34px;
  text-anchor: middle;
  dominant-baseline: middle;
  fill: url(#gradient);
  stroke-width: 4px;
  stroke: #333;
  paint-order: stroke;
  /*先描边*/
  stroke-linejoin: round;
  /*路径转角为圆角*/
  fill: url(#gradient);
  text-shadow: 0 4px 0 #333;
}
</style>
