<template>
  <figure class="controller-spatial-map" aria-label="空间控制台" @click="resetFromController">
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
          @click.stop="selectTopic(keyword)"
        >
          <span>{{ keyword }}</span>
        </button>
      </div>
    </section>

    <div class="controller-stage">
      <picture>
        <source srcset="/Curator2026/controller2.0.webp" type="image/webp" />
        <img
          class="controller-base"
          src="/Curator2026/controller2.0.png"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          draggable="false"
        />
      </picture>

      <div class="controller-center-screen" @click.stop>
        <SpatialMap
          :rooms="rooms"
          :selected-keyword="activeTopic"
          embedded
          @select-keyword="selectTopicFromMap"
        />
      </div>

      <article
        v-for="(slot, screenIndex) in screenSlots"
        :key="`${screenIndex}-${slot.key}`"
        class="controller-topic-screen"
        :class="{
          'is-fallback-mask': !screenZones[screenIndex].clip,
          'is-topic-shortcut': isTopicShortcut(slot),
        }"
        :style="screenFrameStyle(screenIndex)"
        :aria-label="screenLabel(slot, screenIndex)"
        :aria-pressed="isTopicShortcut(slot) ? false : undefined"
        :role="isTopicShortcut(slot) ? 'button' : undefined"
        :tabindex="isTopicShortcut(slot) ? 0 : undefined"
        @click.stop="selectTopicFromScreen(slot)"
        @keydown.enter.prevent="selectTopicFromScreen(slot)"
        @keydown.space.prevent="selectTopicFromScreen(slot)"
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
          >
            <span v-if="slot.label" class="controller-static-word">{{ slot.label }}</span>
          </div>
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
import { livingRoomArchive } from '../../data/demoArchive.js'

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

