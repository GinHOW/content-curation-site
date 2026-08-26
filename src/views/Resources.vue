<template>
  <div id="top" class="resources-page home-page">
    <a class="skip-link" href="#resources-content">跳转到课程资源</a>

    <div class="home-shell resources-shell">
      <HomeEdgeNav
        :items="landingNavItems"
        :active-section="activeSection"
        mobile-mode="toolbar"
        aria-label="课程资源章节"
        @navigate="navigateToSection"
      />

      <main id="resources-content" class="home-main resources-main">
        <HomeSiteNav />

        <header id="resources-overview" class="resources-intro resource-anchor">
          <div class="resources-intro-grid">
            <div>
              <p class="resources-eyebrow">Course Resource Library</p>
              <h1>课程<br />资源</h1>
            </div>
            <div class="resources-intro-copy">
              <p>从展示、观看、收藏与场域实践，到网页案例、课程视频和内容数据库工具，这里汇集课程持续阅读、观看与操作的材料。</p>
              <p class="resources-intro-note">沿侧边分类导航进入对应章节；使用每类入口查看该类完整列表。</p>
            </div>
          </div>

        </header>

        <div class="resources-sections">
          <section id="article" class="resource-section resource-anchor" aria-labelledby="article-title">
            <header class="resource-section-heading">
              <div>
                <p class="resource-section-index">01 / Text</p>
                <h2 id="article-title">文章</h2>
              </div>
              <div class="resource-section-heading-actions">
                <router-link class="resource-detail-link" to="/resources/articles">进入详细 <span aria-hidden="true">→</span></router-link>
              </div>
            </header>

            <div class="article-list">
              <article v-for="(article, index) in featuredArticles" :key="article.id" class="article-row">
                <span class="article-index">{{ String(index + 1).padStart(2, '0') }}</span>
                <div class="article-copy">
                  <div class="article-title-line">
                    <h3>{{ article.title }}</h3>
                    <span v-if="article.titleEn" class="article-title-en">{{ article.titleEn }}</span>
                  </div>
                  <p class="article-summary">{{ article.summary }}</p>
                  <div class="article-meta">
                    <span>{{ article.author }}</span>
                    <span>{{ article.source }}</span>
                    <span>{{ article.year }}</span>
                    <span v-for="tag in article.tags" :key="tag" class="resource-tag">{{ tag }}</span>
                  </div>
                </div>
                <a
                  v-if="article.url"
                  class="resource-action"
                  :href="article.url"
                  target="_blank"
                  rel="noopener noreferrer"
                >阅读 <span aria-hidden="true">↗</span></a>
                <span v-else class="resource-action is-disabled" aria-disabled="true">待补充</span>
              </article>
            </div>
          </section>

          <section id="video" class="resource-section resource-anchor" aria-labelledby="video-title">
            <header class="resource-section-heading">
              <div>
                <p class="resource-section-index">02 / Moving Image</p>
                <h2 id="video-title">视频</h2>
              </div>
              <div class="resource-section-heading-actions">
                <router-link class="resource-detail-link" to="/resources/videos">进入详细 <span aria-hidden="true">→</span></router-link>
              </div>
            </header>

            <div class="video-grid">
              <article v-for="video in featuredVideos" :key="video.id" class="video-card">
                <div class="video-frame">
                  <video
                    v-if="video.sourceType === 'local' && video.src"
                    controls
                    preload="metadata"
                    :poster="video.poster"
                    :aria-label="video.title"
                  >
                    <source :src="video.src" />
                  </video>
                  <iframe
                    v-else-if="video.sourceType === 'external' && video.embedUrl"
                    :src="video.embedUrl"
                    :title="video.title"
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                  ></iframe>
                  <div v-else class="video-placeholder">
                    <img :src="video.poster" :alt="`${video.title} 海报`" width="960" height="540" loading="lazy" />
                    <span class="video-placeholder-label">视频待补充</span>
                  </div>
                </div>
                <div class="video-copy">
                  <div>
                    <p class="video-kicker">{{ video.duration }} · {{ sourceTypeLabels[video.sourceType] }}</p>
                    <h3>{{ video.title }}</h3>
                    <p class="video-title-en">{{ video.titleEn }}</p>
                  </div>
                  <p>{{ video.summary }}</p>
                  <a
                    v-if="video.fallbackUrl"
                    class="resource-text-link"
                    :href="video.fallbackUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >打开备用链接 <span aria-hidden="true">↗</span></a>
                  <span v-else class="resource-text-link is-disabled" aria-disabled="true">备用链接待补充</span>
                </div>
              </article>
            </div>
          </section>

          <section id="website" class="resource-section resource-anchor" aria-labelledby="website-title">
            <header class="resource-section-heading">
              <div>
                <p class="resource-section-index">03 / Web</p>
                <h2 id="website-title">网页</h2>
              </div>
              <div class="resource-section-heading-actions">
                <router-link class="resource-detail-link" to="/resources/websites">进入详细 <span aria-hidden="true">→</span></router-link>
              </div>
            </header>

            <div class="web-resource-grid">
              <WebResourceCard v-for="(resource, index) in featuredWebsites" :key="resource.id" :resource="resource" :index="index">
                <template #tags>
                  <span v-for="tag in resource.tags" :key="tag" class="resource-tag">{{ tag }}</span>
                </template>
              </WebResourceCard>
            </div>
          </section>

          <section id="tool" class="resource-section resource-anchor" aria-labelledby="tool-title">
            <header class="resource-section-heading">
              <div>
                <p class="resource-section-index">04 / Toolkit</p>
                <h2 id="tool-title">工具</h2>
              </div>
              <div class="resource-section-heading-actions">
                <router-link class="resource-detail-link" to="/resources/tools">进入详细 <span aria-hidden="true">→</span></router-link>
              </div>
            </header>

            <div class="tool-grid">
              <article v-for="tool in featuredTools" :key="tool.id" class="tool-card">
                <div class="tool-card-frame">
                  <img :src="tool.image" :alt="tool.alt" width="960" height="640" loading="lazy" />
                </div>
                <div class="tool-card-copy">
                  <div class="tool-card-heading">
                    <div>
                      <p class="tool-card-kicker">{{ tool.platform }}</p>
                      <h3>{{ tool.title }}</h3>
                    </div>
                    <span class="tool-card-format">{{ tool.format }}</span>
                  </div>
                  <p>{{ tool.summary }}</p>
                  <a
                    v-if="tool.downloadUrl"
                    class="resource-action resource-action-button"
                    :href="tool.downloadUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >下载 <span aria-hidden="true">↗</span></a>
                  <button v-else class="resource-action resource-action-button is-disabled" type="button" disabled>待开放</button>
                </div>
              </article>
            </div>
          </section>
        </div>
      </main>
    </div>

  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import HomeEdgeNav from '../components/navigation/HomeEdgeNav.vue'
