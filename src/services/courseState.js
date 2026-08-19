async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }
  if (!response.ok) {
    const error = new Error(payload?.error || `请求失败（${response.status}）`)
    error.status = response.status
    throw error
  }
  return payload
}

export const getCourseState = () => request('/api/course-state')
export const adminLogin = (password) => request('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) })
export const adminLogout = () => request('/api/admin/logout', { method: 'POST' })
export const adminMe = () => request('/api/admin/me')
export const createTopic = (label) => request('/api/admin/topics', { method: 'POST', body: JSON.stringify({ label }) })
export const updateTopicRoom = (topicId, roomId) => request(`/api/admin/topics/${topicId}`, { method: 'PATCH', body: JSON.stringify({ roomId }) })
export const assignGroupTopic = (groupId, topicId) => request(`/api/admin/groups/${groupId}/topic`, { method: 'PUT', body: JSON.stringify({ topicId }) })
export const clearGroupTopic = (groupId) => request(`/api/admin/groups/${groupId}/topic`, { method: 'DELETE' })
export const getAdminStudents = () => request('/api/admin/students')
export const importAdminStudents = (students) => request('/api/admin/students', { method: 'POST', body: JSON.stringify({ students }) })
export const updateStudentStatus = (studentId, status) => request(`/api/admin/students/${studentId}`, { method: 'PATCH', body: JSON.stringify({ status }) })
export const resetStudentPassword = (studentId) => request(`/api/admin/students/${studentId}/reset-password`, { method: 'POST' })
export const updateStudentGroup = (studentId, groupId) => request(`/api/admin/students/${studentId}/group`, { method: 'PUT', body: JSON.stringify({ groupId }) })
export const getAdminGroups = () => request('/api/admin/groups')
export const createGroupInvite = (groupId) => request(`/api/admin/groups/${groupId}/invite`, { method: 'POST' })
export const revokeGroupInvite = (groupId) => request(`/api/admin/groups/${groupId}/invite`, { method: 'DELETE' })

export const studentLogin = (studentNumber, password) => request('/api/student/login', { method: 'POST', body: JSON.stringify({ studentNumber, password }) })
export const studentLogout = () => request('/api/student/logout', { method: 'POST' })
export const studentMe = () => request('/api/student/me')
export const studentChangePassword = (currentPassword, newPassword) => request('/api/student/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) })
export const studentJoinGroup = (code) => request('/api/student/join-group', { method: 'POST', body: JSON.stringify({ code }) })
export const studentLeaveGroup = () => request('/api/student/group', { method: 'DELETE' })
export const studentAssignTopic = (topicId) => request('/api/student/group/topic', { method: 'PUT', body: JSON.stringify({ topicId }) })
export const studentClearTopic = () => request('/api/student/group/topic', { method: 'DELETE' })
