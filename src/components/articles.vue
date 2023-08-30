<template>
  <div class="home-wrapper">
    <div v-for="item in list" :key="item" class="home-item">{{ item }}</div>
  </div>
  <a-button>123</a-button>
  <div>
    Text
    <a-divider type="vertical" />
    <a href="#">Link</a>
    <a-divider type="vertical" />
    <a href="#">Link</a>
  </div>
</template>

<script lang="ts" setup>
const list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
</script>

<style lang="less" scoped>
.home-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}
.home-item {
  vertical-align: middle;
  margin: 4px 4px 10px;
  padding: 4px 8px;
  font-weight: bolder;
  display: inline-block;
  cursor: pointer;
  border-radius: 2px;
  line-height: 13px;
  font-size: 13px;
  box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.5s;
}
</style>
