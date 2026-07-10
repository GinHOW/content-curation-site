<template>
  <div class="calendar-container">
    <!-- 月份导航 -->
    <div class="calendar-nav">
      <button @click="prevMonth" class="nav-btn">&lt;</button>
      <h2 class="month-title">{{ currentMonthLabel }}</h2>
      <button @click="nextMonth" class="nav-btn">&gt;</button>
    </div>

    <!-- 星期标题 -->
    <div class="calendar-weekdays">
      <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
    </div>

    <!-- 日期网格 -->
    <div class="calendar-grid">
      <!-- 空白填充 -->
      <div v-for="n in startOffset" :key="'empty-' + n" class="calendar-cell empty"></div>
      
      <!-- 日期单元格 -->
      <div 
        v-for="date in daysInMonth" 
        :key="date" 
        class="calendar-cell"
        :class="{ 
          'has-event': hasEvent(date),
          'today': isToday(date),
          'selected': isSelected(date)
        }"
        @click="selectDate(date)"
      >
        <div class="cell-date">{{ date }}</div>
        
        <!-- 事件列表 -->
        <div v-if="getEvents(date).length" class="cell-events">
          <div 
            v-for="(event, idx) in getEvents(date)" 
            :key="idx" 
            class="event-item"
            :class="[event.type, { truncated: isItemTruncated(date, idx) }]"
          >
            <template v-if="isItemTruncated(date, idx)">
              <span class="event-text-inner" :style="{ '--duration': getMarqueeDuration(date, idx) }">
                <span class="event-text-copy">{{ event.title }}</span>
                <span class="event-text-copy" aria-hidden="true">{{ event.title }}</span>
              </span>
            </template>
            <template v-else>{{ event.title }}</template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

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

const currentDate = ref(new Date(props.startDate))
const selectedDate = ref(null)

// 文本溢出检测
const scrollOffsets = ref(new Map())

const checkOverflows = () => {
  nextTick(() => {
    const items = document.querySelectorAll('.event-item')
    const newOffsets = new Map()
    items.forEach(el => {
      const overflow = el.scrollWidth - el.clientWidth
      if (overflow > 0) {
        const key = el.closest('.calendar-cell')?.querySelector('.cell-date')?.textContent + '-' +
                    Array.from(el.parentElement.children).indexOf(el)
        newOffsets.set(key, overflow)
      }
    })
    scrollOffsets.value = newOffsets
  })
}

const isItemTruncated = (date, idx) => {
  return scrollOffsets.value.has(`${date}-${idx}`)
}

const getItemOffset = (date, idx) => {
  return scrollOffsets.value.get(`${date}-${idx}`) || 0
}

const getMarqueeDuration = (date, idx) => {
  const overflow = getItemOffset(date, idx)
  // 溢出越多，滚动越慢（保证可读性）
  const seconds = Math.max(3, overflow / 20)
  return seconds + 's'
}

// 星期名称
const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

// 当前月份标签
const currentMonthLabel = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return `${year}.${String(month).padStart(2, '0')}`
})

// 当月天数
const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return new Date(year, month + 1, 0).getDate()
})

// 起始偏移量（当月第一天是星期几）
const startOffset = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  // 将星期日(0)转换为6，星期一(1)转换为0
  return firstDay === 0 ? 6 : firstDay - 1
})

// 检查日期是否有事件
const hasEvent = (date) => {
  return getEvents(date).length > 0
}

// 获取某天的事件
const getEvents = (date) => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const targetDate = new Date(year, month, date)
  
  return props.events.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate.toDateString() === targetDate.toDateString()
  })
}

// 检查是否是今天
const isToday = (date) => {
  const today = new Date()
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return date === today.getDate() && 
         month === today.getMonth() && 
         year === today.getFullYear()
}

// 检查是否被选中
const isSelected = (date) => {
  if (!selectedDate.value) return false
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return date === selectedDate.value.getDate() && 
         month === selectedDate.value.getMonth() && 
         year === selectedDate.value.getFullYear()
}

// 选择日期
const selectDate = (date) => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  selectedDate.value = new Date(year, month, date)
  emit('date-select', selectedDate.value)
}

