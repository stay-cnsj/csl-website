<script setup lang="ts">
defineProps<{ title: string; english: string }>();
const asset = useAssetPath();
</script>
<template>
  <header class="page-banner">
    <img
      :src="asset('images/cognitive-brain.png')"
      alt=""
      class="banner-art"
      width="1448"
      height="1086"
    />
    <div class="banner-shade"></div>
    <h1>
      {{ title }} <span lang="en">{{ english }}</span>
    </h1>
  </header>
</template>
