<script setup lang="ts">
import { site } from "~/data/site";
useSeoMeta({
  title: `关于实验室 · ${site.name}`,
  description: site.laboratory,
});
</script>

<template>
  <article class="interior-page about-page">
    <PageBanner title="关于实验室" english="About CSL" />
    <section class="content-width row g-5 about-layout">
      <div class="col-md-5">
        <div class="lab-monogram" aria-hidden="true">CSL<span>.</span></div>
        <p class="lab-monogram-caption" lang="en">COMPUTER SCIENCE LAB</p>
      </div>
      <div class="col-md-7">
        <h2>{{ site.labName }}</h2>
        <p class="section-english" lang="en">{{ site.labEnglish }}</p>
        <p class="lead-copy">{{ site.laboratory }}</p>
        <p>{{ site.introduction }}</p>
        <p>{{ site.interdisciplinary }}</p>
        <NuxtLink class="btn btn-primary" to="/research/"
          >了解研究方向</NuxtLink
        >
      </div>
    </section>
  </article>
</template>