// The polygons below are the four-corner screen contours from public/Curator2026/screen/.
// Keeping the geometry inline avoids loading the Illustrator SVGs' embedded preview image
// 18 times, while retaining the slight perspective on every physical monitor.
const screenZones = [
  {
    id: 'screen1',
    clip: 'polygon(87.49% 31.65%, 87.49% 44.88%, 99.41% 45.18%, 99.41% 31.45%)',
    content: { top: '31.35%', left: '87.32%', width: '12.18%', height: '14.05%' },
  },
  {
    id: 'screen2',
    clip: 'polygon(86.06% 46.41%, 86.06% 57.64%, 97.20% 58.64%, 97.20% 46.74%)',
    content: { top: '46.1%', left: '85.88%', width: '11.5%', height: '12.85%' },
  },
  {
    id: 'screen3',
    clip: 'polygon(71.28% 48.60%, 71.28% 58.05%, 82.00% 58.45%, 82.00% 48.80%)',
    content: { top: '48.3%', left: '71.1%', width: '11.05%', height: '10.35%' },
  },
  {
    id: 'screen4',
    clip: 'polygon(69.74% 33.71%, 69.74% 46.01%, 84.25% 46.28%, 84.25% 33.52%)',
    content: { top: '33.4%', left: '69.56%', width: '14.86%', height: '13.15%' },
  },
  {
    id: 'screen5',
    clip: 'polygon(69.47% 18.76%, 69.47% 30.59%, 84.41% 30.29%, 84.41% 18.09%)',
    content: { top: '17.8%', left: '69.28%', width: '15.3%', height: '13.05%' },
  },
  {
    id: 'screen6',
    clip: 'polygon(86.47% 28.66%, 99.35% 28.22%, 99.35% 15.95%, 86.43% 16.70%)',
    content: { top: '15.65%', left: '86.25%', width: '13.3%', height: '13.35%' },
  },
  {
    id: 'screen7',
    clip: 'polygon(86.43% 1.85%, 86.43% 13.79%, 99.16% 12.90%, 99.16% 0.57%)',
    content: { top: '0.3%', left: '86.22%', width: '13.15%', height: '13.9%' },
  },
  {
    id: 'screen8',
    clip: 'polygon(69.04% 2.43%, 69.04% 14.83%, 83.96% 14.22%, 83.96% 1.45%)',
    content: { top: '1.2%', left: '68.85%', width: '15.3%', height: '14.05%' },
  },
  {
    id: 'screen9',
    clip: 'polygon(58.17% 4.01%, 58.17% 14.45%, 67.27% 14.14%, 67.27% 3.67%)',
    content: { top: '3.4%', left: '57.98%', width: '9.5%', height: '11.45%' },
  },
  {
    id: 'screen10',
    clip: 'polygon(43.68% 3.50%, 56.15% 3.50%, 56.15% 14.45%, 43.68% 14.45%)',
    content: { top: '3.25%', left: '43.5%', width: '12.85%', height: '11.45%' },
  },
  {
    id: 'screen11',
    clip: 'polygon(30.47% 3.69%, 30.47% 14.25%, 41.78% 14.45%, 41.78% 4.00%)',
    content: { top: '3.4%', left: '30.28%', width: '11.7%', height: '11.45%' },
  },
  {
    id: 'screen12',
    clip: 'polygon(19.77% 2.50%, 19.77% 17.53%, 28.99% 17.81%, 28.99% 2.93%)',
    content: { top: '2.2%', left: '19.58%', width: '9.6%', height: '16.05%' },
  },
  {
    id: 'screen13',
    clip: 'polygon(18.03% 20.84%, 18.03% 44.05%, 29.49% 43.94%, 29.49% 21.12%)',
    content: { top: '20.55%', left: '17.82%', width: '11.85%', height: '23.8%' },
  },
  {
    id: 'screen14',
    clip: 'polygon(18.33% 47.22%, 18.33% 58.15%, 29.31% 57.88%, 29.31% 47.12%)',
    content: { top: '46.85%', left: '18.12%', width: '11.35%', height: '11.65%' },
  },
  {
    id: 'screen15',
    clip: 'polygon(5.12% 46.07%, 5.12% 58.43%, 15.75% 57.47%, 15.75% 45.62%)',
    content: { top: '45.35%', left: '4.92%', width: '11.05%', height: '13.05%' },
  },
  {
    id: 'screen16',
    clip: 'polygon(0.58% 31.35%, 0.58% 43.42%, 14.38% 43.09%, 14.38% 31.48%)',
    content: { top: '31.05%', left: '0.38%', width: '14.2%', height: '12.7%' },
  },
  {
    id: 'screen17',
    clip: 'polygon(0.81% 16.14%, 0.81% 28.42%, 16.87% 28.67%, 16.87% 16.80%)',
    content: { top: '15.85%', left: '0.61%', width: '16.45%', height: '13.1%' },
  },
  {
    id: 'screen18',
    clip: 'polygon(0.96% 0.84%, 0.96% 13.15%, 16.77% 13.92%, 16.77% 2.12%)',
    content: { top: '0.55%', left: '0.76%', width: '16.2%', height: '13.75%' },
  },
]

const keywords = computed(() => props.rooms.flatMap((room) => room.keywords))
const activeTopic = ref('')
const liveStatus = ref(`请选择上方选题标签；静默屏幕正在随机显示 ${keywords.value.length} 个空间标签。`)
const archiveTitlesByKeyword = {
  客厅: livingRoomArchive.categories.flatMap((category) =>
    category.items.map(([title]) => title),
  ),
}

function shuffle(items) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[randomIndex]] = [result[randomIndex], result[index]]
  }
  return result
}

function makePlaceholders(count = screenZones.length, labels = '…') {
  return Array.from({ length: count }, (_, index) => ({
    label: Array.isArray(labels) ? labels[index] || '' : labels,
    type: 'placeholder',
    style: {
      '--static-duration': `${90 + Math.floor(Math.random() * 110)}ms`,
      '--static-delay': `${-Math.floor(Math.random() * 240)}ms`,
      '--static-opacity': (0.72 + Math.random() * 0.22).toFixed(2),
      '--static-font-size': placeholderFontSize(Array.isArray(labels) ? labels[index] || '' : labels),
    },
    key: `placeholder-${Date.now()}-${index}-${Math.random()}`,
  }))
}

