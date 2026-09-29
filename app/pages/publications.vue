<script setup lang="ts">
import { site } from "~/data/site";
import { publications } from "~/data/publications";

useSeoMeta({
  title: `研究成果 · ${site.name}`,
  description:
    "认知大模型与数据智能体方向的研究成果，展示论文配图、标题、作者、摘要与相关链接。",
});
</script>

<template>
  <article class="interior-page publications-page">
    <PageBanner title="研究成果" english="Publications" />
    <section
      id="publications"
      class="publications-section"
      aria-labelledby="publications-title"
    >
      <header class="publications-heading">
        <p class="eyebrow">论文与研究成果</p>
        <h2 id="publications-title" lang="en">Publication</h2>
      </header>
      <PublicationList :publications="publications" />
    </section>
  </article>
</template>

<style scoped>
.publications-section {
  max-width: 1500px;
  padding: 0 4vw;
  margin: 0 auto 76px;
}
.publications-heading {
  margin-bottom: 48px;
}
.publications-heading .eyebrow {
  margin-bottom: 8px;
}
.publications-heading h2 {
  font-size: clamp(42px, 5.2vw, 72px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.2;
  margin: 0;
}
@media (max-width: 767px) {
  .publications-section {
    padding: 0 6vw;
    margin-bottom: 44px;
  }
  .publications-heading {
    margin-bottom: 28px;
  }
}
</style>
