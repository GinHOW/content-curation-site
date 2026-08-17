<template>
  <div id="top" class="syllabus-page home-page">
    <a class="skip-link" href="#schedule">跳转到教学进度</a>

    <div class="home-shell syllabus-shell">
      <HomeEdgeNav
        :items="syllabusNavItems"
        :active-section="activeSection"
        @navigate="navigateTo"
      />

      <main id="syllabus-content" class="home-main syllabus-main">
        <HomeSiteNav />

        <section
          id="schedule"
          class="home-section syllabus-section schedule-section"
          data-section
          aria-labelledby="schedule-title"
        >
          <div class="section-grid schedule-heading">
            <div class="section-title-column">
              <p class="eyebrow">02 · Teaching Schedule</p>
              <h1 id="schedule-title">八周<br />十六课次</h1>
            </div>
            <div class="section-copy-column schedule-summary">
              <p>从内容数据库搭建、策展结构与空间阅读，推进至网站汇报、展具制作、现场测试及综合评审。</p>
              <dl>
                <div><dt>前半程</dt><dd>内容研究 · 策展提案 · 空间与视觉系统</dd></div>
                <div><dt>后半程</dt><dd>整合汇报 · 制作深化 · 测试与公开呈现</dd></div>
              </dl>
            </div>
          </div>

          <article
            v-for="week in syllabusWeeks"
            :key="week.week"
            class="schedule-week"
            :id="weekSectionId(week.week)"
            data-section
            :aria-labelledby="`week-${week.week}`"
          >
            <header class="week-header">
              <p class="week-number">{{ week.week }}</p>
              <h2 :id="`week-${week.week}`">{{ week.title }}</h2>
              <p class="week-dates">{{ week.dates }}</p>
            </header>

            <div class="schedule-table-wrap">
              <table class="schedule-table">
                <caption class="sr-only">{{ week.week }} {{ week.title }}课程安排</caption>
                <colgroup>
                  <col class="col-session" />
                  <col class="col-date" />
                  <col class="col-theme" />
                  <col class="col-content" />
                  <col class="col-output" />
                  <col class="col-method" />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">课次</th>
                    <th scope="col">日期</th>
                    <th scope="col">教学主题</th>
                    <th scope="col">教学内容要点</th>
                    <th scope="col">阶段成果 / 课后任务</th>
                    <th scope="col">教学方式</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="session in week.sessions"
                    :key="`${week.week}-${session.number}-${session.date}`"
                    :class="{ 'is-holiday': session.holiday, 'is-auxiliary': session.auxiliary }"
                  >
                    <td data-label="课次" class="session-number">{{ session.number }}</td>
                    <td data-label="日期" class="session-date" :class="{ 'has-holiday-conflict': session.holidayConflict }">
                      <strong>{{ session.date }}</strong>
                      <span>{{ session.day }}</span>
                      <span v-if="session.holidayNote" class="holiday-note">{{ session.holidayNote }}</span>
                    </td>
                    <td data-label="教学主题" class="session-theme">{{ session.theme }}</td>
                    <td data-label="教学内容要点">{{ session.content }}</td>
                    <td data-label="阶段成果 / 课后任务">{{ session.deliverable }}</td>
                    <td data-label="教学方式" class="session-method">{{ session.method }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="week.week === 'W1'" class="word-pool" aria-label="选题库">
              <p class="panel-label">选题库 / WORD POOL</p>
              <div class="word-pool-list">
                <span v-for="word in wordPool" :key="word">{{ word }}</span>
                <span class="word-more" aria-hidden="true">……</span>
              </div>
              <p class="word-pool-note">每个词兼具哲学内涵与观念的包容度，同时指向一种空间类型。</p>
            </div>
          </article>
        </section>

        <section
          id="assessment"
          class="home-section syllabus-section assessment-section"
          data-section
          aria-labelledby="assessment-title"
        >
          <div class="section-grid assessment-heading">
            <div class="section-title-column">
              <p class="eyebrow">03 · Assessment</p>
              <h2 id="assessment-title">考核<br />方式</h2>
            </div>
            <p class="section-copy-column assessment-statement">过程即成果。</p>
          </div>

          <ol class="assessment-list">
            <li v-for="item in assessmentItems" :key="item.item">
              <div>
                <strong>{{ item.item }}</strong>
                <span>{{ item.timing }}</span>
              </div>
              <b>{{ item.weight }}</b>
            </li>
          </ol>

          <footer class="syllabus-footer">
            <div>
              <span>School of Communication &amp; Design 2026</span>
              <strong>内容与策展 · CONTENT &amp; CURATION</strong>
            </div>
            <BackToTop />
          </footer>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import HomeEdgeNav from '../components/home/HomeEdgeNav.vue'
import HomeSiteNav from '../components/home/HomeSiteNav.vue'
import BackToTop from '../components/BackToTop.vue'
import { useHomeSections } from '../composables/useHomeSections.js'
import { assessmentItems, syllabusWeeks, wordPool } from '../data/syllabusSchedule.js'

const weekSectionId = (week) => `week-${week.toLowerCase()}`

const syllabusNavItems = [
  ...syllabusWeeks.map((week) => ({
    id: weekSectionId(week.week),
    label: week.week,
  })),
  { id: 'assessment', label: '考核方式' },
]

const { activeSection, navigateTo } = useHomeSections(
  syllabusNavItems.map((item) => item.id),
)
</script>

<style scoped>
.syllabus-page {
  --syllabus-ink: #111111;
  --syllabus-muted: #747474;
  --syllabus-rule: #d8d8d8;
  --syllabus-green: #2faf87;
  --syllabus-orange: #f05a2a;
  --syllabus-gap: clamp(3rem, 5vw, 5rem);
  --section-anchor-offset: clamp(7rem, 22vh, 12rem);
  min-height: 100vh;
  color: var(--syllabus-ink);
  background: #ffffff;
}

.syllabus-page :is(h1, h2, h3, p, dl, dd, dt, ol) { margin: 0; }
.syllabus-page :is(h1, h2, h3) {
  color: var(--syllabus-ink);
  font-family: var(--font-heavy);
  font-weight: 700;
  letter-spacing: 0.01em;
}

.syllabus-main > .site-nav {
  margin-inline: clamp(3.5rem, 4vw, 4.5rem);
  padding-top: clamp(1.5rem, 4vh, 3rem);
}

.syllabus-section {
  scroll-margin-top: var(--section-anchor-offset);
}

.schedule-heading { padding-top: clamp(4rem, 8vw, 8rem); }
.eyebrow,
.panel-label,
.section-code {
  color: var(--syllabus-muted);
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.schedule-heading h1,
.assessment-heading h2 {
  font-size: clamp(4rem, 8vw, 8rem);
  line-height: 0.95;
}

.schedule-summary,
.assessment-statement { align-self: end; }
.schedule-summary > p,
.assessment-statement {
  max-width: 32em;
  font-size: clamp(1.1rem, 1.8vw, 1.45rem);
  line-height: 1.75;
  text-wrap: pretty;
  line-break: strict;
}

.schedule-summary dl { margin-top: 2.5rem; }
.schedule-summary dl div {
  padding: 1rem 0;
  border-top: 1px solid var(--syllabus-rule);
}
.schedule-summary dt { color: var(--syllabus-muted); font-size: 0.72rem; }
.schedule-summary dd { margin-top: 0.35rem; font-size: 0.9rem; line-height: 1.5; }

.schedule-week { margin-top: clamp(6rem, 10vw, 10rem); }
.week-header {
  display: grid;
  grid-template-columns: 1.25fr 4fr 1.25fr;
  gap: 1.5rem;
  align-items: baseline;
  padding-bottom: 1.6rem;
}
.week-number { color: var(--syllabus-green); font-size: clamp(3.5rem, 6vw, 6rem); font-weight: 700; line-height: 0.9; }
.week-header h2 { font-size: clamp(1.5rem, 2.5vw, 2.5rem); line-height: 1.25; }
.week-dates { justify-self: end; color: var(--syllabus-muted); font-size: 0.85rem; font-variant-numeric: tabular-nums; }

.schedule-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.schedule-table .col-session { width: 6%; }
.schedule-table .col-date { width: 12%; }
.schedule-table .col-theme { width: 17%; }
.schedule-table .col-content { width: 29%; }
.schedule-table .col-output { width: 24%; }
.schedule-table .col-method { width: 12%; }
.schedule-table th {
  padding: 0.8rem 0.7rem;
  border-top: 1px solid var(--syllabus-ink);
  border-bottom: 1px solid var(--syllabus-ink);
  color: var(--syllabus-muted);
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-align: left;
}
.schedule-table td {
  padding: 1.35rem 0.7rem 1.6rem;
  border-bottom: 1px solid var(--syllabus-rule);
  vertical-align: top;
  font-size: clamp(0.82rem, 1vw, 0.95rem);
  line-height: 1.65;
  white-space: pre-line;
  text-wrap: pretty;
  line-break: strict;
  overflow-wrap: anywhere;
}
.session-number { color: var(--syllabus-green); font-weight: 700; font-variant-numeric: tabular-nums; }
.session-date strong,
.session-date span { display: block; }
.session-date strong { font-variant-numeric: tabular-nums; }
.session-date span { margin-top: 0.3rem; color: var(--syllabus-muted); font-size: 0.72rem; }
.session-date .holiday-note { color: var(--syllabus-orange); line-height: 1.45; }
.session-theme { font-weight: 700; }
.session-method { color: var(--syllabus-muted); font-size: 0.78rem !important; }
.schedule-table tr.is-holiday td { color: var(--syllabus-muted); }
.schedule-table tr.is-auxiliary .session-number { color: var(--syllabus-orange); }

.word-pool { margin-top: 2.25rem; }
.word-pool-list { display: flex; flex-wrap: wrap; gap: 0.65rem; margin-top: 1rem; }
.word-pool-list span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0.55rem 1rem;
  border: 1px solid var(--syllabus-rule);
  font-size: 0.86rem;
}
.word-pool-list .word-more { border-style: dashed; color: var(--syllabus-muted); }
.word-pool-note { margin-top: 1rem !important; color: var(--syllabus-muted); font-size: 0.78rem; }

.assessment-section { padding-top: clamp(7rem, 12vw, 12rem); }
.assessment-statement { font-size: clamp(2rem, 4vw, 4rem); font-weight: 700; line-height: 1.15; }
.assessment-list { list-style: none; margin-top: clamp(5rem, 9vw, 9rem); }
.assessment-list li {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
  min-height: 88px;
  padding: 1.25rem 0;
  border-top: 1px solid var(--syllabus-rule);
}
.assessment-list li:last-child { border-bottom: 1px solid var(--syllabus-rule); }
.assessment-list li div { display: grid; grid-template-columns: minmax(0, 2fr) minmax(10rem, 1fr); gap: 2rem; align-items: baseline; }
.assessment-list strong { font-size: clamp(1rem, 1.5vw, 1.25rem); }
.assessment-list span { color: var(--syllabus-muted); font-size: 0.85rem; }
.assessment-list b { color: var(--syllabus-green); font-size: clamp(1.8rem, 3vw, 3rem); font-variant-numeric: tabular-nums; }

.syllabus-footer {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  align-items: end;
  margin-top: clamp(7rem, 12vw, 12rem);
}
.syllabus-footer div { display: flex; flex-direction: column; gap: 0.3rem; }
.syllabus-footer span { color: var(--syllabus-muted); font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; }
.syllabus-footer strong { font-size: 0.9rem; }
.syllabus-footer a { min-height: 44px; font-size: 0.85rem; text-decoration: underline; text-underline-offset: 0.35rem; }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.syllabus-page :is(a, button):focus-visible { outline: 2px solid var(--syllabus-ink); outline-offset: 3px; }

@media (max-width: 1023px) {
  .syllabus-main > .site-nav { margin-inline: clamp(1.5rem, 5vw, 3rem); }
  .schedule-heading { padding-top: 4rem; }
  .schedule-table td { font-size: 0.78rem; }
}

@media (max-width: 767px) {
  .syllabus-main > .site-nav { margin-inline: 1rem; }
  .syllabus-section { scroll-margin-top: 0; }
  .schedule-heading { padding-top: 3rem; }
  .schedule-heading h1,
  .assessment-heading h2 { font-size: clamp(4rem, 20vw, 6.5rem); }
  .schedule-summary > p { font-size: 1.15rem; }
  .week-header { grid-template-columns: 1fr; gap: 0.75rem; padding-bottom: 1.5rem; }
  .week-number { font-size: 4rem; }
  .week-header h2 { font-size: 1.55rem; }
  .week-dates { justify-self: start; }
  .schedule-table,
  .schedule-table tbody,
  .schedule-table tr,
  .schedule-table td { display: block; width: 100%; }
  .schedule-table colgroup,
  .schedule-table thead { display: none; }
  .schedule-table tr { padding: 1.25rem 0 2rem; border-top: 1px solid var(--syllabus-ink); }
  .schedule-table td { display: grid; grid-template-columns: 7.5rem minmax(0, 1fr); gap: 1rem; padding: 0.65rem 0; border: 0; font-size: 0.95rem; }
  .schedule-table td::before { content: attr(data-label); color: var(--syllabus-muted); font-size: 0.68rem; font-weight: 500; line-height: 1.4; letter-spacing: 0.05em; }
  .schedule-table .session-number { font-size: 1.4rem; }
  .session-method { font-size: 0.85rem !important; }
  .word-pool { margin-top: 1.75rem; }
  .assessment-statement { font-size: 2.4rem; }
  .assessment-list li { align-items: end; }
  .assessment-list li div { grid-template-columns: 1fr; gap: 0.35rem; }
  .assessment-list b { font-size: 2rem; }
  .syllabus-footer { align-items: flex-start; flex-direction: column; }
}

@media (prefers-reduced-motion: reduce) {
  .syllabus-page * { scroll-behavior: auto !important; }
}
</style>
