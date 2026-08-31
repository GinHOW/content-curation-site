import courseSchedule from '../data/course/schedule.json'

const formatEventDate = (value, year) => {
  const [, month, day] = value.split('-')
  return `${year}-${month}-${day}`
}

const buildEvent = (week, session, year) => {
  const date = formatEventDate(session.date, year)
  const courseScheduleItem = {
    ...session,
    date,
    week: week.week,
    weekTheme: week.week_theme,
  }

  return {
    date,
    title: `W${week.week} ${session.title}`,
    type: 'course',
    week: week.week,
    session: {
      type: session.method,
      title: session.title,
      points: session.teaching_content,
    },
    courseSchedule: courseScheduleItem,
  }
}

export function buildCourseEvents(year = 2026) {
  const regularEvents = courseSchedule.schedule.flatMap((week) => (
    week.sessions
      .filter((session) => !session.cancelled)
      .map((session) => buildEvent(week, session, year))
  ))

  const additionalEvents = (courseSchedule.schedule_adjustment.additional_sessions || [])
    .map((session) => {
      const week = courseSchedule.schedule.find((item) => item.week === session.week)
      return buildEvent(week, session, year)
    })

  return [...regularEvents, ...additionalEvents]
    .sort((a, b) => a.date.localeCompare(b.date))
}
