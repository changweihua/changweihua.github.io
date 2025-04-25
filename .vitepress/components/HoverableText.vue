<template>
  <div class="container flex items-center justify-center">
    <span>&nbsp;{{ title }}&nbsp;</span>
    <!-- <span aria-hidden="true" class="hovertext">&nbsp;{{ title }}&nbsp;</span> -->
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "标题",
});
</script>
<style lang="less" scoped>
.container {
  margin: 0 auto;
  height: 35px;
  background: transparent;
  padding: 0;
  border: none;
  cursor: pointer;
  width: 100px;
  position: relative;
}

.container {
  --border-right: 6px;
  --text-stroke-color: var(--vp-c-text-1);
  --animation-color: var(--vp-c-brand);
  --fs-size: 2em;
  letter-spacing: 2px;
  text-decoration: none;
  font-size: var(--fs-size);
  position: relative;
  color: transparent;
  -webkit-text-stroke: 1px var(--text-stroke-color);
}

.hovertext {
  position: absolute;
  box-sizing: border-box;
  content: attr(data-text);
  color: var(--animation-color);
  width: 0%;
  inset: 0;
  border-right: var(--border-right) solid var(--animation-color);
  overflow: hidden;
  transition: 0.5s;
  -webkit-text-stroke: 1px var(--animation-color);
}

// .container:hover .hovertext {
//   width: 100px;
//   filter: drop-shadow(0 0 20px var(--animation-color));
// }
</style>
