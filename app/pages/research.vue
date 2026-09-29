<script setup lang="ts">
import { research, researchTopics } from "~/data/site";
useSeoMeta({
  title: `研究方向 · ${research.name}`,
  description: research.introduction,
});
</script>

<template>
  <article class="interior-page">
    <PageBanner title="研究方向" english="Research" />
    <div class="research-columns">
      <section class="research-intro">
        <h2>{{ research.name }}</h2>
        <p class="section-english" lang="en">{{ research.englishName }}</p>
        <p class="lead-copy">{{ research.introduction }}</p>
        <p v-for="paragraph in research.overview" :key="paragraph">
          {{ paragraph }}
        </p>
      </section>
      <section class="research-topics" aria-label="研究主题">
        <h2 class="research-group-title">
          <span>主要研究主题 / Research areas</span>
        </h2>
        <div class="research-topic-grid">
          <div
            v-for="(topic, index) in researchTopics"
            :key="topic.title"
            class="research-topic"
          >
            <span class="topic-index">0{{ index + 1 }}</span>
            <h3>{{ topic.title }}</h3>
            <p class="section-english" lang="en">{{ topic.english }}</p>
            <p>{{ topic.description }}</p>
            <ul class="keyword-list">
              <li v-for="keyword in topic.keywords" :key="keyword">
                {{ keyword }}
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
    <section id="applications" class="applications-section">
      <div class="content-width">
        <p class="eyebrow" lang="en">INTERDISCIPLINARY RESEARCH</p>
        <h2>交叉研究与应用</h2>
        <p>{{ research.interdisciplinary }}</p>
        <NuxtLink class="text-link" to="/framework/"
          >查看研究架构 <span aria-hidden="true">↗</span></NuxtLink
        >
      </div>
    </section>
  </article>
</template>
