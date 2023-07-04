<template>
  <div class="grid grid-cols-1 gap-4 px-8 py-8 md:grid-cols-3">
    <div
      v-for="item in props.categories"
      class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl hover:ring-2 hover:ring-opacity-50 hover:ring-indigo-300"
    >
      <a
        :href="item.link"
        class="block text-md leading-tight font-medium text-black hover:underline"
      >
        <div class="md:flex">
          <div class="md:flex-shrink-0">
            <img
              class="h-full w-full object-cover md:w-40"
              src="/logos/logo_wechat.png"
              alt="Man looking at item at a store"
            />
            <Icon icon="logos:active-campaign" />
          </div>
          <div class="p-8">
            <div
              class="uppercase tracking-wide text-sm p-2 text-indigo-500 font-semibold"
            >
              {{ item.title }}
            </div>
            <div
              class="tracking-wide text-sm p-2"
            >
              {{ item.decription || "" }}
            </div>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
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
</script>
