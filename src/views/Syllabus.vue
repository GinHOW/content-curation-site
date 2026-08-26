<template>
  <div id="top" class="syllabus-page home-page">
    <a class="skip-link" href="#schedule">跳转到课程总览</a>

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
              <StudentEntryLink />
              <p class="eyebrow">Course Schedule</p>
              <h1 id="schedule-title">八周<br />十六课次</h1>
              <dl class="course-facts" aria-label="课程数据摘要">
                <div><dt>8</dt><dd>教学周</dd></div>
                <div><dt>16</dt><dd>正式课次</dd></div>
                <div><dt>4</dt><dd>加课</dd></div>
                <div><dt>5</dt><dd>阶段成果</dd></div>
              </dl>
              <ProtectedResourceLink v-if="authReady && authenticated" />
            </div>
            <div class="section-copy-column schedule-summary">
              <p>从内容数据库搭建、策展结构与空间阅读，推进至网站汇报、展具制作、现场测试及综合评审。</p>
              <dl class="course-phases">
                <div><dt>前半程</dt><dd>内容研究 · 策展提案 · 空间与视觉系统</dd></div>
                <div><dt>后半程</dt><dd>整合汇报 · 制作深化 · 测试与公开呈现</dd></div>
              </dl>

              <section class="assessment-overview" aria-labelledby="assessment-title">
                <header>
                  <p class="eyebrow">Assessment</p>
                  <h2 id="assessment-title">考核方式</h2>
                  <span>过程即成果</span>
                </header>
                <ol class="assessment-list">
                  <li v-for="item in assessmentItems" :key="item.item">
                    <div>
                      <strong>
                        <a
                          :href="item.target ? `#${item.target}` : '#schedule'"
                          @click="item.target && activateTarget(item.target, $event)"
                        >{{ item.item }}</a>
                      </strong>
                      <span>{{ item.timing }}</span>
                    </div>
                    <b>{{ item.weight }}</b>
                  </li>
                </ol>
              </section>
            </div>
          </div>

          <article
            v-for="week in syllabusWeeks"
            :key="week.week"
            class="schedule-week"
            :id="weekSectionId(week.week)"
            :style="{ '--week-color': weekColor(week.week) }"
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
                  <template v-for="session in week.sessions" :key="`${week.week}-${session.number}-${session.date}`">
                    <tr :id="session.anchorId" :class="{ 'is-holiday': session.holiday, 'is-auxiliary': session.auxiliary }">
                      <td
                        colspan="3"
                        class="session-overview"
                        role="button"
                        tabindex="0"
                        :aria-expanded="!isSessionCollapsed(week.week, session)"
                        :aria-controls="`${sessionContentId(week.week, session)} ${sessionDeliverablesId(week.week, session)}`"
                        :aria-label="`${session.number} ${session.theme}，${isSessionCollapsed(week.week, session) ? '展开教学内容与课后任务' : '收起教学内容与课后任务'}`"
                        @click="toggleSession(week.week, session)"
                        @keydown.enter.prevent="toggleSession(week.week, session)"
                        @keydown.space.prevent="toggleSession(week.week, session)"
                      >
                        <div class="session-meta-grid">
                          <div data-label="课次" class="session-number">{{ session.number }}</div>
                          <div data-label="日期" class="session-date" :class="{ 'has-holiday-conflict': session.holidayConflict }">
                            <span class="session-date-value">
                              <strong>{{ session.date }}</strong>
                              <span class="session-day">{{ session.day }}</span>
                            </span>
                            <span v-if="session.holidayNote" class="holiday-note">{{ session.holidayNote }}</span>
                          </div>
                          <div data-label="教学主题" class="session-theme">
                            <div class="session-theme-main">
                              <span>{{ session.theme }}</span>
                            </div>
                          </div>
                        </div>
                        <CourseReferenceGallery v-if="session.references.length && !isSessionCollapsed(week.week, session)" :session-label="session.number" :references="session.references" />
                      </td>
                      <td data-label="教学内容要点" class="session-content" :class="{ 'is-collapsed': isSessionCollapsed(week.week, session) }">
                        <div :id="sessionContentId(week.week, session)" v-show="!isSessionCollapsed(week.week, session)" class="session-content-body">
                          <ul v-if="session.contentPoints.length" class="content-points">
                            <li v-for="point in session.contentPoints" :key="point">{{ point }}</li>
                          </ul>
                          <div v-if="session.contentModules.length" class="content-modules">
                            <article v-for="module in session.contentModules" :key="`${module.name}-${module.instructor}`" class="content-module-card">
                              <p class="module-label">内容模块</p>
                              <h3>{{ module.name }}</h3>
                              <p v-if="module.instructor" class="module-instructor">{{ module.instructor }}</p>
                              <p class="module-description">{{ module.description }}</p>
                            </article>
                          </div>
                        </div>
                      </td>
                      <td
                        data-label="阶段成果 / 课后任务"
                        class="session-deliverables"
                        :class="{ 'is-collapsed': isSessionCollapsed(week.week, session) }"
                        :id="session.milestone ? `milestone-${session.milestone}` : undefined"
                      >
                        <div :id="sessionDeliverablesId(week.week, session)" v-show="!isSessionCollapsed(week.week, session)" class="session-deliverables-body">
                          <div v-for="(deliverable, index) in session.deliverables" :key="`${session.date}-deliverable-${index}`" class="deliverable-item">
                            <p v-if="deliverable.content"><strong>内容</strong>{{ cleanDeliverableText(deliverable.content) }}</p>
                            <p v-if="deliverable.form"><strong>形式</strong>{{ cleanDeliverableText(deliverable.form) }}</p>
                            <p v-if="deliverable.quantity"><strong>数量</strong>{{ cleanDeliverableText(deliverable.quantity) }}</p>
                          </div>
                          <span v-if="session.milestone" class="milestone-badge">阶段成果 {{ milestoneLabel(session.milestone) }}</span>
                          <span v-if="!session.deliverables.length && !session.holiday" class="empty-deliverable">—</span>
                        </div>
                      </td>
                      <td data-label="教学方式" class="session-method">{{ session.method }}</td>
                    </tr>
                    <tr v-if="week.week === 'W1' && session.number === '01'" v-show="!isSessionCollapsed(week.week, session)" class="topic-matcher-row">
                      <td colspan="6" class="topic-matcher-cell">
                        <TopicMatcher
                          :topics="topics"
                          :groups="groups"
                          demo-mode
                          :loading="loading"
                          :state-error="error"
                        />
                      </td>
                    </tr>
                    <tr v-if="week.week === 'W1' && session.number === '02'" v-show="!isSessionCollapsed(week.week, session)" class="archive-demo-row">
                      <td colspan="6" class="archive-demo-cell">
                        <LivingRoomArchive />
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>

          </article>

          <footer class="syllabus-footer">
            <BackToTop />
          </footer>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import HomeEdgeNav from '../components/navigation/HomeEdgeNav.vue'
