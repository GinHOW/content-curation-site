import { computed, ref, watch, onMounted } from 'vue'

const monthNamesZh = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export const parseEventDate = (value) => {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate())
  }
  const [year, month, day] = String(value).split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const formatDateKey = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export const parseDateKey = (key) => {
  if (!key) return null
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const formatEventTitle = (event) => {
  if (!event) return ''
  if (event.courseSchedule?.title) return event.courseSchedule.title
  return String(event.title || '').replace(/^W\d+\s+/, '')
}

export const formatWeek = (event) => {
  if (!event || event.week === undefined || event.week === null || event.week === '') return '—'
  return String(event.week).startsWith('W') ? event.week : `W${event.week}`
}

export const formatEventType = (event) => {
  if (!event) return 'COURSE'
  if (event.type === 'deadline') return 'DEADLINE'
  return event.courseSchedule?.method || event.session?.type || 'COURSE'
}

export const getWeekTheme = (event) => event?.courseSchedule?.weekTheme || ''

export const getTeachingPoints = (event) => {
  if (!event || event.type === 'deadline') return []
  return event.courseSchedule?.teaching_content || event.session?.points || []
}

export const getDeliverables = (event) => {
  if (!event) return []
  if (event.courseSchedule?.deliverables_or_homework?.length) {
    return event.courseSchedule.deliverables_or_homework
  }
  return event.homework || []
}

export function useCalendarSchedule(props, emit) {
  const currentDate = ref(new Date(props.startDate.getFullYear(), props.startDate.getMonth(), 1))
  const selectedKey = ref(null)

  const currentMonthZh = computed(() => monthNamesZh[currentDate.value.getMonth()])
  const currentMonthEn = computed(() => monthNamesEn[currentDate.value.getMonth()])

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
    return (
      date === today.getDate() &&
      currentDate.value.getMonth() === today.getMonth() &&
      currentDate.value.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (date) => {
    const key = formatDateKey(new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), date))
    return selectedKey.value === key
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

  return {
    currentDate,
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
  }
}
