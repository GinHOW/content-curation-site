import { assertSameOrigin, error, json, requireStudent } from '../_utils.js'

export async function onRequestDelete(context) {
  const { request, env } = context
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)
  const auth = await requireStudent(request, env)
  if (auth.response) return auth.response

  const membership = await env.DB.prepare(
    `SELECT group_id AS groupId FROM group_members WHERE user_id = ?`,
  ).bind(auth.user.id).first()
  if (!membership) return error('你目前没有加入小组', 409)

  await env.DB.prepare(`DELETE FROM group_members WHERE user_id = ?`).bind(auth.user.id).run()
  return json({ group: null, groupId: membership.groupId })
}
