<template>
  <div v-if="data.showMeta" class="meta-container m-6">
    <div class="meta-tag">
      <my-icon icon="solar:tag-bold" />
      原创
    </div>
    <div class="meta-tag">
      <my-icon icon="basil:user-solid" />
      常伟华
    </div>
    <div class="meta-tag">
      <my-icon icon="tabler:clock-filled" />
      {{
        date.toLocaleString("zh", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        })
      }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType, reactive, toRefs } from "vue";
import { useData } from "vitepress";
// import md5 from "blueimp-md5";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

// 定义文章属性
const props = defineProps({
  frontmatter: Object as PropType<Record<string, any>>,
});

// 初始化文章元数据信息
const { theme, page, frontmatter } = useData();

const data = reactive({
  showMeta: page.value.filePath.includes("blog/"),
  date: props.frontmatter?.date
    ? new Date(props.frontmatter?.date)
    : new Date(),
  categories: props.frontmatter?.categories ?? [],
  tags: props.frontmatter?.tags ?? [],
});
const { date, categories, tags } = toRefs(data);
</script>

<style lang="less" scoped>
.meta-container {
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 20px;
  .meta-tag {
    display: flex;
    align-items: center;
    border-radius: 10px;
    background-color: antiquewhite;
    gap: 6px;
    padding: 2px 8px;
  }
}
</style>
