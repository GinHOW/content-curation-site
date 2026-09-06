<template>
  <article
    ref="root"
    class="screen-universe-central-screen"
    :class="{
      'is-3d-active': is3DActive,
      'is-screen-expanded': isExpanded,
      'is-idle': !activeKeyword,
    }"
    :style="centerScreenStyle"
    aria-label="中央主屏"
    @click.stop
    @pointerdown.stop
  >
    <SpatialModelExplorer
      v-show="is3DActive"
      :rooms="rooms"
      :view-mode="viewMode"
      :active-room-id="activeRoomId"
      :active-keyword="activeKeyword"
      :mode-notice="modeNotice"
      :is-expanded="isExpanded"
      :show-back-button="true"
      embedded
      @activate-space="$emit('activate-space', $event)"
      @request-overview="$emit('clear-space')"
      @exit-immersive="$emit('exit-immersive', $event)"
      @pointer-lock-change="$emit('pointer-lock-change', $event)"
      @toggle-expand="$emit('toggle-expand')"
    />
    <SpatialMap
      v-show="!is3DActive"
      :rooms="rooms"
      :view-mode="viewMode"
      :active-room-id="activeRoomId"
      :active-keyword="activeKeyword"
      :topic-colors="topicColors"
      embedded
      @activate-space="handleMapActivate"
      @clear-space="$emit('clear-space')"
    />
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'
import SpatialMap from './SpatialMap.vue'
import SpatialModelExplorer from '../spatial-model/SpatialModelExplorer.vue'
import { SCREEN_UNIVERSE_CENTER } from '../../utils/screenUniverseSphere.js'

const props = defineProps({
  rooms: {
    type: Array,
    required: true,
  },
  viewMode: {
    type: String,
    default: 'overview',
  },
  activeRoomId: {
    type: String,
    default: '',
  },
  activeKeyword: {
    type: String,
    default: '',
  },
  topicColors: {
    type: Object,
    default: () => ({}),
  },
  modeNotice: {
    type: String,
    default: '',
  },
  isExpanded: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'activate-space',
  'clear-space',
  'exit-immersive',
  'pointer-lock-change',
  'toggle-expand',
])

const root = ref(null)

const is3DActive = computed(() => props.viewMode === 'immersive' || props.viewMode === 'overview')

const centerScreenStyle = {
  '--center-screen-top': `${SCREEN_UNIVERSE_CENTER.top}%`,
  '--center-screen-left': `${SCREEN_UNIVERSE_CENTER.left}%`,
  '--center-screen-width': `${SCREEN_UNIVERSE_CENTER.width}%`,
  '--center-screen-height': `${SCREEN_UNIVERSE_CENTER.height}%`,
}

function handleMapActivate(payload) {
  if (!payload?.keyword) {
    emit('clear-space')
    return
  }
  emit('activate-space', {
    roomId: payload.roomId,
    keyword: payload.keyword,
    force3D: payload.force3D,
    source: payload.source || 'map',
  })
}

defineExpose({
  element: root,
})
</script>

<style scoped>
.screen-universe-central-screen {
  position: absolute;
  top: var(--center-screen-top);
  left: var(--center-screen-left);
  z-index: 100;
  width: var(--center-screen-width);
  height: var(--center-screen-height);
  padding: 0;
  overflow: hidden;
  isolation: isolate;
  border: 0;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.62);
  -webkit-backdrop-filter: blur(18px) saturate(1.2);
  backdrop-filter: blur(18px) saturate(1.2);
  cursor: default;
  box-shadow:
    inset 0 0 0 0.75px rgba(255, 255, 255, 0.96),
    inset -0.5px -0.5px 0 rgba(255, 255, 255, 0.6),
    0 18px 42px rgba(17, 17, 17, 0.1),
    0 3px 10px rgba(17, 17, 17, 0.05);
  transition:
    top 260ms ease,
    left 260ms ease,
    width 260ms ease,
    height 260ms ease,
    box-shadow 220ms ease;
}

.screen-universe-central-screen.is-idle {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.screen-universe-central-screen.is-screen-expanded {
  top: 0;
  left: 0;
  z-index: 300;
  width: 100%;
  height: 100%;
}

.screen-universe-central-screen :deep(.spatial-map-section),
.screen-universe-central-screen :deep(.spatial-model-explorer) {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  border-radius: inherit;
  background: transparent;
}

.screen-universe-central-screen :deep(.spatial-map-scroll),
.screen-universe-central-screen :deep(.spatial-map-canvas),
.screen-universe-central-screen :deep(.spatial-model-stage-container),
.screen-universe-central-screen :deep(.spatial-model-stage) {
  height: 100%;
  border: 0;
  border-radius: inherit;
}

.screen-universe-central-screen :deep(.spatial-map-scroll) {
  overflow: hidden;
  background: transparent;
}

.screen-universe-central-screen :deep(.spatial-model-header) {
  display: none;
}

@media (max-width: 767px) and (orientation: portrait) {
  .screen-universe-central-screen {
    top: 15%;
    left: 7%;
    width: 86%;
    height: 53%;
  }

  .screen-universe-central-screen.is-idle {
    top: 6%;
    left: 5%;
    width: 90%;
    height: 62%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .screen-universe-central-screen {
    transition: none;
  }
}
</style>
