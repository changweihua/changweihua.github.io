<template>
  <div class="hero-image-container">
    <svg class="text-ring" width="100%" height="100%" viewBox="-256 -256 1536 1536">
      <defs>
        <path id="circle" d=" M .5,512 a 512,512 0 1,1 1024,0 512,512 0 1,1 -1024,0 " />
      </defs>
      <text width="100%" lengthAdjust="spacingAndGlyphs" font-stretch="expanded">
        <textPath alignment-baseline="top" textLength="3216" xlink:href="#circle" class="text">
          CSS & SVG are awesome | CSS & SVG are awesome |
        </textPath>
      </text>
    </svg>
  </div>
</template>

<script lang="ts" setup>

</script>

<style lang="less" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.hero-image-container {
  width: 300px;
  height: 300px;
  display: grid;
  place-content: center;
}

.text-ring {
  display: block;
  width: 50vw;
  aspect-ratio: 1;
}

text {
  font-family: "Courier New", Courier, monospace;
  font-weight: 900;
  text-transform: uppercase;
  font-size: 8rem;
}
</style>
