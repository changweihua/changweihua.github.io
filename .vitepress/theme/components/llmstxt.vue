<script lang="ts" setup>

import { useLLMsRouteData } from 'vitepress-plugin-llmstxt/client'
import { useRoute, useData } from 'vitepress/client'
import { ref, watch } from 'vue'

const data = useData()
const route  = useRoute()
const llmsPath = ref( useLLMsRouteData( route, data )?.path )

watch(
  route,
  newValue => llmsPath.value = useLLMsRouteData( newValue, data )?.path,
  { immediate: true },
)

</script>

<template>
  <div
    class="llmstxt-section"
    v-if="llmsPath"
  >
    <p class="outline-title">
      LLM Resources
    </p>
    <ul>
      <li>
        <a
          :href="llmsPath"
          target="_blank"
          class="VPLink link"
        >
          llms.txt
        </a>
      </li>
    </ul>
  </div>
</template>

<style>
  .llmstxt-section {
    margin: 25px 0px 5px 0px;
  }
  .llmstxt-section li {
    margin: 5px;
  }
  .llmstxt-section a {
    font-size: small;
    margin: 0;
    color: var(--vp-c-text-2);
    transition: color 0.5s;
  }
  .llmstxt-section a:hover {
    color: var(--vp-c-text-1);
    transition: color 0.25s;
  }
</style>
