<template>
  <div class="calendar-agenda" aria-label="移动端课程日程">
    <p v-if="!visibleMonthEvents.length" class="agenda-empty">本月暂无课程安排。</p>
    <article
      v-for="event in visibleMonthEvents"
      :key="`${event.date}-${event.title}-${event.type}`"
      class="agenda-item"
    >
      <time :datetime="event.date" class="agenda-date" :aria-label="formatAgendaDate(event.date)">
        <span class="agenda-day-circle">{{ formatAgendaDay(event.date) }}</span>
      </time>
      <div class="agenda-detail">
        <div class="agenda-meta">
          <span class="agenda-week">{{ formatWeek(event) }}</span>
          <span class="agenda-type" :class="event.type">{{ formatEventType(event) }}</span>
        </div>
        <strong>{{ formatEventTitle(event) }}</strong>
      </div>
    </article>
  </div>
</template>

<script setup>
import {
  parseEventDate,
  formatEventTitle,
  formatWeek,
  formatEventType,
} from '../../composables/useCalendarSchedule.js'

defineProps({
  visibleMonthEvents: {
    type: Array,
    default: () => [],
  },
})

const formatAgendaDate = (value) => {
  const date = parseEventDate(value)
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
}

const formatAgendaDay = (value) => parseEventDate(value).getDate()
</script>

<style scoped>
.calendar-agenda {
  display: none;
}

.agenda-empty {
  margin: 2.5rem 0 0;
  color: var(--calendar-muted, #747474);
  font-size: 0.95rem;
  line-height: 1.6;
}

.agenda-week,
.agenda-type {
  font-size: 0.68rem;
  line-height: 1.35;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.agenda-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  align-items: baseline;
}

.agenda-week {
  color: var(--calendar-muted, #747474);
}

.agenda-type {
  color: var(--calendar-ink, #111111);
}

.agenda-type.deadline {
  color: var(--calendar-today, #f05a2a);
}

@media (max-width: 767px) {
  .calendar-agenda {
    display: grid;
  }

  .agenda-empty {
    padding: 1rem 0;
  }

  .agenda-item {
    display: grid;
    grid-template-columns: 4rem minmax(0, 1fr);
    gap: 0.75rem;
    align-items: start;
    min-height: 4rem;
    padding: 0.9rem 0;
    border-bottom: 1px solid var(--calendar-rule, #dddddd);
  }

  .agenda-date {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    padding-top: 0;
  }

  .agenda-day-circle {
    display: grid;
    width: 2.65rem;
    aspect-ratio: 1;
    place-items: center;
    border: 1px solid var(--calendar-ink, #111111);
    border-radius: 50%;
    color: var(--calendar-ink, #111111);
    font-family: var(--font-heavy);
    font-size: 1rem;
    line-height: 1;
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
  .agenda-item {
    grid-template-columns: 4rem minmax(0, 1fr);
    gap: 0.5rem;
  }
}
</style>
