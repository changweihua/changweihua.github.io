<template>
  <div id="anime1" style="width: 50px;height: 50px;background: red;"></div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
import { animate } from 'animejs';

onMounted(function(){
  animate('#anime1',{
    translateX: 50,
    rotate: '1turn',
    backgroundColor: 'blue',
    duration: 800
  });
})
</script>
