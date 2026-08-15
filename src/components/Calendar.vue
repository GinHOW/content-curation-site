<template>
  <div class="calendar-container">
    <div class="calendar-layout">
      <aside class="calendar-detail" aria-live="polite" aria-label="选中日期的课程安排">
        <p class="detail-kicker">Selected date / 当日安排</p>
        <p v-if="selectedWeekHeading" class="detail-week-heading">{{ selectedWeekHeading }}</p>
        <p v-if="selectedDayTitle" class="detail-theme">{{ selectedDayTitle }}</p>
        <h3 class="detail-date">
          <span>{{ selectedDateLabel || '—' }}</span>
          <span v-if="selectedDateValue" class="detail-weekday">{{ selectedWeekday }}</span>
        </h3>

        <div v-if="selectedEvents.length" class="detail-events">
          <article
            v-for="event in selectedEvents"
            :key="`${event.date}-${event.title}-${event.type}`"
            class="detail-item"
          >
            <h4 v-if="event !== selectedEvents[0]">
              {{ formatEventTitle(event) }}
            </h4>
            <p v-if="event.courseSchedule?.holiday_conflict" class="detail-warning">
              {{ event.courseSchedule.holiday_note || '假期期间，实际安排以教务通知为准。' }}
            </p>

            <div v-if="getTeachingPoints(event).length" class="detail-block">
              <p class="detail-block-label">课程安排 / CLASS PLAN</p>
              <ul class="detail-points">
                <li v-for="point in getTeachingPoints(event)" :key="point">{{ point }}</li>
              </ul>
            </div>

            <div v-if="getDeliverables(event).length" class="detail-block">
              <p class="detail-block-label">课程产出 / DELIVERABLE</p>
              <ul class="detail-points detail-deliverables">
                <li v-for="item in getDeliverables(event)" :key="item">{{ item }}</li>
              </ul>
            </div>
          </article>
        </div>
        <p v-else class="detail-empty">
          {{ selectedKey ? '当日无课程安排。' : '本月暂无课程安排。' }}
        </p>
      </aside>

      <section class="calendar-panel" aria-label="课程日历">
        <div class="calendar-nav">
          <button @click="prevMonth" class="nav-btn" type="button" aria-label="上一个月">
            <svg class="calendar-nav-arrow" viewBox="0 0 64 64" aria-hidden="true">
              <path d="M48 32H18m0 0L32 18M18 32l14 14" />
            </svg>
          </button>
          <h2 class="month-title">{{ currentMonthLabel }}</h2>
          <button @click="nextMonth" class="nav-btn" type="button" aria-label="下一个月">
            <svg class="calendar-nav-arrow" viewBox="0 0 64 64" aria-hidden="true">
              <path d="M16 32h30m0 0L32 18m14 14L32 46" />
            </svg>
          </button>
        </div>

        <div class="calendar-weekdays" aria-hidden="true">
          <div v-for="(day, index) in weekdays" :key="index" class="weekday">
            <span class="wd-full">{{ day.full }}</span>
            <span class="wd-short">{{ day.short }}</span>
          </div>
        </div>

        <div class="calendar-grid" role="grid" :aria-label="`${currentMonthA11yLabel}课程日历`">
          <template v-for="(date, index) in calendarSlots" :key="date ? `date-${date}` : `placeholder-${index}`">
            <button
              v-if="date"
              type="button"
              role="gridcell"
              class="calendar-day"
              :class="{
                'has-event': hasEvent(date),
                'today': isToday(date),
                'selected': isSelected(date)
              }"
              :aria-label="getCellLabel(date)"
              :aria-current="isToday(date) ? 'date' : undefined"
              @click="selectDate(date)"
            >
              <span class="day-circle" aria-hidden="true">{{ hasEvent(date) ? date : '' }}</span>
            </button>
            <span v-else class="calendar-day is-placeholder" aria-hidden="true">
              <span class="day-circle"></span>
            </span>
          </template>
        </div>

        <div class="calendar-agenda" aria-label="移动端课程日程">
          <p v-if="!visibleMonthEvents.length" class="agenda-empty">本月暂无课程安排。</p>
          <article
            v-for="event in visibleMonthEvents"
            :key="`${event.date}-${event.title}-${event.type}`"
            class="agenda-item"
          >
            <time :datetime="event.date" class="agenda-date">{{ formatAgendaDate(event.date) }}</time>
            <div class="agenda-detail">
              <div class="agenda-meta">
                <span class="agenda-week">{{ formatWeek(event) }}</span>
                <span class="agenda-type" :class="event.type">{{ formatEventType(event) }}</span>
              </div>
              <strong>{{ event.title }}</strong>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'

