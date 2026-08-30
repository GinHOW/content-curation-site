export const resourceCategoryOptions = {
  article: [
    { value: 'course', label: '课程文章' },
    { value: 'classic', label: '经典文献' },
  ],
  video: [
    { value: 'ai-coding', label: 'AI Coding' },
    { value: 'course', label: '课程讲座' },
  ],
  website: [
    { value: 'case', label: '网站案例' },
    { value: 'exhibition', label: '展览网站' },
    { value: 'news', label: '资讯网站' },
  ],
  tool: [
    { value: 'skill', label: '技能文件' },
    { value: 'external', label: '外部工具' },
  ],
}

export const getResourceCategoryOptions = (type) => resourceCategoryOptions[type] || []

