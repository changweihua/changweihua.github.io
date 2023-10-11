<template>
  <!-- index.html -->
  <div class="banner">
    <p>渐变</p>
    <p>边框</p>
  </div>
</template>

<style lang="less" scoped>
.banner {
  background: url("/border.svg");

  width: 300px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

p {
  font-weight: bolder;
  font-size: 400%;
  margin: 0;
  line-height: 95%;
}

p:first-child {
  color: #d63c45;
}

p:last-child {
  color: #833ab4;
}
</style>
