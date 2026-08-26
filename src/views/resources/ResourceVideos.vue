<template>
  <ResourceShell
    title="视频"
    eyebrow="02 / Moving Image"
    intro="从内容采集、数据库关联到展览路径与观看节奏，这里收录课程演示与案例分析的视频材料。"
    :count="filteredVideos.length"
    active-section="video"
    :nav-items="resourceNavigationItems"
    :filter-options="filterOptions"
    surface-color="var(--home-orange)"
    filter-accent="var(--home-ink)"
    :active-filter="activeFilter"
    @filter="setFilter"
  >
    <section class="resource-detail-section" aria-label="视频列表">
      <div v-if="filteredVideos.length" class="video-detail-grid">
        <VideoCard
          v-for="video in filteredVideos"
          :key="video.id"
          :video="video"
          :source-type-labels="sourceTypeLabels"
        />
      </div>

      <div v-else class="resource-empty-state" role="status">
        <p>没有符合当前来源类型的视频。</p>
        <button type="button" @click="setFilter('all')">清除筛选</button>
      </div>
    </section>
  </ResourceShell>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import ResourceShell from '../../components/resources/ResourceShell.vue'
import VideoCard from '../../components/resources/VideoCard.vue'
import { useResourceFilter } from '../../composables/useResourceFilter.js'
import { resourceNavigationItems, resourceVideos } from '../../data/resources.js'

const route = useRoute()
const router = useRouter()
const sourceTypeLabels = {
  local: '本地视频',
  external: '外部嵌入',
}

const {
  activeFilter,
  filterOptions,
  filteredItems: filteredVideos,
  setFilter,
} = useResourceFilter({
  route,
  router,
  routeName: 'ResourceVideos',
  items: resourceVideos,
  getValues: (video) => [video.sourceType],
  labels: sourceTypeLabels,
})
</script>

<style scoped>
.resource-detail-section {
  scroll-margin-top: 2rem;
}

.video-detail-grid {
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
  .video-detail-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1023px) {
  .video-detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .video-detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
