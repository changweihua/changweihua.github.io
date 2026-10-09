<template>
  <div style="display: flex; gap: 1rem;">
    <div class="shape triangle"></div>
    <div class="shape pentagon"></div>
    <div class="shape hexagon"></div>
    <div class="shape rectangle"></div>
    <div class="shape parallelogram"></div>
    <div class="shape svg-path"></div>
  </div>
</template>
<script lang="ts" setup>
</script>
<style scoped>
.shape {
  width: 300px;
  height: 300px;
  background: url('/images/wall2.jpg') no-repeat center/cover;
  margin: 20px;
}

.triangle {
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.pentagon {
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
}

.hexagon {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

.rectangle {
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
}

.parallelogram {
  clip-path: polygon(25% 0%, 75% 0%, 50% 100%, 0% 100%);
}

.svg-path {
  clip-path: path('M 10 10 H 90 V 90 H 10 L 10 10');
}
</style>