const props = defineProps({
  events: {
    type: Array,
    default: () => []
  },
  startDate: {
    type: Date,
    default: () => new Date()
  }
})

const emit = defineEmits(['date-select'])

const currentDate = ref(new Date(props.startDate.getFullYear(), props.startDate.getMonth(), 1))
const selectedKey = ref(null)

const weekdays = [
  { full: 'MON', short: 'M' },
  { full: 'TUE', short: 'T' },
  { full: 'WED', short: 'W' },
  { full: 'THU', short: 'T' },
  { full: 'FRI', short: 'F' },
  { full: 'SAT', short: 'S' },
  { full: 'SUN', short: 'S' }
]

const monthNamesZh = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const parseEventDate = (value) => {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate())
  }

  const [year, month, day] = String(value).split('-').map(Number)
  return new Date(year, month - 1, day)
}

const formatDateKey = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const parseDateKey = (key) => {
  if (!key) return null
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const currentMonthLabel = computed(() => {
  const monthIndex = currentDate.value.getMonth()
  return `${monthNamesZh[monthIndex]} ${monthNamesEn[monthIndex]}`
})

const currentMonthA11yLabel = computed(() => {
  return `${currentDate.value.getFullYear()}/${String(currentDate.value.getMonth() + 1).padStart(2, '0')}`
})

const daysInMonth = computed(() => {
  return new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0).getDate()
})

const startOffset = computed(() => {
  const firstDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1).getDay()
  return firstDay === 0 ? 6 : firstDay - 1
})

const calendarSlots = computed(() => {
  const totalSlots = 42
  return Array.from({ length: totalSlots }, (_, index) => {
    const date = index - startOffset.value + 1
    return date > 0 && date <= daysInMonth.value ? date : null
  })
})

const eventsByDate = computed(() => {
  const map = new Map()

  props.events.forEach((event) => {
    const key = formatDateKey(parseEventDate(event.date))
    const dayEvents = map.get(key) || []
    dayEvents.push(event)
    map.set(key, dayEvents)
  })

  return map
})

const getEventsForDate = (date) => {
  if (!date) return []
  const key = formatDateKey(new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), date))
  return eventsByDate.value.get(key) || []
}

const visibleMonthEvents = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  return props.events
    .filter((event) => {
      const eventDate = parseEventDate(event.date)
      return eventDate.getFullYear() === year && eventDate.getMonth() === month
    })
    .sort((first, second) => parseEventDate(first.date) - parseEventDate(second.date))
})

const selectedDateValue = computed(() => parseDateKey(selectedKey.value))

const selectedDateLabel = computed(() => {
  if (!selectedDateValue.value) return ''
  const date = selectedDateValue.value
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
})

const selectedWeekday = computed(() => {
  if (!selectedDateValue.value) return ''
  const labels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return labels[selectedDateValue.value.getDay()]
})

const selectedEvents = computed(() => {
  return selectedKey.value ? eventsByDate.value.get(selectedKey.value) || [] : []
})

const formatEventTitle = (event) => {
  if (event.courseSchedule?.title) return event.courseSchedule.title
  return String(event.title || '').replace(/^W\d+\s+/, '')
}

const selectedWeekHeading = computed(() => {
  const event = selectedEvents.value[0]
  if (!event) return ''
  const weekTheme = getWeekTheme(event)
  return weekTheme ? `${formatWeek(event)} ${weekTheme}` : formatWeek(event)
})

const selectedDayTitle = computed(() => {
  const event = selectedEvents.value[0]
  return event ? formatEventTitle(event) : ''
})

const hasEvent = (date) => getEventsForDate(date).length > 0

const isToday = (date) => {
  const today = new Date()
  return date === today.getDate() &&
    currentDate.value.getMonth() === today.getMonth() &&
    currentDate.value.getFullYear() === today.getFullYear()
}

const isSelected = (date) => {
  const key = formatDateKey(new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), date))
  return selectedKey.value === key
}

const formatWeek = (event) => {
  if (event.week === undefined || event.week === null || event.week === '') return '—'
  return String(event.week).startsWith('W') ? event.week : `W${event.week}`
}

const formatEventType = (event) => {
  if (event.type === 'deadline') return 'DEADLINE'
  return event.courseSchedule?.method || event.session?.type || 'COURSE'
}

const formatAgendaDate = (value) => {
  const date = parseEventDate(value)
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
}

const getWeekTheme = (event) => event.courseSchedule?.weekTheme || ''

const getTeachingPoints = (event) => {
  if (event.type === 'deadline') return []
  return event.courseSchedule?.teaching_content || event.session?.points || []
}

