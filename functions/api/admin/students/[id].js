import { assertSameOrigin, error, json, requireAdmin, readJson } from '../../_utils.js'

export async function onRequestPatch(context) {
  const { request, env, params } = context
  const auth = await requireAdmin(request, env)
  if (auth.response) return auth.response
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)

  const body = await readJson(request)
  const status = body?.status === 'disabled' ? 'disabled' : body?.status === 'active' ? 'active' : ''
  if (!status) return error('账号状态无效', 400)
  const user = await env.DB.prepare(
    `SELECT id FROM users WHERE id = ? AND role = 'student'`,
  ).bind(params.id).first()
  if (!user) return error('学生账号不存在', 404)

  const statements = [env.DB.prepare(
    `UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role = 'student'`,
  ).bind(status, user.id)]
  if (status === 'disabled') statements.push(
    env.DB.prepare(`DELETE FROM sessions WHERE user_id = ? AND kind = 'student'`).bind(user.id),
  )
  await env.DB.batch(statements)
  return json({ id: user.id, status })
}
