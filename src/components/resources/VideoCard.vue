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
        scrolling="no"
        border="0"
        frameborder="no"
        framespacing="0"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen="true"
      ></iframe>
      <div v-else class="video-placeholder">
        <img :src="video.poster" :alt="`${video.title} 海报`" width="960" height="540" loading="lazy" />
        <span class="video-placeholder-label">视频待补充</span>
      </div>
    </div>
    <div class="video-copy">
      <div>
        <p class="video-kicker">时长：{{ video.duration || '待补充' }}</p>
        <h3>{{ video.title }}</h3>
        <p v-if="video.titleEn" class="video-title-en">{{ video.titleEn }}</p>
      </div>
      <p class="video-summary">{{ video.summary }}</p>
      <div class="video-footer">
        <a
          v-if="video.fallbackUrl"
          class="resource-text-link"
          :href="video.fallbackUrl"
          target="_blank"
          rel="noopener noreferrer"
        >打开视频 / Bilibili <span aria-hidden="true">↗</span></a>
        <span v-else class="resource-text-link is-disabled" aria-disabled="true">备用链接待补充</span>
      </div>
    </div>

    <!-- 底部独立标签栏（与 website 卡片同款） -->
    <div v-if="(video.tags && video.tags.length) || $slots.tags" class="video-tags" aria-label="视频标签">
      <slot name="tags">
        <span v-for="tag in video.tags" :key="tag" class="video-tag">{{ tag }}</span>
      </slot>
    </div>
  </article>
</template>

<script setup>
defineProps({
  video: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.video-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  --video-card-surface: var(--home-paper);
  --video-card-ink: var(--home-ink);
  --video-card-muted: var(--home-muted);
  --video-card-rule: var(--home-rule);
  border: 1px solid var(--video-card-ink);
  background: var(--video-card-surface);
  color: var(--video-card-ink);
  transition: color 180ms ease, background-color 180ms ease, border-color 180ms ease;
}

.video-card:hover,
.video-card:focus-within {
  --video-card-surface: var(--home-ink);
  --video-card-ink: var(--home-paper);
  --video-card-muted: rgb(255 255 255 / 0.72);
  --video-card-rule: rgb(255 255 255 / 0.35);
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
  transition: transform 180ms ease, opacity 180ms ease;
}

.video-card:hover .video-placeholder img,
.video-card:focus-within .video-placeholder img {
  transform: scale(1.02);
  opacity: 0.88;
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
  color: var(--video-card-muted);
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.6;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  transition: color 180ms ease;
}

.video-copy h3 {
  margin-top: 0.35rem;
  font-size: clamp(1.05rem, 1.4vw, 1.35rem);
  line-height: 1.35;
  color: var(--video-card-ink);
  transition: color 180ms ease;
}

.video-title-en {
  margin-top: 0.25rem;
  color: var(--video-card-muted);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: color 180ms ease;
}

.video-summary {
  color: var(--video-card-muted);
  font-size: clamp(0.8rem, 1vw, 0.84rem);
  line-height: 1.65;
  transition: color 180ms ease;
}

.video-footer {
  margin-top: auto;
  padding-top: 0.8rem;
  border-top: 1px solid var(--video-card-rule);
  transition: border-color 180ms ease;
}

.resource-text-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 32px;
  color: var(--video-card-ink);
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  transition: color 180ms ease;
}

.resource-text-link:not(.is-disabled):hover,
.resource-text-link:not(.is-disabled):focus-visible {
  color: var(--accent-orange);
}

.resource-text-link.is-disabled {
  color: var(--video-card-muted);
  opacity: 0.65;
}

.video-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0 clamp(1rem, 1.5vw, 1.25rem) 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--video-card-rule);
  transition: border-color 180ms ease;
}

.video-tags:hover,
.video-tags:focus-within {
  border-top-color: var(--video-card-ink);
}

.video-tag {
  display: inline-flex;
  align-items: center;
  min-height: 1.4rem;
  padding: 0.08rem 0.35rem;
  border: 1px solid var(--video-card-rule);
  background-color: transparent;
  color: var(--video-card-muted);
  font-size: 0.64rem;
  line-height: 1.2;
  transition: color 160ms ease, border-color 160ms ease;
}

:deep(.video-tag-button) {
  display: inline-flex;
  align-items: center;
  min-height: 1.4rem;
  padding: 0.08rem 0.35rem;
  background: transparent;
  font: inherit;
  font-size: 0.64rem;
  line-height: 1.2;
  cursor: pointer;
  touch-action: manipulation;
  color: var(--video-card-muted);
  border: 1px solid var(--video-card-rule);
  transition: color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

:deep(.video-tag-button:hover),
:deep(.video-tag-button:focus-visible) {
  color: var(--video-card-ink);
  border-color: var(--video-card-ink);
  box-shadow: inset 0 0 0 1px var(--video-card-ink);
}

@media (prefers-reduced-motion: reduce) {
  .video-card,
  .video-placeholder img,
  .video-tags,
  .resource-text-link {
    transition: none;
  }
}
</style>
