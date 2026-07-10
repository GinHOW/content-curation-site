<template>
  <div class="shelf-showcase">
    <!-- Shelf background -->
    <img src="/img/货架图.jpeg" alt="货架" class="shelf-bg" />

    <!-- Individual item images -->
    <div class="items-layer">
      <div
        v-for="(item, i) in items"
        :key="item.name"
        class="item"
        :class="{ 'item--active': active === i, 'item--dimmed': active !== null && active !== i }"
        :style="item.style"
        @mouseenter="active = i"
        @mouseleave="active = null"
        @click="handleClick(item)"
      >
        <img
          :src="`/img/货架透明图/images/${item.name}.png`"
          :alt="item.label"
          class="item-img"
          loading="lazy"
        />
        <span class="item-label">{{ item.label }}</span>
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
  { name: '假发', label: '假发', exhibitionId: 'headline', style: { top: '29.6%', left: '20.6%',  width: '16%', height: '20%' } },
  { name: '眼睛', label: '眼睛', exhibitionId: 'why-we-look', style: { top: '30%', left: '65%', width: '13%', height: '13%' } },
  { name: '钥匙', label: '钥匙', exhibitionId: 'threshold', style: { top: '63.5%', left: '26%',  width: '9%',  height: '8%' } },
  { name: '棋子', label: '棋子', exhibitionId: 'chess-box', style: { top: '59%', left: '53.5%', width: '30%', height: '14%' } },
  { name: '手套', label: '手套', exhibitionId: 'hand-held-drama', style: { top: '77%', left: '19.8%',  width: '20%', height: '10%' } },
  { name: '绳结', label: '绳结', exhibitionId: 'jiejie', style: { top: '75.5%', left: '51.3%', width: '20%', height: '14%' } },
  { name: '信封', label: '信封', exhibitionId: 'black-chamber', style: { top: '78%', left: '72.5%', width: '13%', height: '8%' } },
]
</script>

<style scoped>
.shelf-showcase {
  position: relative;
  width: 100%;
  aspect-ratio: 2752 / 1536;
  overflow: hidden;
  cursor: default;
  border-bottom: 2px solid #000;
}

.shelf-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s ease;
}

.shelf-showcase:hover .shelf-bg {
  filter: brightness(0.85);
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
  cursor: pointer;
  transition: opacity 0.3s ease, filter 0.3s ease;
  opacity: 0;
  filter: grayscale(0.7);
  text-decoration: none;
  display: block;
}

.item--no-link {
  cursor: default;
}

.item-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 0;
}

/* Active: full color, full opacity */
.item--active {
  opacity: 1;
  filter: none;
  z-index: 10;
}

/* Dimmed: other items when hovering */
.item--dimmed {
  opacity: 0;
  filter: grayscale(1) brightness(0.5);
}

.item-label {
  position: absolute;
  bottom: -1.8rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--blue-light);
  color: var(--white);
  padding: 0.2rem 0.6rem;
  font-size: 0.7rem;
  font-family: var(--font-heavy);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  z-index: 11;
}

.item--active .item-label {
  opacity: 1;
}

@media (max-width: 768px) {
  .item-label {
    font-size: 0.6rem;
    padding: 0.15rem 0.4rem;
  }
}
</style>
