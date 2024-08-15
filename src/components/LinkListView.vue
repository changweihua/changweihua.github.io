<template>
  <div class="w-full grid grid-cols-1 gap-4 px-1 md:px-8 py-8 md:grid-cols-3">
    <div class="linkcard" v-for="category in categories">
      <a :href="category.link">
        <p class="description">{{ category.title }}<br><span>{{ category.description }}</span></p>
        <div class="logo">
          <img width="70px" height="70px" :src="`${category.cover || '/logo.png'}`" :alt="category.coverAlt" />
        </div>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CategoryItem {
  title: string;
  link: string;
  icon: string;
  description?: string;
  cover?: string;
  coverAlt?: string;
}

defineProps({
  categories: Array<CategoryItem>,
});
</script>

<style lang="less">
.waving-border {
  transition: ease-in-out 0.3s;
  background: linear-gradient(0, var(--vp-c-brand) 2px, var(--vp-c-brand) 2px) no-repeat,
    linear-gradient(-90deg, var(--vp-c-brand) 2px, var(--vp-c-brand) 2px) no-repeat,
    linear-gradient(-180deg, var(--vp-c-brand) 2px, var(--vp-c-brand) 2px) no-repeat,
    linear-gradient(-270deg, var(--vp-c-brand) 2px, var(--vp-c-brand) 2px) no-repeat;
  background-size: 0 2px, 2px 0, 0 2px, 2px 0;
  background-position: left top, right top, right bottom, left bottom;
}

.waving-border:hover {
  background-size: 100% 2px, 2px 100%, 100% 2px, 2px 100%;
}
</style>
