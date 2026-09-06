<template>
  <div
    ref="showcaseElement"
    class="sticker-showcase"
    role="group"
    aria-label="2025 课程策展项目贴纸入口"
    aria-describedby="sticker-drag-help"
  >
    <p id="sticker-drag-help" class="visually-hidden">
      轻点贴纸进入项目；使用鼠标拖动，或在触屏设备上长按后拖动，可重新摆放物件。按住 Alt 键和方向键也可移动当前贴纸。
    </p>
    <p class="visually-hidden" aria-live="polite">{{ dragAnnouncement }}</p>

    <ol class="sticker-list" aria-label="2025 课程项目目录">
      <li
        v-for="sticker in stickers"
        :key="sticker.workId"
        class="sticker-entry"
        :class="{ 'is-dragging': isDragging(sticker) }"
        :style="stickerStyle(sticker)"
      >
        <button
          class="sticker-button"
          type="button"
          :aria-label="`查看 ${sticker.title} 策展项目，主题为 ${sticker.objectLabel}。可拖动重新摆放。`"
          aria-describedby="sticker-drag-help"
          aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight"
          @pointerdown="handlePointerDown($event, sticker)"
          @pointermove="handlePointerMove"
          @pointerup="finishPointer"
          @pointercancel="cancelPointer"
          @click="handleClick(sticker)"
          @keydown="handleKeydown($event, sticker)"
        >
          <img
            :src="sticker.src"
            alt=""
            class="sticker-image"
            :width="sticker.width"
            :height="sticker.height"
            loading="lazy"
            decoding="async"
            draggable="false"
          />
          <span class="sticker-title" aria-hidden="true">{{ sticker.title }}</span>
        </button>
      </li>
    </ol>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { stickers } from '../../data/stickers.js'
import { useStickerInteraction } from '../../composables/useStickerInteraction.js'

const emit = defineEmits(['open-work'])
const showcaseElement = ref(null)

const {
  dragAnnouncement,
  isDragging,
  stickerStyle,
  handlePointerDown,
  handlePointerMove,
  finishPointer,
  cancelPointer,
  handleClick,
  handleKeydown,
} = useStickerInteraction({
  showcaseElement,
  onOpenWork: (workId) => emit('open-work', workId),
})
</script>

<style scoped>
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.sticker-showcase {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: visible;
  background: var(--home-paper, #ffffff);
  isolation: isolate;
}

.sticker-list {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sticker-entry {
  --sticker-title-top: var(--sticker-desktop-title-top);
  --sticker-title-offset: var(--sticker-desktop-title-offset);
  --sticker-title-left: var(--sticker-desktop-title-left);
  --sticker-title-right: var(--sticker-desktop-title-right);
  position: absolute;
  top: var(--sticker-desktop-y);
  left: var(--sticker-desktop-x);
  z-index: var(--sticker-order);
  width: var(--sticker-desktop-width);
  transform: translate(-50%, -50%) rotate(var(--sticker-desktop-angle));
  transition: z-index 180ms ease;
}

.sticker-button {
  position: relative;
  display: block;
  width: 100%;
  min-width: 44px;
  min-height: 44px;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--home-ink, #111111);
  cursor: pointer;
  font: inherit;
  text-align: left;
  touch-action: pan-y;
}

.sticker-button:focus-visible {
  outline: 2px solid var(--home-blue, #78a2ed);
  outline-offset: 5px;
}

.sticker-image {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
  -webkit-user-drag: none;
  filter: drop-shadow(2px 4px 3px rgba(17, 17, 17, 0.13));
  transform: translateY(0) scale(var(--sticker-image-scale));
  transform-origin: center;
  transition: transform 180ms ease-out;
}

.sticker-title {
  position: absolute;
  top: var(--sticker-title-top);
  right: var(--sticker-title-right);
  left: var(--sticker-title-left);
  max-width: min(18rem, 42vw);
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--home-ink, #111111);
  background: var(--home-paper, #ffffff);
  color: var(--home-ink, #111111);
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1.35;
  opacity: 0;
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
  transform: translateY(var(--sticker-title-offset));
  translate: 0 4px;
  transition: opacity 180ms ease-out, translate 180ms ease-out;
}

.sticker-button:hover .sticker-image,
.sticker-button:focus-visible .sticker-image {
  transform: translateY(-3px) scale(var(--sticker-image-hover-scale));
}

.sticker-button:active .sticker-image {
  transform: translateY(1px) scale(var(--sticker-image-press-scale));
}

.sticker-button:hover .sticker-title,
.sticker-button:focus-visible .sticker-title,
.is-dragging .sticker-title {
  opacity: 1;
  translate: 0 0;
}

.sticker-entry:has(.sticker-button:hover),
.sticker-entry:has(.sticker-button:focus-visible) {
  z-index: 100;
}

.sticker-entry.is-dragging {
  z-index: 110;
}

.is-dragging .sticker-image {
  transform: translateY(-4px) scale(var(--sticker-image-hover-scale));
}

@media (hover: hover) and (pointer: fine) {
  .sticker-button {
    cursor: grab;
  }

  .is-dragging .sticker-button {
    cursor: grabbing;
  }
}

@media (max-width: 1023px) and (min-width: 768px) {
  .sticker-showcase {
    aspect-ratio: 4 / 3;
  }

  .sticker-entry {
    --sticker-title-top: var(--sticker-tablet-title-top);
    --sticker-title-offset: var(--sticker-tablet-title-offset);
    --sticker-title-left: var(--sticker-tablet-title-left);
    --sticker-title-right: var(--sticker-tablet-title-right);
    top: var(--sticker-tablet-y);
    left: var(--sticker-tablet-x);
    width: var(--sticker-tablet-width);
    transform: translate(-50%, -50%) rotate(var(--sticker-tablet-angle));
  }
}

@media (max-width: 767px) {
  .sticker-showcase {
    aspect-ratio: 3 / 5;
  }

  .sticker-entry {
    --sticker-title-top: var(--sticker-mobile-title-top);
    --sticker-title-offset: var(--sticker-mobile-title-offset);
    --sticker-title-left: var(--sticker-mobile-title-left);
    --sticker-title-right: var(--sticker-mobile-title-right);
    top: var(--sticker-mobile-y);
    left: var(--sticker-mobile-x);
    width: var(--sticker-mobile-width);
    transform: translate(-50%, -50%) rotate(var(--sticker-mobile-angle));
  }

  .sticker-title {
    max-width: min(13rem, 55vw);
    font-size: 0.68rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sticker-entry,
  .sticker-image,
  .sticker-title {
    transition-duration: 0.01ms;
  }

  .sticker-button:hover .sticker-image,
  .sticker-button:focus-visible .sticker-image,
  .sticker-button:active .sticker-image,
  .is-dragging .sticker-image {
    transform: scale(var(--sticker-image-scale));
  }

  .sticker-title {
    translate: 0 0;
  }
}
</style>
