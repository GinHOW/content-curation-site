<template>
  <div id="top" class="works-page home-page">
    <a class="skip-link" href="#works-archive">跳转到成果目录</a>

    <main id="works-content" class="works-main">
      <HomeSiteNav />

      <header class="works-intro">
        <p class="works-eyebrow">Selected Outcomes · Course Archive</p>
        <div class="works-intro-grid">
          <h1>成果<br />展示</h1>
          <div class="works-intro-copy">
            <p>以项目为单位归档课程成果。从物件研究、叙事结构到展示设计，查看每一次策展实践如何被组织与呈现。</p>
            <p class="works-intro-note">移动至任一目录列以预览；点击进入完整项目。</p>
          </div>
        </div>
      </header>

      <section id="works-archive" class="works-archive" aria-labelledby="works-archive-title">
        <div class="archive-heading">
          <div>
            <p class="archive-kicker">Course outcomes / by year</p>
            <h2 id="works-archive-title">项目目录</h2>
          </div>
          <p class="archive-count" aria-live="polite">{{ outcomes.length }} 项</p>
        </div>

        <div class="year-tabs" role="tablist" aria-label="选择成果年份">
          <button
            v-for="year in outcomeYears"
            :id="`year-tab-${year.id}`"
            :key="year.id"
            class="year-tab"
            :class="{ 'is-active': activeYear === year.id }"
            type="button"
            role="tab"
            :aria-selected="activeYear === year.id"
            :aria-controls="`year-panel-${year.id}`"
            @click="selectYear(year.id)"
          >
            <span>{{ year.label }}</span>
            <small>{{ year.note }}</small>
          </button>
        </div>

        <section
          :id="`year-panel-${activeYear}`"
          class="archive-panel-wrap"
          role="tabpanel"
          :aria-labelledby="`year-tab-${activeYear}`"
        >
          <div v-if="outcomes.length" class="archive-strip">
            <article
              v-for="(outcome, index) in outcomes"
              :key="`${activeYear}-${outcome.id}`"
              class="archive-item"
              :class="{ 'is-active': activeIndex === index }"
            >
              <component
                :is="outcome.detailType === 'work' ? RouterLink : 'button'"
                v-bind="outcome.detailType === 'work' ? { to: `/works/${outcome.id}` } : { type: 'button' }"
                class="archive-item-control"
                :aria-label="`查看 ${outcome.title}：${outcome.authors.join('、') || '项目详情'}`"
                :aria-expanded="activeIndex === index"
                @focus="activate(index)"
                @pointerenter="activateFromPointer(index, $event)"
                @click="openOutcome(outcome)"
              >
                <span class="archive-rail" aria-hidden="true">
                  <span class="archive-number">{{ outcome.number }}</span>
                  <span class="archive-marker">{{ outcome.marker }}</span>
                </span>

                <span class="archive-compact" aria-hidden="true">
                  <strong>{{ outcome.title }}</strong>
                  <small>{{ outcome.topic }}</small>
                </span>

                <span class="archive-expanded">
                  <span class="archive-copy">
                    <span class="archive-meta">{{ outcome.number }} · {{ outcome.topic }}</span>
                    <strong class="archive-title">{{ outcome.title }}</strong>
                    <small v-if="outcome.titleEn" class="archive-title-en">{{ outcome.titleEn }}</small>
                    <span class="archive-authors">{{ outcome.authors.join(' / ') }}</span>
                    <span class="archive-summary">{{ outcome.summary }}</span>
                    <span class="archive-entry">查看完整项目 <span aria-hidden="true">→</span></span>
                  </span>
                  <span v-if="outcome.preview" class="archive-preview">
                    <img
                      :src="outcome.preview"
                      :alt="outcome.previewAlt"
                      width="720"
                      height="960"
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                </span>
              </component>
            </article>
          </div>

          <div v-else class="archive-empty-state">
            <p class="archive-empty-index">{{ activeYear }} / pending</p>
            <h3>成果归档中</h3>
            <p>本届学生作品将在课程后期发布，届时将以同一目录方式呈现。</p>
            <button type="button" class="archive-empty-link" @click="selectYear('2025')">浏览 2025 项目 →</button>
          </div>
        </section>
      </section>
    </main>
  </div>

  <ExhibitionDetail :exhibition-id="activeExhibition" @close="activeExhibition = null" />
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import HomeSiteNav from '../components/home/HomeSiteNav.vue'
import ExhibitionDetail from './ExhibitionDetail.vue'
import { getOutcomesForYear, outcomeYears } from '../data/outcomes.js'

