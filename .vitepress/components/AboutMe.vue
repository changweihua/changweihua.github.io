<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from "vue";
const list = ref([
  "让心灵在青山绿水间悠然旅行",
  "带你领略大自然的鬼斧神工",
  "邂逅千年古城与浪漫小镇",
]);
const divEl = useTemplateRef<HTMLDivElement>("wrap");
const cur = ref(0);
const isDown = ref(true); // 是否向下滑动滚轮
let isAnimate = false;
onMounted(() => {
  // https://developer.mozilla.org/zh-CN/docs/Web/API/Element/wheel_event
  divEl.value?.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      if (!e.deltaY || isAnimate) return;
      isAnimate = true;
      const length = list.value.length;
      if (e.deltaY > 0) {
        // 向下滚：e.deltaY > 0
        isDown.value = true;
        cur.value = cur.value === length - 1 ? 0 : cur.value + 1;
      } else {
        // 向上滚
        isDown.value = false;
        cur.value = cur.value === 0 ? length - 1 : cur.value - 1;
      }
    },
    true
  );
});

function onAfterEnter() {
  isAnimate = false;
}
</script>

<template>
  <div class="wrap" ref="wrap">
    <transition-group name="item" @after-enter="onAfterEnter">
      <template v-for="(item, index) in list" :key="item">
        <div
          class="item"
          v-show="index === cur"
          :class="[isDown ? 'down' : 'up']"
        >
          <transition name="msg" appear>
            <h2 v-show="index === cur">{{ list[index] }}</h2>
          </transition>
          <div class="img" :class="'img' + index"></div>
        </div>
      </template>
    </transition-group>
  </div>
</template>

<style scoped>

.wrap {
  height: 100vh;
  overflow: hidden;
}

.item {
  position: absolute;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.down {
  top: 0;
}

.up {
  bottom: 0;
}

.item h2 {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50%;
  transform: translate(-50%, -50%);
  font-size: 7vw;
  color: aliceblue;
  text-shadow: 2px 2px 16px black;
}

.item .img {
  width: 100%;
  height: 100vh;
}

.img0 {
  background-image: linear-gradient(
    45deg,
    #ff9a9e 0%,
    #fad0c4 99%,
    #fad0c4 100%
  );
}

.img1 {
  background-image: linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%);
}

.img2 {
  background-image: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%);
}

.item-leave-to {
  height: 0;
  z-index: 1;
}

.down.item-enter-from {
  opacity: 0;
  transform: translateY(20%);
}

.up.item-enter-from {
  opacity: 0;
  transform: translateY(-20%);
}

.item-enter-active,
.item-leave-active {
  transition: height 2s ease, transform 1s ease;
}

.msg-enter-from {
  opacity: 0;
  transform: translate(-55%, -50%) !important;
}

.msg-leave-to {
  opacity: 0;
}

.msg-enter-active,
.msg-leave-active {
  transition: opacity 2s ease-in, transform 0.5s ease 2s;
}
</style>
