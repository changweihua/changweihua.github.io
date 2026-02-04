<template>
  <div :id="`md-${hash}`" :data-file-hash="`${hash}`" :data-file-path="`${filePath}`" v-hero="{ id: `md-${hash}` }" :class="`hero-simple hero-folder-${folder}`">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  hash: { type: String, default: '' },
  folder: { type: String, default: 'blog' }
})
</script>

<style scoped>
.hero-simple {
  position: relative;
  padding-left: 16px;
}

.hero-simple::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 2px;
}

.hero-folder-blog::before {
  background: linear-gradient(180deg, #3fb950, #2ea043);
}

.hero-folder-manual::before {
  background: linear-gradient(180deg, #1f6feb, #0969da);
}

.hero-folder-gallery::before {
  background: linear-gradient(180deg, #a371f7, #8957e5);
}
</style>

