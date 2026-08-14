<template>
  <div class="syllabus-page">
    <a class="skip-link" href="#syllabus-content">跳转到课程大纲</a>

    <header id="top" class="syllabus-hero">
      <HomeSiteNav />

      <div class="hero-grid">
        <div class="hero-title">
          <p class="eyebrow">Content &amp; Curation · 2026</p>
          <h1>课程<br />大纲</h1>
          <p class="hero-note">从内容数据库到公共展览的八周实践课程</p>
        </div>

        <div class="hero-overview">
          <p class="hero-statement">展示即情境，<br />策展即叙事。</p>
          <p class="hero-copy">
            本课程以选词为内容入口，以数据库、策展提案、网站与空间展具为连续实践线。学生将在研究、组织、设计、制作与公开呈现之间，完成一个从内容采集到展览开幕的完整项目。
          </p>
          <dl class="hero-facts" aria-label="课程基本信息">
            <div><dt>教学周期</dt><dd>8 周 · 16 课次</dd></div>
            <div><dt>上课时间</dt><dd>前 5 周周一、周四；后 3 周周一、周三、周四</dd></div>
            <div><dt>课程日期</dt><dd>2026/09/07 — 2026/11/19</dd></div>
            <div><dt>课程产出</dt><dd>内容网站＋空间展具＋综合汇报</dd></div>
          </dl>
        </div>
      </div>
    </header>

    <nav class="section-index" aria-label="课程大纲章节">
      <a href="#framework"><span>01</span>课程框架</a>
      <a href="#schedule"><span>02</span>教学进度</a>
      <a href="#assessment"><span>03</span>考核方式</a>
    </nav>

    <main id="syllabus-content">
      <section id="framework" class="syllabus-section framework-section" aria-labelledby="framework-title">
        <div class="section-heading-grid">
          <div>
            <p class="section-code">01 · COURSE FRAMEWORK</p>
            <h2 id="framework-title">课程<br />框架</h2>
          </div>
          <p class="section-intro">
            课程把“内容”的研究性与“展示”的公共性放在同一工作流程中。技术不是独立目标，而是帮助研究成果成为可访问策展项目的生产手段。
          </p>
        </div>

        <div class="framework-grid">
          <div class="framework-method">
            <p class="panel-label">策展方法 / METHOD</p>
            <ol>
              <li v-for="(step, index) in methodSteps" :key="step">
                <span>0{{ index + 1 }}</span>
                <strong>{{ step }}</strong>
              </li>
            </ol>
          </div>

          <div class="objectives">
            <p class="panel-label">教学目标 / OBJECTIVES</p>
            <ol>
              <li v-for="(objective, index) in courseInfo.objectives" :key="objective">
                <span>{{ String(index + 1).padStart(2, '0') }}</span>
                <p>{{ objective }}</p>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section id="schedule" class="syllabus-section schedule-section" aria-labelledby="schedule-title">
        <div class="section-heading-grid schedule-heading">
          <div>
            <p class="section-code">02 · TEACHING SCHEDULE</p>
            <h2 id="schedule-title">八周<br />十六课次</h2>
          </div>
          <div class="schedule-summary">
            <p>从内容数据搭建、策展结构与空间阅读，推进至网站汇报、展具制作、现场测试及综合评审。</p>
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
          :aria-labelledby="`week-${week.week}`"
        >
          <header class="week-header">
            <p class="week-number">{{ week.week }}</p>
            <h3 :id="`week-${week.week}`">{{ week.title }}</h3>
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

      <section id="assessment" class="syllabus-section assessment-section" aria-labelledby="assessment-title">
        <div class="section-heading-grid assessment-heading">
          <div>
            <p class="section-code">03 · ASSESSMENT</p>
            <h2 id="assessment-title">考核<br />方式</h2>
          </div>
          <p class="assessment-statement">过程即成果。</p>
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
          <a href="#top">返回顶部 <span aria-hidden="true">↑</span></a>
        </footer>
      </section>
    </main>
  </div>
</template>

<script setup>
import HomeSiteNav from '../components/home/HomeSiteNav.vue'
import { methodSteps } from '../data/home.js'
import { courseInfo } from '../data/syllabus.js'
import { assessmentItems, syllabusWeeks, wordPool } from '../data/syllabusSchedule.js'
</script>

