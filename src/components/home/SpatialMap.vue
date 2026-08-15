<template>
  <div
    class="spatial-map-section"
    :class="{
      'is-embedded': embedded,
      'has-embedded-focus': embedded && selectedRoom,
    }"
    aria-label="空间原型图"
  >
    <div
      class="spatial-map-scroll"
      role="region"
      aria-label="空间原型图"
      @click="handleMapClick"
    >
      <svg
        class="spatial-map-canvas"
        :viewBox="mapViewBox"
        role="img"
        aria-labelledby="spatial-map-title spatial-map-description"
      >
        <title id="spatial-map-title">空间原型图</title>
        <desc id="spatial-map-description">
          一张横向空间平面图，包含十二个可选择的空间热区。
        </desc>
        <g class="spatial-map-world">
          <image
            class="spatial-map-image"
            :href="mapUrl"
            x="0"
            y="0"
            width="2900"
            height="480"
            preserveAspectRatio="none"
            aria-hidden="true"
          />

          <g
            v-for="room in rooms"
            :key="room.id"
            class="spatial-room"
            :class="{
              'is-active': activeRoomId === room.id,
              'is-selected': selectedRoomId === room.id,
              'is-dimmed': Boolean(activeRoomId && activeRoomId !== room.id),
            }"
            :data-room-id="room.id"
            :style="{ '--spatial-room-color': roomColor(room) }"
            role="button"
            tabindex="0"
            :aria-label="roomLabel(room)"
            :aria-pressed="selectedRoomId === room.id"
            @mouseenter="hoveredRoomId = room.id"
            @mouseleave="hoveredRoomId = null"
            @focus="focusedRoomId = room.id"
            @blur="focusedRoomId = null"
            @click.stop="selectRoom(room.id)"
            @keydown.enter.prevent="selectRoom(room.id)"
            @keydown.space.prevent="selectRoom(room.id)"
          >
            <title>{{ roomLabel(room) }}</title>

          <template v-if="room.id === 'room1'">
            <path class="spatial-room-hit" d="M145.78,439.66h433.35v-94.33h302.64v-90.91c99.29-1.29,206.58,1.29,305.87,0,.12-26.62.24-56.23.36-82.85-33.29-4.13-72.57-8.02-114.24-19.5-42.24-11.65-79.09-27.57-110.09-41.29-38.11,17.78-90.03,40.62-152.86,64.17-74.59,27.96-135.66,50.7-215.87,67.49-148.86,31.14-274.89,22.92-365.89,16.98-34.6-2.26-63.3-5.18-83.26-7.46v187.71Z" />
            <path class="spatial-room-shape" d="M145.78,439.66h433.35v-94.33h302.64v-90.91c99.29-1.29,206.58,1.29,305.87,0,.12-26.62.24-56.23.36-82.85-33.29-4.13-72.57-8.02-114.24-19.5-42.24-11.65-79.09-27.57-110.09-41.29-38.11,17.78-90.03,40.62-152.86,64.17-74.59,27.96-135.66,50.7-215.87,67.49-148.86,31.14-274.89,22.92-365.89,16.98-34.6-2.26-63.3-5.18-83.26-7.46v187.71Z" />
          </template>

          <template v-else-if="room.id === 'room2'">
            <polygon class="spatial-room-hit" points="743.93 351.75 743.93 439.66 2075.45 439.66 2075.45 351.75 1482.03 351.75 1482.03 260.46 1335.01 260.46 1335.01 350.75 1036.15 350.75 1036.15 262.13 889.78 262.13 889.78 351.75" />
            <polygon class="spatial-room-shape" points="743.93 351.75 743.93 439.66 2075.45 439.66 2075.45 351.75 1482.03 351.75 1482.03 260.46 1335.01 260.46 1335.01 350.75 1036.15 350.75 1036.15 262.13 889.78 262.13 889.78 351.75" />
          </template>

          <template v-else-if="room.id === 'room3'">
            <rect class="spatial-room-hit" x="2242.48" y="351.75" width="138.09" height="86.91" />
            <rect class="spatial-room-shape" x="2242.48" y="351.75" width="138.09" height="86.91" />
          </template>

          <template v-else-if="room.id === 'room4'">
            <g transform="translate(56.15 32.27)">
              <rect class="spatial-room-hit" x="2330.49" y="319.48" width="300.38" height="86.91" />
              <rect class="spatial-room-shape" x="2330.49" y="319.48" width="300.38" height="86.91" />
            </g>
          </template>

          <template v-else-if="room.id === 'room5'">
            <g transform="translate(56.15 32.27)">
              <path class="spatial-room-hit" d="M1138.28,140.78c.02,29.69-.02,58.39,0,88.08h-150.1c-.04,27.46-.08,57.92-.12,85.38,94.31-.42,190.72-.84,285.03-1.25.7-55.87-.7-113.74,0-169.61-21.15,1.55-44.34,2.32-69.28,1.78-23.56-.51-45.45-2.13-65.53-4.38Z" />
              <path class="spatial-room-shape" d="M1138.28,140.78c.02,29.69-.02,58.39,0,88.08h-150.1c-.04,27.46-.08,57.92-.12,85.38,94.31-.42,190.72-.84,285.03-1.25.7-55.87-.7-113.74,0-169.61-21.15,1.55-44.34,2.32-69.28,1.78-23.56-.51-45.45-2.13-65.53-4.38Z" />
            </g>
          </template>

          <template v-else-if="room.id === 'room6'">
            <g transform="translate(56.15 32.27)">
              <rect class="spatial-room-hit" x="1432.29" y="228.2" width="299.47" height="84.04" />
              <rect class="spatial-room-shape" x="1432.29" y="228.2" width="299.47" height="84.04" />
            </g>
          </template>

          <template v-else-if="room.id === 'room7'">
            <path class="spatial-room-hit" d="M1939.92,138.31v121.82h-145.8v84.38h282.87v-193.31c-21.63-.64-44.73-1.04-69.12-3.52-24.14-2.45-46.83-5.69-67.96-9.37Z" />
            <path class="spatial-room-shape" d="M1939.92,138.31v121.82h-145.8v84.38h282.87v-193.31c-21.63-.64-44.73-1.04-69.12-3.52-24.14-2.45-46.83-5.69-67.96-9.37Z" />
          </template>

          <template v-else-if="room.id === 'room8'">
            <rect class="spatial-room-hit" x="2242.09" y="260.43" width="291.32" height="84.49" />
            <rect class="spatial-room-shape" x="2242.09" y="260.43" width="291.32" height="84.49" />
          </template>

          <template v-else-if="room.id === 'room9'">
            <path class="spatial-room-hit" d="M2539.51,176.09v168.69h87.42v-91.03h60.09v-50.48c-23.33-1.71-49.21-4.8-77.07-10.04-25.84-4.86-49.39-10.82-70.43-17.13Z" />
            <path class="spatial-room-shape" d="M2539.51,176.09v168.69h87.42v-91.03h60.09v-50.48c-23.33-1.71-49.21-4.8-77.07-10.04-25.84-4.86-49.39-10.82-70.43-17.13Z" />
          </template>

          <template v-else-if="room.id === 'room10'">
            <path class="spatial-room-hit" d="M1335.01,175.27v78.37c149.89.32,302.99.64,452.88.96.07-27.36-.07-57.72,0-85.09h-156.69v-78.68c-19.63,9.45-44.75,20.73-74.5,32.1-18.68,7.14-51.12,19.44-93.8,30.46-32.69,8.45-75.95,17.33-127.89,21.87Z" />
            <path class="spatial-room-shape" d="M1335.01,175.27v78.37c149.89.32,302.99.64,452.88.96.07-27.36-.07-57.72,0-85.09h-156.69v-78.68c-19.63,9.45-44.75,20.73-74.5,32.1-18.68,7.14-51.12,19.44-93.8,30.46-32.69,8.45-75.95,17.33-127.89,21.87Z" />
          </template>

          <template v-else-if="room.id === 'room11'">
            <path class="spatial-room-hit" d="M1636.83,88.35c.1,25.2-.1,50.4,0,75.59h156.45v89.65h140.05v-117.41c-7.64-1.59-17.47-3.81-28.84-6.85-6.63-1.77-17.88-4.93-34.33-10.47-5.93-2-32.76-11.03-56.57-21.51-40.49-17.82-75.48-41.24-96.93-56.81-13.98,10.01-29.62,20.25-46.94,30.24-11.31,6.52-22.31,12.35-32.9,17.56Z" />
            <path class="spatial-room-shape" d="M1636.83,88.35c.1,25.2-.1,50.4,0,75.59h156.45v89.65h140.05v-117.41c-7.64-1.59-17.47-3.81-28.84-6.85-6.63-1.77-17.88-4.93-34.33-10.47-5.93-2-32.76-11.03-56.57-21.51-40.49-17.82-75.48-41.24-96.93-56.81-13.98,10.01-29.62,20.25-46.94,30.24-11.31,6.52-22.31,12.35-32.9,17.56Z" />
          </template>

          <template v-else-if="room.id === 'room12'">
            <path class="spatial-room-hit" d="M2083.58,254.9v-103.55c34.18-.35,80.65-4.35,133.39-19.7,48.44-14.1,87.05-33.37,114.99-50,28.39,19.5,64,40.7,106.82,59.63,34.49,15.24,66.72,25.94,95.03,33.57v80.05h-450.22Z" />
            <path class="spatial-room-shape" d="M2083.58,254.9v-103.55c34.18-.35,80.65-4.35,133.39-19.7,48.44-14.1,87.05-33.37,114.99-50,28.39,19.5,64,40.7,106.82,59.63,34.49,15.24,66.72,25.94,95.03,33.57v80.05h-450.22Z" />
          </template>
          </g>
        </g>
      </svg>
    </div>

    <div
      v-if="!embedded"
      class="spatial-map-status"
      :style="{ '--spatial-status-color': activeRoom ? roomColor(activeRoom) : 'var(--home-muted)' }"
      aria-live="polite"
    >
      <span v-if="activeRoom">ROOM {{ activeRoom.number }} / {{ activeRoom.keywords.join(' · ') }}</span>
      <span v-else>选择空间查看关键词</span>
    </div>

    <div v-if="!embedded" class="spatial-word-pool" aria-labelledby="spatial-word-pool-title">
      <p id="spatial-word-pool-title" class="spatial-pool-label">选题库 / WORD POOL</p>
      <div class="spatial-keywords">
        <button
          v-for="keyword in keywordList"
          :key="keyword"
          class="spatial-keyword"
          :class="{ 'is-active': activeRoom?.keywords.includes(keyword) }"
          :style="{ '--spatial-keyword-color': keywordColor(keyword) }"
          type="button"
          :aria-pressed="selectedRoom?.keywords.includes(keyword) ?? false"
          @click.stop="selectKeyword(keyword)"
        >
          {{ keyword }}
        </button>
      </div>
      <p class="spatial-pool-note">
        每个词兼具哲学内涵与观念的包容度，同时指向一种空间类型。
      </p>
    </div>

    <DemoArchive
      v-if="!embedded && selectedRoom?.keywords.includes('客厅')"
      :archive="livingRoomArchive"
    />

  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import mapUrl from '../../assets/spatial-map/map.svg'
