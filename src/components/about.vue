<template>
  <div class="md:pt-24 p-6 pb-12">
    <div class="mx-auto flex flex-wrap self-center w-4/5">
      <div class="flex sm:w-full md:w-2/5 shrink-0 flex-col md:gap-8 gap-4">
        <div class="flex items-center">
          <header-profile />
        </div>
      </div>
      <div class="md:ml-24 mt-12 md:mt-0 flex shrink-0 flex-col gap-4  sm:w-full md:w-2/5 justify-around items-stretch">
        <div class="flex justify-between items-center text-slate-600">
          <div style="max-width: 200px;" class="justify-center items-center flex">
            <!-- <lottie-panel :animation-data="party"></lottie-panel> -->
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
          .NET · Vue · UnoCSS · AntDesign Vue · TDesign MiniProgram ·
          Visual Studio · VS Code · 微信开发者工具 · Postman · MySQL · Wechat ·
          Edge
        </div>
        <div class="flex flex-col items-center justify-center text-xs text-gray-800">
          <div>Copyright © 2023 CMONO.NET</div>
          <div class="mt-2">Power & Determination</div>
        </div>
        <div class="flex justify-between items-center text-slate-600">
          <div class="justify-center items-center flex">
            <!-- <lottie-panel style="max-width: 200px;" :animation-data="world"></lottie-panel> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
// import { faker } from "@faker-js/faker";
// import party from "@/lotties/party.json";
// import world from "@/lotties/colorfulworld.json";

// const posts = readonly<
//   Array<{
//     year: number;
//     postCount: number;
//   }>
// >([
//   { year: 2023, postCount: 4 },
//   { year: 2022, postCount: 6 },
// ]);
</script>
