import courseSchedule from './course_schedule.json'

const formatDate = (value) => {
  const [year, month, day] = value.split('-').map(Number)
  return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`
}

export const wordPool = courseSchedule.schedule[0].sessions[0].word_pool || []

export const syllabusWeeks = courseSchedule.schedule.map((week) => ({
  week: `W${week.week}`,
  title: week.week_theme,
  dates: `${formatDate(week.date_range.start)} — ${formatDate(week.date_range.end)}`,
  sessions: week.sessions.map((session) => ({
    number: String(session.session).padStart(2, '0'),
    date: formatDate(session.date),
    day: session.weekday,
    theme: session.title,
    content: session.teaching_content.join('；'),
    deliverable: session.deliverables_or_homework.join('；'),
    method: session.method,
    milestone: session.milestone,
    holidayConflict: session.holiday_conflict,
    holidayNote: session.holiday_note,
  })),
}))

export const assessmentItems = courseSchedule.assessment.map((item) => ({
  item: item.item,
  timing: item.timing,
  weight: `${item.weight_percent}%`,
}))
