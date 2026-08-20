<template>
  <div class="student-page home-page">
    <HomeSiteNav />
    <main class="student-main home-main">
      <section class="home-section student-section" aria-labelledby="student-title">
        <div class="section-grid student-heading">
          <div class="section-title-column">
            <p class="eyebrow">Student Access</p>
            <h1 id="student-title">学生<br />入口</h1>
          </div>
          <div class="section-copy-column">
            <p class="lead-copy">登录后加入课程小组，与组员共同维护本组的选题。</p>
            <p class="micro-copy">学生账号由教师创建；每人只能加入一个小组。</p>
          </div>
        </div>

        <div v-if="publicError" class="student-message is-error" role="alert">{{ publicError }}</div>

        <form v-if="!authenticated" class="student-form" @submit.prevent="login">
          <label>
            <span>学号</span>
            <input v-model="loginForm.studentNumber" autocomplete="username" inputmode="text" required />
          </label>
          <label>
            <span>密码</span>
            <input v-model="loginForm.password" type="password" autocomplete="current-password" required />
          </label>
          <button type="submit" :disabled="busy">{{ busy ? '登录中……' : '登录' }}</button>
          <p v-if="authError" class="student-message is-error" role="alert">{{ authError }}</p>
        </form>

        <template v-else>
          <div class="student-toolbar">
            <span>已登录：{{ student?.displayName }}（{{ student?.studentNumber }}）</span>
            <div class="student-toolbar-actions">
              <button v-if="!showPasswordForm" type="button" @click="showPasswordForm = true">修改密码</button>
              <button type="button" @click="logout">退出</button>
            </div>
          </div>

          <form v-if="showPasswordForm" class="student-form password-form" @submit.prevent="changePassword">
            <div>
              <p class="eyebrow">{{ student?.mustChangePassword ? 'First Login' : 'Password' }}</p>
              <h2>{{ student?.mustChangePassword ? '建议修改初始密码' : '修改密码' }}</h2>
              <p class="micro-copy">{{ student?.mustChangePassword ? '建议先更新初始密码；也可以先跳过，之后随时修改。' : '新密码需要为 8–64 位字符。' }}</p>
            </div>
            <label>
              <span>当前密码</span>
              <input v-model="passwordForm.currentPassword" type="password" autocomplete="current-password" required />
            </label>
            <label>
              <span>新密码（8–64 位）</span>
              <input v-model="passwordForm.newPassword" type="password" autocomplete="new-password" minlength="8" maxlength="64" required />
            </label>
            <label>
              <span>再次输入新密码</span>
              <input v-model="passwordForm.confirmPassword" type="password" autocomplete="new-password" minlength="8" maxlength="64" required />
            </label>
            <button type="submit" :disabled="busy">{{ busy ? '保存中……' : '保存新密码' }}</button>
            <button v-if="student?.mustChangePassword" type="button" class="student-secondary-button" :disabled="busy" @click="skipPasswordChange">暂时跳过</button>
            <p v-if="actionError" class="student-message is-error" role="alert">{{ actionError }}</p>
          </form>

          <template v-if="!showPasswordForm">
            <div class="student-toolbar student-toolbar-note">
              <span v-if="actionMessage" role="status">{{ actionMessage }}</span>
              <span v-else>选题和分组保存后会立即同步到课程页面。</span>
              <button type="button" :disabled="busy" @click="refreshStudent">刷新</button>
            </div>

            <section v-if="!group" class="student-card" aria-labelledby="join-title">
              <p class="eyebrow">Group Entry</p>
              <h2 id="join-title">加入小组</h2>
              <p>如果教师尚未直接分组，请输入教师提供的 8 位邀请码。</p>
              <form class="student-inline-form" @submit.prevent="joinGroup">
                <label>
                  <span class="sr-only">小组邀请码</span>
                  <input v-model="inviteCode" maxlength="8" placeholder="输入邀请码" autocomplete="off" required />
                </label>
                <button type="submit" :disabled="busy">加入</button>
              </form>
              <p v-if="actionError" class="student-message is-error" role="alert">{{ actionError }}</p>
            </section>

            <section v-else class="student-card" aria-labelledby="group-title">
              <div class="student-card-heading">
                <div>
                  <p class="eyebrow">Your Group</p>
                  <h2 id="group-title">{{ group.code }}</h2>
                </div>
                <div class="student-card-actions">
                  <span class="student-count">{{ group.members.length }} 位成员</span>
                  <button type="button" class="student-leave-button" :disabled="busy" @click="leaveGroup">退出小组</button>
                </div>
              </div>
              <div class="student-members">
                <span v-for="member in group.members" :key="member.id">{{ member.displayName }}</span>
              </div>

              <div class="student-topic-block">
                <div>
                  <p class="eyebrow">Shared Topic</p>
                  <h3>本组选题</h3>
                </div>
                <label>
                  <span class="sr-only">选择本组选题</span>
                  <select :value="group.topicId || ''" :disabled="busy" @change="setTopic($event.target.value)">
                    <option value="">暂不选题</option>
                    <option
                      v-for="topic in topics"
                      :key="topic.id"
                      :value="topic.id"
                      :disabled="isTopicTakenByOtherGroup(topic.id)"
                    >
                      {{ topic.label }}{{ isTopicTakenByOtherGroup(topic.id) ? '（已被其他组选择）' : '' }}
                    </option>
                  </select>
                </label>
              </div>
              <p v-if="topicError" class="student-message is-error" role="alert">{{ topicError }}</p>
            </section>
          </template>
        </template>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import HomeSiteNav from '../components/navigation/HomeSiteNav.vue'
