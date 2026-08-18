<template>
  <section class="course-reference-gallery" :aria-label="`${sessionLabel} 课程参考图`">
    <figure
      v-for="(reference, index) in references"
      :key="reference"
      tabindex="0"
      :aria-label="`${sessionLabel} 课程参考图 ${index + 1}；聚焦或悬停查看彩色放大图像`"
      @mouseenter="showPreview(reference, $event)"
      @mouseleave="hidePreview"
      @focus="showPreview(reference, $event)"
      @blur="hidePreview"
      @click.stop="openPreview(reference, $event)"
      @keydown.enter.prevent="openPreview(reference, $event)"
      @keydown.space.prevent="openPreview(reference, $event)"
    >
      <img :src="reference" :alt="`${sessionLabel} 课程参考图 ${index + 1}`" loading="lazy" />
    </figure>
  </section>

  <Teleport to="body">
    <Transition name="reference-preview">
      <div v-if="activeReference" class="reference-preview" :style="previewStyle" aria-label="关闭参考图预览" role="button" tabindex="0" @click="closePreview" @keydown.esc="closePreview">
        <img :src="activeReference" alt="" @click.stop />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const activeReference = ref(null)
const previewStyle = ref({})
const previewPinned = ref(false)

const showPreview = (reference, event, pinned = false) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  previewStyle.value = {
    '--preview-origin-x': `${rect.left + rect.width / 2 - viewportWidth / 2}px`,
    '--preview-origin-y': `${rect.top + rect.height / 2 - viewportHeight / 2}px`,
    '--preview-origin-scale': `${Math.max(0.1, Math.min(0.28, rect.width / (viewportWidth * 0.78)))}`,
  }
  previewPinned.value = pinned
  activeReference.value = reference
}

const hidePreview = () => {
  if (previewPinned.value) return
  activeReference.value = null
}

const openPreview = (reference, event) => showPreview(reference, event, true)
const closePreview = () => {
  previewPinned.value = false
  activeReference.value = null
}

defineProps({
  sessionLabel: { type: String, required: true },
  references: { type: Array, default: () => [] },
})
</script>

<style scoped>
.course-reference-gallery {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
  margin-top: 1.35rem;
}
.course-reference-gallery figure {
  position: relative;
  z-index: 0;
  min-width: 0;
  margin: 0;
  cursor: zoom-in;
  outline: none;
}
.course-reference-gallery img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--syllabus-rule, #dddddd);
  filter: grayscale(1);
  transform: scale(1);
  transform-origin: center;
  transition: filter 220ms ease, transform 220ms ease;
}
.course-reference-gallery figure:hover,
.course-reference-gallery figure:focus { z-index: 1; }
.course-reference-gallery figure:hover img,
.course-reference-gallery figure:focus img {
  border-color: var(--week-color, #111111);
  filter: grayscale(0);
  transform: scale(1.03);
}
.course-reference-gallery figure:focus-visible {
  outline: 2px solid var(--syllabus-ink, #111111);
  outline-offset: 4px;
}
.reference-preview {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: center;
  padding: clamp(2rem, 6vw, 6rem);
  /* 桌面端悬停预览不拦截鼠标，避免鼠标进入预览层后触发缩略图离开而闪烁。 */
  pointer-events: none;
  background: rgb(255 255 255 / 0.82);
  backdrop-filter: blur(2px);
}
.reference-preview img {
  display: block;
  max-width: min(78vw, 72rem);
  max-height: 78vh;
  width: auto;
  height: auto;
  border: 1px solid var(--syllabus-ink, #111111);
  box-shadow: 0 1.5rem 3.5rem rgb(0 0 0 / 0.16);
}
.reference-preview-enter-active,
.reference-preview-leave-active {
  transition: background-color 220ms ease;
}
.reference-preview-enter-active img,
.reference-preview-leave-active img {
  transition: transform 260ms cubic-bezier(0.22, 0.8, 0.24, 1), opacity 180ms ease;
}
.reference-preview-enter-from { background-color: transparent; }
.reference-preview-enter-from img {
  opacity: 0.25;
  transform: translate(var(--preview-origin-x), var(--preview-origin-y)) scale(var(--preview-origin-scale));
}
.reference-preview-leave-to { background-color: transparent; }
.reference-preview-leave-to img {
  opacity: 0;
  transform: translate(var(--preview-origin-x), var(--preview-origin-y)) scale(var(--preview-origin-scale));
}
@media (max-width: 767px) {
  .course-reference-gallery { margin-top: 1rem; }
  .reference-preview {
    padding: 1.25rem;
    pointer-events: auto;
  }
  .reference-preview img { max-width: 90vw; max-height: 76vh; }
}
@media (prefers-reduced-motion: reduce) {
  .course-reference-gallery img,
  .reference-preview,
  .reference-preview img { transition: none !important; }
}
</style>
