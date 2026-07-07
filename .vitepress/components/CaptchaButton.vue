<script setup lang="ts">
  import { useCountdown } from "../hooks/useCountdown";
  import { computed, PropType } from "vue";

  const props = defineProps({
    duration: {
      type: Number,
      default: 60
    },
    disabled: {
      type: Boolean,
      default: false
    },
    validateBeforeSendingCode: {
      type: Function as PropType<()=>Promise<boolean>>,
      default: ()=>Promise.resolve(true)
    }
  })
  const { time, isTiming, start } = useCountdown(props.duration);
  const isDisabled = computed(()=>{
    return props.disabled || isTiming.value;
  })
  const handleClick = async () => {
    const res = await props.validateBeforeSendingCode();
    res && start();
  }
</script>

<template>
  <button :disabled="isDisabled" @click="handleClick">
    <slot :time="time" :isTiming="isTiming"></slot>
    <template v-if="!$slots.default">
      {{isTiming ? `${time}s 后重试` : "获取验证码"}}
    </template>
  </button>
</template>

<style scoped>
  button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    background-color: #409eff;
    color: #ffffff;
    font-size: 14px;
    cursor: pointer;
    outline: none;
  }

  button+button {
    margin-left: 10px;
  }

  button:hover {
    background-color: #66b1ff;
  }

  button:active {
    background-color: #288ae2;
  }

  button[disabled] {
    cursor: not-allowed;
    color: #fff;
    background-color: #a0cfff;
    border-color: #a0cfff;
  }
</style>


<!-- <script setup lang="ts">
import { useCountdown } from "../hooks/useCountdown"
// https://code.juejin.cn/api/raw/7445202794878861348?id=7445202794878877732
const handleCountdownEnd = () => {
  reset(); // 重置倒计时
  // do something
  // 跳转逻辑
}
const { time, reset, start } = useCountdown(3, handleCountdownEnd);
start();
</script>

<template>
  <button @click="handleCountdownEnd">{{time}}s 自动跳转登录</button>
</template>

<style scoped>

</style> -->

