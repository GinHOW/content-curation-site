<template>
  <div class="admin-page home-page">
    <HomeSiteNav />
    <main class="admin-main home-main">
      <section class="home-section admin-section" aria-labelledby="admin-title">
        <div class="section-grid admin-heading">
          <div class="section-title-column">
            <p class="eyebrow">Teacher Access</p>
            <h1 id="admin-title">管理员<br />入口</h1>
          </div>
          <div class="section-copy-column">
            <p class="lead-copy">统一维护词条、空间归属与 16 个小组选词。公共页面只读，保存结果会立即同步到主页和课程详情。</p>
            <p class="micro-copy">教师可导入学生名单、安排小组并生成邀请码；学生账号由教师统一管理。</p>
          </div>
        </div>

        <form v-if="!authenticated" class="admin-login" @submit.prevent="login">
          <label>
            <span>教师管理口令</span>
            <input v-model="password" type="password" autocomplete="current-password" required />
          </label>
          <button type="submit" :disabled="busy">{{ busy ? '验证中……' : '进入管理' }}</button>
          <p v-if="authError" class="admin-message is-error" role="alert">{{ authError }}</p>
        </form>

        <template v-else>
          <div class="admin-toolbar">
            <span>已登录教师管理</span>
            <div>
              <router-link class="admin-toolbar-link" to="/manage/resources">资源管理 →</router-link>
              <router-link class="admin-toolbar-link" to="/manage/media">媒体库 →</router-link>
              <button type="button" @click="refreshData">刷新数据</button>
              <button type="button" @click="logout">退出</button>
            </div>
          </div>

          <section class="admin-block" aria-labelledby="topics-title">
            <header class="admin-block-heading">
              <div>
                <p class="eyebrow">01 · Word Pool</p>
                <h2 id="topics-title">词条与空间归属</h2>
              </div>
              <form class="inline-form" @submit.prevent="addTopic">
                <input v-model="newTopic" maxlength="24" placeholder="添加自定义词" aria-label="自定义词" required />
                <button type="submit" :disabled="busy">添加</button>
              </form>
            </header>
            <div class="admin-topic-list">
              <div v-for="topic in topics" :key="topic.id" class="admin-topic-row">
                <span class="admin-topic-label">{{ topic.label }}<small>{{ topic.source === 'custom' ? '自定义' : '课程词库' }}</small></span>
                <label>
                  <span class="sr-only">{{ topic.label }}的空间</span>
                  <select :value="topic.roomId || ''" @change="setRoom(topic, $event.target.value)">
                    <option value="">暂不归属空间</option>
                    <option v-for="room in rooms" :key="room.id" :value="room.id">{{ room.number }} · {{ room.name }}</option>
                  </select>
                </label>
              </div>
            </div>
          </section>

          <section class="admin-block" aria-labelledby="groups-title">
            <header class="admin-block-heading">
              <div>
                <p class="eyebrow">02 · Group Assignment</p>
                <h2 id="groups-title">小组选词</h2>
              </div>
              <span class="micro-copy">每个词仅允许一个小组选用</span>
            </header>
            <div class="admin-group-grid">
              <label v-for="group in groups" :key="group.id" class="admin-group-row">
                <strong>{{ group.code }}</strong>
                <select :value="group.topicId || ''" :aria-label="`${group.code} 选词`" @change="setGroupTopic(group, $event.target.value)">
                  <option value="">待匹配</option>
                  <option v-for="topic in topics" :key="topic.id" :value="topic.id">{{ topic.label }}</option>
                </select>
              </label>
            </div>
            <div class="admin-invite-grid">
              <article v-for="group in adminGroups" :key="group.id" class="admin-invite-card">
                <div>
                  <strong>{{ group.code }}</strong>
                  <span>{{ group.memberCount }} 位成员{{ Number(group.memberCount) > 3 ? ' · 超过建议人数' : '' }}</span>
                </div>
                <code v-if="group.inviteCode">{{ group.inviteCode }}</code>
                <span v-else class="micro-copy">暂无邀请码</span>
                <div class="admin-invite-actions">
                  <button type="button" @click="copyInvite(group)" :disabled="!group.inviteCode">复制</button>
                  <button type="button" @click="rotateInvite(group)">{{ group.inviteCode ? '轮换' : '生成' }}</button>
                  <button v-if="group.inviteCode" type="button" @click="revokeInvite(group)">撤销</button>
                </div>
              </article>
            </div>
          </section>

          <section class="admin-block" aria-labelledby="students-title">
            <header class="admin-block-heading">
              <div>
                <p class="eyebrow">03 · Student Accounts</p>
                <h2 id="students-title">学生名单与分组</h2>
              </div>
              <span class="micro-copy">从 Excel 复制“学号、姓名”两列</span>
            </header>
            <div class="admin-roster-import">
              <textarea
                v-model="rosterText"
                rows="5"
                placeholder="学号\t姓名\n20260001\t张三\n20260002\t李四"
                aria-label="粘贴学生名单"
                @keydown="handleRosterKeydown"
              ></textarea>
              <div class="admin-roster-actions">
                <button type="button" @click="parseRoster">预览名单</button>
                <button type="button" :disabled="busy || !rosterPreview.length" @click="importRoster">确认导入</button>
              </div>
              <p class="micro-copy">按 Tab 插入列间隔；已有账号只更新姓名，不会重置密码或改变分组。</p>
              <p v-if="rosterError" class="admin-message is-error" role="alert">{{ rosterError }}</p>
            </div>

            <div v-if="rosterPreview.length" class="admin-preview">
              <strong>待导入 {{ rosterPreview.length }} 人</strong>
              <span v-for="item in rosterPreview.slice(0, 8)" :key="item.studentNumber">{{ item.studentNumber }} · {{ item.displayName }}</span>
              <span v-if="rosterPreview.length > 8" class="micro-copy">另有 {{ rosterPreview.length - 8 }} 人</span>
            </div>
            <div v-if="credentials.length" class="admin-credentials" role="status">
              <strong>新账号初始密码（仅显示本次导入结果）</strong>
              <span v-for="item in credentials" :key="item.studentNumber">{{ item.studentNumber }}：{{ item.initialPassword }}</span>
            </div>

            <div class="admin-student-list">
              <div v-for="studentItem in students" :key="studentItem.id" class="admin-student-row">
                <div class="admin-student-name">
                  <strong>{{ studentItem.displayName }}</strong>
                  <span>{{ studentItem.studentNumber }} · {{ studentItem.status === 'active' ? '正常' : '已停用' }}{{ Number(studentItem.mustChangePassword) ? ' · 建议改密' : '' }}</span>
                </div>
                <select :value="studentItem.groupId || ''" :aria-label="`${studentItem.displayName} 所属小组`" @change="setStudentGroup(studentItem, $event.target.value)">
                  <option value="">未分组</option>
                  <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.code }}</option>
                </select>
                <button type="button" @click="resetPassword(studentItem)">重置密码</button>
                <button type="button" @click="toggleStudent(studentItem)">{{ studentItem.status === 'active' ? '停用' : '启用' }}</button>
              </div>
              <p v-if="!students.length" class="admin-message">尚未导入学生名单。</p>
            </div>
          </section>
          <p v-if="actionMessage" class="admin-message" role="status">{{ actionMessage }}</p>
          <p v-if="actionError" class="admin-message is-error" role="alert">{{ actionError }}</p>
        </template>
      </section>
    </main>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue'
