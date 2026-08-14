<template>
  <div class="shelf-showcase" :class="{ 'shelf-showcase--active': active !== null }">
    <div class="shelf-inner">
      <!-- Shelf background -->
      <img src="/img/货架图.jpeg" alt="货架" class="shelf-bg" />

      <!-- Individual item images -->
      <div class="items-layer">
        <button
          v-for="(item, i) in items"
          :key="item.name"
          class="item"
          :class="{ 'item--active': active === i, 'item--dimmed': active !== null && active !== i }"
          :style="item.style"
          type="button"
          :aria-label="`查看${item.label}策展项目`"
          @mouseenter="active = i"
          @mouseleave="active = null"
          @focus="active = i"
          @blur="active = null"
          @click="handleClick(item)"
        >
          <img
            :src="`/img/货架透明图/objects/${item.name}.png`"
            alt=""
            aria-hidden="true"
            class="item-img"
            loading="lazy"
          />
          <span class="item-index" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['open-exhibition'])

const active = ref(null)

const handleClick = (item) => {
  if (item.exhibitionId) {
    emit('open-exhibition', item.exhibitionId)
  }
}

const items = [
  { name: '尺子', label: '直尺', exhibitionId: 'northward-river', style: { top: '23%',  left: '12%',  width: '29%', height: '5.5%' } },
  { name: '帽子', label: '礼帽', exhibitionId: 'four-hat-act', style: { top: '17.5%',  left: '50.5%', width: '12%', height: '12%' } },
  { name: '假发', label: '假发', exhibitionId: 'headline', style: { top: '29.4%', left: '20.6%',  width: '16%', height: '20%' } },
  { name: '眼睛', label: '眼睛', exhibitionId: 'why-we-look', style: { top: '30%', left: '65%', width: '13%', height: '13%' } },
  { name: '钥匙', label: '钥匙', exhibitionId: 'threshold', style: { top: '64%', left: '26%',  width: '9%',  height: '8%' } },
  { name: '棋子', label: '棋子', exhibitionId: 'chess-box', style: { top: '58.5%', left: '53.5%', width: '30%', height: '14%' } },
  { name: '手套', label: '手套', exhibitionId: 'hand-held-drama', style: { top: '76%', left: '19.8%',  width: '20%', height: '10%' } },
  { name: '绳结', label: '绳结', exhibitionId: 'jiejie', style: { top: '75.5%', left: '51.3%', width: '20%', height: '14%' } },
  { name: '信封', label: '信封', exhibitionId: 'black-chamber', style: { top: '77.5%', left: '72.5%', width: '13%', height: '8%' } },
]
</script>

<style scoped>
.shelf-showcase {
  position: relative;
  width: 100%;
  overflow: hidden;
  cursor: default;
  border-bottom: 0;
  background: #ffffff;
}

.shelf-inner {
  position: relative;
  width: 100%;
  aspect-ratio: 2752 / 1536;
  overflow: hidden;
}

.shelf-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 200ms ease;
}

.shelf-showcase--active .shelf-bg {
  filter: brightness(0.88);
}

.items-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.item {
  position: absolute;
  display: block;
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  border: 1px solid transparent;
  background: transparent;
  color: var(--home-ink, #111);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: opacity 180ms ease, filter 180ms ease, border-color 180ms ease;
  opacity: 0.26;
  filter: grayscale(0.7);
}

.item:hover,
.item--active {
  opacity: 1;
  filter: none;
  border-color: transparent;
  outline: none;
  z-index: 10;
}

.item:focus-visible {
  opacity: 1;
  filter: none;
  border-color: transparent;
  outline: 2px solid var(--home-blue, #5d8ee8);
  outline-offset: 3px;
  z-index: 10;
}

.item-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 0;
}

/* Dimmed: other items when hovering */
.item--dimmed {
  opacity: 0.1;
  filter: grayscale(1);
}

.item-index {
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.8rem;
  min-height: 1.35rem;
  padding: 0.12rem 0.25rem;
  border: 1px solid var(--home-ink, #111);
  background: #ffffff;
  color: var(--home-ink, #111);
  font-family: var(--font-heavy);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1;
  pointer-events: none;
  z-index: 11;
}

@media (max-width: 767px) {
  /* 手机端：将横版货架旋转 90° 以竖版形式占据更大画面 */
  .shelf-showcase {
    aspect-ratio: 1536 / 2752;
  }

  .shelf-inner {
    position: absolute;
    width: 179.16%; /* 2752 / 1536 * 100 */
    aspect-ratio: 2752 / 1536;
    top: 0;
    left: 100%;
    transform-origin: top left;
    transform: rotate(90deg);
  }

  .item-index {
    top: 0.15rem;
    left: 0.15rem;
    min-width: 1.55rem;
    min-height: 1.1rem;
    font-size: 0.52rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shelf-bg,
  .item {
    transition-duration: 0.01ms;
  }
}

/* Pure white image field; the only visible boundary is the focused hotspot. */
.shelf-showcase {
  border-bottom: 0;
  background: #ffffff;
}

.item {
  background: transparent;
}

.item-index {
  background: #ffffff;
}
</style>
