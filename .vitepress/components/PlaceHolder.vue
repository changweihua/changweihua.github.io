<script setup lang="ts">
const props = defineProps({
  name: {
    type: String,
    value: "PlaceHolder",
  },
  text: {
    type: String,
  },
  tagline: {
    type: String,
  },
});
</script>

<template>
  <h1 v-if="name" class="name title">
    <span class="clip">{{ name }}</span>
  </h1>
</template>

<style scoped>
.name {
  background: -webkit-linear-gradient(315deg,
      rgb(210, 86, 53) 10%,
      #647eff 50%,
      rgb(238, 224, 112) 90%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  background-size: 400% 400%;
  animation: gradient 5s ease infinite;
}
.name,
.text {
  max-width: 392px;
  letter-spacing: -0.4px;
  line-height: 40px;
  font-size: 32px;
  font-weight: 700;
  white-space: pre-wrap;
}

@media (min-width: 640px) {

  .name,
  .text {
    max-width: 576px;
    line-height: 56px;
    font-size: 48px;
  }
}

@media (min-width: 960px) {

  .name,
  .text {
    line-height: 64px;
    font-size: 56px;
  }
}

.tagline {
  padding-top: 8px;
  max-width: 392px;
  line-height: 28px;
  font-size: 18px;
  font-weight: 500;
  white-space: pre-wrap;
  color: var(--vp-c-text-2);
}

@media (min-width: 640px) {
  .tagline {
    padding-top: 12px;
    max-width: 576px;
    line-height: 32px;
    font-size: 20px;
  }
}

@media (min-width: 960px) {
  .tagline {
    line-height: 36px;
    font-size: 24px;
  }
}
</style>

