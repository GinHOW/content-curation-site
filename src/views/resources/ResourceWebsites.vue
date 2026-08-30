<template>
  <ResourceShell
    title="网页"
    eyebrow="03 / Web"
    intro="从视觉文化与数字媒介案例，到展览工作室和空间项目档案，这里收录课程研究中持续访问的网页与在线项目。"
    :count="filteredResources.length"
    active-section="website"
    :nav-items="resourceNavigationItems"
    :filter-options="filterOptions"
    :filter-groups="filterGroups"
    surface-color="var(--home-green)"
    muted-color="var(--home-ink)"
    filter-accent="var(--home-ink)"
    :active-filter="activeFilter"
    @filter="setFilter"
  >
    <section class="resource-detail-section" aria-label="网页列表">
      <div v-if="filteredResources.length" class="web-resource-grid">
        <WebResourceCard v-for="(resource, index) in filteredResources" :key="resource.id" :resource="resource" :index="index">
          <template #tags>
            <button
              v-for="tag in resource.tags"
              :key="tag"
              class="resource-tag resource-tag-button"
              type="button"
              :aria-label="`按标签筛选 ${tag}`"
              @click="setFilter(tag)"
            >{{ tag }}</button>
          </template>
        </WebResourceCard>
      </div>

      <div v-else class="resource-empty-state" role="status">
        <p>没有符合当前标签的网页。</p>
        <button type="button" @click="setFilter('all')">清除筛选</button>
      </div>
    </section>
  </ResourceShell>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ResourceShell from '../../components/resources/ResourceShell.vue'
import WebResourceCard from '../../components/resources/WebResourceCard.vue'
import { useResourceFilter } from '../../composables/useResourceFilter.js'
import { resourceNavigationItems, resourceWebsites } from '../../data/resources.js'
import { usePublishedResources } from '../../composables/usePublishedResources.js'

const route = useRoute()
const router = useRouter()
const { initialize: initializePublishedResources, byType } = usePublishedResources()
const mergedWebsites = byType('website', resourceWebsites)

const {
  activeFilter,
  filterOptions,
  filterGroups,
  filteredItems: filteredResources,
  setFilter,
} = useResourceFilter({
  route,
  router,
  routeName: 'ResourceWebsites',
  items: mergedWebsites,
  getValues: (resource) => resource.tags,
  getFilterGroups: ({ filterValues }) => [
    {
      id: 'type',
      label: '类型',
      options: [
        { value: 'all', label: '全部' },
        { value: 'case', label: '网站案例' },
        { value: 'exhibition', label: '展览网站' },
        { value: 'news', label: '资讯网站' },
      ],
    },
    {
      id: 'tag',
      label: '标签',
      options: filterValues.map((value) => ({ value, label: value })),
    },
  ],
  filterPredicate: (resource, filter) => ['case', 'exhibition', 'news'].includes(filter)
    ? resource.websiteCategory === filter
    : resource.tags.includes(filter),
})

onMounted(() => initializePublishedResources())
</script>

<style scoped>
.resource-detail-section {
  scroll-margin-top: 2rem;
}

.web-resource-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(1rem, 2vw, 2rem);
  padding-top: clamp(2rem, 4vw, 3.5rem);
}

.resource-tag {
  display: inline-flex;
  align-items: center;
  min-height: 1.4rem;
  padding: 0.08rem 0.24rem;
  border: 1px solid var(--web-card-rule, var(--home-rule));
  color: var(--web-card-muted, var(--home-muted));
  font-size: 0.64rem;
  line-height: 1.2;
}

.resource-tag-button {
  background: transparent;
  font: inherit;
  font-size: 0.64rem;
  line-height: 1.2;
  cursor: pointer;
  touch-action: manipulation;
  transition: color 160ms ease, border-color 160ms ease, transform 160ms ease;
}

.resource-tag-button:hover,
.resource-tag-button:focus-visible {
  color: var(--web-card-ink, var(--home-ink));
  background: transparent;
  border-color: var(--web-card-ink, var(--home-ink));
  box-shadow: inset 0 0 0 1px var(--web-card-ink, var(--home-ink));
}

.resource-tag-button:focus-visible {
  outline: 2px solid var(--web-card-ink, var(--home-ink));
  outline-offset: 2px;
}

.resource-tag-button:active {
  transform: scale(0.97);
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

@media (max-width: 1439px) {
  .web-resource-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1023px) {
  .web-resource-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .web-resource-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .resource-tag-button {
    transition: none;
  }
}
</style>
