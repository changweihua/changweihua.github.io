<template>
  <div class="commonTitle">资产动态档案</div>
  <div class="content">
    <ul class="dynamicFiles" v-for="(item, index) in timeAxis" :key="index">
      <li>{{ item.time }}</li>
      <li class="detail">{{ item.address }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const timeAxis = [
  {
    state: 1, // 状态： 1:已完成，0:未完成
    time: "今天2024年5月2日 上午10:50:11",
    address: "【镇江转运中心】已发出 下一站【镇江为民中心】",
  },
  {
    state: 0,
    time: "2024年5月2日 上午10:30:10",
    address: "【镇江转运中心】已收入",
  },
  {
    state: 0,
    time: "2024年5月2日 上午10:10:08",
    address: "【江苏省无锡市富民路】已发出 下一站【镇江中心】",
  },
  {
    state: 0,
    time: "2024年5月2日 上午7:59:24",
    address: "【江苏省无锡市富民路公司】已打包",
  },
  {
    state: 0,
    time: "2024年5月2日 上午6:40:23",
    address: "【江苏省无锡市富民路公司】已收件",
  },
];
</script>

<style lang="less" scoped>
/* 时间轴 */
.dynamicFiles {
  position: relative;
  line-height: 36px;
  font: 24px PingFangSC-Regular;
  color: #17233d;
  padding-left: 32px;

  .detail {
    margin-top: 8px;
    padding: 12px 20px;
    background: #eaf6ff;
    border-radius: 12px;
  }

  &:before {
    position: absolute;
    margin-top: 8px;
    left: 4px;
    content: "";
    height: 12px;
    width: 12px;
    border-radius: 50%;
    background: linear-gradient(318deg, #cbcfe2 0%, #dfe7f0 100%);
    z-index: 1;
  }
  &:after {
    position: absolute;
    top: 12px;
    left: 8px;
    bottom: -28px;
    content: "";
    width: 1px;
    border-right: 1px solid #dde4ef;
  }
  &:not(:first-child) {
    padding-top: 20px;
  }
  &:last-child {
    &:after {
      display: none;
    }
  }
  &:first-child {
    &:before {
      background: linear-gradient(180deg, #4eccfe 0%, #3f90fd 100%);
    }
  }
  &:last-child > .detail {
    background: #ffeaea;
  }
}
</style>
