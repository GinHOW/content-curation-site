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

    <div ref="stageElement" class="controller-stage">
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
        <div
          class="controller-topic-screen-content"
          :class="{ 'has-image': slot.type === 'image' }"
          :style="screenContentStyle(screenIndex)"
        >
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import SpatialMap from './SpatialMap.vue'
import { spatialKeywordColors } from '../../data/home.js'
import { livingRoomArchive } from '../../data/demoArchive.js'
import {
  controllerScreenBleed,
  controllerScreenZones,
} from '../../data/controllerScreenZones.js'

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

// The generated zones are calibrated from public/Curator2026/screen/*.svg.
// The polygon remains the visual aperture; its normalized four corners also
// drive the content homography so images, text, and static all share it.
function polygonToQuad(clip) {
  const values = [...clip.matchAll(/(-?\d*\.?\d+)%\s+(-?\d*\.?\d+)%/g)]
    .map((match) => ({ x: Number(match[1]), y: Number(match[2]) }))
  if (values.length !== 4) return null

  const byY = [...values].sort((a, b) => a.y - b.y)
  const top = byY.slice(0, 2).sort((a, b) => a.x - b.x)
  const bottom = byY.slice(2).sort((a, b) => a.x - b.x)
  return [top[0], top[1], bottom[1], bottom[0]]
}

const screenZones = controllerScreenZones.map((zone) => ({
  ...zone,
  quad: zone.quad || polygonToQuad(zone.clip),
}))

const stageElement = ref(null)
const stageSize = ref({ width: 0, height: 0 })
let stageResizeObserver
let stageResizeHandler

function updateStageSize() {
  if (!stageElement.value) return
  const rect = stageElement.value.getBoundingClientRect()
  stageSize.value = { width: rect.width, height: rect.height }
}

function homographyMatrix(sourceWidth, sourceHeight, targetPoints) {
  const [topLeft, topRight, bottomRight, bottomLeft] = targetPoints
  const x1 = topRight.x - bottomRight.x
  const x2 = bottomLeft.x - bottomRight.x
  const x3 = topLeft.x - topRight.x + bottomRight.x - bottomLeft.x
  const y1 = topRight.y - bottomRight.y
  const y2 = bottomLeft.y - bottomRight.y
  const y3 = topLeft.y - topRight.y + bottomRight.y - bottomLeft.y
  const denominator = x1 * y2 - x2 * y1

  if (Math.abs(denominator) < 0.0001) return 'none'

  let g = 0
  let h = 0
  if (Math.abs(x3) > 0.0001 || Math.abs(y3) > 0.0001) {
    g = (x3 * y2 - x2 * y3) / denominator
    h = (x1 * y3 - x3 * y1) / denominator
  }

  const a = topRight.x - topLeft.x + g * topRight.x
  const b = bottomLeft.x - topLeft.x + h * bottomLeft.x
  const c = topLeft.x
  const d = topRight.y - topLeft.y + g * topRight.y
  const e = bottomLeft.y - topLeft.y + h * bottomLeft.y
  const f = topLeft.y

  // The source coordinates are the content box's real pixel dimensions,
  // while the homography above uses a normalized 0..1 square.
  const values = [
    a / sourceWidth, d / sourceWidth, 0, g / sourceWidth,
    b / sourceHeight, e / sourceHeight, 0, h / sourceHeight,
    0, 0, 1, 0,
    c, f, 0, 1,
  ]
  return `matrix3d(${values.map((value) => Number(value.toFixed(6))).join(',')})`
}

function perspectiveForZone(zone) {
  const { width, height } = stageSize.value
  if (!width || !height || !zone.quad || !zone.content) return 'none'

  const left = Number.parseFloat(zone.content.left)
  const top = Number.parseFloat(zone.content.top)
  const contentWidth = Number.parseFloat(zone.content.width)
  const contentHeight = Number.parseFloat(zone.content.height)
  const sourceWidth = (width * contentWidth) / 100
  const sourceHeight = (height * contentHeight) / 100
  const targetPoints = zone.quad.map((point) => ({
    x: ((point.x - left) * width) / 100,
    y: ((point.y - top) * height) / 100,
  }))
  const center = targetPoints.reduce(
    (result, point) => ({ x: result.x + point.x / targetPoints.length, y: result.y + point.y / targetPoints.length }),
    { x: 0, y: 0 },
  )
  const bleedX = (width * controllerScreenBleed) / 100
  const bleedY = (height * controllerScreenBleed) / 100
  const expandedTargetPoints = targetPoints.map((point) => ({
    x: point.x + (point.x >= center.x ? bleedX : -bleedX),
    y: point.y + (point.y >= center.y ? bleedY : -bleedY),
  }))

  return homographyMatrix(sourceWidth, sourceHeight, expandedTargetPoints)
}

onMounted(() => {
  updateStageSize()
  if (typeof ResizeObserver !== 'undefined' && stageElement.value) {
    stageResizeObserver = new ResizeObserver(updateStageSize)
    stageResizeObserver.observe(stageElement.value)
  } else {
    stageResizeHandler = updateStageSize
    window.addEventListener('resize', stageResizeHandler, { passive: true })
  }
})

onBeforeUnmount(() => {
  stageResizeObserver?.disconnect()
  if (stageResizeHandler) window.removeEventListener('resize', stageResizeHandler)
})

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
  const zone = screenZones[screenIndex]
  return {
    ...zone.content,
    transformOrigin: '0 0',
    transform: perspectiveForZone(zone),
  }
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
  width: 36.37%;
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

.controller-topic-screen-content.has-image {
  background: #101413;
}

.controller-topic-screen-content.has-image img {
  filter: saturate(0.86) contrast(1.08) brightness(0.98);
}

.controller-topic-screen-content.has-image::before {
  position: absolute;
  inset: -28%;
  z-index: 2;
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Cfilter id='image-noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23image-noise)'/%3E%3C/svg%3E"),
    linear-gradient(90deg, rgba(255, 255, 255, 0.08), transparent 42%, rgba(0, 0, 0, 0.12));
  background-size: 72px 72px, 100% 100%;
  content: '';
  filter: contrast(2.1) grayscale(1);
  opacity: 0.16;
  mix-blend-mode: screen;
  pointer-events: none;
  animation: controller-image-noise 180ms steps(2, end) infinite;
}

.controller-topic-screen-content.has-image::after {
  position: absolute;
  inset: 0;
  z-index: 3;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.11) 0,
    rgba(255, 255, 255, 0.11) 1px,
    transparent 1px,
    transparent 4px
  );
  content: '';
  opacity: 0.34;
  mix-blend-mode: screen;
  pointer-events: none;
  animation: controller-image-scan 1.8s linear infinite;
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

@keyframes controller-image-noise {
  0% { transform: translate3d(-4%, -3%, 0); }
  33% { transform: translate3d(3%, 4%, 0); }
  66% { transform: translate3d(-2%, 2%, 0); }
  100% { transform: translate3d(4%, -4%, 0); }
}

@keyframes controller-image-scan {
  0% { background-position: 0 0; }
  100% { background-position: 0 12px; }
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
  .controller-topic-screen-content.has-image::before,
  .controller-topic-screen-content.has-image::after,
  .controller-center-screen::before {
    animation: none;
  }

  .controller-topic-grid button {
    transition: none;
  }
}
</style>
