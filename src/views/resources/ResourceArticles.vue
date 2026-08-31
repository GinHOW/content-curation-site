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
        <ArticleRow
          v-for="(article, index) in filteredArticles"
          :key="article.id"
          :article="article"
          :index="index"
        >
          <template #tags>
            <button
              v-for="tag in article.tags"
              :key="tag"
              class="resource-tag resource-tag-button"
              type="button"
              :aria-label="`按标签筛选 ${tag}`"
              @click="setFilter(tag)"
            >{{ tag }}</button>
          </template>
        </ArticleRow>
      </div>

      <div v-else class="resource-empty-state" role="status">
        <p>没有符合当前筛选的文章。</p>
        <button type="button" @click="setFilter('all')">清除筛选</button>
      </div>
    </section>
  </ResourceShell>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticleRow from '../../components/resources/ArticleRow.vue'
import ResourceShell from '../../components/resources/ResourceShell.vue'
import { useResourceFilter } from '../../composables/useResourceFilter.js'
import { resourceArticles, resourceNavigationItems } from '../../data/resources/index.js'
import { usePublishedResources } from '../../composables/usePublishedResources.js'

const route = useRoute()
const router = useRouter()
const { initialize: initializePublishedResources, byType } = usePublishedResources()
const mergedArticles = byType('article', resourceArticles)
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
  items: mergedArticles,
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

onMounted(() => initializePublishedResources())
</script>

<style scoped>
.resource-detail-section {
  scroll-margin-top: 2rem;
}

.article-detail-list {
  display: grid;
  padding-top: clamp(2rem, 4vw, 3.5rem);
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
</style>