import HomeSiteNav from '../components/navigation/HomeSiteNav.vue'
import BackToTop from '../components/common/BackToTop.vue'
import CourseReferenceGallery from '../components/syllabus/CourseReferenceGallery.vue'
import TopicMatcher from '../components/syllabus/TopicMatcher.vue'
import LivingRoomArchive from '../components/syllabus/LivingRoomArchive.vue'
import StudentEntryLink from '../components/syllabus/StudentEntryLink.vue'
import ProtectedResourceLink from '../components/syllabus/ProtectedResourceLink.vue'
import { useAuthSession } from '../composables/useAuthSession.js'
import { useHomeSections } from '../composables/useHomeSections.js'
import { useCourseState } from '../composables/useCourseState.js'
import { assessmentItems, syllabusWeeks } from '../data/syllabusSchedule.js'

const { ready: authReady, authenticated } = useAuthSession()

const weekSectionId = (week) => `week-${week.toLowerCase()}`
const milestoneLabel = (milestone) => ['①', '②', '③', '④', '⑤'][milestone - 1] || milestone
const sessionKey = (week, session) => `${week}-${session.number}-${session.date}`
const collapsedSessions = ref(new Set(
  syllabusWeeks.flatMap((week) => week.sessions.map((session) => sessionKey(week.week, session))),
))
const activeHash = ref('')
const sessionContentId = (week, session) => `session-content-${sessionKey(week, session)}`
const sessionDeliverablesId = (week, session) => `session-deliverables-${sessionKey(week, session)}`
const isSessionCollapsed = (week, session) => {
  if (session.milestone && activeHash.value === `#milestone-${session.milestone}`) return false
  if (activeHash.value === `#${session.anchorId}`) return false
  return collapsedSessions.value.has(sessionKey(week, session))
}
const toggleSession = (week, session) => {
  if (session.milestone && activeHash.value === `#milestone-${session.milestone}`) activeHash.value = ''
  const key = sessionKey(week, session)
  const next = new Set(collapsedSessions.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  collapsedSessions.value = next
}
const syncHashTarget = async () => {
  activeHash.value = window.location.hash
  if (!activeHash.value.startsWith('#milestone-') && !activeHash.value.startsWith('#session-')) return
  await nextTick()
  const target = document.getElementById(activeHash.value.slice(1))
  if (!target) return

  // 保留标题上方的上下文，让阶段成果不会紧贴浏览器顶端。
  const targetTop = target.getBoundingClientRect().top + window.scrollY
  window.scrollTo({
    top: Math.max(0, targetTop - window.innerHeight * 0.28),
    behavior: 'auto',
  })
}
const activateTarget = (target, event) => {
  const hash = `#${target}`
  if (window.location.hash !== hash) return

  // 相同锚点不会触发 hashchange；仍需恢复展开状态并重新定位。
  event.preventDefault()
  activeHash.value = hash
  syncHashTarget()
}
onMounted(() => {
  window.addEventListener('hashchange', syncHashTarget)
  syncHashTarget()
})
onBeforeUnmount(() => window.removeEventListener('hashchange', syncHashTarget))
const cleanDeliverableText = (value) => String(value)
  .replace(/[（(]阶段成果\s*[①②③④⑤1-5]+\s*[，,]?\s*计入考核[）)]/g, '')
  .replace(/[；;]\s*阶段成果\s*[①②③④⑤1-5]+\s*[。.]?/g, '')
  .replace(/\s*阶段成果\s*[①②③④⑤1-5]+\s*[。.]?/g, '')
  .replace(/[（(]\s*[）)]/g, '')
  .trim()

const weekColors = {
  W1: '#efe373',
  W2: '#78A2ED',
  W3: '#F47B4E',
  W4: '#53B997',
  W5: '#DF7EB8',
  W6: '#A193DF',
  W7: '#67BDC6',
  W8: '#D9AA68',
}

const weekColor = (week) => weekColors[week] || '#111111'

const syllabusNavItems = [
  ...syllabusWeeks.map((week) => ({
    id: weekSectionId(week.week),
    label: week.week,
    color: weekColor(week.week),
  })),
]

const { activeSection, navigateTo } = useHomeSections(
  syllabusNavItems.map((item) => item.id),
)
const { topics, groups, loading, error } = useCourseState()
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

.schedule-heading {
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  gap: var(--home-column-gap);
  padding-top: clamp(2.25rem, 4vw, 4rem);
}
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

.schedule-heading h1 {
  margin-top: 1.15rem !important;
  font-size: clamp(4rem, 8vw, 8rem);
  line-height: 0.95;
}

.schedule-summary { align-self: start; padding-top: 0.35rem; }
.schedule-summary > p {
  max-width: 32em;
  font-size: clamp(1.1rem, 1.8vw, 1.45rem);
  line-height: 1.75;
  text-wrap: pretty;
  line-break: strict;
}

.course-facts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.7rem;
  width: min(100%, 14rem);
  margin-top: clamp(2rem, 4vw, 3.5rem) !important;
}
.course-facts div {
  padding: 0 0 0.7rem;
  border-bottom: 1px solid var(--syllabus-ink);
}
.course-facts dt {
  font-family: var(--font-heavy);
  font-size: clamp(1.35rem, 2.2vw, 2rem);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.course-facts dd { margin-top: 0.45rem; color: var(--syllabus-muted); font-size: 0.68rem; line-height: 1.3; }
.course-phases { margin-top: 2.5rem !important; }
.course-phases div {
  padding: 1rem 0;
  border-top: 1px solid var(--syllabus-rule);
}
.course-phases dt { color: var(--syllabus-muted); font-size: 0.72rem; }
.course-phases dd { margin-top: 0.35rem; font-size: 0.9rem; line-height: 1.5; }

.assessment-overview {
  margin-top: 2.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--syllabus-ink);
}
.assessment-overview header {
  display: block;
}
.assessment-overview header .eyebrow { margin-bottom: 0.55rem !important; }
.assessment-overview header h2 { font-size: clamp(1.35rem, 2vw, 1.9rem); line-height: 1.1; white-space: nowrap; }
.assessment-overview header > span { display: block; margin-top: 0.45rem; color: var(--syllabus-muted); font-size: 0.78rem; text-align: right; }

