<template>
  <section
    id="overview"
    class="home-section overview-section"
    data-section
    aria-labelledby="overview-title"
  >
    <HomeSiteNav />

    <div class="section-grid overview-grid">
      <div class="section-title-column">
        <p class="eyebrow">Content &amp; Curation</p>
        <h1 id="overview-title">内容<br />与策展</h1>
        <p class="title-note">一门从采集走向呈现的实践课程</p>

        <div class="overview-thesis">
          <p class="thesis-line">展示即情境，<br />策展即叙事。</p>
          <p class="thesis-copy">
            本课程前承视觉传播二年级基础课程，引入主题性、研究性、社会性项目，结合文化研究、话语实践、媒体研究和意识形态批判等“内容”的多种思考维度。作为课程核心的“展示”本身意味着情境的展开、公共性的构建、社群的生产，处理物理空间和意义空间互相作用的张力，亦处理日常“另类”空间和“博物馆”权威空间之间的相互转译。“策展”则以“展示”构造社会叙事，让创造性的生产与动员在此情境中得以筹划和运行。
          </p>
        </div>
      </div>

      <div class="section-copy-column overview-copy">
        <div class="overview-team" aria-label="教学团队">
          <p class="overview-course-heading">
            <span class="overview-course-heading-en">School of Communication &amp; Design 2026</span>
            <span class="overview-course-heading-zh">视觉传播学院 2026 秋季课程</span>
          </p>
          <div v-for="group in team" :key="group.role" class="overview-team-group">
            <p class="overview-team-role">{{ group.role }}</p>
            <p class="overview-team-names">
              <template v-for="(person, index) in group.names" :key="person.label">
                <br v-if="index" />
                <ExternalSitePreview
                  v-if="person.preview"
                  :label="person.label"
                  :preview="person.preview"
                  :is-open="activePreview === person.preview"
                  @open="openPreview(person.preview)"
                  @close="closePreview"
                />
                <template v-else>{{ person.label }}</template>
              </template>
            </p>
          </div>
        </div>

        <dl class="overview-meta" aria-label="课程概览">
          <div v-for="item in meta" :key="item.label" class="overview-meta-item">
            <dt>{{ item.label }}</dt>
            <dd v-if="item.schedule" class="overview-schedule">
              <div v-for="phase in item.schedule" :key="phase.phase" class="overview-schedule-phase">
                <span class="overview-schedule-label">{{ phase.phase }}</span>
                <span>{{ phase.dates }}</span>
                <span>{{ phase.days }}</span>
              </div>
              <span class="overview-meta-note">{{ item.note }}</span>
            </dd>
            <dd v-else>
              <span v-for="value in item.values" :key="value">{{ value }}</span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import ExternalSitePreview from '../common/ExternalSitePreview.vue'
import HomeSiteNav from '../navigation/HomeSiteNav.vue'

const activePreview = shallowRef(null)

const openPreview = (preview) => {
  activePreview.value = preview
}

const closePreview = () => {
  activePreview.value = null
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') closePreview()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))

defineProps({
  team: {
    type: Array,
    required: true,
  },
  meta: {
    type: Array,
    required: true,
  },
})
</script>

<style scoped>
:global(.home-page .overview-grid) {
  padding-top: var(--page-nav-intro-gap);
}

.overview-copy {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
}

.overview-thesis {
  max-width: 34rem;
  margin-top: clamp(3rem, 5vw, 5rem);
}

.overview-thesis .thesis-line {
  font-family: var(--font-heavy);
  font-size: clamp(1.45rem, 2.3vw, 2.2rem);
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0.02em;
  text-wrap: balance;
}

.overview-thesis .thesis-copy {
  margin-top: 1.5rem;
  color: var(--home-ink);
  font-family: var(--font-body);
  font-size: clamp(0.95rem, 1.2vw, 1.08rem);
  line-height: 1.85;
  line-break: strict;
  text-wrap: pretty;
}

.overview-thesis em {
  font-style: italic;
}

.overview-team {
  display: grid;
  gap: 1.35rem;
}

.overview-course-heading {
  margin: 0 0 0.35rem;
  padding-bottom: clamp(2.5rem, 4vw, 4rem);
  font-family: var(--font-body);
  font-size: clamp(1.05rem, 1.55vw, 1.3rem);
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: 0.02em;
}

.overview-course-heading-en,
.overview-course-heading-zh {
  display: block;
}

.overview-course-heading-en {
  margin-bottom: 0.35rem;
  color: var(--home-muted);
  font-size: 0.68rem;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.overview-team-group {
  min-width: 0;
}

.overview-team-role {
  margin: 0 0 0.35rem;
  color: var(--home-muted);
  font-family: var(--font-body);
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: 0.06em;
}

.overview-team-names {
  margin: 0;
  font-family: var(--font-body);
  font-size: clamp(0.95rem, 1.25vw, 1.12rem);
  font-weight: 500;
  line-height: 1.65;
}

.overview-meta {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0;
  border-top: 1px solid var(--home-rule);
}

.overview-team + .overview-meta {
  margin-top: clamp(2rem, 4vw, 4rem);
}

.overview-meta-item {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.4fr);
  gap: 1rem;
  min-width: 0;
  padding: 1rem 0 1.25rem;
  border-bottom: 1px solid var(--home-rule);
}

.overview-meta dt {
  color: var(--home-muted);
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: 0.05em;
}

.overview-meta dd {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin: 0;
  font-family: var(--font-body);
  font-size: clamp(0.95rem, 1.35vw, 1.2rem);
  font-weight: 600;
  line-height: 1.4;
}

.overview-schedule {
  gap: 0.7rem;
  font-size: clamp(0.9rem, 1.2vw, 1.05rem);
  line-height: 1.45;
}

.overview-schedule-phase {
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
}

.overview-schedule-label {
  color: var(--home-muted);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.04em;
}

.overview-meta-note {
  color: var(--home-muted);
  font-size: 0.76rem;
  font-weight: 400;
  line-height: 1.5;
}

@media (max-width: 767px) {
  .overview-meta {
    width: 100%;
  }

  .overview-team + .overview-meta {
    margin-top: 1.5rem;
  }

  .overview-course-heading {
    padding-bottom: 1.5rem;
  }

  .overview-meta-item {
    grid-template-columns: 1fr;
    gap: 0.45rem;
  }
}
</style>
