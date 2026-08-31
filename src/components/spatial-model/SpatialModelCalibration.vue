<template>
  <aside
    class="spatial-model-calibration-overlay"
    aria-label="镜头标定面板"
    aria-keyshortcuts="C"
  >
    <header class="calibration-overlay-header">
      <div>
        <p class="calibration-overlay-tag">CAMERA CALIBRATION</p>
        <h4 class="calibration-overlay-title">{{ selectedRoom?.number || '当前空间' }} / 镜头标定</h4>
      </div>
      <button
        type="button"
        class="calibration-overlay-close"
        aria-label="关闭标定面板"
        @click="$emit('close')"
      >
        ✕
      </button>
    </header>

    <div class="calibration-overlay-body">
      <p class="calibration-instruction">调到满意画面后，复制数据并连同截图保存。</p>

      <div class="calibration-fov-group">
        <label for="spatial-camera-fov">
          <span>镜头焦段 / FOV</span>
          <output for="spatial-camera-fov">{{ calibrationFov }}°</output>
        </label>
        <input
          id="spatial-camera-fov"
          type="range"
          min="35"
          max="85"
          step="1"
          :value="calibrationFov"
          @input="$emit('update:fov', Number($event.target.value))"
        >
        <div class="calibration-fov-scale" aria-hidden="true">
          <span>窄角 35°</span>
          <span>自然 50°</span>
          <span>广角 85°</span>
        </div>
      </div>

      <dl class="calibration-values-list">
        <div>
          <dt>POS</dt>
          <dd>{{ formatVector(calibrationSnapshot?.position) }}</dd>
        </div>
        <div>
          <dt>LOOK</dt>
          <dd>{{ formatVector(calibrationSnapshot?.target) }}</dd>
        </div>
      </dl>

      <div class="calibration-actions">
        <button type="button" class="btn-copy" @click="$emit('copy')">
          复制镜头数据
        </button>
        <button type="button" class="btn-resume" @click="$emit('close')">
          继续漫游 (C)
        </button>
      </div>

      <textarea
        v-if="copyFallbackVisible"
        class="calibration-output-text"
        :value="calibrationDataText"
        aria-label="镜头标定数据，请手动复制"
        readonly
        rows="5"
      />
      <p v-if="calibrationNotice" class="calibration-notice-text" role="status" aria-live="polite">
        {{ calibrationNotice }}
      </p>
    </div>
  </aside>
</template>

<script setup>
import { formatVector } from '../../data/spatial/modelConfig.js'

defineProps({
  selectedRoom: {
    type: Object,
    default: null,
  },
  calibrationFov: {
    type: Number,
    default: 50,
  },
  calibrationSnapshot: {
    type: Object,
    default: null,
  },
  calibrationDataText: {
    type: String,
    default: '',
  },
  calibrationNotice: {
    type: String,
    default: '',
  },
  copyFallbackVisible: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:fov', 'copy', 'close'])
</script>

<style scoped>
.spatial-model-calibration-overlay {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 20;
  display: flex;
  flex-direction: column;
  width: min(22rem, calc(100% - 1.5rem));
  max-height: calc(100% - 1.5rem);
  border: 1px solid var(--home-rule);
  background: rgba(249, 248, 244, 0.96);
  backdrop-filter: blur(8px);
  color: var(--home-ink);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.calibration-overlay-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--home-rule);
  background: rgba(243, 241, 235, 0.95);
}

.calibration-overlay-tag {
  margin: 0;
  color: var(--home-muted);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.calibration-overlay-title {
  margin: 0.2rem 0 0;
  font-size: 0.88rem;
  font-weight: 500;
}

.calibration-overlay-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--home-rule);
  border-radius: 0;
  background: transparent;
  color: var(--home-ink);
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
}

.calibration-overlay-close:hover,
.calibration-overlay-close:focus-visible {
  border-color: var(--home-ink);
  background: var(--home-ink);
  color: var(--home-paper);
}

.calibration-overlay-body {
  padding: 0.9rem 1rem;
  overflow-y: auto;
}

.calibration-instruction {
  margin: 0 0 0.8rem;
  color: var(--home-muted);
  font-size: 0.72rem;
  line-height: 1.45;
}

.calibration-fov-group label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  color: var(--home-muted);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.calibration-fov-group output {
  color: var(--home-ink);
  font-size: 1rem;
  font-weight: 500;
}

.calibration-fov-group input {
  display: block;
  width: 100%;
  min-height: 36px;
  margin: 0.2rem 0 0;
  accent-color: var(--home-ink);
  cursor: pointer;
}

.calibration-fov-scale {
  display: flex;
  justify-content: space-between;
  margin-top: 0.1rem;
  color: var(--home-muted);
  font-size: 0.65rem;
}

.calibration-values-list {
  display: grid;
  gap: 0.4rem;
  margin: 0.8rem 0;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--home-rule);
  background: #f7f5ef;
}

.calibration-values-list div {
  display: grid;
  grid-template-columns: 3.2rem minmax(0, 1fr);
  gap: 0.4rem;
  align-items: baseline;
}

.calibration-values-list dt {
  color: var(--home-muted);
  font-size: 0.64rem;
  letter-spacing: 0.06em;
}

.calibration-values-list dd {
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--home-ink);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.68rem;
}

.calibration-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.calibration-actions button {
  min-height: 38px;
  padding: 0.4rem 0.5rem;
  border: 1px solid var(--home-ink);
  border-radius: 0;
  background: transparent;
  color: var(--home-ink);
  font: inherit;
  font-size: 0.72rem;
  cursor: pointer;
  text-align: center;
}

.calibration-actions button.btn-copy {
  background: var(--home-ink);
  color: var(--home-paper);
}

.calibration-actions button:hover,
.calibration-actions button:focus-visible {
  border-color: var(--home-ink);
  opacity: 0.88;
}

.calibration-output-text {
  width: 100%;
  margin-top: 0.6rem;
  resize: vertical;
  border: 1px solid var(--home-rule);
  background: #f7f5ef;
  color: var(--home-ink);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.65rem;
  line-height: 1.4;
  padding: 0.4rem;
}

.calibration-notice-text {
  margin: 0.5rem 0 0;
  color: var(--home-orange);
  font-size: 0.7rem;
  line-height: 1.4;
}

.calibration-overlay-close:focus-visible,
.calibration-fov-group input:focus-visible,
.calibration-actions button:focus-visible {
  outline: 2px solid var(--home-ink);
  outline-offset: -2px;
}
</style>