.schedule-week { margin-top: clamp(6rem, 10vw, 10rem); }
.week-header {
  display: grid;
  grid-template-columns: 1.25fr 4fr 1.25fr;
  gap: 1.5rem;
  align-items: baseline;
  padding-bottom: 1.6rem;
}
.week-number { color: var(--week-color); font-size: clamp(3.5rem, 6vw, 6rem); font-weight: 700; line-height: 0.9; }
.week-header h2 { font-size: clamp(1.5rem, 2.5vw, 2.5rem); line-height: 1.25; }
.week-dates { justify-self: end; color: var(--syllabus-muted); font-size: 0.85rem; font-variant-numeric: tabular-nums; }

.schedule-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.schedule-table .col-session { width: 6%; }
.schedule-table .col-date { width: 14%; }
.schedule-table .col-theme { width: 15%; }
.schedule-table .col-content { width: 29%; }
.schedule-table .col-output { width: 24%; }
.schedule-table .col-method { width: 11%; }
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
.schedule-table .topic-matcher-cell {
  padding: 1.2rem 0 1.8rem;
  border-bottom: 1px solid var(--syllabus-rule);
}
.schedule-table .archive-demo-cell {
  padding: 1.2rem 0 1.8rem;
  border-bottom: 1px solid var(--syllabus-rule);
}
.session-overview { vertical-align: top; cursor: pointer; }
.session-overview:hover { background: color-mix(in srgb, var(--week-color) 5%, #ffffff); }
.session-overview:focus-visible { outline: 2px solid var(--syllabus-ink); outline-offset: -3px; }
.session-meta-grid {
  display: grid;
  grid-template-columns: 17% 40% minmax(0, 43%);
  gap: 0;
}
.content-points {
  display: grid;
  gap: 0.45rem;
  margin: 0;
  padding-left: 1.1rem;
}
.content-points li { padding-left: 0.15rem; }
.content-points li::marker { color: var(--week-color); }
.content-modules { margin-top: 1.35rem; }
.module-label {
  margin: 0 0 0.55rem !important;
  color: var(--syllabus-muted);
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.content-module-card {
  padding: 0.9rem 1rem;
  border: 1px solid color-mix(in srgb, var(--week-color) 62%, #ffffff);
  background: color-mix(in srgb, var(--week-color) 12%, #ffffff);
}
.content-module-card h3 {
  color: var(--syllabus-ink);
  font-family: var(--font-heavy);
  font-size: 1rem;
  line-height: 1.35;
}
.content-module-card .module-instructor { margin-top: 0.35rem !important; color: var(--week-color); font-size: 0.78rem; font-weight: 600; line-height: 1.35; }
.content-module-card .module-description { margin-top: 0.6rem !important; color: var(--syllabus-muted); font-size: 0.82rem; line-height: 1.55; }
.session-deliverables { vertical-align: top; }
.session-content.is-collapsed,
.session-deliverables.is-collapsed { padding-top: 0.7rem; padding-bottom: 0.7rem; }
.deliverable-item + .deliverable-item { margin-top: 0.85rem; padding-top: 0.85rem; border-top: 1px solid var(--syllabus-rule); }
.deliverable-item p { margin: 0 !important; }
.deliverable-item strong {
  display: inline-block;
  min-width: 2.5em;
  margin-right: 0.35rem;
  color: var(--syllabus-ink);
  font-size: inherit;
  font-weight: 600;
}
.milestone-badge {
  display: inline-flex;
  width: fit-content;
  margin-top: 0.85rem;
  padding: 0.22rem 0.45rem;
  color: var(--syllabus-ink);
  border: 1px solid var(--week-color);
  background: color-mix(in srgb, var(--week-color) 18%, #ffffff);
  font-size: 0.68rem;
  line-height: 1;
}
.empty-deliverable { color: var(--syllabus-muted); }
.session-number { color: var(--syllabus-ink); font-weight: 700; font-variant-numeric: tabular-nums; }
.session-date strong,
.session-date span { display: block; }
.session-date strong { font-variant-numeric: tabular-nums; white-space: nowrap; font-size: 0.82em; }
.session-date span { margin-top: 0.3rem; color: var(--syllabus-muted); font-size: 0.72rem; }
.session-date .holiday-note { color: var(--syllabus-orange); line-height: 1.45; }
.session-theme { font-weight: 700; }
.session-theme-main { min-width: 0; }
.session-method { color: var(--syllabus-muted); font-size: 0.78rem !important; }
.schedule-table tr.is-holiday td { color: var(--syllabus-muted); }
.schedule-table tr.is-auxiliary .session-number { color: var(--syllabus-ink); }

.word-pool { margin-top: 2.25rem; }
.word-pool-list { display: flex; flex-wrap: wrap; gap: 0.65rem; margin-top: 1rem; }
.word-pool-list span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0.55rem 1rem;
  border: 1px solid color-mix(in srgb, var(--week-color) 45%, #ffffff);
  background: color-mix(in srgb, var(--week-color) 10%, #ffffff);
  font-size: 0.86rem;
}
.word-pool-list .word-more { border-style: dashed; color: var(--syllabus-muted); }
.word-pool-note { margin-top: 1rem !important; color: var(--syllabus-muted); font-size: 0.78rem; }

.assessment-list { list-style: none; margin: 1rem 0 0; padding: 0; }
.assessment-list li {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: center;
  min-height: 0;
  padding: 0.75rem 0;
  border-top: 1px solid var(--syllabus-rule);
}
.assessment-list li:last-child { border-bottom: 1px solid var(--syllabus-rule); }
.assessment-list li div { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr); gap: 0.8rem; align-items: baseline; }
.assessment-list strong { font-size: 0.78rem; line-height: 1.35; }
.assessment-list span { color: var(--syllabus-muted); font-size: 0.68rem; line-height: 1.35; }
.assessment-list b { color: var(--syllabus-ink); font-size: 0.9rem; font-variant-numeric: tabular-nums; }

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
.assessment-list a { color: inherit; text-decoration: none; text-decoration-thickness: 1px; text-underline-offset: 0.18em; }
.assessment-list a:hover { text-decoration: underline; }
@media (max-width: 1023px) {
  .syllabus-main > .site-nav { margin-inline: clamp(3.5rem, 4vw, 4.5rem); }
  .schedule-heading { padding-top: 3rem; }
  .schedule-table td { font-size: 0.78rem; }
}

@media (max-width: 1023px) and (min-width: 768px) {
  .week-header {
    grid-template-columns: minmax(4.5rem, 1fr) minmax(0, 4fr);
    align-items: start;
    row-gap: 0.55rem;
  }
  .week-number { grid-row: span 2; }
  .week-dates {
    grid-column: 2;
    justify-self: start;
    white-space: nowrap;
  }
}

@media (max-width: 767px) {
  .syllabus-main > .site-nav { margin-inline: 1rem; }
  .syllabus-section { scroll-margin-top: 0; }
  .schedule-heading { grid-template-columns: 1fr; padding-top: 2.25rem; }
  .schedule-heading h1 { font-size: clamp(4rem, 20vw, 6.5rem); }
  .course-facts { width: min(100%, 14rem); }
  .schedule-summary > p { font-size: 1.15rem; }
  .assessment-overview header { gap: 0.45rem 0.7rem; }
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
  .session-overview { display: block !important; }
  .session-meta-grid { grid-template-columns: 1fr; gap: 0.65rem; }
  .session-meta-grid > div {
    display: grid;
    grid-template-columns: 7.5rem minmax(0, 1fr);
    gap: 1rem;
  }
  .session-meta-grid > div::before {
    content: attr(data-label);
    color: var(--syllabus-muted);
    font-size: 0.68rem;
    font-weight: 500;
    line-height: 1.4;
    letter-spacing: 0.05em;
  }
  .session-meta-grid .session-date-value {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: baseline;
  }
  .session-meta-grid .session-date-value strong,
  .session-meta-grid .session-date-value .session-day { display: inline; margin: 0; }
  .session-meta-grid .holiday-note { grid-column: 2; }
  .session-meta-grid .session-theme-main { grid-column: 2; }
  .schedule-table .session-content {
    margin-top: 1.25rem;
    padding-top: 1.35rem;
  }
  .session-content-body { min-width: 0; }
  .session-content .session-content-body { grid-column: 2; }
  .session-content .content-modules { margin-top: 1.5rem; }
  .session-content .content-module-card {
    padding: 1.1rem;
    border-width: 1px;
  }
  .session-content .content-module-card h3 { font-size: 1.12rem; }
  .session-content .content-module-card .module-instructor { font-size: 0.88rem; }
  .session-content .content-module-card .module-description { font-size: 0.92rem; line-height: 1.65; }
  .schedule-table .session-content.is-collapsed,
  .schedule-table .session-deliverables.is-collapsed { display: none; }
  .schedule-table .topic-matcher-row { padding: 1.4rem 0 2rem; }
  .schedule-table .topic-matcher-cell { display: block; padding: 0; border: 0; }
  .schedule-table .topic-matcher-cell::before { content: none; }
  .schedule-table .archive-demo-cell { display: block; padding: 0; border: 0; }
  .schedule-table .archive-demo-cell::before { content: none; }
  .schedule-table td::before { content: attr(data-label); color: var(--syllabus-muted); font-size: 0.68rem; font-weight: 500; line-height: 1.4; letter-spacing: 0.05em; }
  .schedule-table .session-number { font-size: 1.4rem; }
  .session-method { font-size: 0.85rem !important; }
  .assessment-list li div { grid-template-columns: 1fr; gap: 0.25rem; }
  .assessment-list b { font-size: 0.85rem; }
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