function makeIdleLabels(count = screenZones.length) {
  const topics = shuffle([...new Set(keywords.value)])
  const fillers = Array.from({ length: Math.max(0, count - topics.length) }, () => '…')
  return [...topics, ...fillers].slice(0, count)
}

function placeholderFontSize(label) {
  if (label.length > 18) return 'clamp(0.24rem, 0.66vw, 0.52rem)'
  if (label.length > 11) return 'clamp(0.27rem, 0.82vw, 0.68rem)'
  if (label.length > 6) return 'clamp(0.3rem, 1vw, 0.9rem)'
  return 'clamp(0.34rem, 1.85vw, 1.45rem)'
}

function makeTopicPlaceholderLabels(keyword, count) {
  const titles = archiveTitlesByKeyword[keyword]
  if (titles?.length) {
    return [...shuffle(titles).slice(0, count), ...Array(Math.max(0, count - titles.length)).fill('')]
  }
  return Array(count).fill('')
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
  const placeholderCount = screenZones.length - images.length
  const placeholderLabels = keyword
    ? makeTopicPlaceholderLabels(keyword, placeholderCount)
    : makeIdleLabels(placeholderCount)
  const placeholders = makePlaceholders(placeholderCount, placeholderLabels)
  return shuffle([...images, ...placeholders])
}

const screenSlots = ref(buildScreenSlots())

const colorFor = (keyword) => spatialKeywordColors[keyword] || 'var(--home-ink)'

function selectTopic(keyword) {
  if (activeTopic.value === keyword) {
    activeTopic.value = ''
    screenSlots.value = buildScreenSlots()
    liveStatus.value = `已取消“${keyword}”的选择，静默屏幕已随机恢复空间标签。`
    return
  }

  activeTopic.value = keyword
  screenSlots.value = buildScreenSlots(keyword)

  const imageCount = Math.min(props.imageLibrary[keyword]?.length || 0, screenZones.length)
  if (imageCount) {
    liveStatus.value = `“${keyword}”已随机显示 ${imageCount} 张图片，其余 ${screenZones.length - imageCount} 块屏幕以雪花屏补位。`
  } else {
    liveStatus.value = `“${keyword}”暂未配置图片，${screenZones.length} 块屏幕已用电视雪花屏占位。`
  }
}

function isTopicShortcut(slot) {
  return slot.type === 'placeholder' && keywords.value.includes(slot.label)
}

function selectTopicFromScreen(slot) {
  if (isTopicShortcut(slot)) selectTopic(slot.label)
}

function selectTopicFromMap(keyword) {
  if (!keyword) {
    resetFromController()
    return
  }
  if (keyword !== activeTopic.value) selectTopic(keyword)
}

function resetFromController() {
  if (!activeTopic.value) return
  const previousTopic = activeTopic.value
  activeTopic.value = ''
  screenSlots.value = buildScreenSlots()
  liveStatus.value = `已退出“${previousTopic}”，静默屏幕已随机恢复空间标签。`
}

function handleImageError(screenIndex) {
  const labels = activeTopic.value
    ? makeTopicPlaceholderLabels(activeTopic.value, 1)
    : makeIdleLabels(1)
  screenSlots.value.splice(screenIndex, 1, makePlaceholders(1, labels)[0])
  liveStatus.value = `“${activeTopic.value}”有一张图片载入失败，已自动替换为雪花屏。`
}

function screenLabel(slot, screenIndex) {
  if (slot.type === 'image') return `屏幕 ${screenIndex + 1}：${slot.alt}`
  if (isTopicShortcut(slot)) return `屏幕 ${screenIndex + 1}：${slot.label}，点击选择该选题`
  return slot.label
    ? `屏幕 ${screenIndex + 1}：电视雪花屏占位，显示${slot.label}`
    : `屏幕 ${screenIndex + 1}：电视雪花屏占位`
}

function screenFrameStyle(screenIndex) {
  const zone = screenZones[screenIndex]
  return zone.clip ? { '--screen-clip': zone.clip } : zone.frame
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
  aspect-ratio: 1446 / 999;
  isolation: isolate;
  overflow: hidden;
  background: #fff;
}

