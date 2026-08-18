<template>
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
            <li v-for="(item, index) in getDeliverables(event)" :key="`${event.date}-deliverable-${index}`">
              <template v-if="item.text">{{ item.text }}</template>
              <div v-else class="deliverable-fields">
                <p v-if="item.content"><strong>内容</strong><span>{{ item.content }}</span></p>
                <p v-if="item.form"><strong>形式</strong><span>{{ item.form }}</span></p>
                <p v-if="item.quantity"><strong>数量</strong><span>{{ item.quantity }}</span></p>
              </div>
            </li>
          </ul>
        </div>
      </article>
    </div>
    <p v-else class="detail-empty">
      {{ selectedKey ? '当日无课程安排。' : '本月暂无课程安排。' }}
    </p>
  </aside>
</template>

<script setup>
import {
  formatEventTitle,
  getTeachingPoints,
  getDeliverables,
} from '../../composables/useCalendarSchedule.js'

defineProps({
  selectedWeekHeading: {
    type: String,
    default: '',
  },
  selectedDayTitle: {
    type: String,
    default: '',
  },
  selectedDateLabel: {
    type: String,
    default: '',
  },
  selectedDateValue: {
    type: Date,
    default: null,
  },
  selectedWeekday: {
    type: String,
    default: '',
  },
  selectedEvents: {
    type: Array,
    default: () => [],
  },
  selectedKey: {
    type: String,
    default: null,
  },
})
</script>

<style scoped>
.calendar-detail {
  min-width: 0;
  min-height: 100%;
  padding: 0 clamp(1rem, 2vw, 2rem) 0 0;
  border-right: 1px solid var(--calendar-rule);
}

.detail-kicker {
  margin: 0 0 1.3rem;
  color: var(--calendar-muted);
  font-size: 0.68rem;
  line-height: 1.35;
  letter-spacing: 0.07em;
  text-transform: uppercase;
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
  content: '·';
  color: var(--calendar-muted);
}

.detail-deliverables li {
  padding-left: 0;
}

.detail-deliverables li::before {
  content: none;
}

.deliverable-fields {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
}

.deliverable-fields p {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  column-gap: 0.85rem;
  row-gap: 0.35rem;
  margin: 0;
  overflow-wrap: anywhere;
}

.deliverable-fields strong {
  color: var(--calendar-muted);
  font-size: inherit;
  font-weight: 400;
  white-space: nowrap;
}

.detail-empty {
  margin: 2.5rem 0 0;
  color: var(--calendar-muted);
  font-size: 0.95rem;
  line-height: 1.6;
}

@media (max-width: 767px) {
  .calendar-detail {
    display: none;
  }
}
</style>
