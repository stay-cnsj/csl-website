<script setup lang="ts">
import { site } from "~/data/site";
const asset = useAssetPath();
useSeoMeta({ title: `${site.name} · CSL`, description: site.introduction });
</script>

<template>
  <section class="home-hero container-fluid" aria-labelledby="home-title">
    <div class="row align-items-center hero-row">
      <div class="col-md-6 hero-art">
        <img
          :src="asset('images/cognitive-brain.png')"
          alt="以彩色纤维呈现脑部结构的认知智能概念插画"
          width="1448"
          height="1086"
          fetchpriority="high"
        />
      </div>
      <div class="col-md-6 hero-copy">
        <h1 id="home-title">
          认知大模型<br />与<span class="gradient-text">数据智能体</span>
        </h1>
        <p class="hero-english" lang="en">
          Cognitive Large Models<br />and Data Intelligence Agent
        </p>
        <h2>
          探索智能系统的<br /><strong>认知</strong
          >、<strong>推理</strong>与<strong>决策</strong>
        </h2>
        <NuxtLink class="btn btn-primary" to="/research/"
          >了解更多 <span lang="en">LEARN MORE</span></NuxtLink
        >
      </div>
    </div>
  </section>
</template>
