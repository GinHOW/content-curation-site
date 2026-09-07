<template>
  <ResourceShell
    title="网页"
    eyebrow="02 / Web"
    intro="从视觉文化与数字媒介案例，到展览工作室和空间项目档案，这里收录课程研究中持续访问的网页与在线项目。"
    :count="filteredResources.length"
    active-section="website"
    :nav-items="resourceNavigationItems"
    :filter-options="filterOptions"
    :filter-groups="filterGroups"
    :active-filter="activeFilter"
    :selected-filters="selectedFilters"
    filter-label=""
    surface-color="var(--home-green)"
    filter-accent="var(--home-ink)"
    @filter="setFilter"
    @deselect-filter="removeSelectedFilter"
    @clear-filters="clearTagFilters"
  >
    <section class="resource-detail-section" aria-label="网页列表">
      <div v-if="filteredResources.length" class="web-resource-grid">
        <WebResourceCard v-for="(resource, index) in filteredResources" :key="resource.id" :resource="resource" :index="index">
          <template #tags>
            <template v-if="resource.tagGroups">
              <button v-for="item in cardTags(resource)" :key="item.tag" class="resource-tag resource-tag-button" type="button" :aria-label="`按${item.groupLabel}筛选 ${item.tag}`" @click="handleCardTagClick(item)">{{ item.tag }}</button>
            </template>
            <span v-else v-for="tag in resource.tags" :key="tag" class="resource-tag">{{ tag }}</span>
          </template>
        </WebResourceCard>
      </div>
      <div v-else class="resource-empty-state" role="status"><p>没有符合当前筛选条件的网页。</p><button type="button" @click="resetFilters">清除筛选</button></div>
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
import { WEBSITE_TAG_GROUPS } from '../../data/resources/websiteTagGroups.js'
import { usePublishedResources } from '../../composables/usePublishedResources.js'

const route = useRoute()
const router = useRouter()
const { initialize: initializePublishedResources, byType } = usePublishedResources()
const mergedWebsites = byType('website', resourceWebsites)
const tagGroupIds = WEBSITE_TAG_GROUPS.map(({ id }) => id)

const typeOptions = computed(() => [{ value: 'all', label: '全部' }, ...getResourceCategoryOptions('website')])
const validTypes = computed(() => new Set(typeOptions.value.map(({ value }) => value)))
const currentType = computed(() => {
  const value = route.query.type || route.query.category || route.query.filter
  return typeof value === 'string' && validTypes.value.has(value) ? value : 'all'
})
const scopedWebsites = computed(() => currentType.value === 'all'
  ? mergedWebsites.value
  : mergedWebsites.value.filter((item) => item.websiteCategory === currentType.value))
