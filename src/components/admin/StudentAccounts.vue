<template>
  <section class="admin-block" aria-labelledby="students-title">
    <header class="admin-block-heading">
      <div>
        <p class="eyebrow">03 · Student Accounts</p>
        <h2 id="students-title">学生名单与分组</h2>
      </div>
      <span class="micro-copy">从 Excel 复制“学号、姓名、班级”三列（班级填 1 或 2，可留空）</span>
    </header>
    <div class="admin-roster-import">
      <textarea
        v-model="rosterText"
        rows="5"
        placeholder="学号\t姓名\t班级\n20260001\t张三\t1\n20260002\t李四\t2"
        aria-label="粘贴学生名单"
        @keydown="handleRosterKeydown"
      ></textarea>
      <div class="admin-roster-actions">
        <button type="button" @click="parseRoster">预览名单</button>
        <button type="button" :disabled="busy || !rosterPreview.length" @click="importRoster">确认导入</button>
      </div>
      <p class="micro-copy">按 Tab 插入列间隔；已有账号只更新姓名和班级，不会重置密码或改变分组。</p>
      <p v-if="rosterError" class="admin-message is-error" role="alert">{{ rosterError }}</p>
    </div>

    <div v-if="rosterPreview.length" class="admin-preview">
      <strong>待导入 {{ rosterPreview.length }} 人</strong>
      <span v-for="item in rosterPreview.slice(0, 8)" :key="item.studentNumber">{{ item.studentNumber }} · {{ item.displayName }}{{ item.className ? ` · ${item.className} 班` : '' }}</span>
      <span v-if="rosterPreview.length > 8" class="micro-copy">另有 {{ rosterPreview.length - 8 }} 人</span>
    </div>
    <div v-if="credentials.length" class="admin-credentials" role="status">
      <strong>新账号初始密码（仅显示本次导入结果）</strong>
      <span v-for="item in credentials" :key="item.studentNumber">{{ item.studentNumber }}：{{ item.initialPassword }}</span>
    </div>

    <div v-if="students.length" class="admin-student-controls" role="group" aria-label="学生名单筛选与排序">
      <label class="admin-student-control admin-student-search">
        <span>搜索</span>
        <input
          v-model="studentQuery"
          type="search"
          placeholder="姓名或学号"
          autocomplete="off"
          aria-describedby="students-count"
        />
      </label>
      <label class="admin-student-control">
        <span>班级</span>
        <select v-model="studentClassFilter">
          <option value="all">全部班级</option>
          <option value="1">1 班</option>
          <option value="2">2 班</option>
          <option value="unassigned">未填写</option>
        </select>
      </label>
      <label class="admin-student-control">
        <span>小组</span>
        <select v-model="studentGroupFilter">
          <option value="all">全部小组</option>
          <option value="unassigned">未分组</option>
          <option v-for="group in rosterGroups" :key="group.id" :value="group.id">{{ group.code }}</option>
        </select>
      </label>
      <label class="admin-student-control">
        <span>账号状态</span>
        <select v-model="studentStatusFilter">
          <option value="all">全部状态</option>
          <option value="active">正常</option>
          <option value="disabled">已停用</option>
        </select>
      </label>
      <label class="admin-student-control">
        <span>排序字段</span>
        <select v-model="studentSortKey">
          <option value="studentNumber">学号</option>
          <option value="displayName">姓名</option>
          <option value="className">班级</option>
          <option value="groupCode">小组</option>
        </select>
      </label>
      <label class="admin-student-control">
        <span>排序方向</span>
        <select v-model="studentSortDirection">
          <option value="asc">升序</option>
          <option value="desc">降序</option>
        </select>
      </label>
      <button type="button" :disabled="!hasActiveStudentControls" @click="clearStudentControls">清除筛选</button>
      <p id="students-count" class="admin-student-count" aria-live="polite">显示 {{ visibleStudents.length }} / {{ students.length }} 人</p>
    </div>

    <div class="admin-student-list">
      <div v-for="studentItem in visibleStudents" :key="studentItem.id" class="admin-student-row">
        <div class="admin-student-name">
          <strong>{{ studentItem.displayName }}</strong>
          <span>{{ studentItem.studentNumber }}{{ studentItem.className ? ` · ${studentItem.className} 班` : '' }} · {{ studentItem.status === 'active' ? '正常' : '已停用' }}{{ Number(studentItem.mustChangePassword) ? ' · 建议改密' : '' }}</span>
        </div>
        <select :value="studentItem.groupId || ''" :aria-label="`${studentItem.displayName} 所属小组`" @change="setStudentGroup(studentItem, $event.target.value)">
          <option value="">未分组</option>
          <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.code }}</option>
        </select>
        <button type="button" @click="resetPassword(studentItem)">重置密码</button>
        <button type="button" @click="toggleStudent(studentItem)">{{ studentItem.status === 'active' ? '停用' : '启用' }}</button>
      </div>
      <div v-if="students.length && !visibleStudents.length" class="admin-student-empty">
        <p>没有符合当前筛选条件的学生。</p>
        <button type="button" @click="clearStudentControls">清除筛选</button>
      </div>
      <p v-if="!students.length" class="admin-message">尚未导入学生名单。</p>
    </div>
  </section>
