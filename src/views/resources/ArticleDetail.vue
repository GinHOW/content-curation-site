<template>
  <div class="article-detail-page">
    <!-- 1. 顶部固定导航 Bar -->
    <header class="reader-header">
      <div class="reader-header-inner">
        <router-link to="/resources/articles" class="reader-back-btn">
          <span aria-hidden="true">←</span> 返回文章列表
        </router-link>

        <div class="reader-header-actions">
          <!-- 语言切换开关 -->
          <div class="lang-switch-group" role="group" aria-label="文献语言切换">
            <button
              type="button"
              class="lang-btn"
              :class="{ 'is-active': currentLang === 'zh' }"
              @click="switchLanguage('zh')"
            >
              中文
            </button>
            <span class="lang-divider">/</span>
            <button
              type="button"
              class="lang-btn"
              :class="{ 'is-active': currentLang === 'en' }"
              @click="switchLanguage('en')"
            >
              EN
            </button>
          </div>

          <div class="reader-tag-label">
            <span class="color-badge"></span>
            <span class="badge-text">01 / Text · 经典文献</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 2. 移动端/窄屏吸顶目录栏 (可收缩/跳转) -->
    <nav v-if="metadata.sections && metadata.sections.length" class="mobile-toc-bar" aria-label="移动端目录">
      <button type="button" class="mobile-toc-toggle" @click="mobileTocOpen = !mobileTocOpen">
        <span class="toggle-icon">☰</span>
        <span class="current-section-text">
          大纲：{{ currentSectionLabel }}
        </span>
        <span class="arrow-icon">{{ mobileTocOpen ? '▲' : '▼' }}</span>
      </button>
      <div v-show="mobileTocOpen" class="mobile-toc-dropdown">
        <ul>
          <li
            v-for="sec in metadata.sections"
            :key="sec.id"
            :class="{ 'is-active': activeSectionId === sec.id }"
          >
            <a :href="`#${sec.id}`" @click.prevent="onSectionClick(sec.id)">
              <span class="sec-label">{{ currentLang === 'zh' ? sec.label : sec.title }}</span>
              <span class="sec-en">{{ currentLang === 'zh' ? sec.title : sec.label }}</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>

    <main class="reader-container">
      <div v-if="loading" class="reader-loading" role="status">
        <p>正在加载文献内容...</p>
      </div>

      <div v-else-if="error" class="reader-error" role="alert">
        <p>{{ error }}</p>
        <router-link to="/resources/articles">返回文章列表</router-link>
      </div>

      <div v-else class="reader-grid">
        <!-- 3. 桌面端左侧：随视图平滑吸顶跟随的目录大纲 -->
        <aside class="reader-toc-col" aria-label="章节大纲">
          <div class="toc-sticky-box">
            <span class="toc-title">目录大纲 / CONTENTS</span>
            <nav class="toc-nav">
              <ul>
                <li
                  v-for="sec in metadata.sections || []"
                  :key="sec.id"
                  :class="{ 'is-active': activeSectionId === sec.id }"
                >
                  <a :href="`#${sec.id}`" @click.prevent="onSectionClick(sec.id)">
                    <span class="sec-label">{{ currentLang === 'zh' ? sec.label : sec.title }}</span>
                    <span class="sec-en">{{ currentLang === 'zh' ? sec.title : sec.label }}</span>
                  </a>
                </li>
              </ul>
            </nav>

            <div class="toc-foot">
              <button type="button" class="back-top-btn" @click="scrollToTop">
                ↑ 回到顶部
              </button>
            </div>
          </div>
        </aside>

        <!-- 4. 中间：正文主列 -->
        <article class="reader-content-col">
          <header id="intro" class="article-head section-heading">
            <span v-if="metadata.chapter" class="article-chapter">{{ metadata.chapter }}</span>
            <h1 class="article-main-title">
              {{ currentLang === 'zh' ? metadata.title : (metadata.titleEn || metadata.title) }}
            </h1>
            <p v-if="metadata.titleEn" class="article-sub-title">
              {{ currentLang === 'zh' ? metadata.titleEn : metadata.title }}
            </p>
            <div class="article-byline">
              <span class="author-name">{{ metadata.author }}</span>
              <span class="source-year">{{ metadata.source }} ({{ metadata.year }})</span>
            </div>
            <div v-if="metadata.summary" class="article-summary-box">
              <strong>导读 / Summary：</strong>{{ metadata.summary }}
            </div>
          </header>

          <div class="article-markdown-body" v-html="renderedContent"></div>
        </article>

        <!-- 5. 右侧：元数据与档案资料 column -->
        <aside class="reader-meta-col" aria-label="文献元数据与资源">
          <div class="meta-sticky-box">
            <div class="meta-block">
              <span class="meta-label">文献出处</span>
              <p class="meta-value">{{ metadata.source }}</p>
              <p v-if="metadata.bookSource" class="meta-subvalue">{{ metadata.bookSource }}</p>
            </div>

            <div class="meta-block">
              <span class="meta-label">发表年份</span>
              <p class="meta-value">{{ metadata.year }}</p>
            </div>

            <div class="meta-block">
              <span class="meta-label">主题标签</span>
              <div class="meta-tags">
                <span v-for="tag in metadata.tags" :key="tag" class="meta-tag-item">{{ tag }}</span>
              </div>
            </div>

            <!-- 关联外部资源与代码库卡片 -->
            <div v-if="metadata.links && metadata.links.length" class="meta-block">
              <span class="meta-label">关联站点与代码仓库</span>
              <div class="meta-links-list">
                <a
                  v-for="(link, idx) in metadata.links"
                  :key="idx"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="meta-link-item"
                >
                  <span class="meta-link-badge">{{ link.type === 'github' ? 'CODE' : 'WEB' }}</span>
                  <div class="meta-link-info">
                    <span class="meta-link-name">{{ link.label }}</span>
                    <span class="meta-link-desc">{{ link.desc || link.url }}</span>
                  </div>
                  <span class="meta-link-arrow" aria-hidden="true">↗</span>
                </a>
              </div>
            </div>

            <!-- 仅当确实有原版 PDF 存档时才显示下载区块 -->
            <div v-if="metadata.pdfUrl && (metadata.pdfUrl.endsWith('.pdf') || metadata.pdfUrl.includes('origin.pdf'))" class="meta-block meta-download">
              <span class="meta-label">原版文献存档</span>
              <a
                :href="metadata.pdfUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="pdf-download-btn"
              >
                下载 / 查看原版 PDF <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { resourceArticles } from '../../data/resources.js'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const currentLang = ref('zh')
