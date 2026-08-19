import {
  assertSameOrigin,
  error,
  json,
  randomInviteCode,
  randomToken,
  requireAdmin,
} from '../../../_utils.js'

export async function onRequestPost(context) {
  const { request, env, params } = context
  const auth = await requireAdmin(request, env)
  if (auth.response) return auth.response
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)
  const group = await env.DB.prepare(`SELECT id, code FROM course_groups WHERE id = ?`).bind(params.id).first()
  if (!group) return error('小组不存在', 404)

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const code = randomInviteCode()
    try {
      await env.DB.batch([
        env.DB.prepare(`
          UPDATE group_invites SET is_active = 0, updated_at = CURRENT_TIMESTAMP
          WHERE group_id = ? AND is_active = 1
        `).bind(group.id),
        env.DB.prepare(`
          INSERT INTO group_invites (id, group_id, code, expires_at, is_active, use_count, updated_at)
          VALUES (?, ?, ?, NULL, 1, 0, CURRENT_TIMESTAMP)
        `).bind(`invite-${randomToken().slice(0, 24)}`, group.id, code),
      ])
      return json({ groupId: group.id, groupCode: group.code, code, maxMembers: 3 })
    } catch (cause) {
      if (!String(cause?.message || cause).includes('UNIQUE') || attempt === 2) {
        console.error('admin invite create failed', cause)
        return error('邀请码生成失败，请重试', 503)
      }
    }
  }
  return error('邀请码生成失败，请重试', 503)
}

export async function onRequestDelete(context) {
  const { request, env, params } = context
  const auth = await requireAdmin(request, env)
  if (auth.response) return auth.response
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)
  const group = await env.DB.prepare(`SELECT id FROM course_groups WHERE id = ?`).bind(params.id).first()
  if (!group) return error('小组不存在', 404)
  await env.DB.prepare(`
    UPDATE group_invites SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE group_id = ? AND is_active = 1
  `).bind(group.id).run()
  return json({ groupId: group.id, code: null })
}
