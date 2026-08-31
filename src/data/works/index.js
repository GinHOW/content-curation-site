import { works2025 } from './2025.js'

const workMarkers = {
  jiejie: '绳',
  headline: '发',
  'northward-river': '尺',
  'chess-box': '棋',
  threshold: '钥',
  'four-hat-act': '帽',
  'hand-held-drama': '手',
  'why-we-look': '眼',
  'black-chamber': '信',
}

const works2025Index = works2025.map((work, index) => ({
  id: work.id,
  year: '2025',
  number: String(index + 1).padStart(2, '0'),
  title: work.name,
  titleEn: work.nameEn,
  topic: work.topic,
  authors: work.authors.students,
  summary: work.descriptionZh[0],
  preview: `/course-gifs/${work.images[0].filename.replace(/-01\.gif$/i, '-thumb.webp')}`,
  previewAlt: `${work.name}项目预览`,
  marker: workMarkers[work.id] || '作',
}))

export const workYears = [
  { id: '2025', label: '2025', note: '策展超市 · 已归档' },
  { id: '2026', label: '2026', note: '内容与策展2026 · 进行中' },
]

const worksByYear = {
  2025: works2025Index,
  2026: [],
}

export const getWorksForYear = (year) => worksByYear[year] || worksByYear[2025]
