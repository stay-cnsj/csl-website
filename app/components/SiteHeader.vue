<script setup lang="ts">
import { navigation, site } from "~/data/site";
const menuOpen = ref(false);
const route = useRoute();
const menuButton = useTemplateRef<HTMLButtonElement>("menuButton");
watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
  },
);
function closeMenu() {
  menuOpen.value = false;
  menuButton.value?.focus();
}
</script>

<template>
  <header
    class="site-header"
    :class="{ 'is-interior': route.path !== '/' }"
    @keydown.esc="closeMenu"
  >
    <NuxtLink class="site-brand" to="/" :aria-label="`${site.name}，返回首页`">
      <span class="brand-letters">CSL<span class="brand-dot">.</span></span>
      <span class="brand-caption">RESEARCH DIRECTION</span>
    </NuxtLink>
    <button
      ref="menuButton"
      class="menu-toggle"
      type="button"
      :aria-expanded="menuOpen"
      aria-controls="main-navigation"
      :aria-label="menuOpen ? '关闭导航菜单' : '打开导航菜单'"
      @click="menuOpen = !menuOpen"
    >
      <span :class="{ open: menuOpen }"></span
      ><span :class="{ open: menuOpen }"></span>
    </button>
    <nav
      id="main-navigation"
      class="main-navigation"
      :class="{ 'is-open': menuOpen }"
      aria-label="主导航"
    >
      <NuxtLink to="/" class="mobile-home">首页</NuxtLink>
      <NuxtLink v-for="item in navigation" :key="item.to" :to="item.to">
        <span>{{ item.label }}</span
        ><span class="nav-english">{{ item.english }}</span>
      </NuxtLink>
    </nav>
  </header>
</template>
