<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="visible" class="exhibition-overlay" @click.self="close">
        <div class="exhibition-detail">
          <!-- 左侧：图片画廊 -->
          <ExhibitionGallery
            :exhibition="exhibition"
            :current-image="currentImage"
            :assets-base="assetsBase"
            @prev="prevImage"
            @next="nextImage"
          />

          <!-- 右侧：信息面板 -->
          <aside class="info-panel">
            <!-- 关闭按钮 -->
            <button class="close-btn" type="button" aria-label="关闭项目详情" @click="close">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>

            <!-- 固定头部：标题 + 标签 + 作者 -->
            <div class="panel-header" v-if="exhibition">
              <h1 class="info-title">{{ exhibition.name }}</h1>
              <p class="info-title-en">{{ exhibition.nameEn }}</p>
              <div class="info-tag">{{ exhibition.topic }}</div>
              <div class="info-divider"></div>
              <p class="authors-names">{{ exhibition.authors.students.join(' / ') }}</p>
              <div class="info-divider"></div>
            </div>

            <!-- 可滚动：仅简介 -->
            <div class="panel-scroll" v-if="exhibition">
              <div class="info-desc">
                <p v-for="(para, i) in currentDesc" :key="i">{{ para }}</p>
              </div>
            </div>

            <!-- 固定底部：语言切换 -->
            <div class="panel-footer">
              <div class="lang-toggle" aria-label="语言选择">
                <button type="button" :class="{ active: lang === 'zh' }" @click="lang = 'zh'">中</button>
                <button type="button" :class="{ active: lang === 'en' }" @click="lang = 'en'">EN</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { exhibitions } from '../data/exhibitions.js'
import ExhibitionGallery from '../components/exhibition/ExhibitionGallery.vue'

const props = defineProps({
  exhibitionId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close'])

// 资源基础路径：本地开发为空（从 public/ 加载），生产环境指向 R2 CDN
const assetsBase = import.meta.env.VITE_ASSETS_URL || ''

const currentImage = ref(0)
const lang = ref('zh')

const visible = computed(() => !!props.exhibitionId)

const exhibition = computed(() => {
  if (!props.exhibitionId) return null
  return exhibitions.find(e => e.id === props.exhibitionId)
})

const currentDesc = computed(() => {
  if (!exhibition.value) return []
  return lang.value === 'zh'
    ? exhibition.value.descriptionZh
    : exhibition.value.descriptionEn
})

const prevImage = () => {
  if (!exhibition.value) return
  const len = exhibition.value.images.length
  currentImage.value = (currentImage.value - 1 + len) % len
}

const nextImage = () => {
  if (!exhibition.value) return
  const len = exhibition.value.images.length
  currentImage.value = (currentImage.value + 1) % len
}

const close = () => {
  currentImage.value = 0
  lang.value = 'zh'
  emit('close')
}

// 打开时锁定背景滚动
watchEffect(() => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = visible.value ? 'hidden' : ''
})

// 切换展览时重置图片索引
watch(() => props.exhibitionId, () => {
  currentImage.value = 0
})

// ESC 键关闭
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && visible.value) close()
  })
}
</script>

<style scoped>
/* 遮罩层 */
.exhibition-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(17, 17, 17, 0.36);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1rem, 3vh, 2.5rem) clamp(1rem, 3vw, 3rem);
}

