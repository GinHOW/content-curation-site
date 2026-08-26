<template>
  <ResourceShell
    title="文章"
    eyebrow="01 / Text"
    intro="从展示制度、观看机制到数字出版与互动叙事，这里汇集课程阅读中的经典文献与案例研究。"
    :count="filteredArticles.length"
    active-section="article"
    :nav-items="resourceNavigationItems"
    :filter-options="filterOptions"
    :filter-groups="filterGroups"
    surface-color="var(--home-blue)"
    filter-accent="var(--home-ink)"
    :active-filter="activeFilter"
    @filter="setFilter"
  >
    <section class="resource-detail-section" aria-label="文章列表">
      <div v-if="filteredArticles.length" class="article-detail-list">
        <article v-for="(article, index) in filteredArticles" :key="article.id" class="article-detail-row">
          <span class="article-detail-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <div class="article-detail-copy">
            <div class="article-detail-title-line">
              <h3>{{ article.title }}</h3>
              <span v-if="article.titleEn" class="article-detail-title-en">{{ article.titleEn }}</span>
            </div>
            <p class="article-detail-summary">{{ article.summary }}</p>
            <div class="article-detail-meta">
              <span>{{ article.author }}</span>
              <span>{{ article.source }}</span>
              <span>{{ article.year }}</span>
              <button
                v-for="tag in article.tags"
                :key="tag"
                class="resource-tag resource-tag-button"
                type="button"
                :aria-label="`按标签筛选 ${tag}`"
                @click="setFilter(tag)"
              >{{ tag }}</button>
            </div>
          </div>
          <a
            v-if="article.url"
            class="resource-action"
            :href="article.url"
            target="_blank"
            rel="noopener noreferrer"
          >阅读 <span aria-hidden="true">↗</span></a>
          <span v-else class="resource-action is-disabled" aria-disabled="true">待补充</span>
        </article>
      </div>

      <div v-else class="resource-empty-state" role="status">
        <p>没有符合当前筛选的文章。</p>
        <button type="button" @click="setFilter('all')">清除筛选</button>
      </div>
    </section>
  </ResourceShell>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import ResourceShell from '../../components/resources/ResourceShell.vue'
import { useResourceFilter } from '../../composables/useResourceFilter.js'
import { resourceArticles, resourceNavigationItems } from '../../data/resources.js'

const route = useRoute()
const router = useRouter()
const {
  activeFilter,
  filterOptions,
  filterGroups,
  filteredItems: filteredArticles,
  setFilter,
} = useResourceFilter({
  route,
  router,
  routeName: 'ResourceArticles',
  items: resourceArticles,
  getValues: (article) => article.tags,
  getFilterGroups: ({ filterValues }) => [
    {
      id: 'type',
      label: '类型',
      options: [
        { value: 'all', label: '全部' },
        { value: 'course', label: '课程文章' },
        { value: 'classic', label: '经典文献' },
      ],
    },
    {
      id: 'tag',
      label: '标签',
      options: filterValues.map((value) => ({ value, label: value })),
    },
  ],
  filterPredicate: (article, filter) => ['course', 'classic'].includes(filter)
    ? article.articleCategory === filter
    : article.tags.includes(filter),
})
</script>

<style scoped>
.resource-detail-section {
  scroll-margin-top: 2rem;
}

.article-detail-list {
  display: grid;
  padding-top: clamp(2rem, 4vw, 3.5rem);
}

.article-detail-row {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr) auto;
  gap: 1.25rem;
  align-items: start;
  padding: 1.4rem 0;
  border-bottom: 1px solid var(--resources-rule);
}

.article-detail-index {
  color: var(--resources-muted);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.08em;
}

.article-detail-title-line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.7rem 1rem;
}

.article-detail-title-line h3 {
  font-size: clamp(1.15rem, 2vw, 1.55rem);
  line-height: 1.3;
}

.article-detail-title-en {
  color: var(--resources-muted);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.article-detail-summary {
  max-width: 52rem;
  margin-top: 0.55rem;
  color: var(--resources-muted);
  font-size: 0.9rem;
  line-height: 1.7;
}

.article-detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  align-items: center;
  margin-top: 0.8rem;
  color: var(--resources-muted);
  font-size: 0.72rem;
  line-height: 1.4;
}

.resource-tag {
  display: inline-flex;
  align-items: center;
  min-height: 1.4rem;
  padding: 0.12rem 0.42rem;
  border: 1px solid var(--resources-rule);
  color: var(--resources-muted);
  font-size: 0.68rem;
  line-height: 1.2;
}

.resource-tag-button {
  background: transparent;
  font: inherit;
  cursor: pointer;
}

.resource-tag-button:hover,
.resource-tag-button:focus-visible {
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

.resource-empty-state {
  display: grid;
  justify-items: start;
  gap: 1rem;
  padding: 3rem 0;
  color: var(--resources-muted);
}

.resource-empty-state button {
  min-height: 44px;
  padding: 0.55rem 0.8rem;
  color: var(--resources-ink);
  background: transparent;
  border: 1px solid var(--resources-ink);
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 767px) {
  .article-detail-row {
    grid-template-columns: 2rem minmax(0, 1fr);
    gap: 0.7rem;
  }

  .article-detail-row > .resource-action {
    grid-column: 2;
    justify-self: start;
    min-height: 40px;
  }
}
</style>
