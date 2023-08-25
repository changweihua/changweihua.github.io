<template>
  <ClientOnly>
    <div class="theme-code-group">
      <div class="theme-code-group__nav">
        <ul class="theme-code-group__ul">
          <li
            v-for="(tab, i) in codeTabs"
            :key="tab.title"
            class="theme-code-group__li"
          >
            <button
              class="theme-code-group__nav-tab"
              :class="{
                'theme-code-group__nav-tab-active': i === activeCodeTabIndex,
              }"
              @click="changeCodeTab(i)"
            >
              {{ tab.title }}
            </button>
          </li>
        </ul>
      </div>
      <slot />
      <pre v-if="codeTabs.length < 1" class="pre-blank"> // 没代码~ </pre>
    </div>
  </ClientOnly>
</template>

<script lang="ts">
export default {
  name: "CodeGroup",
  data() {
    return {
      codeTabs: [],
      activeCodeTabIndex: -1,
    };
  },
  watch: {
    activeCodeTabIndex(index) {
      this.activateCodeTab(index);
    },
  },
  mounted() {
    this.loadTabs();
  },
  methods: {
    changeCodeTab(index) {
      this.activeCodeTabIndex = index;
    },
    async loadTabs() {
      await this.$nextTick();
      this.codeTabs = (this.$slots.default() || [])
        .filter((slot) => Boolean(slot.props))
        .map((slot, index) => {
          if (slot.props.active === "") {
            this.activeCodeTabIndex = index;
          }

          return {
            title: slot.props.title,
            elm: slot.el,
          };
        });

      if (this.activeCodeTabIndex === -1 && this.codeTabs.length > 0) {
        this.activeCodeTabIndex = 0;
      }

      this.activateCodeTab(0);
    },
    activateCodeTab(index) {
      this.codeTabs.forEach((tab) => {
        if (tab.elm) {
          tab.elm.style.display = "none";
        }
      });

      if (this.codeTabs[index]?.elm) {
        this.codeTabs[index].elm.style.display = "block";
      }
    },
  },
};
</script>

<style lang="less" scoped>
/* .theme-code-group {} */
.theme-code-group__nav {
  margin-bottom: -35px;
  background-color: #282c34;
  padding-bottom: 22px;
  border-radius: 6px;
  padding-left: 10px;
  padding-top: 10px;
}
.theme-code-group__ul {
  margin: auto 0;
  padding-left: 0;
  display: flex;
  list-style: none;
}
.theme-code-group__li {
  margin-top: 0;
  margin-right: 10px;
}
.theme-code-group__nav-tab {
  border: 0;
  padding: 5px;
  cursor: pointer;
  background-color: transparent;
  font-size: 0.85em;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}
.theme-code-group__nav-tab-active {
  border-bottom: #42b983 1px solid;
}
.pre-blank {
  color: #42b983;
  margin: 0;
}
</style>
