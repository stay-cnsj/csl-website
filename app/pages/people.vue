<script setup lang="ts">
import { peopleGroups } from "~/data/people";
import { site } from "~/data/site";

useSeoMeta({
  title: `研究人员 · ${site.name}`,
  description: `${site.name}方向的研究人员、研究兴趣与个人主页。`,
});
</script>

<template>
  <article class="interior-page people-page">
    <PageBanner title="研究人员" english="Researchers" />
    <div class="content-width people-page-content">
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
  </article>
</template>

<style scoped>
.people-page-content {
  padding-top: 0;
  padding-bottom: 112px;
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

  .people-navigation {
    gap: 16px 27px;
    margin-bottom: 44px;
  }
}
</style>
