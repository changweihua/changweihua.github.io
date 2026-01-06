<template></template>
<script setup lang="ts">
import { onMounted } from "vue";
import "driver.js/dist/driver.css";
import { driver, DriveStep } from "driver.js";

interface IGuidance {
  storageName?: string;
  steps: DriveStep[];
}

const props = withDefaults(defineProps<IGuidance>(), {
  storageName: "driver",
  steps: () => [],
});

onMounted(() => {
  let flag = localStorage.getItem(props.storageName);
  if (!flag) {
    showTips();
  }
});

function showTips() {
  const driverObj = driver({
    showProgress: true,
    overlayColor: "red", //遮罩颜色
    steps: props.steps,
    showButtons: ["next", "previous"],
    nextBtnText: "下一步",
    prevBtnText: "上一步",
    doneBtnText: "完成",
    popoverClass: "customer-popover",
    onPopoverRender: (popover, { config, state }) => {
      const firstButton = document.createElement("button");
      firstButton.classList.add("pass-btn");
      firstButton.innerText = "跳过";
      popover.footerButtons.appendChild(firstButton);
      firstButton.addEventListener("click", () => {
        driverObj.destroy();
      });
    },
    onNextClick: () => {
      // Implement your own functionality here
      driverObj.moveNext();
    },
    onPrevClick: () => {
      // Implement your own functionality here
      driverObj.movePrevious();
    },
    onCloseClick: () => {
      // Implement your own functionality here
      driverObj.destroy();
    },
    onDestroyStarted: () => {
      driverObj.destroy();
    },
  });

  driverObj.drive();
}

// const driver =  Driver({
//   animate: true,
//   opacity: 0.75,
//   padding: 5,
//   showButtons: true,
//   closeButtonText: '关闭',
//   prevButtonText: '上一步',
//   nextButtonText: '下一步'
// });

// driver.defineSteps([{
//   element: '#id1',
//   popover: {
//     title: 'title',
//     description: 'description',
//     position: 'left'
//   }
// }])
// driver.start()

// driver.highlight({
//   element: '#id2',
//   popover: {
//     title: 'title',
//     description: 'description',
//     position: 'left'
//   }
// })
</script>

<style>
.customer-popover {
  min-width: 360px;
  max-width: 500px;
  padding: 22px;
  .driver-popover-next-btn,
  .driver-popover-prev-btn,
  .pass-btn {
    color: #fff;
    background-color: #2774e9;
    border-color: #2774e9;
    height: 32px;
    padding: 0 15px;
    font-size: 16px;
    border-radius: 6px;
    text-shadow: inherit;
    &:hover,
    &:focus {
      background-color: #2774e9;
    }
  }
  .driver-popover-description {
    margin-bottom: 20px;
    margin-top: 20px !important;
  }
}
</style>
