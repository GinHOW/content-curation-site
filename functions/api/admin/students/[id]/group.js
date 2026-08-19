import { assertSameOrigin, error, json, readJson, requireAdmin } from '../../../_utils.js'

export async function onRequestPut(context) {
  const { request, env, params } = context
  const auth = await requireAdmin(request, env)
  if (auth.response) return auth.response
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)

  const body = await readJson(request)
  const groupId = body?.groupId === null || body?.groupId === '' ? null : String(body?.groupId || '')
  const user = await env.DB.prepare(
    `SELECT id FROM users WHERE id = ? AND role = 'student'`,
  ).bind(params.id).first()
  if (!user) return error('学生账号不存在', 404)
  if (groupId) {
    const group = await env.DB.prepare(`SELECT id, code FROM course_groups WHERE id = ?`).bind(groupId).first()
    if (!group) return error('小组不存在', 404)
  }

  try {
    const statements = [env.DB.prepare(`DELETE FROM group_members WHERE user_id = ?`).bind(user.id)]
    if (groupId) statements.push(
      env.DB.prepare(`INSERT INTO group_members (group_id, user_id) VALUES (?, ?)`).bind(groupId, user.id),
    )
    await env.DB.batch(statements)
  } catch (cause) {
    if (String(cause?.message || cause).includes('UNIQUE')) return error('学生已经属于其他小组', 409)
    return error('小组归属保存失败', 503)
  }
  return json({ studentId: user.id, groupId })
}
