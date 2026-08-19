import { assertSameOrigin, error, json, readJson, requireStudent } from '../_utils.js'
import { getGroupState } from './me.js'

export async function onRequestPost(context) {
  const { request, env } = context
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)
  const auth = await requireStudent(request, env)
  if (auth.response) return auth.response

  const body = await readJson(request)
  const code = typeof body?.code === 'string' ? body.code.replace(/\s+/g, '').toUpperCase() : ''
  if (!/^[A-Z2-9]{8}$/.test(code)) return error('请输入 8 位邀请码', 400)

  const existing = await env.DB.prepare(
    `SELECT g.code FROM group_members gm JOIN course_groups g ON g.id = gm.group_id WHERE gm.user_id = ?`,
  ).bind(auth.user.id).first()
  if (existing) return error(`你已经加入 ${existing.code}，如需调整请联系教师`, 409)

  const invite = await env.DB.prepare(`
    SELECT group_id AS groupId
    FROM group_invites
    WHERE code = ? AND is_active = 1
  `).bind(code).first()
  if (!invite) return error('邀请码不存在或已失效', 404)

  const result = await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO group_members (group_id, user_id)
      SELECT group_id, ?
      FROM group_invites
      WHERE code = ? AND is_active = 1
        AND (SELECT COUNT(*) FROM group_members WHERE group_id = group_invites.group_id) < 3
        AND NOT EXISTS (SELECT 1 FROM group_members WHERE user_id = ?)
    `).bind(auth.user.id, code, auth.user.id),
    env.DB.prepare(`
      UPDATE group_invites
      SET use_count = use_count + 1,
          used_at = CURRENT_TIMESTAMP,
          is_active = CASE WHEN (SELECT COUNT(*) FROM group_members WHERE group_id = ?) >= 3 THEN 0 ELSE is_active END,
          updated_at = CURRENT_TIMESTAMP
      WHERE code = ? AND is_active = 1
    `).bind(invite.groupId, code),
  ])

  if (Number(result?.[0]?.meta?.changes || 0) !== 1) {
    const count = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM group_members WHERE group_id = ?`,
    ).bind(invite.groupId).first()
    if (Number(count?.count) >= 3) return error('这个小组已经满 3 人', 409)
    return error('加入小组失败，请刷新后重试', 409)
  }

  return json({ group: await getGroupState(env, auth.user.id) })
}
