<template>
  <article class="video-card">
    <div class="video-frame">
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
      <div v-else class="video-placeholder">
        <img :src="video.poster" :alt="`${video.title} 海报`" width="960" height="540" loading="lazy" />
        <span class="video-placeholder-label">视频待补充</span>
      </div>
    </div>
    <div class="video-copy">
      <div>
        <p class="video-kicker">{{ video.duration }} · {{ typeLabel }}</p>
        <h3>{{ video.title }}</h3>
        <p v-if="video.titleEn" class="video-title-en">{{ video.titleEn }}</p>
      </div>
      <p class="video-summary">{{ video.summary }}</p>
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
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  video: {
    type: Object,
    required: true,
  },
  sourceTypeLabels: {
    type: Object,
    default: () => ({
      local: '本地视频',
      external: '外部嵌入',
    }),
  },
})

const typeLabel = computed(() => {
  return props.sourceTypeLabels[props.video.sourceType] || (props.video.sourceType === 'local' ? '本地视频' : '外部嵌入')
})
</script>

<style scoped>
.video-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid var(--resources-ink, var(--home-ink));
  background: var(--home-paper);
}

.video-frame {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background: #f2f2ee;
}

.video-frame video,
.video-frame iframe,
.video-placeholder,
.video-placeholder img {
  display: block;
  width: 100%;
  height: 100%;
}

.video-frame video,
.video-frame iframe {
  border: 0;
  object-fit: cover;
}

.video-placeholder {
  position: relative;
}

.video-placeholder img {
  object-fit: cover;
  filter: grayscale(1);
  opacity: 0.72;
}

.video-placeholder-label {
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  padding: 0.38rem 0.55rem;
  color: var(--home-ink);
  background: var(--home-yellow);
  font-size: 0.72rem;
  font-weight: 700;
}

.video-copy {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 1rem;
  padding: clamp(1rem, 1.5vw, 1.25rem);
}

.video-kicker {
  color: var(--resources-muted, var(--home-muted));
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.6;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.video-copy h3 {
  margin-top: 0.35rem;
  font-size: clamp(1.05rem, 1.4vw, 1.35rem);
  line-height: 1.35;
}

.video-title-en {
  margin-top: 0.25rem;
  color: var(--resources-muted, var(--home-muted));
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.video-summary {
  color: var(--resources-muted, var(--home-muted));
  font-size: clamp(0.8rem, 1vw, 0.84rem);
  line-height: 1.65;
}

.resource-text-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: auto;
  min-height: 44px;
  color: var(--resources-ink, var(--home-ink));
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
}

.resource-text-link:not(.is-disabled):hover,
.resource-text-link:not(.is-disabled):focus-visible {
  color: var(--accent-orange);
}

.resource-text-link.is-disabled {
  color: var(--resources-muted, var(--home-muted));
  opacity: 0.65;
}
</style>
