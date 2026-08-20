import { computed, onMounted, ref } from 'vue'
import { getCourseState } from '../services/courseState.js'
import { getLocalCourseState } from '../data/localCourseState.js'

export function useCourseState({ immediate = true } = {}) {
  const rooms = ref([])
  const topics = ref([])
  const groups = ref([])
  const loading = ref(false)
  const error = ref('')
  const loaded = ref(false)
  const isLocalFallback = ref(false)

  const topicColors = computed(() => Object.fromEntries(
    topics.value.filter((topic) => topic.colorToken).map((topic) => [topic.label, topic.colorToken]),
  ))

  const refresh = async () => {
    loading.value = true
    error.value = ''
    isLocalFallback.value = false
    try {
      const payload = await getCourseState()
      rooms.value = payload.rooms || []
      topics.value = payload.topics || []
      groups.value = payload.groups || []
      loaded.value = true
    } catch (cause) {
      if (import.meta.env.DEV) {
        const fallback = getLocalCourseState()
        rooms.value = fallback.rooms
        topics.value = fallback.topics
        groups.value = fallback.groups
        loaded.value = true
        isLocalFallback.value = true
        return
      }
      error.value = cause.message || '课程数据暂时无法读取'
    } finally {
      loading.value = false
    }
  }

  if (immediate) onMounted(refresh)

  return { rooms, topics, groups, topicColors, loading, error, loaded, isLocalFallback, refresh }
}
