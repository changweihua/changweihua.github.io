<script setup lang="ts">
import { ref } from 'vue'
import { useData } from 'vitepress'

const defaultAuthor = 'changweihua'
const { frontmatter } = useData()

const contributorsArr = [frontmatter.value?.author, ...frontmatter.value.contributors || []].filter(x => x)
const contributors = ref(contributorsArr)

function reName(name: string) {
  return name === 'changweihua' ? 'changweihua' : name
}

function getAvatarUrl(name: string) {
  return `https://github.com/${reName(name)}.png`
}
function getGithubLink(name: string) {
  return `https://github.com/${reName(name)}`
}

function isNotEmpty(arr: string | string[]) {
  return Array.isArray(arr) && arr.length
}
</script>

<template>
  <div v-if="isNotEmpty(contributors)" class="flex flex-wrap gap-4">
    <div v-for="contributor of contributors" :key="contributor" class="flex gap-2 items-center">
      <a :href="getGithubLink(contributor)" rel="noreferrer" target="_blank">
        <img :src="getAvatarUrl(contributor)" class="avator w-8 h-8 rounded-full">
      </a>
      {{ contributor }}
    </div>
  </div>
  <div v-else class="flex gap-2 items-center">
    <a :href="getGithubLink(defaultAuthor)" rel="noreferrer" target="_blank">
      <img :src="getAvatarUrl(defaultAuthor)" class="avator w-8 h-8 rounded-full">
    </a>
    {{ '常伟华' }}
  </div>
</template>

<style scoped>

</style>
