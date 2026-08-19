import { assertSameOrigin, error, json, readJson, requireStudent } from '../../_utils.js'
import { getGroupState } from '../me.js'

async function getMembership(env, userId) {
  return env.DB.prepare(`SELECT group_id AS groupId FROM group_members WHERE user_id = ?`).bind(userId).first()
}

export async function onRequestPut(context) {
  const { request, env } = context
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)
  const auth = await requireStudent(request, env)
  if (auth.response) return auth.response
  const membership = await getMembership(env, auth.user.id)
  if (!membership) return error('请先加入小组', 409)

  const body = await readJson(request)
  const topicId = Number(body?.topicId)
  if (!Number.isInteger(topicId)) return error('请选择有效词条', 400)
  const topic = await env.DB.prepare(
    `SELECT id, label FROM topics WHERE id = ? AND is_active = 1`,
  ).bind(topicId).first()
  if (!topic) return error('词条不存在', 404)

  try {
    await env.DB.prepare(`
      INSERT INTO topic_assignments (group_id, topic_id)
      VALUES (?, ?)
      ON CONFLICT(group_id) DO UPDATE SET topic_id = excluded.topic_id, assigned_at = CURRENT_TIMESTAMP
    `).bind(membership.groupId, topic.id).run()
    return json({ group: await getGroupState(env, auth.user.id) })
  } catch (cause) {
    if (String(cause?.message || cause).includes('UNIQUE')) return error('这个词已经被其他小组选用', 409)
    return error('小组选词保存失败', 503)
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)
  const auth = await requireStudent(request, env)
  if (auth.response) return auth.response
  const membership = await getMembership(env, auth.user.id)
  if (!membership) return error('请先加入小组', 409)
  await env.DB.prepare(`DELETE FROM topic_assignments WHERE group_id = ?`).bind(membership.groupId).run()
  return json({ group: await getGroupState(env, auth.user.id) })
}
