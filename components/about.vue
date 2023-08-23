<template>
  <div class="md:pt-24 p-6 pb-12">
    <div class="mx-auto flex flex-wrap self-center w-full md:w-4/5">
      <div class="flex w-full md:w-2/5 shrink-0 flex-col md:gap-8 gap-4">
        <div class="flex items-center">
          <!-- <img
            :src="`/author.jpg`"
            class="w-16 rounded-full border-2 border-gray-600"
          />
          <h1 class="grow text-center text-2xl font-bold text-white">常伟华</h1> -->

          <header-profile />
        </div>
        <!-- <div class="flex justify-between text-slate-200">
          <span class="flex items-center gap-2">
            <Icon icon="octicon:location-16" />
            <span>无锡</span>
          </span>
          <span class="flex items-center gap-2">
            <Icon icon="ps:work-case" />
            <span>全栈开发</span>
          </span>
        </div> -->
        <!-- <div class="flex justify-between text-2xl text-gray-200">
          <Icon icon="iconamoon:email-fill" />
          <Icon icon="bxl:github" />
          <Icon icon="bxl:tiktok" />
          <Icon icon="codicon:twitter" />
        </div> -->
        <!-- <div class="text-xs leading-5 text-gray-300">
          .NET · Vue · Tailwind CSS · AntDesign Vue · TDesign MiniProgram ·
          Visual Studio · VS Code · 微信开发者工具 · Postman · MySQL · Wechat ·
          Edge
        </div>
        <div class="text-xs text-gray-400">
          <div>Copyright © 2023 CMONO.NET</div>
          <div class="mt-2">1-5</div>
        </div> -->
      </div>
      <div
        class="md:ml-24 mt-12 md:mt-0 w-full flex shrink-0 flex-col gap-4 md:w-2/5 justify-around items-stretch"
      >
        <div class="flex justify-between items-center text-slate-600">
          <div
            style="width: 200px; height: 100px; margin: 0 auto"
            class="justify-center items-center flex"
          >
            <lottie-panel :animation-data="party"></lottie-panel>
          </div>
        </div>
        <div class="flex justify-between items-center text-slate-600">
          <span class="flex items-center gap-2">
            <Icon icon="octicon:location-16" />
            <span>无锡</span>
          </span>
          <span class="flex items-center gap-2">
            <Icon icon="ps:work-case" />
            <span>全栈开发</span>
          </span>
        </div>
        <div class="flex justify-between text-2xl text-gray-600">
          <Icon icon="iconamoon:email-fill" />
          <Icon icon="bxl:github" />
          <Icon icon="bxl:tiktok" />
          <Icon icon="codicon:twitter" />
        </div>
        <div class="text-xs leading-5 text-gray-500">
          .NET · Vue · Tailwind CSS · AntDesign Vue · TDesign MiniProgram ·
          Visual Studio · VS Code · 微信开发者工具 · Postman · MySQL · Wechat ·
          Edge
        </div>
        <div
          class="flex flex-col items-center justify-center text-xs text-gray-800"
        >
          <div>Copyright © 2023 CMONO.NET</div>
          <div class="mt-2">Power & Determination</div>
        </div>
        <div class="flex justify-between items-center text-slate-600">
          <div
            style="width: 200px; height: 100px; margin: 0 auto"
            class="justify-center items-center flex"
          >
            <lottie-panel :animation-data="world"></lottie-panel>
          </div>
        </div>
        <!-- <template v-for="item in posts" :key="item.year">
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
        </template> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { readonly } from "vue";
import { Icon } from "@iconify/vue";
import { faker } from "@faker-js/faker";
//@ts-ignore
import party from "../public/lotties/starter.json";
//@ts-ignore
import world from "../public/lotties/colorfulworld.json";

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