</template>

<script setup>
import { computed, inject, nextTick, ref } from 'vue'
import {
  importAdminStudents,
  resetStudentPassword,
  updateStudentGroup,
  updateStudentStatus,
} from '../../services/courseState.js'

const props = defineProps({
  students: { type: Array, required: true },
  groups: { type: Array, required: true },
  rosterGroups: { type: Array, required: true },
})

const { busy, runAction } = inject('adminContext')

const rosterText = ref('')
const rosterPreview = ref([])
const rosterError = ref('')
const credentials = ref([])
const studentQuery = ref('')
const studentClassFilter = ref('all')
const studentGroupFilter = ref('all')
const studentStatusFilter = ref('all')
const studentSortKey = ref('studentNumber')
const studentSortDirection = ref('asc')

const rosterCollator = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' })

const hasActiveStudentControls = computed(() => (
  studentQuery.value !== ''
  || studentClassFilter.value !== 'all'
  || studentGroupFilter.value !== 'all'
  || studentStatusFilter.value !== 'all'
  || studentSortKey.value !== 'studentNumber'
  || studentSortDirection.value !== 'asc'
))

const visibleStudents = computed(() => {
  const query = studentQuery.value.trim().toLocaleLowerCase()
  const direction = studentSortDirection.value === 'desc' ? -1 : 1
  const values = {
    studentNumber: (studentItem) => studentItem.studentNumber,
    displayName: (studentItem) => studentItem.displayName,
    className: (studentItem) => studentItem.className,
    groupCode: (studentItem) => studentItem.groupCode,
  }
  const valueForSort = values[studentSortKey.value] || values.studentNumber
  const matches = props.students.filter((studentItem) => {
    const matchesQuery = !query || [studentItem.displayName, studentItem.studentNumber].some((value) => (
      String(value || '').toLocaleLowerCase().includes(query)
    ))
    const matchesClass = studentClassFilter.value === 'all'
      || (studentClassFilter.value === 'unassigned' ? !studentItem.className : studentItem.className === studentClassFilter.value)
    const matchesGroup = studentGroupFilter.value === 'all'
      || (studentGroupFilter.value === 'unassigned'
        ? !studentItem.groupId
        : String(studentItem.groupId) === studentGroupFilter.value)
    const matchesStatus = studentStatusFilter.value === 'all' || studentItem.status === studentStatusFilter.value
    return matchesQuery && matchesClass && matchesGroup && matchesStatus
  })

  return matches.sort((first, second) => {
    const firstValue = valueForSort(first)
    const secondValue = valueForSort(second)
    const firstIsEmpty = !firstValue
    const secondIsEmpty = !secondValue
    if (firstIsEmpty || secondIsEmpty) {
      if (firstIsEmpty !== secondIsEmpty) return firstIsEmpty ? 1 : -1
    } else {
      const valueComparison = rosterCollator.compare(String(firstValue), String(secondValue))
      if (valueComparison) return valueComparison * direction
    }
    return rosterCollator.compare(String(first.studentNumber), String(second.studentNumber))
      || rosterCollator.compare(String(first.id), String(second.id))
  })
})

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
    const displayName = String(columns[1] || '').trim()
    const className = String(columns.slice(2).join(' ') || '').trim()
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
    if (className && className !== '1' && className !== '2') {
      rosterPreview.value = []
      rosterError.value = `第 ${index + 1} 行班级只能是 1 或 2`
      return
    }
    seen.add(key)
    parsed.push({ studentNumber, displayName, className: className || null })
  }
  rosterPreview.value = parsed
  if (!parsed.length) rosterError.value = '没有可导入的学生记录'
}

const importRoster = () => runAction(async () => {
  if (!rosterPreview.value.length) return ''
  const result = await importAdminStudents(rosterPreview.value)
  credentials.value = result.credentials || []
  rosterText.value = ''
  rosterPreview.value = []
  return `已创建 ${result.created} 个账号，更新 ${result.updated} 个账号`
})

const setStudentGroup = (studentItem, groupId) => runAction(
  () => updateStudentGroup(studentItem.id, groupId || null),
  `${studentItem.displayName} 的分组已更新`,
)

const toggleStudent = (studentItem) => runAction(
  () => updateStudentStatus(studentItem.id, studentItem.status === 'active' ? 'disabled' : 'active'),
  `${studentItem.displayName} 的账号状态已更新`,
)

const resetPassword = (studentItem) => runAction(async () => {
  const result = await resetStudentPassword(studentItem.id)
  return `${result.studentNumber} 的初始密码已重置为：${result.initialPassword}`
})

const clearStudentControls = () => {
  studentQuery.value = ''
  studentClassFilter.value = 'all'
  studentGroupFilter.value = 'all'
  studentStatusFilter.value = 'all'
  studentSortKey.value = 'studentNumber'
  studentSortDirection.value = 'asc'
}
</script>