// 上一月
const prevMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
  selectedDate.value = null
}

// 下一月
const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
  selectedDate.value = null
}

// 监听外部startDate变化
watch(() => props.startDate, (newDate) => {
  currentDate.value = new Date(newDate)
  selectedDate.value = null
})

// 月份切换时重新检测溢出
watch(currentMonthLabel, () => {
  checkOverflows()
})

onMounted(() => {
  checkOverflows()
})
</script>

<style scoped>
.calendar-container {
  background: var(--white);
  border: 3px solid #000;
  box-shadow: 6px 6px 0 #000;
}

/* 月份导航 */
.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 3px solid #000;
  background: var(--blue-light);
  color: var(--white);
}

.month-title {
  font-family: var(--font-heavy);
  font-weight: 900;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
}

.nav-btn {
  background: transparent;
  border: 2px solid var(--white);
  color: var(--white);
  font-size: 1.5rem;
  font-weight: 700;
  width: 48px;
  height: 48px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: var(--white);
  color: var(--blue-light);
}

/* 星期标题 */
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  min-width: 0;
  border-bottom: 3px solid #000;
  background: #f5f5f5;
}

.weekday {
  padding: 1rem 0.5rem;
  text-align: center;
  font-family: var(--font-heavy);
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #000;
  border-right: 2px solid #000;
}

.weekday:last-child {
  border-right: none;
}

/* 日期网格 */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  min-width: 0;
}

.calendar-cell {
  background: var(--white);
  min-height: 120px;
  padding: 0.75rem;
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
  border-right: 2px solid #000;
  border-bottom: 2px solid #000;
  overflow: hidden;
  min-width: 0;
}

.calendar-cell:nth-child(7n) {
  border-right: none;
}

.calendar-cell:hover {
  background: #f0f0f0;
}

.calendar-cell.empty {
  background: #e0e0e0;
  cursor: default;
}

.calendar-cell.today {
  border: 2px solid var(--red-stamp);
}

.calendar-cell.selected {
  background: var(--blue-light);
  color: var(--white);
}

.cell-date {
  font-family: var(--font-heavy);
  font-weight: 900;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #000;
}

.calendar-cell.selected .cell-date {
  color: var(--white);
}

/* 事件列表 */
.cell-events {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.event-item {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-left: 3px solid #000;
  line-height: 1.3;
  overflow: hidden;
  white-space: nowrap;
}

.event-item:not(.truncated) {
  text-overflow: ellipsis;
}

/* 无缝循环滚动 */
.event-text-inner {
  display: inline-flex;
  animation-play-state: paused;
}

.calendar-cell:hover .event-text-inner {
  animation: marquee-loop var(--duration, 4s) linear infinite;
  animation-play-state: running;
}

.event-text-copy {
  display: inline-block;
  padding-right: 3em;
  flex-shrink: 0;
}

@keyframes marquee-loop {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.event-item.course {
  border-left-color: var(--blue-light);
  background: rgba(27, 78, 216, 0.1);
}

.event-item.deadline {
  border-left-color: var(--red-stamp);
  background: rgba(214, 53, 17, 0.1);
  font-weight: 700;
}

.event-item.exhibition {
  border-left-color: #000;
  background: rgba(0, 0, 0, 0.05);
  font-weight: 700;
}

.calendar-cell.selected .event-item {
  background: rgba(255, 255, 255, 0.2);
  border-left-color: var(--white);
}

/* 响应式 */
@media (max-width: 768px) {
  .calendar-cell {
    min-height: 80px;
    padding: 0.5rem;
  }
  
  .cell-date {
    font-size: 1rem;
  }
  
  .event-item {
    font-size: 0.6rem;
    padding: 0.15rem 0.3rem;
  }
  
  .weekday {
    font-size: 0.7rem;
    padding: 0.75rem 0.25rem;
  }
  
  .nav-btn {
    width: 36px;
    height: 36px;
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .calendar-cell {
    min-height: 60px;
    padding: 0.4rem;
  }
  
  .cell-date {
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }
  
  .event-item {
    font-size: 0.55rem;
    padding: 0.1rem 0.2rem;
  }
  
  .month-title {
    font-size: 1.2rem;
  }
}
</style>
