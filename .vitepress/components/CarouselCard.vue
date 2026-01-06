<template>
  <div>
    <h1 class="about-title">Gallery</h1>

    <div class="carousel-container" ref="carouselContainer">
      <button class="nav-arrow left" @click="handlePrevlick">‹</button>
      <div class="carousel-track">
        <template v-for="(item, index) in teamItems">
          <div class="card">
            <img :src="item.cover" :alt="item.description" />
          </div>
        </template>
      </div>
      <button class="nav-arrow right" @click.prevent="handleNextlick">›</button>
    </div>

    <div class="member-info">
      <h2 class="member-name">{{ currentItem?.title }}</h2>
      <p class="member-role">{{ currentItem?.description }}</p>
    </div>

    <div class="dots">
      <div
        v-for="(_item, index) in teamItems"
        :class="`dot ${index === currentIndex ? 'active' : ''}`"
        @click.prevent="updateCarousel(index)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from "vue";

interface GalleryItem {
  title: string;
  description: string;
  cover: string;
}

const carouselContainer = useTemplateRef<HTMLDivElement>("carouselContainer");

const currentItem = ref<GalleryItem | null>(null);
const teamItems = ref<Array<GalleryItem>>([
  {
    title: "Windows",
    description: "开发平台",
    cover: "/images/macwallpaper.jpg",
  },
  {
    title: "数智机器人",
    description: "扬州泰州国际机场数智人",
    cover: "/images/robot_welcome.png",
  },
  {
    title: "手持终端",
    description: "无锡硕放机场手持终端",
    cover: "/images/cmono-微信图片_20240816150009.png",
  },
  {
    title: "智慧出行小程序",
    description: "扬州泰州国际机场智慧出行小程序",
    cover: "/images/cmono-微信图片_20230718132006.jpg",
  },
  {
    title: "GitOps",
    description: "自动化运维平台",
    cover: "/images/cmono-93a13ef7ec982bab46d5792fb65c09c.png",
  },
  {
    title: "智慧机场运行平台",
    description: "智慧机场运行平台",
    cover: "/images/digital_airport.png",
  },
]);

const currentIndex = ref(3);
let isAnimating = false;

let touchStartX = 0;
let touchEndX = 0;

onMounted(() => {
  // document.addEventListener("keydown", (e) => {
  //   if (e.key === "ArrowLeft") {
  //     updateCarousel(currentIndex - 1);
  //   } else if (e.key === "ArrowRight") {
  //     updateCarousel(currentIndex + 1);
  //   }
  // });

  // document.addEventListener("touchstart", (e) => {
  //   touchStartX = e.changedTouches[0].screenX;
  // });

  // document.addEventListener("touchend", (e) => {
  //   touchEndX = e.changedTouches[0].screenX;
  //   handleSwipe();
  // });

  updateCarousel(0);
});

function handlePrevlick() {
  updateCarousel(currentIndex.value - 1);
}

function handleNextlick() {
  updateCarousel(currentIndex.value + 1);
}

function updateCarousel(newIndex: number) {
  if (isAnimating) return;
  isAnimating = true;

  currentIndex.value =
    (newIndex + teamItems.value.length) % teamItems.value.length;

  const cards = carouselContainer.value!.querySelectorAll(".card");

  cards.forEach((card, i) => {
    const offset =
      (i - currentIndex.value + cards.length) % teamItems.value.length;

    card.classList.remove(
      "center",
      "left-1",
      "left-2",
      "right-1",
      "right-2",
      "hidden"
    );

    if (offset === 0) {
      card.classList.add("center");
    } else if (offset === 1) {
      card.classList.add("right-1");
    } else if (offset === 2) {
      card.classList.add("right-2");
    } else if (offset === cards.length - 1) {
      card.classList.add("left-1");
    } else if (offset === cards.length - 2) {
      card.classList.add("left-2");
    } else {
      card.classList.add("hidden");
    }
  });

  currentItem.value = teamItems.value[currentIndex.value];

  // memberName.style.opacity = "0";
  // memberRole.style.opacity = "0";

  // setTimeout(() => {
  //   memberName.textContent = teamMembers[currentIndex].name;
  //   memberRole.textContent = teamMembers[currentIndex].role;
  //   memberName.style.opacity = "1";
  //   memberRole.style.opacity = "1";
  // }, 300);

  setTimeout(() => {
    isAnimating = false;
  }, 800);
}

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      updateCarousel(currentIndex.value + 1);
    } else {
      updateCarousel(currentIndex.value - 1);
    }
  }
}
</script>

