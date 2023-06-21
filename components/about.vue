<template>
  <div class="h-screen bg-zinc-800 pt-24">
    <div class="mx-auto flex w-[1000px]">
      <div class="flex w-40 shrink-0 flex-col gap-8">
        <div class="flex items-center">
          <img :src="`/logo.png`" class="w-16 rounded-full border-2 border-gray-600" />
          <h1 class="grow text-center text-2xl font-bold text-white">
            常伟华
          </h1>
        </div>
        <div class="flex justify-between text-slate-200">
          <span class="flex items-center gap-2">
            <Icon icon="octicon:location-16" />
            <span>无锡</span>
          </span>
          <span class="flex items-center gap-2">
            <Icon icon="ps:work-case" />
            <span>全栈开发</span>
          </span>
        </div>
        <div class="flex justify-between text-2xl text-gray-200">
          <Icon icon="iconamoon:email-fill" />
          <Icon icon="bxl:github" />
          <Icon icon="bxl:tiktok" />
          <Icon icon="codicon:twitter" />
        </div>
        <div class="text-xs leading-5 text-gray-300">
          .NET · Vue · Tailwind CSS · AntDesign Vue · TDesign MiniProgram · Visual Studio · VS Code · 微信开发者工具
          · Postman · MySQL · Wechat · Edge
        </div>
        <div class="text-xs text-gray-400">
          <div>Copyright © 2023 CMONO.NET</div>
          <div class="mt-2">1-5</div>
        </div>
      </div>
      <div class="ml-24 flex flex-col gap-4">
        <template v-for="item in posts" :key="item.year">
          <section>
            <h3 class="text-xl font-bold text-slate-200">{{ item.year }}</h3>
            <template v-for="index in item.postCount" :key="index">
              <div class="mt-4 flex items-center gap-4">
                <span
                  class="flex-shrink-0 text-md text-slate-400"
                  style="fontfamily: 'Fira Code'"
                >
                  {{ faker.date.month({ abbreviated: true }) + " " }}
                  {{ ("0" + faker.number.int({ min: 1, max: 31 })).slice(-2) }}
                </span>
                <span class="line-clamp-1 text-md font-bold text-slate-300">{{
                  faker.lorem.sentence()
                }}</span>
              </div>
            </template>
          </section>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { readonly } from "vue";
import { Icon } from "@iconify/vue";
import { faker } from "@faker-js/faker";

const posts = readonly<
  Array<{
    year: number;
    postCount: number;
  }>
>([
  { year: 2023, postCount: 4 },
  { year: 2022, postCount: 6 },
]);
</script>