import DemoArchive from './DemoArchive.vue'
import { livingRoomArchive } from '../../data/demoArchive.js'
import { spatialKeywordColors } from '../../data/home.js'

const props = defineProps({
  rooms: {
    type: Array,
    required: true,
  },
  selectedKeyword: {
    type: String,
    default: '',
  },
  embedded: {
    type: Boolean,
    default: false,
  },
})

const hoveredRoomId = ref(null)
const focusedRoomId = ref(null)
const selectedRoomId = ref(null)
const selectedKeywordValue = ref('')

const MAP_WIDTH = 2900
const MAP_HEIGHT = 480
// The central monitor is about 2.24:1. Keeping the focus window at the same
// ratio lets the selected space fill the display without distorting the map.
const EMBEDDED_MAP_ASPECT = 2.24
const WIDE_FOCUS_ROOM_IDS = new Set(['room1', 'room2'])
const roomFocusBounds = {
  room1: { x: 145, y: 105, width: 1130, height: 335 },
  room2: { x: 744, y: 260, width: 1332, height: 180 },
  room3: { x: 2242, y: 351, width: 139, height: 88 },
  room4: { x: 2386, y: 351, width: 301, height: 88 },
  room5: { x: 1044, y: 172, width: 285, height: 173 },
  room6: { x: 1488, y: 260, width: 300, height: 85 },
  room7: { x: 1794, y: 138, width: 283, height: 207 },
  room8: { x: 2242, y: 260, width: 292, height: 85 },
  room9: { x: 2539, y: 176, width: 148, height: 169 },
  room10: { x: 1335, y: 90, width: 453, height: 165 },
  room11: { x: 1637, y: 40, width: 297, height: 214 },
  room12: { x: 2084, y: 81, width: 450, height: 174 },
}