<style scoped>
.syllabus-page {
  --syllabus-ink: #111111;
  --syllabus-muted: #747474;
  --syllabus-rule: #d8d8d8;
  --syllabus-green: #2faf87;
  --syllabus-orange: #f05a2a;
  --syllabus-yellow: #f2ef78;
  --syllabus-gap: clamp(3rem, 5vw, 5rem);
  min-height: 100vh;
  color: var(--syllabus-ink);
  background: #ffffff;
  font-family: var(--font-body);
}

.syllabus-page :is(h1, h2, h3, p, dl, dd, dt, ol) {
  margin: 0;
}

.syllabus-page :is(h1, h2, h3) {
  color: var(--syllabus-ink);
  font-family: var(--font-heavy);
  font-weight: 700;
  letter-spacing: 0.01em;
  text-transform: none;
}

.skip-link {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 100;
  padding: 0.65rem 0.85rem;
  color: #ffffff;
  background: var(--syllabus-ink);
  transform: translateY(-160%);
}

.skip-link:focus { transform: translateY(0); }

.syllabus-hero,
.syllabus-section,
.section-index {
  padding-inline: clamp(1.5rem, 7vw, 7.5rem);
}

.syllabus-hero {
  padding-top: clamp(1.5rem, 4vh, 3rem);
  padding-bottom: clamp(6rem, 11vw, 11rem);
}

.site-nav {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  gap: var(--syllabus-gap);
  align-items: center;
  min-height: 44px;
}

.site-nav :deep(a) {
  display: inline-flex;
  flex-direction: column;
  gap: 0.18rem;
  justify-content: center;
  min-height: 44px;
  padding: 0.45rem 0;
  color: var(--syllabus-muted);
  font-weight: 500;
  line-height: 1.1;
}

