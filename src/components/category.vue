<template>
  <div class="grid grid-cols-1 gap-4 px-1 md:px-8 py-8 md:grid-cols-3">
    <div
      v-for="item in categories"
      class="waving-border p-2 max-w-md mx-auto w-full bg-gray-100 rounded-xl shadow-md overflow-hidden md:max-w-2xl hover:ring-2 hover:ring-opacity-50 hover:ring-indigo-300"
    >
      <a
        style="display: block"
        :href="item.link"
        class="block w-full text-md leading-tight font-medium text-black hover:underline"
      >
        <div class="md:flex">
          <div class="md:flex-shrink-0 h-48 flex items-center align-middle">
            <img
              class="h-full w-full object-cover md:w-40"
              :src="`${item.poster || '/logo.png'}`"
              alt="Man looking at item at a store"
            />
            <!-- <Icon v-else icon="logos:active-campaign" /> -->
          </div>
          <div class="p-8">
            <div
              class="uppercase tracking-wide text-sm p-2 text-indigo-500 font-semibold"
            >
              {{ item.title }}
            </div>
            <div class="tracking-wide text-sm p-2">
              {{ item.decription || "" }}
            </div>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { onMounted, ref, watch } from "vue";

const props = defineProps({
  categories: Array<{
    title: string;
    link: string;
    icon: string;
    decription?: string;
    cover?: string;
    coverAlt?: string;
  }>,
});

const categories = ref<
  Array<{
    title: string;
    link: string;
    icon: string;
    decription?: string;
    cover?: string;
    coverAlt?: string;
  }>
>([]);

onMounted(() => {
  fetch(`/jsons/lastest_blogs.json`)
    .then((res) => res.json())
    .then((json) => {
      console.log(json);
      categories.value = json.map((c) => {
        return {
          title: c["blogName"],
          link: c["filePath"],
          description: c["blogDescription"],
          poster: c["blogPoster"],
          // icon: "VueJS",
        };
      });
    });
});

watch(
  () => props.categories,
  (oldVal, newVal) => {
    console.log(oldVal, newVal);
    // if (newVal) {
    //   categories.value = newVal;
    // }
  },
  {
    immediate: true,
  }
);
</script>

<style lang="less">
.waving-border {
  transition: ease-in-out 0.3s;
  background: linear-gradient(0, var(--vp-c-brand) 2px, var(--vp-c-brand) 2px)
      no-repeat,
    linear-gradient(-90deg, var(--vp-c-brand) 2px, var(--vp-c-brand) 2px)
      no-repeat,
    linear-gradient(-180deg, var(--vp-c-brand) 2px, var(--vp-c-brand) 2px)
      no-repeat,
    linear-gradient(-270deg, var(--vp-c-brand) 2px, var(--vp-c-brand) 2px)
      no-repeat;
  background-size: 0 2px, 2px 0, 0 2px, 2px 0;
  background-position: left top, right top, right bottom, left bottom;
}
.waving-border:hover {
  background-size: 100% 2px, 2px 100%, 100% 2px, 2px 100%;
}
</style>
