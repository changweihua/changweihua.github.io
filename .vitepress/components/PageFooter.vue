<template>
  <div class="page-footer flex gap-3 flex-row items-center justify-center pb-6">
    V{{ version }} |
    <!--<NumberFlow
      :value
      :trend="0"
      :plugins="[continuous]"
      :format="{ notation: 'compact' }"
    />
    |-->
    <!-- <m-icon class="item" icon="logos:git" :width="24" :height="24" />
    <m-icon class="item" icon="logos:vitejs" :width="24" :height="24" />
    <m-icon class="item" icon="logos:github-octocat" :width="24" :height="24" />
    <m-icon class="item" icon="logos:ant-design" :width="24" :height="24" /> -->
    <icon-logos-markdown :width="20" :height="20" />
    <!-- <m-icon class="item" icon="logos:markdown" :width="24" :height="24" /> -->
    <!-- <m-icon class="item" icon="simple-icons:mermaid" :width="24" :height="24" />
    <m-icon class="item" icon="bxl:typescript" :width="24" :height="24" /> -->
    <!-- <m-icon class="item" icon="token-branded:rss3" :width="48" :height="48" /> -->
    <!-- <p class="version-tag w-20 text-center flex flex-row">
      {{ version }}
    </p> -->
  </div>
  <!-- <div id="circle" class="circle bg-red-500"></div> -->
  <VisitsPanel />
  <!-- - package name: {{ params?.pkg }} - version: {{ params?.version }} -->
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchVersion } from "../utils/fetchVersion";
// import NumberFlow, { continuous } from "@number-flow/vue";
import { useRootClick, useCycle } from "./composables";
import {
  AntDesignIcon,
  GitHubIcon,
  GitIcon,
  MarkdownIcon,
  LaTeXIcon,
  ViteIcon,
} from "vue3-simple-icons";
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

<style lang="less" scoped>
.page-footer {
  color: var(--vp-c-text-1);

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
