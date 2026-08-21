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
              <span>每组 2–3 人，共计 16 组</span>
              <span>每组从选题库中选定一个“词”作为内容对象，</span>
              <span>它同时就是展览的内容主题。</span>
            </dd>
          </div>
          <div>
            <dt>核心产出</dt>
            <dd class="rules-output">
              <strong>1 个完整展览</strong>
              <span>① 内容数据库与展览内容网站原型</span>
              <span>② 正式策展提案</span>
              <span>③ 中期整合提案</span>
              <span>④ 视觉系统方案</span>
              <span>⑤ 深化设计与深化展览策划</span>
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
import { gradingOverview, gradingPalette, methodSteps } from '../../data/home.js'

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

<style scoped>
.rules-body-grid {
  align-items: start;
  padding-top: clamp(2rem, 4vw, 4rem);
}

.method-panel {
  min-height: 100%;
  padding: 0;
  border: 0;
  background: var(--home-paper);
}

.method-list {
  display: grid;
  gap: 0.4rem;
  margin: 1.5rem 0 !important;
  padding: 0;
  list-style: none;
}

.method-list li {
  position: relative;
  display: flex;
  gap: 0.85rem;
  align-items: center;
  padding: 0.55rem 0;
  border: 0;
  font-family: var(--font-heavy);
  font-size: clamp(1.25rem, 2.4vw, 2rem);
  line-height: 1.35;
  letter-spacing: 0.02em;
}

.method-list li::before {
  width: 0.55rem;
  height: 0.55rem;
  flex: 0 0 auto;
  content: "";
  background: var(--home-blue);
}

.method-list li:nth-child(2)::before { background: var(--home-yellow); }
.method-list li:nth-child(3)::before { background: var(--home-orange); }
.method-list li:nth-child(4)::before { background: var(--home-green); }
.method-list li:nth-child(5)::before { background: var(--home-magenta); }
.method-list li:nth-child(6)::before { background: var(--home-blue); }
.method-list li:nth-child(7)::before { background: var(--home-yellow); }
.method-list li:nth-child(8)::before { background: var(--home-orange); }

.method-list span {
  width: 1.75rem;
  color: var(--home-muted);
  font-family: var(--font-body);
  font-size: 0.7rem;
}

.rules-detail {
  display: grid;
  gap: 3rem;
}

.rules-facts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  border-top: 1px solid var(--home-rule);
}

.rules-facts > div {
  min-width: 0;
  padding: 0.8rem 0 0.9rem;
  border-bottom: 1px solid var(--home-rule);
}

.rules-facts dt {
  color: var(--home-muted);
  font-family: var(--font-body);
  font-size: 0.7rem;
  line-height: 1.35;
  letter-spacing: 0.07em;
}

.rules-facts dd {
  margin-top: 0.35rem;
  font-size: 0.95rem;
  line-height: 1.55;
}

.rules-work-mode,
.rules-output {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  max-width: 34rem;
}

.rules-work-mode strong,
.rules-output strong {
  font-family: var(--font-heavy);
  font-size: 1.05rem;
  font-weight: 700;
}

.grading-summary {
  border-top: 0;
}

.grading-summary .panel-label {
  display: block;
  padding: 0.8rem 0;
}

.grading-chart {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(9rem, 0.8fr);
  gap: clamp(1.5rem, 3vw, 3rem);
  align-items: start;
  padding-top: 1rem;
}

.grading-donut {
  position: relative;
  display: grid;
  width: min(100%, 14rem);
  aspect-ratio: 1;
  place-items: center;
  align-self: start;
  justify-self: end;
}

.grading-donut-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  transform: rotate(-90deg);
}

.grading-donut-track,
.grading-segment {
  fill: none;
  stroke-linecap: butt;
}

.grading-donut-track {
  stroke: var(--home-rule);
  stroke-width: 6;
}

