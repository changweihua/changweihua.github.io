<script setup lang="ts">
import { computed } from "vue";
import { useData, useRouter } from "vitepress";

const baseUrl = "https://changweihua.github.io";

const { page, frontmatter } = useData();

// 获取页面相关信息
console.log(page.value.filePath); // 页面路径
console.log(page.value.relativePath); // 相对路径
console.log(page.value.title); // 页面标题
console.log(frontmatter.value); // 页面 Frontmatter

const router = useRouter();

const shareUrl = computed(() => {
  // if (typeof window !== 'undefined') {
  //   return window.location.href
  // }
  return `${baseUrl}${router.route.path}`;
});
</script>

<template>
  <div class="flex items-center justify-center">
    <t-affix
      ref="affixRef"
      :z-index="5"
      class="cursor-pointer"
      :offset-top="50"
      :offset-bottom="50"
    >
      <t-popup trigger="click"
        ><t-icon
          name="qrcode"
          :fill-color="'transparent'"
          size="3em"
          :stroke-color="'currentColor'"
          :stroke-width="2"
        />
        <template #content>
          <t-qrcode
            icon="/favicon.png"
            :value="shareUrl"
            type="svg"
            :size="146"
            borderless
            style="
              padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-s);
            "
          />
        </template>
      </t-popup>
    </t-affix>
  </div>
</template>
