import { assertSameOrigin, error, json, readJson, requireAdmin } from '../../../_utils.js'

export async function onRequestPut(context) {
  const { request, env, params } = context
  const auth = await requireAdmin(request, env)
  if (auth.response) return auth.response
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)

  const body = await readJson(request)
  const topicId = Number(body?.topicId)
  if (!Number.isInteger(topicId)) return error('请选择有效词条', 400)
  const group = await env.DB.prepare('SELECT id, code FROM course_groups WHERE id = ?').bind(params.id).first()
  if (!group) return error('小组不存在', 404)
  const topic = await env.DB.prepare('SELECT id, label FROM topics WHERE id = ? AND is_active = 1').bind(topicId).first()
  if (!topic) return error('词条不存在', 404)

  try {
    await env.DB.prepare(`
      INSERT INTO topic_assignments (group_id, topic_id) VALUES (?, ?)
      ON CONFLICT(group_id) DO UPDATE SET topic_id = excluded.topic_id, assigned_at = CURRENT_TIMESTAMP
    `).bind(group.id, topic.id).run()
    return json({ groupId: group.id, code: group.code, topicId: topic.id, topicLabel: topic.label })
  } catch (cause) {
    if (String(cause?.message || cause).includes('UNIQUE')) return error('这个词已经被其他小组选用', 409)
    return error('小组选词保存失败', 503)
  }
}

export async function onRequestDelete(context) {
  const { request, env, params } = context
  const auth = await requireAdmin(request, env)
  if (auth.response) return auth.response
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)
  const result = await env.DB.prepare('DELETE FROM topic_assignments WHERE group_id = ?').bind(params.id).run()
  if (!result.success) return error('小组选词清除失败', 503)
  return json({ groupId: params.id, topicId: null, topicLabel: null })
}
