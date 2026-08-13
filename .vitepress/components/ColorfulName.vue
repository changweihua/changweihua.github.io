<template>
  <canvas ref="canvas"></canvas>
</template>

<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue";

const canvasRef = useTemplateRef<HTMLCanvasElement>("canvas");

// 存储所有粒子
let particles: Array<Particle> = [];

function resizeCanvasSize() {
  if (canvasRef.value) {
    const canvas = canvasRef.value;
    const dpr = window.devicePixelRatio || 1;

    const ctx = canvasRef.value.getContext("2d");

    if (ctx) {
      // 获取 css 的宽高
      const { width: cssWidth, height: cssHeight } =
        canvas.getBoundingClientRect();
      // 根据 dpr，扩大 canvas 画布的像素，使 1 个 canvas 像素和 1 个物理像素相等
      canvas.width = dpr * cssWidth;
      canvas.height = dpr * cssHeight;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      ctx.scale(dpr, dpr);
    }
    return {
      width: canvas.width,
      height: canvas.height,
    };
  }

  return {
    width: 0,
    height: 0,
  };
}

/**
 * 创建文字粒子
 * @param {string} text - 要显示的文字
 */
function createTextParticles(text: string) {
  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext("2d");

    if (!ctx) {
      return;
    }
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    const canvas = canvasRef.value;

    // 清空现有粒子
    particles = [];

    // 绘制文字(用于获取像素数据)
    ctx.fillStyle = "#fff";
    ctx.font = "20px";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // 获取像素数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 根据像素数据创建粒子
    // 每隔4个像素采样一次,减少粒子数量
    for (let y = 0; y < canvas.height; y += 4) {
      for (let x = 0; x < canvas.width; x += 4) {
        const index = (y * canvas.width + x) * 4;
        const alpha = data[index + 3]; // 获取alpha通道值

        // 只在不透明的像素位置创建粒子
        if (alpha > 128) {
          particles.push(new Particle(x, y, canvas.width, canvas.height));
        }
      }
    }
  }
}

// 动画循环
function animate() {
  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext("2d");
    const canvas = canvasRef.value;

    if (!ctx) {
      return;
    }
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    // 创建半透明背景实现拖尾效果
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 更新和绘制所有粒子
    particles.forEach((particle) => {
      particle.update();
      particle.draw(ctx);
    });

    requestAnimationFrame(animate);
  }
}

onMounted(() => {
  if (canvasRef.value) {
    resizeCanvasSize();

    // 初始化文字
    createTextParticles("CMONO.NET");

    // 启动动画
    animate();
    const ctx = canvasRef.value.getContext("2d");

    if (!ctx) {
      return;
    }
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    const canvas = canvasRef.value;
    // 点击切换文字
    canvas.addEventListener("click", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      createTextParticles("2025，新希望，新起点，向前行");
    });
  }
});

/**
 * 粒子类 - 管理单个粒子的属性和行为
 */
class Particle {
  private targetX: number;
  private targetY: number;
  private currentX: number;
  private currentY: number;
  private size: number;
  private speed: number;
  private color: string;

  constructor(x: number, y: number, canvasWidth: number, canvasHeight: number) {
    // 目标位置(文字轮廓上的点)
    this.targetX = x;
    this.targetY = y;

    // 当前位置(随机分布在画布上)
    this.currentX = Math.random() * canvasWidth;
    this.currentY = Math.random() * canvasHeight;

    // 粒子属性
    this.size = 2; // 粒子大小
    this.speed = 0.05; // 移动速度(0-1之间)
    this.color = `hsl(${Math.random() * 360}, 50%, 50%)`; // 随机颜色
  }

  public update() {
    // 使用线性插值实现平滑移动
    // 新位置 = 当前位置 + (目标位置 - 当前位置) * 速度
    this.currentX += (this.targetX - this.currentX) * this.speed;
    this.currentY += (this.targetY - this.currentY) * this.speed;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.currentX, this.currentY, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
</script>

<style scoped>
canvas {
  display: block;
  width: 100%;
  height: 160px;
}
</style>
