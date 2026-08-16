<template>
  <section
    id="course-rules"
    class="home-section rules-section"
    data-section
    aria-labelledby="rules-title"
  >
    <div class="section-grid rules-header-grid">
      <div class="section-title-column">
        <p class="eyebrow">Course Protocol</p>
        <h2 id="rules-title">课程<br />规则</h2>
      </div>
      <div class="section-copy-column">
        <p class="lead-copy">
          课程以一个兼具观念容量与空间类型性的“词”为入口，完成从内容研究到展览落地的整体策划。
        </p>
        <router-link class="text-link rules-cta" to="/syllabus" aria-label="查看完整课程大纲">
          <svg class="rules-cta-arrow" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="29" />
            <path d="M16 32h30m0 0L32 18m14 14L32 46" />
          </svg>
          <span>完整课程大纲</span>
        </router-link>
      </div>
    </div>

    <div class="section-grid rules-body-grid">
      <div class="method-panel">
        <span class="panel-label">策展方法 / METHOD</span>
        <ol class="method-list">
          <li v-for="(step, index) in methodSteps" :key="step">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>{{ step }}
          </li>
        </ol>
        <p class="micro-copy">从内容数据库、策展逻辑到公共展览，判断力贯穿每一步。</p>
      </div>

      <div class="rules-detail">
        <dl class="rules-facts">
          <div>
            <dt>工作方式</dt>
            <dd class="rules-work-mode">
              <strong>小组为单位</strong>
              <span>每组 2–3 人，共计约 20 组</span>
              <span>每组从选题库中选定一个“词”作为内容对象，</span>
              <span>它同时就是展览的内容主题。</span>
            </dd>
          </div>
          <div>
            <dt>核心产出</dt>
            <dd class="rules-output">
              <strong>1 个完整展览</strong>
              <span>① 内容网站原型上线</span>
              <span>② 正式策展提案文本</span>
              <span>③ 展览设计方案初步提案与中期汇报</span>
              <span>④ 视觉系统与公共教育活动方案深化文本</span>
              <span>⑤ 展览总体商业计划书</span>
            </dd>
          </div>
        </dl>

        <div class="grading-summary">
          <span class="panel-label">评分摘要 / EVALUATION</span>
          <div class="grading-chart">
            <div class="grading-legend">
              <button
                v-for="(item, index) in gradingOverview"
                :key="item.item"
                type="button"
                class="grading-legend-item"
                :class="{
                  'is-active': activeGradingIndex === index,
                  'is-muted': activeGradingIndex !== null && activeGradingIndex !== index,
                }"
                :aria-pressed="activeGradingIndex === index"
                @mouseenter="setActiveGrading(index)"
                @mouseleave="clearActiveGrading"
                @focus="setActiveGrading(index)"
                @blur="clearActiveGrading"
              >
                <span
                  class="grading-swatch"
                  aria-hidden="true"
                  :style="{ backgroundColor: gradingPalette[index] }"
                ></span>
                <span class="grading-legend-label">{{ item.item }}</span>
                <strong>{{ item.weight }}</strong>
              </button>
            </div>
            <div
              class="grading-donut"
              role="img"
              :aria-label="gradingAriaLabel"
            >
              <svg class="grading-donut-svg" viewBox="0 0 100 100" aria-hidden="true">
                <circle class="grading-donut-track" cx="50" cy="50" r="42" />
                <circle
                  v-for="segment in gradingSegments"
                  :key="segment.index"
                  class="grading-segment"
                  :class="{
                    'is-active': activeGradingIndex === segment.index,
                    'is-muted': activeGradingIndex !== null && activeGradingIndex !== segment.index,
                  }"
                  :cx="50"
                  :cy="50"
                  :r="42"
                  :stroke="segment.color"
                  :stroke-dasharray="segment.dasharray"
                  :stroke-dashoffset="segment.dashoffset"
                  tabindex="0"
                  role="button"
                  :aria-label="`${segment.item}${segment.weight}`"
                  @mouseenter="setActiveGrading(segment.index)"
                  @mouseleave="clearActiveGrading"
                  @click="setActiveGrading(segment.index)"
                  @focus="setActiveGrading(segment.index)"
                  @blur="clearActiveGrading"
                  @keydown.enter.prevent="setActiveGrading(segment.index)"
                  @keydown.space.prevent="setActiveGrading(segment.index)"
                />
              </svg>
              <span class="grading-donut-hole"><span>100<small>%</small></span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { gradingOverview } from '../../data/home.js'

const methodSteps = ['选题', '建库', '结构', '网站', '展具', '视觉', '事件', '商业']
const gradingPalette = [
  'var(--home-blue)',
  'var(--home-yellow)',
  'var(--home-orange)',
  'var(--home-green)',
  'var(--home-magenta)',
  'var(--home-ink)',
]

const gradingCircumference = 2 * Math.PI * 42
const activeGradingIndex = ref(null)

const gradingSegments = computed(() => {
  let cursor = 0
  return gradingOverview.map((item, index) => {
    const value = Number.parseInt(item.weight, 10)
    const length = gradingCircumference * value / 100
    const segment = {
      index,
      item: item.item,
      weight: item.weight,
      color: gradingPalette[index],
      dasharray: `${length} ${gradingCircumference}`,
      dashoffset: -cursor,
    }
    cursor += length
    return segment
  })
})

const setActiveGrading = (index) => {
  activeGradingIndex.value = index
}

const clearActiveGrading = () => {
  activeGradingIndex.value = null
}

const gradingAriaLabel = computed(() => (
  `评分构成：${gradingOverview.map((item) => `${item.item}${item.weight}`).join('、')}`
))
</script>