import HomeSiteNav from '../../components/navigation/HomeSiteNav.vue'
import { useAuthSession } from '../../composables/useAuthSession.js'
import { useCourseState } from '../../composables/useCourseState.js'
import {
  adminLogin,
  adminLogout,
  assignGroupTopic,
  clearGroupTopic,
  createGroupInvite,
  createTopic,
  getAdminGroups,
  getAdminStudents,
  importAdminStudents,
  resetStudentPassword,
  revokeGroupInvite,
  updateStudentGroup,
  updateStudentStatus,
  updateTopicRoom,
} from '../../services/courseState.js'

const { rooms, topics, groups, refresh } = useCourseState({ immediate: false })
const {
  isTeacher: authenticated,
  initialize: initializeAuth,
  refresh: refreshAuth,
  clearTeacher,
} = useAuthSession()
const students = ref([])
const adminGroups = ref([])
const password = ref('')
const newTopic = ref('')
const rosterText = ref('')
const rosterPreview = ref([])
const rosterError = ref('')
const credentials = ref([])
const busy = ref(false)
const authError = ref('')
const actionError = ref('')
const actionMessage = ref('')

const refreshState = async () => {
  await refresh()
  const [studentsPayload, groupsPayload] = await Promise.all([getAdminStudents(), getAdminGroups()])
  students.value = studentsPayload.students || []
  adminGroups.value = groupsPayload.groups || []
}

