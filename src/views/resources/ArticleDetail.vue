<template>
  <div class="article-detail-page">
    <!-- 1. 顶部固定导航 Bar -->
    <ArticleReaderHeader
      :return-target="returnTarget"
      :return-label="returnLabel"
      :current-lang="currentLang"
      :available-languages="availableLanguages"
      @go-back="goBack"
      @switch-language="switchLanguage"
    />

    <!-- 2. 移动端/窄屏吸顶目录栏 -->
    <ArticleReaderMobileToc
      v-if="tocSections.length"
      :toc-sections="tocSections"
      :mobile-toc-open="mobileTocOpen"
      :current-section-label="currentSectionLabel"
      :active-section-id="activeSectionId"
      :expanded-section-ids="expandedSectionIds"
      @update:mobile-toc-open="mobileTocOpen = $event"
      @section-click="onSectionClick"
      @toggle-section="toggleTocSection"
    />

    <main class="reader-container">
      <div v-if="loading" class="reader-loading" role="status">
        <p>正在加载文献内容...</p>
      </div>

      <div v-else-if="error" class="reader-error" role="alert">
        <p>{{ error }}</p>
        <router-link :to="returnTarget" @click="goBack">{{ returnLabel }}</router-link>
      </div>

      <div v-else class="reader-grid" :class="{ 'meta-is-collapsed': metaCollapsed }">
        <!-- 3. 桌面端左侧：随视图平滑吸顶跟随的目录大纲 -->
        <ArticleReaderToc
          :toc-sections="tocSections"
          :active-section-id="activeSectionId"
          :expanded-section-ids="expandedSectionIds"
          @section-click="onSectionClick"
          @toggle-section="toggleTocSection"
          @scroll-to-top="scrollToTop"
        />

        <!-- 4. 中间：正文主列 -->
        <article class="reader-content-col">
          <header id="intro" class="article-head section-heading">
            <span v-if="metadata.chapter" class="article-chapter">{{ metadata.chapter }}</span>
            <h1 class="article-main-title">
              {{ currentLang === 'zh' ? metadata.title : (metadata.titleEn || metadata.title) }}
            </h1>
            <div v-if="metadata.author" class="article-byline">
              <span class="author-name">{{ metadata.author }}</span>
            </div>
            <div v-if="metadata.summary" class="article-summary-box">
              <strong>{{ currentLang === 'zh' ? '导读' : 'Summary' }}：</strong>{{ metadata.summary }}
            </div>
          </header>

          <div class="article-markdown-body" v-html="renderedContent"></div>
        </article>

        <!-- 5. 右侧：元数据与档案资料 column -->
        <ArticleReaderMeta
          :metadata="metadata"
          :meta-collapsed="metaCollapsed"
          @update:meta-collapsed="metaCollapsed = $event"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resourceArticles, resources } from '../../data/resources/index.js'
import { parseArticleOutline } from '../../utils/markdown/articleOutline.js'
import { renderArticleMarkdown } from '../../utils/markdown/articleMarkdown.js'
import '../../styles/article-markdown.css'
import ArticleReaderHeader from '../../components/resources/reader/ArticleReaderHeader.vue'
import ArticleReaderMobileToc from '../../components/resources/reader/ArticleReaderMobileToc.vue'
import ArticleReaderToc from '../../components/resources/reader/ArticleReaderToc.vue'
import ArticleReaderMeta from '../../components/resources/reader/ArticleReaderMeta.vue'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const route = useRoute()
const router = useRouter()
const defaultReturnTarget = '/resources/articles'
const validInternalPath = (value) => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
const historyReturnTarget = () => {
  if (typeof window === 'undefined') return ''
  const previous = window.history.state?.back
  return validInternalPath(previous) ? previous : ''
}
const returnTarget = computed(() => {
  const candidate = Array.isArray(route.query.returnTo) ? route.query.returnTo[0] : route.query.returnTo
  if (validInternalPath(candidate)) return candidate
  return historyReturnTarget() || defaultReturnTarget
})
const returnLabel = computed(() => {
  if (returnTarget.value.startsWith('/syllabus')) return '返回课程详细'
  if (returnTarget.value.startsWith('/resources/articles')) return '返回文章列表'
  return '返回上一页'
})
const goBack = (event) => {
  const previous = historyReturnTarget()
  if (!previous || previous.split('#')[0] !== returnTarget.value.split('#')[0]) return

  event.preventDefault()
  router.back()
}

