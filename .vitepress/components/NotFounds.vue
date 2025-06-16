<template>
  <Container>
    <template v-for="blot in inkBlots" :key="blot.id">
      <InkBlot
        :size="blot.size"
        :style="{
          top: blot.top,
          left: blot.left,
          right: blot.right,
          bottom: blot.bottom,
          animationDelay: blot.delay,
        }"
      />
    </template>
    <Content>
      <Svg404 viewBox="0 0 200 100">
        <path d="M30,80 L30,20 M30,50 L70,10 M70,10 L70,80" />
        <path d="M90,80 C90,20 150,20 150,80 C150,140 90,140 90,80 Z" />
        <path d="M170,80 L170,20 M170,50 L210,10 M210,10 L210,80" />
      </Svg404>

      <Title>页面未寻得</Title>
      <Subtitle>
        所觅之页，如墨入水，散于无形<br />
        或返首页，或观他处，皆可随心
      </Subtitle>

      <Button @click="() => (window.location.href = '/')"> 返回首页 </Button>
    </Content>
  </Container>
</template>

<script setup lang="ts">
import { styled, keyframes } from "@vue-styled-components/core";
import { onMounted, nextTick, ref } from 'vue'

const container_height = ref('30vh')

onMounted(() => {
  nextTick(() => {
    var vpc = document.getElementById("VPContent")
    if (vpc) {
      container_height.value = `${vpc.clientHeight}px`;
    }
  })
})

// 水墨扩散动画
const inkSpread = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 0.2; } /* 降低不透明度避免干扰内容 */
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: ${container_height.value}px;
  background: #f9f5e9;
  position: relative;
  overflow: hidden;
`;

const InkBlot = styled.div`
  position: absolute;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  background: radial-gradient(
    circle,
    rgba(0, 0, 0, 0.08) 0%,
    rgba(0, 0, 0, 0) 70%
  );
  border-radius: 50%;
  animation: ${inkSpread} 3s ease-out forwards;
  z-index: 0;
  pointer-events: none; /* 防止干扰交互 */
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 600px;
`;

const Svg404 = styled.svg`
  width: 200px;
  height: 200px;
  margin-bottom: 2rem;

  path {
    stroke: #333;
    stroke-width: 2;
    fill: none;
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: brushStroke 3s ease-in-out forwards;
  }

  @keyframes brushStroke {
    0% {
      stroke-dashoffset: 1000;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  font-weight: 400;
  margin-bottom: 1rem;
  letter-spacing: 5px;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  line-height: 1.8;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  padding: 12px 32px;
  background: transparent;
  color: #333;
  border: 1px solid #333;
  border-radius: 0;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.02);

    &:before {
      left: 0;
    }
  }
`;

const inkBlots = [
  { id: 1, size: 250, top: "10%", left: "5%", delay: "0s" },
  { id: 2, size: 300, top: "15%", right: "5%", delay: "0.5s" },
  { id: 3, size: 200, bottom: "20%", left: "10%", delay: "1s" },
  { id: 4, size: 350, bottom: "15%", right: "5%", delay: "1.5s" },
  { id: 5, size: 180, top: "60%", left: "15%", delay: "0.8s" },
  { id: 6, size: 220, top: "30%", right: "20%", delay: "1.2s" },
];
</script>
