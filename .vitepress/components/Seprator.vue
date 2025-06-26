<template>
  <div class="Box d-inline-flex flex-column">
    <button
      type="submit"
      class="color-fg-muted ajax-pagination-btn no-underline pb-0 pt-2 px-4 mt-0 mb-1 color-bg-default border-0"
    >
      182 hidden items
    </button>
    <button
      type="submit"
      class="ajax-pagination-btn no-underline pb-1 pt-0 px-4 mt-0 mb-1 color-bg-default border-0"
      data-disable-with="Loading…"
    >
      Load more…
    </button>
  </div>
</template>

<style lang="less" scoped>
.discussion-item-header:last-child {
  padding-bottom: 0;
}
.discussion-item-header {
  color: var(--fgColor-muted, var(--color-fg-muted));
  word-wrap: break-word;
}
.pt-0 {
  padding-top: 0 !important;
}

.Box {
  background-color: var(--bgColor-default);
  border-color: var(--borderColor-default);
  border-radius: var(--borderRadius-medium);
  border-style: solid;
  border-width: var(--borderWidth-thin);
}
.d-inline-flex {
  display: inline-flex !important;
}
.flex-column {
  flex-direction: column !important;
}
</style>
