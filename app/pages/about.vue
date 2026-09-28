<script setup lang="ts">
import { peopleGroups } from "~/data/people";
import { site } from "~/data/site";

useSeoMeta({
  title: `关于实验室 · ${site.name}`,
  description: site.laboratory,
});
</script>

<template>
  <article class="interior-page about-page">
    <PageBanner title="关于实验室" english="About CSL" />
    <div class="content-width people-page-content">
      <h2 class="people-page-title">实验室成员</h2>
      <nav class="people-navigation" aria-label="成员分类">
        <a v-for="group in peopleGroups" :key="group.id" :href="`#${group.id}`">
          {{ group.title }}
          <span>{{ group.people.length }}</span>
        </a>
      </nav>
      <PeopleSection
        v-for="group in peopleGroups"
        :key="group.id"
        :group="group"
      />
    </div>
    <section class="lab-introduction" aria-labelledby="lab-introduction-title">
      <header class="content-width lab-introduction-heading">
        <h2 id="lab-introduction-title">实验室介绍</h2>
      </header>
      <div class="content-width row g-5 about-layout">
        <div class="col-md-5">
          <div class="lab-monogram" aria-hidden="true">CSL<span>.</span></div>
          <p class="lab-monogram-caption" lang="en">COMPUTER SCIENCE LAB</p>
        </div>
        <div class="col-md-7">
          <h3 class="lab-introduction-name">{{ site.labName }}</h3>
          <p class="section-english" lang="en">{{ site.labEnglish }}</p>
          <p class="lead-copy">{{ site.laboratory }}</p>
          <p>{{ site.introduction }}</p>
          <p>{{ site.interdisciplinary }}</p>
          <NuxtLink class="btn btn-primary" to="/research/">
            了解研究方向
          </NuxtLink>
        </div>
      </div>
    </section>
  </article>
</template>

<style scoped>
.people-page-content {
  padding-top: 0;
  padding-bottom: 112px;
}

.people-page-title {
  margin: 0 0 20px;
  font-size: 1.25rem;
  font-weight: 650;
  letter-spacing: 0;
}

.lab-introduction-heading {
  padding-top: 48px;
  padding-bottom: 28px;
  border-top: 1px solid #dedbd9;
}

.lab-introduction-heading h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.lab-introduction-name {
  font-size: 32px;
}

.people-navigation {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 36px;
  margin: 0 0 66px;
}

.people-navigation a {
  display: inline-flex;
  align-items: baseline;
  gap: 9px;
  color: #49413e;
  font-size: 0.91rem;
  font-weight: 550;
  text-decoration: none;
}

.people-navigation a:hover {
  color: var(--accent, #90141c);
  text-decoration: underline;
}

.people-navigation span {
  color: #9c938e;
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 767.98px) {
  .people-page-content {
    padding-bottom: 72px;
  }

  .lab-introduction-heading {
    padding-top: 32px;
    padding-bottom: 8px;
  }

  .lab-introduction-name {
    font-size: 29px;
  }

  .people-navigation {
    gap: 16px 27px;
    margin-bottom: 44px;
  }
}
</style>