const tagStats = computed(() => Object.fromEntries(WEBSITE_TAG_GROUPS.map(({ id }) => {
  const counts = new Map()
  for (const item of scopedWebsites.value) {
    for (const tag of item.tagGroups?.[id] || []) counts.set(tag, (counts.get(tag) || 0) + 1)
  }
  return [id, [...counts].map(([value, count]) => ({ value, label: value, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'zh-CN'))]
})))
const queryValues = (key) => {
  const raw = route.query[key]
  const values = Array.isArray(raw) ? raw : raw ? [raw] : []
  return [...new Set(values.filter((value) => typeof value === 'string'))]
}
const selectedByGroup = computed(() => Object.fromEntries(tagGroupIds.map((id) => [id, queryValues(id).filter((tag) => tagStats.value[id].some(({ value }) => value === tag))])))
const legacyTag = computed(() => {
  const raw = route.query.tag
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' && scopedWebsites.value.some((item) => item.tags?.includes(value)) ? value : ''
})
const tagOptions = (id) => {
  const selected = selectedByGroup.value[id]
  const options = [...tagStats.value[id]]
  const pinned = selected.map((value) => options.find((item) => item.value === value)).filter(Boolean)
  return [{ value: 'all', label: '全部' }, ...pinned, ...options.filter((item) => !selected.includes(item.value))]
}
const filterGroups = computed(() => {
  const subgroups = WEBSITE_TAG_GROUPS
    .filter(({ id }) => tagStats.value[id].length)
    .map(({ id, label }) => ({ id, label, options: tagOptions(id), collapsible: true, collapsedRows: 1 }))
  return [{ id: 'type', label: '类型', options: typeOptions.value }, ...(subgroups.length ? [{ id: 'tags', label: '标签', subgroups }] : [])]
})
const filterOptions = computed(() => typeOptions.value)
const activeFilter = computed(() => ({ type: currentType.value, ...selectedByGroup.value }))
const selectedFilters = computed(() => WEBSITE_TAG_GROUPS.flatMap(({ id, label }) => selectedByGroup.value[id].map((value) => ({ group: id, groupLabel: label, value, label: value }))))
const filteredResources = computed(() => scopedWebsites.value.filter((item) => {
  if (legacyTag.value && !item.tags?.includes(legacyTag.value)) return false
  return WEBSITE_TAG_GROUPS.every(({ id }) => {
    const selected = selectedByGroup.value[id]
    return !selected.length || selected.some((tag) => item.tagGroups?.[id]?.includes(tag))
  })
}))

const updateFilter = ({ type = currentType.value, groups = selectedByGroup.value, clearLegacy = true }) => {
  const query = { ...route.query }
  delete query.filter
  delete query.category
  if (clearLegacy) delete query.tag
  for (const id of tagGroupIds) delete query[id]
  if (type && type !== 'all') query.type = type
  else delete query.type
  for (const id of tagGroupIds) if (groups[id]?.length) query[id] = groups[id]
  router.push({ name: 'ResourceWebsites', query })
}
const setFilter = (value, group) => {
  if (group?.id === 'type') {
    updateFilter({ type: value, groups: Object.fromEntries(tagGroupIds.map((id) => [id, []])) })
    return
  }
  if (!tagGroupIds.includes(group?.id)) return
  const groups = Object.fromEntries(tagGroupIds.map((id) => [id, [...selectedByGroup.value[id]]]))
  groups[group.id] = value === 'all'
    ? []
    : groups[group.id].includes(value)
      ? groups[group.id].filter((tag) => tag !== value)
      : [...groups[group.id], value]
  updateFilter({ groups })
}
const removeSelectedFilter = ({ group, value }) => setFilter(value, { id: group })
const clearTagFilters = () => updateFilter({ groups: Object.fromEntries(tagGroupIds.map((id) => [id, []])) })
const resetFilters = () => updateFilter({ type: 'all', groups: Object.fromEntries(tagGroupIds.map((id) => [id, []])) })
const cardTags = (resource) => WEBSITE_TAG_GROUPS.flatMap(({ id, label }) => (resource.tagGroups?.[id] || []).map((tag) => ({ tag, group: id, groupLabel: label })))
const handleCardTagClick = ({ tag, group }) => setFilter(tag, { id: group })

onMounted(() => initializePublishedResources())
</script>

<style scoped>
.resource-detail-section { scroll-margin-top:2rem; }
.web-resource-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:clamp(1rem,2vw,2rem); padding-top:clamp(2rem,4vw,3.5rem); }
.resource-tag { display:inline-flex; align-items:center; min-height:1.4rem; padding:.08rem .24rem; border:1px solid var(--web-card-rule,var(--home-rule)); color:var(--web-card-muted,var(--home-muted)); font-size:.64rem; line-height:1.2; }
.resource-tag-button { background:transparent; font:inherit; font-size:.64rem; line-height:1.2; cursor:pointer; touch-action:manipulation; transition:color 160ms ease,border-color 160ms ease,transform 160ms ease; }
.resource-tag-button:hover,.resource-tag-button:focus-visible { color:var(--web-card-ink,var(--home-ink)); background:transparent; border-color:var(--web-card-ink,var(--home-ink)); box-shadow:inset 0 0 0 1px var(--web-card-ink,var(--home-ink)); }
.resource-tag-button:focus-visible { outline:2px solid var(--web-card-ink,var(--home-ink)); outline-offset:2px; }
.resource-empty-state { display:grid; justify-items:start; gap:1rem; padding:3rem 0; color:var(--resources-muted); }
.resource-empty-state button { min-height:44px; padding:.55rem .8rem; color:var(--resources-ink); background:transparent; border:1px solid var(--resources-ink); font:inherit; font-size:.78rem; font-weight:700; cursor:pointer; }
@media (max-width:1439px) { .web-resource-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
@media (max-width:1023px) { .web-resource-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media (max-width:767px) { .web-resource-grid { grid-template-columns:1fr; } }
</style>
