<template>
  <figure class="controller-spatial-map" aria-label="空间控制台">
    <section class="controller-topic-library" aria-label="选题库">
      <div class="controller-topic-grid">
        <button
          v-for="keyword in keywords"
          :key="keyword"
          type="button"
          :style="{ '--topic-color': colorFor(keyword) }"
          :class="{ 'is-active': activeTopic === keyword }"
          :aria-pressed="activeTopic === keyword"
          :aria-label="`${activeTopic === keyword ? '取消显示' : '显示'}${keyword}的图片`"
          @click="selectTopic(keyword)"
        >
          <span>{{ keyword }}</span>
        </button>
      </div>
    </section>

    <div class="controller-stage">
      <img
        class="controller-base"
        src="/Curator2026/controller.png"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
      />

      <div class="controller-center-screen">
        <SpatialMap
          :rooms="rooms"
          :selected-keyword="activeTopic"
          embedded
        />
      </div>

      <article
        v-for="(slot, screenIndex) in screenSlots"
        :key="`${screenIndex}-${slot.key}`"
        class="controller-topic-screen"
        :class="{ 'is-fallback-mask': !screenZones[screenIndex].mask }"
        :style="screenFrameStyle(screenIndex)"
        :aria-label="screenLabel(slot, screenIndex)"
      >
        <div class="controller-topic-screen-content" :style="screenContentStyle(screenIndex)">
          <img
            v-if="slot.type === 'image'"
            :src="slot.src"
            :alt="slot.alt"
            loading="lazy"
            @error="handleImageError(screenIndex)"
          />
          <div
            v-else
            class="controller-static-placeholder"
            :style="slot.style"
            aria-hidden="true"
          ></div>
        </div>
      </article>
    </div>

    <p class="controller-status" aria-live="polite">{{ liveStatus }}</p>
  </figure>
</template>

<script setup>
import { computed, ref } from 'vue'
import SpatialMap from './SpatialMap.vue'
import { spatialKeywordColors } from '../../data/home.js'

const props = defineProps({
  rooms: {
    type: Array,
    required: true,
  },
  imageLibrary: {
    type: Object,
    default: () => ({}),
  },
})

const screenZones = [
  {
    mask: '/Curator2026/分区/screen2.svg',
    content: { top: '4.3%', left: '12.18%', width: '13.5%', height: '14.4%' },
  },
  {
    mask: '/Curator2026/分区/screen3.svg',
    content: { top: '21.8%', left: '12.35%', width: '13.35%', height: '14.15%' },
  },
  {
    mask: '/Curator2026/分区/screen4.svg',
    // Give the image/static layer a small bleed beyond the traced screen.
    // The outer article remains clipped by the SVG mask, so this only removes
    // hairline gaps caused by the perspective edge and responsive rounding.
    content: { top: '4.18%', left: '73.12%', width: '13.95%', height: '14.8%' },
  },
  {
    mask: '/Curator2026/分区/screen5.svg',
    content: { top: '21.9%', left: '73.3%', width: '13.45%', height: '14.15%' },
  },
  {
    mask: '/Curator2026/分区/screen6.svg',
    content: { top: '40.03%', left: '28.38%', width: '11.58%', height: '8.82%' },
  },
  {
    mask: '/Curator2026/分区/screen7.svg',
    content: { top: '39.72%', left: '43.62%', width: '11.85%', height: '9.35%' },
  },
  {
    mask: '/Curator2026/分区/screen8.svg',
    content: { top: '40.08%', left: '59.12%', width: '11.58%', height: '8.76%' },
  },
]

const keywords = computed(() => props.rooms.flatMap((room) => room.keywords))
const activeTopic = ref('')
const liveStatus = ref('请选择上方选题标签；目前以电视雪花屏模拟图片。')

function shuffle(items) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[randomIndex]] = [result[randomIndex], result[index]]
  }
  return result
}