const runAction = async (action, message) => {
  busy.value = true
  actionError.value = ''
  actionMessage.value = ''
  try {
    await action()
    await refreshState()
    actionMessage.value = message
  } catch (cause) {
    actionError.value = cause.message || '保存失败，请重试'
  } finally {
    busy.value = false
  }
}

const login = async () => {
  busy.value = true
  authError.value = ''
  try {
    await adminLogin(password.value)
    await refreshAuth()
    password.value = ''
    await refreshState()
  } catch (cause) {
    authError.value = cause.message || '登录失败，请重试'
  } finally {
    busy.value = false
  }
}

const logout = async () => {
  await adminLogout().catch(() => {})
  clearTeacher()
}

const refreshData = () => runAction(refreshState, '数据已刷新')
const addTopic = () => runAction(async () => {
  await createTopic(newTopic.value.trim())
  newTopic.value = ''
}, '自定义词已添加，可继续指定空间')
const setRoom = (topic, roomId) => runAction(() => updateTopicRoom(topic.id, roomId || null), '空间归属已更新')
const setGroupTopic = (group, topicId) => runAction(
  () => topicId ? assignGroupTopic(group.id, Number(topicId)) : clearGroupTopic(group.id),
  `${group.code} 的选词已更新`,
)

const handleRosterKeydown = async (event) => {
  if (event.key !== 'Tab' || event.shiftKey) return

  event.preventDefault()
  const textarea = event.currentTarget
  const value = rosterText.value
  const start = Number.isInteger(textarea.selectionStart) ? textarea.selectionStart : value.length
  const end = Number.isInteger(textarea.selectionEnd) ? textarea.selectionEnd : start
  rosterText.value = `${value.slice(0, start)}\t${value.slice(end)}`

  await nextTick()
  textarea.selectionStart = start + 1
  textarea.selectionEnd = start + 1
}

const parseRoster = () => {
  rosterError.value = ''
  credentials.value = []
  const lines = rosterText.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  if (!lines.length) {
    rosterPreview.value = []
    rosterError.value = '请先粘贴学生名单'
    return
  }
  const parsed = []
  const seen = new Set()
  for (const [index, line] of lines.entries()) {
    const columns = line.includes('\t') ? line.split('\t') : line.split(/[,，]/)
    const studentNumber = String(columns[0] || '').trim()
    const displayName = String(columns.slice(1).join(' ') || '').trim()
    if (index === 0 && /学号|student/i.test(studentNumber)) continue
    if (!studentNumber || !displayName) {
      rosterPreview.value = []
      rosterError.value = `第 ${index + 1} 行缺少学号或姓名`
      return
    }
    const key = studentNumber.toLowerCase()
    if (seen.has(key)) {
      rosterPreview.value = []
      rosterError.value = `名单中有重复学号：${studentNumber}`
      return
    }
    seen.add(key)
    parsed.push({ studentNumber, displayName })
  }
  rosterPreview.value = parsed
  if (!parsed.length) rosterError.value = '没有可导入的学生记录'
}

const importRoster = async () => {
  if (!rosterPreview.value.length) return
  busy.value = true
  actionError.value = ''
  actionMessage.value = ''
  try {
    const result = await importAdminStudents(rosterPreview.value)
    credentials.value = result.credentials || []
    rosterText.value = ''
    rosterPreview.value = []
    await refreshState()
    actionMessage.value = `已创建 ${result.created} 个账号，更新 ${result.updated} 个账号`
  } catch (cause) {
    actionError.value = cause.message || '名单导入失败，请重试'
  } finally {
    busy.value = false
  }
}

