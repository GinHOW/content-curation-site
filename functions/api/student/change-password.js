import {
  assertSameOrigin,
  digestHex,
  error,
  hashStudentPassword,
  isValidNewPassword,
  json,
  randomToken,
  readJson,
  requireStudent,
  studentSessionCookie,
  verifyStudentPassword,
  STUDENT_SESSION_TTL_SECONDS,
} from '../_utils.js'

export async function onRequestPost(context) {
  const { request, env } = context
  if (!env.STUDENT_PASSWORD_PEPPER) return error('学生登录尚未配置', 503)
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)
  const auth = await requireStudent(request, env, { allowPasswordChange: true })
  if (auth.response) return auth.response

  const body = await readJson(request)
  const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : ''
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : ''
  if (!currentPassword || !isValidNewPassword(newPassword)) return error('新密码需要为 8–64 个字符', 400)
  if (currentPassword === newPassword) return error('新密码不能与当前密码相同', 400)

  const user = await env.DB.prepare(
    `SELECT password_hash AS passwordHash FROM users WHERE id = ? AND role = 'student'`,
  ).bind(auth.user.id).first()
  if (!user || !(await verifyStudentPassword(currentPassword, user.passwordHash, env.STUDENT_PASSWORD_PEPPER))) {
    return error('当前密码不正确', 401)
  }

  const passwordHash = await hashStudentPassword(newPassword, env.STUDENT_PASSWORD_PEPPER)
  const token = randomToken()
  const tokenHash = await digestHex(token)
  await env.DB.batch([
    env.DB.prepare(`
      UPDATE users
      SET password_hash = ?, must_change_password = 0, failed_login_count = 0,
          locked_until = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND role = 'student'
    `).bind(passwordHash, auth.user.id),
    env.DB.prepare(`DELETE FROM sessions WHERE user_id = ? AND kind = 'student'`).bind(auth.user.id),
    env.DB.prepare(
      `INSERT INTO sessions (user_id, token_hash, kind, expires_at) VALUES (?, ?, 'student', datetime('now', ?))`,
    ).bind(auth.user.id, tokenHash, `+${STUDENT_SESSION_TTL_SECONDS} seconds`),
  ])

  const response = json({ authenticated: true, mustChangePassword: false })
  response.headers.set('Set-Cookie', studentSessionCookie(token))
  return response
}