const currentLang = ref('zh')
const loading = ref(true)
const error = ref('')
const metadata = ref({})
const rawMarkdown = ref('')
const renderedContent = ref('')
const outline = ref({ sections: [], headings: [] })
const activeSectionId = ref('')
const mobileTocOpen = ref(false)
const expandedSectionIds = ref(new Set())
const metaCollapsed = ref(false)

let observer = null
let isProgrammaticScroll = false
let savePositionTimer = null

const getReadingPositionKey = (articleId = props.id, language = currentLang.value) => (
  `article-reader-position:${articleId || 'unknown'}:${language}`
)

const saveReadingPosition = (articleId = props.id, language = currentLang.value) => {
  if (!articleId || typeof window === 'undefined') return
  try {
    window.localStorage.setItem(getReadingPositionKey(articleId, language), String(Math.max(0, window.scrollY)))
  } catch {
    // 本地存储不可用时不影响正文阅读。
  }
}

const scheduleSaveReadingPosition = () => {
  if (savePositionTimer) window.clearTimeout(savePositionTimer)
  savePositionTimer = window.setTimeout(() => {
    savePositionTimer = null
    saveReadingPosition()
  }, 180)
}

const cancelScheduledSave = () => {
  if (savePositionTimer) {
    window.clearTimeout(savePositionTimer)
    savePositionTimer = null
  }
}

const restoreReadingPosition = (articleId = props.id, language = currentLang.value) => {
  if (!articleId || typeof window === 'undefined') return
  let savedPosition = 0
  try {
    savedPosition = Number.parseFloat(window.localStorage.getItem(getReadingPositionKey(articleId, language)) || '0')
  } catch {
    savedPosition = 0
  }

  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  const nextPosition = Number.isFinite(savedPosition)
    ? Math.min(Math.max(0, savedPosition), maxScroll)
    : 0
  window.scrollTo({ top: nextPosition, behavior: 'auto' })
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'hidden') saveReadingPosition()
}

const handlePageHide = () => {
  saveReadingPosition()
}

const tocSections = computed(() => outline.value.sections || [])

const availableLanguages = computed(() => metadata.value.languages || ['zh'])

const flattenTocSections = (sections = []) => sections.flatMap((section) => [
  section,
  ...flattenTocSections(section.children || []),
])

const currentSectionLabel = computed(() => {
  const currentSec = flattenTocSections(tocSections.value).find((section) => section.id === activeSectionId.value)
  return currentSec?.label || metadata.value.title || ''
})

const isTocSectionExpanded = (sectionId) => expandedSectionIds.value.has(sectionId)

const toggleTocSection = (sectionId) => {
  const next = new Set(expandedSectionIds.value)
  if (next.has(sectionId)) next.delete(sectionId)
  else next.add(sectionId)
  expandedSectionIds.value = next
}

const isTocSectionActive = (section) => section.id === activeSectionId.value
  || (section.children || []).some((child) => child.id === activeSectionId.value)

const setActiveSection = (sectionId) => {
  activeSectionId.value = sectionId
  const parent = tocSections.value.find((section) => (section.children || []).some((child) => child.id === sectionId))
  if (parent && !expandedSectionIds.value.has(parent.id)) {
    const next = new Set(expandedSectionIds.value)
    next.add(parent.id)
    expandedSectionIds.value = next
  }
}

const loadArticleContent = async () => {
  const articleId = props.id || 'art-museums-ritual-citizenship'
  const fileName = currentLang.value === 'zh' ? 'index.md' : 'en.md'
  const mdRes = await fetch(`/articles/${articleId}/${fileName}`)
  if (!mdRes.ok) throw new Error('无法加载文献内容')
  rawMarkdown.value = await mdRes.text()
  outline.value = parseArticleOutline(rawMarkdown.value)
  expandedSectionIds.value = new Set(
    outline.value.sections.filter((section) => section.children?.length).slice(0, 1).map((section) => section.id)
  )
  activeSectionId.value = outline.value.sections[0]?.id || ''
  renderedContent.value = renderArticleMarkdown(rawMarkdown.value, {
    articleId,
    outline: outline.value,
    resources,
    language: currentLang.value,
  })
}

const switchLanguage = async (lang) => {
  if (!availableLanguages.value.includes(lang)) return
  if (currentLang.value === lang) return
  cancelScheduledSave()
  saveReadingPosition()
  currentLang.value = lang
  try {
    await loadArticleContent()
    await nextTick()
    restoreReadingPosition(props.id, currentLang.value)
    setTimeout(() => {
      initIntersectionObserver()
    }, 100)
  } catch (err) {
    console.error(err)
  }
}