const setStudentGroup = (studentItem, groupId) => runAction(
  () => updateStudentGroup(studentItem.id, groupId || null),
  `${studentItem.displayName} 的分组已更新`,
)

const toggleStudent = (studentItem) => runAction(
  () => updateStudentStatus(studentItem.id, studentItem.status === 'active' ? 'disabled' : 'active'),
  `${studentItem.displayName} 的账号状态已更新`,
)

const resetPassword = async (studentItem) => {
  busy.value = true
  actionError.value = ''
  actionMessage.value = ''
  try {
    const result = await resetStudentPassword(studentItem.id)
    await refreshState()
    actionMessage.value = `${result.studentNumber} 的初始密码已重置为：${result.initialPassword}`
  } catch (cause) {
    actionError.value = cause.message || '密码重置失败，请重试'
  } finally {
    busy.value = false
  }
}

const rotateInvite = async (group) => {
  busy.value = true
  actionError.value = ''
  actionMessage.value = ''
  try {
    const result = await createGroupInvite(group.id)
    await refreshState()
    actionMessage.value = `${result.groupCode} 邀请码：${result.code}`
  } catch (cause) {
    actionError.value = cause.message || '邀请码生成失败，请重试'
  } finally {
    busy.value = false
  }
}

const revokeInvite = (group) => runAction(
  () => revokeGroupInvite(group.id),
  `${group.code} 邀请码已撤销`,
)

const copyInvite = async (group) => {
  if (!group.inviteCode) return
  try {
    await navigator.clipboard.writeText(group.inviteCode)
    actionMessage.value = `${group.code} 邀请码已复制`
  } catch {
    actionError.value = '复制失败，请手动记录邀请码'
  }
}

onMounted(async () => {
  await initializeAuth()
  if (authenticated.value) await refreshState()
})
</script>

<style scoped>
.admin-page { min-height: 100vh; color: var(--home-ink); background: var(--home-paper); }
.admin-page > .site-nav { margin-inline: clamp(3.5rem, 4vw, 4.5rem); padding-top: clamp(1.5rem, 4vh, 3rem); }
.admin-main { padding: 2rem clamp(1rem, 4vw, 4rem) 5rem; }
.admin-section { max-width: 1240px; margin: 0 auto; }
.admin-heading { margin-bottom: 3rem; }
.admin-login { display: flex; flex-wrap: wrap; align-items: end; gap: 0.8rem; max-width: 32rem; padding: 1.25rem 0; border-top: 1px solid var(--home-rule); border-bottom: 1px solid var(--home-rule); }
.admin-login label { display: grid; gap: 0.35rem; flex: 1 1 15rem; font-size: 0.78rem; color: var(--home-muted); }
.admin-login input, .inline-form input, select { min-height: 2.45rem; border: 1px solid var(--home-ink); border-radius: 0; background: var(--home-paper); padding: 0.4rem 0.6rem; font: inherit; }
.admin-login button, .inline-form button, .admin-toolbar button { min-height: 2.45rem; border: 1px solid var(--home-ink); border-radius: 0; background: var(--home-ink); color: var(--home-paper); padding: 0.4rem 0.8rem; cursor: pointer; font: inherit; }
.admin-login button:disabled, .inline-form button:disabled { opacity: 0.5; cursor: wait; }
.admin-toolbar, .admin-block-heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; }
.admin-toolbar { padding: 0.8rem 0; border-top: 1px solid var(--home-rule); border-bottom: 1px solid var(--home-rule); font-size: 0.8rem; }
.admin-toolbar div { display: flex; gap: 0.4rem; }
.admin-toolbar-link {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  color: var(--home-ink);
  font-size: 0.75rem;
  font-weight: 700;
  text-decoration: none;
}