import { useCourseState } from '../composables/useCourseState.js'
import {
  studentAssignTopic,
  studentChangePassword,
  studentClearTopic,
  studentJoinGroup,
  studentLeaveGroup,
  studentLogin,
  studentLogout,
  studentMe,
} from '../services/courseState.js'

const { topics, groups, error: courseError } = useCourseState()
const authenticated = ref(false)
const student = ref(null)
const group = ref(null)
const showPasswordForm = ref(false)
const busy = ref(false)
const authError = ref('')
const actionError = ref('')
const actionMessage = ref('')
const topicError = ref('')
const inviteCode = ref('')
const loginForm = ref({ studentNumber: '', password: '' })
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })

const publicError = computed(() => courseError.value || '')
const takenTopicIds = computed(() => new Set(
  groups.value.filter((item) => item.id !== group.value?.id && item.topicId).map((item) => item.topicId),
))

const isTopicTakenByOtherGroup = (topicId) => takenTopicIds.value.has(topicId)

const refreshStudent = async () => {
  const payload = await studentMe()
  authenticated.value = true
  student.value = payload.student
  group.value = payload.group
}

const login = async () => {
  busy.value = true
  authError.value = ''
  try {
    await studentLogin(loginForm.value.studentNumber, loginForm.value.password)
    loginForm.value.password = ''
    await refreshStudent()
    showPasswordForm.value = Boolean(student.value?.mustChangePassword)
  } catch (cause) {
    authError.value = cause.message || '登录失败，请重试'
  } finally {
    busy.value = false
  }
}

const logout = async () => {
  await studentLogout().catch(() => {})
  authenticated.value = false
  student.value = null
  group.value = null
  showPasswordForm.value = false
}

const skipPasswordChange = () => {
  actionError.value = ''
  actionMessage.value = '已跳过初始密码修改，之后可以随时在这里修改。'
  showPasswordForm.value = false
}

const changePassword = async () => {
  actionError.value = ''
  actionMessage.value = ''
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    actionError.value = '两次输入的新密码不一致'
    return
  }
  busy.value = true
  try {
    await studentChangePassword(passwordForm.value.currentPassword, passwordForm.value.newPassword)
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    await refreshStudent()
    showPasswordForm.value = false
    actionMessage.value = '密码已更新'
  } catch (cause) {
    actionError.value = cause.message || '密码保存失败，请重试'
  } finally {
    busy.value = false
  }
}

const joinGroup = async () => {
  actionError.value = ''
  actionMessage.value = ''
  busy.value = true
  try {
    await studentJoinGroup(inviteCode.value)
    inviteCode.value = ''
    await refreshStudent()
    actionMessage.value = '已加入小组'
  } catch (cause) {
    actionError.value = cause.message || '加入小组失败，请重试'
  } finally {
    busy.value = false
  }
}

const leaveGroup = async () => {
  if (!window.confirm('确认退出当前小组吗？退出后需要新的有效邀请码才能重新加入。')) return
  actionError.value = ''
  actionMessage.value = ''
  busy.value = true
  try {
    await studentLeaveGroup()
    await refreshStudent()
    actionMessage.value = '已退出小组；如需重新加入，请输入新的有效邀请码。'
  } catch (cause) {
    actionError.value = cause.message || '退出小组失败，请重试'
  } finally {
    busy.value = false
  }
}

