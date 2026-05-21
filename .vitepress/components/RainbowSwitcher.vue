<template>
  <button class="VPSwitch flex items-center justify-center" type="button" role="switch">
    <span class="check flex items-center justify-center">
      <span v-if="$slots.default" class="icon flex items-center justify-center">
        <slot />
      </span>
    </span>
  </button>
</template>

<style scoped>
.VPSwitch {
  position: relative;
  border-radius: 11px;
  display: block;
  /* width: 40px;
  height: 22px; */
  flex-shrink: 0;
  /* border: 1px solid var(--vp-input-border-color);
  background-color: var(--vp-input-switch-bg-color); */
  transition: border-color 0.25s !important;
}

.check {
  /* position: absolute;
  top: 1px;
  left: 1px; */
  /* width: 18px;
  height: 18px; */
  border-radius: 50%;
  /* background-color: var(--vp-c-neutral-inverse); */
  box-shadow: var(--vp-shadow-1);
  transition: transform 0.25s !important;
}

.icon {
  position: relative;
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  overflow: hidden;
}
</style>
