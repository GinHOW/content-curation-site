import { resourceArticles } from './articles.js'
import { resourceCategoryOptions, getResourceCategoryOptions } from './categories.js'
import { resourceTools } from './tools.js'
import { resourceVideos } from './videos.js'
import { resourceWebsites } from './websites.js'

export {
  resourceArticles,
  resourceCategoryOptions,
  getResourceCategoryOptions,
  resourceTools,
  resourceVideos,
  resourceWebsites,
}

// 资源页侧边导航同时服务总览页和四个独立类别页。
// 总览使用页内锚点，类别项使用真实路由；HomeEdgeNav 会根据 `to` 自动选择交互方式。
export const resourceNavigationItems = [
  { id: 'overview', label: '总览', to: '/resources' },
  { id: 'article', label: '文章', to: '/resources/articles' },
  { id: 'video', label: '视频', to: '/resources/videos' },
  { id: 'website', label: '网页', to: '/resources/websites' },
  { id: 'tool', label: '工具', to: '/resources/tools' },
]

export const resources = [
  ...resourceArticles,
  ...resourceVideos,
  ...resourceWebsites,
  ...resourceTools,
]

export const getFeaturedResources = (items, limit = 6) => items
  .filter((item) => item.featured)
  .slice()
  .sort((a, b) => (a.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (b.featuredOrder ?? Number.MAX_SAFE_INTEGER))
  .slice(0, limit)
