<template>
  <div class="page">
    <header class="page-header">
      <div class="stamp stamp-sm">大纲</div>
      <h1>课程大纲</h1>
      <p>{{ courseInfo.cycle }} · 每周一、三、四 · 开课 2026/9/7</p>
    </header>

    <!-- 课程简介 -->
    <section>
      <h2>课程简介</h2>
      <p>{{ courseInfo.description }}</p>
    </section>

    <!-- 教学目标 -->
    <section>
      <h2>教学目标</h2>
      <ol>
        <li v-for="(obj, i) in courseInfo.objectives" :key="i">{{ obj }}</li>
      </ol>
    </section>

    <hr />

    <!-- 第一阶段 -->
    <section class="phase-section">
      <div class="phase-label">第一阶段：策展 · 第 1–4 周</div>

      <div v-for="w in phase1" :key="w.week" class="calendar-week">
        <div class="calendar-week-header">
          <span class="calendar-week-label">W{{ w.week }}</span>
          <span class="calendar-week-title">{{ w.title }}</span>
        </div>
        <div class="calendar-days">
          <!-- 周一 -->
          <div class="calendar-day">
            <div class="calendar-day-header">
              <span class="calendar-day-weekday">周一</span>
              <span class="calendar-day-date">{{ w.dates.mon }}</span>
            </div>
            <div class="session-type">{{ w.sessions[0].type }}</div>
            <div class="session-title">{{ w.sessions[0].title }}</div>
            <ul>
              <li v-for="(p, pi) in w.sessions[0].points" :key="pi">{{ p }}</li>
            </ul>
          </div>
          <!-- 周三 -->
          <div class="calendar-day">
            <div class="calendar-day-header">
              <span class="calendar-day-weekday">周三</span>
              <span class="calendar-day-date">{{ w.dates.wed }}</span>
            </div>
            <div class="session-type">{{ w.sessions[1].type }}</div>
            <div class="session-title">{{ w.sessions[1].title }}</div>
            <ul>
              <li v-for="(p, pi) in w.sessions[1].points" :key="pi">{{ p }}</li>
            </ul>
          </div>
          <!-- 周四 -->
          <div class="calendar-day">
            <div class="calendar-day-header">
              <span class="calendar-day-weekday">周四</span>
              <span class="calendar-day-date">{{ w.dates.thu }}</span>
            </div>
            <div class="session-type">{{ w.sessions[2].type }}</div>
            <div class="session-title">{{ w.sessions[2].title }}</div>
            <ul>
              <li v-for="(p, pi) in w.sessions[2].points" :key="pi">{{ p }}</li>
            </ul>
          </div>
        </div>
        <!-- 课后作业 -->
        <div v-if="w.homework" class="calendar-homework">
          <strong>课后作业</strong>
          <ul>
            <li v-for="(h, hi) in w.homework" :key="hi">{{ h }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 第二阶段 -->
    <section class="phase-section">
      <div class="phase-label">第二阶段：展示 · 第 5–8 周</div>

      <div v-for="w in phase2" :key="w.week" class="calendar-week">
        <div class="calendar-week-header">
          <span class="calendar-week-label">W{{ w.week }}</span>
          <span class="calendar-week-title">{{ w.title }}</span>
        </div>
        <div class="calendar-days">
          <div class="calendar-day">
            <div class="calendar-day-header">
              <span class="calendar-day-weekday">周一</span>
              <span class="calendar-day-date">{{ w.dates.mon }}</span>
            </div>
            <div class="session-type">{{ w.sessions[0].type }}</div>
            <div class="session-title">{{ w.sessions[0].title }}</div>
            <ul>
              <li v-for="(p, pi) in w.sessions[0].points" :key="pi">{{ p }}</li>
            </ul>
          </div>
          <div class="calendar-day">
            <div class="calendar-day-header">
              <span class="calendar-day-weekday">周三</span>
              <span class="calendar-day-date">{{ w.dates.wed }}</span>
            </div>
            <div class="session-type">{{ w.sessions[1].type }}</div>
            <div class="session-title">{{ w.sessions[1].title }}</div>
            <ul>
              <li v-for="(p, pi) in w.sessions[1].points" :key="pi">{{ p }}</li>
            </ul>
          </div>
          <div class="calendar-day">
            <div class="calendar-day-header">
              <span class="calendar-day-weekday">周四</span>
              <span class="calendar-day-date">{{ w.dates.thu }}</span>
            </div>
            <div class="session-type">{{ w.sessions[2].type }}</div>
            <div class="session-title">{{ w.sessions[2].title }}</div>
            <ul>
              <li v-for="(p, pi) in w.sessions[2].points" :key="pi">{{ p }}</li>
            </ul>
          </div>
        </div>
        <div v-if="w.homework" class="calendar-homework">
          <strong>课后作业</strong>
          <ul>
            <li v-for="(h, hi) in w.homework" :key="hi">{{ h }}</li>
          </ul>
        </div>
      </div>
    </section>

    <hr />

    <!-- 评分体系 -->
    <section>
      <h2>评分体系</h2>

      <h4>总览</h4>
      <table>
        <thead><tr><th>评估项目</th><th>占比</th><th>说明</th></tr></thead>
        <tbody>
          <tr v-for="g in grading.overview" :key="g.item">
            <td>{{ g.item }}</td>
            <td>{{ g.weight }}</td>
            <td>{{ g.desc }}</td>
          </tr>
        </tbody>
      </table>

      <h4>策展网站评分细则</h4>
      <table>
        <thead><tr><th>维度</th><th>权重</th><th>评价标准</th></tr></thead>
        <tbody>
          <tr v-for="g in grading.website" :key="g.dimension">
            <td>{{ g.dimension }}</td>
            <td>{{ g.weight }}</td>
            <td>{{ g.standard }}</td>
          </tr>
        </tbody>
      </table>

      <h4>展览方案评分细则</h4>
      <table>
        <thead><tr><th>维度</th><th>权重</th><th>评价标准</th></tr></thead>
        <tbody>
          <tr v-for="g in grading.exhibition" :key="g.dimension">
            <td>{{ g.dimension }}</td>
            <td>{{ g.weight }}</td>
            <td>{{ g.standard }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <hr />

    <!-- 候选对象 -->
    <section>
      <h2>候选对象列表</h2>
      <table>
        <thead><tr><th>对象</th><th>方向提示</th></tr></thead>
        <tbody>
          <tr v-for="c in candidates" :key="c.object">
            <td>{{ c.object }}</td>
            <td>{{ c.direction }}</td>
          </tr>
        </tbody>
      </table>
      <p class="note">学生也可自提对象，需经教师确认其策展潜力。</p>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { courseInfo, weeks, grading, candidates } from '../data/syllabus.js'

const phase1 = computed(() => weeks.filter(w => w.phase === 1))
const phase2 = computed(() => weeks.filter(w => w.phase === 2))
</script>

<style scoped>
.page {
  background: var(--white);
  color: var(--blue-light);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 3rem var(--space) 2rem;
  border-bottom: 4px solid var(--blue-light);
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: clamp(2.5rem, 6vw, 4rem);
  line-height: 1;
  margin: 0;
}

.page-header p {
  font-size: 0.9rem;
  color: var(--gray-text);
  margin: 0;
}

.note {
  font-size: 0.85rem;
  color: var(--gray-text);
  margin-top: 1rem;
}

h4 {
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Calendar styles */
.calendar-week {
  margin-bottom: 3rem;
  border: 3px solid var(--blue-light);
  box-shadow: 4px 4px 0 var(--blue-light);
  background: var(--white);
}

.calendar-week-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--blue-light);
  color: var(--white);
  border-bottom: 3px solid var(--blue-light);
}

.calendar-week-label {
  font-family: var(--font-heavy);
  font-weight: 900;
  font-size: 1rem;
  letter-spacing: 0.08em;
}

.calendar-week-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--blue-light);
  border-top: 3px solid var(--blue-light);
}

