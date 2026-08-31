export const homeNavItems = [
  { id: 'overview', label: '总体介绍' },
  { id: 'retrospective', label: '策展超市回顾' },
  { id: 'city', label: '策展超市 2.0' },
  { id: 'course-rules', label: '课程规则' },
  { id: 'course-calendar', label: '课程日程', nested: true },
]

export const teachingTeam = [
  {
    role: '授课导师',
    names: [{ label: 'A班｜刘益红 · 顾文浩' }, { label: 'B班｜顾文佳 · 任　越' }],
  },
  {
    role: '课程联合',
    names: [{ label: '冯炳莨' }],
  },

  {
    role: '课程助理',
    names: [
      { label: '贾晓旭 · 华宏梁 · 左佑 · 王岚 · 周黄宇 · 方钰杭' },
    ],
  },
  {
    role: '课程支持',
    names: [
      {
        label: 'KIMI',
        preview: {
          cardLabel: 'KIMI Websites',
          description: 'KIMI 是作为本次课程面向创作与研究的核心 AI 工具。课程提供 KIMI Allegretto 一个月会员权益。',
          url: 'https://www.kimi.com/features/websites',
        },
      },
      {
        label: 'Edgeware',
        preview: {
          cardLabel: 'Edgeware',
          description: 'Edgeware 下的 Parit系统是一套模块化型材框架搭建体系，本次作为课程空间与展具落地的物质材料。',
          url: 'https://edgewarex.com/',
        },
      },
    ],
  },
]

export const overviewMeta = [
  { label: '教学周期', values: ['8 周'] },
  { label: '课程总时长', values: ['16 课次'] },
  { label: '上课时间', values: ['第 1–5 周 周一、周四下午', '第 6–8 周 周一、周三、周四下午'] },
]

export const courseCycle = '8 周，16 课次'

export const gradingOverview = [
  { item: '出勤与课堂参与', weight: '10%', desc: '第 1—8 周的出勤与课堂参与' },
  { item: '内容档案与展览内容网站', weight: '15%', desc: '第 2 周提交' },
  { item: '策展逻辑与提案', weight: '15%', desc: '第 3 周提交' },
  { item: '展览设计方案初步提案', weight: '15%', desc: '第 5 周中期汇报' },
  { item: '深化设计与深化展览策划', weight: '15%', desc: '第 7 周确认' },
  { item: '期末综合汇报', weight: '30%', desc: '第 8 周汇报' },
]

export const gradingPalette = [
  'var(--home-blue)',
  'var(--home-yellow)',
  'var(--home-orange)',
  'var(--home-green)',
  'var(--home-magenta)',
  'var(--home-ink)',
]

export const methodSteps = ['选题', '建库', '结构', '网站', '展具', '视觉', '事件', '商业']