const route = useRoute()
const router = useRouter()
const activeYear = ref('2025')
const activeIndex = ref(0)
const activeExhibition = ref(null)
const validYears = outcomeYears.map((year) => year.id)

const outcomes = computed(() => getOutcomesForYear(activeYear.value))

const normalizedYear = (value) => {
  const year = Array.isArray(value) ? value[0] : value
  return validYears.includes(year) ? year : '2025'
}

const selectYear = (year) => {
  const nextYear = normalizedYear(year)
  activeYear.value = nextYear
  activeIndex.value = 0

  router.replace({
    query: {
      ...route.query,
      year: nextYear,
    },
  })
}

const activate = (index) => {
  activeIndex.value = index
}

const activateFromPointer = (index, event) => {
  if (event.pointerType === 'mouse') activate(index)
}

const openOutcome = (outcome) => {
  if (outcome.detailType === 'exhibition') activeExhibition.value = outcome.id
}

watch(
  () => route.query.year,
  (year) => {
    const normalized = normalizedYear(year)
    const changed = activeYear.value !== normalized

    activeYear.value = normalized
    if (changed) activeIndex.value = 0

    if (year !== normalized) {
      router.replace({
        query: {
          ...route.query,
          year: normalized,
        },
      })
    }
  },
  { immediate: true },
)
</script>


<style scoped>
.works-page {
  --works-ink: var(--ink);
  --works-rule: var(--rule);
  --works-accent: var(--accent-orange);
  min-height: 100vh;
  color: var(--works-ink);
  background: var(--paper);
}

.works-main {
  width: min(100% - clamp(2rem, 8vw, 8rem), 100rem);
  margin: 0 auto;
  padding: clamp(1.5rem, 3vw, 2.75rem) 0 clamp(4rem, 9vw, 8rem);
}

.works-main > .site-nav {
  margin-bottom: clamp(3.5rem, 8vw, 7rem);
}

.works-intro {
  padding-bottom: clamp(3rem, 7vw, 6rem);
  border-bottom: 1px solid var(--works-ink);
}

.works-eyebrow,
.archive-kicker,
.archive-meta,
.archive-empty-index {
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.works-eyebrow,
.archive-kicker {
  color: var(--muted);
}

.works-intro-grid {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(15rem, 5fr);
  gap: clamp(2.5rem, 7vw, 8rem);
  align-items: end;
  margin-top: 1rem;
}

.works-intro h1 {
  max-width: 6em;
  color: var(--works-ink);
  font-size: clamp(4.5rem, 11vw, 10.5rem);
  line-height: 1.02;
  letter-spacing: -0.07em;
  text-transform: none;
}

.works-intro-copy {
  max-width: 33rem;
  padding-bottom: 0.35rem;
}

.works-intro-copy p {
  margin: 0;
  font-size: clamp(1rem, 1.45vw, 1.18rem);
  line-height: 1.8;
}

.works-intro-copy .works-intro-note {
  margin-top: 1.25rem;
  color: var(--muted);
  font-size: 0.78rem;
  letter-spacing: 0.05em;
}

.works-archive {
  padding-top: clamp(2.25rem, 5vw, 4.5rem);
}

.archive-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: end;
}

.archive-heading h2 {
  margin-top: 0.35rem;
  color: var(--works-ink);
  font-size: clamp(2rem, 4.4vw, 4rem);
  text-transform: none;
}

.archive-count {
  margin: 0;
  color: var(--muted);
  font-size: 0.74rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.09em;
}

.year-tabs {
  display: flex;
  gap: 0;
  margin-top: clamp(2rem, 4vw, 3.5rem);
  border-bottom: 1px solid var(--works-ink);
}

.year-tab {
  display: inline-flex;
  min-width: max(9rem, 20%);
  min-height: 52px;
  flex-direction: column;
  justify-content: center;
  gap: 0.08rem;
  padding: 0.6rem 1rem;
  border: 0;
  border-right: 1px solid var(--works-rule);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-family: var(--font-body);
  text-align: left;
  transition: color 200ms ease, background-color 200ms ease;
}