const keywordList = computed(() => [
  ...new Set(props.rooms.flatMap((room) => room.keywords)),
])

const activeRoomId = computed(
  () => focusedRoomId.value || hoveredRoomId.value || selectedRoomId.value,
)

const activeRoom = computed(() =>
  props.rooms.find((room) => room.id === activeRoomId.value),
)

const selectedRoom = computed(() =>
  props.rooms.find((room) => room.id === selectedRoomId.value),
)

const mapViewBox = computed(() => {
  const bounds = props.embedded && selectedRoom.value
    ? roomFocusBounds[selectedRoom.value.id]
    : null

  if (!bounds) return `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`

  const isWideFocus = WIDE_FOCUS_ROOM_IDS.has(selectedRoom.value.id)
  const targetWidth = bounds.width * (isWideFocus ? 1.45 : 1.55)
  const targetHeight = bounds.height * 1.9
  // The two long spaces need contextual breathing room. Their focus window
  // intentionally remains wider than the monitor, so SVG's default `meet`
  // alignment leaves a calm frame rather than cropping their two ends.
  const viewHeight = isWideFocus
    ? MAP_HEIGHT
    : Math.min(
      MAP_HEIGHT,
      Math.max(targetHeight, targetWidth / EMBEDDED_MAP_ASPECT),
    )
  const viewWidth = isWideFocus
    ? Math.min(MAP_WIDTH, targetWidth)
    : viewHeight * EMBEDDED_MAP_ASPECT
  const centerX = bounds.x + bounds.width / 2
  const centerY = bounds.y + bounds.height / 2
  const x = Math.max(0, Math.min(MAP_WIDTH - viewWidth, centerX - viewWidth / 2))
  const y = Math.max(0, Math.min(MAP_HEIGHT - viewHeight, centerY - viewHeight / 2))

  return `${x} ${y} ${viewWidth} ${viewHeight}`
})

