<template>
  <article class="tool-card">
    <div class="tool-card-frame">
      <img :src="tool.image" :alt="tool.alt" width="960" height="640" loading="lazy" />
    </div>
    <div class="tool-card-copy">
      <div class="tool-card-heading">
        <div>
          <p class="tool-card-kicker">{{ tool.platform }}</p>
          <h3>{{ tool.title }}</h3>
        </div>
        <span class="tool-card-format">{{ tool.format }}</span>
      </div>
      <p class="tool-card-summary">{{ tool.summary }}</p>
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
</template>

<script setup>
defineProps({
  tool: {
    type: Object,
    required: true,
  },
})

const isExternal = (url) => /^https?:\/\//i.test(url)
</script>

<style scoped>
.tool-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid var(--resources-ink, var(--home-ink));
  background: var(--home-paper);
}

.tool-card-frame {
  position: relative;
  overflow: hidden;
  aspect-ratio: 3 / 2;
  background: #f2f2ee;
}

.tool-card-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tool-card-copy {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 1rem;
  padding: clamp(1rem, 1.5vw, 1.25rem);
}

.tool-card-heading {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  align-items: start;
}

.tool-card-kicker {
  color: var(--resources-muted, var(--home-muted));
  font-size: 0.68rem;
  line-height: 1.6;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.tool-card-heading h3 {
  margin-top: 0.35rem;
  font-size: clamp(1.05rem, 1.4vw, 1.35rem);
  line-height: 1.35;
}

.tool-card-format {
  flex: 0 0 auto;
  color: var(--resources-muted, var(--home-muted));
  font-size: 0.68rem;
  line-height: 1.3;
  text-align: right;
}

.tool-card-summary {
  color: var(--resources-muted, var(--home-muted));
  font-size: clamp(0.8rem, 1vw, 0.84rem);
  line-height: 1.65;
}

.resource-download-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.35rem;
  width: 100%;
  margin-top: auto;
  min-height: 44px;
  padding: 0.65rem 0.75rem;
  color: var(--resources-ink, var(--home-ink));
  background: transparent;
  border: 1px solid var(--resources-ink, var(--home-ink));
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
  background: var(--resources-ink, var(--home-ink));
}

.resource-download-button.is-disabled {
  color: var(--resources-muted, var(--home-muted));
  border-color: var(--resources-rule, var(--home-rule));
  cursor: not-allowed;
}
</style>
