<template>
  <ResourceShell
    title="视频"
    eyebrow="02 / Moving Image"
    intro="从内容采集、数据库关联、AI 编程工具到展览路径与观看节奏，这里收录课程演示与精选案例的视频材料。"
    :count="filteredVideos.length"
    active-section="video"
    :nav-items="resourceNavigationItems"
    :filter-options="filterOptions"
    :filter-groups="filterGroups"
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
        >
          <template #tags>
            <button
              v-for="tag in video.tags"
              :key="tag"
              class="video-tag video-tag-button"
              type="button"
              :aria-label="`按标签筛选 ${tag}`"
              @click="setFilter(tag)"
            >{{ tag }}</button>
          </template>
        </VideoCard>
      </div>

      <div v-else class="resource-empty-state" role="status">
        <p>没有符合当前筛选条件的视频。</p>
        <button type="button" @click="setFilter('all')">清除筛选</button>
      </div>
    </section>
  </ResourceShell>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ResourceShell from '../../components/resources/ResourceShell.vue'
import VideoCard from '../../components/resources/VideoCard.vue'
import { useResourceFilter } from '../../composables/useResourceFilter.js'
import { resourceNavigationItems, resourceVideos } from '../../data/resources.js'
import { usePublishedResources } from '../../composables/usePublishedResources.js'

const route = useRoute()
const router = useRouter()
const { initialize: initializePublishedResources, byType } = usePublishedResources()
const mergedVideos = byType('video', resourceVideos)

const {
  activeFilter,
  filterOptions,
  filterGroups,
  filteredItems: filteredVideos,
  setFilter,
} = useResourceFilter({
  route,
  router,
  routeName: 'ResourceVideos',
  items: mergedVideos,
  getValues: (video) => video.tags || [],
  getFilterGroups: ({ filterValues }) => [
    {
      id: 'category',
      label: '分类',
      options: [
        { value: 'all', label: '全部' },
        { value: 'ai-coding', label: 'AI Coding' },
        { value: 'course', label: '课程示范' },
      ],
    },
    {
      id: 'tag',
      label: '标签',
      options: filterValues.map((value) => ({ value, label: value })),
    },
  ],
  filterPredicate: (video, filter) => ['ai-coding', 'course'].includes(filter)
    ? video.videoCategory === filter
    : (video.tags && video.tags.includes(filter)),
})

onMounted(() => initializePublishedResources())
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
