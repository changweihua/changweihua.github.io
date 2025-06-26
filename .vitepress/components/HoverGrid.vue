<template>
  <div class="box-container">
    <div class="box">
      <div class="col">
        <div class="element">
          <div class="mask">
          </div>
        </div>
      </div>
      <div class="col">
        <div class="element">
          <div class="mask"></div>
        </div>
      </div>
      <div class="col">
        <div class="element">
          <div class="mask"></div>
        </div>
      </div>
      <div class="col">
        <div class="element">
          <div class="mask"></div>
        </div>
      </div>
      <div class="col">
        <div class="element">
          <div class="mask"></div>
        </div>
      </div>
      <div class="col">
        <div class="element">
          <div class="mask"></div>
        </div>
      </div>
      <div class="col">
        <div class="element">
          <div class="mask"></div>
        </div>
      </div>
      <div class="col">
        <div class="element">
          <div class="mask"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
var elements = document.getElementsByClassName("element");

// 添加鼠标移动事件监听器
document.addEventListener("mousemove", function (event) {
  // 获取鼠标位置
  var mouseX = event.pageX;
  var mouseY = event.pageY;

  // 遍历元素并输出距离鼠标的坐标
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    var rect = element.getBoundingClientRect();
    var elementX = rect.left + window.pageXOffset;
    var elementY = rect.top + window.pageYOffset;

    var distanceX = mouseX - elementX;
    var distanceY = mouseY - elementY;
    (element as HTMLDivElement).style.setProperty('--x', distanceX + 'px');
    (element as HTMLDivElement).style.setProperty('--y', distanceY + 'px');
  }
});

</script>

<style scoped>
.box-container {
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #0D1428;
}

.box {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

.col {
  width: calc((100% - 4 * 20px) / 4);
  height: 180px;
  padding: 10px;
}

.element {
  background: #172033;
  height: 100%;
  position: relative;
  border-radius: 10px;
}

.element::before {
  content: '';
  position: absolute;
  width: calc(100% + 3px);
  height: calc(100% + 3px);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 10px;
  background: radial-gradient(250px circle at var(--x) var(--y), var(--vp-c-brand) 0, transparent 100%);
  ;
}

.element .mask {
  position: absolute;
  inset: 3px;
  background: #172033;
  border-radius: 10px;

}
</style>
