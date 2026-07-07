<template>
  <div class="card_box" :data-content="content" :style="{ '--dynamic-content': title }">
    <span></span>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface Props {
  title: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "标题",
});

const content = ref(props.title);
</script>

<style scoped>
.card_box {
  width: 200px;
  height: 250px;
  border-radius: 20px;
  background-image: linear-gradient(
    43deg,
    #4158d0 0%,
    #c850c0 46%,
    #ffcc70 100%
  );
  position: relative;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.55);
  cursor: pointer;
  transition: all 0.3s;
}

.card_box:hover {
  transform: scale(0.95);
}

.card_box span {
  position: absolute;
  overflow: hidden;
  width: 150px;
  height: 150px;
  top: -10px;
  left: -10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card_box span::before {
  content: attr(data-content);
  position: absolute;
  width: 150%;
  height: 40px;
  background-image: linear-gradient(
    45deg,
    #ff6547 0%,
    #ffb144 51%,
    #ff7053 100%
  );
  transform: rotate(-45deg) translateY(-20px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.23);
}

.card_box span::after {
  content: "";
  position: absolute;
  width: 10px;
  bottom: 0;
  left: 0;
  height: 10px;
  z-index: -1;
  box-shadow: 140px -140px #cc3f47;
  background-image: linear-gradient(
    45deg,
    #ff512f 0%,
    #f09819 51%,
    #ff512f 100%
  );
}
</style>