const onSectionClick = (secId) => {
  setActiveSection(secId)
  mobileTocOpen.value = false
  isProgrammaticScroll = true

  if (!secId) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    const el = document.getElementById(secId)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 85
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  setTimeout(() => {
    isProgrammaticScroll = false
  }, 600)
}

const scrollToTop = () => {
  isProgrammaticScroll = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
  setTimeout(() => {
    isProgrammaticScroll = false
  }, 600)
}

const initIntersectionObserver = () => {
  if (observer) observer.disconnect()
  const headings = document.querySelectorAll('.section-heading')
  if (!headings.length) return

  observer = new IntersectionObserver(
    (entries) => {
      if (isProgrammaticScroll) return
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    },
    { rootMargin: '-15% 0px -65% 0px' }
  )

  headings.forEach((h) => observer.observe(h))
}

onMounted(async () => {
  window.addEventListener('scroll', scheduleSaveReadingPosition, { passive: true })
  window.addEventListener('pagehide', handlePageHide)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  try {
    const articleId = props.id || 'art-museums-ritual-citizenship'

    // 文章级信息只来自全局资源注册表；章节目录由当前语言 Markdown 解析生成。
    const registryMeta = resourceArticles.find((a) => a.id === articleId) || {}
    metadata.value = {
      ...registryMeta,
      languages: registryMeta.languages || ['zh'],
      tags: registryMeta.tags || [],
      links: registryMeta.links || [],
      pdfUrl: registryMeta.url && (registryMeta.url.endsWith('.pdf') || registryMeta.url.includes('origin.pdf'))
        ? registryMeta.url
        : '',
    }

    await loadArticleContent()
    loading.value = false

    await nextTick()
    restoreReadingPosition(articleId, currentLang.value)

    setTimeout(() => {
      initIntersectionObserver()
    }, 150)
  } catch (err) {
    error.value = err.message || '加载文献失败'
    loading.value = false
  }
})

