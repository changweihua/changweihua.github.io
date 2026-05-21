<script setup lang="ts">
  const props = defineProps({
    name: {
      type: String,
      value: 'PlaceHolder',
    },
  })
</script>

<template>
  <h6>
    <span class="clip">{{ name }}</span>
  </h6>
</template>

<style scoped></style>
