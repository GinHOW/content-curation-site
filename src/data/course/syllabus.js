import courseSchedule from './schedule.json'

const formatDate = (value) => {
  const [year, month, day] = value.split('-').map(Number)
  return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`
}

const normalizeDeliverables = (items = []) => items.map((item) => {
  if (typeof item === 'string') return { content: item, form: '', quantity: '' }
  return {
    content: item.content || '',
    form: item.form || '',
    quantity: item.quantity || '',
  }
})

const referenceFiles = [
  '2-1.webp', '2-2.webp',
  '3-1.webp', '3-2.webp',
  {
    filename: '4-1.webp',
    url: 'https://euro-vision.net/',
    title: 'Euro-Vision',
  },
  // {
  //   filename: '4-2.webp',
  //   url: 'https://euro-vision.net/',
  //   title: 'Euro-Vision',
  // },
  {
    filename: '4-3.webp',
    url: 'https://cyberfeminismindex.com/',
    title: 'Cyberfeminism Index',
    embed: false,
  },
  {
    filename: '4-4.webp',
    url: 'https://www.thetechnate.net/',
    title: 'The Technate',
  },
  {
    filename: '4-5.webp',
    url: 'http://intergraphicview.com/',
    title: 'InterGraphicView',
  },
  // {
  //   filename: '4-6.webp',
  //   url: 'http://intergraphicview.com/',
  //   title: 'InterGraphicView',
  // },
  {
    filename: '4-7.webp',
    url: 'https://helmhaus.org/en/',
    title: 'Helmhaus',
  },
  {
    filename: '4-8.webp',
    url: 'https://www.archivalconsciousness.org',
    title: 'Archival Consciousness',
  },
  {
    filename: '4-9.webp',
    url: 'https://www.polecat.agency/',
    title: 'Polecat Agency',
  },
  {
    filename: '4-10.webp',
    url: 'https://pudding.cool/2025/07/street-view/',
    title: 'The Pudding · Street View',
  },
  '6-1.webp', '6-2.webp',
  '5-1.webp',
  '10-1.webp', '10-2.webp', '10-3.webp',
  '11-1.webp', '11-2.webp', '11-3.webp', '11-4.webp', '11-5.webp', '11-6.webp', '11-7.webp',
  '12-1.webp', '12-2.webp',
  '13-1.webp', '13-2.webp', '13-3.webp',
  '14-1.webp', '14-2.webp', '14-3.webp', '14-4.webp',
]

// 课程中已确认网址的参考项同时作为资源页的网页入口；本地截图仍只服务课程页预览。
export const syllabusWebReferences = referenceFiles
  .filter((item) => typeof item !== 'string' && item.url)
  .map((item) => ({
    filename: item.filename,
    session: Number(item.filename.split('-')[0]),
    url: item.url,
    title: item.title,
    embed: item.embed !== false,
  }))

const referencesBySession = referenceFiles.reduce((map, filename) => {
  const item = typeof filename === 'string' ? { filename } : filename
  const session = Number(item.filename.split('-')[0])
  if (!map[session]) map[session] = []
  map[session].push({
    src: '/assets/syllabus/references/' + item.filename,
    url: item.url || '',
    title: item.title || '',
    embed: item.embed !== false,
  })
  return map
}, {})

export const syllabusWeeks = courseSchedule.schedule.map((week) => ({
  week: `W${week.week}`,
  title: week.week_theme,
  dates: `${formatDate(week.date_range.start)} — ${formatDate(week.date_range.end)}`,
  sessions: week.sessions.map((session) => ({
    anchorId: `session-${week.week}-${session.session}-${session.date}`,
    number: session.session === '+' ? '+' : String(session.session).padStart(2, '0'),
    date: formatDate(session.date),
    day: session.weekday,
    theme: session.title,
    contentPoints: session.teaching_content || [],
    deliverables: normalizeDeliverables(session.deliverables_or_homework),
    method: session.method,
    references: referencesBySession[Number(session.session)] || [],
    milestone: session.milestone,
    auxiliary: session.auxiliary,
    holiday: session.cancelled,
    holidayConflict: session.holiday_conflict,
    holidayNote: session.holiday_note,
    // 每节课均保留内容模块；instructor 为 null 表示授课人尚待课程组确认。
    contentModules: session.content_modules || [],
  })),
}))

const milestoneSymbols = ['①', '②', '③', '④', '⑤']
const getAssessmentMilestone = (timing) => {
  const match = String(timing).match(/阶段成果\s*([①②③④⑤])/)
  return match ? milestoneSymbols.indexOf(match[1]) + 1 : null
}

const getAssessmentTarget = (item) => {
  const milestone = getAssessmentMilestone(item.timing)
  if (milestone) return `milestone-${milestone}`

  for (const week of courseSchedule.schedule) {
    const matchedSession = week.sessions.find((session) => (session.deliverables_or_homework || [])
      .some((deliverable) => String(typeof deliverable === 'string' ? deliverable : deliverable.content || '')
        .includes(item.item)))
    if (matchedSession) return `session-${week.week}-${matchedSession.session}-${matchedSession.date}`
  }
  return null
}

export const assessmentItems = courseSchedule.assessment.map((item) => ({
  item: item.item,
  timing: item.timing,
  weight: `${item.weight_percent}%`,
  milestone: getAssessmentMilestone(item.timing),
  target: getAssessmentTarget(item),
}))
