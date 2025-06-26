<template>
  <Suspense
    timeout="3000"
    :onPending="handleMainContentPending"
    :onResolve="handleMainContentResolve"
  >
    <template #default>
      <Suspense
        :onPending="handleComponentAPending"
        :onResolve="handleComponentAResolve"
      >
        <template #default>
          <WithSuspense :time="3000">
            <div class="hero-image-container hidden md:visible">
              <svg
                id="svg"
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                width="240"
                height="240"
              >
                <defs>
                  <pattern
                    id="grid"
                    x="0"
                    y="0"
                    width="6"
                    height="6"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M0,0H6V6"
                      style="stroke: #f1f1f1; fill: none"
                    ></path>
                  </pattern>
                  <path
                    id="circle"
                    ref="circlePath"
                    d="
                    M 120, 120
                    m -100, 0
                    a100,100 0 1,0 200,0
                    a100,100 0 1,0 -200,0
                  "
                  />
                  <path
                    id="circle2"
                    d="
        M 100, 100
        m -75, 0
        a75,75 0 1,0 150,0
        a75,75 0 1,0 -150,0"
                    style="stroke: #000000; fill: #f0f0f5"
                  />
                  <path
                    id="left"
                    d="
        M25, 100
       L100,100"
                    style="stroke: #00ffff"
                  />
                  <path
                    id="right"
                    d="
        M100, 100
       L175,100"
                    style="stroke: #ff00ff"
                  />
                  <path
                    id="top"
                    d="
        M100, 100
       L100,25"
                    style="stroke: #ffff66"
                  />
                  <path
                    id="bottom"
                    d="
        M100, 100
       L100,175"
                    style="stroke: #ccccff"
                  />
                  <path id="smallCircle" d="M10 20a40 40 0 1 1 -1 0"></path>
                  <path id="semi" d="M20 50a50 50 0 1 1 100 0"></path>
                </defs>
                <!--网格背景-->
                <!-- <rect fill="url(#grid)" width="240" height="240"></rect> -->
                <!--文字-->
                <!-- <use xlink:href="#circle" stroke="grey" fill="none"></use> -->
                <!-- <text text-anchor="middle">
                  <textPath xlink:href="#semi" startOffset="50%">
                    Middle
                  </textPath>
                </text>
                <text text-anchor="middle">
                  <textPath xlink:href="#smallCircle">
                    Text
                  </textPath>
                </text> -->
                <!-- <text ref="sinText" x="30" y="240" style="font-size: 16px;">{{ brand }}</text> -->
                <text
                  width="100%" ref="sinText"
                  style="letter-spacing: 3"
                  lengthAdjust="spacingAndGlyphs"
                  font-stretch="expanded"
                >
                  <textPath
                    alignment-baseline="baseline"
                    startOffset="0"
                    :textLength="circlePathLength"
                    xlink:href="#circle"
                    class="text"
                    ref="sinTextPath"
                  >
                    <tspan dx="0" dy="10">𝓒𝓜𝓞𝓝𝓞.𝓝𝓔𝓣</tspan>
                    <animate
                      attributeName="fill"
                      from="#646cff"
                      to="#747bff"
                      dur="3s"
                      repeatCount="indefinite"
                    ></animate>
                    <!-- <animate attributeName="fill-opacity" from="0.01" to="0.99" dur="3s" repeatCount="indefinite">
                    </animate> -->
                    <!-- <animate attributeName="startOffset" from="0" to="3150" dur="6s" repeatCount="indefinite">
                    </animate> -->
                  </textPath>
                </text>
                <!-- <path d="M10,0V20M0,10H20" transform="translate(5,50)" stroke="red" /> -->
              </svg>
            </div>
          </WithSuspense>
        </template>
        <template #fallback>
          <div>
            <CubeLoader />
          </div>
        </template>
      </Suspense>
    </template>
    <template #fallback>
      <div>
        <CubicLoading />
      </div>
    </template>
  </Suspense>
</template>

<script lang="ts" setup>
import { onMounted, useTemplateRef, nextTick, ref } from "vue";
import CubicLoading from "./CubicLoading.vue";
import WithSuspense from "./WithSuspense.vue";
import { delay } from "lodash-es";

const handleMainContentPending = () => {
  console.log("开始加载主内容...");
};
const handleMainContentResolve = () => {
  console.log("主内容加载完成！");
};
const handleComponentAPending = () => {
  console.log("加载组件 A...");
};
const handleComponentAResolve = () => {
  console.log("组件 A 加载完成！");
};

//x = [20,20,20,...]
//y = s*sin(w*x+t);
const brand = "𝓒𝓜𝓞𝓝𝓞.𝓝𝓔𝓣";
const texts = brand.split("");
var n = brand.length;
var x: number[] = [];
var y: number[] = [];
var i = n;
var s = 20;
var w = 0.02;
var t = 0;

const circlePath = useTemplateRef<SVGPathElement>("circlePath");
const sinText = useTemplateRef<SVGTextElement>("sinText");
const sinTextPath = useTemplateRef<SVGTextPathElement>("sinTextPath");

//横向间隔20
while (i--) {
  x.push(5);
  // const sinText = document.querySelector('#svg')
  // var tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
  // tspan.textContent = texts[n - i - 1];
  // sinText?.appendChild(tspan);
  // var h = Math.round(360 / 26 * i);//将颜色均分显示
  // tspan.setAttribute('fill', 'hsl(' + h + ',100%,50%)');
}

//纵向按照sin()函数变化
function arrange(t) {
  y = [];
  var ly = 0,
    cy;
  for (i = 0; i < n; ++i) {
    cy = -s * Math.sin(w * i * 10 + t);
    y.push(cy - ly);
    ly = cy;
  }
}
//将数组转换成字符串并设置为dx,dy值
function render() {
  sinText.value?.setAttribute("dx", x.join(" "));
  sinText.value?.setAttribute("dy", y.join(" "));
}

//动态改变t的值
function frame() {
  t += 0.01;
  arrange(t);
  render();
  window.requestAnimationFrame(frame); //动画效果：递归调用frame方法
}

const circlePathLength = ref(600);

onMounted(async function () {
  console.log("HeroImage onMounted");
  nextTick(function () {
    // frame();
  });
  delay(function () {
    if (circlePath.value && sinTextPath.value) {
      console.log(
        "circlePath.value.getTotalLength",
        circlePath.value.getTotalLength() * window.devicePixelRatio,
      );
      circlePathLength.value = circlePath.value.getTotalLength() + 5 * (texts.length - 2);
    }
  }, 1500);
  // const buffer = await fetch("./fonts/fangyuan.ttf").then((res) =>
  //   res.arrayBuffer(),
  // );

  // const font = opentype.parse(buffer);
  // console.log(font);
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.hero-image-container {
  width: 260px;
  height: 260px;
  display: grid;
  place-content: center;
}

.text {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 4rem;
}
</style>
