<template>
  <section
    class="course-reference-gallery"
    :aria-label="`${sessionLabel} 课程参考图`"
  >
    <figure
      v-for="(reference, index) in references"
      :key="reference.src"
      tabindex="0"
      :aria-label="`${sessionLabel} 课程参考图 ${index + 1}${reference.url ? '；点击预览原网页' : '；点击查看彩色放大图像'}`"
      @click.stop="openPreview(reference, $event)"
      @keydown.enter.prevent="openPreview(reference, $event)"
      @keydown.space.prevent="openPreview(reference, $event)"
    >
      <img :src="reference.src" :alt="`${sessionLabel} 课程参考图 ${index + 1}`" loading="lazy" />
    </figure>
  </section>

  <Teleport to="body">
    <Transition name="reference-preview">
      <div
        v-if="activeReference"
        class="reference-preview"
        :style="previewStyle"
        aria-label="关闭参考图预览"
        role="button"
        tabindex="0"
        @click="closePreview"
        @keydown.esc="closePreview"
        @keydown.left.prevent="showReference(activeIndex - 1)"
        @keydown.right.prevent="showReference(activeIndex + 1)"
        @touchstart.passive="startSwipe"
        @touchend="endSwipe"
      >
        <button
          v-if="references.length > 1"
          type="button"
          class="reference-nav reference-nav-prev"
          aria-label="上一张参考图"
          @click.stop="showReference(activeIndex - 1)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />
          </svg>
        </button>
        <div v-if="activeReference.url" class="reference-web-frame" @click.stop>
          <a
            class="reference-external-link"
            :href="activeReference.url"
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
            :src="activeReference.embed === false ? 'about:blank' : activeReference.url"
            :title="activeReference.title || `${sessionLabel} 原网页预览`"
            @load="handleFrameLoad"
          ></iframe>
          <template v-if="activeReference.embed === false">
            <div class="reference-static-preview">
              <img
                :src="activeReference.src"
                :alt="activeReference.title || `${sessionLabel} 参考图`"
                draggable="false"
              />
              <span class="reference-static-label">网站不支持内嵌预览</span>
            </div>
          </template>
          <template v-else>
            <div v-if="isWebLoading" class="reference-web-loading" role="status" aria-label="网页正在加载" aria-live="polite">
              <img :src="activeReference.src" alt="" draggable="false" />
              <span class="reference-web-loading-progress" aria-hidden="true"><span></span></span>
            </div>
          </template>
        </div>
        <img v-else :src="activeReference.src" alt="" draggable="false" @click.stop />
        <button
          v-if="references.length > 1"
          type="button"
          class="reference-nav reference-nav-next"
          aria-label="下一张参考图"
          @click.stop="showReference(activeIndex + 1)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const activeReference = ref(null)
const activeIndex = ref(-1)
const previewStyle = ref({})
const swipeStart = ref(null)
const isWebLoading = ref(false)

const handleFrameLoad = () => {
  if (activeReference.value?.embed !== false) isWebLoading.value = false
}

const showPreview = (reference, event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  previewStyle.value = {
    '--preview-origin-x': `${rect.left + rect.width / 2 - viewportWidth / 2}px`,
    '--preview-origin-y': `${rect.top + rect.height / 2 - viewportHeight / 2}px`,
    '--preview-origin-scale': `${Math.max(0.1, Math.min(0.28, rect.width / (viewportWidth * 0.78)))}`,
  }
  isWebLoading.value = Boolean(reference.url && reference.embed !== false)
  activeReference.value = reference
}

const openPreview = (reference, event) => {
  activeIndex.value = references.findIndex((item) => item.src === reference.src)
  showPreview(reference, event)
}
const showReference = (index) => {
  if (references.length < 2) return
  const nextIndex = (index + references.length) % references.length
  activeIndex.value = nextIndex
  isWebLoading.value = Boolean(references[nextIndex].url && references[nextIndex].embed !== false)
  activeReference.value = references[nextIndex]
}
const closePreview = () => {
  activeReference.value = null
  activeIndex.value = -1
  isWebLoading.value = false
}
const startSwipe = (event) => {
  const touch = event.touches[0]
  swipeStart.value = { x: touch.clientX, y: touch.clientY }
}
const endSwipe = (event) => {
  if (!swipeStart.value || references.length < 2) return
  const touch = event.changedTouches[0]
  const distanceX = touch.clientX - swipeStart.value.x
  const distanceY = touch.clientY - swipeStart.value.y
  swipeStart.value = null

  // 只在全屏预览内响应清晰的横向滑动，避免与纵向阅读手势冲突。
  if (Math.abs(distanceX) < 48 || Math.abs(distanceX) <= Math.abs(distanceY)) return
  showReference(activeIndex.value + (distanceX < 0 ? 1 : -1))
}

