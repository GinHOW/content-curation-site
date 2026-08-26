<template>
  <div
    v-if="open && image"
    class="image-lightbox"
    role="dialog"
    aria-modal="true"
    :aria-label="`${image.title} 大图预览`"
    @click.self="$emit('close')"
  >
    <div class="image-lightbox-panel">
      <button ref="closeButton" class="image-lightbox-close" type="button" @click="$emit('close')">
        关闭 <span aria-hidden="true">×</span>
      </button>
      <img :src="image.fullImage || image.image" :alt="image.alt" width="1600" height="1200" />
      <div class="image-lightbox-caption">
        <strong>{{ image.title }}</strong>
        <span>{{ image.source }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  image: {
    type: Object,
    default: null,
  },
  open: {
    type: Boolean,
    default: false,
  },
})

const closeButton = ref(null)
const previousFocus = ref(null)

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    // 组件只在打开时监听，因此不会影响页面的其他键盘交互。
    const close = document.querySelector('.image-lightbox-close')
    if (close) close.click()
  }
}

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    previousFocus.value = document.activeElement
    document.documentElement.classList.add('preview-is-open')
    window.addEventListener('keydown', handleKeydown)
    await nextTick()
    closeButton.value?.focus()
  } else {
    document.documentElement.classList.remove('preview-is-open')
    window.removeEventListener('keydown', handleKeydown)
    previousFocus.value?.focus?.()
    previousFocus.value = null
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.documentElement.classList.remove('preview-is-open')
})
</script>

<style scoped>
.image-lightbox {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: clamp(1rem, 4vw, 4rem);
  background: rgba(17, 17, 17, 0.86);
}

.image-lightbox-panel {
  position: relative;
  display: grid;
  gap: 0.75rem;
  width: min(100%, 72rem);
  max-height: 100%;
}

.image-lightbox-panel img {
  width: 100%;
  max-height: calc(100vh - 8rem);
  object-fit: contain;
}

.image-lightbox-close {
  justify-self: end;
  min-height: 44px;
  padding: 0.45rem 0;
  color: var(--home-paper, #fff);
  background: transparent;
  border: 0;
  font: inherit;
  font-size: 0.78rem;
  cursor: pointer;
}

.image-lightbox-caption {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--home-paper, #fff);
  font-size: 0.78rem;
}

.image-lightbox-caption span {
  color: #cfcfc8;
}

@media (max-width: 767px) {
  .image-lightbox {
    padding: 1rem;
  }

  .image-lightbox-panel img {
    max-height: calc(100vh - 10rem);
  }

  .image-lightbox-caption {
    align-items: start;
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