function makePlaceholders(count = 7) {
  return Array.from({ length: count }, (_, index) => ({
    type: 'placeholder',
    style: {
      '--static-duration': `${90 + Math.floor(Math.random() * 110)}ms`,
      '--static-delay': `${-Math.floor(Math.random() * 240)}ms`,
      '--static-opacity': (0.72 + Math.random() * 0.22).toFixed(2),
    },
    key: `placeholder-${Date.now()}-${index}-${Math.random()}`,
  }))
}

function normalizeImage(item, keyword, index) {
  if (typeof item === 'string') {
    return {
      type: 'image',
      src: item,
      alt: `${keyword}选题图片 ${index + 1}`,
      key: `image-${item}-${Math.random()}`,
    }
  }

  return {
    type: 'image',
    src: item.src,
    alt: item.alt || `${keyword}选题图片 ${index + 1}`,
    key: `image-${item.src}-${Math.random()}`,
  }
}

function buildScreenSlots(keyword = '') {
  const candidates = keyword ? props.imageLibrary[keyword] || [] : []
  const images = shuffle(candidates)
    .slice(0, screenZones.length)
    .filter((item) => typeof item === 'string' || item?.src)
    .map((item, index) => normalizeImage(item, keyword, index))
  const placeholders = makePlaceholders(screenZones.length - images.length)
  return shuffle([...images, ...placeholders])
}

const screenSlots = ref(buildScreenSlots())

const colorFor = (keyword) => spatialKeywordColors[keyword] || 'var(--home-ink)'

function selectTopic(keyword) {
  if (activeTopic.value === keyword) {
    activeTopic.value = ''
    screenSlots.value = buildScreenSlots()
    liveStatus.value = `已取消“${keyword}”的选择，七块屏幕已恢复电视雪花屏。`
    return
  }

  activeTopic.value = keyword
  screenSlots.value = buildScreenSlots(keyword)

  const imageCount = Math.min(props.imageLibrary[keyword]?.length || 0, screenZones.length)
  if (imageCount) {
    liveStatus.value = `“${keyword}”已随机显示 ${imageCount} 张图片，其余屏幕以雪花屏补位。`
  } else {
    liveStatus.value = `“${keyword}”暂未配置图片，七块屏幕已用电视雪花屏占位。`
  }
}

function handleImageError(screenIndex) {
  screenSlots.value.splice(screenIndex, 1, makePlaceholders(1)[0])
  liveStatus.value = `“${activeTopic.value}”有一张图片载入失败，已自动替换为雪花屏。`
}

function screenLabel(slot, screenIndex) {
  if (slot.type === 'image') return `屏幕 ${screenIndex + 1}：${slot.alt}`
  return `屏幕 ${screenIndex + 1}：电视雪花屏占位`
}

function screenFrameStyle(screenIndex) {
  const zone = screenZones[screenIndex]
  return zone.mask ? { '--screen-mask': `url("${zone.mask}")` } : zone.frame
}

function screenContentStyle(screenIndex) {
  return screenZones[screenIndex].content
}
</script>

<style scoped>
.controller-spatial-map {
  width: 100%;
  margin: clamp(3.5rem, 7vw, 7rem) 0 0;
}

.controller-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 2301 / 1462;
  isolation: isolate;
  overflow: hidden;
  background: #fff;
}

.controller-base {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
}

.controller-center-screen,
.controller-topic-screen {
  position: absolute;
  z-index: 1;
}

.controller-topic-screen {
  inset: 0;
  overflow: hidden;
  -webkit-mask-image: var(--screen-mask, none);
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-image: var(--screen-mask, none);
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: 100% 100%;
}

.controller-topic-screen.is-fallback-mask {
  -webkit-mask-image: none;
  mask-image: none;
  clip-path: polygon(3% 0, 97% 0, 100% 100%, 0 100%);
}

.controller-center-screen::after,
.controller-topic-screen::after {
  position: absolute;
  inset: 0;
  z-index: 3;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.025) 0,
    rgba(255, 255, 255, 0.025) 1px,
    transparent 1px,
    transparent 4px
  );
  content: '';
  pointer-events: none;
  mix-blend-mode: screen;
}

.controller-center-screen {
  top: 6.05%;
  left: 31.02%;
  width: 36.73%;
  height: 25.87%;
  background: #f8f8f4;
}