watch(
  () => props.selectedKeyword,
  (keyword) => {
    selectedKeywordValue.value = keyword
    if (!keyword) {
      selectedRoomId.value = null
      return
    }
    const room = props.rooms.find((item) => item.keywords.includes(keyword))
    if (room) selectedRoomId.value = room.id
  },
)

const keywordColor = (keyword) =>
  spatialKeywordColors[keyword] || 'var(--home-orange)'

const roomColor = (room) => {
  const matchingKeyword = room.keywords.includes(selectedKeywordValue.value)
    ? selectedKeywordValue.value
    : room.keywords[0]
  return keywordColor(matchingKeyword)
}

const roomLabel = (room) =>
  `空间 ${room.number}：${room.keywords.join('、')}`

const clearSelection = () => {
  selectedRoomId.value = null
}

const handleMapClick = (event) => {
  if (event.target?.closest?.('.spatial-room')) return
  clearSelection()
}

const selectRoom = (id) => {
  const room = props.rooms.find((item) => item.id === id)
  if (!room) return

  if (selectedRoomId.value === id) {
    selectedRoomId.value = null
    selectedKeywordValue.value = ''
    return
  }

  selectedRoomId.value = id
  if (!room.keywords.includes(selectedKeywordValue.value)) {
    selectedKeywordValue.value = room.keywords[0]
  }
}

const selectKeyword = (keyword) => {
  const room = props.rooms.find((item) => item.keywords.includes(keyword))
  if (!room) return
  const isSameRoom = selectedRoomId.value === room.id
  const isSameKeyword = selectedKeywordValue.value === keyword
  selectedKeywordValue.value = keyword
  if (isSameRoom && !isSameKeyword) return
  selectRoom(room.id)
}
</script>

<style scoped>
.spatial-map-section {
  margin-top: clamp(4rem, 8vw, 8rem);
}

.spatial-map-section.is-embedded {
  height: 100%;
  margin-top: 0;
}

.spatial-map-section.is-embedded .spatial-map-scroll,
.spatial-map-section.is-embedded .spatial-map-canvas {
  width: 100%;
  height: 100%;
}

