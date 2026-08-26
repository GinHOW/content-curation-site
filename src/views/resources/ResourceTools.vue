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
        <article v-for="tool in filteredTools" :key="tool.id" class="tool-detail-card">
          <div class="tool-detail-frame">
            <img :src="tool.image" :alt="tool.alt" width="960" height="640" loading="lazy" />
          </div>
          <div class="tool-detail-copy">
            <div class="tool-detail-heading">
              <div>
                <p class="tool-detail-kicker">{{ tool.platform }}</p>
                <h3>{{ tool.title }}</h3>
              </div>
              <span class="tool-detail-format">{{ tool.format }}</span>
            </div>
            <p>{{ tool.summary }}</p>
            <a
              v-if="tool.downloadUrl"
              class="resource-download-button"
              :href="tool.downloadUrl"
              :download="isExternal(tool.downloadUrl) ? undefined : tool.title"
              :target="isExternal(tool.downloadUrl) ? '_blank' : undefined"
              :rel="isExternal(tool.downloadUrl) ? 'noopener noreferrer' : undefined"
            >下载 <span aria-hidden="true">↗</span></a>
            <button v-else class="resource-download-button is-disabled" type="button" disabled>待开放</button>
          </div>
        </article>
      </div>

      <div v-else class="resource-empty-state" role="status">
        <p>没有符合当前格式的工具。</p>
        <button type="button" @click="setFilter('all')">清除筛选</button>
      </div>
    </section>
  </ResourceShell>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import ResourceShell from '../../components/resources/ResourceShell.vue'
import { useResourceFilter } from '../../composables/useResourceFilter.js'
import { resourceNavigationItems, resourceTools } from '../../data/resources.js'

const route = useRoute()
const router = useRouter()

const {
  activeFilter,
  filterOptions,
  filteredItems: filteredTools,
  setFilter,
} = useResourceFilter({
  route,
  router,
  routeName: 'ResourceTools',
  items: resourceTools,
  getValues: (tool) => [tool.format],
})

const isExternal = (url) => /^https?:\/\//i.test(url)
</script>

<style scoped>
.resource-detail-section {
  scroll-margin-top: 2rem;
}

.tool-detail-kicker {
  color: var(--home-muted);
  font-size: 0.68rem;
  line-height: 1.6;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.tool-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1.25rem, 3vw, 2.5rem);
  padding-top: 1.5rem;
}

.tool-detail-card {
  min-width: 0;
  border: 1px solid var(--home-ink);
  background: var(--home-paper);
}

.tool-detail-frame {
  position: relative;
  overflow: hidden;
  aspect-ratio: 3 / 2;
  background: #f2f2ee;
}

.tool-detail-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tool-detail-copy {
  display: grid;
  gap: 1rem;
  padding: 1.1rem 1.15rem 1.25rem;
}

.tool-detail-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: start;
}

.tool-detail-heading h3 {
  margin-top: 0.45rem;
  font-size: clamp(1.05rem, 1.7vw, 1.35rem);
  line-height: 1.35;
}

.tool-detail-format {
  flex: 0 0 auto;
  color: var(--home-muted);
  font-size: 0.68rem;
  line-height: 1.3;
  text-align: right;
}

.tool-detail-copy > p {
  color: var(--home-muted);
  font-size: 0.84rem;
  line-height: 1.65;
}

.resource-download-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.35rem;
  width: 100%;
  min-height: 44px;
  padding: 0.65rem 0.75rem;
  color: var(--home-ink);
  background: transparent;
  border: 1px solid var(--home-ink);
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: color 180ms ease, background 180ms ease, border-color 180ms ease;
}

.resource-download-button:not(.is-disabled):hover,
.resource-download-button:not(.is-disabled):focus-visible {
  color: var(--home-paper);
  background: var(--home-ink);
}

.resource-download-button.is-disabled {
  color: var(--home-muted);
  border-color: var(--home-rule);
  cursor: not-allowed;
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

@media (max-width: 767px) {
  .tool-detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
