import { exhibitions } from './exhibitions.js'
import { works } from './works.js'

const exhibitionMarkers = {
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

const exhibitionOutcomes = exhibitions.map((exhibition, index) => ({
  id: exhibition.id,
  year: '2025',
  number: String(index + 1).padStart(2, '0'),
  title: exhibition.name,
  titleEn: exhibition.nameEn,
  topic: exhibition.topic,
  authors: exhibition.authors.students,
  summary: exhibition.descriptionZh[0],
  preview: `/course-gifs/${exhibition.images[0].filename.replace(/-01\.gif$/i, '-thumb.webp')}`,
  previewAlt: `${exhibition.name}项目预览`,
  detailType: 'exhibition',
  marker: exhibitionMarkers[exhibition.id] || '展',
}))

const workOutcomes = works.map((work, index) => ({
  id: work.id,
  year: '2026',
  number: String(index + 1).padStart(2, '0'),
  title: work.title,
  titleEn: work.titleEn || '',
  topic: work.object || '学生作品',
  authors: work.team || (work.author ? [work.author] : []),
  summary: work.concept || '项目资料整理中。',
  preview: work.thumbnail || '',
  previewAlt: work.title ? `${work.title}项目预览` : '',
  detailType: 'work',
  marker: work.marker || '作',
}))

export const outcomeYears = [
  { id: '2025', label: '2025', note: '策展超市 · 已归档' },
  { id: '2026', label: '2026', note: '内容与策展 · 进行中' },
]

export const outcomesByYear = {
  2025: exhibitionOutcomes,
  2026: workOutcomes,
}

export const getOutcomesForYear = (year) => outcomesByYear[year] || outcomesByYear[2025]
