<template>
  <section class="gallery-panel">
    <img
      v-if="work"
      :src="`${assetsBase}/course-gifs/${work.images[currentImage].filename}`"
      :alt="work.name"
      class="gallery-img"
      decoding="async"
    />

    <!-- 左右箭头 -->
    <button
      v-if="work && work.images.length > 1"
      class="nav-arrow nav-arrow--left"
      @click="$emit('prev')"
      aria-label="上一张"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
      </svg>
    </button>
    <button
      v-if="work && work.images.length > 1"
      class="nav-arrow nav-arrow--right"
      @click="$emit('next')"
      aria-label="下一张"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
      </svg>
    </button>

    <!-- 图片计数 -->
    <span
      v-if="work && work.images.length > 1"
      class="image-counter"
    >
      {{ currentImage + 1 }} / {{ work.images.length }}
    </span>
  </section>
</template>

<script setup>
defineProps({
  work: {
    type: Object,
    default: null,
  },
  currentImage: {
    type: Number,
    default: 0,
  },
  assetsBase: {
    type: String,
    default: '',
  },
})

defineEmits(['prev', 'next'])
</script>

<style scoped>
.gallery-panel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(2rem, 5vw, 5.5rem);
  background: #f4f5f6;
  overflow: hidden;
  border-right: 1px solid var(--ink, #111);
}

.gallery-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  box-shadow: 0 0 0 1px rgba(17, 17, 17, 0.04);
}

/* 导航箭头 */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: var(--paper-white, #fff);
  border: 1px solid var(--ink, #111);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 180ms ease, background-color 180ms ease, transform 180ms ease;
  color: var(--ink, #111);
  z-index: 10;
}

.nav-arrow:hover {
  background: var(--ink, #111);
  color: var(--paper-white, #fff);
}

.nav-arrow:focus-visible {
  outline: 2px solid var(--accent-blue, #78a2ed);
  outline-offset: 3px;
}

.nav-arrow--left {
  left: 1.25rem;
}

.nav-arrow--right {
  right: 1.25rem;
}

/* 图片计数 */
.image-counter {
  position: absolute;
  bottom: 1.35rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-heavy);
  padding: 0.35rem 0.5rem;
  background: rgba(255, 255, 255, 0.85);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: var(--muted, #747474);
}

@media (max-width: 900px) {
  .gallery-panel {
    border-right: none;
    border-bottom: 1px solid var(--ink, #111);
  }

  .nav-arrow {
    width: 44px;
    height: 44px;
  }

  .nav-arrow--left {
    left: 0.75rem;
  }

  .nav-arrow--right {
    right: 0.75rem;
  }
}

@media (max-width: 480px) {
  .nav-arrow {
    width: 44px;
    height: 44px;
  }

  .nav-arrow--left {
    left: 0.5rem;
  }

  .nav-arrow--right {
    right: 0.5rem;
  }
}
</style>
