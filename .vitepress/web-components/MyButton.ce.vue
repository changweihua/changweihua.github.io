<template>
  <button @click="handleClick">
    <slot></slot>
  </button>
</template>

<script lang="ts" setup>
function handleClick() {
  const event = new CustomEvent('custom-click', {
    detail: { message: 'Hello from Web Components' },
  });
  dispatchEvent(event);
}
</script>
<style></style>
