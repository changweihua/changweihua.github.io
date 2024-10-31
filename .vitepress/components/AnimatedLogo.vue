<template>
  <div>
    <Suspense>
      <div>
        <AsyncHeroImage />
      </div>
      <template #fallback> 加载中... </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import AsyncHeroImage from "../components/AsyncHeroImage";
</script>
