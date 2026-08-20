<template>
  <div
    class="shelf-showcase"
    :class="{ 'shelf-showcase--active': active !== null }"
    @pointerenter="handlePointerEnter"
    @pointermove="handlePointerMove"
    @pointerleave="handlePointerLeave"
  >
    <div class="shelf-inner">
      <img src="/assets/shelf/货架图.webp" alt="陈列九件物体的货架" class="shelf-bg" />

      <!--
        热区 SVG 和新版底图共用 2450 × 1536 坐标系。这样替换底图时不再需要
        以百分比手动校准物体的位置；底图中的物体保持原始比例，SVG 只负责交互。
      -->
      <svg
        class="items-layer"
        viewBox="0 0 2450 1536"
        preserveAspectRatio="none"
        aria-label="选择货架中的物件，进入对应的课程策展项目"
      >
        <g
          v-for="(item, i) in items"
          :key="item.name"
          class="item"
          :class="{ 'item--active': active === i }"
          role="button"
          tabindex="0"
          :aria-label="`查看${item.label}策展项目`"
          @mouseenter="active = i"
          @mouseleave="active = null"
          @focus="active = i"
          @blur="active = null"
          @click="handleClick(item)"
          @keydown.enter.prevent="handleClick(item)"
          @keydown.space.prevent="handleClick(item)"
        >
          <image
            :href="`/assets/shelf/objects/${item.name}.png`"
            :x="item.x"
            :y="item.y"
            :width="item.width"
            :height="item.height"
            preserveAspectRatio="none"
            class="item-image"
            pointer-events="none"
          />
            <use :href="`/assets/shelf/hotspots/${item.name}.svg#_${item.name}`" class="item-hotspot" />
          <g class="item-index" aria-hidden="true" :transform="`translate(${item.labelX} ${item.labelY})`">
            <rect width="58" height="35" />
            <text x="29" y="23">{{ String(i + 1).padStart(2, '0') }}</text>
          </g>
        </g>
      </svg>
    </div>

    <div
      v-show="cursorVisible"
      class="shelf-cursor"
      :style="{ left: `${cursorPosition.x}px`, top: `${cursorPosition.y}px` }"
      aria-hidden="true"
    >
      <span>进入物件</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['open-exhibition'])

const active = ref(null)
const cursorVisible = ref(false)
const cursorPosition = ref({ x: 0, y: 0 })

const handlePointerEnter = (event) => {
  if (event.pointerType === 'touch') return
  cursorVisible.value = true
  handlePointerMove(event)
}

const handlePointerMove = (event) => {
  const bounds = event.currentTarget.getBoundingClientRect()
  cursorPosition.value = {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  }
}

const handlePointerLeave = () => {
  cursorVisible.value = false
}

const handleClick = (item) => {
  if (item.exhibitionId) {
    emit('open-exhibition', item.exhibitionId)
  }
}

const items = [
  // 透明 PNG 的原始像素尺寸对应新版底图坐标；以热区中心对齐，避免被热区轮廓压缩。
  { name: '尺子', label: '直尺', exhibitionId: 'northward-river', x: 206, y: 360, width: 777, height: 63, labelX: 306, labelY: 357 },
  { name: '帽子', label: '礼帽', exhibitionId: 'four-hat-act', x: 1254, y: 279, width: 312, height: 153, labelX: 1262, labelY: 272 },
  { name: '假发', label: '假发', exhibitionId: 'headline', x: 402, y: 454, width: 489, height: 319, labelX: 426, labelY: 470 },
  { name: '眼睛', label: '眼睛', exhibitionId: 'why-we-look', x: 1665, y: 483, width: 318, height: 156, labelX: 1665, labelY: 485 },
  { name: '钥匙', label: '钥匙', exhibitionId: 'threshold', x: 577, y: 987, width: 229, height: 101, labelX: 580, labelY: 990 },
  { name: '棋子', label: '棋子', exhibitionId: 'chess-box', x: 1332, y: 912, width: 819, height: 196, labelX: 1346, labelY: 925 },
  { name: '手套', label: '手套', exhibitionId: 'hand-held-drama', x: 401, y: 1187, width: 543, height: 136, labelX: 403, labelY: 1190 },
  { name: '绳结', label: '绳结', exhibitionId: 'jiejie', x: 1297, y: 1149, width: 504, height: 224, labelX: 1311, labelY: 1163 },
  { name: '信封', label: '信封', exhibitionId: 'black-chamber', x: 1864, y: 1209, width: 321, height: 107, labelX: 1867, labelY: 1212 },
]
</script>

<style scoped>
.shelf-showcase {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-bottom: 0;
  background: #ffffff;
}

.shelf-inner {
  position: relative;
  width: 100%;
  aspect-ratio: 2450 / 1536;
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
  cursor: pointer;
  outline: none;
}

.item-hotspot {
  fill: #ffffff;
  opacity: 0;
  pointer-events: visiblePainted;
  transition: opacity 180ms ease;
}

.item-image {
  opacity: 0;
  transform: scale(1);
  transform-box: fill-box;
  transform-origin: center;
  transition: opacity 180ms ease, transform 180ms ease;
}

.item:hover .item-image,
.item--active .item-image {
  opacity: 1;
  transform: scale(1.02);
}

.item:focus-visible .item-hotspot {
  fill-opacity: 0;
  opacity: 1;
  stroke: var(--home-blue, #5d8ee8);
  stroke-width: 8;
  vector-effect: non-scaling-stroke;
}

.item-index {
  background: #ffffff;
  color: var(--home-ink, #111);
  font-family: var(--font-heavy);
  font-weight: 700;
  pointer-events: none;
}

.item-index rect {
  fill: #ffffff;
  stroke: var(--home-ink, #111);
  stroke-width: 2;
}

.item-index text {
  fill: var(--home-ink, #111);
  font-size: 18px;
  letter-spacing: 0.08em;
  text-anchor: middle;
}

.shelf-cursor {
  position: absolute;
  z-index: 3;
  display: grid;
  width: 72px;
  height: 72px;
  place-items: center;
  border: 1px solid var(--home-ink, #111);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.54);
  color: var(--home-ink, #111);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1.35;
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: opacity 160ms ease;
}

.shelf-cursor[style*='display: none'] {
  opacity: 0;
}

.shelf-showcase--active .shelf-cursor {
  opacity: 0;
  visibility: hidden;
}

@media (hover: hover) and (pointer: fine) {
  .shelf-showcase {
    cursor: none;
  }

  .shelf-showcase--active {
    cursor: pointer;
  }
}

@media (hover: none), (pointer: coarse) {
  .shelf-cursor {
    display: none !important;
  }
}

@media (max-width: 767px) {
  /* 手机端旋转货架，容器高度与旋转后的完整底图保持一致。 */
  .shelf-showcase {
    aspect-ratio: 1536 / 2450;
  }

  .shelf-inner {
    position: absolute;
    width: 159.51%; /* 2450 / 1536 * 100 */
    aspect-ratio: 2450 / 1536;
    top: 0;
    left: 100%;
    transform-origin: top left;
    transform: rotate(90deg);
  }

}

@media (prefers-reduced-motion: reduce) {
  .shelf-bg,
  .item-hotspot {
    transition-duration: 0.01ms;
  }

  .item-image {
    transition-duration: 0.01ms;
  }
}

/* Pure white image field; the only visible boundary is the focused hotspot. */
.shelf-showcase {
  border-bottom: 0;
  background: #ffffff;
}

</style>
