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
        <article v-for="video in filteredVideos" :key="video.id" class="video-detail-card">
          <div class="video-detail-frame">
            <video
              v-if="video.sourceType === 'local' && video.src"
              controls
              preload="metadata"
              :poster="video.poster"
              :aria-label="video.title"
            >
              <source :src="video.src" />
            </video>
            <iframe
              v-else-if="video.sourceType === 'external' && video.embedUrl"
              :src="video.embedUrl"
              :title="video.title"
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
            <div v-else class="video-detail-placeholder">
              <img :src="video.poster" :alt="`${video.title} 海报`" width="960" height="540" loading="lazy" />
              <span>视频待补充</span>
            </div>
          </div>
          <div class="video-detail-copy">
            <div>
              <p class="video-detail-kicker">{{ video.duration }} · {{ sourceTypeLabels[video.sourceType] }}</p>
              <h3>{{ video.title }}</h3>
              <p class="video-detail-title-en">{{ video.titleEn }}</p>
            </div>
            <p class="video-detail-summary">{{ video.summary }}</p>
            <a
              v-if="video.fallbackUrl"
              class="resource-text-link"
              :href="video.fallbackUrl"
              target="_blank"
              rel="noopener noreferrer"
            >打开备用链接 <span aria-hidden="true">↗</span></a>
            <span v-else class="resource-text-link is-disabled" aria-disabled="true">备用链接待补充</span>
          </div>
        </article>
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

.video-detail-kicker {
  color: var(--home-muted);
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.6;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.video-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1.25rem, 3vw, 2.5rem);
  padding-top: 1.5rem;
}

.video-detail-card {
  min-width: 0;
  border: 1px solid var(--home-ink);
  background: var(--home-paper);
}

.video-detail-frame {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background: #f2f2ee;
}

.video-detail-frame video,
.video-detail-frame iframe,
.video-detail-placeholder,
.video-detail-placeholder img {
  display: block;
  width: 100%;
  height: 100%;
}

.video-detail-frame video,
.video-detail-frame iframe {
  border: 0;
  object-fit: cover;
}

.video-detail-placeholder {
  position: relative;
}

.video-detail-placeholder img {
  object-fit: cover;
  filter: grayscale(1);
  opacity: 0.72;
}

.video-detail-placeholder span {
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  padding: 0.38rem 0.55rem;
  color: var(--home-ink);
  background: var(--home-yellow);
  font-size: 0.72rem;
  font-weight: 700;
}

.video-detail-copy {
  display: grid;
  gap: 1rem;
  padding: 1.1rem 1.15rem 1.25rem;
}

.video-detail-copy h3 {
  margin-top: 0.45rem;
  font-size: clamp(1.05rem, 1.7vw, 1.35rem);
  line-height: 1.35;
}

.video-detail-title-en {
  margin-top: 0.25rem;
  color: var(--home-muted);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.video-detail-summary {
  color: var(--home-muted);
  font-size: 0.84rem;
  line-height: 1.65;
}

.resource-text-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 44px;
  color: var(--home-ink);
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
}

.resource-text-link:not(.is-disabled):hover,
.resource-text-link:not(.is-disabled):focus-visible {
  color: var(--accent-orange);
}

.resource-text-link.is-disabled {
  color: var(--home-muted);
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
  .video-detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