/* 过渡动画 */
.overlay-enter-active {
  transition: opacity 0.3s ease;
}
.overlay-enter-active .exhibition-detail {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.overlay-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-leave-active .exhibition-detail {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.overlay-enter-from {
  opacity: 0;
}
.overlay-enter-from .exhibition-detail {
  transform: translateY(20px);
  opacity: 0;
}
.overlay-leave-to {
  opacity: 0;
}
.overlay-leave-to .exhibition-detail {
  transform: translateY(10px);
  opacity: 0;
}

/* 主体布局 */
.exhibition-detail {
  width: min(88vw, 76rem);
  height: min(84dvh, 48rem);
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) clamp(24rem, 31vw, 30rem);
  color: var(--ink, #111);
  background: var(--paper-white, #fff);
  overflow: hidden;
  border: 1px solid var(--ink, #111);
  box-shadow: 0 1.25rem 3.5rem rgba(0, 0, 0, 0.18);
}

/* ===== 右侧：信息面板 ===== */
.info-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* 关闭按钮 - 右上角 */
.close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--ink, #111);
  width: 44px;
  height: 44px;
  cursor: pointer;
  transition: color 180ms ease, background-color 180ms ease;
  color: var(--ink, #111);
}

.close-btn:hover {
  background: var(--ink, #111);
  color: var(--paper-white, #fff);
}

.close-btn:focus-visible,
.lang-toggle button:focus-visible {
  outline: 2px solid var(--accent-blue, #78a2ed);
  outline-offset: 3px;
}

/* 固定头部 */
.panel-header {
  flex-shrink: 0;
  padding: clamp(1.5rem, 3vw, 2.5rem) clamp(1.5rem, 3vw, 2.5rem) 0;
}

/* 语言切换 */
.lang-toggle {
  display: flex;
  border: 1px solid var(--ink, #111);
}

.lang-toggle button {
  background: none;
  border: none;
  min-width: 3rem;
  min-height: 2rem;
  padding: 0.35rem 0.7rem;
  font-size: 0.68rem;
  font-weight: 600;
  font-family: var(--font-heavy);
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: color 180ms ease, background-color 180ms ease;
  color: var(--muted, #747474);
  line-height: 1;
}

.lang-toggle button + button {
  border-left: 1px solid var(--ink, #111);
}

.lang-toggle button.active {
  background: var(--ink, #111);
  color: var(--paper-white, #fff);
}

.lang-toggle button:hover:not(.active) {
  color: #000;
}

/* 可滚动区域 - 仅简介 */
.panel-scroll {
  flex: 1;
  overflow-y: auto;
  padding: clamp(1.5rem, 3vw, 2.5rem);
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.panel-scroll::-webkit-scrollbar {
  width: 3px;
}

.panel-scroll::-webkit-scrollbar-thumb {
  background: #ccc;
}

/* 固定底部 */
.panel-footer {
  flex-shrink: 0;
  padding: 0.9rem clamp(1.5rem, 3vw, 2.5rem);
  border-top: 1px solid var(--ink, #111);
  display: flex;
  justify-content: center;
}

/* 信息标签 */
.info-tag {
  display: block;
  margin-top: 1rem;
  color: var(--accent-blue, #78a2ed);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  font-family: var(--font-heavy);
}

/* 标题 */
.info-title {
  max-width: calc(100% - 3.75rem);
  font-size: clamp(2rem, 3vw, 2.75rem);
  line-height: 1.08;
  margin: 0;
  color: #000;
}

.info-title-en {
  font-size: 0.7rem;
  color: var(--muted, #747474);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin: 0.4rem 0 0;
  font-weight: 400;
}

/* 分隔线 */
.info-divider {
  height: 0;
  border-top: 1px solid var(--ink, #111);
  margin: 1.35rem 0;
}

/* 作者 */
.authors-names {
  font-size: 0.82rem;
  color: var(--ink, #111);
  letter-spacing: 0.04em;
  font-weight: 600;
  font-family: var(--font-heavy);
  margin: 0;
}

/* 描述 */
.info-desc p {
  font-size: clamp(0.92rem, 1.1vw, 1rem);
  line-height: 1.8;
  color: #303030;
  margin-bottom: 1.25rem;
}

.info-desc p:last-child {
  margin-bottom: 0;
}

/* ===== 响应式 ===== */
@media (max-width: 900px) {
  .exhibition-detail {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(18rem, 42dvh) minmax(0, 1fr);
    width: min(94vw, 42rem);
    height: min(90dvh, 62rem);
  }
}

/* 超小屏幕：全屏展示 + 紧凑内边距 */
@media (max-width: 480px) {
  .exhibition-overlay {
    padding: 0;
  }

  .exhibition-detail {
    width: 100%;
    height: 100dvh;
    max-height: 100dvh;
    border: none;
    box-shadow: none;
  }

  .panel-header {
    padding: 1.25rem 1rem 0;
  }

  .panel-scroll {
    padding: 1.25rem 1rem 1.5rem;
  }

  .panel-footer {
    padding: 0.75rem 1rem;
  }

  .info-title {
    font-size: 1.8rem;
  }

  .info-title-en {
    font-size: 0.7rem;
  }

  .info-desc p {
    font-size: 0.94rem;
    line-height: 1.75;
  }

  .close-btn {
    top: 0.5rem;
    right: 0.5rem;
    width: 40px;
    height: 40px;
  }
}
</style>
