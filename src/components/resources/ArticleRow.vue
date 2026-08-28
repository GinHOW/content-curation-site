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
        :to="article.readerPath"
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
</script>

<style scoped>
.article-row {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr) auto;
  gap: 1.25rem;
  align-items: start;
  padding: 1.4rem 0;
  border-bottom: 1px solid var(--resources-rule);
}

.article-index {
  color: var(--resources-muted);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.08em;
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
  border: 1px solid var(--resources-rule);
  background: #f2f2ee;
}

.article-title-line h3 {
  font-size: clamp(1.15rem, 2vw, 1.55rem);
  line-height: 1.3;
}

.article-title-en {
  color: var(--resources-muted);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.article-summary {
  max-width: 52rem;
  margin-top: 0.55rem;
  color: var(--resources-muted);
  font-size: 0.9rem;
  line-height: 1.7;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  align-items: center;
  margin-top: 0.8rem;
  color: var(--resources-muted);
  font-size: 0.72rem;
  line-height: 1.4;
}

:deep(.resource-tag) {
  display: inline-flex;
  align-items: center;
  min-height: 1.4rem;
  padding: 0.12rem 0.42rem;
  border: 1px solid var(--resources-rule);
  color: var(--resources-muted);
  font-size: 0.68rem;
  line-height: 1.2;
}

:deep(.resource-tag-button) {
  background: transparent;
  font: inherit;
  cursor: pointer;
}

:deep(.resource-tag-button:hover),
:deep(.resource-tag-button:focus-visible) {
  color: var(--resources-ink);
  border-color: var(--resources-ink);
}

.resource-action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 44px;
  color: var(--resources-ink);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.2;
  text-decoration: none;
  white-space: nowrap;
}

.resource-action:not(.is-disabled):hover,
.resource-action:not(.is-disabled):focus-visible {
  color: var(--accent-orange);
}

.resource-action.is-disabled {
  color: var(--resources-muted);
  cursor: not-allowed;
  opacity: 0.65;
}

@media (max-width: 767px) {
  .article-row {
    grid-template-columns: 2rem minmax(0, 1fr);
    gap: 0.7rem;
  }

  .article-row > .resource-action {
    grid-column: 2;
    justify-self: start;
    min-height: 40px;
  }
}
</style>