.controller-base {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.controller-center-screen,
.controller-topic-screen {
  position: absolute;
  z-index: 1;
}

.controller-topic-screen {
  inset: 0;
  overflow: hidden;
  -webkit-clip-path: var(--screen-clip, none);
  clip-path: var(--screen-clip, none);
}

.controller-topic-screen.is-fallback-mask {
  clip-path: polygon(3% 0, 97% 0, 100% 100%, 0 100%);
}

.controller-topic-screen.is-topic-shortcut {
  cursor: pointer;
}

.controller-topic-screen.is-topic-shortcut .controller-topic-screen-content {
  transition: filter 180ms ease, box-shadow 180ms ease;
}

.controller-topic-screen.is-topic-shortcut:hover .controller-topic-screen-content,
.controller-topic-screen.is-topic-shortcut:focus-visible .controller-topic-screen-content {
  box-shadow: inset 0 0 0 2px rgba(224, 247, 255, 0.78);
  filter: brightness(1.15);
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
  top: 19.5%;
  left: 31.68%;
  width: 36.22%;
  height: 29.95%;
  overflow: hidden;
  background: #f8f8f4;
}

.controller-center-screen::before {
  position: absolute;
  inset: -28%;
  z-index: 2;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='112' height='112' viewBox='0 0 112 112'%3E%3Cfilter id='map-noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23map-noise)'/%3E%3C/svg%3E");
  background-size: 64px 64px;
  content: '';
  pointer-events: none;
  mix-blend-mode: multiply;
  opacity: 0.22;
  filter: contrast(3.2) grayscale(1);
  animation: controller-center-noise 150ms steps(2, end) infinite;
}

.controller-center-screen::after {
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.09) 0,
    rgba(255, 255, 255, 0.09) 1px,
    rgba(0, 0, 0, 0.075) 1px,
    rgba(0, 0, 0, 0.075) 3px,
    transparent 3px,
    transparent 5px
  );
  mix-blend-mode: multiply;
  opacity: 0.68;
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
  z-index: 1;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.08), transparent 35%, rgba(0, 0, 0, 0.18));
  content: '';
  animation: controller-static-flicker 850ms steps(2, end) infinite;
}

.controller-static-word {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 0.1em 0.18em;
  color: transparent;
  background-color: #d7d7d7;
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='84' height='84' viewBox='0 0 84 84'%3E%3Cfilter id='word-noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.15' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23word-noise)'/%3E%3C/svg%3E"),
    repeating-linear-gradient(to bottom, transparent 0 2px, rgba(0, 0, 0, 0.58) 2px 3px);
  background-size: 56px 56px, 100% 3px;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: var(--static-font-size, clamp(0.34rem, 1.85vw, 1.45rem));
  font-weight: 800;
  line-height: 1;
  text-align: center;
  overflow-wrap: anywhere;
  text-wrap: balance;
  letter-spacing: 0;
  text-indent: 0;
  opacity: 0.78;
  mix-blend-mode: screen;
  animation: controller-static-word-noise 130ms steps(2, end) infinite,
    controller-static-word-flicker 1.1s steps(2, end) infinite;
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

@keyframes controller-static-word-noise {
  0% { background-position: 0 0, 0 0; }
  33% { background-position: 13px -9px, 0 1px; }
  66% { background-position: -8px 11px, 0 -1px; }
  100% { background-position: 6px -4px, 0 0; }
}

@keyframes controller-static-word-flicker {
  0%, 100% { opacity: 0.78; }
  45% { opacity: 0.56; }
  70% { opacity: 0.9; }
}

@keyframes controller-center-noise {
  0% { transform: translate3d(-3%, -4%, 0); }
  33% { transform: translate3d(4%, 2%, 0); }
  66% { transform: translate3d(-2%, 5%, 0); }
  100% { transform: translate3d(3%, -2%, 0); }
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
  .controller-static-placeholder::after,
  .controller-static-word,
  .controller-center-screen::before {
    animation: none;
  }

  .controller-topic-grid button {
    transition: none;
  }
}
</style>
