<script setup lang="ts">
import { site } from "~/data/site";

const asset = useAssetPath();

useSeoMeta({
  title: `研究人员 · ${site.name}`,
  robots: "noindex, follow",
});

useHead({
  link: [{ rel: "canonical", href: asset("people/") }],
});

onMounted(() => {
  const originalHash = window.location.hash;
  const hash = ["#leadership", "#postdocs"].includes(originalHash)
    ? "#research-team"
    : originalHash;
  window.location.replace(`${asset("people/")}${hash}`);
});
</script>

<template>
  <article class="interior-page">
    <PageBanner title="研究人员" english="Researchers" />
    <div class="content-width people-redirect">
      <p>人员页面已更新。</p>
      <NuxtLink to="/people/"
        >查看研究人员 <span aria-hidden="true">→</span></NuxtLink
      >
    </div>
  </article>
</template>

<style scoped>
.people-redirect {
  padding-bottom: 80px;
}

.people-redirect a {
  color: var(--accent, #90141c);
  text-underline-offset: 4px;
}
</style>
