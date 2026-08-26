import { computed, ref } from 'vue'
import { getAuthSession } from '../services/courseState.js'

const ready = ref(false)
const loading = ref(false)
const error = ref('')
const isStudent = ref(false)
const isTeacher = ref(false)
const student = ref(null)

let requestPromise = null

const authenticated = computed(() => isStudent.value || isTeacher.value)

const applyPayload = (payload) => {
  const roles = payload?.roles || {}
  isStudent.value = Boolean(roles.student)
  isTeacher.value = Boolean(roles.teacher)
  student.value = isStudent.value ? (payload.student || null) : null
}

const refresh = async () => {
  if (requestPromise) return requestPromise

  requestPromise = (async () => {
    loading.value = true
    ready.value = false
    error.value = ''
    try {
      const payload = await getAuthSession()
      applyPayload(payload)
      return payload
    } catch (cause) {
      applyPayload({ roles: { student: false, teacher: false } })
      error.value = cause.message || '登录状态暂时无法读取'
      throw cause
    } finally {
      ready.value = true
      loading.value = false
      requestPromise = null
    }
  })()

  return requestPromise
}

const initialize = () => {
  if (ready.value) return Promise.resolve()
  return refresh().catch(() => null)
}

const clearStudent = () => {
  isStudent.value = false
  student.value = null
}

const clearTeacher = () => {
  isTeacher.value = false
}

export function useAuthSession() {
  return {
    ready,
    loading,
    error,
    authenticated,
    isStudent,
    isTeacher,
    student,
    initialize,
    refresh,
    clearStudent,
    clearTeacher,
  }
}