import HomeSiteNav from '../components/navigation/HomeSiteNav.vue'
import WebResourceCard from '../components/resources/WebResourceCard.vue'
import {
  getFeaturedResources,
  resourceArticles,
  resourceWebsites,
  resourceTools,
  resourceVideos,
} from '../data/resources.js'

const landingNavItems = [
  { id: 'resources-overview', label: '总览' },
  { id: 'article', label: '文章' },
  { id: 'video', label: '视频' },
  { id: 'website', label: '网页' },
  { id: 'tool', label: '工具' },
]

const sourceTypeLabels = {
  local: '本地视频',
  external: '外部嵌入',
}

const activeSection = ref('resources-overview')
let sectionObserver

const featuredArticles = computed(() => getFeaturedResources(resourceArticles))
const featuredVideos = computed(() => getFeaturedResources(resourceVideos))
const featuredWebsites = computed(() => getFeaturedResources(resourceWebsites))
const featuredTools = computed(() => getFeaturedResources(resourceTools))

const navigateToSection = async (sectionId) => {
  activeSection.value = sectionId
  await nextTick()
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  const sections = landingNavItems
    .map((item) => document.getElementById(item.id))
    .filter(Boolean)

  sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
    if (visible[0]) activeSection.value = visible[0].target.id
  }, { rootMargin: '-16% 0px -62% 0px', threshold: [0, 0.2, 0.6] })

  sections.forEach((section) => sectionObserver.observe(section))
})