<style scoped>
.about-title {
  font-size: 6rem;
  font-weight: 800;
  text-transform: uppercase;
  top: 45px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  white-space: nowrap;
  background: linear-gradient(
    to bottom,
    var(--vp-c-brand-1, rgb(8 42 123 / 35%)) 30%,
    var(--vp-c-brand-3, rgb(255 255 255 / 0%)) 76%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.carousel-container {
  width: 100%;
  max-width: 1200px;
  height: 450px;
  position: relative;
  perspective: 1000px;
  margin-top: 80px;
}

.carousel-track {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.card {
  position: absolute;
  width: 280px;
  height: 380px;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.card.center {
  z-index: 10;
  transform: scale(1.1) translateZ(0);
}

.card.center img {
  filter: none;
}

.card.left-2 {
  z-index: 1;
  transform: translateX(-400px) scale(0.8) translateZ(-300px);
  opacity: 0.7;
}

.card.left-2 img {
  filter: grayscale(100%);
}

.card.left-1 {
  z-index: 5;
  transform: translateX(-200px) scale(0.9) translateZ(-100px);
  opacity: 0.9;
}

.card.left-1 img {
  filter: grayscale(100%);
}

.card.right-1 {
  z-index: 5;
  transform: translateX(200px) scale(0.9) translateZ(-100px);
  opacity: 0.9;
}

.card.right-1 img {
  filter: grayscale(100%);
}

.card.right-2 {
  z-index: 1;
  transform: translateX(400px) scale(0.8) translateZ(-300px);
  opacity: 0.7;
}

.card.right-2 img {
  filter: grayscale(100%);
}

.card.hidden {
  opacity: 0;
  pointer-events: none;
}

.member-info {
  text-align: center;
  margin-top: 40px;
  transition: all 0.5s ease-out;
}

.member-name {
  color: var(--vp-c-brand, rgb(8, 42, 123));
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  position: relative;
  display: inline-block;
}

.member-name::before,
.member-name::after {
  content: "";
  position: absolute;
  top: 100%;
  width: 100px;
  height: 2px;
  background: var(--vp-c-brand-3, rgb(8, 42, 123));
}

.member-name::before {
  left: -120px;
}

.member-name::after {
  right: -120px;
}

.member-role {
  color: var(--vp-c-text-2, #848696);
  font-size: 1.5rem;
  font-weight: 500;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 10px 0;
  margin-top: -15px;
  position: relative;
}

.dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 60px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--vp-c-brand-3, rgba(8, 42, 123, 0.2));
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  background: var(--vp-c-brand, rgb(8, 42, 123));
  transform: scale(1.2);
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: var(--vp-c-brand-2, rgba(8, 42, 123, 0.6));
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;
  transition: all 0.3s ease;
  font-size: 1.5rem;
  border: none;
  outline: none;
  padding-bottom: 4px;
}

.nav-arrow:hover {
  background: var(--vp-c-brand, rgba(0, 0, 0, 0.8));
  transform: translateY(-50%) scale(1.1);
}

.nav-arrow.left {
  left: 20px;
  padding-right: 3px;
}

.nav-arrow.right {
  right: 20px;
  padding-left: 3px;
}

@media (max-width: 768px) {
  .about-title {
    font-size: 4.5rem;
  }

  .card {
    width: 200px;
    height: 280px;
  }

  .card.left-2 {
    transform: translateX(-250px) scale(0.8) translateZ(-300px);
  }

  .card.left-1 {
    transform: translateX(-120px) scale(0.9) translateZ(-100px);
  }

  .card.right-1 {
    transform: translateX(120px) scale(0.9) translateZ(-100px);
  }

  .card.right-2 {
    transform: translateX(250px) scale(0.8) translateZ(-300px);
  }

  .member-name {
    font-size: 2rem;
  }

  .member-role {
    font-size: 1.2rem;
  }

  .member-name::before,
  .member-name::after {
    width: 50px;
  }

  .member-name::before {
    left: -70px;
  }

  .member-name::after {
    right: -70px;
  }
}
</style>
