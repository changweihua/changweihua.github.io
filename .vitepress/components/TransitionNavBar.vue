<template>
  <main>
    <nav>
      <a
        href="javascript:void(0);"
        @click.prevent="handleLinkClick"
        :ref="(el) => setLinkRef(el, 0)"
        class="active"
        style="view-transition-name: nav-1"
        >Home</a
      >
      <a
        href="javascript:void(0);"
        @click.prevent="handleLinkClick"
        :ref="(el) => setLinkRef(el, 1)"
        style="view-transition-name: nav-2"
        >Projects</a
      >
      <a
        href="javascript:void(0);"
        @click.prevent="handleLinkClick"
        :ref="(el) => setLinkRef(el, 2)"
        style="view-transition-name: nav-3"
        >About</a
      >
    </nav>
  </main>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const setLinkRefList = ref<HTMLElement[]>([]);
const setLinkRef = (el: any, index: number) => {
  if (el) {
    setLinkRefList.value[index] = el as HTMLElement;
  }
};

function handleLinkClick(event: any) {
  if (!document.startViewTransition) {
    setActiveItem(event.target);
    return;
  }

  document.startViewTransition(() => setActiveItem(event.target));
}

function setActiveItem(element: HTMLElement) {
  setLinkRefList.value.forEach((link) => link.classList.remove("active"));
  element.classList.add("active");
}
</script>

<style scoped>
@layer base {
  html,
  body {
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: system-ui;
  }

  main {
    background: black;
    height: 100%;
    display: grid;
    place-items: center;
    background: #21212a;
    color: white;
    text-align: center;
  }

  nav {
    border-radius: 1.25rem;
    background-color: #111;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #eee;
    justify-content: center;
    flex-wrap: wrap;
  }

  a {
    padding: 0.5rem 1rem;
    position: relative;
    color: white;
    isolation: isolate;
    text-decoration: none;

    &.active {
      &::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image: linear-gradient(to right, #6a11cb 0%, #2575fc 100%);
        z-index: -1;
        border-radius: 0.75rem;
      }
    }
  }
}

@layer blogpost {
  @media not (prefers-reduced-motion) {
    :root {
      --bounce: linear(
        0,
        0.271 8.8%,
        0.542 19.9%,
        0.837 34.2%,
        1 44.7%,
        0.943 51.1%,
        0.925 57.5%,
        0.937 63.1%,
        1 77.4%,
        0.991 84.2%,
        1
      );
    }

    a {
      view-transition-class: nav-item;

      &.active {
        &::before {
          view-transition-name: active-nav-elem;
        }
      }
    }

    ::view-transition-old(active-nav-elem),
    ::view-transition-new(active-nav-elem) {
      height: 100%;
    }

    ::view-transition-group(active-nav-elem) {
      animation-timing-function: var(--bounce);
      animation-duration: 0.375s;
    }

    ::view-transition-group(.nav-item) {
      z-index: 1;
    }

    /*
  Remove the comment if your browser doesn't support `view-transition-class` yet
  👉 https://caniuse.com/mdn-css_properties_view-transition-class

  ::view-transition-group(nav-1) {
    z-index: 1;
  }
  ::view-transition-group(nav-2) {
    z-index: 1;
  }
  ::view-transition-group(nav-3) {
    z-index: 1;
  }
  */
  }
}
</style>
