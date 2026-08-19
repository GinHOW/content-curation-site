import {
  assertSameOrigin,
  error,
  hashStudentPassword,
  initialStudentPassword,
  json,
  requireAdmin,
} from '../../../_utils.js'

export async function onRequestPost(context) {
  const { request, env, params } = context
  const auth = await requireAdmin(request, env)
  if (auth.response) return auth.response
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)
  if (!env.STUDENT_PASSWORD_PEPPER) return error('学生登录尚未配置', 503)

  const user = await env.DB.prepare(
    `SELECT id, username AS studentNumber FROM users WHERE id = ? AND role = 'student'`,
  ).bind(params.id).first()
  if (!user) return error('学生账号不存在', 404)
  const initialPassword = initialStudentPassword(user.studentNumber)
  const passwordHash = await hashStudentPassword(initialPassword, env.STUDENT_PASSWORD_PEPPER)
  await env.DB.batch([
    env.DB.prepare(`
      UPDATE users
      SET password_hash = ?, must_change_password = 1, failed_login_count = 0,
          locked_until = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND role = 'student'
    `).bind(passwordHash, user.id),
    env.DB.prepare(`DELETE FROM sessions WHERE user_id = ? AND kind = 'student'`).bind(user.id),
  ])
  return json({ id: user.id, studentNumber: user.studentNumber, initialPassword })
}
