import { error, json, requireAdmin } from '../_utils.js'

export async function onRequestGet(context) {
  const { request, env } = context
  const auth = await requireAdmin(request, env)
  if (auth.response) return auth.response
  try {
    const result = await env.DB.prepare(`
      SELECT g.id, g.code, g.sort_order AS sortOrder,
             COUNT(DISTINCT gm.user_id) AS memberCount,
             gi.code AS inviteCode, gi.use_count AS inviteUseCount
      FROM course_groups g
      LEFT JOIN group_members gm ON gm.group_id = g.id
      LEFT JOIN group_invites gi ON gi.group_id = g.id AND gi.is_active = 1
      GROUP BY g.id, g.code, g.sort_order, gi.code, gi.use_count
      ORDER BY g.sort_order, g.id
    `).all()
    return json({ groups: result.results || [] })
  } catch (cause) {
    console.error('admin groups list failed', cause)
    return error('小组数据暂时无法读取', 503)
  }
}