onUnmounted(() => {
  saveReadingPosition()
  cancelScheduledSave()
  window.removeEventListener('scroll', scheduleSaveReadingPosition)
  window.removeEventListener('pagehide', handlePageHide)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.article-detail-page {
  min-height: 100vh;
  background-color: #ffffff;
  color: var(--home-ink, #111111);
}


/* 布局主容器 */
.reader-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2.5rem 2rem 5rem;
}

.reader-loading,
.reader-error {
  padding: 5rem 0;
  text-align: center;
  color: var(--resources-muted, #8c8c88);
}

.reader-grid {
  position: relative;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 240px;
  gap: 3.5rem;
  align-items: start;
}

.reader-grid.meta-is-collapsed {
  grid-template-columns: 240px minmax(0, 1fr);
}


/* 2. 中间：正文主列 */
.reader-content-col {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  margin: 0;
  overflow-wrap: anywhere;
}

.article-head {
  padding-bottom: 1.2rem;
  border-bottom: 1px solid var(--resources-rule, #d7d7d1);
}

.article-chapter {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--resources-muted, #8c8c88);
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.article-main-title {
  font-size: clamp(1.8rem, 3.5vw, 2.6rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.article-byline {
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
  margin-top: 1.2rem;
  color: var(--resources-muted, #8c8c88);
  font-size: 0.85rem;
}

.author-name {
  color: var(--home-ink, #111111);
  font-weight: 600;
}

.article-summary-box {
  margin: 1.2rem 0 0;
  padding: 1.2rem 1.4rem;
  border: 0;
  background-color: #f9f9f8;
  color: #333333;
  font-size: 0.92rem;
  line-height: 1.7;
}

/* Markdown 正文样式 */
:deep(.article-markdown-body) {
  font-size: 1.05rem;
  line-height: 1.8;
  color: #222222;
}

:deep(.article-markdown-body p) {
  margin-bottom: 1.6rem;
  text-align: justify;
}

:deep(.article-markdown-body h1.section-heading) {
  margin: 4rem 0 1.6rem;
  color: var(--home-ink, #111111);
  font-size: clamp(1.55rem, 3vw, 2rem);
  line-height: 1.3;
}

:deep(.article-markdown-body h2.section-heading) {
  margin-top: 3.5rem;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  scroll-margin-top: 5.5rem;
}

:deep(.article-markdown-body h3) {
  scroll-margin-top: 5.5rem;
}

:deep(.article-markdown-body h3) {
  margin-top: 2.2rem;
  margin-bottom: 0.9rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--home-ink, #111111);
}

:deep(.article-markdown-body ol),
:deep(.article-markdown-body ul) {
  margin: 0 0 1.8rem;
  padding-left: 1.5rem;
}

:deep(.article-markdown-body li + li) {
  margin-top: 0.45rem;
}

:deep(.article-callout),
:deep(.article-quote) {
  margin: 1.8rem 1.35rem 2.5rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--resources-muted, #6e6e68);
  font-size: 0.9rem;
  line-height: 1.65;
}

:deep(.article-callout-label) {
  margin-bottom: 0.6rem;
  color: inherit;
  font-size: 0.88rem;
  font-weight: 700;
}

:deep(.article-callout-note) {
  margin-right: 0;
  margin-left: 0;
  padding: 1rem 1.2rem;
  border: 1px solid var(--resources-rule, #d7d7d1);
  background: #f7f7f5;
}

:deep(.article-callout ol),
:deep(.article-callout ul),
:deep(.article-callout p) {
  margin: 0;
}

:deep(.article-markdown-body p.article-video-description) {
  margin: 0;
  padding: 0 0.8rem 0.35rem;
}

:deep(.article-quote) {
  font-style: italic;
}

:deep(.article-code-block) {
  margin: 2rem 0;
  padding: 1.2rem 1.4rem;
  border: 1px solid var(--resources-rule, #d7d7d1);
  background-color: #fafaf9;
  overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.85rem;
  line-height: 1.6;
  color: #111111;
}

:deep(.article-code-block code) {
  font-family: inherit;
  white-space: pre;
}

:deep(.article-code-block-prompt) {
  overflow-x: hidden;
}

:deep(.article-code-block-prompt code) {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

:deep(.article-code-block-label) {
  display: block;
  margin-bottom: 0.65rem;
  color: var(--resources-muted, #6e6e68);
  font-family: inherit;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

:deep(.article-figure) {
  margin: 2.5rem 0;
  padding: 0;
}

:deep(.article-figure img) {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--resources-rule, #d7d7d1);
}

:deep(.article-figure figcaption) {
  margin-top: 0.6rem;
  color: var(--resources-muted, #8c8c88);
  font-size: 0.8rem;
  line-height: 1.5;
}

/* 4. 学术脚标与尾注互跳系统 (含悬浮预览 Popover) */
:deep(.footnote-ref) {
  position: relative;
  display: inline-block;
  margin-left: 0.15rem;
  font-size: 0.72rem;
  font-weight: 700;
  vertical-align: super;
}

:deep(.footnote-ref a) {
  padding: 0 0.15rem;
  color: var(--home-blue, #1976d2);
  text-decoration: none;
  scroll-margin-top: 6rem;
  transition: color 0.15s ease;
}

:deep(.footnote-ref a:hover) {
  color: var(--accent-orange, #e65100);
}

:deep(.footnote-popover) {
  position: absolute;
  bottom: 140%;
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  z-index: 100;
  width: max-content;
  max-width: 22rem;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--resources-rule, #d7d7d1);
  border-radius: 4px;
  background-color: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  color: #222222;
  font-size: 0.82rem;
  font-weight: 400;
  line-height: 1.55;
  text-align: left;
  white-space: normal;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
}

/* 气泡底部小指示三角 */
:deep(.footnote-popover::after) {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -6px;
  border-width: 6px;
  border-style: solid;
  border-color: #ffffff transparent transparent transparent;
}

:deep(.footnote-ref:hover .footnote-popover),
:deep(.footnote-ref:focus-within .footnote-popover) {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

:deep(.popover-num) {
  color: var(--home-blue, #1976d2);
  font-weight: 700;
  margin-right: 0.35rem;
}

:deep(.footnote-item) {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  margin-bottom: 1rem;
  padding: 0.6rem 0.8rem;
  border-left: 2px solid var(--resources-rule, #d7d7d1);
  background-color: #fafaf9;
  font-size: 0.88rem;
  line-height: 1.6;
  scroll-margin-top: 6rem;
}

:deep(.footnote-item:target) {
  border-left-color: var(--home-blue, #1976d2);
  background-color: #f0f7ff;
}

:deep(.fn-num) {
  color: var(--home-blue, #1976d2);
  font-weight: 700;
  font-size: 0.82rem;
}

:deep(.fn-text) {
  flex: 1;
  color: #333333;
}

:deep(.fn-backref) {
  color: var(--resources-muted, #8c8c88);
  font-size: 0.9rem;
  text-decoration: none;
}

:deep(.fn-backref:hover) {
  color: var(--home-blue, #1976d2);
}


/* 响应式断点控制 */
@media (max-width: 1024px) {
  .reader-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .reader-grid.meta-is-collapsed {
    grid-template-columns: 1fr;
  }
}
</style>
