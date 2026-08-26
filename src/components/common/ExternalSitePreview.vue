<template>
  <span class="external-site-preview" :class="{ 'is-open': isOpen }">
    <button
      class="external-site-preview-trigger"
      type="button"
      :aria-expanded="isOpen"
      :aria-controls="previewId"
      @click="emit('open')"
    >{{ label }}</button>

    <span class="external-site-preview-card">
      <span class="external-site-preview-description">{{ preview.description }}</span>
    </span>
  </span>

  <Teleport to="body">
    <div
      v-if="isOpen"
      :id="previewId"
      class="external-site-preview-overlay"
      role="dialog"
      aria-modal="true"
      :aria-label="`${label} 网站放大预览`"
      @click.self="emit('close')"
    >
      <div class="external-site-preview-modal" @click.stop>
        <button
            class="external-site-preview-close"
            type="button"
            aria-label="关闭网页预览"
            @click="emit('close')"
          >×</button>
        <a
          class="external-site-preview-external-link"
          :href="preview.url"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="在新窗口打开原网页"
          @click.stop
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14 4h6v6M20 4l-9 9" />
            <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
          </svg>
        </a>
        <iframe
          class="external-site-preview-modal-frame"
          :src="preview.url"
          :title="`${label} 网站放大预览`"
          @load="isFrameLoading = false"
        ></iframe>
        <div v-if="isFrameLoading && preview.cover" class="external-site-preview-loading" role="status" aria-label="网页正在加载" aria-live="polite">
          <img :src="preview.cover" :alt="`${label} 网站封面`" />
          <span class="external-site-preview-loading-progress" aria-hidden="true"><span></span></span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, ref, useId, watch } from 'vue'

const { label, preview, isOpen } = defineProps({
  label: {
    type: String,
    required: true,
  },
  preview: {
    type: Object,
    required: true,
  },
  isOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['open', 'close'])

const previewId = `external-site-preview-${useId()}`
const isFrameLoading = ref(false)


const setPageScrollLock = (locked) => {
  document.documentElement.classList.toggle('preview-is-open', locked)
}

watch(() => isOpen, setPageScrollLock, { immediate: true })
watch(() => isOpen, (open) => {
  isFrameLoading.value = open
})
watch(() => preview.url, () => {
  if (isOpen) isFrameLoading.value = true
})
onBeforeUnmount(() => setPageScrollLock(false))
</script>

<style scoped>
.external-site-preview {
  position: relative;
  display: inline-block;
}

.external-site-preview-trigger {
  padding: 0;
  border: 0;
  color: inherit;
  background: transparent;
  font: inherit;
  text-decoration: underline;
  text-decoration-color: transparent;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.22em;
  cursor: pointer;
  transition: text-decoration-color 160ms ease;
}

.external-site-preview:hover .external-site-preview-trigger,
.external-site-preview.is-open .external-site-preview-trigger {
  text-decoration-color: currentColor;
}

.external-site-preview-card {
  position: absolute;
  z-index: 20;
  bottom: calc(100% + 0.8rem);
  left: 0;
  display: grid;
  width: min(20rem, 28vw);
  padding: 0.9rem;
  overflow: hidden;
  border: 1px solid var(--home-ink, currentColor);
  background: var(--home-paper, #fff);
  box-shadow: 0 0.6rem 1.5rem rgb(0 0 0 / 16%);
  opacity: 0;
  pointer-events: none;
  transform: translateY(0.35rem);
  transition: opacity 160ms ease, transform 160ms ease;
}

.external-site-preview:hover .external-site-preview-card,
.external-site-preview:focus-within .external-site-preview-card {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.external-site-preview.is-open .external-site-preview-card {
  opacity: 0;
  pointer-events: none;
  transform: translateY(0.35rem);
}

.external-site-preview-label,
.external-site-preview-hint {
  font-size: 0.64rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  line-height: 1.25;
}

.external-site-preview-hint {
  color: var(--home-muted, #737373);
  letter-spacing: 0.02em;
}

.external-site-preview-description {
  display: block;
  font-size: 0.8rem;
  line-height: 1.45;
}

.external-site-preview-overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: rgb(0 0 0 / 42%);
}

.external-site-preview-modal {
  position: relative;
  width: 68vw;
  height: 68vh;
  padding: 0;
  border: 1px solid var(--home-ink, #111);
  background: #fff;
  box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 25%);
}

.external-site-preview-close {
  position: absolute;
  z-index: 5;
  top: -1px;
  right: -2.2rem;
  display: grid;
  width: 2.2rem;
  height: 2.2rem;
  padding: 0;
  place-items: center;
  border: 1px solid var(--home-ink, #111);
  color: inherit;
  background: #fff;
  box-shadow: 0 0.35rem 1rem rgb(0 0 0 / 12%);
  font-size: 1.15rem;
  line-height: 1;
  cursor: pointer;
}

.external-site-preview-close:hover,
.external-site-preview-close:focus-visible {
  color: #fff;
  background: var(--home-ink, #111);
}

.external-site-preview-external-link {
  position: absolute;
  z-index: 5;
  top: 2.2rem;
  right: -2.2rem;
  display: grid;
  width: 2.2rem;
  height: 2.2rem;
  place-items: center;
  border: 1px solid var(--home-ink, #111);
  color: inherit;
  background: #fff;
  box-shadow: 0 0.35rem 1rem rgb(0 0 0 / 12%);
}

.external-site-preview-external-link:hover,
.external-site-preview-external-link:focus-visible {
  color: #fff;
  background: var(--home-ink, #111);
}

.external-site-preview-external-link svg {
  width: 1rem;
  height: 1rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.external-site-preview-modal-frame {
  display: block;
  width: 100%;
  min-height: 0;
  height: 100%;
  border: 1px solid var(--home-rule, #d6d6d6);
  background: #f4f4f4;
}

.external-site-preview-loading {
  position: absolute;
  z-index: 4;
  inset: 0;
  overflow: hidden;
  background: #fff;
}

.external-site-preview-loading img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.external-site-preview-loading-progress {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: block;
  height: 2px;
  overflow: hidden;
  background: rgb(17 17 17 / 12%);
}

.external-site-preview-loading-progress span {
  display: block;
  width: 32%;
  height: 100%;
  background: var(--home-ink, #111111);
  animation: external-site-preview-loading-progress 1.35s ease-in-out infinite;
}

@keyframes external-site-preview-loading-progress {
  0% { transform: translateX(-110%); }
  55% { transform: translateX(210%); }
  100% { transform: translateX(310%); }
}

@media (max-width: 767px) {
  .external-site-preview-card {
    display: none;
  }

  .external-site-preview-overlay {
    display: none;
  }
}
</style>
