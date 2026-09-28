<script setup lang="ts">
import type { Publication } from "~/data/publications";
import { isHttpsUrl, isSafeImageSource } from "~/utils/publicationValidation";

const props = defineProps<{ publications: Publication[] }>();

const asset = useAssetPath();
const publicationRows = computed(() =>
  props.publications.map((publication) => ({
    ...publication,
    image:
      publication.image && isSafeImageSource(publication.image.src)
        ? publication.image
        : undefined,
    links: publication.links.filter((link) => isHttpsUrl(link.href)),
  })),
);

function resolveImagePath(path: string) {
  return isHttpsUrl(path) ? path : asset(path);
}
</script>

<template>
  <div v-if="publicationRows.length" class="publication-list">
    <article
      v-for="(publication, index) in publicationRows"
      :key="publication.id"
      class="publication-row"
      :class="{
        'publication-row--reverse': index % 2 === 1,
        'publication-row--text-only': !publication.image,
      }"
    >
      <figure v-if="publication.image" class="publication-image">
        <img
          :src="resolveImagePath(publication.image.src)"
          :alt="publication.image.alt"
          :width="publication.image.width"
          :height="publication.image.height"
          loading="lazy"
          decoding="async"
        />
      </figure>

      <div class="publication-copy">
        <p v-if="publication.isPlaceholder" class="publication-placeholder">
          占位示例 · 待补充正式论文
        </p>
        <h3 class="publication-title">{{ publication.title }}</h3>
        <p v-if="publication.authors.length" class="publication-authors">
          {{ publication.authors.join(", ") }}
        </p>
        <p
          v-else-if="publication.isPlaceholder"
          class="publication-authors publication-pending"
        >
          作者待补充
        </p>
        <p
          v-if="publication.venue || publication.year || publication.pages"
          class="publication-citation"
        >
          {{ [publication.venue, publication.year, publication.pages ? `pp. ${publication.pages}` : ''].filter(Boolean).join(', ') }}.
        </p>
        <div v-if="publication.abstract.trim()" class="publication-abstract">
          <h4>Abstract</h4>
          <p>{{ publication.abstract }}</p>
        </div>
        <ul
          v-if="publication.links.length"
          class="publication-links"
          aria-label="成果相关链接"
        >
          <li
            v-for="link in publication.links"
            :key="`${link.kind}-${link.href}`"
          >
            <a :href="link.href" target="_blank" rel="noopener noreferrer">
              {{ link.label }}
              <span aria-hidden="true"> ↗</span>
            </a>
          </li>
        </ul>
        <p
          v-else-if="publication.isPlaceholder"
          class="publication-links-pending publication-pending"
        >
          论文链接待补充
        </p>
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

.publication-placeholder {
  display: inline-block;
  margin: 0 0 14px;
  padding: 5px 10px;
  border: 1px solid #e6d9da;
  border-radius: 4px;
  color: #7b343a;
  background: #faf6f6;
  font-size: 0.78rem;
  line-height: 1.5;
  letter-spacing: 0.025em;
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

.publication-abstract {
  margin: 24px 0 20px;
}

.publication-abstract h4 {
  margin: 0 0 10px;
  color: #080808;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.5;
}

.publication-abstract p {
  margin: 0;
  color: #242424;
  font-size: 1rem;
  line-height: 1.85;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.publication-authors {
  margin: 0;
  color: #555;
  font-size: 0.94rem;
  line-height: 1.65;
  overflow-wrap: anywhere;
}

.publication-citation {
  margin: 12px 0 0;
  color: #555;
  font-size: 0.94rem;
  line-height: 1.65;
  overflow-wrap: anywhere;
}

.publication-pending {
  color: #777;
  font-size: 0.87rem;
}

.publication-links-pending {
  margin: 15px 0 0;
  line-height: 1.6;
}

.publication-links {
  display: flex;
  flex-wrap: wrap;
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
