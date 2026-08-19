import { assertSameOrigin, error, json, readJson, requireAdmin } from '../../_utils.js'

export async function onRequestPatch(context) {
  const { request, env, params } = context
  const auth = await requireAdmin(request, env)
  if (auth.response) return auth.response
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)

  const topicId = Number(params.id)
  if (!Number.isInteger(topicId)) return error('词条编号无效', 400)
  const body = await readJson(request)
  const roomId = body?.roomId === null || body?.roomId === '' ? null : String(body?.roomId || '')
  if (roomId) {
    const room = await env.DB.prepare('SELECT id FROM rooms WHERE id = ?').bind(roomId).first()
    if (!room) return error('空间不存在', 400)
  }

  const result = await env.DB.prepare(`
    UPDATE topics SET room_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND is_active = 1
    RETURNING id, label, source, room_id AS roomId, color_token AS colorToken, sort_order AS sortOrder
  `).bind(roomId, topicId).first()
  if (!result) return error('词条不存在', 404)
  return json(result)
}
