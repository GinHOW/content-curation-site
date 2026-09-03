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
    filter-accent="var(--home-ink)"
    :active-filter="activeFilter"
    @filter="setFilter"
  >
    <section class="resource-detail-section" aria-label="网页列表">
      <div v-if="filteredResources.length" class="web-resource-grid">
        <WebResourceCard
          v-for="(resource, index) in filteredResources"
          :key="resource.id"
          :resource="resource"
          :index="index"
        >
          <template #tags>
            <button
              v-for="tag in resource.tags"
              :key="tag"
              class="resource-tag resource-tag-button"
              type="button"
              :aria-label="`按标签筛选 ${tag}`"
              @click="handleCardTagClick(tag, resource)"
            >{{ tag }}</button>
          </template>
        </WebResourceCard>
      </div>

      <div v-else class="resource-empty-state" role="status">
        <p>没有符合当前筛选条件的网页。</p>
        <button type="button" @click="resetFilters">清除筛选</button>
      </div>
    </section>
  </ResourceShell>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ResourceShell from '../../components/resources/ResourceShell.vue'
import WebResourceCard from '../../components/resources/WebResourceCard.vue'
import { getResourceCategoryOptions } from '../../data/resources/categories.js'
import { resourceNavigationItems, resourceWebsites } from '../../data/resources/index.js'
import { usePublishedResources } from '../../composables/usePublishedResources.js'

const route = useRoute()
const router = useRouter()
const { initialize: initializePublishedResources, byType } = usePublishedResources()
const mergedWebsites = byType('website', resourceWebsites)

const typeOptions = computed(() => [
  { value: 'all', label: '全部' },
  ...getResourceCategoryOptions('website'),
])

const validTypes = computed(() => new Set(typeOptions.value.map((o) => o.value)))

const currentType = computed(() => {
  const rawType = route.query.type || route.query.category
  if (typeof rawType === 'string' && validTypes.value.has(rawType)) {
    return rawType
  }
  const rawFilter = route.query.filter
  if (typeof rawFilter === 'string' && validTypes.value.has(rawFilter)) {
    return rawFilter
  }
  return 'all'
})

const availableTags = computed(() => {
  const targetWebsites = currentType.value === 'all'
    ? mergedWebsites.value
    : mergedWebsites.value.filter((item) => item.websiteCategory === currentType.value)

  const tags = new Set()
  for (const item of targetWebsites) {
    if (Array.isArray(item.tags)) {
      for (const tag of item.tags) {
        if (tag) tags.add(tag)
      }
    }
  }
  return [...tags]
})

const validTags = computed(() => new Set(availableTags.value))

const currentTag = computed(() => {
  const rawTag = route.query.tag
  if (typeof rawTag === 'string' && validTags.value.has(rawTag)) {
    return rawTag
  }
  const rawFilter = route.query.filter
  if (typeof rawFilter === 'string' && validTags.value.has(rawFilter)) {
    return rawFilter
  }
  return 'all'
})

const filterGroups = computed(() => [
  {
    id: 'type',
    label: '类型',
    options: typeOptions.value,
  },
  {
    id: 'tag',
    label: '标签',
    options: [
      { value: 'all', label: '全部' },
      ...availableTags.value.map((value) => ({ value, label: value })),
    ],
  },
])

const filterOptions = computed(() => filterGroups.value.flatMap((group) => group.options || []))

const activeFilter = computed(() => ({
  type: currentType.value,
  tag: currentTag.value,
}))

const filteredResources = computed(() => {
  return mergedWebsites.value.filter((item) => {
    const matchType = currentType.value === 'all' || item.websiteCategory === currentType.value
    const matchTag = currentTag.value === 'all' || (Array.isArray(item.tags) && item.tags.includes(currentTag.value))
    return matchType && matchTag
  })
})

const updateFilter = ({ type, tag }) => {
  const query = { ...route.query }
  delete query.filter

  const nextType = type !== undefined ? type : currentType.value
  const nextTag = tag !== undefined ? tag : currentTag.value

  if (nextType && nextType !== 'all') {
    query.type = nextType
  } else {
    delete query.type
    delete query.category
  }

  if (nextTag && nextTag !== 'all') {
    query.tag = nextTag
  } else {
    delete query.tag
  }

  router.push({ name: 'ResourceWebsites', query })
}

const setFilter = (value, group) => {
  const isType = group?.id === 'type' || (validTypes.value.has(value) && !validTags.value.has(value))
  if (isType) {
    updateFilter({ type: value, tag: 'all' })
  } else {
    updateFilter({ type: currentType.value, tag: value })
  }
}

const handleCardTagClick = (tag, resource) => {
  const targetType = (currentType.value === 'all' || currentType.value === resource.websiteCategory)
    ? resource.websiteCategory
    : currentType.value
  updateFilter({ type: targetType, tag })
}

const resetFilters = () => {
  updateFilter({ type: 'all', tag: 'all' })
}

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