.calendar-day {
  background: var(--white);
  padding: 1.5rem;
  min-height: 180px;
}

.calendar-day-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px dashed var(--blue-light);
}

.calendar-day-weekday {
  font-family: var(--font-heavy);
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--blue-light);
}

.calendar-day-date {
  font-size: 0.85rem;
  color: var(--red-stamp);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.calendar-day .session-type {
  font-size: 0.7rem;
  color: var(--gray-text);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.4rem;
}

.calendar-day .session-title {
  font-size: 0.95rem;
  color: var(--blue-light);
  font-weight: 700;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.calendar-day ul {
  font-size: 0.8rem;
  color: var(--gray-text);
  padding-left: 1rem;
  margin: 0;
}

.calendar-day li {
  margin-bottom: 0.3rem;
}

.calendar-homework {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 2px dashed var(--blue-light);
  font-size: 0.8rem;
  color: var(--gray-text);
}

.calendar-homework strong {
  font-weight: 700;
  color: var(--blue-light);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: block;
  margin-bottom: 0.4rem;
}

.phase-section {
  margin-bottom: 4rem;
}

.phase-label {
  font-family: var(--font-heavy);
  font-weight: 900;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 2rem;
  padding: 1rem 1.5rem;
  background: var(--blue-light);
  color: var(--white);
  border-left: 8px solid var(--red-stamp);
}

@media (max-width: 700px) {
  .calendar-days {
    grid-template-columns: 1fr;
  }
  .calendar-day {
    min-height: auto;
  }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
