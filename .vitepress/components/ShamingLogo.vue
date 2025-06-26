<template>
  <div class="shaming-area" ref="containerRef" @click="handleClick">
    <div class="shaming-container">
      <div class="box"></div>
    </div>
    <img v-show="isShow" class="shaming-logo VPImage image-src" src="/logo.png" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import html2particle from 'html2particle'

const containerRef = ref<HTMLElement>()

let handleClick = () => { }
const isShow = ref(true)
onMounted(() => {
  const { startAnimation } = html2particle(containerRef.value!, {
    type: "ExplodingParticle"
  })
  handleClick = () => {
    isShow.value = false
    startAnimation()
    isShow.value = true
  }
})
// import { onMounted } from "vue";

// onMounted(() => {
//   var elem = document.querySelector(".shaming-container");
//   var isDragging = false; // 用于判断是否正在拖动
//   var initialX = 0; // 初始鼠标X坐标
//   var initialY = 0; // 初始鼠标Y坐标
//   var currentX = 0; // 当前鼠标X坐标
//   var currentY = 0; // 当前鼠标Y坐标
//   var initialRotationY = 0; // 初始旋转角度（Y轴）
//   var initialRotationX = 0; // 初始旋转角度（X轴）

//   if (!elem) {
//     return;
//   }

//   elem.addEventListener("mousedown", function (e) {
//     // 当鼠标按下时
//     initialY = e.clientY; // 获取初始鼠标Y坐标
//     initialRotationY = parseInt(
//       getComputedStyle(elem!)
//         .getPropertyValue("transform")
//         .replace(/[^0-9-.,]/g, "")
//         .split(",")[4]
//     ); // 获取初始旋转角度（Y轴）
//     initialRotationX = parseInt(
//       getComputedStyle(elem!)
//         .getPropertyValue("transform")
//         .replace(/[^0-9-.,]/g, "")
//         .split(",")[5]
//     ); // 获取初始旋转角度（X轴）
//     isDragging = true; // 设置isDragging为true，表示正在拖动
//   });

//   document.addEventListener("mousemove", function (e) {
//     // 当鼠标移动时
//     if (isDragging) {
//       // 如果正在拖动
//       currentY = e.clientY; // 获取当前鼠标Y坐标
//       var dy = currentY - initialY; // Y轴方向移动的距离
//       var newRotationY = initialRotationY + dy * -1; // 根据移动方向计算新的旋转角度（Y轴）
//       console.log(111, dy, newRotationY);

//       elem!.style.transform = "rotateX(" + newRotationY + "deg)"; // 设置元素的旋转角度
//     }
//   });

//   document.addEventListener("mouseup", function () {
//     // 当鼠标松开时
//     isDragging = false; // 设置isDragging为false，表示已经停止拖动
//   });
// });
</script>

<style scoped>
.shaming-area {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shaming-logo {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.shaming-container {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateZ(-150px);
  transform: rotateX(60deg);
  transform-style: preserve-3d;
  width: 300px;
  height: 300px;

  .box {
    width: 300px;
    height: 300px;
    transform-style: preserve-3d;
    position: relative;
    border-radius: 50%;
    border: 5px solid rgb(42, 153, 255);
    border-left-color: transparent;
    border-right-color: transparent;
    outline: 2px solid rgb(42, 153, 255);
    outline-offset: 10px;
    background: repeating-radial-gradient(rgba(42, 153, 255, 0.8),
        #fff 50%,
        transparent 50%,
        transparent 60%,
        rgba(42, 153, 255, 0.8) 60%,
        #fff 100%),
      repeating-conic-gradient(rgb(42, 153, 255) 0,
        rgb(42, 153, 255) 4%,
        transparent 4%,
        transparent 5%);
    animation: rotate2 2s linear infinite;
  }

  // .box::before {
  //   content: "";
  //   position: absolute;
  //   width: 300px;
  //   height: 300px;
  //   top: 0px;
  //   left: 0px;
  //   background: repeating-radial-gradient(
  //       #000,
  //       #000 50%,
  //       transparent 50%,
  //       transparent 60%,
  //       #000 60%,
  //       #000 100%
  //     ),
  //     repeating-conic-gradient(
  //       rgb(42, 153, 255) 0,
  //       rgb(42, 153, 255) 4%,
  //       transparent 4%,
  //       transparent 5%
  //     );
  //   transform: translateZ(200px);
  //   animation: rotate1 2s linear infinite;
  // }
  .box::after {
    content: "";
    position: absolute;
    width: 300px;
    height: 300px;
    top: 0px;
    left: 0px;
    // background: #fff;
    background: repeating-radial-gradient(#000 0 0.0001%, #747bff 0 0.0002%) 50% 0/2500px 2500px,
      repeating-conic-gradient(#000 0 0.0001%, #747bff 0 0.0002%) 50% 50%/2500px 2500px;
    background-blend-mode: difference;
    mix-blend-mode: lighten;
    -webkit-background-clip: text;
    background-clip: text;
    transform-style: preserve-3d;
    background: repeating-linear-gradient(to bottom,
        transparent 0,
        transparent 80px,
        rgba(42, 153, 255, 0.1) 80px,
        rgb(42, 153, 255) 130px);
    mask: repeating-linear-gradient(to right,
        transparent 0px,
        transparent 80px,
        #000 80px,
        #000 82px);
    transform: rotateX(90deg);
    animation: line 2s linear infinite;
  }
}

@keyframes line {
  0% {
    transform: translateZ(-50px) rotateX(90deg) rotateY(0deg);
  }

  100% {
    transform: translateZ(200px) rotateX(90deg) rotateY(-360deg);
  }
}

@keyframes rotate1 {
  0% {
    transform: translateZ(200px) rotateZ(0deg);
  }

  100% {
    transform: translateZ(200px) rotateZ(-720deg);
  }
}

@keyframes rotate2 {
  0% {
    transform: rotateZ(0deg);
  }

  100% {
    transform: rotateZ(360deg);
  }
}
</style>