const getDeliverables = (event) => {
  if (event.courseSchedule?.deliverables_or_homework?.length) {
    return event.courseSchedule.deliverables_or_homework
  }
  return event.homework || []
}

const getCellLabel = (date) => {
  const events = getEventsForDate(date)
  const dateLabel = `${currentDate.value.getFullYear()}/${String(currentDate.value.getMonth() + 1).padStart(2, '0')}/${String(date).padStart(2, '0')}`
  if (!events.length) return `${dateLabel}，无课程安排`
  return `${dateLabel}，${events.map((event) => event.title).join('；')}`
}

const selectDate = (date) => {
  const value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), date)
  selectedKey.value = formatDateKey(value)
  emit('date-select', value)
}

const setDefaultSelection = () => {
  const firstEvent = visibleMonthEvents.value[0]
  selectedKey.value = firstEvent ? formatDateKey(parseEventDate(firstEvent.date)) : null
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

watch(currentDate, setDefaultSelection)

watch(() => props.startDate, (newDate) => {
  currentDate.value = new Date(newDate.getFullYear(), newDate.getMonth(), 1)
})

onMounted(setDefaultSelection)
</script>

<style scoped>
.calendar-container {
  --calendar-ink: var(--home-ink, #111111);
  --calendar-muted: var(--home-muted, #747474);
  --calendar-rule: var(--home-rule, #dddddd);
  --calendar-paper: var(--home-paper, #ffffff);
  --calendar-selected: var(--home-yellow, #f2ef78);
  --calendar-today: var(--home-orange, #f05a2a);

  width: 100%;
  color: var(--calendar-ink);
  background: var(--calendar-paper);
}

.calendar-layout {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  gap: clamp(2rem, 5vw, 5rem);
  align-items: start;
}

.calendar-detail {
  min-width: 0;
  min-height: 100%;
  padding: 0 clamp(1rem, 2vw, 2rem) 0 0;
  border-right: 1px solid var(--calendar-rule);
}

.detail-kicker,
.detail-week,
.detail-type,
.agenda-week,
.agenda-type {
  font-size: 0.68rem;
  line-height: 1.35;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.detail-kicker {
  margin: 0 0 1.3rem;
  color: var(--calendar-muted);
}

.detail-date {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.55rem;
  margin: 0;
  font-family: var(--font-heavy);
  font-size: clamp(1rem, 2vw, 2rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.01em;
}

.detail-weekday {
  margin: 0;
  color: var(--calendar-ink);
  font-family: var(--font-body);
  font-size: clamp(0.95rem, 1.45vw, 1.35rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.04em;
}

.detail-week-heading {
  margin: 0 0 0.5rem;
  color: var(--calendar-muted);
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.4;
}

.detail-events {
  display: grid;
  gap: 1.5rem;
  margin-top: clamp(2rem, 5vw, 4rem);
}

.detail-item {
  padding-top: 1rem;
  border-top: 1px solid var(--calendar-rule);
}

.agenda-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  align-items: baseline;
}

.detail-week,
.agenda-week {
  color: var(--calendar-muted);
}

.detail-type,
.agenda-type {
  color: var(--calendar-ink);
}

.detail-type.deadline,
.agenda-type.deadline {
  color: var(--calendar-today);
}

.detail-item h4 {
  margin: 0.6rem 0 0;
  font-size: clamp(1rem, 1.7vw, 1.35rem);
  font-weight: 600;
  line-height: 1.45;
}

.detail-theme {
  max-width: 24rem;
  margin: 0 0 1rem;
  color: var(--calendar-ink);
  font-size: clamp(1rem, 1.7vw, 1.35rem);
  font-weight: 700;
  line-height: 1.5;
}

.detail-warning {
  margin: 0.9rem 0 0;
  padding-left: 0.65rem;
  border-left: 2px solid var(--calendar-today);
  color: var(--calendar-today);
  font-size: 0.82rem;
  line-height: 1.55;
}

.detail-block {
  margin-top: 1.25rem;
}

.detail-block-label {
  margin: 0 0 0.55rem;
  color: var(--calendar-muted);
  font-size: 0.66rem;
  line-height: 1.35;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.detail-points {
  display: grid;
  gap: 0.45rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.86rem;
  line-height: 1.55;
}

.detail-points li {
  position: relative;
  padding-left: 1rem;
}

.detail-points li::before {
  position: absolute;
  top: 0;
  left: 0;
  content: '—';
  color: var(--calendar-muted);
}

.detail-empty,
.agenda-empty {
  margin: 2.5rem 0 0;
  color: var(--calendar-muted);
  font-size: 0.95rem;
  line-height: 1.6;
}

.calendar-panel {
  min-width: 0;
}

.calendar-nav {
  display: grid;
  grid-template-columns: 2.75rem 1fr 2.75rem;
  gap: 1rem;
  align-items: center;
  padding: 0 0 1rem;
  border-bottom: 1px solid var(--calendar-ink);
}

.month-title {
  margin: 0;
  color: var(--calendar-ink);
  font-family: var(--font-heavy);
  font-size: clamp(1.4rem, 3vw, 2.4rem);
  font-weight: 700;
  line-height: 1.1;
  text-align: center;
  letter-spacing: 0.02em;
  text-transform: none;
}

.nav-btn {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  place-items: center;
  border: 1px solid var(--calendar-ink);
  border-radius: 0;
  color: var(--calendar-ink);
  background: transparent;
  font: inherit;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 180ms ease, color 180ms ease;
}

.calendar-nav-arrow {
  width: 2.1rem;
  height: 2.1rem;
  color: currentColor;
}

.calendar-nav-arrow path {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.calendar-nav-arrow path {
  stroke-width: 3.5;
}

.nav-btn:hover,
.nav-btn:focus-visible {
  color: var(--calendar-paper);
  background: var(--calendar-ink);
}

.calendar-weekdays,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.calendar-weekdays {
  border-bottom: 1px solid var(--calendar-ink);
}

.weekday {
  padding: 0.75rem 0.25rem;
  color: var(--calendar-muted);
  font-size: 0.68rem;
  line-height: 1.3;
  text-align: center;
  letter-spacing: 0.08em;
}

.wd-short {
  display: none;
}

.calendar-grid {
  border-left: 1px solid var(--calendar-rule);
}

.calendar-day {
  display: grid;
  min-width: 0;
  min-height: clamp(4.75rem, 8vw, 6.6rem);
  padding: 0;
  place-items: center;
  border: 0;
  border-right: 1px solid var(--calendar-rule);
  border-bottom: 1px solid var(--calendar-rule);
  border-radius: 0;
  color: var(--calendar-ink);
  background: transparent;
  font: inherit;
  cursor: pointer;
  transition: background-color 180ms ease;
}

.calendar-day:hover {
  background: rgba(0, 0, 0, 0.025);
}

.calendar-day:focus-visible {
  position: relative;
  z-index: 1;
  outline: 2px solid var(--calendar-ink);
  outline-offset: -3px;
}

.calendar-day.is-placeholder {
  cursor: default;
  pointer-events: none;
}

.day-circle {
  display: grid;
  width: clamp(2.65rem, 5vw, 4.3rem);
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid var(--calendar-rule);
  border-radius: 50%;
  color: var(--calendar-ink);
  font-family: var(--font-heavy);
  font-size: clamp(1rem, 2vw, 1.35rem);
  line-height: 1;
  transition: background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.calendar-day.has-event .day-circle {
  border-color: var(--calendar-ink);
}

.calendar-day.selected .day-circle {
  border-color: var(--calendar-ink);
  background: var(--calendar-selected);
}

.calendar-day.today .day-circle {
  box-shadow: 0 0 0 2px var(--calendar-today);
}

.calendar-day.is-placeholder .day-circle {
  border-color: var(--calendar-rule);
}

.calendar-agenda {
  display: none;
}

@media (max-width: 767px) {
  .calendar-layout {
    display: block;
  }

  .calendar-detail,
  .calendar-weekdays,
  .calendar-grid {
    display: none;
  }

  .calendar-nav {
    padding: 0.8rem 0;
  }

  .calendar-agenda {
    display: grid;
  }

  .agenda-empty {
    padding: 1rem 0;
  }

  .agenda-item {
    display: grid;
    grid-template-columns: 5.25rem minmax(0, 1fr);
    gap: 1rem;
    align-items: start;
    min-height: 4rem;
    padding: 0.9rem 0;
    border-bottom: 1px solid var(--calendar-rule);
  }

  .agenda-date {
    padding-top: 0.05rem;
    font-family: var(--font-heavy);
    font-size: 0.85rem;
    letter-spacing: 0.04em;
  }

  .agenda-detail {
    display: grid;
    gap: 0.35rem;
    min-width: 0;
  }

  .agenda-detail strong {
    font-size: 0.95rem;
    font-weight: 500;
    line-height: 1.45;
  }
}

@media (max-width: 480px) {
  .wd-full {
    display: none;
  }

  .wd-short {
    display: inline;
  }

  .agenda-item {
    grid-template-columns: 6.8rem minmax(0, 1fr);
    gap: 0.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-btn,
  .calendar-day,
  .day-circle {
    transition-duration: 0.01ms;
  }
}
</style>