.admin-toolbar-link:hover,
.admin-toolbar-link:focus-visible {
  color: var(--accent-orange);
}
.admin-toolbar button { min-height: 2rem; background: transparent; color: var(--home-ink); }
.admin-block { margin-top: 3rem; }
.admin-block-heading { margin-bottom: 1rem; }
.admin-block-heading h2 { margin-top: 0.35rem; font-size: clamp(1.2rem, 2vw, 1.7rem); }
.inline-form { display: flex; gap: 0.4rem; }
.inline-form button { background: transparent; color: var(--home-ink); }
.admin-topic-list { border-top: 1px solid var(--home-rule); }
.admin-topic-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.7rem 0; border-bottom: 1px solid var(--home-rule); }
.admin-topic-label { display: grid; gap: 0.2rem; }
.admin-topic-label small { color: var(--home-muted); font-size: 0.68rem; }
.admin-group-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.6rem; }
.admin-group-row { display: grid; grid-template-columns: 2rem minmax(0, 1fr); align-items: center; gap: 0.55rem; padding: 0.5rem; border: 1px solid var(--home-rule); }
.admin-group-row select { min-width: 0; border-color: var(--home-rule); font-size: 0.75rem; }
.admin-invite-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.6rem; margin-top: 1rem; }
.admin-invite-card { display: grid; gap: 0.55rem; padding: 0.75rem; border: 1px solid var(--home-rule); }
.admin-invite-card > div:first-child { display: grid; gap: 0.2rem; }
.admin-invite-card > div:first-child span { color: var(--home-muted); font-size: 0.68rem; }
.admin-invite-card code { letter-spacing: 0.14em; font-size: 0.9rem; }
.admin-invite-actions { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.admin-invite-actions button, .admin-student-row button, .admin-roster-actions button { min-height: 2rem; border: 1px solid var(--home-ink); border-radius: 0; background: transparent; color: var(--home-ink); padding: 0.3rem 0.55rem; cursor: pointer; font: inherit; font-size: 0.72rem; }
.admin-invite-actions button:disabled { opacity: 0.45; cursor: not-allowed; }
.admin-roster-import { display: grid; gap: 0.65rem; max-width: 42rem; }
.admin-roster-import textarea { width: 100%; resize: vertical; border: 1px solid var(--home-ink); border-radius: 0; background: var(--home-paper); padding: 0.7rem; font: inherit; line-height: 1.55; }
.admin-roster-actions { display: flex; gap: 0.45rem; }
.admin-roster-actions button:last-child { background: var(--home-ink); color: var(--home-paper); }
.admin-roster-actions button:disabled { opacity: 0.45; cursor: not-allowed; }
.admin-preview, .admin-credentials { display: flex; flex-wrap: wrap; gap: 0.45rem 0.8rem; margin-top: 1rem; padding: 0.8rem; border: 1px solid var(--home-rule); font-size: 0.75rem; }
.admin-credentials { color: var(--home-ink); border-color: var(--home-ink); }
.admin-student-list { margin-top: 1rem; border-top: 1px solid var(--home-rule); }
.admin-student-row { display: grid; grid-template-columns: minmax(12rem, 1.5fr) minmax(7rem, 0.8fr) auto auto; align-items: center; gap: 0.65rem; padding: 0.7rem 0; border-bottom: 1px solid var(--home-rule); }
.admin-student-name { display: grid; gap: 0.2rem; min-width: 0; }
.admin-student-name span { color: var(--home-muted); font-size: 0.68rem; }
.admin-student-row select { min-width: 0; }
.admin-student-row button { white-space: nowrap; }
.admin-message { margin-top: 1rem; color: var(--home-muted); font-size: 0.78rem; }
.admin-message.is-error { color: var(--home-ink); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 767px) { .admin-page > .site-nav { width: auto; margin-inline: 1rem; padding-top: 2.5rem; } .admin-main { padding-inline: 1rem; } .admin-toolbar, .admin-block-heading { align-items: start; flex-direction: column; } .inline-form { width: 100%; } .inline-form input { flex: 1; min-width: 0; } .admin-group-grid, .admin-invite-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .admin-student-row { grid-template-columns: 1fr 1fr; } .admin-student-name { grid-column: 1 / -1; } }
</style>
