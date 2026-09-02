<template>
  <article class="article-row">
    <span class="article-index">{{ String(index + 1).padStart(2, '0') }}</span>
    <div class="article-copy">
      <img v-if="article.image" class="article-image" :src="article.image" :alt="article.alt || `${article.title} 封面`" width="960" height="600" loading="lazy" />
      <div class="article-title-line">
        <h3>{{ article.title }}</h3>
        <span v-if="article.titleEn" class="article-title-en">{{ article.titleEn }}</span>
      </div>
      <p class="article-summary">{{ article.summary }}</p>
      <div class="article-meta">
        <span v-if="article.author">{{ article.author }}</span>
        <span v-if="article.source">{{ article.source }}</span>
        <span v-if="article.year">{{ article.year }}</span>
        <slot name="tags">
          <span v-for="tag in article.tags" :key="tag" class="resource-tag">{{ tag }}</span>
        </slot>
      </div>
    </div>
    <div class="article-actions">
      <router-link
        v-if="article.readerPath"
        class="resource-action"
        :to="articleTarget(article.readerPath)"
      >阅读全文 <span aria-hidden="true">→</span></router-link>
      <a
        v-else-if="article.url"
        class="resource-action"
        :href="article.url"
        target="_blank"
        rel="noopener noreferrer"
      >阅读 <span aria-hidden="true">↗</span></a>
      <span v-else class="resource-action is-disabled" aria-disabled="true">待补充</span>
    </div>
  </article>
</template>

<script setup>
import { useRoute } from 'vue-router'

defineProps({
  article: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
})

const route = useRoute()
const articleTarget = (path) => ({ path, query: { returnTo: route.fullPath } })
</script>

<style scoped>
.article-row {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr) auto;
  gap: 1.25rem;
  align-items: start;
  padding: 1.4rem clamp(1rem, 1.5vw, 1.5rem);
  margin: 0 calc(-1 * clamp(1rem, 1.5vw, 1.5rem));
  --article-surface: transparent;
  --article-ink: var(--resources-ink, var(--home-ink));
  --article-muted: var(--resources-muted, var(--home-muted));
  --article-rule: var(--resources-rule, var(--home-rule));
  background: var(--article-surface);
  color: var(--article-ink);
  border-bottom: 1px solid var(--article-rule);
  transition: color 180ms ease, background-color 180ms ease, border-color 180ms ease;
}

.article-row:hover,
.article-row:focus-within {
  --article-surface: var(--home-ink);
  --article-ink: var(--home-paper);
  --article-muted: rgb(255 255 255 / 0.72);
  --article-rule: rgb(255 255 255 / 0.35);
}

.article-index {
  color: var(--article-muted);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.08em;
  transition: color 180ms ease;
}

.article-title-line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.7rem 1rem;
}

.article-image {
  display: block;
  width: min(16rem, 100%);
  aspect-ratio: 16 / 10;
  margin-bottom: 1rem;
  object-fit: cover;
  border: 1px solid var(--article-rule);
  background: #f2f2ee;
  filter: grayscale(0.18);
  transition: filter 180ms ease, border-color 180ms ease;
}

.article-row:hover .article-image,
.article-row:focus-within .article-image {
  filter: grayscale(0);
}

.article-title-line h3 {
  color: var(--article-ink);
  font-size: clamp(1.15rem, 2vw, 1.55rem);
  line-height: 1.3;
  transition: color 180ms ease;
}

.article-title-en {
  color: var(--article-muted);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: color 180ms ease;
}

.article-summary {
  max-width: 52rem;
  margin-top: 0.55rem;
  color: var(--article-muted);
  font-size: 0.9rem;
  line-height: 1.7;
  transition: color 180ms ease;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  align-items: center;
  margin-top: 0.8rem;
  color: var(--article-muted);
  font-size: 0.72rem;
  line-height: 1.4;
  transition: color 180ms ease;
}

:deep(.resource-tag) {
  display: inline-flex;
  align-items: center;
  min-height: 1.4rem;
  padding: 0.12rem 0.42rem;
  border: 1px solid var(--article-rule);
  color: var(--article-muted);
  font-size: 0.68rem;
  line-height: 1.2;
  transition: color 160ms ease, border-color 160ms ease;
}

:deep(.resource-tag-button) {
  background: transparent;
  font: inherit;
  cursor: pointer;
}

:deep(.resource-tag-button:hover),
:deep(.resource-tag-button:focus-visible) {
  color: var(--article-ink);
  border-color: var(--article-ink);
  box-shadow: inset 0 0 0 1px var(--article-ink);
}

.resource-action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 44px;
  color: var(--article-ink);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.2;
  text-decoration: none;
  white-space: nowrap;
  transition: color 180ms ease;
}

.resource-action:not(.is-disabled):hover,
.resource-action:not(.is-disabled):focus-visible {
  color: var(--home-blue);
}

.resource-action.is-disabled {
  color: var(--article-muted);
  cursor: not-allowed;
  opacity: 0.65;
}

@media (max-width: 767px) {
  .article-row {
    grid-template-columns: 2rem minmax(0, 1fr);
    gap: 0.7rem;
    padding: 1.2rem 0.5rem;
    margin: 0 -0.5rem;
  }

  .article-row > .resource-action,
  .article-actions {
    grid-column: 2;
    justify-self: start;
    min-height: 40px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-row,
  .article-index,
  .article-image,
  .article-title-line h3,
  .article-title-en,
  .article-summary,
  .article-meta,
  :deep(.resource-tag),
  .resource-action {
    transition: none;
  }
}
</style>
