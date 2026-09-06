<template>
  <section class="admin-block" aria-labelledby="groups-title">
    <header class="admin-block-heading">
      <div>
        <p class="eyebrow">02 · Group Access</p>
        <h2 id="groups-title">小组邀请码</h2>
      </div>
      <span class="micro-copy">生成或轮换小组进入课程的邀请码</span>
    </header>
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
</template>

<script setup>
import { inject } from 'vue'
import { createGroupInvite, revokeGroupInvite } from '../../services/courseState.js'

const props = defineProps({
  adminGroups: { type: Array, required: true },
})

const { busy, runAction, showMessage, showError } = inject('adminContext')

const rotateInvite = (group) => runAction(async () => {
  const result = await createGroupInvite(group.id)
  return `${result.groupCode} 邀请码：${result.code}`
})

const revokeInvite = (group) => runAction(
  () => revokeGroupInvite(group.id),
  `${group.code} 邀请码已撤销`
)

const copyInvite = async (group) => {
  if (!group.inviteCode) return
  try {
    await navigator.clipboard.writeText(group.inviteCode)
    showMessage(`${group.code} 邀请码已复制`)
  } catch {
    showError('复制失败，请手动记录邀请码')
  }
}
</script>

<style scoped>
.admin-block { margin-top: 3rem; }
.admin-block-heading { margin-bottom: 1rem; display: flex; align-items: end; justify-content: space-between; gap: 1rem; }
.admin-block-heading h2 { margin-top: 0.35rem; font-size: clamp(1.2rem, 2vw, 1.7rem); }
.micro-copy { color: var(--home-muted); font-size: 0.68rem; }
.admin-invite-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.6rem; margin-top: 1rem; }
.admin-invite-card { display: grid; gap: 0.55rem; padding: 0.75rem; border: 1px solid var(--home-rule); }
.admin-invite-card > div:first-child { display: grid; gap: 0.2rem; }
.admin-invite-card > div:first-child span { color: var(--home-muted); font-size: 0.68rem; }
.admin-invite-card code { letter-spacing: 0.14em; font-size: 0.9rem; }
.admin-invite-actions { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.admin-invite-actions button { min-height: 2rem; border: 1px solid var(--home-ink); border-radius: 0; background: transparent; color: var(--home-ink); padding: 0.3rem 0.55rem; cursor: pointer; font: inherit; font-size: 0.72rem; }
.admin-invite-actions button:disabled { opacity: 0.45; cursor: not-allowed; }

@media (max-width: 767px) {
  .admin-block-heading {
    align-items: start;
    flex-direction: column;
  }
  .admin-invite-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
