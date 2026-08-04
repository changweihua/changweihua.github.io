<template>
  <div class="page-footer">
    <div id="PGFT" class="flex gap-3 flex-row items-center justify-center pb-6">
      <span v-once>V{{ version }}</span><span> | </span>
      <icon-logos-markdown :width="20" :height="20" />
    </div>
    <VisitsPanel />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchVersion } from "../utils/fetchVersion";
import { useRootClick, useCycle } from "./composables";
import VisitsPanel from "./VisitsPanel.vue";

const version = ref("N/A");
// import { useData } from "vitepress";
// const { params } = useData();
const { value, next } = useCycle([543, 12000, -3200]);

onMounted(() => {
  useRootClick(next);
  const docsVersionSpan = document.querySelector(
    "footer.VPFooter > .container > p.version-tag"
  );
  if (!docsVersionSpan) {
    fetchVersion().then((v) => {
      version.value = v;
    });
  }
});
</script>

<style lang="scss" scoped>
.page-footer {
  z-index: var(--vp-z-index-footer);
  background-color: var(--vp-c-bg);

  svg {
    fill: var(--vp-c-text-1);
  }
}

number-flow-vue {
  --number-flow-char-height: 0.85em;
  font-size: 1rem;
  font-weight: 600;
  font-style: italic;
}

.instructions {
  color: gray;
  text-align: center;
  bottom: 0;
  position: absolute;
  padding: 1.5rem;
  font-size: 0.875rem;
  width: 100%;
  left: 0;
}
</style>
