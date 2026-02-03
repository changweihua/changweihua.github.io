<template>
  <div
    class="container"
    ref="palette"
  >
    <div
      v-if="items && items.length > 0"
      class="w-full grid grid-cols-1 gap-4 px-1 md:px-8 py-8 md:grid-cols-2 lg:grid-cols-3"
    >
      <div
        :class="`animate__animated animate__slideInUp animate__delay-${i * 2}s flex flex-col justify-center`"
        v-for="(item, i) in items"
        :key="item.link"
      >
        <article-card :item="item" />
      </div>
    </div>
    <n-empty v-else></n-empty>
  </div>
</template>

<script setup lang="ts">
  import { CardListItem } from './ArticleCard.vue'

  withDefaults(
    defineProps<{
      items: Array<CardListItem>
    }>(),
    {
      items: () => [],
    }
  )
</script>

<style lang="scss" oped>
  .container {
    font-family: #{vars.$app-font-family};
  }

  .card .card__img,
  .card .card__img--hover {
    background-image: url('/images/default-cover.jpg');
    /* 现代浏览器优先使用AVIF，然后是WebP，最后JPEG */
      background-image: url("/images/default-cover.avif");
      background-image:
        -webkit-image-set(url("/images/default-cover.avif") type("image/avif"),
          url("/images/default-cover.webp") type("image/webp"),
          url("/images/default-cover.jpg") type("image/jpeg"));
  }

  .card__img {
    visibility: hidden;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    width: 100%;
    height: 200px;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  .card__info-hover {
    position: absolute;
    padding: 16px;
    width: 100%;
    opacity: 0;
    top: 0;
  }

  .card__img--hover {
    transition: 0.2s all ease-out;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    width: 100%;
    position: absolute;
    height: 200px;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    top: 0;
  }

  .card {
    height: 350px;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0, 1);
    background-color: var(--vp-c-bg-soft);
    width: 100%;
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0px 13px 10px -7px rgba(0, 0, 0, 0.1);
  }

  .card:hover {
    box-shadow: 0px 30px 18px -8px rgba(0, 0, 0, 0.1);
    transform: scale(1.01, 1.02);
  }

  .card__info {
    z-index: 2;
    background-color: var(--vp-c-bg-soft);
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    padding: 16px 24px 24px 24px;
  }

  .card__category {
    font-family: XiaolaiMono, sans-serif;
    text-transform: uppercase;
    font-size: 22px;
    letter-spacing: 2px;
    font-weight: 500;
    color: var(--vp-c-brand);
  }

  .card__title {
    margin-top: 5px;
    margin-bottom: 10px;
  }

  .card__by {
    font-size: 18px;
    font-weight: 500;
  }

  .card__author {
    font-size: 20px;
    font-weight: 600;
    text-decoration: none;
    color: #ad7d52;
  }

  .card:hover .card__img--hover {
    height: 100%;
    opacity: 0.3;
  }

  .card:hover .card__info {
    background-color: transparent;
    position: relative;
  }

  .card:hover .card__info-hover {
    opacity: 1;
  }
</style>
