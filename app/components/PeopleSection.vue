<script setup lang="ts">
import type { PeopleGroup } from "~/data/people";

defineProps<{ group: PeopleGroup }>();

const asset = useAssetPath();

function safeHomepage(url: string | undefined) {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? parsed.href
      : undefined;
  } catch {
    return undefined;
  }
}
</script>

<template>
  <section
    :id="group.id"
    class="people-section"
    :aria-labelledby="`${group.id}-title`"
  >
    <header class="people-section-heading">
      <div>
        <p class="people-section-english" lang="en">{{ group.english }}</p>
        <h2 :id="`${group.id}-title`">{{ group.title }}</h2>
      </div>
      <span class="people-count" :aria-label="`${group.people.length}位成员`">
        {{ String(group.people.length).padStart(2, "0") }}
      </span>
    </header>

    <div class="people-list" :class="`people-list--${group.layout}`">
      <article
        v-for="person in group.people"
        :key="person.id"
        class="person-card"
      >
        <div class="person-portrait">
          <img
            :src="asset(person.portrait.src)"
            :alt="`${person.name}的照片`"
            :width="person.portrait.width"
            :height="person.portrait.height"
            :style="{
              objectPosition: person.portrait.position || 'center 30%',
            }"
            :loading="group.layout === 'team' ? 'eager' : 'lazy'"
            decoding="async"
          />
        </div>
        <div class="person-details">
          <h3>{{ person.name }}</h3>
          <p v-if="person.role" class="person-role">{{ person.role }}</p>
          <div v-if="person.biography?.length" class="person-biography">
            <p v-for="paragraph in person.biography" :key="paragraph">
              {{ paragraph }}
            </p>
          </div>
          <p class="person-research">
            <span class="person-research-label">
              {{ person.researchLabel || "研究方向" }}
            </span>
            <span>{{ person.research }}</span>
          </p>
          <a
            v-if="safeHomepage(person.homepage)"
            :href="safeHomepage(person.homepage)"
            class="person-homepage"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`${person.name}的个人主页（在新窗口打开）`"
          >
            个人主页 <span aria-hidden="true">↗</span>
          </a>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.people-section {
  scroll-margin-top: 40px;
}

.people-section + .people-section {
  margin-top: 88px;
}

.people-section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 36px;
  padding-bottom: 21px;
  border-bottom: 1px solid #dedbd9;
}

.people-section-english {
  margin: 0 0 8px;
  color: var(--accent, #90141c);
  font-size: 0.72rem;
  font-weight: 650;
  letter-spacing: 0.12em;
  line-height: 1.4;
}

.people-section-heading h2 {
  margin: 0;
  font-size: clamp(1.7rem, 3vw, 2.3rem);
  font-weight: 700;
  line-height: 1.2;
}

.people-count {
  padding-bottom: 2px;
  color: #9b9490;
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
}

.people-list {
  display: grid;
  align-items: start;
  gap: 44px 32px;
}

.people-list--team {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
}

.people-list--wide {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 48px;
}

.people-list--grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.person-card,
.person-details {
  min-width: 0;
}

.person-portrait {
  aspect-ratio: 4 / 5;
  overflow: hidden;
  margin-bottom: 23px;
  background: #f0eeed;
}

.person-portrait img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.person-details h3 {
  margin: 0 0 7px;
  color: #101010;
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.4;
}

.person-role {
  margin: 0 0 19px;
  color: #73706e;
  font-size: 0.88rem;
  line-height: 1.65;
}

.person-biography {
  margin-bottom: 27px;
  color: #34312f;
  font-size: 1.05rem;
  line-height: 1.9;
}

.person-biography p:last-child {
  margin-bottom: 0;
}

.person-research {
  display: grid;
  gap: 5px;
  margin: 0;
  color: #494543;
  font-size: 0.92rem;
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.person-research-label {
  color: #8c817a;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.025em;
}

.person-homepage {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  margin-top: 22px;
  color: var(--accent, #90141c);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
}

.person-homepage:hover {
  text-decoration: underline;
}

.person-homepage span {
  font-size: 1.05rem;
}

.people-list--team .person-card,
.people-list--team .person-details {
  display: flex;
  flex-direction: column;
}

.people-list--team .person-portrait {
  flex-shrink: 0;
}

.people-list--team .person-details {
  flex: 1;
}

.people-list--team .person-biography {
  font-size: 0.92rem;
  line-height: 1.8;
}

.people-list--team .person-homepage {
  align-self: flex-start;
  margin-top: auto;
  padding-top: 22px;
}

.people-list--wide .person-card {
  display: grid;
  grid-template-columns: minmax(0, 170px) minmax(0, 1fr);
  gap: 24px;
}

.people-list--wide .person-portrait {
  margin-bottom: 0;
}

@media (max-width: 1199.98px) {
  .people-list--grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: 30px;
  }

  .people-list--wide {
    gap: 34px;
  }

  .people-list--wide .person-card {
    grid-template-columns: minmax(0, 130px) minmax(0, 1fr);
    gap: 20px;
  }
}

@media (max-width: 991.98px) {
  .people-list--team {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .people-list--wide .person-card {
    display: block;
  }

  .people-list--wide .person-portrait {
    max-width: 240px;
    margin-bottom: 23px;
  }
}

@media (max-width: 767.98px) {
  .people-section + .people-section {
    margin-top: 62px;
  }

  .people-section-heading {
    margin-bottom: 28px;
    padding-bottom: 18px;
  }

  .people-list--team {
    grid-template-columns: minmax(0, 1fr);
    gap: 44px;
  }

  .people-list--team .person-portrait {
    width: min(100%, 320px);
  }

  .people-list--team .person-details h3 {
    font-size: 1.45rem;
  }

  .people-list--grid,
  .people-list--wide {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 38px 22px;
  }

  .people-list--wide .person-portrait {
    max-width: none;
  }

  .person-portrait {
    margin-bottom: 17px;
  }

  .person-details h3 {
    font-size: 1.25rem;
  }

  .person-role {
    margin-bottom: 14px;
    font-size: 0.8rem;
  }

  .person-biography {
    font-size: 0.98rem;
  }

  .person-research {
    font-size: 0.85rem;
  }
}

@media (max-width: 359.98px) {
  .people-list--grid,
  .people-list--wide {
    grid-template-columns: minmax(0, 1fr);
  }

  .person-portrait,
  .people-list--wide .person-portrait {
    max-width: 250px;
  }
}
</style>