const props = defineProps({
  sessionLabel: { type: String, required: true },
  references: { type: Array, default: () => [] },
})
const references = props.references
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
.course-reference-gallery figure:hover img,
.course-reference-gallery figure:focus-visible img {
  filter: grayscale(0);
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
  /* 全屏遮罩拦截底层课次热区，点击空白处关闭预览。 */
  pointer-events: auto;
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
.reference-web-frame {
  position: relative;
  width: min(78vw, 72rem);
  height: min(78vh, 48rem);
  border: 1px solid var(--syllabus-ink, #111111);
  background: #fff;
  box-shadow: 0 1.5rem 3.5rem rgb(0 0 0 / 0.16);
}
.reference-external-link {
  position: absolute;
  z-index: 2;
  /* 挂在网页框右上角外侧，避免遮挡 iframe 内的网页内容。 */
  top: -1px;
  right: -2.25rem;
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border: 1px solid var(--syllabus-ink, #111111);
  color: var(--syllabus-ink, #111111);
  background: rgb(255 255 255 / 0.92);
  box-shadow: 0 0.25rem 0.7rem rgb(0 0 0 / 0.12);
}
.reference-external-link:hover,
.reference-external-link:focus-visible {
  color: #fff;
  background: var(--syllabus-ink, #111111);
}
.reference-external-link svg {
  width: 1.05rem;
  height: 1.05rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}
.reference-web-frame iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}
.reference-static-preview {
  position: absolute;
  z-index: 1;
  inset: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #fff;
}
.reference-static-preview img {
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  border: 0;
  box-shadow: none;
  object-fit: contain;
  filter: none;
}
.reference-static-label {
  position: absolute;
  right: 0.75rem;
  bottom: 0.75rem;
  z-index: 2;
  padding: 0.35rem 0.55rem;
  border: 1px solid var(--syllabus-ink, #111111);
  color: var(--syllabus-ink, #111111);
  background: rgb(255 255 255 / 92%);
  font-size: 0.72rem;
  line-height: 1.2;
}
.reference-web-loading {
  position: absolute;
  z-index: 1;
  inset: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #fff;
}
.reference-web-loading img {
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  border: 0;
  box-shadow: none;
  object-fit: contain;
  filter: none;
}
.reference-web-loading-progress {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: block;
  height: 2px;
  overflow: hidden;
  background: rgb(17 17 17 / 12%);
}
.reference-web-loading-progress span {
  display: block;
  width: 32%;
  height: 100%;
  background: var(--syllabus-ink, #111111);
  animation: reference-web-loading-progress 1.35s ease-in-out infinite;
}
@keyframes reference-web-loading-progress {
  0% { transform: translateX(-110%); }
  55% { transform: translateX(210%); }
  100% { transform: translateX(310%); }
}
.reference-nav {
  display: inline-flex;
  position: fixed;
  top: 50%;
  z-index: 2;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--syllabus-ink, #111111);
  border-radius: 50%;
  color: var(--syllabus-ink, #111111);
  background: rgb(255 255 255 / 0.9);
  cursor: pointer;
  transform: translateY(-50%);
}
.reference-nav svg {
  width: 1.35rem;
  height: 1.35rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}
.reference-nav:hover,
.reference-nav:focus-visible { background: var(--week-color, #efe373); }
.reference-nav-prev { left: 1.25rem; }
.reference-nav-next { right: 1.25rem; }
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
  }
  .reference-preview img { max-width: 90vw; max-height: 76vh; }
  .reference-nav { display: none; }
}
/* iPad 等无悬停能力的大屏触控设备保留显式切换按钮。 */
@media (hover: none) and (pointer: coarse) and (min-width: 768px) {
  .reference-nav { display: inline-flex; }
}
@media (prefers-reduced-motion: reduce) {
  .course-reference-gallery img,
  .reference-preview,
  .reference-preview img { transition: none !important; }
}
</style>