onBeforeUnmount(() => {
  sectionObserver?.disconnect()
})
</script>

<style scoped>
.resources-page {
  --resources-ink: var(--home-ink);
  --resources-muted: var(--home-muted);
  --resources-rule: var(--home-rule);
  min-height: 100vh;
  background: var(--home-paper);
  color: var(--resources-ink);
}

.resources-main {
  min-width: 0;
  width: 100%;
  margin: 0;
  padding: clamp(1.5rem, 3vw, 2.75rem) clamp(3.5rem, 4vw, 4.5rem) clamp(5rem, 10vw, 9rem);
}

.resources-main > .site-nav {
  margin-bottom: clamp(3.5rem, 8vw, 7rem);
}

.resource-anchor {
  scroll-margin-top: clamp(2rem, 9vh, 7rem);
}

.resources-intro {
  padding-bottom: clamp(3.5rem, 7vw, 6rem);
}

.resources-intro-grid {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(15rem, 5fr);
  gap: clamp(2.5rem, 7vw, 8rem);
  align-items: end;
  margin-top: 1rem;
}

.resources-eyebrow,
.resource-section-index,
.video-kicker,
.tool-card-kicker {
  color: var(--resources-muted);
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.resources-intro h1 {
  max-width: 5.5em;
  color: var(--resources-ink);
  font-size: clamp(4.5rem, 11vw, 10.5rem);
  line-height: 1.02;
  letter-spacing: -0.07em;
}

.resources-intro-copy {
  max-width: 32rem;
}

.resources-intro-copy > p:first-child {
  font-size: clamp(1.05rem, 1.45vw, 1.3rem);
  line-height: 1.75;
}

.resources-intro-note {
  margin-top: 1.5rem;
  color: var(--resources-muted);
  font-size: 0.78rem;
  line-height: 1.6;
}

.resources-sections {
  display: grid;
  padding-top: clamp(2rem, 4vw, 3.5rem);
  gap: clamp(4rem, 8vw, 8rem);
}

.resource-section-heading {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(12rem, 3fr);
  gap: clamp(2rem, 6vw, 7rem);
  align-items: end;
  padding: clamp(2rem, 4vw, 3.5rem) 0 1.25rem;
  border-bottom: 1px solid var(--resources-ink);
}

.resource-section-heading h2 {
  margin-top: 0.4rem;
  font-size: clamp(2.6rem, 5vw, 5.5rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.resource-section-heading-actions {
  display: grid;
  justify-items: end;
  align-self: end;
}

.resource-detail-link {
  display: inline-flex;
  align-items: flex-end;
  gap: 0.35rem;
  min-height: 44px;
  padding: 0;
  color: var(--resources-ink);
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
}

.resource-detail-link:hover,
.resource-detail-link:focus-visible {
  color: var(--accent-orange);
}

.article-list {
  display: grid;
}

.article-row {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr) auto;
  gap: 1.25rem;
  align-items: start;
  padding: 1.4rem 0;
  border-bottom: 1px solid var(--resources-rule);
}

.article-index {
  color: var(--resources-muted);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.08em;
}

.article-title-line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.7rem 1rem;
}

.article-title-line h3 {
  font-size: clamp(1.15rem, 2vw, 1.55rem);
  line-height: 1.3;
}

.article-title-en {
  color: var(--resources-muted);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.article-summary {
  max-width: 52rem;
  margin-top: 0.55rem;
  color: var(--resources-muted);
  font-size: 0.9rem;
  line-height: 1.7;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  align-items: center;
  margin-top: 0.8rem;
  color: var(--resources-muted);
  font-size: 0.72rem;
  line-height: 1.4;
}

.resource-tag {
  display: inline-flex;
  align-items: center;
  min-height: 1.4rem;
  padding: 0.12rem 0.42rem;
  border: 1px solid var(--resources-rule);
  color: var(--resources-muted);
  font-size: 0.68rem;
  line-height: 1.2;
}

.resource-action,
.resource-text-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 44px;
  color: var(--resources-ink);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.2;
  text-decoration: none;
  white-space: nowrap;
}

.resource-action:not(.is-disabled):hover,
.resource-action:not(.is-disabled):focus-visible,
.resource-text-link:not(.is-disabled):hover,
.resource-text-link:not(.is-disabled):focus-visible {
  color: var(--accent-orange);
}

.resource-action.is-disabled,
.resource-text-link.is-disabled {
  color: var(--resources-muted);
  cursor: not-allowed;
  opacity: 0.65;
}

.video-grid,
.tool-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1.25rem, 3vw, 2.5rem);
  padding-top: 1.5rem;
}