.controller-center-screen img {
  display: block;
  width: 100%;
  height: 100%;
  padding: 4.5% 3.5% 7%;
  object-fit: contain;
  filter: saturate(0.96) contrast(1.03);
}

.controller-center-screen span {
  position: absolute;
  right: 2.5%;
  bottom: 2%;
  z-index: 2;
  color: rgba(17, 17, 17, 0.7);
  font-size: clamp(0.22rem, 0.58vw, 0.58rem);
  font-weight: 700;
  letter-spacing: 0.12em;
}

.controller-topic-screen-content {
  position: absolute;
  overflow: hidden;
  background: #102319;
  box-shadow: inset 0 0 0 1px rgba(190, 255, 214, 0.25);
}

.controller-topic-screen-content img,
.controller-static-placeholder {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.controller-static-placeholder {
  position: relative;
  overflow: hidden;
  background: #151515;
}

.controller-static-placeholder::before {
  position: absolute;
  inset: -35%;
  background-color: #797979;
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"),
    repeating-linear-gradient(to bottom, transparent 0 2px, rgba(0, 0, 0, 0.46) 2px 3px);
  background-size: 88px 88px, 100% 3px;
  content: '';
  opacity: var(--static-opacity);
  filter: contrast(2.8) grayscale(1);
  animation: controller-static-noise var(--static-duration) steps(2, end) var(--static-delay) infinite;
}

.controller-static-placeholder::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.08), transparent 35%, rgba(0, 0, 0, 0.18));
  content: '';
  animation: controller-static-flicker 850ms steps(2, end) infinite;
}

.controller-topic-library {
  margin-bottom: clamp(1.25rem, 2.5vw, 2.25rem);
}

.controller-topic-grid {
  display: grid;
  grid-template-columns: repeat(14, minmax(0, 1fr));
  border-top: 1px solid var(--home-rule);
  border-left: 1px solid var(--home-rule);
}

.controller-topic-grid button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: clamp(4.5rem, 8vw, 7rem);
  padding: 0.65rem 0.3rem;
  border: 0;
  border-right: 1px solid var(--home-rule);
  border-bottom: 1px solid var(--home-rule);
  color: var(--topic-color);
  background: var(--home-paper);
  font: inherit;
  font-size: clamp(0.72rem, 1.2vw, 0.95rem);
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: color 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
}

.controller-topic-grid button::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 4px;
  background: var(--topic-color);
  content: '';
}

.controller-topic-grid button span {
  writing-mode: vertical-rl;
}

.controller-topic-grid button:hover,
.controller-topic-grid button:focus-visible,
.controller-topic-grid button.is-active {
  color: #fff;
  background: var(--topic-color);
  box-shadow: inset 0 0 0 2px var(--topic-color);
}

.controller-status {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes controller-static-noise {
  0% { transform: translate3d(-7%, -9%, 0); }
  20% { transform: translate3d(8%, 5%, 0); }
  40% { transform: translate3d(-4%, 11%, 0); }
  60% { transform: translate3d(10%, -6%, 0); }
  80% { transform: translate3d(-9%, 3%, 0); }
  100% { transform: translate3d(5%, -11%, 0); }
}

@keyframes controller-static-flicker {
  0%, 100% { opacity: 0.45; }
  35% { opacity: 0.12; }
  70% { opacity: 0.66; }
}

@media (max-width: 767px) {
  .controller-spatial-map {
    margin-top: 3rem;
  }

  .controller-topic-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .controller-topic-grid button {
    justify-content: flex-start;
    min-height: 3.25rem;
    padding: 0.7rem 0.8rem;
    font-size: 0.9rem;
  }

  .controller-topic-grid button::before {
    top: 0;
    right: auto;
    bottom: 0;
    width: 4px;
    height: auto;
  }

  .controller-topic-grid button span {
    writing-mode: horizontal-tb;
  }

}

@media (prefers-reduced-motion: reduce) {
  .controller-static-placeholder::before,
  .controller-static-placeholder::after {
    animation: none;
  }

  .controller-topic-grid button {
    transition: none;
  }
}
</style>
