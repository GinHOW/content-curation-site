<template>
  <section
    id="course-calendar"
    class="home-section calendar-section"
    data-section
    aria-labelledby="calendar-title"
  >
    <div class="section-grid calendar-header-grid">
      <div class="section-title-column">
        <p class="eyebrow">Schedule / 2026</p>
        <h2 id="calendar-title">课程<br />日程</h2>
      </div>
      <div class="section-copy-column calendar-copy">
        <p class="lead-copy">安排提示：10/1 与 10/5 国庆假期不上课；第 2 周第二次课按 9/17（周四）安排；9/22（周二）为课外实践；9/29（周二）空间现场勘探拍摄由全体教员授课；第 6–8 周上课时间为周一、周三、周四。实际安排以教务通知为准。</p>
        <p class="micro-copy">开课 {{ courseStartDate }} · {{ cycle }}</p>
      </div>
    </div>

    <div class="full-span calendar-frame">
      <Calendar :events="events" :start-date="startDate" />
    </div>
  </section>
</template>

<script setup>
import Calendar from '../calendar/Calendar.vue'

defineProps({
  events: {
    type: Array,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  courseStartDate: {
    type: String,
    required: true,
  },
  cycle: {
    type: String,
    required: true,
  },
})

</script>