<style scoped>
.admin-block { margin-top: 3rem; }
.admin-block-heading { margin-bottom: 1rem; display: flex; align-items: end; justify-content: space-between; gap: 1rem; }
.admin-block-heading h2 { margin-top: 0.35rem; font-size: clamp(1.2rem, 2vw, 1.7rem); }
.micro-copy { color: var(--home-muted); font-size: 0.68rem; }
.admin-message { margin-top: 1rem; color: var(--home-muted); font-size: 0.78rem; }
.admin-message.is-error { color: var(--home-ink); }

.admin-roster-import { display: grid; gap: 0.65rem; max-width: 42rem; }
.admin-roster-import textarea { width: 100%; resize: vertical; border: 1px solid var(--home-ink); border-radius: 0; background: var(--home-paper); padding: 0.7rem; font: inherit; line-height: 1.55; }
.admin-roster-actions { display: flex; gap: 0.45rem; }
.admin-roster-actions button { min-height: 2rem; border: 1px solid var(--home-ink); border-radius: 0; background: transparent; color: var(--home-ink); padding: 0.3rem 0.55rem; cursor: pointer; font: inherit; font-size: 0.72rem; }
.admin-roster-actions button:last-child { background: var(--home-ink); color: var(--home-paper); }
.admin-roster-actions button:disabled { opacity: 0.45; cursor: not-allowed; }

.admin-preview, .admin-credentials { display: flex; flex-wrap: wrap; gap: 0.45rem 0.8rem; margin-top: 1rem; padding: 0.8rem; border: 1px solid var(--home-rule); font-size: 0.75rem; }
.admin-credentials { color: var(--home-ink); border-color: var(--home-ink); }

.admin-student-controls {
  display: grid;
  grid-template-columns: minmax(12rem, 1.6fr) repeat(5, minmax(6.4rem, 1fr)) auto;
  align-items: end;
  gap: 0.65rem;
  margin-top: 1.25rem;
  padding: 0.9rem 0;
  border-top: 1px solid var(--home-rule);
  border-bottom: 1px solid var(--home-rule);
}
.admin-student-control {
  display: grid;
  gap: 0.3rem;
  min-width: 0;
  color: var(--home-muted);
  font-size: 0.7rem;
}
.admin-student-control input,
.admin-student-control select,
.admin-student-controls > button {
  min-height: 2.75rem;
  border: 1px solid var(--home-ink);
  border-radius: 0;
  background: var(--home-paper);
  color: var(--home-ink);
  padding: 0.45rem 0.6rem;
  font: inherit;
}
.admin-student-control input,
.admin-student-control select {
  width: 100%;
}
.admin-student-controls > button,
.admin-student-empty button {
  cursor: pointer;
}
.admin-student-controls > button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.admin-student-control input:focus-visible,
.admin-student-control select:focus-visible,
.admin-student-controls > button:focus-visible,
.admin-student-empty button:focus-visible {
  outline: 2px solid var(--accent-orange);
  outline-offset: 2px;
}
.admin-student-count {
  grid-column: 1 / -1;
  margin: 0;
  color: var(--home-muted);
  font-size: 0.72rem;
}
.admin-student-list {
  margin-top: 1rem;
  border-top: 1px solid var(--home-rule);
}
.admin-student-row {
  display: grid;
  grid-template-columns: minmax(12rem, 1.5fr) minmax(7rem, 0.8fr) auto auto;
  align-items: center;
  gap: 0.65rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--home-rule);
}
.admin-student-name {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
}
.admin-student-name span {
  color: var(--home-muted);
  font-size: 0.68rem;
}
.admin-student-row select {
  min-width: 0;
  min-height: 2rem;
  border: 1px solid var(--home-ink);
  border-color: var(--home-rule);
  background: var(--home-paper);
  color: var(--home-ink);
  padding: 0.25rem 0.35rem;
  font-size: 0.68rem;
  cursor: pointer;
}
.admin-student-row button {
  white-space: nowrap;
  min-height: 2rem;
  border: 1px solid var(--home-ink);
  border-radius: 0;
  background: transparent;
  color: var(--home-ink);
  padding: 0.3rem 0.55rem;
  cursor: pointer;
  font: inherit;
  font-size: 0.72rem;
}
.admin-student-empty {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--home-rule);
  color: var(--home-muted);
  font-size: 0.78rem;
}
.admin-student-empty p {
  margin: 0;
}
.admin-student-empty button {
  min-height: 2.45rem;
  border: 1px solid var(--home-ink);
  border-radius: 0;
  background: transparent;
  color: var(--home-ink);
  padding: 0.4rem 0.65rem;
  font: inherit;
}

@media (max-width: 1023px) {
  .admin-student-controls {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .admin-student-search {
    grid-column: span 2;
  }
}
@media (max-width: 767px) {
  .admin-block-heading {
    align-items: start;
    flex-direction: column;
  }
  .admin-student-controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .admin-student-search,
  .admin-student-controls > button {
    grid-column: 1 / -1;
  }
  .admin-student-row {
    grid-template-columns: 1fr 1fr;
  }
  .admin-student-name {
    grid-column: 1 / -1;
  }
}
</style>