.year-tab:first-child {
  border-left: 1px solid var(--works-rule);
}

.year-tab span {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1;
}

.year-tab small {
  font-size: 0.62rem;
  letter-spacing: 0.05em;
}

.year-tab:hover,
.year-tab.is-active {
  color: var(--works-ink);
}

.year-tab.is-active {
  box-shadow: inset 0 -4px 0 var(--works-accent);
}

.year-tab:focus-visible,
.archive-item-control:focus-visible,
.archive-empty-link:focus-visible {
  position: relative;
  z-index: 2;
  outline: 3px solid var(--accent-blue);
  outline-offset: -3px;
}

.archive-panel-wrap {
  padding-top: clamp(1.5rem, 3vw, 2.5rem);
}

.archive-strip {
  display: flex;
  height: min(43rem, 68dvh);
  min-height: 32rem;
  overflow: hidden;
  border: 1px solid var(--works-ink);
  background: var(--paper-white);
}

.archive-item {
  min-width: 0;
  flex: 1 1 0;
  border-right: 1px solid var(--works-ink);
  transition: flex-grow 220ms ease-out;
}

.archive-item:last-child {
  border-right: 0;
}

.archive-item.is-active {
  flex-grow: 6;
}

.archive-item-control {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  border: 0;
  background: var(--paper-white);
  color: var(--works-ink);
  cursor: pointer;
  font: inherit;
  text-align: left;
  text-decoration: none;
  touch-action: manipulation;
}

.archive-item-control::after {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 3px;
  background: var(--works-accent);
  content: '';
  opacity: 0;
  transition: opacity 180ms ease;
}

.archive-item.is-active .archive-item-control::after,
.archive-item-control:hover::after {
  opacity: 1;
}

.archive-rail {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  display: flex;
  width: 2.8rem;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.85rem 0.7rem;
  border-right: 1px solid var(--works-rule);
  background: var(--paper-white);
}

.archive-number,
.archive-marker {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.archive-marker {
  color: var(--works-accent);
}

.archive-compact {
  position: absolute;
  top: 3.25rem;
  right: 0.65rem;
  bottom: 0.8rem;
  left: 0.65rem;
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  flex-direction: column;
  justify-content: flex-end;
  padding-left: 2.75rem;
  opacity: 1;
  transition: opacity 140ms ease;
  writing-mode: vertical-rl;
}

.archive-compact strong {
  font-size: clamp(0.8rem, 1.25vw, 1.05rem);
  line-height: 1.2;
}

.archive-compact small {
  color: var(--muted);
  font-size: 0.62rem;
  letter-spacing: 0.06em;
}

.archive-expanded {
  position: relative;
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: minmax(0, 0.98fr) minmax(8rem, 1.02fr);
  gap: clamp(1rem, 2vw, 2rem);
  padding: clamp(1.5rem, 3vw, 2.5rem) clamp(1.25rem, 3vw, 2.75rem) clamp(1.25rem, 2.5vw, 2.25rem) 4.2rem;
  opacity: 0;
  pointer-events: none;
  transform: translateX(0.75rem);
  transition: opacity 170ms ease-out, transform 220ms ease-out;
  visibility: hidden;
}

.archive-item.is-active .archive-compact {
  opacity: 0;
}

.archive-item.is-active .archive-expanded {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
  visibility: visible;
}

.archive-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: flex-end;
}

.archive-meta {
  color: var(--works-accent);
}

.archive-title {
  display: block;
  margin-top: 0.55rem;
  font-size: clamp(1.8rem, 3.2vw, 3.4rem);
  line-height: 1.02;
  letter-spacing: -0.04em;
}

