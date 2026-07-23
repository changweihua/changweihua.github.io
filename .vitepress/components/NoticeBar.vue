<template>
    <div class="sound flex w-[380px] s:w-[500px] md:w-[900px] lg:w-[1200px]">
        <div class="box">
            <p class="text" id="myParagraph">
                欢迎来到「CMONO.NET」，一个小小的赞和留言也是博主最大的动力
            </p>
        </div>
    </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  text-decoration: none;
  list-style: none;
  background-repeat: no-repeat;
}

.sound {
  height: 38px;
  background-color: var(--vp-c-brand-light, #e9e4f5);
  opacity: 0.65;
  color: var(--vp-c-text);
  border-radius: 20px;
  margin: 20px auto;
  gap: 10px;
  overflow: hidden;
  line-height: 37px;
  align-items: center;
}

.sound .box {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.text {
  animation: slideLeft 20s linear infinite;
  display: inline-block;
  white-space: nowrap;
  left: 100%;
  top: 0;
  position: absolute;
  cursor: pointer;
}

.text:hover {
  animation-play-state: paused;
}

</style>
