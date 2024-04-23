<template>
  <div class="grid grid-cols-3 gap-2 my-5">
    <span class="flex items-center gap-1">
      <my-icon icon="solar:tag-bold" />
      原创
    </span>
    <span class="flex items-center gap-1">
      <my-icon icon="basil:user-solid" />
      常伟华
    </span>
    <span class="flex items-center gap-1">
      <my-icon icon="tabler:clock-filled" />
      <timeago :datetime="date" />
      <!-- <span>{{
        date.toLocaleString("zh", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        })
      }}
      </span> -->
    </span>
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

html[data-theme="dark"] {
  .meta-container {
    .meta-tag {
      background-color: rgb(183, 142, 230);
    }
  }
}
</style>
