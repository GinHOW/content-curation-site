import { assertSameOrigin, error, json, readJson, requireAdmin } from '../_utils.js'

export async function onRequestPost(context) {
  const { request, env } = context
  const auth = await requireAdmin(request, env)
  if (auth.response) return auth.response
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)

  const body = await readJson(request)
  const label = typeof body?.label === 'string' ? body.label.trim() : ''
  if (!label || label.length > 24) return error('自定义词需要为 1–24 个字符', 400)

  try {
    const normalized = label.replace(/\s+/g, '')
    const result = await env.DB.prepare(`
      INSERT INTO topics (label, normalized_label, source, room_id, color_token, sort_order)
      VALUES (
        ?,
        ?,
        'custom',
        NULL,
        printf('var(--home-spot-%02d)', ((SELECT COALESCE(MAX(id), 0) FROM topics) % 18) + 1),
        COALESCE((SELECT MAX(sort_order) + 1 FROM topics), 1)
      )
      RETURNING id, label, source, room_id AS roomId, color_token AS colorToken, sort_order AS sortOrder
    `).bind(label, normalized).first()
    return json(result, 201)
  } catch (cause) {
    if (String(cause?.message || cause).includes('UNIQUE')) return error('这个词已经存在', 409)
    return error('自定义词保存失败', 503)
  }
}