.video-card,
.tool-card {
  min-width: 0;
  border: 1px solid var(--resources-ink);
}

.video-frame,
.tool-card-frame {
  position: relative;
  overflow: hidden;
  background: #f2f2ee;
  aspect-ratio: 16 / 9;
}

.video-frame video,
.video-frame iframe,
.video-placeholder,
.video-placeholder img {
  display: block;
  width: 100%;
  height: 100%;
}

.video-frame video,
.video-frame iframe {
  border: 0;
  object-fit: cover;
}

.video-placeholder {
  position: relative;
}

.video-placeholder img {
  object-fit: cover;
  filter: grayscale(1);
  opacity: 0.72;
}

.video-placeholder-label {
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  padding: 0.38rem 0.55rem;
  color: var(--resources-ink);
  background: var(--home-yellow);
  font-size: 0.72rem;
  font-weight: 700;
}

.video-copy,
.tool-card-copy {
  display: grid;
  gap: 1rem;
  padding: 1.1rem 1.15rem 1.25rem;
}

.video-copy h3,
.tool-card-heading h3 {
  margin-top: 0.45rem;
  font-size: clamp(1.05rem, 1.7vw, 1.35rem);
  line-height: 1.35;
}

.video-title-en {
  margin-top: 0.25rem;
  color: var(--resources-muted);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.video-copy > p:last-of-type,
.tool-card-copy > p {
  color: var(--resources-muted);
  font-size: 0.84rem;
  line-height: 1.65;
}

.web-resource-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(1.25rem, 3vw, 2.5rem);
  padding-top: clamp(2rem, 4vw, 3.5rem);
}

.tool-card-frame {
  aspect-ratio: 3 / 2;
}

.tool-card-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tool-card-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: start;
}

.tool-card-format {
  flex: 0 0 auto;
  color: var(--resources-muted);
  font-size: 0.68rem;
  line-height: 1.3;
  text-align: right;
}

.resource-action-button {
  justify-content: center;
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--resources-ink);
  background: transparent;
  cursor: pointer;
}

.resource-action-button:not(.is-disabled):hover,
.resource-action-button:not(.is-disabled):focus-visible {
  color: var(--home-paper);
  background: var(--resources-ink);
}

.resource-action-button.is-disabled {
  border-color: var(--resources-rule);
  background: transparent;
}

@media (max-width: 1023px) {
  .resources-main {
    width: 100%;
  }

  .web-resource-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .resources-main {
    width: 100%;
    padding: 1rem 1rem 5rem;
  }

  .resources-main > .site-nav {
    margin-bottom: 3.5rem;
  }

  .resources-intro-grid,
  .resource-section-heading {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .resources-intro h1 {
    font-size: clamp(4.1rem, 20vw, 6.5rem);
  }

  .resources-intro-copy {
    padding-bottom: 0;
  }

  .resource-section-heading {
    align-items: start;
  }

  .resource-section-heading-actions {
    align-self: end;
    justify-items: end;
  }

  .resource-section-heading h2 {
    font-size: clamp(2.8rem, 15vw, 5rem);
  }

  .article-row {
    grid-template-columns: 2rem minmax(0, 1fr);
    gap: 0.7rem;
  }

  .article-row > .resource-action {
    grid-column: 2;
    justify-self: start;
    min-height: 40px;
  }

  .video-grid,
  .tool-grid {
    grid-template-columns: 1fr;
  }

  .web-resource-grid {
    grid-template-columns: 1fr;
  }

}

@media (prefers-reduced-motion: reduce) {
  .resource-action,
  .resource-text-link {
    transition: none;
  }
}
</style>
