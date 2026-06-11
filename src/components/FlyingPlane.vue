<template>
  <!-- 飞机✈️ -->
  <div class="fly">
    <img style="width: 40px" src="/plane.svg" alt="" />
  </div>
</template>

<style lang="scss" scoped>
.fly {
  position: absolute;
  top: 40px;
  left: 0px;
  width: 40px;
  height: 40px;
  border: 1px dashed rgba(50, 0, 0, 0.5);
  offset-path: path("M 80 80 C 160 160 160 160 240 80 S 320 0 400 80");
  offset-anchor: 20px 20px;
  animation: plane-move 4000ms infinite linear;
}

</style>
