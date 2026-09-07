export const WEBSITE_TAG_GROUPS = [
  { id: 'content', label: '内容' },
  { id: 'format', label: '形态' },
  { id: 'experience', label: '交互' },
  { id: 'context', label: '主体' },
]

// 受控词表的显式归类：每个规范标签只属于一个组。
// content=领域与议题，format=网站容器与信息架构，experience=界面/排版/动效/视觉风格，context=机构与组织身份。
// 未列入下方三组的标签一律归入 content（领域/议题为默认兜底）。
const FORMAT_TAGS = [
  '个人网站', '媒体门户', '数字杂志', '出版网站', '档案网站', '电商网站', '在线展厅', '数字画册',
  'Web应用', '教育平台', '维基百科', '分类系统', '文化索引', '时间线', '实验性网页', '数字游乐场',
]

const CONTEXT_TAGS = [
  '设计机构', '艺术机构', '时尚机构', '高校机构', '非盈利', '摄影代理', '设计奖项', '设计活动', '音乐节',
]

const EXPERIENCE_TAGS = [
  '3D动效', '3D交互', '3D角色', '交互设计', '交互趋势', '沉浸交互', '互动装置', '硬件交互', '桌面交互',
  '动效设计', '排版设计', '网格设计', '字体设计', '色彩设计', '极简设计', '数据可视化',
  '视觉系统', '活动视觉', '反叛视觉', '俏皮视觉', '生成式图形', '编辑美学', '编辑设计', '模块化设计',
  '无障碍设计', '肖像与色彩', '粗犷主义', '复古未来', '拼贴风格', '法式优雅', '玩具美学', '实验界面', '网页设计',
]

export const WEBSITE_TAG_GROUP_MAP = Object.fromEntries([
  ...FORMAT_TAGS.map((tag) => [tag, 'format']),
  ...CONTEXT_TAGS.map((tag) => [tag, 'context']),
  ...EXPERIENCE_TAGS.map((tag) => [tag, 'experience']),
])

export const emptyWebsiteTagGroups = () => ({
  content: [],
  format: [],
  experience: [],
  context: [],
})

export const flattenWebsiteTagGroups = (groups = {}) => {
  const tags = []
  for (const { id } of WEBSITE_TAG_GROUPS) {
    for (const tag of groups[id] || []) {
      if (typeof tag === 'string' && tag && !tags.includes(tag)) tags.push(tag)
    }
  }
  return tags
}

export const normalizeWebsiteTagGroups = (groups = {}) => {
  const normalized = emptyWebsiteTagGroups()
  const used = new Set()
  for (const { id } of WEBSITE_TAG_GROUPS) {
    for (const value of Array.isArray(groups[id]) ? groups[id] : []) {
      const tag = typeof value === 'string' ? value.trim() : ''
      if (tag && !used.has(tag)) {
        normalized[id].push(tag)
        used.add(tag)
      }
    }
  }
  return normalized
}

export const classifyWebsiteTag = (tag) => WEBSITE_TAG_GROUP_MAP[tag] || 'content'

export const groupWebsiteTags = (tags = []) => {
  const groups = emptyWebsiteTagGroups()
  for (const value of tags) {
    const tag = typeof value === 'string' ? value.trim() : ''
    if (tag && !flattenWebsiteTagGroups(groups).includes(tag)) groups[classifyWebsiteTag(tag)].push(tag)
  }
  return groups
}

export const websiteTagGroupsFor = (item = {}) => {
  const groups = item.tagGroups && typeof item.tagGroups === 'object'
    ? normalizeWebsiteTagGroups(item.tagGroups)
    : groupWebsiteTags(item.tags)
  return { tagGroups: groups, tags: flattenWebsiteTagGroups(groups) }
}