.grading-segment {
  stroke-width: 8;
  opacity: 0.82;
  cursor: pointer;
  transition: opacity 180ms ease, stroke-width 180ms ease;
}

.grading-segment.is-active {
  stroke-width: 8;
  opacity: 1;
}

.grading-segment.is-muted {
  opacity: 0.18;
}

.grading-donut-hole {
  display: grid;
  width: 56%;
  aspect-ratio: 1;
  place-items: center;
  border-radius: 50%;
  color: var(--home-ink);
  background: var(--home-paper);
  font-family: var(--font-heavy);
  font-size: clamp(1.3rem, 2.5vw, 2rem);
  line-height: 1;
}

.grading-donut-hole small {
  margin-left: 0.08em;
  font-family: var(--font-body);
  font-size: 0.5em;
  font-weight: 500;
}

.grading-donut-hole > span {
  display: flex;
  align-items: baseline;
}

.grading-legend {
  min-width: 0;
}

.grading-legend-item {
  display: grid;
  width: 100%;
  grid-template-columns: 0.55rem minmax(0, 1fr) auto;
  gap: 0.7rem;
  align-items: center;
  min-height: 2.6rem;
  padding: 0.55rem 0;
  border: 0;
  color: var(--home-ink);
  background: transparent;
  font: inherit;
  font-size: 0.9rem;
  line-height: 1.35;
  text-align: left;
  cursor: pointer;
  transition: opacity 180ms ease, color 180ms ease, background-color 180ms ease;
}

.grading-swatch {
  width: 0.55rem;
  height: 0.55rem;
}

.grading-legend-label {
  min-width: 0;
}

.grading-legend-item strong {
  font-family: var(--font-heavy);
  font-weight: 700;
}

.grading-legend-item.is-active {
  color: var(--home-ink);
  background: rgba(0, 0, 0, 0.045);
}

.grading-legend-item.is-muted {
  opacity: 0.35;
}

.grading-legend-item:focus-visible {
  position: relative;
  z-index: 1;
  outline: none;
  background: rgba(0, 0, 0, 0.08);
}

.text-link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  align-self: flex-start;
  padding-bottom: 0.2rem;
  border-bottom: 1px solid var(--home-ink);
  font-family: var(--font-heavy);
  font-size: 0.85rem;
  text-decoration: none;
}

.rules-header-grid .section-copy-column {
  display: flex;
  flex-direction: column;
}

.rules-header-grid .rules-cta {
  gap: 1.1rem;
  margin-top: clamp(3rem, 6vw, 6rem);
  margin-bottom: 0;
  padding: 0;
  border-bottom: 0;
  color: #9a9a9a;
  font-family: var(--font-body);
  font-size: clamp(1.1rem, 1.8vw, 1.5rem);
  font-weight: 400;
  letter-spacing: 0.02em;
  transition: color 180ms ease;
}

.rules-cta-arrow {
  display: block;
  flex: 0 0 auto;
  width: clamp(3.2rem, 5.5vw, 4.5rem);
  height: clamp(3.2rem, 5.5vw, 4.5rem);
  color: currentColor;
  overflow: visible;
  transform: translateY(-0.02em);
  transition: transform 180ms ease;
}

.rules-cta-arrow circle,
.rules-cta-arrow path {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.rules-cta-arrow circle {
  stroke-width: 2.5;
}

.rules-cta-arrow path {
  stroke-width: 3;
}

.rules-cta:hover .rules-cta-arrow,
.rules-cta:focus-visible .rules-cta-arrow {
  transform: translate(0.18rem, -0.02em);
}

.text-link:hover {
  color: var(--home-orange);
  border-bottom-color: var(--home-orange);
}

.rules-header-grid .rules-cta:hover {
  color: var(--home-ink);
  border-bottom-color: transparent;
}

@media (max-width: 767px) {
  .rules-body-grid {
    padding-top: 2.25rem;
  }
}
</style>
