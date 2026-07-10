<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="visible" class="exhibition-overlay" @click.self="close">
        <div class="exhibition-detail">
          <!-- 左侧：图片画廊 -->
          <section class="gallery-panel">
            <img
              v-if="exhibition"
              :src="`${assetsBase}/course-gifs/${exhibition.images[currentImage].filename}`"
              :alt="exhibition.name"
              class="gallery-img"
            />

            <!-- 左右箭头 -->
            <button
              v-if="exhibition && exhibition.images.length > 1"
              class="nav-arrow nav-arrow--left"
              @click="prevImage"
              aria-label="上一张"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <button
              v-if="exhibition && exhibition.images.length > 1"
              class="nav-arrow nav-arrow--right"
              @click="nextImage"
              aria-label="下一张"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
              </svg>
            </button>

            <!-- 图片计数 -->
            <span
              v-if="exhibition && exhibition.images.length > 1"
              class="image-counter"
            >
              {{ currentImage + 1 }} / {{ exhibition.images.length }}
            </span>
          </section>

          <!-- 右侧：信息面板 -->
          <aside class="info-panel">
            <!-- 关闭按钮 -->
            <button class="close-btn" @click="close">
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
              <div class="lang-toggle">
                <button :class="{ active: lang === 'zh' }" @click="lang = 'zh'">中</button>
                <button :class="{ active: lang === 'en' }" @click="lang = 'en'">EN</button>
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
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3vh 3vw;
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
  background: var(--white);
  width: 100%;
  height: 100%;
  max-height: 94vh;
  display: grid;
  grid-template-columns: 1fr 400px;
  color: #000;
  overflow: hidden;
  border: 2px solid #000;
}

/* ===== 左侧：图片画廊 ===== */
.gallery-panel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
  overflow: hidden;
  border-right: 2px solid #000;
}

.gallery-img {
  max-width: 85%;
  max-height: 85%;
  object-fit: contain;
  user-select: none;
}

/* 导航箭头 */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: var(--white);
  border: 2px solid #000;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #000;
  z-index: 10;
}

.nav-arrow:hover {
  background: #000;
  color: var(--white);
}

.nav-arrow--left {
  left: 1.5rem;
}

.nav-arrow--right {
  right: 1.5rem;
}

/* 图片计数 */
.image-counter {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-heavy);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--gray-text);
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
  top: 1rem;
  right: 1rem;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--white);
  border: 2px solid #000;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #000;
}

.close-btn:hover {
  background: #000;
  color: var(--white);
}

/* 固定头部 */
.panel-header {
  flex-shrink: 0;
  padding: 2rem 1.5rem 0;
}

/* 语言切换 */
.lang-toggle {
  display: flex;
  border: 2px solid #000;
}

.lang-toggle button {
  background: none;
  border: none;
  padding: 0.3rem 0.8rem;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: var(--font-heavy);
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #aaa;
  line-height: 1;
}

.lang-toggle button + button {
  border-left: 2px solid #000;
}

.lang-toggle button.active {
  background: #000;
  color: var(--white);
}

.lang-toggle button:hover:not(.active) {
  color: #000;
}

/* 可滚动区域 - 仅简介 */
.panel-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 1.5rem 2rem;
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
  padding: 1rem 1.5rem;
  border-top: 2px solid #000;
  display: flex;
  justify-content: center;
}

/* 信息标签 */
.info-tag {
  display: inline-block;
  background: var(--blue-light);
  color: var(--white);
  padding: 0.25rem 0.9rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  font-family: var(--font-heavy);
  border-radius: 999px;
  margin-bottom: 0;
}

/* 标题 */
.info-title {
  font-size: 2rem;
  line-height: 1.1;
  margin: 0;
  color: #000;
}

.info-title-en {
  font-size: 0.8rem;
  color: var(--gray-text);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 0.4rem 0 0;
  font-weight: 400;
}

/* 分隔线 */
.info-divider {
  height: 0;
  border-top: 2px solid #000;
  margin: 1.5rem 0;
}

/* 作者 */
.authors-names {
  font-size: 0.85rem;
  color: #000;
  letter-spacing: 0.05em;
  font-weight: 700;
  font-family: var(--font-heavy);
  margin: 0;
}

/* 描述 */
.info-desc p {
  font-size: 0.875rem;
  line-height: 1.85;
  color: #333;
  margin-bottom: 1rem;
}

.info-desc p:last-child {
  margin-bottom: 0;
}

/* ===== 响应式 ===== */
@media (max-width: 900px) {
  .exhibition-detail {
    grid-template-columns: 1fr;
    grid-template-rows: 45dvh 1fr;
  }

  .gallery-panel {
    border-right: none;
    border-bottom: 2px solid #000;
  }

  .nav-arrow {
    width: 36px;
    height: 36px;
  }

  .nav-arrow--left {
    left: 0.75rem;
  }

  .nav-arrow--right {
    right: 0.75rem;
  }

  .info-title {
    font-size: 1.6rem;
  }
}
</style>
