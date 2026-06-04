import { defineAsyncComponent } from "vue";

const asyncComponent = defineAsyncComponent(async () => {
  // 可以将异步逻辑放在这里，通过store连接起来
  // 这里为了方便，就模拟一个时间相同的setTimeout
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(void(0));
    }, 6000);
  });

  return import("./AnimatedLogo.vue");
});

export default asyncComponent;