.archive-title-en {
  display: block;
  margin-top: 0.5rem;
  color: var(--muted);
  font-size: 0.63rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.archive-authors {
  display: block;
  margin-top: 1.25rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.archive-summary {
  display: -webkit-box;
  margin-top: 1rem;
  overflow: hidden;
  color: #424242;
  font-size: clamp(0.82rem, 1.1vw, 0.94rem);
  line-height: 1.7;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
}

.archive-entry {
  display: block;
  margin-top: 1.25rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.archive-entry span {
  color: var(--works-accent);
  font-size: 1rem;
}

.archive-preview {
  align-self: stretch;
  min-width: 0;
  overflow: hidden;
  background: #f2f2ef;
}

.archive-preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.archive-empty-state {
  display: grid;
  min-height: clamp(22rem, 50dvh, 34rem);
  place-content: center;
  justify-items: start;
  padding: clamp(2rem, 7vw, 6rem);
  border: 1px solid var(--works-ink);
  background: repeating-linear-gradient(135deg, transparent 0, transparent 10px, rgba(17, 17, 17, 0.025) 10px, rgba(17, 17, 17, 0.025) 11px);
}

.archive-empty-index {
  color: var(--works-accent);
}

.archive-empty-state h3 {
  margin-top: 0.75rem;
  font-size: clamp(2rem, 5vw, 4.5rem);
  line-height: 1;
  text-transform: none;
}

.archive-empty-state p:not(.archive-empty-index) {
  max-width: 28rem;
  margin: 1.25rem 0 0;
  color: #424242;
  line-height: 1.75;
}

.archive-empty-link {
  min-height: 44px;
  margin-top: 1.75rem;
  padding: 0.65rem 0;
  border: 0;
  border-bottom: 1px solid var(--works-ink);
  background: transparent;
  color: var(--works-ink);
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.archive-empty-link:hover {
  color: var(--works-accent);
  border-bottom-color: var(--works-accent);
}

@media (max-width: 1023px) {
  .works-main {
    width: min(100% - 3rem, 48rem);
  }

  .works-intro-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .works-intro h1 {
    font-size: clamp(4.5rem, 14vw, 8rem);
  }

  .archive-strip {
    display: grid;
    height: auto;
    min-height: 0;
    grid-template-columns: 1fr;
    overflow: visible;
  }

  .archive-item,
  .archive-item.is-active {
    min-height: 20rem;
    border-right: 0;
    border-bottom: 1px solid var(--works-ink);
  }

  .archive-item:last-child {
    border-bottom: 0;
  }

  .archive-item-control {
    display: grid;
    min-height: 20rem;
    grid-template-columns: minmax(0, 1fr) minmax(12rem, 0.85fr);
  }

  .archive-rail {
    width: 3.1rem;
  }

  .archive-compact {
    display: none;
  }

  .archive-expanded,
  .archive-item.is-active .archive-expanded {
    position: static;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(12rem, 0.85fr);
    grid-column: 1 / -1;
    height: auto;
    min-height: 20rem;
    padding: 2rem 2rem 2rem 4.7rem;
    opacity: 1;
    pointer-events: auto;
    transform: none;
    transition: none;
    visibility: visible;
  }

  .archive-copy {
    justify-content: center;
  }

  .archive-preview {
    min-height: 16rem;
  }
}

@media (max-width: 767px) {
  .works-main {
    width: min(100% - 2rem, 40rem);
    padding-top: 1rem;
  }

  .works-main > .site-nav {
    margin-bottom: 3.5rem;
  }

  .works-intro h1 {
    font-size: clamp(4.1rem, 20vw, 6.5rem);
  }

  .year-tab {
    min-width: 0;
    flex: 1;
    padding-inline: 0.75rem;
  }

  .year-tab small {
    white-space: nowrap;
  }

  .archive-item-control,
  .archive-expanded,
  .archive-item.is-active .archive-expanded {
    grid-template-columns: 1fr;
  }

  .archive-item,
  .archive-item.is-active,
  .archive-item-control,
  .archive-expanded,
  .archive-item.is-active .archive-expanded {
    min-height: 0;
  }

  .archive-expanded,
  .archive-item.is-active .archive-expanded {
    gap: 1.5rem;
    padding: 1.75rem 1.25rem 1.25rem 4rem;
  }

  .archive-rail {
    width: 2.65rem;
    padding: 0.75rem 0.55rem;
  }

  .archive-title {
    font-size: clamp(2rem, 10vw, 3.25rem);
  }

  .archive-summary {
    display: block;
  }

  .archive-preview {
    min-height: 14rem;
    max-height: 22rem;
  }

  .archive-empty-state {
    min-height: 25rem;
    padding: 2rem 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .archive-item,
  .archive-item-control::after,
  .archive-compact,
  .archive-expanded,
  .year-tab {
    transition: none;
  }
}
</style>
