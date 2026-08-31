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
              <ArticleRow
                v-for="(article, index) in featuredArticles"
                :key="article.id"
                :article="article"
                :index="index"
              />
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
              <VideoCard
                v-for="video in featuredVideos"
                :key="video.id"
                :video="video"
                :source-type-labels="sourceTypeLabels"
              />
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
              <ToolCard
                v-for="tool in featuredTools"
                :key="tool.id"
                :tool="tool"
              />
            </div>
          </section>
        </div>
      </main>
    </div>
    <ResourceSubmitButton />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import HomeEdgeNav from '../components/navigation/HomeEdgeNav.vue'
import HomeSiteNav from '../components/navigation/HomeSiteNav.vue'
import ArticleRow from '../components/resources/ArticleRow.vue'
import ToolCard from '../components/resources/ToolCard.vue'
import VideoCard from '../components/resources/VideoCard.vue'
import WebResourceCard from '../components/resources/WebResourceCard.vue'
import ResourceSubmitButton from '../components/resources/ResourceSubmitButton.vue'
import { usePublishedResources } from '../composables/usePublishedResources.js'
import {
  getFeaturedResources,
  resourceArticles,
  resourceWebsites,
  resourceTools,
  resourceVideos,
} from '../data/resources/index.js'

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

const { initialize: initializePublishedResources, byType } = usePublishedResources()
const mergedArticles = byType('article', resourceArticles)
const mergedVideos = byType('video', resourceVideos)
const mergedWebsites = byType('website', resourceWebsites)
const mergedTools = byType('tool', resourceTools)
const featuredArticles = computed(() => getFeaturedResources(mergedArticles.value))
const featuredVideos = computed(() => getFeaturedResources(mergedVideos.value))
const featuredWebsites = computed(() => getFeaturedResources(mergedWebsites.value))
const featuredTools = computed(() => getFeaturedResources(mergedTools.value))

const navigateToSection = async (sectionId) => {
  activeSection.value = sectionId
  await nextTick()
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  initializePublishedResources()
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
.resource-section-index {
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
  gap: 0.4rem;
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

.video-grid,
.tool-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(1.25rem, 3vw, 2.5rem);
  padding-top: 1.5rem;
}

.web-resource-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(1.25rem, 3vw, 2.5rem);
  padding-top: clamp(2rem, 4vw, 3.5rem);
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

@media (max-width: 1023px) {
  .resources-main {
    width: 100%;
  }

  .video-grid,
  .tool-grid,
  .web-resource-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .resources-main {
    width: 100%;
    padding: 2.5rem 1rem 5rem;
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

  .video-grid,
  .tool-grid {
    grid-template-columns: 1fr;
  }

  .web-resource-grid {
    grid-template-columns: 1fr;
  }
}

</style>
