<template>
  <div class="container" ref="palette">
    <div
      v-if="items && items.length > 0"
      class="w-full grid grid-cols-1 gap-4 px-1 md:px-8 py-8 md:grid-cols-3"
    >
      <div class="flex flex-col justify-center" v-for="(item, _i) in items">
        <article class="card card">
          <div class="card__info-hover flex justify-between">
            <m-icon
              class="item"
              icon="svg-spinners:blocks-wave"
              :width="20"
              :height="20"
            />
            <m-icon
              class="item"
              icon="svg-spinners:clock"
              :width="20"
              :height="20"
            />
          </div>
          <div class="card__img"></div>
          <a :href="item.link" class="card_link">
            <div class="card__img--hover"></div>
          </a>
          <div class="card__info">
            <span class="card__category">{{ item.category }}</span>
            <h3 class="card__title">{{ item.title }}</h3>
            <span class="card__by"
              >by
              <a href="javascript:void(0);" class="card__author" title="author"
                >常伟华</a
              ></span
            >
          </div>
        </article>
      </div>
    </div>
    <a-empty v-else></a-empty>
  </div>
</template>

<script setup lang="ts">
// import HoverableCard from './HoverableCard.vue'

interface CardListItem {
  title: string;
  link: string;
  icon: string;
  category?: string;
  description?: string;
  cover?: string;
  coverAlt?: string;
}

defineProps({
  items: Array<CardListItem>,
});
</script>

<style lang="less" scoped>
.container {
  font-family: MapleMono, "JetBrains Maple Mono", AlibabaPuHuiTi,
    "阿里巴巴普惠体 3.0" !important;
}

.card .card__img,
.card .card__img--hover {
  background-image: url("https://images.pexels.com/photos/45202/brownie-dessert-cake-sweet-45202.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260");
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
  background-color: #fff;
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
  background-color: #fff;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  padding: 16px 24px 24px 24px;
}

.card__category {
  font-family: "Raleway", sans-serif;
  text-transform: uppercase;
  font-size: 22px;
  letter-spacing: 2px;
  font-weight: 500;
  color: #868686;
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
