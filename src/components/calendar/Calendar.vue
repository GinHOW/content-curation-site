<template>
  <div class="calendar-container">
    <div class="calendar-layout">
      <CalendarDetailPanel
        :selected-week-heading="selectedWeekHeading"
        :selected-day-title="selectedDayTitle"
        :selected-date-label="selectedDateLabel"
        :selected-date-value="selectedDateValue"
        :selected-weekday="selectedWeekday"
        :selected-events="selectedEvents"
        :selected-key="selectedKey"
      />

      <section class="calendar-panel" aria-label="课程日历">
        <div class="calendar-nav">
          <button @click="prevMonth" class="nav-btn" type="button" aria-label="上一个月">
            <svg class="calendar-nav-arrow" viewBox="0 0 64 64" aria-hidden="true">
              <path d="M48 32H18m0 0L32 18M18 32l14 14" />
            </svg>
          </button>
          <h2 class="month-title">
            <span class="month-title-zh">{{ currentMonthZh }}</span>
            <span class="month-title-en">{{ currentMonthEn }}</span>
          </h2>
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
              <span class="day-circle" aria-hidden="true">
                <span v-if="hasEvent(date)">{{ date }}</span>
                <span v-else-if="isToday(date)" class="today-icon">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.72 5.28l-2.12 2.12M7.4 16.6l-2.12 2.12M18.72 18.72l-2.12-2.12M7.4 7.4L5.28 5.28" />
                  </svg>
                </span>
              </span>
            </button>
            <span v-else class="calendar-day is-placeholder" aria-hidden="true">
              <span class="day-circle"></span>
            </span>
          </template>
        </div>

        <CalendarAgendaView :visible-month-events="visibleMonthEvents" />
      </section>
    </div>

    <div class="calendar-back-to-top">
      <BackToTop />
    </div>
  </div>
</template>

<script setup>
import CalendarDetailPanel from './CalendarDetailPanel.vue'
import CalendarAgendaView from './CalendarAgendaView.vue'
import BackToTop from '../common/BackToTop.vue'
import { useCalendarSchedule } from '../../composables/useCalendarSchedule.js'

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

const weekdays = [
  { full: 'MON', short: 'M' },
  { full: 'TUE', short: 'T' },
  { full: 'WED', short: 'W' },
  { full: 'THU', short: 'T' },
  { full: 'FRI', short: 'F' },
  { full: 'SAT', short: 'S' },
  { full: 'SUN', short: 'S' }
]

const {
  selectedKey,
  currentMonthZh,
  currentMonthEn,
  currentMonthA11yLabel,
  calendarSlots,
  visibleMonthEvents,
  selectedDateValue,
  selectedDateLabel,
  selectedWeekday,
  selectedEvents,
  selectedWeekHeading,
  selectedDayTitle,
  hasEvent,
  isToday,
  isSelected,
  getCellLabel,
  selectDate,
  prevMonth,
  nextMonth,
} = useCalendarSchedule(props, emit)
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

.calendar-back-to-top {
  display: flex;
  justify-content: flex-end;
  margin-top: clamp(2rem, 4vw, 4rem);
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

.month-title-zh {
  display: inline;
}

.month-title-en {
  display: inline;
  margin-left: 0.55rem;
}

.month-title-en::before {
  content: '/ ';
  color: var(--calendar-muted);
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  border: 1px solid var(--calendar-ink);
  color: var(--calendar-ink);
  background: var(--calendar-paper);
  cursor: pointer;
  transition: background-color 180ms ease, color 180ms ease;
}

.nav-btn:hover {
  color: var(--calendar-paper);
  background: var(--calendar-ink);
}

.calendar-nav-arrow {
  width: 1rem;
  height: 1rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 5;
  stroke-linecap: square;
  stroke-linejoin: miter;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: clamp(0.35rem, 1vw, 0.75rem);
  padding: 1.2rem 0;
  border-bottom: 1px solid var(--calendar-rule);
}

.weekday {
  color: var(--calendar-muted);
  font-family: var(--font-heavy);
  font-size: clamp(0.72rem, 1.1vw, 0.95rem);
  font-weight: 700;
  line-height: 1;
  text-align: center;
  letter-spacing: 0.08em;
}

.wd-full {
  display: inline;
}

.wd-short {
  display: none;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: clamp(0.35rem, 1vw, 0.75rem);
  padding-top: clamp(0.75rem, 1.6vw, 1.4rem);
}

.calendar-day {
  display: grid;
  position: relative;
  place-items: center;
  min-width: 0;
  padding: clamp(0.2rem, 0.5vw, 0.4rem) 0;
  border: 0;
  background: transparent;
  cursor: default;
}

.calendar-day.has-event {
  cursor: pointer;
}

.calendar-day:focus-visible {
  outline: 2px solid var(--calendar-ink);
  outline-offset: 2px;
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

.today-icon {
  display: grid;
  width: 1rem;
  height: 1rem;
  place-items: center;
  color: var(--calendar-selected);
}

.calendar-day.today.selected .today-icon {
  color: var(--calendar-ink);
}

.today-icon svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.5;
}

.calendar-day.is-placeholder .day-circle {
  border-color: var(--calendar-rule);
}

@media (max-width: 767px) {
  .calendar-layout {
    display: block;
  }

  .calendar-weekdays,
  .calendar-grid {
    display: none;
  }

  .calendar-nav {
    padding: 0.8rem 0;
  }

  .month-title {
    display: flex;
    flex-direction: column;
    gap: 0.08rem;
  }

  .month-title-en {
    color: var(--calendar-muted);
    font-family: var(--font-body);
    font-size: 0.58em;
    font-weight: 500;
    line-height: 1.2;
    letter-spacing: 0.08em;
  }

  .month-title-en::before {
    content: none;
  }
}

@media (max-width: 480px) {
  .wd-full {
    display: none;
  }

  .wd-short {
    display: inline;
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
