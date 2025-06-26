<template>
  <div class="marquee-wrapper">
    <template v-for="line in lines">
      <div class="marquee">
        <div class="marquee__group">
          <template v-for="icon in icons.slice((line - 1) * lineCount, line * lineCount)">
            <m-icon class="item" :icon="icon" :width="96" :height="96" />
          </template>
        </div>
        <div class="marquee__group">
          <template v-for="icon in icons.slice((line - 1) * lineCount, line * lineCount)">
            <m-icon class="item" :icon="icon" :width="96" :height="96" />
          </template>
        </div>
      </div>
    </template>
    <!-- <div class="marquee">
      <div class="marquee__group">
        <m-icon class="item" icon="logos:mono" :width="96" :height="96" />
        <m-icon class="item" icon="logos:grafana" :width="96" :height="96" />
        <m-icon class="item" icon="logos:gravatar" :width="96" :height="96" />
        <m-icon class="item" icon="logos:gradle" :width="96" :height="96" />
        <m-icon class="item" icon="logos:postman" :width="96" :height="96" />
        <m-icon class="item" icon="logos:jenkins" :width="96" :height="96" />
        <m-icon class="item" icon="logos:github-octocat" :width="96" :height="96" />
        <m-icon class="item" icon="logos:gitlab" :width="96" :height="96" />
        <m-icon class="item" icon="logos:git" :width="96" :height="96" />
        <m-icon class="item" icon="logos:github-actions" :width="96" :height="96" />
      </div>
      <div class="marquee__group" aria-hidden="true">
        <m-icon class="item" icon="logos:mono" :width="96" :height="96" />
        <m-icon class="item" icon="logos:grafana" :width="96" :height="96" />
        <m-icon class="item" icon="logos:gravatar" :width="96" :height="96" />
        <m-icon class="item" icon="logos:gradle" :width="96" :height="96" />
        <m-icon class="item" icon="logos:postman" :width="96" :height="96" />
        <m-icon class="item" icon="logos:jenkins" :width="96" :height="96" />
        <m-icon class="item" icon="logos:github-octocat" :width="96" :height="96" />
        <m-icon class="item" icon="logos:gitlab" :width="96" :height="96" />
        <m-icon class="item" icon="logos:git" :width="96" :height="96" />
        <m-icon class="item" icon="logos:github-actions" :width="96" :height="96" />
      </div>
    </div> -->
  </div>

</template>

<script lang="ts" setup>
import { computed } from 'vue'


interface Props {
  msg?: (string | number | boolean),
  title?: string[]
  lines?: number
  icons?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  msg: 'hello',
  title: () => ['one', 'two'],
  icons: [],
  lines: 3
})

const lineCount = computed(() => Math.round(props.icons.length / props.lines))

</script>

<style scoped>
.marquee-wrapper {
  --logo-width: 96px;
  --logo-height: 96px;
  --gap: calc(var(--logo-width) / 14);
  --duration: 60s;
  --scroll-start: 0;
  --scroll-end: calc(-100% - var(--gap));

  display: flex;
  flex-direction: column;
  gap: var(--gap);
  margin: auto;
  max-width: 100vw;
}

.marquee {
  display: flex;
  overflow: hidden;
  user-select: none;
  gap: var(--gap);
  mask-image: linear-gradient(to right,
      hsl(0 0% 0% / 0),
      hsl(0 0% 0% / 1) 20%,
      hsl(0 0% 0% / 1) 80%,
      hsl(0 0% 0% / 0));
}

.marquee__group {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: var(--gap);
  min-width: 100%;
  animation: scrollLeft var(--duration) linear infinite;
}

.wrapper .marquee:nth-child(even) {
  margin-left: calc(var(--logo-width) / -2);
}

.item {
  width: var(--logo-width);
  height: var(--logo-height);
  border-radius: 6px;
}

@keyframes scrollLeft {
  from {
    transform: translateX(var(--scroll-start));
  }

  to {
    transform: translateX(var(--scroll-end));
  }
}
</style>
