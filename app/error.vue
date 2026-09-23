<script setup lang="ts">
defineProps<{ error: { statusCode?: number } }>();
</script>
<template>
  <main class="error-page content-width">
    <p class="eyebrow">{{ error.statusCode || 500 }}</p>
    <h1>{{ error.statusCode === 404 ? "页面未找到" : "页面暂时无法打开" }}</h1>
    <p>你可以返回首页，继续了解我们的研究方向。</p>
    <a class="btn btn-primary" :href="useRuntimeConfig().app.baseURL"
      >返回首页</a
    >
  </main>
</template>
