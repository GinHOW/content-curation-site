<template>
  <ResourceShell
    title="工具"
    eyebrow="04 / Toolkit"
    intro="从选词采集、内容建库到空间关系整理，这里汇集课程使用的数字工具与策展工作方法。"
    :count="filteredTools.length"
    active-section="tool"
    :nav-items="resourceNavigationItems"
    :filter-options="filterOptions"
    surface-color="var(--home-magenta)"
    filter-accent="var(--home-ink)"
    :active-filter="activeFilter"
    @filter="setFilter"
  >
    <section class="resource-detail-section" aria-label="工具列表">
      <div v-if="filteredTools.length" class="tool-detail-grid">
        <ToolCard
          v-for="tool in filteredTools"
          :key="tool.id"
          :tool="tool"
        />
      </div>

      <div v-else class="resource-empty-state" role="status">
        <p>没有符合当前格式的工具。</p>
        <button type="button" @click="setFilter('all')">清除筛选</button>
      </div>
    </section>
  </ResourceShell>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ResourceShell from '../../components/resources/ResourceShell.vue'
import ToolCard from '../../components/resources/ToolCard.vue'
import { useResourceFilter } from '../../composables/useResourceFilter.js'
import { resourceNavigationItems, resourceTools } from '../../data/resources/index.js'
import { usePublishedResources } from '../../composables/usePublishedResources.js'

const route = useRoute()
const router = useRouter()
const { initialize: initializePublishedResources, byType } = usePublishedResources()
const mergedTools = byType('tool', resourceTools)

const {
  activeFilter,
  filterOptions,
  filteredItems: filteredTools,
  setFilter,
} = useResourceFilter({
  route,
  router,
  routeName: 'ResourceTools',
  items: mergedTools,
  getValues: (tool) => [tool.format],
})

onMounted(() => initializePublishedResources())
</script>

<style scoped>
.resource-detail-section {
  scroll-margin-top: 2rem;
}

.tool-detail-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(1rem, 2vw, 2rem);
  padding-top: 1.5rem;
}

.resource-empty-state {
  display: grid;
  justify-items: start;
  gap: 1rem;
  padding: 3rem 0;
  color: var(--home-muted);
}

.resource-empty-state button {
  min-height: 44px;
  padding: 0.55rem 0.8rem;
  color: var(--home-ink);
  background: transparent;
  border: 1px solid var(--home-ink);
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 1439px) {
  .tool-detail-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1023px) {
  .tool-detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .tool-detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