const loading = ref(true)
const error = ref('')
const metadata = ref({})
const rawMarkdown = ref('')
const renderedContent = ref('')
const activeSectionId = ref('intro')
const mobileTocOpen = ref(false)

let observer = null
let isProgrammaticScroll = false

const currentSectionLabel = computed(() => {
  const currentSec = metadata.value.sections?.find((s) => s.id === activeSectionId.value)
  if (!currentSec) return currentLang.value === 'zh' ? '导言与背景' : 'Introduction'
  return currentLang.value === 'zh' ? currentSec.label : currentSec.title
})

// 解析 Markdown 并修正相对图片路径与注脚
const renderMarkdown = (md, articleId) => {
  if (!md) return ''

  let text = md

  // 0. 清理正文开头重复的章节号、一级大标题与作者行（这些已经在 article-head 中规范渲染）
  text = text.replace(/^(?:CHAPTER\s+\d+|第[一二三四五六七八九十\d]+章)\s*\n+/i, '')
  text = text.replace(/^#\s+[^\n]+\n+/m, '')
  text = text.replace(/^(?:\*\*[^\n]+\*\*|\*[^\n]+\*|[A-Z\s]{4,}|(?:作者|Author)[：:][^\n]*)\s*\n+/im, '')
  text = text.replace(/^(?:\*\*[^\n]+\*\*|\*[^\n]+\*)\s*\n+/m, '')

  // 1. 识别并转换外部资源与代码库链接为精致的链接卡片网格
  text = text.replace(
    /(?:(?:网站链接|官网链接|主站链接|GitHub\s*仓库链接|Github\s*链接|开源仓库|参考链接|在线链接)[：:]\s*https?:\/\/[^\s\n]+\s*)+/gi,
    (match) => {
      const lines = match.trim().split('\n')
      const cardsHtml = lines
        .map((line) => {
          const parts = line.split(/[：:]\s*(https?:\/\/[^\s\n]+)/)
          if (parts.length < 2) return ''
          const rawLabel = parts[0].trim()
          const url = parts[1].trim()
          const isGithub = url.includes('github.com') || rawLabel.toLowerCase().includes('github')
          const badge = isGithub ? 'GITHUB' : 'WEBSITE'
          const title = isGithub ? 'GitHub 源码仓库' : (rawLabel.includes('网站') || rawLabel.includes('官网') ? '官方主站' : rawLabel)

          return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="article-link-card-item">
            <div class="link-card-top">
              <span class="link-card-tag ${isGithub ? 'tag-github' : 'tag-web'}">${badge}</span>
              <span class="link-card-arrow" aria-hidden="true">↗</span>
            </div>
            <div class="link-card-title">${title}</div>
            <div class="link-card-url">${url.replace(/^https?:\/\//, '')}</div>
          </a>`
        })
        .filter(Boolean)
        .join('')

      return `<div class="article-link-cards-grid">${cardsHtml}</div>\n\n`
    }
  )

  // 2. 替换相对图片路径：images/xxx.jpg -> /articles/:id/images/xxx.jpg
  let html = text.replace(
    /!\[(.*?)\]\(images\/(.*?)\)/g,
    `<figure class="article-figure">
      <img src="/articles/${articleId}/images/$2" alt="$1" loading="lazy" />
      <figcaption>$1</figcaption>
    </figure>`
  )

  // 3. 转换二级标题为带有 ID 的 H2 锚点
  html = html.replace(/^##\s+(.+)$/gm, (match, title) => {
    const cleanTitle = title.trim()
    let slug = ''

    // 优先从 metadata sections 中精准匹配 ID
    if (metadata.value.sections) {
      const matched = metadata.value.sections.find(
        (s) => cleanTitle.includes(s.label) || s.label.includes(cleanTitle) || cleanTitle.toLowerCase().includes(s.title.toLowerCase())
      )
      if (matched) slug = matched.id
    }

    if (!slug) {
      if (cleanTitle.includes('注释') || cleanTitle.includes('笔记') || cleanTitle.toUpperCase().includes('NOTES')) {
        slug = 'notes'
      } else {
        slug = cleanTitle.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      }
    }

    return `<h2 id="${slug}" class="section-heading">${cleanTitle}</h2>`
  })

  // 3. 处理脚标 (Footnotes): 提取尾注内容以支持悬停预览 (Popover)
  const footnotesDict = {}
  html.replace(/^\[\^(\d+)\]:\s+(.+)$/gm, (match, fnId, fnText) => {
    // 过滤 Markdown 标记以便在 popover 中纯净展示
    let cleanFn = fnText.trim()
    cleanFn = cleanFn.replace(/\*\*([^*]+)\*\*/g, '$1')
    cleanFn = cleanFn.replace(/\*([^*]+)\*/g, '$1')
    cleanFn = cleanFn.replace(/"/g, '&quot;')
    footnotesDict[fnId] = cleanFn
    return match
  })

  // 尾注列表 DOM (支持富文本)
  html = html.replace(
    /^\[\^(\d+)\]:\s+(.+)$/gm,
    (match, fnId, fnContent) => {
      let formatted = fnContent.trim()
      formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>')
      return `<div class="footnote-item" id="fn-${fnId}">
        <span class="fn-num">[${fnId}]</span>
        <span class="fn-text">${formatted}</span>
        <a href="#fnref-${fnId}" class="fn-backref" aria-label="跳回正文出处" title="跳回正文出处">↩</a>
      </div>`
    }
  )

  // 正文角标 DOM (带悬浮预览 popover)
  html = html.replace(/\[\^(\d+)\](?!:)/g, (match, fnId) => {
    const previewText = footnotesDict[fnId] || ''
    return `<sup class="footnote-ref">
      <a id="fnref-${fnId}" href="#fn-${fnId}" title="点击跳转至注脚 [${fnId}]">
        [${fnId}]
      </a>
      <span class="footnote-popover" role="tooltip">
        <span class="popover-num">[${fnId}]</span> ${previewText}
      </span>
    </sup>`
  })

  // 4. 转换多行代码块与 ASCII 架构图（``` ... ```）
  html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return `<pre class="article-code-block"><code>${escaped}</code></pre>`
  })

  // 5. 转换一级标题与三级标题
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="article-title-internal">$1</h1>')
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')

  // 6. 行内格式解析：粗体、斜体、链接、代码
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // 7. 处理段落与换行
  const paragraphs = html.split(/\n\n+/)
  html = paragraphs
    .map((p) => {
      const trimmed = p.trim()
      if (!trimmed) return ''
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<figure') ||
        trimmed.startsWith('<div') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<ol')
      ) {
        return trimmed
      }
      return `<p>${trimmed.replace(/\n/g, ' ')}</p>`
    })
    .join('\n')

  return html
}

const loadArticleContent = async () => {
  const articleId = props.id || 'art-museums-ritual-citizenship'
  const fileName = currentLang.value === 'zh' ? 'zh.md' : 'index.md'
  const mdRes = await fetch(`/articles/${articleId}/${fileName}`)
  if (!mdRes.ok) throw new Error('无法加载文献内容')
  rawMarkdown.value = await mdRes.text()
  renderedContent.value = renderMarkdown(rawMarkdown.value, articleId)
}

const switchLanguage = async (lang) => {
  if (currentLang.value === lang) return
  currentLang.value = lang
  try {
    await loadArticleContent()
    setTimeout(() => {
      initIntersectionObserver()
    }, 100)
  } catch (err) {
    console.error(err)
  }
}

const onSectionClick = (secId) => {
  activeSectionId.value = secId
  mobileTocOpen.value = false
  isProgrammaticScroll = true

  if (secId === 'intro') {
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
  onSectionClick('intro')
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
          activeSectionId.value = entry.target.id
        }
      })
    },
    { rootMargin: '-15% 0px -65% 0px' }
  )

  headings.forEach((h) => observer.observe(h))
}

onMounted(async () => {
  try {
    const articleId = props.id || 'art-museums-ritual-citizenship'

    // 1. 获取全局单一事实源（Single Source of Truth）
    const registryMeta = resourceArticles.find((a) => a.id === articleId) || {}

    // 2. 异步获取包内专属章节大纲（sections）与补充信息
    let bundleMeta = {}
    try {
      const metaRes = await fetch(`/articles/${articleId}/metadata.json`)
      if (metaRes.ok) bundleMeta = await metaRes.json()
    } catch (e) {
      console.warn('Bundle metadata load skipped:', e)
    }

    // 3. 统一聚合：标题、作者、年份、摘要、标签、链接全部以 resources.js 为主
    metadata.value = {
      ...bundleMeta,
      ...registryMeta,
      tags: registryMeta.tags || bundleMeta.tags || [],
      links: registryMeta.links || bundleMeta.links || [],
      sections: bundleMeta.sections || registryMeta.sections || [],
      pdfUrl: registryMeta.url && (registryMeta.url.endsWith('.pdf') || registryMeta.url.includes('origin.pdf'))
        ? registryMeta.url
        : (bundleMeta.pdfUrl || ''),
    }

    await loadArticleContent()
    loading.value = false

    setTimeout(() => {
      initIntersectionObserver()
    }, 150)
  } catch (err) {
    error.value = err.message || '加载文献失败'
    loading.value = false
  }
})

onUnmounted(() => {
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

/* 顶部粘性 Header */
.reader-header {
  position: sticky;
  top: 0;
  z-index: 45;
  border-bottom: 1px solid var(--resources-rule, #d7d7d1);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
}

.reader-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.85rem 2rem;
}

.reader-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--resources-ink, #111111);
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
}

.reader-back-btn:hover {
  color: var(--accent-orange, #e65100);
}

.reader-header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* 语言切换器 */
.lang-switch-group {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--resources-rule, #d7d7d1);
  background-color: #fafaf9;
}

.lang-btn {
  border: none;
  background: transparent;
  color: var(--resources-muted, #8c8c88);
  font-size: 0.76rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.1rem 0.3rem;
  transition: all 0.15s ease;
}

.lang-btn:hover {
  color: var(--home-ink, #111111);
}

.lang-btn.is-active {
  color: var(--home-blue, #1976d2);
  font-weight: 700;
}

.lang-divider {
  color: var(--resources-rule, #d7d7d1);
  font-size: 0.72rem;
}

.reader-tag-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.76rem;
  letter-spacing: 0.05em;
}

.color-badge {
  width: 8px;
  height: 8px;
  background-color: var(--home-blue, #1976d2);
}

.badge-text {
  color: var(--resources-muted, #8c8c88);
}

/* 移动端吸顶大纲栏 */
.mobile-toc-bar {
  display: none;
  position: sticky;
  top: 2.8rem;
  z-index: 40;
  border-bottom: 1px solid var(--resources-rule, #d7d7d1);
  background: #ffffff;
}

.mobile-toc-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.65rem 1.2rem;
  border: none;
  background: transparent;
  color: var(--home-ink, #111111);
  font-size: 0.82rem;
  cursor: pointer;
}

.mobile-toc-dropdown {
  padding: 0.6rem 1.2rem 1rem;
  border-top: 1px solid var(--resources-rule, #d7d7d1);
  background: #fafaf9;
}

.mobile-toc-dropdown ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-toc-dropdown li {
  margin-bottom: 0.6rem;
}

.mobile-toc-dropdown a {
  display: flex;
  flex-direction: column;
  color: var(--resources-muted, #8c8c88);
  text-decoration: none;
}

.mobile-toc-dropdown li.is-active a {
  color: var(--home-blue, #1976d2);
  font-weight: 600;
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
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 240px;
  gap: 3.5rem;
  align-items: start;
}

/* 1. 左侧：跟随视图吸顶固定目录大纲 */
.reader-toc-col {
  position: sticky;
  top: 4.5rem;
  align-self: start;
}

.toc-sticky-box {
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
  padding-right: 0.5rem;
}

.toc-title {
  display: block;
  margin-bottom: 1.2rem;
  color: var(--resources-muted, #8c8c88);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.toc-nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.toc-nav li {
  margin-bottom: 1.1rem;
}

.toc-nav a {
  display: flex;
  flex-direction: column;
  padding-left: 0.75rem;
  border-left: 2px solid transparent;
  color: var(--resources-muted, #8c8c88);
  text-decoration: none;
  transition: all 0.2s ease;
}

.toc-nav a:hover {
  color: var(--home-ink, #111111);
}

.toc-nav li.is-active a {
  border-left-color: var(--home-blue, #1976d2);
  color: var(--home-ink, #111111);
}

.sec-label {
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.35;
}

.sec-en {
  margin-top: 0.15rem;
  font-size: 0.68rem;
  opacity: 0.75;
}

.toc-foot {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--resources-rule, #d7d7d1);
}

.back-top-btn {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--resources-muted, #8c8c88);
  font-size: 0.75rem;
  cursor: pointer;
}

.back-top-btn:hover {
  color: var(--home-blue, #1976d2);
}

/* 2. 中间：正文主列 */
.reader-content-col {
  max-width: 46rem;
  margin: 0 auto;
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

.article-sub-title {
  margin-top: 0.4rem;
  color: var(--resources-muted, #8c8c88);
  font-size: 1.1rem;
}

.article-byline {
  display: flex;
  gap: 1.5rem;
  margin-top: 1.2rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid var(--resources-rule, #d7d7d1);
  color: var(--resources-muted, #8c8c88);
  font-size: 0.85rem;
}

.author-name {
  color: var(--home-ink, #111111);
  font-weight: 600;
}

.article-summary-box {
  margin: 1.8rem 0 2.5rem;
  padding: 1.2rem 1.4rem;
  border-left: 3px solid var(--home-blue, #1976d2);
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

:deep(.article-markdown-body h2.section-heading) {
  margin-top: 3.5rem;
  margin-bottom: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--resources-rule, #d7d7d1);
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  scroll-margin-top: 5.5rem;
}

:deep(.article-markdown-body h3) {
  margin-top: 2.2rem;
  margin-bottom: 0.9rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--home-ink, #111111);
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

/* 4.5 正文外链卡片网格样式 */
:deep(.article-link-cards-grid) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
  margin: 1.8rem 0 2.5rem;
}

:deep(.article-link-card-item) {
  display: flex;
  flex-direction: column;
  padding: 1rem 1.2rem;
  border: 1px solid var(--resources-rule, #d7d7d1);
  background-color: #fafaf9;
  text-decoration: none;
  transition: all 0.18s ease;
}

:deep(.article-link-card-item:hover) {
  border-color: var(--home-blue, #1976d2);
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

:deep(.link-card-top) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

:deep(.link-card-tag) {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 0.15rem 0.4rem;
  border: 1px solid currentColor;
}

:deep(.tag-github) {
  color: #111111;
  background-color: #f0f0f0;
}

:deep(.tag-web) {
  color: var(--home-blue, #1976d2);
  background-color: #eef6ff;
}

:deep(.link-card-arrow) {
  color: var(--resources-muted, #8c8c88);
  font-size: 0.9rem;
  transition: transform 0.15s ease, color 0.15s ease;
}

:deep(.article-link-card-item:hover .link-card-arrow) {
  color: var(--home-blue, #1976d2);
  transform: translate(2px, -2px);
}

:deep(.link-card-title) {
  color: var(--home-ink, #111111);
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.35;
  margin-bottom: 0.3rem;
}

:deep(.link-card-url) {
  color: var(--resources-muted, #8c8c88);
  font-size: 0.76rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 5. 右侧：元数据与档案下载 */
.reader-meta-col {
  position: sticky;
  top: 4.5rem;
  align-self: start;
}

.meta-sticky-box {
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
}

.meta-block {
  margin-bottom: 1.8rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid var(--resources-rule, #d7d7d1);
}

.meta-label {
  display: block;
  margin-bottom: 0.4rem;
  color: var(--resources-muted, #8c8c88);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.meta-value {
  color: var(--home-ink, #111111);
  font-size: 0.9rem;
  font-weight: 600;
}

.meta-subvalue {
  margin-top: 0.2rem;
  color: var(--resources-muted, #8c8c88);
  font-size: 0.78rem;
}

.meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.5rem;
}

.meta-tag-item {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border: 1px solid var(--resources-rule, #d7d7d1);
  background-color: #fafaf9;
  color: var(--home-ink, #111111);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1.25;
  transition: all 0.15s ease;
}

.meta-tag-item:hover {
  border-color: var(--home-blue, #1976d2);
  color: var(--home-blue, #1976d2);
  background-color: #f0f7ff;
}

/* 侧边栏外链卡片 */
.meta-links-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.5rem;
}

.meta-link-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--resources-rule, #d7d7d1);
  background-color: #fafaf9;
  text-decoration: none;
  transition: all 0.15s ease;
}

.meta-link-item:hover {
  border-color: var(--home-blue, #1976d2);
  background-color: #ffffff;
}

.meta-link-badge {
  font-size: 0.64rem;
  font-weight: 700;
  padding: 0.1rem 0.3rem;
  border: 1px solid var(--resources-rule, #d7d7d1);
  background-color: #ffffff;
  color: var(--home-ink, #111111);
}

.meta-link-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.meta-link-name {
  color: var(--home-ink, #111111);
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.3;
}

.meta-link-desc {
  margin-top: 0.15rem;
  color: var(--resources-muted, #8c8c88);
  font-size: 0.7rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta-link-arrow {
  color: var(--resources-muted, #8c8c88);
  font-size: 0.78rem;
}

.meta-link-item:hover .meta-link-arrow {
  color: var(--home-blue, #1976d2);
}

.pdf-download-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.4rem;
  color: var(--home-blue, #1976d2);
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
}

.pdf-download-btn:hover {
  color: var(--accent-orange, #e65100);
}

/* 响应式断点控制 */
@media (max-width: 1024px) {
  .mobile-toc-bar {
    display: block;
  }

  .reader-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .reader-toc-col {
    display: none;
  }

  .reader-meta-col {
    position: static;
  }
}
</style>