.spatial-map-section.is-embedded .spatial-map-canvas {
  aspect-ratio: auto;
}

/* In the controller, the selected room is the only colour signal. The map
   remains untouched in its original full-page presentation. */
.spatial-map-section.is-embedded.has-embedded-focus .spatial-map-image {
  filter: grayscale(1) contrast(1.1) brightness(0.94);
}

.spatial-map-section.is-embedded.has-embedded-focus .spatial-room.is-dimmed .spatial-room-shape,
.spatial-map-section.is-embedded.has-embedded-focus .spatial-room.is-active:not(.is-selected) .spatial-room-shape {
  opacity: 0;
  fill-opacity: 0;
}

.spatial-map-section.is-embedded.has-embedded-focus .spatial-room.is-selected .spatial-room-shape {
  opacity: 1;
  fill-opacity: 0.38;
  stroke-width: 2.5;
}

.spatial-word-pool {
  margin-top: clamp(2rem, 4vw, 3.5rem);
}

.spatial-pool-label {
  color: var(--home-muted);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.spatial-keywords {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.35rem;
  margin-top: 1rem;
}

.spatial-keyword {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: clamp(2.75rem, 4vw, 3.5rem);
  min-height: clamp(6rem, 10vw, 8rem);
  padding: 0.65rem 0.25rem;
  border: 2px solid color-mix(in srgb, var(--spatial-keyword-color) 64%, var(--home-rule));
  border-radius: 999px;
  color: color-mix(in srgb, var(--spatial-keyword-color) 72%, var(--home-ink));
  background: var(--home-paper);
  font: inherit;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  writing-mode: vertical-rl;
  text-orientation: upright;
  cursor: pointer;
  transition: border-color 180ms ease, color 180ms ease, background-color 180ms ease;
}

.spatial-keyword:hover,
.spatial-keyword:focus-visible,
.spatial-keyword.is-active {
  border-color: var(--spatial-keyword-color);
  border-width: 2px;
  color: color-mix(in srgb, var(--spatial-keyword-color) 82%, var(--home-ink));
  background: color-mix(in srgb, var(--spatial-keyword-color) 10%, var(--home-paper));
}

.spatial-pool-note {
  color: var(--home-muted);
  font-size: 0.82rem;
  line-height: 1.55;
  margin-top: 0.85rem;
}

.spatial-map-status {
  min-height: 1.5rem;
  margin-top: 0.9rem;
  color: var(--spatial-status-color, var(--home-orange));
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.spatial-map-scroll {
  margin-top: 0;
  overflow: hidden;
}

.spatial-map-canvas {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 2900 / 480;
}

.spatial-room {
  outline: none;
}

.spatial-room-hit {
  fill: #000;
  fill-opacity: 0;
  stroke: #000;
  stroke-opacity: 0;
  stroke-width: 28;
  vector-effect: non-scaling-stroke;
  pointer-events: all;
}

.spatial-room-shape {
  fill: var(--spatial-room-color, var(--home-orange));
  fill-opacity: 0;
  stroke: var(--spatial-room-color, var(--home-orange));
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
  opacity: 0;
  pointer-events: none;
  transition: opacity 180ms ease, fill-opacity 180ms ease, stroke-width 180ms ease;
}

.spatial-room.is-dimmed .spatial-room-shape {
  opacity: 0.08;
  fill-opacity: 0.08;
}

.spatial-room.is-active .spatial-room-shape {
  opacity: 1;
  fill-opacity: 0.2;
  stroke-width: 2;
}

.spatial-room:focus-visible .spatial-room-shape {
  opacity: 1;
  fill-opacity: 0.14;
  stroke: var(--home-ink);
  stroke-width: 3;
}

@media (max-width: 1023px) {
  .spatial-map-canvas {
    width: 100%;
  }
}

@media (max-width: 767px) {
  .spatial-map-section {
    margin-top: 4rem;
  }

  .spatial-map-canvas {
    width: 100%;
  }

  .spatial-keywords {
    gap: 0.4rem;
  }

  .spatial-keyword {
    width: 2.6rem;
    min-height: 5.35rem;
    padding-inline: 0.2rem;
    font-size: 0.85rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spatial-keyword,
  .spatial-room-shape {
    transition: none;
  }
}
</style>
