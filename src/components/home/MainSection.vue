<template>
  <section
    id="city"
    class="home-section city-section"
    data-section
    aria-labelledby="city-title"
  >
    <div class="section-grid section-intro-grid">
      <div class="section-title-column">
        <p class="eyebrow">2026 · New Direction</p>
        <div class="section-title-lockup">
          <h2 id="city-title">
            <span class="city-title-name">策展<br />超市<span class="city-title-version"> 2.0</span></span>
          </h2>
        </div>
      </div>
      <div class="section-copy-column city-copy">
        <p class="lead-copy">
          “策展超市 2.0”把研究从日常物件延伸到城市现场，关注公共空间、地方记忆与人与物的关系，将个人观察组织为可访问的策展项目。
        </p>
        <p class="micro-copy">从对象出发，进入城市；从城市出发，重新组织内容。</p>
      </div>
    </div>

    <p v-if="loading" class="city-data-status" aria-live="polite">正在读取共享选题库……</p>
    <div v-else-if="stateError" class="city-data-status is-error" role="status">
      <span>共享选题库暂时无法读取：{{ stateError }}</span>
      <button type="button" @click="$emit('retry')">重试</button>
    </div>
    <template v-else>
      <p v-if="isLocalFallback" class="city-data-status is-fallback" aria-live="polite">
        本地预览模式：当前显示内置选题库；连接课程服务后会自动同步共享数据。
      </p>
      <ControllerSpatialMap
        :rooms="rooms"
        :topic-colors="topicColors"
        :image-library="spatialTopicImages"
      />
    </template>
  </section>
</template>

<script setup>
import ControllerSpatialMap from './ControllerSpatialMap.vue'
import { spatialTopicImages } from '../../data/spatialTopicImages.js'

defineProps({
  rooms: { type: Array, default: () => [] },
  topicColors: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  isLocalFallback: { type: Boolean, default: false },
  stateError: { type: String, default: '' },
})
defineEmits(['retry'])
</script>

<style scoped>
.city-title-name,
.city-title-version {
  white-space: nowrap;
}

.city-data-status { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 2rem 0 0; padding: 0.8rem 0; border-top: 1px solid var(--home-rule); color: var(--home-muted); font-size: 0.8rem; }
.city-data-status.is-error { color: var(--home-ink); }
.city-data-status.is-fallback { color: var(--home-muted); }
.city-data-status button { border: 1px solid var(--home-ink); background: var(--home-paper); padding: 0.35rem 0.65rem; cursor: pointer; font: inherit; }
</style>
