<script setup lang="ts">
import type { Publication } from "~/data/publications";

defineProps<{ publications: Publication[] }>();

const asset = useAssetPath();

function resolvePath(path: string) {
  return /^(?:https?:\/\/|mailto:|tel:|\/\/|#)/i.test(path)
    ? path
    : asset(path);
}

function isExternalLink(path: string) {
  return /^(?:https?:)?\/\//i.test(path);
}
</script>

<template>
  <div v-if="publications.length" class="publication-list">
    <article
      v-for="(publication, index) in publications"
      :key="publication.id"
      class="publication-row"
      :class="{
        'publication-row--reverse': index % 2 === 1,
        'publication-row--text-only': !publication.image,
      }"
    >
      <figure v-if="publication.image" class="publication-image">
        <img
          :src="resolvePath(publication.image.src)"
          :alt="publication.image.alt"
          :width="publication.image.width"
          :height="publication.image.height"
          loading="lazy"
          decoding="async"
        />
      </figure>

      <div class="publication-copy">
        <p
          v-if="publication.venue || publication.year"
          class="publication-meta"
        >
          <span v-if="publication.venue">{{ publication.venue }}</span>
          <span v-if="publication.venue && publication.year" aria-hidden="true">
            ·
          </span>
          <span v-if="publication.year">{{ publication.year }}</span>
        </p>
        <h3 class="publication-title">{{ publication.title }}</h3>
        <p v-if="publication.description" class="publication-description">
          {{ publication.description }}
        </p>
        <ul
          v-if="publication.highlights?.length"
          class="publication-highlights"
        >
          <li
            v-for="(highlight, highlightIndex) in publication.highlights"
            :key="highlightIndex"
          >
            <strong v-if="highlight.label">{{ highlight.label }}</strong>
            <span v-if="highlight.label && highlight.text">：</span>
            <span v-if="highlight.text">{{ highlight.text }}</span>
          </li>
        </ul>
        <p v-if="publication.authors.length" class="publication-authors">
          {{ publication.authors.join(", ") }}
        </p>
        <ul
          v-if="publication.links?.length"
          class="publication-links"
          aria-label="成果相关链接"
        >
          <li
            v-for="link in publication.links"
            :key="`${link.kind}-${link.href}`"
          >
            <a
              :href="resolvePath(link.href)"
              :target="isExternalLink(link.href) ? '_blank' : undefined"
              :rel="
                isExternalLink(link.href) ? 'noopener noreferrer' : undefined
              "
            >
              {{ link.label }}
              <span v-if="isExternalLink(link.href)" aria-hidden="true">
                ↗</span
              >
            </a>
          </li>
        </ul>
      </div>
    </article>
  </div>
  <div v-else class="publication-empty">
    <span class="publication-empty-rule" aria-hidden="true"></span>
    <p>研究论文将陆续发布。</p>
  </div>
</template>

<style scoped>
.publication-list {
  display: grid;
  gap: 84px;
  background: #fff;
}

.publication-row {
  display: grid;
  grid-template-columns: 32fr 62fr;
  gap: 6%;
  align-items: start;
}

.publication-row--reverse {
  grid-template-columns: 62fr 32fr;
}

.publication-row--reverse .publication-image {
  grid-column: 2;
  grid-row: 1;
}

.publication-row--reverse .publication-copy {
  grid-column: 1;
  grid-row: 1;
}

.publication-row--text-only {
  grid-template-columns: minmax(0, 1fr);
}

.publication-image {
  min-width: 0;
  margin: 0;
}

.publication-image img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 14px;
}

.publication-copy {
  min-width: 0;
}

.publication-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55em;
  margin: 0 0 9px;
  color: #686868;
  font-size: 0.88rem;
  line-height: 1.5;
}

.publication-title {
  margin: 0 0 20px;
  color: #080808;
  font-size: clamp(1.55rem, 2.15vw, 2.05rem);
  font-weight: 750;
  line-height: 1.24;
  letter-spacing: -0.025em;
  overflow-wrap: anywhere;
}

.publication-description,
.publication-highlights {
  margin: 0 0 20px;
  color: #242424;
  font-size: 1rem;
  line-height: 1.85;
}

.publication-highlights {
  padding-left: 1.25em;
}

.publication-highlights li + li {
  margin-top: 7px;
}

.publication-highlights strong {
  color: #080808;
  font-weight: 700;
}

.publication-authors {
  margin: 24px 0 0;
  color: #717171;
  font-size: 0.87rem;
  line-height: 1.65;
  text-align: right;
}

.publication-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px 20px;
  padding: 0;
  margin: 15px 0 0;
  list-style: none;
  font-size: 0.9rem;
  line-height: 1.6;
}

.publication-links a {
  color: var(--accent, #90141c);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.publication-empty {
  padding: 12px 0 50px;
}

.publication-empty-rule {
  display: block;
  width: 44px;
  height: 2px;
  margin-bottom: 24px;
  background: #b6b6b6;
}

.publication-empty p {
  margin: 0;
  color: #717171;
  font-size: 1rem;
}

@media (max-width: 767.98px) {
  .publication-list {
    gap: 58px;
  }

  .publication-row,
  .publication-row--reverse {
    grid-template-columns: minmax(0, 1fr);
    gap: 26px;
  }

  .publication-row--reverse .publication-image,
  .publication-row--reverse .publication-copy {
    grid-column: auto;
    grid-row: auto;
  }

  .publication-image {
    width: min(100%, 440px);
    margin-inline: auto;
  }

  .publication-title {
    font-size: 1.55rem;
  }

  .publication-empty {
    padding-bottom: 30px;
  }
}
</style>