const setTopic = async (value) => {
  topicError.value = ''
  actionMessage.value = ''
  busy.value = true
  try {
    const payload = value ? await studentAssignTopic(Number(value)) : await studentClearTopic()
    group.value = payload.group
    actionMessage.value = value ? '本组选题已更新' : '本组选题已清除'
  } catch (cause) {
    topicError.value = cause.message || '选题保存失败，请重试'
    await refreshStudent().catch(() => {})
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  try {
    await refreshStudent()
    showPasswordForm.value = Boolean(student.value?.mustChangePassword)
  } catch {
    // 未登录时由登录表单承接。
  }
})
</script>

<style scoped>
.student-page { min-height: 100vh; color: var(--home-ink); background: var(--home-paper); }
.student-page > .site-nav { margin-inline: clamp(3.5rem, 4vw, 4.5rem); padding-top: clamp(1.5rem, 4vh, 3rem); }
.student-main { padding: 2rem clamp(1rem, 4vw, 4rem) 5rem; }
.student-section { max-width: 1240px; margin: 0 auto; }
.student-heading { margin-bottom: 3rem; }
.student-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: end; gap: 0.8rem; max-width: 42rem; padding: 1.25rem 0; border-top: 1px solid var(--home-rule); border-bottom: 1px solid var(--home-rule); }
.student-form label { display: grid; gap: 0.35rem; font-size: 0.78rem; color: var(--home-muted); }
.student-form input, .student-inline-form input, .student-topic-block select { min-height: 2.45rem; border: 1px solid var(--home-ink); border-radius: 0; background: var(--home-paper); padding: 0.4rem 0.6rem; font: inherit; }
.student-form button, .student-inline-form button, .student-toolbar button { min-height: 2.45rem; border: 1px solid var(--home-ink); border-radius: 0; background: var(--home-ink); color: var(--home-paper); padding: 0.4rem 0.8rem; cursor: pointer; font: inherit; }
.student-form button:disabled, .student-inline-form button:disabled, .student-toolbar button:disabled { opacity: 0.5; cursor: wait; }
.student-form > button { grid-column: 2; justify-self: start; }
.student-secondary-button { background: transparent !important; color: var(--home-ink) !important; }
.password-form { grid-template-columns: minmax(0, 1fr) repeat(2, minmax(0, 1fr)); max-width: 60rem; }
.password-form > div { grid-column: 1 / -1; }
.password-form > button { grid-column: auto; }
.student-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.8rem 0; border-top: 1px solid var(--home-rule); border-bottom: 1px solid var(--home-rule); font-size: 0.8rem; }
.student-toolbar-actions { display: flex; align-items: center; gap: 0.45rem; }
.student-toolbar button { min-height: 2rem; background: transparent; color: var(--home-ink); }
.student-toolbar-note { margin-top: 1rem; color: var(--home-muted); }
.student-card { margin-top: 3rem; max-width: 60rem; padding: clamp(1.1rem, 3vw, 2rem); border: 1px solid var(--home-rule); }
.student-card h2, .student-card h3 { margin: 0.35rem 0 0; font-size: clamp(1.3rem, 2vw, 1.8rem); }
.student-card-heading, .student-topic-block { display: flex; align-items: end; justify-content: space-between; gap: 1rem; }
.student-card-actions { display: flex; align-items: center; gap: 0.65rem; }
.student-count { color: var(--home-muted); font-size: 0.8rem; }
.student-leave-button { min-height: 2rem; border: 1px solid var(--home-ink); border-radius: 0; background: transparent; color: var(--home-ink); padding: 0.35rem 0.65rem; cursor: pointer; font: inherit; font-size: 0.78rem; }
.student-leave-button:disabled { opacity: 0.5; cursor: wait; }
.student-members { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--home-rule); }
.student-members span { padding: 0.45rem 0.7rem; border: 1px solid var(--home-rule); font-size: 0.8rem; }
.student-topic-block { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--home-rule); }
.student-topic-block select { min-width: min(24rem, 55vw); }
.student-inline-form { display: flex; gap: 0.4rem; max-width: 30rem; margin-top: 1.25rem; }
.student-inline-form label { flex: 1; }
.student-message { margin-top: 1rem; color: var(--home-muted); font-size: 0.78rem; }
.student-message.is-error { color: var(--home-ink); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 767px) {
  .student-page > .site-nav { margin-inline: 1rem; }
  .student-main { padding-inline: 1rem; }
  .student-form, .password-form { grid-template-columns: 1fr; }
  .student-form > button, .password-form > button { grid-column: auto; }
  .student-toolbar, .student-card-heading, .student-topic-block { align-items: start; flex-direction: column; }
  .student-card-actions { align-items: start; flex-direction: column; }
  .student-inline-form { width: 100%; }
  .student-inline-form input { min-width: 0; }
  .student-topic-block select { width: 100%; min-width: 0; }
}
</style>
