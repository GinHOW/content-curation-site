<template>
  <article class="web-resource-card">
    <a
      v-if="resource.url"
      class="web-resource-primary"
      :href="resource.url"
      :aria-label="`打开 ${resource.title} 网页`"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span v-if="resource.previewImage" class="web-resource-preview">
        <img
          :src="resource.previewImage"
          :alt="resource.previewAlt || `${resource.title} 网页预览`"
          width="1600"
          height="1000"
          :loading="index === 0 ? 'eager' : 'lazy'"
        />
      </span>
      <span v-else class="web-resource-preview is-empty" aria-hidden="true">网页预览待补充</span>
      <span class="web-resource-index">
        <span>WEB / {{ String(index + 1).padStart(2, '0') }}</span>
        <span aria-hidden="true">↗</span>
      </span>
      <span class="web-resource-heading">
        <span>
          <strong>{{ resource.title }}</strong>
        </span>
      </span>
      <span class="web-resource-summary">{{ resource.summary }}</span>
      <span class="web-resource-footer">
        <span>打开网页 <span aria-hidden="true">↗</span></span>
        <span>{{ domainFor(resource.url) }}</span>
      </span>
    </a>
    <div v-else class="web-resource-primary is-disabled" aria-disabled="true">
      <span v-if="resource.previewImage" class="web-resource-preview">
        <img
          :src="resource.previewImage"
          :alt="resource.previewAlt || `${resource.title} 网页预览`"
          width="1600"
          height="1000"
          loading="lazy"
        />
      </span>
      <span v-else class="web-resource-preview is-empty" aria-hidden="true">网页预览待补充</span>
      <span class="web-resource-index">
        <span>WEB / {{ String(index + 1).padStart(2, '0') }}</span>
        <span>待补充</span>
      </span>
      <span class="web-resource-heading">
        <span><strong>{{ resource.title }}</strong></span>
      </span>
      <span class="web-resource-summary">{{ resource.summary }}</span>
      <span class="web-resource-footer">网页入口待补充</span>
    </div>

    <div class="web-resource-tags" aria-label="资源标签">
      <slot name="tags" />
    </div>
  </article>
</template>

<script setup>
defineProps({
  resource: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
})

const domainFor = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return '网页入口'
  }
}
</script>

<style scoped>
.web-resource-card {
  display: grid;
  min-width: 0;
  --web-card-surface: var(--home-paper);
  --web-card-ink: var(--home-ink);
  --web-card-muted: var(--home-muted);
  --web-card-rule: var(--home-rule);
  border: 1px solid var(--web-card-ink);
  background: var(--web-card-surface);
  transition: color 180ms ease, background-color 180ms ease, border-color 180ms ease;
}

.web-resource-card:hover,
.web-resource-card:focus-within {
  --web-card-surface: var(--home-ink);
  --web-card-ink: var(--home-paper);
  --web-card-muted: rgb(255 255 255 / 0.72);
  --web-card-rule: rgb(255 255 255 / 0.35);
}

.web-resource-primary {
  display: grid;
  gap: 1.1rem;
  min-height: 18rem;
  padding: 1.15rem 1.2rem 1.25rem;
  color: var(--web-card-ink);
  background: transparent;
  text-decoration: none;
  transition: background 180ms ease, color 180ms ease;
}

.web-resource-primary:hover,
.web-resource-primary:focus-visible {
  color: var(--web-card-ink);
  background: transparent;
}

.web-resource-primary:focus-visible {
  outline: 3px solid var(--home-yellow);
  outline-offset: -3px;
}

.web-resource-primary.is-disabled {
  color: var(--web-card-muted);
  cursor: not-allowed;
}

.web-resource-preview {
  position: relative;
  display: block;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  background: #f2f2ee;
}

.web-resource-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.18);
  transition: filter 180ms ease, transform 220ms ease;
}

.web-resource-primary:hover .web-resource-preview img,
.web-resource-primary:focus-visible .web-resource-preview img {
  filter: grayscale(0);
  transform: scale(1.02);
}

.web-resource-preview.is-empty {
  display: grid;
  place-items: center;
  color: var(--home-muted);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.web-resource-index,
.web-resource-heading,
.web-resource-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.web-resource-index {
  padding-bottom: 0.75rem;
  border-bottom: 1px solid currentColor;
  color: var(--web-card-muted);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.web-resource-heading {
  align-items: flex-end;
}

.web-resource-heading > span:first-child {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
}

.web-resource-heading strong {
  font-size: clamp(1.15rem, 2vw, 1.55rem);
  line-height: 1.25;
}

.web-resource-summary {
  max-width: 34rem;
  color: var(--web-card-muted);
  font-size: 0.88rem;
  line-height: 1.7;
}

.web-resource-footer {
  align-items: center;
  margin-top: auto;
  padding-top: 0.8rem;
  border-top: 1px solid currentColor;
  font-size: 0.76rem;
  font-weight: 700;
}

.web-resource-footer > span:last-child {
  color: var(--web-card-muted);
  font-size: 0.68rem;
  font-weight: 400;
  overflow-wrap: anywhere;
  text-align: right;
}

.web-resource-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0 1.2rem 1.15rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--web-card-rule);
  transition: border-color 160ms ease;
}

.web-resource-tags:hover,
.web-resource-tags:focus-within {
  border-top-color: var(--web-card-ink);
}

@media (max-width: 767px) {
  .web-resource-footer {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.4rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .web-resource-primary,
  .web-resource-preview img,
  .web-resource-tags,
  .web-resource-card {
    transition: none;
  }
}
</style>
