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
              <template v-for="(name, index) in group.names" :key="name">
                <br v-if="index" />{{ name }}
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
import HomeSiteNav from '../navigation/HomeSiteNav.vue'

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
