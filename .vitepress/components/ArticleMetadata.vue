<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-2 my-5">
    <span class="flex items-center gap-1">
      <my-icon icon="solar:tag-bold" />
      原创
    </span>
    <span class="flex items-center gap-1">
      <my-icon icon="basil:user-solid" />
      常伟华
    </span>
    <span class="flex items-center gap-1">
      <my-icon icon="ion:timer" />
      阅读&ensp;{{ readCost }}&ensp;分钟
    </span>
    <span class="flex items-center gap-1">
      <my-icon icon="tabler:clock-filled" />
      发布&ensp;{{ dayjs.tz(date).fromNow() }}
      <!-- <timeago :datetime="date" /> -->
      <!-- <VCTimeago :date-time="date" :auto-update="true" /> -->
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
import { PropType, reactive, toRefs, ref, onMounted, nextTick } from "vue";
import { useData } from "vitepress";
// import md5 from "blueimp-md5";
import dayjs from "dayjs";

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

const readCost = ref(10)

// 呐，其实一个简单的数学公式就可以了：
// 阅读时长 = 总字数 ÷ 平均阅读速度（275 wpm）
// 在此基础上，再给每一张图像 12 秒的时间。
// 注：wpm，全称为 Words per minute
// 随着平台的发展，越来越多的文章图文并茂。而原来的阅读时长是以漫画等「要看得比较久」的图片为基准，如果以原来的算法计算，那一篇包含 140 张图片的文章阅读时长会高达 87 分钟，这显然不合理。
// 因此，图片的读取时间修正为第一张 12 秒，第二张 11 秒，依次减少 1 秒到第 10 张之后，每张以 3 秒计算。
// 设置阅读时长的原因其实很好理解，这样用户就可以方便地把握阅读的时机 —— 是在等公交的时候看，还是先收藏起来一会儿再看。
// 当然，所有阅读时长的设置前提都是 —— 估算。
// 除了文字和图片，现在的内容型产品已经在主推视频了。视频的时长也即播放时长，不过阅读文字和观看视频是两种截然不同的输入方式，所以在此就不冗述了。

onMounted(() => {
  nextTick(() => {
    let readTime = document.querySelector(".VPContent").innerText.length;
    readTime = Math.round(readTime / 400);    //四舍五入

    if (readTime > 1) {
      readCost.value = readTime
      console.log('预计阅读时长：' + readTime + '分钟');
    } else {
      console.log('预计阅读时长：1分钟');
    }
  })
})

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
