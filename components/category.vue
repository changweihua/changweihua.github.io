<template>
  <div class="grid grid-cols-1 gap-4 px-8 py-8 md:grid-cols-3">
    <div
      v-for="item in props.categories"
      class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl hover:ring-2 hover:ring-opacity-50 hover:ring-indigo-300"
    >
      <div class="md:flex">
        <div class="md:flex-shrink-0">
          <img
            class="h-40 w-full object-cover md:h-full md:w-40"
            src="/images/cover.png"
            alt="Man looking at item at a store"
          />
        </div>
        <div class="p-8">
          <div
            class="uppercase tracking-wide text-sm text-indigo-500 font-semibold"
          >
            {{ item.title }}
          </div>
          <a
            href="#"
            class="block mt-1 text-md leading-tight font-medium text-black hover:underline"
            >Finding customers for your new business</a
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  categories: Array<{
    title: string;
    link: string;
    icon: string;
    cover?: string;
    coverAlt?: string;
  }>,
});
</script>
