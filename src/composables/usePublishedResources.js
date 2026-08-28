import { computed, ref } from 'vue'
import { getPublishedResources, getStaticResourceOverrides } from '../services/courseState.js'

const publishedResources = ref([])
const staticOverrides = ref({})
const loading = ref(false)
const error = ref('')
let requestPromise = null

const normalize = (item) => {
  const base = {
    ...item,
    tags: Array.isArray(item.tags) ? item.tags : [],
    featured: Boolean(item.isFeatured),
    featuredOrder: 1000,
    summary: item.summary || '社区提交资源，等待更多课程使用与补充。',
  }
  if (item.type === 'article') return { ...base, articleCategory: item.category || 'community', author: '社区投稿', source: '用户资源', year: '', image: item.imageUrl || '', alt: item.title }
  if (item.type === 'video') return { ...base, videoCategory: item.category || 'community', sourceType: 'external-link', fallbackUrl: item.url, embedUrl: '', poster: item.imageUrl || '', duration: '' }
  if (item.type === 'website') return { ...base, websiteCategory: item.category || 'community', previewImage: item.imageUrl || '', previewAlt: `${item.title} 网页快照` }
  return { ...base, platform: '社区投稿', format: item.category === 'skill' ? 'SKILL.md' : '外部链接', image: item.imageUrl || '', alt: item.title, downloadUrl: item.url }
}

const refresh = async () => {
  if (requestPromise) return requestPromise
  requestPromise = (async () => {
    loading.value = true
    error.value = ''
    try {
      const [resourcesPayload, overridesPayload] = await Promise.all([
        getPublishedResources(),
        getStaticResourceOverrides(),
      ])
      publishedResources.value = (resourcesPayload.resources || []).map(normalize)
      staticOverrides.value = Object.fromEntries((overridesPayload.overrides || []).map((item) => [item.staticId, item]))
      return publishedResources.value
    } catch (cause) {
      error.value = cause.message || '用户资源暂时无法读取'
      publishedResources.value = []
      staticOverrides.value = {}
      return []
    } finally {
      loading.value = false
      requestPromise = null
    }
  })()
  return requestPromise
}

export function usePublishedResources() {
  const initialize = () => publishedResources.value.length || error.value ? Promise.resolve(publishedResources.value) : refresh()
  const byType = (type, staticItems) => computed(() => [
    ...staticItems
      .filter((item) => !staticOverrides.value[item.id]?.isHidden)
      .map((item) => {
        const override = staticOverrides.value[item.id]
        return typeof override?.featuredOverride === 'boolean'
          ? { ...item, featured: override.featuredOverride }
          : item
      }),
    ...publishedResources.value.filter((item) => item.type === type),
  ])
  return { resources: publishedResources, staticOverrides, loading, error, refresh, initialize, byType }
}