.site-nav :deep(a:nth-child(1)) { grid-area: 1 / 1 / 2 / 2; justify-self: start; }
.site-nav :deep(a:nth-child(2)) { grid-area: 1 / 2 / 2 / 3; justify-self: start; }
.site-nav :deep(a:nth-child(3)) { grid-area: 1 / 2 / 2 / 3; justify-self: end; }
.site-nav :deep(.site-nav-en),
.site-nav :deep(.site-nav-zh) { display: block; }
.site-nav :deep(.site-nav-en) {
  color: var(--syllabus-muted);
  font-size: 0.64rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.site-nav :deep(.site-nav-en-short) { display: none; }
.site-nav :deep(.site-nav-zh) { font-size: clamp(0.8rem, 1.1vw, 0.95rem); }
.site-nav :deep(a:hover),
.site-nav :deep(a:focus-visible),
.site-nav :deep(a.is-current) { color: var(--syllabus-ink); font-weight: 700; }

.hero-grid,
.section-heading-grid,
.framework-grid {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  gap: var(--syllabus-gap);
}

.hero-grid { padding-top: clamp(4rem, 8vw, 8rem); }
.eyebrow,
.section-code,
.panel-label {
  color: var(--syllabus-muted);
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.eyebrow { margin-bottom: 1.4rem; }
.hero-title h1 {
  font-size: clamp(5rem, 11vw, 11rem);
  line-height: 0.92;
  letter-spacing: 0.02em;
}
.hero-note {
  margin-top: 2rem !important;
  color: var(--syllabus-muted);
  font-size: 0.8rem;
}
.hero-overview { align-self: end; }
.hero-statement {
  max-width: 20ch;
  font-size: clamp(1.8rem, 3.2vw, 3rem);
  font-weight: 700;
  line-height: 1.2;
}
.hero-copy {
  max-width: 35em;
  margin-top: 2.5rem !important;
  font-size: clamp(1rem, 1.3vw, 1.15rem);
  line-height: 1.85;
  text-align: justify;
  text-wrap: pretty;
  line-break: strict;
}
.hero-facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 3rem !important;
  border-top: 1px solid var(--syllabus-rule);
}
.hero-facts div { padding: 1rem 0 1.25rem; border-bottom: 1px solid var(--syllabus-rule); }
.hero-facts div:nth-child(odd) { padding-right: 1.25rem; }
.hero-facts div:nth-child(even) { padding-left: 1.25rem; border-left: 1px solid var(--syllabus-rule); }
.hero-facts dt { color: var(--syllabus-muted); font-size: 0.72rem; letter-spacing: 0.05em; }
.hero-facts dd { margin-top: 0.4rem; font-size: 0.95rem; font-weight: 700; line-height: 1.5; }

.section-index {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  padding-block: 0.55rem;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
}
.section-index a {
  display: flex;
  gap: 0.65rem;
  align-items: center;
  min-height: 44px;
  color: var(--syllabus-muted);
  font-size: 0.78rem;
  letter-spacing: 0.04em;
}
.section-index a:nth-child(1) { justify-self: start; }
.section-index a:nth-child(2) { justify-self: center; }
.section-index a:nth-child(3) { justify-self: end; }
.section-index a span { color: var(--syllabus-green); font-weight: 700; }
.section-index a:hover,
.section-index a:focus-visible { color: var(--syllabus-ink); }

.syllabus-section {
  padding-top: clamp(7rem, 12vw, 12rem);
  padding-bottom: clamp(7rem, 12vw, 12rem);
  scroll-margin-top: 3.5rem;
}
.section-code { margin-bottom: 1.5rem !important; }
.section-heading-grid h2 {
  font-size: clamp(4rem, 8vw, 8rem);
  line-height: 0.95;
}
.section-intro,
.schedule-summary > p {
  align-self: end;
  max-width: 32em;
  font-size: clamp(1.1rem, 1.8vw, 1.45rem);
  line-height: 1.75;
  text-wrap: pretty;
  line-break: strict;
}

.framework-grid { margin-top: clamp(5rem, 9vw, 9rem); }
.framework-method ol { list-style: none; margin-top: 2rem !important; }
.framework-method li {
  display: grid;
  grid-template-columns: 3rem 1fr;
  align-items: baseline;
  padding: 1rem 0;
}
.framework-method li span { color: var(--syllabus-muted); font-size: 0.75rem; }
.framework-method li strong { font-size: clamp(1.35rem, 2vw, 2rem); font-weight: 600; }
.framework-method li::before {
  content: '';
  grid-column: 1 / -1;
  width: 10px;
  height: 10px;
  margin-bottom: 0.75rem;
  background: var(--syllabus-green);
}
.framework-method li:nth-child(2)::before { background: var(--syllabus-yellow); }
.framework-method li:nth-child(3)::before { background: var(--syllabus-orange); }
.framework-method li:nth-child(4)::before { background: #78a2ed; }
.framework-method li:nth-child(5)::before { background: #de67b5; }
.objectives ol { list-style: none; margin-top: 2rem !important; }
.objectives li {
  display: grid;
  grid-template-columns: 2.25rem 1fr;
  gap: 1rem;
  padding: 1.2rem 0;
  border-top: 1px solid var(--syllabus-rule);
}
.objectives li span { color: var(--syllabus-muted); font-size: 0.75rem; }
.objectives li p { font-size: 1rem; line-height: 1.65; text-wrap: pretty; }

.schedule-heading { margin-bottom: clamp(6rem, 10vw, 10rem); }
.schedule-summary { align-self: end; }
.schedule-summary dl { margin-top: 2.5rem !important; }
.schedule-summary dl div { padding: 1rem 0; border-top: 1px solid var(--syllabus-rule); }
.schedule-summary dt { color: var(--syllabus-muted); font-size: 0.72rem; }
.schedule-summary dd { margin-top: 0.35rem; font-size: 0.9rem; line-height: 1.5; }

.schedule-week { margin-bottom: clamp(7rem, 11vw, 11rem); }
.week-header {
  display: grid;
  grid-template-columns: 1.25fr 4fr 1.25fr;
  gap: 1.5rem;
  align-items: baseline;
  padding-bottom: 1.6rem;
}
.week-number { color: var(--syllabus-green); font-size: clamp(3.5rem, 6vw, 6rem); font-weight: 700; line-height: 0.9; }
.week-header h3 { font-size: clamp(1.5rem, 2.5vw, 2.5rem); line-height: 1.25; }
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

.assessment-heading { align-items: end; }
.assessment-statement { align-self: end; font-size: clamp(2rem, 4vw, 4rem); font-weight: 700; line-height: 1.15; }
.assessment-list { list-style: none; margin-top: clamp(5rem, 9vw, 9rem) !important; }
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

.syllabus-page :is(a, button):focus-visible {
  outline: 2px solid var(--syllabus-ink);
  outline-offset: 3px;
}

@media (max-width: 1023px) {
  .syllabus-hero,
  .syllabus-section,
  .section-index { padding-inline: clamp(1.5rem, 5vw, 3rem); }
  .hero-grid,
  .section-heading-grid,
  .framework-grid,
  .site-nav { gap: 3rem; }
  .schedule-table .col-content { width: 27%; }
  .schedule-table .col-output { width: 23%; }
  .schedule-table .col-method { width: 14%; }
  .schedule-table td { font-size: 0.78rem; }
}

@media (max-width: 767px) {
  .syllabus-hero,
  .syllabus-section,
  .section-index { padding-inline: 1rem; }
  .syllabus-hero { padding-bottom: 6rem; }
  .site-nav { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; }
  .site-nav :deep(a:nth-child(1)) { grid-area: 1 / 1 / 2 / 2; justify-self: start; align-items: flex-start; text-align: left; }
  .site-nav :deep(a:nth-child(2)) { grid-area: 1 / 2 / 2 / 3; justify-self: center; align-items: center; text-align: center; }
  .site-nav :deep(a:nth-child(3)) { grid-area: 1 / 3 / 2 / 4; justify-self: end; align-items: flex-end; text-align: right; }
  .site-nav :deep(.site-nav-en-full) { display: none; }
  .site-nav :deep(.site-nav-en-short) { display: block; }

  .hero-grid,
  .section-heading-grid,
  .framework-grid { grid-template-columns: 1fr; gap: 4rem; }
  .hero-grid { padding-top: 4rem; }
  .hero-title h1 { font-size: clamp(5rem, 26vw, 8rem); }
  .hero-overview { align-self: auto; }
  .hero-copy { text-align: left; }
  .hero-facts { grid-template-columns: 1fr; }
  .hero-facts div:nth-child(odd),
  .hero-facts div:nth-child(even) { padding-inline: 0; border-left: 0; }

  .section-index { gap: 0.5rem; }
  .section-index a { flex-direction: column; gap: 0; align-items: flex-start; justify-content: center; font-size: 0.7rem; line-height: 1.15; }
  .section-index a:nth-child(2) { align-items: center; }
  .section-index a:nth-child(3) { align-items: flex-end; }

  .syllabus-section { padding-top: 7rem; padding-bottom: 7rem; }
  .section-heading-grid h2 { font-size: clamp(4rem, 20vw, 6.5rem); }
  .section-intro,
  .schedule-summary > p { font-size: 1.15rem; }
  .framework-grid { margin-top: 5rem; }

  .schedule-heading { margin-bottom: 7rem; }
  .week-header { grid-template-columns: 1fr; gap: 0.75rem; padding-bottom: 1.5rem; }
  .week-number { font-size: 4rem; }
  .week-header h3 { font-size: 1.55rem; }
  .week-dates { justify-self: start; }
  .schedule-table,
  .schedule-table tbody,
  .schedule-table tr,
  .schedule-table td { display: block; width: 100%; }
  .schedule-table colgroup,
  .schedule-table thead { display: none; }
  .schedule-table tr { padding: 1.25rem 0 2rem; border-top: 1px solid var(--syllabus-ink); }
  .schedule-table td {
    display: grid;
    grid-template-columns: 7.5rem minmax(0, 1fr);
    gap: 1rem;
    padding: 0.65rem 0;
    border: 0;
    font-size: 0.95rem;
  }
  .schedule-table td::before {
    content: attr(data-label);
    color: var(--syllabus-muted);
    font-size: 0.68rem;
    font-weight: 500;
    line-height: 1.4;
    letter-spacing: 0.05em;
  }
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
